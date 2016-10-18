const path = require('path');
const crypto = require('crypto');
const express = require('express')
const bodyParser = require('body-parser')
const handlebars = require('handlebars');
const Webtask = require('webtask-tools');
const expressTools = require('auth0-extension-express-tools');

const utils = require('./lib/utils');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const hash = handlebars.compile(require('./views/hash'));
app.get('/hash', function(req, res) {
  try {
    res.send(hash({
      hash: utils.syntaxHighlight(req.query),
      id_token: utils.jwt(req.query && req.query.id_token),
      access_token: utils.jwt(req.query && req.query.access_token)
    }));
  } catch (e) {
    console.log(e);
    res.json(e);
  }
});

app.get('/pkce', function(req, res) {
  const verifier = utils.base64url(crypto.randomBytes(32));
  return res.json({
    verifier: verifier,
    verifier_challenge: utils.base64url(crypto.createHash('sha256').update(verifier).digest())
  })
});

const apiCall = handlebars.compile(require('./views/api-call'));
app.post('/api-call', function(req, res) {
  try {
    const request = req.body.request;
    delete req.body.request;
    res.send(apiCall({
      request: utils.syntaxHighlight(request),
      response: utils.syntaxHighlight(req.body),
      id_token: utils.jwt(req.body && req.body.id_token),
      access_token: utils.jwt(req.body && req.body.access_token)
    }));
  } catch (e) {
    console.log(e);
    res.json(e);
  }
});

const index = handlebars.compile(require('./views/index'));
const renderIndex = function(req, res) {
  try {
    const headers = req.headers;
    delete headers['x-wt-params'];

    res.send(index({
      method: req.method,
      baseUrl: expressTools.urlHelpers.getBaseUrl(req).replace('http://', 'https://'),
      headers: utils.syntaxHighlight(req.headers),
      body: utils.syntaxHighlight(req.body),
      query: utils.syntaxHighlight(req.query),
      authorization_code: req.query && req.query.code,
      samlResponse: utils.samlResponse(req.body && req.body.SAMLResponse),
      wsFedResult: utils.wsFedResult(req.body && req.body.wresult),
      id_token: utils.jwt(req.body && req.body.id_token),
      access_token: utils.jwt(req.body && req.body.access_token)
    }));
  } catch (e) {
    console.log(e);
    res.json(e);
  }
};

app.get('*', renderIndex);
app.post('*', renderIndex);

module.exports = Webtask.fromExpress(app);
