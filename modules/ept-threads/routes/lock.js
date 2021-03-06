var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {POST} /threads/:id/lock Lock
  * @apiName LockThread
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator, User (Thread Author Only)
  * @apiDescription Used to lock a thread and prevent any additional posts.
  *
  * @apiParam {string} id The unique id of the thread to lock
  * @apiParam (Payload) {boolean} [status=true] Boolean indicating lock status, true if locked false if unlocked.
  *
  * @apiSuccess {string} id The unique id of the poll
  * @apiSuccess {boolean} locked Boolean indicating if the poll is locked
  *
  * @apiError (Error 401) Unauthorized User doesn't have permissions to lock the thread
  * @apiError (Error 500) InternalServerError There was an issue locking the thread
  */
module.exports = {
  method: 'POST',
  path: '/api/threads/{id}/lock',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'threads.lock',
        data: {
          id: 'params.id',
          locked: 'payload.status'
        }
      }
    },
    validate: {
      params: Joi.object({ id: Joi.string().required() }),
      payload: Joi.object({ status: Joi.boolean().default(true) })
    },
    pre: [ { method: (request) => request.server.methods.auth.threads.lock(request.server, request.auth, request.params.id) } ]
  },
  handler: function(request) {
    var threadId = request.params.id;
    var locked = request.payload.status;

    // lock thread
    var promise = request.db.threads.lock(threadId, locked)
    .then(() => { return { id: threadId, locked: locked }; })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
