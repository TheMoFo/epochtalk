var Joi = require('@hapi/joi');
var Boom = require('boom');
var path = require('path');
var db = require(path.normalize(__dirname + '/../db'));
var autoModerator = require(path.normalize(__dirname + '/../autoModerator'));

function auth(request) {
  var promise = request.server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: request.server,
    auth: request.auth,
    permission: 'autoModeration.addRule.allow'
  });

  return promise;
}

/**
  * @apiVersion 0.4.0
  * @apiGroup AutoModeration
  * @api {POST} /automoderation/rules Add Rule
  * @apiName AddRuleAutoModeration
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to create a new auto moderation rule
  *
  * @apiParam (Payload) {string} name The name of the auto moderation rule
  * @apiParam (Payload) {string} description The description of what the rule does
  * @apiParam (Payload) {string} message The error message which is returned to the user
  * @apiParam (Payload) {object[]} conditions What conditions trigger the rule
  * @apiParam (Payload) {string="body","thread_id","user_id","title"} conditions.params The parameter that triggers the rule
  * @apiParam (Payload) {object} conditions.regex A regex used to capture user input and trigger rule
  * @apiParam (Payload) {string} conditions.regex.pattern The regex pattern
  * @apiParam (Payload) {string} conditions.regex.flags The regex flags
  * @apiParam (Payload) {string[]="reject","ban","edit","delete"} actions Array containing what action is taken when the rule is matched
  * @apiParam (Payload) {object} options Contains settings related to the action that is taken
  * @apiParam (Payload) {number} options.ban_interval How many days to ban the user for, leave blank for permanent ban
  * @apiParam (Payload) {object} options.edit Contains information for replacing matched rule text
  * @apiParam (Payload) {object} options.edit.replace Contains info for what text to replace
  * @apiParam (Payload) {object} options.edit.replace.regex Regex to match text to replace
  * @apiParam (Payload) {string} options.edit.replace.regex.pattern The regex pattern
  * @apiParam (Payload) {string} options.edit.replace.regex.flags The regex flags
  * @apiParam (Payload) {string} options.edit.replace.text The text to replaced the matched text with
  * @apiParam (Payload) {string} options.edit.template Allows message to be replaced, prepended, or appended to
  *
  * @apiSuccess {string} id The id of the auto moderation rule
  * @apiSuccess {string} name The name of the auto moderation rule
  * @apiSuccess {string} description The description of what the rule does
  * @apiSuccess {string} message The error message which is returned to the user
  * @apiSuccess {object[]} conditions What conditions trigger the rule
  * @apiSuccess {string="body","thread_id","user_id","title"} conditions.params The parameter that triggers the rule
  * @apiSuccess {object} conditions.regex A regex used to capture user input and trigger rule
  * @apiSuccess {string} conditions.regex.pattern The regex pattern
  * @apiSuccess {string} conditions.regex.flags The regex flags
  * @apiSuccess {string[]="reject","ban","edit","delete"} actions Array containing what action is taken when the rule is matched
  * @apiSuccess {object} options Contains settings related to the action that is taken
  * @apiSuccess {number} options.ban_interval How many days to ban the user for, leave blank for permanent ban
  * @apiSuccess {object} options.edit Contains information for replacing matched rule text
  * @apiSuccess {object} options.edit.replace Contains info for what text to replace
  * @apiSuccess {object} options.edit.replace.regex Regex to match text to replace
  * @apiSuccess {string} options.edit.replace.regex.pattern The regex pattern
  * @apiSuccess {string} options.edit.replace.regex.flags The regex flags
  * @apiSuccess {string} options.edit.replace.text The text to replaced the matched text with
  * @apiSuccess {string} options.edit.template Allows message to be replaced, prepended, or appended to
  *
  * @apiError (Error 500) InternalServerError There was an error creating the auto moderation rule
  */
module.exports = {
  method: 'POST',
  path: '/api/automoderation/rules',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      payload: Joi.object({
        name: Joi.string().max(255).required(),
        description: Joi.string().max(1000),
        message: Joi.string().max(1000),
        conditions: Joi.array().items(Joi.object().keys({
          param: Joi.string().trim().valid('body', 'thread_id', 'user_id', 'title').required(),
          regex: Joi.object().keys({
            pattern: Joi.string().max(255).required(),
            flags: Joi.string().trim().max(25).allow('')
          }).required()
        })).min(1).required(),
        actions: Joi.array().items(Joi.string().valid('reject', 'ban', 'edit', 'delete')).min(1).required(),
        options: {
          ban_interval: Joi.number(),
          edit: {
            replace: {
              regex: Joi.object().keys({
                pattern: Joi.string().max(255).required(),
                flags: Joi.string().trim().max(25).allow('')
              }).required(),
              text: Joi.string().required()
            },
            template: Joi.string().regex(/{body}/)
          }
        }
      })
    },
    pre: [ { method: auth } ]
  },
  handler: function(request) {
    var rule = request.payload;
    var promise = db.addRule(rule)
    .tap(function(rule) { autoModerator.addRule(rule); })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
