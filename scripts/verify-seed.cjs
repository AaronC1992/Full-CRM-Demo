const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'data', 'crm.db'));

const leads = db.prepare('SELECT id, businessName, leadStatus, priority, routeEligible FROM leads ORDER BY id').all();
console.log('Total leads:', leads.length);
leads.forEach(l => console.log(l.id, l.businessName, '|', l.leadStatus, '|', l.priority, '| route:', l.routeEligible));

const tasks = db.prepare('SELECT title, dueDate, priority FROM tasks WHERE leadId IS NOT NULL').all();
console.log('\nTasks linked to leads:');
tasks.forEach(t => console.log(' -', t.title, '| due:', t.dueDate, '| priority:', t.priority));

const activities = db.prepare('SELECT leadId, type, description FROM activities').all();
console.log('\nActivities:', activities.length);
activities.forEach(a => console.log(' -', a.leadId, a.type, '|', a.description.slice(0, 70)));

db.close();
