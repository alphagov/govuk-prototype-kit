@plugins
Feature: Installing and uninstalling plugins
  
  Scenario: Installed - show on installed plugins
    When I visit the installed plugins page
    Then I should see the plugin "Common Templates" in the list
    
  Scenario: Installed - tag as installed
    When I visit the available plugins page
    Then I should see the plugin "Common Templates" in the list
    And The "Common Templates" plugin should be tagged as "Installed"

  Scenario: Uninstalled - hide on installed plugins
    Given I uninstall the "installed:@govuk-prototype-kit/common-templates" plugin
    And I wait for the uninstall to complete
    When I visit the installed plugins page
    Then I should not see the plugin "Common Templates" in the list
    
  Scenario: Uninstalled - don't tag as installed
    Given I uninstall the "installed:@govuk-prototype-kit/common-templates" plugin
    And I wait for the uninstall to complete
    When I visit the available plugins page
    Then I should see the plugin "Common Templates" in the list
    And The "Common Templates" plugin should not be tagged as "Installed"
