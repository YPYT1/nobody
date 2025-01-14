import { default as server_soul_attr } from "../../../json/config/server/soul/server_soul_attr.json";
import { default as server_soul_config } from "../../../json/config/server/soul/server_soul_config.json";
import { HideCustomTooltip, ShowCustomTextTooltip } from "../../../utils/custom_tooltip";
import { LoadCustomComponent } from "../../_components/component_manager";

const CheckAttrIsPercent = GameUI.CustomUIConfig().CheckAttrIsPercent

const StonePopups = $("#StonePopups");
const StoneInlayBtn = $("#StoneInlayBtn");
const EquipStoneList = $("#EquipStoneList");
const AttributeList = $("#AttributeList");
let stone_attr_object: { [attr: string]: { [sub_attr: string]: number } } = {};

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
        EquipStoneRows.SetPanelEvent("onactivate", () => { })

        EquipStoneRows.SetPanelEvent("onmouseover", () => {
            ShowCustomTextTooltip(EquipStoneRows, "#custom_text_ss_slot_" + i, "#custom_text_stone_soul_attr")
        })

        EquipStoneRows.SetPanelEvent("onmouseout", () => {
            HideCustomTooltip()
        })
    }

    StoneInlayBtn.SetPanelEvent("onactivate", () => {
        StonePopups.SetHasClass("Show", true)
    })

    InitSubscribe()

    // GameUI.CustomUIConfig().SendCustomEvent("ServiceInterface", "GetPlayerServerPackageData", {})

    // 魂石页面
    StonePopups.BLoadLayout("file://{resources}/layout/custom_game/dashboard/personal/stone/_stone_popups.xml", false, false);
}

function InitSubscribe() {

    GameEvents.Subscribe("ServiceSoul_GetPlayerServerSoulData", event => {
        let data = event.data;
        stone_attr_object = {};
        let equip_data = data.list.i;
        for (let id in equip_data) {
            // $.Msg([id,equip_data[id]])
            let _data = equip_data[id];
            let EquipStoneRows = EquipStoneList.FindChildTraverse(`${id}`)!;
            EquipStoneRows.SetDialogVariableInt("level", _data.z)
            let attr_obj = _data.d;
            let attr_label: string[] = [];

            for (let k in attr_obj) {
                let row_data = attr_obj[k];
                let key = row_data.k;
                let attr_data = server_soul_attr[key as keyof typeof server_soul_attr];
                let MainProperty = attr_data.MainProperty;
                let TypeProperty = attr_data.TypeProperty;
                let attr_name = `${$.Localize(`#custom_attribute_${MainProperty}`).replace("%", "")}`
                let num_fixed = attr_data.float;
                let attr_value = parseFloat(row_data.v.toFixed(num_fixed))
                let pct_symbol = CheckAttrIsPercent(MainProperty, TypeProperty) ? "%" : "";
                attr_label.push(`${attr_name} <span class="green">+${attr_value}${pct_symbol}</span>`)

                if (stone_attr_object[MainProperty] == null) {
                    stone_attr_object[MainProperty] = {}
                }
                if (stone_attr_object[MainProperty][TypeProperty] == null) {
                    stone_attr_object[MainProperty][TypeProperty] = 0
                }
                stone_attr_object[MainProperty][TypeProperty] += attr_value

            }
            EquipStoneRows.SetDialogVariable("ss_attr", attr_label.join("<br>"))


        }

        // $.Msg(stone_attr_object)
        AttributeList.RemoveAndDeleteChildren()
        for (let attr_main in stone_attr_object) {
            let attr_row_obj = stone_attr_object[attr_main];
            for (let attr_type in attr_row_obj) {
                let value = parseFloat(attr_row_obj[attr_type].toFixed(2))
                let _Panel = $.CreatePanel("Panel", AttributeList, "", {
                    class: "SSAttributeRow"
                });
                let PanelAttributeRow = LoadCustomComponent(_Panel, "row_attribute");
                PanelAttributeRow.SetAttributeMainKey(attr_main, value);
                let is_pct = CheckAttrIsPercent(attr_main, attr_type)

                PanelAttributeRow.IsPercent(is_pct)
                PanelAttributeRow.SetPercentValue(value)
            }



            // PanelAttributeRow.SetAttributeMainKey(attr_key, 999, 999)
        }
    })

    GameEvents.SendCustomGameEventToServer("ServiceSoul", {
        event_name: "GetPlayerServerSoulData",
        params: {}
    })
}

(() => {
    Init();
})();