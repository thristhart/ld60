import cassettePlayerImgUrl from "../assets/placeholder_cassette_player.png";
import styles from "./cassetteplayer.module.css";
import type { WidgetProps } from "./widget";

interface CassetteProps extends WidgetProps {}
export function CassettePlayer(props: CassetteProps) {
    if (props.scaleDown) {
        return <img src={cassettePlayerImgUrl} />;
    }
    return <img src={cassettePlayerImgUrl} className={styles.CassettePlayerWidget} />;
}
