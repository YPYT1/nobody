import { useGameEvent } from "react-panorama-x";

export const ExpBar = () => {

    useGameEvent("player_is_experienced", event => {
        $.Msg(["player_is_experienced", event])
    }, [])
    
    return (
        <ProgressBar id='ExpBar' value={95} min={0} max={100}>
            <Panel id="DivisionLine">
                <Panel className="Line" />
                <Panel className="Line" />
                <Panel className="Line" />
                <Panel className="Line" />
                <Panel className="Line" />
                <Panel className="Line" />
                <Panel className="Line" />
                <Panel className="Line" />
                <Panel className="Line" />
            </Panel>
        </ProgressBar>
    );

};