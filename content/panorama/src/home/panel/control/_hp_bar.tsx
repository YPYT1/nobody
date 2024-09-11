import { FormatIntToString, GetUnitModifierStack } from "../../../utils/method";

export const BarTypeList = ["Hp", "Mp"];
export let bar_panel_list: { [key: string]: Panel } = {};

export const CreatePanel_HpBar = () => {
    let HpBarPanel = $("#HpBar");
    let BarContent = HpBarPanel.FindChildTraverse("BarContent");
    if (BarContent == null) { return };
    BarContent.RemoveAndDeleteChildren();
    for (let bar_type of BarTypeList) {
        let row_bar_panel = $.CreatePanel("Panel", BarContent, "");
        row_bar_panel.BLoadLayoutSnippet("ValueBarComponent");
        row_bar_panel.AddClass(bar_type);
        bar_panel_list[bar_type] = row_bar_panel;
    }

    $.Schedule(0.1, StartLoop)
}

export const StartLoop = () => {
    UpdateLocalPlayer();
    $.Schedule(0.1, StartLoop)
}

export const UpdateLocalPlayer = () => {
    const queryUnit = Players.GetLocalPlayerPortraitUnit();
    if (queryUnit <= 0) { return }
    const health_mul = GetUnitModifierStack(queryUnit, "modifier_common_mul_health");
    const hp_val = Entities.GetHealth(queryUnit) * health_mul;
    const hp_max = Entities.GetMaxHealth(queryUnit) * health_mul;
    // const hp_reg = Entities.GetHealthThinkRegen(queryUnit);
    const HpBarPanel = bar_panel_list["Hp"];
    const HpProgressBar = HpBarPanel.FindChildTraverse("ValueProgressBar") as ProgressBar;
    HpBarPanel.SetDialogVariable("value", FormatIntToString(hp_val))
    HpBarPanel.SetDialogVariable("max_value", FormatIntToString(hp_max))

    HpProgressBar.value = 100 - hp_val / (Math.max(1, hp_max)) * 100
    // HpBarPanel.SetDialogVariable("reg", reg.toFixed(1))

    const MpBarPanel = bar_panel_list["Mp"];
    const MpProgressBar = MpBarPanel.FindChildTraverse("ValueProgressBar") as ProgressBar;
    const mp_val = Entities.GetMana(queryUnit);
    const mp_max = Entities.GetMaxMana(queryUnit);
    MpBarPanel.SetDialogVariable("value", FormatIntToString(mp_val))
    MpBarPanel.SetDialogVariable("max_value", FormatIntToString(mp_max))
    MpProgressBar.value = mp_val / (Math.max(1, mp_max)) * 100
    // const mp_reg = Entities.GetManaThinkRegen(queryUnit);
}

(function () {
    // CreatePanel_HpBar();
})();