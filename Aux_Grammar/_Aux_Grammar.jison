/**
 * Ejemplo mi primer proyecto con Jison utilizando Nodejs en Ubuntu
 */

/* Definición Léxica */
%lex

%%

/* keywords */

(("public"|"private"|"protected")[ \r\t]+)?(("abstract"|"final")[ \r\t]+)?"class"[ \r\t]+([a-zA-Z]|_)+[0-9]*[ \r\t]+"extends"[ \r\t]+([a-zA-Z]|_)+[0-9]*    { return 'SUB_CLASS_DECL'; }
(("public"|"private"|"protected")[ \r\t]+)?(("abstract"|"final")[ \r\t]+)?"class"[ \r\t]+([a-zA-Z]|_)+[0-9]*      return 'CLASS_DECL';
"{"										return 'LEFT_BRACE';
"}"										return 'RIGHT_BRACE';
"####END"								{location_solver.end_import(yylloc.first_line-1); return 'ANYTHING';}
"###"[^\r\n]+							{location_solver.begin_import(yytext.trim(),yylloc.first_line-1); return 'ANYTHING';}
[ \r\t]+                                return 'WHITE_SPACE';
\n                                      return 'NEW_LINE';

([a-zA-Z]|_)+[0-9]*\b    				return 'ID';

<<EOF>>                 return 'EOF';

[^]     return 'ANYTHING';

/lex

/* Asociación de operadores y precedencia */

%start s_0

%% /* Definición de la gramática */

s_0 : program separator EOF {$("#Unified_Source").html($1+$2);};

program : program  separator CLASS_DECL separator LEFT_BRACE stmtL RIGHT_BRACE
            {$$ = $1 +$2 + pre_register_class($3,false)+$4 + $6 +"\n&&&&END\n";}
		| program  separator SUB_CLASS_DECL separator LEFT_BRACE stmtL RIGHT_BRACE
		    {$$ = $1 +$2 + pre_register_class($3,true)+$4 + $6 +"\n&&&&END\n";}
		| program  separator ANYTHING {$$ = $1 + $2 + $3;}
		| /*Empty*/ {$$ = "";}
		;

separator : separator WHITE_SPACE {$$ = $1+$2;}
            | separator NEW_LINE {$$ = $1+$2;}
            | /*Empty*/ {$$ = "";}
            ;

stmtL : stmtL stmt {$$ = $1 + $2;}
		| /*Empty*/ {$$ = ""; }
		;

stmt : ANYTHING {$$ = $1;}
	| LEFT_BRACE stmtL RIGHT_BRACE {$$ = "{"+$2+"}";}
	| NEW_LINE { $$ = $1; }
	| WHITE_SPACE { $$ = $1; }
	;
