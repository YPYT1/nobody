
import { default as server_soul_attr } from "../../../json/config/server/soul/server_soul_attr.json";
import { default as server_soul_config } from "../../../json/config/server/soul/server_soul_config.json";
import { LoadCustomComponent } from "../../_components/component_manager";

type SoulConfigID = keyof typeof server_soul_config
type SoulConfigType = typeof server_soul_config[SoulConfigID];

const CheckAttrIsPercent = GameUI.CustomUIConfig().CheckAttrIsPercent
const STONE_ADD_LIMIT = 5;


const StonePopups = $.GetContextPanel();
const SoulEquipList = $("#SoulEquipList");
const ClosedBtn = $("#ClosedBtn");
const SelectEquipIcon = $("#SelectEquipIcon");
const PopupsOptionConfirmBtn = $("#PopupsOptionConfirmBtn") as Button;
const SSAttributeList = $("#SSAttributeList");
const SSAttrRadioDown = $("#SSAttrRadioDown") as RadioButton;
const SSAttrRadioAdd = $("#SSAttrRadioAdd") as RadioButton;
const OptionAttributreContainer = $("#OptionAttributreContainer");

const AttributreAddList = $("#AttributreAddList");
const AttributreUpperList = $("#AttributreUpperList");
const AttributreDownList = $("#AttributreDownList");

const SSActionResults = $("#SSActionResults");
const ActionCostItemList = $("#ActionCostItemList");


const ResultsBaseCostItem = LoadCustomComponent($("#ResultsBaseCostItem"), "server_item")
ResultsBaseCostItem._SetServerItemInfo({ show_tips: true, show_count: false, })
const ResultsExtendCostItem = LoadCustomComponent($("#ResultsExtendCostItem"), "server_item")
ResultsBaseCostItem._SetServerItemInfo({ show_tips: true, show_count: false, })

/** 已拥有魂石属性 */
let ServerSoulData: NetworkedData<CGEDGetSoulList>;

let level_u_d_config: {
    up: { [level: number]: string },
    drop: { [level: number]: string },
} = {
    up: {},
    drop: {},
}
/** 选择部位 默认为1武器 */
let g_select_slot = 1;
let g_base_stone_ids: string[] = [];
// 部位对应魂石属性
let g_slot_attr_index: { [type_id: string]: { [item_id: string]: string } } = {}

let g_soul_attr_key = "";
/** 当前确认按钮操作 */
type ConfirmActionBtn = "Add" | "Down" | "Upper" | "null";
let g_confirm_action: ConfirmActionBtn = "null";
/** 对应部位索引 */
let g_action_attr_index: number = -1;
export function Init() {
    // 初始化隐藏部分页面
    SSActionResults.visible = false;
    PopupsOptionConfirmBtn.visible = false;
    // 
    InitExcelData()
    // 初始化按钮
    InitButton();
    //初始化基础魂石列表
    g_slot_attr_index = {}
    let temp_object: { [id: string]: number } = {}
    for (let index in server_soul_attr) {
        let row_data = server_soul_attr[index as keyof typeof server_soul_attr];
        let item_list = row_data.item_id;
        let item_id = "" + item_list[0]
        if (temp_object[item_id] == null) { temp_object[item_id] = 1 }
        let type_id = "" + row_data.box_type;
        if (g_slot_attr_index[type_id] == null) { g_slot_attr_index[type_id] = {} }
        g_slot_attr_index[type_id][item_id] = index
    }

    g_base_stone_ids = Object.keys(temp_object);

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
            let _select_slot = i;
            g_select_slot = _select_slot
            ViewEquipSlot(_select_slot);
        })

        if (i == 1) {
            SoulEquipBorder.checked = true;
            ViewEquipSlot(g_select_slot)
        }
    }



    GameEvents.Subscribe("ServiceInterface_GetPlayerServerPackageData", event => {
        let data = event.data;
        let ItemList = Object.values(data);
        let ids_backpack: { [id: string]: AM2_Server_Backpack } = {}
        AttributreAddList.RemoveAndDeleteChildren()
        for (let ItemData of ItemList) {
            let item_id = ItemData.item_id;
            ids_backpack[item_id] = ItemData
        }

        for (let item_id of g_base_stone_ids) {
            let item_data = ids_backpack[item_id];
            if (item_data == null) { continue }
            let count = item_data.number;
            if (count <= 0) { continue }
            // let row_data = server_soul_attr[attr_index as keyof typeof server_soul_attr];
            let ItemStoneAttrRows = $.CreatePanel("RadioButton", AttributreAddList, item_id, {
                group: "StoneActionGroup"
            });
            ItemStoneAttrRows.BLoadLayoutSnippet("ItemStoneAttrRows");
            let item_name = $.Localize("#custom_serveritem_" + item_id)
            ItemStoneAttrRows.SetDialogVariable("item_name", item_name)
            // 属性
            // ItemStoneAttrRows.SetDialogVariable("attr", "+10 ~ +20")
            ItemStoneAttrRows.SetPanelEvent("onactivate", () => {
                // 魂石附加功能
                let key = ItemStoneAttrRows.Data<PanelDataObject>().key
                StoneOption_Add(g_select_slot, key)
            })

        }

        ViewEquipSlot(g_select_slot)


    })


    GameEvents.Subscribe("ServiceSoul_GetPlayerServerSoulData", event => {
        let data = event.data;
        ServerSoulData = data;

        // 更新装备等级
        // let list = ServerSoulData.i;
        // for (let k in list) {
        //     let EquipPanel  = SoulEquipList.FindChildTraverse(k)
        //     if (EquipPanel){

        //     }
        // }

        // 验证当前是否有已开启的页面
        // $.Msg(["select_slot", g_select_slot])
        if (g_select_slot < 0) { return }
        ViewEquipSlot(g_select_slot)
        // EquipAboutAttribute.SetHasClass("Show", false)
    })

    GameUI.CustomUIConfig().SendCustomEvent("ServiceInterface", "GetPlayerServerPackageData", {})
    GameUI.CustomUIConfig().SendCustomEvent("ServiceSoul", "GetPlayerServerSoulData", {})
}


function InitButton() {

    SSAttrRadioDown.SetPanelEvent("onactivate", () => {
        ToggleOptionAttributreContainer(0)
    })

    SSAttrRadioAdd.SetPanelEvent("onactivate", () => {
        ToggleOptionAttributreContainer(1)
    })

    ClosedBtn.SetPanelEvent("onactivate", () => {
        StonePopups.SetHasClass("Show", false)
    })


    PopupsOptionConfirmBtn.SetPanelEvent("onactivate", () => {
        // $.Msg(["PopupsOptionConfirmBtn:", g_confirm_action])
        HideActionAboutView();
        if (g_confirm_action == "Add") {
            ConfirmBtnAction_Add(g_select_slot, g_soul_attr_key)
        } else if (g_confirm_action == "Upper") {
            ConfirmBtnAction_Upper(g_select_slot, 1)
        } else if (g_confirm_action == "Down") {
            ConfirmBtnAction_Upper(g_select_slot, 2)
        }
    })
}

function InitExcelData() {
    level_u_d_config = {
        up: {},
        drop: {},
    }
    for (const key in server_soul_config) {
        let data = server_soul_config[key as keyof typeof server_soul_config];
        if (data.type == 1) {
            level_u_d_config.up[data.level] = key;
        } else {
            level_u_d_config.drop[data.level] = key;
        }
    }
}
function ToggleOptionAttributreContainer(state: number) {
    OptionAttributreContainer.SetHasClass("Down", state == 0)
    OptionAttributreContainer.SetHasClass("Add", state == 1)
}

/** 查看对应部位的相关信息 */
function ViewEquipSlot(slot: number) {
    // 中心图标
    SetSelectSlot_Icon(slot);
    // 魂石属性
    SetSelectSlot_Attr(slot);
    // 关闭页面
    HideActionAboutView();
}

function SetSelectSlot_Attr(slot: number) {
    SSAttributeList.RemoveAndDeleteChildren();
    AttributreUpperList.RemoveAndDeleteChildren()
    AttributreDownList.RemoveAndDeleteChildren();
    let haved_key_list: string[] = [];
    if (ServerSoulData != null) {
        let SSRowData = ServerSoulData.i[`${slot}`].d
        let SSRowLen = Object.keys(SSRowData).length;
        let attr_index = 0;
        for (let _k in SSRowData) {
            let data = SSRowData[_k];
            let key = data.k;
            let level = data.l
            if (haved_key_list.indexOf(key) == -1) { haved_key_list.push(key) }

            // let SelectAttrRows = $.CreatePanel("Panel", SelectSSAttributeList, "");
            // SelectAttrRows.BLoadLayoutSnippet("SelectAttrRows");
            let attr_data = server_soul_attr[key as keyof typeof server_soul_attr];
            let MainProperty = attr_data.MainProperty as AttributeMainKey;
            let TypeProperty = attr_data.TypeProperty as AttributeSubKey;
            let num_fixed = attr_data.float
            let attr_name = `${$.Localize(`#custom_attribute_${MainProperty}`).replace("%", "")}`
            let attr_value = parseFloat(data.v.toFixed(num_fixed))
            // SelectAttrRows.SetDialogVariable("attr_name", `Lv.${data.l} ${attr_name}`)
            // SelectAttrRows.SetDialogVariable("attr_value", "" + attr_value)

            // 属性降级
            SetSelectAttrRowsAttr(AttributreDownList, key, false, level - 1, data, attr_index)
            // 属性升级
            SetSelectAttrRowsAttr(AttributreUpperList, key, true, level + 1, data, attr_index)

            // 当前魂石属性
            let pct_symbol = CheckAttrIsPercent(MainProperty, TypeProperty) ? "%" : "";
            let AttributeRows = $.CreatePanel("Panel", SSAttributeList, "");
            AttributeRows.BLoadLayoutSnippet("ItemStoneAttrRows");
            AttributeRows.SetDialogVariable("item_name", `Lv.${data.l} ${attr_name}`)
            AttributeRows.SetDialogVariable("attr", "+" + attr_value + pct_symbol)

            attr_index++;
        }
    }

    SetSelectSlot_Add(slot, haved_key_list)
}
function SetSelectSlot_Add(slot: number, haved_key_list: string[]) {
    let slot_attr_ids = g_slot_attr_index[slot];
    // $.Msg(slot_attr_ids);
    let is_limit = haved_key_list.length >= STONE_ADD_LIMIT;
    for (let i = 0; i < AttributreAddList.GetChildCount(); i++) {
        let RowPanel = AttributreAddList.GetChild(i)!;
        let panel_id = RowPanel.id;
        let attr_index = slot_attr_ids[panel_id]
        RowPanel.visible = attr_index != null && haved_key_list.indexOf(attr_index) == -1 && !is_limit;
        RowPanel.checked = false;

        if (attr_index != null) {
            RowPanel.Data<PanelDataObject>().key = attr_index
            let row_data = server_soul_attr[attr_index as keyof typeof server_soul_attr];
            let up_value = row_data.up_value;
            RowPanel.SetDialogVariable("attr", up_value)
        }
    }

}

function SetSelectAttrRowsAttr(e: Panel, key: string, is_up: boolean, target_level: number, data: CGEDGetSoulListData, attr_index: number) {
    let attr_data = server_soul_attr[key as keyof typeof server_soul_attr];
    let MainProperty = attr_data.MainProperty as AttributeMainKey;
    let TypeProperty = attr_data.TypeProperty as AttributeSubKey;
    let num_fixed = attr_data.float
    let attr_value = parseFloat(data.v.toFixed(num_fixed))
    let attr_name = `${$.Localize(`#custom_attribute_${MainProperty}`).replace("%", "")}`
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
        group: "StoneActionGroup"
    });
    let pct_symbol = CheckAttrIsPercent(MainProperty, TypeProperty) ? "%" : "";

    let symbol = "+"
    let value1 = "";
    let value2 = "";
    if (is_up) {
        g_confirm_action = "Upper"
        let value_arr = attr_data.up_value.split("-");
        value1 = (parseFloat(value_arr[0]) * (1 + value_per * 0.01)).toFixed(num_fixed)
        value2 = (parseFloat(value_arr[1]) * (1 + value_per * 0.01)).toFixed(num_fixed)
    } else {
        symbol = "-"
        g_confirm_action = "Down"
        let value_arr = attr_data.drop_value.split("-");
        value1 = (parseFloat(value_arr[0]) * (1 + value_per * 0.01)).toFixed(num_fixed)
        value2 = (parseFloat(value_arr[1]) * (1 + value_per * 0.01)).toFixed(num_fixed)
    }

    let attr_value_str = `${value1}${pct_symbol} ~ ${value2}${pct_symbol}`
    SSAttributeDownRow.BLoadLayoutSnippet("ItemStoneAttrRows");
    SSAttributeDownRow.SetHasClass("is_up", is_up)
    SSAttributeDownRow.SetHasClass("is_down", !is_up)
    SSAttributeDownRow.SetDialogVariable("item_name", `Lv.${target_level} ${attr_name}`)
    if (!is_up && target_level < 0) {
        attr_value_str = "无法降级";
        SSAttributeDownRow.enabled = false;
    }
    SSAttributeDownRow.SetDialogVariable("attr", attr_value_str)
    SSAttributeDownRow.SetPanelEvent("onactivate", () => {
        g_action_attr_index = attr_index;
        if (is_up) {
            StoneOption_Upper(key, target_level - 1)
        } else {
            StoneOption_Down(key, target_level + 1)
        }


    })
}

function StoneOption_Upper(key: string, level: number) {
    g_confirm_action = "Upper"

    let config_key = level_u_d_config.up[level];
    g_soul_attr_key = config_key
    let up_config = server_soul_config[config_key as keyof typeof server_soul_config];

    // 成功率 
    SetSSActionResultsInfo(key, up_config)
}

function StoneOption_Down(key: string, level: number) {
    g_confirm_action = "Down"
    let config_key = level_u_d_config.drop[level];
    g_soul_attr_key = config_key
    let up_config = server_soul_config[config_key as keyof typeof server_soul_config];
    // 成功率 
    SetSSActionResultsInfo(key, up_config, false)

}
// 魂石附加功能
function StoneOption_Add(slot: number, key: string) {
    g_confirm_action = "Add"
    let slot_item_list = g_slot_attr_index["" + slot]
    g_soul_attr_key = key
    let up_config = server_soul_config["1"];
    SetSSActionResultsInfo(key, up_config)
}

function SetSSActionResultsInfo(key: string, up_config: SoulConfigType, is_up: boolean = true) {
    SSActionResults.SetHasClass("HideSuccess", !is_up)
    let soul_attr = server_soul_attr[key as keyof typeof server_soul_attr];
    let attr_items = soul_attr.item_id;
    // 成功率 
    SSActionResults.SetDialogVariableInt("success", up_config.pro)
    // 消耗素材
    let items = up_config.items;
    let price_cost: { item: string, count: number }[] = [];
    for (let item of items) {
        if (item == "null") { continue }
        let item_arr = item.split("_");
        let temp_obj = { item: item_arr[0], count: parseInt(item_arr[1]) }
        price_cost.push(temp_obj)
    }

    ActionCostItemList.RemoveAndDeleteChildren()
    for (let item_info of price_cost) {
        let costPanel = $.CreatePanel("Panel", ActionCostItemList, "");
        costPanel.BLoadLayoutSnippet("CostPanel")
        let PriceIcon = costPanel.FindChildTraverse("PriceIcon")!;
        let ServerItemPanel = LoadCustomComponent(PriceIcon, "server_item")
        ServerItemPanel._SetServerItemInfo({ item_id: item_info.item, hide_bg: true })
        costPanel.SetDialogVariableInt("cost_count", item_info.count)
    }


    // 消耗魂石或者卷轴
    let consume = up_config.consume.split("_").map((v, k) => { return parseInt(v) });
    let ss_index = consume[0];
    let ss_count = consume[1];
    let item_id = ""
    if (is_up) {
        item_id = "" + attr_items[ss_index - 1]
    } else {
        item_id = `${ss_index}`
    }
    let backpack_count_table = GameUI.CustomUIConfig().getStorage("backpack_count_table")
    let owned_count = backpack_count_table[item_id] ?? 0
    SSActionResults.SetDialogVariableInt("owned_count", owned_count);
    SSActionResults.SetDialogVariableInt("need_count", ss_count);
    ResultsBaseCostItem._SetItemId(item_id)
    // 特殊物品
    ResultsExtendCostItem.visible = false;
    // 显示 消耗页面 和确认按钮
    SSActionResults.visible = true;
    PopupsOptionConfirmBtn.visible = true;
}

function ConfirmBtnAction_Add(select_slot: number, key: string) {
    GameEvents.SendCustomGameEventToServer("ServiceSoul", {
        event_name: "SoulAddOfField",
        params: {
            box_type: select_slot,
            key: key
        }
    })
}

function ConfirmBtnAction_Upper(select_slot: number, upper_type: number = 1) {
    GameEvents.SendCustomGameEventToServer("ServiceSoul", {
        event_name: "SoulIntensify",
        params: {
            box_type: select_slot,
            index: g_action_attr_index,
            type: upper_type,
        }
    })
}

function ConfirmBtnAction_Down(select_slot: number, key: string) {
    // GameEvents.SendCustomGameEventToServer("ServiceSoul", {
    //     event_name: "SoulIntensify",
    //     params: {
    //         box_type: select_slot,
    //         key: key
    //     }
    // })
}

function HideActionAboutView() {
    ResultsExtendCostItem.visible = false;
    // 显示 消耗页面 和确认按钮
    SSActionResults.visible = false;
    PopupsOptionConfirmBtn.visible = false;
}
function SetSelectSlot_Icon(slot: number) {
    for (let i = 1; i <= 6; i++) {
        SelectEquipIcon.SetHasClass(`${i}`, i == slot)
    }
}

(() => {
    Init();
})();