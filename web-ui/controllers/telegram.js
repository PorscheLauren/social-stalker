'use strict';

const mongojs = require('mongojs');
const TelegramStorage = require('../storages/telegram-mongo.js');
const db = mongojs('mongodb://localhost:27017/social-stalker', ['usersources']);
const MTProto = require('telegram-mtproto').MTProto;
const SOURCE_NAME = 'telegram';

const api = {
    layer: 57,
    initConnection: 0x69796de9,
};

const server = {
    dev: false,
};

const client = new MTProto({
    server,
    api,
    app: {storage: new TelegramStorage(SOURCE_NAME)},
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
        .then((result) => {
            db.usersources.update(
                {
                    name: SOURCE_NAME,
                },
                {
                    $set: {
                        apiId: apiId,
                        apiHash: apiHash,
                        phoneNumber: number,
                        phoneCodeHash: result.phone_code_hash,
                    },
                },
                function(err, value) {
                    if (err) {
                        return next(err);
                    }

                    res.sendStatus(200);
                }
            );
        })
        .catch((err) => next(err));
};

exports.saveCode = function(req, res, next) {
    let code = req.body.phoneCode;
    let number;
    let codeHash;

    db.usersources.findOne(
        {
            name: SOURCE_NAME,
        },
        function(err, source) {
            if (err) {
                next(err);
            }

            number = source.phoneNumber;
            codeHash = source.phoneCodeHash;

            let user = client('auth.signIn', {
                phone_number: number,
                phone_code_hash: codeHash,
                phone_code: code,
            });

            user
                .then((result) => {
                    db.usersources.update(
                        {
                            name: SOURCE_NAME,
                        },
                        {
                            $set: {accessHash: result.user.access_hash},
                        },
                        function(err, value) {
                            if (err) {
                                return next(err);
                            }

                            res.sendStatus(200);
                        }
                    );
                })
                .catch((error) => res.next(error));
        }
    );
};
