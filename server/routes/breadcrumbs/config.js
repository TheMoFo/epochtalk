var path = require('path');
var db = require(path.join(__dirname, '..', '..', '..', 'db'));
var Hapi = require('hapi');
var Boom = require('boom');
var breadcrumbValidator = require('epochtalk-validator').api.breadcrumbs;
var pre = require(path.join(__dirname, 'pre'));

// Route handlers/configs
exports.byType = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: { query: breadcrumbValidator.schema.byType },
  pre: [ { method: pre.requireLogin, assign: 'viewable' } ],
  handler: function(request, reply) {
    if (!request.pre.viewable) { return reply([]); }
    // method type enum
    var findType = {
      board: db.boards.find,
      category: db.categories.find,
      thread: db.threads.find,
      post: db.posts.find
    };

    // Type enum
    var type = {
      board: 'board',
      category: 'category',
      thread: 'thread',
      post: 'post'
    };

    // Recursively Build breadcrumbs
    var buildCrumbs = function(id, curType, crumbs) {
      if (!id) { return crumbs; }
      return findType[curType](id)
      .then(function(obj) {
        var nextType, nextId;
        if (curType === type.category) { // Category
          var catName = obj.name;
          // var anchorId = '/#' + catName.replace(' ', '-') + '-' + '1';
          crumbs.push({ label: catName, url: ''});
        }
        else if (curType === type.board) { // Board
          if (!obj.parent_id && obj.category_id) { // Has no Parent
            nextType = type.category;
            nextId = obj.category_id;
          }
          else { // Has Parent
            nextType = type.board;
            nextId = obj.parent_id;
          }
          crumbs.push({ label: obj.name, url: '/boards/' + id });
        }
        else if (curType === type.thread) { // Thread
          crumbs.push({ label: obj.title, url: '/threads/' + id + '/posts'});
          nextType = type.board;
          nextId = obj.board_id;
        }
        else if (curType === type.post) { // Post
          crumbs.push({ label: obj.title, url: '/posts/' + id});
          nextType = type.thread;
          nextId = obj.thread_id;
        }
        return buildCrumbs(nextId, nextType, crumbs);
      });
    };

    // Build the breadcrumbs and reply
    return buildCrumbs(request.query.id, request.query.type, [])
    .then(function(breadcrumbs) { reply(breadcrumbs.reverse()); })
    .catch(function(err) { reply(Boom.badImplementation(err));});
  }
};
