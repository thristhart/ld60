import { useGameStore } from "./state/store";
import { GetCassetteSubtitleAtTime, GetVHSSubtitleAtTime } from "./state/subtitledata";
import styles from "./subtitles.module.css";

export function Subtitles() {
    const tvSubtitle = useGameStore((s) => GetVHSSubtitleAtTime(s.widgets.tv.currentTime));
    const cassetteSubtitle = useGameStore((s) => GetCassetteSubtitleAtTime(s.widgets.cassette.currentTime));

    if (!tvSubtitle && !cassetteSubtitle) {
        return null;
    }
    return (
        <div className={styles.Subtitles}>
            {tvSubtitle?.subtitle}
            {cassetteSubtitle && tvSubtitle && <br />}
            {cassetteSubtitle?.subtitle}
        </div>
    );
}
