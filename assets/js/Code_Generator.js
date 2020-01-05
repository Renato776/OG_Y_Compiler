const Implementation = function (owner,implementation) {
    this.index = implementation; //The SymbolTable index for the implementation.
    this.owner = owner; //The id of the owner class.
};
const AbstractMethod = function (index,implementations) {
    //This Object wraps an abstract method with all important info regarding the method and its implementations.
    this.index = index; //the index to the SymbolTable representation of the abstract method itself.
    this.implementations = implementations; //A list of all implementations for the method.
};
const Code_Generator = {
    root: null,
    entry_point: -1,
    stack: [],
    evaluation_stack: [],
    scope: [],
    scope_tracker: [],
    sub_block_tracker: [],
    classes: {},
    types: {},
    SymbolTable: [],
    output: '',
    abstractMethods: [],
    label_count:0,
    repeated_inherited_id:{},
    varChainIndex:0,
    native_constructor_prefix: '___build___',
    C:'C',
    t:'t4',
    t1:'t1',
    t2:'t2',
    t3:'t3',
    peek:function(array){
        return array[array.length-1];
    },
    generate_label:function(){
        this.label_count++;
        return "L"+this.label_count;
    },
    set_label:function(label){
      Printing.print_in_context(label+":");
    },
    ifStmt:function(cond,target){
        Printing.print_in_context('if '+cond+"== 1 goto "+target);
    },
    ifFalseStmt:function(cond,target){
        Printing.print_in_context('if '+cond+"== 0 goto "+target);
    },
    pureIf:function(param1,param2,op,target){
        Printing.print_in_context('if '+param1+" "+op+" "+param2+" goto "+target);
    },
    assign:function(vessel,value){
        Printing.print_in_context(vessel+" = "+value);
    },
    goto:function(target){
        Printing.print_in_context('goto '+target);
    },
    operate:function(param1,param2,op,vessel,unary = false){
        if(unary){ //Special operation with unary operators like - and !
            if(op=='!'){
                let lV = this.generate_label();
                let lEnd = this.generate_label();
                this.pureIf(param1,'1','==',lV);
                this.assign(vessel,1);
                this.goto(lEnd);
                this.set_label(lV);
                this.assign(vessel,0);
                this.set_label(lEnd);
            }else{
                Printing.print_in_context(vessel+' = '+param1+" * -1");
            }
            return;
        }
        switch (op) {
            case "==":
            case '>':
            case '<':
            case '>=':
            case '<=':
            case '!=':
            {
                let lV = this.generate_label();
                let lEnd = this.generate_label();
                this.pureIf(param1,param2,op,lV);
                this.assign(vessel,0);
                this.goto(lEnd);
                this.set_label(lV);
                this.assign(vessel,1);
                this.set_label(lEnd);
            }return ;
            case '&&':
            {
                let lF = this.generate_label();
                let lEnd = this.generate_label();
                this.pureIf(param1,'0','==',lF);
                this.pureIf(param2,'0','==',lF);
                this.assign(vessel,1);
                this.goto(lEnd);
                this.set_label(lF);
                this.assign(vessel,0);
                this.set_label(lEnd);
            }return;
            case '||':
            {
                let lV = this.generate_label();
                let lEnd = this.generate_label();
                this.pureIf(param1,'1','==',lV);
                this.pureIf(param2,'1','==',lV);
                this.assign(vessel,0);
                this.goto(lEnd);
                this.set_label(lV);
                this.assign(vessel,1);
                this.set_label(lEnd);
            }return;
            default:
                Printing.print_in_context(vessel+" = "+param1+" "+op+" "+param2);
                return;
        }
    },
    get_stack:function(vessel,address){
        Printing.print_in_context(vessel+" = "+"stack["+address+"]");
    },
    get_heap:function(vessel,address){
        Printing.print_in_context(vessel+" = "+"heap["+address+"]");
    },
    set_stack:function(address,value){
        Printing.print_in_context('stack['+address+'] = '+value);
    },
    set_heap:function(address,value){
        Printing.print_in_context('heap['+address+'] = '+value);
    },
    pop_cache:function(vessel){
        this.get_stack(vessel,this.C);
        this.operate(this.C,'1','-',this.C);
    },
    push_cache:function(value){
        this.operate(this.C,'1','+',this.C);
        this.set_stack(this.C,value);
    },
    call:function(f){
        Printing.print_in_context('call '+f);
    },
    printChar:function(value){
        Printing.print_in_context('print(\'%c\','+value+')');
    },
    printInteger:function(value){
        Printing.print_in_context('print(\'%e\','+value+')');
    },
    printDouble:function(value){
        Printing.print_in_context('print(\'%d\','+value+')');
    },
    exit:function(code){
        /*
        * Exit codes:
        * 0 -> Null pointer exception
        * 1 -> Index out of bounds.
        * 2 -> downcast exception
        * 3 -> Cannot parse String to int
        * */
        Printing.print_in_context('exit('+code+')');
    },
    initialize: function () { //import all useful structures from Compiler and initialize your own.
        Printing.initialize();
        this.root = Compiler.root;
        this.classes = Compiler.classes;
        this.types = Compiler.types;
        this.SymbolTable = Compiler.SymbolTable;
        this.scope_tracker = Compiler.scope_tracker.reverse(); //All methods & constructors will be visited in the same order they were while compiling.
        this.sub_block_tracker = Compiler.sub_block_tracker.reverse(); //All sub-blocks will be visited the same order they were while compiling.
        this.evaluation_stack = [];
        this.stack = [];
        this.scope = [];
        this.abstractMethods = abstractMethods;
        this.output = '';
    },
    malloc:function(){
        Printing.add_function('malloc');
        this.pop_cache(this.t2);
        this.assign(this.t,'H');
        this.operate('H',this.t2,'+','H');
        this.push_cache(this.t);
        Printing.print_function();
    },
    compile_native_functions: function () {

    },
    compile_abstract_methods: function () {

    },
    compile_native_constructors: function () {

    },
    compile_utility_functions: function () {
        /*
        * This method outputs 3D for all utility 3D functions aka:
        * compileArray, printString, malloc, transfer, etc.
        * */
        //region get_field & get_field_reference utility functions compilation
        let r = 0;
        while(r<2){
            if(r==0)Printing.add_function('get_field'); //This method takes 2 params: this & field ID
            else Printing.add_function('get_field_reference');
            this.pop_cache(this.t1); //t1 = field id
            this.pop_cache(this.t2); //t2 = this reference.
            let l1 = this.generate_label();
            let lEnd = this.generate_label();
            this.pureIf(this.t2,'0','!=', l1);
            this.exit(0);//Null pointer exception
            this.set_label(l1);
            this.get_heap(this.t3,this.t2); //t3 = class ID
            let cs = sorting.mergeSort(Object.values(this.classes),compare_classes_by_id);
            let i = 0;
            while(i<cs.length){
                let _class = cs[i];
                let lIfEnd = this.generate_label();
                this.pureIf(this.t3,_class.id,'!=',lIfEnd);
                Object.values(_class.fields).forEach(f=>{
                    if(f.category=='field'){
                        let lCaseEnd = this.generate_label();
                        this.pureIf(this.t1,f.id,'!=',lCaseEnd);
                        this.operate(this.t2,f.offset,'+',this.t1); //t1 = address of the field
                        if(r==0)this.get_heap(this.t1,this.t1); //If we're getting the value we use the ref and get the value
                        this.push_cache(this.t1); //We push either the value or the ref
                        this.goto(lEnd);
                        this.set_label(lCaseEnd);
                    }
                });
                this.set_label(lIfEnd);
                i++;
            }
            this.set_label(lEnd);
            Printing.print_function();
            r++;
        }
        //endregion
        //region get_class compilation
        Printing.add_function('get_class');
        //This method takes only one parameter: a this reference.
        this.pop_cache(this.t1); //t1 = this address.
        let lNull = this.generate_label();
        let lClassEnd = this.generate_label();
        this.pureIf(this.t1,'0','!=',lNull);
        this.compile_string('null'); //We compile null.
        this.goto(lClassEnd); //We finish.
        this.set_label(lNull);
        this.get_heap(this.t1,this.t1); //t1 = ID of the class.
        this.operate(this.t1,'10',this.t1);//t1 = address of the class representation in the heap
        this.get_heap(this.t1,this.t1);//t1 = String representation of the class.
        this.push_cache(this.t1); //We push the string representation
        this.set_label(lClassEnd);
        Printing.print_function();
        //endregion
        this.malloc();
        this.string_to_int();
        this.int_to_string();
        //region printString compilation
        Printing.add_function('print_string');
        this.pop_cache(this.t1);//t1 = String address.
        this.get_heap(this.t2,this.t1); //t2 = string length
        this.assign(this.t3,1);
        let whileStart = this.generate_label();
        let whileEnd = this.generate_label();
        this.set_label(whileStart);
        this.pureIf(this.t3,this.t2,'>',whileEnd); //if t3 > String.length finish while.
        this.operate(this.t1,this.t3,'+',this.t);
        this.get_heap(this.t,this.t);//char
        this.printChar(this.t);
        this.operate(this.t3,'1','+',this.t3);
        this.goto(whileStart);
        this.set_label(whileEnd);
        Printing.print_function();
        //endregion
        //region build_string function
        Printing.add_function('build_string');
        //This method takes a charArray from the cache and wraps it within an String class Instance.
        this.call(this.native_constructor_prefix+'String'); //We call the native default constructor of an empty String.
        this.pop_cache(this.t1); //t1 = new String's address.
        this.pop_cache(this.t); //t = charArray
        this.operate(this.t1,'1','+',this.t2);//t2 = address of the charArray field
        this.set_heap(this.t2,this.t); //We set the field's value to the charArray we received.
        this.push_cache(this.t1); //We return the new String.
        Printing.print_function();
        //endregion
        //region boolean_to_string function
        Printing.add_function('boolean_to_string');
        this.pop_cache(this.t1); //t1 = 0/1
        let lF = this.generate_label();
        let lEnd = this.generate_label();
        this.pureIf(this.t1,'0','==',lF);
        this.compile_string('true');
        this.goto(lEnd);
        this.set_label(lF);
        this.compile_string('false');
        this.set_label(lEnd);
        Printing.print_function();
        //endregion
    },
    generate_code() {
        const target = this.SymbolTable[this.entry_point];
        if (target == undefined) throw new _compiling_exception('The entry point has changed. Please, re-select a valid starting point.');
        if (!target.func || target.name.includes('-')) throw new _compiling_exception('The entry point has changed. Please, re-select a valid starting point.');
        const chars = '0123456789';
        Printing.add_function('load_default_chars');
        for(let i = 0; i<chars.length;i++){
            this.assign(this.t1,i);
            this.set_heap(this.t1,chars.charCodeAt(i));
        }
        Printing.print_function();
        _log('Compiling.....');
    },
    perform_jump: function (current_scope, target_jump, jump_size) { //We prepare the jump by loading references and Increasing P.
        this.prepare_jump(current_scope,target_jump,jump_size); //We prepare the jump by loading references and Increasing P.
        this.scope.push(target_jump); //We add the new scope.
        //region Parameter Loading (if any)
        let i = 1;
        let row = this.SymbolTable[target_jump + i]; //First parameter.
        while (row.param && (!row.inherited)) { //While it is a param and is not inherited (just in case for extra validation.)
            this.pop_cache(this.t1); // param t1 = value.
            this.operate('P' , row.offset,'+',this.t2);//t2 = param_index
            this.set_stack(this.t2,this.t1);
            i++;
            row = this.SymbolTable[target_jump + i];
        }
        //endregion
        this.call(this.SymbolTable[target_jump].true_func_signature); //We perform the jump and begin execution.
        this.scope.pop();//We remove the jump scope.
        this.operate('P',jump_size,'-','P'); //We decrease the stack back to previous scope.
    },
    prepare_jump:function (caller, target, jump_size) {
            /*
        * This method loads all needed references from current scope to target.
        * However, it isn't as simple. There are 4 possible scenarios here:
        * a) current scope is the program itself (aka current_scope = 0)
        * b) I'm doing a recursive call. (aka current_scope == target_jump)
        * c) I'm doing a call to a target scope that is a child of current_scope.
        * d) I'm doing a call to a target scope which is a parent of current_scope.
        * */
        //-1) reset the found fields:
        this.repeated_inherited_id = {};
        //0) We increase P: (atm P is still pointing to the parent scope)
        this.operate('P',jump_size,'+','P');
        let scope_size = this.SymbolTable[target].size+1; //Remember we have stuff below P and above P. (+1 just to be on the safe side.)
        //verify which case you're handling:
        if(caller == 0){ //a)
            this.operate('P',this.SymbolTable[caller].size,'-',this.t1); //t1 = r
            let i;
            let j = this.SymbolTable[target].true_end-2;
            let row = this.SymbolTable[j];
            while(row.inherited){
                i = Compiler.get_var_index(0,row.name);
                if(i==-1)throw new _compiling_exception("Fatal Error. Could not load references properly." +
                    "Caller scope: 0 (program). Target scope: "+this.SymbolTable[target].name);
                this.operate(this.t1,this.SymbolTable[i].offset,'+',this.t2);
                this.operate('P',this.SymbolTable[j].offset,'+',this.t3);
                this.set_stack(this.t3,this.t2);
                j--;
                row = this.SymbolTable[j];
            }
        }else if(this.is_child_scope(caller, target)){ //c)
            this.operate('P',this.SymbolTable[caller].size,'-',this.t); // t points to caller scope.
            let i;
            let j = this.SymbolTable[target].true_end - 2;
            let row = this.SymbolTable[j];
            while(row.inherited){
                if(!(row.name in this.repeated_inherited_id))this.repeated_inherited_id[row.name]=0;
                i = this.get_next_inherited_field(caller,row.name);
                if(i==-1)break; //Is no longer an inherited field. At this point it expects you to provide them with a ref of your local.
                this.operate(this.t,this.SymbolTable[i].offset,'+',this.t1);
                this.operate('P',this.SymbolTable[j].offset,'+',this.t2);
                this.get_stack(this.t1,this.t1);
                this.set_stack(this.t2,this.t1);
                j--;
                row = this.SymbolTable[j];
            }
            /*
             * Alright at this point one big assumption must be made:
             * Jumps from parent -> child blocks can Only ever occur with first level relevance.
             * This means parent -> Grand son (Or deeper) Can NEVER occur. Only parent -> child is allowed.
             * With this being said, at this point all shared references to common parents to both blocks
             * have been properly inherited. However, the child block still needs references from
             * the immediate parent's locals. At this point, the best course of action would be:
             * Iterate from bottom upwards all fields in target as long as every row is inherited.
             * If a non-inherited row is found we end this method.
             * Foreach inherited row found, we must search this name as a local in the caller's scope.
             * We can guarantee the local exists because otherwise it wouldn't be inherited in the first place.
             * */
            while(row.inherited){ //Now all common inherited values have been loaded. At this pont we're expecting references from locals held in parent.
                i = Compiler.get_var_index(caller,row.name);
                if(i==-1)throw new _compiling_exception("Fatal Error. Could not load references properly." +
                    "Caller scope: "+this.SymbolTable[caller].name+". Target scope: "+this.SymbolTable[target].name);
                this.operate(this.t,this.SymbolTable[i].offset,'+',this.t1);
                this.operate('P',this.SymbolTable[j].offset,'+',this.t2);
                this.set_stack(this.t2,this.t1);
                j--;
                row = this.SymbolTable[j];
            }
        }else{ // d) or b) (Since recursive calls are handled the same as calls to ancestors or brothers.)
            //This scenario assumes the values to be passed from caller to target are already references, so we just copy the
            // reference value.
            this.operate('P',jump_size,'-',this.t); //t points to the caller scope. P points to the target scope.
            let i;
            let j = this.SymbolTable[target].true_end - 2;
            let row = this.SymbolTable[j];
            while(row.inherited){
                if(!(row.name in this.repeated_inherited_id))this.repeated_inherited_id[row.name]=0;
                i = this.get_next_inherited_field(caller,row.name);
                if(i==-1)throw new _compiling_exception("Fatal Error. Could not load references properly." +
                    "Caller scope: "+this.SymbolTable[caller].name+". Target scope: "+this.SymbolTable[target].name);
                this.operate(this.t,this.SymbolTable[i].offset,'+',this.t1);
                this.operate('P',this.SymbolTable[j].offset,'+',this.t2);
                this.get_stack(this.t1,this.t1);//Its already a reference so we just retrieve the reference.
                this.set_stack(this.t2,this.t1);
                j--;
                row = this.SymbolTable[j];
            }
        }
    },
    is_child_scope:function(caller, target) {
        let index = caller+1;
        while(index<this.SymbolTable[caller].true_end-1){
            let sub_row = this.SymbolTable[index];
            if(sub_row.block)if(sub_row.is_not_end())if(index==target)return true;
            index++;
        }
        return false;
    },
    get_next_inherited_field(og, name) {
        /*
        * This method is supposed to work similar to get_index_var except instead of starting at the
        * beginning of the variables it starts at the bottom. Also, if a variable has already been found
        * and I'd be searching for it again I have to return the next one.
        * OG points to the caller scope.
        * */
        let i = this.SymbolTable[og].true_end-2;
        let times_found = 0;
        let row = this.SymbolTable[i]; //First valid row from OG.
        while(row.inherited){
            if(row.name==name&&times_found==this.repeated_inherited_id[name]){
                let repeated = this.repeated_inherited_id[name];
                repeated++;
                this.repeated_inherited_id[name]=repeated;
                return i;
            }else if(row.name==name) times_found++;
            i--;
            row = this.SymbolTable[i];
        }
        return -1;
    },
    resolve_varChain(node,resolve_as_signature = false){
        /*
         * Resolves a varChain and loads the result to the cache.
         * It also pushes the correspondent type to the evaluation Stack.
         * Here the meaning of the ID is different if they're the first ID or not.
         * If it is the first ID it can mean:
         * A reference to a local var/param.
         * If it is the second or onwards it can only mean a reference to a field of the previous record.
         * */
            if(node.token) { //varChain ID resolve.
                if (this.varChainIndex == 0) { //First ID in the chain.
                    this.varChainIndex++;
                    this.resolve_global_id(node,resolve_as_signature);
                } else this.resolve_member_id(node,resolve_as_signature); //Makes reference to a field
            }
            switch (node.name){
                case "varChain":
                    this.varChainIndex = 0;
                    node.children.forEach(child=>{
                       this.resolve_varChain(child);
                    });
                    return;
                case 'normalAccess': //Just value the id in the children token.
                    node.children.forEach(child=>{
                        this.resolve_varChain(child);
                    });
                    return;
                case "arrayAccess":
                    throw semantic_exception('Array Access not implemented yet.',node);
                    return;
                case 'functionCall':
                    this.resolve_functionCall(node,resolve_as_signature);
                    return;
            }
    },
    value_expression:function (node) {
        if(node.token){ //Could be an ID, num, boolean or any primitive.
            switch (node.name){
                case 'id':
                    //Should never happen. IDs are handled in varChains or functionCalls.
                    return;
                case "null":
                    this.push_cache(0); //We load the null value.
                    this.evaluation_stack.push(this.types[NULL]);
                    return;
                case INTEGER:
                    this.push_cache(parseInt(node.text));
                    this.evaluation_stack.push(this.types[INTEGER]);
                    return;
                case "double":
                    this.push_cache(parseFloat(node.text));
                    this.evaluation_stack.push(this.types[DOUBLE]);
                    return;
                case CHAR:
                    this.push_cache(node.text.charCodeAt(0));
                    this.evaluation_stack.push(this.types[CHAR]);
                    return;
                case "string":
                    this.compile_string(node.text);
                    this.evaluation_stack.push(this.types[STRING]);
                    return;
                case BOOLEAN:
                    let ii = (node.text==("true"))?1:0;
                    this.push_cache(ii);
                    this.evaluation_stack.push(this.types[BOOLEAN]);
                    return;
                default:
                    return; //Should never happen.
            }
        }
        /**
        else{
            switch (node.name){ //Special Expression nodes
                case "varChain": this.resolve_varChain(node); return;
                case "functionCall": this.resolve_functionCall(node); return;
                case "inlineArrayDef": this.resolve_inlineArrayDef(node); return;
                default: //Do nothing and proceed.
            }
            //It isn't a token or an special node therefore is an operation.
            node.children.forEach(child=>{
                this.value_expression(child);
            });
            let left_arg; //t1
            let right_arg; //t2
            if(node.name==("Unot")||node.name==("Uminus")){
                left_arg = right_arg = this.evaluation_stack.pop();
                this.pop_cache(this.t1);
            }else{
                right_arg = this.evaluation_stack.pop();
                left_arg = this.evaluation_stack.pop();
                this.pop_cache(this.t2);
                this.pop_cache(this.t1);
            }
            switch (node.name){
                case '+': //Sum is special because of all possible overloads.
                    if(left_arg.is_string()||right_arg.is_string()){//There's at least one string. Concatenation must be performed.

                    }else if(left_arg.is_number()&&right_arg.is_number()){ //Both are numbers, it is an arithmetic sum
                        double arithmetic_answer = operate(left_value,right_value,node.name);
                        cache.push(arithmetic_answer);
                        if(left_arg.is_integer()&&right_arg.is_integer())evaluation_stack.push(unique_types.get(INTEGER));
                        else evaluation_stack.push(unique_types.get(REAL));
                        return;
                    }else throw new SemanticException("Cannot resolve operator: +  with types: "+left_arg.signature+" and "+right_arg.signature,node);
                case "rest":
                case "divide":
                case "multiply":
                case "pow":
                case "mod":
                    //Alright the rest of arithmetic operations have no overloads so it's pretty much the same for most of them:
                    //1) Verify  that both arguments are numbers:
                    if(!(left_arg.is_number()&&right_arg.is_number()))
                        throw new SemanticException("Invalid types for operation: "+node.name+" " +
                            "Expected: integer|decimal and integer|decimal. Got: "+left_arg.signature+" and "+right_arg.signature,node);

                    double arithmetic_answer = operate(left_value,right_value,node.name);
                    cache.push(arithmetic_answer);
                    if(left_arg.is_integer()&&right_arg.is_integer())evaluation_stack.push(unique_types.get(INTEGER));
                    else evaluation_stack.push(unique_types.get(REAL));
                    return;
                case "comparacion":
                case "distinto":
                    if(left_arg.is_array()||right_arg.is_array())throw new SemanticException("Cannot perform: "+node.name+" " +
                        "On types: "+left_arg.signature+" and "+right_arg.signature,node);
                    cache.push(left_value);
                    cache.push(right_value);
                    if(node.name.equals("distinto"))distinto();
                    else igualdad();
                    evaluation_stack.push(unique_types.get(BOOLEAN));
                    return;
                case "mayorQ":
                case "menorQ":
                case "mayorIgual":
                case "menorIgual":
                    //This ones are only valid for primitives:
                    boolean left_is_not_valid = left_arg.is_array()||left_arg.is_record();
                    boolean right_is_not_valid = right_arg.is_array()||right_arg.is_record();
                    if(left_is_not_valid||right_is_not_valid)throw new SemanticException("Cannot perform:"+node.name+" with types: "+left_arg.signature+" and "+right_arg.signature,node);
                    //Alright both are valid parameters, let's proceed:
                    cache.push(left_value);
                    cache.push(right_value);
                    switch (node.name){
                        case "mayorQ":mayorQ(); evaluation_stack.push(unique_types.get(BOOLEAN));
                            return;
                        case "menorQ":menorQ(); evaluation_stack.push(unique_types.get(BOOLEAN));
                            return;
                        case "mayorIgual":mayorIgual(); evaluation_stack.push(unique_types.get(BOOLEAN));
                            return;
                        case "menorIgual":menorIgual(); evaluation_stack.push(unique_types.get(BOOLEAN));
                            return;
                        default:return;
                    }
                case "and":
                case "or":
                    if(left_arg.is_boolean()&&right_arg.is_boolean()){
                        cache.push(left_value);
                        cache.push(right_value);
                        if(node.name.equals("and"))and();else or();
                        evaluation_stack.push(unique_types.get(BOOLEAN));
                        return;
                    }else throw new SemanticException("Cannot perform operation: "+node.name+" On types: "+left_arg.signature+" and "+right_arg.signature,node);
                case "not":
                    if(!left_arg.is_boolean())throw new SemanticException("Cannot negate type: "+left_arg.signature,node);
                    cache.push(left_value);
                    not();
                    evaluation_stack.push(unique_types.get(BOOLEAN));
                    return;
                case "Uminus":
                    if(!left_arg.is_number())throw  new SemanticException("Cannot operate: UMinus on type: "+ left_arg.signature,node);
                    left_value = -1*left_value;
                    cache.push(left_value);
                    if(left_arg.is_integer())evaluation_stack.push(unique_types.get(INTEGER));
                    else evaluation_stack.push(left_arg);
                    return;
                default:
                    System.out.println("Unimplemented Expression node: "+node.name);
                    cache.push(0);
                    evaluation_stack.push(NULL);
            }
        }
         **/
    },
    compile_string:function (string) {
        this.push_cache(string.length+1);
        this.call('malloc');
        this.pop_cache(this.t); //t has the String's address.
        this.push_cache(this.t); //We push the answer.
        this.set_heap(this.t,string.length); //We put the size of the array.
        let i = 1;
        for(let j = 0; j<string.length;j++){
            let a = string[j];
            this.operate(this.t,i,'+',this.t2);
            this.set_heap(this.t2,a.charCodeAt(0));
            i++;
        }
    },
    string_to_int:function () {
        Printing.add_function('string_to_int');
        this.assign('answer',0);
        this.assign('factor',1);
        this.pop_cache('str');
        this.get_heap('i','str');
        this.assign('sign',1);
        this.assign('strEnd',0);
        this.operate('str','1','+',this.t1);
        this.get_heap(this.t1,this.t1);
        let l1 = this.generate_label();
        this.pureIf(this.t1,'-'.charCodeAt(0),'!=',l1);
        this.assign('sign',-1);
        this.assign('strEnd',1);
        this.set_label(l1);
        let lStart = this.generate_label();
        let lEnd = this.generate_label();
        this.set_label(lStart);
        this.pureIf('i','0','<=',lEnd);
        this.operate('str','i','+',this.t1);
        this.get_heap(this.t1,this.t1);
        this.operate(this.t1,'0'.charCodeAt(0),'-',this.t1);
        this.operate(this.t1,'factor','*',this.t1);
        this.operate('answer',this.t1,'+','answer');
        this.operate('factor','10','*','factor');
        this.operate('i','1','-','i');
        this.goto(lStart);
        this.set_label(lEnd);
        this.operate('answer','sign','*','answer');
        this.push_cache('answer');
        Printing.print_function();
    },
    int_to_string:function () {
        Printing.add_function('int_to_string');
        this.pop_cache('a');
        this.push_cache(32);
        this.call('malloc');
        this.pop_cache('str');
        this.operate('str','32','+','i');
        this.assign('j',0);
        this.operate('a','0','<','isNegative');
        let lEnd1;
        this.pureIf('a','0','>',lEnd1);
        this.operate('i','1','-','i');
        this.operate('j','1','+','j');
        this.operate('str','i','+',this.t1);
        this.operate('a','10','%',this.t2);
        this.operate(this.t2,'-1','*',this.t2);
        this.get_heap(this.t2,this.t2);
        this.set_heap(this.t1,this.t2);
        this.operate('a','10','/','a');
        this.operate('a','1','*','a');
        this.set_label(lEnd1);
        let lStart = this.generate_label();
        let whileEnd = this.generate_label();
        this.set_label(lStart);
        this.pureIf('a','0','==',whileEnd);
        this.operate('i','1','-','i');
        this.operate('str','i',this.t1);
        this.operate('j','1','+','j');
        this.operate('a','10','%',this.t2);
        this.get_heap(this.t2,this.t2);
        this.set_heap(this.t1,this.t2);
        this.operate('a','10','/','a');
        this.goto(lStart);
        this.set_label(whileEnd);
        let lEnd2;
        this.pureIf('isNegative','0','==',lEnd2);
        this.operate('i','1','-','i');
        this.operate('str','i','+',this.t1);
        this.set_heap(this.t1,'-'.charCodeAt(0));
        this.operate('i',1,'-','i');
        this.operate('str','i','+',this.t1);
        this.set_heap(this.t1,'j');
        this.push_cache(this.t1);
        Printing.print_function();
    },
    get_index(varName) {
        return Compiler.get_var_index(this.peek(this.scope),varName);
    },
    resolve_global_id(node,resolve_as_signature=false) {
        let local_index = this.get_index(node.text);
        if (local_index==-1){//Okay local_index wasn't found. However, it could still be an static field
            let _class = Compiler.get_class(node);
            local_index = this.get_index(_class+"."+node.text); //We try again as an static variable.
            if(local_index==-1){ //Okay, it isn't a local and is not an static variable either. There's a last chance:
                let _field = this.classes[_class].fields[node.text];
                if(_field==undefined)throw new semantic_exception('variable: '+node.text+' NOT defined',node);
                //Alright is a field access.
                local_index = this.get_index('this');
                if(local_index==-1)throw new semantic_exception('Cannot access: '+node.text+" Within a static context.",node);
                this.evaluation_stack.push(this.types[_class]);
                if(!resolve_as_signature){
                    if(this.SymbolTable[local_index].inherited)this.get_stored_inherited_value(local_index); //We push it to the evaluation stack
                    else this.get_stored_value(local_index); //We push the this reference to the cache.
                }
                this.resolve_member_id(node,resolve_as_signature);
                return;
            }
        }
        let _type = this.types[this.SymbolTable[local_index].type]; //We get the type
        if(resolve_as_signature){
            this.evaluation_stack.push(_type.signature);//We push the name only and return.
            return;
        } else this.evaluation_stack.push(_type);
        if(this.SymbolTable[local_index].inherited)this.get_stored_inherited_value(local_index); //a) Is a normal by Value variable.
        else this.get_stored_value(local_index); //b) Is an Inherited variable of a by Value variable.
        return;
    },
    get_stored_inherited_value(target) {
        let offset = this.SymbolTable[target].offset;
        this.operate('P',offset,'+',this.t);
        this.get_stack(this.t,this.t); //t holds a reference to the Stack
        this.get_stack(this.t,this.t); //t holds the actual value.
        this.push_cache(this.t); //We push the answer.
    },
    get_stored_value(target) {
        let offset = this.SymbolTable[target].offset;
        this.operate('P',offset,'+',this.t);
        this.get_stack(this.t,this.t); //t holds the actual value
        this.push_cache(this.t);
    },
    resolve_member_id(node,resolve_as_signature = false) {
        /*
        * Alright, the form of retrieving values from a record is simple:
        * pop the evaluation stack and make sure the stored temp does make reference
        * to a record. If it does, get the signature of the record at which the
        * temp points to, and search the field there. If found, you simply return the value
        * stored in temp + offset and register the result.
        * This way, if a third id is found or any onwards id you simply keep the chain up.
        * */

        let record_type = this.evaluation_stack.pop();
        if(!record_type.is_class())throw new semantic_exception("Cannot resolve field access in type: "+record_type.signature,node);
        let field = this.classes[record_type.signature].fields[node.text];
        if(field==undefined)throw new semantic_exception("Undefined field: "+node.text+" In class:"+record_type.signature,node);
        if(resolve_as_signature){
            this.evaluation_stack.push(field.type);//We push the name only and return.
            return;
        }
        let id = field.id; //right now the this reference is pushed in the cache.
        this.assign(this.t1,id);
        this.push_cache(this.t1); //We push it to the cache on top of the this reference.
        this.call('get_field');
        this.evaluation_stack.push(this.types[field.type]);//We push the type for the next iteration.
        return;
    },
    resolve_global_functionCall(node,_class,resolve_as_signature = false) { //This method expects you to send the class where the method belongs to.
            if(this.is_native_function(node))return;
            //1) Compile the signature for the function:
            let function_name = node.children[0].text;
            let paramL = node.children[node.children.length-1];
            this.compile_signature(paramL);
            let signature = this.evaluation_stack.pop();
            signature = function_name+signature;
            /*
            * Alright, at this point we know the signature of the function except
            * for the class where it belongs to. We also don't know if it is an static function
            * or a normal member function. We know it isn't a native though.
            * Alright, if we were somewhere in the chain that is not the beginning we know
            * we're referring to the previous's class. However, since we're at the beginning
            * it can only mean one thing: We're talking about a method from the class this token
            * is written into. Either, static or normal. We'll search for normal methods first
            * and if not found, we'll search for an static version. If not found either throw exception.
            * */
            let field = _class.fields[signature];
            if(field!=undefined){
                if(field.category=='method'){
                    //Alright is a method call.
                    this.resolve_method_call(field,node);
                }else throw new semantic_exception('member: '+field.name+" from class: "+_class.name+" is not a function.",node);
            }
            //Alright, it can still be an static method:
            let target_func = this.get_func_index(_class.name+".static."+signature);
            if(target_func == -1)throw new semantic_exception("Undefined function: "+signature+".",node);
            //Alright, value the parameters.
            //*Important: We only value the parameters here. Parameter loading is handled by the perform_jump function.
            int i = paramL.children.size()-1;
            while(i>=0){ //We value them backwards. So we can have them in order after valuating all parameters.
                value_expression(paramL.children.get(i));
                evaluation_stack.pop(); //We don't need the type any more.
                i--;
            }
            stack.push("function_call"); //We provide context for the jump.
            try {
                perform_jump(scope.peek(),target_func,SymbolTable[scope.peek()].size,SymbolTable[target_func].instructions);
            }catch (ReturnException ret){
                //System.out.println("Returned.");
            }
            //Verify the return type of the function coincides with expected:
            RType return_type = (RType) evaluation_stack.pop();
            RType expected_type;
            if(SymbolTable[target_func].type==null) expected_type = VOID;
            else expected_type = unique_types.get(SymbolTable[target_func].type);
            double return_value = cache.pop();
            if(!types_are_compatible(expected_type,return_type,return_value))throw new SemanticException("" +
                "The function "+function_name+" expects to return: "+expected_type.signature+"" +
                " However, it received: "+return_type.signature+" instead.",node);
            return_value = cache.pop();
            evaluation_stack.push(expected_type);
            cache.push(return_value);
            stack.pop();

    },
    is_native_function(node) {
        /*
        * This function performs the evaluation of a native function and
        * pushes the result to the cache as well as the return type.
        * If no value is expected (procedure) 0 is pushed to the cache and null as type.
        * */
        let func_name = node.children[0].text;
        let paramL = node.children[node.children.length-1];
        switch (func_name){
            case "println":
                this.format_text(paramL);
                this.close_primitive_function();
                return true;
            case "str":
                if(paramL.children.length==1){//Only one parameter allowed.
                    this.value_expression(paramL.children[0]); //First direct child is a ParamL and first child there is the actual param.
                    let type = this.evaluation_stack.pop();
                    this.cast_to_string(type,node);
                    this.evaluation_stack.push(this.types['String']);
                }else throw new semantic_exception("More parameters than expected for function: "+func_name,node);
                return true;
            default:
                return false;
        }
    },
    close_primitive_function() {
        this.push_cache(0);
        this.evaluation_stack.push(this.types['void']);
    },
    format_text(paramList) {
        if(paramList.children.length!=1)throw new semantic_exception('Only one parameter expected for println function. Found: '+paramList.children.length);
        this.value_expression(paramList.children[0]); //We value the param as expression.
        let type = this.evaluation_stack.pop();
        this.cast_to_string(type,paramList);
        this.pop_cache(this.t1); //t1 = String instance address.
        this.operate(this.t1,'1','+',this.t2); //char array address
        this.get_heap(this.t2,this.t2);//t2 = char array
        this.push_cache(this.t2);
        this.call('print_string');
    },
    cast_to_string(og,anchor) {
        this.pop_cache(this.t1); //t1 = value to downcast.
        if(og.signature==CHAR){
            this.push_cache(2);
            this.call('malloc');
            this.pop_cache(this.t2); //t2 = answer
            this.set_heap(this.t2,1);
            this.operate(this.t2,'1','+',this.t3);
            this.set_heap(this.t3,this.t1); //We push the char to the String
            this.push_cache(this.t2);
            this.call('build_string'); //We take the charArray and & wrap it within an String class.
        }else if(og.signature==INTEGER){
            this.push_cache(this.t1); //We push it back
            this.call('int_to_string'); //We transform it to a char array
            this.call('build_string'); //We wrap it to an String class
        }else if(og.signature==DOUBLE){
            //We must transform the real to integer before we call the function.
            //Either that or call an special function to handle doubles but atm we'll just transform it to int.
            this.operate(this.t1,'1','%',this.t2); //t2 = decimal part of the number.
            this.operate(this.t1,this.t2,'-',this.t1); //We remove the decimal part.
            this.push_cache(this.t1); //We push it back
            this.call('int_to_string'); //We transform it to a char array
            this.call('build_string'); //We wrap it to an String class
        }else if(og.signature == BOOLEAN){
            this.push_cache(this.t1); //We push it back
            this.call('boolean_to_string'); //We transform it to a char array
            this.call('build_string'); //We wrap it to an String class
        }else if(og.signature==NULL){
            this.compile_string('null');
            this.call('build_string');
        }else if(og.is_class()){
            this.push_cache(this.t1);//Is a class instance, we push it back.
            this.call('get_class');
            this.call('build_string');
        }else throw new semantic_exception('Cannot cast: '+og.signature+" To String",anchor);
    },
    compile_signature(paramL) {
        /*
         * This function compiles the parameter list into an String which
         * represents the type part in the signature. returns an empty String if no params are received.
         * */
        let res = "";
        paramL.children.forEach(param=>{
            this.compile_expr_as_signature_part(param);
            res += "-"+this.evaluation_stack.pop(); 
        });
        this.evaluation_stack.push(res);
        return;
    },
    compile_expr_as_signature_part(param) {
        switch (param.name){
            case 'null':
            case INTEGER:
            case "double":
            case CHAR:
            case "string":
            case BOOLEAN:
                this.value_expression(param);
                this.pop_cache(this.t); //We only care about the type not the value.
                let primitive_type = this.evaluation_stack.pop();
                this.evaluation_stack.push(primitive_type.signature);
                return;
            case 'varChain':
                this.resolve_varChain_as_signature(param);
                return;
            default: //Must be an Operation
                param.children.forEach(child=>{
                   this.compile_expr_as_signature_part(child);
                });
                let left;
                let right;
                let left_arg,right_arg;
                if(param.name==("Unot")||param.name==("Uminus")){
                    left = right = this.evaluation_stack.pop();
                }else{
                    right = this.evaluation_stack.pop();
                    left = this.evaluation_stack.pop();
                }
                left_arg = this.types[(left)];
                right_arg = this.types[(right)];
                switch (param.name) {
                    case "+": //Sum is special because of all possible overloads.
                        if (left_arg.is_string() || right_arg.is_string()) {//There's at least one string. Concatenation not supported.
                            this.evaluation_stack.push('String');
                            return;
                        } else if (left_arg.is_number() && right_arg.is_number()) { //Both are numbers, it is an arithmetic sum
                            if (left_arg.is_integer() && right_arg.is_integer()) this.evaluation_stack.push(INTEGER);
                            else this.evaluation_stack.push(DOUBLE);
                            return;
                        } else
                            throw new semantic_exception("Cannot resolve operator: +  with types: " + left_arg.signature + " and " + right_arg.signature, param);
                    case "-":
                    case "/":
                    case "*":
                    case "%":
                        //Alright the rest of arithmetic operations have no overloads so it's pretty much the same for most of them:
                        //1) Verify  that both arguments are numbers:
                        if (!(left_arg.is_number() && right_arg.is_number()))
                            throw new semantic_exception("Invalid types for operation: " + param.name + " " +
                                "Expected: integer|decimal and integer|decimal. Got: " + left_arg.signature + " and " + right_arg.signature, param);
                        if (left_arg.is_integer() && right_arg.is_integer()) this.evaluation_stack.push(INTEGER);
                        else this.evaluation_stack.push(DOUBLE);
                        return;
                    case "==":
                    case "!=":
                        if (!(left_arg.primitive && right_arg.primitive))
                            throw new semantic_exception("Cannot perform: " + param.name + " " +
                                "On types: " + left_arg.signature + " and " + right_arg.signature, param);
                        this.evaluation_stack.push(BOOLEAN);
                        return;
                    case ">":
                    case "<":
                    case ">=":
                    case "<=":
                        //This ones are only valid for primitives:
                        let left_is_not_valid = left_arg.is_array() || left_arg.is_class();
                        let right_is_not_valid = right_arg.is_array() || right_arg.is_class();
                        if (left_is_not_valid || right_is_not_valid)
                            throw new semantic_exception("Cannot perform:" + param.name + " with types: " + left_arg.signature + " and " + right_arg.signature, param);
                        this.evaluation_stack.push(BOOLEAN);
                        return;
                    case "&&":
                    case "||":
                        if (left_arg.is_boolean() && right_arg.is_boolean()) {
                            this.evaluation_stack.push(BOOLEAN);
                            return;
                        } else
                            throw new SemanticException("Cannot perform operation: " + param.name + " On types: " + left_arg.signature + " and " + right_arg.signature, param);
                    case "NOT":
                        if (!left_arg.is_boolean())
                            throw new SemanticException("Cannot negate type: " + left_arg.signature, param);
                        this.evaluation_stack.push(BOOLEAN);
                        return;
                    case "UMINUS":
                        if (!left_arg.is_number())
                            throw new semantic_exception("Cannot operate: UMinus on type: " + left_arg.signature, param);
                        if (left_arg.is_integer()) this.evaluation_stack.push(INTEGER);
                        else this.evaluation_stack.push(left);
                        return;
                }
        }
    },
    get_func_index(signature) {
        /*
         * Massive change here, before when you called a function it searched in all scopes,
         * however it used a foreach loop within scopes and it seems it started at the bottom
         * scope (the program itself) And then started to search upwards until the current scope is reached.
         * This is definitely NOT how it should work, you should start at the head of the scope and go backwards.
         * Anyways, the foreach loop seems to be working in the opposite order, so I changed it to a for
         * loop instead:
         * */
        for (let i = this.scope.length -1 ; i >= 0; i--){
            let index = this.scope[i];
            let res = this.get_var_index(index, signature);
            if(res != -1){
                return res;
            }
        }
        return -1;  //Not found :(
    },
    resolve_method_call(field, node) {

    }, //NOT implemented yet....
    get_field:function(name,owner,token){
        let _class = this.classes[owner];
        if(_class==undefined)throw new semantic_exception(owner+' is NOT a class',token);
        let field = _class.fields[name];
        if(field==undefined)return undefined;
        let caller = Compiler.get_class(token);
        caller = this.classes[caller];
        if(field.visibility=='public'){
            return field;
        }else if(field.visibility=='protected'){
            if((caller.cc % _class.cc == 0 && caller.cc != _class.cc)||caller.id ==_class.id)return field;
            throw new semantic_exception('field: '+field.name+" has protected visibility.",token);
        }else{
            if(caller.id ==_class.id)return field;
            throw new semantic_exception('field: '+field.name+" has private visibility.",token);
        }
    },
    get_static_field(signature,owner,token,method=false){
        //static fields are stored in the SymbolTable therefore this method returns the index of the field in the symbol table.
        //The owner here is the name of the class that is requesting the field.
        let static_method = owner+".static."+signature; //If you're requesting a method it must have this signature
        let static_field = owner+"."+signature;//If you're requesting a field it must have this signature;
        let caller = Compiler.get_class(token);
        caller = this.classes[caller];
        let _class = this.classes[owner];
        if(_class==undefined)throw new semantic_exception(owner+" Is NOT a class.",token);
        let res;
        if(method)res = this.get_func_index(static_method);
        else res = this.get_index(static_field);
        if(res!=-1){ //The static field was found!
            if(this.SymbolTable[res].visibility=='public'){
                return res;
            }else if(this.SymbolTable[res].visibility=='protected'){
                if((caller.cc % _class.cc == 0 && caller.cc != _class.cc)||caller.id ==_class.id)return res;
                throw new semantic_exception('static method: '+signature+" has protected visibility.",token);
            }else{
                if(caller.id ==_class.id)return res;
                throw new semantic_exception('static method: '+signature+" has private visibility.",token);
            }
        }
        return res;
    }
};