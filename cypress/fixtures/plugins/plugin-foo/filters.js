import govukPrototypeKit from "govuk-prototype-kit";
const { addFilter } = govukPrototypeKit.views;
addFilter('foo__strong', (content) => `<strong>${content}</strong>`, { renderAsHtml: true });
