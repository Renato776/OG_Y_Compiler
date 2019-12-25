const line = function (message) {
    let row =  $("<tr>");
    let s = $("<td>");
    s.append("&gt;&gt;");
    let m = $("<td>");
    m.attr("style","width: 100%; " +
        "text-align: left;");
    m.append(message);
    row.append(s);
    row.append(m);
    return row;
};
const heap_cell = function (index, value) {
  let cell = $("<tr>"), i = $("<td>");
    i.append(index); //We show the index.
  let v = $("<td>");
  v.attr("id","H"+index);
  v.append(value); //We set the value
  cell.append(i);
  cell.append(v);
  return cell;
};
const stack_cell = function (index, value) {
    let cell = $("<tr>"), i = $("<td>");
    i.append(index); //We show the index.
    let v = $("<td>");
    v.attr("id","S"+index);
    v.append(value); //We set the value
    cell.append(i);
    cell.append(v);
    return cell;
};
const temporal_cell = function (name, value) {
    let cell = $("<tr>");
    let i = $("<td>");
    i.append(name); //We show the name of the temporal.
    let v = $("<td>");
    v.attr("id","T_"+name);
    v.append(value); //We set the value
    cell.append(i);
    cell.append(v);
    return cell;
};

function show_new_segment($container, size,prefix) {
    let max_rows = size/2;
    $container.empty();
    let i = 0;
    while(i<max_rows){
        let $row = $("<tr>");
        let $index = $("<td>");
        $index.html(i);
        let $val = $("<td>");
        $val.attr("id",prefix+i);
        $val.html(0);
        let $index2 = $("<td>");
        $index2.html(i+max_rows);
        let $val2 = $("<td>");
        $val2.attr("id",prefix+(i+max_rows));
        $val2.html(0);
        $row.append($index);
        $row.append($val);
        $row.append($index2);
        $row.append($val2);
        $container.append($row);
        i++;
    }
}

function update_heap(index,value) { //A function to update the heap Graphically.
    let signature = "#H"+index; //We build the ID of the exact cell we'll edit.
    if(index>=MAX_HEAP_DISPLAY){
        if(CAP_HEAP_DISPLAY){
            if(!alerted_H){
                alert("To keep optimal performance in debugger visualization of any Heap index past "+MAX_HEAP_DISPLAY+" is forbidden.");
            } alerted_H = true;
            return;
        }else{ //Alright we haven't capped the display limit this means we could make a new segment twice as big.
            MAX_HEAP_DISPLAY = MAX_HEAP_DISPLAY*2; //We increase it.
            show_new_segment($("#Heap_Display"),MAX_HEAP_DISPLAY,"H");
        }
    }
    let h = $(signature); //We get the cell
    h.html(value); //We update the value.
}
let alerted_H = false;
let alerted_S = false;
function update_stack(index,value) { //A function to update the heap Graphically.
    let signature = "#S"+index; //We build the ID of the exact cell we'll edit.
    if(index>=MAX_STACK_DISPLAY){
        if(CAP_STACK_DISPLAY){
            if(!alerted_S){
                alert("To keep optimal performance in debugger visualization of any Stack index past "+MAX_STACK_DISPLAY+" is forbidden.");
            } alerted_S = true;
            return;
        }else{ //Alright we haven't capped the display limit this means we could make a new segment twice as big.
            MAX_STACK_DISPLAY = MAX_STACK_DISPLAY*2; //We increase it.
            show_new_segment($("#Stack_Display"),MAX_STACK_DISPLAY,"S");
        }
    }
    let h = $(signature); //We get the cell
    h.html(value); //We update the value.
}
function update_temporal(name,value) {
    let signature = "#T_"+name;
    if(!$(signature).length){ //Doesn't exist, let's add it.
        $("#Temporals_Display").append(new temporal_cell(name, 0));
    }
    let t = $(signature);
    t.html(value);
}
//region begin_3D
function begin_3D(){
    play_3D(true);
}
//endregion
//region next_3D
function next_3D(){
    if(!compiling){
        new_3D_cycle();
    }
    let instruction = instructions[IP]; //We get the next instruction to execute.
    play_instruction(instruction,true); //We play the instruction and show what happened.
    if(IP =='end'){
        compiling = false;
        end_3d();
    }
}
//endregion
//region jump_3D
function jump_3D(){ //Same as next, except we skip proc calls.
    if(!compiling){
        new_3D_cycle();
    }
    let instruction = instructions[IP]; //We get the next instruction to execute.
    if($("#Current_Instruction").text().includes("call")){
        let og_length = INSTRUCTION_STACK.length-1; //I just performed the jump one instruction ago.
        let i = instruction;
        do{
            play_instruction(i,true);
            i = instructions[IP];
        }while (og_length!=INSTRUCTION_STACK.length);
       // if(IP!='end')$("#Current_Instruction").text(IP+") "+instructions[IP].signature); //We display the next instruction.
    }else play_instruction(instruction,true);
    if(IP == 'end'){
        compiling = false;
        end_3d();
    }
}
//endregion
//region next_BP
function next_BP(){
    new_3D_cycle();
    if(breakpoints.length==0){
        continue_3D(); //There's no need to stop since there's no Breakpoints.
    }else{
        while(IP!='end'&&!breakpoints.includes(parseInt(IP))){
            let instruction = instructions[IP];
            play_instruction(instruction,true);
        }
        if(IP=='end'){
            compiling = false;
            end_3d();
        }else{
            let instruction = instructions[IP];
            play_instruction(instruction,true);
        }
    }
}
//endregion
//region continue_3D
function continue_3D(){ //Resumes execution and no longer stops until execution is finished.
    if(!compiling){
        new_3D_cycle();
    }
    while (IP!='end'){
        let instruction = instructions[IP];
        play_instruction(instruction,true);
    }
    compiling = false; //At this point the program has finished execution.
    end_3d();
}
//endregion
//region stop_3D
function stop_3D(){ //Resets execution.
    compiling = false;
    throw new _3D_Exception(null,"Stopped 3D execution.",false);
}
//endregion
//region On document ready.
function initialize_3D(){
    $("#Iniciar_3D").click(begin_3D);
    $("#Siguiente_3D").click(next_3D);
    $("#Saltar_3D").click(jump_3D);
    $("#Siguiente_BP_3D").click(next_BP);
    $("#Continuar_3D").click(continue_3D);
    $("#Detener_3D").click(stop_3D);
    $("#clear_all_breakpoints").click(clear_all_breakpoints);
    $("#Debug_Console").empty(); //We clear the console.
    $("#Current_Instruction").empty();
    current_line = null; //We set current_line back to null
    show_new_segment($("#Stack_Display"),MAX_STACK_DISPLAY,"S"); //We load default segment
    show_new_segment($("#Heap_Display"),MAX_HEAP_DISPLAY,"H"); //We load default segment
    $("#Temporals_Display").empty(); //We clear the temp list
    let code = $("#ThreeD_Source")[0];
    CodeMirror_3D = CodeMirror.fromTextArea(code, {
        lineNumbers : true,
        firstLineNumber: 0,
        styleSelectedText: true
    });
    CodeMirror_3D.on("cursorActivity", onCursorActivity);
    var current_lex = _3D_grammar;
    let current_lexer = current_lex.lexer;
}
$( document ).ready(function() {
    initialize_3D();
});

//endregion