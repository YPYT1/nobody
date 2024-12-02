import { DASHBOARD_NAVBAR } from './../components';
import { CreateCustomComponent, LoadCustomComponent } from '../_components/component_manager';


const DASHBOARD = "backpack";
const SUB_OBJECT = DASHBOARD_NAVBAR[DASHBOARD].Sub;

const NavButtonList = $("#NavButtonList");
const ContentFrame = $("#ContentFrame");
const FRAME_PATH = "file://{resources}/layout/custom_game/dashboard/backpack/";

const BackpackItemList = $("#BackpackItemList");
const ItemDetails = $("#ItemDetails");
const UseBackpackItemBtn = $("#UseBackpackItemBtn") as Button;
const UpdateBackpackBtn = $("#UpdateBackpackBtn") as Button;
// const ItemComponent = $("#ItemComponent");
const ItemComponent = LoadCustomComponent($("#ItemComponent"), "server_item");
ItemComponent._SetServerItemInfo({ show_count: false });

const Component_ItemName = LoadCustomComponent($("#Component_ItemName"), "server_item_name");
Component_ItemName._SetSize(22);

const SendCustomEvent = GameUI.CustomUIConfig().SendCustomEvent;
const GetServerItemData = GameUI.CustomUIConfig().GetServerItemData;
const EventBus = GameUI.CustomUIConfig().EventBus;

let view_item_id = -1;

const CGE_Subscribe = () => {

    GameEvents.Subscribe("ServiceInterface_GetPlayerServerPackageData", event => {
        // 这个是渲染所有物品
        // $.Msg(["ServiceInterface_GetPlayerServerPackageData"])
        let data = event.data;
        let ItemList = Object.values(data);
        let ids_backpack: { [id: string]: AM2_Server_Backpack } = {}
        BackpackItemList.RemoveAndDeleteChildren();

        for (let ItemData of ItemList) {
            let item_id = ItemData.item_id;
            ids_backpack[item_id] = ItemData
            let ItemRadio = $.CreatePanel("RadioButton", BackpackItemList, "", { group: "backpack_group" })
            ItemRadio.BLoadLayoutSnippet("BackpackItem");
            let ServerItem = ItemRadio.FindChildTraverse("ServerItem")!;
            let ItemPanel = LoadCustomComponent(ServerItem, "server_item");
            ItemPanel._SetServerItemInfo({
                item_id: item_id,
                item_count: ItemData.number,
                show_count: true,
                show_tips: true,
            })

            ItemRadio.Data<PanelDataObject>().amount = ItemData.number
            ItemRadio.SetPanelEvent("onactivate", () => {
                let amount = ItemRadio.Data<PanelDataObject>().amount as number;
                ViewItem("" + item_id, amount)
            })
        }


        EventBus.publish("backpack_update", ids_backpack)
    })

    SendCustomEvent("ServiceInterface", "GetPlayerServerPackageData", {})


}


const InitItemDetails = () => {
    ItemDetails.SetHasClass("Show", false)
    ItemDetails.SetDialogVariable("item_name", "")
    ItemDetails.SetDialogVariable("item_desc", "")
    ItemDetails.SetDialogVariableInt("item_amount", 0)

    UseBackpackItemBtn.SetPanelEvent("onactivate", () => {
        $.Msg(["UseBackpackItem:", view_item_id])
    })

    UpdateBackpackBtn.SetPanelEvent("onactivate", () => {
        SendCustomEvent("ServiceInterface", "GetPlayerServerPackageData", {})
    })
}

const ViewItem = (item_id: string, count: number) => {
    view_item_id = parseInt(item_id);
    let item_data = GetServerItemData(item_id)
    let item_rare = item_data.quality
    // let item_name = $.Localize("#custom_serveritem_" + item_id)
    let item_desc = $.Localize("#custom_serveritem_" + item_id + "_desc")
    // ItemDetails.SetDialogVariable("item_name", item_name)

    ItemDetails.SetDialogVariable("item_desc", item_desc)
    ItemDetails.SetDialogVariableInt("item_amount", count)

    for (let r = 1; r <= 6; r++) {
        ItemDetails.SetHasClass("rare_" + r, r == item_rare)
    }
    Component_ItemName._SetItemId(item_id)
    ItemComponent._SetItemId(item_id)
    ItemDetails.SetHasClass("Show", true)
}
export const Init = () => {
    // 加载nav button
    NavButtonList.RemoveAndDeleteChildren();
    // ContentFrame.RemoveAndDeleteChildren();
    let order = 0;
    for (let sub_key in SUB_OBJECT) {
        let sub_state = SUB_OBJECT[sub_key as keyof typeof SUB_OBJECT];
        if (sub_state) {
            let radiobtn_id = `${DASHBOARD}_${sub_key}`
            let NavRadioBtn = $.CreatePanel("RadioButton", NavButtonList, radiobtn_id);
            NavRadioBtn.BLoadLayoutSnippet("CardNavRadioButton");
            NavRadioBtn.SetDialogVariable("button_txt", $.Localize("#custom_dashboard_nav_" + radiobtn_id))
            NavRadioBtn.checked = order == 0;
            NavRadioBtn.SetPanelEvent("onactivate", () => {

            })

            order++;
        }
    }

    CGE_Subscribe();

    InitItemDetails();
}

(() => {

    Init();
})();