const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const hbs = require('hbs');

const index = require('./routes/index');
const settings = require('./routes/settings');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));
hbs.registerHelper('navActive', function(activePage) {
    if (activePage === this.page) {
        return 'active';
    }
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts', express.static(
    path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'js')));
app.use('/stylesheets', express.static(
    path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css')));
app.use('/scripts', express.static(
    path.join(__dirname, 'node_modules', 'jquery', 'dist')));
app.use('/scripts', express.static(
    path.join(__dirname, 'node_modules', 'popper.js', 'dist', 'umd')));
app.use('/stylesheets', express.static(
    path.join(__dirname, 'node_modules', 'chartist', 'dist')));
app.use('/scripts', express.static(
    path.join(__dirname, 'node_modules', 'chartist', 'dist')));
app.use('/stylesheets', express.static(
    path.join(__dirname, 'node_modules', 'chartist-plugin-tooltips', 'dist')));
app.use('/scripts', express.static(
    path.join(__dirname, 'node_modules', 'chartist-plugin-tooltips', 'dist')));
app.use('/scripts', express.static(
    path.join(__dirname, 'node_modules', 'moment')));
app.use('/stylesheets', express.static(
    path.join(__dirname, 'node_modules', 'open-iconic', 'font', 'css')));
app.use('/fonts', express.static(
    path.join(__dirname, 'node_modules', 'open-iconic', 'font', 'fonts')));

app.use('/', index);
app.use('/index', index);
app.use('/settings', settings);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
