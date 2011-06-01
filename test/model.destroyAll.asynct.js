//model.destroyAll.asynct.js

var model = require('../couchlegs')
  , it = require('it-is')
  , ctrl = require('ctrlflow')

exports ['destroyAll'] = function (test){

  var schema = model({
    prefix: 'test'
  , models: {
      example1: []
    , example2: []
    }
  })

  schema.initialize(function (error){
   var g = ctrl.group(function (err,args){
        console.log(args)
      it(err).equal(null)
      it(args).has([
        [it.equal(null)]
      , [it.equal(null)]
      ])
      dest()
    })
    schema.example1.info(g())
    schema.example2.info(g())
   })
  
  function dest(){
  
    schema.destroyAll(function (err){
      var g = ctrl.group(function (err,args){
        it(args).has([
          [{ error: "not_found", reason: "no_db_file" }]
        , [{ error: "not_found", reason: "no_db_file" }]
        ])
        test.done()
      })
      schema.example1.info(g())
      schema.example2.info(g())
      
    })  
  }
}
