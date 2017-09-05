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

        res.render('settings', {
            sources: map,
        });
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

    if (req.body.appId) {
        setQuery.appId = req.body.appId;
    }

    if (req.body.appSecureKey) {
        setQuery.appSecureKey = req.body.appSecureKey;
    }

    if (req.body.userToken) {
        setQuery.userToken = req.body.userToken;
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
