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
            <p>Cheddar,</p>
            <p>You've done well so far. Finally, I ask you to simply send a telegraph message.</p>
            <p>
                Use the switchboard to connect the telegraph key to the offices of the executor of my will, PLACEHOLDER
                LAWYER FIRST NAME.
            </p>
            <p>
                Once he has received from you the password <code>BISCUIT</code>, he will call you to arrange your
                inheritance.
            </p>
            <p>I'm so proud,</p>
            <p>Grandpa.</p>
        </div>
    );
}
