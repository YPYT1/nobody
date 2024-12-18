import { LoadCustomComponent } from "../../dashboard/_components/component_manager";
const ServerItemList = GameUI.CustomUIConfig().KvData.ServerItemList;
const MainPanel = $.GetContextPanel();

let ServerItemPanel = LoadCustomComponent($("#ItemBorder"), "server_item");
ServerItemPanel._SetServerItemInfo({ show_count: false })
const SetTooltipView = (item_id: string, count: number, show_count: number) => {
    let item_data = ServerItemList[item_id as keyof typeof ServerItemList];
    let rarity = item_data.quality
    let item_name = $.Localize("#custom_serveritem_" + item_id)
    let item_desc = $.Localize("#custom_serveritem_" + item_id + "_desc")
    MainPanel.SetDialogVariable("item_name", item_name);
    MainPanel.SetDialogVariable("item_desc", item_desc);
    MainPanel.SetDialogVariableInt("item_amount", count);
    for (let r = 1; r <= 6; r++) {
        MainPanel.SetHasClass("rare_" + r, r == rarity)
    }

    // $.Msg(["show_count",show_count])
    MainPanel.SetHasClass("show_count", show_count == 1)
    ServerItemPanel._SetItemId(item_id)
}


export function Init() {
    let m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
    $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
    $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
    m_TooltipPanel.FindChild('TopArrow')!.visible = false;
    m_TooltipPanel.FindChild('BottomArrow')!.visible = false;




    MainPanel.SetPanelEvent("ontooltiploaded", () => {
        let count = $.GetContextPanel().GetAttributeInt("count", 0);
        let item_id = $.GetContextPanel().GetAttributeString("item_id", "");
        let show_count = $.GetContextPanel().GetAttributeInt("show_count", 0);
        // let rarity = $.GetContextPanel().GetAttributeInt("r", 0);
        // $.Msg([item_id, count, rarity, show_count])

        SetTooltipView(item_id, count, show_count)
        // $.Msg([count,item_id,show_count])
    });

}


(function () {
    Init()
})();