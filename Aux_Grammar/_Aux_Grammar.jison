/**
 * Ejemplo mi primer proyecto con Jison utilizando Nodejs en Ubuntu
 */

/* Definición Léxica */
%lex

%%

//STRING REGEX: "\""([^"\""\\]|\\.)*"\""
//WHITE_SPACE REGEX: [ \r\t]
/* keywords */

(("public"|"private"|"protected")[ \r\t]+)?"class"[ \r\t]+([a-zA-Z]|_)+[0-9]*[ \r\t]+"extends"[ \r\t]+([a-zA-Z]|_)+[0-9]*    { return 'SUB_CLASS_DECL'; }
(("public"|"private"|"protected")[ \r\t]+)?"class"[ \r\t]+([a-zA-Z]|_)+[0-9]*      return 'CLASS_DECL';
"{"										return 'LEFT_BRACE';
"}"										return 'RIGHT_BRACE';

<<EOF>>                 return 'EOF';

[^]     return 'ANYTHING';

/lex

/* Asociación de operadores y precedencia */

%start s_0

%% /* Definición de la gramática */

s_0 : program EOF {$("#Unified_Source").html($1);};

program : program  CLASS_DECL LEFT_BRACE stmtL RIGHT_BRACE {$$ = $1 + pre_register_class($2,false) + $4 +"\n&&&&END\n";}
		| program  SUB_CLASS_DECL LEFT_BRACE stmtL RIGHT_BRACE {$$ = $1 + pre_register_class($2,true) + $4 +"\n&&&&END\n";}
		| program ANYTHING {$$ = $1 + $2;}
		|/*Empty*/ {$$ = "";}
		;
		
stmtL : stmtL stmt {$$ = $1 + $2;}
		| /*Empty*/ {$$ = ""; }
		;

stmt : ANYTHING {$$ = $1;}
	| LEFT_BRACE stmtL RIGHT_BRACE {$$ = "{"+$2+"}";}
	;
