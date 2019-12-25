//region Directives
let CAP_HEAP = false;
let CAP_HEAP_DISPLAY = true;
let CAP_STACK_DISPLAY = true;
let MAX_HEAP = 150000;
let MAX_TRY_CATCH = 50; //At default you can only use up to 50 nested Try Catch blocks.
let MAX_CACHE = 300; //At default you can only use a cache of up to 300 cells.
let MAX_HEAP_DISPLAY = 2000; //At default you can only graph up to 2000 cells in the heap.
let MAX_STACK_DISPLAY = 1000; //At default you can only graph up to 1000 cells in the stack.
let INSTRUCTION_MAX = 50000; //To prevent infinite loops any program will NOT be able to execute more than Instruction Max sentences.
let CAP_INSTRUCTION_EXECUTION = true;
//endregion
//region Constants for 3D.
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
let CodeMirror_3D = null;
let token_tracker = [];
//endregion
//region Global Utility Functions for 3D
/*
place before the switch($avoiding_name_collisions) { place:
register_token(yy_.yytext,yy_.yylloc.first_line-1,yy_.yylloc.first_column);
default on that switch:
default: new _3D_Exception(new _3D_Token(yy_.yytext,yy_.yylloc.first_line-1,yy_.yylloc.first_column),"Lexical error. Unrecognized symbol: "+yy_.yytext);
*/
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
    if(!compiling){
        reset_3D(); //We reset structures back to default
       // let element = $("#ThreeD_Source");
        let source = CodeMirror_3D.getValue();
        try{
            _3D_grammar.parse(source); //We try to parse the input.
        }catch (e) {
            /*A parse error occurred. We dispose of the error Object and log other properly:*/
            new _3D_Exception(token_tracker.pop(),"Syntax error. Unexpected symbol");
        }
        reset_IP(); //We get the first instruction.
        compiling = true;
    }
}
function end_3d(sucess = true) {
    if(sucess)log("3D execution finished successfully.");
    log("Max Heap size used: "+HEAP.length);
    log("Max Stack size used: "+STACK.length);
}
function reset_IP() {
    if("main" in labels)IP = labels.main;
    else throw new _3D_Exception(null,"NO main method found. could not start code execution.",false);
    temporals['T']=IP; //We load T.
    $("#Current_Instruction").html(instructions[IP].signature);
}
function reset_3D() { //Resets all structures back to default. Must be called before parsing.
    temporals.clear();
    instructions.clear();
    labels.clear();
    HEAP = [];
    STACK = [];
    INSTRUCTION_STACK = [];
    token_tracker = [];
    set_IP(0);
    IC = 0;
    MAX_HEAP_DISPLAY = 2000;
    MAX_STACK_DISPLAY = 1000;
    show_new_segment($("#Heap_Display"),MAX_HEAP_DISPLAY,"H");
    show_new_segment($("#Stack_Display"),MAX_STACK_DISPLAY,"S");
    $("#Temporals_Display").empty();
    $("#Debug_Console").empty();
    current_line = null;
}
function increase_IP(value) {
    IP = find__Next(IP,instructions);
    temporals['T']=IP;
}
function set_IP(index) {
    IP = index;
    temporals['T']=IP;
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
        $("#Debug_Console").append(current_line);
    }
    switch (format) {
        case "'%c'":
            if(value=='\n'){ //Print new line.
                current_line = new line("");
                $("#Debug_Console").append(current_line);
            }else{
                let ch = current_line.children();
                ch[1].append(String.fromCharCode(value));
            }
            break;
        case "'%e'":
        case "'%d'":
            let ch = current_line.children();
            ch[1].append(value.toString());
            break;
    }
}
function log(message) { //Atm we log to the console. However, this should log to the Handmade console.
    current_line = new line(message);
    $("#Debug_Console").append(current_line);
}
//endregion
//region Object constructors for 3D code.
const _3D_Token = function (text, row, col, negative = false) {
  this.text = text;
  this.row = row;
  this.col = col;
  this.negative = negative;
};
const _3D_Exception = function (token,message,show_position = true) {
    compiling = false;
    if(show_position)log("Runtime Exception at: ("+token.row+","+token.col+") Under symbol: "+token.text+"  Details: "+message);
    else log("Runtime Exception: "+message);
    end_3d(false);
};
const Instruction = function (name,token,param1=null,param2=null,param3=null,param4=null) {
    this.name = name;
    this.token = token;
    switch (name) {
    case "standard":
        this.a = param1; //A token
        this.b = param2; //A token
        this.op = param3; //Text
        this.c = param4; //A temp name
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
        this.signature = "if("+get_signature(this.a)+this.op+get_signature(this.b)+") goto "+this.target;
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
    default:
        break;
    }
};
//endregion
//region Play Instruction
function play_instruction(instruction,debug = false) {
    IC++;
    if(IC>=INSTRUCTION_MAX&&CAP_INSTRUCTION_EXECUTION)throw new _3D_Exception(null,"Potential infinite loop prevented. Cannot execute more than "+INSTRUCTION_MAX+" Sentences.",false);
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
            increase_IP(1);//We update for next instruction.
            break; //That's all!
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
            increase_IP(1);//We update for next instruction.
            break;
        case "GET_HEAP": //We're getting a value from the heap.
            address = instruction.address; //We get the name of the temporal
            address = temporals[address]; //We get the actual value.
            vessel = instruction.vessel; //We get the name of the recipient temporal.
            temporals[vessel] = HEAP[address]; //We perform the assignation.
            if(debug)update_temporal(vessel,HEAP[address]);
            increase_IP(1);//We update for next instruction.
            break; //That's all.
        case "SET_HEAP":
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
            increase_IP(1);//We update for next instruction.
            break;
        case "GET_STACK": //We're getting a value from the Stack.
            address = instruction.address; //We get the name of the temporal
            address = temporals[address]; //We get the actual value.
            vessel = instruction.vessel; //We get the name of the temporal vessel.
            temporals[vessel] = STACK[address]; //We perform the assignation.
            if(debug)update_temporal(vessel,STACK[address]);
            increase_IP(1);//We update for next instruction.
            break; //That's all.
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
            increase_IP(1);//We update for next instruction.
            break;
        case "goto":
            destiny = instruction.target; //Destiny is supposed to hold the name of the label we're targeting.
            destiny = labels[destiny]; //We replace the name of the label by the index of the instruction we're jumping to.
            set_IP(destiny); //We update the value of i so we can actually do the jump.
            return; //We perform the jump.
        case "call": //How to perform jumps:
            INSTRUCTION_STACK.push({func:instruction.target,returnTo:find__Next(IP,instructions)}); //We push the instruction where we're supposed to return.
            destiny = instruction.target; //We get the name of the target.
            destiny = labels[destiny]; //We get the actual index of the instruction to execute.
            set_IP(destiny); //We update i.
            return; //We perform the jump
        case "ret": //How to return back after a proc is finished:
            if(INSTRUCTION_STACK.length){
                destiny = getReturnAddress(instruction.target); //We get the address where we're supposed to return.
                set_IP(destiny); //We update i.
                return; //We perform the jump back.
            }else{ //The stack is empty. This can only mean we finished the execution of 3D code.
                set_IP( 'end');
                return;
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
                set_IP(destiny); //We update i.
                return;  //We perform the jump
            } else increase_IP(1);
            break;
        case "print":
            a = instruction.format; //We get the format for how to print the argument.
            b = instruction.value.text; //We get the number/char to print
            b = Number(b); //We turn the number into a an actual number
            if(isNaN(b)){
                b = temporals[instruction.value.text]; //We get the value from the temporals
            }
            print(a,b); //We print the value
            increase_IP(1);//We go to next instruction.
            break;
        default:
            throw new _3D_Exception(instruction.token,"Unrecognized 3D instruction");
    }
}
//endregion
//region Execute 3D
function play_3D(debug = false) { //Input is parsed outside this function. Play 3D Uses IP directly and executes all instructions without debugging.
    compiling = false;//Always starts a new cycle.
    new_3D_cycle();
    while(IP!='end'){
  		let instruction = instructions[IP]; //We get the instruction to execute.
        play_instruction(instruction,debug);
    }
    compiling = false; //We end the cycle.
    end_3d();
}
//endregion
