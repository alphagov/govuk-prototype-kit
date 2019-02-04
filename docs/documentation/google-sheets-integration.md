# Getting data from Google Sheets

**Advanced topic**


## How to use

1. Follow step 1 & 2 of the following blog post:

[https://medium.com/dilwoar-hussain/use-google-sheets-as-a-database-in-3-easy-steps-d0330a4bb3b3](https://medium.com/dilwoar-hussain/use-google-sheets-as-a-database-in-3-easy-steps-d0330a4bb3b3)

2. In app/routes.js add:

```javascript
const request=require('request')
const csv=require('csvtojson')

```

```javascript

router.get('/', function (req, res) {
  var googleSheetsUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8oXOIqewtlNTyJvplT-QYSlX9UoB8XlV0gSTYBFHxtlF3HwdkVp-vJP7FIVgHhTheL8nKYxcaNu2t/pub?output=csv"; //this is the url for your CSV
  
  csv()
  .fromStream(request.get(googleSheetsUrl))
  .then((googleSheetsData)=>{
    res.render('google-sheets-example', { googleSheetsData: googleSheetsData } )
  });

})

```

2. In the view add:

```HTML
<table class="govuk-table">
  <caption class="govuk-table__caption">Tunbridge Wells Open Data - Polling Districts</caption>
  <thead class="govuk-table__head">
    <tr class="govuk-table__row">
      <th class="govuk-table__header" scope="col">OBJECTID</th>
      <th class="govuk-table__header" scope="col">Letter</th>
      <th class="govuk-table__header" scope="col">Polling_Di</th>
      <th class="govuk-table__header" scope="col">Ward</th>
      <th class="govuk-table__header" scope="col">Parliament</th>
      <th class="govuk-table__header" scope="col">ADDRESS</th>
      <th class="govuk-table__header" scope="col">County_Div</th>
      <th class="govuk-table__header" scope="col">ShapeSTArea</th>
    </tr>
  </thead>
  <tbody class="govuk-table__body">
    {% for item in googleSheetsData %}
    <tr class="govuk-table__row">
      <td class="govuk-table__cell">{{ item["OBJECTID"] }}</td>
      <td class="govuk-table__cell">{{ item['Letter'] }}</td>
      <td class="govuk-table__cell">{{ item['Polling_Di'] }}</td>
      <td class="govuk-table__cell">{{ item['Ward'] }}</td>
      <td class="govuk-table__cell">{{ item['Parliament'] }}</td>
      <td class="govuk-table__cell">{{ item['ADDRESS'] }}</td>
      <td class="govuk-table__cell">{{ item['County_Div'] }}</td>
      <td class="govuk-table__cell">{{ item['ShapeSTArea'] }}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>
```

See [Demo](/docs/examples/google-sheets)
