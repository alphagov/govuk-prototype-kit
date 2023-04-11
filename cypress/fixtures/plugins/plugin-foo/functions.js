import govukPrototypeKit from "govuk-prototype-kit";
const { addFunction } = govukPrototypeKit.views;
addFunction('fooEmphasize', (content) => `<em>${content}</em>`, { renderAsHtml: true });
