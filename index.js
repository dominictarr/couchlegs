
var cradle = require('cradle')
  , queue = require('queue-width')

exports.init = function (obj,cb){
  obj = obj || {}
  var cc = new(cradle.Connection)(obj.host || 'http://localhost', obj.port || 5984, {
      cache: true,
      raw: false
  });

  var model = {}
  model.__proto__ = cc 

  var dbs = Object.keys(obj.models)

  queue(dbs,0).forEach(function (name){
    var self = this
      , db = model.database(obj.prefix + '-' + name)
    model[name] = db
    db.info(function (err){

      if(err){
         create()
      } else if(obj.clobber){
        db.destroy(create)
      } else {
        update()
      }

      function create(){
        db.create(update)
      }
      
      /* this updates every single, but it's good enough for me, right now. */

      function update(){
        if(!obj.models[name].length)
          return self.next()

        db.save(obj.models[name],function (err){
          if(err) throw err
          self.next(err)
        })
      }
    })
    return db
  },function c(){
    cb(model)
  })
}

