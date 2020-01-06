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
            Printing.add_function(target_row.name); //Alright, time to compile the abstract method.
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
        this.scope.push(0);
        this.stack.push('expression');
        _classes.forEach(c=>{
            Printing.add_function(this.native_constructor_prefix+c.name);
            this.assign(_class_size,Compiler.count_fields(c.name)+1); //1 extra space for the ID.
            this.push_cache(_class_size);
            this.call('malloc');
            this.pop_cache(instance_address);
            this.set_heap(instance_address,c.id);//We set the ID of the new class.
            Object.values(c.fields).forEach(f=>{
                //Alright, first things first. push default value, either 0 or customized.
                if(f.instructions!=null){
                    try{
                        this.value_expression(f.instructions);   //We evaluate the default value.
                        let value_type = this.evaluation_stack.pop();
                        let recipient_type = this.types[f.type];
                        this.compatible_types(recipient_type,value_type,instructions);
                        if(f.final)f.initialized = true; //if it was a final field we need to indicate we've initalized it already.
                    }
                    //region Exception handling when default value is corrupted.
                    catch (e) {
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
                this.operate(instance_address,f.offset,'+',this.t); //t holds the address of the field.
                this.set_heap(this.t,this.t1); //We set the value.
            });
            this.push_cache(instance_address); //We push the answer to the cache.
           Printing.print_function(); //That's all!
        });
        this.scope.pop();
        this.stack.pop();
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
        this.operate(this.t1,'10',this.t1);//t1 = address of the class representation in the heap
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
        this.exit(2);
        this.set_label(lFine);
        this.push_cache(this.t2);
        Printing.print_function();
        //endregion
        this.malloc();
        this.string_to_int();
        this.int_to_string();
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
      this.scope.push(0); //Everything performed here has program scope.
      this.stack.push('expression');
      Printing.add_function(pure_entry_point);
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
              this.compatible_types(recipient_type,value_type);
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
      this.stack.pop();
      this.scope.pop();
    },
    generate_code() {
        const target = this.SymbolTable[this.entry_point];
        if (target == undefined) throw new _compiling_exception('The entry point has changed. Please, re-select a valid starting point.');
        if (!target.func || target.name.includes('-')) throw new _compiling_exception('The entry point has changed. Please, re-select a valid starting point.');
        this.compile_entry_point(target); //We compile the pure entry point.
        this.evaluate_node(this.root); //We output 3D code for the rest of the user defined functions.
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
                if (this.varChainIndex == 0) { //First ID in the chain.
                    this.resolve_global_id(node,resolve_as_signature,resolve_as_ref);
                    this.varChainIndex++;
                } else this.resolve_member_id(node,resolve_as_signature,static_access,resolve_as_ref); //Makes reference to a field
            }
            switch (node.name){
                case "varChain":
                    this.varChainIndex = 0;
                    node.children.forEach(child=>{
                       this.resolve_varChain(child,resolve_as_signature,static_access,resolve_as_ref);
                    });
                    return;
                case 'normalAccess': //Just value the id in the children token.
                    node.children.forEach(child=>{
                        this.resolve_varChain(child,resolve_as_signature,static_access,resolve_as_ref);
                    });
                    return;
                case "arrayAccess":
                    throw semantic_exception('Array Access not implemented yet.',node);
                    return;
                case 'functionCall':
                    if(resolve_as_ref)throw new semantic_exception('Cannot extract reference from a function call.',node);
                    if(this.varChainIndex==0){
                        this.resolve_global_functionCall(node,resolve_as_signature);
                        this.varChainIndex++;
                    }else {
                        let owner = this.evaluation_stack.pop(); //The value returned by the previous member.
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
                        if(this.is_native_method(owner.signature,signature,resolve_as_signature))return;
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
                    this.varChainIndex++;
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
                case INTEGER:
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
                let target = this.children[0].text;
                let paramL = this.children[1];
                target = this.classes[target];
                if(target==undefined)throw new semantic_exception(target+' is NOT a class.',node);
                if(value_as_signature){
                    this.evaluation_stack.push(target.name);
                    return;
                }
                this.compile_signature(paramL);
                let signature = this.evaluation_stack.pop();
                signature = '*.'+target.name+signature;
                let target_func = this.get_func_index(signature);
                if(target_func==-1){
                    if(signature.includes('-'))throw new semantic_exception('NO suitable constructor found for: '+signature,node);
                    //Since it takes no parameters, we can use default constructor:
                    this.call(this.native_constructor_prefix+target.name);
                    this.evaluation_stack.push(this.types[target.name]); //We push the type and return.
                }else{
                    this.perform_static_function_call(target_func,paramL);
                }
            }
                return;
            case 'downcast':
            {
                let target = node.children[0].text; //We get the target type we're attempting to downcast
                this.value_expression(node.children[1],value_as_signature); //We value the expression associated to the downcast.
                let og = this.evaluation_stack.pop(); //We get the og type.
                switch (target) {
                    case DOUBLE:
                        if(value_as_signature){
                            this.evaluation_stack.push(DOUBLE);
                            return;
                        }
                        if(!og.is_primitive())throw new semantic_exception('Cannot downcast '+og.signature+' to '+target,node);
                        this.cast_to_double(og);
                        this.evaluation_stack.push(this.types[DOUBLE]);
                        return;
                    case INTEGER:
                        if(value_as_signature){
                            this.evaluation_stack.push(INTEGER);
                            return;
                        }
                        if(!og.is_primitive())throw new semantic_exception('Cannot downcast '+og.signature+' to '+target,node);
                        this.cast_to_integer(og);
                        this.evaluation_stack.push(this.types[INTEGER]);
                        return;
                    case CHAR:
                        if(value_as_signature){
                            this.evaluation_stack.push(CHAR);
                            return;
                        }
                        if(!og.is_primitive())throw new semantic_exception('Cannot downcast '+og.signature+' to '+target,node);
                        this.cast_to_char(og);
                        this.evaluation_stack.push(this.types[CHAR]);
                        return;
                    case BOOLEAN:
                        if(value_as_signature){
                            this.evaluation_stack.push(BOOLEAN);
                            return;
                        }
                        if(!og.is_primitive())throw new semantic_exception('Cannot downcast '+og.signature+' to '+target,node);
                        this.cast_to_boolean(og);
                        this.evaluation_stack.push(this.types[BOOLEAN]);
                        return;
                    case 'String':
                        if(value_as_signature){
                            this.evaluation_stack.push('String');
                            return;
                        }
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
                            if(value_as_signature){
                                this.evaluation_stack.push(target.name);
                                return;
                            }
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
            case 'inlineArrayDef':
                throw new semantic_exception('inlineArrayDef not implemented yet',node);
            case 'arrayInitialization':
                throw new semantic_exception('arrayInitialization not implemented yet',node);
            default:
            {
                node.children.forEach(child=>{
                    this.value_expression(child); //We value the arguments of the operation.
                });
                let left_arg;
                let right_arg;
                let left_value = 'left_value';
                let right_value = 'right_value';
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
                switch (node.name){
                    case "+": //Sum is special because of all possible overloads.
                        if(left_arg.is_string()||right_arg.is_string()){//There's at least one string. We must concatenate
                            if(value_as_signature){
                                this.evaluation_stack.push('String');
                                return;
                            }
                            this.push_cache(left_value);
                            this.cast_to_string(left_arg,node);
                            this.push_cache(right_value);
                            this.cast_to_string(right_arg,node);
                            this.call('sum_strings');
                            this.evaluation_stack.push(this.types['String']);
                        }else if(left_arg.is_number()&&right_arg.is_number()){ //Both are numbers, it is an arithmetic sum
                            if(value_as_signature){
                                if(left_arg.is_integer()&&right_arg.is_integer())this.evaluation_stack.push(INTEGER);
                                else this.evaluation_stack.push(DOUBLE);
                                return;
                            }
                            this.operate(left_value,right_value,'+',left_value);
                            this.push_cache(left_value);
                            if(left_arg.is_integer()&&right_arg.is_integer())this.evaluation_stack.push(this.types[INTEGER]);
                            else this.evaluation_stack.push(this.types[DOUBLE]);
                            return;
                        }else throw new semantic_exception("Cannot resolve operator: +  with types: "+left_arg.signature+" and "+right_arg.signature,node);
                    case "-":
                    case "/":
                    case "*":
                    case "%":
                        //Alright the rest of arithmetic operations have no overloads so it's pretty much the same for most of them:
                        //1) Verify  that both arguments are numbers:
                        if(!(left_arg.is_number()&&right_arg.is_number()))
                            throw new semantic_exception("Invalid types for operation: "+node.name+" " +
                                "Expected: integer|decimal and integer|decimal. Got: "+left_arg.signature+" and "+right_arg.signature,node);
                        if(value_as_signature){
                            if(left_arg.is_integer()&&right_arg.is_integer())this.evaluation_stack.push(INTEGER);
                            else this.evaluation_stack.push(DOUBLE);
                            return;
                        }
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
                        if(!(left_arg.is_primitive()&&right_arg.is_primitive()))throw new semantic_exception("Cannot perform: "+node.name+" " +
                            "On types: "+left_arg.signature+" and "+right_arg.signature,node);
                        if(value_as_signature){
                            this.evaluation_stack.push(BOOLEAN);
                            return;
                        }
                        this.operate(left_value,right_value,node.name,this.t);
                        this.push_cache(this.t);
                        this.evaluation_stack.push(this.types[BOOLEAN]);
                        return;
                    case "&&":
                    case "||":
                        if(left_arg.is_boolean()&&right_arg.is_boolean()){
                            if(value_as_signature){
                                this.evaluation_stack.push(BOOLEAN);
                                return;
                            }
                            this.operate(left_value,right_value,node.name,this.t);
                            this.push_cache(this.t);
                            this.evaluation_stack.push(this.types[BOOLEAN]);
                            return;
                        }else throw new semantic_exception("Cannot perform operation: "+node.name+" On types: "+left_arg.signature+" and "+right_arg.signature,node);
                    case "NOT":
                        if(!left_arg.is_boolean())throw new semantic_exception("Cannot negate type: "+left_arg.signature,node);
                        if(value_as_signature){
                            this.evaluation_stack.push(BOOLEAN);
                            return;
                        }
                        this.operate(left_value,null,'!',this.t,true);
                        this.push_cache(this.t);
                        this.evaluation_stack.push(this.types[BOOLEAN]);
                        return;
                    case "UMINUS":
                        if(!left_arg.is_number())throw  new semantic_exception("Cannot operate: UMinus on type: "+ left_arg.signature,node);
                        if(value_as_signature){
                            this.evaluation_stack.push(left_arg.signature);
                            return;
                        }
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
        const lWrong = this.generate_label();
        const lFine = this.generate_label();
        const lower_limit = '0'.charCodeAt(0);
        const upper_limit = '9'.charCodeAt(0);
        this.pureIf(this.t1,lower_limit,'<',lWrong);
        this.pureIf(this.t1,upper_limit,'>',lWrong);
        this.goto(lFine);
        this.set_label(lWrong);
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
        //1) Check the first scenario: (a local within the current block):
        let local_index = this.get_index(node.text);
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
            this.resolve_final_initialization(local_index);
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
                this.resolve_final_initialization(target);
                if(this.SymbolTable[target].inherited)this.get_stored_inherited_ref(target);
                else this.get_stored_ref(target);
            }else{
                if(this.SymbolTable[target].inherited)this.get_stored_inherited_value(target); //a) Is a normal by Value variable.
                else this.get_stored_value(target); //b) Is an Inherited variable of a by Value variable.
            }
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
                this.resolve_method_call(method,node,resolve_as_signature);
                return;
            }
            if(resolve_as_signature){
                this.evaluation_stack.push(this.SymbolTable[target_func].type); //We push the return type
                return;
            }
            this.perform_static_function_call(target_func,paramL);
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
            case "println":
                if(value_as_signature){
                    this.evaluation_stack.push('void');
                    return true;
                }
                this.format_text(paramL);
                if(this.is_within_expression())throw new semantic_exception('Cannot call println from within an expression.',node);
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
            default:
                return false;
        }
    },
    format_text(paramList) {
        //This method takes any parameter, casts it to string (if possible) and prints it.
        if(paramList.children.length!=1)throw new semantic_exception('Only one parameter expected for println function. Found: '+paramList.children.length);
        this.stack.push('expression');
        this.value_expression(paramList.children[0]); //We value the param as expression.
        this.stack.pop();
        let type = this.evaluation_stack.pop();
        this.cast_to_string(type,paramList);
        this.get_char_array(); //We remove the String ref from the top and push a charArray ref instead.
        this.call('print_string'); //We print the String
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
        if(this.compatible_classes('String',og.signature))return; //Nothing to do, is already an string
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
            let res = this.get_var_index(index, signature);
            if(res != -1){
                return res;
            }
        }
        return -1;  //Not found :(
    },
    resolve_method_call(field, node,resolve_as_signature=false) {
        if(this.is_within_expression()){
            if(field.type=='void')throw new semantic_exception('Cannot call a void function from within an expression. Function: '+field.name,node);
        }
        if(resolve_as_signature){
            this.evaluation_stack.push(field.type);
            return;
        }
        let paramL = node.children[node.children.length-1];
        if(this.varChainIndex==0){
         //We have to load the this reference first:
            let this_index = this.get_index('this');
            if(this_index==-1)throw new semantic_exception('Cannot access: '+field.name+" Within a static context.",node);
            if(this.SymbolTable[this_index].inherited)this.get_stored_inherited_value(this_index); //We push it to the evaluation stack
            else this.get_stored_value(this_index); //We push the this reference to the cache.
        }
        let signature = field.owner+"."+field.name;
        let target_func = this.get_func_index(signature);
        this.value_parameters(paramL);
        //Alright, all params have been valuated backwards, however the this reference is at the bottom of all params.
        //We'll use the heap as a secondary stack for the purpose of taking out the this reference from the bottom and pushing it to the top.
        this.assign(this.t1,0);//We need to know how many params we've valuated.
        let WhileStart = this.generate_label();
        let WhileEnd = this.generate_label();
        this.set_label(WhileStart);
        this.pureIf(this.t1,paramL.children.length,'>=',WhileEnd);
        this.pop_cache(this.t2); //param value;
        this.operate('H','1','+','H');
        this.set_heap('H',this.t2);
        this.operate(this.t1,'1','+',this.t1);
        this.goto(WhileStart);
        this.set_label(WhileEnd);
        //Alright all params have been removed and are now in the heap.
        this.pop_cache(this.t3); //t3 = this reference.
        //Alright, now let's put all params back in the cache:
        let wS = this.generate_label();
        let wE = this.generate_label();
        this.set_label(wS);
        this.assign(this.t1,0);
        this.pureIf(this.t1,paramL.children.length,'>=',wE);
        this.get_heap(this.t2,'H'); //We get the first value
        this.operate('H','1','-','H');//We decrease H
        this.push_cache(this.t2); //We push it back to the cache.
        this.goto(wS);
        this.set_label(wE);
        this.push_cache(this.t3); //We finally push the this reference at the top.
        this.stack.push("function_call");
        this.perform_jump(this.peek(this.scope),target_func,this.SymbolTable[this.peek(this.scope)].size);
        this.stack.pop(); //That's all!
        this.evaluation_stack.push(this.types[this.SymbolTable[target_func].type]);
    },
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
      let found = false;
      this.stack.forEach(s=>{
         if(s=='expression')found = true;
      });
      return found;
    },
    is_native_method(owner, signature,resolve_as_signature) {
        //Alright, here I can overwrite and implement by hand any native method!
        //This is different from is_native_function, because that one is used for native static functions.
        //This is used for native normal methods (like equals, length, toLowerCase, etc)
        //Object native methods:
        if(signature.startsWith('equals')){ //The highest precedence amongst all native functions. Doesn't matter who's the caller or what are the params.
            if(resolve_as_signature){
                this.evaluation_stack.push(BOOLEAN);
                return true;
            }
            this.evaluation_stack.push(this.types[BOOLEAN]);
            return true;
        }else if(signature=='getClass'){//Second highest precedence, doesn't matter who's the caller.
            if(resolve_as_signature){
                this.evaluation_stack.push('String');
                return true;
            }
            this.evaluation_stack.push(this.types['String']);
            return true;
        }
        if(owner=='String'){
            //String compatible
            switch (signature) {
                case 'length':if(resolve_as_signature){
                    this.evaluation_stack.push(INTEGER);
                    return true;
                }
                    this.evaluation_stack.push(this.types[INTEGER]);
                    return true;
                case 'toLowerCase':
                    if(resolve_as_signature){
                    this.evaluation_stack.push('String');
                    return true;
                }
                    this.evaluation_stack.push(this.types['String']);
                    return true;
                case 'toUpperCase':
                    if(resolve_as_signature){
                        this.evaluation_stack.push('String');
                        return true;
                    }
                    this.evaluation_stack.push(this.types['String']);
                    return true;
            }
        }
        return false;
    },
    perform_static_function_call(target_func, paramL) {
        if(this.is_within_expression())
            if(this.SymbolTable[target_func].type=='void')
                throw new semantic_exception('Cannot call a void function from within an expression. Function: '+signature,paramL);
        this.value_parameters(paramL);
        this.stack.push("function_call");
        this.perform_jump(this.peek(this.scope),target_func,this.SymbolTable[this.peek(this.scope)].size);
        this.stack.pop();
        this.evaluation_stack.push(this.types[this.SymbolTable[target_func].type]);
    },
    cast_to_integer(og) {
        this.pop_cache(this.t1); //t1 = value to downcast.
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
                this.exit(2);
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
        this.value_expression(node,false,true);
        //1) now, value it again as value:
        this.value_expression(node);
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
                    _log('One or more errors occurred during compilation. see error log for details. You can select');
                    reset_compilation_cycle();
                }
                return;
            case 'assignation':
                //Alright, if everything is correct this method is quite simple & straight forward:
                //0) value the left side as reference:
                let left_side = node.children[0];
                let right_side = node.children[1];
                this.stack.push('expression');
                this.value_expression(left_side,false,true);
                this.value_expression(right_side,false,false);
                this.stack.pop();
                let value_type = this.evaluation_stack.pop();
                let recipient_type = this.evaluation_stack.pop();
                return;
            case 'pre-increment':
            case 'pre-decrement':
            case 'post-increment':
            case 'post-decrement':
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
    resolve_final_initialization(local_index) {
        let final_row = this.SymbolTable[local_index];
        if(final_row.final&&final_row.initialized){
            throw new semantic_exception(final_row.name+" is final and has already been initialized.")
        }else if(final_row.final){
            //Alright, is final and hasn't been initialized. this means
            //We're finally initializing it! We can change its state and keep on going normally.
            this.mark_as_initialized(final_row.name);
        }
    },
    compatible_classes(recipient, value) {
        let _recipient_class = this.classes[recipient];
        let _value_class = this.classes[value];
        if(_recipient_class==undefined||_value_class==undefined)throw new _compiling_exception('FATAL ERROR! Attempted to compare 2 non-classes.');
        return ((_value_class.cc % _recipient_class.cc == 0 && _value_class.cc != _recipient_class.cc) || _recipient_class.id==_value_class.id);
    },
    compatible_types(recipient_type, value_type,node) {
            /*
            * This method does nothing if both types are compatible
            * or throws exception otherwise.
            * */
            if(recipient_type.is_primitive()&&value_type.is_primitive()){
                if(recipient_type.is_number()&&value_type.is_number())return; //We're fine.
                if(recipient_type.is_boolean()&&value_type.is_boolean())return; //We're fine.
            }else if(recipient_type.is_class()){//I'm expecting value to be null or a compatible class.
                if(value_type.signature==NULL)return; //null is accepted regardless.
                if(this.compatible_classes(recipient_type.signature,value_type.signature))return; //we're fine. Both classes are compatible.
            }else if(recipient_type.is_array()&&value_type.is_array()){
                if(recipient_type.signature==value_type.signature)return; //Arrays are already abstracted for them to show only the important info in their signatures.
            }
           throw new semantic_exception('Incompatible types. Cannot assign: '+value_type.signature+' to: '+recipient_type.signature,node);
    }
};
