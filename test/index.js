var
  gaed = require('../index.js'),
  util = require('util');

var document = {
  timestamp: new Date(),
  attribute: 'attribute',
  number: 123,
  entity: {
    nattribute: 'test',
    number: 1234,
    entity2: {
      attribute3: 'test1111',
      number22: 222
    }
  }
};
/*
gaed.push('integrated-net-594', 'pushtest123', [document], {}, function (err) {
  if (err)
    console.log(err);

  console.log('push done');
});
*/
var query = {
  timeframe: 'last_month',
  interval: 'day',
  dimensions: ['timestamp'],
  metrics: ['number'],
  collection: 'pushtest123'
};

gaed.lookup('integrated-net-594', 'pushtest123', query, function (err, result) {
  if (err)
    console.log(err);

  //console.log(util.inspect(result.batch.entityResults, {depth: null, colors: true}));
});