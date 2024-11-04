// import { default as ServerItemList } from "../json/config/server/item/server_item_list.json";

// import { default as PictuerCardData } from "../json/config/server/picture/pictuer_card_data.json";
// import { default as PictuerFetterConfig } from "../json/config/server/picture/pictuer_fetter_config.json";
// import { default as PictuerFetterAbility } from "../json/config/server/picture/pictuer_fetter_ability.json";


// export function CreateServerItem(item_id: string, item_count: number, parent: Panel) {
//     let ServerItemPanel = $.CreatePanel("Panel", parent, "");
//     ServerItemPanel.BLoadLayout("file://{resources}/layout/custom_game/components/server_item/server_item.xml", true, false);
//     ServerItemPanel.Data<PanelDataObject>().SetItemValue({ item_id, item_count })
//     return ServerItemPanel
// }

// export function GetServerItemData(item_id:string){
//     return ServerItemList[item_id as keyof typeof ServerItemList];
// }

// /** 通过 itemid 获得对应卡片信息 */
// export function GetPictureCardData(item_id:string){
//     return PictuerCardData[item_id as keyof typeof PictuerCardData];
// }