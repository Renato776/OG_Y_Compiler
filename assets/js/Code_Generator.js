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
    root:null,
    entry_point:-1,
    stack:[],
    evaluation_stack:[],
    scope:[],
    scope_tracker:[],
    sub_block_tracker:[],
    classes:{},
    types:{},
    SymbolTable:[],
    output:'',
    abstractMethods:[],
    initialize:function () { //import all useful structures from Compiler and initialize your own.
        Printing.initialize();
        this.root = Compiler.root;
        this.classes = Compiler.classes;
        this.types = Compiler.types;
        this.SymbolTable = Compiler.SymbolTable;
        this.scope_tracker = Compiler.scope_tracker.reverse(); //All methods & constructors will be visited in the same order they were while compiling.
        this.sub_block_tracker = Compiler.sub_block_tracker.reverse(); //All sub-blocks will be visited the same order they were while compiling.
        this.evaluation_stack = [];
        this.abstractMethods = [];
        this.stack = [];
        this.scope = [];
        this.abstractMethods = abstractMethods;
        this.output = '';
    },
    compile_native_functions:function(){

    },
    compile_abstract_methods:function(){

    },
    compile_native_constructors:function(){

    },
    compile_utility_functions:function(){
        /*
        * This method outputs 3D for all utility 3D functions aka:
        * compileArray, printString, malloc, transfer, etc.
        * */
    },
    generate_code() {
        const target = this.SymbolTable[this.entry_point];
        if(target==undefined)throw new _compiling_exception('The entry point has changed. Please, re-select a valid starting point.');
        if(!target.func||target.name.includes('-'))throw new _compiling_exception('The entry point has changed. Please, re-select a valid starting point.');
        _log('Compiling.....');
    }
};