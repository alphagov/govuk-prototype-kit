const appGlobalsPath = path.join('app', 'globals.js')

const globalsViewMarkup = `
{% extends "layouts/main.html" %}
{% block content %}
<div id="test-foo-strong-filter">{{ 'abc' | foo__strong }}</div>
{% endblock %}
`
const globalsAddition = `
addGlobal('fooEmphasize', (content) => \`<em>${content}</em>\`, { renderAsHtml: true })
`