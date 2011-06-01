var ODM = require('../couchlegs')
  , it = require('it-is')


/*
OKAY: this will be handy!

  check if model bulk stuff is already inserted, and update if necessary.
  add clobberDb option (dump db and start over) -- will be handy for testing.

*/

exports ['creates database if necessary'] = function (test){

  var m =   ODM({
    host: 'localhost'
  , port: 5984
  , prefix: 'test-drop'
//, clobber: true //drop old databases
//, force: true //always update initial documents
  , models:{
      example: []
    }
  })

  m.example.info(function (err){
    if(err)
      console.log('database: test-drop-example does not exist')
    m.initialize(function (){
      m.example.info(function (err){


        m.example.destroy(function (err){
          it(err).equal(null)
          m.example.info(function (err){
            it(err).ok()

            m.initialize(function (){
              m.example.info(function (err){
                test.done()
              })
            })
          })        
        })
      })
    })
  })
}

exports ['model.init'] = function (test){
  ODM({
    host: 'localhost'
  , port: 5984
  , prefix: 'test'
//, clobber: true //drop old databases
//, force: true //always update initial documents
  , models:{
      example: [
        { _id: '_design/validate'
        , validate_doc_update: function (doc) {
            if (!doc.hello /*|| 'string' !== typeof doc.hello */) 
              throw {
                error: "missing field"
              , reason: "document.hello must be a string"
              }
          }
        },
        { _id: '_design/views'
        , views: {
            all:
            { map: function (doc) {
                  emit(doc._id, doc)
                }
            }
          }
        }
      ]
    }
  }).initialize(c)

  function c(err,model){
    it(err).equal(null)
    it(model).property('example',it.ok())

    model.example.save([
      {_id: '1', hello: "hi"}
    , {_id: '2', hello: "hi there!"}
    , {_id: '3', hello: "houdy"}
    ], c)
    
    function c(err){
      console.log(err)
      if(err) throw err
      model.example.view('views/all',function (err,data){
        it(err).equal(null)
        it(data.rows).property('length',3)

        test.done()
      })
    }
  }
}

exports ['model.init clobber'] = function (test){
  var rand1 = Math.random(),rand2 = Math.random()

  ODM({
    prefix: 'test'
  , clobber: true //drop old databases
//, force: true //always update initial documents
  , models:{ clobber: [{ _id: 'random', val: rand1 }]}
  }).initialize(c)

  function c(err,m){
     it(err).equal(null)
     it(m).property('clobber',it.ok())

    ODM({
      prefix: 'test'
    , clobber: true //drop old databases
  //, force: true //always update initial documents
    , models:{ clobber: [{ _id: 'random', val: rand2 }]}
    }).initialize(c)
  
    function c(err,model){
     it(err).equal(null)
     it(model).property('clobber',it.ok())
       
      model.clobber.get('random',function (err,data){
        it(data).property('val',rand2)
        
        model.clobber.save({_id: 'systematic',val: 123456789}, c)
        function c(err, data){
          console.log(data)
          test.done()
        }
      })
    }
  }
}
