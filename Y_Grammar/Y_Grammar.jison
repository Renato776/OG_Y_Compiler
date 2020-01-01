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
			
declList : declList methodDecl {$1.add($2); $$ = $1; }
			|declList fieldDecl {$1.add($2); $$ = $1; }
			|declList constructorDecl {$1.add($2); $$ = $1; }
			|declList abstractMethodDecl {$1.add($2); $$ = $1; }
			|/*Empty*/ {$$ = new Node("declList");}
			;
			
abstractMethodDecl : TYPE dimList ID LEFT_PAREN paramDef RIGHT_PAREN SEMI {$$ = Compiler.abstractMethodDecl($2,$5); }
					|  TYPE ID LEFT_PAREN paramDef RIGHT_PAREN SEMI {$$ = Compiler.abstractMethodDecl(0,$4);}
					;

methodDecl : TYPE dimList ID LEFT_PAREN paramDef RIGHT_PAREN LEFT_BRACE stmtL RIGHT_BRACE {$$ = Compiler.methodDecl($2,$5,$8); }
			| TYPE ID LEFT_PAREN paramDef RIGHT_PAREN LEFT_BRACE stmtL RIGHT_BRACE {$$ = Compiler.methodDecl(0,$4,$7); }
			;
			
constructorDecl : TYPE LEFT_PAREN paramDef RIGHT_PAREN LEFT_BRACE stmtL RIGHT_BRACE {$$ = Compiler.constructorDecl($3,$6); }
				;
			
fieldDecl : TYPE ID dimList ASIGNACION Exp SEMI  {$$ = Compiler.fieldDecl($3,$5); }
			| TYPE ID ASIGNACION Exp SEMI {$$ = Compiler.fieldDecl(0,$4); }
			| TYPE ID dimList SEMI  {$$ = Compiler.fieldDecl($3,null); }
			| TYPE ID SEMI {$$ = Compiler.fieldDecl(0,null); }
			;

dimList : dimList LEFT_BRACKET RIGHT_BRACKET {$$ = $1 + 1;}
			| LEFT_BRACKET RIGHT_BRACKET {$$ = 1;}
			;
paramDef : paramDef COMMA TYPE dimList ID {$$ = $1; $$.add(Compiler.paramDef($4));}
			| paramDef COMMA TYPE ID {$$ = $1; $$.add(Compiler.paramDef(0));}
			| TYPE dimList ID {$$ = new Node("paramDefList"); $$.add(Compiler.paramDef($2));}
			| TYPE ID {$$ = new Node("paramDefList"); $$.add(Compiler.paramDef(0));}
			| /*Empty*/ {$$ = new Node("paramDefList");}
			;

stmtL : stmtL stmt {$$ = $1; $$.add($2);}
		| /*Empty*/ {$$ = new Node("block");}
		;
		
stmt: 	block {$$ = $1;}
		|variableDef {$$ = $1;}
		|returnStmt {$$ = $1;}
		|assignationStmt {$$ = $1;}
		|breakStmt {$$ = $1;}
		|continueStmt {$$ = $1;}
		|ifStmt {$$ = $1;}
		|switchStmt {$$ = $1;}
		|whileStmt {$$ = $1;}
		|forStmt {$$ = $1;}
		|autoStmt {$$ = $1;}
		|varChain SEMI {$$ = $1;} 
		;
		
basicStmt :	block {$$ = $1;}
		|returnStmt {$$ = $1;}
		|assignationStmt {$$ = $1;}
		|breakStmt {$$ = $1;}
		|continueStmt {$$ = $1;}
		|autoStmt {$$ = $1;}
		|varChain SEMI {$$ = $1;}
		|switchStmt {$$ = $1;}
		|whileStmt {$$ = $1;}
		|forStmt {$$ = $1;}
		;
		
block : LEFT_BRACE stmtL RIGHT_BRACE {$$ = $2;}
		;

variableDef : TYPE ID dimList ASIGNACION Exp SEMI {$$ = Compiler.variableDef($3,$5);}
			| TYPE ID ASIGNACION Exp SEMI {$$ = Compiler.variableDef(0,$5);}
			| TYPE ID dimList SEMI {$$ = Compiler.variableDef($3,null);}
			| TYPE ID SEMI {$$ = Compiler.variableDef(0,null);}
			;
			
returnStmt : RETURN Exp SEMI {$$ = new Node("Return"); $$.add($2);}
			| RETURN SEMI {$$ = new Node("EmptyReturn");}
			;
			
assignationStmt : varChain ASIGNACION Exp SEMI {$$ = new Node("assignation"); $$.add($1); $$.add($3);};

breakStmt: BREAK SEMI {$$ = new Node("break");};

continueStmt : CONTINUE SEMI {$$ = new Node("continue");};

ifStmt : IF LPAREN Exp RPAREN basicStmt elseIfChain elseStmt {
		$$ = new Node("ifStmt");
		$$.add(new Node("if"));
		$$.children[0].add($3);
		$$.children[0].add($5);
		$$.fuse($6);
		if($7 != null)$$.add($7);
		}
		;

elseIfChain : elseIfChain ELSE IF LPAREN Exp RPAREN basicStmt {
				$$ = $1; 
				$$.children.push(new Node("if"));
				$$.children[$$.children.length-1].add($5);
				$$.children[$$.children.length-1].add($7);
				}
				| /*Empty*/ {$$ = new Node("elseIfChain");}
				;
				
elseStmt : ELSE basicStmt {$$ = new Node("else"); $$.children[0].add($2);}
			| /*Empty*/ {$$ = null;}
			;
			
switchStmt : SWITCH LPAREN Exp RPAREN LEFT_BRACE caseL RIGHT_BRACE {
			$$ = new Node("switch");
			$$.add($3);
			$$.add($6);
			}
			;

caseL : caseL caseDecl  {$$ = $1; $$.add($2);}
			| /*Empty*/ {$$ = new Node("caseL");}
			; 

caseDecl : CASE Exp COLON stmtL  {
		$$ = new Node("case"); 
		$$.add($2);
		$$.add($4);
		}
		| DEFAULT COLON stmtL {$$ = new Node("default"); $$.add($3);}
		;

whileStmt : WHILE LPAREN Exp RPAREN block {
			$$ = new Node("while");
			$$.add($3);
			$$.add($5);
			}
			;

forStmt : FOR LPAREN variableDef Exp SEMI update RPAREN block{
			$$ = new Node("for");
			$$.add($3);
			$$.add($4);
			$$.add($6);
			$$.add($8);
			}
			;

update : ID ASIGNACION Exp {$$ = new Node("update"); $$.add(Compiler.update($3)); }
			| ID AUTO_INCREMENTO {$$ = new Node("update"); $$.add(Compiler.update(null)); }
			| ID AUTO_DECREMENTO {$$ = new Node("update"); $$.add(Compiler.update(null)); }
			;
			
autoStmt : varChain AUTO_INCREMENTO {$$ = new Node("autoIncremento"); $$.add($1); }
			| varChain AUTO_DECREMENTO {$$ = new Node("autoDecremento"); $$.add($1);}
			;

varChain : varChain DOT var {$$ = $1; $$.add($3); }
			| var {$$ = new Node("varChain"); $$.add($1); }
			;
			
var : ID {$$ = Compiler.var(0);}
		| ID dimAccessL {$$ = Compiler.var($2);}
		| ID LEFT_PAREN paramList RIGHT_PAREN {$$ = Compiler.var($3);}
		;
		
dimAccessL : dimAccessL LEFT_BRACKET Exp RIGHT_BRACKET {$$ = $1; $$.add($3);}
				| LEFT_BRACKET Exp RIGHT_BRACKET {$$ = new Node("dimAccessL"); $$.add($2);}
				;
				
paramList : paramList COMMA Exp {$$ = $1; $$.add($3);}
			| Exp		{$$ = new Node("paramList"); $$.add($1);}
			| /*Empty*/ {$$ = new Node("paramList");}
			;

downcast : LEFT_PAREN TYPE RIGHT_PAREN {$$ = Compiler.downcast();};

Exp : 	Exp PLUS Exp {$$ = new Node("+"); $$.add($1); $$.add($3); }
		| Exp MINUS Exp {$$ = new Node("-"); $$.add($1); $$.add($3); }
		| Exp MULTIPLY Exp {$$ = new Node("*"); $$.add($1); $$.add($3); }
		| Exp DIVIDE Exp {$$ = new Node("/"); $$.add($1); $$.add($3); }
		| Exp MOD Exp {$$ = new Node("%"); $$.add($1); $$.add($3); }
		| Exp MAYORQ Exp {$$ = new Node(">"); $$.add($1); $$.add($3); }
		| Exp MENORQ Exp {$$ = new Node("<"); $$.add($1); $$.add($3); }
		| Exp MAYORIGUAL Exp {$$ = new Node(">="); $$.add($1); $$.add($3); }
		| Exp MENORIGUAL Exp {$$ = new Node("<="); $$.add($1); $$.add($3); }
		| Exp COMPARACION Exp {$$ = new Node("=="); $$.add($1); $$.add($3); }
		| Exp DISTINTO Exp {$$ = new Node("!="); $$.add($1); $$.add($3); }
		| Exp AND Exp {$$ = new Node("&&"); $$.add($1); $$.add($3); }
		| Exp OR Exp {$$ = new Node("||"); $$.add($1); $$.add($3); }
		| MINUS Exp %prec UMINUS {$$ = new Node("UMINUS"); $$.add($2); }
		| NOT Exp %prec UNOT {$$ = new Node("NOT"); $$.add($2); }
		| downcast Exp % UDOWNCAST {$$ = $1; $$.add($2);}
		| AUTO_INCREMENTO Exp {$$ = new Node("pre-incremento"); $$.add($2); }
		| AUTO_DECREMENTO Exp {$$ = new Node("pre-decremento"); $$.add($2); }
		| Exp AUTO_INCREMENTO %prec POST_INCREMENTO {$$ = new Node("post-incremento"); $$.add($1); }
		| Exp AUTO_DECREMENTO %prec POST_DECREMENTO {$$ = new Node("post-decremento"); $$.add($1); }
		| LEFT_PAREN Exp RIGHT_PAREN {$$ = $2; }
		| LEFT_PAREN Exp RIGHT_PAREN TERNARIO Exp COLON Exp %prec UTERNARIO {$$ = new Node("ternario");
		$$.add($2);
		$$.add($5);
		$$.add($7);
		}
		| atomic {$$ = $1;}
		;

atomic : INTEGER {$$ = Compiler.primitive();}
		| DOUBLE {$$ = Compiler.primitive();}
		| STRING {$$ = Compiler.primitive();}
		| CHAR {$$ = Compiler.primitive();}
		| NULL {$$ = Compiler.primitive();}
		| BOOLEAN {$$ = Compiler.primitive();}
		| NEW TYPE LEFT_PAREN paramList RIGHT_PAREN {$$ = Compiler.NEW($4);}
		| varChain {$$ = $1;}
		| inlineArrayDef {$$ = $1;}
		;

inlineArrayDef: LEFT_BRACE paramList RIGHT_BRACE {$$ = new Node("inlineArrayDef"); $$.fuse($2);}
				| arrayInitialization {$$ = $1;}
				;

arrayInitialization : arrayInitialization LEFT_BRACKET Exp RIGHT_BRACKET {$$ = $1; $$.add($3);}
					| NEW TYPE LEFT_BRACKET Exp RIGHT_BRACKET {$$ = Compiler.arrayInitialization($4);}
					;
