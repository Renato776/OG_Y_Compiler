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
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,8],$V1=[1,9],$V2=[1,24],$V3=[1,23],$V4=[1,25],$V5=[1,27],$V6=[1,26],$V7=[1,28],$V8=[1,29],$V9=[1,30],$Va=[1,31],$Vb=[1,32],$Vc=[6,11,13,14,29,37,39,45,46,47,48,53,56],$Vd=[1,43],$Ve=[1,44],$Vf=[1,48],$Vg=[1,47],$Vh=[1,46],$Vi=[1,49],$Vj=[1,50],$Vk=[11,14,29,37,39,45,46,47,48,53,56],$Vl=[6,11,13,14,29,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,52,53,56],$Vm=[6,11,13,14,29,37,38,39,40,41,42,43,44,45,46,47,48,52,53,56],$Vn=[2,57],$Vo=[2,58],$Vp=[6,11,13,14,29,32,33,34,35,36,37,39,45,46,47,48,53,56];
var parser = {trace: function trace () { },
yy: {},
symbols_: {"error":2,"s":3,"inicio":4,"InstrL":5,"EOF":6,"Instr":7,"labelList":8,"stmt":9,"procDef":10,"LABEL":11,"DOSPUNTOS":12,"PROC":13,"ID":14,"LEFT_BRACE":15,"varDecl":16,"assignment":17,"standard":18,"ifStmt":19,"ifFalseStmt":20,"goto":21,"call":22,"ret":23,"print":24,"setHeap":25,"getHeap":26,"setStack":27,"getStack":28,"VAR":29,"ASIGNACION":30,"value":31,"SUM":32,"MINUS":33,"MULTIPLY":34,"DIVIDE":35,"MOD":36,"IF":37,"MAYORQ":38,"GOTO":39,"MENORQ":40,"MAYORIGUAL":41,"MENORIGUAL":42,"IGUAL":43,"DISTINTO":44,"IF_FALSE":45,"CALL":46,"RIGHT_BRACE":47,"PRINT":48,"LEFT_PAREN":49,"FORMAT":50,"COMMA":51,"RIGHT_PAREN":52,"HEAP":53,"LEFT_BRACKET":54,"RIGHT_BRACKET":55,"STACK":56,"ENTERO":57,"FLOAT":58,"NUM":59,"BETA_NUM":60,"$accept":0,"$end":1},
terminals_: {2:"error",6:"EOF",11:"LABEL",12:"DOSPUNTOS",13:"PROC",14:"ID",15:"LEFT_BRACE",29:"VAR",30:"ASIGNACION",32:"SUM",33:"MINUS",34:"MULTIPLY",35:"DIVIDE",36:"MOD",37:"IF",38:"MAYORQ",39:"GOTO",40:"MENORQ",41:"MAYORIGUAL",42:"MENORIGUAL",43:"IGUAL",44:"DISTINTO",45:"IF_FALSE",46:"CALL",47:"RIGHT_BRACE",48:"PRINT",49:"LEFT_PAREN",50:"FORMAT",51:"COMMA",52:"RIGHT_PAREN",53:"HEAP",54:"LEFT_BRACKET",55:"RIGHT_BRACKET",56:"STACK",58:"FLOAT",59:"NUM",60:"BETA_NUM"},
productions_: [0,[3,1],[4,2],[5,2],[5,1],[7,2],[7,2],[7,1],[8,3],[8,2],[10,3],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[16,4],[17,3],[18,5],[18,5],[18,5],[18,5],[18,5],[19,6],[19,6],[19,6],[19,6],[19,6],[19,6],[20,6],[20,6],[20,6],[20,6],[20,6],[20,6],[21,2],[22,2],[23,1],[24,6],[25,6],[27,6],[26,6],[28,6],[31,1],[31,2],[31,1],[31,2],[31,1],[31,2],[31,1],[31,1],[57,1],[57,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
console.log('3D input parsed successfully!');
break;
case 3:

	  instructions[$$[$0].token.row-1] = $$[$0];
	  
break;
case 4:

	 instructions[$$[$0].token.row-1] = $$[$0]; //Register Instruction in the Instruction List.
	 
break;
case 5:

     $$[$0-1].forEach(label=>{
     labels[label.text] = $$[$0].token.row-1; //We register the labels.
     });
     this.$ = $$[$0];
     
break;
case 6:

    labels[$$[$0-1].text] = $$[$0].token.row-1; //We register the proc
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
case 11: case 12: case 13: case 14: case 15: case 16: case 17: case 18: case 19: case 20: case 21: case 22: case 23:
this.$ = $$[$0];
break;
case 24: case 25:

    if(!($$[$0-2] in temporals)){
        temporals[$$[$0-2]] = 0; //We register the temporal if is the first time we get it.
    }
    this.$ = new Instruction("assignation",$$[$0],$$[$0-2],$$[$0]);

break;
case 26:

        if(!($$[$0-4] in temporals)){
            temporals[$$[$0-4]] = 0; //We register the temporal if is the first time we get it.
        }
        this.$ = new Instruction("standard",$$[$0-2],$$[$0-2],$$[$0],'+',$$[$0-4]); //name,token,a,b,op,c
        
break;
case 27:

        if(!($$[$0-4] in temporals)){
            temporals[$$[$0-4]] = 0; //We register the temporal if is the first time we get it.
        }
        this.$ = new Instruction("standard",$$[$0-2],$$[$0-2],$$[$0],'-',$$[$0-4]); //name,token,a,b,op,c
        
break;
case 28:

        if(!($$[$0-4] in temporals)){
            temporals[$$[$0-4]] = 0; //We register the temporal if is the first time we get it.
        }
        this.$ = new Instruction("standard",$$[$0-2],$$[$0-2],$$[$0],'*',$$[$0-4]); //name,token,a,b,op,c
        
break;
case 29:

        if(!($$[$0-4] in temporals)){
            temporals[$$[$0-4]] = 0; //We register the temporal if is the first time we get it.
        }
        this.$ = new Instruction("standard",$$[$0-2],$$[$0-2],$$[$0],'/',$$[$0-4]); //name,token,a,b,op,c
        
break;
case 30:

        if(!($$[$0-4] in temporals)){
            temporals[$$[$0-4]] = 0; //We register the temporal if is the first time we get it.
        }
        this.$ = new Instruction("standard",$$[$0-2],$$[$0-2],$$[$0],'%',$$[$0-4]); //name,token,a,b,op,c where c is text not a token
        
break;
case 31: case 40:

        this.$ = new Instruction("if",$$[$0-4],$$[$0-4],$$[$0-2],'>',$$[$0]);
        
break;
case 32: case 39:

        this.$ = new Instruction("if",$$[$0-4],$$[$0-4],$$[$0-2],'<',$$[$0]);
        
break;
case 33: case 38:

        this.$ = new Instruction("if",$$[$0-4],$$[$0-4],$$[$0-2],'>=',$$[$0]);
        
break;
case 34: case 37:

        this.$ = new Instruction("if",$$[$0-4],$$[$0-4],$$[$0-2],'<=',$$[$0]);
        
break;
case 35: case 41:

        this.$ = new Instruction("if",$$[$0-4],$$[$0-4],$$[$0-2],'==',$$[$0]);
        
break;
case 36: case 42:

        this.$ = new Instruction("if",$$[$0-4],$$[$0-4],$$[$0-2],'!=',$$[$0]);
        
break;
case 43:

        this.$ = new Instruction("goto",new _3D_Token($$[$0],_$[$0].first_line,_$[$0].first_column),$$[$0]);
        
break;
case 44:

      this.$ = new Instruction("call",new _3D_Token($$[$0],_$[$0].first_line,_$[$0].first_column),$$[$0]);
      
break;
case 45:

      this.$ = new Instruction("ret",new _3D_Token(function_names.pop(),_$[$0].first_line,_$[$0].first_column));
      
break;
case 46:

       this.$ = new Instruction("print",$$[$0-1],$$[$0-3],$$[$0-1]); //Print(name,token,format,value)
       
break;
case 47:

        this.$ = new Instruction("SET_HEAP",$$[$0],$$[$0-3],$$[$0]);
        
break;
case 48:

        this.$ = new Instruction("SET_STACK",$$[$0],$$[$0-3],$$[$0]);
        
break;
case 49:

        this.$ = new Instruction("GET_HEAP",new _3D_Token($$[$0-5],_$[$0-5].first_line,_$[$0-5].first_column),$$[$0-5],$$[$0-1]);
        
break;
case 50:

        this.$ = new Instruction("GET_STACK",new _3D_Token($$[$0-5],_$[$0-5].first_line,_$[$0-5].first_column),$$[$0-5],$$[$0-1]);
        
break;
case 51: case 55:
this.$ = new _3D_Token($$[$0],_$[$0].first_line,_$[$0].first_column,false);
break;
case 52: case 56:
this.$ = new _3D_Token($$[$0],_$[$0-1].first_line,_$[$0-1].first_column,true);
break;
case 53:
this.$ = $$[$0]; 
break;
case 54:
$$[$0].negative = true; this.$ = $$[$0]; 
break;
case 57: case 58:
this.$ = new _3D_Token($$[$0],_$[$0].first_line,_$[$0].first_column);
break;
case 59:
 this.$ = new _3D_Token($$[$0],_$[$0].first_line,_$[$0].first_column); 
break;
case 60:
 this.$ = new _3D_Token($$[$0].substring(0,$$[$0].length-2),_$[$0].first_line,_$[$0].first_column); 
break;
}
},
table: [{3:1,4:2,5:3,7:4,8:5,9:7,10:6,11:$V0,13:$V1,14:$V2,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,24:18,25:19,26:20,27:21,28:22,29:$V3,37:$V4,39:$V5,45:$V6,46:$V7,47:$V8,48:$V9,53:$Va,56:$Vb},{1:[3]},{1:[2,1]},{6:[1,33],7:34,8:5,9:7,10:6,11:$V0,13:$V1,14:$V2,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,24:18,25:19,26:20,27:21,28:22,29:$V3,37:$V4,39:$V5,45:$V6,46:$V7,47:$V8,48:$V9,53:$Va,56:$Vb},o($Vc,[2,4]),{9:35,11:[1,36],14:$V2,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,24:18,25:19,26:20,27:21,28:22,29:$V3,37:$V4,39:$V5,45:$V6,46:$V7,47:$V8,48:$V9,53:$Va,56:$Vb},{9:37,14:$V2,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,24:18,25:19,26:20,27:21,28:22,29:$V3,37:$V4,39:$V5,45:$V6,46:$V7,47:$V8,48:$V9,53:$Va,56:$Vb},o($Vc,[2,7]),{12:[1,38]},{14:[1,39]},o($Vc,[2,11]),o($Vc,[2,12]),o($Vc,[2,13]),o($Vc,[2,14]),o($Vc,[2,15]),o($Vc,[2,16]),o($Vc,[2,17]),o($Vc,[2,18]),o($Vc,[2,19]),o($Vc,[2,20]),o($Vc,[2,21]),o($Vc,[2,22]),o($Vc,[2,23]),{14:[1,40]},{30:[1,41]},{14:$Vd,31:42,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:$Vd,31:51,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{11:[1,52]},{14:[1,53]},o($Vc,[2,45]),{49:[1,54]},{54:[1,55]},{54:[1,56]},{1:[2,2]},o($Vc,[2,3]),o($Vc,[2,5]),{12:[1,57]},o($Vc,[2,6]),o($Vk,[2,9]),{15:[1,58]},{30:[1,59]},{14:$Vd,31:60,33:$Ve,53:[1,61],56:[1,62],57:45,58:$Vh,59:$Vi,60:$Vj},{38:[1,63],40:[1,64],41:[1,65],42:[1,66],43:[1,67],44:[1,68]},o($Vl,[2,51]),{14:[1,69],57:70,58:[1,71],59:$Vi,60:$Vj},o($Vl,[2,53]),o($Vl,[2,55]),o($Vm,$Vn),o($Vm,$Vo),o($Vl,[2,59]),o($Vl,[2,60]),{38:[1,72],40:[1,73],41:[1,74],42:[1,75],43:[1,76],44:[1,77]},o($Vc,[2,43]),o($Vc,[2,44]),{50:[1,78]},{14:[1,79]},{14:[1,80]},o($Vk,[2,8]),o([14,29,37,39,45,46,47,48,53,56],[2,10]),{14:$Vd,31:81,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},o($Vc,[2,25],{32:[1,82],33:[1,83],34:[1,84],35:[1,85],36:[1,86]}),o($Vp,$Vo,{54:[1,87]}),o($Vp,$Vn,{54:[1,88]}),{14:$Vd,31:89,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:$Vd,31:90,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:$Vd,31:91,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:$Vd,31:92,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:$Vd,31:93,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:$Vd,31:94,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},o($Vl,[2,52]),o($Vl,[2,54]),o($Vl,[2,56]),{14:$Vd,31:95,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:$Vd,31:96,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:$Vd,31:97,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:$Vd,31:98,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:$Vd,31:99,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:$Vd,31:100,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{51:[1,101]},{55:[1,102]},{55:[1,103]},o($Vc,[2,24]),{14:$Vd,31:104,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:$Vd,31:105,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:$Vd,31:106,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:$Vd,31:107,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:$Vd,31:108,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:[1,109]},{14:[1,110]},{39:[1,111]},{39:[1,112]},{39:[1,113]},{39:[1,114]},{39:[1,115]},{39:[1,116]},{39:[1,117]},{39:[1,118]},{39:[1,119]},{39:[1,120]},{39:[1,121]},{39:[1,122]},{14:$Vd,31:123,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{30:[1,124]},{30:[1,125]},o($Vc,[2,26]),o($Vc,[2,27]),o($Vc,[2,28]),o($Vc,[2,29]),o($Vc,[2,30]),{55:[1,126]},{55:[1,127]},{11:[1,128]},{11:[1,129]},{11:[1,130]},{11:[1,131]},{11:[1,132]},{11:[1,133]},{11:[1,134]},{11:[1,135]},{11:[1,136]},{11:[1,137]},{11:[1,138]},{11:[1,139]},{52:[1,140]},{14:$Vd,31:141,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},{14:$Vd,31:142,33:$Ve,53:$Vf,56:$Vg,57:45,58:$Vh,59:$Vi,60:$Vj},o($Vc,[2,49]),o($Vc,[2,50]),o($Vc,[2,31]),o($Vc,[2,32]),o($Vc,[2,33]),o($Vc,[2,34]),o($Vc,[2,35]),o($Vc,[2,36]),o($Vc,[2,37]),o($Vc,[2,38]),o($Vc,[2,39]),o($Vc,[2,40]),o($Vc,[2,41]),o($Vc,[2,42]),o($Vc,[2,46]),o($Vc,[2,47]),o($Vc,[2,48])],
defaultActions: {2:[2,1],33:[2,2]},
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
case 0:/*ignore*/
break;
case 1:return 13;
break;
case 2:return 15;
break;
case 3:return 47;
break;
case 4:return 49;
break;
case 5:return 52;
break;
case 6: return 56;
break;
case 7:return 53;
break;
case 8:return 54;
break;
case 9:return 55;
break;
case 10:return 42;
break;
case 11:return 41;
break;
case 12:return 40;
break;
case 13:return 38;
break;
case 14:return 32;
break;
case 15:return 33;
break;
case 16:return 34;
break;
case 17:return 35;
break;
case 18:return 36;
break;
case 19:return 44;
break;
case 20:return 43;
break;
case 21:return 30;
break;
case 22:return 37;
break;
case 23:return 45;
break;
case 24:return 39;
break;
case 25:return 12;
break;
case 26:return 29;
break;
case 27:return 46;
break;
case 28:return 48;
break;
case 29:return 51;
break;
case 30:
break;
case 31:
break;
case 32:return 60;
break;
case 33:return 59;
break;
case 34:return 58;
break;
case 35:return 11;
break;
case 36:return 14;
break;
case 37:return 50;
break;
case 38:return 6;
break;
case 39:
default: new _3D_Exception(new _3D_Token(yy_.yytext,yy_.yylloc.first_line-1,yy_.yylloc.first_column)," Unrecognized symbol: "+yy_.yytext,true,'Lexical');
}
},
rules: [/^(?:;.*)/i,/^(?:proc\b)/i,/^(?:\{)/i,/^(?:\})/i,/^(?:\()/i,/^(?:\))/i,/^(?:stack\b)/i,/^(?:heap\b)/i,/^(?:\[)/i,/^(?:\])/i,/^(?:<=)/i,/^(?:>=)/i,/^(?:<)/i,/^(?:>)/i,/^(?:\+)/i,/^(?:-)/i,/^(?:\*)/i,/^(?:\/)/i,/^(?:%)/i,/^(?:!=)/i,/^(?:==)/i,/^(?:=)/i,/^(?:if\b)/i,/^(?:ifFalse\b)/i,/^(?:goto\b)/i,/^(?::)/i,/^(?:var\b)/i,/^(?:call\b)/i,/^(?:print\b)/i,/^(?:,)/i,/^(?:[ \r\t]+)/i,/^(?:\n)/i,/^(?:[0-9]+(\.0)\b)/i,/^(?:[0-9]+\b)/i,/^(?:[0-9]+(\.[0-9]+)\b)/i,/^(?:(L)[0-9]+)/i,/^(?:([a-zA-Z]|_)+[0-9]*\b)/i,/^(?:('%d')|('%e')|('%c'))/i,/^(?:$)/i,/^(?:.)/i],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39],"inclusive":true}}
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