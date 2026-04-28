/**
 * Test-mode email logger.
 * In development, emails are logged to the console instead of being sent.
 * Replace this module with a real provider (Resend, SendGrid, etc.) for production.
 */

interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean }> {
  console.log('\n📧 ─── EMAIL (test-mode) ───────────────────────');
  console.log(`  To:      ${payload.to}`);
  console.log(`  Subject: ${payload.subject}`);
  console.log(`  Body:    ${payload.body.substring(0, 200)}...`);
  if (payload.metadata) {
    console.log(`  Meta:    ${JSON.stringify(payload.metadata)}`);
  }
  console.log('────────────────────────────────────────────────\n');

  return { success: true };
}

/** Convenience wrappers */
export async function sendWinnerNotification(email: string, matchType: string, amount: number) {
  return sendEmail({
    to: email,
    subject: `🎉 Congratulations! You're a GreenCause ${matchType} winner!`,
    body: `You matched ${matchType} in this month's draw and won ₹${amount.toLocaleString('en-IN')}! Upload your proof to claim your prize.`,
    metadata: { type: 'winner_notification', matchType, amount },
  });
}

export async function sendDrawResultsToAdmin(drawId: string, winnersCount: number) {
  return sendEmail({
    to: 'admin@greencause.in',
    subject: `🏌️ Draw Results Ready for Review`,
    body: `The monthly draw (${drawId}) has been generated with ${winnersCount} winners. Log in to the admin panel to review and publish.`,
    metadata: { type: 'admin_draw_review', drawId, winnersCount },
  });
}

export async function sendSubscriptionConfirmation(email: string, planType: string) {
  return sendEmail({
    to: email,
    subject: `Welcome to GreenCause! 🌿`,
    body: `Your ${planType} subscription is now active. Start tracking your scores to enter the monthly draw!`,
    metadata: { type: 'subscription_confirmation', planType },
  });
}
