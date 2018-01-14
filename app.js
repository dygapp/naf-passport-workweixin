'use strict';

const debug = require('debug')('naf-passport-wxwork');
const assert = require('assert');
const Strategy = require('./lib/passport-wxwork').Strategy;

module.exports = app => {

  const config = app.config.passportWxwork;

  config.passReqToCallback = true;

  assert(config.key, '[naf-passport-wxwork] config.passportWxwork.key required');
  assert(config.secret, '[naf-passport-wxwork] config.passportWxwork.secret required');
  assert(config.agentid, '[naf-passport-wxwork] config.passportWxwork.agentid required');

  config.appid = config.key;
  config.corpSecret = config.secret;

  config.requireState = false;

  // config.cache = app.redis;

  /**
   * 获取用户的回调
   */
  app.passport.use('wxwork', new Strategy(config, (req, accessToken, ticket, params, profile, done) => {
    // format user
    const user = {
      provider: 'wxwork',
      // id: profile.id,
      // name: profile.username,
      // displayName: profile.displayName,
      // photo: profile.photo,
      // accessToken,
      // ticket,
      profile,
    };

    // {
    //   "errcode": 0,
    //   "errmsg": "ok",
    //   "UserId":"USERID",
    //   "DeviceId":"DEVICEID",
    //   "user_ticket": "USER_TICKET"，
    //   "expires_in":7200
    // }

    debug('%s %s get user: %j', req.method, req.url, user);

    // let passport do verify and call verify hook
    app.passport.doVerify(req, user, done);
  }))
  ;
};
