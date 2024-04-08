import React, { useCallback, useEffect, useState } from "react";
import { FormatIntToString } from "../../../utils/method";
import { useGameEvent } from "react-panorama-x";

interface ValueBarProps {
    type: "Hp" | "Mp" | "Ep";
}

export const ValueBarComponent = ({ type }: ValueBarProps) => {

    const [value, setValue] = useState(1);
    const [maxValue, setMaxValue] = useState(1);
    const [regen, setRegen] = useState(0);
    const [barValue, setBarValue] = useState(100);
    const [IsEnemy, setIsEnemy] = useState(false);

    const UpdateLocalPlayer = useCallback(() => {
        const queryUnit = Players.GetLocalPlayerPortraitUnit();
        // const queryUnit = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer()) 
        if (type == "Hp") {
            const health_mul = 1;// GetUnitModifierStack(queryUnit, "modifier_common_mul_health");
            const val = Entities.GetHealth(queryUnit) * health_mul;
            const max = Entities.GetMaxHealth(queryUnit) * health_mul;
            const reg = Entities.GetHealthThinkRegen(queryUnit);


            const local_team = Entities.GetTeamNumber(Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer()));
            const unit_team = Entities.GetTeamNumber(queryUnit);
            setIsEnemy(local_team != unit_team);
            setBarValue(val / (Math.max(1, max)) * 100);
            setValue(val);
            setMaxValue(max);
            setRegen(reg);

        } else if (type == "Mp") {
            const val = Entities.GetMana(queryUnit);
            const max = Entities.GetMaxMana(queryUnit);
            const reg = Entities.GetManaThinkRegen(queryUnit);
            setBarValue(val / (Math.max(1, max)) * 100);
            setValue(val);
            setMaxValue(max);
            setRegen(reg);
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

    return React.useMemo(() =>
        <Panel className={`ValueBarComponent ${type} ${IsEnemy ? "is_enemy" : ""}`} hittest={false} onload={() => { UpdateLocalPlayer; }}>

            <Panel className='ProgressBarPanel'>
                <Panel id="ValueProgressBarBackground" />
                <ProgressBar
                    id="ValueProgressBar"
                    className='ProgressBar'
                    value={barValue}
                    min={1} max={100} hittest={false}
                    onload={(e) => {
                        let left_bar = e.GetChild(0);
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
                <Label className="Label" text={`${FormatIntToString(value)} / ${FormatIntToString(maxValue)}`} hittest={false} />
                <Label className="RegenLabel" text={regen.toFixed(1)} hittest={false} />
            </Panel>
            {/* <TestRenderPanel text={`ValueBarComponent ${type}`} /> */}
        </Panel>
        , [value, maxValue, regen]);
};

export const EnergyBar = () => {

    return (
        <Panel id="EnergyBar">
            <ValueBarComponent type="Hp" />
            <ValueBarComponent type="Mp" />
        </Panel>

    )
} 