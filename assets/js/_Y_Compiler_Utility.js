const mirrors = [];
const tabs = [];
const folders = {};
const archives = {};
let current_source_tab = null;
let current_folder = null;
let current_class = null;
let current_source_mirror = null;
let loading_file_name = null;
function create_file() {
    let file_name = $("#file_name").val();
    add_source_tab("", file_name);
}
function select_folder(folder) {
    let selected_folder = folder.target;
    selected_folder = $(selected_folder);
    selected_folder = selected_folder.html();
    if(current_folder!=null){
        folders[current_folder].attr("style","background-color:white; color:auto; font-weight:auto;");
        if(current_folder==selected_folder){
            current_folder = null;
            return;
        }
    }
    current_folder = selected_folder;
    folders[current_folder].attr("style","background-color:#220080; color:white; font-weight; font-weight:bold;");
}
function addFolder() {
    let folder_name = $("#folder_name").val();
    folder_name = folder_name.trim();
    if(folder_name=="")return;
    let parent;
    if(current_folder == null)parent = "";
    else parent = current_folder;
    folder_name = parent+"/"+folder_name;
    if(folder_name in folders)return;
    $folder = $("<div>",{"class":"row","id":folder_name,"style":"background-color:white;"});
    $folder.append(folder_name);
    $folder.click(select_folder);
    $("#folderContainer").append($folder);
    folders[folder_name] = $folder;
}
function getFile(event) {
    const input = event.target;
    if ('files' in input && input.files.length > 0) {
        loading_file_name = input.files[0].name;
        placeFileContent(input.files[0]);
    }
}

function placeFileContent(file) {
    readFileContent(file).then(content => {
        add_source_tab(content,loading_file_name);
    }).catch(error => console.log(error))
}

function readFileContent(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
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
function add_source_tab(source, fileName) {
    /*
    *Every source tab textArea container has ID= ST+tabNo.
    * The textArea itself has ID = Area+tabNo.
    *source is the source text to open the tab with.
    * This method creates a new tab, and replaces the textArea in there by a code mirror.
    * It also hides any previous tab (if any) And loads the click function to it.
    * */
    let directory;
    if(current_folder==null)directory = "/";
    else directory = current_folder+"/";
    let file_name = directory+fileName;
    if(file_name in archives)return; //Already exists another file with same name and same directory.
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
    $tabTitle.append(file_name);
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
    let l = file_name.split('/');
    l = l[l.length-1];
    archives[file_name] = {mirror:mirror,directory:directory,tab:current_source_tab,name:l};
    tabs[tabs.length] = "ST"+tabs.length;
}
function get_current_file() {
    let values = Object.values(archives);
    for(let i = 0; i<values.length; i++){
        if(values[i].tab==current_source_tab)return values[i];
    }
    return null;
}
function save_file() {
    if(current_source_mirror == null)return;
    else {
        let cf = get_current_file();
        download(cf.name,current_source_mirror.getValue());
    }
}
function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}