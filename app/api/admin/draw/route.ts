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
 * 3. Fetch last 5 scores per subscriber
 * 4. Compare and determine winners (3+, 4+, 5 matches)
 * 5. Calculate prize distribution
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

    // 3. Calculate prize pool
    const totalRevenue = activeSubs.reduce((sum, s) => sum + Number(s.amount_inr), 0);
    // Prize pool = 60% of total revenue (rest goes to charity + platform)
    const prizePool = Math.round(totalRevenue * 0.6);

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
    const winners = [];

    for (const sub of activeSubs) {
      // Get latest 5 scores
      const { data: scores } = await supabaseAdmin
        .from('scores')
        .select('score')
        .eq('user_id', sub.user_id)
        .order('played_date', { ascending: false })
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
        let prizePercent: number;

        if (matchCount === 5) {
          matchType = '5-match';
          prizePercent = 0.50; // 50% of pool
        } else if (matchCount === 4) {
          matchType = '4-match';
          prizePercent = 0.30; // 30% of pool
        } else {
          matchType = '3-match';
          prizePercent = 0.20; // 20% of pool
        }

        winners.push({
          draw_id: draw.id,
          user_id: sub.user_id,
          match_type: matchType,
          prize_amount: Math.round(prizePool * prizePercent),
          verification_status: 'pending',
          payment_status: 'pending',
        });
      }
    }

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
      },
    });
  } catch (error) {
    console.error('Draw engine error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
