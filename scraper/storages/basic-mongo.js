'use strict';

const mongojs = require('mongojs');

/**
 * Mongo storage for data.
 */
class BasicMongoStorage {
    /**
     * Create BasicMongoStorage.
     *
     * @param {*} dbAddress address and port of the database
     * @param {*} dbName name of the database
     */
    constructor(dbAddress, dbName) {
        this._db = mongojs(`mongodb://${dbAddress}/${dbName}`);
    }

    /**
     * Get data from storage by query.
     *
     * @param {string} type type of data(collection's name)
     * @param {object} query search query
     * @param {object} options additional options
     * @return {Promise<object|Array<object>>} promise that contains found value
     * when fulfilled.
     */
    find(type, query, options) {
        let collection = this._getCollection(type);

        let findMethod = collection.find.bind(collection);
        if (options.single) {
            findMethod = collection.findOne.bind(collection);
        }

        return new Promise((resolve, reject) => {
            findMethod(query, function(err, records) {
                if (err) {
                    reject(err);
                }

                resolve(records);
            });
        });
    }

    /**
     * Add data to storage.
     *
     * @param {string} type type of data(collection's name)
     * @param {object} record data to be saved
     * @param {object} options additional options
     * @return {Promise<any>} promise that contains operation's result
     * when fulfilled.
     */
    create(type, record, options) {
        let collection = this._getCollection(type);

        return new Promise((resolve, reject) => {
            collection.save(record, function(err, res) {
                if (err) {
                    reject(err);
                }

                resolve(res);
            });
        });
    }

    /**
     * Update existing data in storage by query.
     *
     * @param {string} type type of data(collection's name)
     * @param {object} query search query
     * @param {object} update update query
     * @param {object} options additional options
     * @return {Promise<any>} promise that contains operation's result
     * when fulfilled.
     */
    update(type, query, update, options) {
        let collection = this._getCollection(type);

        return new Promise((resolve, reject) => {
            collection.update(query, update, options, function(err, res) {
                if (err) {
                    reject(err);
                }

                resolve(res);
            });
        });
    }

    /**
     * Remove data from storage by query.
     *
     * @param {string} type type of data(collection's name)
     * @param {object} query search query
     * @param {object} options additional options
     * @return {Promise<any>} promise that contains operation's result
     * when fulfilled.
     */
    delete(type, query, options) {
        let collection = this._getCollection(type);

        let deleteMethod = collection.deleteMany.bind(collection);
        if (options.single) {
            deleteMethod = collection.deleteOne.bind(collection);
        }

        return new Promise((resolve, reject) => {
            deleteMethod(query, function(err, res) {
                if (err) {
                    reject(err);
                }

                resolve(res);
            });
        });
    }

    /**
     * Create indexes.
     *
     * @param {string} type type of data(collection's name)
     * @param {object} keys index keys
     * @param {object} options additional options
     * @return {Promise<any>} promise that contains operation's result
     * when fulfilled.
     */
    createIndex(type, keys, options) {
        let collection = this._getCollection(type);

        return new Promise((resolve, reject) => {
            collection.createIndex(keys, options, function(err, res) {
                if (err) {
                    reject(err);
                }

                resolve(res);
            });
        });
    }

    /**
     * Return collection by its name.
     *
     * @param {string} name collection's name
     * @return {object} collection
     */
    _getCollection(name) {
        return this._db.collection(name);
    }
}

module.exports = BasicMongoStorage;
