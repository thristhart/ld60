import { Scroller } from "@dnd-kit/dom";
import { DragDropProvider, useDragDropManager, useDraggable, useDroppable } from "@dnd-kit/react";
import classNames from "classnames";
import { use, useEffect } from "react";
import tvOverviewImgUrl from "../assets/placeholder_tv_overview.png";
import vhsPortraitImgUrl from "../assets/placeholder_vhs_portrait.png";
import tvImgUrl from "../assets/tv.png";
import vhsImgUrl from "../assets/vhs.png";
import { VHSAudioContext } from "../audiodevices";
import { useGameStore } from "../state/store";
import { Control } from "./Control";
import styles from "./tv.module.css";
import type { WidgetProps } from "./widget";

function VHSDropTarget() {
    const droppable = useDroppable({
        id: "vhsDrop",
    });
    return <div className={styles.VHSDropTarget} ref={droppable.ref}></div>;
}

function VHS() {
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
    return (
        <img
            className={styles.VHS}
            src={vhsImgUrl}
            ref={draggable.ref}
            data-cursor={draggable.isDragging ? "grab_closed" : "grab_open"}
        />
    );
}

interface TVProps extends WidgetProps {}
export function TV(props: TVProps) {
    const hasTape = useGameStore((s) => s.widgets.tv.hasTape);
    const setHasTape = useGameStore((s) => s.widgets.tv.setHasTape);

    const vhsAudio = use(VHSAudioContext);

    return (
        <div className={classNames(styles.TV, props.scaleDown && styles.ScaledDown)} inert={props.blockInteraction}>
            <DragDropProvider
                onDragEnd={(event) => {
                    if (event.canceled) {
                        return;
                    }
                    if (event.operation.target?.id === "vhsDrop") {
                        setHasTape(true);
                        vhsAudio.play();
                    }
                }}>
                <div className={styles.TVVideo}></div>
                {hasTape && <img className={styles.TVVideo} src={vhsPortraitImgUrl} inert />}
                <img className={styles.TVimg} src={props.scaleDown ? tvOverviewImgUrl : tvImgUrl} inert />
                <VHSDropTarget />
                {!props.scaleDown && hasTape && (
                    <Control onClick={vhsAudio.togglePlay} left={1700} top={800} width={130} height={120} />
                )}
                {!props.scaleDown && hasTape && (
                    <Control
                        left={1840}
                        top={800}
                        width={130}
                        height={120}
                        onDown={vhsAudio.rewind}
                        onUp={vhsAudio.stopRewind}
                    />
                )}
                {!props.scaleDown && !hasTape && <VHS />}
            </DragDropProvider>
        </div>
    );
}
