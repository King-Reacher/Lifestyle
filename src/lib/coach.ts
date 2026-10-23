import type { CoachMode } from './types';

export type Step = 'understand' | 'clarify' | 'evaluate';

export const STEP_LABELS: Record<Step | 'decide' | 'execute' | 'review', string> = {
  understand: 'Understand — what is actually happening?',
  clarify: 'Clarify — what outcome matters most?',
  evaluate: 'Evaluate — options, risks, consequences',
  decide: 'Decide — the most sensible next action',
  execute: 'Execute — turn it into a task with a deadline',
  review: 'Review — did it work? What did you learn?',
};

export interface Question {
  id: string;
  step: Step;
  prompt: string;
  type: 'text' | 'choice';
  options?: string[];
}

export interface Recommendation {
  action: string;
  why: string;
  minutes: number;
  /** Days from today the resulting task is due. */
  dueInDays: number;
  /** Switch today's plan into recovery (reduced) mode. */
  reducePlan?: boolean;
  /** A principle to remember, so the coach trains judgment instead of replacing it. */
  principle: string;
  note?: string;
}

export type Answers = Record<string, string>;

export interface Situation {
  id: string;
  label: string;
  /** Major decisions get questions even in "both" mode; routine ones get a fast answer. */
  major: boolean;
  questions: Question[];
  quick: Recommendation;
  recommend: (a: Answers) => Recommendation;
}

export const SITUATIONS: Situation[] = [
  {
    id: 'procrastinating',
    label: "I'm procrastinating",
    major: false,
    questions: [
      { id: 'task', step: 'understand', prompt: 'What are you avoiding?', type: 'text' },
      {
        id: 'why',
        step: 'clarify',
        prompt: 'Why is it hard right now?',
        type: 'choice',
        options: ['Too big or unclear', 'Boring', "I'm tired", "Afraid I'll do it badly", 'My phone keeps pulling me'],
      },
      { id: 'due', step: 'evaluate', prompt: 'When is it due?', type: 'choice', options: ['Today', 'This week', 'Later'] },
    ],
    quick: {
      action: 'Start a 10-minute focus timer on it. You only owe 10 minutes.',
      why: 'Starting is the hard part; momentum usually carries you past the timer.',
      minutes: 10,
      dueInDays: 0,
      principle: 'Lower the bar to start, not the standard to finish.',
    },
    recommend: (a) => {
      const task = a.task?.trim() || 'the task';
      const byReason: Record<string, Pick<Recommendation, 'action' | 'why' | 'minutes'>> = {
        'Too big or unclear': {
          action: `Write the first physical step of "${task}" and do only that for 15 minutes.`,
          why: 'Vague tasks feel heavy. A concrete first step removes the fog.',
          minutes: 15,
        },
        Boring: {
          action: `25-minute focus session on "${task}", then a 5-minute reward.`,
          why: 'Boring work gets done in short, bounded sprints.',
          minutes: 25,
        },
        "I'm tired": {
          action: `Do the minimum version of "${task}" for 10 minutes, then rest properly.`,
          why: 'Tired days are for keeping the chain, not breaking records.',
          minutes: 10,
        },
        "Afraid I'll do it badly": {
          action: `Make a deliberately rough first draft of "${task}" in 15 minutes.`,
          why: 'You can improve a bad draft. You cannot improve a blank page.',
          minutes: 15,
        },
        'My phone keeps pulling me': {
          action: `Put the phone in another room and do 25 minutes on "${task}".`,
          why: 'Distance beats willpower.',
          minutes: 25,
        },
      };
      const r = byReason[a.why] ?? byReason['Too big or unclear'];
      return {
        ...r,
        dueInDays: 0,
        principle:
          a.due === 'Later'
            ? 'Not urgent is not the same as not important — small progress now prevents a crisis later.'
            : 'Lower the bar to start, not the standard to finish.',
      };
    },
  },
  {
    id: 'money',
    label: "I'm about to make a money decision",
    major: true,
    questions: [
      { id: 'what', step: 'understand', prompt: 'What are you about to spend on, and how much?', type: 'text' },
      { id: 'kind', step: 'clarify', prompt: 'Be honest — what is it?', type: 'choice', options: ['Essential need', 'Useful want', 'Impulse'] },
      { id: 'borrow', step: 'evaluate', prompt: 'Can you pay without borrowing?', type: 'choice', options: ['Yes', 'No'] },
      {
        id: 'delays',
        step: 'evaluate',
        prompt: 'Does it delay one of your savings goals?',
        type: 'choice',
        options: ['Yes', 'No', 'Not sure'],
      },
    ],
    quick: {
      action: 'Wait 24 hours before buying. If you still need it tomorrow, compare two prices first.',
      why: 'Most regret purchases are decided in minutes.',
      minutes: 5,
      dueInDays: 1,
      principle: 'Essentials first, savings second, wants last.',
    },
    recommend: (a) => {
      const what = a.what?.trim() || 'this';
      if (a.borrow === 'No' && a.kind !== 'Essential need') {
        return {
          action: `Don't buy ${what}. Add it to a savings goal if you still want it next month.`,
          why: 'Borrowing for a want turns a small pleasure into a long cost.',
          minutes: 5,
          dueInDays: 0,
          principle: 'Never borrow for something you merely want.',
        };
      }
      if (a.kind === 'Essential need') {
        return {
          action: `Buy ${what}, but compare at least two prices first and log it as essential.`,
          why: 'Needs should be met — just not at any price.',
          minutes: 15,
          dueInDays: 0,
          principle: 'Essentials first, savings second, wants last.',
          note: a.borrow === 'No' ? 'If you must borrow for an essential, borrow the smallest amount for the shortest time, from someone safe.' : undefined,
        };
      }
      if (a.kind === 'Impulse' || a.delays === 'Yes') {
        return {
          action: `Wait 48 hours on ${what}. Revisit it after this month's saving is done.`,
          why: 'If it still matters in two days it is a real want; if not, you just saved money.',
          minutes: 5,
          dueInDays: 2,
          principle: 'Pay your future self before your present impulses.',
        };
      }
      return {
        action: `It's a fair want. Buy ${what} from discretionary money only, and log it.`,
        why: 'Planned enjoyment is part of a sustainable budget.',
        minutes: 5,
        dueInDays: 0,
        principle: 'Spend on purpose, not by accident.',
      };
    },
  },
  {
    id: 'career',
    label: 'I need to make a career decision',
    major: true,
    questions: [
      { id: 'decision', step: 'understand', prompt: 'What is the decision, and what are the options?', type: 'text' },
      {
        id: 'matters',
        step: 'clarify',
        prompt: 'What matters most right now?',
        type: 'choice',
        options: ['Learning and skill', 'Income now', 'Long-term growth', 'Stability'],
      },
      { id: 'reversible', step: 'evaluate', prompt: 'Can you reverse it if it goes wrong?', type: 'choice', options: ['Yes, easily', 'Partly', 'No'] },
      { id: 'worst', step: 'evaluate', prompt: "What's the worst realistic outcome?", type: 'text' },
    ],
    quick: {
      action: 'Write each option and one line on how it serves your 2-year goal. Decide by tomorrow.',
      why: 'Clarity on paper beats circling in your head.',
      minutes: 20,
      dueInDays: 1,
      principle: 'Choose by direction, not by mood.',
    },
    recommend: (a) => {
      const matters = (a.matters || 'long-term growth').toLowerCase();
      if (a.reversible === 'Yes, easily') {
        return {
          action: `Pick the option that best serves ${matters}. Commit to it for two weeks, then review.`,
          why: 'Reversible decisions should be made quickly — you learn more by trying than by thinking.',
          minutes: 20,
          dueInDays: 1,
          principle: 'Two-way doors: decide fast. One-way doors: decide carefully.',
        };
      }
      return {
        action: `List pros, cons and the worst case for each option, ask one experienced person, then decide what best serves ${matters}.`,
        why: `This is hard to undo${a.worst ? ` and the downside ("${a.worst.trim()}") is real` : ''}, so it deserves a second opinion.`,
        minutes: 45,
        dueInDays: 3,
        principle: 'Two-way doors: decide fast. One-way doors: decide carefully.',
      };
    },
  },
  {
    id: 'emotional',
    label: "I'm emotional or under pressure",
    major: true,
    questions: [
      { id: 'what', step: 'understand', prompt: 'What happened?', type: 'text' },
      { id: 'feeling', step: 'clarify', prompt: 'What are you feeling most?', type: 'choice', options: ['Angry', 'Anxious', 'Sad', 'Overwhelmed'] },
      { id: 'urgent', step: 'evaluate', prompt: 'Does this truly need a response in the next hour?', type: 'choice', options: ['Yes', 'No'] },
    ],
    quick: {
      action: 'Pause for 10 minutes: walk, drink water, breathe slowly. Decide nothing until then.',
      why: 'Strong emotion narrows judgment. Ten minutes widens it again.',
      minutes: 10,
      dueInDays: 0,
      principle: 'Respond, don’t react.',
      note: 'If you feel unsafe or in crisis, reach out to someone you trust or local emergency services now.',
    },
    recommend: (a) => {
      const note = 'If you feel unsafe or in crisis, reach out to someone you trust or local emergency services now.';
      if (a.feeling === 'Overwhelmed') {
        return {
          action: 'Write down everything on your mind, circle the one thing that matters today, and do only that.',
          why: 'Overwhelm is too many open loops. Paper closes them.',
          minutes: 15,
          dueInDays: 0,
          principle: 'One thing at a time is still progress.',
          note,
        };
      }
      return {
        action:
          a.urgent === 'Yes'
            ? 'Take 10 minutes away, then write your reply and read it once as the other person before sending.'
            : 'Write what you want to say, but send nothing for at least an hour. Revisit when calm.',
        why: a.feeling === 'Angry' ? 'Anger makes fast replies feel right and look wrong later.' : 'A calm mind sees more options.',
        minutes: 10,
        dueInDays: 0,
        principle: 'Respond, don’t react.',
        note,
      };
    },
  },
  {
    id: 'behind',
    label: "I've fallen behind on my plans",
    major: false,
    questions: [
      { id: 'howFar', step: 'understand', prompt: 'How far behind are you?', type: 'choice', options: ['One day', 'A few days', 'A week or more'] },
      { id: 'priority', step: 'clarify', prompt: 'What is the one priority that must survive?', type: 'text' },
      {
        id: 'cause',
        step: 'evaluate',
        prompt: 'What caused it?',
        type: 'choice',
        options: ['I planned too much', 'Something unexpected', 'Low energy', 'I avoided it'],
      },
    ],
    quick: {
      action: "Switch today to the reduced plan: must-dos and habit minimums only.",
      why: 'A smaller plan you finish beats a big plan you abandon.',
      minutes: 5,
      dueInDays: 0,
      reducePlan: true,
      principle: 'Never miss twice.',
    },
    recommend: (a) => {
      const p = a.priority?.trim();
      const fix: Record<string, string> = {
        'I planned too much': 'Plan 20% less tomorrow than you think you can do.',
        'Something unexpected': 'Leave a 30-minute buffer in tomorrow’s plan for surprises.',
        'Low energy': 'Protect sleep tonight and schedule hard work in your best hours.',
        'I avoided it': 'Start tomorrow with the avoided task, before anything else.',
      };
      return {
        action: `${p ? `Protect "${p}" first. ` : ''}Switch to the reduced plan and roll unfinished work forward.`,
        why: fix[a.cause] ?? 'Recovery is a skill: shrink the plan, restart the chain.',
        minutes: p ? 30 : 5,
        dueInDays: 0,
        reducePlan: true,
        principle: a.howFar === 'A week or more' ? 'Restart small. Consistency first, volume later.' : 'Never miss twice.',
      };
    },
  },
  {
    id: 'other',
    label: 'Something else is happening',
    major: true,
    questions: [
      { id: 'what', step: 'understand', prompt: 'Describe the situation in one or two sentences.', type: 'text' },
      { id: 'outcome', step: 'clarify', prompt: 'What outcome matters most to you?', type: 'text' },
      { id: 'options', step: 'evaluate', prompt: 'What are your options, and the biggest risk of each?', type: 'text' },
    ],
    quick: {
      action: 'Write the outcome you want, then the smallest next step toward it. Do that step today.',
      why: 'A clear next step turns worry into motion.',
      minutes: 15,
      dueInDays: 0,
      principle: 'Decide the next step, not the whole future.',
    },
    recommend: (a) => ({
      action: `Choose the option that best moves you toward "${a.outcome?.trim() || 'your outcome'}" with the least risk you can't undo. Take its first step within 24 hours.`,
      why: 'Good decisions balance what you want against what you can afford to lose.',
      minutes: 20,
      dueInDays: 1,
      principle: 'Decide the next step, not the whole future.',
    }),
  },
];

/** Whether to walk through the questions or answer immediately. */
export function shouldAsk(mode: CoachMode, situation: Situation): boolean {
  if (mode === 'ask') return true;
  if (mode === 'suggest') return false;
  return situation.major;
}
