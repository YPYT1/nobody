import { CreateCustomComponent } from "../../_components/component_manager"
import { default as ServerSkillExp } from "./../../../json/config/server/hero/server_skill_exp.json"
import { default as ServerSkillful } from "./../../../json/config/server/hero/server_skillful.json"

const PlayerExp = $("#PlayerExp") as ProgressBar;
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc
const SendCustomEvent = GameUI.CustomUIConfig().SendCustomEvent
const MainPanel = $.GetContextPanel()
const SkillList = $("#SkillList");
const OffsetTest = $("#OffsetTest") as Button;
const EventBus = GameUI.CustomUIConfig().EventBus;
const PopupsServerItem = CreateCustomComponent($("#PopupsServerItem"), 'server_item', "");
PopupsServerItem._SetServerItemInfo({ item_id: 1001, show_count: true, show_tips: true, })
const UpperItem = CreateCustomComponent($("#UpperItem"), "server_item", "")
UpperItem._SetServerItemInfo({ item_id: 1001, show_count: false, show_tips: true, hide_bg: true });

let skill_sub_tree: { [id: string]: string[] } = {};
let SkillPopups = $("#SkillPopups");
let UppderSkillBtn = $("#UppderSkillBtn") as Button
let PopupsButtonCancel = $("#PopupsButtonCancel") as Button;
let PopupsButtonConfirm = $("#PopupsButtonConfirm") as Button;

let sub_skill_level: CGEDServerSkillTypeLevel = {};
let main_skill_level: PlayerServerSkillLevelCount = {
    level: {}
};

let view_skill_id = "";
export const Init = () => {
    UppderSkillBtn.enabled = false;
    skill_sub_tree = {}
    for (let id in ServerSkillful) {
        let sub_data = ServerSkillful[id as keyof typeof ServerSkillful];
        let main_id = "" + sub_data.type;
        if (skill_sub_tree[main_id] == null) { skill_sub_tree[main_id] = [] }
        skill_sub_tree[main_id].push(id)
    }

    UpperExpProgress.value = 0;
    UpperExpProgress.SetDialogVariableInt("curr_exp", 0)
    UpperExpProgress.SetDialogVariableInt("upper_exp", 0)
    MainPanel.SetDialogVariableInt("skill_point", 0);
    MainPanel.SetDialogVariableInt("skill_exp", 0);
    MainPanel.SetDialogVariableInt("upper_cost", 0)
    MainPanel.SetDialogVariable("upper_skill_name", "技能名");
    MainPanel.SetDialogVariableInt("upper_skill_lv", 0);
    MainPanel.SetDialogVariable("upper_skill_desc", "点将卡是点将卡手机看来点将卡氪金了大师即可%304iffgsjlfd嗯嗯");

    // let actualuiscale_x = OffsetTest.actualuiscale_x;
    // let actualuiscale_y = OffsetTest.actualuiscale_y;
    // OffsetTest.SetPanelEvent("onactivate", () => {
    //     let offset = GameUI.GetCursorPosition()
    //     OffsetTest.SetDialogVariable("offset",
    //         `${Math.floor((offset[0] - 234) / actualuiscale_x)} , ${Math.floor((offset[1] - 200) / actualuiscale_y)}`
    //     )
    // })

    SkillList.RemoveAndDeleteChildren()
    for (let id in ServerSkillExp) {
        let data = ServerSkillExp[id as keyof typeof ServerSkillExp];
        let SkillRows = $.CreatePanel("RadioButton", SkillList, id, {
            group: "PersonalSkillGroup"
        })
        SkillRows.BLoadLayoutSnippet("SkillRows");
        SkillRows.SetHasClass("Small", data.type == 1)
        let SkillIcon = SkillRows.FindChildTraverse("SkillIcon") as ImagePanel;
        let img = data.img;
        let src = GetTextureSrc(img);
        SkillIcon.SetImage(src);

        let diff_x = data.type == 1 ? 44 : 61;
        let diff_y = data.type == 1 ? (88) / 2 : (121) / 2; // 23
        SkillRows.style.transform = `translateX(${data.x - diff_x}px) translateY(${data.y - diff_y}px)`;

        // exp 百分比
        const ExpProgress = SkillRows.FindChildTraverse("ExpProgress") as ProgressBar;
        ExpProgress.value = 0;

        // 查看具体精通信息
        SkillRows.SetPanelEvent("onactivate", () => {
            // $.Msg(["view skill main id",id])
            ViewSkillMainOfID(id)
        })
    }


    CGED_Init()

    UppderSkillBtn.SetPanelEvent("onactivate", () => {
        OpenUpperPopups(true)
    })

    PopupsButtonCancel.SetPanelEvent("onactivate", () => {
        OpenUpperPopups(false)
    })

    PopupsButtonConfirm.SetPanelEvent("onactivate", () => {
        OpenUpperPopups(false)
        let key_id = SkillPopups.Data<PanelDataObject>().id as string;
        GameEvents.SendCustomGameEventToServer("ServiceInterface", {
            event_name: "ServerSkillUp",
            params: {
                key: key_id
            }
        })
    })
}



let ServerItemCount = {
    "1292": 0,
    "1293": 0,
}

const CGED_Init = () => {

    GameEvents.Subscribe("ServiceInterface_GetPlayerServerSkillData", event => {
        // $.Msg(["ServiceInterface_GetPlayerServerSkillData"])
        let data = event.data;
        sub_skill_level = data.SkillTypeLevel
        main_skill_level = data.SkillLevel
        for (let i = 0; i < SkillList.GetChildCount(); i++) {
            let SkillRows = SkillList.GetChild(i)!;
            let id = SkillRows.id;
            let row_main_data = main_skill_level.level[id];
            if (row_main_data == null) {
                SkillRows.SetDialogVariableInt("level", 0)
                continue
            }
            SkillRows.SetDialogVariableInt("level", row_main_data.lv)
        }

        if (view_skill_id != "") {
            // 更新页面
            ViewSkillMainOfID(view_skill_id)
        }
    })

    SendCustomEvent("ServiceInterface", "GetPlayerServerSkillData", {})

    // 更新背包
    EventBus.subscribe("backpack_update", data => {
        //1292	高阶精通点
        $.Msg(["backpack_update111"])
        let item1292 = data['1292']
        let item1292_count = item1292 == null ? 0 : item1292.number
        ServerItemCount[1292] = item1292_count
        MainPanel.SetDialogVariableInt("skill_point", item1292_count);
        //1293	技能精通经验
        let item1293 = data['1293']
        let item1293_count = item1293 == null ? 0 : item1293.number
        ServerItemCount[1293] = item1293_count
        MainPanel.SetDialogVariableInt("skill_exp", item1293_count);
    })

}



const UpperSubList = $("#UpperSubList")
const UpperSkillSub = $("#UpperSkillSub");
const UpperExpProgress = $("#UpperExpProgress") as ProgressBar;
const UppderIcon = $("#UppderIcon") as ImagePanel;

const ViewSkillMainOfID = (id: string) => {
    view_skill_id = id;
    SkillPopups.Data<PanelDataObject>().id = id
    let main_skill_data = ServerSkillExp[id as keyof typeof ServerSkillExp];
    let skill_src = GetTextureSrc(main_skill_data.img)
    UppderIcon.SetImage(skill_src)
    MainPanel.SetDialogVariable("upper_skill_name", $.Localize(`#custom_server_skill_main_${id}`));
    MainPanel.SetDialogVariable("upper_skill_desc", $.Localize(`#custom_server_skill_main_${id}_desc`));

    UpperSubList.RemoveAndDeleteChildren();
    UpperSkillSub.RemoveAndDeleteChildren();
    // 读取子id
    let sub_id_list = skill_sub_tree[id]
    for (let i = 0; i < sub_id_list.length; i++) {
        let is_only = sub_id_list.length == 1;
        let is_first = (i == 0) && !is_only;
        let is_last = (i == sub_id_list.length - 1) && !is_only;

        let sub_id = sub_id_list[i];

        let sub_data = ServerSkillful[sub_id as keyof typeof ServerSkillful];
        let skill_level = sub_skill_level[sub_id] ? sub_skill_level[sub_id].lv : 0

        let UpperSubSkill = $.CreatePanel("Panel", UpperSkillSub, "")
        UpperSubSkill.BLoadLayoutSnippet("UpperSubSkill");
        UpperSubSkill.SetDialogVariableInt("skill_level", skill_level)
        UpperSubSkill.SetDialogVariable("skill_name", $.Localize("#custom_server_skill_sub_" + sub_id));
        UpperSubSkill.SetDialogVariable("skill_desc", $.Localize(`#custom_server_skill_sub_${sub_id}_desc`))

        UpperSubSkill.SetHasClass("On", skill_level > 0)
        let SubSkill = $.CreatePanel("Panel", UpperSubList, "")
        SubSkill.BLoadLayoutSnippet("SubSkill");
        SubSkill.SetHasClass("is_only", is_only)
        SubSkill.SetHasClass("is_first", is_first)
        SubSkill.SetHasClass("is_last", is_last)
        SubSkill.SetHasClass("On", skill_level > 0)
        let SubUppderIcon = SubSkill.FindChildTraverse("SubUppderIcon") as ImagePanel;

        let sub_src = GetTextureSrc(sub_data.img);
        SubUppderIcon.SetImage(sub_src)

    }

    let main_data = main_skill_level.level[id];
    if(main_data == null){ return }
    let is_adv = main_data.is_adv == 1;


    MainPanel.SetDialogVariableInt("upper_skill_lv", main_data.lv);
    UpperExpProgress.SetDialogVariableInt("curr_exp", main_data.cur_exp)
    UpperExpProgress.SetDialogVariableInt("upper_exp", main_data.level_exp)
    let progress_pct = 0
    let diff_value = main_data.level_exp - main_data.cur_exp;

    let diff_cost = is_adv ? diff_value : Math.ceil(diff_value / 1000)
    if (main_data.level_exp == -1 || main_data.is_max == 1) {
        progress_pct = 100
        UppderSkillBtn.enabled = false
    } else {
        UppderSkillBtn.enabled = true
        progress_pct = Math.floor(100 * main_data.cur_exp / main_data.level_exp)
    }
    UpperExpProgress.value = progress_pct;


    let need_item = main_data.need_item;
    UppderSkillBtn.Data<PanelDataObject>().need_item = need_item
    let need_cost = 0
    for (let item_id in need_item) {
        need_cost = need_item[item_id]
        UpperItem._SetItemId(item_id)
        MainPanel.SetDialogVariableInt("upper_cost", need_cost)
    }
    let is_meet = is_adv ? ServerItemCount["1292"] >= need_cost : ServerItemCount["1293"] >= need_cost
    // $.Msg(["diff_cost",diff_cost,is_meet , ServerItemCount , need_cost])


}

const OpenUpperPopups = (show: boolean) => {
    if (show == false) {
        SkillPopups.RemoveClass("Show")
        return
    }
    SkillPopups.AddClass("Show")
    let need_item = UppderSkillBtn.Data<PanelDataObject>().need_item as { [item_id: number]: number; }
    for (let item_id in need_item) {
        PopupsServerItem._SetItemId(item_id);
        PopupsServerItem._SetCount(need_item[item_id]);
    }
}

(() => {
    Init();
})();