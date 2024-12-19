import { default as server_soul_attr } from "../../../json/config/server/soul/server_soul_attr.json";
import { default as server_soul_config } from "../../../json/config/server/soul/server_soul_config.json";

const StonePopups = $("#StonePopups");
const StoneInlayBtn = $("#StoneInlayBtn");
const EquipStoneList = $("#EquipStoneList");

export function Init() {

    let temp_object: { [id: string]: number } = {}
    // SoulSlotObject = {};
    for (let index in server_soul_attr) {
        let row_data = server_soul_attr[index as keyof typeof server_soul_attr];
        let item_list = row_data.item_id;
        let item_id = "" + item_list[0]
        if (temp_object[item_id] == null) { temp_object[item_id] = 1 }
        let type_id = "" + row_data.box_type;
        // if (SoulSlotObject[type_id] == null) { SoulSlotObject[type_id] = {} }
        // SoulSlotObject[type_id][item_id] = index
    }
    // BaseSStoneIdList = Object.keys(temp_object)

    // StonePopups.SetHasClass("Show", false)
    EquipStoneList.RemoveAndDeleteChildren();
    for (let i = 1; i <= 6; i++) {
        let EquipStoneRows = $.CreatePanel("Panel", EquipStoneList, `${i}`);
        EquipStoneRows.BLoadLayoutSnippet("EquipStoneRows");
        EquipStoneRows.SetDialogVariableInt("level", 0)
        EquipStoneRows.SetPanelEvent("onactivate", () => {})
    }

    StoneInlayBtn.SetPanelEvent("onactivate", () => {
        StonePopups.SetHasClass("Show", true)
    })

    InitSubscribe()

    // GameUI.CustomUIConfig().SendCustomEvent("ServiceInterface", "GetPlayerServerPackageData", {})

    // 魂石页面
    StonePopups.BLoadLayout("file://{resources}/layout/custom_game/dashboard/personal/stone/_stone_popups.xml", true, false);
}

function InitSubscribe() {

    GameEvents.Subscribe("ServiceSoul_GetPlayerServerSoulData", event => {
        let data = event.data;
        // ServerSoulData = data;
        // $.Msg(["ServiceSoul_GetPlayerServerSoulData", data])
        // // 验证当前是否有已开启的页面
        // $.Msg(["select_slot", select_slot])
        // if (select_slot == -1) { return }
        // ViewSSofSlot(select_slot)
        // SetEquipAboutInfo(select_slot)
        // for (let slot = 1; slot <= 6; slot++) {
        //     SelectEquipIcon.SetHasClass(`${slot}`, select_slot == slot)
        // }
        // EquipAboutAttribute.SetHasClass("Show", false)
    })

    GameEvents.SendCustomGameEventToServer("ServiceSoul", {
        event_name: "GetPlayerServerSoulData",
        params: {}
    })
}

(() => {
    Init();
})();