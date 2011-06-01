
var cradle = require('cradle')
  , ctrl = require('ctrlflow')
  , EventEmitter = require('events').EventEmitter 
  , log =  console.log
  
module.exports = function (obj){

  obj = obj || {}
  var cc = new(cradle.Connection)(obj.host || 'http://localhost', obj.port || 5984, {
      cache: true,
      raw: false
  });

  var model = { 
    initialize: init
  , schema: obj
  , clean: clean 
  , destroyAll: destroyAll }

  model.__proto__ = cc 

  var dbs = Object.keys(obj.models)

  dbs.forEach(function (name){
    var self = this
      , db = model.database(obj.prefix ? obj.prefix + '-' + name : name)
      
      
    model[name] = {listen: listen}
    model[name].__proto__ = db
  })

  return model
}

function destroyAll(cb){
  var error
  var dbs = Object.keys(this.schema.models)
    , model = this

  ctrl.width(dbs).forEach(function (db){
    var next = this.next
    model[db].destroy(function (err){
      error = error || err
      next()
    })
  },cb)
}

function clean(cb){
  var model = this
  model.destroyAll(function (){model.initialize(cb)})
}

function init(cb){

  var model = this
    , obj = this.schema

  var dbs = Object.keys(obj.models)

  ctrl.width(dbs,0).forEach(function (name){
    var db = model[name]
      , self = this
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
  },function c(err){
    cb(err,model)
  })
  
  return model
}

function listen(){
  var opts, funx;
  
  if('object' == typeof arguments[0])
    opts = Array.prototype.shift.apply(arguments)

  var funx = Array.prototype.pop.apply(arguments)
//  var opts = Array.prototype.shift.apply(arguments)
//  var obj = 'object' == typeof funx ? funx : null
  var emitter = new EventEmitter
  var ready = ctrl.defer(emitter,['pause','resume'])

  if('function' == typeof funx)
    emitter.on('data',funx)
  

  /*
    it's a quirk that errors (caused when saving etc,) get added to the changes stream.
    we'll emit them, but we don't want them crashing node. 
    so have a function to handle (ignore) them.
  */
  emitter.on('error',function (){})

  var self = this
  this.changes(opts).on('response',function(res){
    res.emit('response',res)
    ready(res)
    res.on('data',function (data){
      if(data.error){
        emitter.emit('data',data,null,res)
      } else {
        emitter.emit('data',null,data,res)
        /*
          emit: new, update, delete
          seq: what seq your up to.
          if listener has _id, save it in database: _meta
          and retrive it's seq next time. unless it's explicitly given.
        */

        if( 'number' == typeof data.seq 
          &&  Array.isArray(data.changes)
          && 'string' == typeof data.id ){  

          console.log(data,opts && opts.stage)
//          console.log()
          var rev = data.changes[0].rev
          console.log("get:", data.id,rev)
          self.get(data.id,rev,function (err,doc){
            emitter.seq = data.seq
  //          console.log("EMIT DOC")
//            console.log(doc)
            if(rev.indexOf('1-') == 0) {
              emitter.emit('new',err,doc,data.seq)
            } else if (!data.deleted) {
              emitter.emit('update',err,doc,data.seq)
            } else {
              emitter.emit('remove',err,doc,data.seq)
            }
          })

        } else {
          emitter.emit('error',data)//strange place for it, but errors can come through from here.
        }
      }
    })
    res.on('end', function (){
      emitter.emit('end')
    })
  })

  return emitter
}