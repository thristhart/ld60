import { Howl } from "howler";
import rattleSoundUrl from "../assets/audio/placeholder_drawer_rattle.wav";
import drawerExpandedImgUrl from "../assets/placeholder_drawer_open.png";
import rightDrawerOpenImgUrl from "../assets/placeholder_rightdrawer_open.png";
import rightDrawerLockedImgUrl from "../assets/rightdrawer_locked.png";
import { useGameStore } from "../state/store";
import { CassetteTape } from "./cassetteplayer";
import { Control } from "./Control";
import { Hotspot } from "./Hotspot";
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
