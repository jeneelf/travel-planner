# Travel planner MVP

A complete local planning frontend for the existing Expo/React Native + TypeScript project. It follows the Planiit PDF's home cards, destination dashboard, traveler row, accommodation cards, itinerary layout, orange-outlined forms and turquoise actions. It extends that design with practical local planning tools. This is not an App Store release or a connected social platform.

## Install once

1. Download the ZIP into Downloads. Stop Expo with Control+C.
2. Open the VS Code terminal in your existing travel-planner project.
3. Extract the ZIP to a temporary directory and run its install.sh with bash (the chat includes the command).
4. Run `npx tsc --noEmit`.
5. Run `npx expo start --clear`. Press w for web or open the QR code in Expo Go.

The app uses packages your current Expo project already has: React, React Native, Expo Router, react-native-safe-area-context and @react-native-async-storage/async-storage. No package.json or dependency versions are changed. If AsyncStorage is missing, install it with `npx expo install @react-native-async-storage/async-storage`.

The installer backs up your whole src directory OUTSIDE the project. It replaces src/app/index.tsx and src/app/_layout.tsx, installs src/features/planner, and retires src/features/trips outside the project. This removes the starter Home/Explore shell in favor of the planner navigation. Other existing routes and components remain in place. Do not manually paste the downloaded src inside another src.

If you add the files manually, also move the old src/features/trips folder outside the project so the compiler does not keep checking stale prototype code. Keep old backup folders outside the project too.

## What works

- My Trips: search, photo cards, creation, editing, deletion with confirmation.
- Trip form: name, country/city suggestions with manual entry, calendar dates, description, travel pace, traveler names, currency and budget.
- Dashboard: destination cover, traveler initials, accommodation cards, day navigation and four planning tabs.
- Itinerary: add/edit/delete activities, choose AM/PM time, duration and estimated cost, move an activity's date, mark done, derived end time and overlap warnings across midnight. Adjacent activities do not count as overlapping. Activities without a duration cannot be checked for overlaps.
- Bookings: manual accommodation/transport/activity records, reference, dates, address, provider link, estimated cost and cancellation deadline display.
- Budget: estimates versus actual spending; payer and equal expense splits; balances with rounding handled in cents. No real payments.
- Checklist: add, complete, reopen and remove preparation tasks.
- Discover: three clearly labeled starter itineraries, preview, choose start date, create your own editable copy, save to collections.
- Collections: named folders, search, create/edit/delete saved ideas and open external links. No trip is required to save an idea.
- Profile: local display name/bio and your itinerary list.
- Backup: select/copy full JSON or use the system share action where supported; validate pasted JSON and confirm before restoring.
- Persistence: all these records save locally; write failures report an error without replacing the current state.

## Existing trips and backups

On first launch, the new app checks travel-planner.mvp.v2. If absent, it imports travel-planner.trips.v1, including activity durations, and adds defaults for the new fields. It validates before saving. The v1 key is left untouched. Once v2 exists, the app uses v2 and does not repeatedly re-import v1.

The same browser, hostname and port must be used to see the same local storage. Browser and iPhone data are separate. Clearing site data or uninstalling can remove local data. Export a backup from Profile before major changes. A source-code backup is NOT a trip-data backup.

Rolling back code to the previous app shows the old v1 snapshot, not edits made in v2. Export current v2 data before any rollback. There is no automatic downgrade migration.

## Honest limitations

- No login, cloud sync, invitation delivery, shared editing, chat, followers, public publishing or community feed. Traveler names are planning labels; profiles are local.
- Location suggestions are a small sample. Manual entry is allowed; there is no live geocoding.
- Photos are remote illustrative Unsplash images, not verified images of the actual booking/destination. The app still works with a colored cover when a photo fails. Templates are sample plans, not verified travel recommendations; confirm opening hours, transport and availability yourself.
- Trips use destination-local clock values. There is no IANA timezone, automatic timezone conversion or daylight-saving calculation. Midnight-crossing activities are listed on their start day.
- The pace is recorded but does not automatically generate or validate an itinerary. Overlap checks do not assess transport time or opening hours.
- Bookings are manually entered. There is no email import, direct booking or notification scheduling. Cancellation dates are displayed only.
- One currency per trip; no currency conversion. Record each estimate once (in an activity OR booking) to avoid double counting. Actual expenses are separate.
- Equal splits only. Names must be consistent. No payment processor, payment requests or settlement transfer.
- Data is stored unencrypted in AsyncStorage. Do not put payment-card details or passport scans in it.
- This is an Expo app-source update, not a standalone repository with a new package.json/lockfile.

## Verification and local checklist

Checks performed during preparation: 13 TS/TSX files parsed and transformed with Babel; relative imports checked; component smoke renders using mocked React Native; root create/task/activity/delete callbacks exercised; pure data tests; migration and write-failure/concurrency checks using mocked AsyncStorage. Installer tested for copying files and keeping backups outside the project.

These checks are NOT a full TypeScript type check, real Expo build or iPhone/browser end-to-end test. Run `npx tsc --noEmit` locally. A full runtime test still needs your existing project dependencies.

Manual checklist:

1. Open an existing trip and confirm its activities survived migration.
2. Create a trip with name, city, dates and budget. Edit it; cancel a deletion.
3. Add a 90-minute activity at 11:30 PM. Verify the next-day end label. Move it to another valid day and navigate to that day.
4. Try overlapping activities and a trip-date change that excludes an existing activity.
5. Add accommodation, another booking and an external provider URL.
6. Record an expense, edit it, inspect balances; try splitting 10.00 between three names.
7. Add and complete a preparation task.
8. Save an idea into a new collection. Create a trip from a template.
9. Edit the profile, export backup text, paste it and test cancelling restoration before confirming a restore.
10. Reload; repeat core flows on iPhone. Delete only a disposable test trip.

Optional pure tests, using a Node version with built-in TypeScript stripping:

`node --experimental-strip-types planner-guide/tests/logic.test.mjs`
