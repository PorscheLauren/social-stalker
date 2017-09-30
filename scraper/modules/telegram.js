'use strict';

const MTProto = require('telegram-mtproto').MTProto;
const TelegramStorage = require('../storages/telegram-mongo.js');

/**
 * Class representing scraper from Telegram.
 */
class Telegram {
    /**
     * Create Telegram scraper.
     */
    constructor() {
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
                storage: new TelegramStorage(this.name),
            },
        });
    }

    /**
     * Return name of the scraper.
     */
    get name() {
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
                            source: this.name,
                        });
                    });
                    resolve(users);
                })
                .catch((error) => reject(error));
        });
    }
}

module.exports = Telegram;
