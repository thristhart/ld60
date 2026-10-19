import { Scroller } from "@dnd-kit/dom";
import { DragDropProvider, useDragDropManager, useDraggable, useDroppable } from "@dnd-kit/react";
import classNames from "classnames";
import { use, useEffect } from "react";
import tvOverviewImgUrl from "../assets/placeholder_tv_overview.png";
import tvImgUrl from "../assets/tv.png";
import vhsImgBackgroundURL from "../assets/tv_background.png";
import vhsImgGrampsURL from "../assets/tv_gramps.png";
import vhsImgLawyerURL from "../assets/tv_lawyer.png";
import vhsImgScanlinesURL from "../assets/tv_scanlines.png";
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

interface VHSProps {
    scaleDown: boolean | undefined;
}
function VHS(props: VHSProps) {
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
            ref={props.scaleDown ? undefined : draggable.ref}
            data-cursor={draggable.isDragging ? "grab_closed" : "grab_open"}
        />
    );
}

interface VHSImageProps extends WidgetProps {}
function VHSImage(props: VHSImageProps) {
    const audioProgress = useGameStore((s) => s.widgets.tv.currentTime);
    const playing = useGameStore((s) => s.widgets.tv.isPlaying);
    const IsGrampsTime = (audioProgress ?? 0) > 35.2;

    return (
        <div className={styles.TVVideo}>
            <img className={styles.TVVideoInternal} src={vhsImgBackgroundURL} inert />
            {!IsGrampsTime && (
                <img className={classNames(styles.TVVideoInternal, styles.TVVideoLawyer)} src={vhsImgLawyerURL} inert />
            )}
            {IsGrampsTime && (
                <img className={classNames(styles.TVVideoInternal, styles.TVVideoGramps)} src={vhsImgGrampsURL} inert />
            )}
            <img
                className={classNames(styles.TVVideoInternal, styles.TVVideoScanlines, playing ? styles.Playing : "")}
                src={vhsImgScanlinesURL}
                inert
            />
        </div>
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
                {hasTape && <VHSImage />}
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
                {!hasTape && <VHS scaleDown={props.scaleDown} />}
            </DragDropProvider>
        </div>
    );
}
