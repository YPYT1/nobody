import { AbilityList } from "./ability_list"
import { AttributeState } from "./attribute_state"
import { EnergyBar } from "./energy_bar";
import { ExpBar } from "./exp_bar"

/** 中心控制台 */
export const CenterStatsContainer = () => {

    return (
        <Panel id='CenterStatsContainer' hittest={false} >
            <Panel id="CenterPanel">
                <AttributeState />
                <AbilityList />
                <EnergyBar />
            </Panel>
            <Panel id="BottomPanel">
                <ExpBar />
            </Panel>
        </Panel>
    );
};

