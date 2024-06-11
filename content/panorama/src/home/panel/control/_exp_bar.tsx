
export let ExpBarPanel: ProgressBar;
export let localPlayerID = Game.GetLocalPlayerID();

export function GetHeroLevelTable(HERO_MAX_LEVEL: number) {
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

export const HeroExpLevelTable = GetHeroLevelTable(100);

export const GetLevelExpInfo = (unit_level: number, curr_exp: number, next_up_exp: number) => {
    let CurrentLevelUpXP = HeroExpLevelTable[unit_level] - HeroExpLevelTable[unit_level - 1];
    let CurrentLevelXP = CurrentLevelUpXP - (next_up_exp - curr_exp);
    return { CurrentLevelXP, CurrentLevelUpXP };
};

export const CreatePanel_ExpBar = () => {
    ExpBarPanel = $("#ExpBar") as ProgressBar;
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
    const { CurrentLevelXP, CurrentLevelUpXP } = GetLevelExpInfo(unit_level, current_exp, up_exp);

    // $.Msg(ExpBarPanel)
    ExpBarPanel.SetDialogVariable("CurrentLevelXP", `${CurrentLevelXP}`)
    ExpBarPanel.SetDialogVariable("CurrentLevelUpXP", `${CurrentLevelUpXP}`)
    ExpBarPanel.value = 100 * CurrentLevelXP / CurrentLevelUpXP
}

(function () {
    CreatePanel_ExpBar();
})();