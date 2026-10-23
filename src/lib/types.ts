export type ISODate = string; // YYYY-MM-DD
export type ClockTime = string; // HH:MM

export type Area = 'education' | 'money' | 'career' | 'personal';

export const AREA_LABELS: Record<Area, string> = {
  education: 'Education',
  money: 'Money',
  career: 'Career',
  personal: 'Personal',
};

/** How strictly streaks and recovery behave. */
export type DisciplineMode = 'firm' | 'strict' | 'adaptive';

/** How the decision coach guides you. */
export type CoachMode = 'suggest' | 'ask' | 'both';

export interface Settings {
  name: string;
  disciplineMode: DisciplineMode;
  coachMode: CoachMode;
  currency: string;
  dayStart: ClockTime;
  dayEnd: ClockTime;
  /** Typical monthly spend on essentials, used to check whether savings targets are realistic. */
  monthlyEssentials: number;
  remindersEnabled: boolean;
  onboarded: boolean;
}

export interface Habit {
  id: string;
  title: string;
  area: Area;
  /** The realistic minimum version for hard days. */
  minimum: string;
  time: ClockTime;
  minutes: number;
  createdAt: ISODate;
  archived: boolean;
}

export type HabitStatus = 'done' | 'minimum' | 'missed';

export interface HabitLog {
  habitId: string;
  date: ISODate;
  status: HabitStatus;
  reason?: string;
}

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
}

export interface Goal {
  id: string;
  title: string;
  area: Area;
  why: string;
  deadline?: ISODate;
  milestones: Milestone[];
  /** Habits that move this goal forward every day. */
  habitIds: string[];
  createdAt: ISODate;
}

/** 1 = must do, 2 = should do, 3 = could do. */
export type Priority = 1 | 2 | 3;

export interface Task {
  id: string;
  title: string;
  date: ISODate;
  /** Fixed start time; flexible tasks are placed by the planner. */
  start?: ClockTime;
  minutes: number;
  priority: Priority;
  goalId?: string;
  done: boolean;
  /** One of today's three most important outcomes. */
  top: boolean;
  /** How many times this task has been rolled forward. */
  rolledOver: number;
  source?: 'coach' | 'review' | 'manual';
}

export interface SavingsGoal {
  id: string;
  title: string;
  target: number;
  saved: number;
  deadline: ISODate;
  createdAt: ISODate;
}

export type TxKind = 'income' | 'essential' | 'discretionary' | 'saving';

export const TX_LABELS: Record<TxKind, string> = {
  income: 'Income',
  essential: 'Essential',
  discretionary: 'Discretionary',
  saving: 'Saving',
};

export interface Transaction {
  id: string;
  date: ISODate;
  amount: number;
  kind: TxKind;
  note: string;
  savingsGoalId?: string;
}

export interface DayReview {
  date: ISODate;
  wins: string;
  missed: string;
  lessons: string;
  energy: 1 | 2 | 3 | 4 | 5;
}

export interface WeeklyReview {
  weekStart: ISODate;
  bottleneck: string;
  adjustment: string;
}

export interface Distraction {
  id: string;
  date: ISODate;
  time: ClockTime;
  note: string;
}

export interface DecisionRecord {
  id: string;
  date: ISODate;
  situation: string;
  answers: Record<string, string>;
  action: string;
  taskId?: string;
  /** Filled in later during review: did it work? */
  outcome?: string;
}

export interface AppState {
  version: 1;
  settings: Settings;
  habits: Habit[];
  habitLogs: HabitLog[];
  goals: Goal[];
  tasks: Task[];
  savingsGoals: SavingsGoal[];
  transactions: Transaction[];
  reviews: DayReview[];
  weeklyReviews: WeeklyReview[];
  distractions: Distraction[];
  decisions: DecisionRecord[];
  /** Days switched into the reduced recovery plan. */
  reducedDays: ISODate[];
}
