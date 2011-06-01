var it = require('it-is')
  , log = console.log
  , model = require('../couchlegs')({
      prefix: 'test'
    , clobber: true
    , models: {
        listen_to3: []
      }
    })

exports.__setup = function (test){

  model.clean(test.done)

}

/*
listen from a seq number, 
save the name of a listener, 
to continue later.

(save it in a [prefix]-__meta__ 
also, save the schema etc

so you can start a listener,
and then stop, but next time you create a listener with the same name, you can continue from there.

no. thats a bad idea. this feature is gonna be a little crappy, 
so it shouldn't be implemented on the tool side, 
it should be implemented on the user side.

moved this test into model.listen2 because pausing connections was keeping them alive, 
and eventually stopping new connections from being created.
*/


exports ['continue from an old listener'] = function (test){

var toSave1 = [
          {_id: '0', value: Math.random()}
        , {_id: '1', value: Math.random()}
        , {_id: '2', value: Math.random()}
        ]
  , toSave2 = [
          {_id: '3', value: Math.random()}
        , {_id: '4', value: Math.random()}
        , {_id: '5', value: Math.random()}
        ]


model.listen_to3.save(toSave1,function (err){it(err).equal(null)})

var listener1 = model.listen_to3.listen({_id: 'named_test_listener', stage: '1'})
listener1.on('new', function (err,doc,seq){

console.log("STAGE 1")
console.log({err: err, doc: doc, seq: seq})

  it(seq).equal(1 + (1 * doc._id))
  it(doc).has(toSave1[doc._id])
  if(seq == 3){
    listener1.pause()
    stage2()
  }
})
function stage2 (){

  console.log("STAGE 2")
  model.listen_to3.save(toSave2,function (err){it(err).equal(null)})

  var listener2 = model.listen_to3.listen({_id: 'named_test_listener', since: 4, stage: '2'})

  listener2.on('new', function (err,doc,seq){

  console.log("STAGE 2")
  console.log({err: err, doc: doc, seq: seq})
  
    it(1*seq > 3).ok("seq should be greater than 3")
    it(seq).equal(1 + (1 * doc._id))
    console.log(toSave2[doc._id - 3],doc._id - 3)
    
    it(doc).has(toSave2[doc._id - 3])
    if(seq == 6){
      listener2.pause()
      test.done()
    }
  })
}

}

