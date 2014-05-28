var
  util = require('util'),
  _kindof = require('kindof'),
  events = require('events'),
  traverse = require('traverse'),

  Store = require('./store');

var gaed = module.exports = exports = events;

kindof = function (value) {
  var ko = _kindof(value);
  if (ko === 'string') {
    try {
      var dt = new Date(value);
      if (!isNaN(dt.getTime()))
        ko = 'date';
    }
    catch (ex) {
      //do nothing
    }
  }
  return ko;
};

gaed.transform = function (collection, obj) {
  var result = {};
  var traveresed = traverse(obj).map(function (x) {
    var kind = kindof(x);
    var value = null;

    if (!this.isRoot && this.isLeaf) {
      switch (kind) {
        case 'string':
          value = {'stringValue': x, indexed: true};
          break;
        case 'number':
          value = {'doubleValue': x, indexed: true};
          break;
        case 'boolean':
          value = {'booleanValue': x, indexed: true};
          break;
        case 'date':
          value = {'dateTimeValue': x, indexed: true};
          break;
        default:
          value = {'stringValue': x, indexed: true};
          break;

      }
      this.update(value, true);
    }
    else if (!this.isRoot && !this.isLead) {
      switch (kind) {
        case 'object':
          this.remove();
          var entityValue = gaed.transform(collection, x);
          value = {'entityValue': entityValue, indexed: false};
          //this.key = 'entityValue';
          break;

      }
      this.update(value, true);
    }
  });
  var _key = obj._key || (obj.timestamp ? new Date(obj.timestamp).getTime() : null);
  if (_key) {
    result.key = {
      path: [
        { kind: collection, name: _key}
      ]
    };
  }
  result.properties = traveresed;
  return result;
};

gaed.push = function (datastore, collection, documents, options, callback) {
  var store = new Store();

  return store.authorize(datastore, function (err, datastore) {
    if (err)
      return callback(err);

    var entities = [];

    documents.forEach(function (doc) {
      //var transformed = gaed.transform(doc);
      entities.push(gaed.transform(collection, doc));
    });

    // Build a mutation to insert the new entity.
    var mutation = {insert: entities};

    store.beginTransaction(datastore, function (err, transaction) {
      // Commit the transaction and the insert mutation if the entity was not found.
      datastore.commit({
        transaction: transaction,
        mutation: mutation
      }).execute((function (err, result) {
        if (err)
          return callback(err);
        return callback(null);
      }).bind(this));
    });
  });
};

gaed.lookup = function (datastore, collection, query, callback) {
  var store = new Store();

  return store.authorize(datastore, function (err, datastore) {
    if (err)
      return callback(err);

    //store.beginTransaction(datastore, function (err, transaction) {
    // Get entities by key.
    var start_ts = new Date().getTime();
    datastore.runQuery({
      readOptions: {
        // Set the transaction, so we get a consistent snapshot of the
        // value at the time the transaction started.
        //transaction: transaction
      },
      query: {
        kinds: [
          {name: collection}
        ]
      }
      // Add one entity key to the lookup request, with only one
      // `path` element (i.e. no parent).
      /*keys: [
       { path: [
       { kind: collection }
       ] }
       ]*/
    }).execute((function (err, result) {
    var end_ts = new Date().getTime();
      if (err)
        return callback(err);

      console.log(result, end_ts-start_ts);

      return callback(null, result);
    }).bind(this));
    //});
  });
};