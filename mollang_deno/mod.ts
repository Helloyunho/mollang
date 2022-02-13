import { Lexer } from './tokenizer.ts'
import { ASTParser } from './ast.ts'

const lexer = new Lexer(`
몰??
모올??.?????

몰루
아모올루

모오올은?행
모올루
털!자

가?자!`)

const test = new Lexer(`몰루?모올루?몰모올루`)
Deno.writeFile(
  'token.json',
  new TextEncoder().encode(JSON.stringify(test.tokens, null, 2))
)
const ast = new ASTParser(test.tokens)
Deno.writeFile(
  'ast.json',
  new TextEncoder().encode(JSON.stringify(ast.parseProgram(), null, 2))
)
