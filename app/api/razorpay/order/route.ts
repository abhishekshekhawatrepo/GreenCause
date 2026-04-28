import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getRazorpay, isRazorpayConfigured } from '@/lib/razorpay';
import { PLAN_MONTHLY_PRICE, PLAN_YEARLY_PRICE, APP_NAME } from '@/lib/constants';

/**
 * POST /api/razorpay/order
 *
 * Creates a Razorpay order for subscription checkout.
 * Body: { planType: 'monthly' | 'yearly', userId?: string }
 *
 * If Razorpay is not configured, returns a mock order for testing.
 */
export async function POST(request: Request) {
  try {
    const { planType, userId } = await request.json();

    // Validate plan type
    if (!planType || !['monthly', 'yearly'].includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type. Must be "monthly" or "yearly".' },
        { status: 400 }
      );
    }

    const amountINR = planType === 'monthly' ? PLAN_MONTHLY_PRICE : PLAN_YEARLY_PRICE;
    const amountPaise = amountINR * 100; // Razorpay expects amount in paise

    // ── Mock mode (no Razorpay keys configured) ──
    if (!isRazorpayConfigured()) {
      console.log('🧪 Mock order created (Razorpay not configured)');
      const mockOrderId = `order_mock_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      return NextResponse.json({
        id: mockOrderId,
        amount: amountPaise,
        currency: 'INR',
        receipt: `gc_${planType}_${Date.now()}`,
        status: 'created',
        mock: true,
      });
    }

    // ── Real Razorpay order ──
    const razorpay = getRazorpay()!;

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `gc_${planType}_${Date.now()}`,
      notes: {
        app: APP_NAME,
        planType,
        userId: userId || 'anonymous',
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
