/**
 * Ejemplo mi primer proyecto con Jison utilizando _Nodejs en Ubuntu
 */

/* Definición Léxica */
%lex

%%

/* keywords */

"//"[^\r\n]*													{/*Inline Comment, ignore.*/}
[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/] 							{/* Block comment, ignore. */}
(("public"|"private"|"protected")[ \r\t]+)?("static"[ \r\t]+)?(("abstract"|"final")[ \r\t]+)?"@"([a-zA-Z]|_)+[0-9]*   {return 'TYPE';}
"&&&@"([a-zA-Z]|_)+[0-9]*			{token_solver.begin_class(yytext.trim()); return 'CLASS_BEGIN';}
"&&&&END"														{token_solver.end_class(); return 'END_CLASS';}
"####END"								{token_solver.end_import(yylloc.first_line-1); return 'END_IMPORT';}
"###"("/"("@")?([a-zA-Z]|_)+[0-9]*("."([a-zA-Z]|_)+)?)+		{token_solver.begin_import(yytext.trim(),yylloc.first_line-1); return 'BEGIN_IMPORT';}
("true"|"false")						{return 'BOOLEAN';}
"null"								{return 'NULL';}
"'"([^"'"\\]|\\.)*"'"				{return 'CHAR';}
"\""([^"\""\\]|\\.)*"\""			{return 'STRING';}
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
">"									return 'MAYORQ';
"<"									return 'MENORQ';
">="								return 'MAYORIGUAL';
"<="								return 'MENORIGUAL';
"=="								return 'COMPARACION';
"!="								return 'DISTINTO';
"!"									return 'NOT';
"&&"         						return 'AND';
"||"								return 'OR';
"="									return 'ASIGNACION';
";"									return 'SEMI';
":"									return 'COLON';
"."									return 'DOT';
","									return 'COMMA';	
([a-zA-Z]|_)+[0-9]*						{return 'ID';}
[ \r\t]+                                {/*WHITESPACE IGNORE*/}
\n                                      {/*NEW LINE. IGNORE*/}
[0-9]+"."[0-9]*						{return 'DOUBLE';}
[0-9]+									{return 'INTEGER';}
<<EOF>>                 			     return 'EOF';
.										{_pre_compiling_lexical_exception();}

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
		| program  classDecl {$1.fuse($2); $$ = $1;}
		| /*Empty*/ {$$ = new _Node("program");}
		;

import_block : BEGIN_IMPORT program END_IMPORT {$$ = $2;}
				;
				
classDecl : CLASS_BEGIN declList END_CLASS {$$ = $2;}
			;
			
declList : declList methodDecl {$1.add($2); $$ = $1; }
			|declList fieldDecl {$1.add($2); $$ = $1; }
			|declList constructorDecl {$1.add($2); $$ = $1; }
			|declList abstractMethodDecl {$1.add($2); $$ = $1; }
			|/*Empty*/ {$$ = new _Node("declList");}
			;
			
abstractMethodDecl : TYPE dimList ID LEFT_PAREN paramDef RIGHT_PAREN SEMI {$$ = Compiler.abstractMethodDecl(
					token_solver.build_token('type',$1,@1.first_line,@1.first_column),
					token_solver.build_token('id',$3,@3.first_line,@3.first_column),
					$2,$5); }
					|  TYPE ID LEFT_PAREN paramDef RIGHT_PAREN SEMI {$$ = Compiler.abstractMethodDecl(
					token_solver.build_token('type',$1,@1.first_line,@1.first_column),
					token_solver.build_token('id',$2,@2.first_line,@2.first_column),0,$4);}
					;

methodDecl : TYPE dimList ID LEFT_PAREN paramDef RIGHT_PAREN LEFT_BRACE stmtL RIGHT_BRACE {$$ = Compiler.methodDecl(
					token_solver.build_token('type',$1,@1.first_line,@1.first_column),
					token_solver.build_token('id',$3,@3.first_line,@3.first_column),$2,$5,$8); }
			| TYPE ID LEFT_PAREN paramDef RIGHT_PAREN LEFT_BRACE stmtL RIGHT_BRACE {$$ = Compiler.methodDecl(
					token_solver.build_token('type',$1,@1.first_line,@1.first_column),
					token_solver.build_token('id',$2,@2.first_line,@2.first_column),0,$4,$7); }
			;
			
constructorDecl : TYPE LEFT_PAREN paramDef RIGHT_PAREN LEFT_BRACE stmtL RIGHT_BRACE {$$ = Compiler.constructorDecl(
					token_solver.build_token('type',$1,@1.first_line,@1.first_column),$3,$6); }
				;
			
fieldDecl : TYPE ID dimList ASIGNACION Exp SEMI  {$$ = Compiler.fieldDecl(
					token_solver.build_token('type',$1,@1.first_line,@1.first_column),
					token_solver.build_token('id',$2,@2.first_line,@2.first_column),$3,$5); }
			| TYPE ID ASIGNACION Exp SEMI {$$ = Compiler.fieldDecl(
					token_solver.build_token('type',$1,@1.first_line,@1.first_column),
					token_solver.build_token('id',$2,@2.first_line,@2.first_column),0,$4); }
			| TYPE ID dimList SEMI  {$$ = Compiler.fieldDecl(
					token_solver.build_token('type',$1,@1.first_line,@1.first_column),
					token_solver.build_token('id',$2,@2.first_line,@2.first_column),$3,null); }
			| TYPE ID SEMI {$$ = Compiler.fieldDecl(
					token_solver.build_token('type',$1,@1.first_line,@1.first_column),
					token_solver.build_token('id',$2,@2.first_line,@2.first_column),0,null); }
			;

dimList : dimList LEFT_BRACKET RIGHT_BRACKET {$$ = $1 + 1;}
			| LEFT_BRACKET RIGHT_BRACKET {$$ = 1;}
			;
paramDef : paramDef COMMA TYPE dimList ID {$$ = $1; $$.add(Compiler.paramDef(
					token_solver.build_token('type',$3,@3.first_line,@3.first_column),
					token_solver.build_token('id',$5,@5.first_line,@5.first_column),$4));}
			| paramDef COMMA TYPE ID {$$ = $1; $$.add(Compiler.paramDef(
					token_solver.build_token('type',$3,@3.first_line,@3.first_column),
					token_solver.build_token('id',$4,@4.first_line,@4.first_column),0));}
			| TYPE dimList ID {$$ = new _Node("paramDefList"); $$.add(Compiler.paramDef(
					token_solver.build_token('type',$1,@1.first_line,@1.first_column),
					token_solver.build_token('id',$3,@3.first_line,@3.first_column),$2));}
			| TYPE ID {$$ = new _Node("paramDefList"); $$.add(Compiler.paramDef(
					token_solver.build_token('type',$1,@1.first_line,@1.first_column),
					token_solver.build_token('id',$2,@2.first_line,@2.first_column),0));}
			| /*Empty*/ {$$ = new _Node("paramDefList");}
			;

stmtL : stmtL stmt {$$ = $1; $$.add($2);}
		| /*Empty*/ {$$ = new _Node("block");}
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
		|doStmt SEMI {$$ = $1;}
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
		|doStmt SEMI {$$ = $1;}
		;
		
block : LEFT_BRACE stmtL RIGHT_BRACE {$$ = $2;}
		;

variableDef : TYPE ID dimList ASIGNACION Exp SEMI {$$ = Compiler.variableDef(
					token_solver.build_token('type',$1,@1.first_line,@1.first_column),
					token_solver.build_token('id',$2,@2.first_line,@2.first_column),$3,$5);}
			| TYPE ID ASIGNACION Exp SEMI {$$ = Compiler.variableDef(
					token_solver.build_token('type',$1,@1.first_line,@1.first_column),
					token_solver.build_token('id',$2,@2.first_line,@2.first_column),0,$4);}
			| TYPE ID dimList SEMI {$$ = Compiler.variableDef(
					token_solver.build_token('type',$1,@1.first_line,@1.first_column),
					token_solver.build_token('id',$2,@2.first_line,@2.first_column),$3,null);}
			| TYPE ID SEMI {$$ = Compiler.variableDef(
					token_solver.build_token('type',$1,@1.first_line,@1.first_column),
					token_solver.build_token('id',$2,@2.first_line,@2.first_column),0,null);}
			;
			
returnStmt : RETURN Exp SEMI {$$ = new _Node("return"); $$.add($2);}
			| RETURN SEMI {$$ = new _Node("return");}
			;
			
assignationStmt : varChain ASIGNACION Exp SEMI {$$ = new _Node("assignation"); $$.add($1); $$.add($3);};

breakStmt: BREAK SEMI {$$ = new _Node("break");};

continueStmt : CONTINUE SEMI {$$ = new _Node("continue");};

ifStmt : IF LEFT_PAREN Exp RIGHT_PAREN basicStmt elseIfChain elseStmt {
		$$ = new _Node("ifStmt");
		$$.add(new _Node("if"));
		$$.children[0].add($3);
		$$.children[0].add($5);
		$$.fuse($6);
		if($7 != null)$$.add($7);
		}
		;

elseIfChain : elseIfChain ELSE IF LEFT_PAREN Exp RIGHT_PAREN basicStmt {
				$$ = $1; 
				$$.children.push(new _Node("if"));
				$$.children[$$.children.length-1].add($5);
				$$.children[$$.children.length-1].add($7);
				}
				| /*Empty*/ {$$ = new _Node("elseIfChain");}
				;
				
elseStmt : ELSE basicStmt {$$ = new _Node("else"); $$.add($2);}
			| /*Empty*/ {$$ = null;}
			;
			
switchStmt : SWITCH LEFT_PAREN Exp RIGHT_PAREN LEFT_BRACE caseL RIGHT_BRACE {
			$$ = new _Node("switch");
			$$.add($3);
			$$.add($6);
			}
			;

caseL : caseL caseDecl  {$$ = $1; $$.add($2);}
			| /*Empty*/ {$$ = new _Node("caseL");}
			; 

caseDecl : CASE Exp COLON stmtL  {
		$$ = new _Node("case"); 
		$$.add($2);
		$$.add($4);
		}
		| DEFAULT COLON stmtL {$$ = new _Node("default"); $$.add($3);}
		;

whileStmt : WHILE LEFT_PAREN Exp RIGHT_PAREN block {
			$$ = new _Node("while");
			$$.add($3);
			$$.add($5);
			}
			;
doStmt : DO block WHILE LEFT_PAREN Exp RIGHT_PAREN {
			$$ = new _Node("do");
			$$.add($5);
			$$.add($2);
			}
			;

forStmt : FOR LEFT_PAREN variableDef Exp SEMI update RIGHT_PAREN block{
			$$ = new _Node("for");
			$$.add($3);
			$$.add($4);
			$$.add($6);
			$$.add($8);
			}
			;

update : ID ASIGNACION Exp {$$ = new _Node("update"); $$.add(Compiler.update(
					token_solver.build_token('id',$1,@1.first_line,@1.first_column),$3)); }
			| ID AUTO_INCREMENTO {$$ = new _Node("update"); $$.add(Compiler.update(
					token_solver.build_token('id',$1,@1.first_line,@1.first_column),0)); }
			| ID AUTO_DECREMENTO {$$ = new _Node("update"); $$.add(Compiler.update(
					token_solver.build_token('id',$1,@1.first_line,@1.first_column),1)); }
			;
			
autoStmt : varChain AUTO_INCREMENTO SEMI {$$ = new _Node("post-increment"); $$.add($1); }
			| varChain AUTO_DECREMENTO SEMI {$$ = new _Node("post-decrement"); $$.add($1);}
			| AUTO_INCREMENTO varChain SEMI {$$ = new _Node("pre-increment"); $$.add($2);}
			| AUTO_DECREMENTO varChain SEMI {$$ = new _Node("pre-decrement"); $$.add($2);}
			;

varChain : varChain DOT var {$$ = $1; $$.add($3); }
			| var {$$ = new _Node("varChain"); $$.add($1); }
			| TYPE DOT var {$$ = new _Node("varChain"); $$.add(Compiler.staticAccess(
					token_solver.build_token('type',$1,@1.first_line,@1.first_column),$3));}
			;
			
var : ID {$$ = Compiler.varNode(
					token_solver.build_token('id',$1,@1.first_line,@1.first_column),true,null);}
		| ID dimAccessL {$$ = Compiler.varNode(
					token_solver.build_token('id',$1,@1.first_line,@1.first_column),true,$2);}
		| ID LEFT_PAREN paramList RIGHT_PAREN dimAccessL {console.log('not implemented yet..');}
		| ID LEFT_PAREN paramList RIGHT_PAREN {$$ = Compiler.varNode(
					token_solver.build_token('id',$1,@1.first_line,@1.first_column),false,$3);}
		;
		
dimAccessL : dimAccessL LEFT_BRACKET Exp RIGHT_BRACKET {$$ = $1; $$.add($3);}
				| LEFT_BRACKET Exp RIGHT_BRACKET {$$ = new _Node("dimAccessL"); $$.add($2);}
				;
				
paramList : paramList COMMA Exp {$$ = $1; $$.add($3);}
			| Exp		{$$ = new _Node("paramList"); $$.add($1);}
			| /*Empty*/ {$$ = new _Node("paramList");}
			;

downcast : LEFT_PAREN TYPE RIGHT_PAREN {$$ = Compiler.downcast(token_solver.build_token('type',$2,@2.first_line,@2.first_column));};

Exp : 	Exp PLUS Exp {$$ = new _Node("+"); $$.add($1); $$.add($3); }
		| Exp MINUS Exp {$$ = new _Node("-"); $$.add($1); $$.add($3); }
		| Exp MULTIPLY Exp {$$ = new _Node("*"); $$.add($1); $$.add($3); }
		| Exp DIVIDE Exp {$$ = new _Node("/"); $$.add($1); $$.add($3); }
		| Exp MOD Exp {$$ = new _Node("%"); $$.add($1); $$.add($3); }
		| Exp MAYORQ Exp {$$ = new _Node(">"); $$.add($1); $$.add($3); }
		| Exp MENORQ Exp {$$ = new _Node("<"); $$.add($1); $$.add($3); }
		| Exp MAYORIGUAL Exp {$$ = new _Node(">="); $$.add($1); $$.add($3); }
		| Exp MENORIGUAL Exp {$$ = new _Node("<="); $$.add($1); $$.add($3); }
		| Exp COMPARACION Exp {$$ = new _Node("=="); $$.add($1); $$.add($3); }
		| Exp DISTINTO Exp {$$ = new _Node("!="); $$.add($1); $$.add($3); }
		| Exp AND Exp {$$ = new _Node("&&"); $$.add($1); $$.add($3); }
		| Exp OR Exp {$$ = new _Node("||"); $$.add($1); $$.add($3); }
		| MINUS Exp %prec UMINUS {$$ = new _Node("UMINUS"); $$.add($2); }
		| NOT Exp %prec UNOT {$$ = new _Node("NOT"); $$.add($2); }
		| downcast Exp %prec UDOWNCAST {$$ = $1; $$.add($2);}
		| AUTO_INCREMENTO Exp {$$ = new _Node("pre-increment"); $$.add($2); }
		| AUTO_DECREMENTO Exp {$$ = new _Node("pre-decrement"); $$.add($2); }
		| Exp AUTO_INCREMENTO %prec POST_INCREMENTO {$$ = new _Node("post-increment"); $$.add($1); }
		| Exp AUTO_DECREMENTO %prec POST_DECREMENTO {$$ = new _Node("post-decrement"); $$.add($1); }
		| LEFT_PAREN Exp RIGHT_PAREN {$$ = $2; }
		| LEFT_PAREN Exp RIGHT_PAREN TERNARIO Exp COLON Exp %prec UTERNARIO {$$ = new _Node("ternario");
		$$.add($2);
		$$.add($5);
		$$.add($7);
		}
		| atomic {$$ = $1;}
		;

atomic : INTEGER {$$ = Compiler.primitive(token_solver.build_token('integer',$1,@1.first_line,@1.first_column));}
		| DOUBLE {$$ = Compiler.primitive(token_solver.build_token('double',$1,@1.first_line,@1.first_column));}
		| STRING {$$ = Compiler.primitive(token_solver.build_token('string',$1,@1.first_line,@1.first_column));}
		| CHAR {$$ = Compiler.primitive(token_solver.build_token('char',$1,@1.first_line,@1.first_column));}
		| NULL {$$ = Compiler.primitive(token_solver.build_token('null',$1,@1.first_line,@1.first_column));}
		| BOOLEAN {$$ = Compiler.primitive(token_solver.build_token('boolean',$1,@1.first_line,@1.first_column));}
		| NEW TYPE LEFT_PAREN paramList RIGHT_PAREN {$$ = Compiler.NEW(token_solver.build_token('type',$2,@2.first_line,@2.first_column),$4);}
		| varChain {$$ = $1;}
		| inlineArrayDef {$$ = $1;}
		;

inlineArrayDef: LEFT_BRACE paramList RIGHT_BRACE {$$ = new _Node("inlineArrayDef"); $$.fuse($2);}
				| arrayInitialization {$$ = $1;}
				;

arrayInitialization : arrayInitialization LEFT_BRACKET Exp RIGHT_BRACKET {
					$$ = $1; $$.children[1].add($3);
					}
					| NEW TYPE LEFT_BRACKET Exp RIGHT_BRACKET {$$ = Compiler.arrayInitialization(
					token_solver.build_token('type',$2,@2.first_line,@2.first_column),$4);}
					;
