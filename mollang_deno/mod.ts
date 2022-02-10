import { Lexer } from './tokenizer.ts'
import { ASTParser } from './ast.ts'

const lexer = new Lexer(`
몰??
모올??.?????

몰?루
아모올루

모오올은?행
모올루
털!자

가?자!`)

const test = new Lexer('모오올루')
console.log(test.tokens)
const ast = new ASTParser(test.tokens)
console.log(
  Deno.inspect(ast.parseConsoleOut(), {
    depth: Infinity,
    colors: true
  })
)
