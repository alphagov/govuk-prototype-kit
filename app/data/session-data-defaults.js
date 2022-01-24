/*

Provide default values for user session data. These are automatically added
via the `autoStoreData` middleware. Values will only be added to the
session if a value doesn't already exist. This may be useful for testing
journeys where users are returning or logging in to an existing application.

============================================================================

Example usage:

"full-name": "Sarah Philips",

"options-chosen": [ "foo", "bar" ]

============================================================================

*/
module.exports = {
  // Example as used in current docs
  claimant: {
    field1: 'Example 1',
    field2: 'Example 2',
    field3: 'Example 3'
  },
  partner: {
    field1: 'Example 1',
    field2: 'Example 2',
    field3: 'Example 3'
  },
  myObject: {
    // Array of objects within object
    myArrayOfObjects: [
      {
        name: 'test1',
        address: 'test2'
      },
      {
        name: 'test3'
      }
    ],
    // Simple array within object
    mySimpleArray: [
      'test4',
      'test5'
    ],
    // Multi-level array within object
    myMultiLevelArray: [
      [
        ['test6', 'test7'],
        'test8'
      ]
    ]
  },
  // Arrays within array
  myArray: [
    [
      'test9',
      ['test10', 'test11']
    ]
  ]
}
