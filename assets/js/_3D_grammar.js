/* parser generated by jison 0.4.18 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var _3D_grammar = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,8],$V1=[1,9],$V2=[1,26],$V3=[1,25],$V4=[1,27],$V5=[1,29],$V6=[1,28],$V7=[1,30],$V8=[1,31],$V9=[1,32],$Va=[1,36],$Vb=[1,35],$Vc=[1,33],$Vd=[1,34],$Ve=[6,11,13,14,31,39,41,47,48,49,50,55,56,57,60],$Vf=[1,47],$Vg=[1,48],$Vh=[1,52],$Vi=[1,51],$Vj=[1,50],$Vk=[1,53],$Vl=[1,54],$Vm=[11,14,31,39,41,47,48,49,50,55,56,57,60],$Vn=[6,11,13,14,31,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,54,55,56,57,60],$Vo=[6,11,13,14,31,39,40,41,42,43,44,45,46,47,48,49,50,54,55,56,57,60],$Vp=[2,61],$Vq=[2,62],$Vr=[6,11,13,14,31,34,35,36,37,38,39,41,47,48,49,50,55,56,57,60];
var parser = {trace: function trace () { },
yy: {},
symbols_: {"error":2,"s":3,"inicio":4,"InstrL":5,"EOF":6,"Instr":7,"labelList":8,"stmt":9,"procDef":10,"LABEL":11,"DOSPUNTOS":12,"PROC":13,"ID":14,"LEFT_BRACE":15,"varDecl":16,"assignment":17,"standard":18,"ifStmt":19,"ifFalseStmt":20,"goto":21,"call":22,"ret":23,"print":24,"setHeap":25,"getHeap":26,"setStack":27,"getStack":28,"exit":29,"write":30,"VAR":31,"ASIGNACION":32,"value":33,"SUM":34,"MINUS":35,"MULTIPLY":36,"DIVIDE":37,"MOD":38,"IF":39,"MAYORQ":40,"GOTO":41,"MENORQ":42,"MAYORIGUAL":43,"MENORIGUAL":44,"IGUAL":45,"DISTINTO":46,"IF_FALSE":47,"CALL":48,"RIGHT_BRACE":49,"PRINT":50,"LEFT_PAREN":51,"FORMAT":52,"COMMA":53,"RIGHT_PAREN":54,"WRITE_FILE":55,"EXIT":56,"HEAP":57,"LEFT_BRACKET":58,"RIGHT_BRACKET":59,"STACK":60,"ENTERO":61,"FLOAT":62,"NUM":63,"BETA_NUM":64,"$accept":0,"$end":1},
terminals_: {2:"error",6:"EOF",11:"LABEL",12:"DOSPUNTOS",13:"PROC",14:"ID",15:"LEFT_BRACE",31:"VAR",32:"ASIGNACION",34:"SUM",35:"MINUS",36:"MULTIPLY",37:"DIVIDE",38:"MOD",39:"IF",40:"MAYORQ",41:"GOTO",42:"MENORQ",43:"MAYORIGUAL",44:"MENORIGUAL",45:"IGUAL",46:"DISTINTO",47:"IF_FALSE",48:"CALL",49:"RIGHT_BRACE",50:"PRINT",51:"LEFT_PAREN",52:"FORMAT",53:"COMMA",54:"RIGHT_PAREN",55:"WRITE_FILE",56:"EXIT",57:"HEAP",58:"LEFT_BRACKET",59:"RIGHT_BRACKET",60:"STACK",62:"FLOAT",63:"NUM",64:"BETA_NUM"},
productions_: [0,[3,1],[4,2],[5,2],[5,1],[7,2],[7,2],[7,1],[8,3],[8,2],[10,3],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[16,4],[17,3],[18,5],[18,5],[18,5],[18,5],[18,5],[19,6],[19,6],[19,6],[19,6],[19,6],[19,6],[20,6],[20,6],[20,6],[20,6],[20,6],[20,6],[21,2],[22,2],[23,1],[24,6],[30,4],[29,4],[25,6],[27,6],[26,6],[28,6],[33,1],[33,2],[33,1],[33,2],[33,1],[33,2],[33,1],[33,1],[61,1],[61,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
console.log('3D input parsed successfully!');
break;
case 3:

	  instructions[$$[$0].token.row] = $$[$0];
	  
break;
case 4:

	 instructions[$$[$0].token.row] = $$[$0]; //Register Instruction in the Instruction List.
	 
break;
case 5:

     $$[$0-1].forEach(label=>{
     labels[label.text] = $$[$0].token.row; //We register the labels.
     });
     this.$ = $$[$0];
     
break;
case 6:

    labels[$$[$0-1].text] = $$[$0].token.row; //We register the proc
    this.$ = $$[$0];
    
break;
case 7:
 this.$ = $$[$0]; 
break;
case 8:

    $$[$0-2].push(new _3D_Token($$[$0-1],_$[$0-1].first_line,_$[$0-1].first_column));
    this.$ = $$[$0-2];
    
break;
case 9:

    this.$ = [new _3D_Token($$[$0-1],_$[$0-1].first_line,_$[$0-1].first_column)];
    
break;
case 10:

    function_names.push($$[$0-1]);
    this.$ = new _3D_Token($$[$0-1],_$[$0-1].first_line,_$[$0-1].first_column);
    
break;
case 11: case 12: case 13: case 14: case 15: case 16: case 17: case 18: case 19: case 20: case 21: case 22: case 23: case 24: case 25:
this.$ = $$[$0];
break;
case 26: case 27:

    if(!($$[$0-2] in temporals)){
        temporals[$$[$0-2]] = 0; //We register the temporal if is the first time we get it.
    }
    this.$ = new Instruction("assignation",$$[$0],$$[$0-2],$$[$0]);

break;
case 28:

        if(!($$[$0-4] in temporals)){
            temporals[$$[$0-4]] = 0; //We register the temporal if is the first time we get it.
        }
        this.$ = new Instruction("standard",$$[$0-2],$$[$0-2],$$[$0],'+',$$[$0-4]); //name,token,a,b,op,c
        
break;
case 29:

        if(!($$[$0-4] in temporals)){
            temporals[$$[$0-4]] = 0; //We register the temporal if is the first time we get it.
        }
        this.$ = new Instruction("standard",$$[$0-2],$$[$0-2],$$[$0],'-',$$[$0-4]); //name,token,a,b,op,c
        
break;
case 30:

        if(!($$[$0-4] in temporals)){
            temporals[$$[$0-4]] = 0; //We register the temporal if is the first time we get it.
        }
        this.$ = new Instruction("standard",$$[$0-2],$$[$0-2],$$[$0],'*',$$[$0-4]); //name,token,a,b,op,c
        
break;
case 31:

        if(!($$[$0-4] in temporals)){
            temporals[$$[$0-4]] = 0; //We register the temporal if is the first time we get it.
        }
        this.$ = new Instruction("standard",$$[$0-2],$$[$0-2],$$[$0],'/',$$[$0-4]); //name,token,a,b,op,c
        
break;
case 32:

        if(!($$[$0-4] in temporals)){
            temporals[$$[$0-4]] = 0; //We register the temporal if is the first time we get it.
        }
        this.$ = new Instruction("standard",$$[$0-2],$$[$0-2],$$[$0],'%',$$[$0-4]); //name,token,a,b,op,c where c is text not a token
        
break;
case 33: case 42:

        this.$ = new Instruction("if",$$[$0-4],$$[$0-4],$$[$0-2],'>',$$[$0]);
        
break;
case 34: case 41:

        this.$ = new Instruction("if",$$[$0-4],$$[$0-4],$$[$0-2],'<',$$[$0]);
        
break;
case 35: case 40:

        this.$ = new Instruction("if",$$[$0-4],$$[$0-4],$$[$0-2],'>=',$$[$0]);
        
break;
case 36: case 39:

        this.$ = new Instruction("if",$$[$0-4],$$[$0-4],$$[$0-2],'<=',$$[$0]);
        
break;
case 37: case 43:

        this.$ = new Instruction("if",$$[$0-4],$$[$0-4],$$[$0-2],'==',$$[$0]);
        
break;
case 38: case 44:

        this.$ = new Instruction("if",$$[$0-4],$$[$0-4],$$[$0-2],'!=',$$[$0]);
        
break;
case 45:

        this.$ = new Instruction("goto",new _3D_Token($$[$0],_$[$0].first_line,_$[$0].first_column),$$[$0]);
        
break;
case 46:

      this.$ = new Instruction("call",new _3D_Token($$[$0],_$[$0].first_line,_$[$0].first_column),$$[$0]);
      
break;
case 47:

      this.$ = new Instruction("ret",new _3D_Token(function_names.pop(),_$[$0].first_line,_$[$0].first_column));
      
break;
case 48:

       this.$ = new Instruction("print",$$[$0-1],$$[$0-3],$$[$0-1]); //Print(name,token,format,value)
       
break;
case 49:

       this.$ = new Instruction("write",$$[$0-1],$$[$0-1]); //Print(name,token,format,value)
       
break;
case 50:

       this.$ = new Instruction("exit",$$[$0-1],$$[$0-1]); //Print(name,token,format,value)
       
break;
case 51:

        this.$ = new Instruction("SET_HEAP",$$[$0],$$[$0-3],$$[$0]);
        
break;
case 52:

        this.$ = new Instruction("SET_STACK",$$[$0],$$[$0-3],$$[$0]);
        
break;
case 53:

        this.$ = new Instruction("GET_HEAP",new _3D_Token($$[$0-5],_$[$0-5].first_line,_$[$0-5].first_column),$$[$0-5],$$[$0-1]);
        
break;
case 54:

        this.$ = new Instruction("GET_STACK",new _3D_Token($$[$0-5],_$[$0-5].first_line,_$[$0-5].first_column),$$[$0-5],$$[$0-1]);
        
break;
case 55: case 59:
this.$ = new _3D_Token($$[$0],_$[$0].first_line,_$[$0].first_column,false);
break;
case 56: case 60:
this.$ = new _3D_Token($$[$0],_$[$0-1].first_line,_$[$0-1].first_column,true);
break;
case 57:
this.$ = $$[$0]; 
break;
case 58:
$$[$0].negative = true; this.$ = $$[$0]; 
break;
case 61: case 62:
this.$ = new _3D_Token($$[$0],_$[$0].first_line,_$[$0].first_column);
break;
case 63:
 this.$ = new _3D_Token($$[$0],_$[$0].first_line,_$[$0].first_column); 
break;
case 64:
 this.$ = new _3D_Token($$[$0].substring(0,$$[$0].length-2),_$[$0].first_line,_$[$0].first_column); 
break;
}
},
table: [{3:1,4:2,5:3,7:4,8:5,9:7,10:6,11:$V0,13:$V1,14:$V2,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,24:18,25:19,26:20,27:21,28:22,29:23,30:24,31:$V3,39:$V4,41:$V5,47:$V6,48:$V7,49:$V8,50:$V9,55:$Va,56:$Vb,57:$Vc,60:$Vd},{1:[3]},{1:[2,1]},{6:[1,37],7:38,8:5,9:7,10:6,11:$V0,13:$V1,14:$V2,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,24:18,25:19,26:20,27:21,28:22,29:23,30:24,31:$V3,39:$V4,41:$V5,47:$V6,48:$V7,49:$V8,50:$V9,55:$Va,56:$Vb,57:$Vc,60:$Vd},o($Ve,[2,4]),{9:39,11:[1,40],14:$V2,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,24:18,25:19,26:20,27:21,28:22,29:23,30:24,31:$V3,39:$V4,41:$V5,47:$V6,48:$V7,49:$V8,50:$V9,55:$Va,56:$Vb,57:$Vc,60:$Vd},{9:41,14:$V2,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,24:18,25:19,26:20,27:21,28:22,29:23,30:24,31:$V3,39:$V4,41:$V5,47:$V6,48:$V7,49:$V8,50:$V9,55:$Va,56:$Vb,57:$Vc,60:$Vd},o($Ve,[2,7]),{12:[1,42]},{14:[1,43]},o($Ve,[2,11]),o($Ve,[2,12]),o($Ve,[2,13]),o($Ve,[2,14]),o($Ve,[2,15]),o($Ve,[2,16]),o($Ve,[2,17]),o($Ve,[2,18]),o($Ve,[2,19]),o($Ve,[2,20]),o($Ve,[2,21]),o($Ve,[2,22]),o($Ve,[2,23]),o($Ve,[2,24]),o($Ve,[2,25]),{14:[1,44]},{32:[1,45]},{14:$Vf,33:46,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:55,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{11:[1,56]},{14:[1,57]},o($Ve,[2,47]),{51:[1,58]},{58:[1,59]},{58:[1,60]},{51:[1,61]},{51:[1,62]},{1:[2,2]},o($Ve,[2,3]),o($Ve,[2,5]),{12:[1,63]},o($Ve,[2,6]),o($Vm,[2,9]),{15:[1,64]},{32:[1,65]},{14:$Vf,33:66,35:$Vg,57:[1,67],60:[1,68],61:49,62:$Vj,63:$Vk,64:$Vl},{40:[1,69],42:[1,70],43:[1,71],44:[1,72],45:[1,73],46:[1,74]},o($Vn,[2,55]),{14:[1,75],61:76,62:[1,77],63:$Vk,64:$Vl},o($Vn,[2,57]),o($Vn,[2,59]),o($Vo,$Vp),o($Vo,$Vq),o($Vn,[2,63]),o($Vn,[2,64]),{40:[1,78],42:[1,79],43:[1,80],44:[1,81],45:[1,82],46:[1,83]},o($Ve,[2,45]),o($Ve,[2,46]),{52:[1,84]},{14:[1,85]},{14:[1,86]},{14:$Vf,33:87,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:88,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},o($Vm,[2,8]),o([14,31,39,41,47,48,49,50,55,56,57,60],[2,10]),{14:$Vf,33:89,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},o($Ve,[2,27],{34:[1,90],35:[1,91],36:[1,92],37:[1,93],38:[1,94]}),o($Vr,$Vq,{58:[1,95]}),o($Vr,$Vp,{58:[1,96]}),{14:$Vf,33:97,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:98,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:99,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:100,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:101,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:102,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},o($Vn,[2,56]),o($Vn,[2,58]),o($Vn,[2,60]),{14:$Vf,33:103,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:104,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:105,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:106,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:107,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:108,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{53:[1,109]},{59:[1,110]},{59:[1,111]},{54:[1,112]},{54:[1,113]},o($Ve,[2,26]),{14:$Vf,33:114,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:115,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:116,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:117,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:118,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:[1,119]},{14:[1,120]},{41:[1,121]},{41:[1,122]},{41:[1,123]},{41:[1,124]},{41:[1,125]},{41:[1,126]},{41:[1,127]},{41:[1,128]},{41:[1,129]},{41:[1,130]},{41:[1,131]},{41:[1,132]},{14:$Vf,33:133,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{32:[1,134]},{32:[1,135]},o($Ve,[2,50]),o($Ve,[2,49]),o($Ve,[2,28]),o($Ve,[2,29]),o($Ve,[2,30]),o($Ve,[2,31]),o($Ve,[2,32]),{59:[1,136]},{59:[1,137]},{11:[1,138]},{11:[1,139]},{11:[1,140]},{11:[1,141]},{11:[1,142]},{11:[1,143]},{11:[1,144]},{11:[1,145]},{11:[1,146]},{11:[1,147]},{11:[1,148]},{11:[1,149]},{54:[1,150]},{14:$Vf,33:151,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},{14:$Vf,33:152,35:$Vg,57:$Vh,60:$Vi,61:49,62:$Vj,63:$Vk,64:$Vl},o($Ve,[2,53]),o($Ve,[2,54]),o($Ve,[2,33]),o($Ve,[2,34]),o($Ve,[2,35]),o($Ve,[2,36]),o($Ve,[2,37]),o($Ve,[2,38]),o($Ve,[2,39]),o($Ve,[2,40]),o($Ve,[2,41]),o($Ve,[2,42]),o($Ve,[2,43]),o($Ve,[2,44]),o($Ve,[2,48]),o($Ve,[2,51]),o($Ve,[2,52])],
defaultActions: {2:[2,1],37:[2,2]},
parseError: function parseError (str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        var error = new Error(str);
        error.hash = hash;
        throw error;
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        var lex = function () {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        };
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function(match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex () {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin (condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState () {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules () {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState (n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState (condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {"case-insensitive":true},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
register_token(yy_.yytext,yy_.yylloc.first_line-1,yy_.yylloc.first_column);
switch($avoiding_name_collisions) {
case 0:CAP_HEAP = false; 
break;
case 1:CAP_HEAP_DISPLAY = false;
break;
case 2:CAP_STACK_DISPLAY = false;
break;
case 3:CAP_INSTRUCTION_EXECUTION = false;
break;
case 4:MAX_HEAP = Number(yy_.yytext.substring(9).trim());
break;
case 5:MAX_HEAP_DISPLAY = Number(yy_.yytext.substring(17).trim());
break;
case 6:MAX_STACK_DISPLAY = Number(yy_.yytext.substring(18).trim());
break;
case 7:INSTRUCTION_MAX = Number(yy_.yytext.substring(16).trim());
break;
case 8:MAX_CACHE = Number(yy_.yytext.substring(10).trim());
break;
case 9:ACCURACY = Number(yy_.yytext.substring(9).trim());
break;
case 10:SHOW_ALL_DETAILS = false;
break;
case 11:FORCE_ENTRY_PROC=yy_.yytext.substring(17).trim();
break;
case 12:FORCE_ENTRY_POINT=yy_.yytext.substring(17).trim();
break;
case 13:/*ignore*/
break;
case 14:return 13;
break;
case 15:return 15;
break;
case 16:return 49;
break;
case 17:return 51;
break;
case 18:return 54;
break;
case 19:return 60;
break;
case 20:return 57;
break;
case 21:return 58;
break;
case 22:return 59;
break;
case 23:return 44;
break;
case 24:return 43;
break;
case 25:return 42;
break;
case 26:return 40;
break;
case 27:return 34;
break;
case 28:return 35;
break;
case 29:return 36;
break;
case 30:return 37;
break;
case 31:return 38;
break;
case 32:return 46;
break;
case 33:return 45;
break;
case 34:return 32;
break;
case 35:return 39;
break;
case 36:return 47;
break;
case 37:return 41;
break;
case 38:return 12;
break;
case 39:return 31;
break;
case 40:return 48;
break;
case 41:return 50;
break;
case 42:return 56;
break;
case 43:return 55
break;
case 44:return 53;
break;
case 45:
break;
case 46:
break;
case 47:return 64;
break;
case 48:return 62;
break;
case 49:return 63;
break;
case 50:return 11;
break;
case 51:return 14;
break;
case 52:return 52;
break;
case 53:return 6;
break;
default: new _3D_Exception(new _3D_Token(yy_.yytext,yy_.yylloc.first_line-1,yy_.yylloc.first_column)," Unrecognized symbol: "+yy_.yytext,true,'Lexical');
    break;
}
},
rules: [/^(?:#UNCAP_HEAP\b)/i,/^(?:#UNCAP_HEAP_DISPLAY\b)/i,/^(?:#UNCAP_STACK_DISPLAY\b)/i,/^(?:#UNCAP_INSTRUCTION_EXECUTION\b)/i,/^(?:#MAX_HEAP[ \r\t]+[0-9]+)/i,/^(?:#MAX_HEAP_DISPLAY[ \r\t]+[0-9]+)/i,/^(?:#MAX_STACK_DISPLAY[ \r\t]+[0-9]+)/i,/^(?:#MAX_INSTRUCTION[ \r\t]+[0-9]+)/i,/^(?:#MAX_CACHE[ \r\t]+[0-9]+)/i,/^(?:#ACCURACY[ \r\t]+[0-9]+)/i,/^(?:#HIDE_NATIVES\b)/i,/^(?:#FORCE_ENTRY_PROC[ \r\t]+([a-zA-Z]|_)+[0-9]*)/i,/^(?:#FORCE_ENTRY_POINT[ \r\t]+[0-9]+)/i,/^(?:;.*)/i,/^(?:proc\b)/i,/^(?:\{)/i,/^(?:\})/i,/^(?:\()/i,/^(?:\))/i,/^(?:stack\b)/i,/^(?:heap\b)/i,/^(?:\[)/i,/^(?:\])/i,/^(?:<=)/i,/^(?:>=)/i,/^(?:<)/i,/^(?:>)/i,/^(?:\+)/i,/^(?:-)/i,/^(?:\*)/i,/^(?:\/)/i,/^(?:%)/i,/^(?:!=)/i,/^(?:==)/i,/^(?:=)/i,/^(?:if\b)/i,/^(?:ifFalse\b)/i,/^(?:goto\b)/i,/^(?::)/i,/^(?:var\b)/i,/^(?:call\b)/i,/^(?:print\b)/i,/^(?:exit\b)/i,/^(?:write_file\b)/i,/^(?:,)/i,/^(?:[ \r\t]+)/i,/^(?:\n)/i,/^(?:[0-9]+(\.0)\b)/i,/^(?:[0-9]+(\.[0-9]+)\b)/i,/^(?:[0-9]+\b)/i,/^(?:(L)[0-9]+)/i,/^(?:([a-zA-Z]|_)+[0-9]*\b)/i,/^(?:('%d')|('%e')|('%c'))/i,/^(?:$)/i,/^(?:.)/i],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = _3D_grammar;
exports.Parser = _3D_grammar.Parser;
exports.parse = function () { return _3D_grammar.parse.apply(_3D_grammar, arguments); };
exports.main = function commonjsMain (args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}