import { GetTextureSrc } from "../../common/custom_kv_method";
import { SetLabelDescriptionExtra } from "../../utils/ability_description";
import { default as RuneConfig } from "./../../json/config/game/rune/rune_config.json"

const MainPanel = $.GetContextPanel();

export function Init() {
    let m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
    $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
    $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
    m_TooltipPanel.FindChild('TopArrow')!.visible = false;
    m_TooltipPanel.FindChild('BottomArrow')!.visible = false;


    MainPanel.SetPanelEvent("ontooltiploaded", () => {

        let rarity = $.GetContextPanel().GetAttributeInt("level", 0);
        let name = $.GetContextPanel().GetAttributeString("name", "");

        let Data = RuneConfig[name as keyof typeof RuneConfig];
        let Image = $("#Image") as ImagePanel;
        let textrue = Data.AbilityTextureName;
        Image.SetImage(GetTextureSrc(textrue));
        MainPanel.SetHasClass("rare_1", rarity == 1);
        MainPanel.SetHasClass("rare_2", rarity == 2);
        MainPanel.SetHasClass("rare_3", rarity == 3);
        MainPanel.SetDialogVariable("title", $.Localize(`#custom_${name}`))

        // let row_rune_data = RuneConfig[name];
        let ObjectValues = Data.ObjectValues;
        let AbilityValues = Data.AbilityValues;

        let rune_desc = SetLabelDescriptionExtra($.Localize(`#custom_${name}_Description`), rarity, AbilityValues, ObjectValues);
        MainPanel.SetDialogVariable("desc", rune_desc)
        // MainPanel.SetDialogVariable("desc", $.Localize(`#custom_${name}_Description`))
        // SetAbilityBaseInfo(name, entityIndex)
    });
}

(function () {
    Init()
})();