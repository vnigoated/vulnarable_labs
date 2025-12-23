const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'labs.db');

// Create DB instance
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT, -- Plaintext for educational purposes or vulnerable labs
            role TEXT DEFAULT 'user',
            bio TEXT
        )`);

        // Secrets Table for SQLi
        db.run(`CREATE TABLE IF NOT EXISTS secrets (
            id INTEGER PRIMARY KEY,
            secret_code TEXT
        )`);

        // Products for Logic Flaw
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            price INTEGER
        )`);

        // Seed Data
        db.get("SELECT count(*) as count FROM users", (err, row) => {
            if (row.count === 0) {
                console.log("Seeding Database...");
                db.run(`INSERT INTO users (username, password, role, bio) VALUES ('admin', 'supersecret123', 'admin', 'The Boss')`);
                db.run(`INSERT INTO users (username, password, role, bio) VALUES ('guest', 'guest', 'user', 'Just a visitor')`);
                db.run(`INSERT INTO users (username, password, role, bio) VALUES ('alice', 'alice123', 'user', 'Alice Wonderland')`);
                
                db.run(`INSERT INTO secrets (secret_code) VALUES ('SOVAP_FLAG_SQLI_MASTER')`);
                
                db.run(`INSERT INTO products (name, price) VALUES ('CyberDeck v1', 1000)`);
                db.run(`INSERT INTO products (name, price) VALUES ('Neural Link', 5000)`);
                db.run(`INSERT INTO products (name, price) VALUES ('Caffeine pill', 10)`);
            }
        });
    });
}

module.exports = db;
