// Pure strategy content shared by the CLI and the web app: how to convert
// an exposed task into a moated position, and the durable asset classes
// that survive any model release.

// What "convert" means depending on which moat is (or could be) strongest.
export const CONVERSION_PLAYBOOK = {
  accountability:
    'Become the signer. Let AI produce the work; you own the outcome, carry the liability, and charge for the guarantee — not the labor.',
  trust:
    'Become the face. Clients should buy "you, amplified by AI" — keep every relationship touchpoint human, automate everything behind it.',
  embodied:
    'Anchor it in the physical. Pair the digital part (automate it) with on-site presence, hardware, or hands-on delivery that no API can ship.',
  taste:
    'Become the curator. Generate 20 options with AI, but be the person whose selection people pay for. Publish your taste so it becomes a brand.',
  access:
    'Become the gateway. Your privileged context, data, or seat at the table is the input AI cannot get — sell the access, automate the processing.',
};

export const ASSET_CLASSES = [
  {
    key: 'reputation',
    label: 'Reputation',
    question: 'Public track record people can verify (shipped work, reviews, talks)?',
    hint: '0 = invisible, 4 = known name in your niche',
    actions: [
      'Publish one verifiable artifact per month under your own name',
      'Attach your name to outcomes, not tasks ("I shipped X", not "I wrote code")',
    ],
  },
  {
    key: 'network',
    label: 'Network',
    question: 'People who would take your call and vouch for you?',
    hint: '0 = none, 4 = 50+ who would refer you work',
    actions: [
      'One real conversation per week with someone outside your company',
      'Make 2 introductions per month — referral debt compounds',
    ],
  },
  {
    key: 'audience',
    label: 'Audience / distribution',
    question: 'Direct channel to people who listen (list, followers, community)?',
    hint: '0 = zero reach, 4 = you can reach thousands on demand',
    actions: [
      'Own the channel: email list or community you control, not rented feeds',
      'Teach what you automate — operators of AI need guides they trust',
    ],
  },
  {
    key: 'credentials',
    label: 'Licenses & credentials',
    question: 'Legal permissions to sign, certify, or practice (PE, CPA, MD, bar...)?',
    hint: '0 = none, 4 = licensed gatekeeper in a regulated field',
    actions: [
      'Acquire one signing authority in your domain — AI cannot hold a license',
      'Position as the accountable reviewer of AI output in regulated work',
    ],
  },
  {
    key: 'context',
    label: 'Proprietary context',
    question: 'Knowledge that exists nowhere in writing (org history, client quirks, tacit craft)?',
    hint: '0 = all your knowledge is googleable, 4 = years of untranscribed context',
    actions: [
      'Sit where context accumulates: client-facing, incident response, negotiations',
      'Become the human index: the person who knows who/why, not just how',
    ],
  },
  {
    key: 'capital',
    label: 'Capital & equity',
    question: 'Ownership of things that earn without your labor (equity, products, property)?',
    hint: '0 = pure wage income, 4 = assets could cover your living costs',
    actions: [
      'Convert labor income into ownership: equity over salary where possible',
      'Own one small product/service operated BY AI, margin flows to you',
    ],
  },
];
