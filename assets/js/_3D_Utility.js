const line = function (message) {
    let row =  $("<tr>");
    let s = $("<td>");
    s.append("&gt;&gt;");
    let m = $("<td>");
    let pre = $("<pre>");
    pre.append(message);
    m.append(pre);
    m.attr("style","width: 100%; " +
        "text-align: left;");
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
                alert("To keep optimal performance in debugger, visualization of any Heap index past "+MAX_HEAP_DISPLAY+" is forbidden.");
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
                alert("To keep optimal performance in debugger, visualization of any Stack index past "+MAX_STACK_DISPLAY+" is forbidden.");
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
function begin_execution(){
    if(!$("#Recover_Container").hasClass('Debug_Container_Hide'))$("#Recover_Container").addClass('Debug_Container_Hide'); //We hide the continue option if visible.
    play_3D(false);
}
//endregion
//region next_3D
function next_3D(){
    if(!compiling)if(new_3D_cycle())return;
    let instruction = instructions[IP]; //We get the next instruction to execute.
    play_instruction(instruction,true); //We play the instruction and show what happened.
}
//endregion
//region jump_3D
function jump_3D(){ //Same as next, except we skip proc calls.
    if(!compiling)if(new_3D_cycle())return;
    let instruction = instructions[IP]; //We get the next instruction to execute.
    if($("#Current_Instruction").text().includes("call")){
        let og_length = INSTRUCTION_STACK.length-1; //I just performed the jump one instruction ago.
        while (play_instruction(instruction,true)&&(og_length!=INSTRUCTION_STACK.length)){
            instruction = instructions[IP];
        }
    }else play_instruction(instruction,true);
}
//endregion
//region next_BP
function next_BP(){
    if(!compiling)if(new_3D_cycle())return;
    let instruction;
    do{
        instruction =  instructions[IP];
    }while (play_instruction(instruction,true)&&!breakpoints.includes(parseInt(IP)));
}
//endregion
//region continue_3D
function continue_3D(){ //Resumes execution and no longer stops until execution is finished.
    if(!compiling)if(new_3D_cycle())return;
    let instruction;
    do {
        instruction = instructions[IP];
    }while (play_instruction(instruction,true));
}
//endregion
//region recover_execution
function recover_execution(){ //Resumes execution and no longer stops until execution is finished.
    //if(!compiling)if(new_3D_cycle())return; NO need to start a new cycle as this option is only shown when there's a current cycle going on.
    let instruction;
    do {
        instruction = instructions[IP];
    }while (play_instruction(instruction,false));
}
//endregion
//region stop_3D
function stop_3D(){ //Resets execution.
    compiling = false;
    new _3D_Exception(null,"Stopped 3D execution.",false);
}
//endregion
function resolve_directive(directive) {
    /*This function receives the text from the parser, digests it and sets the directive it makes reference
    * to. It also performs some extra checks: numbers aren't negative, cuts decimals if any, etc.*/
    let directive_regex = /#[a-zA-Z_]+/;
    let num_regex = /[0-9]+/;
    let id_regex = /[a-zA-Z_]+/gm;
    let directive_name = directive.match(directive_regex)[0];
    let param;
    switch (directive_name) {
        case '#MAX_HEAP':
            param = directive.match(num_regex)[0];
            if(param==null)throw "Invalid directive parameter. Expected: num. got: "+directive;
            param = Number(param);
            if(param<=0) throw  "Invalid parameter for max heap. Cannot use negative numbers. Got: "+param;
            MAX_HEAP = param;
            break;
        case '#MAX_HEAP_DISPLAY':
            param = directive.match(num_regex)[0];
            if(param==null)throw "Invalid directive parameter. Expected: num. got: "+directive;
            param = Number(param);
            if(param<=0) throw  "Invalid parameter for max heap display. Cannot use negative numbers. Got: "+param;
            MAX_HEAP_DISPLAY = param;
            break;
        case '#MAX_STACK_DISPLAY':
            param = directive.match(num_regex)[0];
            if(param==null)throw "Invalid directive parameter. Expected: num. got: "+directive;
            param = Number(param);
            if(param<=0) throw  "Invalid parameter for max stack display. Cannot use negative numbers. Got: "+param;
            MAX_STACK_DISPLAY = param;
            break;
        case '#MAX_CACHE':
            param = directive.match(num_regex)[0];
            if(param==null)throw "Invalid directive parameter. Expected: num. got: "+directive;
            param = Number(param);
            if(param<=0) throw  "Invalid parameter for max cache. Cannot use negative numbers. Got: "+param;
            MAX_CACHE = param;
            break;
        case '#FORCE_ENTRY_PROC':
            param = directive.match(id_regex)[1];
            if(param==null||param==undefined)throw "Invalid directive parameter. Expected: id. got: "+directive;
            FORCE_ENTRY_PROC = param;
            break;
        case '#FORCE_ENTRY_POINT':
            param = directive.match(num_regex)[0];
            if(param==null)throw "Invalid directive parameter. Expected: num. got: "+directive;
            FORCE_ENTRY_POINT = param;
            break;
        case '#MAX_INSTRUCTION':
            param = directive.match(num_regex)[0];
            if(param==null)throw "Invalid directive parameter. Expected: num. got: "+directive;
            param = Number(param);
            if(param<=0) throw  "Invalid parameter for max instruction execution. Cannot use negative numbers. Got: "+param;
            INSTRUCTION_MAX = param;
            break;
        case '#ACCURACY':
            param = directive.match(num_regex)[0];
            if(param==null)throw "Invalid directive parameter. Expected: num. got: "+directive;
            param = Number(param);
            if(param<=0||param % 10 != 0) throw  "Invalid parameter for accuracy directive. Accuracy cannot be negative and must be a multiple of 10." +
            "Invalid parameter: "+param;
            ACCURACY = param;
            break;
        default:
            log('Unrecognized directive: '+directive_name+' will be ignored.');
    }
}
function showHelp(){
    window.open('Y_Compiler Manual.pdf');
}
function toggle_breakpoint_sensibility() {
    BREAKPOINT_SENSITIVE = !BREAKPOINT_SENSITIVE; //we toggle the breakpoint sensibility option.
}
//region On document ready.
function initialize(){
    load_native_functions();
    $("#Iniciar_3D").click(begin_3D);
    $("#Siguiente_3D").click(next_3D);
    $("#Saltar_3D").click(jump_3D);
    $("#Siguiente_BP_3D").click(next_BP);
    $("#Continuar_3D").click(continue_3D);
    $("#Detener_3D").click(stop_3D);
    $("#Iniciar").click(begin_execution);
    $("#Recover").click(recover_execution);
    $("#clear_all_breakpoints").click(clear_all_breakpoints);
    $("#Main_Console").empty();
    $("#Current_Instruction").empty();
    $("#ErrorTableBody").empty();
    $("#SYMBOL_TABLE_BODY").empty();
    $("#Classes_Body").empty();
    $("#Classes_Header").empty();
    $("#SYMBOL_TABLE_HEADER").empty();
    $("#OPTIMIZACION_BODY").empty();
    $("#OPTIMIZACION_HEADER").empty();
    $("#Ejecutar_console").val('');
    $("#Debug_console").val('');
    show_new_segment($("#Stack_Display"),MAX_STACK_DISPLAY,"S"); //We load default segment
    show_new_segment($("#Heap_Display"),MAX_HEAP_DISPLAY,"H"); //We load default segment
    $("#Temporals_Display").empty(); //We clear the temp list
    current_tab = $("#MAIN");
    $("#Depurar_Button").click(show_tab);
    $("#Compilar_Button").click(show_tab);
    $("#Ejecutar_Button").click(show_tab);
    $("#Errores_Button").click(show_tab);
    $("#DepurarTitle").click(toggle_breakpoint_sensibility);
    $("#TablaDeSimbolos_Button").click(show_tab);
    $("#AST_Button").click(show_tab);
    $("#Optimizacion_Button").click(show_tab);
    $("#Folders_Classes_Button").click(show_tab);
    $("#create_folder_button").click(addFolder);
    $("#create_file_button").click(create_file);
    $("#Guardar_Button").click(save_file);
    $("#Compilar_Main").click(compile_source);
    $("#Optimization_button").click(Optimize);
    $("#AST_Title").click(toggle_details);
    $("#Compile_Title").click(reset_compilation_cycle);
    $("#Help_Button").click(showHelp);
    document.getElementById('input-file')
        .addEventListener('change', getFile);
}
$( document ).ready(function() {
    initialize();
});

//endregion