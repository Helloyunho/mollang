import exitMessage from "./exit.js";
import readline from "readline-sync";

export default function run(x) {
    let runtime = [];
    let vars = [];
    let characterPrint = false;

    for (let i = 0; i < x.tokens.length; i++) {
        let cur = x.tokens[i];
        let f = cur[0];
        let s = cur[1];
        let t = cur[2];

        if (f == 1) {
            runtime.push(s);
        } else if (f == 2) {
            if (vars[s] != null) {
                vars[s] += t;
            } else {
                vars[s] = t;
            }
        } else if (f == 3) {
            if (!runtime) {
                exitMessage(3, "", []);
            }
            if (characterPrint) {
                process.stdout.write(
                    String.fromCharCode(runtime[runtime.length - 1])
                );
            } else {
                process.stdout.write(String(runtime[runtime.length - 1]));
            }
            runtime.pop();
            characterPrint = false;
        } else if (f == 4) {
            let tmp = readline.question();
            vars[s] = tmp;
        } else if (f == 5) {
            characterPrint = true;
        } else if (f == 7) {
            if (!runtime) {
                exitMessage(3, "", []);
            }
            i = x.line_backpoint[runtime[0] - 1] - 1;
            runtime.pop();
        } else if (f == 8) {
            if (vars[s] != null) {
                runtime.push(vars[s]);
            } else {
                vars[s] = 0;
            }
        } else if (f == 9) {
            if (!runtime) {
                exitMessage(3, "", []);
            }
            if (runtime[0] != 0) {
                i = s - 1;
            }
            runtime.pop();
        } else if (f == 10) {
            if (s == 0) {
                return t;
            } else {
                return vars[t];
            }
        }
    }

    return 0;
}
