@plugins
Feature: Handle plugin update
    
    Scenario: When a dependency is now required
      Given I have a the required SCSS to avoid plugins breaking when GOV.UK Frontend is uninstalled
      And I install the "npm:@govuk-prototype-kit/common-templates:1.1.1" plugin
      And I wait for the uninstall to complete
      And I uninstall the "govuk-frontend" plugin using the command line
      And I visit the installed plugins page
      And I should not see the plugin "GOV.UK Frontend" in the list
      When I update the "installed:@govuk-prototype-kit/common-templates" plugin
      And I should be informed that "GOV.UK Frontend" will also be installed
      And I continue with the update
      And I wait for the update to complete
      And I visit the installed plugins page
      Then I should see the plugin "Common Templates" in the list
      And I should see the plugin "GOV.UK Frontend" in the list

      
