export interface Token {
  type: TokenType
  value: string
  start: number
  end: number
}

export enum TokenType {
  OPERATOR,
  KEYWORD,
  NEWLINE,
  EOL
}

const options = {
  operators: ['?', '!', '.'],
  keywords: [
    '몰',
    '모',
    '오',
    '올',
    '루',
    '아',
    '은?행',
    '털!자',
    '가',
    '자!',
    '0ㅅ0'
  ]
}

export class Lexer {
  index = 0
  tokens: Token[] = []
  constructor(public input: string) {
    this.tokenize()
  }

  tokenize() {
    while (this.index < this.input.length) {
      let char = this.input[this.index]
      if (char === ' ') {
        this.index++
        continue
      }
      if (char === '\n') {
        this.tokens.push({
          type: TokenType.NEWLINE,
          value: '\n',
          start: this.index,
          end: this.index
        })
        this.index++
        continue
      }
      if (options.operators.includes(char)) {
        this.tokens.push({
          type: TokenType.OPERATOR,
          value: char,
          start: this.index,
          end: this.index
        })
        this.index++
        continue
      }
      let findKeyword = true
      let keyword = ''
      while (findKeyword) {
        char = this.input[this.index]
        keyword += char
        if (
          (options.keywords.includes(keyword) && !keyword.startsWith('모')) ||
          (keyword.startsWith('모') && keyword.endsWith('올'))
        ) {
          this.tokens.push({
            type: TokenType.KEYWORD,
            value: keyword,
            start: this.index - keyword.length + 1,
            end: this.index
          })
          findKeyword = false
        }
        this.index++
        if (this.index >= this.input.length || keyword.length >= 3) {
          findKeyword = false
        }
      }
    }
    this.tokens.push({
      type: TokenType.EOL,
      value: '',
      start: this.index,
      end: this.index
    })
  }
}
