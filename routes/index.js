const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Dashboard',
        labs: [
            { id: 'access-control', name: 'Broken Access Control', desc: 'Insecure Direct Object References (IDOR)', diff: 'Medium' },
            { id: 'crypto', name: 'Cryptographic Failures', desc: 'Weak Encryption & Encoding', diff: 'Medium/Hard' },
            { id: 'sqli', name: 'SQL Injection', desc: 'Bypass Auth & Dump Data', diff: 'Medium' },
            { id: 'insecure-design', name: 'Insecure Design', desc: 'Business Logic Flaws', diff: 'Low/Medium' },
            { id: 'misconfig', name: 'Security Misconfiguration', desc: 'Leaked Files & Verbose Errors', diff: 'Medium' },
            { id: 'vuln-components', name: 'Vulnerable Components', desc: 'Remote Code Execution (RCE)', diff: 'Hard' }
        ]
    });
});

module.exports = router;
