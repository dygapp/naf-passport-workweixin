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

  config.corpid = config.key;
  config.corpsecret = config.secret;

  config.requireState = false;

  // config.cache = app.redis;

  /**
   * 获取用户的回调
   */
  app.passport.use('wxwork', new Strategy(config, (req, accessToken, profile, done) => {
    // format user
    const user = {
      provider: 'wxwork',
      userid: profile.UserId,
      // accessToken,
      // ticket,
    };

    debug('%s %s get user: %j', req.method, req.url, user);

    // let passport do verify and call verify hook
    app.passport.doVerify(req, user, done);
  }));

  // 处理用户信息钩子函数
  // app.passport.verify(async (ctx, user) => {
  //   console.log('***************  app.passport.verify  ********************');
  //   console.log(user);
  //   return user;
  // });
  // app.passport.serializeUser(async (ctx, user) => {
  //   console.log('***************  app.passport.serializeUser  ********************');
  //   console.log(user);
  //   return user;
  // });
  // app.passport.deserializeUser(async (ctx, user) => {
  //   console.log('***************  app.passport.deserializeUser  ********************');
  //   console.log(user);
  //   return user;
  // });

};
