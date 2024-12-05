import { GetTextureSrc } from "../../common/custom_kv_method";
import { SetLabelDescriptionExtra } from "../../utils/ability_description";
import { default as MysteriousShopConfig } from "./../../json/config/game/shop/mysterious_shop_config.json"

const MainPanel = $.GetContextPanel();

export function Init() {
    let m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
    $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
    $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
    m_TooltipPanel.FindChild('TopArrow')!.visible = false;
    m_TooltipPanel.FindChild('BottomArrow')!.visible = false;


    MainPanel.SetPanelEvent("ontooltiploaded", () => {

        let name = $.GetContextPanel().GetAttributeString("name", "");
        let propData = MysteriousShopConfig[name as keyof typeof MysteriousShopConfig];

        let PropImage = $("#PropImage") as ImagePanel;
        let textrue = propData.AbilityTextureName;
        PropImage.SetImage(GetTextureSrc(textrue));

        let rarity = propData.rarity;
        for (let r = 1; r <= 7; r++) {
            MainPanel.SetHasClass("rare_" + r, rarity == r);
        }
        MainPanel.SetDialogVariable("prop_title", $.Localize(`#custom_shopitem_${name}`))

        let prop_desc = SetLabelDescriptionExtra(
            $.Localize(`#custom_shopitem_${name}_Description`),
            0,
            propData.AbilityValues,
            propData.ObjectValues
        );
        // $.Msg(["prop_desc",prop_desc])
        // let text = prop_desc+prop_desc+prop_desc+prop_desc+prop_desc+prop_desc+prop_desc+prop_desc
        MainPanel.SetDialogVariable("prop_desc", prop_desc)
        // SetAbilityBaseInfo(name, entityIndex)
    });
}

(function () {
    Init()
})();