import { GetTextureSrc } from "../../common/custom_kv_method";
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
        MainPanel.SetHasClass("rare_1", rarity == 1);
        MainPanel.SetHasClass("rare_2", rarity == 2);
        MainPanel.SetHasClass("rare_3", rarity == 3);
        MainPanel.SetDialogVariable("prop_title", $.Localize(`#custom_shopitem_${name}`))
        MainPanel.SetDialogVariable("prop_desc", $.Localize(`#custom_shopitem_${name}_Description`))
        // SetAbilityBaseInfo(name, entityIndex)
    });
}

(function () {
    Init()
})();