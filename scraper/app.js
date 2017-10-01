'use strict';

const mongojs = require('mongojs');
let db = mongojs('mongodb://localhost:27017/social-stalker', [
    'users',
    'usersources',
]);
const path = require('path');
const VK = require(path.resolve(__dirname, 'modules/vk.js'));
const Facebook = require(path.resolve(__dirname, 'modules/facebook.js'));
const Telegram = require(path.resolve(__dirname, 'modules/telegram.js'));
let modules = [];

/**
 * Initialize modules and database.
 */
function init() {
    db.usersources.createIndex({name: 1}, {unique: true});

    modules.push(new VK());
    modules.push(new Facebook('', '', ''));
    modules.push(new Telegram());

    modules.forEach(function(element) {
        let elementName = element.constructor.NAME;
        db.usersources.insert({name: elementName}, function(error, res) {
            if (error) {
                handleError(`[${elementName}] ${error}`);
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
            let elementName = element.constructor.NAME;
            db.usersources.findOne({name: elementName}, function(error, res) {
                if (error) {
                    reject(`[${elementName}] ${error}`);
                    return;
                }

                if (!res) {
                    reject(
                        `[${elementName}] Module ${elementName} `
                            + `couldn't be found`
                    );
                    return;
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
                .catch((error) => reject(`[${element.constructor.NAME}] ${error}`));
        });
    });
}

init();
setInterval(function() {
    update()
        .then(fetch)
        .catch((error) => handleError(error));
}, 0.1 * 60 * 1000);
