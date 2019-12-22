//region Object constructors for 3D code.
const _3D_Token = function (text, row, col,negative = false) {
  this.text = text;
  this.row = row;
  this.col = col;
  this.negative = negative;
};
const _3D_Exception = function (token,message) {
    log("Fatal Error at: row ="+token.row+" col ="+token.col+" under symbol: "+token.text+"\nDetails: "+message);
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
        break;
    case "assignation":
        this.vessel = param1; //A temp name
        this.value = param2; //A token
        break;
    case "GET_HEAP":
        this.vessel = param1; //A temp name
        this.address = param2; //A temp name
        break;
    case "GET_STACK":
        this.vessel = param1; //A temp name
        this.address = param2; //A temp name
        break;
    case "SET_HEAP":
        this.address = param1; //A temp name
        this.value = param2; //A token
        break;
    case "SET_STACK":
        this.address = param1; //A temp name
        this.value = param2; //A token
        break;
    case "if":
        this.a = param1; //A token
        this.b = param2; //A token
        this.op = param3; //Text
        this.target = param4; //A label name
        break;
    case "goto":
        this.target = param1; //A label name
        break;
    case "ret": //Takes no extra params besides name & token
        break;
    case "call":
        this.target = param1; //A label name
        break;
    case "print":
        this.format = param1; //Text (literally '%c','%e','%d'
        this.value = param2; //A token
        break;
    default:
        break;
    }
};
//endregion
//region Constants used for 3D interpreter.
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
const breakpoints = {
    clear:function () {
        Object.keys(this).forEach(key => {
            if(key!='clear')delete this[key];
        });
    }
};
let IP = 0;
let HEAP = [];
let STACK = [];
let INSTRUCTION_STACK = [];
let CAP_HEAP = false;
let MAX_HEAP = 150000;
let CACHE_BEGIN = 100; //The cache takes place in the Stack. between the TryCatch segment and the Stack segment (100-1000) by default.
let STACK_BEGIN = 1000; //The Stack begins above the Cache and the TryCatch segment. by default at 1000.
let TRY_CATCH_BEGIN = 0; //The TryCatch Segment starts at 0 and ends at CACHE_BEGIN.
//endregion
//region Native Functions:
function reset_3D() { //Resets all structures back to default. Must be called before parsing.
    instructions.clear();
    temporals.clear();
    labels.clear();
    //breakpoints.clear(); It isn't a good idea to clear breakpoints each time we run 3D.
    HEAP = [];
    STACK = [];
    INSTRUCTION_STACK = [];
    IP = 0;
}
function print(format = 'char', value = 0) { //ATM the output will be logged to the literal console of JS.
    console.log(format);
}
function log(message) { //Atm we log to the console. However, this should log to the Handmade console.
    console.log(message);
}
//endregion
//region Execute 3D:
function play_3D() { //Input is parsed outside this function. It also assumes that all structures have been loaded successfully.
//0) Get the index of the Main function:
    let i = 0;
    if(!('T' in temporals))temporals['T']=0; //We load T if not being used.
    if("main" in labels)i = labels.main;
    else throw "NO main method found. could not start code execution.";
    while(i<Object.keys(instructions).length){
        let instruction = instructions[i]; //Instruction is supposed to be a Instruction node of the 3D sentence.
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
                if(a===NaN){ //Is a name not a number.
                    a = temporals[instruction.a.text]; //We get the actual value.
                }
                if(instruction.a.negative){
                    a = -1*a;
                }
                b = instruction.b.text; //We get the name of the temp we're using.
                b = Number(b);
                if(b===NaN){ //b is a name not a number
                    b = temporals[instruction.b]; //We get the actual value
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
                break; //That's all!
            case "assignment":
                vessel = instruction.vessel;
                value = instruction.value.text;
                value = Number(value);
                if(value===NaN){
                    value = temporals[instruction.value.text];
                }
                if(instruction.value.negative){
                    value = -1*value;
                }
                temporals[vessel] = value;
                break;
            case "GET_HEAP": //We're getting a value from the heap.
                address = instruction.address; //We get the name of the temporal
                address = temporals[address]; //We get the actual value.
                vessel = instruction.vessel; //We get the name of the recipient temporal.
                temporals[vessel] = HEAP[address]; //We perform the assignation.
                break; //That's all.
            case "SET_HEAP":
                address = instruction.address; //We get the name of the temporal
                address = temporals[address]; //We get the actual value.
                value = instruction.value.text; //Value or name
                value = Number(value); //If it is a number we get it.
                if(value===NaN){
                    value = temporals[instruction.value.text]; //We get the actual value.
                }
                if(instruction.value.negative){
                    value = -1*value;
                }
                HEAP[address] = value; //We perform the assignation.
                break;
            case "GET_STACK": //We're getting a value from the Stack.
                address = instruction.address; //We get the name of the temporal
                address = temporals[address]; //We get the actual value.
                vessel = instruction.vessel; //We get the name of the temporal vessel.
                temporals[vessel] = STACK[address]; //We perform the assignation.
                break; //That's all.
            case "SET_STACK": //We're setting a value in the Stack
                address = instruction.address; //We get the name of the temporal
                address = temporals[address]; //We get the actual value of the address.
                value = instruction.value.text; //Name or value.
                value = Number(value); //If it is a number we get it.
                if(value===NaN){ //Is a name not a number
                    value = temporals[instruction.value.text]; //We get the actual value.
                }
                if(instruction.value.negative){
                    value = -1*value;
                }
                STACK[address] = value; //We perform the assignation.
                break;
            case "goto":
                destiny = instruction.target; //Destiny is supposed to hold the name of the label we're targeting.
                destiny = labels[destiny]; //We replace the name of the label by the index of the instruction we're jumping to.
                i = destiny; //We update the value of i so we can actually do the jump.
                continue; //We perform the jump.
            case "call": //How to perform jumps:
                INSTRUCTION_STACK.push(i+1); //We push the instruction where we're supposed to return.
                destiny = instruction.target; //We get the name of the target.
                destiny = labels[destiny]; //We get the actual index of the instruction to execute.
                i = destiny; //We update i.
                continue; //We perform the jump
            case "ret": //How to return back after a proc is finished:
                if(INSTRUCTION_STACK.length){
                    destiny = INSTRUCTION_STACK.pop(); //We get the address where we're supposed to return.
                    i = destiny; //We update i.
                    continue; //We perform the jump back.
                }else{ //The stack is empty. This can only mean we finished the execution of 3D code.
                    log("3D execution finished successfully.");
                    log("Max Heap size used: "+HEAP.length);
                    log("Max Stack size used: "+STACK.length);
                    return;
                }
                break;
            case "if": //Conditional jump.
                a = instruction.a.text; //name or number
                b = instruction.b.text; //name or number
                a = Number(a);
                if(a===NaN){
                    a = temporals[instruction.a.text];
                }
                b = Number(b);
                if(b===NaN){
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
                    i = destiny; //We update i.
                    continue;  //We perform the jump
                } //We do nothing and resume normal execution.
                break;
            case "print":
                a = instruction.format; //We get the format for how to print the argument.
                b = instruction.value; //We get the number/char to print
                b = Number(b); //We turn the number into a an actual number
                if(b===NaN){
                    b = temporals[instruction.value]; //We get the value from the temporals
                }
                print(a,b); //We print the value
                break; //That's all.
            default:
                throw new _3D_Exception(instruction.token,"Unrecognized 3D instruction");
        }
        i++;
    }
    log("3D execution finished successfully.");
    log("Max Heap size used: "+HEAP.length);
    log("Max Stack size used: "+STACK.length);
}
//endregion
//region Parse Text Input and evaluate.
function _interpret(source) { //Parses text and plays 3D.
    reset_3D(); //We reset the structures back to default.
    _3D_grammar.parse(source);
    try{
        play_3D();
    }catch (e) {
        console.log(e);
    }
}
function debug() {
    console.log("Debugging Not implemented yet.")
}
//endregion