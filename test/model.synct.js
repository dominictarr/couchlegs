/*
must be able to start the database sync, to be nice with how the application starts.

initialize the database is a separate thing.
*/


var it = require ('it-is')
  , model = require('../couchlegs')
exports ['setup database names'] = function (){
  var cradleAPI = 
    it.has({
      databases:    it.function() //Get list of databases
    , config:       it.function() //Get server config
    , info:         it.function() //Get server information
    , stats:        it.function() //Statistics overview
    , activeTasks:  it.function() //Get list of currently active tasks
    , uuids:        it.function() //Get count list of UUIDs
    , replicate:    it.function() //Replicate a database.
    , schema:       it.typeof('object') //the the schema is convienence for 
    , initialize:   it.function() //set up the database
    })

  var DBAPI = 
    it.has({
      info:         it.function() //Database information
    , all:          it.function() //Get all documents
    , allBySeq:     it.function() //Get all documents by sequence
    , compact:      it.function() //Compact database
    , viewCleanup:  it.function() //Cleanup old view data
    , replicate:    it.function() //Replicate this database to target.
    })

  var m =
    model({
      models: {
        fruit:    []
      , bicycles: []
      , webApps:  []
      }
    })

  cradleAPI(m)
  it(m).has({
    fruit:    DBAPI
  , bicycles: DBAPI
  , webApps:  DBAPI
  })
}