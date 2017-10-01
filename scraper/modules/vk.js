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
     * Update scraper with new options.
     *
     * @param {object} options new options, can contain appId,
     * appSecureKey and userToken.
     */
    update(options) {
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
     * Fetch users from VK.
     *
     * @return {Promise<Array>} promise that contains fetched users
     * when fulfilled.
     */
    fetchUsers() {
        return new Promise((resolve, reject) => {
            this._vkApi
                .call('friends.get', {
                    fields: 'last_seen',
                })
                .then((res) => {
                    let users = [];
                    res.items.forEach((element) => {
                        users.push({
                            id: element.id,
                            first_name: element.first_name,
                            last_name: element.last_name,
                            online: element.online == 1 ? true : false,
                            last_seen: element.last_seen
                                ? element.last_seen.time
                                : undefined,
                            source: VK.NAME,
                        });
                    });
                    resolve(users);
                })
                .catch((error) => reject(error));
        });
    }
}

module.exports = VK;
