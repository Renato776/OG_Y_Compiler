/*
*Don't mind this block. Just Y_Grammar action to perform before the switching of the token is performed.
* let aux_token = yy_.yytext;
aux_token = aux_token.trim();
if(aux_token!="")token_solver.debug(aux_token,yy_.yylloc.first_line-1,yy_.yylloc.first_column);
* */
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
 * &&&ID
 * content
 * &&&&END
 * Compile all static fields FIRST (right after the first program entry has been put in the symbol table,
 * iterate trough all children of program. And compile all static fields. To do this, simply call
 * visit_node in the static field of choice. However, before doing so, provide context that you're
 * compiling static fields. suggested context keyword: static_compilation.
 * This way, when you're within a static method compile normally ONLY if context is right. Otherwise return
 * immediately as the field would've already been compiled.
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
/**
 * Note:
 *All declared Arrays will NO longer be completely unique. If two declared array's have
 * the same dimension and the same true_type, then both will make reference to the same
 * array type. Info regarding the array size will no longer be handled by the compiler itself.
 * Therefore all arrays will only hold information needed to check if they're compatible or not.
 * **/
let _token_tracker = [];
const native_functions = [];
const CHAR_ARRAY = 'array|char';
const INTEGER = 'int';
const DOUBLE = 'double';
const CHAR = 'char';
const STRING = 'String';
const BOOLEAN = 'boolean';
const VOID = 'void';
const NULL = 'null';
let SHOW_LEAF_DETAILS = false;
let class_counter = 0;
const CONSTRUCTOR_PREFIX = '*';
function toBoolean(value) {
    if(typeof value === 'boolean'){
        return value;
    }else if(typeof value === 'string'){
        return value=='true';
    }else if(!isNaN(Number(value))){
        return Number(value)==1;
    }else return false;
}
let field_counter_ = 0;
//region Object constructors used for Compilation.
const _field = function (category,name,visibility,type,owner,index = -1) { //Static fields aren't put here.
    this.category = category;
    this.name = name;
    this.owner = owner;
    this.inherited = false;
    this.visibility = visibility;
    this.type = type;
    this.index = index;
    this.abstract = false;
    this.final = false;
    this.instructions = null;
    this.offset = -1; //It must be filled externally after loading the field.
    if(this.category=='field'){
        this.id = field_counter_;
        field_counter_++;
    }
};
const _class = function (name,parent = null,location = "Unknown") {
    class_counter++;
    this.name = name;
    this.id = class_counter;
    this.cc = -1;
    this.sub_class = true; //Even the top most classes are children of Object.
    if(parent!=null)this.parent = parent;
    else this.parent = "Object";
    this.location = location;
    this.fields = {};
    this.ancestors = [];
    this.abstract = false;
    this.final = false;
    this.get_visualization = get_class_visualization;
};
const _token = function (name,col,row,text, _class = "N/A",format = false, empty = false, unfinished=null) {
    if(unfinished!=null){ //This constructor can only happen after one or more tokens have been successfully compiled.
        this.text = "";
        this.name = "";
        this.col = unfinished.col;
        this.row = unfinished.row;
        this.file = unfinished.file;
        this._class = unfinished._class;
        return this;
    }
    if(empty){
        this.name = "empty";
        this.text = "";
        this.col = "N/A";
        this.row = "N/A";
        this._class = 'N/A';
        this.file = "program";
        return this;
    }
    this.name = name;
    this.col = col;
    this.row = row;
    this.file = location_solver.peek_size_tracker().name;
    if(this.name=='string'||this.name=='char') this.text = digest(text);
    else this.text = text;
    this._class = _class;
};
const _Node = function (name) {
    this.children = [];
    if(typeof name == "string"){ //Normal constructor
        this.name = name;
        this.token = false;
    }else{ //Leaf constructor (name is actually a token!)
        this.token = true;
        this.name = name.name;
        this.col = name.col;
        this.row = name.row;
        this.file = name.file;
        this.text = name.text;
        this._class = name._class;
    }
    this.add = function (node) {
        this.children.push(node);
    };
    this.fuse = function (node) {
        node.children.forEach(n=>{
           this.add(n);
        });
    };
    this.get_token = function () {
        if(this.token)return this;
        if(this.children.length==0)return new _Node(new _token(null,null,null,null,null,null,true));
        return this.children[0].get_token();
    };
    this.advance = function(){
        Compiler.indenting = Compiler.indenting + "****";
    };
    this.back = function(){
        Compiler.indenting = Compiler.indenting.substring(0,Compiler.indenting.length-4);
    };
    this.begin = function(){
        let res = "";
        let $container = '<span class="node_container" style="background-color:';
        let $display = '<span class = "node_display">';
        let color = Compiler.color_stack.pop();
        if(color==undefined)color = getRandomColor();
        Compiler.aux_color_stack.push(color);
        $container+=color+';">';
        $display+=("+" + this.name)+"</span>";
        $container+=$display+"</span>";
        res =  Compiler.indenting + $container;
        this.advance();
        return res;
    };
    this.end = function(){
        let res = "";
        this.back();
        let $container = '<span class="node_container" style="background-color:';
        let $display = '<span class = "node_display">';
        let color = Compiler.aux_color_stack.pop();
        Compiler.color_stack.push(color);
        $container+=color+';">';
        $display+=("-" + this.name)+"</span>";
        $container+=$display+"</span>";
        res =  Compiler.indenting + $container;
        return res;
    };
    this.printTree = function(){
        if (this.token)
        {
            let $container = '<span class="node_container" style="background-color:';
            let $display = '<span class = "node_display">';
            let color = Compiler.color_stack.pop();
            if(color==undefined)color = getRandomColor();
            Compiler.color_stack.push(color);
            $container+=color+';">';
            if(SHOW_LEAF_DETAILS)$display+=(this.name+" :: "+this.text+" ;; row: "+this.row+" col: "+this.col+" class: "+this._class+" file: "+this.file)+"</span>";
            else $display+=this.text+"</span>";
            $container+=$display+"</span>";
            Compiler.ast_visualization += (Compiler.indenting + $container)+"<br>";
        }
        else
        {
            Compiler.ast_visualization += this.begin()+"<br>\n";
            this.children.forEach(child=>{
                if(child!=undefined)child.printTree();
            });
            Compiler.ast_visualization += this.end()+"<br>\n";
        }
    }
};
function toggle_details() {
    SHOW_LEAF_DETAILS = !SHOW_LEAF_DETAILS;
}
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
    let $row;
    if(t!=undefined) $row = new error_entry('Semantic',t.row,t.col,message,'N/A',t.file);
    else $row = new error_entry('Semantic','N/A','N/A',message,'N/A','N/A');
    $("#ErrorTableBody").append($row);
    _log("One or more errors occurred during compilation. See error tab for details.");
    this.semantic = true;
};
const _pre_compiling_lexical_exception = function () {
    let t = _token_tracker[_token_tracker.length-1];
    let $row;
    if(t!=undefined) $row = new error_entry('Lexical',t.row,t.col,'Unrecognized symbol: '+t.text,'N/A',t.file);
    else $row = new error_entry('Semantic','N/A','N/A','Fatal error. Unrecognized symbol with no context: '+t.text,'N/A','N/A');
    $("#ErrorTableBody").append($row);
    _log("One or more errors occurred during compilation. See error tab for details.");

};
const _compiling_exception = function (message,node = null) {
    let t;
    if(node == null) {
        t = _token_tracker.pop();
        if(t==undefined)t = new _token(null,null,null,null,null,null,true);
    }
    else t = node.get_token();
    let $row = new error_entry('Semantic',t.row,t.col,message,t._class,t.file);
    $("#ErrorTableBody").append($row);
    _log("One or more errors occurred during compilation. See error tab for details.");
    this.semantic = true;
    SEMANTIC_ERROR_OCCURRED = true;
};
//endregion
function apply_native_functions() {
    //Fills all native classes with their respective native methods/fields
    native_functions.forEach(native=>{
       classes[native.owner].fields[native.name] = native;
    });
}
function load_native_functions() {
    native_functions.push( new _field('method','equals-Object','public',BOOLEAN,'Object',-1));
    native_functions.push( new _field('method','getClass','public',STRING,'Object',-1));
    native_functions.push( new _field('method','toString','public',STRING,'Object',-1));
    native_functions.push( new _field('method','toCharArray','public',CHAR_ARRAY,'String',-1));
    native_functions.push( new _field('method','length','public',INTEGER,'String',-1));
    native_functions.push( new _field('method','toUpperCase','public','String','String',-1));
    native_functions.push( new _field('method','toLowerCase','public','String','String',-1));
}
function _import_exception(message) {
    _log(message);
}
function _log(message) {
    _current_line = new line(message);
    append_to_main_console();
}
function class_header() {
    let $row = $("<tr>");
    let $location = $("<td>");
    $location.html('File');
    let $cc = $("<td>");
    $cc.html('CC');
    let $id = $("<td>");
    $id.html('ID');
    let $name = $("<td>");
    $name.html('Name');
    let $parent = $("<td>");
    $parent.html('Parent');
    let $abstract = $("<td>");
    let $final = $("<td>");
    $abstract.html('Abstract');
    $final.html('Final');
    let $visibility = $("<td>");
    $visibility.html('visibility');
    $row.append($name);
    $row.append($parent);
    $row.append($visibility);
    $row.append($abstract);
    $row.append($final);
    $row.append($cc);
    $row.append($id);
    $row.append($location);
    $row.addClass('Class_Header');
    return $row;
}
function member_header() {
    //* category; visibility; static; name; type; inherited; abstract; final;
    let $row = $("<tr>");
    let $category = $("<td>");
    $category.html('Category');
    let $visibility = $("<td>");
    $visibility.html('visibility');
    let $static = $("<td>");
    $static.html('static');
    let $name = $("<td>");
    $name.html('Name');
    let $type = $("<td>");
    $type.html('Type');
    let $inherited = $("<td>");
    let $abstract = $("<td>");
    $abstract.html('Abstract');
    $inherited.html('Inherited');
    let $final = $("<td>");
    $final.html('final');
    $row.append($category);
    $row.append($visibility);
    $row.append($static);
    $row.append($name);
    $row.append($type);
    $row.append($inherited);
    $row.append($abstract);
    $row.append($final);
    $row.addClass('Member_Header');
    return $row;
}

function select_entry_point(e) {
    let t = $(e.target)[0];
    if(t.localName!='td')return; //If it isn't a td the next instructions won't work!
    t = $(t.parentElement);
    let target = Number(t.attr('id').substring(2));
    if(target==Code_Generator.entry_point){ //I'm re-selecting the same method. Deselect and return.
        $("#"+"i_"+Code_Generator.entry_point).removeClass('Selected_Class');
        Code_Generator.entry_point = -1;
        return;
    }
    if(Code_Generator.entry_point!=-1)$("#"+"i_"+Code_Generator.entry_point).removeClass('Selected_Class');
    Code_Generator.entry_point=target;
    $("#i_"+target).addClass('Selected_Class');
}
function _pre_compiling_syntactical_error(){
    let t = _token_tracker.pop();
    if(t == undefined)throw "Fatal ERROR! Somehow managed to throw an exception before any token has been parsed!!";
    let $row;
    if(t.text.includes('@')){
        t.text = t.text.replace('@','').trim();
        $row = new error_entry('Syntactical',t.row,t.col,"Unexpected type: "+t.text,t._class,t.file);
    }
    else $row = new error_entry('Syntactical',t.row,t.col,"Unexpected symbol: "+t.text,t._class,t.file);
    $("#ErrorTableBody").append($row);
    _log("One or more errors occurred during compilation. See error tab for details.");
}
const Object_Class = {
    name: 'Object',
    id: 0,
    cc: 1,
    sub_class: false,
    parent: 'N/A',
    location: 'Built-in',
    fields:{},
    ancestors:[],
    abstract:false,
    final:false,
    get_visualization : get_class_visualization
};
const String_Class = new _class('String','Object','Built-in');
String_Class.fields['char_array'] = new _field('field','char_array','protected',CHAR_ARRAY,'String',-1);
String_Class.fields['char_array'].offset = 1;
function get_class_visualization() {
    /*This method returns several rows describing a class.
    * It returns a class header as follows:
    * name; parent; visibility; abstract; final; cc; ID; file; With css class: Class_true_header;
    * Then all the info regarding the class will follow in another tr: css class: Class_header_info;
    * //A tr with colspan=all will follow and will say: members:
    * //A tr will follow containing a header for all members:
    * category; visibility; static; name; type; inherited; abstract; final;
    * Right bellow a series of member rows will follow with a different css class.
    * Fields will appear first.
    * Then all static fields.
    * Then all methods
    * And last all static methods.
    * Only static methods will have the select function.
    * //$row.click(select_class); //Method to select a class will now be replaced by select method.
    *
     */
    member_tracker = []; //We empty the member_tracker for each class.
    current_class = this.name; //We indicate we're graphing this class.
    let rows = [];
    rows.push(class_header()); //First of all, the class true header;
    //Now, the actual info for the class:
    let $row = $("<tr>");
    let $name = $("<td>");
    $name.html(this.name);
    $name.addClass('class_name');
    let $location = $("<td>");
    $location.html(this.location);
    let $parent = $("<td>");
    $parent.html(this.parent);
    let $cc = $("<td>");
    $cc.html(this.cc);
    let $id = $("<td>");
    $id.html(this.id);
    let $abstract = $("<td>");
    let $final = $("<td>");
    let $visibility = $("<td>");
    $visibility.html('public'); //All classes are public either way lol.
    $abstract.html(this.abstract.toString());
    $final.html(this.final.toString());
    $row.attr("id", this.name.toString());
    $row.append($name);
    $row.append($parent);
    $row.append($visibility);
    $row.append($abstract);
    $row.append($final);
    $row.append($cc);
    $row.append($id);
    $row.append($location);
    $row.addClass('class_info');
    rows.push($row); //Push the class's info
    rows.push(member_header()); //push the members header
    //Alright, now build the member's rows:
    Object.values(this.fields).forEach(f=>{
       rows.push(get_member_visualization(new member(
           f.category=='field',f.visibility,false,f.name,f.type,f.inherited,f.abstract,f.final
       )));
    });
    //Alright, those are all non-static members of the class. Now, I gotta get all static members:
    const static_members = [];
    const static_func_signature = this.name+".static.";
    const static_field_signature = this.name+".";
    Compiler.SymbolTable.forEach(entry=>{
        if(entry.name.startsWith(static_func_signature)&&entry.func)static_members.push(entry);
        if(entry.name.startsWith(static_field_signature)&&!entry.func&&!entry.inherited)static_members.push(entry);
    });
    //Alright, now graph all static members:
    static_members.forEach(entry=>{
       let r = get_member_visualization(new member(
           !entry.func,entry.visibility,true,entry.name,entry.type,false,false,entry.final
       ));
       if(entry.func&&!entry.name.includes('-')){ //Is an static parameter-less function.
           let index = Compiler.get_var_index(0,entry.name);
           r.attr('id',"i_"+index.toString());
           r.click(select_entry_point);
       }
        rows.push(r);
    });
    return rows;
}
const member = function (field,visibility,_static,name,type,inherited,abstract,final) {
    if(field)this.category ='field';
    else this.category = 'method';
    this.visibility = visibility;
    this._static = _static.toString();
    if(_static) {
        //If it is an static method. We'll change the signature representation just for this scenario:
        const words = name.split('.');
        this.name = words[words.length-1];
    }
    else this.name = name;
    this.type = type;
    this.inherited = inherited.toString();
    this.abstract = abstract.toString();
    this.final = final.toString();
};
let member_tracker = [];
let current_class = null;
function get_member_visualization(member) {
    if(member_tracker.includes(member.name))throw new _compiling_exception('' +
        'Repeated member: '+member.name+' in class: '+current_class);
    member_tracker.push(member.name); //We register the name in the current class.
    let $row = $("<tr>");
    let $category = $("<td>");
    let $visibility = $("<td>");
    let $static = $("<td>");
    let $name = $("<td>");
    let $type = $("<td>");
    let $inherited = $("<td>");
    let $abstract = $("<td>");
    let $final = $("<td>");
    $category.html(member.category);
    $visibility.html(member.visibility);
    $static.html(member._static);
    $name.html(member.name);
    $type.html(member.type);
    $inherited.html(member.inherited);
    $abstract.html(member.abstract);
    $final.html(member.final);
    $row.append($category);
    $row.append($visibility);
    $row.append($static);
    $row.append($name);
    $row.append($type);
    $row.append($inherited);
    $row.append($abstract);
    $row.append($final);
    $row.addClass('member_entry');
    return $row;
}
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

function digest(string) { //We scape the characters (if any)
    let res =  string.replace(/\\n/gm,'\n');
    res = res.replace(/\\\\/gm,'\\');
    res = res.replace(/\\t/gm,'\t');
    res =  res.replace(/\\"/gm,'"');
    res = res.replace(/\\'/gm,'\'');
    res = res.replace(/@([a-zA-Z]|_)+[0-9]*/gm,replace_class_token_in_string);
    res = res.substring(1,res.length-1);
    return res;
}
const Import_Solver = {
    already_imported: [],
    import_tracker:[],
    Unified_Source : '',
    initialize: function(){
        this.Unified_Source = '';
        abstractMethods = [];
        field_counter_ = 1; //We're starting a new cycle.
        _token_tracker = [];
        location_solver.initialize();
        $("#Main_Console").empty(); //We clear the console.
        $("#ErrorTableBody").empty(); //We clear the previous error log.
        $("#Classes_Body").empty();
        $("#Classes_Header").empty();
        clear_object(classes); //We clear the class list.
        classes['Object'] = Object_Class; //We add default Object class.
        classes['String'] = String_Class; //We add default String class.
        apply_native_functions(); //We load default fields/methods for the primitive classes.
        Compiler.initialize();
        class_counter = 1;
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
        return this.Unified_Source;
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
    let abstract = false;
    let final = false;
    if(Compiler.abstract_regex.test(class_token))abstract = true;
    if(Compiler.final_regex.test(class_token))final = true;
    let name;
    let result;
    let result_signature;
    if(sub_class){
        let parent = Compiler.extract_parent(class_token);
        name = Compiler.extract_class(class_token);
        if(name in classes) throw new _pre_compiling_exception("Repeated class: "+name);
        result = new _class(name,parent,_token_tracker[_token_tracker.length-1].file);
        result_signature= "&&&"+name;
    }else{
        name = Compiler.extract_class(class_token);
        if(name in classes) throw new _pre_compiling_exception("Repeated class: "+name);
        result = new _class(name,null,_token_tracker[_token_tracker.length-1].file);
        result_signature =  "&&&"+name;
    }
    if(abstract&&final)throw new _pre_compiling_exception("Cannot declare a class abstract and final at the same time." +
        "Class: "+name);
    result.abstract = abstract;
    result.final = final;
    classes[name] = result;
    return result_signature;
}
const token_solver = {
    size_tracker:[],
    imported_text:[],
    class_tracker:[],
    imported_classes:[],
    column: 0,
    line: 0,
    peek_imported_classes:function(){
        return this.imported_classes[this.imported_classes.length-1];
    },
    peek_size_tracker: function () {
        return this.size_tracker[this.size_tracker.length-1];
    },
    peek_imported_text: function(){
        return this.imported_text[this.imported_text.length-1];
    },
    peek_class_tracker:function(){
        if(this.class_tracker.length==0)return 'Built-in';
        return this.class_tracker[this.class_tracker.length-1];
    },
    begin_import:function(token,line){
        token = token.trim();
        token = token.substring(3); //We get the name of the file.
        token = token.replace(new RegExp('@','gm'),'');// We remove any @ that might appear as a result of preparing all types.
        this.imported_text.push([]); //We add a brand new List to the import scope.
        this.size_tracker.push({name:token,location:line});
        this.imported_classes.push(-1); //We indicate we're staring a new file.
    },
    end_import: function(line){
        let import_size = line - this.peek_size_tracker().location;
        this.imported_text.pop(); //We dismiss this import's size.
        this.peek_imported_text().push(import_size); //We add the size of the evaluated import to the parent tracker.
        this.size_tracker.pop(); //We dismiss the old import.
        this.imported_classes.pop(); //We'll no longer use the info.
    },
    get_previous_imports_size:function(){
        let res = 0;
        this.peek_imported_text().forEach(size=>{
            res += size;
        });
        return res;
    },
    begin_class:function(token){
        token = token.replace(new RegExp('&','gm'),'').replace('@','').trim(); //We remove the Ampersands and the @
        this.class_tracker.push(token); //We push the name of the class
        let c = this.imported_classes.pop();
        if(c==undefined)c = -1; //Could be undefined if I haven't made any imports yet.
        c = c + 1;
        this.imported_classes.push(c);
    },
    end_class:function(){
      this.class_tracker.pop();
    },
    calculate_relative_position:function(position){
        //Custom indicates if calculating the position with an extra custom offset.
        position = position - this.peek_size_tracker().location - this.get_previous_imports_size() - this.peek_imported_text().length*2 -1 - this.peek_imported_classes()*2;
        if(this.size_tracker.length==1)position = position + 1; //True only if I'm importing in main file.
        return position;
    },
    debug:function(yytext,yyline,yycolumn){
        this.column = yycolumn;
        this.line = this.calculate_relative_position(yyline);
        _token_tracker.push(new _token('token',this.column,this.line,yytext,this.peek_class_tracker()));
    },
    build_token:function (name,text,line,col) {
        this.column = col;
        //this.line = this.calculate_relative_position(line,true); alright re-calculating the line wasn't working so
        //we'll try copying the line from the last token that matches. This approach might lead to
        //wrong info regarding the line. But well, it's not that bad even if the line no. isn't totally correct.
        let true_class;
        let i = _token_tracker.length-1;
        let true_file;
        while(i>=0){
            if(text==_token_tracker[i].text){
                true_class = _token_tracker[i]._class;
                line = _token_tracker[i].row;
                true_file = classes[true_class].location;
                break;
            }
            i--;
        }
        let r = new _token(name,this.column,line,text,true_class);
        r.file = true_file;
        return r;
    },
    initialize:function () {
        this.line = 0;
        this.column = 0;
        this.class_tracker = [];
        this.imported_text = [];
        this.size_tracker = [];
        this.imported_classes = [];
        _token_tracker = [];
        this.imported_text.push([]); //We add a brand new List to the import scope.
        let cf = get_current_file();
        this.size_tracker.push({name:cf.directory+cf.name,location:0});
    }
};
function graph_all_classes() {
    $("#Classes_Header").empty();
    Object.values(classes).forEach(c=>{
        const rows = c.get_visualization();
        rows.forEach(row=>{
            $("#Classes_Body").append(row);
        });
    });
}
function prepare_all_classes() {
    //0) Verify all parents from all classes exist.
    _token_tracker = [];
    Object.values(classes).forEach(c=>{
        if(!(c.parent in classes)&&c.name!='Object') throw new _pre_compiling_exception('Parent class :'+c.parent+" from class: "+c.name+" " +
            "Does NOT exist. Compilation failed.");
    });
    /*
    * This function prepares all classes for them to be ready when SymbolTable compilation starts.
    * By preparing all classes I mean: Give all classes an appropriate CC. Also, giving all classes
    * a list of ancestors. Object has an empty list and the rest must have at least Object as an ancestor in the list.
    * Also at this point all references to parent are valid references. References to non-existent parents have
    * been alerted and removed at this point.
    * */
    //1) Fill the ancestor list for every class.
    let cs = sorting.mergeSort(Object.values(classes),compare_classes_by_id);
    for(let i = 1; i< cs.length;i++){ //We start at 1 to skip Object class.
        let c = cs[i];
        if(c.ancestors.length==0){
            let parent = classes[c.parent];
            while(parent.sub_class){
                c.ancestors.push(parent);
                parent = classes[parent.parent];
            }
            c.ancestors.push(classes['Object']); //Object is always an ancestor and always goes at the end.
        } //Else we do nothing, this could happen if we're re-compiling a constant class. Like the String built-in class.
    }
    //2) Order the classes by descendant depth (Object goes first at 0, superior classes goes second at 1 first children second at 2 and so on.
    let ordered = sorting.mergeSort(Object.values(classes),compare_classes_by_level);
    let isFirst = true;
    let nextPrime = 2;
    ordered.forEach(c=>{
        if(!isFirst){
            if(c.ancestors.length==1){ //Only one ancestor: The Object class.
                nextPrime = getNextPrime(nextPrime);
                c.cc = nextPrime;
            }else{ //Two or more ancestors:
                if(classes[c.parent].final)throw new _pre_compiling_exception('Class: '+c.name+" Cannot extend class: "+c.parent+" " +"Because :"+c.parent+" is final.");
                c.cc = classes[c.parent].cc*2;
            }
        }else isFirst = false;
    });
}
function replace_class_token(match){
    let begin = match[0];
    let end = match[match.length-1];
    let name = match.substring(1,match.length-1);
    return begin+"@"+name+end;
}
function replace_class_token_in_string(match){
    return match.substring(1); //we remove the @ at the begining.
}
function prepare_all_types(source) {
    /*
    * This method replaces all types & classes within the source code by
    * the @name.
    * */
    let classRegex;
    Object.keys(Compiler.types).forEach(t=>{
        classRegex =  new RegExp('[^a-zA-Z_@]'+t+'[^a-zA-Z_0-9]','gm');
        source = source.replace(classRegex,replace_class_token);
    });
    Object.keys(Compiler.classes).forEach(c=>{
        classRegex =  new RegExp('[^a-zA-Z_@]'+c+'[^a-zA-Z_0-9]','gm');
        source = source.replace(classRegex,replace_class_token);
      });
    return source;
}
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
let abstractMethods = [];
function search_abstract_method(index) {
    for (let i = 0; i<abstractMethods.length; i++){
        if(abstractMethods[i].index==index)return abstractMethods[i];
    }
}
function copy_field(field) { //returns a copy of the field.
    let r =  new _field(field.category,field.name,field.visibility,field.type,field.owner,field.index);
    r.id = field.id; //We copy the id since it is an inherited field.
    return r;
}
function perform_inheritance() {
    /*
    * This method performs inheritance on all classes.
    * It also fills the abstract method list of the CodeGenerator for their further compilation.
    * */
    const cl = sorting.mergeSort(Object.values(Compiler.classes),compare_classes_by_level);
    let i = 1;
    while(i<cl.length){ //We start at 1 to skip the Object class.
        let _class = cl[i]; //target class to perform inheritance on.
        let parent = Compiler.classes[_class.parent]; //We get the immediate parent
        Object.values(parent.fields).forEach(field=>{
            let am;
            let overridden = false;
            if(field.abstract){
                am = search_abstract_method(field.index);
                if(am==undefined){ //It has not been registered yet, let's register it:
                   am = new AbstractMethod(field.index,[]);
                   abstractMethods.push(am);
                   Compiler.scope_tracker.splice( Compiler.scope_tracker.indexOf(field.index), 1 );
                }
            }
            if(field.name in _class.fields){ //True if we overrode a method/field
                if(field.abstract){//The overrode we did was of an abstract method.
                    am.implementations.push(new Implementation(_class.id,_class.fields[field.name].index));
                    overridden = true;
                }
            }else if(field.visibility!='private'){ //Alright, is a normal field from parent. We must inherit if not private:
                let inherited_field = copy_field(field);
                inherited_field.inherited = true;
                inherited_field.offset = Compiler.count_fields(_class.name)+1;
                inherited_field.instructions = field.instructions;
                inherited_field.final = field.final;
                _class.fields[field.name] = inherited_field;
            }
            if(field.abstract&&!overridden)throw new _compiling_exception('Class: '+_class.name+" " +
                "Does not override abstract method: "+field.name+" Please, override method before proceeding.");
        });
        i++;
    }
}
function compile_source() {
    if(current_source_mirror==null)return; //There's nothing to compile in the first place.
    SEMANTIC_ERROR_OCCURRED = false;
    Import_Solver.initialize();
    try{
        _Import_Grammar.parse(current_source_mirror.getValue());
    }catch (e) {
        return;
    }
    let unified_source = Import_Solver.Unified_Source;
    try{
        _Aux_Grammar.parse(unified_source);
    }catch (e) {
        if(!("semantic" in e))_pre_compiling_syntactical_error(); //Syntactical error.
        return;
    }
    try{
        prepare_all_classes();
    }
    catch (e) {
        return;
    }
    Compiler.initialize();
    token_solver.initialize();
    let pre_compiled_source = Import_Solver.Unified_Source;
    pre_compiled_source = prepare_all_types(pre_compiled_source);
    try {
        _Y_Grammar.parse(pre_compiled_source);
    }catch (e) {
       if(!("semantic" in e)){
           _pre_compiling_syntactical_error();
       }
       return;
    }
    Import_Solver.Unified_Source = ''; //We empty the String as it is no longer of use.
    Compiler.build_nodeStructure(); //aka graph AST
    Compiler.build_symbolTable(); //Compile & graph Symbol Table.
    perform_inheritance(); //perform inheritance on all classes.
    try{
        graph_all_classes(); //Graph all classes.
    }catch (e) {
        return;
    }
    Compiler.scope_tracker = Compiler.scope_tracker.reverse(); //We reverse it so it can be ready for the CodeGenerator
    Compiler.sub_block_tracker = Compiler.sub_block_tracker.reverse(); //We reverse it so it can be ready for the Code Generator
    $("#Compilar_Main").unbind();
    $("#Compilar_Main").click(generate_code); //Advance process to the next part.
    $("#Compilar_Main").html('Finish compilation');
}
function generate_code() {
    if(Code_Generator.entry_point==-1){
        /*
        const valid_entry_point_details = 'For an static method to be valid as starting point' +
            ' it only needs to take no parameters.';
         */
        let main_class = Compiler.classes['Main'];
        if(main_class==undefined){
            _log('NO Main class found. Either: Create a Main class or select a valid static method as ' +
                'starting point in the folders & classes tab.');
            return;
        }
        Code_Generator.entry_point = Compiler.get_var_index(0,'Main.static.main');
        if(Code_Generator.entry_point==-1){
            _log('NO main method found. Either: Create a Main class or select a valid static method as ' +
                'starting point in the folders & classes tab.');
            return;
        }
    }
    Code_Generator.initialize();
    try{
        Code_Generator.compile_abstract_methods(); //Next we output 3D for all abstract methods.
        Code_Generator.compile_native_constructors(); //Next we output 3D for all default constructors.
        Code_Generator.compile_utility_functions();//Next we output 3D for all utility functions used in 3D.
        Code_Generator.generate_code(); //And finally we output the rest of 3D.
        reset_compilation_cycle();
        Printing.publish();
    }catch (e) {
        console.log(e);
    } //Do nothing and wait for the next try.
}
function reset_compilation_cycle() {
    $("#Compilar_Main").unbind();
    $("#Compilar_Main").click(compile_source);
    $("#Compilar_Main").html('Compile');
}