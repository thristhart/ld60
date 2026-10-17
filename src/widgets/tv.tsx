import tvImgUrl from "../assets/tv.png";
import styles from "./tv.module.css";

interface TVProps {}
export function TV(props: TVProps) {
    return (
        <div className={styles.TV}>
            <img src={tvImgUrl} />
        </div>
    );
}
