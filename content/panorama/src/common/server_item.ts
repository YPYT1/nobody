import { default as ServerItemList } from "../json/config/server/item/server_item_list.json";

export function CreateServerItem(item_id: string, item_count: number, parent: Panel) {
    let ServerItemPanel = $.CreatePanel("Panel", parent, "");
    ServerItemPanel.BLoadLayout("file://{resources}/layout/custom_game/components/server_item/server_item.xml", true, false);
    ServerItemPanel.Data<PanelDataObject>().SetItemValue({ item_id, item_count })
    return ServerItemPanel
}

export function GetServerItemData(item_id:string){
    return ServerItemList[item_id as keyof typeof ServerItemList];
}