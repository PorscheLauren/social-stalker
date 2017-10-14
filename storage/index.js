'use strict';

const mongojs = require('mongojs');
const BasicMongoStorage = require('./basic-mongo.js');
const TelegramMongoStorage = require('./telegram-mongo.js');

module.exports.MongoStorage = BasicMongoStorage;
module.exports.MongoStorage.ObjectID = mongojs.ObjectID;
module.exports.MongoStorage.ObjectId = mongojs.ObjectId;
module.exports.TelegramStorage = TelegramMongoStorage;
