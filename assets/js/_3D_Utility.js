let current_line = null;
const line = function (message) {
    let row =  $("<tr>");
    let s = $("<td>");
    s.append("&gt;&gt;");
    let m = $("<td>");
    m.append(message);
    row.append(s);
    row.append(m);
    return row;
};
const heap_cell = function (index, value) {
  let cell = $("<tr>");
  let i = $("<td>");
  i.append(index); //We show the index.
  i.addClass("heap_cell_index");
  let v = $("<td>");
  v.attr("id","H"+index);
  v.append(value); //We set the value
  cell.append(i);
  cell.append(v);
  return cell;
};
const stack_cell = function (index, value) {
    let cell = $("<tr>");
    let i = $("<td>");
    i.append(index); //We show the index.
    i.addClass("stack_cell_index");
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
function update_heap(index,value) { //A function to update the heap Graphically.
    let signature = "#H"+index; //We build the ID of the exact cell we'll edit.
    if(!$(signature).length){ //Doesn't exist, let's fill it.
        let indexes = $('.heap_cell_index');
        let last_index_;
        if(indexes.length!=0){
            last_index_ = indexes[indexes.length - 1];
        } else{
            last_index_=$("<td>");
            last_index_.html(0);
        }
        let last_index = last_index_.html(); //We get the index.
        last_index = Number(last_index); //We turn it into a number.
        if(isNaN(last_index))throw "Failed to fetch last row's index.";
        last_index++; //We go to the next cell
        while(last_index<=index) { //We have to fill it with random cells.
            $("#Heap_Display").append(new heap_cell(last_index, 0));
        }
    }
    let h = $(signature); //We get it once again.
    h.html(value);
}
function update_stack(index,value) { //A function to update the heap Graphically.
    let signature = "#S"+index; //We build the ID of the exact cell we'll edit.
    if(!$(signature).length){ //Doesn't exist, let's fill it.
        let indexes = $('.stack_cell_index');
        let last_index_;
        if(indexes.length!=0){
            last_index_ = indexes[indexes.length - 1];
        } else{
            last_index_=$("<td>");
            last_index_.html(0);
        }
        let last_index = last_index_.html(); //We get the index.
        last_index = Number(last_index); //We turn it into a number.
        if(isNaN(last_index))throw "Failed to fetch last row's index. (Stack)";
        last_index++; //We go to the next cell
        while(last_index<=index) { //We have to fill it with random cells.
            $("#Stack_Display").append(new stack_cell(last_index, 0));
        }
    }
    let h = $(signature); //We get it once again.
    h.html(value);
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
    _interpret();
}
//endregion
//region next_3D
function next_3D(){
    log("next_3D");
}
//endregion
//region jump_3D
function jump_3D(){
    log("jump_3D");
}
//endregion
//region next_BP
function next_BP(){
    log("next_BP_3D");
}
//endregion
//region continue_3D
function continue_3D(){
    log("continue_3D");
}
//endregion
//region stop_3D
function stop_3D(){
    log("stop_3D");
}
//endregion
//region Load functions to Buttons.
function initialize_3D(){
    $("#Iniciar_3D").click(begin_3D);
    $("#Siguiente_3D").click(next_3D);
    $("#Saltar_3D").click(jump_3D);
    $("#Siguiente_BP_3D").click(next_BP);
    $("#Continuar_3D").click(continue_3D);
    $("#Detener_3D").click(stop_3D);
    $("#Debug_Console").empty(); //We clear the console.
    $("#Heap_Display").empty(); //We clear the Heap
    $("#Stack_Display").empty(); //We clear the Stack.
    $("#Temporals_Display").empty(); //We clear the temp list
    current_line = null; //We set current_line back to null
}
$( document ).ready(function() {
    initialize_3D();
});

//endregion