
export function CreateServerItem(item_id: string, item_count: number, parent: Panel) {
    let ServerItemPanel = $.CreatePanel("Panel", parent, "");
    ServerItemPanel.BLoadLayout("file://{resources}/layout/custom_game/components/server_item/server_item.xml", true, false);
    ServerItemPanel.Data<PanelDataObject>().SetItemValue({ item_id, item_count })
    return ServerItemPanel
}