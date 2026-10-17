import widgetStyles from "./widget.module.css";

interface TVProps {
    left: number;
    top: number;
}
export function TV(props: TVProps) {
    return (
        <div
            className={widgetStyles.Widget}
            style={{
                left: props.left,
                top: props.top,
                width: "100px",
                height: "100px",
                backgroundColor: "cornflowerblue",
            }}></div>
    );
}
