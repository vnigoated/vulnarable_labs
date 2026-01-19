const express = require('express');
const app = express();
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// Middleware
app.use(express.static('public'));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layout'); // Defaults to views/layout.ejs
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to restrict access to specific referrer
app.use((req, res, next) => {
    const allowedReferer = 'https://vois-cybercoach.vercel.app/';
    const referer = req.get('Referer');
    const host = req.get('host');

    // Allow usage if:
    // 1. It's coming from the allowed Vercel app (flexible check)
    // 2. It's running locally (localhost) for development
    if ((referer && referer.includes('vois-cybercoach.vercel.app')) || (host && host.includes('localhost'))) {
        next();
    } else {
        res.status(403).send('Access Denied: This lab can only be accessed via https://vois-cybercoach.vercel.app/');
    }
});

// Routes
const indexRouter = require('./routes/index');
const labsRouter = require('./routes/labs');

app.use('/', indexRouter);
app.use('/lab', labsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CyberCoach Server running on http://localhost:${PORT}`);
});
