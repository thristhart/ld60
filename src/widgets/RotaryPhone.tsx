import { useEffect, useState } from "react";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import { Hotspot } from "./Hotspot";
import { Control } from "./Control";
import rotaryPhoneImgUrl from "../assets/RotaryPhone.png";
import styles from "./RotaryPhone.module.css";
import type { WidgetProps } from "./widget";

interface RotaryPhoneProps extends WidgetProps {
}

export function RotaryPhone(props: RotaryPhoneProps) {
    if (props.scaleDown) {
        return <img className={styles.ScaledDown} src={rotaryPhoneImgUrl} inert={props.blockInteraction} />;
    }
    return (
        <div className={styles.RotaryPhone}>
            <img className={styles.RotaryPhoneImg} src={rotaryPhoneImgUrl} />
            <RotaryPhoneRotar
                left={400}
                top={200}
                size={500}
            />
        </div>
    );
}

interface RotaryPhoneRotarProps {
    left: number;
    top: number;
    size: number
}

function RotaryPhoneRotar(props: RotaryPhoneRotarProps) {
    return (
        <Control
            left={props.left}
            top={props.top}
            width={props.size}
            height={props.size}
            onClick={() => console.log("rotor clicked")}
            clipPath="circle(50% at 50% 50%)"
            debug
        >
            <div></div>
        </Control>
    );
}
