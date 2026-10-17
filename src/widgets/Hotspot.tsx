import { useGameStore } from "../state/store";
import { Control, type ControlProps } from "./Control";
import type { Widget } from "./widget";

interface HotspotProps extends Omit<ControlProps, "onClick" | "inert" | "children"> {
    widget: Widget;
}

export function Hotspot({ widget: Widget, ...controlProps }: HotspotProps) {
    const openWidget = useGameStore((s) => s.openWidget);
    const setOpenWidget = useGameStore((s) => s.setOpenWidget);
    return (
        <Control {...controlProps} inert={!!openWidget} onClick={() => setOpenWidget(Widget)}>
            <Widget scaleDown blockInteraction />
        </Control>
    );
}
