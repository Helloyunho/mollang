import type { Token } from './tokenizer.ts'
import { TokenType } from './tokenizer.ts'

export enum ASTType {
  Program,
  NumberOperator,
  MultiplyOperator,
  Variable,
  ConsoleOut,
  ConsoleIn,
  ConsoleConvertedOut,
  Condition
}

export type AST =
  | ProgramAST
  | ValueASTs
  | ConsoleInAST
  | ConsoleOutAST
  | ConsoleConvertedOutAST
  | ConditionAST

export interface ProgramAST {
  type: ASTType.Program
  body: AST[]
}

export type ValueASTs = NumberOperatorAST | MultiplyOperatorAST | VariableAST

export interface NumberOperatorAST {
  type: ASTType.NumberOperator
  opType: '+' | '-'
  chain?: NumberOperatorAST
}

export interface MultiplyOperatorAST {
  type: ASTType.MultiplyOperator
  left: ValueASTs
  right: ValueASTs
}

export interface VariableAST {
  type: ASTType.Variable
  assign?: ValueASTs
}

export interface ConsoleInAST {
  type: ASTType.ConsoleIn
  to: VariableAST
}

export interface ConsoleOutAST {
  type: ASTType.ConsoleOut
  value: ValueASTs
}

export interface ConsoleConvertedOutAST {
  type: ASTType.ConsoleConvertedOut
  value: ValueASTs
}

export interface ConditionAST {
  type: ASTType.Condition
  condition: ValueASTs
  body: AST[]
}

export class ASTParser {
  tokens: Token[] = []
  index = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  getToken(): Token {
    return this.tokens[this.index]
  }

  checkToken(type: TokenType, values: string[] = [], error = true): boolean {
    const token = this.getToken()
    if (token.type !== type) {
      if (error) {
        throw new Error(
          `Expected ${TokenType[type]}, but got ${TokenType[token.type]}`
        )
      } else {
        return false
      }
    } else if (values.length !== 0 && !values.includes(token.value)) {
      if (error) {
        throw new Error(
          `Expected syntax between ${values}, but got ${token.value}`
        )
      } else {
        return false
      }
    }
    return true
  }

  checkAndGetToken(type: TokenType, values?: string[], error?: true): Token
  checkAndGetToken(
    type: TokenType,
    values?: string[],
    error?: false
  ): Token | undefined
  checkAndGetToken(
    type: TokenType,
    values?: string[],
    error = true
  ): Token | undefined {
    if (this.checkToken(type, values, error)) {
      return this.getToken()
    }
  }

  parseNumberOp(): NumberOperatorAST {
    const token = this.checkAndGetToken(TokenType.OPERATOR, ['?', '!'])
    const ast: NumberOperatorAST = {
      type: ASTType.NumberOperator,
      opType: token.value === '?' ? '+' : '-'
    }

    this.index++
    if (this.checkToken(TokenType.OPERATOR, ['?', '!'], false)) {
      ast.chain = this.parseNumberOp()
    }

    return ast
  }
}
