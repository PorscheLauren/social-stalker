'use strict';

const VKApi = require('node-vkapi');
const VK = new VKApi({
  app: {
    id: 5859550,
    secret: 'MyrpeST0YMnvJoQBQyYT',
  },
  token: 'b83415a55436eaa53a6ca06de49c34e5471877e04f025883' +
   '8775d46835e0becb0e931e3df5aec649c04dd',
});

/**
 * 
 * @param {*} callback 
 */
function fetchUsers(callback) {
    VK.call(
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
                    last_seen: element.last_seen ? element.last_seen.time : undefined,
                    source: 'vk'});
           });
           callback(users);
        });
}

exports.fetchUsers = fetchUsers;
