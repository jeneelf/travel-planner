// The data shapes used by the whole app. Optional legacy fields are normalized on load.
export type Activity = {
  id: string;
  date: string;
  title: string;
  time: string;
  durationMinutes?: number;
  location: string;
  notes: string;
  cost: number;
  done: boolean;
};
export type Booking = {
  id: string;
  kind: string;
  title: string;
  date: string;
  endDate: string;
  address: string;
  reference: string;
  url: string;
  cancellationDate: string;
  cost: number;
  notes: string;
};
export type Expense = {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  splitWith: string[];
};
export type Task = {
  id: string;
  title: string;
  done: boolean;
};
export type Trip = {
  id: string;
  name: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  about: string;
  pace: string;
  currency: string;
  budget: number;
  coverPhoto?: string;
  travelers: string[];
  activities: Activity[];
  bookings: Booking[];
  expenses: Expense[];
  tasks: Task[];
};
export type Idea = {
  id: string;
  collection: string;
  title: string;
  location: string;
  url: string;
  notes: string;
};
export type Profile = {
  photo?: string;
  name: string;
  bio: string;
};
export type Data = {
  version: 2;
  trips: Trip[];
  ideas: Idea[];
  profile: Profile;
};
export type Template = {
  id: string;
  title: string;
  country: string;
  city: string;
  description: string;
  days: number;
  items: {
    day: number;
    title: string;
    time: string;
    duration: number;
    location: string;
  }[];
};
export type Editor = {
  kind: 'trip';
  trip?: Trip;
} | {
  kind: 'activity';
  tripId: string;
  day: string;
  activity?: Activity;
} | {
  kind: 'booking';
  tripId: string;
  booking?: Booking;
} | {
  kind: 'expense';
  tripId: string;
  expense?: Expense;
} | {
  kind: 'idea';
  idea?: Idea;
} | {
  kind: 'travelers';
  tripId: string;
} | {
  kind: 'pdf';
  tripId: string;
} | {
  kind: 'profile';
};
