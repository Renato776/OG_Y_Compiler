/**
 * Ejemplo mi primer proyecto con Jison utilizando Nodejs en Ubuntu
 */

/* Definición Léxica */
%lex

%options case-insensitive

%%


";".*              {/*ignore*/}
"proc"           return 'PROC';
"{"           return 'LEFT_BRACE';
"}"           return 'RIGHT_BRACE';
"("           return 'LEFT_PAREN';
")"           return 'RIGHT_PAREN';
"stack"       return 'STACK';
"heap"        return 'HEAP';
"["           return 'LEFT_BRACKET';
"]"                 return 'RIGHT_BRACKET';
"<="                 return 'MENORIGUAL';
">="                 return 'MAYORIGUAL';
"<"                 return 'MENORQ';
">"                 return 'MAYORQ';
"+"                 return 'SUM';
"-"                 return 'MINUS';
"*"                 return 'MULTIPLY';
"/"                 return 'DIVIDE';
"%"                 return 'MOD';
"!="                 return 'DISTINTO';
"=="                 return 'IGUAL';
"="                 return 'ASIGNACION';
"if"                 return 'IF';
"ifFalse"            return 'IF_FALSE';
"goto"                 return 'GOTO';
":"                 return 'DOSPUNTOS';
"var"				return 'VAR';
"call"				return 'CALL';
"print"             return 'PRINT';
"exit"				return 'EXIT';
"write_file"		return 'WRITE_FILE'
","                 return 'COMMA';

/* Espacios en blanco */
[ \r\t]+            {}
\n                  {}
[0-9]+(".0")\b    return 'BETA_NUM';
[0-9]+("."[0-9]+)\b    return 'FLOAT';
[0-9]+\b        return 'NUM';
("L")[0-9]+             return 'LABEL';
([a-zA-Z]|_)+[0-9]*\b    return 'ID';
("'%d'")|("'%e'")|("'%c'") return 'FORMAT';
<<EOF>>                 return 'EOF';

.                       { console.error('Este es un error léxico: ' + yytext + ', en la linea: ' + yylloc.first_line + ', en la columna: ' + yylloc.first_column); }
/lex

/* Asociación de operadores y precedencia */

%start s

%% /* Definición de la gramática */

s
	: inicio {console.log('3D input parsed successfully!');}
;

inicio : InstrL EOF {Optimizer.output_optimized_code();};

InstrL:
	 InstrL Instr {}
	| Instr {}
;

Instr:
    labelList stmt {
    $2.signature = $1+$2.signature;
    Optimizer.resolve_unreachable_code();
    Optimizer.resolve_unneeded_jump($1);
    Optimizer.goto_started = false;
    Optimizer.instruction_stack.push($2);
     }
    |procDef stmt {
    $2.signature = $1+$2.signature;
    Optimizer.instruction_stack.push($2);
    }
    |stmt { if(Optimizer.goto_started){
    			Optimizer.unused_instructions.push($1);
    		}else {
    			Optimizer.instruction_stack.push($1);
    			Optimizer.resolve_redundant_instruction();
    		}
    	}
    ;

labelList:
    labelList LABEL DOSPUNTOS {
    Optimizer.label_stack.push($2);
    $$ = $1+$2+":";
    }
    |LABEL DOSPUNTOS {
    $$ = $1+":";
    Optimizer.label_stack.push($1);
    }
    ;

procDef:
    PROC ID LEFT_BRACE {
    $$ = "proc "+$2+" {";
    }
    ;

stmt : varDecl {$$ = $1;}
        | assignment {$$ = $1;}
        | standard {$$ = $1;}
        | ifStmt {$$ = $1;}
        | ifFalseStmt {$$ = $1;}
        | goto {$$ = $1;}
        | call {$$ = $1;}
        | ret {$$ = $1;}
        | print {$$ = $1;}
        | setHeap {$$ = $1;}
        | getHeap {$$ = $1;}
        | setStack {$$ = $1;}
        | getStack {$$ = $1;}
        | exit {$$ = $1;}
        | write {$$ = $1;}
        ;

varDecl: VAR ID ASIGNACION value {
    $$ = new Instruction("assignation",$4,$2,$4);
};

assignment: ID ASIGNACION value {
     $$ = new Instruction("assignation",$3,$1,$3);
};

standard: ID ASIGNACION value SUM value {
        $$ = Optimizer.resolve_arithmetic_reduction(new Instruction("standard",$3,$3,$5,'+',$1)); //name,token,a,b,op,c
        }
        | ID ASIGNACION value MINUS value {
       	$$ = Optimizer.resolve_arithmetic_reduction(new Instruction("standard",$3,$3,$5,'-',$1)); //name,token,a,b,op,c
        }
        | ID ASIGNACION value MULTIPLY value {
       	$$ = Optimizer.resolve_arithmetic_reduction(new Instruction("standard",$3,$3,$5,'*',$1)); //name,token,a,b,op,c
        }
        | ID ASIGNACION value DIVIDE value {
        $$ = Optimizer.resolve_arithmetic_reduction(new Instruction("standard",$3,$3,$5,'/',$1)); //name,token,a,b,op,c
        }
        | ID ASIGNACION value MOD value {
        $$ = Optimizer.resolve_arithmetic_reduction(new Instruction("standard",$3,$3,$5,'%',$1)); //name,token,a,b,op,c where c is text not a token
        }
        ;

ifStmt: IF value MAYORQ value GOTO LABEL {
        $$ = new Instruction("if",$2,$2,$4,'>',$6);
        }
        | IF value MENORQ value GOTO LABEL {
        $$ = new Instruction("if",$2,$2,$4,'<',$6);
        }
        | IF value MAYORIGUAL value GOTO LABEL {
        $$ = new Instruction("if",$2,$2,$4,'>=',$6);
        }
        | IF value MENORIGUAL value GOTO LABEL {
        $$ = new Instruction("if",$2,$2,$4,'<=',$6);
        }
        | IF value IGUAL value GOTO LABEL {
        $$ = new Instruction("if",$2,$2,$4,'==',$6);
        }
        | IF value DISTINTO value GOTO LABEL {
        $$ = new Instruction("if",$2,$2,$4,'!=',$6);
        }
        ;

ifFalseStmt: IF_FALSE value MAYORQ value GOTO LABEL {
        $$ = new Instruction("if",$2,$2,$4,'<=',$6);
        }
        | IF_FALSE value MENORQ value GOTO LABEL {
        $$ = new Instruction("if",$2,$2,$4,'>=',$6);
        }
        | IF_FALSE value MAYORIGUAL value GOTO LABEL {
        $$ = new Instruction("if",$2,$2,$4,'<',$6);
        }
        | IF_FALSE value MENORIGUAL value GOTO LABEL {
        $$ = new Instruction("if",$2,$2,$4,'>',$6);
        }
        | IF_FALSE value IGUAL value GOTO LABEL {
        $$ = new Instruction("if",$2,$2,$4,'==',$6);
        }
        | IF_FALSE value DISTINTO value GOTO LABEL {
        $$ = new Instruction("if",$2,$2,$4,'!=',$6);
        }
        ;
goto : GOTO LABEL {
        $$ = new Instruction("goto",new _3D_Token($2,@2.first_line,@2.first_column),$2);
        Optimizer.goto_started = true;
        Optimizer.instruction_stack.push($$);
        Optimizer.label_stack = [];
        };

call : CALL ID {
      $$ = new Instruction("call",new _3D_Token($2,@2.first_line,@2.first_column),$2);
      };

ret : RIGHT_BRACE {
      $$ = new Instruction("ret",new _3D_Token(function_names.pop(),@1.first_line,@1.first_column));
      };

print : PRINT LEFT_PAREN FORMAT COMMA value RIGHT_PAREN {
       $$ = new Instruction("print",$5,$3,$5); //Print(name,token,format,value)
       }
       ;
exit : EXIT LEFT_PAREN value RIGHT_PAREN {
       $$ = new Instruction("exit",$3,$3.text); //Exit(code)
       }
       ;
exit : WRITE LEFT_PAREN value RIGHT_PAREN {
       $$ = new Instruction("write",$3,$3.text); //Write instruction (code)
       }
       ;

setHeap : HEAP LEFT_BRACKET ID RIGHT_BRACKET ASIGNACION value {
        $$ = new Instruction("SET_HEAP",$6,$3,$6);
        };
setStack : STACK LEFT_BRACKET ID RIGHT_BRACKET ASIGNACION value {
        $$ = new Instruction("SET_STACK",$6,$3,$6);
        };
getHeap : ID ASIGNACION HEAP LEFT_BRACKET ID RIGHT_BRACKET {
        $$ = new Instruction("GET_HEAP",new _3D_Token($1,@1.first_line,@1.first_column),$1,$5);
        };

getStack : ID ASIGNACION STACK LEFT_BRACKET ID RIGHT_BRACKET {
        $$ = new Instruction("GET_STACK",new _3D_Token($1,@1.first_line,@1.first_column),$1,$5);
        };

value: ID {$$ = new _3D_Token($1,@1.first_line,@1.first_column,false);}
        | MINUS ID {$$ = new _3D_Token($2,@1.first_line,@1.first_column,true);}
        | ENTERO {$$ = $1; }
        | MINUS ENTERO {$2.negative = true; $$ = $2; }
        | FLOAT {$$ = new _3D_Token($1,@1.first_line,@1.first_column,false);}
        | MINUS FLOAT {$$ = new _3D_Token($2,@1.first_line,@1.first_column,true);}
        | STACK {$$ = new _3D_Token($1,@1.first_line,@1.first_column);}
        | HEAP {$$ = new _3D_Token($1,@1.first_line,@1.first_column);}
        ;

ENTERO: NUM  { $$ = new _3D_Token($1,@1.first_line,@1.first_column); }
		| BETA_NUM  { $$ = new _3D_Token($1.substring(0,$1.length-2),@1.first_line,@1.first_column); }
		;
