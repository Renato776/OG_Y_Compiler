const empty_node = function (model) {
    return new _token(null,null,null,null,null,null,false,model);
};
const details = function (visiblity,_static = false, abstract = false, final = false, type,model) {
    let d = new _Node("details");
    let v = new empty_node(model);
    v.text = visiblity;
    v.name = 'visibility';
    let s = new empty_node(model);
    s.text = _static;
    s.name = 'static';
    let a = new empty_node(model);
    a.text = abstract;
    a.name = 'abstract';
    let t =  new empty_node(model);
    t.text = type;
    t.name = 'type';
    let f = new empty_node(model);
    f.text = final;
    f.name = 'final';
    d.add(new _Node(v));
    d.add(new _Node(s));
    d.add(new _Node(a));
    d.add(new _Node(f));
    d.add(new _Node(t));
    return d;
};
const array = function (dimensions,true_type) {
    this.type = true_type;
    this.signature = "";
    for(let i = 1; i<=dimensions;i++){
        this.signature+="array|";
    }
    this.signature+=true_type;
    this.dimensions = dimensions;
};
const type = function (signature,dimension = 0) {
  this.signature = signature;
  if(this.signature in Compiler.classes)this._class = true;
  else this._class = false;
  if(dimension==0){
      this.isArray = false;
      this.array = null;
  }  else {
      this.isArray = true;
      this.array = new array(dimension,this);
  }
  if(!this._class&&!this.isArray)this.primitive = true;
  else this.primitive = false;
};
const Compiler = {
    root: null,
    types:{},
    classes:{},
    ast_visualization:"",
    indenting:"",
    color_stack:[],
    aux_color_stack:[],
    public_regex : new RegExp('^public[ \r\t]'),
    private_regex : new RegExp('^private[ \r\t]'),
    protected_regex : new RegExp('^protected[ \r\t]'),
    static_regex : new RegExp('[ \r\t]static[ \r\t]'),
    abstract_regex : new RegExp('[ \r\t]abstract[ \r\t]'),
    final_regex : new RegExp('[ \r\t]final[ \r\t]'),
    type_regex: new RegExp('@[a-zA-Z_]+[0-9]*'),
    initialize:function () {
        $("#AST_Container").empty();
        this.color_stack = [];
        this.aux_color_stack = [];
        this.ast_visualization = "";
        this.indenting = "";
        this.root = null;
        this.classes = classes;
        this.types = {};
        this.types["void"] = new type('void');
        this.types["char"] = new type('char');
        this.types["int"] = new type('int');
        this.types["double"] = new type('double');
        this.types["boolean"] = new type('boolean');
    },
    extract_type:function(type_text){
        return type_text.match(this.type_regex)[0].substring(1);
    },
    resolve_modifiers:function(type_token,dim){
       let type_text = type_token.text;
       let visibility = 'public';
       let final = false;
       let abstract = false;
       let _static = false;
       if(this.private_regex.test(type_text))visibility = 'private';
       if(this.protected_regex.test(type_text))visibility = 'protected';
       if(this.final_regex.test(type_text))final = true;
       if(this.abstract_regex.test(type_text))abstract = true;
       if(this.static_regex.test(type_text))_static = true;
       let true_type = new type(this.extract_type(type_text),dim);
       if(!(true_type.signature in Compiler.types))Compiler.types[true_type.signature] = true_type; //We register the new type if not already registered.
       let res = new details(visibility,_static,abstract,final,true_type.signature,type_token);
       return {token:res,final:final,abstract:abstract,_static:_static,visibility:visibility,type:true_type.signature};
    },
    disable_modifiers:function(type_text){
        /*
        * This method checks there aren't any modifiers within the type regex
        * and throws exception if any is found.
        * Afterwards it returns the type_text properly trimmed and without the @ at the beginning.
        * */
        if(this.public_regex.test(type_text)
        ||this.private_regex.test(type_text)
        ||this.protected_regex.test(type_text)
        ||this.final_regex.test(type_text)
        ||this.abstract_regex.test(type_text)
        ||this.static_regex.test(type_text))throw new _compiling_exception('Member modifiers not allowed here.');
        return this.extract_type(type_text);
    },
    get_processed_type_node :function(type_signature, dim = 0, model){
        let true_type = new type(type_signature,dim);
        if(!(true_type.signature in Compiler.types))Compiler.types[true_type.signature] = true_type; //We register the new type if not already registered.
        let t = new empty_node(model);
        t.text = true_type.signature;
        t.name = 'type';
        return new _Node(t);
    },
    abstractMethodDecl:function (type_token,name,dim,paramL) { //Prod:: TYPE dimList ID LEFT_PAREN paramDef RIGHT_PAREN SEMI
        let processed_details = this.resolve_modifiers(type_token,dim);
        if(!processed_details.abstract)throw new _compiling_exception("method: "+name.text+" is missing method body, or declare abstract.");
        if(processed_details.visibility=='private') throw new _compiling_exception("An abstract method cannot be private.");
        if(processed_details._static)throw new _compiling_exception("Cannot declare a method as abstract and static at the same time.");
        let res = new _Node("abstractMethod");
        res.add(processed_details.token);
        res.add(new _Node(name));
        res.add(paramL);
        return res;
    },
    methodDecl:function (type_token,name,dim,paramL,stmtL) { //prod::  TYPE ID LEFT_PAREN paramDef RIGHT_PAREN LEFT_BRACE stmtL RIGHT_BRACE
        let processed_details = this.resolve_modifiers(type_token,dim);
        if(processed_details.abstract)throw new _compiling_exception("An abstract method cannot be implemented in the same class it is declared on.");
        if(processed_details.final)throw new _compiling_exception('Final modifier cannot be applied to methods');
        let res;
        if(processed_details._static){ //static declaration
            res = new _Node("staticMethod");
            res.add(processed_details.token);
            res.add(new _Node(name));
            res.add(paramL);
            res.add(stmtL);
        }else{ //normal declaration
            res = new _Node("method");
            res.add(processed_details.token);
            res.add(new _Node(name));
            res.add(paramL);
            res.add(stmtL);
        }
        return res;
    },
    constructorDecl:function (type_token,paramL,stmtL) { //prod:: TYPE LEFT_PAREN paramDef RIGHT_PAREN LEFT_BRACE stmtL RIGHT_BRACE
        let processed_details = this.resolve_modifiers(type_token,0);
        if(processed_details._static)throw new _compiling_exception('Cannot declare a constructor as static.');
        if(processed_details.abstract)throw new _compiling_exception('Cannot declare an abstract constructor.');
        if(processed_details.final)throw new _compiling_exception('Cannot declare a final constructor.');
        let v_token = new empty_node(type_token);
        v_token.name = 'visibility';
        v_token.text = processed_details.visibility;
        let res = new _Node("constructor");
        res.add(new _Node(v_token));
        let target = new empty_node(type_token);
        target.name = 'target';
        target.text = processed_details.type;
        res.add(new _Node(target));
        res.add(paramL);
        res.add(stmtL);
       // return res;
    },
    fieldDecl:function (type_token,name,dim,exp) { //prod: TYPE ID dimList SEMI
        let processed_details = this.resolve_modifiers(type_token,dim);
        if(processed_details.abstract)throw new _compiling_exception('Cannot declare an abstract field.');
        let res;
        if(processed_details._static)res = new _Node('staticField');
        else res = new _Node('field');
        res.add(processed_details.token);
        res.add(new _Node(name));
        if(exp!=null)res.add(exp);
        return res;
    },
    paramDef:function (type_token,name,dim) { //prod:: TYPE ID COMMA ...
        let type_text = type_token.text;
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_text),dim,type_token);
        let res = new _Node('param');
        res.add(type_node);
        res.add(new _Node(name));
        return res;
    },
    variableDef:function (type_token,name,dim, exp = null) { //prod:: TYPE ID SEMI
        let type_text = type_token.text;
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_text),dim,type_token);
        let res = new _Node('variableDef');
        res.add(type_node);
        res.add(new _Node(name));
        if(exp!=null)res.add(exp);
        return res;
    },
    update:function (target,code) { //prod:: ID ++
        let res = new _Node('update');
        res.add(new _Node(target));
        if(isNaN(code)){ //Custom update
            res.add(code); //Code is actually a node.
        }else if(code == 0){ //Auto Increment
            let i = new _Node('post-increment');
            let ii = new _Node('varChain');
            ii.add(new _Node(target));
            i.add(ii);
            res.add(i);
        }else{ //Auto Decrement
            let i = new _Node('post-decrement');
            let ii = new _Node('varChain');
            ii.add(new _Node(target));
            i.add(ii);
            res.add(i);
        }
        return res;
    },
    staticAccess:function (type_token,target) { //Prod: Type DOT var
        let type_text = type_token.text;
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_text),0,type_token);
        if(!(type_node.text in Compiler.classes))throw new _compiling_exception(type_node.text+" is not a class.");
        let res = new _Node('staticAccess');
        res.add(type_node);
        res.add(target);
        return res;
    },
    varNode:function (target,fieldAccess, list) {
        let res;
        let target_node = new _Node(target);
        if(fieldAccess){ //fieldAccess list is either null or a index expression list.
            if(list==null){ //normalAccess
                res = new _Node('normalAccess');
                res.add(target_node);
            }else{ //ArrayAccess
                res = new _Node('arrayAccess');
                res.add(target_node);
                res.add(list);
            }
        }else{ //Function call, list is a param List
            res = new _Node('functionCall');
            res.add(target_node);
            res.add(list);
        }
        return res;
    },
    downcast:function (type_token) { //prod:: ( type )
        let res = new _Node('downcast');
        let type_text = type_token.text;
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_text),0,type_token);
        res.add(type_node);
        return res;
    },
    primitive :function (primitive) { //prod:: primitive
        return new _Node(primitive);
    },
    NEW : function (type_token,paramL) { //prod:: NEW TYPE LEFT_PAREN paramList RIGHT_PAREN
        let type_text = type_token.text;
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_text),0,type_token);
        let res = new _Node('new');
        res.add(type_node);
        res.add(paramL);
        return res;
    },
    arrayInitialization:function (type_token,firstIndex) {//prod:: NEW TYPE LEFT_BRACKET Exp RIGHT_BRACKET
        let type_text = type_token.text;
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_text),0,type_token);
        let res = new _Node('arrayInitialization');
        res.add(type_node);
        let indexL = new _Node('indexL');
        indexL.add(firstIndex);
        res.add(indexL);
        return res;
    },
    build_nodeStructure:function () {
        if (this.root == null) return;
        this.root.printTree();
        $("#AST_Container").html(this.ast_visualization);
    }
};