'use strict';
const { Strategy } = require('passport-strategy');
const util = require('util');

/**
 * `Strategy` constructor.
 *
 * The wxwork authentication strategy authenticates requests by delegating to
 * wxwork using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `appid`       企业微信的CorpID，在企业微信管理端查看
 *   - `agentid`        授权方的网页应用ID，在具体的网页应用中查看
 *   - `corpSecret`   企业微信应用的secret
 *   - `callbackURL`    认证回调URL
 *   - `state`          用于保持请求和回调的状态，授权请求后原样带回给企业。
 *                      该参数可用于防止csrf攻击（跨站请求伪造攻击），建议企业带上该参数，
 *                      可设置为简单的随机数加session进行校验
 *   - `scope`         array of permission scopes to request.  valid scopes include:
 *                     'user', 'public_repo', 'repo', 'gist', or none.
 *                     (see http://open.weibo.com/wiki/Oauth/en#User_Authentication for more info)
 *
 * Examples:
 *
 *     passport.use(new WeiboStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/weibo/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
class WxworkStrategy extends Strategy {
  constructor(options = {}, verify) {
    options.scope = options.scope || 'snsapi_base'; // snsapi_userinfo
    options.profileURL = options.profileURL || 'https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo';
    options.authorizationURL = options.authorizationURL || 'https://open.work.weixin.qq.com/wwopen/sso/qrConnect';
    options.tokenURL = options.tokenURL || 'https://qyapi.weixin.qq.com/cgi-bin/gettoken';
    super(options, verify);

    this.name = 'wxwork';
    this._verify = verify;
  }

  authenticate(req, options = {}) {

    console.log('*********** this ************');
    console.log(this);
    console.log('*********** options ************');
    console.log(options);
    console.log('*********** req ************');
    console.log(req);

    if (req.query && req.query.code) {
      // authorization callback

    } else {
      // request authorization
      const callbackURL = options.callbackURL || this._options.callbackURL;
      const params = { };
      params.redirect_uri = callbackURL;
    }

  }

}

// Expose constructor.
module.exports = WxworkStrategy;
