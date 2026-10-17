import classNames from "classnames";
import type { CSSProperties, ReactNode } from "react";
import styles from "../game.module.css";

export interface ControlProps {
    left: number;
    top: number;
    width: number;
    height: number;
    onClick?: () => void;
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
            onClick={props.onClick}>
            {props.children}
        </button>
    );
}
