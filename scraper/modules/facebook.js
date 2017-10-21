'use strict';

const request = require('request-promise');

/**
 * Class representing scraper from social network Facebook.
 */
class Facebook {
    /**
     * Create Facebook scraper.
     *
     * @param {string} userId user's facebook id
     * @param {string} cookie cookie string
     * @param {string} clientId client id
     */
    constructor() {
        this._userId = null;
        this._cookie = null;
        this._clientId = null;
        this._params = {
            cap: 8,
            cb: '67us',
            clientid: null,
            format: 'json',
            idle: 0,
            isq: 3,
            msgs_recv: 0,
            partition: -2,
            pws: 'fresh',
            qp: 'y',
            seq: 0,
            state: 'active',
            sticky_pool: 'ash2c07_chat-proxy',
            sticky_token: 0,
        };
        this._cookie = null;
    }

    /**
     * Return name of the scraper.
     */
    static get NAME() {
        return 'facebook';
    }

    /**
     * Parse JSON response from Facebook.
     *
     * @param {string} response JSON string
     * @return {object} parsed object
     */
    static parseResponse(response) {
        let payload = 'for (;;); ';
        let result = {};
        if (response.startsWith(payload)) {
            let sub = response.substr(payload.length - 1);
            result = JSON.parse(sub);
        }

        return result;
    }

    /**
     * Set user id.
     *
     * @param {string} id user's facebook id
     */
    set userId(id) {
        this._userId = id;
        this._params.userId = id;
        this._params.channel = 'p_' + id;
        this._params.uuid = id;
        this._params.viewer_uuid = id;
    }

    /**
     * Set cookie.
     *
     * @param {string} cookie cookie string
     */
    set cookie(cookie) {
        this._cookie = cookie;
    }

    /**
     * Set client id.
     *
     * @param {string} id client id
     */
    set clientId(id) {
        this._clientId = id;
        this._params.clientid = id;
    }

    /**
     * Update scraper with new options.
     *
     * @param {object} options new options, can contain userId,
     * cookie and clientId.
     */
    update(options) {
        if (options.userId) {
            this.userId = options.userId;
        }

        if (options.cookie) {
            this.cookie = options.cookie;
        }

        if (options.clientId) {
            this.clientId = options.clientId;
        }
    }

    /**
     * Get user's name from id.
     *
     * @param {*} id user's id
     * @return {Promise<Array>} promise that contains object with
     * properties 'firstName' and 'lastName' when fulfilled.
     */
    getUserName(id) {
        const regex = /"profile_name_in_profile_page">(\S+)\s(\S+)<\/span/g;
        return new Promise((resolve, reject) => {
            request
                .get('https://facebook.com/' + id, {
                    followAllRedirects: true,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64;'
                            + ' x64; rv:47.0) Gecko/20100101 Firefox/47.0',
                        'cookie': this._cookie,
                    },
                })
                .then((res) => {
                    let match = regex.exec(res);
                    if (match !== null) {
                        let user = {};
                        user.firstName = match[1];
                        user.lastName = match[2];
                        resolve(user);
                    } else {
                        reject('Could not find user\'s name');
                    }
                })
                .catch((err) => reject(err));
        });
    }

    /**
     * Fetch users from Facebook.
     *
     * @return {Promise<Array>} promise that contains fetched users
     * when fulfilled.
     */
    fetchUsers() {
        return new Promise((resolve, reject) => {
            request
                .get('https://0-edge-chat.facebook.com/pull', {
                    headers: {
                        'cookie': this._cookie,
                    },
                    qs: this._params,
                })
                .then((res) => {
                    let response = Facebook.parseResponse(res);

                    if (response.lb_info) {
                        this._params.sticky_pool = response.lb_info.pool;
                        this._params.sticky_token = response.lb_info.sticky;
                    }

                    if (response.seq) {
                        this._params.seq = response.seq;
                    }

                    if (response.ms) {
                        let hasBuddyList = false;
                        response.ms.forEach((element) => {
                            if (!element.buddyList) {
                                return;
                            }

                            hasBuddyList = true;
                            let map = new Map(
                                Object.entries(element.buddyList)
                            );
                            let users = [];
                            let time = Math.floor(Date.now() / 1000);
                            map.forEach((value, key) => {
                                users.push(
                                    new Promise((resolve, reject) => {
                                        this.getUserName(key)
                                            .then((person) => {
                                                let online =
                                                    Math.abs(value.lat - time) <
                                                    60;
                                                let user = {
                                                    id: key,
                                                    first_name:
                                                    person.firstName,
                                                    last_name: person.lastName,
                                                    online: online,
                                                    last_seen: value.lat,
                                                    source: Facebook.NAME,
                                                };
                                                resolve(user);
                                            })
                                            .catch((err) => reject(err));
                                    })
                                );
                            });

                            Promise.all(users)
                                .then((values) => resolve(values))
                                .catch((error) => reject(error));
                        });

                        if (!hasBuddyList) {
                            reject(new Error(
                                    'Response didn\'t contain user information'
                                )
                            );
                        }
                    }
                })
                .catch((err) => reject(err));
        });
    }
}

module.exports = Facebook;
