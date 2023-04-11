import path from "path";
import { copyFile, deleteFile } from "../../utils.js";
const templates = path.join(Cypress.config('fixturesFolder'), 'views');
const startTemplate = path.join(templates, 'start.html');
const questionTemplate = path.join(templates, 'question.html');
const confirmationTemplate = path.join(templates, 'confirmation.html');
const contentTemplate = path.join(templates, 'content.html');
const fixtures = path.join(Cypress.config('fixturesFolder'));
const fixtureViews = path.join(fixtures, 'views');
const jugglingCheckAnswersFixtureView = path.join(fixtureViews, 'juggling-check-answers.html');
const components = path.join(fixtures, 'components');
const jugglingBallsComponent = path.join(components, 'juggling-balls-component.html');
const jugglingTrickComponent = path.join(components, 'juggling-trick-component.html');
const jugglingBallsAnswerComponent = path.join(components, 'juggling-balls-route-component.js');
const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views');
const startView = path.join(appViews, 'start.html');
const jugglingBallsView = path.join(appViews, 'juggling-balls.html');
const jugglingTrickView = path.join(appViews, 'juggling-trick.html');
const checkAnswersView = path.join(appViews, 'check-answers.html');
const confirmationView = path.join(appViews, 'confirmation.html');
const ineligibleView = path.join(appViews, 'ineligible.html');
const appRoutesPath = path.join('app', 'routes.js');
const appRoutes = path.join(Cypress.env('projectFolder'), appRoutesPath);
const appDataFile = path.join(Cypress.env('projectFolder'), 'app', 'data', 'session-data-defaults.js');
const jugglingBallsPath = '/juggling-balls';
const jugglingTrickPath = '/juggling-trick';
const checkAnswersPath = '/check-answers';
const jugglingBallsAnswerRoute = '/juggling-balls-answer';
const defaultHowManyBalls = 'None - I cannot juggle';
const defaultMostImpressiveTrick = 'None - I cannot do tricks';
const cleanUpPages = () => {
    deleteFile(startView);
    deleteFile(jugglingBallsView);
    deleteFile(jugglingTrickView);
    deleteFile(checkAnswersView);
    deleteFile(confirmationView);
};
const createQuestionView = (view, content, nextPath) => {
    copyFile(questionTemplate, view);
    cy.task('replaceMultipleTextInFile', {
        filename: view,
        list: [
            { originalText: '<h1 class="govuk-heading-xl">Heading or question goes here</h1>', newText: '' },
            { originalText: '<p>[See <a href="https://design-system.service.gov.uk">the GOV.UK Design System</a> for examples]</p>', newText: '' },
            { originalText: '<p>[Insert question content here]</p>', source: content },
            { originalText: '/url/of/next/page', newText: nextPath }
        ]
    });
};
const setUpPages = () => {
    // Set up start view
    copyFile(startTemplate, startView);
    cy.task('replaceTextInFile', { filename: startView, originalText: '<a href="#" role="button"', newText: `<a href="${jugglingBallsPath}" role="button"` });
    // Set up juggling balls view
    createQuestionView(jugglingBallsView, jugglingBallsComponent, jugglingTrickPath);
    // Set up juggling trick view
    createQuestionView(jugglingTrickView, jugglingTrickComponent, checkAnswersPath);
    // Set up check answers view
    copyFile(jugglingCheckAnswersFixtureView, checkAnswersView);
    // Set up confirmation view
    copyFile(confirmationTemplate, confirmationView);
};
const setUpData = () => {
    cy.task('replaceTextInFile', { filename: appDataFile, originalText: '// Insert values here', newText: `"how-many-balls": "${defaultHowManyBalls}", "most-impressive-trick": "${defaultMostImpressiveTrick}"` });
};
const clearUpData = () => {
    cy.task('replaceTextInFile', { filename: appDataFile, originalText: `"how-many-balls": "${defaultHowManyBalls}", "most-impressive-trick": "${defaultMostImpressiveTrick}"`, newText: '// Insert values here' });
};
const setUpBranchingPages = () => {
    // Set up ineligible view
    copyFile(contentTemplate, ineligibleView);
    cy.task('replaceMultipleTextInFile', {
        filename: ineligibleView,
        list: [
            { originalText: 'Heading goes here', newText: 'Sorry, you are ineligible for juggling tricks' },
            { originalText: 'This is a paragraph of text. It explains in more detail what has happened and wraps across several lines.', newText: 'Keep practicing and when you can juggle 3 or more balls, you will be eligible for tricks.' },
            { originalText: '<p>Read more <a href="/url/of/onward/page">about this topic</a>.</p>', newText: '' }
        ]
    });
    // Update the juggling balls action
    cy.task('replaceTextInFile', { filename: jugglingBallsView, originalText: jugglingTrickPath, newText: jugglingBallsAnswerRoute });
    // Update routes with juggling balls answer component
    cy.task('replaceTextInFile', { filename: appRoutes, originalText: '// Add your routes here', source: jugglingBallsAnswerComponent });
};
const cleanUpBranchingPages = () => {
    deleteFile(ineligibleView);
};
const restoreRoutes = () => {
    cy.task('copyFromStarterFiles', { filename: appRoutesPath });
};
export { setUpPages };
export { setUpBranchingPages };
export { setUpData };
export { cleanUpPages };
export { cleanUpBranchingPages };
export { clearUpData };
export { restoreRoutes };
export default {
    setUpPages,
    setUpBranchingPages,
    setUpData,
    cleanUpPages,
    cleanUpBranchingPages,
    clearUpData,
    restoreRoutes
};
