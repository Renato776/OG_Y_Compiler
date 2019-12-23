//region begin_3D
function begin_3D(){
    console.log("begin_3D");
}
//endregion
//region next_3D
function next_3D(){
    console.log("next_3D");
}
//endregion
//region jump_3D
function jump_3D(){

    console.log("jump_3D");
}
//endregion
//region next_BP
function next_BP(){

    console.log("next_BP_3D");
}
//endregion
//region continue_3D
function continue_3D(){

    console.log("continue_3D");
}
//endregion
//region stop_3D
function stop_3D(){

    console.log("stop_3D");
}
//endregion
//region Load functions to Buttons.
$( document ).ready(function() {
    $("#Iniciar_3D").click(begin_3D);
    $("#Siguiente_3D").click(next_3D);
    $("#Saltar_3D").click(jump_3D);
    $("#Siguiente_BP_3D").click(next_BP);
    $("#Continuar_3D").click(continue_3D);
    $("#Detener_3D").click(stop_3D);
});

//endregion