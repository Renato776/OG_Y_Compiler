/*
 * Steps to successfully compile the source code into 3D and outputs
 * the result directly to the Execution & Debugging tabs.
 * The cycle for successfully compiling source code would be:
 * 1.-Parse input to solve directives & imports. (the output is a single file (in this case a hidden div) with
 *   all imports content inside separated by import begin: ###name
 *   end ending with ####END
 * 2.-Parse the output from the first step (again) but this time it is merely to remove
 * a formal class declaration from: class name [extends id] {content}
 * to:
 * &&&ID^ID | &&&ID
 * content
 * &&&&END
 * As you can see the class & extends keywords have been removed the new token specifies all
 * needed information for a successful declaration of a class and
 * the end token successfully closes it. This step also loads the class Array with the respective names and parents (if any)
 * It also outputs errors if:
 * Any instruction is found outside a class declaration. There's two or more classes with the same.
 * The output must be the entry with the class declaration changed as well as the class array filled with all the names
 * of all classes in the program.
 * 3.- Parse the output from step 2 (again) but this time the output is a parse tree.
 * All functions & fields from all classes will co-exist in the same scope as if everything was global.
 * However, the difference is that this time we know where each ID belongs to.
 * The output of this step is a parse tree, it also outputs errors if there's a class that inherits from a non-existent class.
 * (However, the inheritance won't be performed in this step, it is just to prevent erros on next step.
 * 4.- Compile the Symbol Table & fill all classes with all necessary data (fields, methods, CC, ID, etc)
 * The output of this step is the Symbol Table & The finished Class Array. (the Class table must be fully loaded at this point).
 * 5.- Compile the actual output using the same parse tree and the Symbol Table from the previous step.
 * The output of this step is the 3D source code. The source code will be logged to a hidden DIV.
 * This step throws any error that might be encountered during compilation.
 * 6.- Log results to the console & set the SourceCode Mirrors with the output from compilation.
 * 7.- That's all! Next step would be to execute 3D or Optimize it if needed. By deafult the 3D will search for the Main
 * class, if not found will throw an error. You can, however select a class from the class table to use it as the Main method
 * vessel.
 * */
/**
 let aux_token = yy_.yytext;
 aux_token = aux_token.trim();
 if(aux_token!="")location_solver.debug('token',aux_token,yy_.yylloc.first_line-1,yy_.yylloc.first_column);
 **/
let _token_tracker = [];
function _import_exception(message) {
    console.log(message);
}
function _log(message) {
    _current_line = new line(message);
    append_to_main_console();
}
function class_header() {
    let $row = $("<tr>");
    let $location = $("<td>");
    $location.html('File');
    let $name = $("<td>");
    $name.html('Name');
    let $parent = $("<td>");
    $parent.html('Parent');
    $row.append($name);
    $row.append($parent);
    $row.append($location);
    $row.addClass('Class_Header');
    return $row;
}
function select_class(e) {
    let t = $(e.target)[0];
    if(t.localName!='td')return; //If it isn't a td the next instructions won't work!
    t = $(t.parentElement);
    let target = t.attr('id');
    if(selected_class == target){
        selected_class = null;
        $("#"+t.attr('id')).removeClass('Selected_Class');
        return;
    }
    if(selected_class!=null)$("#"+selected_class).removeClass('Selected_Class');
    selected_class = target;
    $("#"+t.attr('id')).addClass('Selected_Class');
}
function _pre_compiling_syntactical_error(){
    let t = _token_tracker.pop();
    if(t == undefined)throw "Fatal ERROR! Somehow managed to throw an exception before any token has been parsed!!";
    let $row = new error_entry('Syntactical',t.row,t.col,"Unexpected symbol: "+t.text,t._class,t.file);
    $("#ErrorTableBody").append($row);
    _log("One or more errors occurred during compilation. See error tab for details.");
}
const _token = function (name,col,row,text, _class = "N/A",format = false, empty = false) {
    if(empty){
        this.name = "empty";
        this.text = "";
        this.col = "0";
        this.row = "0";
        this.file = "program";
        return this;
    }
    this.name = name;
    this.col = col;
    this.row = row;
    this.file = location_solver.peek_size_tracker().name;
    if(format) this.text = digest(text);
    else this.text = text;
    this._class = _class;
};
const location_solver = {
    size_tracker:[],
    imported_text:[],
    column: 0,
    line: 0,
    peek_size_tracker: function () {
        return this.size_tracker[this.size_tracker.length-1];
    },
    peek_imported_text: function(){
        return this.imported_text[this.imported_text.length-1];
    },
    begin_import:function(token,line){
        token = token.trim();
        token = token.substring(3); //We get the name of the file.
        this.imported_text.push([]); //We add a brand new List to the import scope.
        this.size_tracker.push({name:token,location:line});
    },
    end_import: function(line){
        let import_size = line - this.peek_size_tracker().location;
        this.imported_text.pop(); //We dismiss this import's size.
        this.peek_imported_text().push(import_size); //We add the size of the evaluated import to the parent tracker.
        this.size_tracker.pop(); //We dismiss the old import.
    },
    get_previous_imports_size:function(){
        let res = 0;
        this.peek_imported_text().forEach(size=>{
            res += size;
        });
        return res;
    },
    calculate_relative_position:function(position){
        position = position - this.peek_size_tracker().location - this.get_previous_imports_size() - this.peek_imported_text().length*2 -1;
        if(this.size_tracker.length==1)position = position + 1; //True only if I'm importing in main file.
        return position;
    },
    debug:function(name,yytext,yyline,yycolumn){
        this.column = yycolumn;
        this.line = this.calculate_relative_position(yyline);
        _token_tracker.push(new _token(name,this.column,this.line,yytext));
    },
    initialize: function(){
        this.size_tracker.length = 0;
        this.imported_text.length = 0;
        this.column = 0;
        this.line = 0;
        this.imported_text.push([]); //We add a brand new List to the import scope.
        let cf = get_current_file();
        this.size_tracker.push({name:cf.directory+cf.name,location:0});
    }
};
let class_counter = 0;
const _class = function (name,parent = null,location = "Unknown") {
  class_counter++;
  this.name = name;
  this.id = class_counter;
  this.cc = -1;
  this.sub_class = true; //Even the top most classes are children of Object.
  if(parent!=null)this.parent = parent;
  else this.parent = "Object";
  this.location = location;
  this.fields = {},
  this.get_visualization = function(){
    let $row = $("<tr>");
    let $name = $("<td>");
    $name.html(this.name);
    let $location = $("<td>");
    $location.html(this.location);
    let $parent = $("<td>");
    $parent.html(this.parent);
    $row.attr("id",this.name);
    $row.click(select_class);
    $row.append($name);
    $row.append($parent);
    $row.append($location);
    return $row;
  };
};
const error_entry = function (type,line,col,details,_class,file) {
    let $row = $("<tr>");
    let $type = $("<td>");
    let $line = $("<td>");
    let $col = $("<td>");
    let $details = $("<td>");
    let $class = $("<td>");
    let $file = $("<td>");
    $type.html(type);
    $line.html(line);
    $col.html(col);
    $class.html(_class);
    $details.html(details);
    $file.html(file);
    $row.append($type);
    $row.append($details);
    $row.append($line);
    $row.append($col);
    $row.append($class);
    $row.append($file);
    return $row;
};
const _pre_compiling_exception = function(message){
    let t = _token_tracker.pop();
    let $row = new error_entry('Semantic',t.row,t.col,message,'N/A',t.file);
    $("#ErrorTableBody").append($row);
    _log("One or more errors occurred during compilation. See error tab for details.");
    this.semantic = true;
};
function digest(string) { //We scape the characters (if any)
    return string.replace('\\n','\n')
        .replace('\\\\','\\')
        .replace('\\t','\t')
        .replace('\\\"','"')
        .replace('\\\'','\'');
}
const Import_Solver = {
    already_imported: [],
    import_tracker:[],
    initialize: function(){
        _token_tracker = [];
        location_solver.initialize();
        $("#Main_Console").empty(); //We clear the console.
        $("#ErrorTableBody").empty(); //We clear the previous error log.
        $("#Classes_Header").empty(); //We clear the classes header.
        $("#Classes_Body").empty(); //We clear the classes body.
        clear_object(classes); //We clear the class list.
        classes['Object'] = Object_Class; //We load the Default Object class. Here we could also load the String Object.
        class_counter = 0;
        selected_class = null;
        this.already_imported.length = 0;
        this.import_tracker.length = 0;
        let cf = get_current_file();
        this.already_imported.push(cf.directory+cf.name);
        this.import_tracker.push(cf.directory);
    },
    get_parent:function(){
        return this.import_tracker[this.import_tracker.length-1];
    },
    unify_source: function(source){
      try{
        _Import_Grammar.parse(source);
        return $("#Unified_Source").html();
      }  catch (e) {
          return "";
      }
    },
    compile_import_sentence : function (og, target) { //returns string
        target = target.substring(6).trim(); //remove the import word & trim any whitespaces until quotes
        target = target.substring(1); //We remove the first quote
        target = target.substring(0,target.length-1); //We remove the second quote
        target = target.trim(); //Trim again (for removing whitespaces within the quotes if any)
        if(target[0]=='/')target = target.substring(1); //We remove the first slash (if any)
        target = this.get_parent()+target;
        if(!(target in archives)){
            _import_exception("Imported file: "+target+" NOT found. Skipped file.");
            return og;
        }
        if(this.already_imported.includes(target))return og; //Already imported, no need to import it twice.
        this.already_imported.push(target);
        let archive = archives[target]; //We get the actual archive info
        this.import_tracker.push(archive.directory);
        let res = this.unify_source(archive.mirror.getValue());
        this.import_tracker.pop();
        res = og+"\n###"+target+"\n"+res+"####END\n";
        return res;
    }
};
function pre_register_class(class_token, sub_class) {
    class_token = class_token.replace('protected','')
        .replace('public','')
        .replace('private','')
        .trim() //Removed visibility keyword (if any)
        .replace('class','')
        .trim();  //Removed class keyword & trimmed.
    if(sub_class){
        let names = class_token.split('extends');
        let name = names[0].trim();
        let parent = names[1].trim();
        if(name in classes) throw new _pre_compiling_exception("Repeated class: "+name);
        classes[name] = new _class(name,parent,_token_tracker[_token_tracker.length-1].file);
        return "\n&&&"+name+"^"+parent+"\n";
    }else{
        let name = class_token.trim();
        if(name in classes) throw new _pre_compiling_exception("Repeated class: "+name);
        classes[name] = new _class(name,null,_token_tracker[_token_tracker.length-1].file);
        return "\n&&&"+name+"\n";
    }
}
function compile_source() {
    if(current_source_mirror==null)return; //There's nothing to compile in the first place.
    Import_Solver.initialize();
    try{
        _Import_Grammar.parse(current_source_mirror.getValue());
    }catch (e) {
        return;
    }
    let unified_source = $("#Unified_Source").html();
    download("Unified_Source_Test.txt",unified_source);
    try{
        _Aux_Grammar.parse(unified_source);
    }catch (e) {
        if(!("semantic" in e))_pre_compiling_syntactical_error(); //Syntactical error.
        return;
    }
    $("#Classes_Header").append(class_header());
    Object.values(classes).forEach(c=>{
        $("#Classes_Body").append(c.get_visualization());
    });
    _log("Pre-Compilation process finished successfully!");
}
