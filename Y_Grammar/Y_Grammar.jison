/**
 * Ejemplo mi primer proyecto con Jison utilizando Nodejs en Ubuntu
 */

/* Definición Léxica */
%lex

%%

/* keywords */

"//"[^\r\n]*													{/*Inline Comment, ignore.*/}
"/*"([^"*/"])*"*/"													{/*Block Comment, ignore.*/}
(("public"|"private"|"protected")[ \r\t]+)?("static"[ \r\t]+)?(("abstract"|"final")[ \r\t]+)?"@"([a-zA-Z]|_)+[0-9]*   {token_solver.register_important_token('type'); return 'TYPE';}
"&&&"([a-zA-Z]|_)+[0-9]*("^"([a-zA-Z]|_)+[0-9]*)?				{token_solver.begin_class(yytext.trim()); return 'CLASS_BEGIN';}
"&&&&END"														{token_solver.end_class(); return 'END_CLASS';}
"####END"								{token_solver.end_import(yylloc.first_line-1); return 'END_IMPORT';}
"###"[^\r\n]+							{token_solver.begin_import(yytext.trim(),yylloc.first_line-1); return 'BEGIN_IMPORT';}
("true"|"false")						{token_solver.register_important_token('boolean'); return 'BOOLEAN';}
"null"								{token_solver.register_important_token('null'); return 'NULL';}
"'"([^"'"\\]|\\.)*"'"				{token_solver.register_important_token('char'); return 'CHAR';}
"\""([^"\""\\]|\\.)*"\""			{token_solver.register_important_token('string'); return 'STRING';}
"return"							return 'RETURN';
"break"								return 'BREAK';
"if"								return 'IF';
"else"								return 'ELSE';
"case"								return 'CASE';
"default"							return 'DEFAULT';
"while"								return 'WHILE';
"for"								return 'FOR';
"do"								return 'DO';
"switch"							return 'SWITCH';
"continue"							return 'CONTINUE';
"new"								return 'NEW';
"{"									return 'LEFT_BRACE';
"}"									return 'RIGHT_BRACE';
"["									return 'LEFT_BRACKET';
"]"									return 'RIGHT_BRACKET';
"("									return 'LEFT_PAREN';
")"									return 'RIGHT_PAREN';
"++"								return 'AUTO_INCREMENTO';
"--"								return 'AUTO_DECREMENTO';
"*"									return 'MULTIPLY';
"/"									return 'DIVIDE';
"+"									return 'PLUS';
"-"									return 'MINUS';
"?"									return 'TERNARIO';
"%"									return 'MOD';
">"									return 'MAYORQUE';
"<"									return 'MENORQUE';
">="								return 'MAYORIGUAL';
"<="								return 'MENORIGUAL';
"=="								return 'COMPARACION';
"!="								return 'DISTINTO';
"!"									return 'NOT';
"&&"								return 'AND';
"||"								return 'OR';
"="									return 'ASIGNACION';
";"									return 'SEMI';
":"									return 'COLON';
"."									return 'DOT';
","									return 'COMMA';	
([a-zA-Z]|_)+[0-9]*						{token_solver.register_important_token('id'); return 'ID';}
[ \r\t]+                                {/*WHITESPACE IGNORE*/}
\n                                      {/*NEW LINE. IGNORE*/}
[0-9]+									{token_solver.register_important_token('integer'); return 'INTEGER';}
[0-9]+("."[0-9]*)?						{token_solver.register_important_token('double'); return 'DOUBLE';}
<<EOF>>                 			return 'EOF';

/lex

/* Asociación de operadores y precedencia */
%left OR
%left AND
%left COMPARACION DISTINTO MAYORQ MENORQ MAYORIGUAL MENORIGUAL
%left PLUS MINUS
%left MULTIPLY DIVIDE
%left MOD
%left AUTO_INCREMENTO
%left AUTO_DECREMENTO
%left UMINUS
%left UNOT
%left UDOWNCAST
%right POST_INCREMENTO
%right POST_DECREMENTO
%right UTERNARIO

%start s_0

%% /* Definición de la gramática */

s_0 : program EOF {Compiler.root = $1;};

program : program  import_block {$1.fuse($2); $$ = $1;}
		| program  classList{$1.fuse($2); $$ = $1;}
		| /*Empty*/ {$$ = new Node("program");}
		;

import_block : BEGIN_IMPORT classList END_IMPORT {$$ = $2;}
				;
classList : CLASS_BEGIN declList END_CLASS {$$ = $2;}
			;
declList : declList methodDecl
			|declList fieldDecl
			|declList constructorDecl
			|declList abstractMethodDecl
			|/*Empty*/
			;
			
abstractMethodDecl : TYPE dimList ID LEFT_PAREN paramDef RIGHT_PAREN SEMI 
					|  TYPE ID LEFT_PAREN paramDef RIGHT_PAREN SEMI 
					;

methodDecl : TYPE dimList ID LEFT_PAREN paramDef RIGHT_PAREN LEFT_BRACE stmtL RIGHT_BRACE
			| TYPE ID LEFT_PAREN paramDef RIGHT_PAREN LEFT_BRACE stmtL RIGHT_BRACE
			;
			
constructorDecl : TYPE LEFT_PAREN paramDef RIGHT_PAREN LEFT_BRACE stmtL RIGHT_BRACE
				;
			
fieldDecl : TYPE ID dimList ASIGNACION Exp SEMI
			TYPE ID ASIGNACION Exp SEMI
			| TYPE ID dimList SEMI 
			| TYPE ID SEMI
			;

dimList : dimList LEFT_BRACKET RIGHT_BRACKET
			| LEFT_BRACKET RIGHT_BRACKET
			;
paramDef : paramDef COMMA TYPE dimList ID
			| paramDef COMMA TYPE ID
			| TYPE dimList ID
			| TYPE ID
			| /*Empty*/
			;

stmtL : stmtL stmt
		| /*Empty*/
		;
		
stmt: 	block
		|variableDef
		|returnStmt
		|assignationStmt
		|breakStmt
		|continueStmt
		|ifStmt
		|switchStmt
		|whileStmt
		|forStmt
		|autoStmt
		|varChain SEMI 
		;
		
block : LEFT_BRACE stmtL RIGHT_BRACE;

variableDef : TYPE ID dimList ASIGNACION Exp SEMI
			| TYPE ID ASIGNACION Exp SEMI
			| TYPE ID dimList SEMI
			| TYPE ID SEMI
			;
			
returnStmt : RETURN Exp SEMI
			| RETURN SEMI
			;
			
assignationStmt : varChain ASIGNACION Exp SEMI;

breakStmt: BREAK SEMI ;

continueStmt : CONTINUE SEMI ;

ifStmt : IF LPAREN Exp RPAREN block elseIfChain elseStmt ;

elseIfChain : elseIfChain ELSE IF LPAREN Exp RPAREN block
				| /*Empty*/
				;
				
elseStmt : ELSE block
			| /*Empty*/
			;
			
switchStmt : SWITCH LPAREN Exp RPAREN LEFT_BRACE caseL RIGHT_BRACE ;

caseL : caseL caseDecl 
			| /*Empty*/
			; 

caseDecl : CASE Exp COLON stmtL 
		| DEFAULT COLON stmtL
		;

whileStmt : WHILE LPAREN Exp RPAREN block ;

forStmt : FOR LPAREN variableDef Exp SEMI update RPAREN block;

update : ID ASIGNACION Exp 
			| ID AUTO_INCREMENTO
			| ID AUTO_DECREMENTO
			;
			
autoStmt : varChain AUTO_INCREMENTO
			| varChain AUTO_DECREMENTO
			;

varChain : varChain DOT var
			| var
			;
			
var : ID 
		| ID dimAccessL
		| ID LEFT_PAREN paramList RIGHT_PAREN
		;
		
dimAccessL : dimAccessL LEFT_BRACKET Exp RIGHT_BRACKET
				| LEFT_BRACKET Exp RIGHT_BRACKET
				;
				
paramList : paramList COMMA Exp
			| Exp
			| /*Empty*/
			;

downcast : LEFT_PAREN TYPE RIGHT_PAREN ;

Exp : 	Exp PLUS Exp
		| Exp MINUS Exp
		| Exp MULTIPLY Exp
		| Exp DIVIDE Exp
		| Exp MOD Exp
		| Exp MAYORQ Exp
		| Exp MENORQ Exp
		| Exp MAYORIGUAL Exp
		| Exp MENORIGUAL Exp
		| Exp COMPARACION Exp
		| Exp DISTINTO Exp
		| Exp AND Exp
		| Exp OR Exp
		| MINUS Exp %prec UMINUS
		| NOT Exp %prec UNOT
		| downcast Exp % UDOWNCAST
		| AUTO_INCREMENTO Exp
		| AUTO_DECREMENTO Exp
		| Exp AUTO_INCREMENTO %prec POST_INCREMENTO
		| Exp AUTO_DECREMENTO %prec POST_DECREMENTO
		| LEFT_PAREN Exp RIGHT_PAREN
		| LEFT_PAREN Exp RIGHT_PAREN TERNARIO Exp COLON Exp %prec UTERNARIO
		| atomic
		;

atomic : INTEGER
		| DOUBLE
		| STRING
		| CHAR
		| NULL
		| BOOLEAN
		| NEW TYPE LEFT_PAREN paramList RIGHT_PAREN
		| varChain
		| inlineArrayDef
		;

inlineArrayDef: LEFT_BRACE paramList RIGHT_BRACE;
