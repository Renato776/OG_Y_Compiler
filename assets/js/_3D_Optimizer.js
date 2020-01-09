const Optimizer = {
    instruction_stack :[],
    unused_instructions: [],
    label_stack : [],
    goto_started:false,
    initialize:function(){
        token_tracker = [];
        this.instruction_stack = [];
        this.unused_instructions = [];
        this.label_stack = [];
        this.goto_started = false;
        $("#OPTIMIZACION_BODY").empty();
        $("#OPTIMIZACION_HEADER").empty();
    },
    log_optimization : function(rule,details,result){
        let $row = $("<tr>");
        let $rule = $("<td>");
        let $details = $("<td>");
        let $result = $("<td>");
        $rule.html(rule);
        $details.html(details);
        $details.addClass('Optimized_cell')
        $result.html(result);
        $row.append($rule);
        $row.append($details);
        $row.append($result);
        $row.addClass('Optimized_field');
        $("#OPTIMIZACION_BODY").append($row);
    },
    load_optimization_header : function(){
      let $row = $("<tr>");
      let $rule = $("<td>");
      let $details = $("<td>");
      let $result = $("<td>");
      $rule.html('Regla');
      $details.html('Detalles');
      $result.html('Resultado');
      $row.append($rule);
      $row.append($details);
      $row.append($result);
      $row.addClass('Class_Header');
      $("#OPTIMIZACION_HEADER").append($row);
    },
    peek_instruction_stack :function () {
        return this.instruction_stack[this.instruction_stack.length-1];
    },
    evaluate_token:function (token) { //Returns either a number or NaN
        let t = token.text; //We get the name of temp we're using. or the value if we're having a number.
        t = Number(t); //We convert the text to a number (if applicable)
        if(!isNaN(t))if(token.negative){
            t = -1*t;
        }
        return t;
    },
    resolve_unreachable_code :function () {
        //Dispose of all elements in the unused instruction stack and log details regarding the operation.
        this.unused_instructions = this.unused_instructions.slice(1); //We remove the 0 entry as it is the same goto that started the block.
        if(this.unused_instructions.length==0)return; //There's nothing to be done, code is already optimized.
        let info = "";
        this.unused_instructions.forEach(instr=>{
           info += instr.token.row+") "+instr.signature+"<br>";
        });
        this.unused_instructions = []; //We empty the unused instructions as they're no longer useful.
        this.log_optimization('Codigo inalcanzable',info,'Se ha eliminado el codigo inalcanzable');
    },
    resolve_arithmetic_reduction :function (instruction) {
        /*
        * Checks the instruction and if it is possible to reduce it does so and
        * returns the modified instruction. Otherwise it returns the same instruction.
        * */
        if(instruction.name != 'standard')return instruction; //This optimization only applies for standard instructions.
        let a = instruction.a;
        let b = instruction.b;
        a = this.evaluate_token(a);
        b = this.evaluate_token(b);
        let optimized;
        if(isNaN(a)&&isNaN(b))return instruction; //If both aren't constant we can't perform any optimization.
        if(!isNaN(a)&&a==0&&(instruction.op=='+'||instruction.op=='-')){ //c = temp +/- 0 an optimization can be performed.
            optimized =  new Instruction('assignation',instruction.token,instruction.c,instruction.b);
        }else if(!isNaN(b)&&b==0&&(instruction.op=='+'||instruction.op=='-')){
            optimized = new Instruction('assignation',instruction.token,instruction.c,instruction.a);
        }else if (!isNaN(a)&&a==1&&(instruction.op=='*'||instruction.op=='/')){
            optimized = new Instruction('assignation',instruction.token,instruction.c,instruction.b);
        }else if(!isNaN(b)&&b==1&&(instruction.op=='*'||instruction.op=='/')){
            optimized = new Instruction('assignation',instruction.token,instruction.c,instruction.a);
        }else if(!isNaN(b)&&!isNaN(a)){ //Both are numbers
            let r;
            switch (instruction.op) {
                case "+":
                    r = a + b;
                    break;
                case "-":
                    r = a - b;
                    break;
                case "*":
                    r = a * b;
                    break;
                case "/":
                    r = a / b;
                    break;
                case "%":
                    r = a % b;
                    break;
            }
            optimized = new Instruction('assignation',instruction.token,instruction.c,new _3D_Token(r,
                instruction.token.row,instruction.token.col));
        }else{
            return instruction; //Else it can't be optimized.
        }
        this.log_optimization('Simplificacion Algebraica',
            instruction.token.row+")"+instruction.signature,optimized.token.row+")"+optimized.signature);
        return optimized;
    },
    resolve_unneeded_jump: function (labelStmt) {
        /*
        * This method peeks the instruction stack, if it is a goto sentence,
        * it checks the target of the goto, if the target is within the label stmt, that
        * goto is removed from the instruction stack.
        * */
        let instr = this.peek_instruction_stack();
        if(instr.name != 'goto')return; //This only applies if the top instruction is a goto.
        let target = instr.target;
        let found = false;
        this.label_stack.forEach(l=>{
           if(l==target)found = true;
        });
        if(!found)return; //The target isn't within the Label list, there's nothing to do.
        this.instruction_stack.pop(); //The target is indeed the next instruction, we can remove the jump.
        this.log_optimization('Optimizacion de flujo de control',
            instr.token.row+")"+instr.signature+"<br>"
        +(Number(instr.token.row)+1)+")"+labelStmt,'Se ha removido el goto innecesario');
        this.label_stack = [];
    },
    resolve_redundant_instruction:function () {
        /*
        * This method peeks the top 2 stmts in the Instruction stack and if both are redundant,
        * they are reduced.
        * Supported redundancy is:
        * **Tn = Tn + 1
        * **Tn = Tn -1
        * Both above instructions can be removed as they're both redundant.
        * **Tn = Tn - 1
        * **Tn = Tn + 1
        * Both above instructions can be removed as they're both redundant.
        * **Tn = Tm
        * **Tm = Tn
        * The second instruction is redundant, can be removed.
        * **Tn = structure[Tm]
        * **structure[Tm] = Tn
        * The second instruction is redundant and can be removed. structure denotes
        * either stack or heap.
        * */
        let bottom = this.instruction_stack.pop();
        let top = this.instruction_stack.pop();
        if(bottom==undefined)return;
        if(top==undefined){this.instruction_stack.push(bottom);return;}
        if(top.name == 'standard'&&bottom.name == 'standard'||
            (top.name=='GET_HEAP'&&bottom.name=='SET_HEAP')||
            (top.name=='GET_STACK'&&bottom.name=='SET_STACK')||
            (top.name=='assignation'&&bottom.name=='assignation')){
            if(top.name == 'standard'&&bottom.name == 'standard'){ //Could be a redundant +1 -1 instruction.
                if(top.c==bottom.c){ //Both vessels must be the same.
                    let a = top.a;
                    let b = top.b;
                    a = this.evaluate_token(a);
                    b = this.evaluate_token(b);
                    let aa = bottom.a;
                    let bb = bottom.b;
                    aa = this.evaluate_token(aa);
                    bb = this.evaluate_token(bb);
                    if(isNaN(aa)&&isNaN(bb)||
                        isNaN(a)&&isNaN(b)||
                        !isNaN(aa)&&!isNaN(bb)||
                        !isNaN(a)&&!isNaN(b)||
                        !(top.op=='+'&&bottom.op=='-'||top.op=='-'&&bottom.op=='+')){ //None of this scenarios can be reduced.
                        this.instruction_stack.push(top);
                        this.instruction_stack.push(bottom);
                        return;
                    }
                    //Alright at this point I'm sure is either +/- and I have one temp and one number.
                    //Now I gotta check both numbers are 1. Otherwise the reduction can't be done.
                    if(isNaN(a)&&b==1&&(isNaN(aa)&&bb==1||isNaN(bb)&&aa==1)||
                        isNaN(b)&&a==1&&(isNaN(aa)&&bb==1||isNaN(bb)&&aa==1)){
                        //Alright, that was the last check, the reduction can be done!
                        let info = top.token.row+")"+top.signature+"<br>"+
                        bottom.token.row+")"+bottom.signature;
                        this.log_optimization('Eliminacion de instrucciones redundantes',info,'Ambas instrucciones han sido removidas.');
                        if(top.signature.includes('proc')){
                            //The top instruction is an anchor for a proc definition. If we remove it
                            //we break the whole code.
                            //Therefore we must keep the proc definition and discard the rest.
                            top.signature = top.signature.slice(0,top.signature.indexOf('{')+1);
                            this.instruction_stack.push(top);
                        }
                        return;
                    }
                }
            }else if ((top.name=='GET_HEAP'&&bottom.name=='SET_HEAP')|| (top.name=='GET_STACK'&&bottom.name=='SET_STACK')){
                if(top.address==bottom.address&&top.vessel==bottom.value.text){
                    //The addresses are the same and the value is the same as the vessel, therefore the second instruction is redundant.
                    this.instruction_stack.push(top);
                    let info = top.token.row+")"+top.signature+"<br>"+
                        bottom.token.row+")"+bottom.signature;
                    this.log_optimization('Eliminacion de instrucciones redundantes de carga & almacenamiento',info,'La segunda instruccion es redundante y ha sido removida.');
                    return;
                }
            }else if(top.name=='assignation'&&bottom.name=='assignation'){
                if(top.vessel==bottom.value.text&&bottom.vessel==top.value.text||top.signature==bottom.signature){
                    //Redundant assignation.
                    this.instruction_stack.push(top);
                    this.log_optimization('Eliminacion de instrucciones redundantes',
                        top.token.row+")"+top.signature+"<br>"+bottom.token.row+")"+bottom.signature,'Asignacion redundante. Se ha eliminado la segunda asignacion.');
                    return;
                }
            }
        }
        this.instruction_stack.push(top);
        this.instruction_stack.push(bottom);
        return;
    },
    output_optimized_code:function () {
        /*
        * This method takes the instruction stack and outputs the 3D represantation.
        * */
        this.load_optimization_header();
        this.instruction_stack.forEach(i=>{
           //$("#Optimized_code").append(i.signature+" <br> ");
            $("#Optimized_code").append(this.get_formatted_signature(i.signature)+" <br> ");
        });
        $("#Optimized_code").removeClass('Debug_Container_Hide');
    },
    get_formatted_signature(signature) {
        let res = signature.replace(/</gm,'&lt');
        res = res.replace(/>/gm,'&gt');
        return res;
    }
};
function Optimize() {
    let unOptimizedCode = CodeMirror_3D.getValue();
    Optimizer.initialize();
    try{
        _Optimizer_grammar.parse(unOptimizedCode);
    }catch (e) {
        $("#Optimized_code").empty();
        let t = token_tracker.pop();
        new _3D_Exception(t,"Unexpected symbol: "+t.text,true,'Syntactical',true);
    }
}