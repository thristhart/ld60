import { Scroller } from "@dnd-kit/dom";
import { DragDropProvider, useDragDropManager, useDraggable, useDroppable } from "@dnd-kit/react";
import classNames from "classnames";
import { useEffect, useRef } from "react";
import plugHeadImageUrl from "../assets/switchboard/plug_head.png";
import plugJackImageUrl from "../assets/switchboard/plug_jack.png";
import switchboardBackImageUrl from "../assets/switchboard/switchboard_back.png";
import switchboardDeckImageUrl from "../assets/switchboard/switchboard_deck.png";
import { useGameStore, type PlugPositions } from "../state/store";
import switchboardStyles from './SwitchBoard.module.css';
import type { WidgetProps } from "./widget";


interface SwitchboardProps extends WidgetProps {}
const plugJacks = [ "A", "B", "C", "D", "E", 'F', "G", "H"]

const positionMap = {
    'baseOne': {
        left: "100px",
        top: "650px",  
    },
    "baseTwo": {
        left: "500px",
        top: "650px",
    },
    "A": {
        left: "100px",
        top: "180px",
    },
     "B": {
        left: "300px",
         top: "180px",

    },
     "C": {
        left: "500px",
         top: "180px",
    },
     "D": {
        left: "700px",
        top: "180px",
    },
    "E": {
        left: "100px",
        top: "480px",
    },
     "F": {
        left: "300px",
         top: "480px",
    },
     "G": {
        left: "500px",
        top: "480px",
    },
    "H": {
        left: "700px",
           top: "480px",
    },

}

function getPlugPosition(plugType: "One" | "Two", position: PlugPositions)
{
    switch(position) {
        case "base": 
            if(plugType === "One")
                return positionMap.baseOne
            return positionMap.baseTwo
        default: 
            return positionMap[position];
    }
}

function PlugJackDroppable(props: { jackName: string}) {
    const {jackName} = props; 
    const {ref} = useDroppable({
        id: `plug_jack_${jackName}`,
        data : {
            name: jackName
        }
    });
    return (
     <div className={switchboardStyles.PlugJackContainer} ref={ref}> 
        <div className={switchboardStyles.PlugJackName}>{jackName}</div>
        <img id={`plug-jack-${jackName}`}className={switchboardStyles.PlugJack} src={plugJackImageUrl} draggable={false} />
    </div>
    );
}

export function SwitchBoard(props: SwitchboardProps) {
const { plugOnePosition, plugTwoPosition, setPlugPosition } = useGameStore((s) => s.widgets.switchboard);
    const containerRef = useRef<HTMLDivElement>(null);
    const plugOneInit = getPlugPosition("One", plugOnePosition)
    const plugTwoInit = getPlugPosition("Two", plugTwoPosition)


    return (
        <div
            ref={containerRef}
            className={classNames(
                switchboardStyles.SwitchboardContainer,
                props.scaleDown && switchboardStyles.ScaledDown
            )}
            inert={props.blockInteraction}
            draggable={false}>
            <div className={switchboardStyles.BackgroundContainer}>
                <img className={switchboardStyles.SwitchboardBack} src={switchboardBackImageUrl} draggable={false} />
                <img className={switchboardStyles.SwitchboardDeck} src={switchboardDeckImageUrl} draggable={false} />
            </div> 
            <DragDropProvider 
                onDragEnd={(event) => {
                        if (event.canceled) {
                            return;
                        }
                        if (event.operation.target?.id.toString().includes('plug_jack')) {
                            const plugHead = event.operation.source?.data.name
                            const plugJackName = event.operation.target.data.name
                            setPlugPosition(plugHead, plugJackName);
                        }
                    }}
            >
                <div className={switchboardStyles.PlugGrid}>
                    {
                        plugJacks.map( (jackName) => {
                            return (
                                <PlugJackDroppable jackName={jackName}/>
                            )
                        })
                    }
                </div>
                <PlugHead name={"One"} left={plugOneInit.left} top={plugOneInit.top}/>
                <PlugHead name={"Two"} left={plugTwoInit.left} top={plugTwoInit.top}/>
            </DragDropProvider>
        </div>
    )
}

function PlugHead( props: { name: "One" | "Two", left: string, top: string } )
{
    const {name, left, top} = props; 
    const { ref, isDragging } = useDraggable({
        id: `plug_head_${name}`,
        data: {
            name: name
        }
    });

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

    const wireHeight = (800 - Number(top.replaceAll("px", "")) - 24);
    //TODO; get wires to change height while dragging? 

    return (
        <div style={ { left: left, top: top} } className={classNames(switchboardStyles.PlugHead)} ref={ref}>
            <div className={switchboardStyles.PlugHorizontalSection}>
                <img className={switchboardStyles.PlugHeadImage} src={plugHeadImageUrl} draggable={false} />
                <div className={switchboardStyles.PlugWireHorizontal}/>
            </div>
            <div style={ {height: `${wireHeight}%`} } className={switchboardStyles.PlugWireVertical}/>
        </div>
    );
}
