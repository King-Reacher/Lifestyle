import type { Who } from '../components/Character';
import type { Area } from './ledger';

export type Step = 'understand' | 'clarify' | 'evaluate';

export const STEP_LABELS: Record<Step, string> = {
  understand: 'Understand: what is actually happening?',
  clarify: 'Clarify: what outcome matters most?',
  evaluate: 'Evaluate: options, risks, consequences',
};

export interface Question {
  id: string;
  step: Step;
  prompt: string;
  type: 'text' | 'choice';
  options?: string[];
}

export interface Advice {
  action: string;
  why: string;
  /** A principle to remember, so the guide trains judgment instead of replacing it. */
  principle: string;
  note?: string;
}

export type Answers = Record<string, string>;

export interface Guide {
  id: string;
  label: string;
  icon: string;
  who: Who;
  area: Area;
  questions: Question[];
  advise: (a: Answers) => Advice;
}

const SAFETY = 'If you feel unsafe or in crisis, talk to someone you trust or contact local emergency services now.';

export const GUIDES: Guide[] = [
  {
    id: 'procrastinating',
    label: "I'm procrastinating",
    icon: '🐌',
    who: 'tunde',
    area: 'personal',
    questions: [
      { id: 'task', step: 'understand', prompt: 'What are you avoiding?', type: 'text' },
      { id: 'why', step: 'clarify', prompt: 'Why is it hard right now?', type: 'choice', options: ['Too big or unclear', 'Boring', "I'm tired", "Afraid I'll do it badly", 'My phone keeps pulling me'] },
      { id: 'due', step: 'evaluate', prompt: 'When is it due?', type: 'choice', options: ['Today', 'This week', 'Later'] },
    ],
    advise: (a) => {
      const task = a.task?.trim() || 'the task';
      const byReason: Record<string, Pick<Advice, 'action' | 'why'>> = {
        'Too big or unclear': { action: `Write the very first physical step of "${task}" and do only that for 15 minutes.`, why: 'Vague tasks feel heavy. A concrete first step clears the fog.' },
        Boring: { action: `25 minutes on "${task}", then a 5-minute reward.`, why: 'Boring work gets done in short, bounded sprints.' },
        "I'm tired": { action: `Do the smallest version of "${task}" for 10 minutes, then rest properly.`, why: 'Tired days are for keeping the chain, not breaking records.' },
        "Afraid I'll do it badly": { action: `Make a deliberately rough first attempt at "${task}" in 15 minutes.`, why: 'You can improve a bad draft. You cannot improve a blank page.' },
        'My phone keeps pulling me': { action: `Put the phone in another room and do 25 minutes on "${task}".`, why: 'Distance beats willpower.' },
      };
      return {
        ...(byReason[a.why] ?? byReason['Too big or unclear']),
        principle: a.due === 'Later' ? 'Not urgent is not the same as not important. Small progress now prevents a crisis later.' : 'Lower the bar to start, not the standard to finish.',
      };
    },
  },
  {
    id: 'money',
    label: "I'm about to spend money",
    icon: '💸',
    who: 'ada',
    area: 'money',
    questions: [
      { id: 'what', step: 'understand', prompt: 'What are you about to spend on, and how much?', type: 'text' },
      { id: 'kind', step: 'clarify', prompt: 'Be honest. What is it?', type: 'choice', options: ['Essential need', 'Useful want', 'Impulse'] },
      { id: 'borrow', step: 'evaluate', prompt: 'Can you pay without borrowing?', type: 'choice', options: ['Yes', 'No'] },
      { id: 'delays', step: 'evaluate', prompt: 'Does it delay one of your savings goals?', type: 'choice', options: ['Yes', 'No', 'Not sure'] },
    ],
    advise: (a) => {
      const what = a.what?.trim() || 'this';
      if (a.borrow === 'No' && a.kind !== 'Essential need')
        return { action: `Don't buy ${what}. Put it on your wants list and save for it instead.`, why: 'Borrowing for a want turns a small pleasure into a long cost.', principle: 'Never borrow for something you merely want.' };
      if (a.kind === 'Essential need')
        return {
          action: `Buy ${what}, but compare at least two prices first and log it as a need.`,
          why: 'Needs should be met, just not at any price.',
          principle: 'Essentials first, savings second, wants last.',
          note: a.borrow === 'No' ? 'If you must borrow for an essential, borrow the smallest amount for the shortest time, from someone safe.' : undefined,
        };
      if (a.kind === 'Impulse' || a.delays === 'Yes')
        return { action: `Add ${what} to your wants list. It waits 48 hours, then you decide.`, why: 'If it still matters in two days it is a real want. If not, you just saved money.', principle: 'Pay your future self before your present impulses.' };
      return { action: `It's a fair want. Put it through the wants list and pay from fun money only.`, why: 'Planned enjoyment is part of a budget you can stick to.', principle: 'Spend on purpose, not by accident.' };
    },
  },
  {
    id: 'stuck',
    label: "I'm stuck on a topic",
    icon: '🧱',
    who: 'mei',
    area: 'jamb',
    questions: [
      { id: 'topic', step: 'understand', prompt: 'Which topic?', type: 'text' },
      { id: 'kind', step: 'clarify', prompt: 'What exactly goes wrong?', type: 'choice', options: ["I don't understand it", 'I understand but forget', 'I run out of time on questions', 'I make careless mistakes'] },
      { id: 'when', step: 'evaluate', prompt: 'How soon do you need it?', type: 'choice', options: ['This week', 'Before the exam', 'Not sure'] },
    ],
    advise: (a) => {
      const t = a.topic?.trim() || 'the topic';
      const map: Record<string, Advice> = {
        "I don't understand it": { action: `Go back one level: redo the foundation lesson before ${t}, then explain ${t} out loud in your own words.`, why: 'Most "hard" topics are easy topics built on a gap.', principle: 'If you cannot explain it simply, find the gap underneath it.' },
        'I understand but forget': { action: `Make 5 recall questions on ${t}, answer them tomorrow without notes, then again in 3 days.`, why: 'Forgetting is fixed by spaced recall, not more reading.', principle: "Test yourself; don't reread." },
        'I run out of time on questions': { action: `Do 10 timed ${t} questions. Before calculating, look at the options and eliminate at least one.`, why: 'Speed comes from shortcuts and elimination, not rushing.', principle: 'Never skip the reasoning. Make the reasoning faster.' },
        'I make careless mistakes': { action: `For the next 10 ${t} questions, write one line of working and check units and signs before choosing.`, why: 'Careless mistakes come from skipped checks.', principle: 'Check, eliminate, then commit.' },
      };
      return map[a.kind] ?? map["I don't understand it"];
    },
  },
  {
    id: 'career',
    label: 'I need to make a big decision',
    icon: '🧭',
    who: 'greta',
    area: 'career',
    questions: [
      { id: 'decision', step: 'understand', prompt: 'What is the decision, and what are the options?', type: 'text' },
      { id: 'matters', step: 'clarify', prompt: 'What matters most right now?', type: 'choice', options: ['Learning and skill', 'Income now', 'Long-term growth', 'Stability'] },
      { id: 'reversible', step: 'evaluate', prompt: 'Can you reverse it if it goes wrong?', type: 'choice', options: ['Yes, easily', 'Partly', 'No'] },
      { id: 'worst', step: 'evaluate', prompt: "What's the worst realistic outcome?", type: 'text' },
    ],
    advise: (a) => {
      const matters = (a.matters || 'long-term growth').toLowerCase();
      if (a.reversible === 'Yes, easily')
        return { action: `Pick the option that best serves ${matters}. Commit to it for two weeks, then review.`, why: 'Reversible decisions should be made quickly. You learn more by trying than by thinking.', principle: 'Two-way doors: decide fast. One-way doors: decide carefully.' };
      return {
        action: `List pros, cons and the worst case for each option, ask one experienced person, then choose what best serves ${matters}.`,
        why: `This is hard to undo${a.worst ? `, and the downside ("${a.worst.trim()}") is real` : ''}, so it deserves a second opinion.`,
        principle: 'Two-way doors: decide fast. One-way doors: decide carefully.',
      };
    },
  },
  {
    id: 'emotional',
    label: "I'm emotional or under pressure",
    icon: '🌧️',
    who: 'ada',
    area: 'personal',
    questions: [
      { id: 'what', step: 'understand', prompt: 'What happened?', type: 'text' },
      { id: 'feeling', step: 'clarify', prompt: 'What are you feeling most?', type: 'choice', options: ['Angry', 'Anxious', 'Sad', 'Overwhelmed'] },
      { id: 'urgent', step: 'evaluate', prompt: 'Does this truly need a response in the next hour?', type: 'choice', options: ['Yes', 'No'] },
    ],
    advise: (a) => {
      if (a.feeling === 'Overwhelmed')
        return { action: 'Write down everything on your mind, circle the one thing that matters today, and do only that.', why: 'Overwhelm is too many open loops. Paper closes them.', principle: 'One thing at a time is still progress.', note: SAFETY };
      return {
        action: a.urgent === 'Yes' ? 'Take 10 minutes away, then write your reply and read it once as the other person before sending.' : 'Write what you want to say, but send nothing for at least an hour. Come back when calm.',
        why: a.feeling === 'Angry' ? 'Anger makes fast replies feel right and look wrong later.' : 'A calm mind sees more options.',
        principle: "Respond, don't react.",
        note: SAFETY,
      };
    },
  },
  {
    id: 'behind',
    label: "I've fallen behind",
    icon: '🏃',
    who: 'tunde',
    area: 'jamb',
    questions: [
      { id: 'howFar', step: 'understand', prompt: 'How far behind are you?', type: 'choice', options: ['One day', 'A few days', 'A week or more'] },
      { id: 'priority', step: 'clarify', prompt: 'What is the one thing that must not slip?', type: 'text' },
      { id: 'cause', step: 'evaluate', prompt: 'What caused it?', type: 'choice', options: ['I planned too much', 'Something unexpected', 'Low energy', 'I avoided it'] },
    ],
    advise: (a) => {
      const p = a.priority?.trim();
      const fix: Record<string, string> = {
        'I planned too much': 'Plan 20% less tomorrow than you think you can do.',
        'Something unexpected': 'Leave a 30-minute buffer in tomorrow for surprises.',
        'Low energy': 'Protect sleep tonight and do hard work in your best hours.',
        'I avoided it': 'Start tomorrow with the avoided task, before anything else.',
      };
      return {
        action: `${p ? `Protect "${p}" first. ` : ''}Today: clear your review queue and do one lesson. Nothing more.`,
        why: fix[a.cause] ?? 'Recovery is a skill: shrink the plan, restart the chain.',
        principle: a.howFar === 'A week or more' ? 'Restart small. Consistency first, volume later.' : 'Never miss twice.',
      };
    },
  },
  {
    id: 'other',
    label: 'Something else',
    icon: '💭',
    who: 'zara',
    area: 'personal',
    questions: [
      { id: 'what', step: 'understand', prompt: 'Describe the situation in one or two sentences.', type: 'text' },
      { id: 'outcome', step: 'clarify', prompt: 'What outcome matters most to you?', type: 'text' },
      { id: 'options', step: 'evaluate', prompt: 'What are your options, and the biggest risk of each?', type: 'text' },
    ],
    advise: (a) => ({
      action: `Choose the option that best moves you towards "${a.outcome?.trim() || 'your outcome'}" with the least risk you can't undo. Take its first step within 24 hours.`,
      why: 'Good decisions balance what you want against what you can afford to lose.',
      principle: 'Decide the next step, not the whole future.',
    }),
  },
];

/** All the free text you typed, used to look up similar moments in your ledger. */
export const answerText = (g: Guide, a: Answers) => g.questions.map((q) => a[q.id] ?? '').join(' ');
