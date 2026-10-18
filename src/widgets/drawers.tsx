import { Howl } from "howler";
import { useState } from "react";
import rattleSoundUrl from "../assets/audio/drawer locked.mp3";
import drawerExpandedImgUrl from "../assets/placeholder_drawer_open.png";
import leftDrawerOpenImgUrl from "../assets/placeholder_leftdrawer_open.png";
import rightDrawerOpenImgUrl from "../assets/placeholder_rightdrawer_open.png";
import rightDrawerLockedImgUrl from "../assets/rightdrawer_locked.png";
import { useGameStore } from "../state/store";
import { CassetteTape } from "./cassetteplayer";
import { Control } from "./Control";
import { Hotspot } from "./Hotspot";
import { LetterWidget } from "./letter";
import type { WidgetProps } from "./widget";

const rattleSound = new Howl({
    src: [rattleSoundUrl],
});
function RightDrawerLocked() {
    return (
        <Control top={1055} left={1673} width={309} height={95} onClick={() => rattleSound.play()}>
            <img src={rightDrawerLockedImgUrl} />
        </Control>
    );
}

function RightDrawerOpen() {
    return <Hotspot top={1055} left={1673} width={384} height={214} widget={RightDrawerWidget}></Hotspot>;
}

interface RightDrawerProps extends WidgetProps {}
function RightDrawerWidget(props: RightDrawerProps) {
    const hasTape = useGameStore((s) => s.widgets.rightDrawer.containsTape);
    const takeTape = useGameStore((s) => s.widgets.rightDrawer.takeTape);
    if (props.scaleDown) {
        return <img src={rightDrawerOpenImgUrl} />;
    }
    return (
        <div>
            <img src={drawerExpandedImgUrl} />
            {hasTape && (
                <Control top={600} left={1200} width={171} height={92} onClick={takeTape}>
                    <CassetteTape />
                </Control>
            )}
        </div>
    );
}

export function RightDrawer() {
    const isOpen = useGameStore((s) => s.widgets.rightDrawer.isOpen);
    if (isOpen) {
        return <RightDrawerOpen />;
    }
    return <RightDrawerLocked />;
}

function LeftDrawerLocked() {
    return (
        <Control top={1053} left={756} width={309} height={95} onClick={() => rattleSound.play()}>
            <img src={rightDrawerLockedImgUrl} />
        </Control>
    );
}

function LeftDrawerOpen() {
    return <Hotspot top={1053} left={680} width={384} height={214} widget={LeftDrawerWidget}></Hotspot>;
}

interface LeftDrawerProps extends WidgetProps {}
function LeftDrawerWidget(props: LeftDrawerProps) {
    if (props.scaleDown) {
        return <img src={leftDrawerOpenImgUrl} />;
    }
    return <LeftDrawerOpenContents />;
}

function LeftDrawerOpenContents() {
    const [isLetterOpen, setLetterOpen] = useState(false);
    return (
        <div>
            <img src={drawerExpandedImgUrl} />
            {!isLetterOpen && (
                <Control top={600} left={1200} width={230} height={130} onClick={() => setLetterOpen(true)}>
                    <LetterWidget scaleDown={true} />
                </Control>
            )}
            {isLetterOpen && <LetterWidget />}
        </div>
    );
}

export function LeftDrawer() {
    const isOpen = useGameStore((s) => s.widgets.leftDrawer.isOpen);
    if (isOpen) {
        return <LeftDrawerOpen />;
    }
    return <LeftDrawerLocked />;
}
