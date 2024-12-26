import { LoadCustomComponent } from "../_components/component_manager";
import { DASHBOARD_NAVBAR } from "../components";

const DASHBOARD = "store";
const SUB_OBJECT = DASHBOARD_NAVBAR[DASHBOARD].Sub;
const NavButtonList = $("#NavButtonList");
const ContentFrame = $("#ContentFrame");
const FRAME_PATH = `file://{resources}/layout/custom_game/dashboard/${DASHBOARD}/`;

const CurrencyList = $("#CurrencyList");

/**
 * 1001,1002,1003,1004,1005,1006,1007,1008
 */
/** 顶部显示的货币列表 */
const Show_Top_Currency = [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008];

export function Init() {
    InitNavMenu()
}

function InitNavMenu() {

    NavButtonList.RemoveAndDeleteChildren()
    ContentFrame.RemoveAndDeleteChildren()
    let order = 0;
    for (let sub_key in SUB_OBJECT) {
        let sub_state = SUB_OBJECT[sub_key as keyof typeof SUB_OBJECT];
        if (sub_state) {
            let radiobtn_id = `${DASHBOARD}_${sub_key}`
            let NavRadioBtn = $.CreatePanel("RadioButton", NavButtonList, radiobtn_id);
            NavRadioBtn.BLoadLayoutSnippet("NavRadioButton");
            NavRadioBtn.SetDialogVariable("button_txt", $.Localize("#custom_dashboard_nav_" + radiobtn_id))
            NavRadioBtn.checked = order == 0;
            NavRadioBtn.SetPanelEvent("onactivate", () => {
                for (let nav_key of Object.keys(SUB_OBJECT)) {
                    ContentFrame.SetHasClass(nav_key, nav_key == sub_key)
                }
            })

            let NavContent = $.CreatePanel("Panel", ContentFrame, radiobtn_id, {
                hittest: false
            });
            let nav_path = `${FRAME_PATH}/${sub_key}/index.xml`;
            NavContent.BLoadLayout(nav_path, true, false);
            ContentFrame.SetHasClass(sub_key, order == 0)
            order++;
        }
    }

    // 货币列表
    CurrencyList.RemoveAndDeleteChildren();
    for (let currency_id of Show_Top_Currency) {
        let ServerCurrency = $.CreatePanel("Panel", CurrencyList, "" + currency_id);
        ServerCurrency.BLoadLayoutSnippet("ServerCurrency")
        ServerCurrency.SetDialogVariableInt("currency_count", 0)
        const _CurrencyIcon = ServerCurrency.FindChildTraverse("CurrencyIcon")!;
        const CurrencyIcon = LoadCustomComponent(_CurrencyIcon, "server_item");
        CurrencyIcon._SetServerItemInfo({ item_id: currency_id, show_count: false, hide_bg: true, show_tips: true })
    }

    GameEvents.Subscribe("ServiceInterface_GetPlayerServerGoldPackageData", event => {
        let data = event.data;
        let ItemList = Object.values(data);

        let currency_object:{[item:string]:number} = {}
        for (let _data of ItemList) {
            let item_id = _data.item_id;
            let item_count = _data.number;
            let ServerCurrency = CurrencyList.FindChildTraverse(`${item_id}`);
            currency_object[item_id] = item_count;
            if (ServerCurrency == null) { continue }
            ServerCurrency.SetDialogVariableInt("currency_count", item_count)
        }

        GameUI.CustomUIConfig().setStorage("currency_count",currency_object);
        
    })

    GameUI.CustomUIConfig().SendCustomEvent("ServiceInterface", "GetPlayerServerGoldPackageData", {})
}
(() => {
    Init();
})();