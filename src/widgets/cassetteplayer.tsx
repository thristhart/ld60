import { Scroller } from "@dnd-kit/dom";
import { DragDropProvider, useDragDropManager, useDraggable, useDroppable } from "@dnd-kit/react";
import { use, useEffect } from "react";
import cassetteTapeImgUrl from "../assets/cassette.png";
import cassettePlayerButtonsImgUrl from "../assets/cassette_player_buttons.png";
import cassettePlayerClosedImgUrl from "../assets/cassette_player_closed.png";
import cassettePlayerOpenImgUrl from "../assets/cassette_player_open.png";
import pauseButtonImgUrl from "../assets/cassette_player_pause.png";
import playButtonImgUrl from "../assets/cassette_player_play.png";
import rewindButtonImgUrl from "../assets/cassette_player_rewind.png";
import stopButtonImgUrl from "../assets/cassette_player_stop.png";
import { CassetteAudioContext } from "../audiodevices";
import { useGameStore } from "../state/store";
import styles from "./cassetteplayer.module.css";
import { Control } from "./Control";
import type { WidgetProps } from "./widget";

interface CassetteProps extends WidgetProps {}
export function CassettePlayer(props: CassetteProps) {
    const cassetteTapeInsidePlayer = useGameStore((s) => s.widgets.cassette.tapeInside);
    const playerHasCassette = useGameStore((s) => s.hasCasetteTape);
    const insertTape = useGameStore((s) => s.widgets.cassette.insertTape);
    const eject = useGameStore((s) => s.widgets.cassette.eject);

    const cassetteAudio = use(CassetteAudioContext);

    if (props.scaleDown) {
        return (
            <div className={styles.ScaledDown}>
                <img
                    className={styles.CassetteImage}
                    src={cassetteTapeInsidePlayer ? cassettePlayerClosedImgUrl : cassettePlayerOpenImgUrl}
                />
                <img className={styles.CassetteButtons} src={cassettePlayerButtonsImgUrl} />
            </div>
        );
    }
    return (
        <div>
            <DragDropProvider
                onDragEnd={(event) => {
                    if (event.canceled) {
                        return;
                    }
                    if (event.operation.target?.id === "cassetteDrop") {
                        insertTape();
                    }
                }}>
                <CassettePlayerDropTarget />
                <img
                    src={cassetteTapeInsidePlayer ? cassettePlayerClosedImgUrl : cassettePlayerOpenImgUrl}
                    className={styles.CassettePlayerWidget}
                    inert
                />
                {!cassetteTapeInsidePlayer && (
                    <img src={cassettePlayerButtonsImgUrl} className={styles.CassetteButtons} inert />
                )}
                {cassetteTapeInsidePlayer && (
                    <>
                        <Control
                            width={130}
                            height={130}
                            top={835}
                            left={905}
                            onDown={cassetteAudio.rewind}
                            onUp={cassetteAudio.stopRewind}>
                            <img src={rewindButtonImgUrl} />
                        </Control>
                        <Control width={100} height={130} top={855} left={1025} onClick={cassetteAudio.pause}>
                            <img src={pauseButtonImgUrl} />
                        </Control>
                        <Control
                            width={110}
                            height={130}
                            top={875}
                            left={1140}
                            onClick={() => {
                                cassetteAudio.pause();
                                eject();
                            }}>
                            <img src={stopButtonImgUrl} />
                        </Control>
                        <Control width={130} height={130} top={898} left={1260} onClick={cassetteAudio.play}>
                            <img src={playButtonImgUrl} />
                        </Control>
                    </>
                )}
                {playerHasCassette && <DraggableCassetteTape />}
            </DragDropProvider>
        </div>
    );
}

function CassettePlayerDropTarget() {
    const droppable = useDroppable({
        id: "cassetteDrop",
    });
    return <div className={styles.DropTarget} ref={droppable.ref}></div>;
}
function DraggableCassetteTape() {
    const draggable = useDraggable({
        id: "vhs",
    });
    const manager = useDragDropManager();
    manager?.registry.plugins.get(Scroller)?.disable();
    if (draggable.isDragging) {
        document.documentElement.dataset.cursor = "grab_closed";
    } else {
        delete document.documentElement.dataset.cursor;
    }
    useEffect(() => {
        return () => {
            delete document.documentElement.dataset.cursor;
        };
    }, []);
    return <img className={styles.DraggableTape} src={cassetteTapeImgUrl} ref={draggable.ref} />;
}

export function CassetteTape() {
    return <img className={styles.NonDraggableTape} src={cassetteTapeImgUrl} />;
}
