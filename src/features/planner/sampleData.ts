import type { Template } from './model';
export const locations: Record<string, string[]> = {
  'United Arab Emirates': ['Abu Dhabi', 'Dubai', 'Sharjah'],
  Italy: ['Milan', 'Rome', 'Florence', 'Venice'],
  France: ['Paris', 'Nice', 'Lyon'],
  Jamaica: ['Kingston', 'Montego Bay', 'Ocho Rios'],
  'United Kingdom': ['London', 'Edinburgh', 'Manchester'],
  'United States': ['Atlanta', 'Boston', 'New York', 'Los Angeles']
};
// These are sample plans, not verified recommendations or live community posts.
export const templates: Template[] = [{
  id: 'milan',
  title: 'A little time in Milan',
  city: 'Milan',
  country: 'Italy',
  days: 3,
  description: 'A gentle three-day starting point for architecture, wandering and slow meals. Customize every stop.',
  items: [{
    day: 0,
    time: '10:00',
    duration: 90,
    title: 'Explore the Duomo area',
    location: 'Piazza del Duomo'
  }, {
    day: 0,
    time: '13:00',
    duration: 60,
    title: 'Lunch and a café break',
    location: 'City center'
  }, {
    day: 1,
    time: '10:30',
    duration: 120,
    title: 'Discover Brera',
    location: 'Brera'
  }, {
    day: 1,
    time: '17:00',
    duration: 90,
    title: 'Canalside walk',
    location: 'Navigli'
  }, {
    day: 2,
    time: '10:00',
    duration: 120,
    title: 'Castle and park morning',
    location: 'Sforza Castle area'
  }]
}, {
  id: 'abudhabi',
  title: 'An Abu Dhabi weekend',
  city: 'Abu Dhabi',
  country: 'United Arab Emirates',
  days: 2,
  description: 'Art, a waterfront walk and time to slow down. A sample to adapt to your interests.',
  items: [{
    day: 0,
    time: '10:00',
    duration: 120,
    title: 'Museum morning',
    location: 'Saadiyat Island'
  }, {
    day: 0,
    time: '17:00',
    duration: 60,
    title: 'Sunset walk',
    location: 'Corniche'
  }, {
    day: 1,
    time: '10:00',
    duration: 90,
    title: 'Visit the Grand Mosque',
    location: 'Sheikh Zayed Grand Mosque'
  }, {
    day: 1,
    time: '14:00',
    duration: 90,
    title: 'Lunch and free time',
    location: 'Choose a neighborhood'
  }]
}, {
  id: 'paris',
  title: 'Paris at your own pace',
  city: 'Paris',
  country: 'France',
  days: 3,
  description: 'A relaxed outline with room for discoveries. Verify all visits before you travel.',
  items: [{
    day: 0,
    time: '10:00',
    duration: 90,
    title: 'A riverside introduction',
    location: 'Seine'
  }, {
    day: 1,
    time: '10:00',
    duration: 180,
    title: 'Choose a museum',
    location: 'Central Paris'
  }, {
    day: 2,
    time: '11:00',
    duration: 120,
    title: 'Explore Montmartre',
    location: 'Montmartre'
  }]
}];
