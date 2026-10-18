import { Howl } from "howler";
import drawerOpeningSoundUrl from "../assets/audio/placeholder_drawer_opening.wav";
import rattleSoundUrl from "../assets/audio/placeholder_drawer_rattle.wav";
import rightDrawerOpenImgUrl from "../assets/placeholder_rightdrawer_open.png";
import rightDrawerLockedImgUrl from "../assets/rightdrawer_locked.png";
import { useGameStore } from "../state/store";
import { Control } from "./Control";
import { Hotspot } from "./Hotspot";
import type { WidgetProps } from "./widget";

const rattleSound = new Howl({
    src: [rattleSoundUrl],
});
const drawerOpeningSound = new Howl({
    src: [drawerOpeningSoundUrl],
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
    if (props.scaleDown) {
        return <img src={rightDrawerOpenImgUrl} />;
    }
    return <img src={rightDrawerOpenImgUrl} />;
}

export function RightDrawer() {
    const isOpen = useGameStore((s) => s.widgets.rightDrawer.isOpen);
    if (isOpen) {
        return <RightDrawerOpen />;
    }
    return <RightDrawerLocked />;
}

export function openRightDrawer() {
    drawerOpeningSound.play();
    useGameStore.getState().widgets.rightDrawer.open();
}
