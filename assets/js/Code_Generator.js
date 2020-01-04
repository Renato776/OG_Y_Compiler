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
    initialize:function () { //import all useful structures from Compiler and initialize your own.
        this.root = Compiler.root;
        this.classes = Compiler.classes;
        this.types = Compiler.types;
        this.SymbolTable = Compiler.SymbolTable;
        this.scope_tracker = Compiler.scope_tracker.reverse(); //All methods & constructors will be visited in the same order they were while compiling.
        this.sub_block_tracker = Compiler.sub_block_tracker.reverse(); //All sub-blocks will be visited the same order they were while compiling.
        this.evaluation_stack = [];
        this.stack = [];
        this.scope = [];
    },
    generate_code() {
        const target = this.SymbolTable[this.entry_point];
        if(target==undefined)throw new _compiling_exception('The entry point has changed. Please, re-select a valid starting point.');
        if(!target.func||target.name.includes('-'))throw new _compiling_exception('The entry point has changed. Please, re-select a valid starting point.');
        _log('Compiling.....');
    }
};