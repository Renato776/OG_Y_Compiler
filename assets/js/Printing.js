const Printing = {
    functions:[],
    initialize:function () {
        this.functions = [];
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
        this.peek_function_stack().add(line);
    },
    print_function:function(){
        let func = this.functions.pop();
        this.print_output(func.get_visualization());
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