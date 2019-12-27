const mirrors = [];
const tabs = [];
const folders = [];
const archives = [];
let current_source_tab = null;
let current_folder = null;
let current_class = null;
let current_source_mirror = null;
let loading_file_name = null;
function getFile(event) {
    const input = event.target
    if ('files' in input && input.files.length > 0) {
        loading_file_name = input.files[0].name;
        placeFileContent(input.files[0]);
    }
}

function placeFileContent(file) {
    readFileContent(file).then(content => {
        add_source_tab(content);
    }).catch(error => console.log(error))
}

function readFileContent(file) {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result)
        reader.onerror = error => reject(error)
        reader.readAsText(file)
    })
}

function switch_source_tab(tab) {
    let t = tab.target;
    let a = $(t);
    let target = a.attr("RValue");
    $("#"+tabs[current_source_tab]).addClass('Debug_Container_Hide');
    $("#"+tabs[target]).removeClass('Debug_Container_Hide');
    current_source_tab = Number(target);
    current_source_mirror = mirrors[current_source_tab];
}
function add_source_tab(source) {
    /*
    *Every source tab textArea container has ID= ST+tabNo.
    * The textArea itself has ID = Area+tabNo.
    *source is the source text to open the tab with.
    * This method creates a new tab, and replaces the textArea in there by a code mirror.
    * It also hides any previous tab (if any) And loads the click function to it.
    * */
    if(current_source_tab!=null){
        $("#"+tabs[current_source_tab]).addClass('Debug_Container_Hide');
    }
    let titleStyle = "border: double; border-block-color:blue; width: auto;height: auto;background-color: #43e4ff;color: rgb(0,0,0);margin: auto;padding-left: 2.5em;padding-right: 2.5em; margin-bottom:0.5em;";
    $textAreaContainer = $("<div>",{"id":"ST"+tabs.length});
    $mirrorVessel = $("<textarea>",{"id":"Area"+tabs.length});
    $textAreaContainer.append($mirrorVessel);
    $("#Source_TextAreas").append($textAreaContainer);
    $tabTitle = $("<button>",{
        "class":"btn btn-danger tabTitle",
        "id":"TT"+tabs.length,
        "style":titleStyle,
        "RValue": ""+tabs.length,
        "type": "button"
    });
    $tabTitle.append(loading_file_name);
    $tabTitle.click(switch_source_tab);
    $("#Tab_titles").append($tabTitle);
    let mirror = CodeMirror.fromTextArea($("#"+"Area"+tabs.length)[0], {
        lineNumbers : true,
        firstLineNumber: 0,
        styleSelectedText: true
    });
    mirror.setValue(source);
    mirrors[tabs.length] = mirror;
    current_source_mirror = mirror;
    current_source_tab = tabs.length;
    tabs[tabs.length] = "ST"+tabs.length;
}