import { GetTextureSrc } from "../../common/custom_kv_method";
import { default as talent_tree_drow_ranger } from "../../json/config/game/hero/talent_tree/drow_ranger.json";
import { FormatDescription } from "../../utils/method";
import { default as AbilityTypesJson } from "./../../json/config/game/const/ability_types.json";
let talent_tree = {
    ["drow_ranger"]: talent_tree_drow_ranger
}

let MainPanel = $.GetContextPanel();
// let TalentIcon = $("#TalentIcon") as ImagePanel;
let ExtraElement = $("#ExtraElement");
let ExtraTypes = $("#ExtraTypes");

export function Init() {

    let m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
    $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
    $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
    m_TooltipPanel.FindChild('TopArrow')!.visible = false;
    m_TooltipPanel.FindChild('BottomArrow')!.visible = false;

    $.GetContextPanel().SetPanelEvent("ontooltiploaded", () => {
        UpdateTooltip()
    });

    CustomNetTables.SubscribeNetTableListener("hero_talent", PlayerTalentUpdateCallback)
}

function UpdateTalentTootipDesc(hero: string, key: string, level: number) {
    let talent_data = talent_tree[hero as keyof typeof talent_tree][key as "1"]
    let img = talent_data.img;
    let AbilityValues = talent_data.AbilityValues;
    MainPanel.SetDialogVariableInt("max", talent_data.max_number)
    MainPanel.SetDialogVariableInt("level", level)
    let talent_name = $.Localize(`#custom_talent_${hero}_${key}`)
    MainPanel.SetDialogVariable("talent_name", talent_name)
    let talent_desc = $.Localize(`#custom_talent_${hero}_${key}_desc`)
    let description_txt = FormatDescription(talent_desc, AbilityValues, level, true);
    MainPanel.SetDialogVariable("talent_desc", description_txt)
    // 风格
    MainPanel.SetHasClass("IsAbility", talent_data.is_ability == 1)
    // extra
    let has_element = talent_data.mark_element;
    ExtraElement.SetHasClass("Show", has_element > 0 && level == 0);
    for (let i = 1; i <= 6; i++) {
        ExtraElement.SetHasClass("element_" + i, has_element == i)
    }
    let has_newTypes = talent_data.mark_types != "Null";
    let types_value = talent_data.mark_types
    ExtraTypes.SetHasClass("Show", has_newTypes && level == 0)
    for (let type_key in AbilityTypesJson) {
        ExtraTypes.SetHasClass(type_key, types_value == type_key)
    }


}
function PlayerTalentUpdateCallback<
    TName extends keyof CustomNetTableDeclarations,
    T extends CustomNetTableDeclarations['hero_talent']
>(tableName: TName, key: keyof T, value: NetworkedData<T[keyof T]>) {
    let unit = Players.GetLocalPlayerPortraitUnit();
    let player_id = Entities.GetPlayerOwnerID(unit);
    if (player_id == key) {
        let hero = MainPanel.Data<PanelDataObject>().hero as string;
        let talent_index = MainPanel.Data<PanelDataObject>().key as string;
        let row_data = value[talent_index];
        if (row_data == null) { return }
        let level = row_data.uc;
        UpdateTalentTootipDesc(hero, talent_index, level)

    }


}

function UpdateTooltip() {
    let hero = MainPanel.GetAttributeString("hero", "");
    let key = MainPanel.GetAttributeString("key", "1");
    let level = MainPanel.GetAttributeInt("level", 0);

    MainPanel.Data<PanelDataObject>().hero = hero
    MainPanel.Data<PanelDataObject>().key = key
    UpdateTalentTootipDesc(hero, key, level)
}

(function () {
    Init()
})();