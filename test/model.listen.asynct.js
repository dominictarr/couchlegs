var it = require('it-is')
  , log = console.log
  , model = require('../couchlegs')({
      prefix: 'test'
    , clobber: true
    , models: {
        listen_to: []
      , listen_to2: []
      }
    })

exports.__setup = function (test){

  model.clean(test.done)

}

exports ['can pause changes'] = function (test){

  var toSave = [
  {_id: '0', value: Math.random()},
  {_id: '1', value: Math.random()},
  {_id: '2', value: Math.random()} 
 ]

  model.listen_to.changes()
    .on('response', function (res){
      res.on('data', function (data){//
        it(data.id).equal(toSave[data.id]._id)

      if(data.id == 2){
        res.pause()
        console.log('stop listening')
        test.done()
        }

      })
   
    })

  model.listen_to.save(toSave,function (err){
    it(err).equal(null)
  })

}

exports ['listen'] = function (test){

  var toSave = [
    {_id: '0', value: Math.random()}
  , {_id: '1', value: Math.random()}
  , {_id: '2', value: Math.random()} 
  ]
  model.listen_to.save(toSave,function (err){
    console.log("SAVING")
    console.log(err)
    c()
  })
  function c(){
    model.listen_to.listen(function (err,data,res){
        console.log("data --->>>")
        console.log(data)

      if(data.seq){

        it(err).equal(null)
        it(data.id).equal(toSave[data.id]._id)
    
        if(data.id == 2){
          res.pause()
          console.log('stop listening')
          test.done()
          }
      }
    })
  }
}
//*/

exports ['listen to new update and delete'] = function (test){
  var toDelete, toSave = [
          {_id: '0', value: Math.random(), value2: Math.random()}
        , {_id: '1', value: Math.random()}
        , {_id: '2', value: Math.random()}
        ]
      , events = {new: false, update: false, remove: false}
  var toMerge = {_id: '0', value: Math.random(), value2: Math.random()}
  var seqs = 1

  model.listen_to2.save(toSave,function (err,data){
    it(err).equal(null)
    model.listen_to2.merge(toMerge,function (){
      model.listen_to2.remove('1',function (){
        //cradle will get the rev from the cache.
      })
    })
  })

  var l = model.listen_to2.listen()
  l.on('new',function (err,doc,seq){
    console.log("NEW"); console.log({err: err, doc: doc, seq: seq})
    events.new = true

    it(doc).has(toSave[doc._id])
    it(seq).equal(seqs++)
    it(l).property('seq',seq)
  })
  l.on('update',function (err,doc,seq){
    console.log("UPDATE"); console.log({err: err, doc: doc, seq: seq})
    events.update = true

    it(doc).has(toMerge)
    it(seq).equal(4)
    it(l).property('seq',seq)
  })
  l.on('remove',function (err,doc,seq){
    console.log("REMOVE"); console.log({err: err, doc: doc, seq: seq})
    events.remove = true

    it(doc).has({_id: '1', _deleted: true, _rev: it.matches(/^2-/)})
    it(seq).equal(5)
    it(l).property('seq',seq)
  })

  setTimeout(function (){
    l.pause()
    it(events)
      .has({
        new: true
      , update: true
      , remove: true
      })
    test.done()
  },1000)

}//*/


