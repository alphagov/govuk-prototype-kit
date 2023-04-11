import cypress from "cypress";
import setupNodeEvents from "./cypress/events/index.js";
// npm dependencies
const { defineConfig } = cypress;
export default defineConfig({
    video: false,
    chromeWebSecurity: false,
    trashAssetsBeforeRun: true,
    e2e: {
        setupNodeEvents,
        baseUrl: 'http://localhost:3000',
        specPattern: 'cypress/e2e/**/*.cypress.js'
    }
});
