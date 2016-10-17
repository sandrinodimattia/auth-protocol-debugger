const path = require('path');
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
  res.send(hash({
		hash: utils.syntaxHighlight(req.query),
		id_token: utils.jwt(req.query && req.query.id_token),
		access_token: utils.jwt(req.query && req.query.access_token)
	}));
});

const index = handlebars.compile(require('./views/index'));
const renderIndex = function(req, res) {
  const headers = req.headers;
  delete headers['x-wt-params'];

  res.send(index({
    method: req.method,
    baseUrl: expressTools.urlHelpers.getBaseUrl(req),
    headers: utils.syntaxHighlight(req.headers),
		body: utils.syntaxHighlight(req.body),
		query: utils.syntaxHighlight(req.query),
		samlResponse: utils.samlResponse(req.body && req.body.SAMLResponse),
		wsFedResult: utils.wsFedResult(req.body && req.body.wresult),
		id_token: utils.jwt(req.body && req.body.id_token),
		access_token: utils.jwt(req.body && req.body.access_token)
	}));
};

app.get('*', renderIndex);
app.post('*', renderIndex);

module.exports = Webtask.fromExpress(app);
