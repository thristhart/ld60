import classNames from "classnames";
import morsePosterImgUrl from "../assets/morse_poster.png";
import styles from "./morseReference.module.css";
import type { WidgetProps } from "./widget";

interface MorseReferenceProps extends WidgetProps {}

export function MorseReference(props: MorseReferenceProps) {
    return (
        <img className={classNames(styles.MorsePoster, props.scaleDown && styles.ScaledDown)} src={morsePosterImgUrl} />
    );
}
