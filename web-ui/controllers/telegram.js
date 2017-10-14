'use strict';

const TelegramStorage = require('social-stalker-storage').TelegramStorage;
const MTProto = require('telegram-mtproto').MTProto;

const SOURCE_NAME = 'telegram';
const DATABASE_ADDRESS = 'localhost:27017';
const DATABASE_NAME = 'social-stalker';
const COLLECTION_USERSOURCES = 'usersources';

const api = {
    layer: 57,
    initConnection: 0x69796de9,
};

const server = {
    dev: false,
};

const telegramStorage = new TelegramStorage(SOURCE_NAME,
    DATABASE_ADDRESS,
    DATABASE_NAME,
    COLLECTION_USERSOURCES);

const client = new MTProto({
    server,
    api,
    app: {storage: telegramStorage},
});

exports.sendCode = function(req, res, next) {
    let number = req.body.phoneNumber;
    let apiId = req.body.apiId;
    let apiHash = req.body.apiHash;

    client('auth.sendCode', {
        phone_number: number,
        api_id: apiId,
        api_hash: apiHash,
    })
        .then((result) =>
            Promise.all(telegramStorage.set('apiId', apiId),
                        telegramStorage.set('apiHash', apiHash),
                        telegramStorage.set('phoneNumber', number),
                        telegramStorage.set('phoneCodeHash',
                                            result.phone_code_hash)))
        .then(() => res.sendStatus(200))
        .catch((err) => next(err));
};

exports.saveCode = function(req, res, next) {
    let code = req.body.phoneCode;

    Promise.all(telegramStorage.get('phoneNumber'),
                telegramStorage.get('phoneCodeHash'))
        .then((number, hash) =>
            client('auth.signIn', {
                phone_number: number,
                phone_code_hash: hash,
                phone_code: code,
            }))
        .then((result) =>
            telegramStorage.set('accessHash', result.user.access_hash))
        .then(() => res.sendStatus(200))
        .catch((error) => res.next(error));
};
