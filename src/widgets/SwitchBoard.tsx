import { Scroller } from "@dnd-kit/dom";
import { DragDropProvider, useDragDropManager, useDraggable, useDroppable } from "@dnd-kit/react";
import classNames from "classnames";
import { use, useEffect, useRef, useState, type RefObject } from "react";
import plugHeadImageUrl from "../assets/switchboard/plug_head.png";
import switchboardBackImageUrl from "../assets/switchboard/switchboard.png";
import { ScaleContext } from "../scalecontext";
import { useGameStore, type PlugPositions } from "../state/store";
import switchboardStyles from "./SwitchBoard.module.css";
import type { WidgetProps } from "./widget";

interface SwitchboardProps extends WidgetProps {}
const plugJacks: PlugPositions[] = [
    "Phone",
    "Telegraph",
    "Typewriter",
    "Clock",
    "Butcher",
    "Clark",
    "Baker",
    "Stevenson",
];

const positionMap = {
    Phone: {
        left: 55,
        top: 250,
    },
    Telegraph: {
        left: 195,
        top: 250,
    },
    Typewriter: {
        left: 340,
        top: 250,
    },
    Clock: {
        left: 480,
        top: 250,
    },
    Butcher: {
        left: 55,
        top: 465,
    },
    Clark: {
        left: 195,
        top: 465,
    },
    Baker: {
        left: 340,
        top: 465,
    },
    Stevenson: {
        left: 480,
        top: 465,
    },
};

function getPlugPosition(plugType: "One" | "Two", position: PlugPositions) {
    return positionMap[position];
}

function PlugJackDroppable(props: { jackName: string }) {
    const { jackName } = props;
    const { ref } = useDroppable({
        id: `plug_jack_${jackName}`,
        data: {
            name: jackName,
        },
    });
    return (
        <div className={switchboardStyles.PlugJackContainer} ref={ref}>
            <div className={switchboardStyles.PlugJackName}>{jackName}</div>
        </div>
    );
}

const totalCableLength = 600;
const segmentCount = 40;
const segmentLength = totalCableLength / segmentCount;
const gravity = 0.5;
const friction = 0.85;

interface CablePoint {
    x: number;
    y: number;
    oldX: number;
    oldY: number;
    pinned: boolean;
}
function createCableParticles() {
    const points: CablePoint[] = [];

    for (let i = 0; i < segmentCount; i++) {
        points.push({
            x: 0,
            y: 0,
            oldX: 0,
            oldY: 0,
            pinned: i === 0 || i === segmentCount - 1,
        });
    }

    return points;
}
function updateCablePhysics(points: CablePoint[], plugA: { x: number; y: number }, plugB: { x: number; y: number }) {
    points[0].x = points[0].oldX = plugA.x;
    points[0].y = points[0].oldY = plugA.y;

    points[segmentCount - 1].x = points[segmentCount - 1].oldX = plugB.x;
    points[segmentCount - 1].y = points[segmentCount - 1].oldY = plugB.y;

    for (let cablePoint of points) {
        if (!cablePoint.pinned) {
            const velocityX = (cablePoint.x - cablePoint.oldX) * friction;
            const velocityY = (cablePoint.y - cablePoint.oldY) * friction;

            cablePoint.oldX = cablePoint.x;
            cablePoint.oldY = cablePoint.y;

            cablePoint.x += velocityX;
            cablePoint.y += velocityY + gravity;
        }
    }

    for (let iterations = 0; iterations < 5; iterations++) {
        for (let i = 0; i < segmentCount - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            const dX = p2.x - p1.x;
            const dY = p2.y - p1.y;
            const dist = Math.hypot(dX, dY);
            const diff = Math.min(segmentLength - dist, 0.0001);
            const percent = diff / dist / 2;
            const offsetX = dX * percent;
            const offsetY = dY * percent;

            if (!p1.pinned) {
                p1.x -= offsetX;
                p1.y -= offsetY;
            }
            if (!p2.pinned) {
                p2.x += offsetX;
                p2.y += offsetY;
            }
        }
    }
}

interface CableCanvasProps {
    plugOneRealRef: React.RefObject<{ left: number; top: number }>;
    plugTwoRealRef: React.RefObject<{ left: number; top: number }>;
}
function CableCanvas(props: CableCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scale = use(ScaleContext);
    const [cablePoints] = useState(createCableParticles);
    useEffect(() => {
        const context = canvasRef.current?.getContext("2d");
        const canvasRect = canvasRef.current!.getBoundingClientRect();

        let animationFrameHandle: number;
        function animationFrame() {
            animationFrameHandle = requestAnimationFrame(animationFrame);
            if (!context || !canvasRef.current) {
                return;
            }
            const plugOnePos = {
                x: (props.plugOneRealRef.current.left - canvasRect.left) / scale,
                y: (props.plugOneRealRef.current.top - canvasRect.top) / scale,
            };
            const plugTwoPos = {
                x: (props.plugTwoRealRef.current.left - canvasRect.left) / scale,
                y: (props.plugTwoRealRef.current.top - canvasRect.top) / scale,
            };
            updateCablePhysics(cablePoints, plugOnePos, plugTwoPos);
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            context.beginPath();
            context.moveTo(cablePoints[0].x, cablePoints[0].y);

            for (let i = 1; i < segmentCount; i++) {
                context.lineTo(cablePoints[i].x, cablePoints[i].y);
            }

            context.strokeStyle = "#0e2737";
            context.lineWidth = 10;
            context.stroke();
        }
        animationFrameHandle = requestAnimationFrame(animationFrame);
        return () => cancelAnimationFrame(animationFrameHandle);
    }, [scale]);
    return <canvas width={1280} height={1400} ref={canvasRef} className={switchboardStyles.cablesCanvas} />;
}

export function SwitchBoard(props: SwitchboardProps) {
    const { plugOnePosition, plugTwoPosition, setPlugPosition } = useGameStore((s) => s.widgets.switchboard);
    const containerRef = useRef<HTMLDivElement>(null);
    const plugOneInit = getPlugPosition("One", plugOnePosition);
    const plugTwoInit = getPlugPosition("Two", plugTwoPosition);
    const plugOneRealPositionRef = useRef({ top: 0, left: 0 });
    const plugTwoRealPositionRef = useRef({ top: 0, left: 0 });

    return (
        <div
            ref={containerRef}
            className={classNames(
                switchboardStyles.SwitchboardContainer,
                props.scaleDown && switchboardStyles.ScaledDown
            )}
            inert={props.blockInteraction}
            draggable={false}>
            <img className={switchboardStyles.SwitchboardBack} src={switchboardBackImageUrl} draggable={false} inert />
            <DragDropProvider
                onDragEnd={(event) => {
                    if (event.canceled) {
                        return;
                    }
                    if (event.operation.target?.id.toString().includes("plug_jack")) {
                        const plugHead = event.operation.source?.data.name;
                        const plugJackName = event.operation.target.data.name;
                        setPlugPosition(plugHead, plugJackName);
                    }
                }}>
                <div className={switchboardStyles.PlugGrid}>
                    {plugJacks.map((jackName) => {
                        return <PlugJackDroppable jackName={jackName} />;
                    })}
                </div>
                <CableCanvas plugOneRealRef={plugOneRealPositionRef} plugTwoRealRef={plugTwoRealPositionRef} />
                <PlugHead name={"One"} left={plugOneInit.left} top={plugOneInit.top} posRef={plugOneRealPositionRef} />
                <PlugHead name={"Two"} left={plugTwoInit.left} top={plugTwoInit.top} posRef={plugTwoRealPositionRef} />
            </DragDropProvider>
        </div>
    );
}

function PlugHead(props: {
    name: "One" | "Two";
    left: number;
    top: number;
    posRef: RefObject<{ top: number; left: number }>;
}) {
    const { name, left, top } = props;
    const { ref, isDragging } = useDraggable({
        id: `plug_head_${name}`,
        data: {
            name: name,
        },
    });
    const imgRef = useRef<HTMLImageElement>(null);

    const manager = useDragDropManager();
    manager?.registry.plugins.get(Scroller)?.disable();
    if (isDragging) {
        document.documentElement.dataset.cursor = "grab_closed";
    } else {
        delete document.documentElement.dataset.cursor;
    }

    useEffect(() => {
        return () => {
            delete document.documentElement.dataset.cursor;
        };
    }, []);

    const scale = use(ScaleContext);

    useEffect(() => {
        let animationFrameHandle: number;
        function animationFrame() {
            animationFrameHandle = requestAnimationFrame(animationFrame);
            const box = imgRef.current?.getBoundingClientRect();
            props.posRef.current.left = (box?.left ?? 0) + 100 * scale;
            props.posRef.current.top = (box?.top ?? 0) + 25 * scale;
        }
        animationFrameHandle = requestAnimationFrame(animationFrame);
        return () => cancelAnimationFrame(animationFrameHandle);
    }, [scale]);

    return (
        <div style={{ left: left, top: top }} className={classNames(switchboardStyles.PlugHead)} ref={ref}>
            <div className={switchboardStyles.PlugHorizontalSection}>
                <img
                    className={switchboardStyles.PlugHeadImage}
                    src={plugHeadImageUrl}
                    draggable={false}
                    ref={imgRef}
                />
            </div>
        </div>
    );
}
