import { useRef } from "react";
import drawerClosedImageUrl from "../assets/drawer_closed.png";
import drawerOpenImageUrl from "../assets/drawer_open.png";
import styles from "./Drawer.module.css";
import type { WidgetProps } from "./widget";

interface DrawerProps extends WidgetProps {
    side: "Left" | "Right";
}

export function Drawer(props: DrawerProps) {
    const open = useRef(false);
    if (open.current) {
        return (
            <div>
                <img className={styles.OpenDrawer} src={drawerOpenImageUrl} draggable={false} />
            </div>
        );
    } else {
        return (
            <div
                onClick={() => {
                    open.current = true;
                }}>
                <img className={styles.ClosedDrawer} src={drawerClosedImageUrl} draggable={false} />
            </div>
        );
    }
}
