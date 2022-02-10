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
  index: number
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

  checkToken(types: TokenType[], values: string[] = [], error = true): boolean {
    const token = this.getToken()
    if (!types.includes(token.type)) {
      if (error) {
        throw new Error(`Expected ${types}, but got ${TokenType[token.type]}`)
      } else {
        return false
      }
    } else if (
      values.length !== 0 &&
      !values.some((v) => token.value.startsWith(v))
    ) {
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

  checkAndGetToken(types: TokenType[], values?: string[], error?: true): Token
  checkAndGetToken(
    types: TokenType[],
    values?: string[],
    error?: false
  ): Token | undefined
  checkAndGetToken(
    types: TokenType[],
    values?: string[],
    error?: boolean
  ): Token | undefined
  checkAndGetToken(
    types: TokenType[],
    values?: string[],
    error = true
  ): Token | undefined {
    if (this.checkToken(types, values, error)) {
      return this.getToken()
    }
  }

  parseNumberOp(error?: true): NumberOperatorAST
  parseNumberOp(error?: false): NumberOperatorAST | undefined
  parseNumberOp(error?: boolean): NumberOperatorAST | undefined
  parseNumberOp(error = true): NumberOperatorAST | undefined {
    const token = this.checkAndGetToken([TokenType.OPERATOR], ['?', '!'], error)
    if (token) {
      const ast: NumberOperatorAST = {
        type: ASTType.NumberOperator,
        opType: token.value === '?' ? '+' : '-'
      }

      this.index++
      if (this.checkToken([TokenType.OPERATOR], ['?', '!'], false)) {
        ast.chain = this.parseNumberOp()
      }

      return ast
    }
  }

  parseMultiplyOp(left?: NumberOperatorAST, error?: true): MultiplyOperatorAST
  parseMultiplyOp(
    left?: NumberOperatorAST,
    error?: false
  ): MultiplyOperatorAST | undefined
  parseMultiplyOp(
    left?: NumberOperatorAST,
    error?: boolean
  ): MultiplyOperatorAST | undefined
  parseMultiplyOp(
    left?: NumberOperatorAST,
    error = true
  ): MultiplyOperatorAST | undefined {
    left = left ?? this.parseNumberOp(error)
    if (left) {
      if (this.checkToken([TokenType.OPERATOR], ['.'], error)) {
        this.index++
        const right = this.parseNumberOp()
        this.index++
        const ast: MultiplyOperatorAST = {
          type: ASTType.MultiplyOperator,
          left,
          right
        }

        return ast
      }
    }
  }

  parseMultiplyOrNumberOp(error?: true): NumberOperatorAST | MultiplyOperatorAST
  parseMultiplyOrNumberOp(
    error?: false
  ): NumberOperatorAST | MultiplyOperatorAST | undefined
  parseMultiplyOrNumberOp(
    error?: boolean
  ): NumberOperatorAST | MultiplyOperatorAST | undefined
  parseMultiplyOrNumberOp(
    error = true
  ): NumberOperatorAST | MultiplyOperatorAST | undefined {
    const num = this.parseNumberOp(error)
    if (this.checkToken([TokenType.OPERATOR], ['.'], false)) {
      return this.parseMultiplyOp(num)
    } else {
      return num
    }
  }

  parseVariable(error?: true): VariableAST
  parseVariable(error?: false): VariableAST | undefined
  parseVariable(error?: boolean): VariableAST | undefined
  parseVariable(error = true): VariableAST | undefined {
    const token = this.checkAndGetToken(
      [TokenType.KEYWORD],
      ['몰', '모'],
      error
    )
    if (token) {
      const ast: VariableAST = {
        type: ASTType.Variable,
        index: token.value.length - 1
      }

      this.index++
      ast.assign = this.parseMultiplyOrNumberOp(false)

      return ast
    }
  }

  parseValue(error?: true): ValueASTs
  parseValue(error?: false): ValueASTs | undefined
  parseValue(error?: boolean): ValueASTs | undefined
  parseValue(error = true): ValueASTs | undefined {
    const token = this.checkAndGetToken(
      [TokenType.KEYWORD, TokenType.OPERATOR],
      ['몰', '모', '?', '!'],
      error
    )
    if (token) {
      if (token.type === TokenType.KEYWORD) {
        return this.parseVariable(error)
      } else {
        return this.parseMultiplyOrNumberOp(error)
      }
    }
  }

  parseConsoleIn(error?: true): ConsoleInAST
  parseConsoleIn(error?: false): ConsoleInAST | undefined
  parseConsoleIn(error?: boolean): ConsoleInAST | undefined
  parseConsoleIn(error = true): ConsoleInAST | undefined {
    const toVariable = this.parseVariable(error)
    if (toVariable) {
      if (this.checkToken([TokenType.KEYWORD], ['루'], error)) {
        this.index++
        if (this.checkToken([TokenType.OPERATOR], ['?'], error)) {
          this.index++
          const ast: ConsoleInAST = {
            type: ASTType.ConsoleIn,
            to: toVariable
          }
          this.index++

          return ast
        }
        this.index--
      }
    }
  }

  parseConsoleOut(error?: true): ConsoleOutAST
  parseConsoleOut(error?: false): ConsoleOutAST | undefined
  parseConsoleOut(error?: boolean): ConsoleOutAST | undefined
  parseConsoleOut(error = true): ConsoleOutAST | undefined {
    const value = this.parseValue(error)
    if (value) {
      if (this.checkToken([TokenType.KEYWORD], ['루'], error)) {
        this.index++
        const ast: ConsoleOutAST = {
          type: ASTType.ConsoleOut,
          value
        }
        this.index++

        return ast
      }
    }
  }
}
