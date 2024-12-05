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

        let index = $.GetContextPanel().GetAttributeInt("level", 0);
        let name = $.GetContextPanel().GetAttributeString("name", "");
        let Data = RuneConfig[name as keyof typeof RuneConfig];
        let rarity = Data.item_level_section[index];
        let Image = $("#Image") as ImagePanel;
        let textrue = Data.AbilityTextureName;
        Image.SetImage(GetTextureSrc(textrue));
        
        for (let r = 1; r <= 7; r++) {
            MainPanel.SetHasClass("rare_" + r, rarity == r);
        }
        MainPanel.SetDialogVariable("title", $.Localize(`#custom_${name}`))

        $.Msg(["rarity",rarity])
        let ObjectValues = Data.ObjectValues;
        let AbilityValues = Data.AbilityValues;

        let rune_desc = SetLabelDescriptionExtra($.Localize(`#custom_${name}_Description`), index, AbilityValues, ObjectValues);
        MainPanel.SetDialogVariable("desc", rune_desc)
        // MainPanel.SetDialogVariable("desc", $.Localize(`#custom_${name}_Description`))
        // SetAbilityBaseInfo(name, entityIndex)
    });
}

(function () {
    Init()
})();