'use strict';

const MongoStorage = require('social-stalker-storage').MongoStorage;

const DATABASE_ADDRESS = 'localhost:27017';
const DATABASE_NAME = 'social-stalker';
const COLLECTION_USERSOURCES = 'usersources';

const database = new MongoStorage(DATABASE_ADDRESS, DATABASE_NAME);

exports.listSources = function(req, res, next) {
    database.find(COLLECTION_USERSOURCES)
        .then((sources) => {
            let map = new Map();
            sources.forEach(function(element) {
                map.set(element.name, element);
            });

            res.render('settings', {
                sources: map,
            });
        })
        .catch((err) => next(err));
};

exports.getSourceInfo = function(req, res, next) {
    let name = req.params.name;
    database.find(COLLECTION_USERSOURCES, {name: name}, {single: true})
        .then((source) => {
            res.render('partials/usersource/' + name, {
                source: source,
            });
        })
        .catch((err) => next(err));
};

exports.updateSourceToken = function(req, res, next) {
    let setQuery = {};

    if (req.body.appId) {
        setQuery.appId = req.body.appId;
    }

    if (req.body.clientId) {
        setQuery.clientId = req.body.clientId;
    }

    if (req.body.cookie) {
        setQuery.cookie = req.body.cookie;
    }

    if (req.body.appSecureKey) {
        setQuery.appSecureKey = req.body.appSecureKey;
    }

    if (req.body.userId) {
        setQuery.userId = req.body.userId;
    }

    if (req.body.userToken) {
        setQuery.userToken = req.body.userToken;
    }

    let query = {name: req.params.name};
    let update = {$set: setQuery};

    database.update(COLLECTION_USERSOURCES, query, update)
        .then(() => res.sendStatus(200))
        .catch((err) => next(err));
};
