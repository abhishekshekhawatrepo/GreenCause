import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { isRazorpayConfigured } from '@/lib/razorpay';

/**
 * POST /api/razorpay/webhook
 *
 * Handles asynchronous Razorpay webhook events.
 * Configure this URL in Razorpay Dashboard → Webhooks.
 *
 * Supported events:
 * - payment.captured    → Activate subscription
 * - payment.failed      → Mark subscription as lapsed
 * - subscription.charged → Extend subscription period
 * - subscription.cancelled → Cancel subscription
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    // ── Mock mode ──
    if (!isRazorpayConfigured()) {
      console.log('🧪 Mock webhook received');
      return NextResponse.json({ status: 'ok', mock: true });
    }

    // ── Verify webhook signature ──
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('⚠️ RAZORPAY_WEBHOOK_SECRET not set');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('❌ Webhook signature mismatch');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // ── Supabase Admin client ──
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    // ── Process event ──
    const event = JSON.parse(body);
    const eventType = event.event;

    console.log(`📩 Razorpay webhook: ${eventType}`);

    switch (eventType) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        console.log('  → Payment captured:', payment.id);

        // Find subscription by razorpay_customer_id (payment ID)
        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('id, plan_type')
          .eq('razorpay_customer_id', payment.id)
          .maybeSingle();

        if (sub) {
          await supabaseAdmin.from('subscriptions').update({ status: 'active' }).eq('id', sub.id);
          console.log('  ✓ Subscription activated');
        }
        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        console.log('  → Payment failed:', payment.id);

        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('razorpay_customer_id', payment.id)
          .maybeSingle();

        if (sub) {
          await supabaseAdmin.from('subscriptions').update({ status: 'lapsed' }).eq('id', sub.id);
          console.log('  ✓ Subscription marked as lapsed');
        }
        break;
      }

      case 'subscription.charged': {
        const subscription = event.payload.subscription.entity;
        console.log('  → Subscription renewed:', subscription.id);

        // Extend the period by 1 month
        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('id, plan_type, current_period_end')
          .eq('razorpay_subscription_id', subscription.id)
          .maybeSingle();

        if (sub) {
          const newEnd = new Date(sub.current_period_end || new Date());
          newEnd.setMonth(newEnd.getMonth() + (sub.plan_type === 'yearly' ? 12 : 1));

          await supabaseAdmin.from('subscriptions').update({
            status: 'active',
            current_period_end: newEnd.toISOString(),
          }).eq('id', sub.id);
          console.log('  ✓ Subscription period extended to', newEnd.toISOString());
        }
        break;
      }

      case 'subscription.cancelled': {
        const subscription = event.payload.subscription.entity;
        console.log('  → Subscription cancelled:', subscription.id);

        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('razorpay_subscription_id', subscription.id)
          .maybeSingle();

        if (sub) {
          await supabaseAdmin.from('subscriptions').update({ status: 'cancelled' }).eq('id', sub.id);
          console.log('  ✓ Subscription cancelled in DB');
        }
        break;
      }

      default:
        console.log(`  → Unhandled event: ${eventType}`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
