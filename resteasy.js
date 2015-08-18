/**
 * REST API wrapper for Meteor
 *
 * Heavily inspired by eventbrite-node by evenemento
 * https://github.com/evenemento/eventbrite-node
 *
 * @author Mike Joseph <mike@mode3.net>
 * @copyright Mike Joseph
 * @license MIT
 * @see https://github.com/evenemento/eventbrite-node
 */

var url = Npm.require('url'),
    queryString = Npm.require('querystring');

/**
 * Constructor
 * @param {string} clientKey    Client ID
 * @param {string} clientSecret Client Secret Key
 * @param {string} clientUrl    Base URL to REST resource
 */
Resteasy = function(clientKey, clientSecret, clientUrl) {

    this.clientKey = clientKey;
    this.clientSecret = clientSecret;
    this.clientUrl = clientUrl;
    this.accessToken = false;
};

/**
 * Format and return oAuth url
 * @param {string} baseUrl Base URL to oAuth endoint
 * @return {string}
 */
Resteasy.prototype.getOAuthUrl = function(baseUrl, params) {
    params = _.extend({
        'response_type': 'code',
        'client_id': this.clientKey
    }, params);

    var oauthUrl = url.parse(baseUrl);
    oauthUrl.query = params;

    return url.format(oauthUrl);
};

/**
 * Exchange auth token for bearer token
 * @param  {string} code auth token
 * @return {string}      bearer token
 */
Resteasy.prototype.authorize = function(code, authUrl, params) {
    if (!params) {
        params = {};
    }
    var delayed = Async.wrap(this, 'performGetToken');
    return delayed(code, authUrl, params);
};

/**
 * Set bearer token
 * @param {string} tok bearer token
 * @return {object} self
 */
Resteasy.prototype.setToken = function(tok) {
    this.accessToken = tok;
    return this;
};

Resteasy.prototype.setUrl = function(url) {
    this.clientUrl = url;
    return this;
};

/**
 * Perform a API GET call
 * @param  {string} path   Local API path
 * @param  {object} params Dict of params
 * @return {object}        Result data
 */
Resteasy.prototype.get = function(path, params) {
    var delayed = Async.wrap(this, 'performGet');
    return delayed(path, params);
};

/**
 * Perform a API POST call
 * @param  {string} path   Local API path
 * @param  {object} params Dict of params
 * @return {object}        Result data
 */
Resteasy.prototype.post = function(path, params) {
    var delayed = Async.wrap(this, 'performPost');
    return delayed(path, params);
};

// Private functions
Resteasy.prototype.performGetToken = function(code, authUrl, params, callback) {
    if (!this.clientKey || !this.clientSecret) {
        throw "TokenException";
    }

    var formData = {
        code: code,
        grant_type: 'authorization_code',
        client_secret: this.clientSecret,
        client_id: this.clientKey
    };

    formData = _.extend(formData, params);
    formData = queryString.stringify(formData);

    Meteor.http.post(authUrl, {
        content: formData,
        headers: {
            'Content-type': 'application/x-www-form-urlencoded',
            'Content-length': Buffer.byteLength(formData),
            'Accept': 'application/json',
            'User-Agent': 'oauth2-draft-v10'
        }
    }, function(err, res) {
        if (err) {
            console.log(err);
            callback(null, err);
            return;
        }

        callback(null, JSON.parse(res.content));
    });
};

Resteasy.prototype.performGet = function(path, params, callback) {
    if (!this.accessToken) {
        throw "TokenException";
    }

    if (path[0] === '/') {
        path = path.substr(1);
    }
    if (path.indexOf('.') === -1 && path[path.length-1] !== '/') {
        path = path + '/';
    }

    Meteor.http.get(this.clientUrl + '/' + path, {
        data: params,
        headers: {
            Authorization: 'Bearer ' + this.accessToken,
            'Content-type': 'application/json'
        }
    }, function(err, res) {
        if (err) {
            console.log(err);
            callback(null, err);
            return;
        }

        callback(null, JSON.parse(res.content));
    });
};

Resteasy.prototype.performPost = function(path, params, callback) {
    if (!this.accessToken) {
        throw "TokenException";
    }

    if (path[0] === '/') {
        path = path.substr(1);
    }
    if (path.indexOf('.') === -1 && path[path.length-1] !== '/') {
        path = path + '/';
    }

    Meteor.http.post(this.clientUrl + '/' + path, {
        data: params,
        headers: {
            Authorization: 'Bearer ' + this.accessToken,
            'Content-type': 'application/json',
        }
    }, function(err, res) {
        if (err) {
            console.log(err);
            callback(null, err);
            return;
        }

        callback(null, JSON.parse(res.content));
    });
};