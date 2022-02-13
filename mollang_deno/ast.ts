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
  Condition,
  Goto,
  Exit
}

export type AST =
  | ValueASTs
  | ConsoleInAST
  | ConsoleOutAST
  | ConsoleConvertedOutAST
  | ConditionAST
  | GotoAST
  | ExitAST

export interface ProgramAST {
  type: ASTType.Program
  body: AST[]
}

export type ValueASTs = NumberOperatorAST | MultiplyOperatorAST | VariableAST

export interface NumberOperatorAST {
  type: ASTType.NumberOperator
  opType: '+' | '-'
  chain?: ValueASTs
}

export interface MultiplyOperatorAST {
  type: ASTType.MultiplyOperator
  left: ValueASTs
  right: ValueASTs
}

export interface VariableAST {
  type: ASTType.Variable
  index: number
  chain?: ValueASTs
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

export interface GotoAST {
  type: ASTType.Goto
  line: ValueASTs
}

export interface ExitAST {
  type: ASTType.Exit
  code: ValueASTs
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

  checkToken(
    types: TokenType[],
    values: string[] = [],
    error = true,
    skipLine = false
  ): boolean {
    while (true) {
      const token = this.getToken()
      if (token === undefined) {
        if (types.includes(TokenType.EOL)) {
          return true
        } else {
          if (error) {
            throw new Error(`Unexpected EOL`)
          } else {
            return false
          }
        }
      }
      if (skipLine && token.type === TokenType.NEWLINE) {
        this.index++
        continue
      }
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
      const chain = this.parseValue(false)
      if (chain !== undefined) {
        ast.chain = chain
      }

      return ast
    }
  }

  parseMultiplyOp(left?: ValueASTs, error?: true): MultiplyOperatorAST
  parseMultiplyOp(
    left?: ValueASTs,
    error?: false
  ): MultiplyOperatorAST | undefined
  parseMultiplyOp(
    left?: ValueASTs,
    error?: boolean
  ): MultiplyOperatorAST | undefined
  parseMultiplyOp(
    left?: ValueASTs,
    error = true
  ): MultiplyOperatorAST | undefined {
    left = left ?? this.parseValue(error)
    if (left) {
      if (this.checkToken([TokenType.OPERATOR], ['.'], error)) {
        this.index++
        const right = this.parseValue()
        const ast: MultiplyOperatorAST = {
          type: ASTType.MultiplyOperator,
          left,
          right
        }

        return ast
      }
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
      ast.chain = this.parseValue(false)

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
    let value: ValueASTs | undefined
    if (token) {
      if (token.type === TokenType.KEYWORD) {
        value = this.parseVariable(error)
      } else {
        value = this.parseNumberOp(error)
      }

      if (
        value !== undefined &&
        this.checkToken([TokenType.OPERATOR], ['.'], false)
      ) {
        return this.parseMultiplyOp(value, error)
      } else {
        return value
      }
    }
  }

  parseConsoleIn(error?: true, left?: VariableAST): ConsoleInAST
  parseConsoleIn(error?: false, left?: VariableAST): ConsoleInAST | undefined
  parseConsoleIn(error?: boolean, left?: VariableAST): ConsoleInAST | undefined
  parseConsoleIn(error = true, left?: VariableAST): ConsoleInAST | undefined {
    const toVariable = left ?? this.parseVariable(error)
    if (toVariable) {
      if (this.checkToken([TokenType.KEYWORD], ['루'], error)) {
        this.index++
        if (this.checkToken([TokenType.OPERATOR], ['?'], error)) {
          this.index++
          const ast: ConsoleInAST = {
            type: ASTType.ConsoleIn,
            to: toVariable
          }

          return ast
        }
        this.index--
      }
    }
  }

  parseConsoleOut(error?: true, left?: ValueASTs): ConsoleOutAST
  parseConsoleOut(error?: false, left?: ValueASTs): ConsoleOutAST | undefined
  parseConsoleOut(error?: boolean, left?: ValueASTs): ConsoleOutAST | undefined
  parseConsoleOut(error = true, left?: ValueASTs): ConsoleOutAST | undefined {
    const value = left ?? this.parseValue(error)
    if (value) {
      if (this.checkToken([TokenType.KEYWORD], ['루'], error)) {
        this.index++
        const ast: ConsoleOutAST = {
          type: ASTType.ConsoleOut,
          value
        }

        return ast
      }
    }
  }

  parseConsoleConvertedOut(error?: true): ConsoleConvertedOutAST
  parseConsoleConvertedOut(error?: false): ConsoleConvertedOutAST | undefined
  parseConsoleConvertedOut(error?: boolean): ConsoleConvertedOutAST | undefined
  parseConsoleConvertedOut(error = true): ConsoleConvertedOutAST | undefined {
    if (this.checkToken([TokenType.KEYWORD], ['아'], error)) {
      this.index++
      const value = this.parseValue(error)
      if (value) {
        this.checkToken([TokenType.KEYWORD], ['루'])
        this.index++
        const ast: ConsoleConvertedOutAST = {
          type: ASTType.ConsoleConvertedOut,
          value
        }

        return ast
      }
    }
  }

  parseCondition(error?: true, left?: ValueASTs): ConditionAST
  parseCondition(error?: false, left?: ValueASTs): ConditionAST | undefined
  parseCondition(error?: boolean, left?: ValueASTs): ConditionAST | undefined
  parseCondition(error = true, left?: ValueASTs): ConditionAST | undefined {
    const condition = left ?? this.parseValue(error)
    if (condition) {
      if (this.checkToken([TokenType.KEYWORD], ['은?행'], error, true)) {
        this.index++
        const body = this.parseCodes()
        this.checkToken([TokenType.KEYWORD], ['털!자'], true, true)
        this.index++
        const ast: ConditionAST = {
          type: ASTType.Condition,
          condition,
          body
        }

        return ast
      }
    }
  }

  parseGoto(error?: true): GotoAST
  parseGoto(error?: false): GotoAST | undefined
  parseGoto(error?: boolean): GotoAST | undefined
  parseGoto(error = true): GotoAST | undefined {
    if (this.checkToken([TokenType.KEYWORD], ['가'], error)) {
      this.index++
      const line = this.parseValue(error)
      if (line) {
        this.checkToken([TokenType.KEYWORD], ['자!'])
        this.index++
        const ast: GotoAST = {
          type: ASTType.Goto,
          line
        }

        return ast
      }
    }
  }

  parseExit(error?: true): ExitAST
  parseExit(error?: false): ExitAST | undefined
  parseExit(error?: boolean): ExitAST | undefined
  parseExit(error = true): ExitAST | undefined {
    if (this.checkToken([TokenType.KEYWORD], ['0ㅅ0'], error)) {
      this.index++
      const code = this.parseValue(error)
      if (code) {
        const ast: ExitAST = {
          type: ASTType.Exit,
          code
        }
        this.index++

        return ast
      }
    }
  }

  convertOutToIn(outAST: ConsoleOutAST): ConsoleInAST {
    if (outAST.value.type === ASTType.Variable) {
      const ast: ConsoleInAST = {
        type: ASTType.ConsoleIn,
        to: outAST.value
      }
      return ast
    } else {
      throw new Error('ConsoleOut AST value is not Variable.')
    }
  }

  parseCodes(): AST[] {
    const asts: AST[] = []
    while (true) {
      if (
        this.checkToken(
          [TokenType.KEYWORD, TokenType.OPERATOR],
          ['몰', '모', '?', '!'],
          false
        )
      ) {
        const value = this.parseValue()
        if (this.checkToken([TokenType.KEYWORD], ['루'], false)) {
          const consoleOut = this.parseConsoleOut(true, value)
          if (
            value.type === ASTType.Variable &&
            this.checkToken([TokenType.OPERATOR], ['?'], false)
          ) {
            const consoleIn = this.convertOutToIn(consoleOut)
            this.index++
            asts.push(consoleIn)
            continue
          } else {
            asts.push(consoleOut)
            continue
          }
        } else if (this.checkToken([TokenType.KEYWORD], ['은?행'], false)) {
          const condition = this.parseCondition(true, value)
          asts.push(condition)
          continue
        } else {
          asts.push(value)
          continue
        }
      } else if (this.checkToken([TokenType.KEYWORD], ['아'], false)) {
        asts.push(this.parseConsoleConvertedOut())
        continue
      } else if (this.checkToken([TokenType.KEYWORD], ['가'], false)) {
        asts.push(this.parseGoto())
        continue
      } else if (this.checkToken([TokenType.KEYWORD], ['0ㅅ0'], false)) {
        asts.push(this.parseExit())
        continue
      } else if (this.checkToken([TokenType.NEWLINE], undefined, false)) {
        this.index++
        continue
      }
      break
    }

    return asts
  }

  parseProgram(): ProgramAST {
    let asts: AST[] = []
    let lastASTs = this.parseCodes()
    while (lastASTs.length !== 0) {
      asts = [...asts, ...lastASTs]
      lastASTs = this.parseCodes()
    }

    return {
      type: ASTType.Program,
      body: asts
    }
  }
}
