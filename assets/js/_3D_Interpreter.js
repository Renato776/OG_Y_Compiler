//region Setters for Linked Globals.
function set_3D_source(text){
    CodeMirror_3D.setValue(text);
    CodeMirror_Execute.setValue(text);
}
function append_to_3D_console(){
    $("#Ejecutar_Console").append(current_line);
    $("#Debug_Console").append(current_line2);
}
function append_to_main_console(){
    $("#Main_Console").append(_current_line);
}
//endregion
//region Directives for 3D
let CAP_HEAP = true;
let CAP_HEAP_DISPLAY = true;
let CAP_STACK_DISPLAY = true;
let CAP_INSTRUCTION_EXECUTION = true;
let MAX_HEAP = 150000;
let MAX_HEAP_DISPLAY = 2000; //At default you can only graph up to 2000 cells in the heap.
let MAX_STACK_DISPLAY = 1000; //At default you can only graph up to 1000 cells in the stack.
let INSTRUCTION_MAX = 50000*3; //To prevent infinite loops any program will NOT be able to execute more than Instruction Max sentences in a single run.
let FORCE_ENTRY_PROC = null;
let FORCE_ENTRY_POINT = null;
let selected_class = null;
//endregion
//region Constants for 3D.
const classes = {};
const function_names = []; //This array will always be empty before and after parsing. There's no need to empty it after parsing.
const instructions = {
    clear:function () {
        Object.keys(this).forEach(key => {
            if(key!='clear')delete this[key];
        });
    }
};
const labels = {
    clear:function () {
        Object.keys(this).forEach(key => {
            if(key!='clear')delete this[key];
        });
    }
};
const temporals = {
    clear:function () {
        Object.keys(this).forEach(key => {
            if(key!='clear')delete this[key];
        });
    }
};
const onCursorActivity = (instance) => { //Failed to fetch the line.no Object successfully. Therefore a table holding all breakpoints will be shown instead.
    const cursor = CodeMirror_3D.getCursor();
    let i = cursor.line;
     if(breakpoints.includes(i)){
         breakpoints.splice( breakpoints.indexOf(i), 1 );
     } else  breakpoints.push(i);
    show_breakpoints($(".BreakPoints_Container"),to_div_array(breakpoints));
};
//endregion
//region Global Variables for 3D
let compiling = false; //Indicates if I'm within a 3D execution program or if no program has started execution.
let IP = 0;
let IC = 0;
let breakpoints = [];
let HEAP = [];
let STACK = [];
let INSTRUCTION_STACK = [];
let current_line = null;
let current_line2 = null;
let _current_line = null;
let CodeMirror_3D = null;
let CodeMirror_Main = null;
let CodeMirror_Execute = null;
let token_tracker = [];
let current_tab = null;
let main_file = ""; //This variable should have the name of the file where we started the compilation process.
//endregion
//region Global Utility Functions for 3D
/*
place before the switch($avoiding_name_collisions) { place:
register_token(yy_.yytext,yy_.yylloc.first_line-1,yy_.yylloc.first_column);
default on that switch:
default: new _3D_Exception(new _3D_Token(yy_.yytext,yy_.yylloc.first_line-1,yy_.yylloc.first_column),"Lexical error. Unrecognized symbol: "+yy_.yytext);
*/
function show_tab(e) {
    let b = $(e.target);
    current_tab.addClass('Debug_Container_Hide'); //We hide the previous tab.
    let og = current_tab;
    let signature = b.attr("RValue");
    signature = "#"+signature;
    current_tab = $(signature);
    current_tab.removeClass('Debug_Container_Hide');
    if(signature=="#DEBUG"&&CodeMirror_3D==null){
        let code = $("#ThreeD_Source")[0];
        CodeMirror_3D = CodeMirror.fromTextArea(code, {
            lineNumbers : true,
            firstLineNumber: 0,
            styleSelectedText: true
        });
        CodeMirror_3D.on("cursorActivity", onCursorActivity);
    }else if(signature=="#EJECUTAR"&&CodeMirror_Execute==null){
        let code = $("#Ejecutar_3D_Source")[0];
        CodeMirror_Execute = CodeMirror.fromTextArea(code, {
            lineNumbers : true,
            firstLineNumber: 0,
            styleSelectedText: true,
            readonly :true
        });
    }else if(signature=="#MAIN"&&CodeMirror_Main==null){
        let code = $("#Main_Source")[0];
        CodeMirror_Main = CodeMirror.fromTextArea(code, {
            lineNumbers : true,
            firstLineNumber: 0,
            styleSelectedText: true
        });
    }
    if(og.attr("id")=="EJECUTAR"&&signature=="#DEBUG"){
        CodeMirror_3D.setValue(CodeMirror_Execute.getValue());
    }else if(og.attr("id")=="DEBUG"&&signature=="#EJECUTAR"){
        CodeMirror_Execute.setValue(CodeMirror_3D.getValue());
    }
}
function register_token(yytext, row, col) {
    yytext = yytext.trim();
    if(yytext!=""){
        token_tracker.push(new _3D_Token(yytext,row,col));
    }
}
function delete_breakpoint(e) {
    let bp = e.target;
    bp = parseInt($(bp).html());
    breakpoints.splice( breakpoints.indexOf(bp), 1 );
    show_breakpoints($(".BreakPoints_Container"),to_div_array(breakpoints));
}
function clear_all_breakpoints() {
    breakpoints = [];
    show_breakpoints($(".BreakPoints_Container"),to_div_array(breakpoints));
}
function to_div_array(array) {
    let res = [];
    let i = 0;
    array.forEach(b=>{
        let $div = $("<div>");
        $div.click(delete_breakpoint);
        if(i%2==0)$div.addClass('selected_breakpoint');
        else $div.addClass('selected_breakpoint_2');
        $div.append(b);
        res.push($div);
        i++;
    });
    return res;
}
function show_breakpoints(container, bps){
    container.empty();
    bps.forEach(b=>{
        container.append(b);
    });
}
function find__Next(key, obj) {
    let keys = Object.keys(obj);
    return keys[(keys.indexOf(key.toString()) + 1) % keys.length];
}
function getReturnAddress(name) {
    let i = -1;
    INSTRUCTION_STACK.forEach((f,j)=>{
        if(f.func==name)i =j;
    });
    if(i == -1) return 'end';
    let a =  INSTRUCTION_STACK[i].returnTo;
    INSTRUCTION_STACK = INSTRUCTION_STACK.slice(0, i);
    return a;
}
function new_3D_cycle() {
    reset_3D();
    let source;
    if(current_tab.attr("id")=="EJECUTAR") source = CodeMirror_Execute.getValue();
    else source = CodeMirror_3D.getValue();
    try{
        _3D_grammar.parse(source); //We try to parse the input.
    }catch (e) {
        /*A parse error occurred. We dispose of the error Object and log other properly:*/
        let t = token_tracker.pop();
        new _3D_Exception(t,"Unexpected symbol: "+t.text,true,'Syntactical');
        return true;
    }
    if(reset_IP())return true; //We get the first instruction.
    compiling = true;
}
function end_3d(sucess = true) {
    if(sucess)log("3D execution finished successfully.");
    log("Max Heap size used: "+HEAP.length);
    log("Max Stack size used: "+STACK.length);
}
function reset_IP() {
    if("main" in labels)IP = labels.main;
    else {
        new _3D_Exception(null,"NO main method found. could not start code execution.",false);
        return true;
    }
    $("#Current_Instruction").html(instructions[IP].signature);
}
function reset_3D() { //Resets all structures back to default. Must be called before parsing.
    //region Set directives back to default
    MAX_HEAP_DISPLAY = 2000;
    MAX_STACK_DISPLAY = 1000;
    MAX_HEAP = 150000;
    CAP_HEAP = true;
    CAP_INSTRUCTION_EXECUTION = true;
    //endregion temporals.clear();
    instructions.clear();
    labels.clear();
    temporals.clear();
    HEAP = [];
    STACK = [];
    INSTRUCTION_STACK = [];
    token_tracker = [];
    set_IP(0);
    IC = 0;
    show_new_segment($("#Heap_Display"),MAX_HEAP_DISPLAY,"H");
    show_new_segment($("#Stack_Display"),MAX_STACK_DISPLAY,"S");
    $("#Temporals_Display").empty();
    $("#Debug_Console").empty();
    $("#Ejecutar_Console").empty();
    $("#ErrorTableBody").empty();
    current_line = null;
    current_line2 = null;
}
function increase_IP() {
    IP = find__Next(IP,instructions);
}
function set_IP(index) {
    IP = index;
}
function get_signature(token) {
    let s = "";
    if(token.negative){
        s+="-";
    }
    s+=token.text;
    return s;
}
function print(format = 'char', value = 0) { //ATM the output will be logged to the literal console of JS.
    if(current_line==null){ //Should only happen if is the first time we print a char.
        current_line = new line("");
        append_to_3D_console();
     }
    switch (format) {
        case "'%c'":
            if(value=='\n'){ //Print new line.
                current_line = new line("");
                append_to_3D_console();
            }else{
                current_line.children()[1].append(String.fromCharCode(value));
                current_line2.children()[1].append(String.fromCharCode(value));
            }
            break;
        case "'%e'":
        case "'%d'":
            current_line.children()[1].append(parseInt(value));
            current_line2.children()[1].append(parseFloat(value));
            break;
    }
}
function log(message) {
    current_line = new line(message);
    append_to_3D_console();
}
//endregion
//region Object constructors for 3D code.
const _3D_Token = function (text, row, col, negative = false) {
  this.text = text;
  this.row = row - 1;
  this.col = col;
  this.negative = negative;
};
const _3D_Exception = function (token,message,show_position = false,type = 'Runtime',optimizing=false) {
   let $row = $("<tr>");
    let $type = $("<td>");
    let $line = $("<td>");
    let $col = $("<td>");
    let $details = $("<td>");
    let $class = $("<td>");
    let $file = $("<td>");
    $file.html('N/A');
    $type.html(type);
    if(show_position){
        $line.html(token.row);
        $col.html(token.col);
        $class.html('N/A');
    }else{
        $line.html('N/A');
        $col.html('N/A');
        $class.html('N/A');
    }
    $details.html(message);
    $row.append($type);
    $row.append($details);
    $row.append($line);
    $row.append($col);
    $row.append($class);
    $row.append($file);
    $("#ErrorTableBody").append($row);
    if(optimizing){
        $("#Optimized_code").html('An error has occurred during optimization. See error tab for details.');
    }else log("An error occurred during code execution. See error tab for details.");
};
const Instruction = function (name,token,param1=null,param2=null,param3=null,param4=null) {
    this.name = name;
    this.token = token;
    switch (name) {
        case "standard":
        this.a = param1; //A token
        this.b = param2; //A token
        this.op = param3; //Text
        this.c = param4; //A temp name aka text.
        this.signature = this.c+" = "+get_signature(this.a)+this.op+get_signature(this.b);
        break;
    case "assignation":
        this.vessel = param1; //A temp name
        this.value = param2; //A token
        this.signature = this.vessel+" = "+get_signature(param2);
        break;
    case "GET_HEAP":
        this.vessel = param1; //A temp name
        this.address = param2; //A temp name
        this.signature = this.vessel+" = heap["+this.address+"]";
        break;
    case "GET_STACK":
        this.vessel = param1; //A temp name
        this.address = param2; //A temp name
        this.signature = this.vessel+" = stack["+this.address+"]";
        break;
    case "SET_HEAP":
        this.address = param1; //A temp name
        this.value = param2; //A token
        this.signature = "heap["+this.address+"] = "+get_signature(this.value);
        break;
    case "SET_STACK":
        this.address = param1; //A temp name
        this.value = param2; //A token
        this.signature = "stack["+this.address+"] = "+get_signature(this.value);
        break;
    case "if":
        this.a = param1; //A token
        this.b = param2; //A token
        this.op = param3; //Text
        this.target = param4; //A label name
        this.signature = "if "+get_signature(this.a)+this.op+get_signature(this.b)+" goto "+this.target;
        break;
    case "goto":
        this.target = param1; //A label name
        this.signature = "goto "+this.target;
        break;
    case "ret": //Takes no extra params besides name & token
        this.target = this.token.text;
        this.signature = "}; "+this.token.text;
        break;
    case "call":
        this.target = param1; //A label name
        this.signature = "call "+this.target;
        break;
    case "print":
        this.format = param1; //Text (literally '%c','%e','%d'
        this.value = param2; //A token
        this.signature = "print("+this.format+","+get_signature(this.value)+")";
        break;
    case "exit":
        this.exitCode = param1; //exit code
        this.signature = "exit ("+this.exitCode+" )";
    default:
        break;
    }
};
//endregion
//region Play Instruction
function play_instruction(instruction,debug = false) {
    IC++;
    if(IC>=INSTRUCTION_MAX&&CAP_INSTRUCTION_EXECUTION){
        new _3D_Exception(null,"Potential infinite loop prevented. Cannot execute more than "+INSTRUCTION_MAX+" Sentences. <break>",false);
        current_line = new line("");
        append_to_3D_console();
        IC = 0;
        $("#Recover_Container").removeClass('Debug_Container_Hide');
        return false;
    }
    if(debug){
        $("#Current_Instruction").html(IP+") "+instruction.signature); //We update the instruction we're executing.
    }
    let destiny = null;
    let address = 0;
    let vessel = 0;
    let value = 0;
    let a = 0;
    let b = 0;
    let c = 0;
    switch (instruction.name) {
        case "standard": //Standard 3D operation.
            a = instruction.a.text; //We get the name of temp we're using. or the value if we're having a number.
            a = Number(a); //We convert the text to a number (if applicable)
            if(isNaN(a)){ //Is a name not a number.
                a = temporals[instruction.a.text]; //We get the actual value.
            }
            if(instruction.a.negative){
                a = -1*a;
            }
            b = instruction.b.text; //We get the name of the temp we're using.
            b = Number(b);
            if(isNaN(b)){ //b is a name not a number
                b = temporals[instruction.b.text]; //We get the actual value
            }
            if(instruction.b.negative){
                b = -1*b;
            }
            switch (instruction.op) { //We perform the operation.
                case "+":
                    c = a+b;
                    break;
                case "-":
                    c = a-b;
                    break;
                case "*":
                    c = a*b;
                    break;
                case "/":
                    c = a/b;
                    break;
                case "%":
                    c = a%b;
                    break;
                default:
                    break;
            }
            temporals[instruction.c] = c; //We set the value in the vessel.
            if(debug)update_temporal(instruction.c,c);
            increase_IP();//We update for next instruction.
            return true; //That's all!
        case "assignation":
            vessel = instruction.vessel;
            value = instruction.value.text;
            value = Number(value);
            if(isNaN(value)){
                value = temporals[instruction.value.text];
            }
            if(instruction.value.negative){
                value = -1*value;
            }
            temporals[vessel] = value;
            if(debug)update_temporal(vessel,value);
            increase_IP();//We update for next instruction.
            return true;
        case "GET_HEAP": //We're getting a value from the heap.
            address = instruction.address; //We get the name of the temporal
            address = temporals[address]; //We get the actual value.
            vessel = instruction.vessel; //We get the name of the recipient temporal.
            temporals[vessel] = HEAP[address]; //We perform the assignation.
            if(debug)update_temporal(vessel,HEAP[address]);
            increase_IP();//We update for next instruction.
            return true; //That's all.
        case "SET_HEAP":
            if(HEAP.length>MAX_HEAP&&CAP_HEAP){
                new _3D_Exception(null,"Heap overflow exception. Max allowed: "+MAX_HEAP,false);
                MAX_HEAP = MAX_HEAP*1.5;
                return false;
            }
            address = instruction.address; //We get the name of the temporal
            address = temporals[address]; //We get the actual value.
            value = instruction.value.text; //Value or name
            value = Number(value); //If it is a number we get it.
            if(isNaN(value)){
                value = temporals[instruction.value.text]; //We get the actual value.
            }
            if(instruction.value.negative){
                value = -1*value;
            }
            HEAP[address] = value; //We perform the assignation.
            if(debug)update_heap(address,value);
            increase_IP();//We update for next instruction.
            return true;
        case "GET_STACK": //We're getting a value from the Stack.
            address = instruction.address; //We get the name of the temporal
            address = temporals[address]; //We get the actual value.
            vessel = instruction.vessel; //We get the name of the temporal vessel.
            temporals[vessel] = STACK[address]; //We perform the assignation.
            if(debug)update_temporal(vessel,STACK[address]);
            increase_IP();//We update for next instruction.
            return true; //That's all.
        case "SET_STACK": //We're setting a value in the Stack
            address = instruction.address; //We get the name of the temporal
            address = temporals[address]; //We get the actual value of the address.
            value = instruction.value.text; //Name or value.
            value = Number(value); //If it is a number we get it.
            if(isNaN(value)){ //Is a name not a number
                value = temporals[instruction.value.text]; //We get the actual value.
            }
            if(instruction.value.negative){
                value = -1*value;
            }
            STACK[address] = value; //We perform the assignation.
            if(debug)update_stack(address,value);
            increase_IP();//We update for next instruction.
            return true;
        case "goto":
            destiny = instruction.target; //Destiny is supposed to hold the name of the label we're targeting.
            destiny = labels[destiny]; //We replace the name of the label by the index of the instruction we're jumping to.
            if(destiny==undefined){
                new _3D_Exception(instruction.token,"Undefined label: "+instruction.target,true);
                compiling = false;
                return false;
            }
            set_IP(destiny); //We update the value of i so we can actually do the jump.
            return true; //We perform the jump.
        case "call": //How to perform jumps:
            INSTRUCTION_STACK.push({func:instruction.target,returnTo:find__Next(IP,instructions)}); //We push the instruction where we're supposed to return.
            destiny = instruction.target; //We get the name of the target.
            destiny = labels[destiny]; //We get the actual index of the instruction to execute.
            if(destiny==undefined){
                new _3D_Exception(instruction.token,"Undefined procedure: "+instruction.target,true);
                compiling = false;
                return false;
            }
            set_IP(destiny); //We update i.
            return true; //We perform the jump
        case "ret": //How to return back after a proc is finished:
            if(INSTRUCTION_STACK.length){
                destiny = getReturnAddress(instruction.target); //We get the address where we're supposed to return.
                set_IP(destiny); //We update i.
                return true; //We perform the jump back.
            }else{ //The stack is empty. This can only mean we finished the execution of 3D code.
                end_3d(true);
                compiling = false;
                return false;
            }
            break;
        case "if": //Conditional jump.
            a = instruction.a.text; //name or number
            b = instruction.b.text; //name or number
            a = Number(a);
            if(isNaN(a)){
                a = temporals[instruction.a.text];
            }
            b = Number(b);
            if(isNaN(b)){
                b = temporals[instruction.b.text];
            }
            if(instruction.b.negative){ //Is a negative version of the value
                b = -1*b;
            }
            if(instruction.a.negative){ //Is a negative version of the value.
                a = -1*a;
            }
            switch (instruction.op) {
                case "==":
                    c = a == b;
                    break;
                case "!=":
                    c = a!=b;
                    break;
                case ">":
                    c = a>b;
                    break;
                case "<":
                    c = a<b;
                    break;
                case "<=":
                    c = a<=b;
                    break;
                case ">=":
                    c = a>=b;
                    break;
                default:
                    break;
            }
            if(c){ //We perform the jump
                destiny = instruction.target; //We get the name of the target
                destiny = labels[destiny];  //We get the index of the target
                if(destiny==undefined){
                    new _3D_Exception(instruction.token,"Label not found: "+instruction.target,true);
                    compiling = false; //We start a new cycle because we cannot proceed without this label.
                    return false;
                }
                set_IP(destiny); //We update i.
            } else increase_IP();
            return true;
        case "print":
            a = instruction.format; //We get the format for how to print the argument.
            b = instruction.value.text; //We get the number/char to print
            b = Number(b); //We turn the number into a an actual number
            if(isNaN(b)){
                b = temporals[instruction.value.text]; //We get the value from the temporals
            }
            print(a,b); //We print the value
            increase_IP();//We go to next instruction.
            return true;
        default:
            new _3D_Exception(instruction.token,"Unrecognized 3D instruction: "+instruction.signature,true);
            compiling = false;
            return false;
    }
    throw new _3D_Exception(null,"Instruction fell through: "+instruction.signature,false);
}
//endregion
//region Execute 3D
function play_3D(debug = false) { //Input is parsed outside this function. Play 3D Uses IP directly and executes all instructions without debugging.
    if(new_3D_cycle())return;
    let instruction;
    do{
         instruction = instructions[IP];
    }while (play_instruction(instruction,debug));
}
//endregion
