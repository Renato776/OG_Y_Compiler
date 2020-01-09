const Implementation = function (owner,implementation) {
    this.index = implementation; //The SymbolTable index for the implementation.
    this.owner = owner; //The id of the owner class.
};
const AbstractMethod = function (index,implementations) {
    //This Object wraps an abstract method with all important info regarding the method and its implementations.
    this.index = index; //the index to the SymbolTable representation of the abstract method itself.
    this.implementations = implementations; //A list of all implementations for the method.
};
const pure_entry_point = '____MAIN____';
let MAX_CACHE = 400;
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
    returnTracker:[],
    foundReturn:false,
    varChainIndex:[],
    endLabel:null,
    break_display:[],
    continue_display:[],
    current_function:-1,
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
    readFile:function(path){
       Printing.print_in_context('read('+path+')');
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
        this.types = Compiler.types; //We get the all the types
        this.types[NULL] = new type(NULL); //We register NULL as a valid type.
        if(!(CHAR_ARRAY in this.types))this.types[CHAR_ARRAY] = new type(CHAR,1); //just in case.
        this.SymbolTable = Compiler.SymbolTable;
        this.scope_tracker = Compiler.scope_tracker.slice(); //All methods & constructors will be visited in the same order they were while compiling.
        this.sub_block_tracker = Compiler.sub_block_tracker.slice(); //All sub-blocks will be visited the same order they were while compiling.
        this.evaluation_stack = [];
        this.stack = [];
        this.scope = [];
        this.abstractMethods = abstractMethods;
        this.output = '';
        this.current_function = -1;
        this.endLabel = null;
        this.label_count = 0;
        function_counter = 0;
        this.scope.push(this.scope_tracker.pop()); //We set the program as base scope.
    },
    malloc:function(){
        Printing.add_function('malloc');
        this.pop_cache(this.t2);
        this.assign(this.t,'H');
        this.operate('H',this.t2,'+','H');
        this.push_cache(this.t);
        //Initialize the new segment to 0:
        this.assign(this.t3,0);
        let wS = this.generate_label();
        let wE = this.generate_label();
        this.set_label(wS);
        this.pureIf(this.t3,this.t2,'>=',wE);
        this.operate(this.t,this.t3,'+',this.t);
        this.set_heap(this.t,0);
        this.operate(this.t3,'1','+',this.t3);
        this.goto(wS);
        this.set_label(wE);
        Printing.print_function();
    },
    compile_abstract_methods: function () {
        this.abstractMethods.forEach(am=>{
            const target_row = this.SymbolTable[am.index];
            Printing.add_function(target_row.true_func_signature); //Alright, time to compile the abstract method.
            //0)First things first, push to the cache all params (which are all in the Stack atm) (don't forget to do it backwards)
            const param_amount = target_row.name.split('-').length-1 + 1; //+1 for the this reference
            let i = am.index + param_amount; //Index of the last param in the function.
            while(i>am.index){
                this.get_stored_value(i); //We get the stored value and push it to the cache. We also know they aren't references because params aren't inherited.
                i--;
            }
            //Alright, all params have been loaded to the cache at this point.
            //Next step is performing the actual depending on who's the caller.
            const caller = 'caller';
            this.pop_cache(caller);
            this.push_cache(caller); //We push it back as we'll still need it.
            this.get_heap(caller,caller); //We get the id from the reference and put it in the caller.
            const lEnd = this.generate_label();
            //Alright, now foreach implementation we check the caller matches the onwer and if so we perform the call.
            am.implementations.forEach(implementation=>{
               let nextL = this.generate_label();
               this.pureIf(caller,implementation.owner,'!=',nextL);
               //Alright, the caller matches the owner, & all params are in the cache. Just need to perform the jump:
                this.stack.push("function_call");
                this.perform_jump(am.index,implementation.index,this.SymbolTable[am.index].size);
                this.stack.pop();
                this.goto(lEnd);
               this.set_label(nextL);
            });
            this.set_label(lEnd);
            Printing.print_function();
        });
        //That's all!
    },
    compile_native_constructors: function () {
        /*
        * Alright, time to provide 3D code for ALL native constructors.
        * This is rather simple:
        * Allocate space in memory for fieldCount + 1.
        * We set the class ID at heap[address];
        * Then, for every field, if the field holds an initialization value
        * we output code for the expression evaluation.
        * If it is a final field, we mark it as initialized.
        * in address + offset we set the new value (either default value or custom value)
        * We push the new address.
        * */
        const _classes = Object.values(this.classes);
        const _class_size = 'class_size';
        const instance_address = 'instance_address';
        _classes.forEach(c=>{
            Printing.add_function(this.native_constructor_prefix+c.name);
            this.assign(_class_size,Compiler.count_fields(c.name)+1); //1 extra space for the ID.
            this.push_cache(_class_size);
            this.call('malloc');
            this.pop_cache(instance_address);
            this.set_heap(instance_address,c.id);//We set the ID of the new class.
            Object.values(c.fields).forEach(f=>{
                //Alright, first things first. push default value, either 0 or customized.
                if(f.category=='field'){
                    this.push_cache(instance_address);//We save it before proceeding.
                    if(f.instructions!=null){
                        try{
                            this.value_expression(f.instructions);   //We evaluate the default value.
                            let value_type = this.evaluation_stack.pop();
                            let recipient_type = this.types[f.type];
                            this.compatible_types(recipient_type,value_type,f.instructions);
                            if(f.final)f.initialized = true; //if it was a final field we need to indicate we've initalized it already.
                        }
                            //region Exception handling when default value is corrupted.
                        catch (e) {
                            console.log(e);
                            try{
                                throw  new semantic_exception('An error occurred while evaluating default value for field: '+f.name+'' +
                                    ' in class: '+f.owner,f.instructions);
                            }catch (e) {
                                this.push_cache(0); //We'll use default value instead.
                            }

                        }
                        //endregion
                    }else this.push_cache(0); //If no instructions were provided we push 0.
                    this.pop_cache(this.t1);//t1 = value to set.
                    this.pop_cache(instance_address); //We retrieve the instance address.
                    this.operate(instance_address,f.offset,'+',this.t); //t holds the address of the field.
                    this.set_heap(this.t,this.t1); //We set the value.
                }
            });
            this.push_cache(instance_address); //We push the answer to the cache.
           Printing.print_function(); //That's all!
        });
    },
    compile_utility_functions: function () {
        /*
        * This method outputs 3D for all utility 3D functions aka:
        * compileArray, printString, malloc, transfer, etc.
        * */
        //MUST be called as first instruction in ANY program:
        //region load default numeric chars compilation.
        /*
        * This method loads directly the chars to the heap in indexes 0-9. Must be the first instruction
        * in any program.
        * */
        const chars = '0123456789';
        Printing.add_function('load_default_chars');
        for(let i = 0; i<chars.length;i++){
            this.assign(this.t1,i);
            this.set_heap(this.t1,chars.charCodeAt(i));
        }
        Printing.print_function();
        //endregion / MUST
        //MUST be called as second instruction in ANY program:
        //region load classes String representations.
        /*
        * Be aware: even tho I use String commonly to refer to charArrays this
        * method puses charArrays to the classes_name_segment it doesn't push actual
        * String instances.
        * This method allocates space in memory for n classes (minimum 3: Object, String, custom)
        * And pushes the charArray representation of each in their respective place.
        * Begins at index 10.
        * Which means, heap[10] = Object
        * heap[11] = String
        * heap[12] = Class1
        * ... etc.
        * */
        Printing.add_function('load_all_class_names');
        const _classes = sorting.mergeSort(Object.values(this.classes),compare_classes_by_id);
        const class_names_segment = 'class_names_segment';
        this.assign(class_names_segment,_classes.length);
        this.push_cache(class_names_segment);
        this.call('malloc');
        this.pop_cache(class_names_segment);
        const i = 'i';
        this.assign(i,0);
        _classes.forEach(c=>{
            this.compile_string(c.name); //We compile the name of the class.
            this.pop_cache(this.t1); //t1 holds the address of the charArray
            this.operate(i,class_names_segment,'+',this.t2); //t2 holds the address of the current cell.
            this.set_heap(this.t2,this.t1);
            this.operate(i,'1','+',i);
        });
        Printing.print_function();
        //endregion

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
                        if(r==0){
                            this.get_heap(this.t1,this.t1); //If we're getting the value we use the ref and get the value
                            this.push_cache(this.t1); //We push the value
                        }else{
                            this.push_cache(1); //We push 1 to indicate to use it in the heap.
                            this.push_cache(this.t1); //We push the ref
                        }
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
        this.operate(this.t1,'10','+',this.t1);//t1 = address of the class representation in the heap
        this.get_heap(this.t1,this.t1);//t1 = String representation of the class. (charArray)
        this.push_cache(this.t1); //We push the string representation
        this.set_label(lClassEnd);
        Printing.print_function();
        //endregion
        //region downcast compilation
        /*
        *Right now the cache is like:
        *target_class_id
        *Object reference
        * */
        Printing.add_function('___downcast___');
        this.pop_cache(this.t1); //t1 = target id
        this.pop_cache(this.t2); //t2 = this reference
        this.get_heap(this.t3,this.t2); //We get the id from the object
        let lFine = this.generate_label();
        this.pureIf(this.t1,this.t3,'==',lFine);
        this.push_cache(this.t1);
        this.push_cache(this.t3);
        this.exit(2); //downcast exception
        this.set_label(lFine);
        this.push_cache(this.t2);
        Printing.print_function();
        //endregion
        this.malloc();
        this.string_to_double();
        this.native_arithmetics();
        this.string_to_int();
        this.int_to_string();
        this.compareArrays();
        this.send_this_reference_to_top();
        this.compile_array();
        this.basic_array_allocation();
        this.get_array_cell_ref();
        this.get_array_value();
        this.to_String();
        this.copy_array();
        this.linear_copy();
        this.___slice___();
        this.___indexOf___();
        this.inherit();
        this.to_case();
        this.is_upper_case();
        this.is_lower_case();
        //region sum strings compilation
        this.___sum_strings___(); //___sum_strings___ is different from sum_strings,
        // the difference is this one takes 2 char arrays as parameters
        //and pushes a new one as answer. However the sum_string method must take String objects as parameters and return
        //String object as response.
        Printing.add_function('sum_strings');
        //top cache: right_string
        //below: left_string
        this.get_char_array();
        this.pop_cache(this.t1);
        this.pop_cache(this.t2);
        this.push_cache(this.t1);
        this.push_cache(this.t2);
        //top cache: left string
        //below right char array
        this.get_char_array();
        this.pop_cache(this.t1); //left char array
        this.pop_cache(this.t2); //right char array
        this.push_cache(this.t1);
        this.push_cache(this.t2);
        //Now the right char array is at the top & below the left char array.
        this.call('___sum_strings___');
        this.call('build_string');
        Printing.print_function();

        Printing.add_function('compare_strings');
        //This function compares 2 String instances.
        this.get_char_array();
        this.pop_cache(this.t1);
        this.pop_cache(this.t2);
        this.push_cache(this.t1);
        this.push_cache(this.t2);
        //top cache: left string
        //below right char array
        this.get_char_array();
        this.pop_cache(this.t1); //left char array
        this.pop_cache(this.t2); //right char array
        this.push_cache(this.t1);
        this.push_cache(this.t2);
        //Alright both Char arrays have been extracted, we can compare them now.
        this.call('___compareArrays___'); //The answer will be boolean & will already be pushed in the cache.
        Printing.print_function();
        //endregion
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
    compile_entry_point:function(entry_point){
      /*
      * This is arguably the most important method among the whole program.
      * This method initializes all class names constants, sets all chars in the heap,
      * initializes P = 400 (maxCache)
      * Initializes all static variables
      * and finally performs the jump.
      * */
      Printing.add_function(pure_entry_point);
      this.assign('C',0);
      this.push_cache(10);
      this.call('malloc');
      this.pop_cache(this.t1); //We dispose of the return value.
      this.call('load_default_chars'); //We load all chars first.
      this.call('load_all_class_names'); //We load all Class String representations.
      this.assign('P',MAX_CACHE); //We set P to the beginning of the Stack.
      let i = 1;
        let row = this.SymbolTable[i]; //The row at index 1 must be the first static variable (if any)
      while(row.variable&&!row.param&&!row.inherited){ //the param & inherited checks are just to be super sure.
          if(row.instructions!=null){
              //Default value was provided.
              this.value_expression(row.instructions); //We value default instruction.
              let value_type = this.evaluation_stack.pop();
              let recipient_type = this.types[row.type];
              this.compatible_types(recipient_type,value_type,row.instructions);
              this.mark_as_initialized(row.name); //We mark as initialized.
          }else this.push_cache(0);
          //Alright default value has been loaded to the top of the cache.
          this.pop_cache(this.t); //t = default value.
          this.operate('P',row.offset,'+',this.t1); //t1 holds the address of the variable.
          this.set_stack(this.t1,this.t);
          i++;
          row = this.SymbolTable[i];
      }
      //Alright, all static variables have been initialized successfully!
        //last step is performing the jump to the entry point:
        this.stack.push("function_call");
        this.perform_jump(0,entry_point,this.SymbolTable[0].size);
        this.stack.pop();
        //That's all!!
      Printing.print_function();
    },
    generate_code() {
        const target = this.SymbolTable[this.entry_point];
        if (target == undefined) throw new _compiling_exception('The entry point has changed. Please, re-select a valid starting point.');
        if (!target.func || target.name.includes('-')) throw new _compiling_exception('The entry point has changed. Please, re-select a valid starting point.');
        //region load all classes to types.
        Object.values(this.classes).forEach(c=>{
           this.types[c.name] = new type(c.name,0);
        });
        //endregion
        this.compile_entry_point(this.entry_point); //We compile the pure entry point.
        this.evaluate_node(this.root); //We output 3D code for the rest of the user defined functions.
        this.scope.pop(); //Alright that's all!
    },
    perform_jump: function (current_scope, target_jump, jump_size) { //We prepare the jump by loading references and Increasing P.
        this.prepare_jump(current_scope,target_jump,jump_size); //We prepare the jump by loading references and Increasing P.
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
        if(caller==88&&target==63){
            console.log('stoop!')
        }
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
                    "Caller scope: "+this.SymbolTable[caller].name+". Target scope: "+this.SymbolTable[target].name+ "" +
                    " Tried to load: "+row.name);
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
                    "Caller scope: "+this.SymbolTable[caller].name+". Target scope: "+this.SymbolTable[target].name+
                    " Tried to load: "+row.name);
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
    resolve_varChain(node,resolve_as_signature = false,static_access = false,resolve_as_ref=false){
        /*
         * Resolves a varChain and loads the result to the cache.
         * It also pushes the correspondent type to the evaluation Stack.
         * Here the meaning of the ID is different if they're the first ID or not.
         * If it is the first ID it can mean:
         * A reference to a local var/param.
         * If it is the second or onwards it can only mean a reference to a field of the previous record.
         * */
            if(node.token) { //varChain ID resolve.
                if (this.peek(this.varChainIndex) == 0) { //First ID in the chain.
                    this.resolve_global_id(node,resolve_as_signature,resolve_as_ref);
                } else this.resolve_member_id(node,resolve_as_signature,static_access,resolve_as_ref); //Makes reference to a field
            }
            switch (node.name){
                case "varChain":
                    this.varChainIndex.push(0);
                    node.children.forEach(child=>{
                       this.resolve_varChain(child,resolve_as_signature,static_access,resolve_as_ref);
                        let c = this.varChainIndex.pop();
                        c++;
                        this.varChainIndex.push(c);
                    });
                    this.varChainIndex.pop();
                    return;
                case 'normalAccess': //Just value the id in the children token.
                    node.children.forEach(child=>{
                        this.resolve_varChain(child,resolve_as_signature,static_access,resolve_as_ref);
                    });
                    return;
                case "arrayAccess":
                {
                    let indexL = node.children[node.children.length-1];
                    let i = indexL.children.length-1;
                    if(resolve_as_signature){
                        this.resolve_varChain(node.children[0],resolve_as_signature,static_access,resolve_as_ref); //We resolve the ID as usual.
                        let array_type = this.evaluation_stack.pop();
                        array_type = this.types[array_type];
                        let target_dimension = indexL.children.length;
                        let target_type = array_type.array.get_type_in_dimension(target_dimension);
                        this.evaluation_stack.push(target_type);
                        return;
                    }
                    //Alright, before valuating the params, I must resolve the reference to the previous member in the chain currently
                    //loaded in the cache (Only applies if we're valuating as ref)
                    while(i>=0){ //We value the indexes beginning at the last index and going backwards.
                        this.value_expression(indexL.children[i]);
                        let index_type = this.evaluation_stack.pop();
                        if(!index_type.is_integer())throw new semantic_exception("Invalid index type. Expected: integer. Got: "+index_type.signature,indexL.children.get(i));
                        i--;
                    } //Alright all indexes are integers and have been valuated.
                    if(this.peek(this.varChainIndex)!=0){
                        if(resolve_as_ref){
                            this.push_cache(indexL.children.length); //We indicate how many indexes we valuated.
                            this.call('send_this_reference_to_top'); //we send the previous reference to the top.
                            //Alright, we just sent the ref back to top. However, this isn't enough!
                            //We also have to get where to use the ref.
                            this.push_cache(indexL.children.length+1); //We indicate how many indexes we valuated + 1 from the ref that is now at the top.
                            this.call('send_this_reference_to_top'); //we send where to use to the top.
                            this.pop_cache(this.t); //t = where to use.
                            this.pop_cache(this.t1); //actual ref.
                            this.push_cache(this.t); //we push it back
                            this.push_cache(this.t1); //we push it back.
                            //What we just did is to swap the order, since after getting back from sending where to use to the top,
                            //it was well, in the top, and the next instructions expects the actual ref to be at the top and where to use below.
                        }else{
                            this.push_cache(indexL.children.length); //We indicate how many indexes we valuated.
                            this.call('send_this_reference_to_top'); //we send the previous reference to the top.
                        }
                    }
                    this.resolve_varChain(node.children[0],resolve_as_signature,static_access,resolve_as_ref); //We resolve the ID as usual.
                    let array_type = this.evaluation_stack.pop();
                    if(!array_type.is_array())throw new semantic_exception("Cannot resolve Array Access in type: "+array_type.signature,node);
                    //Remember to check at runtime if array is null.
                    let target_dimension = indexL.children.length;
                    if(array_type.array.dimensions<target_dimension)throw new semantic_exception("Array: "+node.children[0].name+"" +
                        " Doesn't have enough dimensions. Target dimension: "+target_dimension+" Max dimension: "+array_type.array.dimensions,node);
                    let target_type = array_type.array.get_type_in_dimension(target_dimension);
                    if(!(target_type in this.types)){
                        this.types[target_type] = new type(array_type.array.type,target_dimension);
                    }
                    this.evaluation_stack.push(this.types[target_type]); //We push the target type.
                    if(resolve_as_ref){
                        //The top of the cache doesn't hold the base array address but a reference to it instead!
                        //Gotta use the ref first:
                        this.pop_cache(this.t); //t = base_array_address
                        this.pop_cache(this.t1); //t1 = where to use it
                        let label = this.generate_label();
                        let labelEnd = this.generate_label();
                        this.pureIf(this.t1,'1','==',label);
                        this.get_stack(this.t,this.t); //We get the actual array
                        this.goto(labelEnd);
                        this.set_label(label);
                        this.get_heap(this.t,this.t); //We get the actual array.
                        this.set_label(labelEnd);
                        this.push_cache(this.t); //We pusht the actual array back to the cache.
                    }
                    this.push_cache(target_dimension);
                    this.push_cache(this.SymbolTable[this.peek(this.scope)].size);
                    if(resolve_as_ref) this.call('get_array_cell_ref');
                        else this.call('get_array_value');
                }
                    return;
                case 'functionCall':
                    if(resolve_as_ref)throw new semantic_exception('Cannot extract reference from a function call.',node);
                    if(this.peek(this.varChainIndex)==0){
                        this.resolve_global_functionCall(node,resolve_as_signature);
                    }else {
                        let owner = this.evaluation_stack.pop(); //The value returned by the previous member.
                        if(resolve_as_signature){
                            owner = this.types[owner]; //if solving as signature the previous member returned an String. NOT a type.
                        }
                        //region native array methods
                        if(owner.is_array()){
                            let function_name = node.children[0].text;
                            let paramL = node.children[node.children.length-1];
                            this.compile_signature(paramL);
                            let signature = this.evaluation_stack.pop();
                            signature = function_name+signature;
                            //region resolve as signature
                            if(resolve_as_signature){
                                if(signature.startsWith('equals')){
                                    this.evaluation_stack.push(BOOLEAN);
                                    return;
                                }
                                switch (signature) {
                                    case "isNull":
                                        this.evaluation_stack.push(BOOLEAN);
                                        break;
                                    case "indexOf-int":
                                    case "indexOf-char":
                                    case "indexOf-double":
                                        this.evaluation_stack.push(INTEGER);
                                        break;
                                    case "copy":
                                        this.evaluation_stack.push(owner.signature);
                                        break;
                                    case "slice-int-int":
                                        this.evaluation_stack.push(owner.signature);
                                        break;
                                    case "toString":
                                        this.evaluation_stack.push(STRING);
                                    default: throw new semantic_exception('Cannot read function: '+signature+" of Array.",node);
                                }
                                return;
                            }
                            //endregion
                            //region Actual implementation
                            if(signature.startsWith('equals')){
                                //Alright, first of all let's value the argument:
                                if(paramL.children.length!=1)throw new semantic_exception('' +
                                    'invalid parameter amount for equals method. Expected: 1. got: '+paramL.children.length,node);
                                this.value_expression(paramL.children[0]); //we value the param we'll search.
                                let arg = this.evaluation_stack.pop(); //we already know the type of the return param.
                                if(!arg.is_array())throw new semantic_exception('Invalid type for equals argument. ' +
                                    'expected: Array. got:'+arg.signature,node);
                                this.call('___compareArrays___');
                                this.evaluation_stack.push(this.types[BOOLEAN]);
                                return;
                            }
                            switch (signature) {
                                case "isNull":
                                    this.pop_cache(this.t); //t = array Address
                                    this.operate(this.t,'0','==',this.t2); //true if address == 0
                                    this.push_cache(this.t2);
                                    this.evaluation_stack.push(this.types[BOOLEAN]);
                                    break;
                                case "indexOf-int":
                                case "indexOf-char":
                                case "indexOf-double":
                                    this.value_expression(paramL.children[0]); //we value the param we'll search.
                                    this.evaluation_stack.pop(); //we already know the type of the return param.
                                    this.call('___indexOf___');
                                    this.evaluation_stack.push(this.types[INTEGER]);
                                    break;
                                case "copy":
                                    this.call('___linear_copy___');
                                    this.evaluation_stack.push(this.types[owner.signature]);
                                    break;
                                case "slice-int-int":
                                case "slice-int":
                                    this.value_expression(paramL.children[0]); //we value the lower limit
                                    this.evaluation_stack.pop();
                                    if(paramL.children[1]!=undefined){
                                        this.value_expression(paramL.children[1]);
                                        this.evaluation_stack.pop();
                                    }
                                    else { //no upper limit was provided, therefore we use .length instead.
                                        this.pop_cache(this.t); //t = lower limit
                                        this.pop_cache(this.t1); //t1 = array address.
                                        this.get_heap(this.t2,this.t1);//t2 = size. aka upper limit
                                        this.push_cache(this.t1);
                                        this.push_cache(this.t);
                                        this.push_cache(this.t2);
                                    }
                                    this.call('___slice___');
                                    this.evaluation_stack.push(this.types[owner.signature]);
                                    break;
                                case "toString":
                                    this.call('build_string');
                                    this.evaluation_stack.push(this.types['String']);
                                    break;
                                default: throw new semantic_exception('Cannot read function: '+signature+" of Array.",node);
                            }
                            return;
                            //endregion
                        }
                        //endregion
                        if(!owner.is_class())throw new semantic_exception(owner.signature+' is NOT a class.',node);
                        let function_name = node.children[0].text;
                        let paramL = node.children[node.children.length-1];
                        this.compile_signature(paramL);
                        let signature = this.evaluation_stack.pop();
                        signature = function_name+signature;
                        if(static_access){
                            signature = owner.signature+".static."+signature;
                            let target_func = this.get_func_index(signature);
                            if(target_func==-1)throw new semantic_exception('static method: '+signature+" NOT found.",node);
                            if(resolve_as_signature){
                                this.evaluation_stack.push(this.SymbolTable[target_func].type);
                                return;
                            }
                            this.perform_static_function_call(target_func,paramL);
                            return;
                        }
                        if(this.is_native_method(owner.signature,signature,resolve_as_signature,paramL))return;
                        let field = this.get_field(signature,owner.signature,node);
                        if(field==undefined)throw new semantic_exception('Undefined function: '+signature,node);
                        this.resolve_method_call(field,node,resolve_as_signature);
                    }
                    return;
                case 'staticAccess':
                {
                    let owner = node.children[0].text;
                    owner = this.types[owner];
                    if(!owner.is_class())throw new semantic_exception(owner.signature+" is NOT a class.",node);
                    let i = this.varChainIndex.pop();
                    i++;
                    this.varChainIndex.push(i);
                    this.evaluation_stack.push(owner);
                    this.resolve_varChain(node.children[1],resolve_as_signature,true,resolve_as_ref);
                }
                    return;
            }
    },
    value_expression:function (node,value_as_signature = false,value_as_ref = false) {
        if(node.name!='varChain'&&value_as_ref)throw new semantic_exception('Cannot extract a reference from a pure value',node);
        if(node.token){ //Could be an ID, num, boolean or any primitive.
            switch (node.name){
                case 'id':
                    throw new semantic_exception('Fatal error!! Somehow an ID node managed to get directly into a value expression node with no context.',node);
                case NULL:
                    if(value_as_signature){
                     this.evaluation_stack.push(NULL);
                     return;
                    }
                    this.push_cache(0); //We load the null value.
                    this.evaluation_stack.push(this.types[NULL]);
                    return;
                case 'integer':
                    if(value_as_signature){
                        this.evaluation_stack.push(INTEGER);
                        return;
                    }
                    this.push_cache(parseInt(node.text));
                    this.evaluation_stack.push(this.types[INTEGER]);
                    return;
                case DOUBLE:
                    if(value_as_signature){
                        this.evaluation_stack.push(DOUBLE);
                        return;
                    }
                    this.push_cache(parseFloat(node.text));
                    this.evaluation_stack.push(this.types[DOUBLE]);
                    return;
                case CHAR:
                    if(value_as_signature){
                        this.evaluation_stack.push(CHAR);
                        return;
                    }
                    this.push_cache(node.text.charCodeAt(0));
                    this.evaluation_stack.push(this.types[CHAR]);
                    return;
                case "string":
                    if(value_as_signature){
                        this.evaluation_stack.push('String');
                        return;
                    }
                    this.compile_string(node.text);
                    this.call('build_string');
                    this.evaluation_stack.push(this.types[STRING]);
                    return;
                case BOOLEAN:
                    if(value_as_signature){
                        this.evaluation_stack.push(BOOLEAN);
                        return;
                    }
                    let ii = (node.text==("true"))?1:0;
                    this.push_cache(ii);
                    this.evaluation_stack.push(this.types[BOOLEAN]);
                    return;
                default:
                    throw new semantic_exception('Unrecognized token: '+node.name+" :: "+node.text,node);
            }
        }
        switch (node.name) {
            case 'new':
            {
                let target = node.children[0].text;
                if(value_as_signature){
                    this.evaluation_stack.push(target);
                    return;
                }
                let paramL = node.children[1];
                target = this.classes[target];
                if(target==undefined)throw new semantic_exception(target+' is NOT a class.',node);
                if(target.abstract)throw new semantic_exception(target+" is abstract. Cannot be instantiated.");
                if(value_as_signature){
                    this.evaluation_stack.push(target.name);
                    return;
                }
                this.compile_signature(paramL);
                let signature = this.evaluation_stack.pop();
                let target_func = this.get_static_field(signature,target.name,node,true,true);
                if(target_func==-1){
                    if(signature.includes('-'))throw new semantic_exception('NO suitable constructor found for: '+signature,node);
                    //Since it takes no parameters, we can use default constructor:
                    this.call(this.native_constructor_prefix+target.name);
                    this.evaluation_stack.push(this.types[target.name]); //We push the type and return.
                }else{
                    //Alright, before calling the constructor we must call default constructor.
                    this.call(this.native_constructor_prefix+target.name); //Alright, a new instance has now
                    //been created. You can edit this instance trough the custom constructor.
                    this.perform_static_function_call(target_func,paramL,true);
                }
            }
                return;
            case 'arrayInitialization':
            {
                //Alright, the type is most likely not set in the type list yet. So, let's build it and add it if needed.
                let true_type = node.children[0].text;
                let indexL = node.children[node.children.length-1];
                let array_type = new type(true_type,indexL.children.length);
                if(value_as_signature){
                    this.evaluation_stack.push(array_type.signature);
                    return;
                }
                if(!(array_type.signature in this.types)){
                    this.types[array_type.signature] = array_type;
                }
                //Alright, next step is loading the cache with the needed values for array compilation:
                /*
                * Alright, to compile the array I must simply load the input to the cache:
                 * Dimension
                 * Size_N
                 * ...
                 * ...
                 * ...
                 *  Size_1
                 *  Size_0
                * */
                //therefore, we only need to value the index list in order:
                indexL.children.forEach(index=>{
                   this.value_expression(index);
                   let index_type = this.evaluation_stack.pop();
                   if(!index_type.is_integer())throw new semantic_exception('Invalid index type. Expected: integer. Got: '+index_type.signature,node);
                });
                //Alright, now push the dimension:
                this.evaluation_stack.push(array_type);
                this.push_cache(indexL.children.length);
                this.push_cache(this.SymbolTable[this.peek(this.scope)].size); //We must send the current size of the scope.
                this.call('compile_array');
            }
                return;
            case 'inlineArrayDef':
            {
                //Alright defining arrays in line is actually easy and the most optimal!
                //Is definitively better than declaring the array and letting the program initialize.
                //Alright, so first of all: Allocate space in memory for the elements:
                if(value_as_signature){
                    this.compile_signature(node);
                    let array_hint = this.evaluation_stack.pop();
                    if(array_hint=='')throw new semantic_exception('Cannot send inline empty Arrays as parameters.',node);
                    array_hint = array_hint.split('-');
                    let type = array_hint[0];
                    this.evaluation_stack.push(type);
                    return;
                }
                let size = node.children.length;
                const address = 'address';
                this.assign(address,size+1);
                this.push_cache(address);
                this.call('malloc');
                this.pop_cache(address);
                this.push_cache(address); //We push it back.
                this.set_heap(address,size); //We set the size of the array.
                const i = 'i';
                this.assign(i,1);
                let types  = [];
                this.push_cache(i); //We push i.
                //Next, we process the values:
                let j = 0;
                while(j<node.children.length){
                    let child = node.children[j];
                    this.value_expression(child);
                    let element_type = this.evaluation_stack.pop();
                    let prev_type = types.pop();
                    if(prev_type==undefined){
                        types.push(element_type);
                    }
                    else {
                        if(this.compatible_types(prev_type,element_type,child,false)){
                            types.push(element_type);
                        }else throw new semantic_exception('All types within an array must match. Previous type: '+prev_type.signature+
                            " current type: "+element_type.signature+" Failed to compile array.",child);
                    }
                    //Right now the top of the cache is the value, below is i and below of that there's address.
                    this.pop_cache(this.t); //t = current value.
                    this.pop_cache(this.t1); //t1 = i
                    this.pop_cache(address); //t2 = address.
                    this.operate(address,this.t1,'+',this.t3); //relative address of the cell.
                    this.set_heap(this.t3,this.t); //We set the value.
                    this.operate(this.t1,'1','+',this.t1); //i++
                    this.push_cache(address);
                    this.push_cache(this.t1); //We push them back for the next iteration.
                    j++;
                }
                let top_type = types.pop();
                if(top_type==undefined)throw new semantic_exception('Cannot define an inline empty array.' +
                    ' use: new type [0] instead.',node);
                let top_types = top_type.signature.split('|');
                top_type = top_types[top_types.length-1]; //We get the last one.
                let array_type = new type(top_type,top_types.length);
                if(!(array_type.signature in this.types)){this.types[array_type.signature]=array_type;}
                this.evaluation_stack.push(array_type);
                this.pop_cache(i); //i value.
                this.pop_cache(address);
                this.push_cache(address); //Alright that's all!
            }
                return;
            case 'downcast':
            {
                let target = node.children[0].text; //We get the target type we're attempting to downcast
                if(value_as_signature){
                    this.evaluation_stack.push(target);
                    return;
                }
                this.value_expression(node.children[1],value_as_signature); //We value the expression associated to the downcast.
                let og = this.evaluation_stack.pop(); //We get the og type.
                switch (target) {
                    case DOUBLE:
                        if(!og.is_primitive())throw new semantic_exception('Cannot downcast '+og.signature+' to '+target,node);
                        this.cast_to_double(og);
                        this.evaluation_stack.push(this.types[DOUBLE]);
                        return;
                    case INTEGER:
                        if(!og.is_primitive())throw new semantic_exception('Cannot downcast '+og.signature+' to '+target,node);
                        this.cast_to_integer(og);
                        this.evaluation_stack.push(this.types[INTEGER]);
                        return;
                    case CHAR:
                        if(!og.is_primitive())throw new semantic_exception('Cannot downcast '+og.signature+' to '+target,node);
                        this.cast_to_char(og);
                        this.evaluation_stack.push(this.types[CHAR]);
                        return;
                    case BOOLEAN:
                        if(!og.is_primitive())throw new semantic_exception('Cannot downcast '+og.signature+' to '+target,node);
                        this.cast_to_boolean(og);
                        this.evaluation_stack.push(this.types[BOOLEAN]);
                        return;
                    case 'String':
                        if(og.is_primitive()){
                            this.cast_to_string(og,node);
                        }else{
                            og = this.classes[og.signature];
                            target = this.classes['String'];
                            if(target.cc % og.cc == 0){
                                this.push_cache(target.id); //We push the target id
                                this.call('___downcast___');
                            }else throw new semantic_exception('Cannot downcast '+og.name+' to '+target.name,node);
                        }
                        this.evaluation_stack.push(this.types['String']);
                        return;
                    default:
                    {
                        og = this.classes[og.signature];
                        target = this.classes[target]; //We get the actual class
                        if(target.cc % og.cc == 0){
                            this.push_cache(target.id); //We push the target id
                            this.call('___downcast___');
                            this.evaluation_stack.push(this.types[target.name]);
                        }else throw new semantic_exception('Cannot downcast '+og.name+' to '+target.name,node);
                    }
                        return;
                }
            }
                return;
            case 'ternario': {
                //first child: boolean expresion.
                //second child: if true return expression.
                //third child: if false return expression.
                //0) value the if expression:
                if(value_as_signature){
                    node.children.forEach(child=>{
                       this.value_expression(child,true); //We value all as signatures
                    });
                    let ifFalse_type = this.evaluation_stack.pop();
                    let ifTrue_type = this.evaluation_stack.pop();
                    let condition_type = this.evaluation_stack.pop();
                    if(condition_type!=BOOLEAN)throw new semantic_exception('The condition for the ternary operator must be boolean.',node);
                    if(ifFalse_type!=ifTrue_type)throw new semantic_exception('both return types in the ternary operator must be the same.',node);
                    this.evaluation_stack.push(ifFalse_type);
                    return;
                }
                node.children.forEach(child=>{
                    this.value_expression(child); //We value all as expressions.
                });
                let ifFalse_type = this.evaluation_stack.pop();
                let ifTrue_type = this.evaluation_stack.pop();
                let condition_type = this.evaluation_stack.pop();
                if(!condition_type.is_boolean())throw new semantic_exception('The condition for the ternary operator must be boolean.',node);
                if(ifFalse_type.signature!=ifTrue_type.signature)throw new semantic_exception('both return types in the ternary operator must be the same.',node);
                this.pop_cache(this.t1); //ifFalse
                this.pop_cache(this.t2); //ifTrue
                this.pop_cache(this.t3); //cond
                let lV = this.generate_label();
                let lEnd = this.generate_label();
                this.pureIf(this.t3,'1','==',lV);
                this.push_cache(this.t1);
                this.goto(lEnd);
                this.set_label(lV);
                this.push_cache(this.t2);
                this.set_label(lEnd);
                this.evaluation_stack.push(ifFalse_type);
            }return;
            case 'post-increment':
            case 'pre-increment':
            case 'pre-decrement':
            case 'post-decrement':
            {
                if(value_as_signature){
                    this.evaluation_stack.push(INTEGER);
                    return;
                }
                this.auto_update(node,true);
            }return;
            case 'varChain':
                this.resolve_varChain(node,value_as_signature,false,value_as_ref);
                return;

            default:
            {
                node.children.forEach(child=>{
                    this.value_expression(child,value_as_signature,value_as_ref); //We value the arguments of the operation.
                });
                let left_arg;
                let right_arg;
                let left_value = 'left_value';
                let right_value = 'right_value';
                if(!value_as_signature){
                    if(node.name=='NOT'||node.name=='UMINUS'){
                        left_arg = right_arg = this.evaluation_stack.pop();
                        this.pop_cache(left_value);
                        this.assign(right_value,left_value);
                    }else{
                        right_arg = this.evaluation_stack.pop();
                        left_arg = this.evaluation_stack.pop();
                        this.pop_cache(right_value);
                        this.pop_cache(left_value);
                    }
                }else{ //the difference is that the 3D instructions aren't printed if we're valuating as signature.
                    if(node.name=='NOT'||node.name=='UMINUS'){
                        left_arg = right_arg = this.evaluation_stack.pop();
                     }else{
                        right_arg = this.evaluation_stack.pop();
                        left_arg = this.evaluation_stack.pop();
                      }
                }
                switch (node.name){
                    case "+": //Sum is special because of all possible overloads.
                        if(value_as_signature){
                            if(this.signature_is_String(left_arg)||this.signature_is_String(right_arg)){
                                this.evaluation_stack.push(STRING);
                            } else if(this.signature_is_integer(left_arg)
                                &&this.signature_is_integer(right_arg)){
                                this.evaluation_stack.push(INTEGER);
                            } else if(this.signature_is_number(left_arg)
                                &&this.signature_is_number(right_arg))this.evaluation_stack.push(DOUBLE);
                            else throw new semantic_exception('Invalid types for + operator. Expected: String|char|int|double x2. got: '+left_arg
                                +' and '+right_arg,node);
                            return;
                        }
                        if(left_arg.is_string()||right_arg.is_string()){//There's at least one string. We must concatenate
                            this.push_cache(left_value);
                            this.cast_to_string(left_arg,node);
                            this.push_cache(right_value);
                            this.cast_to_string(right_arg,node);
                            this.call('sum_strings');
                            this.evaluation_stack.push(this.types['String']);
                        }else if(left_arg.is_number()&&right_arg.is_number()){ //Both are numbers, it is an arithmetic sum
                            this.operate(left_value,right_value,'+',left_value);
                            this.push_cache(left_value);
                            if(left_arg.is_integer()&&right_arg.is_integer())this.evaluation_stack.push(this.types[INTEGER]);
                            else this.evaluation_stack.push(this.types[DOUBLE]);
                            return;
                        }else throw new semantic_exception("Cannot resolve operator: +  with types: "+left_arg.signature+" and "+right_arg.signature,node);
                    return;
                    case "-":
                    case "/":
                    case "*":
                    case "%":
                        if(value_as_signature){
                            if(!(this.signature_is_number(left_arg)&&this.signature_is_number(right_arg)))
                                throw new semantic_exception("Invalid types for operation: "+node.name+" " +
                                    "Expected: integer|decimal and integer|decimal. Got: "+left_arg.signature+" and "+right_arg.signature,node);
                            if(this.signature_is_integer(left_arg)&&this.signature_is_integer(right_arg))this.evaluation_stack.push(INTEGER);
                            else this.evaluation_stack.push(DOUBLE);
                            return;
                        }
                        //Alright the rest of arithmetic operations have no overloads so it's pretty much the same for most of them:
                        //1) Verify  that both arguments are numbers:
                        if(!(left_arg.is_number()&&right_arg.is_number()))
                            throw new semantic_exception("Invalid types for operation: "+node.name+" " +
                                "Expected: integer|decimal and integer|decimal. Got: "+left_arg.signature+" and "+right_arg.signature,node);
                        this.operate(left_value,right_value,node.name,left_value);
                        this.push_cache(left_value);
                        if(left_arg.is_integer()&&right_arg.is_integer())this.evaluation_stack.push(this.types[INTEGER]);
                        else this.evaluation_stack.push(this.types[DOUBLE]);
                        return;
                    case "==":
                    case "!=":
                    case ">":
                    case "<":
                    case ">=":
                    case "<=":
                        if(value_as_signature){
                            this.evaluation_stack.push(BOOLEAN);
                            return;
                        }
                        if(!((left_arg.is_class()||right_arg.is_class())&&
                            (left_arg.signature==NULL||right_arg.signature==NULL))){
                            if(!(left_arg.is_primitive()&&right_arg.is_primitive()))throw new semantic_exception("Cannot perform: "+node.name+" " +
                                "On types: "+left_arg.signature+" and "+right_arg.signature,node);
                        }
                        this.operate(left_value,right_value,node.name,this.t);
                        this.push_cache(this.t);
                        this.evaluation_stack.push(this.types[BOOLEAN]);
                        return;
                    case "&&":
                    case "||":
                        if(value_as_signature){
                            this.evaluation_stack.push(BOOLEAN);
                            return;
                        }
                        if(left_arg.is_boolean()&&right_arg.is_boolean()){
                            this.operate(left_value,right_value,node.name,this.t);
                            this.push_cache(this.t);
                            this.evaluation_stack.push(this.types[BOOLEAN]);
                            return;
                        }else throw new semantic_exception("Cannot perform operation: "+node.name+" On types: "+left_arg.signature+" and "+right_arg.signature,node);
                    case "NOT":
                        if(value_as_signature){
                            this.evaluation_stack.push(BOOLEAN);
                            return;
                        }
                        if(!left_arg.is_boolean())throw new semantic_exception("Cannot negate type: "+left_arg.signature,node);
                        this.operate(left_value,null,'!',this.t,true);
                        this.push_cache(this.t);
                        this.evaluation_stack.push(this.types[BOOLEAN]);
                        return;
                    case "UMINUS":
                        if(value_as_signature){
                            this.evaluation_stack.push(left_arg);
                            return;
                        }
                        if(!left_arg.is_number())throw  new semantic_exception("Cannot operate: UMinus on type: "+ left_arg.signature,node);
                        this.operate(left_value,null,'-',this.t,true);
                        this.push_cache(this.t);
                        if(left_arg.is_integer())this.evaluation_stack.push(this.types[INTEGER]);
                        else this.evaluation_stack.push(left_arg);
                        return;
                    default:
                        throw new semantic_exception('Unrecognized expression node: '+node.name,node);
                }
            }return; //Must be an operation
        }
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
    }, //Compiles a charArray NOT an actual String instance.
    compareArrays:function(){
        Printing.add_function('___compareArrays___');
        /*
         * This method takes 2 arrays from the cache and compares each cell.
         * If they're the same on every char returns true. Otherwise returns false.
         * */
        const right_string_address = 'right_string_address';
        const left_string_address = 'left_string_address';
        this.pop_cache(right_string_address); //we get the right array
        this.pop_cache(left_string_address); //we get the left array
        const right_size = 'right_size';
        const left_size = 'left_size';
        this.get_heap(right_size,right_string_address);
        this.get_heap(left_size,left_string_address);
        let lV = this.generate_label();
        let lEnd = this.generate_label();
        this.pureIf(left_size,right_size,'==',lV);
        this.push_cache(0); //They're different.
        this.goto(lEnd);
        this.set_label(lV);
        const i = 'i';
        this.assign(i,1);
        let WhileStart = this.generate_label();
        let WhileEnd = this.generate_label();
        let lFine = this.generate_label();
        this.set_label(WhileStart);
        this.pureIf(i,right_size,'>',WhileEnd);
        const right_char_address = 'right_char_address';
        const left_char_address = 'left_char_address';
        this.operate(right_string_address,i,'+',right_char_address);
        this.operate(left_string_address,i,'+',left_char_address);
        this.get_heap(right_char_address,right_char_address); //We get the actual char
        this.get_heap(left_char_address,left_char_address); //We get the actual char
        this.pureIf(left_char_address,right_char_address,'==',lFine);
        this.push_cache(0);
        this.goto(lEnd);
        this.set_label(lFine);
        this.operate(i,'1','+',i);
        this.goto(WhileStart);
        this.set_label(WhileEnd);
        this.push_cache(1); //Is fine
        this.set_label(lEnd);
        Printing.print_function();
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
        this.pureIf('i','strEnd','<=',lEnd);
        this.operate('str','i','+',this.t1);
        this.get_heap(this.t1,this.t1);
        const lWrong = this.generate_label();
        const lFine = this.generate_label();
        const lower_limit = '0'.charCodeAt(0);
        const upper_limit = '9'.charCodeAt(0);
        this.pureIf(this.t1,lower_limit,'<',lWrong);
        this.pureIf(this.t1,upper_limit,'>',lWrong);
        this.goto(lFine);
        this.set_label(lWrong);
        this.push_cache('str');
        this.exit(3); //Cannot cast String to integer.
        this.set_label(lFine);
        this.operate(this.t1,lower_limit,'-',this.t1);
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
        this.assign('i',32);
        this.assign('j',0);
        this.operate('a','0','<','isNegative');
        let lEnd1 = this.generate_label();
        this.pureIf('a','0','>',lEnd1);
        this.operate('i','1','-','i');
        this.operate('j','1','+','j');
        this.operate('str','i','+',this.t1);
        this.operate('a','10','%',this.t2);
        this.operate(this.t2,'-1','*',this.t2);
        this.get_heap(this.t2,this.t2);
        this.set_heap(this.t1,this.t2);
        this.operate('a','10','/','a');
        this.operate('a','-1','*','a');
        this.remove_decimal_part('a');
        this.set_label(lEnd1);
        let lStart = this.generate_label();
        let whileEnd = this.generate_label();
        this.set_label(lStart);
        this.pureIf('a','0','==',whileEnd);
        this.operate('i','1','-','i');
        this.operate('str','i','+',this.t1);
        this.operate('j','1','+','j');
        this.operate('a','10','%',this.t2);
        this.get_heap(this.t2,this.t2);
        this.set_heap(this.t1,this.t2);
        this.operate('a','10','/','a');
        this.remove_decimal_part('a');
        this.goto(lStart);
        this.set_label(whileEnd);
        let lEnd2 = this.generate_label();
        this.pureIf('isNegative','0','==',lEnd2);
        this.operate('i','1','-','i');
        this.operate('str','i','+',this.t1);
        this.operate('j','1','+','j');
        this.set_heap(this.t1,'-'.charCodeAt(0));
        this.set_label(lEnd2);
        this.operate('i',1,'-','i');
        this.operate('str','i','+',this.t1);
        this.set_heap(this.t1,'j');
        this.push_cache(this.t1);
        Printing.print_function();
    },
    get_index(varName) {
        return Compiler.get_var_index(this.peek(this.scope),varName);
    },
    resolve_global_id(node,resolve_as_signature=false,resolve_as_ref = false) {
        /*
        * Alright, the first ID within a varChain. This ID can have multiple meanings and we'll solve them all here.
        * The possible options are:
        * ID is the name of a local in the current block.
        * ID is the name of a normal field within the class it has been written into.
        * ID is the name of an static field within the class it has been written into.
        * If none of the above is found an exception must be thrown.
        * */
        //0) Get the owner class:
        let owner = Compiler.get_class(node);
        let local_index;
        //Verify it isn't the super keyword:
        if(node.text=='super'){
            owner = this.classes[owner]; //we get the actual class.
            //Calling supper as a field, is basically upcasting the this reference so the next members of the chain can resolve properly.
            if(resolve_as_signature){
                this.evaluation_stack.push(owner.parent);
                return;
            }
            local_index = this.get_index('this');
            if(local_index==-1)throw new semantic_exception('Cannot access: '+node.text+" Within a static context.",node);
            this.evaluation_stack.push(this.types[owner.parent]); //we push the parent's class.
            if(resolve_as_ref)throw new semantic_exception('You Cannot modify super\'s value.',node);
            if(this.SymbolTable[local_index].inherited)this.get_stored_inherited_value(local_index);
            else this.get_stored_value(local_index);
            return; //that's all!
        }
        //1) Check the first scenario: (a local within the current block):
        local_index = this.get_index(node.text);
        if (local_index==-1){//Alright it is not a local. Let's check if it is an static field:
            local_index = this.get_static_field(node.text,owner,node,false);
            if(local_index==-1){ //Okay, there's a last chance of the ID being a normal field:
                let _field = this.get_field(node.text,owner,node);
                if(_field==undefined)throw new semantic_exception('variable: '+node.text+' NOT defined',node);
                //Alright is a field access.
                local_index = this.get_index('this');
                if(local_index==-1)throw new semantic_exception('Cannot access: '+node.text+" Within a static context.",node);
                this.evaluation_stack.push(this.types[owner]);
                if(!resolve_as_signature){
                    if(resolve_as_ref){
                        if(this.SymbolTable[local_index].inherited)this.get_stored_inherited_ref(local_index);
                        else this.get_stored_ref(local_index);
                    } else{
                        if(this.SymbolTable[local_index].inherited)this.get_stored_inherited_value(local_index); //We push it to the evaluation stack
                        else this.get_stored_value(local_index); //We push the this reference to the cache.
                    }
                }
                this.resolve_member_id(node,resolve_as_signature,false,resolve_as_ref);
                return;
            }
        }
        let _type = this.types[this.SymbolTable[local_index].type]; //We get the type
        if(resolve_as_signature){
            this.evaluation_stack.push(_type.signature);//We push the name and return immediately.
            return;
        }
        this.evaluation_stack.push(_type);
        if(resolve_as_ref){
            this.resolve_final_initialization(local_index,node);
            if(this.SymbolTable[local_index].inherited)this.get_stored_inherited_ref(local_index);
            else this.get_stored_ref(local_index);
        }else{
            if(this.SymbolTable[local_index].inherited)this.get_stored_inherited_value(local_index); //a) Is a normal by Value variable.
            else this.get_stored_value(local_index); //b) Is an Inherited variable of a by Value variable.
        }
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
    get_stored_inherited_ref(target) {
        let offset = this.SymbolTable[target].offset;
        this.operate('P',offset,'+',this.t);
        this.get_stack(this.t,this.t); //t holds a reference to the Stack
        this.push_cache(0); //we push 0 to indicate to use the ref in the stack
        this.push_cache(this.t); //We push the ref.
    },
    get_stored_ref(target) {
        let offset = this.SymbolTable[target].offset;
        this.operate('P',offset,'+',this.t);
        this.push_cache(0); //We indicate to use the ref in the stack
        this.push_cache(this.t);
    },
    resolve_member_id(node,resolve_as_signature = false,static_access = false,resolve_as_ref=false) {
        /*
        *This method searches the id as a member of the previous id in the chain.
        * Static methods are not allowed to be solved here.
        * */
        let name = node.text;
        let owner = this.evaluation_stack.pop(); //We get the type from the past member of the chain
        if(resolve_as_signature)owner = this.types[owner]; //we get the actual type.
        if(owner.is_array()){
            //Alright, the previous member resolved as Array. This means there's only one option:
            //.length has been called.
            if(name!='length')throw new semantic_exception('Cannot read property: '+name+" of: Array",node);
            if(resolve_as_signature){
                this.evaluation_stack.push(INTEGER);
                return;
            }
            this.pop_cache(this.t); //t = array_address.
            if(resolve_as_ref){
               this.push_cache(1); //where to use
               this.push_cache(this.t); //ref
            }else{
                this.get_heap(this.t,this.t); //We get the length of the array.
                this.push_cache(this.t); //We push the answer.
            }
            this.evaluation_stack.push(this.types[INTEGER]); //that's all!
            return;
        }
        if(!owner.is_class())throw new semantic_exception("Cannot resolve field access in type: "+owner.signature,node);
        if(static_access){
            //Alright, let's search for it in the SymbolTable:
            let signature = owner.signature+"."+name;
            let target = this.get_index(signature);
            if(target==-1)throw new semantic_exception('static field: '+name+' NOT found.',node);
            if(this.SymbolTable[target].block)throw new semantic_exception('static member: '+name+' is NOT a field.');
            if(resolve_as_signature){
                this.evaluation_stack.push(this.SymbolTable[target].type);
                return;
            }
            this.evaluation_stack.push(this.types[this.SymbolTable[target].type]);
            if(resolve_as_ref){
                this.resolve_final_initialization(target,node);
                if(this.SymbolTable[target].inherited)this.get_stored_inherited_ref(target);
                else this.get_stored_ref(target);
            }else{
                if(this.SymbolTable[target].inherited)this.get_stored_inherited_value(target); //a) Is a normal by Value variable.
                else this.get_stored_value(target); //b) Is an Inherited variable of a by Value variable.
            }
            return;
        }
        let field = this.get_field(name,owner.signature,node);
        if(field==undefined)throw new semantic_exception("Undefined field: "+node.text+" In class:"+owner.signature,node);
        if(resolve_as_signature){
            this.evaluation_stack.push(field.type);//We push the type and return without doing anything else.
            return;
        }
        let id = field.id;
        if(resolve_as_ref){
            if(field.final){
                if(field.initialized){ //It is final and has already been initialized. you cannot attempt to change it. throw except.
                    throw new semantic_exception(field.name+' is final and has already been initialized.',node);
                }else field.initialized = true; //If it hasn't been initialized yet, it means it is finally being initialized. Change the state and proceed as normal.
            }
            this.get_value_from_ref(); //There's a ref to the obj pushed in the cache not the actual obj.
        }
        //Now the actual this reference is pushed in the cache.
        this.assign(this.t1,id);
        this.push_cache(this.t1); //We push it to the cache on top of the this reference.
        if(resolve_as_ref)this.call('get_field_reference');
        else this.call('get_field');
        this.evaluation_stack.push(this.types[field.type]);//We push the type for the next iteration.
        return;
    },
    resolve_global_functionCall(node,resolve_as_signature = false) { //This method expects you to send the class where the method belongs to.
            if(this.is_native_function(node,resolve_as_signature))return;
            //1) Compile the signature for the function:
            let function_name = node.children[0].text;
            let paramL = node.children[node.children.length-1];
            this.compile_signature(paramL);
            let signature = this.evaluation_stack.pop();
            signature = function_name+signature;
            /*
            * Alright, we're the first in the chain and we know the signature of the function We're calling.
            * There's only 2 scenarios here:
            * the signature is for an static method within the class this token was written into
            * And the signature is for a normal method within the class it has been written into.
            * */
            let owner = Compiler.get_class(node);
            //Alright, let's get this started. First scenario: (static method)
            let target_func = this.get_static_field(signature,owner,node,true);
            if(target_func==-1){ //Nope, is not an static method. It could still be a normal method:
                let method = this.get_field(signature,owner,node);
                if(method==undefined)throw new semantic_exception('method: '+signature+" Has NOT been defined.",node);
                if(method.category=='field')throw new semantic_exception(method.name+" is NOT a function.",node); //Just in case
                this.varChainIndex.push(0); //we reset the var chain index as we're within a global function resolution.
                this.resolve_method_call(method,node,resolve_as_signature);
                this.varChainIndex.pop();
                return;
            }
            if(resolve_as_signature){
                this.evaluation_stack.push(this.SymbolTable[target_func].type); //We push the return type
                return;
            }
            this.perform_static_function_call(target_func,paramL);
    },
    is_within_constructor:function(){
      let indeed = false;
        this.stack.forEach(s=>{
           if(s=='constructor')indeed = true;
        });
        return indeed;
    },
    is_native_function(node,value_as_signature=false) {
        /*
        * This function performs the evaluation of a native function and
        * pushes the result to the cache as well as the return type.
        * If no value is expected (procedure) 0 is pushed to the cache and null as type.
        * */
        let func_name = node.children[0].text;
        let paramL = node.children[node.children.length-1];
        switch (func_name){
            case "super":{
                if(!this.is_within_constructor())throw new semantic_exception('super keyword can only be used within a constructor.',node);
                if(value_as_signature)
                {
                    this.evaluation_stack.push('void');
                    return true;
                }
                let target = Compiler.get_class(node);
                target = this.classes[target]; //We get the actual class of the caller.
                target = target.parent; //We get the name of the immediate parent of the caller.
                target = this.classes[target]; //We get the actual parent class.
                this.compile_signature(paramL);
                let signature = this.evaluation_stack.pop();
                let target_func = this.get_static_field(signature,target.name,node,true,true);
                if(target_func==-1){
                    if(signature.includes('-'))throw new semantic_exception('NO suitable constructor found for super keyword: '+signature,node);
                    this.call(this.native_constructor_prefix+target.name);
                }else{
                    //Alright, before calling the parent constructor we must call default constructor.
                    this.call(this.native_constructor_prefix+target.name); //Alright, a new instance of parent has now
                    //been created. You can edit this instance trough the custom constructor.
                    this.perform_static_function_call(target_func,paramL,true);
                }
                //Alright the parent's instance has now been created. We must start the transferring process.
                //0)Push the this reference we're using:
                this.get_stored_value(this.get_index('this'));
                this.call('___inherit___');
                this.evaluation_stack.push(this.types[VOID]); //We push the type and return.
            }return true;
            case "println":
            case "print":
                if(value_as_signature){
                    this.evaluation_stack.push(VOID);
                    return true;
                }
                this.stack.push(func_name);
                this.format_text(paramL);
                this.stack.pop();
                if(this.is_within_expression())throw new semantic_exception('Cannot call println from within an expression.',node);
                this.evaluation_stack.push(this.types[VOID]);
                return true;
            case "str":
                if(value_as_signature){
                    this.evaluation_stack.push('String');
                    return true;
                }
                if(paramL.children.length==1){//Only one parameter allowed.
                    this.stack.push('expression');
                    this.value_expression(paramL.children[0]); //First direct child is a ParamL and first child there is the actual param.
                    this.stack.pop();
                    let type = this.evaluation_stack.pop();
                    this.cast_to_string(type,node);
                    this.evaluation_stack.push(this.types['String']);
                }else throw new semantic_exception("More parameters than expected for function: "+func_name,node);
                return true;
            case "toInt":
            case "toDouble":
                if(value_as_signature){
                    if(func_name=='toDouble') this.evaluation_stack.push(DOUBLE);
                    else this.evaluation_stack.push(INTEGER);
                    return true;
                }
                if(paramL.children.length==1){//Only one parameter allowed.
                    this.value_expression(paramL.children[0]); //We value the param.
                    let type = this.evaluation_stack.pop();
                    if(!type.is_class())throw new semantic_exception('Invalid parameter for '+func_name+" function." +
                        " Expected: String. Got: "+type.signature,node);
                    this.compatible_types(this.types['String'],type,paramL); //We verify it is an String.
                    if(func_name=='toDouble'){
                        this.get_char_array();
                        this.call('string_to_double');
                    }else{
                        this.cast_to_integer(type); //We cast it to Integer.
                    }
                    if(func_name=='toDouble') this.evaluation_stack.push(this.types[DOUBLE]);
                        else this.evaluation_stack.push(this.types[INTEGER]);
                }else throw new semantic_exception("More parameters than expected for function: "+func_name,node);
                return true;
            case "toChar":
                if(value_as_signature){
                    this.evaluation_stack.push(CHAR);
                    return true;
                }
                if(paramL.children.length==1){//Only one parameter allowed.
                    this.value_expression(paramL.children[0]); //We value the param.
                    let type = this.evaluation_stack.pop();
                    if(!type.is_class())throw new semantic_exception('Invalid parameter for '+func_name+" function." +
                        " Expected: String. Got: "+type.signature,node);
                    this.compatible_types(this.types['String'],type,paramL); //We verify it is an String.
                    this.get_char_array();
                    this.pop_cache(this.t);//t = char array address.
                    this.operate(this.t,'1','+',this.t); //we increase t by one to get the first char in the array.
                    this.get_heap(this.t,this.t); //we get the first char.
                    this.push_cache(this.t); //we push the char.
                    this.evaluation_stack.push(this.types[CHAR]);
                }else throw new semantic_exception("More parameters than expected for function: "+func_name,node);
                return true;
            case "pow":
            {
                if(value_as_signature){
                    this.evaluation_stack.push(DOUBLE);
                    return ;
                }
                if(paramL.children.length==2){//Only 2 parameters allowed.
                    this.value_expression(paramL.children[0]); //We value the first param.
                    let type = this.evaluation_stack.pop();
                    if(!type.is_primitive())throw new semantic_exception('Invalid pow parameter. Expected: double|int|char. got: '+type.signature);
                    this.value_expression(paramL.children[1]); //We value the second param.
                    type = this.evaluation_stack.pop();
                    if(!type.is_primitive())throw new semantic_exception('Invalid pow parameter. Expected: double|int|char. got: '+type.signature);
                    //Alright, both numbers are currently in the cache, let's pow them:
                    this.call('pow');
                    this.evaluation_stack.push(this.types[DOUBLE]);
                }else throw new semantic_exception("More parameters than expected for function: "+func_name,node);
            }
                return true;
            case "abs":
                if(value_as_signature){
                    this.evaluation_stack.push(INTEGER);
                    return ;
                }
                if(paramL.children.length==1){//Only 1 parameters allowed.
                    this.value_expression(paramL.children[0]); //We value the first param.
                    let type = this.evaluation_stack.pop();
                    if(!type.is_primitive())throw new semantic_exception('Invalid abs parameter. Expected: double|int|char. got: '+type.signature);
                    //Alright, both numbers are currently in the cache, let's pow them:
                    this.pop_cache(this.t3);
                    this.get_abs(this.t3);
                    this.push_cache(this.t3);
                    this.evaluation_stack.push(type);
                }else return false;
                return true;
            case "write_file":
                if(value_as_signature){
                    this.evaluation_stack.push(VOID);
                    return true;
                }
                if(this.is_within_expression())throw new semantic_exception('Cannot call write_file from within an expression.',node);
                if(paramL.children.length==2){//Only two parameters allowed.
                    this.value_expression(paramL.children[0]); //We value the first param.
                    let type = this.evaluation_stack.pop();
                    if(!type.is_class())throw new semantic_exception('Invalid parameter for '+func_name+" function." +
                        " Expected: String. Got: "+type.signature,node);
                    this.compatible_types(this.types['String'],type,paramL); //We verify it is an String.
                    this.get_char_array(); //we replace the String by the charArray.
                    this.value_expression(paramL.children[1]); //We value the second param.
                    type = this.evaluation_stack.pop();
                    if(!type.is_class())throw new semantic_exception('Invalid parameter for '+func_name+" function." +
                        " Expected: String. Got: "+type.signature,node);
                    this.compatible_types(this.types['String'],type,paramL); //We verify it is an String too.
                    this.get_char_array(); //we replace the String by the charArray.
                    this.write_file(); //We print the file.
                    this.evaluation_stack.push(this.types[VOID]);
                }else throw new semantic_exception("More or less parameters than expected for function: "+func_name,node);
                return true;
            case "read":
                if(value_as_signature){
                    this.evaluation_stack.push(STRING);
                    return true;
                }
                if(this.is_within_expression())throw new semantic_exception('Cannot call read from within an expression.',node);
                if(paramL.children.length==1){//Only one parameters allowed.
                    this.value_expression(paramL.children[0]); //We value the first param.
                    let type = this.evaluation_stack.pop();
                    if(!type.is_class())throw new semantic_exception('Invalid parameter for '+func_name+" function." +
                        " Expected: String. Got: "+type.signature,node);
                    this.compatible_types(this.types['String'],type,paramL); //We verify it is an String.
                    this.get_char_array(); //we replace the String by the charArray.
                    this.read('path'); //We read the file
                    this.call('build_string');
                    this.evaluation_stack.push(this.types['String']);
                }else throw new semantic_exception("More or less parameters than expected for function: "+func_name,node);

            default:
                return false;
        }
    },
    format_text(paramList) {
        //This method takes any parameter, casts it to string (if possible) and prints it.
        if(paramList.children.length!=1)throw new semantic_exception('Only one parameter expected for println function. Found: '+paramList.children.length);
        this.value_expression(paramList.children[0]); //We value the param as expression.
        let type = this.evaluation_stack.pop();
        this.cast_to_string(type,paramList);
        this.get_char_array(); //We remove the String ref from the top and push a charArray ref instead.
        this.call('print_string'); //We print the String
        if(this.is_within_println()){
            this.printChar('\n'.charCodeAt(0));
        }
    },
    cast_to_double:function(og){
        this.pop_cache(this.t1); //t1 = value to downcast.
        switch (og.signature) {
            case INTEGER:
            case DOUBLE:
            case BOOLEAN:
            case CHAR:
                this.push_cache(this.t1);
                return;
            default:
                this.push_cache(0); //Any other primitive, its representation as double is 0;
        }
    },
    cast_to_string(og,anchor) {
        if(og.is_class())if(this.compatible_classes('String',og.signature))return; //Nothing to do, is already an string
        this.pop_cache(this.t1); //t1 = value to downcast.
        if(og.signature==CHAR){
            this.build_unary_char_array(this.t1);
            this.call('build_string'); //We take the charArray and & wrap it within an String class.
        }else if(og.signature==INTEGER){
            this.push_cache(this.t1); //We push it back
            this.call('int_to_string'); //We transform it to a char array
            this.call('build_string'); //We wrap it to an String class
        }else if(og.signature==DOUBLE){
            //We must transform the real to integer before we call the function.
            //Either that or call an special function to handle doubles but atm we'll just transform it to int.
            const double_decimal_part = 'double_decimal_part';
            const double_integer_part = 'double_integer_part';
            this.assign(double_integer_part,this.t1); //we copy t1's value to the integer part.
            this.remove_decimal_part(double_integer_part); //we remove all decimals.
            this.operate(this.t1,'1','%',double_decimal_part);
            this.operate(double_decimal_part,ACCURACY*10000,'*',double_decimal_part);
            this.remove_decimal_part(double_decimal_part); //in case there's even extra decimals we remove them.
            this.get_abs(double_decimal_part); //in case it is negative, there's no sign for the decimal part either way.
            this.push_cache(double_integer_part); //we push the integer part of the number
            this.call('int_to_string'); //We transform it to a char array
            this.build_unary_char_array('.'.charCodeAt(0)); //we build a unary char array holding the .
            this.call('___sum_strings___'); //we perform a pure sum (integer + .
            this.push_cache(double_decimal_part); //we push the decimals we'll display.
            this.call('int_to_string'); //We transform them to a char array.
            this.call('___sum_strings___');//we perform a second sum (integer. + decimal)
            this.call('build_string'); //We wrap the result in a String class.
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
            this.stack.push('expression');
            this.value_expression(param,true);
            this.stack.pop();
            res += "-"+this.evaluation_stack.pop();
        });
        this.evaluation_stack.push(res);
        return;
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
            let res = Compiler.get_var_index(index, signature);
            if(res != -1){
                return res;
            }
        }
        return -1;  //Not found :(
    },
    resolve_method_call(field, node,resolve_as_signature=false) {
        let n;
        if(field.name=="_toString_")n = "toString"; //Some dirty hacks to allow toString overloading (since JS finds a naming conflict with it)
        else n = field.name;
        if(this.is_within_expression()){
            if(field.type=='void')throw new semantic_exception('Cannot call a void function from within an expression. Function: '+field.name,node);
        }
        if(resolve_as_signature){
            this.evaluation_stack.push(field.type);
            return;
        }
        let paramL = node.children[node.children.length-1];
        if(this.peek(this.varChainIndex)==0){
         //We have to load the this reference first:
            let this_index = this.get_index('this');
            if(this_index==-1)throw new semantic_exception('Cannot access: '+field.name+" Within a static context.",node);
            if(this.SymbolTable[this_index].inherited)this.get_stored_inherited_value(this_index); //We push it to the evaluation stack
            else this.get_stored_value(this_index); //We push the this reference to the cache.
        }
        let signature = field.owner+"."+n;
        let target_func = this.get_func_index(signature);
        this.value_parameters(paramL);
        //Alright, all params have been valuated backwards, however the this reference is at the bottom of all params.
        //We'll use the heap as a secondary stack for the purpose of taking out the this reference from the bottom and pushing it to the top.
        this.push_cache(paramL.children.length);
        this.call('send_this_reference_to_top');
        this.stack.push("function_call");
        this.perform_jump(this.peek(this.scope),target_func,this.SymbolTable[this.peek(this.scope)].size);
        this.stack.pop(); //That's all!
        this.evaluation_stack.push(this.types[this.SymbolTable[target_func].type]);
    },
    get_field:function(name,owner,token){
        if(name=='toString')name='_toString_';
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
    get_static_field(signature,owner,token,method=false,constructor=false){
        //static fields are stored in the SymbolTable therefore this method returns the index of the field in the symbol table.
        //The owner here is the name of the class that is requesting the field.
        let static_method;
        if(constructor) static_method = "*."+owner+signature;
        else static_method = owner+".static."+signature; //If you're requesting a method it must have this signature
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
    },
    value_parameters(paramL) {
        let i = paramL.children.length-1;
        while(i>=0){ //We value them backwards. So we can have them in order after valuating all parameters.
            this.stack.push('expression');
            this.value_expression(paramL.children[i]);
            this.stack.pop();
            this.evaluation_stack.pop(); //We don't need the type any more.
            i--;
        }
    },
    is_within_expression:function () {
      let not_within_expression = false;
      this.stack.forEach(s=>{
         if(s=='expect-void')not_within_expression = true;
      });
      return !not_within_expression;
    },
    is_native_method(owner, signature,resolve_as_signature,paramL) {
        //Alright, here I can overwrite and implement by hand any native method!
        //This is different from is_native_function, because that one is used for native static functions.
        //This is used for native normal methods (like equals, length, toLowerCase, etc)
        //Object native methods:

        owner = this.types[owner];

        if(owner.is_class()){ //This small block here allows the user to override native methods.
            let t_owner = this.classes[owner.signature];
            let overridden;
            if(signature=='toString')overridden = t_owner.fields["_"+signature+"_"]; //We must change the signature's name to prevent errors with JS.
              else overridden= t_owner.fields[signature];
            if(signature.startsWith('equals')||
                signature=='toString'||
                signature == 'getClass'
            ){
                if(overridden!=undefined)if(overridden.owner!='Object')return false; //This means this method has been implemented
            }
            if(signature=='length'||
                signature=='toCharArray'||
                signature=='toUpperCase'||
                signature=='toLowerCase'
            ){
                if(overridden.owner!='String')return false; //This means this method has been implemented
            }
        }
        if(signature.startsWith('equals')){ //The highest precedence amongst all native functions. Doesn't matter who's the caller or what are the params.
            if(resolve_as_signature){
                this.evaluation_stack.push(BOOLEAN);
                return true;
            }
            //Alright, first things first, value he parameters:
            if(paramL.children.length!=1)throw new semantic_exception('Incorrect amount of parameters for equals function. Expected: 1. Got: '+paramL.length,paramL);
            this.value_expression(paramL.children[0]);
            let param_type = this.evaluation_stack.pop();
            if(this.compatible_types(this.types['String'],owner,paramL,false)&&
            this.compatible_types(this.types['String'],param_type,paramL,false)){
                //Both are Strings and both are already pushed to the top of the cache.
                //let's just compare them:
                this.call('compare_strings');
            }else{
                if(!(owner.is_class()&&param_type.is_class()))throw new semantic_exception('equals method can only be called with 1 Object as parameter.' +
                    'Expected: Object, got: '+param_type.signature,paramL);
                //Alright, just made sure both are objects, in that case, just compare their IDs.
                //Or should I compare their instance address?
                this.pop_cache(this.t1); //Obj1
                this.pop_cache(this.t2); //Obj2
                this.operate(this.t1,this.t2,'==',this.t3);
                this.push_cache(this.t3); //We'll just compare their instance address.
            }
            this.evaluation_stack.push(this.types[BOOLEAN]);
            return true;
        }
        else if(signature == 'toString'){
         //Returns null or an String saying it is an Object with certain ID.
         //Please, try to avoid its usage at all costs. As it performs a series of String summing that is NOT optimal at all.
            if(resolve_as_signature){
                this.evaluation_stack.push('String');
                return true;
            }
            this.call('___toString___');
            this.call('build_string');
            this.evaluation_stack.push(this.types['String']);
            return true;
        }
        else if(signature=='getClass'){//Second highest precedence, doesn't matter who's the caller.
            if(resolve_as_signature){
                this.evaluation_stack.push('String');
                return true;
            }
            //A this reference is already pushed in the cache atm.
            //We just gotta build an String from it:
            this.call('get_class');
            this.call('build_string');
            this.evaluation_stack.push(this.types['String']);
            return true;
        }
        if(this.compatible_types(this.types['String'],owner,paramL,false)){
            //String compatible
            switch (signature) {
                case 'toCharArray':
                    if(resolve_as_signature){
                    this.evaluation_stack.push(CHAR_ARRAY);
                    return true;
                    }
                    this.get_char_array();
                    this.evaluation_stack.push(this.types[CHAR_ARRAY]);
                    return true;
                case 'length':if(resolve_as_signature){
                    this.evaluation_stack.push(INTEGER);
                    return true;
                }
                    this.get_char_array();
                    this.pop_cache(this.t1); //t1 holds a CharArray address.
                    this.get_heap(this.t1,this.t1); //We get the size of the array.
                    this.push_cache(this.t1); //We push the size.
                    this.evaluation_stack.push(this.types[INTEGER]);
                    return true;
                case 'toLowerCase':
                    if(resolve_as_signature){
                        this.evaluation_stack.push('String');
                        return true;
                    }
                    this.get_char_array(); //we get the char array from the String instance.
                    this.call('to_lower_case');
                    this.call('build_string');
                    this.evaluation_stack.push(this.types['String']);
                    return true;
                case 'toUpperCase':
                    if(resolve_as_signature){
                        this.evaluation_stack.push('String');
                        return true;
                    }
                    this.get_char_array();
                    this.call('to_upper_case');
                    this.call('build_string');
                    this.evaluation_stack.push(this.types['String']);
                    return true;
            }
        }
        return false;
    },
    is_lower_case:function(){
      Printing.add_function('is_lower_case') ;
      this.pop_cache(this.t); //t = char.
        const lF = this.generate_label();
        const lEnd = this.generate_label();
        this.pureIf(this.t,96,'<=',lF);
        this.pureIf(this.t,123,'>=',lF);
        this.assign(this.t3,1);
        this.goto(lEnd);
        this.set_label(lF);
        this.assign(this.t3,0);
        this.set_label(lEnd);
        this.push_cache(this.t3);
        Printing.print_function();
    },is_upper_case:function(){
        Printing.add_function('is_upper_case') ;
        this.pop_cache(this.t); //t = char.
        const lF = this.generate_label();
        const lEnd = this.generate_label();
        this.pureIf(this.t,64,'<=',lF);
        this.pureIf(this.t,91,'>=',lF);
        this.assign(this.t3,1);
        this.goto(lEnd);
        this.set_label(lF);
        this.assign(this.t3,0);
        this.set_label(lEnd);
        this.push_cache(this.t3);
        Printing.print_function();
    },
    to_case:function(){
      /*
      * This method prints both toUpperCase & toLowerCase methods.
      * */
      let counter = 0;
      while(counter<2){
          if(counter==0)Printing.add_function('to_lower_case');
          else Printing.add_function('to_upper_case');
          const charArray = 'charArray';
          const og_charArray = 'ogCharArray';
          const char = 'char';
          const size = 'size';
          const i = 'i';
          const whileStart = this.generate_label();
          const whileEnd = this.generate_label();
          this.pop_cache(og_charArray);
          this.get_heap(size,og_charArray);
          this.operate(size,1,'+','ag');
          this.push_cache('ag');
          this.call('malloc');
          this.pop_cache(charArray); //charArray -> New String
          this.set_heap(charArray,size); //We set the size of the new String.
          this.assign(i,1);
          this.set_label(whileStart);
          this.pureIf(i,size,'>',whileEnd);
          this.operate(og_charArray,i,'+',char);
          this.get_heap(char,char); //we get the actual char.
          this.push_cache(char); //We push the char
          if(counter==0)this.call('is_upper_case');
          else this.call('is_lower_case');
          this.pop_cache(this.t); //t = true/false.
          const lNext = this.generate_label();
          this.pureIf(this.t,'0','==',lNext);
          if(counter==0)this.operate(char,'32','+',char);//we update the char
          else this.operate(char,'32','-',char);
          this.set_label(lNext);
          this.operate(charArray,i,'+',this.t3); //we get the char's address in the new String.
          this.set_heap(this.t3,char); //We replace the char.
          this.operate(i,1,'+',i);
          this.goto(whileStart);
          this.set_label(whileEnd);
          this.push_cache(charArray); //we push the modified array.
          Printing.print_function();
          counter++;
      }
    },
    perform_static_function_call(target_func, paramL,constructorCall = false) {
        if(this.is_within_expression())
            if(this.SymbolTable[target_func].type=='void')
                throw new semantic_exception('Cannot call a void function from within an expression. Function: '+signature,paramL);
        this.value_parameters(paramL);
        if(constructorCall){
         this.push_cache(paramL.children.length);
         this.call('send_this_reference_to_top');
        }
        this.stack.push("function_call");
        this.perform_jump(this.peek(this.scope),target_func,this.SymbolTable[this.peek(this.scope)].size);
        this.stack.pop();
        this.evaluation_stack.push(this.types[this.SymbolTable[target_func].type]);
    },
    cast_to_integer(og) {
        this.pop_cache(this.t1); //t1 = value to downcast.
        if(og.is_class()){
            //We'll assume that if it is a class it is an String compatible class.
            //We must check first before calling this method.
            this.push_cache(this.t1); //We push back the String instance address.
            this.get_char_array(); //We get the char Array.
            this.call('string_to_int'); //that's all!
            return;
        }
        switch (og.signature) {
            case INTEGER:
            case BOOLEAN:
            case CHAR:
                this.push_cache(this.t1);
                return;
            case DOUBLE:
                this.operate(this.t1,'1','%',this.t2); //t2 = decimal part
                this.operate(this.t1,this.t2,'-',this.t1); //We remove the decimal part
                this.push_cache(this.t1); //We push it back.
                return;
            default:
                this.push_cache(0); //Any other primitive, its representation as double is 0;
        }
    },
    cast_to_char(og) {
        this.pop_cache(this.t1);
        switch (og.signature) {
            case DOUBLE:
                this.operate(this.t1,'1','%',this.t2); //t2 = decimal part
                this.operate(this.t1,this.t2,'-',this.t1); //We remove the decimal part
            case INTEGER:
            case BOOLEAN:
            case CHAR:
                let lWrong = this.generate_label();
                let lEnd = this.generate_label();
                this.pureIf(this.t1,'255','>',lWrong);
                this.pureIf(this.t1,'0','<',lWrong);
                this.push_cache(this.t1);
                this.goto(lEnd);
                this.set_label(lWrong);
                this.push_cache(-1);
                this.push_cache(this.t1);
                this.exit(2); //cant cast numeric to char.
                this.set_label(lEnd);
                return;
            default:
                this.push_cache(0);
        }
    },
    cast_to_boolean(og) {
        this.pop_cache(this.t1);
        let lV = this.generate_label();
        let lEnd = this.generate_label();
        this.pureIf(this.t1,'1','==',lV);
        this.assign(this.t1,0);
        this.goto(lEnd);
        this.set_label(lV);
        this.assign(this.t1,1);
        this.set_label(lEnd);
        this.push_cache(this.t1);
    },
    get_value_from_ref() {
        //right now there's two values in the cache:
        //ref to either stack/heap
        //where to use
        let lV = this.generate_label();
        let lEnd = this.generate_label();
        this.pop_cache(this.t1); //ref
        this.pop_cache(this.t2); //where to use
        this.pureIf(this.t2,'1','==',lV);
        this.get_stack(this.t1,this.t1); //We use the ref in the stack and get the value.
        this.goto(lEnd);
        this.set_label(lV);
        this.get_heap(this.t1,this.t1); //We use the ref in the heap and get the value.
        this.set_label(lEnd);
        this.push_cache(this.t1); //We push the value back in the cache.
    },
    auto_update(node, returnValue) {
        //0) first of all, value expression as reference.
        this.value_expression(node.children[0],false,true);
        //1) now, value it again as value:
        this.value_expression(node.children[0]);
        let i_type = this.evaluation_stack.pop(); //the expression type
        this.evaluation_stack.pop(); //We dispose of the second one as they're obviously the same.
        if(!i_type.is_number())throw new semantic_exception('Auto increment operator can only be used with numeric variables.',node);
        this.pop_cache(this.t1); //We retrieve the value (which is numeric)
        if(node.name=='post-increment'||node.name=='pre-increment')
            this.operate(this.t1,'1','+',this.t1); //We increase it by one.
        else  this.operate(this.t1,'1','-',this.t1); //We decrease it by one.
        //Now, set the new value:
        this.pop_cache('target_ref');
        this.pop_cache('where_to_use');
        let lV = this.generate_label();
        let lEnd = this.generate_label();
        this.pureIf('where_to_use','1','==',lV);
        this.set_stack('target_ref',this.t1);
        this.goto(lEnd);
        this.set_label(lV);
        this.set_heap('target_ref',this.t1); //for use in the heap
        this.set_label(lEnd);
        //And return the updated value:
        if(returnValue) {
            this.push_cache(this.t1);
            this.evaluation_stack.push(i_type);
        }
        //Else don't return anything, that's all!
    },
    ___sum_strings___:function(){
        Printing.add_function('___sum_strings___');
        /*
        * This method takes two array addresses from the cache, allocates a new one and
        * puts the contents of both there. The resultant array is pushed back to the cache.
        * */
        let right = 'right';
        let left = 'left';
        this.pop_cache(right);
        this.pop_cache(left);
        let left_size = 'left_size';
        let right_size = 'right_size';
        this.get_heap(left_size,left);
        this.get_heap(right_size,right);
        let result = 'result';
        let new_size = 'new_size';
        this.operate(right_size,'1','+',result);
        this.operate(result,left_size,'+',result);
        this.push_cache(result);
        this.call('malloc');
        this.pop_cache(result);
        this.operate(left_size,right_size,'+',new_size);
        this.set_heap(result,new_size);
        let i = 'i';
        let ii = 'ii';
        this.assign(i,1);
        this.assign(ii,1);

        let WhileStart1 = this.generate_label();
        let WhileEnd1 = this.generate_label();
        let next_char = 'next_char';
        this.set_label(WhileStart1);
        this.pureIf(i,left_size,'>',WhileEnd1);
        this.operate(left,i,'+',next_char);
        this.get_heap(next_char,next_char);
        this.operate(result,ii,'+',this.t1);
        this.set_heap(this.t1,next_char);
        this.operate(ii,'1','+',ii);
        this.operate(i,'1','+',i);
        this.goto(WhileStart1);
        this.set_label(WhileEnd1);

        let WhileStart2 = this.generate_label();
        let WhileEnd2 = this.generate_label();
        this.assign(i,1);
        this.set_label(WhileStart2);
        this.pureIf(i,right_size,'>',WhileEnd2);
        this.operate(right,i,'+',next_char);
        this.get_heap(next_char,next_char);
        this.operate(result,ii,'+',this.t1);
        this.set_heap(this.t1,next_char);
        this.operate(ii,'1','+',ii);
        this.operate(i,'1','+',i);
        this.goto(WhileStart2);
        this.set_label(WhileEnd2);
        this.push_cache(result);
        Printing.print_function();
    },
    get_char_array:function(){
        /*
        *This function takes an String reference from the top of the cache and
        * returns a reference to the char array within.
        *  */
        let char_array = this.classes['String'].fields['char_array'];
        this.push_cache(char_array.id); //We push the id of the field on top of the String reference.
        this.call('get_field'); //Well... that's all!
    },
    evaluate_node(node) {
        /*
        * This method is the bread & butter of the code generator.
        * It switches the node's name and outputs 3D code accordingly.
        * IDs are NOT allowed to come in this context.
        * */
        switch (node.name) {
            case 'program':
                //Alright, the very beginning of the code generator. All natives are
                //supposed to be already printed. at this point. So basically we just need to evaluate the children
                //and catch exceptions if any.
                this.stack.push('program');
                try {
                    node.children.forEach(child=>{
                       this.evaluate_node(child);
                    });
                    this.stack.pop();
                    _log('Compilation finished successfully!');
                }catch (e) {
                    _log('One or more errors occurred during compilation. see error tab for details.');
                    if(!("semantic" in e))console.log(e);
                    reset_compilation_cycle();
                }
                return;
            case 'assignation':
                //Alright, if everything is correct this method is quite simple & straight forward:
                //0) value the left side as reference:
                let left_side = node.children[0];
                let right_side = node.children[1];
                this.value_expression(left_side,false,true);
                this.value_expression(right_side,false,false);
                let value_type = this.evaluation_stack.pop();
                let recipient_type = this.evaluation_stack.pop();
                this.compatible_types(recipient_type,value_type,node);
                if(value_type.signature=='double'){
                    if(recipient_type.is_integer())throw new semantic_exception('incompatible types: possible lossy conversion from double to '+
                    recipient_type.signature,node);
                }
                this.pop_cache(this.t); //t = value
                this.pop_cache(this.t1); //t1 = ref
                this.pop_cache(this.t2); //where to use
                let lEnd = this.generate_label();
                let lV = this.generate_label();
                this.pureIf(this.t2,'1','==',lV);
                this.set_stack(this.t1,this.t); //For use in the stack.
                this.goto(lEnd);
                this.set_label(lV);
                this.set_heap(this.t1,this.t); //For use in the heap.
                this.set_label(lEnd);
                return;
            case 'variableDef':
            {
                let recipient_type = node.children[0].text; //We get the type name
                recipient_type = this.types[recipient_type]; //We get the actual type.
                let name = node.children[1].text; //We get the name of the var
                if(node.children.length==3){
                    //Default value was provided.
                    this.value_expression(node.children[node.children.length-1]); //We value the expression.
                    let value_type = this.evaluation_stack.pop();
                    this.compatible_types(recipient_type,value_type,node);
                }else this.push_cache(0); //Otherwise we push default value: 0
                let target_var = this.get_index(name);
                //This variable must exist. However, just in case:
                if(target_var==-1)throw new semantic_exception('FATAL ERROR!! Somehow a variable has been declared and yet it doesn\'t' +
                    ' appear in the symbol table!!! WTF?!',node);
                //Alright, so the variable we're declaring does exist. Next step is updating its value:
                this.pop_cache(this.t1); //t1 = default value.
                this.operate('P',this.SymbolTable[target_var].offset,'+',this.t); //t = address of the variable.
                this.set_stack(this.t,this.t1); //We set the variable.
                //That's all!!
            }
                return;
            case 'varChain':
                //Alright, this is a function call. Is pretty simple, just value the expression as
                //value and dispose of the result.
                //pretty simple if you ask me.
                //Just add context that you're expecting void:
                this.stack.push('expect-void');
                this.value_expression(node);
                let return_type = this.evaluation_stack.pop();
                if(return_type.signature != 'void'){
                    this.pop_cache(this.t); //We dispose of the return value. (if any)
                }
                this.stack.pop();
                return;
            case 'pre-increment':
            case 'pre-decrement':
            case 'post-increment':
            case 'post-decrement':
                this.auto_update(node,false);
                return;

            case 'constructor':
                /**
                //Alright, time to define custom constructors!
                //A custom constructor will NOT actually build a new param from scratch.
                //It will simply update the default one a native constructor returns.
                //At the end it return the this reference it used.
                //The super constructor might be kind of an issue, as it'd
                //imply building an ancestor object and then transferring its properties
                //to the caller. Doable but I'll implement later.
                 Is basically the same as a normal method, except it returns the this reference
                 at the end & I must not check whether it has or not valid return stmts.
                 The usage of return stmts might produce unexpected behaviour, however,
                 they aren't completely forbidden. I leave correct usage
                 of returns to the user.
                **/
            case 'method':
            case 'staticMethod':
                /*
                * Alright, this method is going to output 3D code for user-defined functions.
                * It handles the following: Scope changing (courtesy of our scope_tracker)
                * Setting the current function index = scope.peek()
                * emptying the display (Just in case, should be empty either way)
                * Generate end label and set it as current end label.
                * Traverse the tree and verify there's a valid return statement for the function.
                * that's all! evaluate the children.
                * Also, provide context that you're compiling a method.
                * */
            {
                let compiling_constructor = node.name=='constructor';
                this.current_function = this.scope_tracker.pop();
                this.scope.push(this.current_function);
                if(compiling_constructor) this.stack.push('constructor');
                    else this.stack.push('functionCompilation');
                this.endLabel = this.generate_label();
                let block = node.children[node.children.length-1];
                if(!compiling_constructor)this.holds_valid_return_stmt(block);
                Printing.add_function(this.SymbolTable[this.current_function].true_func_signature);
                try{
                    block.children.forEach(child=>{
                       this.evaluate_node(child);
                    });
                }catch (e) {
                    console.log(e);
                }
                if(compiling_constructor)this.get_stored_value(this.get_index('this')); //Alright, the constructor reference is now pushed to the top of the cache.
                this.set_label(this.endLabel);
                Printing.print_function();
                this.stack.pop();
                this.scope.pop();
            }
                return;
            case 'return':
                if(node.children.length==0){//empty return.
                    //check if the current function is void and throw if otherwise.
                    let _return_type = this.SymbolTable[this.current_function].type;
                    if(_return_type!='void')throw new semantic_exception('Incompatible return types. Expected: '+_return_type+' got: void',this.current_function);
                }else{ //holds expression.
                    this.value_expression(node.children[0]); //Only one child: expression.
                    let _return_type = this.evaluation_stack.pop();
                    let expected_type = this.SymbolTable[this.current_function].type;
                    expected_type = this.types[expected_type];
                    this.compatible_types(expected_type,_return_type,node);
                }
                //Alright, a value (or none) has been loaded to the cache already.
                // Next step is closing all scopes we opened:
                this.close_all_scopes(0);
                // Alright, we can jump to the end now:
                this.goto(this.endLabel);
                return;
            case 'break':
            {
                let target_jump = this.peek(this.break_display);
                if(target_jump==undefined)throw new semantic_exception('Invalid break instruction. Can only use break instructions within' +
                    ' loops or switch blocks.',this.current_function);
                //Alright, is a valid break, however we must close all scopes before jumping:
                this.close_all_scopes(1);
                this.goto(target_jump);
            }
                return;
            case 'continue':{
                let target_jump = this.peek(this.continue_display);
                if(target_jump==undefined)throw new semantic_exception('Invalid continue instruction. Can only use continue instructions within ' +
                    'loop blocks.',this.current_function);
                this.close_all_scopes(2);
                this.goto(target_jump);
            }return;
            case 'ifStmt':
            {
                let endLabel = this.generate_label();
                this.stack.push(endLabel); //We send the end label
                node.children.forEach(child=>{
                   this.evaluate_node(child);
                });
                this.set_label(endLabel);
            }return;
            case 'switch':
            {
                //Alright, first things first: Value expression and verify it is primitive or String:
                Printing.print_in_context(';Begin Switch');
                this.value_expression(node.children[0]); //The first child is the expression.
                this.push_cache(0); //We push 0 to indicate no cases have been matched yet.
                let switch_type = this.peek(this.evaluation_stack);
                if(!switch_type.is_primitive()){
                    //If it isn't primitive, it can still be an String:
                    this.compatible_types(this.types['String'],switch_type,node);
                }

                let endLabel = this.generate_label();
                let caseL = node.children[node.children.length-1]; //The las node is the caseL
                this.break_display.push(endLabel); //We push the end label (if it ends up using a continue statement, the end label will be used instead.)
                caseL.children.forEach(child=>{
                   this.evaluate_node(child);
                });
                this.set_label(endLabel);
                this.pop_cache(this.t); //We dispose of the matched case flag
                this.pop_cache(this.t); //We dispose of the switched value
                this.evaluation_stack.pop(); //We dispose of the Switch type.
                this.break_display.pop(); //we dispose of the end label.
            }
                return;
            case 'case':
            {
                //First of all, let's value the expression:
                let exp = node.children[0];
                let block = node.children[node.children.length-1];
                this.value_expression(exp);
                let case_type = this.evaluation_stack.pop();
                let switch_type = this.peek(this.evaluation_stack);
                this.compatible_types(switch_type,case_type,node); //We verify they're both compatible.
                let nextL = this.generate_label();
                //Alright, case value is at the top of the cache & switch value below.
                //Next thing we gotta do is check if the switch is an String:
                this.pop_cache(this.t1); //exp value
                this.pop_cache('prev'); //Previous case matched.
                this.pop_cache(this.t2); //Switched value
                this.push_cache(this.t2); //We push it back.
                const lEnterCase = this.generate_label();
                if(switch_type.is_string()){ //compare Strings
                    this.push_cache(this.t2); //We push it a second time to use it as comparison parameter.
                    this.push_cache(this.t1); //We push it again to compare.
                    this.call('compare_strings'); //Alright, compare them.
                    this.pop_cache(this.t); //t = true/false.
                    this.pureIf('prev','1','==',lEnterCase);
                    this.pureIf(this.t,'1','==',lEnterCase); //If they aren't the same go to next.
                    this.push_cache('prev');
                    this.goto(nextL);
                    this.set_label(lEnterCase);
                    this.push_cache(1); //We push 1 to indicate we matched the case.
                    this.perform_sub_block_jump(block);  //Alright, perform the jump!
                }else{ //Compare normal primitive values.
                    this.pureIf('prev','1','==',lEnterCase);
                    this.pureIf(this.t1,this.t2,'==',lEnterCase);
                    this.push_cache('prev'); //We push it back.
                    this.goto(nextL);
                    this.set_label(lEnterCase);
                    this.push_cache(1);
                    this.perform_sub_block_jump(block);
                }
                this.set_label(nextL);
            }
                return;
            case 'if':
            {
                let endLabel = this.peek(this.stack); //we get the end label
                let lNext = this.generate_label();
                //Alright, now let's compile the expression:
                this.value_expression(node.children[0]); //We value the expression for the if.
                let _if_type = this.evaluation_stack.pop();
                if(!_if_type.is_boolean())throw new semantic_exception('Invalid if argument. Expected: boolean, got: '+_if_type.signature,node);
                this.pop_cache(this.t1); //t1 = true/false
                this.pureIf(this.t1,'0','==',lNext);
                //Alright, if it is true the jump must be performed and we must change scopes.
                let block = node.children[node.children.length-1];
                this.perform_sub_block_jump(block);
                this.goto(endLabel);
                this.set_label(lNext);
            };
                return;
            case 'else':
            case 'default':
            {
                let block = node.children[node.children.length-1];
                this.perform_sub_block_jump(block); //else is always unconditional.
            }return;
            case 'while':
            {
                let exp = node.children[0];
                let block = node.children[node.children.length-1];
                let WhileStart = this.generate_label();
                let continueLabel = this.generate_label();
                let WhileFinal = this.generate_label();
                this.break_display.push(WhileFinal);
                this.continue_display.push(continueLabel);
                this.set_label(WhileStart); //First of all let's indicate where the While starts.
                //Now, let's value the expresion:
                this.value_expression(exp);
                let while_type = this.evaluation_stack.pop();
                if(!while_type.is_boolean())throw new semantic_exception('invalid while parameter. Expected: boolean ' +
                    'got: '+while_type.signature);
                this.pop_cache(this.t1); //t1 = true/false
                this.pureIf(this.t1,'0','==',WhileFinal);
                this.perform_sub_block_jump(block,continueLabel);
                this.goto(WhileStart);
                this.set_label(WhileFinal);
                this.break_display.pop();
                this.continue_display.pop();
            }
                return;
            case 'do':
            {
                let exp = node.children[0];
                let block = node.children[node.children.length-1];
                let WhileStart = this.generate_label();
                let continueLabel = this.generate_label();
                let WhileFinal = this.generate_label();
                this.break_display.push(WhileFinal);
                this.continue_display.push(continueLabel);
                this.set_label(WhileStart); //First of all let's indicate where the While starts.
                //Now, let's value the expresion:
                this.perform_sub_block_jump(block,continueLabel); //We execute the first time.
                this.value_expression(exp);
                let while_type = this.evaluation_stack.pop();
                if(!while_type.is_boolean())throw new semantic_exception('invalid do-while parameter. Expected: boolean ' +
                    'got: '+while_type.signature);
                this.pop_cache(this.t1); //t1 = true/false
                this.pureIf(this.t1,'1','==',WhileStart); //We repeat if it is true.
                this.set_label(WhileFinal);
                this.break_display.pop();
                this.continue_display.pop();
            }return;
            case 'for':
            {
                /*
                * Alright, fors are a bit more complex than regular loops.
                * The approach we took here is to build a custom while-for-loop at runtime and have it bounded
                * by the rules of regular loops.
                * */
                //0) Grab the info from the for node:
                let new_var = node.children[0];
                let exp = node.children[1];
                let update = node.children[2];
                let block = node.children[3];
                let target_block = this.sub_block_tracker.pop();
                let whileStart = this.generate_label();
                let whileEnd = this.generate_label();
                let lF = this.generate_label();
                this.continue_display.push(whileStart);
                this.break_display.push(whileEnd);
                //Alright, first things first: perform the jump:
                this.perform_jump(this.peek(this.scope),target_block,this.SymbolTable[this.peek(this.scope)].size);
                this.set_label(whileEnd);
                this.scope.push(target_block);
                this.stack.push('for');
                Printing.add_function(this.SymbolTable[target_block].true_func_signature);
                //Alright, we'll put special instructions by hand here:
                //First of all, let's perform the variable initialization:
                this.evaluate_node(new_var);
                //Alright, next step is setting the WhileStart:
                this.set_label(whileStart);
                //Next step is to value the expr:
                this.value_expression(exp);
                let for_type = this.evaluation_stack.pop();
                if(!for_type.is_boolean())throw new semantic_exception('Invalid for argument. Expected: boolean,' +
                    ' got: '+for_type.signature);
                this.pop_cache(this.t1); //t1 = true/false
                this.pureIf(this.t1,'0','==',lF);
                //Alright, we can now output the rest of the block instructions here!
                block.children.forEach(child=>{
                    try{
                        this.evaluate_node(child);
                    }catch (e) {
                        if(!("semantic" in e))console.log(e);
                    }
                });
                this.evaluate_node(update); //We update the for variable.
                this.goto(whileStart);
                this.set_label(lF);
                Printing.print_function();
                this.break_display.pop();
                this.continue_display.pop();
                this.stack.pop();
                this.scope.pop();
            }return;
            case "update":
            {
                node = node.children[0]; //It seems like we have an Update wrapped within an external Update
                let vessel = node.children[0];
                let exp = node.children[1];
                this.varChainIndex.push(0); //We initialize the varChain index since vessel is ID and NOT a varChain node.
                this.resolve_varChain(vessel,false,false,true);
                this.varChainIndex.pop();
                this.value_expression(exp);
                this.evaluation_stack.pop();
                this.evaluation_stack.pop(); //We dispose of them directly because we are sure they have the same type.
                this.pop_cache(this.t); //t = new value.
                this.pop_cache(this.t1); //t1 = ref
                this.pop_cache(this.t2); //where to use
                let lIf = this.generate_label();
                let lE = this.generate_label();
                this.pureIf(this.t2,'1','==',lIf);
                this.set_stack(this.t1,this.t);
                this.goto(lE);
                this.set_label(lIf);
                this.set_heap(this.t1,this.t);
                this.set_label(lE);
            }
                return;
            case 'field':
            case 'staticField':
            case 'abstractMethod':
                //console.log('irrelevant node for 3D code generation: '+node.name); ignored.
                return;
            default: throw new semantic_exception('Unimplemented node: '+node.name,node);
        }
    },
    mark_as_initialized(signature){
        /*
        * This method marks as initialized all entries in the symbol table
        * for a given signature (since they are not connected marking just one wouldn't update the rest.
        * */
        this.SymbolTable.forEach(row=>{
           if(row.name==signature&&row.final){ //The row.final extra check is just in case.
               row.initialized = true;
           }
        });
        //that's all!
    },
    resolve_final_initialization(local_index,node) {
        let final_row = this.SymbolTable[local_index];
        if(final_row.final&&final_row.initialized){
            throw new semantic_exception(final_row.name+" is final and has already been initialized.",node)
        }else if(final_row.final){
            //Alright, is final and hasn't been initialized. this means
            //We're finally initializing it! We can change its state and keep on going normally.
            this.mark_as_initialized(final_row.name);
        }
    },
    compatible_classes(recipient, value) {
        let _recipient_class = this.classes[recipient];
        let _value_class = this.classes[value];
        if(_recipient_class==undefined||_value_class==undefined){
            throw new _compiling_exception('FATAL ERROR! Attempted to compare 2 non-classes: '+recipient+' and '+value,null);
        }
        return ((_value_class.cc % _recipient_class.cc == 0 && _value_class.cc != _recipient_class.cc) || _recipient_class.id==_value_class.id);
    },
    compatible_types(recipient_type, value_type,node,throwException = true) {
            /*
            * This method does nothing if both types are compatible
            * or throws exception otherwise.
            * */
            if(recipient_type.is_primitive()&&value_type.is_primitive()){
                if(recipient_type.is_integer()&&value_type.signature==DOUBLE)
                     throw new semantic_exception('incompatible types: possible lossy conversion from double to '+
                        recipient_type.signature,node);
                if(recipient_type.is_number()&&value_type.is_number())return true; //We're fine.
                if(recipient_type.is_boolean()&&value_type.is_boolean())return true; //We're fine.
            }
            else if(recipient_type.is_array()&&value_type.signature==NULL){
                return true;
            }
            else if(recipient_type.is_array()&&value_type.is_array()) {
                let left_type = recipient_type.array.type;
                let right_type = value_type.array.type;
                this.compatible_types(this.types[left_type],this.types[right_type]);
                if(recipient_type.array.dimensions==value_type.array.dimensions)return true;
               // if (recipient_type.signature == value_type.signature) return true; //Arrays are already abstracted for them to show only the important info in their signatures.
            }
            else if(recipient_type.is_class()){//I'm expecting value to be null or a compatible class.
                if(value_type.signature==NULL)return true; //null is accepted regardless.
                if(this.compatible_classes(recipient_type.signature,value_type.signature))return true; //we're fine. Both classes are compatible.
            }
           if(throwException)throw new semantic_exception('Incompatible types. Cannot assign: '+value_type.signature+' to: '+recipient_type.signature,node);
           else return false;
       },
    holds_valid_return_stmt(block) {
        if(this.SymbolTable[this.current_function].type=='void')return; //If it is a void function it doesn't matter whether it has a return stmt or not.
        this.returnTracker = [0];//we reset the return tracker to default.
        this.trackReturnStmt(block);
        if(!this.foundReturn)throw new semantic_exception(this.SymbolTable[this.current_function].name+' is missing return statement.',block);
    },
    remove_decimal_part(a) {
        const decimal_part = 'decimal_part';
        this.operate(a,'1','%',decimal_part); //We get the decimal part
        this.operate(a,decimal_part,'-',a); //We remove the decimal part
    },
    build_unary_char_array(char) {
        this.push_cache(2);
        this.call('malloc');
        this.pop_cache(this.t2); //t2 = answer
        this.set_heap(this.t2,1);
        this.operate(this.t2,'1','+',this.t3);
        this.set_heap(this.t3,char); //We push the char to the String
        this.push_cache(this.t2); //we push the char array as a result.
    },
    trackReturnStmt(block) {
        /*
        * This is a recursive method which simply returns silently and turns a
        * flag : returnStmtFound -> true if a valid return stmt was found.
        * Otherwise it simply returns. (without doing anything) The caller of this method
        * must throw an exception if the method returns  & returnStmt wasn't found.
        * The caller must also initialize the returnTracker stack -> [0] //Since the parent
        * block is an unconditional block. (only that one, pure blocks and do blocks are unconditional)
        * The rest of the blocks have conditions. ifStmt can or not be an unconditional block,
        * switch-case can also (or not) be an unconditional block (if some requirements are met)
        * for,while are always conditional blocks.
        * For an ifStmt to classify as unconditional block:
        * when entering ifStmt push (1).
        * visit all children.
        * within each children, if a returnStmt is found add 1 to the top of the cache & return.
        * If no return stmt is found, track all sub-blocks and return.
        * when getting back after all sub-blocks of ifStmt have been tracked,
        * check an else block is within the sub-blocks. If not, return and do nothing.
        * If an else block is indeed within && tracker.peek = children.length + 1
        * it means the ifStmt has an unconditional return. If so, check if all previous entries in tracker
        * are 0s and if so, set found-> true & return.
        * if one or more of the above conditions aren't met, return without doing anything.
        * */
        if(block.name=='ifStmt'||block.name=='switch'){
            this.returnTracker.push(1); //Could or not be an unconditional return.
            let hasElse = false;
            block.children.forEach(child=>{
                if(child.name=='else'||child.name=='default')hasElse = true;
                this.trackReturnStmt(child);
            });
            let outcome = this.returnTracker.pop();
            if(outcome==(block.children.length+1)&&hasElse){
                //has else block and all of them have return stmts.
                if(this.is_unconditional_return()){ //to make sure it is unconditional
                    this.foundReturn = true;
                    return;
                }else{
                    let top = this.returnTracker.pop();
                    top++;
                    this.returnTracker.push(top);
                }
            }
        }else if (block.name=='if'||block.name=='case'||block.name=='else'||block.name=='default'){
            if(this.has_immediate_return(block)){
                let top = this.returnTracker.pop();
                top++;
                this.returnTracker.push(top);
            }
            block.children.forEach(child=>{
                if(this.has_relevant_sub_block(child))this.trackReturnStmt(child);
            });
        }
        //Else (do, normal block, pure block):
        if(this.has_immediate_return(block)&&this.is_unconditional_return()){
            this.foundReturn = true;
            return;
        }else{
            let top = this.returnTracker.pop();
            top++;
            this.returnTracker.push(top);
        }
        block.children.forEach(child=>{
            if(this.has_relevant_sub_block(child))this.trackReturnStmt(child);
        });
    },
    has_immediate_return:function (block) {
        //this function simply checks all the children of block and if a return stmt is found, returns true.
        //otherwise returns false.
        let found = false;
        block.children.forEach(child=>{
           if(child.name=='return')found=true;
        });
        return found;
    },
    has_relevant_sub_block:function (block) {
     //this method switches the name of the block & returns true if it is a valid block for return tracking.
     //This means while & for are skipped cause they are always conditional.
     switch (block.name) {
         case 'ifStmt':
         case 'switch':
         case 'do':
             return true;
         default:
             return false;
     }
    },
    is_unconditional_return:function () {
        let valid = true;
        this.returnTracker.forEach(r=>{
            if(r!=0)valid = false;
        });
        return valid;
    },
    perform_sub_block_jump(block,continueLabel=null) {
        let target_block = this.sub_block_tracker.pop();
        this.perform_jump(this.peek(this.scope),target_block,this.SymbolTable[this.peek(this.scope)].size);
        this.scope.push(target_block);
        this.stack.push(block.name);
        Printing.add_function(this.SymbolTable[target_block].true_func_signature);
        try{
            block.children.forEach(child=>{
                this.evaluate_node(child);
            });
        }catch (e) {
            if(!("semantic" in e))console.log(e);
        }
        if(continueLabel!=null)this.set_label(continueLabel);
        Printing.print_function();
        this.stack.pop();
        this.scope.pop();
    },
    inherit:function(){
      Printing.add_function('___inherit___');
      /*
      * This method takes 2 parameters: a child obj reference (at the top)
      * And a parent reference (below)
      * It will overwrite any inherited field from Obj by the value of the field in parent.
      * This is a void method.
      * */
        const child = 'child';
        const parent = 'parent';
        const child_id = 'child_id';
        this.pop_cache(child);
        this.pop_cache(parent);
        this.get_heap(child_id,child); //We get the child's id
        const _classes = sorting.mergeSort(Object.values(this.classes),compare_classes_by_level);
        _classes.forEach(_class=>{
            if(_class.ancestors.length>1){
                let lNext = this.generate_label();
                this.pureIf(child_id,_class.id,'!=',lNext);
                //Alright, let's start the transferring process:
                Object.values(_class.fields).forEach(field=>{
                   if(field.inherited&&field.category=='field'){ //We only perform the transferring if it is an inherited field.
                       //Alright, let's get the field from the parent:
                       this.push_cache(parent); //We push the parent
                       this.push_cache(field.id); //We push the field we'd like to get (we're sure both the og and this one have the same id)
                       this.call('get_field');
                       this.pop_cache(this.t1); //t1 = parent's value in the field.
                       this.operate(child,field.offset,'+',this.t); //We get the address of the field.
                       this.set_heap(this.t,this.t1); //We set the value.
                   }
                });
                this.set_label(lNext);
            }
        });
      Printing.print_function();
    },
    close_all_scopes:function(code){
        /*
        * code indicates if we're closing all scopes for a function return or if we're closing them
        * for a break jump or a continue jump.
        * This method will close all scopes from index -> scope.length -2
        * By closing scopes I mean returning P to its original position.
        * */
        let index;
        switch (code) {
            case 0: //return jump
            {
                index = this.get_scope_index_of_current_function();
                if(index==(this.scope.length-1))return; //If the index is at the top, there's no need to close anything.
                let i = index;
                while(i<this.scope.length-1){
                    this.operate('P',this.SymbolTable[this.scope[i]].size,'-','P');
                    i++;
                }
                return;
            }case 1: //break jump
            {
                index = this.get_scope_index_of_top_break();
                index = index -1; //We go to the parent scope of the block.
                let i = index;
                while(i<this.scope.length-1){
                    this.operate('P',this.SymbolTable[this.scope[i]].size,'-','P');
                    i++;
                }
            }return;
            case 2: //continue jump
            {
                index = this.get_scope_index_of_top_continue();
                if(index==(this.scope.length-1))return; //If the index is at the top, there's no need to close anything.
                let i = index;
                while(i<this.scope.length-1){
                    this.operate('P',this.SymbolTable[this.scope[i]].size,'-','P');
                    i++;
                }
            }return;
            default: throw new semantic_exception('FATAL ERROR. unrecognized close scope code.',this.scope[index]);
        }
    },
    get_scope_index_of_current_function:function () {
        let i = this.scope.length-1;
        while(i>=0){
            if(this.scope[i]==this.current_function)return i;
            i--;
        }
    },
    get_scope_index_of_top_continue:function () {
        /*
        * This method returns the index for the index of the first loop found staring at the top of the scope stack.
        * */
        let i = this.scope.length-1;
        while(i>=0){
            let row = this.SymbolTable[this.scope[i]]; //We get the row first.
            if(row.name.includes('while')||
                row.name.includes('for')||
                row.name.includes('do'))return i;
            i--;
        }
    },
    get_scope_index_of_top_break:function () {
        /*
        * This method returns the index for the index of the first loop found staring at the top of the scope stack.
        * */
        let i = this.scope.length-1;
        while(i>=0){
            let row = this.SymbolTable[this.scope[i]]; //We get the row first.
            if(row.name.includes('while')||
                row.name.includes('for')||
                row.name.includes('do')||
                row.name.includes('case'))return i;
            i--;
        }
    },
    send_this_reference_to_top() {
        /*
        * This method must be called after valuating all params and before a constructor/method call.
        * Is a full 3D method which takes the number of valuated params as a parameter and reverses the stack.
        * TLDR: stack must look like:
        * paramL.length
        * param1
        * param2
        * param3
        * ...
        * paramN
        * this
        * */
        Printing.add_function('send_this_reference_to_top');
        const paramCount = 'paramCount';
        this.pop_cache(paramCount); //We get the number of params
        this.assign(this.t1,0);//We need to know how many params we've valuated.
        let WhileStart = this.generate_label();
        let WhileEnd = this.generate_label();
        const AUX_POINTER = 'aux_pointer';
        this.operate('H','5','+',AUX_POINTER); //Aux pointer points to a free part in the heap.
        this.set_label(WhileStart);
        this.pureIf(this.t1,paramCount,'>=',WhileEnd);
        this.pop_cache(this.t2); //param value;
        this.operate(AUX_POINTER,'1','+',AUX_POINTER);
        this.set_heap(AUX_POINTER,this.t2); //We push to the aux stack.
        this.operate(this.t1,'1','+',this.t1);
        this.goto(WhileStart);
        this.set_label(WhileEnd);
        //Alright all params have been removed and are now in the heap.
        this.pop_cache(this.t3); //t3 = this reference.
        //Alright, now let's put all params back in the cache:
        let wS = this.generate_label();
        let wE = this.generate_label();
        this.assign(this.t1,0);
        this.set_label(wS);
        this.pureIf(this.t1,paramCount,'>=',wE);
        this.get_heap(this.t2,AUX_POINTER); //t2 = We get the first value
        this.operate(AUX_POINTER,'1','-',AUX_POINTER);//We decrease H
        this.push_cache(this.t2); //We push it back to the cache.
        this.operate(this.t1,'1','+',this.t1);
        this.goto(wS);
        this.set_label(wE);
        this.push_cache(this.t3); //We finally push the this reference at the top.
        Printing.print_function();
    },
    initialize_aux_segment:function(){
        this.pop_cache('AUX'); //Aux holds the actual size of the current scope.
      this.operate('P','AUX','+','AUX');
      this.operate('AUX','5','+','AUX'); //Just to be on the safe side.
    },
    push_aux :function(value){
        this.operate('AUX','1','+','AUX');
        this.set_stack('AUX',value);
    },
    pop_aux:function(vessel){
        this.get_stack(vessel, 'AUX');
        this.operate('AUX','1','-','AUX');
    },
    copy_array:function(){
        Printing.add_function('copy_array');
        /*
               * This method takes an ArrayAddress as parameter, pushes it back immediately and then proceeds to copy it.
               * If the address this method receives is 0 it returns 0.
               * After allocating space for a new Array with same size as OG, it will then read each cell in OG
               * and if the cell != 0 it'll copy the cell & put the result in copy[cell].
               * This implies copy_array is a powerful recursive method which could iterate trough infinity if
               * a proper ending array is missing (the ending array should be one with all its cells initialized to 0)
               * */
        const r = 'r';
        const r1 = 'r1';
        const r2 = 'r2';
        const new_cell_offset = 'new_cell_offset';
        const i1 = 'i1';
        const i2 = 'i2';
        //1) Get the OG's address and push it back:
        this.get_stack(r,'C');
        const l1 = this.generate_label();
        const lEnd = this.generate_label();
        this.pureIf(r,'0','!=',l1);
        this.push_cache(0); //We're attempting to copy a null array. There's nothing to do.
        this.goto(lEnd);
        this.set_label(l1);
        this.get_heap(r,r); // R = Heap[R] = size
        this.push_cache(r); //We push the size to allocate the new array.
        this.call('basic_array_allocation');
        this.get_stack(r,'C'); //R holds the new Array Address.
        this.get_heap(r,r); //r = size from new Array
        const whileStart = this.generate_label();
        const whileEnd = this.generate_label();
        this.set_label(whileStart);
        this.pureIf(r,'0','<=',whileEnd);
        this.assign(new_cell_offset,r);
        this.operate(r,'1','-',r);
        this.push_cache(r);
        this.pop_cache(r);
        this.pop_cache(r1);
        this.pop_cache(r2);
        this.push_cache(r);
        this.push_cache(r1);
        this.push_cache(r2);
        this.get_stack(r,'C');
        this.operate(new_cell_offset,r,'+',i1);
        this.get_heap(i1,i1); //I1 = OG's cell value
        const lF = this.generate_label();
        this.pureIf(i1,'0','!=',lF);
        //The OG array is filled with 0s there fore there's nothing else to copy.
        //However, before we return we must put the cache in proper order:
        this.pop_cache(r); //R = OG
        this.pop_cache(r1); //R1 = new array
        this.pop_cache(r2); //R2 = Size -1. (discard)
        this.push_cache(r);
        this.push_cache(r1);
        //Alright you can leave now
        this.goto(whileEnd);
        this.set_label(lF);
        this.push_cache(new_cell_offset); //new_cell_offset
        this.push_cache(i1);  //cell's value
        this.call('copy_array');
        this.pop_cache(r); //copy
        this.pop_cache(r1); // cell's value'
        this.pop_cache(new_cell_offset); // (cell's offset)
        this.pop_cache(r2); //OG array
        this.pop_cache(i1); //new Array
        this.pop_cache(r1); //Size -1
        this.operate(i1,new_cell_offset,'+',i2);  //i2 = new array cell address.
        this.set_heap(i2,r); //We set the copy in the newArray's cell address.
        this.push_cache(r2); //OG
        this.push_cache(i1); //NewArray
        this.push_cache(r1); //Size - 1
        this.pop_cache(r);  //r = size -1.
        this.goto(whileStart);
        this.set_label(whileEnd);
        this.set_label(lEnd);
        //That's all!!
        Printing.print_function();
    },
    compile_array:function(){
        Printing.add_function('compile_array');
        /*
         * This method takes a lot of input. For this method to work the Cache must look like:
         *current_scope_size
         * Dimension
         * Size_N
         * ...
         * ...
         * ...
         *  Size_1
         *  Size_0
         *
         * Where  Size_0 makes reference to the size for the most
         * outer array (the array with the highest dimension) And Size_N makes reference to the size for
         * the most inner array (the array with only 1 dimension)
         *
         * It takes all of this arguments and returns a single ArrayAddress.
         *
         * The Aux array refers to a segment in the Stack above the current scope.
         * Since we perform no jumps, the Stack remains constant trough this whole process.
         * */
        const ag = 'ag';
        const r1 = 'r1';
        const r2 = 'r2';
        const r = 'r';
        const AUX = 'AUX';
        //1) //Initialize aux segment:
        this.initialize_aux_segment();
        //2) pop the dimension:
        this.pop_cache(r); //r = dim
        //3) push initial array to copy:
        this.push_aux(0);
        const whileStart = this.generate_label();
        const whileEnd = this.generate_label();
        this.set_label(whileStart);
        this.pureIf(r,'0','<=',whileEnd);
        this.operate(r,'1','-',r); //r--;
        this.pop_aux(ag);
        this.push_aux(r);
        this.push_aux(ag);
        //Swap & push Dim to aux. At this point the prev array must be at the top of aux. And Index_N at the top of Cache.
        this.call('basic_array_allocation');
        this.pop_cache(r); //r = newArrayAddress
        this.get_heap(ag,r); //AG = newArraySize
        this.push_cache(r);
        this.assign(r,ag); //R = new_array_size
        const nestedWhileStart = this.generate_label();
        const nestedWhileEnd = this.generate_label();
        this.set_label(nestedWhileStart);
        this.pureIf(r,'0','<=',nestedWhileEnd);
        this.operate(r,'1','-',r); //We decrease the size of the array.
        this.pop_aux(r1);
        this.push_aux(r);
        this.push_aux(r1);
        this.pop_aux(r); //R = Address of the previous array.
        this.push_cache(r); //We push it to the cache
        this.call('copy_array'); ////We copy the previous array. Also the copy doesn't remove the Address from the cache.
        this.pop_cache(r);  //R = Copy address.
        this.get_stack(r1,'AUX');
        this.operate(r1,'1','+',r1); //We increase it by 1.
        this.pop_cache(r2); //R2 = prevArrayAddress
        this.push_aux(r2); //We push it to the aux stack
        this.get_stack(r2,'C');//R2 = newArrayAddress
        this.operate(r2,r1,'+',r2); //R2 = cell address within array.
        this.set_heap(r2,r); //We put the copy in the array.
        //11) We swap the top positions in aux.
        this.pop_aux(r);
        this.pop_aux(r1);
        this.push_aux(r);
        this.push_aux(r1);
        //12) We get the size of the array back:
        this.pop_aux(r);
        this.goto(nestedWhileStart);
        this.set_label(nestedWhileEnd);
        //15) Alright, at this point the array has been fully initialized. So next step is going to the next dimension:
        this.pop_aux(r); //discard
        this.pop_cache(r); //R holds the initialized array.
        this.push_aux(r); //We push R to the aux segment as we'll use it as prev array in next iteration
        //16) We get dim counter from aux:
        this.pop_aux(r1);
        this.pop_aux(r);
        this.push_aux(r1);
        //17) Go to next iteration:
        this.goto(whileStart);
        this.set_label(whileEnd);
        //19) Alright, at this point the resultant array is in the Aux segment. We just gotta take it from there and push it to the cache.
        this.pop_aux(r);
        this.push_cache(r);
        //Alright, that's all!!
        Printing.print_function();
    },
    basic_array_allocation:function () {
        /*
         * This method takes the size of the array as parameter from the cache & pushes back
         * the address of a new array based in the provided size.
         * */
        //atm the size of the array is at the top.
        Printing.add_function('basic_array_allocation');
        const R = 'R';
        const address = 'address'
        this.get_stack(R,'C'); //R holds the size of the array.
        this.operate(R,'1','+',R); //However the true size R +1 (To make space for the size)
        this.push_cache(R);
        this.call('malloc');
        this.pop_cache(address);//We allocate space in memory for the array.
        //Alright now we got the address we'll use for this array.
        //The next thing we must do is setting the array's size.
        this.pop_cache(R); //We get the OG size of the array (before the increment)
        this.set_heap(address,R); //We set the size of the array.
        this.push_cache(address); //We push the new Array Address to the cache.
        //that's all!
        Printing.print_function();
    },
    get_array_cell_ref:function(){
        /*
         * Same as get_array_value except it returns the address of the cell instead of the
         * value held within. It will also push 0/1 before the actual ref so you know where to use the ref.
         * For this method to work the Cache must be prepared the exact same way as if I were to call
         * get_array_value.
         *
         * This method returns the answer like:
         *
         * ref
         * 0/1 (where to use the ref)
         *
         * Where the above are the top positions of the cache.
         * */
        Printing.add_function('get_array_cell_ref');
        const r = 'r';
        const r1 = 'r1';
        const r2 = 'r2';
        this.initialize_aux_segment();
        //1) Pop dim:
        this.pop_cache(r);//R = dim
        this.operate(r,'1','-',r); //Decrease dim
        //If dim == 0 we proceed directly:
        const lProceed = this.generate_label();
        this.pureIf(r,'0','==',lProceed);
        this.push_cache(r);
        this.operate('AUX','5','-','AUX'); //We return Aux to OG value.
        this.operate('AUX','P','-','AUX'); //We return Aux to OG value.
        this.push_cache('AUX'); //We indicate where the aux segment starts.
        this.call('get_array_value');
        this.set_label(lProceed);
        /*
         * This will recurse all the way deep into baseArray and stop one dimension before getting the value.
         * The cache after calling this function should look like:
         *
         * ArrayAddress
         * index_N
         *
         * So we'll simply need to return ArrayAddress + true_position.
         * */
        //2) Swap Address & index:
        this.pop_cache(r); //R = array index.
        this.pop_cache(r1); //R1 = last index.
        this.push_cache(r);//we push the array index back.
        this.operate(r1,'1','+',r); //R is now the true index.
        this.pop_cache(r1); //R1 holds the ArrayAddress
        const lFine = this.generate_label();
        this.pureIf(r1,'0','!=',lFine);
        this.exit(0);
        this.set_label(lFine);
        this.get_heap(r2,r1); //R2 = size of the array.
        const lWrong = this.generate_label();
        const lFine2 = this.generate_label();
        this.pureIf(r,'0','<=',lWrong);
        this.pureIf(r,r2,'>',lWrong);
        this.goto(lFine2);
        this.set_label(lWrong);
        this.push_cache(r);
        this.push_cache(r2);
        this.exit(1); //Array index out of bounds
        this.set_label(lFine2);
        this.operate(r1,r,'+',r); //R holds the cell's address.
        this.push_cache(1); //We push one to indicate we'll use the reference in the heap.
        this.push_cache(r); //We push the actual ref.
        //That's all!!
        Printing.print_function();
    },
    get_array_value:function () {
        /*
       * This 4D method pushes the vaue held within an array in the desired position to
       * the top of the cache.
       * For this method to work, it expects the Cache to be loaded as follows:
       *
       * Dim
       * BaseArrayAddress
       * index_0
       * ...
       * ...
       * ...
       * index_N-1
       * index_N
       *
       * Where Dim is a pure number indicating how deep to go within the array (the number of dimensions to travel)
       * BaseArrayAddress is the well, the base array address. Based on this data the correspondent value
       * will be easily fetched!
       * */
        Printing.add_function('get_array_value');
        //1) Initialize aux:
        this.initialize_aux_segment();
        const AUX = 'AUX';
        const r = 'r';
        const r1 = 'r1';
        const r2 = 'r2';
        this.pop_cache(r); //r = dim
        const whileStart = this.generate_label();
        const whileEnd = this.generate_label();
        this.set_label(whileStart);
        this.pureIf(r,'0','<=',whileEnd);
        this.operate(r,'1','-',r);
        this.push_aux(r);
        this.pop_cache(r); //R = baseArrayAddress
        this.get_heap(r2,r);  //r2 = size of the array.
        this.pop_cache(r1); //upper index.
        this.operate(r1,'1','+',r1); //We get the true index.
        const lfine = this.generate_label();
        this.pureIf(r,'0','!=',lfine);
        this.exit(0);
        this.set_label(lfine);
        const lWrong = this.generate_label();
        const lFine2 = this.generate_label();
        this.pureIf(r1,'0','<=',lWrong);
        this.pureIf(r1,r2,'>',lWrong);
        this.goto(lFine2);
        this.set_label(lWrong);
        this.push_cache(r1);
        this.push_cache(r2);
        this.exit(1); //Array index out of bounds.
        this.set_label(lFine2);
        this.operate(r,r1,'+',r); //The cell's address we're looking for;
        this.get_heap(r2,r);//R2 = The value stored in this cell.
        this.push_cache(r2);
        this.pop_aux(r); //R = dim -1
        this.goto(whileStart);
        this.set_label(whileEnd);
        Printing.print_function();
    },
    native_arithmetics:function(){
        /*
        * This method takes 2 numeric values from the cache: base, exponent and pows them.
        *exponent
        * base
        * cache
        * */
        let exponent = 'exponent';
        let base = 'base';
        const root = 'root';
        Printing.add_function('pow');
        this.pop_cache(exponent);
        this.pop_cache(base);
        const lPositive = this.generate_label();
        const lEnd = this.generate_label();
        const lNext = this.generate_label();
        const lNext2 = this.generate_label();
        this.pureIf(exponent,'0','!=',lNext);
        this.push_cache(1); //Any number ^ 0 is 1.
        this.goto(lEnd);
        this.set_label(lNext);
        this.pureIf(exponent,'1','!=',lNext2); //Any number ^ 1 is the same number.
        this.push_cache(base);
        this.goto(lEnd);
        this.set_label(lNext2);
        this.pureIf(exponent,'0','>',lPositive);
        this.operate(exponent,'-1','*',exponent); //we turn the exponent positive.
        this.operate('1',base,'/',base); //We perform base ^ (-1)
        this.set_label(lPositive);
        this.operate(exponent,'1','%',root);
        this.operate(root,ACCURACY,'*',root); //we get the integer part of the root.
        this.remove_decimal_part(root);  //Remove any extra decimals
        this.remove_decimal_part(exponent); //we clear the decimal part from the exponent
        this.push_cache(base);
        this.push_cache(exponent);
        this.push_cache(base);
        this.push_cache(root);
        this.call('___root___');
        this.pop_cache(root); //we retrieve the evaluated root.
        this.pop_cache(exponent); //we retrieve the exponent.
        this.pop_cache(base); //we get the base back.
        this.push_cache(root); //we push the evaluated root.
        this.push_cache(base); //we push the base back.
        this.push_cache(exponent); //we push the exponent at the top.
        this.call('___pow___');
        this.pop_cache(base); //we pop the evaluated base
        this.pop_cache(root); //we get back the evaluated root.
        this.operate(base,root,'*',base); //we multiply them together.
        this.push_cache(base);
        this.set_label(lEnd);
        Printing.print_function();

        //This function performs a pure pow (only takes 2 natural numbers as valid parameters):
        Printing.add_function('___pow___');
        this.pop_cache(exponent);
        this.pop_cache(base);
        const notZero = this.generate_label();
        const notOne = this.generate_label();
        const lPow_End = this.generate_label();
        const og = 'og';
        this.pureIf(exponent,'0','!=',notZero);
        this.push_cache(1);
        this.goto(lPow_End);
        this.set_label(notZero);
        this.pureIf(exponent,'1','!=',notOne);
        this.push_cache(base);
        this.goto(lPow_End);
        this.set_label(notOne);
        this.assign(og,base);
        const lPowWhileStart = this.generate_label();
        const lPowWhileEnd = this.generate_label();
        this.set_label(lPowWhileStart);
        this.pureIf(exponent,'1','<=',lPowWhileEnd);
        this.operate(base,og,'*',base);
        this.operate(exponent,'1','-',exponent); //we decrease the exponent
        this.goto(lPowWhileStart);
        this.set_label(lPowWhileEnd);
        this.push_cache(base); //we push the answer.
        this.set_label(lPow_End);
        Printing.print_function();

        //This function calculates the Nth root of a number (only takes natural numbers as parameters)
        const prev = 'prev';
        const accuracy ='accuracy';
        const distance = 'distance';
        const res = 'res';
        Printing.add_function('___root___');
        this.pop_cache(root);
        this.pop_cache(base);
        const notZero1 = this.generate_label();
        const notOne1 = this.generate_label();
        const lroot_End = this.generate_label();
        this.pureIf(root,'0','!=',notZero1);
        this.push_cache(1);
        this.goto(lroot_End);
        this.set_label(notZero1);
        this.pureIf(root,'1','!=',notOne1);
        this.push_cache(base);
        this.goto(lroot_End);
        this.set_label(notOne1);
        this.assign(prev,(Math.floor(Math.random()*100)%10));
        this.assign(accuracy,1/(ACCURACY*10));
        this.assign(distance,'2000000');
        this.assign(res,0);
        const lRootWhileStart = this.generate_label();
        const lRootWhileEnd = this.generate_label();
        this.set_label(lRootWhileStart);
        this.pureIf(distance,accuracy,'<=',lRootWhileEnd);
        this.push_cache(base); //we save the value for later.
        this.operate(root,1,'-',this.t1); //t1 = root -1
        this.operate(prev,this.t1,'*',this.t2); //t2 = (root - 1) * prev
        this.push_cache(this.t2);
        this.push_cache(prev);
        this.push_cache(this.t1);
        this.call('___pow___');
        this.pop_cache(this.t3); //t3 = pow (prev,root-1)
        this.pop_cache(this.t2); //t2 = (root - 1) * prev
        this.pop_cache(base); //we get the base back.
        this.operate(base,this.t3,'/',res);
        this.operate(this.t2,res,'+',res);
        this.operate(res,root,'/',res);
        this.operate(res,prev,'-',distance);
        this.get_abs(distance);
        this.assign(prev,res);
        this.goto(lRootWhileStart);
        this.set_label(lRootWhileEnd);
        this.push_cache(res);
        this.set_label(lroot_End);
        Printing.print_function();
    },
    get_abs:function(num){
        const lEnd = this.generate_label();
        this.pureIf(num,'0','>=',lEnd);
        this.operate(num,'-1','*',num); //we turn the num positive.
        this.set_label(lEnd);
    },
    to_String:function () {
        //This functions prints a 3D function that returns an String saying null
        // Or Object. Class: num Address: num
        const ObjInstance = 'ObjInstance';
        Printing.add_function('___toString___');
        this.pop_cache(ObjInstance); //t = object instance.
        const lEnd = this.generate_label();
        const notNullL = this.generate_label();
        this.pureIf(this.t,'0','!=',notNullL);
        this.compile_string('null');
        this.goto(lEnd);
        this.set_label(notNullL);
        //Alright is an Instance of an Object. let's start building the String representation:
        this.compile_string('Object. Class:');
        this.get_heap(this.t1,ObjInstance); //we get the ID of the Object.
        this.push_cache(this.t1); //we push the numeric value.
        this.call('int_to_string'); //We get its charArray representation.
        this.call('___sum_strings___'); //We concatenate them.
        this.compile_string(' Address: ');
        this.call('___sum_strings___'); //we concatenate.
        this.push_cache(ObjInstance);
        this.call('int_to_string'); //we push the String representation of the address.
        this.call('___sum_strings___'); //We concatenate.
        this.set_label(lEnd);
        Printing.print_function();
    },
    signature_is_number(signature){
        return signature==CHAR||signature==INTEGER||signature==DOUBLE;
    },
    signature_is_integer(sigature){
        return sigature==CHAR||sigature==INTEGER;
    },
    signature_is_class(signature){
      return signature in this.classes;
    },
    signature_is_array(signature){
      return signature.startsWith('array');
    },
    signature_is_String(signature){
      return signature=='String';
    },
    write_file() {
        Printing.print_in_context('write_file(0)');
    },
    is_within_println() {
        let indeed = false;
        this.stack.forEach(s=>{
           if(s=='println')indeed = true;
        });
        return indeed;
    },
    ___indexOf___:function () {
        const arrayAddress = 'arrayAddress';
        const i = 'i';
        const value = 'value';
        const size = 'size';
        const current = 'current';
        const lFound = this.generate_label();
        const lEnd = this.generate_label();
        Printing.add_function('___indexOf___');
        this.pop_cache(value);
        this.pop_cache(arrayAddress);
        this.get_heap(size,arrayAddress); //we get the size of the array.
        this.assign(i,1); //we set the first index to start the search.
        const whileStart = this.generate_label();
        const whileEnd  = this.generate_label();
        this.set_label(whileStart);
        this.pureIf(i,size,'>',whileEnd);
        this.operate(arrayAddress,i,'+',current); //we get the address of the current value.
        this.get_heap(current,current); //we get the actual value.
        this.pureIf(current,value,'==',lFound);
        this.operate(i,1,'+',i); //i++
        this.goto(whileStart);
        this.set_label(whileEnd);
        this.push_cache(-1);
        this.goto(lEnd);
        this.set_label(lFound);
        this.operate(i,1,'-',i); //i-- so we can get the index relative to 0-length-1
        this.push_cache(i);
        this.set_label(lEnd);
        Printing.print_function();
    },linear_copy:function () {
        const arrayAddress = 'arrayAddress';
        const size = 'size';
        const i = 'i';
        const whileStart = this.generate_label();
        const whileEnd = this.generate_label();
        const current = 'current';
        const newArray = 'newArray';
        Printing.add_function('___linear_copy___');
        //this method creates and returns a linear copy of the array sent as parameter
        this.pop_cache(arrayAddress);
        this.get_heap(size,arrayAddress);
        this.operate(size,1,'+',newArray);
        this.push_cache(newArray);
        this.call('malloc');
        this.pop_cache(newArray);
        this.set_heap(newArray,size); //we set the size of the array.
        this.assign(i,1);
        this.set_label(whileStart);
        this.pureIf(i,size,'>',whileEnd);
        this.operate(arrayAddress,i,'+',current); //we get the address of the current value.
        this.get_heap(current,current); //we get the actual value.
        this.operate(newArray,i,'+',this.t); //t = address of the corresponding cell in the new empty array.
        this.set_heap(this.t,current); //we set the new value.
        this.operate(i,1,'+',i); //i++
        this.goto(whileStart);
        this.set_label(whileEnd);
        this.push_cache(newArray);
        Printing.print_function();
    },
    ___slice___:function () {
    /*
    * This method takes 3 arguments:
    * upper limit
    * lower limit
    * ArrayAddress
    * And returns a new array with the contents from ArrayAddress from [lowerLimit - upperLimit)
    * */
        const arrayAddress = 'arrayAddress';
        const size = 'size';
        const i = 'i';
        const whileStart = this.generate_label();
        const whileEnd = this.generate_label();
        const lEnd = this.generate_label();
        const lFine = this.generate_label();
        const lNext = this.generate_label();
        const lWrong = this.generate_label();
        const current = 'current';
        const newArray = 'newArray';
        const newSize = 'newSize';
        const lowerLimit = 'lowerLimit';
        const upperLimit = 'upperLimit';
        const j = 'j';
        Printing.add_function('___slice___');
        //this method creates and returns a linear copy of the array sent as parameter
        this.pop_cache(upperLimit);
        this.pop_cache(lowerLimit);
        this.pop_cache(arrayAddress);
        this.get_heap(size,arrayAddress);
        this.pureIf(upperLimit,size,'>',lWrong);
        this.pureIf(lowerLimit,'0','<',lWrong);
        this.pureIf(lowerLimit,upperLimit,'>',lWrong); //lower limit can't be higher than upper limit.
        this.goto(lFine);
        this.set_label(lWrong);
        this.push_cache(lowerLimit);
        this.push_cache(upperLimit);
        this.exit(4); //invalid parameter for slice method.
        this.set_label(lFine);
        this.operate(upperLimit,lowerLimit,'-',newSize); //the size of the resultant array is upper - lower limit
        this.operate(newSize,1,'+',newArray); //+1 for the space where we'll save the new size.
        this.push_cache(newArray);
        this.call('malloc');
        this.pop_cache(newArray);
        this.set_heap(newArray,newSize); //we set the size of the address.
        this.operate(lowerLimit,1,'+',i); //we start copying from lower limit + 1 (true index)
        this.assign(j,1);
        this.set_label(whileStart);
        this.pureIf(i,upperLimit,'>',whileEnd);
        this.operate(arrayAddress,i,'+',current); //we get the address of the current value.
        this.get_heap(current,current); //we get the actual value.
        this.operate(newArray,j,'+',this.t); //t = address of the corresponding cell in the new empty array.
        this.set_heap(this.t,current); //we set the new value.
        this.operate(j,1,'+',j);
        this.operate(i,1,'+',i);
        this.goto(whileStart);
        this.set_label(whileEnd);
        this.push_cache(newArray);
        Printing.print_function();
    },
    string_to_double:function () {
        const charArray = 'DoubleCharArray';
        const doubleSign = 'DoubleSign';
        const integerCharArray = 'integerCharArray';
        const decimalCharArray = 'decimalCharArray';
        const charArraySize = 'charArraySize';
        const indexOfDot = 'indexOfDot';
        const integerValue = 'integerValue';
        const doubleValue = 'doubleValue';
        const decimalLength = 'decimalLength';
        const lNext = this.generate_label();
        /* High level implementation:
        * char ls[] = s.toCharArray();
    boolean negative = ls[0]=='-';
    if(ls.indexOf('.')==-1)return toInt(s);
    char integer[] = ls.slice(0,ls.indexOf('.'));
    char decimal[];
    if(ls.indexOf('.')!=-1)
      decimal = ls.slice(ls.indexOf('.')+1,ls.length);
      else decimal = new char[0];
    int i = abs(toInt(integer.toString()));
    int d = toInt(decimal.toString());
    int sign = (negative)?-1:1;
    return sign*(i + (double)d/pow(10,decimal.length));
        * */
        //3D implementation:
        Printing.add_function('string_to_double');
        const lEnd = this.generate_label();
        const alreadyInteger = this.generate_label();
        this.pop_cache(charArray);
        this.get_heap(charArraySize,charArray);
        this.operate(charArray,'1','+',this.t); //t = address of first char.
        this.get_heap(this.t,this.t); //t is the first char.
        this.assign(doubleSign,1); //by default is positive.
        this.pureIf(this.t,'-'.charCodeAt(0),'!=',lNext);
        this.assign(doubleSign,-1);
        this.set_label(lNext);
        this.push_cache(charArray);
        this.push_cache('.'.charCodeAt(0)); //we indicate we wan't .
        this.call('___indexOf___');
        this.pop_cache(indexOfDot); //t = index of .
        this.pureIf(indexOfDot,-1,'==',alreadyInteger);
        this.push_cache(charArray); //alright time to slice it:
        this.push_cache(0);
        this.push_cache(indexOfDot); //indexOf .
        this.call('___slice___');
        this.pop_cache(integerCharArray); //we get the integer char array.
        this.push_cache(charArray);
        this.operate(indexOfDot,1,'+',indexOfDot);
        this.push_cache(indexOfDot); //indexOfDot + 1
        this.push_cache(charArraySize); //we push the max size for the String.
        this.call('___slice___');
        this.pop_cache(decimalCharArray);
        //Alright we got both char arrays now, next step is parsing them to int:
        this.push_cache(integerCharArray);
        this.call('string_to_int');
        this.pop_cache(integerValue); //we get the integer value.
        this.get_abs(integerValue); //we get the absolute value.
        this.push_cache(decimalCharArray);
        this.call('string_to_int');
        this.pop_cache(doubleValue);
        //Alright, now lets calculate pow(10,decimal.length)
        this.push_cache(10);
        this.get_heap(decimalLength,decimalCharArray);
        this.push_cache(decimalLength);
        this.call('___pow___');
        this.pop_cache(decimalLength); //decimal length's value is no longer of importance so we'll use it as a temp.
        this.operate(doubleValue,decimalLength,'/',doubleValue); //we operate.
        this.operate(integerValue,doubleValue,'+',doubleValue);
        this.operate(doubleValue,doubleSign,'*',doubleValue);
        this.push_cache(doubleValue); //we push the answer!
        this.goto(lEnd);
        this.set_label(alreadyInteger);
        this.push_cache(charArray);
        this.call("string_to_int");
        this.set_label(lEnd);
        Printing.print_function();
    }
};
