'use strict';

const mongojs = require('mongojs');

/**
 * Storage for Telegram data in Mongo.
 */
class TelegramMongoStorage {
    /**
     * Create TelegramMongoStorage.
     *
     * @param {string} scraperName name of the scraper in database
     * @param {string} dbAddress address and port of the database
     * @param {string} dbName name of the database
     * @param {string} collectionName name of the collection
     */
    constructor(scraperName, dbAddress, dbName, collectionName) {
        this._name = scraperName;
        this._collection = collectionName;
        this._db = mongojs(`mongodb://${dbAddress}/${dbName}`, [collectionName]);
    }

    /**
     * Get data from storage by key.
     *
     * @param {string} key key
     * @return {Promise<any>} promise that contains found value
     * when fulfilled.
     */
    get(key) {
        return new Promise((resolve, reject) => {
            this._db[this._collection].findOne({name: this._name}, function(
                error,
                res
            ) {
                if (error) {
                    return reject(`[${key}] ${error}`);
                }

                if (!res) {
                    return reject(`${key} couldn't be found`);
                }

                resolve(res[key]);
            });
        });
    }

    /**
     * Adds data to the storage by key.
     *
     * @param {string} key key
     * @param {any} value value
     * @return {Promise} set promise.
     */
    set(key, value) {
        return new Promise((resolve, reject) => {
            this._db[this._collection].update(
                {
                    name: this._name,
                },
                {
                    $set: {[key]: value},
                },
                {upsert: true},
                function(err, r) {
                    if (err) {
                        return reject(err);
                    }

                    resolve(r);
                }
            );
        });
    }

    /**
     * Removes data from storage by key.
     *
     * @param {Array<string>} keys keys to be removed
     * @return {Promise} remove promise
     */
    remove(...keys) {
        return new Promise((resolve, reject) => {
            let fields = {};
            keys.forEach(function(key) {
                fields[key] = '';
            });
            this._db[this._collection].update(
                {
                    name: this._name,
                },
                {
                    $unset: fields,
                },
                {upsert: true},
                function(err, r) {
                    if (err) {
                        return reject(err);
                    }

                    resolve(r);
                }
            );
        });
    }

    /**
     * Clears the storage.
     *
     * @return {Promise} clear promise
     */
    clear() {
        return new Promise((resolve, reject) => {
            let query = {name: this._name};
            this._db[this._collection].remove(query, function(err, r) {
                if (err) {
                    return reject(err);
                }

                resolve(r);
            });
        });
    }
}

module.exports = TelegramMongoStorage;
