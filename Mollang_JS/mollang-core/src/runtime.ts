import { Tokenized, LiteralParsed, KEY } from "./tokenizer";
import { Compiled } from "./compile";
import { Errors } from "./exit";

let error: (code: number, position: number) => void;

export class ENV {
    variables = new Map<number, number>();
    runtimeStack: number[] = [];
}

function calc(env: ENV, data: LiteralParsed, idx: number, position: number) {
    if (data.content[0] === KEY.MULTIPLY) {
        error(Errors.WRONG_MULTIPLY, position);
    }
    if (data.content[data.content.length - 1] === KEY.MULTIPLY) {
        error(Errors.WRONG_MULTIPLY, position);
    }

    let ans = 1;
    let cur = 0;

    for (let i = idx; i < data.content.length; i++) {
        if (data.content[i] === KEY.MULTIPLY) {
            ans *= cur;
            cur = 0;
        } else if (data.content[i] === KEY.PLUS) {
            cur++;
        } else if (data.content[i] === KEY.MINUS) {
            cur--;
        } else {
            if (env.variables.get(data.content[i]) === undefined) {
                error(Errors.UNDEFINED_VARIABLE, position);
            } else {
                cur += Number(env.variables.get(data.content[i]));
            }
        }
    }
    ans *= cur;

    return ans;
}

function assign(env: ENV, data: LiteralParsed, position: number) {
    if (data.content[0] <= 0) {
        error(Errors.WRONG_EXPRESSION, position);
    }
    if (data.content[data.content.length - 1] === KEY.MULTIPLY) {
        error(Errors.WRONG_EXPRESSION, position);
    }
    if (data.content.length === 1) {
        env.variables.set(data.content[0], 0);
        return;
    }

    if (env.variables.get(data.content[0]) !== undefined) {
        let tmp = Number(env.variables.get(data.content[0]));
        if (data.content[1] === KEY.MULTIPLY) {
            let value = calc(env, data, 2, position);
            env.variables.set(data.content[0], tmp * value);
        } else {
            let value = calc(env, data, 1, position);
            env.variables.set(data.content[0], tmp + value);
        }
    } else {
        if (data.content[1] === KEY.MULTIPLY) {
            error(Errors.WRONG_MULTIPLY, position);
        }
        let value = calc(env, data, 1, position);
        env.variables.set(data.content[0], value);
    }
}

export default function run(
    env: ENV,
    data: Tokenized,
    compiled: Compiled,
    maxRecursion: number,
    outputFn: (msg: string) => void,
    errorFn: (code: number, position: number) => void,
    inputFn: () => string
) {
    error = errorFn;
    let recursions = [];
    for (let i = 0; i <= data.gotoPoint.length; i++) {
        recursions.push(0);
    }
    for (let i = 0; i < data.tokens.length; i++) {
        let token = data.tokens[i];
        if (token[0] === KEY.LITERAL) {
            if (compiled.no_calc[token[1]]) {
                continue;
            }
            if (compiled.literal_owned[token[1]]) {
                env.runtimeStack.push(
                    calc(env, data.literals[token[1]], 0, data.tokens_position[i])
                );
            } else {
                assign(env, data.literals[token[1]], data.tokens_position[i]);
            }
        } else if (token[0] >= KEY.PAIR_KEYWORD) {
            if (token[1] === i) {
                error(Errors.MISSING_MID_PARAMETER, data.tokens_position[i]);
            }
            if (token[0] === KEY.PAIR_KEYWORD + 1) {
                if (env.runtimeStack[env.runtimeStack.length - 1] !== 0) {
                    i = token[1];
                }
                env.runtimeStack.pop();
            } else {
                if (token[1] > i + 1) {
                    error(Errors.WRONG_PARAMETER, data.tokens_position[i]);
                }
                if (data.tokens[i + 1][0] !== KEY.LITERAL) {
                    error(Errors.WRONG_PARAMETER, data.tokens_position[i]);
                }
                let midParam = calc(
                    env,
                    data.literals[data.tokens[i + 1][1]],
                    0,
                    data.tokens_position[i]
                );
                if (token[0] === KEY.PAIR_KEYWORD) {
                    outputFn(String.fromCharCode(midParam));
                } else if (token[0] === KEY.PAIR_KEYWORD + 2) {
                    i = data.gotoPoint[midParam - 1] - 1;
                    if (++recursions[midParam - 1] > maxRecursion) {
                        error(Errors.MAX_RECURSION, data.tokens_position[i]);
                    }
                }
            }
        } else {
            if (token[0] === 0) {
                let tmp = Number(inputFn());
                if (i === 0) {
                    error(Errors.MISSING_PARAMETER, data.tokens_position[i]);
                }
                if (data.literals[data.tokens[i - 1][1]].content.length >= 2) {
                    error(Errors.WRONG_PARAMETER, data.tokens_position[i]);
                }
                if (data.literals[data.tokens[i - 1][1]].content[0] <= 0) {
                    error(Errors.WRONG_PARAMETER, data.tokens_position[i]);
                }
                env.variables.set(data.literals[data.tokens[i - 1][1]].content[0], tmp);
            }
            if (token[0] === 1) {
                outputFn(env.runtimeStack[env.runtimeStack.length - 1].toString());
                env.runtimeStack.pop();
            }
            if (token[0] === 2) {
                if (i + 1 < data.tokens.length && data.tokens[i + 1][0] === KEY.LITERAL) {
                    return calc(
                        env,
                        data.literals[data.tokens[i + 1][1]],
                        0,
                        data.tokens_position[i]
                    );
                } else {
                    return 0;
                }
            }
        }
    }

    return 0;
}
