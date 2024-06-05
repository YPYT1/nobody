import { AbilityList, HeroInnateAbility } from "./ability_list"
import { AttributeState } from "./attribute_state"
import { EnergyBar } from "./energy_bar";
import { ExpBar } from "./exp_bar"
import { PortraitContainer } from "./portrait";

/** 中心控制台 */
export const CenterStatsContainer = () => {

    return (
        <Panel id='CenterStatsContainer' hittest={false} >
            <AttributeState />
            <Panel id="CenterPanel" hittest={false}>
                <PortraitContainer />
                <EnergyBar />
                
                <AbilityList />
                <HeroInnateAbility />
                
            </Panel>
            <ExpBar />
        </Panel>
    );
};