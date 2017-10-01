'use strict';

const MTProto = require('telegram-mtproto').MTProto;

/**
 * Class representing scraper from Telegram.
 */
class Telegram {
    /**
     * Create Telegram scraper.
     *
     * @param {telegram-mtproto.AsyncStorage} storage storage instance
     * for saving session data
     */
    constructor(storage) {
        const api = {
            layer: 57,
            initConnection: 0x69796de9,
        };

        const server = {
            dev: false,
        };

        this._client = new MTProto({
            server,
            api,
            app: {
                storage: storage,
            },
        });
    }

    /**
     * Return name of the scraper.
     */
    static get NAME() {
        return 'telegram';
    }

    /**
     * Update scraper.
     * Not implemented.
     */
    update() {
        return;
    }

    /**
     * Fetch users from Telegram.
     *
     * @return {Promise<Array>} promise that contains fetched users
     * when fulfilled.
     */
    fetchUsers() {
        return new Promise((resolve, reject) => {
            this._client('contacts.getContacts')
                .then((res) => {
                    let users = [];
                    res.users.forEach((element) => {
                        users.push({
                            id: element.id,
                            first_name: element.first_name,
                            last_name: element.last_name,
                            online: element.status._ === 'userStatusOnline',
                            last_seen: element.status.was_online,
                            source: Telegram.NAME,
                        });
                    });
                    resolve(users);
                })
                .catch((error) => reject(error));
        });
    }
}

module.exports = Telegram;
