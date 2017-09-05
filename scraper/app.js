'use strict';

const mongojs = require('mongojs');
let db = mongojs('mongodb://localhost:27017/social-stalker', [
    'users',
    'usersources',
]);
const path = require('path');
const VK = require(path.resolve(__dirname, 'modules/vk.js'));
const Facebook = require(path.resolve(__dirname, 'modules/facebook.js'));
let modules = [];

/**
 * Initialize modules and database.
 */
function init() {
    db.usersources.createIndex({name: 1}, {unique: true});

    modules.push(new VK());
    modules.push(new Facebook('', '', ''));

    modules.forEach(function(element) {
        db.usersources.insert({name: element.name}, function(error, res) {
            if (error) {
                handleError(`[${element.name}] ${error}`);
                return;
            }
        });
    });
}

/**
 * Handle user object by recording information about it.
 *
 * @param {object} user user object
 */
function handleUser(user) {
    db.users.update(
        {
            first_name: user.first_name,
            last_name: user.last_name,
            internal_id: user.id,
            source: user.source,
        },
        {
            $push: {last_seen: user.last_seen},
            $set: {online: user.online},
        },
        {upsert: true},
        function(err, r) {
            if (err) {
                handleError(err);
                return;
            }
        }
    );
}

/**
 * Update modules' settings.
 *
 * @return {Promise} update promise
 */
function update() {
    return new Promise((resolve, reject) => {
        modules.forEach(function(element) {
            db.usersources.findOne({name: element.name}, function(error, res) {
                if (error) {
                    reject(`[${element.name}] ${error}`);
                }

                if (!res) {
                    reject(
                        `[${element.name}] Module ${element.name} `
                            + `couldn't be found`
                    );
                }

                delete res._id;
                element.update(res);
                resolve();
            });
        });
    });
}

/**
 * Handle application errors.
 *
 * @param {object} error error instance representing
 * the error during the execution
 */
function handleError(error) {
    console.log(`[${new Date()} ${error}`);
}

/**
 * Retry execution of a function that returns promise.
 *
 * @param {function} fn function that returns promise
 * @param {number} maxRetries maximal number of retries
 * @return {Promise} promise from passed function
 */
function retry(fn, maxRetries = 3) {
    return fn().catch((error) => {
        if (maxRetries <= 0) {
            throw error;
        }

        return retry(fn, maxRetries - 1);
    });
}

/**
 * Update modules' settings.
 *
 * @return {Promise} update promise
 */
function fetch() {
    return new Promise((resolve, reject) => {
        modules.forEach(function(element) {
            retry(element.fetchUsers.bind(element))
                .then((res) => {
                    res.forEach(function(user) {
                        handleUser(user);
                    });
                    resolve();
                })
                .catch((error) => reject(`[${element.name}] ${error}`));
        });
    });
}

init();
setInterval(function() {
    update()
        .then(fetch)
        .catch((error) => handleError(error));
}, 0.1 * 60 * 1000);
