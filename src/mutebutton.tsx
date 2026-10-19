import styles from "./mutebutton.module.css";
import { useGameStore } from "./state/store";

export function MuteButton() {
    const muted = useGameStore((s) => s.muted);
    const setMuted = useGameStore((s) => s.setMuted);
    const volume = useGameStore((s) => s.volume);
    const setVolume = useGameStore((s) => s.setVolume);

    return (
        <div className={styles.volumecontrols}>
            <button className={styles.MuteButton} onClick={() => setMuted(!muted)}>
                {muted ? "🔇" : "🔉"}
            </button>
            <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(e) => setVolume(e.target.valueAsNumber)}
            />
        </div>
    );
}
