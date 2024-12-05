import { LoadGameComponent } from "../../home/component/component_manager";
import { SetLabelDescriptionExtra } from "../../utils/ability_description";

const MysteriousShopConfig = GameUI.CustomUIConfig().KvData.MysteriousShopConfig;

const MainPanel = $.GetContextPanel();
const LimitStar = LoadGameComponent($("#LimitStar"), "prop_item_star");
LimitStar._Init(5, 0, 30)

export function Init() {

    let m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
    $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
    $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
    m_TooltipPanel.FindChild('TopArrow')!.visible = false;
    m_TooltipPanel.FindChild('BottomArrow')!.visible = false;


    MainPanel.SetPanelEvent("ontooltiploaded", () => {
        let item_id = MainPanel.GetAttributeString("item_id", "")
        let rare = MainPanel.GetAttributeInt("rare", 0)
        // $.Msg(["item_id", item_id, "rare", rare])

        MainPanel.SetDialogVariable("item_name", $.Localize(`#custom_shopitem_${item_id}`))

        for (let r = 1; r <= 6; r++) {
            MainPanel.SetHasClass("rare_" + r, r == rare)
        }
        const ShopItemJson = MysteriousShopConfig[item_id as keyof typeof MysteriousShopConfig];
        let object_percent = ShopItemJson.star_attr_pro[rare - 2];
        // $.Msg(["object_percent", object_percent])
        let item_desc = SetLabelDescriptionExtra(
            $.Localize(`#custom_shopitem_${item_id}_Description`),
            rare - 2,
            ShopItemJson.AbilityValues,
            ShopItemJson.ObjectValues,
            false,
            object_percent
        )

        MainPanel.SetDialogVariable("item_desc", item_desc)

        LimitStar._SetStar(rare)
    })
}

(function () {
    Init()
})();