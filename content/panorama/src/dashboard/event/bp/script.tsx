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
    let bp_type_list = Object.values(all_pass_data);
    for (let pass_type in all_pass_data) {
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
        NavContent.SetHasClass("1",pass_type == "1");
        let BattlePassList = NavContent.FindChildTraverse("BattlePassList")!;
        for (let level in row_pass_data) {
            let row_data = row_pass_data[level];

            let BattlePassItem = $.CreatePanel("Panel", BattlePassList, level);
            BattlePassItem.BLoadLayoutSnippet("BattlePassItem");
            BattlePassItem.SetDialogVariable("level", level);
            BattlePassItem.AddClass("Locking");
            let pt_arr = ConvertServerItemToArray(row_data.pt_item_id);
            const PtItemList = BattlePassItem.FindChildTraverse("PtItemList")!;
            SetPassRowItemList(pt_arr,PtItemList)
           
            let gj_arr = ConvertServerItemToArray(row_data.gj_item_id);
            const GjItemList = BattlePassItem.FindChildTraverse("GjItemList")!;
            SetPassRowItemList(gj_arr,GjItemList)
        }
    }

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

(() => {
    Init();
})();