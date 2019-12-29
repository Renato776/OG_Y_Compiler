/**
 * Ejemplo mi primer proyecto con Jison utilizando Nodejs en Ubuntu
 */

/* Definición Léxica */
%lex

%%

//STRING REGEX: "\""([^"\""\\]|\\.)*"\""
//WHITE_SPACE REGEX: [ \r\t]
/* keywords */

"extends"								return 'EXTENDS';
"class"									return 'CLASS';
"public"								return 'VISIBILITY';
"{"										return 'LEFT_BRACE';
"}"										return 'RIGHT_BRACE';
"####END"								return 'IMPORT_END';
"###"[^\r\n]+							return 'IMPORT_START';

([a-zA-Z]|_)+[0-9]*\b    				return 'ID';

<<EOF>>                 return 'EOF';

[^]     return 'ANYTHING';

/lex

/* Asociación de operadores y precedencia */

%start s_0

%% /* Definición de la gramática */

s_0 : program EOF {console.log('Parsed successfully!');};

program : program  CLASS_DECL LEFT_BRACE stmtL RIGHT_BRACE {}
		| program  ANYTHING {}
		| program  IMPORT_END {}
		| program  IMPORT_START {}
		| program 	ID {}
		|/*Empty*/ {}
		;
CLASS_DECL : CLASS ID
			| VISIBILITY CLASS ID
			| CLASS ID EXTENDS ID
			| VISIBILITY CLASS ID EXTENDS ID
			;
		
stmtL : stmtL stmt {}
		| /*Empty*/ {}
		;

stmt : ANYTHING {}
	| LEFT_BRACE stmtL RIGHT_BRACE {}
	| ID							{}
	| VISIBILITY					{}
	;
