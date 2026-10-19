import { useGameStore } from "./state/store";
import { GetCassetteSubtitleAtTime, GetPhoneCallSubtitleAtTime, GetVHSSubtitleAtTime } from "./state/subtitledata";
import styles from "./subtitles.module.css";

export function Subtitles() {
    const tvSubtitle = useGameStore((s) => {
        if (s.widgets.tv.isRewinding && s.widgets.tv.currentTime) {
            return "[rewinding]";
        }
        return s.widgets.tv.hasTape && s.widgets.tv.isPlaying
            ? GetVHSSubtitleAtTime(s.widgets.tv.currentTime)?.subtitle
            : undefined;
    });
    const cassetteSubtitle = useGameStore((s) => {
        if (s.widgets.cassette.isRewinding && s.widgets.cassette.currentTime) {
            return "[rewinding]";
        }
        return s.widgets.cassette.tapeInside && s.widgets.cassette.isPlaying
            ? GetCassetteSubtitleAtTime(s.widgets.cassette.currentTime)?.subtitle
            : undefined;
    });
    const phoneCallSubtitle = useGameStore((s) => {
        return GetPhoneCallSubtitleAtTime(s.phoneCallCurrentTime)?.subtitle;
    });

    if (!tvSubtitle && !cassetteSubtitle && !phoneCallSubtitle) {
        return null;
    }
    return (
        <div className={styles.Subtitles}>
            {tvSubtitle}
            {cassetteSubtitle && tvSubtitle && <br />}
            {cassetteSubtitle}
            {phoneCallSubtitle}
        </div>
    );
}
