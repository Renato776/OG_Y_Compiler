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
    }
};