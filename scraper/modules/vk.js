'use strict';

const VKApi = require('node-vkapi');

/**
 * Class representing scraper from social network VK.
 */
class VK {
    /**
     * Create VK scraper.
     *
     * @param {object} options scraper's options, can contain appId,
     * appSecureKey and userToken.
     */
    constructor(options = {}) {
        this._appId = options.appId ? options.appId : '';
        this._appSecureKey = options.appSecureKey ? options.appSecureKey : '';
        this._userToken = options.userToken ? options.userToken : '';

        this._vkApi = new VKApi({
            app: {
                id: this._appId,
                secret: this._appSecureKey,
            },
            token: this._userToken,
        });
    }

    /**
     * Return name of the scraper.
     */
    static get NAME() {
        return 'vk';
    }

    /**
     * Set scraper's options.
     *
     * @param {object} options scraper's options, can contain appId,
     * appSecureKey and userToken.
     */
    setOptions(options = {}) {
        if (options.appId) {
            this._appId = options.appId;
        }
        if (options.appSecureKey) {
            this._appSecureKey = options.appSecureKey;
        }
        if (options.userToken) {
            this._userToken = options.userToken;
        }

        this._vkApi.setOptions({
            app: {
                id: this._appId,
                secret: this._appSecureKey,
            },
            token: this._userToken,
        });
    }

    /**
     * Callback format for results
     * @callback VK~resultCallback
     * @param {object} error error instance representing
     * the error during the execution
     * @param {object} result result object if the command
     * was executed successfully
     */

    /**
     * Fetch users from VK.
     *
     * @param {VK~resultCallback} callback result callback
     */
    fetchUsers(callback) {
        this._vkApi.call(
            'friends.get',
             {
               fields: 'last_seen',
           }).then((res) => {
                let users = [];
                res.items.forEach(function(element) {
                    users.push(
                        {id: element.id,
                        first_name: element.first_name,
                        last_name: element.last_name,
                        online: element.online == 1 ? true : false,
                        last_seen:
                         element.last_seen ? element.last_seen.time : undefined,
                        source: VK.NAME});
                });
                callback(null, users);
            })
            .catch(function(err) {
                callback(err);
            });
    }
}

module.exports = VK;
