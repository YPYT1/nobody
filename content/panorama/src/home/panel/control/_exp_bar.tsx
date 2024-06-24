import { default as HeroLevelConfig } from "../../../json/config/game/hero_level_config.json";

let ExpStatusPanel: Panel;
let ExpBarPanel: ProgressBar;
let localPlayerID = Game.GetLocalPlayerID();

export function GetHeroLevelTable(HERO_MAX_LEVEL: number) {
    let hero_xp_table = [];
    for (let i = 0; i < HERO_MAX_LEVEL; i++) {
        let xp = 0;
        if (i > 0) {
            xp = HeroLevelConfig[`${i}` as keyof typeof HeroLevelConfig] + hero_xp_table[i - 1];
        }
        hero_xp_table[i] = xp;
    }
    return hero_xp_table;
}

export const HeroExpLevelTable = GetHeroLevelTable(100);

export const GetLevelExpInfo = (unit_level: number, curr_exp: number, next_up_exp: number) => {
    let CurrentLevelUpXP = HeroExpLevelTable[unit_level] - HeroExpLevelTable[unit_level - 1];
    let CurrentLevelXP = CurrentLevelUpXP - (next_up_exp - curr_exp);
    return { CurrentLevelXP, CurrentLevelUpXP };
};

export const CreatePanel_ExpBar = () => {
    ExpStatusPanel = $("#ExpStatusPanel")
    ExpBarPanel = $("#ExpBar") as ProgressBar;
    ExpStatusPanel.SetDialogVariable("exp_percent", "0");
    ExpStatusPanel.SetDialogVariable("current_xp", "0");
    ExpStatusPanel.SetDialogVariable("uplevel_xp", `${HeroExpLevelTable[1]}`);
    StartLoop()
}

export const StartLoop = () => {
    UpdateLocalPlayer();
    $.Schedule(0.1, StartLoop)
}

export const UpdateLocalPlayer = () => {
    // $.Msg(["ExpBarPanel",ExpBarPanel])
    if (ExpBarPanel == null) { return }
    let queryUnit = Players.GetPlayerHeroEntityIndex(localPlayerID);
    let unit_level = Entities.GetLevel(queryUnit);
    let current_exp = Entities.GetCurrentXP(queryUnit);
    let up_exp = Entities.GetNeededXPToLevel(queryUnit);
    // $.Msg([current_exp,up_exp])
    const { CurrentLevelXP, CurrentLevelUpXP } = GetLevelExpInfo(unit_level, current_exp, up_exp);

    const xp_percent = Math.floor(100 * CurrentLevelXP / CurrentLevelUpXP)
    ExpBarPanel.value = xp_percent


    ExpStatusPanel.SetDialogVariable("current_xp", `${CurrentLevelXP}`)
    ExpStatusPanel.SetDialogVariable("uplevel_xp", `${CurrentLevelUpXP}`)
    ExpStatusPanel.SetDialogVariable("exp_percent", `${xp_percent}`);
}

(function () {
    CreatePanel_ExpBar();
})();