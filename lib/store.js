var
  googleapis = require('googleapis');

var SCOPES = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/datastore'];

var Store = module.exports = function (options) {
  this.datasets = [];
};

/**
 * Authorize with the Datastore API.
 */
Store.prototype.authorize = function (datasetId, callback) {
  //console.log('auth');
  // First, try to retrieve credentials from Compute Engine metadata server.
  this.credentials = new googleapis.auth.Compute();
  this.credentials.authorize((function (computeErr) {
    if (computeErr) {
      //console.log('computeErr',computeErr);
      var errors = {'compute auth error': computeErr};
      // Then, fallback on JWT credentials.
      this.credentials = new googleapis.auth.JWT(
        process.env['DATASTORE_SERVICE_ACCOUNT'],
        process.env['DATASTORE_PRIVATE_KEY_FILE'],
        SCOPES);
      this.credentials.authorize((function (jwtErr) {
        if (jwtErr) {
          //console.log('jwtErr',jwtErr);
          //errors['jwt auth error'] = jwtErr;
          //this.emit('error', errors);
          return callback(jwtErr);
        }
        return this.connect(datasetId, callback);
      }).bind(this));
    }
    //return this.connect(datasetId, callback);
  }).bind(this));
};


/**
 * Connect to the Datastore API.
 */
Store.prototype.connect = function (datasetId, callback) {
  //console.log('connect');
  // Build the API bindings for the current version.
  googleapis.discover('datastore', 'v1beta2')
    .withAuthClient(this.credentials)
    .execute((function (err, client) {
      if (err) {
        console.log('connect err',err);
        //this.emit('error', {'connection error': err});
        return callback(err);
      }
      // Bind the datastore client to datasetId and get the datasets
      // resource.
      var datastore = client.datastore.withDefaultParams({datasetId: datasetId}).datasets;
      return callback(null, datastore);
    }).bind(this));
};

Store.prototype.beginTransaction = function (datastore, callback) {
  datastore.beginTransaction({
    // Execute the RPC asynchronously, and call back with either an
    // error or the RPC result.
  }).execute((function (err, result) {
    if (err) {
      //this.emit('error', {'rpc error': err});
      return callback(err);
    }
    return callback(null, result.transaction);
    //this.lookup();
  }).bind(this));
};

