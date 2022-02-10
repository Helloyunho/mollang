import { Lexer } from './tokenizer.ts'

const lexer = new Lexer(`
몰??
모올??.?????

몰?루
아모올루

모오올은?행
모올루
털!자

가?자!`)

console.log(lexer.tokens)
