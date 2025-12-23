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

// Routes
const indexRouter = require('./routes/index');
const labsRouter = require('./routes/labs');

app.use('/', indexRouter);
app.use('/lab', labsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`SOVAP CyberLabs Server running on http://localhost:${PORT}`);
});
