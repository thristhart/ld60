import { useGameStore } from "./state/store";
import { GetVHSSubtitleAtTime } from "./state/subtitledata";
import styles from "./subtitles.module.css";

export function Subtitles() {
    const isTvPlaying = useGameStore((s) => s.widgets.tv.isPlaying);
    const tvSubtitle = useGameStore((s) => GetVHSSubtitleAtTime(s.widgets.tv.currentTime));
    const currentTime = useGameStore((s) => s.widgets.tv.currentTime);

    // if (!tvSubtitle) {
    //     return null;
    // }
    return (
        <div className={styles.Subtitles}>
            {currentTime?.toFixed(2)}
            <br /> {tvSubtitle?.subtitle}
        </div>
    );
}
