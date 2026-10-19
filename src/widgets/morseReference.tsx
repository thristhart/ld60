import styles from "./morseReference.module.css";
import type { WidgetProps } from "./widget";

const alphabet = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
];
const morseAlphabet = [
    ".-",
    "-...",
    "-.-.",
    "-..",
    ".",
    "..-.",
    "..-",
    "....",
    "..",
    ".---",
    "-.-",
    ".-..",
    "--",
    "-.",
    "---",
    ".--.",
    "--.-",
    ".-.",
    "...",
    "-",
    "..-",
    "...-",
    ".--",
    "-..-",
    "-.--",
    "--..",
];

let twoDArray: string[][] = [];
for (let r = 0; r < 13; r++) {
    twoDArray.push([alphabet[r], morseAlphabet[r], alphabet[r + 13], morseAlphabet[r + 13]]);
}

interface MorseReferenceProps extends WidgetProps {}

export function MorseReference(props: MorseReferenceProps) {
    return (
        <div>
            <div className={styles.MorseReferenceBackground}>
                {twoDArray.map((row, i) => {
                    return (
                        <div className={styles.MorseReferenceRow} key={i}>
                            {row.map((col, j) => (
                                <span className={styles.MorseReferenceCell} key={`${i}-${j}`}>
                                    {col}
                                </span>
                            ))}
                        </div>
                    );
                })}
            </div>
            ;
        </div>
    );
}
