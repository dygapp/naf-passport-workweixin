'use strict';
const { Strategy } = require('passport-strategy');
const url = require('url');
const merge = require('utils-merge');
const http = require('axios');
const { NafError, ErrorCode } = require('naf-core').Error;
const utils = require('./utils');

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
 *   - `corpid`         企业微信的CorpID，在企业微信管理端查看
 *   - `agentid`        授权方的网页应用ID，在具体的网页应用中查看
 *   - `corpsecret`     企业微信应用的secret
 *   - `callbackURL`    认证回调URL
 *   - `state`          用于保持请求和回调的状态，授权请求后原样带回给企业。
 *                      该参数可用于防止csrf攻击（跨站请求伪造攻击），建议企业带上该参数，
 *                      可设置为简单的随机数加session进行校验
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
class WxworkStrategy extends Strategy {
  constructor(options = {}, verify) {
    options.scope = options.scope || 'snsapi_base'; // snsapi_userinfo
    if (!verify) { throw new TypeError('WxworkStrategy requires a verify callback'); }
    super(options, verify);

    this.name = 'wxwork';
    this._verify = verify;
    this._authorizeURL = options.authorizeURL || 'https://open.work.weixin.qq.com/wwopen/sso/qrConnect';
    this._tokenURL = options.tokenURL || 'https://qyapi.weixin.qq.com/cgi-bin/gettoken';
    this._profileURL = options.profileURL || 'https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo';
    this._callbackURL = options.callbackURL;
    this._corpid = options.corpid;
    this._agentid = options.agentid;
    this._corpsecret = options.corpsecret;
    this._trustProxy = options.proxy;

  }

  async authenticate(req, options = {}) {

    let callbackURL = this._callbackURL || options.callbackURL;
    if (callbackURL) {
      const parsed = url.parse(callbackURL);
      if (!parsed.protocol) {
        // The callback URL is relative, resolve a fully qualified URL from the
        // URL of the originating request.
        callbackURL = url.resolve(utils.originalURL(req, { proxy: this._trustProxy }), callbackURL);
      }
    }

    if (req.query && req.query.code) {
      // authorization callback

      // TODO: 验证state
      const state = req.query.state;
      const code = req.query.code;
      // console.log({ code, state });
      // this.success({ code, state });

      try {
        // // TODO: get token
        const token = await this.getToken();
        // console.log(token);

        // // TODO: get userid
        const res = await this.getUserinfo(token.access_token, code);
        // console.log(res);
        this._verify(req, token, res, (err, user, info) => {
          if (err) { return this.error(err); }
          if (!user) { return this.fail(info); }

          info = info || {};
          if (state) { info.state = state; }
          this.success(user, info);
        });
        // this.success(res);
      } catch (err) {
        console.error(err);
        this.error(err);
      }
    } else {
      // request authorization
      const params = { appid: this._corpid, agentid: this._agentid };
      if (callbackURL) { params.redirect_uri = callbackURL; }

      const parsed = url.parse(this._authorizeURL, true);
      merge(parsed.query, params);
      delete parsed.search;
      const location = url.format(parsed);
      this.redirect(location);
    }

  }

  async getToken() {
    return await this.httpGet(this._tokenURL, { corpid: this._corpid, corpsecret: this._corpsecret });
  }

  async getUserinfo(access_token, code) {
    return await this.httpGet(this._profileURL, { access_token, code });
  }

  async httpGet(requestUrl, params) {
    const parsed = url.parse(requestUrl, true);
    merge(parsed.query, params);
    delete parsed.search;
    const location = url.format(parsed);
    // console.log(location);
    const res = await http.get(location);
    if (res.status !== 200) {
      throw new NafError(ErrorCode.NETWORK, res.statusText || `Http Error: ${res.status}`);
    }
    if (!res.data) {
      throw new NafError(ErrorCode.NETWORK, 'Http Error: invalid response data!');
    }
    if (res.data.errcode !== 0) {
      throw new NafError(res.data.errcode, res.data.errmsg);
    }

    return res.data;
  }
}

// Expose constructor.
module.exports = WxworkStrategy;
