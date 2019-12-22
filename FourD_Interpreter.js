//region Object constructors for 3D code.
const Instruction = function (name,param1=null,param2=null,param3=null,param4=null) {
    this.name = name;
    switch (name) {
    case "standard":
        this.a = param1;
        this.b = param2;
        this.op = param3;
        this.c = param4;
        break;
    case "assignation":
        this.vessel = param1;
        this.value = param2;
        break;
    case "GET_HEAP":
        this.vessel = param1;
        this.address = param2;
        break;
    case "GET_STACK":
        this.vessel = param1;
        this.address = param2;
        break;
    case "SET_HEAP":
        this.address = param1;
        this.value = param2;
        break;
    case "SET_STACK":
        this.address = param1;
        this.value = param2;
        break;
    case "if":
        this.a = param1;
        this.b = param2;
        this.op = param3;
        this.target = param4;
        break;
    case "goto":
        this.target = param1;
        break;
        case "ret": //Takes no extra params besides name.
        break;
    case "call":
        this.target = param1;
        break;
    case "print":
        this.format = param1;
        this.value = param2;
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
function reset_3D() { //Resets all structures back to default.
    instructions.clear();
    temporals.clear();
    labels.clear();
    HEAP = [];
    STACK = [];
    INSTRUCTION_STACK = [];
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
                a = instruction.a; //We get the name of temp we're using. or the value if we're having a number.
                a = Number(a); //We convert the text to a number (if applicable)
                if(a===NaN){ //Is a name not a number.
                    a = temporals[instruction.a]; //We get the actual value.
                }
                b = instruction.b; //We get the name of the temp we're using.
                b = Number(b);
                if(b===NaN){ //b is a name not a number
                    b = temporals[instruction.b]; //We get the actual value
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
                value = instruction.value;
                value = Number(value);
                if(value===NaN){
                    value = temporals[instruction.value];
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
                value = instruction.value; //We get the name of the value or the pure value.
                value = Number(value); //If it is a number we get it.
                if(value===NaN){
                    value = temporals[instruction.value]; //We get the actual value.
                }
                HEAP[address] = value; //We perform the assignation.
                break;
            case "GET_STACK": //We're getting a value from the Stack.
                address = instruction.address; //We get the name of the temporal
                address = temporals[address]; //We get the actual value.
                vessel = instruction.vessel; //We get the name of the recipent temporal.
                temporals[vessel] = STACK[address]; //We perform the assignation.
                break; //That's all.
            case "SET_STACK": //We're setting a value in the Stack
                address = instruction.address; //We get the name of the temporal
                address = temporals[address]; //We get the actual value of the address.
                value = instruction.value; //We get the name of the value. Or the pure value.
                value = Number(value); //If it is a number we get it.
                if(value===NaN){ //Is a name not a number
                    value = temporals[instruction.value]; //We get the actual value.
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
                a = instruction.a; //Name of the first temp.
                b = instruction.b; //Name of the second temp.
                a = Number(a);
                if(a===NaN){
                    a = temporals[instruction.a];
                }
                b = Number(b);
                if(b===NaN){
                    b = temporals[instruction.b];
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
                throw "Unrecognized 3D instruction;";
        }
        i++;
    }
    log("3D execution finished successfully.");
    log("Max Heap size used: "+HEAP.length);
    log("Max Stack size used: "+STACK.length);
}
//endregion
