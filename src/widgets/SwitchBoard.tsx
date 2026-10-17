import classNames from "classnames";
import plugJackImageUrl from "../assets/switchboard/plug_jack.png";
import switchboardBackImageUrl from "../assets/switchboard/switchboard_back.png";
import switchboardDeckImageUrl from "../assets/switchboard/switchboard_deck.png";
import switchboardStyles from './SwitchBoard.module.css';
import type { WidgetProps } from "./widget";


interface SwitchboardProps extends WidgetProps {}
const plugJacks = [ "A", "B", "C", "D", "E", 'F', "G", "H"]

export function SwitchBoard(props: SwitchboardProps) {
    return (
        <div
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
           <div className={switchboardStyles.PlugGrid}>
                {
                    plugJacks.map( (jackName, index) => {
                        return (
                            <div className={switchboardStyles.PlugJackContainer} style={{ left: (index)*144}}> 
                                <div className={switchboardStyles.PlugJackName}>{jackName}</div>
                                <img className={switchboardStyles.PlugJack} src={plugJackImageUrl} draggable={false} />
                            </div>
                        )
                    })
                }
           </div>
            
        </div>
    )
}