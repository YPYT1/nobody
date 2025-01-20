import { CreateCustomComponent, LoadCustomComponent } from "../../_components/component_manager";


const ServerPassData = GameUI.CustomUIConfig().KvData.server_pass_data;
const ConvertServerItemToArray = GameUI.CustomUIConfig().ConvertServerItemToArray
const ContextPanel = $.GetContextPanel();
const LeftNavBtnList = $("#LeftNavBtnList");
const NavContentFrame = $("#NavContentFrame");

type NavContentTypes = "c1" | "c2" | "c3" | "c4" | "c5";

// 成长礼目录
const NavMenuList: NavContentTypes[] = [
    "c1", // 元素大陆
    "c2", // 熔火炼狱
    "c3", // 狂风沙漠
    "c4", // 雷霆之地
    "c5", // 极北之地
];

let all_pass_data: {
    [type: string]: {
        [count: string]: {
            pt_item_id: string;
            gj_item_id: string;
        }
    }
} = {};


function InitServerPassData() {
    all_pass_data = {}
    for (let key in ServerPassData) {
        let row_data = ServerPassData[key as keyof typeof ServerPassData];
        let count_key = "" + row_data.count;
        let pass_type = row_data.server_pass_type;

        if (all_pass_data[pass_type] == null) {
            all_pass_data[pass_type] = {}
        }

        all_pass_data[pass_type][count_key] = {
            pt_item_id: row_data.pt_item_id,
            gj_item_id: row_data.gj_item_id,
        }


    }
};

export function Init() {

    InitServerPassData();

    LeftNavBtnList.RemoveAndDeleteChildren()
    NavContentFrame.RemoveAndDeleteChildren()
    // return;
    // let bp_type_list = Object.values(all_pass_data);
    for (let pass_type in all_pass_data) {
        // $.Msg(["pass_type", pass_type, pass_type == "1"])
        NavContentFrame.SetHasClass(pass_type, pass_type == "1");
        let row_pass_data = all_pass_data[pass_type];
        let NavRadioBtn = $.CreatePanel("RadioButton", LeftNavBtnList, pass_type, {
            group: "Dashboard_Event_BP",
        });
        NavRadioBtn.BLoadLayoutSnippet("LeftNavButton");
        NavRadioBtn.SetDialogVariable("nav_label", `event_bp_${pass_type}`)
        NavRadioBtn.checked = pass_type == "1";
        NavRadioBtn.SetPanelEvent("onactivate", () => {
            SwitchNavContent(pass_type)
        })

        let NavContent = $.CreatePanel("Panel", NavContentFrame, pass_type);
        NavContent.BLoadLayoutSnippet("NavContent");
        let BattlePassList = NavContent.FindChildTraverse("BattlePassList")!;
        for (let level in row_pass_data) {
            let row_data = row_pass_data[level];
            let BattlePassItem = $.CreatePanel("Panel", BattlePassList, level);
            BattlePassItem.BLoadLayoutSnippet("BattlePassItem");
            BattlePassItem.SetDialogVariable("level", level);

            let pt_arr = ConvertServerItemToArray(row_data.pt_item_id);
            const PtItemList = BattlePassItem.FindChildTraverse("PtItemList")!;
            PtItemList.AddClass("Locking");
            SetPassRowItemList(pt_arr, PtItemList)

            let gj_arr = ConvertServerItemToArray(row_data.gj_item_id);
            const GjItemList = BattlePassItem.FindChildTraverse("GjItemList")!;
            GjItemList.AddClass("Locking");
            SetPassRowItemList(gj_arr, GjItemList)
            PtItemList.enabled = false;
            PtItemList.SetPanelEvent("onactivate", () => {
                GameUI.CustomUIConfig().EventBus.publish("popup_loading", { show: true })
                GameEvents.SendCustomGameEventToServer("ServiceInterface", {
                    event_name: "GetServerPass",
                    params: {
                        type: parseInt(pass_type),
                        count: parseInt(level),
                        get_type: 1

                    }
                })
            })
            GjItemList.enabled = false;
            GjItemList.SetPanelEvent("onactivate", () => {
                GameUI.CustomUIConfig().EventBus.publish("popup_loading", { show: true })
                GameEvents.SendCustomGameEventToServer("ServiceInterface", {
                    event_name: "GetServerPass",
                    params: {
                        type: parseInt(pass_type),
                        count: parseInt(level),
                        get_type: 2
                    }
                })

            })
        }
    }

    InitCustomGameEvens();
}


function SetPassRowItemList(item_arr: ServerItemInput[], e: Panel) {
    for (let _data of item_arr) {
        let BpItemBorder = $.CreatePanel("Panel", e, _data.item_id);
        BpItemBorder.BLoadLayoutSnippet("BpItemBorder");

        let _ServerItem = BpItemBorder.FindChildTraverse("ServerItem")!;
        let ServerItem = LoadCustomComponent(_ServerItem, "server_item");
        ServerItem._SetServerItemInfo({
            item_id: _data.item_id,
            item_count: _data.item_count,
            show_tips: true,
            show_count: true
        })
    }
}

function SwitchNavContent(nav: string) {

    for (let nav_type of Object.keys(all_pass_data)) {
        NavContentFrame.SetHasClass(nav_type, nav == nav_type)
    }
}


function InitCustomGameEvens() {

    GameEvents.Subscribe("ServiceInterface_GetPlayerServerPassRecord", event => {
        UpdateBattlePass(event.data)
    })

    GameEvents.SendCustomGameEventToServer("ServiceInterface", {
        event_name: "GetPlayerServerPassRecord",
        params: {}
    })
}

function UpdateBattlePass(data: AM2_Draw_Pass_Record) {
    for (let pass_type in data) {
        const type_data = data[pass_type];
        const level = type_data.c
        const pt_acc = type_data.pt_acc;
        const gj_acc = type_data.gj_acc;
        const is_adv = type_data.adv == 1;
        const NavContent = NavContentFrame.FindChildTraverse(pass_type)!;
        const BattlePassList = NavContent.FindChildTraverse("BattlePassList")!;
        for (let i = 0; i < level; i++) {
            const BattlePassItem = BattlePassList.GetChild(i);
            if (BattlePassItem) {
                BattlePassItem.AddClass("on");
                // 领取状态
                const pt_state = pt_acc <= i ? "Hover" : "Already";
                const PtItemList = BattlePassItem.FindChildTraverse("PtItemList")!;
                PtItemList.RemoveClass("Locking");
                PtItemList.RemoveClass("Hover");
                PtItemList.RemoveClass("Already");
                PtItemList.AddClass(pt_state)
                PtItemList.enabled = pt_state == "Hover";
                if (is_adv) {
                    const GjItemList = BattlePassItem.FindChildTraverse("GjItemList")!;
                    const gj_state = gj_acc <= i ? "Hover" : "Already";

                    GjItemList.RemoveClass("Locking");
                    GjItemList.RemoveClass("Hover");
                    GjItemList.RemoveClass("Already");
                    GjItemList.AddClass(gj_state)
                    GjItemList.enabled = gj_state == "Hover";
                }
            }
        }

        // $.Msg(["pt_acc",pt_acc])
        let target_paenl = BattlePassList.GetChild(Math.min(78, pt_acc))
        if (target_paenl) {
            target_paenl.ScrollParentToMakePanelFit(0, false)
        }
    }
}
(() => {
    Init();
})();