let DEBUG_3D_OUTPUT = false;
const Printing = {
    functions:[],
    last_five_lines:[],
    current_last_line:0,
    initialize:function () {
        this.functions = [];
        this.last_five_lines = [];
    },
    peek_function_stack:function(){
      return this.functions[this.functions.length-1];
    },
    print_output:function(text){
        Code_Generator.output+=text;
    },
    add_function:function(function_name){
        this.functions.push(new RFunction(function_name));
    },
    print_in_context:function(line){
        if(DEBUG_3D_OUTPUT){
            this.current_last_line++;
            this.last_five_lines[this.current_last_line%5] = line;
        }
        this.peek_function_stack().add(line);
    },
    print_function:function(){
        let func = this.functions.pop();
        this.print_output(func.get_visualization());
    },
    publish:function () {
        /*
        * This method takes the output from the Code Generator and publishes them to the Execution tab.
        * */
        $("#Ejecutar_Button").trigger('click');
        CodeMirror_Execute.setValue(Code_Generator.output);
        Code_Generator.output = ''; //We dispose of the old content as it is no longer of use.
        $("#Ejecutar_console").val('');
        if(SEMANTIC_ERROR_OCCURRED){
            log('One or more semantic errors occurred. See error tab for details.');
            log('If you still choose to proceed, unexpected behaviour might happen.');
        }
    }
};

const RFunction = function (name) {
    this.name = name;
    this.body = '';
    this.add = function (line) {
        this.body += line + '\n';
    };
    this.get_visualization= function() {
        let res  = "proc "+this.name+" {\n";
        res += this.body;
        res += "}\n";
        return res;
    };
};