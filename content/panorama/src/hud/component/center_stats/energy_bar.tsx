import React, { useCallback, useEffect } from "react";
import { FormatIntToString } from "../../../utils/method";
import { useGameEvent } from "react-panorama-x";

interface ValueBarProps {
    type: "Hp" | "Mp" | "Ep";
}

export const ValueBarComponent = ({ type }: ValueBarProps) => {

    let MainPanel: Panel;
    let ValueProgressBar: ProgressBar;

    const UpdateLocalPlayer = useCallback(() => {
        const queryUnit = Players.GetLocalPlayerPortraitUnit();
        // $.Msg(["queryUnit",queryUnit])
        if(queryUnit == -1){ return }
        // const queryUnit = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer()) 
        if (type == "Hp") {
            const health_mul = 1;// GetUnitModifierStack(queryUnit, "modifier_common_mul_health");
            const val = Entities.GetHealth(queryUnit) * health_mul;
            const max = Entities.GetMaxHealth(queryUnit) * health_mul;
            const reg = Entities.GetHealthThinkRegen(queryUnit);

            const local_team = Entities.GetTeamNumber(Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer()));
            const unit_team = Entities.GetTeamNumber(queryUnit);
            // setIsEnemy(local_team != unit_team);

            ValueProgressBar.value = val / (Math.max(1, max)) * 100
            MainPanel.SetHasClass("is_enemy", local_team != unit_team)

            MainPanel.SetDialogVariable("value", FormatIntToString(val))
            MainPanel.SetDialogVariable("max_value", FormatIntToString(max))
            MainPanel.SetDialogVariable("reg", reg.toFixed(1))
        } else if (type == "Mp") {
            const val = Entities.GetMana(queryUnit);
            const max = Entities.GetMaxMana(queryUnit);
            const reg = Entities.GetManaThinkRegen(queryUnit);

            // {`${} / ${FormatIntToString(maxValue)}`}

            // setBarValue(val / (Math.max(1, max)) * 100);
            // setValue(val);
            // setMaxValue(max);
            // setRegen(reg);
            ValueProgressBar.value = val / (Math.max(1, max)) * 100
            MainPanel.SetDialogVariable("value", FormatIntToString(val))
            MainPanel.SetDialogVariable("max_value", FormatIntToString(max))
            MainPanel.SetDialogVariable("reg", reg.toFixed(1))
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => { UpdateLocalPlayer(); }, 100);
        return () => clearInterval(interval);
    }, []);

    useGameEvent("dota_player_update_selected_unit", UpdateLocalPlayer, []);
    useGameEvent("dota_player_update_query_unit", UpdateLocalPlayer, []);
    useGameEvent("dota_portrait_ability_layout_changed", UpdateLocalPlayer, []);
    useGameEvent("dota_ability_changed", UpdateLocalPlayer, []);
    useGameEvent("dota_hero_ability_points_changed", UpdateLocalPlayer, []);

    $.Msg(["Update Page", type]);
    return (
        <Panel
            className={`ValueBarComponent ${type}`}
            hittest={false}
            onload={(e) => {
                MainPanel = e;
                UpdateLocalPlayer();
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
                <Label className="Label" localizedText="{s:value} / {s:max_value}" hittest={false} />
                <Label className="RegenLabel" localizedText="{s:reg}" hittest={false} />
            </Panel>
            {/* <TestRenderPanel text={`ValueBarComponent ${type}`} /> */}
        </Panel>
    );
};

export const EnergyBar = () => {

    return (
        <Panel id="EnergyBar">
            <ValueBarComponent type="Hp" />
            <ValueBarComponent type="Mp" />
        </Panel>

    )
} 