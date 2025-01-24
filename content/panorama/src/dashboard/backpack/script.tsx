import { DASHBOARD_NAVBAR } from './../components';
import { CreateCustomComponent, LoadCustomComponent } from '../_components/component_manager';
import { GetTextureSrc } from '../../common/custom_kv_method';
const ServerItemList = GameUI.CustomUIConfig().KvData.ServerItemList;
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

const UseBackpackCount = $("#UseBackpackCount") as TextEntry;
let view_item_id = -1;

const CGE_Subscribe = () => {

    GameEvents.Subscribe("ServiceInterface_GetPlayerServerPackageData", event => {
        // 这个是渲染所有物品
        // if (true) {
        //     InitAllBackpackItemList()
        //     return
        // }
        let data = event.data;
        let ItemList = Object.values(data);
        let ids_backpack: { [id: string]: AM2_Server_Backpack } = {};
        let backpack_count_table: { [item_id: string]: number } = {}
        BackpackItemList.RemoveAndDeleteChildren();

        for (let ItemData of ItemList) {
            let item_id = "" + ItemData.item_id;
            ids_backpack[item_id] = ItemData;
            backpack_count_table[item_id] = ItemData.number;

            let item_data = ServerItemList[item_id as keyof typeof ServerItemList];
            // $.Msg(["item_data", item_id, item_data])
            if (item_data == null) {
                $.Msg(["Null ItemId", item_id])
                continue
            }
            let item_class = item_data.affiliation_class;
            if (item_class == 23) {
                continue
            }
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

            if (view_item_id == ItemData.item_id) {
                ItemRadio.checked = true;
                ViewItem("" + view_item_id, ItemData.number)
            }
        }

        // 储存当前背包物品的数量
        GameUI.CustomUIConfig().setStorage("backpack_count_table", backpack_count_table);
    })




    SendCustomEvent("ServiceInterface", "GetPlayerServerPackageData", {})


}

/** 背包全道具图鉴 */
const InitAllBackpackItemList = () => {
    BackpackItemList.RemoveAndDeleteChildren();
    for (let item_id in ServerItemList) {
        let data = ServerItemList[item_id as keyof typeof ServerItemList];
        let ItemRadio = $.CreatePanel("RadioButton", BackpackItemList, "", { group: "backpack_group" })
        ItemRadio.BLoadLayoutSnippet("BackpackItem");
        ItemRadio.AddClass("test");

        let item_name = $.Localize("#custom_serveritem_" + item_id);
        ItemRadio.SetDialogVariable("item_name", item_name)
        let ServerItemImage = ItemRadio.FindChildTraverse("ServerItemImage") as ImagePanel;
        let texture_name = data.AbilityTextureName;
        ServerItemImage.SetImage(GetTextureSrc(texture_name))

        ItemRadio.SetPanelEvent("onmouseover", () => {
            $.DispatchEvent(
                "UIShowCustomLayoutParametersTooltip",
                ItemRadio,
                "custom_tooltip_serveritem",
                "file://{resources}/layout/custom_game/tooltip/server_item/layout.xml",
                `item_id=${item_id}&count=${0}&show_count=${0}`
            );
        })

        ItemRadio.SetPanelEvent("onmouseout", () => {
            $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_serveritem");
        })

    }

}


const InitItemDetails = () => {
    ItemDetails.SetHasClass("Show", false)
    ItemDetails.SetDialogVariable("item_name", "")
    ItemDetails.SetDialogVariable("item_desc", "")
    ItemDetails.SetDialogVariableInt("item_amount", 0)

    UseBackpackItemBtn.SetPanelEvent("onactivate", () => {
        let text = UseBackpackCount.text.length <= 0 ? "1" : UseBackpackCount.text
        let count = Math.max(1, parseInt(text))
        $.Msg(["UseBackpackItem:", view_item_id, count])

        // 弹窗
        if (view_item_id > 0) {
            GameEvents.SendCustomGameEventToServer("ServiceInterface", {
                event_name: "UseItem",
                params: {
                    use_item_id: view_item_id, //使用
                    count: count
                }
            })
        }
        // 请求

        // GameUI.CustomUIConfig().DashboardRoute("personal","stone")
    })

    UpdateBackpackBtn.SetPanelEvent("onactivate", () => {
        SendCustomEvent("ServiceInterface", "GetPlayerServerPackageData", {})
    })


    UseBackpackCount.SetPanelEvent('ontextentrychange', () => {
        let text = UseBackpackCount.text
        if (text.indexOf("-") != -1) {
            UseBackpackCount.text = "";
        } else if (parseInt(text) > 10) {
            UseBackpackCount.text = "10";
        } else if (parseInt(text) < 1) {
            UseBackpackCount.text = "1";
        }
    })
}

const ViewItem = (item_id: string, count: number) => {
    view_item_id = parseInt(item_id);
    let item_data = ServerItemList[item_id as keyof typeof ServerItemList]
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

    let can_use = item_data.uses == 1;
    // $.Msg(["can_use", item_id, item_data.is_use, can_use])
    ItemDetails.SetHasClass("can_use", can_use)
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
            NavRadioBtn.SetPanelEvent("onselect", () => {

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