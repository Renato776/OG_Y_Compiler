/**
 * Ejemplo mi primer proyecto con Jison utilizando Nodejs en Ubuntu
 */

/* Definición Léxica */
%lex

%%

//STRING REGEX: "\""([^"\""\\]|\\.)*"\""
//WHITE_SPACE REGEX: [ \r\t]
/* keywords */

"import"[ \r\t]*"\""([^"\""\\]|\\.)*"\""      { return 'IMPORT_SENTENCE'}

<<EOF>>                 return 'EOF';

[^]     return 'ANYTHING';

/lex

/* Asociación de operadores y precedencia */

%start s_0

%% /* Definición de la gramática */

//inicio : IMPORT EOF {};
s_0 : anything_list EOF {$("#Unified_Source").html($1);};

anything_list : anything_list ANYTHING { $$ = $1+$2; }
					| anything_list IMPORT_SENTENCE { $$ = Import_Solver.compile_import_sentence($1, $2); }
					| { $$ = ""; }
					;
