const  END = "---end---";
const SUB_BLOCK = "---sub_block---";
const semantic_exception = function (message,token) {
    token = token.get_token();
    let e = new error_entry('Semantic',token.row,token.col,message,token._class,token.file);
    $("#ErrorTableBody").append(e);
    _log('One or more errors occurred during compilation. See error tab for details');
};
const basic_details = function (type,offset) {
  return {visibility:'public',inherited:false,final:false,type:type,offset:offset};
};
let function_counter = 0;
const Row = function (name,variable=false,details) {
    this.name = name;
    this.block = false;
    this.param = false;
    this.variable = variable;
    this.offset = -1;
    this.type = null;
    this.func = false;
    this.instructions = null;
    this.initialized = false;
    this.size = -1;
    this.true_end = -1;
    this.inherited = false;
    this.final = false;
    this.visibility = 'public';
    this.true_func_signature = "";
    if(variable){
        this.visibility = details.visibility;
        this.final = toBoolean(details.final);
        this.type = details.type;
        this.offset = details.offset;
        this.inherited = toBoolean(details.inherited);
        Compiler.advance_scope();
    }else {
        this.true_func_signature = "___"+function_counter;
        function_counter++;
        this.block = true;
    }
    this.get_header = function () {
        return " <tr>\n" +
            "    <td>index</td>\n" +
            "    <td>block</td>\n" +
            "    <td>func</td>\n" +
            "    <td>param</td>\n" +
            "    <td>variable</td>\n" +
            "    <td>name</td>\n" +
            "    <td>offset</td>\n" +
            "    <td>type</td>\n" +
            "    <td>inherited</td>\n" +
            "    <td>true_end</td>\n" +
            "    <td>size</td>\n" +
            "    <td>final</td>\n" +
            "    <td>visibility</td>\n" +
            "  </tr>";
    };
    this.get_visualization = function(index){
        return  "<tr>" +
            "<td>"+index+") </td>\n" +
            "<td>"+this.block+"</td>" +
            "<td>"+this.func+"</td>" +
            "<td>"+this.param+"</td>" +
            "<td>"+this.variable+"</td> " +
            "<td>"+this.name+"</td>" +
            "<td> "+this.offset+"</td>" +
            "<td> "+this.type+"</td> " +
            "<td> "+this.inherited+"</td>"+
            "<td> "+this.true_end+"</td> " +
            "<td> "+this.size+"</td>"+
            "<td> "+this.final+"</td>"+
            "<td> "+this.visibility+"</td>"+
            "</tr>";
    };
    this.is_not_end = function () {
      return !this.name.includes(END);
    };
};
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
  this.is_class = function(){
      return this._class;
  };

  if(!this._class&&!this.isArray)this.primitive = true;
  else this.primitive = false;
  this.is_array = function() {
    return this.isArray;
  };
  this.is_boolean = function(){
      return this.signature==BOOLEAN;
  };
  this.is_string = function () {
      return this.signature == 'String';
  };
  this.is_number = function () {
      return this.signature==CHAR|this.signature==INTEGER||this.signature==DOUBLE;
  };
  this.is_integer = function(){
      return this.signature==CHAR|this.signature==INTEGER;
  };
};
const Compiler = {
    root: null,
    types:{},
    classes:{},
    ast_visualization:"",
    indenting:"",
    color_stack:[],
    aux_color_stack:[],
    public_regex : new RegExp(/^public[ \r\t]/),
    private_regex : new RegExp(/^private[ \r\t]/),
    protected_regex : new RegExp(/^protected[ \r\t]/),
    static_regex : new RegExp(/([ \r\t]static[ \r\t])|(^static[ \r\t])/),
    abstract_regex : new RegExp(/([ \r\t]abstract[ \r\t])|(^abstract[ \r\t])/),
    final_regex : new RegExp(/([ \r\t]final[ \r\t])|(^final[ \r\t])/),
    type_regex: new RegExp(/@[a-zA-Z_]+[0-9]*/),
    extends_regex: new RegExp(/[ \r\t]extends[ \r\t]/),
    class_regex : new RegExp(/[a-zA-Z_]+[0-9]*/gm),
    sub_block_count :[],
    sub_block_tracker:[],
    SymbolTable:[],
    scope:[],
    scope_tracker:[],
    Row:0,
    scope_offset:[],
    stack:[],
    evaluation_stack:[],
    keywords:[],
    advance_scope:function(){
        let s = this.scope_offset.pop();
        s++;
        this.scope_offset.push(s);
    },
    reset_scope_offset:function(){
        this.scope_offset.push(0);
    },
    advance:function(){
        this.Row++;
    },
    peek:function(array){
        return array[array.length-1];
    },
    end_block: function(end,block_name){
        let block_end = new Row(END+block_name);
        block_end.true_end = end;
        this.SymbolTable[this.Row] = block_end;
        this.advance();
    },
    get_type:function(details){
        /*This method takes a details node and returns the type of the token held within.*/
        let res = details.children[4].text;
        return res;
    },
    get_visibility:function(details){
        /*Same as get_type but returns visibility instead.*/
        return details.children[0].text;
    },
    get_final:function(details){
        /*Same as get_type but returns final instead.*/
        return details.children[3].text;
    },
    get_class:function(node){
        /*This method takes a node and if it isn't a token it traverses down de tree until a token is found.
        * Then, it returns the class at which that token is associated with.*/
        if(node.token)return node._class;
        if(node.children.length==0)return 'Built-In'; //Should never happen. However, in theory, you could get a node that is not token and yet has no children.
        return this.get_class(node.children[0]);
    },
    get_details:function(node){
      /*
      * Returns an Object holding the extracted visibility, final & type details.
      * node is a details node.
      * */
      return {final:this.get_final(node),visibility:this.get_visibility(node),type:this.get_type(node),inherited:false};
    },
    peek_scope_offset:function(){
        return this.peek(this.scope_offset);
    },
    is_valid_name:function(id,token){
        if(id in this.keywords)throw new semantic_exception("Id: "+id+" Cannot be used because: "+this.keywords[id],token);
        //Alright, now we gotta check the id isn't used within the same scope:
        //current scope is starts at the index held in the head of the stack.
        //Any other scope below are parent scopes.
        let i = this.get_var_index(this.peek(this.scope),id);
        if(i!=-1) throw new semantic_exception("Id: " + id + " Has already been declared in this scope.",token);
        return true;
    },
    count_fields:function(_class){
        let target = this.classes[_class];
        let i = 0;
        Object.values(target.fields).forEach(f=>{
            if(f.category=='field')i++;
        });
        return i;
    },
    initialize:function () {
        $("#AST_Container").empty();
        this.color_stack = [];
        this.aux_color_stack = [];
        this.ast_visualization = "";
        this.indenting = "";
        this.root = null;
        this.classes = classes;
        this.sub_block_tracker = [];
        this.types = {};
        this.types["void"] = new type('void');
        this.types["char"] = new type('char');
        this.types["int"] = new type('int');
        this.types["double"] = new type('double');
        this.types["boolean"] = new type('boolean');
        this.Row = 0;
        this.SymbolTable = [];
        this.scope = [];
        this.scope_tracker = [];
        this.stack=[];
        this.evaluation_stack=[];
        this.load_keywords();
    },
    load_keywords:function(){
        this.keywords = {};
        this.keywords['static'] = "member modifier.";
        this.keywords['abstract'] = "member modifier.";
        this.keywords['final'] = "member modifier";
        this.keywords['public'] = "visibility modifier";
        this.keywords['private'] = "visibility modifier";
        this.keywords['protected'] = "visibility modifier";
    },
    extract_type:function(type_text){
        return type_text.match(this.type_regex)[0].substring(1);
    },
    extract_parent:function(class_token){
        const matches = class_token.match(this.class_regex);
        return matches[matches.length-1];
    },
    extract_class:function(class_token){
        const matches = class_token.match(this.class_regex);
        if(this.extends_regex.test(class_token)){
            return matches[matches.length-3];
        }else return matches[matches.length-1];
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
    disable_modifiers:function(type_node){
        /*
        * This method checks there aren't any modifiers within the type regex
        * and throws exception if any is found.
        * Afterwards it returns the type_text properly trimmed and without the @ at the beginning.
        * */
        let type_text = type_node.text;
        if(this.public_regex.test(type_text)
        ||this.private_regex.test(type_text)
        ||this.protected_regex.test(type_text)
        ||this.final_regex.test(type_text)
        ||this.abstract_regex.test(type_text)
        ||this.static_regex.test(type_text))throw new _compiling_exception('Member modifiers not allowed here.',type_node);
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
        if(!processed_details.abstract)throw new _compiling_exception("method: "+name.text+" is missing method body, or declare abstract.",type_token);
        if(processed_details.visibility=='private') throw new _compiling_exception("An abstract method cannot be private.",type_token);
        if(processed_details._static)throw new _compiling_exception("Cannot declare a method as abstract and static at the same time.",type_token);
        let res = new _Node("abstractMethod");
        res.add(processed_details.token);
        res.add(new _Node(name));
        res.add(paramL);
        return res;
    },
    methodDecl:function (type_token,name,dim,paramL,stmtL) { //prod::  TYPE ID LEFT_PAREN paramDef RIGHT_PAREN LEFT_BRACE stmtL RIGHT_BRACE
        let processed_details = this.resolve_modifiers(type_token,dim);
        if(processed_details.abstract)throw new _compiling_exception("An abstract method cannot be implemented in the same class it is declared on.",type_token);
        if(processed_details.final)throw new _compiling_exception('Final modifier cannot be applied to methods',type_token);
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
        if(processed_details._static)throw new _compiling_exception('Cannot declare a constructor as static.',type_token);
        if(processed_details.abstract)throw new _compiling_exception('Cannot declare an abstract constructor.',type_token);
        if(processed_details.final)throw new _compiling_exception('Cannot declare a final constructor.',type_token);
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
        return res;
    },
    fieldDecl:function (type_token,name,dim,exp) { //prod: TYPE ID dimList SEMI
        let processed_details = this.resolve_modifiers(type_token,dim);
        if(processed_details.abstract)throw new _compiling_exception('Cannot declare an abstract field.',type_token);
        let res;
        if(processed_details._static)res = new _Node('staticField');
        else res = new _Node('field');
        res.add(processed_details.token);
        res.add(new _Node(name));
        if(exp!=null)res.add(exp);
        return res;
    },
    paramDef:function (type_token,name,dim) { //prod:: TYPE ID COMMA ...
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_token),dim,type_token);
        let res = new _Node('param');
        res.add(type_node);
        res.add(new _Node(name));
        return res;
    },
    variableDef:function (type_token,name,dim, exp = null) { //prod:: TYPE ID SEMI
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_token),dim,type_token);
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
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_token),0,type_token);
        if(!(type_node.text in Compiler.classes))throw new _compiling_exception(type_node.text+" is not a class.",type_token);
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
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_token),0,type_token);
        res.add(type_node);
        return res;
    },
    primitive :function (primitive) { //prod:: primitive
        return new _Node(primitive);
    },
    NEW : function (type_token,paramL) { //prod:: NEW TYPE LEFT_PAREN paramList RIGHT_PAREN
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_token),0,type_token);
        let res = new _Node('new');
        res.add(type_node);
        res.add(paramL);
        return res;
    },
    arrayInitialization:function (type_token,firstIndex) {//prod:: NEW TYPE LEFT_BRACKET Exp RIGHT_BRACKET
        let type_node = this.get_processed_type_node(this.disable_modifiers(type_token),0,type_token);
        let res = new _Node('arrayInitialization');
        res.add(type_node);
        let indexL = new _Node('indexL');
        indexL.add(firstIndex);
        res.add(indexL);
        return res;
    },
    build_token_from_node:function(name,node,text){
        let vessel = new _Node(name);
        vessel.token = true;
        vessel.row = node.row;
        vessel.col = node.col;
        vessel.file = node.file;
        vessel._class = node._class;
        vessel.text = text;
        return vessel;
    },
    build_this_reference:function(_class,node){
        /*
        * This method creates a new param node manually.
        * with name = this and type = _class.
        * We take node as parameter so we can copy most stuff from it.
        * */
        let res = new _Node('param');
        let type_node = this.build_token_from_node('type',node.get_token(),_class);
        let name_node = this.build_token_from_node('id',node.get_token(),'this');
        res.add(type_node);
        res.add(name_node);
        return res;
    },
    build_nodeStructure:function () {
        if (this.root == null) return;
        this.root.printTree();
        $("#AST_Container").html(this.ast_visualization);
    },
    build_symbolTable:function() {
        /*
        * This basically calls visit_node(root); and that's pretty
        * much it. However, it also catches any exception that might occur during the symbol table
        * compilation. It also calls the symbol table graphing method if compilation is successful.
        * */
        try {
            this.visit_node(this.root);
        }catch (e) {
            return;
        }
        this.fill_sizes(); //We fill the sizes of all blocks in the program.
        //Graph Symbol Table.
        $("#SYMBOL_TABLE_BODY").empty();
        $("#SYMBOL_TABLE_BODY").addClass('SymbolTable_Entry');
        $("#SYMBOL_TABLE_HEADER").empty();
        $("#SYMBOL_TABLE_HEADER").html(this.SymbolTable[0].get_header());
        let i = 0;
        while (i<this.SymbolTable.length){
            $("#SYMBOL_TABLE_BODY").append(this.SymbolTable[i].get_visualization(i));
            i++;
        }
    },
    visit_node:function (node) {
     /*
     * The bread & butter of the Symbol Table compilation. A recursive method that
     * builds the symbol table for the program based on the AST.
     * */
     switch (node.name) {
         case "program":
         {
             this.sub_block_count = [];
             this.sub_block_count.push(0);
             this.Row = 0;
             let first_row = new Row('program');
             this.SymbolTable[this.Row] = first_row;
             let block_start = this.Row;
             this.scope.push(block_start);
             this.scope_tracker.push(block_start); //remember to reverse the scope_tracker after finishing the symbol table compilation.
             this.reset_scope_offset(); //We add the first scope.
             this.advance(); //We advance to the next position.

             //Compile all static fields first:
             this.stack.push('static_field_compilation');
             node.children.forEach(n=>{
                 if(n.name=='staticField')this.visit_node(n);
             });
             this.stack.pop();
             //Normal compilation:
             this.stack.push(node.name);
             node.children.forEach(n=>{
                this.visit_node(n);
             });
             this.stack.pop();
             this.end_block(block_start-1, "program");
             first_row.true_end = this.Row;
             this.sub_block_count.pop();
             console.log('Symbol Table built successfully!');
         }
             return;
         case "staticField": //static fields belong to the symbol table as if they were global variables. Their signature is className.name
         if(this.peek(this.stack)=='static_field_compilation'){ //Only compile at the beginning. Otherwise just return.
             let name = node.children[1].text; //We retrieve the name
             let _class = this.get_class(node);
             name = _class+"."+name; //We set the field's signature.
             let details = this.get_details(node.children[0]);
             details.offset = this.peek_scope_offset();
             if(!this.is_valid_name(name,node))return; //If the name is not valid we abort the compilation of the variable.
             let var_row = new Row(name,true,details);
             if(node.children.length==3)var_row.instructions = node.children[2];
             this.SymbolTable[this.Row] = var_row;
             this.advance();
         } return;
         case 'field':
         {
             let name = node.children[1].text; //We retrieve the name
             let _class = this.get_class(node);
             let details = this.get_details(node.children[0]);
             let instructions = null;
             if(node.children.length==3)instructions = node.children[2];
             let field = new _field('field',name,details.visibility,details.type,_class);
             field.instructions = instructions;
             field.final = details.final;
             field.offset = this.count_fields(_class)+1;
             let owner = this.classes[_class];
             if(field.name in owner.fields)throw new semantic_exception('Repeated field: ',node);
             owner.fields[field.name] = field; //We register the field.
         }
             return;
         case "staticMethod":
         case "abstractMethod":
         case 'method':
         {
             //First child: details node
             //Second child: Function's name
             //Third child: paramDefL
             //Fourth child: InstructionBlock
             //Alright, we first get the type of the function:
             let details = this.get_details(node.children[0]);
             let _class = this.get_class(node);
             let func_type = details.type; //We get the type name
             let fun_name = node.children[1].text; //we get the name of the function.
             //Start calculating the function's signature here:
             let func_signature ;
             if(node.name == 'method'||node.name=='abstractMethod')func_signature = _class+"."+fun_name;
             else func_signature = _class+".static."+fun_name;
             let func_index = this.compile_function(func_signature,node); //We indicate it is a function.
             this.SymbolTable[func_index].type = func_type;
             this.SymbolTable[func_index].visibility = details.visibility;
             if(node.name=='method'||node.name=='abstractMethod'){
                 let owner = this.classes[_class];
                 let methodName = fun_name+this.evaluation_stack.pop(); //We get the type signature.
                 if(methodName in owner.fields)throw new semantic_exception('There is another member with the same name: '+methodName,node);
                 owner.fields[methodName] = new _field('method',methodName,details.visibility,func_type,_class,func_index);
                 if(node.name=='abstractMethod'){
                     owner.fields[methodName].abstract = true;
                 }
                 this.finish_function_compilation(func_index,node,_class);
             }else this.finish_function_compilation(func_index,node);
         }
             return;
         case 'paramDefList':
             if(this.peek(this.stack)=='signature_compilation'){
                 //The params aren't compiled into the symbol table yet. They're merely retrieved & united to form the signature.
                 let unfinished_signature = "";
                 node.children.forEach(param=>{
                     let param_type_name = param.children[0].text;
                    unfinished_signature+='-'+param_type_name;
                 });
                 this.evaluation_stack.push(unfinished_signature);
                 return;
             }else{ //Alright time to compile the parameters and add them to the Symbol table.
                 node.children.forEach(param=>{
                     let param_type_name = param.children[0].text;
                     let name = param.children[1].text;
                     try{
                         this.is_valid_name(name,node);
                         let var_row = new Row(name,true,new basic_details(param_type_name,this.peek_scope_offset()));
                         var_row.param = true;
                         this.SymbolTable[this.Row] = var_row;
                         this.advance();
                     } catch(e){} //If the name is not valid we abort the compilation of the param and go to the next one.
                 });
             }
             return;
         case 'ifStmt':
         case 'if':
         case 'else':
         case 'switch':
         case 'caseL':
         case 'case':
         case 'default':
         case 'while':
             this.stack.push(node.name);
             this.node.children.forEach(child=>{
                this.visit_node(child);
             });
             this.stack.pop();
             return;
         case 'for':
             //fors are special because they declare one variable before entering the block.
             //I'll just make an small change in the block compilation, for that I'll provide some context:
             this.stack.push("for");
             this.evaluation_stack.push(node.children[0]); //We push the variable declaration part of the for.
             this.visit_node(node.children[node.children.length-1]);//We compile the block.
             this.stack.pop();
             return;
         case 'block':
             if(this.peek(this.stack)=='function_locals_compilation'){ //We don't need to do anything just value the children directly.
                 //This is because everything regarding scopes has been solved previously by the function/procedure definition.
                 node.children.forEach(child=>{
                     try{
                         this.visit_node(child);
                     }catch (ex){} //Do nothing, just proceed to the next.
                 });
             }else {
                 let block_index = this.sub_block_count.pop();
                 block_index++; //Increase sub block count.
                 this.sub_block_count.push(block_index); //We return it so the next brother block can advance.
                 this.sub_block_count.push(0); //We push a new sub_block count for the child blocks
                 this.reset_scope_offset(); //We add a new scope offset
                 let block_name = SUB_BLOCK+this.peek(this.stack)+"---"+block_index;
                 let sub_row = new Row(block_name);
                 let sub_block_true_index = this.Row;
                 this.sub_block_tracker.push(sub_block_true_index); //We add it so we can compile it later.
                 this.scope.push(sub_block_true_index); //We increase the scope for the child variables to be relative to this block.
                 this.SymbolTable[sub_block_true_index] = sub_row;
                 this.advance();
                 //Alright, make sure if you're compiling a for block:
                 if(this.peek(this.stack)=='for')this.visit_node(this.evaluation_stack.pop()); //All the information needed for declaration is held in the variableDeclaration node. And the scope solving has already been solved, so we only need to visit the node!
                 node.children.forEach(sub_block=>{
                     try {
                         this.visit_node(sub_block); //We compile the children
                     }catch (ex){}
                 });
                 this.scope.pop(); //We return to the parent's scope
                 this.fill_parent_references(); //We fill the parent references after all locals have been compiled.
                 this.end_block(sub_block_true_index-1,block_name); //We add the ending row for the block.
                 sub_row.true_end = this.Row; //We set the true_end of the block.
                 this.sub_block_count.pop(); //We discard the child sub_block count after all children have been compiled.
                 this.scope_offset.pop(); //We return at the parent scope offset.
             }
             return;
         case "variableDef":
         {
             let param_type_name = node.children[0].text;
             let name = node.children[1].text;
             this.is_valid_name(name,node);
             let var_row = new Row(name,true,new basic_details(param_type_name,this.peek_scope_offset()));
             var_row.param = false;
             this.SymbolTable[this.Row] = var_row;
             this.advance();
         }
             return;
         case "constructor": //These are special static methods.
             // They're called using the new keyword. The signature for a constructor is constructor.className-typeSignature
         {
             //First child: visibility token
             //Second child: target token
             //Third child: paramDefL
             //Fourth child: InstructionBlock
             //Alright, we first get the type of the function:
             let _class = node.children[1].text;
             let visibility = node.children[0].text;
             //Start calculating the function's signature here:
             let func_signature = CONSTRUCTOR_PREFIX+'.'+_class;
             let func_index = this.compile_function(func_signature,node); //We indicate it is a function.
             this.SymbolTable[func_index].type = _class; //Constructors return an instance of class they're making reference to.
             this.SymbolTable[func_index].visibility = visibility;
             this.finish_function_compilation(func_index,node);
         }
            return;
         default:console.log('Unimplemented or unimportant node: '+node.name);
     }
    },
    compile_function:function(func_signature,node){ //Compiles the type signature for the function and adds the function to the ST,
        this.stack.push("signature_compilation"); //We add context so that the signature is merely compiled but nothing is added to the Symbol table.
        this.visit_node(node.children[2]);
        this.stack.pop();
        let unfinished_signature = this.evaluation_stack.pop();
        if(node.name=='method'||node.name=='abstractMethod')this.evaluation_stack.push(unfinished_signature); //We'll still use it afterwards.
        func_signature = func_signature+unfinished_signature; //Complete function signature.
        if(!this.is_valid_name(func_signature,node))return; //If the function is repeated we stop the function compilation.
        //The function has been approved. We proceed:
        this.sub_block_count.push(0); //We reset the sub_block_count to 0.
        //Next we store the index for this function:
        let func_index = this.Row;
        this.scope_tracker.push(func_index);
        this.SymbolTable[func_index] = new Row(func_signature);
        this.SymbolTable[func_index].func = true;
        return func_index;
    },
    get_var_index:function (scope_index,var_name) {
        //This method should perform as follows:
        /*
         * Given a Symbol Table s, the scope index i and a name n:
         * Check the s[i].name == n. If so, return i;
         * Else:
         * Traverse s, one step at a time. aka i++;
         * Foreach s[i] if s[i] is a block. Check s[i].name == n;
         * If they are the same return i. Otherwise,
         * if s[i].fin exists, jump to s[i].fin. This is: i = s[i].fin;
         * And proceed like normal.
         * If s[i].fin does not exist, then return and n was not found.
         * If however, s[i] is not a block, Simply check s[i].name and return i
         * if s[i].name == n; Otherwise, advance (i++) and check the next row until
         * n is found, we reach the end of s or a block without fin is found.
         * */
        let searching_sub_block = scope_index<0;
        scope_index = Math.abs(scope_index);
        let is_the_parent_itself = true;
        let true_scope = this.SymbolTable[scope_index];
        if(true_scope.true_end != -1 && !searching_sub_block){
            //The current scope has already been compiled.
            while(scope_index < true_scope.true_end){
                let row = this.SymbolTable[scope_index];
                if(row == null||row==undefined)return -1;
                if(row.variable){
                    if(row.name==var_name){
                        return scope_index;
                    }
                }else if(row.block){
                    if(row.name==var_name)return scope_index;
                    if(is_the_parent_itself){
                        is_the_parent_itself = false;
                    }else{
                        if(row.true_end != -1){
                            //This means the block has already been compiled, therefore we can skip it:
                            //Alright, we'll just skip it:
                            scope_index = row.true_end - 1;
                        }else{
                            //This means we found a child block which hasn't been compiled yet.
                            //This means, there's no further space in the current scope that
                            //we haven't checked yet.
                            return -1;
                        }
                    }
                }else{
                    return -1;
                }
                scope_index++;
            }
            //Alright, we finished checking the scope and it wasn't found:
            return -1;
        }else{
            //We haven't finished compiling the scope:
            while (scope_index < this.SymbolTable.length){
                let row = this.SymbolTable[scope_index];
                if(row == null||row == undefined)return -1;
                if(row.variable){
                    if(row.name==var_name){
                        return scope_index;
                    }
                }else if(row.block){
                    if(is_the_parent_itself&&!searching_sub_block){
                        if(row.name==var_name)return scope_index;
                        is_the_parent_itself = false;
                    }else{
                        if(row.true_end != -1){
                            if(row.name==var_name)return scope_index;
                            //This means the block has already been compiled, therefore we can skip it:
                            //Alright, we'll just skip it:
                            scope_index = row.true_end - 1;
                        }else{
                            //This means we found a child block which hasn't been compiled yet.
                            //This means, there's no further space in the current scope that
                            //we haven't checked yet.
                            return -1;
                        }
                    }
                }else{
                    return -1;
                }
                scope_index++;
            }
        }
        return -1;
    },
    fill_parent_references:function () {
        /*
         * This method must be called after all locals have been declared within a block.
         * aka after all children of the block have been valuated.
         * This method will copy all locals from all parent scopes. Starting at the immediate parent
         * and recursing all the way up to the program itself.
         *
         * It is rather simple, since at this point the parent functions are most likely not finished yet,
         * I must simply iterate trough all rows of each parent index and add them to the new one.
         * If I find the beginning of a block, I skip it if it has been compiled or if it is still being compiled,
         * I return.
         * */
        let i = this.scope.length-1;
        let parent;
        while(i>=0){
            parent = this.scope[i];
            let row = this.SymbolTable[parent];
            if(row == null||row==undefined)return;
            if(row.block){
                if(row.true_end == -1){ //The parent shouldn't be fully compiled at this point.
                    let c = parent+1;
                    while(c<this.SymbolTable.length){
                        let sub_row = this.SymbolTable[c];
                        if(sub_row == null||sub_row==undefined)break;
                        if(sub_row.variable){
                            //Alright, let's copy it:
                            let details = {
                                offset:this.peek_scope_offset(),
                                type:sub_row.type,
                                inherited:true,
                                final:sub_row.final,
                                visibility:sub_row.visibility
                            };
                            let new_row = new Row(sub_row.name,true,details);
                            this.SymbolTable[this.Row] = new_row;
                            this.advance();
                        }else{
                            if((sub_row.true_end != -1)&&sub_row.is_not_end()){ //We check that it isn't the ending block, just to make sure. Even tough I'm pretty confident it should never happen.
                                //skip it:
                                c = sub_row.true_end -1;
                            }else{
                                //We break and go to the next parent:
                                break;
                            }
                        }
                        c++;
                    }
                }
            }
            i--;
        }
    },
    finish_function_compilation(func_index,node,_class=null) {
        /*
        * This function handles everything relating to the parameters & local variables
        * compilation for a function. The only difference between a normal function/constructor
        * and a class's method is that a class method takes a this reference as first parameter.
        * It can be added manually right before compiling the parameters.
        * The class name to add
        * */
        this.scope.push(func_index);
        //Now, we make the index advance, so that we can put vars and parameters where they belong:
        this.advance();
        //Alright, next we reset the offset:
        this.reset_scope_offset();
        //Alright, now we add the parameters:
        this.stack.push('parameter_compilation');
        if(_class!=null)node.children[2].children.unshift(this.build_this_reference(_class,node)); //We add the this parameter.
        this.visit_node(node.children[2]); //We visit the param Def again, but this time for actual compilation purposes.
        this.stack.pop();
        //Alright, the parameters have been added successfully. Now, we compile the inner sub_blocks:
        this.stack.push("function_locals_compilation");
        if(node.children[3]!=undefined)this.visit_node(node.children[3]); //Added check just in case we're compiling an abstract method. Which doesn't have a body.
        this.stack.pop();
        //At this point all locals have been successfully compiled.
        this.scope.pop(); //We leave this function and return scope to parent.
        //Now, we must copy the parent's variables. Yes, all of them.
        //At this point, scope.peek() has the index of the immediate parent function,
        //be it the program itself or another function.
        //We must copy them all, including parameters.
        this.fill_parent_references();
        //Alright parent references have been successfully loaded, however, before we set the true_end, we must add the ending block:
        this.end_block(func_index-1,this.SymbolTable[func_index].name);
        //Alright, we can now set the true_end and finish.
        this.SymbolTable[func_index].true_end = this.Row;
        this.sub_block_count.pop();
        this.scope_offset.pop();
    },
    fill_sizes: function(){
        this.scope_tracker.forEach(s=>{
           this.fill_size(s);
        });
        this.sub_block_tracker.forEach(i=>{
           this.fill_size(i);
        });
    },
    fill_size:function(index){
        if(index == 0 ){
            let row = this.SymbolTable[index];
            if(row.block&&row.is_not_end()){
                let i = index+1;
                let c = 0; //c is the size.
                while(i < row.true_end){
                    let sub_row = this.SymbolTable[i];
                    if(sub_row == null)return;
                    if(sub_row.block){
                        if(sub_row.is_not_end())i = sub_row.true_end-1;
                        c--;
                    }
                    c++;
                    i++;
                }
                row.size = c;
            }
            return;
        }
        let row = this.SymbolTable[index];
        if(row.block&&row.is_not_end()){
            let i = index+1;
            let c = 0; //c is the size.
            while(i < row.true_end){
                let sub_row = this.SymbolTable[i];
                if(sub_row == null)return;
                if(sub_row.block){
                    if(sub_row.is_not_end())i = sub_row.true_end; //We skip this block.
                    else i++; //Is the ending block, we just skip the field.
                    continue;
                }else{
                    c++;
                }
                i++;
            }
            row.size = c;
        }
    }
};