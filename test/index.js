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
//var transformed = gaed.transform(document);
//transformed._key = new Date().getTime();
//
//return;

gaed.push('integrated-net-594', 'push-test123', [document], {}, function (err) {
  if (err)
    console.log(err);

  console.log('push done');
});

gaed.lookup('integrated-net-594', 'push-test123', {}, function (err, result) {
  if (err)
    console.log(err);

  //console.log(util.inspect(result.batch.entityResults, {depth: null, colors: true}));
});