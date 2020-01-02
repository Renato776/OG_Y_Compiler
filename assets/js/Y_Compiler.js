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
    initialize:function () {
        this.root = null;
        this.classes = classes;
        this.types["void"] = new type('void');
        this.types["char"] = new type('char');
        this.types["int"] = new type('int');
        this.types["double"] = new type('double');
        this.types["boolean"] = new type('boolean');
    },
    resolve_visibility:function(type_text){
      /*
      * This method removes the visibility modifiers from the type text and trims it.
      * It returns the extracted visibility and the trimmed text as an array with two elements.
      * [0] for visibility and [1] for the the modified text.
      * */
        let visibility = 'public';
        if(type_text.includes('private')){
            type_text = type_text.replace('private','');
            visibility = 'private';
        }else if(type_text.includes('protected')){
            type_text = type_text.replace('protected','');
            visibility = 'protected';
        }else type_text = type_text.replace('public','');
        type_text = type_text.trim();
        return [visibility,type_text];
    },
    disable_modifiers:function(type_text){
        /*
        * This method checks there aren't any modifiers within the type regex
        * and throws exception if any is found.
        * Afterwards it returns the type_text properly trimmed and without the @ at the beginning.
        * */
        if(type_text.includes('public')||type_text.includes('private')||type_text.includes('protected'))
            throw new _compiling_exception('Visibility modifiers not allowed here.');
        if(type_text.includes('abstract')||type_text.includes('final'))
            throw new _compiling_exception('abstract or final modifiers not allowed here.');
        if(type_text.includes('static'))
            throw new _compiling_exception('static keyword not allowed here.');
        type_text = type_text.trim(); //Just in case.
        return type_text.substring(1); //We remove the @
    },
    get_processed_type_node :function(type_signature, dim = 0, model){
        let true_type = new type(type_signature,dim);
        if(!(true_type.signature in Compiler.types))Compiler.types[true_type.signature] = true_type; //We register the new type if not already registered.
        let t = new empty_node(model);
        t.text = true_type.signature;
        t.name = 'type';
        return new _Node(t);
    },
    abstractMethodDecl:function (dim,paramL) { //Prod:: TYPE dimList ID LEFT_PAREN paramDef RIGHT_PAREN SEMI
        let name = _token_stack.pop(); //ID token
        let type_token = _token_stack.pop(); //Type token
        let type_text = type.text; //Type regex
        if(!type_text.includes('abstract'))throw new _compiling_exception("method: "+name.text+" is missing method body, or declare abstract.");
        let v = this.resolve_visibility(type_text);
        let visibility = v[0]; //Extracted visibility
        type_text = v[1]; //Trimmed and processed type_text
        if(visibility=='private') throw new _compiling_exception("An abstract method cannot be private.");
        if(type_text.includes('static'))throw new _compiling_exception("Cannot declare a method as abstract and static at the same time.");
        type_text = type_text.replace('abstract','').trim();
        type_text = type_text.substring(1); //We remove the @ at the beginning.
        let true_type = new type(type_text,dim);
        if(!(true_type.signature in Compiler.types))Compiler.types[true_type.signature] = true_type; //We register the new type if not already registered.
        let res = new _Node("abstractMethod");
        res.add(new details(visibility,false,true,false,true_type.signature,type_token));
        res.add(new _Node(name));
        res.add(paramL);
        return res;
    },
    methodDecl:function (dim,paramL,stmtL) { //prod::  TYPE ID LEFT_PAREN paramDef RIGHT_PAREN LEFT_BRACE stmtL RIGHT_BRACE
        let name = _token_stack.pop(); //ID token
        let type_token = _token_stack.pop(); //Type token
        let type_text = type_token.text;
        let v = this.resolve_visibility(type_text);
        let visibility = v[0]; //Extracted visibility
        type_text = v[1]; //Trimmed and processed type_text
        if(type_text.includes('abstract'))throw new _compiling_exception("An abstract method cannot be implemented in the same class it is declared on.");
        if(type_text.includes('final'))throw new _compiling_exception('Final modifier cannot be applied to methods');
        let res;
        if(type_text.includes('static')){ //static declaration
            type_text = type_text.replace('static','').trim();
            type_text = type_text.substring(1);
            let true_type = new type(type_text,dim);
            if(!(true_type.signature in Compiler.types))Compiler.types[true_type.signature] = true_type; //We register the new type if not already registered.
            res = new _Node("staticMethod");
            res.add(new details(visibility,true,false,false,true_type.signature,type_token));
            res.add(new _Node(name));
            res.add(paramL);
            res.add(stmtL);
        }else{ //normal declaration
            type_text = type_text.substring(1);
            let true_type = new type(type_text,dim);
            if(!(true_type.signature in Compiler.types))Compiler.types[true_type.signature] = true_type; //We register the new type if not already registered.
            res = new _Node("method");
            res.add(new details(visibility,false,false,false,true_type.signature,type_token));
            res.add(new _Node(name));
            res.add(paramL);
            res.add(stmtL);
        }
        return res;
    },
    constructorDecl:function (paramL,stmtL) { //prod:: TYPE LEFT_PAREN paramDef RIGHT_PAREN LEFT_BRACE stmtL RIGHT_BRACE
        let type_token = _token_stack.pop(); //Type token
        let type_text = type_token.text;
        let v = this.resolve_visibility(type_text);
        let visibility = v[0]; //Extracted visibility
        type_text = v[1]; //Trimmed and processed type_text
        if(type_text.includes('static'))throw new _compiling_exception('Cannot declare a constructor as static.');
        if(type_text.includes('abstract'))throw new _compiling_exception('Cannot declare an abstract constructor.');
        if(type_text.includes('final'))throw new _compiling_exception('Cannot declare a final constructor.');
        type_text = type_text.substring(1);
        if(type_text!=type_token._class)throw new _compiling_exception('The constructor must have the same name as the class which is making reference to.');
        let v_token = new empty_node(type_token);
        v_token.name = 'visibility';
        v_token.text = visibility;
        let res = new _Node("constructor");
        res.add(new _Node(v_token));
        let target = new empty_node(type_token);
        v_token.name = 'target';
        v_token.text = type_text;
        res.add(new _Node(target));
        res.add(paramL);
        res.add(stmtL);
    },
    fieldDecl:function (dim,exp) { //prod: TYPE ID dimList SEMI
        let name = _token_stack.pop(); //ID token
        let type_token = _token_stack.pop(); //Type token
        let type_text = type_token.text;
        let v = this.resolve_visibility(type_text);
        let visibility = v[0]; //Extracted visibility
        type_text = v[1]; //Trimmed and processed type_text
        if(type_text.includes('abstract'))throw new _compiling_exception('Cannot declare an abstract field.');
        let final = false;
        if(type_text.includes('final')){
            type_text = type_text.replace('final','').trim();
            final = true;
        }
        let res;
        let _static = type_text.includes('static');
        if(_static) { //static field
            type_text = type_text.replace('static', '').trim();
            res = new _Node('staticField');
        }else res = new _Node('field');

        type_text = type_text.substring(1);
        let true_type = new type(type_text,dim);
        if(!(true_type.signature in Compiler.types))Compiler.types[true_type.signature] = true_type; //We register the new type if not already registered.
        let _details = new details(visibility,_static,false,final,true_type.signature,type_token);
        res.add(_details);
        res.add(new _Node(name));
        if(exp!=null)res.add(exp);
        return res;
    },
    paramDef:function (dim) { //prod:: TYPE ID COMMA ...
        let name = _token_stack.pop(); //ID token
        let type_token = _token_stack.pop(); //Type token
        let type_text = type_token.text;
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_text),dim,type_token);
        let res = new _Node('param');
        res.add(type_node);
        res.add(new _Node(name));
        return res;
    },
    variableDef:function (dim, exp = null) { //prod:: TYPE ID SEMI
        let name = _token_stack.pop(); //ID token
        let type_token = _token_stack.pop(); //Type token
        let type_text = type_token.text;
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_text),dim,type_token);
        let res = new _Node('variableDef');
        res.add(type_node);
        res.add(new _Node(name));
        if(exp!=null)res.add(exp);
        return res;
    },
    update:function (code) { //prod:: ID ++
        let target = _token_stack.pop(); //ID token.
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
    staticAccess:function (target) { //Prod: Type DOT var
        let type_token = _token_stack.pop(); //Type token
        let type_text = type_token.text;
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_text),0,type_token);
        if(!(type_node.text in Compiler.classes))throw new _compiling_exception(type_node.text+" is not a class.");
        let res = new _Node('staticAccess');
        res.add(type_node);
        res.add(target);
        return res;
    },
    varNode:function (fieldAccess, list) {
        let res;
        let target = _token_stack.pop(); //ID token
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
    downcast:function () { //prod:: ( type )
        let res = new _Node('downcast');
        let type_token = _token_stack.pop(); //Type token
        let type_text = type_token.text;
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_text),0,type_token);
        res.add(type_node);
        return res;
    },
    primitive :function () { //prod:: primitive
        let primitive = _token_stack.pop();
        return new _Node(primitive);
    },
    NEW : function (paramL) { //prod:: NEW TYPE LEFT_PAREN paramList RIGHT_PAREN
        let type_token = _token_stack.pop(); //Type token
        let type_text = type_token.text;
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_text),0,type_token);
        let res = new _Node('new');
        res.add(type_node);
        res.add(paramL);
        return res;
    },
    arrayInitialization:function (firstIndex) {//prod:: NEW TYPE LEFT_BRACKET Exp RIGHT_BRACKET
        let type_token = _token_stack.pop(); //Type token
        let type_text = type_token.text;
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_text),0,type_token);
        let res = new _Node('arrayInitialization');
        res.add(type_node);
        let indexL = new _Node('indexL');
        indexL.add(firstIndex);
        res.add(indexL);
        return res;
    }
};