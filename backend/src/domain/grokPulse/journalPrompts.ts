export interface JournalPromptTemplate {
  moment: string;
  evidence: string;
  risk: string;
  next: string;
}

export const JOURNAL_PROMPT_TEMPLATES: Record<string, JournalPromptTemplate> = {
  'bullish vibes': {
    moment: 'Was war der erste Hinweis auf Stärke (Volume, Price, Narrative, Flow)?',
    evidence: 'Welche 2 Datenpunkte stützen “bullish” wirklich?',
    risk: 'Was wäre das klare Invalidation-Signal?',
    next: '“Wenn X passiert → ich mache Y.”'
  },
  'bearish dumps': {
    moment: 'Was war der Trigger für den Dump (Liquidity, Whale, News, Chart break)?',
    evidence: 'Welche Daten zeigen Distribution?',
    risk: 'Was ist dein Stop/Exit-Kriterium?',
    next: '“Ich reduziere / warte / hedged … weil …”'
  },
  'neutral stagnation': {
    moment: 'Warum passiert nichts? (keine Käufer, keine Seller)',
    evidence: 'Welche Range ist aktuell relevant?',
    risk: 'Was wäre ein Fakeout?',
    next: '“Alert set auf …, ich handle erst bei …”'
  },
  'moon potential': {
    moment: 'Welches Narrativ macht das asymmetrisch?',
    evidence: 'Welche Metriken rechtfertigen “Moon” (Cap/Volume/Acceleration)?',
    risk: 'Was wäre der Rug/Decay Trigger?',
    next: '“Position sizing: … / Profit plan: …”'
  },
  'rug risk': {
    moment: 'Welche Red Flag war am stärksten?',
    evidence: 'Welche 2 Red Flags sind objektiv (nicht Feeling)?',
    risk: 'Worst case + Zeitfenster?',
    next: '“No trade / exit / avoid rule für nächste Zeit: …”'
  },
  'dead project': {
    moment: 'Woran merkst du “dead” (Volume, Attention, dev silence)?',
    evidence: 'Welche Kennzahl ist der Killer?',
    risk: 'Gibt’s ein Revival-Szenario? Was müsste passieren?',
    next: '“Ich archive das / setze nur Re-activation alert …”'
  },
  'strong bull momentum': {
    moment: 'Welche Struktur bestätigt Momentum?',
    evidence: 'Trendfolge: HH/HL? Volume Expansion?',
    risk: 'Wo kippt Momentum?',
    next: '“Add / trail / partials bei …”'
  },
  'strong bear decline': {
    moment: 'Welche Levels wurden verloren?',
    evidence: 'Lower highs + sell pressure?',
    risk: 'Dead-cat bounce Bedingungen?',
    next: '“No catch knives rule: …”'
  },
  'fomo incoming': {
    moment: 'Woher kommt die Beschleunigung?',
    evidence: 'Welche Signale sind “late buyers” typisch?',
    risk: 'Wie vermeidest du Overpay?',
    next: '“Entry nur via pullback / limit / cooldown …”'
  },
  'panic sell': {
    moment: 'Was löste Kapitulation aus?',
    evidence: 'Wie erkennt man “forced selling”?',
    risk: 'Kann es noch tiefer? Was ist dein Plan dann?',
    next: '“Ich warte auf Stabilisierung bei …”'
  },
  'accumulation phase': {
    moment: 'Warum glaubst du an Accumulation?',
    evidence: 'Welche Daten = “absorption”?',
    risk: 'Was würde Distribution beweisen?',
    next: '“DCA schedule / Alerts: …”'
  },
  'hype building': {
    moment: 'Welche Narrative-Punkte steigen?',
    evidence: 'Welche Metrik zeigt “attention up”?',
    risk: 'Was ist “hollow hype”?',
    next: '“Ich scout entry points + set profit ladder …”'
  },
  'washed out': {
    moment: 'Wieso sind Verkäufer erschöpft?',
    evidence: 'Low volume, flattening sell pressure?',
    risk: 'Was wäre “one more flush”?',
    next: '“Entry nur nach reclaim/confirm …”'
  },
  'conviction high': {
    moment: 'Warum halten Leute?',
    evidence: 'Welche Signale zeigen “strong hands”?',
    risk: 'Was wäre der “conviction break”?',
    next: '“Hold rules + partials plan: …”'
  },
  'choppy market': {
    moment: 'Wo kamen die Fakeouts?',
    evidence: 'Welche Range / Volatility?',
    risk: 'Wie verlierst du hier am meisten Geld (typischer Fehler)?',
    next: '“Smaller size / wider stops / wait for trend …”'
  }
};

