import { DASHBOARD_NAVBAR } from './../components';
import { CreateCustomComponent, LoadCustomComponent } from '../_components/component_manager';


const DASHBOARD = "backpack";
const SUB_OBJECT = DASHBOARD_NAVBAR[DASHBOARD].Sub;

const NavButtonList = $("#NavButtonList");
const ContentFrame = $("#ContentFrame");
const FRAME_PATH = "file://{resources}/layout/custom_game/dashboard/backpack/";

const BackpackItemList = $("#BackpackItemList")
const SendCustomEvent = GameUI.CustomUIConfig().SendCustomEvent

const CGE_Subscribe = () => {

    GameEvents.Subscribe("ServiceInterface_GetPlayerServerPackageData", event => {
        // 这个是渲染所有物品
        // $.Msg(["ServiceInterface_GetPlayerServerPackageData"])
        let data = event.data;
        let ItemList = Object.values(data)
        BackpackItemList.RemoveAndDeleteChildren();
        for (let ItemData of ItemList) {
            let item_id = ItemData.item_id;
            let ItemRadio = $.CreatePanel("RadioButton", BackpackItemList, "", { group: "backpack_group" })
            let ItemInfo = $.CreatePanel("Panel", ItemRadio, "")
            let ItemPanel = LoadCustomComponent(ItemInfo, "server_item");
            ItemPanel._SetServerItemInfo({
                item_id: item_id,
                item_count: ItemData.number,
                show_count: true,
            })
        }
    })
    SendCustomEvent("ServiceInterface", "GetPlayerServerPackageData", {})
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
}

(() => {

    Init();
})();