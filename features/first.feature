@plugins
Feature: Installed and uninstalled plugins

  
  Scenario: Installed
    When I visit the the installed plugins page
    Then I should see the plugin "Common Templates" in the list
    
  Scenario: Installed
    When I visit the the available plugins page
    Then I should see the plugin "Common Templates" in the list
    And The "Common Templates" plugin should be tagged as "Installed"

  Scenario: Uninstalled
    Given I uninstall the "Common Templates" plugin
    When I visit the the installed plugins page
    Then I should not see the plugin "Common Templates" in the list
    
  Scenario: Uninstalled
    Given I uninstall the "Common Templates" plugin
    When I visit the the available plugins page
    Then I should see the plugin "Common Templates" in the list
    And The "Common Templates" plugin should not be tagged as "Installed"
