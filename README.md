# MultiSelectList

Custom jQuery plugin to work with multiple search selections (like the one in Semantic UI: http://semantic-ui.com/modules/dropdown.html#multiple-search-selection)

# Install

1. Just clone the repository and insert it into your application. 
2. Initiliaze the plugin by running: 

var jsonSource =  [{ Value: 0, Text: 'ASP.NET' }, { Value: 1, Text: 'AngularJS' }, { Value: 2, Text: 'PowerCenter' }, { Value: 3, Text: 'Oracle SQL Developer' }, { Value: 4, Text: 'PHP' }];

$('.select-list').selectList({dataSource: jsonSource});

Notes: $('.select-list') must be an input. It will throw an error otherwise: "Invalid input for select list"

# Options

1. Input width

  $('.select-list').selectList({dataSource: jsonSource, width:'50%'});
  
  Default width is "100%".

2. Data Source URL

  $('.select-list').selectList({ dataURL: "http://example.com/api/GetExampleData" });

3. Autocomplete from server

  By default, whatever source you choose, the autocomplete will be made offline based on the initial collection. If, however, you are supplying your data from a webservice and want your autocomplete to fetch from server you must pass the option "autocompleteFromServer":
  $('.select-list').selectList({ dataURL: "http://example.com/api/GetExampleData"  , autocompleteFromServer: true});

  Also the default minimal length for server side autocomplete is 3. You can also pass "autocompleteMinLength" to change to whatever you like:
  
  $('.select-list').selectList({ dataURL: "http://example.com/api/GetExampleData"  , autocompleteFromServer: true, autocompleteMinLength:1});

4. Vertical Display \*New\*
  
  If the selections are to be added vertically the option "verticalDisplay" must be set to true:
  $('.select-list').selectList({ verticalDisplay: true, dataURL: "http://example.com/api/GetExampleData"});

5. Previously entered data \*New\*

   If you have previously saved data, and want to fill the control on initialization you must provide the values(ids) with the option "prevData":
  
  $('.select-list').selectList({ prevData: [1,2,3,4,5], dataURL: "http://example.com/api/GetExampleData"});

  
Notes: 
  1. Client side minimal length autocomplete is 1 and it is not configurable for now (personal choice).
  2. A source must be supplied when initializing the plugin or it will throw an error: "Invalid data source"

# Methods

1. Destroy

  $('.select-list').data('selectList').destroy()

2. Get final data

  $('.select-list').data('selectList').getChoices()
  It will return an object array with the same format as the data source in the INSTALL section

  $('.select-list').data('selectList').getChoicesCSV()
  It will return a string with the values separated by commas

# Live Demo

https://codepen.io/XFrEaK/pen/PNeoBN
