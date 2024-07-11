import { GetTextureSrc } from "../../common/custom_kv_method";
import { default as talent_tree_drow_ranger } from "../../json/config/game/hero/talent_tree/drow_ranger.json";
import { FormatDescription } from "../../utils/method";

let talent_tree = {
    ["drow_ranger"]: talent_tree_drow_ranger
}

let MainPanel = $.GetContextPanel();
let TalentIcon = $("#TalentIcon") as ImagePanel;
export function Init() {

    let m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
    $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
    $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
    m_TooltipPanel.FindChild('TopArrow')!.visible = false;
    m_TooltipPanel.FindChild('BottomArrow')!.visible = false;

    $.GetContextPanel().SetPanelEvent("ontooltiploaded", () => {
        UpdateTooltip()
    });
}

function UpdateTooltip() {
    let hero = MainPanel.GetAttributeString("hero", "");
    let key = MainPanel.GetAttributeString("key", "1");
    let level = MainPanel.GetAttributeInt("level", 0);
    // $.Msg(["HERO", hero, key, level])

    let talent_data = talent_tree[hero as keyof typeof talent_tree][key as "1"]
    let img = talent_data.img;
    let AbilityValues = talent_data.AbilityValues;
    TalentIcon.SetImage(GetTextureSrc(img))


    MainPanel.SetDialogVariableInt("max", talent_data.max_number)
    MainPanel.SetDialogVariableInt("level", level)

    let talent_name = $.Localize(`#custom_talent_${hero}_${key}`)
    MainPanel.SetDialogVariable("talent_name", talent_name)

    let talent_desc = $.Localize(`#custom_talent_${hero}_${key}_desc`)
    let description_txt = FormatDescription(talent_desc, AbilityValues, level, true);

    MainPanel.SetDialogVariable("talent_desc", description_txt)
}

(function () {
    Init()
})();