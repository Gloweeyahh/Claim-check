export const redFlagPatterns = [
  {
    re: /doctors? (don.?t|do not) want you to know|they.?re hiding|big pharma/i,
    label: '"Doctors don\'t want you to know"',
    detail: "This phrasing makes you feel like you're being let in on a secret. Real medical findings don't get hidden — they get published and checked by other experts.",
  },
  {
    re: /miracle|cure[sd]?|100%|guarantee|instant(ly)?/i,
    label: 'Extraordinary or absolute promises',
    detail: 'Words like "miracle", "cure", or "100% guaranteed" are a red flag on their own. Real treatments almost never work for everyone, every time, instantly.',
  },
  {
    re: /share (this|now)|everyone (needs|should) (to )?(know|see)|before it.?s (banned|deleted|taken down)/i,
    label: 'Pressure to share urgently',
    detail: 'Posts that push you to share right now, or "before it\'s deleted", are using urgency to stop you from stopping to check the facts first.',
  },
  {
    re: /secret|toxins?|detox|big food/i,
    label: 'Vague, hard-to-test language ("toxins", "secret")',
    detail: "Words like \"toxins\" or \"detox\" sound scientific but are almost never defined. If a claim can't say exactly what it means, there's nothing concrete to check.",
  },
  {
    re: /studies show|science (proves|says)|always|never/i,
    label: 'Certainty without a source',
    detail: 'Phrases like "studies show" or "science proves", with no actual study named, borrow credibility without giving you anything you can go and check yourself.',
  },
];
