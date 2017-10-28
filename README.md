# Social-Stalker

Node.js application for tracking and displaying online/offline status of your friends in VK, Facebook and Telegram.

## Getting Started

Social stalker consists of three modules:
  * Scraper, used for collecting data from social networks.
  * Web-UI, used for displaying collected data and for entering credentials.
  * Storage, used for wrapping database operations.

To launch this application, you'll need to launch MongoDB instance, launch scraper and web-ui modules and enter credentials via web interface.

### Prerequisites

For installing and launching the app you'll need:
  * [Node.js](https://nodejs.org/)
  * [NPM](https://www.npmjs.com/)
  * [MongoDB](https://www.mongodb.com/)

### Installing

1. Firstly prepare your machine by installing Node.js and MongoDB, then launch MongoDB on default port(27017).

2. Download this repository or clone it with git:

```
git clone https://github.com/Seregy/social-stalker.git
```

3. Initialize storage module by opening directory *storage* and installing required dependencies via npm:
```
npm install
```

4. Initialize scraper and web-ui module by opening respective directories and installing their dependencies as in previous step.

5. Launch scraper module from by starting *app.js*:
```
node app.js
```

Keep in mind that you need to have MongoDB instance running(on localhost and with default port) before launching scraper.

6. Launch web-ui module by running *start* script:
```
npm run start
```

or by starting *bin/www*:
```
node bin/www
```

This will start webserver on port 3000. You can also change the port by setting environment variables *PORT* before launch:
```
PORT=3030 npm run start
```

7. Open web interface and enter credentials for desired services.

Now everything should be working and soon you'll be able to see your friends' statuses. Keep in mind that default poll intervall of scraper is 3 minutes, which is also used for updating credentials.

## Built With

* [Node.js](https://nodejs.org/) - Server framework
* [Express](http://expressjs.com/) - Web framework
* [Mongojs](https://www.npmjs.com/package/mongojs) - MongoDB wrapper
* [Telegram-MTProto](https://www.npmjs.com/package/telegram-mtproto) - Telegram Mobile Protocol library
* [Node-VKapi](https://www.npmjs.com/package/node-vkapi) - VK library

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
