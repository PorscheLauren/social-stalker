'use strict';

const MongoStorage = require('social-stalker-storage').MongoStorage;
const ObjectID = require('social-stalker-storage').MongoStorage.ObjectID;

const DATABASE_ADDRESS = 'localhost:27017';
const DATABASE_NAME = 'social-stalker';
const COLLECTION_USERS = 'users';

const database = new MongoStorage(DATABASE_ADDRESS, DATABASE_NAME);

database.createIndex(COLLECTION_USERS, {
    first_name: 'text',
    last_name: 'text',
});

exports.listUsers = function(req, res, next) {
    let query = {};

    if (req.query.name) {
        let nameRegex = new RegExp( '.*' + req.query.name + '.*', 'i');
        query.$or = [{'first_name': nameRegex}, {'last_name': nameRegex}];
    }

    let sorting = {
        first_name: 1,
        last_name: 1,
    };

    database.find(COLLECTION_USERS, query, {sort: sorting})
        .then((users) => {
            let vkUsers = [];
            let fbUsers = [];
            let tgUsers = [];

            users.forEach(function(element) {
                switch (element.source) {
                    case 'vk':
                        vkUsers.push(element);
                        break;
                    case 'facebook':
                        fbUsers.push(element);
                        break;
                    case 'telegram':
                        tgUsers.push(element);
                        break;
                }
            });

            res.render('index', {
                vkUsers: vkUsers,
                fbUsers: fbUsers,
                tgUsers: tgUsers,
            });
        })
        .catch((err) => next(err));
};

exports.getUserInfo = function(req, res, next) {
    let query = {'_id': new ObjectID(req.params.id)};
    let options = {single: true};

    database.find(COLLECTION_USERS, query, options)
        .then((user) => {
            res.render('partials/user-info', {
                user: user,
            });
        })
        .catch((err) => next(err));
};
