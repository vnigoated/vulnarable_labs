const express = require('express');
const router = express.Router();
const db = require('../database');
const fs = require('fs');
const path = require('path');

// Helper to get manual content
const getManual = (labId) => {
    try {
        return fs.readFileSync(path.join(__dirname, '../manuals', `${labId}.html`), 'utf8');
    } catch (e) {
        return "<p>Manual data corrupted. Contact Admin.</p>";
    }
};

// ==========================================
// 1. Broken Access Control (IDOR)
// ==========================================
router.get('/access-control', (req, res) => {
    // Vulnerability: Cookie-based IDOR with Base64 JSON
    // Default to guest user (ID 101) if no cookie
    let userCookie = req.cookies.profile_view_token;
    let userData = { user_id: 101, role: 'user' };

    if (!userCookie) {
        // Create default cookie
        const payload = JSON.stringify(userData);
        const encoded = Buffer.from(payload).toString('base64');
        res.cookie('profile_view_token', encoded);
    } else {
        try {
            const decoded = Buffer.from(userCookie, 'base64').toString('utf8');
            userData = JSON.parse(decoded);
        } catch (e) {
            // Invalid cookie
        }
    }

    // Fetch profile based on cookie data (IDOR here: we trust the cookie directly)
    // Simulated DB lookup
    let profiles = {
        101: { name: "Guest User", role: "Basic", bio: "Just looking around.", secret: "Nothing to see here." },
        102: { name: "SOVAP ADMIN", role: "SuperAdmin", bio: "The Owner.", secret: "FLAG: SOVAP_IDOR_MASTER_KEY" },
        103: { name: "Employee 42", role: "User", bio: "Working hard.", secret: "My lunch is in the fridge." }
    };

    const profile = profiles[userData.user_id] || { name: "Unknown", bio: "User not found" };
    const manual = getManual('access-control');

    res.render('access-control', {
        title: 'Broken Access Control',
        profile: profile,
        user_id: userData.user_id,
        manual: manual
    });
});


// ==========================================
// 2. Cryptographic Failures (Weak Crypto)
// ==========================================
router.get('/crypto', (req, res) => {
    // Custom Weak Encryption (XOR)
    const xorEncrypt = (text, key) => {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ key);
        }
        return Buffer.from(result).toString('base64');
    };

    // The key is hardcoded/weak (Key: 42)
    const SECRET_KEY = 42;

    const notes = [
        { id: 1, owner: 'guest', content: xorEncrypt("Grocery list: Milk, Eggs, hack_the_planet", SECRET_KEY) },
        { id: 2, owner: 'admin', content: xorEncrypt("FLAG: SOVAP_CRYPTO_BREAK_SUCCESS", SECRET_KEY) }
    ];

    const manual = getManual('crypto');

    res.render('crypto', {
        title: 'Cryptographic Failures',
        notes: notes,
        manual: manual
    });
});


// ==========================================
// 3. SQL Injection (SQLi)
// ==========================================
router.get('/sqli', (req, res) => {
    const manual = getManual('sqli');
    res.render('sqli', {
        title: 'SQL Injection',
        user: null,
        error: null,
        manual: manual
    });
});

router.post('/sqli/login', (req, res) => {
    const { username, password } = req.body;

    // VULNERABLE: Direct concatenation
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    console.log("SQL Executed:", query); // Log for learning

    db.get(query, (err, row) => {
        const manual = getManual('sqli');
        if (err) {
            // Verbose error helps with Union-based attacks (sometimes)
            // But here we just want Login Bypass
            return res.render('sqli', { title: 'SQL Injection', user: null, error: "DB Error: " + err.message, manual: manual });
        }

        if (row) {
            // Successful login
            res.render('sqli', { title: 'SQL Injection', user: row, error: null, manual: manual });
        } else {
            res.render('sqli', { title: 'SQL Injection', user: null, error: "Invalid Credentials", manual: manual });
        }
    });
});

// ==========================================
// 4. Insecure Design (Business Logic Flaw)
// ==========================================
router.get('/insecure-design', (req, res) => {
    // Reset session-like state if requested
    if (req.query.reset) {
        res.clearCookie('cart_total');
        res.clearCookie('applied_coupons');
        return res.redirect('/lab/insecure-design');
    }

    const manual = getManual('insecure-design');

    // Initial Price
    const BASE_PRICE = 5000;

    // Get state from cookies (stateless server for simplicity)
    let appliedCoupons = req.cookies.applied_coupons ? JSON.parse(req.cookies.applied_coupons) : [];

    let currentPrice = BASE_PRICE;
    let messages = [];

    // Calculate price based on coupons (VULNERABLE LOGIC)
    // Vulnerability: No check for duplicate coupons or max discount capping
    // Also "SAVE10" is 10% of CURRENT price or BASE price? 
    // Let's make it 10% of BASE price, so 10 coupons = free.

    appliedCoupons.forEach(code => {
        if (code === 'SAVE10') {
            currentPrice -= (BASE_PRICE * 0.10); // $500 off each time
        } else if (code === 'MEGA50') {
            currentPrice -= (BASE_PRICE * 0.50);
        }
    });

    if (currentPrice < 0) currentPrice = 0;

    res.render('insecure-design', {
        title: 'Insecure Design',
        price: currentPrice,
        basePrice: BASE_PRICE,
        coupons: appliedCoupons,
        messages: messages,
        manual: manual
    });
});

router.post('/insecure-design/apply', (req, res) => {
    let { code } = req.body;
    let appliedCoupons = req.cookies.applied_coupons ? JSON.parse(req.cookies.applied_coupons) : [];

    // Logic Flaw: The UI prevents adding same code twice, but backend doesn't check existence if array is manipulated via Repeater
    // Or simpler: The backend just pushes whatever comes in.

    if (code) {
        // If code is "SAVE10", push it.
        // Vulnerability: API allows adding invalid codes or multiple valid ones if user manually sends array or repeats request
        appliedCoupons.push(code);
    }

    res.cookie('applied_coupons', JSON.stringify(appliedCoupons));
    res.redirect('/lab/insecure-design');
});


// ==========================================
// 5. Security Misconfiguration (Verbose Error)
// ==========================================
router.get('/misconfig', (req, res) => {
    const manual = getManual('misconfig');
    // If user clicks "Check Status", simulate error
    if (req.query.action === 'status') {
        const error = new Error("Database Connection Failed");
        const stack = error.stack;
        // LEAK: Dumping Environment variables in error context (simulated)
        const debugInfo = JSON.stringify(process.env, null, 2);

        return res.render('misconfig', {
            title: 'Security Misconfiguration',
            error: stack,
            debug: debugInfo,
            manual: manual
        });
    }

    res.render('misconfig', {
        title: 'Security Misconfiguration',
        error: null,
        debug: null,
        manual: manual
    });
});

// ==========================================
// 6. Vulnerable Components (RCE via Eval)
// ==========================================
router.get('/vuln-components', (req, res) => {
    const manual = getManual('vuln-components');
    res.render('vuln-components', {
        title: 'Vulnerable Components',
        result: null,
        manual: manual
    });
});

router.post('/vuln-components', (req, res) => {
    const manual = getManual('vuln-components');
    const input = req.body.expression;

    let result = '';

    try {
        // VULNERABILITY: eval() on user input
        // "Secure" Math evaluator... not.
        // Input: 2+2 => 4
        // Input: require('child_process').execSync('whoami').toString() => RCE
        result = eval(input);
    } catch (e) {
        result = "Error: " + e.message;
    }

    res.render('vuln-components', {
        title: 'Vulnerable Components',
        result: result,
        manual: manual
    });
});

module.exports = router;



