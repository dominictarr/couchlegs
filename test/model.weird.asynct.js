var odm = require('../couchlegs')
  , it = require('it-is')
  , model = odm({
      prefix: 'test'
    , models: { twice: [{_id: "hello", value: 234234}] }
    })
    
exports.__setup = function (test){
  model.initialize(function (){test.done()})
}


/*
cradle needs argument checking.

if you call get without id it goes weird.
*/

exports ['get same id twice'] = function (test){
  model.twice.get("hello",function (err,doc1){
    model.twice.get("hello",function (err,doc2){
      it(doc1).deepEqual(doc2)
      test.done()
    })
    
//    test.done()
  })
//test.done()
}
