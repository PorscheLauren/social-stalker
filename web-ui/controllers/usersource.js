'use strict';

const mongojs = require('mongojs');
let db = mongojs('mongodb://localhost:27017/social-stalker', ['usersources']);

exports.listSources = function(req, res, next) {
    db.usersources.find(function(err, sources) {
        if (err) {
            return next(err);
        }

        let map = new Map();
        sources.forEach(function(element) {
            map.set(element.name, element);
        });

        res.render('settings', {sources: map});
    });
};

exports.getSourceInfo = function(req, res, next) {
    let name = req.params.name;
    db.usersources.findOne({
        name: name,
    }, function(err, source) {
        if (err) {
            next(err);
        }

        res.render('partials/usersource/' + name, {
            source: source,
        });
    });
};

exports.updateSourceToken = function(req, res, next) {
    let setQuery = {};

    if (req.body.app_id) {
        setQuery.app_id = req.body.app_id;
    }

    if (req.body.app_secure_key) {
        setQuery.app_secure_key = req.body.app_secure_key;
    }

    if (req.body.user_token) {
        setQuery.user_token = req.body.user_token;
    }

    db.usersources.update({
        name: req.params.name,
    }, {
        $set: setQuery,
    }, function(err, value) {
        if (err) {
            return next(err);
        }

        res.sendStatus(200);
    });
};
