'use strict';

const VK = require('./modules/vk.js');
const Facebook = require('./modules/facebook.js');
const Telegram = require('./modules/telegram.js');
const TelegramStorage = require('social-stalker-storage').TelegramStorage;
const MongoStorage = require('social-stalker-storage').MongoStorage;

const DATABASE_ADDRESS = 'localhost:27017';
const DATABASE_NAME = 'social-stalker';
const COLLECTION_USERS = 'user';
const COLLECTION_USERSOURCES = 'usersources';

const database = new MongoStorage(DATABASE_ADDRESS, DATABASE_NAME);
let modules = [];

/**
 * Initialize modules and database.
 */
function init() {
    database.createIndex(COLLECTION_USERSOURCES, {name: 1}, {unique: true});

    modules.push(new VK());
    modules.push(new Facebook('', '', ''));
    let storage = new TelegramStorage(Telegram.NAME,
        DATABASE_ADDRESS,
        DATABASE_NAME,
        COLLECTION_USERSOURCES);
    modules.push(new Telegram(storage));

    modules.forEach(function(element) {
        let elementName = element.constructor.NAME;
        database.create(COLLECTION_USERSOURCES, {name: elementName})
            .catch((error) => handleError(error));
    });
}

/**
 * Handle user object by recording information about it.
 *
 * @param {object} user user object
 */
function handleUser(user) {
    let query = {
        first_name: user.first_name,
        last_name: user.last_name,
        internal_id: user.id,
        source: user.source,
    };
    let update = {
        $push: {last_seen: user.last_seen},
        $set: {online: user.online},
    };
    let options = {upsert: true};

    database.update(COLLECTION_USERS, query, update, options)
        .catch((error) => handleError(error));
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
            let query = {name: elementName};
            let options = {single: true};
            database.find(COLLECTION_USERSOURCES, query, options)
                .then((usersource) => {
                    delete usersource._id;
                    element.update(usersource);
                    resolve();
                })
                .catch((error) => reject(`[${elementName}] ${error}`));
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
                .catch((error) =>
                    reject(`[${element.constructor.NAME}] ${error}`)
                );
        });
    });
}

init();
setInterval(function() {
    update()
        .then(fetch)
        .catch((error) => handleError(error));
}, 0.1 * 60 * 1000);
