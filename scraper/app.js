'use strict';

const mongojs = require('mongojs');
let db = mongojs('mongodb://localhost:27017/social-stalker', ['users', 'usersources']);
const path = require('path');
const VK = require(path.resolve(__dirname, 'modules/vk.js'));
let vkModule;

/**
 * Initialize modules and database.
 */
function init() {
    db.usersources.createIndex({name: 1}, {unique: true});
    vkModule = new VK();
    db.usersources.insert({name: VK.NAME}, function(error, res) {
        if (error) {
            handleError(error);
            return;
        }
    });
}

/**
 * Handle user object by recording information about it.
 *
 * @param {object} user user object
 */
function handleUser(user) {
    db.users.update({
        first_name: user.first_name,
        last_name: user.last_name,
        internal_id: user.id,
        source: user.source},
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
 * @return {Promise} result of update
 */
function update() {
    return new Promise((resolve, reject) => {
        db.usersources.findOne({name: VK.NAME}, function(err, res) {
            if (err) {
                reject(err);
            }

            if (res) {
                let options = {
                    appId: res.app_id,
                    appSecureKey: res.app_secure_key,
                    userToken: res.user_token,
                };
                vkModule.setOptions(options);
            }
            resolve();
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
    console.log('[' + new Date() + '] '+ error);
}

init();
setInterval(function() {
    update().then((res) => {
        vkModule.fetchUsers(function(error, result) {
            if (error) {
                handleError(error);
                return;
            }

            result.forEach(function(element) {
                handleUser(element);
            });
        });
    }).catch((error) => handleError(error));
}, 3*60*1000);
