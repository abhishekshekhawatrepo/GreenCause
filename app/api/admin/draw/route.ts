import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * Draw Engine — POST /api/admin/draw
 *
 * 1. Generate 5 random winning numbers (1–45)
 * 2. Fetch all active subscribers
 * 3. Fetch last 5 scores per subscriber (ordered by played_date and created_at)
 * 4. Compare and determine winners (3+, 4+, 5 matches)
 * 5. Calculate 40/35/25 prize distribution and equal splits
 * 6. Handle jackpot rollover if no 5-match winners
 */
export async function POST() {
  try {
    // 1. Generate winning numbers
    const winningNumbers: number[] = [];
    while (winningNumbers.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1;
      if (!winningNumbers.includes(n)) winningNumbers.push(n);
    }
    winningNumbers.sort((a, b) => a - b);

    // 2. Get all active subscribers
    const { data: activeSubs, error: subsError } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, amount_inr')
      .eq('status', 'active');

    if (subsError) {
      console.error('Draw: error fetching subs:', subsError);
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    if (!activeSubs || activeSubs.length === 0) {
      return NextResponse.json({ error: 'No active subscribers to run a draw' }, { status: 400 });
    }

    // Check for previous rollover
    const { data: lastDraw } = await supabaseAdmin
      .from('draws')
      .select('jackpot_rollover_inr')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const previousRollover = lastDraw?.jackpot_rollover_inr || 0;

    // 3. Calculate prize pool
    const totalRevenue = activeSubs.reduce((sum, s) => sum + Number(s.amount_inr), 0);
    // Prize pool = 60% of total revenue + previous rollover
    const prizePool = Math.round((totalRevenue * 0.6) + previousRollover);

    // 4. Create draw record
    const now = new Date();
    const drawMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const { data: draw, error: drawError } = await supabaseAdmin
      .from('draws')
      .insert({
        draw_month: drawMonth,
        scheduled_date: now.toISOString().split('T')[0],
        winning_numbers: winningNumbers,
        status: 'admin_review',
        total_pool_amount_inr: prizePool,
      })
      .select()
      .single();

    if (drawError || !draw) {
      console.error('Draw: error creating draw:', drawError);
      return NextResponse.json({ error: 'Failed to create draw record' }, { status: 500 });
    }

    // 5. Process each subscriber
    const entries = [];
    const rawWinners: any[] = [];
    let has5Match = false;

    for (const sub of activeSubs) {
      // Get latest 5 scores only (allows keeping infinite history in DB)
      const { data: scores } = await supabaseAdmin
        .from('scores')
        .select('score')
        .eq('user_id', sub.user_id)
        .order('played_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5);

      if (!scores || scores.length < 5) continue; // Need exactly 5 scores

      const userScores = scores.map(s => s.score);
      const matchCount = userScores.filter(s => winningNumbers.includes(s)).length;

      // Create draw entry
      entries.push({
        draw_id: draw.id,
        user_id: sub.user_id,
        scores: userScores,
        match_count: matchCount,
      });

      // 3+ matches = winner
      if (matchCount >= 3) {
        let matchType: string;

        if (matchCount === 5) {
          matchType = '5-match';
          has5Match = true;
        } else if (matchCount === 4) {
          matchType = '4-match';
        } else {
          matchType = '3-match';
        }

        rawWinners.push({
          draw_id: draw.id,
          user_id: sub.user_id,
          match_type: matchType,
          verification_status: 'pending',
          payment_status: 'pending',
        });
      }
    }

    // Calculate splits
    const pool5 = prizePool * 0.40;
    const pool4 = prizePool * 0.35;
    const pool3 = prizePool * 0.25;

    let newRollover = 0;
    if (!has5Match) {
      newRollover = pool5; // Rollover the 40% if no one hits the jackpot
    }

    // Update draw with rollover if applicable
    if (newRollover > 0) {
      await supabaseAdmin.from('draws').update({ jackpot_rollover_inr: newRollover }).eq('id', draw.id);
    }

    // Count winners by tier for equal distribution
    const count5 = rawWinners.filter(w => w.match_type === '5-match').length;
    const count4 = rawWinners.filter(w => w.match_type === '4-match').length;
    const count3 = rawWinners.filter(w => w.match_type === '3-match').length;

    const payout5 = count5 > 0 ? Math.round(pool5 / count5) : 0;
    const payout4 = count4 > 0 ? Math.round(pool4 / count4) : 0;
    const payout3 = count3 > 0 ? Math.round(pool3 / count3) : 0;

    // Assign payouts
    const winners = rawWinners.map(w => {
      let amount = 0;
      if (w.match_type === '5-match') amount = payout5;
      else if (w.match_type === '4-match') amount = payout4;
      else if (w.match_type === '3-match') amount = payout3;

      return { ...w, prize_amount: amount };
    });

    // 6. Batch insert entries
    if (entries.length > 0) {
      const { error: entriesError } = await supabaseAdmin.from('draw_entries').insert(entries);
      if (entriesError) console.error('Draw: error inserting entries:', entriesError);
    }

    // 7. Batch insert winners
    if (winners.length > 0) {
      const { error: winnersError } = await supabaseAdmin.from('winners').insert(winners);
      if (winnersError) console.error('Draw: error inserting winners:', winnersError);
    }

    return NextResponse.json({
      success: true,
      draw: {
        id: draw.id,
        winningNumbers,
        totalEntries: entries.length,
        totalWinners: winners.length,
        prizePool,
        rollover: newRollover
      },
    });
  } catch (error) {
    console.error('Draw engine error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
