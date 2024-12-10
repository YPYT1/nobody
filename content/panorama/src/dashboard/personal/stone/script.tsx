import { default as server_soul_attr } from "../../../json/config/server/soul/server_soul_attr.json";

const EquipStoneList = $("#EquipStoneList");
const AttributeList = $("#AttributeList");
const StonePopups = $("#StonePopups");
// 部位(1 武器 ,2衣服, 3 头盔 , 4 裤子, 5 鞋子 , 6首饰)
export function Init() {

    StonePopups.SetHasClass("Show", true)
    EquipStoneList.RemoveAndDeleteChildren();
    for (let i = 1; i <= 6; i++) {
        let EquipStoneRows = $.CreatePanel("Panel", EquipStoneList, `${i}`);
        EquipStoneRows.BLoadLayoutSnippet("EquipStoneRows");
        EquipStoneRows.SetDialogVariableInt("level", 0)
    }

    StonePopupsInit()
}

const SoulEquipList = $("#SoulEquipList")
const SelectEquipIcon = $("#SelectEquipIcon");
const SSAttributeList = $("#SSAttributeList");
function StonePopupsInit() {
    SoulEquipList.RemoveAndDeleteChildren();
    for (let i = 1; i <= 6; i++) {
        let SoulEquipBorder = $.CreatePanel("RadioButton", SoulEquipList, `${i}`, {
            group: "EquipStoneListGroup"
        });
        SoulEquipBorder.BLoadLayoutSnippet("SoulEquipBorder")
        SoulEquipBorder.SetDialogVariable("slot_name", $.Localize("#custom_text_ss_slot_" + i))
        SoulEquipBorder.SetDialogVariableInt("ss_level", 0);
        SoulEquipBorder.SetPanelEvent("onactivate", () => {
            let select_slot = i;
            // $.Msg(["select_slot", select_slot])
            for (let slot = 1; slot <= 6; slot++) {
                SelectEquipIcon.SetHasClass(`${slot}`, select_slot == slot)
            }
            ViewSSofSlot(select_slot)
            //
        })
    }
}

function ViewSSofSlot(slot: number) {
    SSAttributeList.RemoveAndDeleteChildren();
    for (let i = 0; i < 4; i++) {
        let SSAttributeRows = $.CreatePanel("Panel", SSAttributeList, "");
        SSAttributeRows.BLoadLayoutSnippet("SSAttributeRows");
        SSAttributeRows.SetDialogVariableInt("attr_level", 0)
        SSAttributeRows.SetDialogVariable("attr_name", "属性名")
        SSAttributeRows.SetDialogVariableInt("add_value", 0)
    }

}

(() => {
    Init();
})();