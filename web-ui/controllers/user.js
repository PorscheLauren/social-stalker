'use strict';

const mongojs = require('mongojs');
let db = mongojs('mongodb://localhost:27017/social-stalker', ['users']);

exports.listUsers = function(req, res, next) {
    db.users.find().sort({
        first_name: 1,
        last_name: 1,
    }, function(err, users) {
        if (err) {
            next(err);
        }

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
    });
};

exports.getUserInfo = function(req, res, next) {
    db.users.findOne({
        '_id': new mongojs.ObjectId(req.params.id),
    }, function(err, user) {
        if (err) {
            next(err);
        }

        res.render('partials/user-info', {
            user: user,
        });
    });
};
