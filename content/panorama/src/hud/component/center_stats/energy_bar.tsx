import React from "react";
import { FormatIntToString } from "../../../utils/method";

interface ValueBarProps {
    type: "Hp" | "Mp" | "Ep";
}




export const ValueBarComponent = ({ type }: ValueBarProps) => {

    let MainPanel: Panel;
    let ValueProgressBar: ProgressBar;
    
    const StartLoop = () => {
        UpdateLocalPlayer();
        $.Schedule(0.1, StartLoop)
    }
    
    const UpdateLocalPlayer = () => {
        const queryUnit = Players.GetLocalPlayerPortraitUnit();
        // $.Msg(["queryUnit", queryUnit])
        if (queryUnit <= 0) { return }
        // const queryUnit = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer()) 
        if (type == "Hp") {
            const health_mul = 1;// GetUnitModifierStack(queryUnit, "modifier_common_mul_health");
            const val = Entities.GetHealth(queryUnit) * health_mul;
            const max = Entities.GetMaxHealth(queryUnit) * health_mul;
            const reg = Entities.GetHealthThinkRegen(queryUnit);
    
            const local_team = Entities.GetTeamNumber(Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer()));
            const unit_team = Entities.GetTeamNumber(queryUnit);
            // setIsEnemy(local_team != unit_team);
    
            ValueProgressBar.value = 100 - val / (Math.max(1, max)) * 100
            MainPanel.SetHasClass("is_enemy", local_team != unit_team)
    
            MainPanel.SetDialogVariable("value", FormatIntToString(val))
            MainPanel.SetDialogVariable("max_value", FormatIntToString(max))
            MainPanel.SetDialogVariable("reg", reg.toFixed(1))
        } else if (type == "Mp") {
            const val = Entities.GetMana(queryUnit);
            const max = Entities.GetMaxMana(queryUnit);
            const reg = Entities.GetManaThinkRegen(queryUnit);
            ValueProgressBar.value = val / (Math.max(1, max)) * 100
            MainPanel.SetDialogVariable("value", FormatIntToString(val))
            MainPanel.SetDialogVariable("max_value", FormatIntToString(max))
            MainPanel.SetDialogVariable("reg", reg.toFixed(1))
        }
    };

    return (
        <Panel
            className={`ValueBarComponent ${type}`}
            hittest={false}
            onload={(e) => {
                MainPanel = e;
                UpdateLocalPlayer();
                StartLoop();
            }}
        >
            <Panel className='ProgressBarPanel'>
                <Panel id="ValueProgressBarBackground" />
                <ProgressBar
                    id="ValueProgressBar"
                    className='ProgressBar'
                    value={0}
                    min={1} max={100} hittest={false}
                    onload={(e) => {
                        ValueProgressBar = e;
                        // let left_bar = e.GetChild(0);
                        // if (left_bar) {
                        //     let hud_bar = $.CreatePanel("DOTAScenePanel", e, "HealthBurner", {
                        //         map: "scenes/hud/healthbarburner",
                        //         camrea: "camrea_1"
                        //     });
                        // }

                    }}
                />
            </Panel>

            <Panel className='BarLabel' hittest={false}>
                <Label className="Label" localizedText="{s:value}/{s:max_value}" hittest={false} />
                {/* <Label className="RegenLabel" localizedText="{s:reg}" hittest={false} /> */}
            </Panel>
            {/* <TestRenderPanel text={`ValueBarComponent ${type}`} /> */}
        </Panel>
    );
};

export const EnergyBar = () => {

    return (
        <Panel id="EnergyBar">
            <Panel className="BarContent">
                <ValueBarComponent type="Hp" />
                <ValueBarComponent type="Mp" />
            </Panel>
        </Panel>

    )
} 