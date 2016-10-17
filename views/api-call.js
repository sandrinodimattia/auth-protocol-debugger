module.exports = `
{{#if response}}
<div class="row">
  <div class="col-xs-12">
    <div>
      <h5>Response</h5>
    </div>
  </div>
  <div class="col-lg-12">
    <pre class="json-object">{{{response}}}</pre>
  </div>
</div>
{{/if}}
{{#if id_token}}
<div class="row">
  <div class="col-xs-12">
    <div>
      <h5>ID Token</h5>
    </div>
  </div>
  <div class="col-lg-12">
    <pre class="json-object">{{{id_token}}}</pre>
  </div>
</div>
{{/if}}
{{#if access_token}}
<div class="row">
  <div class="col-xs-12">
    <div>
      <h5>Access Token</h5>
    </div>
  </div>
  <div class="col-lg-12">
    <pre class="json-object">{{{access_token}}}</pre>
  </div>
</div>
{{/if}}
`;
