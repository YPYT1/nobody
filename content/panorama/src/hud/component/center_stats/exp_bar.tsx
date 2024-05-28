import { useEffect } from "react";
import { useGameEvent } from "react-panorama-x";

import { default as PUBLIC_CONST } from "../../../json/config/public_const.json";

let ExpBarPanel: ProgressBar;
let localPlayerID = Game.GetLocalPlayerID();

function GetHeroLevelTable(HERO_MAX_LEVEL: number) {
    let hero_xp_table = [];
    for (let i = 0; i < HERO_MAX_LEVEL; i++) {
        let xp = 0;
        if (i > 0) {
            xp = (600 + i * (100) + 5 * Math.pow(i, 2)) + hero_xp_table[i - 1];
        }
        hero_xp_table[i] = xp;
    }
    return hero_xp_table;
}

// function GetHeroLevelTable(max_level: number = 80) {
//     let hero_xp_table: { [index: number]: number } = {};
//     let level = 1;
//     for (let i = 0; i < 80; i++) {
//         let xp = 0;
//         if (i > 0 && i < max_level) {
//             level = i;
//             // 600+LEVEL*100+5*LEVEL^2
//             xp = 600 + level * 100 + 5 * Math.pow(level, 2) + hero_xp_table[i - 1];
//             // xp = eval(PUBLIC_CONST.EXP_EQUATION, param)
//         } else if (i == 0) {
//             xp = 0;
//         } else {
//             return hero_xp_table;
//         }
//         hero_xp_table[i] = xp;
//     }
//     return hero_xp_table;
// }

const HeroExpLevelTable = GetHeroLevelTable(100);

const GetLevelExpInfo = (unit_level: number, curr_exp: number, next_up_exp: number) => {
    let CurrentLevelUpXP = HeroExpLevelTable[unit_level] - HeroExpLevelTable[unit_level - 1];
    let CurrentLevelXP = CurrentLevelUpXP - (next_up_exp - curr_exp);
    return { CurrentLevelXP, CurrentLevelUpXP };
    // $.Msg(data)
};

export const ExpBar = () => {

    const UpdateLocalPlayer = () => {
        if (ExpBarPanel == null) { return }
        let queryUnit = Players.GetPlayerHeroEntityIndex(localPlayerID);
        // let exp = Entities.GetCurrentXP(hero_entity);
        // let exp2 = Entities.GetNeededXPToLevel(hero_entity)
        let unit_level = Entities.GetLevel(queryUnit);
        let current_exp = Entities.GetCurrentXP(queryUnit);
        let up_exp = Entities.GetNeededXPToLevel(queryUnit);
        const { CurrentLevelXP, CurrentLevelUpXP } = GetLevelExpInfo(unit_level, current_exp, up_exp);

        ExpBarPanel.SetDialogVariable("CurrentLevelXP", `${CurrentLevelXP}`)
        ExpBarPanel.SetDialogVariable("CurrentLevelUpXP", `${CurrentLevelUpXP}`)
        ExpBarPanel.value = 100 * CurrentLevelXP / CurrentLevelUpXP
    }

    useEffect(() => {
        const interval = setInterval(() => { UpdateLocalPlayer(); }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <ProgressBar id='ExpBar' value={95} min={0} max={100} onload={(e) => {
            ExpBarPanel = e;
        }}>
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
            <Label className="ExpLabel" localizedText="{s:CurrentLevelXP} / {s:CurrentLevelUpXP}" />
        </ProgressBar>
    );

};