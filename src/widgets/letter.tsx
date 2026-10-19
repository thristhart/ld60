import envelopeImage from "../assets/placeholder_envelope.png";
import styles from "./letter.module.css";
import type { WidgetProps } from "./widget";

export function LetterWidget(props: WidgetProps) {
    if (props.scaleDown) {
        return <img className={styles.envelope} src={envelopeImage} />;
    }
    return <LetterContents />;
}

function LetterContents() {
    return (
        <div className={styles.LetterContents}>
            <p>To my dear beloved cheddar biscuit,</p>
            <p>You've almost done it! The vast majority of my fortune will soon be yours.</p>
            <p>
                All that is required is for you to telegraph the secret word to my lawyer's office. Make sure the signal
                is properly routed through the phone switchboard.
            </p>
            <p>
                The secret word is you! <code>BISCUIT</code>.
            </p>
            <p>I'm so proud,</p>
            <p>Pappy</p>
        </div>
    );
}
