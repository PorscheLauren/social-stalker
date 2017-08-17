'use strict';

const mongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb://localhost:27017/social-stalker';
const path = require('path');
const vkModule = require(path.resolve(__dirname, 'modules/vk.js'));
let usersCollection;

/**
 * 
 */
function initCollection() {
    mongoClient.connect(dbUrl, function(err, db) {
        usersCollection = db.collection('users');
    });
}

/**
 * 
 * @param {*} user 
 */
function handleUser(user) {
    usersCollection.updateOne({
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
                console.log('[' + new Date() + '] '+ err);
            }
        }
    );
}

initCollection();

setInterval(function() {
    vkModule.fetchUsers(function(result) {
        result.forEach(function(element) {
            handleUser(element);
        });
    });
}, 3*60*1000);
