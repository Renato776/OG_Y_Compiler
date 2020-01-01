const type = function (signature,dimension = 0) {
  this.signature = signature;
  if(dimension==0)this.array = false;
  else {
      this.array = true;
      //Array constructor stuff.
  }
};
const Compiler = {
    root: null,
    types:{},
    classes:{},
    initialize:function () {
        this.root = null;
        this.classes = classes;
        this.types["void"] = new type('void');
        this.types["char"] = new type('char');
        this.types["int"] = new type('int');
        this.types["double"] = new type('double');
        this.types["boolean"] = new type('boolean');
    }
};