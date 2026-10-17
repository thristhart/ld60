import type { ReactNode } from "react";

export interface WidgetProps {
    scaleDown?: boolean;
    blockInteraction?: boolean;
}
export type Widget = (props: WidgetProps) => ReactNode;
