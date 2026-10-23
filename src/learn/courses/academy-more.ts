import type { Exercise, Rng, Unit } from '../types';
import { int, match, mc, order, pickOne, teach, tf } from '../util';

const positionGen = (rng: Rng): Exercise => {
  const account = 10000 * int(rng, 1, 20);
  const riskPct = pickOne(rng, [1, 2] as const);
  const stop = pickOne(rng, [50, 100, 200, 250, 500] as const);
  const risk = (account * riskPct) / 100;
  const units = risk / stop;
  return {
    kind: 'input',
    id: 'a10-position',
    prompt: `Account ₦${account.toLocaleString()}, risk ${riskPct}% per trade, stop-loss ₦${stop} away per unit. How many units?`,
    answers: [String(units)],
    explain: `Risk = ${riskPct}% of ${account} = ₦${risk}. Units = risk ÷ stop distance = ${risk} ÷ ${stop} = ${units}.`,
    tip: { kind: 'formula', text: 'Position size = (account × risk %) ÷ stop distance. Decide the loss first, then the size.' },
  };
};

export const ACADEMY_MORE: Unit[] = [
  {
    id: 'a-s5',
    title: 'School 5: Character & composure',
    description: 'Calm under pressure, boundaries, reliability',
    who: 'ada',
    color: '#8b5cf6',
    lessons: [
      {
        id: 'a5-composure',
        title: 'Calm under pressure',
        icon: '🧘',
        teach: [
          teach('a5-comp-t1', 'ada', "Respond, don't react", [
            'Between what happens and what you do, there is a gap. Composure is making that gap bigger.',
            'The pause: breathe slowly, name the feeling ("I am angry"), then choose your words.',
            'Composure is not hiding feelings. It is not letting them steer.',
            "Boundaries: say clearly what you will and won't accept, calmly, without attacking.",
            'Reliability: do what you said, when you said. Trust is built in small promises kept.',
          ], { hook: { kind: 'memory', text: 'STOP: Stop, Take a breath, Observe what you feel, Proceed on purpose.' } }),
        ],
        exercises: [
          order('a5-comp-1', 'Order the STOP technique', ['Stop', 'Take a breath', 'Observe the feeling', 'Proceed on purpose'], 'S-T-O-P.'),
          mc('a5-comp-2', 'A classmate insults you in front of others. The most composed response is…', ['Insult them back louder', 'Leave without a word and plot revenge', 'Pause, then calmly say "That was not okay" and move on', 'Laugh along to fit in'], 2, 'Calm, clear and short. You keep your dignity and set a boundary.'),
          tf('a5-comp-3', 'Composure means never feeling angry.', false, 'Feelings are normal. Composure is choosing what you do with them.'),
          mc('a5-comp-4', 'Which builds trust fastest?', ['Big promises', 'Small promises kept consistently', 'Apologising often', 'Talking about your goals'], 1, 'Reliability is shown, not announced.'),
        ],
      },
    ],
  },
  {
    id: 'a-s8',
    title: 'School 8: Systems thinking',
    description: 'Feedback loops, bottlenecks, cause and effect',
    who: 'greta',
    color: '#06b6d4',
    lessons: [
      {
        id: 'a8-systems',
        title: 'Feedback loops & bottlenecks',
        icon: '🔄',
        teach: [
          teach('a8-sys-t1', 'greta', 'Everything is connected', [
            'A system is parts working together: your body, a business, a city, your study routine.',
            'A reinforcing (positive) feedback loop makes change grow: more savings → more interest → more savings.',
            'A balancing (negative) feedback loop pushes back towards a target: a thermostat, or hunger telling you to eat.',
            'A bottleneck is the slowest part; the whole system can only go as fast as it.',
            'To improve a system, fix the bottleneck first. Improving anything else is wasted effort.',
          ], { example: ['Your study bottleneck might be sleep, not hours at the desk.'] }),
        ],
        exercises: [
          match('a8-sys-1', 'Reinforcing or balancing loop?', [['Compound interest', 'Reinforcing'], ['A thermostat', 'Balancing']], 'Reinforcing loops grow; balancing loops stabilise.'),
          mc('a8-sys-2', 'A factory paints 100 cars an hour but can only dry 40. To make more cars, improve…', ['painting', 'drying', 'the paint colour', 'the car design'], 1, 'Drying is the bottleneck.'),
          tf('a8-sys-3', 'Speeding up a part that is not the bottleneck increases total output.', false, 'Output is limited by the bottleneck.'),
          mc('a8-sys-4', 'You sleep 4 hours, so you study badly, so you stay up late to catch up. This is…', ['a balancing loop', 'a reinforcing loop', 'not a system', 'a bottleneck'], 1, 'Each step makes the next one worse: a vicious reinforcing loop.'),
        ],
      },
    ],
  },
  {
    id: 'a-s10',
    title: 'School 10: Trading & market intelligence',
    description: 'Risk first: position sizing, risk to reward, why most traders lose',
    who: 'ada',
    color: '#22c55e',
    lessons: [
      {
        id: 'a10-risk',
        title: 'Risk comes first',
        icon: '📉',
        teach: [
          teach('a10-risk-t1', 'ada', 'Protect the money before trying to grow it', [
            'Most new traders lose money. Survive first; profit is a later skill.',
            'Risk only 1 to 2% of your account on any single trade. Ten losses in a row then still leave you in the game.',
            'Decide your stop-loss (where you admit you were wrong) before you enter, then size the position from it.',
            'Risk to reward: only take trades where the possible gain is clearly bigger than the possible loss, such as 1:2.',
            'Leverage multiplies losses as fast as gains. Never trade money you need for school fees, rent or food.',
            'This is education, not financial advice. Practise on paper or a demo account first.',
          ], { hook: { kind: 'formula', text: 'Position size = (account × risk %) ÷ stop distance.' } }),
        ],
        exercises: [
          positionGen,
          mc('a10-risk-1', 'Why risk only 1 to 2% per trade?', ['It guarantees profit', 'So a losing streak cannot wipe you out', 'Brokers require it', 'It makes trades faster'], 1, 'Small risk per trade keeps you alive through losing streaks, which always come.'),
          tf('a10-risk-2', 'A strategy that won 5 trades in a row is proven.', false, 'Five trades is far too small a sample. Test over hundreds of trades (backtesting) before trusting it.'),
          positionGen,
          mc('a10-risk-3', 'Risk ₦1,000 to make ₦3,000. The risk to reward is…', ['3:1', '1:3', '1:1', '1:30'], 1, 'Risk first, reward second: 1:3.'),
          tf('a10-risk-4', 'Using borrowed money (leverage) only increases profits, never losses.', false, 'Leverage magnifies both directions. It is how beginners lose everything quickly.'),
        ],
      },
    ],
  },
  {
    id: 'a-s11',
    title: 'School 11: Entrepreneurship & product',
    description: 'Real problems, validation, MVPs, pricing',
    who: 'tunde',
    color: '#eab308',
    lessons: [
      {
        id: 'a11-validate',
        title: 'Validate before you build',
        icon: '🚀',
        teach: [
          teach('a11-val-t1', 'tunde', 'Fall in love with the problem, not your idea', [
            'Most new products fail because nobody wanted them, not because the code was bad.',
            'Find a real problem: something people already spend time or money trying to fix.',
            'Talk to potential users. Ask about what they did last time they had the problem, not whether they "would use" your app; people are polite and say yes.',
            'Build an MVP (minimum viable product): the smallest thing that tests whether people will use or pay for it.',
            'Price by value: what is solving this problem worth to the customer?',
          ], { example: ['Bad question: "Would you use an app for study timetables?"', 'Good question: "How did you plan your study last week? What went wrong?"'] }),
        ],
        exercises: [
          mc('a11-val-1', 'Which question gives the most honest signal?', ['Would you buy this?', 'Do you like my idea?', 'How do you solve this problem today, and what does it cost you?', 'Is this a good app?'], 2, 'Past behaviour is evidence. Opinions about the future are guesses.'),
          tf('a11-val-2', 'You should build the full product before showing it to anyone.', false, 'Show the smallest version early. Feedback beats guessing.'),
          order('a11-val-3', 'Order the steps', ['Find a real problem', 'Talk to people who have it', 'Build a small MVP', 'Measure if they use or pay', 'Improve or change direction'], 'Problem, conversations, MVP, measure, iterate.'),
          mc('a11-val-4', 'An MVP is…', ['the final polished product', 'the smallest version that tests your key assumption', 'a marketing plan', 'a type of database'], 1, 'Minimum viable: just enough to learn if the idea works.'),
        ],
      },
    ],
  },
  {
    id: 'a-s7',
    title: 'School 7: Software engineering',
    description: 'Taught in depth in the Coding course and Code lab',
    who: 'zara',
    color: '#ff7a45',
    lessons: [
      {
        id: 'a7-engineer',
        title: 'What engineers really do',
        icon: '🛠️',
        teach: [
          teach('a7-eng-t1', 'zara', 'More than typing code', [
            'Engineers spend more time reading, thinking, testing and communicating than typing.',
            'They break big problems into small ones, write code others can read, and test their work.',
            'Version control (Git) records every change, so mistakes can be undone and teams can work together.',
            'The full path, with practice, lives in the Coding course, the Code lab and the Career path.',
          ]),
        ],
        exercises: [
          tf('a7-eng-1', "Most of a software engineer's time is spent typing new code.", false, 'Reading, designing, debugging, testing and talking take most of the time.'),
          mc('a7-eng-2', 'Git is used for…', ['designing logos', 'tracking changes to code', 'running websites', 'writing essays'], 1, 'It is version control: a history of every change.'),
          mc('a7-eng-3', 'Code is read far more often than it is written. So good code is…', ['as short as possible', 'clear and easy to read', 'full of clever tricks', 'never commented'], 1, 'Clarity wins. Future you is a reader too.'),
        ],
      },
    ],
  },
];
