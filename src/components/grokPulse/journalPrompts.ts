/**
 * Journal Prompt Templates
 * Maps sentiment_term to guided journaling prompts
 */

export interface JournalPrompt {
  title: string;
  questions: string[];
  next: string;
}

const PROMPTS: Record<string, JournalPrompt> = {
  'bullish vibes': {
    title: 'Bullish Momentum Check',
    questions: [
      'What specific catalyst is driving this bullish sentiment?',
      'Is this based on fundamentals or speculation?',
      'What would invalidate this bullish thesis?',
      'At what price would you consider taking profits?',
    ],
    next: 'Define your exit strategy before entering.',
  },
  'bearish dumps': {
    title: 'Bearish Sentiment Analysis',
    questions: [
      'Is this a temporary dip or a trend reversal?',
      'What are the key support levels to watch?',
      'Are insiders or whales selling?',
      'What news or events triggered this sentiment?',
    ],
    next: 'Set alerts for key support levels.',
  },
  'neutral stagnation': {
    title: 'Consolidation Review',
    questions: [
      'How long has this neutral period lasted?',
      'Is volume increasing or decreasing during consolidation?',
      'What breakout signals should you watch for?',
      'Is this a good accumulation opportunity?',
    ],
    next: 'Monitor for breakout catalysts.',
  },
  'moon potential': {
    title: 'High Upside Assessment',
    questions: [
      'What unique value proposition supports moon potential?',
      'Is the team delivering on roadmap milestones?',
      'What is the realistic market cap ceiling?',
      'How does this compare to similar projects that mooned?',
    ],
    next: 'Size position for asymmetric upside.',
  },
  'rug risk': {
    title: 'Rug Risk Evaluation',
    questions: [
      'Is the contract verified and audited?',
      'Are liquidity pools locked? For how long?',
      'Is team identity public and accountable?',
      'What is the token distribution? Any whale wallets?',
    ],
    next: 'If unsure, reduce exposure immediately.',
  },
  'dead project': {
    title: 'Project Mortality Check',
    questions: [
      'When was the last team communication or commit?',
      'Is there any remaining community activity?',
      'Are there any recovery catalysts possible?',
      'Should you realize the loss for tax purposes?',
    ],
    next: 'Document lessons learned from this investment.',
  },
  'strong bull momentum': {
    title: 'Bull Run Strategy',
    questions: [
      'Is this momentum sustainable or parabolic?',
      'What is your profit-taking strategy at each level?',
      'Are you over-exposed to this position?',
      'What trailing stop would protect gains?',
    ],
    next: 'Lock in partial profits on strength.',
  },
  'strong bear decline': {
    title: 'Bear Market Survival',
    questions: [
      'Is this a sector-wide decline or project-specific?',
      'What is the maximum drawdown you can tolerate?',
      'Should you average down or cut losses?',
      'What would signal the bottom is in?',
    ],
    next: 'Preserve capital for recovery opportunities.',
  },
  'fomo incoming': {
    title: 'FOMO Control Check',
    questions: [
      'Are you reacting emotionally or strategically?',
      'Did you miss the optimal entry? Is it too late?',
      'What position size makes sense at current levels?',
      'Can you wait for a pullback entry?',
    ],
    next: 'Never chase. Set limit orders instead.',
  },
  'panic sell': {
    title: 'Panic Sell Prevention',
    questions: [
      'Is this panic driven by market noise or real news?',
      'Has your original investment thesis changed?',
      'Are you selling at the worst possible time?',
      'What would you advise a friend in this situation?',
    ],
    next: 'Step away. Review with fresh eyes tomorrow.',
  },
  'accumulation phase': {
    title: 'Accumulation Strategy',
    questions: [
      'Is smart money accumulating at these levels?',
      'What is your DCA schedule and target allocation?',
      'How long can this accumulation phase last?',
      'What signals would confirm accumulation is ending?',
    ],
    next: 'Build position gradually with discipline.',
  },
  'hype building': {
    title: 'Hype Cycle Analysis',
    questions: [
      'What is driving the current hype?',
      'Is there substance behind the narrative?',
      'When does hype typically peak for similar projects?',
      'How will you exit before hype fades?',
    ],
    next: 'Plan your exit before the crowd.',
  },
  'washed out': {
    title: 'Capitulation Review',
    questions: [
      'Has maximum pain been reached?',
      'Are weak hands fully flushed out?',
      'Is this a generational buying opportunity?',
      'What is the risk/reward at current levels?',
    ],
    next: 'High conviction entries only.',
  },
  'conviction high': {
    title: 'High Conviction Check',
    questions: [
      'What gives you such high conviction?',
      'Are you suffering from confirmation bias?',
      'What would make you change your mind?',
      'Is your position size appropriate for your conviction?',
    ],
    next: 'Document your thesis for future review.',
  },
  'choppy market': {
    title: 'Choppy Market Tactics',
    questions: [
      'Should you reduce position sizes in choppy conditions?',
      'Are you getting chopped up by false signals?',
      'Would it be better to wait for a clear trend?',
      'What range-bound strategies could work here?',
    ],
    next: 'Trade smaller or sit on hands.',
  },
};

const FALLBACK_PROMPT: JournalPrompt = {
  title: 'Market Reflection',
  questions: [
    'What is the current market sentiment telling you?',
    'How does this align with your investment thesis?',
    'What actions, if any, should you take?',
    'What would you do differently next time?',
  ],
  next: 'Journal your thoughts for future reference.',
};

/**
 * Get journal prompt for a sentiment term
 */
export function getJournalPrompt(sentiment_term: string): JournalPrompt {
  const normalized = sentiment_term.toLowerCase().trim();
  return PROMPTS[normalized] ?? FALLBACK_PROMPT;
}

/**
 * Check if sentiment term has a specific prompt
 */
export function hasSpecificPrompt(sentiment_term: string): boolean {
  const normalized = sentiment_term.toLowerCase().trim();
  return normalized in PROMPTS;
}
