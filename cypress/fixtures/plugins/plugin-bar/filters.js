import govukPrototypeKit from "govuk-prototype-kit";
// local dependencies
const { addFilter } = govukPrototypeKit.views;
addFilter('bar__link', (content, url) => `<a href="${url || '#'}">${content}</a>`, { renderAsHtml: true });
