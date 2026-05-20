const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'data', 'crm.db'));
db.pragma('foreign_keys = ON');

const cols = [
  "ALTER TABLE leads ADD COLUMN latitude REAL",
  "ALTER TABLE leads ADD COLUMN longitude REAL",
  "ALTER TABLE leads ADD COLUMN placeId TEXT DEFAULT ''",
  "ALTER TABLE leads ADD COLUMN routeEligible INTEGER DEFAULT 1",
  "ALTER TABLE leads ADD COLUMN lastVisitedDate TEXT DEFAULT ''",
  "ALTER TABLE leads ADD COLUMN nextVisitDate TEXT DEFAULT ''",
  "ALTER TABLE leads ADD COLUMN inPersonVisitStatus TEXT DEFAULT 'Not visited'",
  "ALTER TABLE leads ADD COLUMN visitNotes TEXT DEFAULT ''",
  "ALTER TABLE leads ADD COLUMN doNotVisit INTEGER DEFAULT 0",
  "ALTER TABLE leads ADD COLUMN preferredVisitTime TEXT DEFAULT ''",
  "ALTER TABLE leads ADD COLUMN businessHours TEXT DEFAULT ''",
  "ALTER TABLE leads ADD COLUMN routeScore REAL",
  "ALTER TABLE leads ADD COLUMN routeNotes TEXT DEFAULT ''",
];

for (const sql of cols) {
  try {
    db.exec(sql);
    console.log('OK:', sql.slice(0, 60));
  } catch (e) {
    console.log('SKIP:', e.message.slice(0, 60));
  }
}

db.close();
console.log('Migration done.');
