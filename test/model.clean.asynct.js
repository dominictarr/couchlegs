//model.clean.asynct.js

var model = require('../couchlegs')
  , it = require('it-is')

exports ['clean'] = function (test){

  var schema = model({
    prefix: 'test'
  , models: {
      example1: []
    , example2: []
    }
  })

  schema.clean(function (error){
    schema.example1.info(function (err){
      it(err).equal(null)          
      schema.example2.info(function (err){
      it(err).equal(null)          
           test.done()
      })
    })
  })
}

