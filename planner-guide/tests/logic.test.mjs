// Run from the project root after installation:
// node --experimental-strip-types planner-guide/tests/logic.test.mjs
// Requires a Node version supporting built-in TypeScript stripping.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const logic = await import(pathToFileURL(resolve('src/features/planner/logic.ts')));
const { templates } = await import(pathToFileURL(resolve('src/features/planner/sampleData.ts')));
const trip=logic.makeTemplate(templates[0],'2027-02-01');
assert.equal(trip.endDate,'2027-02-03');
assert.equal(logic.formatTime12('00:00'),'12:00 AM');
assert.equal(logic.formatTime12('12:00'),'12:00 PM');
assert.equal(logic.validDate('2027-02-29'),false);
assert.equal(logic.validDate('2028-02-29'),true);
const a={...trip.activities[0],id:'a',date:'2027-02-01',time:'23:30',durationMinutes:90};
assert.equal(logic.timeRange(a),'11:30 PM–1:00 AM (+1 day)');
assert.equal(logic.overlaps(a,{...a,id:'b',date:'2027-02-02',time:'00:30',durationMinutes:30}),true);
assert.equal(logic.overlaps(a,{...a,id:'b',date:'2027-02-02',time:'01:00',durationMinutes:30}),false);
assert.throws(()=>logic.checkTrip({...trip,endDate:'2027-02-01'}),/Activities/);
assert.throws(()=>logic.amount('-1'));
assert.throws(()=>logic.amount('1.234'));
assert.equal(logic.amount('12.50'),12.5);
const legacy={id:'old',name:'Old trip',city:'Milan',country:'Italy',startDate:'2027-02-01',endDate:'2027-02-02',activities:[{id:'x',date:'2027-02-01',time:'14:30',title:'Coffee',durationMinutes:45,location:'Cafe',notes:'Keep me'}]};
const migrated=logic.readTrips([legacy])[0];
assert.equal(migrated.activities[0].durationMinutes,45);
assert.equal(migrated.activities[0].notes,'Keep me');
assert.equal(migrated.activities[0].cost,0);
const expense={id:'e',title:'Lunch',amount:10,paidBy:'A',splitWith:['A','B','C']};
const balances=logic.balances({...trip,expenses:[expense]});
assert.equal(balances.reduce((n,x)=>n+Math.round(x.amount*100),0),0);
const data={...logic.emptyData(),trips:[trip]};
assert.equal(logic.readData(JSON.stringify(data)).trips.length,1);
assert.throws(()=>logic.readData(JSON.stringify({...data,trips:[trip,trip]})),/Duplicate/);
assert.throws(()=>logic.readData(JSON.stringify({version:2,profile:{name:'Test',bio:''}})),/lists/);
console.log('PASS: date/time, overlaps, date protection, money, migration, equal splits and backup validation.');
