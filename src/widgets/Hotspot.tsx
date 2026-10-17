import { useGameStore } from "../state/store";
import { Control, type ControlProps } from "./Control";
import type { Widget } from "./widget";

interface HotspotProps extends Omit<ControlProps, "onClick" | "inert" | "children"> {
    widget: Widget;
}

export function Hotspot({ widget: Widget, ...controlProps }: HotspotProps) {
    const store = useGameStore();
    return (
        <Control {...controlProps} inert={!!store.openWidget} onClick={() => store.setOpenWidget(Widget)}>
            <Widget scaleDown blockInteraction />
        </Control>
    );
}
