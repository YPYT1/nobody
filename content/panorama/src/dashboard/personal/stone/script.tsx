

import { default as server_soul_attr } from "../../../json/config/server/soul/server_soul_attr.json";
import { default as server_soul_config } from "../../../json/config/server/soul/server_soul_config.json";
import { LoadCustomComponent } from "../../_components/component_manager";

const MainPanel = $.GetContextPanel();
const EquipStoneList = $("#EquipStoneList");
const AttributeList = $("#AttributeList");
const StonePopups = $("#StonePopups");
const AddStoneList = $("#AddStoneList");
const StoneInlayBtn = $("#StoneInlayBtn");
const ClosedBtn = $("#ClosedBtn");
const EquipAboutAttribute = $("#EquipAboutAttribute")
const AddStone_ConfirmPopups = $("#AddStone_ConfirmPopups");
const AddStone_CostItemList = LoadCustomComponent($("#AddStone_CostItemList"), "server_item");
AddStone_CostItemList._SetServerItemInfo({ hide_bg: false, show_count: false, show_tips: true });

const AddStone_BtnConfirm = $("#AddStone_BtnConfirm");
const AddStone_BtnCancel = $("#AddStone_BtnCancel");
const SSDownBtn = $("#SSDownBtn");
const SSDelBtn = $("#SSDelBtn");
const SSUpperBtn = $("#SSUpperBtn");
const SoulStoneOptionList = $("#SoulStoneOptionList");
const TempAddSSAttr = $("#TempAddSSAttr");
let BaseSStoneIdList: string[] = [];

let SoulSlotObject: { [type_id: string]: { [item_id: string]: string } } = {}

let select_slot = -1;
let attr_key_index = "";
// 部位(1 武器 ,2衣服, 3 头盔 , 4 裤子, 5 鞋子 , 6首饰)

function SetSSBtnShow(show: boolean) {
    SSDownBtn.visible = show;
    SSDelBtn.visible = show;
    SSUpperBtn.visible = show;
}
export function Init() {
    SetSSBtnShow(false)
    let temp_object: { [id: string]: number } = {}
    SoulSlotObject = {};
    for (let index in server_soul_attr) {
        let row_data = server_soul_attr[index as keyof typeof server_soul_attr];
        let item_list = row_data.item_id;
        let item_id = "" + item_list[0]
        if (temp_object[item_id] == null) { temp_object[item_id] = 1 }
        let type_id = "" + row_data.box_type;
        if (SoulSlotObject[type_id] == null) { SoulSlotObject[type_id] = {} }
        SoulSlotObject[type_id][item_id] = index
    }
    BaseSStoneIdList = Object.keys(temp_object)

    // StonePopups.SetHasClass("Show", false)
    EquipStoneList.RemoveAndDeleteChildren();
    for (let i = 1; i <= 6; i++) {
        let EquipStoneRows = $.CreatePanel("Panel", EquipStoneList, `${i}`);
        EquipStoneRows.BLoadLayoutSnippet("EquipStoneRows");
        EquipStoneRows.SetDialogVariableInt("level", 0)

        EquipStoneRows.SetPanelEvent("onactivate", () => {

            // 
        })
    }

    StoneInlayBtn.SetPanelEvent("onactivate", () => {
        StonePopups.SetHasClass("Show", true)
    })

    ClosedBtn.SetPanelEvent("onactivate", () => {
        StonePopups.SetHasClass("Show", false)
    })

    StonePopupsInit()
    InitSubscribe()

    GameUI.CustomUIConfig().SendCustomEvent("ServiceInterface", "GetPlayerServerPackageData", {})
}

let ServerSoulData: NetworkedData<CGEDGetSoulList>;

function InitSubscribe() {

    GameEvents.Subscribe("ServiceSoul_GetPlayerServerSoulData", event => {
        let data = event.data;
        ServerSoulData = data;
        $.Msg(["ServiceSoul_GetPlayerServerSoulData", data])
        // 验证当前是否有已开启的页面
        $.Msg(["select_slot", select_slot])
        if (select_slot == -1) { return }
        ViewSSofSlot(select_slot)
        SetEquipAboutInfo(select_slot)
        for (let slot = 1; slot <= 6; slot++) {
            SelectEquipIcon.SetHasClass(`${slot}`, select_slot == slot)
        }
        // EquipAboutAttribute.SetHasClass("Show", false)
    })

    GameEvents.SendCustomGameEventToServer("ServiceSoul", {
        event_name: "GetPlayerServerSoulData",
        params: {}
    })
}
const SoulEquipList = $("#SoulEquipList")
const SelectEquipIcon = $("#SelectEquipIcon");
const SSAttributeList = $("#SSAttributeList");
const AddSSBtn = $("#AddSSBtn") as Button;
const AddStoneMenu = $("#AddStoneMenu");

const SSAttrRadioDown = $("#SSAttrRadioDown") as Button;
const SSAttrRadioUpper = $("#SSAttrRadioUpper") as Button;
const OptionAttributreContainer = $("#OptionAttributreContainer");


function StonePopupsInit() {

    SoulEquipList.RemoveAndDeleteChildren();
    for (let i = 1; i <= 6; i++) {
        let SoulEquipBorder = $.CreatePanel("RadioButton", SoulEquipList, `${i}`, {
            group: "EquipStoneListGroup"
        });
        SoulEquipBorder.BLoadLayoutSnippet("SoulEquipBorder")
        SoulEquipBorder.SetDialogVariable("slot_name", $.Localize("#custom_text_ss_slot_" + i))
        SoulEquipBorder.SetDialogVariableInt("ss_level", 0);
        // 切换对应武器强化属性
        SoulEquipBorder.SetPanelEvent("onactivate", () => {
            for (let slot = 1; slot <= 6; slot++) {
                SelectEquipIcon.SetHasClass(`${slot}`, select_slot == slot)
            }
            let _select_slot = i;
            select_slot = _select_slot;
            SetEquipAboutInfo(select_slot)

            ViewSSofSlot(select_slot);
            EquipAboutAttribute.SetHasClass("Show", true)
            SetSSBtnShow(false)
            SetSoulStoneOption("Hidden");
            AddStone_ConfirmPopups.SetHasClass("Show", false)
            TempAddSSAttr.RemoveAndDeleteChildren();
        })
    }

    AddStoneMenu.SetPanelEvent('onblur', () => {
        AddStoneMenu.visible = false
    })

    AddSSBtn.SetPanelEvent("onactivate", () => {
        const offset1 = MainPanel.GetPositionWithinAncestor(AddSSBtn);
        const offset2 = AddSSBtn.GetPositionWithinAncestor(MainPanel);
        // AddStoneMenu
        let offset_x = offset2.x / AddSSBtn.actualuiscale_x
        let offset_y = offset2.y / AddSSBtn.actualuiscale_y
        AddStoneMenu.visible = true
        AddStoneMenu.SetPositionInPixels(offset_x, offset_y, 0)

        // 聚焦面板 forus
        AddStoneMenu.SetFocus()
    })

    SSAttrRadioDown.SetPanelEvent("onactivate", () => {
        ToggleOptionAttributreContainer(0)
    })

    SSAttrRadioUpper.SetPanelEvent("onactivate", () => {
        ToggleOptionAttributreContainer(1)
    })

    // AddStone_BtnCancel.SetPanelEvent("onactivate", () => {
    //     AddStone_ConfirmPopups.SetHasClass("Show", false)
    // })

    AddStone_BtnConfirm.SetPanelEvent("onactivate", () => {
        AddStone_ConfirmPopups.SetHasClass("Show", false)
        // $.Msg(["select_slot", select_slot, "attr_key_index", attr_key_index])
        if (attr_key_index == "") { return }
        SetSoulStoneOption("Hidden")
        GameEvents.SendCustomGameEventToServer("ServiceSoul", {
            event_name: "SoulAddOfField",
            params: {
                box_type: select_slot,
                key: attr_key_index
            }
        })
    })

    GameEvents.Subscribe("ServiceInterface_GetPlayerServerPackageData", event => {
        let data = event.data;
        let ItemList = Object.values(data);
        let ids_backpack: { [id: string]: AM2_Server_Backpack } = {}
        for (let ItemData of ItemList) {
            let item_id = ItemData.item_id;
            ids_backpack[item_id] = ItemData
        }
        UpdataSoulStoneList(ids_backpack)
    })

    // GameUI.CustomUIConfig().EventBus.subscribe("backpack_update", data => {
    //     $.Msg(["EventBus backpack_update "])

    //     UpdataSoulStoneList(data)
    // })
}

function UpdataSoulStoneList(data: { [id: string]: AM2_Server_Backpack; }) {
    if (AddStoneList == null) {
        $.Msg(["AddStoneList iS Null"])
        $.Schedule(0.5, () => {
            UpdataSoulStoneList(data)
        })
        return
    }
    AddStoneList.RemoveAndDeleteChildren()
    for (let item_id of BaseSStoneIdList) {
        let item_data = data[item_id];
        if (item_data == null) { continue }
        let count = item_data.number;
        if (count <= 0) { continue }
        let BaseStoneBtn = $.CreatePanel("Button", AddStoneList, item_id);
        BaseStoneBtn.BLoadLayoutSnippet("BaseStoneBtn");
        let item_name = $.Localize("#custom_serveritem_" + item_id)
        BaseStoneBtn.SetDialogVariable("item_name", item_name)
        BaseStoneBtn.SetPanelEvent("onactivate", () => {
            // 弹窗
            AddStoneMenu.visible = false;
            AddStone_ConfirmPopups.SetHasClass("Show", true)
            SetAddStoneCostItem(select_slot, item_id)
        })

    }
}
/** 部位 */
function SetAddStoneCostItem(select_slot: number, item_id: string) {
    $.Msg(["SetAddStoneCostItem", select_slot, item_id])
    if (select_slot == -1) { return }
    // 新增等级必然为0,消耗的对应素材为一个固定索引
    let slot_item_list = SoulSlotObject["" + select_slot];
    let attr_index = slot_item_list[item_id];
    attr_key_index = attr_index


    let up_config = server_soul_config["1"];
    // 成功率 
    AddStone_ConfirmPopups.SetDialogVariableInt("success", up_config.pro)
    // 消耗金币
    let items = up_config.items;
    let price_cost: { item?: string, count?: number } = {};
    for (let item of items) {
        if (item == "null") { continue }
        let item_arr = item.split("_");
        price_cost.item = item_arr[0]
        price_cost.count = parseInt(item_arr[1])
        // price_cost.push()
        break;
    }
    AddStone_ConfirmPopups.SetDialogVariableInt("cost_count", price_cost.count!)

    // 消耗魂石
    let consume = up_config.consume.split("_").map((v, k) => { return parseInt(v) });
    let ss_index = consume[0];
    let ss_count = consume[1];

    AddStone_CostItemList._SetItemId(item_id)

    let backpack_count_table = GameUI.CustomUIConfig().getStorage("backpack_count_table")
    let item_count = backpack_count_table[item_id] ?? 0

    AddStone_ConfirmPopups.SetDialogVariableInt("owned_count", item_count)
    AddStone_ConfirmPopups.SetDialogVariableInt("need_count", ss_count)

    // 扩展消耗
    AddStone_ConfirmPopups.SetDialogVariableInt("ex_owned_count", 0)
    AddStone_ConfirmPopups.SetDialogVariableInt("ex_need_count", 0)

    // 功能按钮显示
    SetSoulStoneOption("AddStone")
}

type SoulStoneOptionProp = "AddStone" | "Hidden"
function SetSoulStoneOption(option: SoulStoneOptionProp) {
    SoulStoneOptionList.SetHasClass("AddStone", option == "AddStone")
}
function SetEquipAboutInfo(slot: number) {
    // $.Msg(["Slot", slot])
    let slot_item_list = SoulSlotObject["" + slot];
    // $.Msg(slot_item_list)
    for (let i = 0; i < AddStoneList.GetChildCount(); i++) {
        let RowPanel = AddStoneList.GetChild(i)!;
        let panel_id = RowPanel.id;
        let attr_index = slot_item_list[panel_id]
        RowPanel.visible = attr_index != null;
        if (attr_index != null) {
            let row_data = server_soul_attr[attr_index as keyof typeof server_soul_attr];
            let up_value = row_data.up_value;
            RowPanel.SetDialogVariable("attr", up_value)
        }
    }
}


function ToggleOptionAttributreContainer(state: number) {
    OptionAttributreContainer.SetHasClass("Down", state == 0)
    OptionAttributreContainer.SetHasClass("Upper", state == 1)
}

const SelectSSAttributeList = $("#SelectSSAttributeList");
const AttributreDownList = $("#AttributreDownList");
const AttributreUpperList = $("#AttributreUpperList");

function ViewSSofSlot(slot: number) {
    let SSRowData = ServerSoulData.i[`${slot}`].d
    let SSRowLen = Object.keys(SSRowData).length;
    SSAttributeList.RemoveAndDeleteChildren()
    SelectSSAttributeList.RemoveAndDeleteChildren();
    AttributreDownList.RemoveAndDeleteChildren();
    AttributreUpperList.RemoveAndDeleteChildren();
    AddStoneMenu.visible = false;
    for (let _k in SSRowData) {
        let data = SSRowData[_k];
        let key = data.k;
        let level = data.l
        let value_per = 5;

        let SelectAttrRows = $.CreatePanel("Panel", SelectSSAttributeList, "");
        SelectAttrRows.BLoadLayoutSnippet("SelectAttrRows");
        let attr_data = server_soul_attr[key as keyof typeof server_soul_attr];
        let MainProperty = attr_data.MainProperty
        let num_fixed = attr_data.float
        let attr_name = `${$.Localize(`#custom_attribute_${MainProperty}`).replace("%", "")}`
        let attr_value = parseFloat(data.v.toFixed(num_fixed))
        SelectAttrRows.SetDialogVariable("attr_name", `Lv.${data.l} ${attr_name}`)
        SelectAttrRows.SetDialogVariable("attr_value", "" + attr_value)

        // 属性降级
        SetSelectAttrRowsAttr(AttributreDownList, key, false, level - 1, data)
        // 属性升级
        SetSelectAttrRowsAttr(AttributreUpperList, key, true, level + 1, data)

        // 当前魂石属性
        let SSAttributeRows = $.CreatePanel("Panel", SSAttributeList, "");
        SSAttributeRows.BLoadLayoutSnippet("SSAttributeRows");
        SSAttributeRows.SetDialogVariable("attr_name", `Lv.${data.l} ${attr_name}`)
        SSAttributeRows.SetDialogVariable("attr_value", "" + attr_value)

    }
    AddSSBtn.visible = SSRowLen < 4;



}

function SetSelectAttrRowsAttr(e: Panel, key: string, is_up: boolean, target_level: number, data: CGEDGetSoulListData) {
    let attr_data = server_soul_attr[key as keyof typeof server_soul_attr];
    let MainProperty = attr_data.MainProperty
    let num_fixed = attr_data.float
    let attr_value = parseFloat(data.v.toFixed(num_fixed))
    let attr_name = `${$.Localize(`#custom_attribute_${MainProperty}`).replace("%", "")}`
    let group_name = "AttributreUpperListGroup";
    let value_per = 5;
    if (target_level <= 5) {
        value_per = attr_data.value_per_1_5
    } else if (target_level <= 10) {
        value_per = attr_data.value_per_6_10
    } else if (target_level <= 15) {
        value_per = attr_data.value_per_11_15
    } else if (target_level <= 20) {
        value_per = attr_data.value_per_16_20
    }
    // 属性降级
    let SSAttributeDownRow = $.CreatePanel("RadioButton", e, "", {
        group: group_name
    });
    let value1 = "";
    let value2 = "";
    if (is_up) {
        let value_arr = attr_data.up_value.split("-");
        value1 = (attr_value + parseFloat(value_arr[0]) * (1 + value_per * 0.01)).toFixed(num_fixed)
        value2 = (attr_value + parseFloat(value_arr[1]) * (1 + value_per * 0.01)).toFixed(num_fixed)
    } else {
        let value_arr = attr_data.drop_value.split("-");
        value1 = (attr_value - parseFloat(value_arr[1]) * (1 + value_per * 0.01)).toFixed(num_fixed)
        value2 = (attr_value - parseFloat(value_arr[0]) * (1 + value_per * 0.01)).toFixed(num_fixed)
    }

    let attr_value_str = `${value1} ~ ${value2}`
    SSAttributeDownRow.BLoadLayoutSnippet("SelectAttrRows");
    SSAttributeDownRow.SetDialogVariable("attr_name", `Lv.${target_level} ${attr_name}`)
    SSAttributeDownRow.SetDialogVariable("attr_value", attr_value_str)
    SSAttributeDownRow.SetPanelEvent("onactivate", () => {

        if (is_up) {
            $.Msg(["attr upper"])
            // SSDownBtn.visible = show;
            // SSDelBtn.visible = show;
            SSUpperBtn.visible = true;
            SSDownBtn.visible = false;
            SSDelBtn.visible = false;
        } else {
            $.Msg(["attr down"])
            SSDownBtn.visible = true;
            SSDelBtn.visible = true;
            SSUpperBtn.visible = false;
            // SSUpperBtn.visible = show;
        }

    })
}

(() => {
    Init();
})();