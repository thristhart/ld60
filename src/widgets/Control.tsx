import classNames from "classnames";
import type { CSSProperties, ReactNode } from "react";
import styles from "../game.module.css";

export interface ControlProps {
    left: number;
    top: number;
    width: number;
    height: number;
    onClick?: () => void;
    onDown?: () => void;
    onUp?: () => void;
    onExit?: () => void;
    clipPath?: CSSProperties["clipPath"];
    className?: string;
    debug?: boolean;
    inert?: boolean;
    children?: ReactNode;
}

export function Control(props: ControlProps) {
    return (
        <button
            inert={!!props.inert}
            data-cursor="point"
            className={classNames(styles.widgetClickArea, props.className)}
            style={{
                left: props.left,
                top: props.top,
                width: props.width,
                height: props.height,
                backgroundColor: props.debug ? "rgba(255, 0, 0, .5)" : "transparent",
                clipPath: props.clipPath ?? "none",
            }}
            onClick={props.onClick}
            onMouseDown={props.onDown}
            onMouseUp={props.onUp}
            onKeyDown={(e) => {
                if (!props.onDown) {
                    return;
                }
                if (e.code === "Enter" || e.code === "Space") {
                    return props.onDown();
                }
            }}
            onKeyUp={(e) => {
                if (!props.onUp) {
                    return;
                }
                if (e.code === "Enter" || e.code === "Space") {
                    return props.onUp();
                }
            }}
            onMouseLeave={props.onExit}
            onBlur={props.onExit}>
            {props.children}
        </button>
    );
}
