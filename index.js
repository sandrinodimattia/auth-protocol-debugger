const url = require('url');
const path = require('path');
const crypto = require('crypto');
const express = require('express')
const bodyParser = require('body-parser')
const handlebars = require('handlebars');
const Webtask = require('webtask-tools');
const expressTools = require('auth0-extension-express-tools');

const utils = require('./lib/utils');
const index = handlebars.compile(require('./views/index'));
const partial = handlebars.compile(require('./views/partial'));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/pkce', function(req, res) {
  const verifier = utils.base64url(crypto.randomBytes(32));
  return res.json({
    verifier: verifier,
    verifier_challenge: utils.base64url(crypto.createHash('sha256').update(verifier).digest())
  })
});

app.get('/hash', function(req, res) {
  res.send(partial({
    hash: utils.syntaxHighlight(req.query),
    id_token: utils.jwt(req.query && req.query.id_token),
    access_token: utils.jwt(req.query && req.query.access_token)
  }));
});

app.post('/request', function(req, res) {
  const request = req.body.request;
  delete req.body.request;
  res.send(partial({
    request: utils.syntaxHighlight(request),
    response: utils.syntaxHighlight(req.body),
    id_token: utils.jwt(req.body && req.body.id_token),
    access_token: utils.jwt(req.body && req.body.access_token)
  }));
});

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

app.get('/.well-known/oauth2-client-configuration', function (req, res) {
  var protocol = 'https';
  var pathname = url.parse(req.originalUrl).pathname.replace(req.path, '');
  var baseUrl = url.format({
    protocol: protocol,
    host:     req.get('host'),
    pathname: pathname
  });

  res.header("Content-Type", 'application/json');
  res.status(200).send({
    redirect_uris: [baseUrl],
    client_name:   'Protocol Debugger',
    post_logout_redirect_uris: [baseUrl]
  });
});

app.get('*', renderIndex);
app.post('*', renderIndex);

module.exports = Webtask.fromExpress(app);
