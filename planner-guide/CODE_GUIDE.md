# Code guide

Start in src/features/planner/PlannerApp.tsx. It chooses the active tab and selected trip, owns modal visibility, and connects UI actions to saving. This is ordinary React state: there is no Redux, server framework, global event bus or custom query layer.

## Files

| File | Responsibility |
| --- | --- |
| src/app/index.tsx | One-line home route export |
| src/app/_layout.tsx | Basic Expo Stack and safe-area provider |
| PlannerApp.tsx | Home, Discover, Saved and Profile; navigation and modal coordination |
| Dashboard.tsx | Trip banner, travelers, accommodations, daily activities, bookings, budget and checklist |
| Forms.tsx | Trip, activity, booking, expense, saved idea and profile forms |
| ui.tsx | Shared buttons, fields, cards, photos, form container and styles |
| model.ts | TypeScript data types |
| logic.ts | Date/time helpers, overlap checks, cost/split calculations and data validation |
| storage.ts | Loading, migration and save-before-display persistence |
| sampleData.ts | Sample locations and itinerary templates |
| components/DateField.tsx | Calendar picker, minimum/maximum date limits |
| components/TimeField.tsx | Hour, minute and AM/PM selection |
| pickerStyles.ts | Small style mapping for the existing picker components |

## How to read a feature

For activity creation: find ActivityForm in Forms.tsx. Its useState calls hold field values. submit checks them and calls onSave. PlannerApp receives the activity and uses changeTrip to replace or append the activity in the matching trip. storage.ts validates and saves the updated data, then updates React state. Dashboard receives the updated trip and filters its activities by the selected day.

For deletion: Dashboard asks PlannerApp to show a confirmation. Confirm runs an immutable filter operation through storage.ts. Cancel makes no data change.

For an expense: ExpenseForm records amount, paidBy and splitWith. logic.ts computes equal shares in cents so a 10.00 split among three people sums back to 10.00. Budget totals do not add estimated costs to actual spending.

## Simple patterns used

- useState for input values, tabs and modals.
- Props for passing data and callbacks between components.
- Array map to update a record; filter to remove one; spread to append one.
- Async/await and try/catch for saves.
- A ref lock prevents concurrent writes. The latest-data ref avoids saving an old trip list.
- TypeScript types document the data, while runtime validation checks storage/imported JSON. TypeScript alone cannot validate imported files.

## What to refactor later

Keep working behavior first. Extract a form or screen when you find it hard to navigate, not just because its file has a certain number of lines. Forms.tsx can become individual form files later. My Trips, Discover and Profile can become separate route screens when you want URL/deep-link navigation. Move truly shared UI to src/components only when another feature needs it.

## Design correspondence

My Trips keeps the greeting and image cards. The trip dashboard keeps the destination banner, travelers, accommodation cards and daily itinerary. The creation form keeps the orange outlines and turquoise save action. Profile keeps the personal header and itinerary list. Saved replaces the mockup's chat destination because there is no messaging backend; the app labels the unavailable online features rather than pretending they work.

## Next steps

1. Run this complete version locally and resolve any project-specific compiler issues.
2. Walk through one realistic trip on web and iPhone.
3. Commit the working source in Git and keep a private data backup.
4. Improve UI details against higher-resolution design assets and user feedback.
5. Decide the first release scope before adding accounts, database access rules and cloud sync.
6. Design the owner approval/permissions model before implementing invitations and collaboration.

Prepared as a complete local MVP source package. Installation and real-device verification are separate milestones; do not call the whole long-term product 75 percent complete based on frontend screens alone.
