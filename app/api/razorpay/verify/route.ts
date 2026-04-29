import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { isRazorpayConfigured } from '@/lib/razorpay';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const roleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!roleKey) {
      console.warn("⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. RLS policies might block the subscription upsert.");
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      roleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planType,
      userId,
      charityId,
      amount
    } = await request.json();

    // ── Mock mode ──
    if (!isRazorpayConfigured()) {
      console.log('🧪 Mock payment verified:', { razorpay_order_id, razorpay_payment_id });

      if (planType === 'donation') {
        if (!charityId || !amount) {
          return NextResponse.json({ success: false, error: 'Missing donation details' }, { status: 400 });
        }
        await supabaseAdmin.from('donations').insert({
          user_id: userId || null,
          charity_id: charityId,
          amount: amount,
          razorpay_payment_id: `mock_pay_${Date.now()}`
        });
        return NextResponse.json({ success: true, mock: true, message: 'Donation verified (mock mode)' });
      }

      if (userId) {
        const amountInr = planType === 'yearly' ? 4999 : 499;
        const now = new Date();
        const end = new Date(now);
        end.setMonth(end.getMonth() + (planType === 'yearly' ? 12 : 1));

        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          plan_type: planType || 'monthly',
          amount_inr: amountInr,
          status: 'active',
          razorpay_customer_id: `mock_cust_${userId}`,
          razorpay_subscription_id: razorpay_order_id,
          current_period_start: now.toISOString(),
          current_period_end: end.toISOString(),
        }, { onConflict: 'user_id' });
      }

      return NextResponse.json({ success: true, mock: true, message: 'Payment verified (mock mode)' });
    }

    // ── Real signature verification ──
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing required payment fields' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', keySecret).update(body).digest('hex');

    if (expectedSignature === razorpay_signature) {
      if (planType === 'donation') {
        // Ensure amount and charityId exist
        if (!charityId || !amount) {
          return NextResponse.json({ success: false, error: 'Missing donation details' }, { status: 400 });
        }

        const payload = {
          user_id: userId || null, // Can be null if guest donation
          charity_id: charityId,
          amount: amount,
          razorpay_payment_id: razorpay_payment_id,
        };

        const { error: dbError } = await supabaseAdmin.from('donations').insert(payload);
        if (dbError) {
          console.error("Donation DB error:", dbError);
          return NextResponse.json({ success: false, error: 'Failed to save donation' }, { status: 500 });
        }
      } else {
        // Save subscription to Supabase
        if (userId) {
          const amountInr = planType === 'yearly' ? 4999 : 499;
          const now = new Date();
          const end = new Date(now);
          end.setMonth(end.getMonth() + (planType === 'yearly' ? 12 : 1));

          const payload = {
            user_id: userId,
            plan_type: planType || 'monthly',
            amount_inr: amountInr,
            status: 'active',
            razorpay_customer_id: razorpay_payment_id,
            razorpay_subscription_id: razorpay_order_id,
            current_period_start: now.toISOString(),
            current_period_end: end.toISOString(),
          };

          // Check for existing subscription to avoid unique constraint errors
          const { data: existingSub } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

          let dbError;
          if (existingSub) {
            const { error } = await supabaseAdmin.from('subscriptions').update(payload).eq('id', existingSub.id);
            dbError = error;
          } else {
            const { error } = await supabaseAdmin.from('subscriptions').insert(payload);
            dbError = error;
          }

          if (dbError) {
            console.error("Subscription DB error:", dbError);
            return NextResponse.json({ success: false, error: 'Failed to save subscription' }, { status: 500 });
          }
        }
      }

      return NextResponse.json({ success: true, message: 'Payment verified successfully' });
    } else {
      return NextResponse.json({ success: false, error: 'Signature mismatch' }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
