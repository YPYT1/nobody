import { SetLabelDescriptionExtra } from "../../../utils/ability_description";
import { HideCustomTooltip, ShowCustomTooltip } from "../../../utils/custom_tooltip";
import { default as AbilityTypesJson } from "./../../../json/config/game/const/ability_types.json";


const SelectList = $("#SelectList");

const TalentTreeConfig = GameUI.CustomUIConfig().KvData.TalentTreeConfig
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;

let HeroSubNodeObject: { [id: string]: number[] } = {};

export const Init = () => {
    InitTalentData()
    CustomEventSubscribe();
}

const InitTalentData = () => {
    HeroSubNodeObject = {};
    for (let id in TalentTreeConfig) {
        let row_data = TalentTreeConfig[id as keyof typeof TalentTreeConfig];
        HeroSubNodeObject[id] = row_data.unlock_key
    }

}
// GetSelectTalentData(player_id: PlayerID, params: CGED["HeroTalentSystem"]["GetSelectTalentData"], callback?)
const CustomEventSubscribe = () => {

    GameEvents.Subscribe("HeroTalentSystem_GetSelectTalentData", event => {
        let data = event.data;
        $.Msg("HeroTalentSystem_GetSelectTalentData")
        let list = Object.values(data.data);
        // SelectList.RemoveAndDeleteChildren();
        let order = 0;
        for (let _data of list) {
            order += 1;
            let id = _data.key;
            let type = _data.type;
            let level = _data.lv;
            let row_hero_data = TalentTreeConfig[id as "1"];

            let TalentNode = SelectList.GetChild(order - 1)!;
            if (TalentNode == null) {
                TalentNode = $.CreatePanel("Panel", SelectList, "");
                TalentNode.BLoadLayoutSnippet("TalentInfo");
            }
            TalentNode.Data<PanelDataObject>().index = order - 1;
            if (type == 2) {
                TalentNode.visible = false
                TalentNode.SetDialogVariableInt("max", -1)
                continue
            } else {
                TalentNode.visible = true
            }
            TalentNode.SetPanelEvent("onactivate", () => {
                let index = TalentNode.Data<PanelDataObject>().index
                // $.Msg(["HeroSelectTalentOfIndex",index])
                
                GameEvents.SendCustomGameEventToServer("HeroTalentSystem", {
                    event_name: "HeroSelectTalentOfIndex",
                    params: {
                        index: index
                    }
                })
            })

            TalentNode.SetDialogVariableInt("uc", level)
            TalentNode.SetHasClass("IsAbility", row_hero_data.is_ability == 1)
            TalentNode.SetHasClass("IsAttribute", row_hero_data.tier_number == 99)
            TalentNode.SetDialogVariable("talent_name", $.Localize(`#custom_talent_${id}`))
            TalentNode.SetDialogVariableInt("max", row_hero_data.max_number)

            const TalentIcon = TalentNode.FindChildTraverse("TalentIcon") as ImagePanel;
            let img_src = GetTextureSrc(row_hero_data.img)
            TalentIcon.SetImage(img_src);

            let TypesLabel = TalentNode.FindChildTraverse("TypesLabel")!;
            let types_value_list = row_hero_data.mark_types.split(",");
            let has_newTypes = row_hero_data.mark_types != "Null";
            TypesLabel.SetHasClass("Show", has_newTypes && level == 1)
            for (let type_key in AbilityTypesJson) {
                for (let types_value of types_value_list) {
                    TypesLabel.SetHasClass(type_key, types_value == type_key);
                    if (types_value == type_key) {
                        TypesLabel.SetDialogVariable("type_label", $.Localize("#custom_ability_type_" + type_key))
                    }
                }

            }

            // 元素
            let ExtraElement = TalentNode.FindChildTraverse("ExtraElement")!;
            let has_element = row_hero_data.mark_element;
            // $.Msg(["xxx", id, level, has_element > 0, level == 1])
            ExtraElement.SetHasClass("Show", has_element > 0 && level == 1);
            for (let i = 1; i <= 6; i++) {
                ExtraElement.SetHasClass("element_" + i, has_element == i)
            }
            let talent_desc = $.Localize(`#custom_talent_${id}_desc`)
            let description_txt = SetLabelDescriptionExtra(
                talent_desc,
                level,
                row_hero_data.AbilityValues,
                row_hero_data.ObjectValues,
                false
            );
            TalentNode.SetDialogVariable("AbilityDescription", description_txt)

            // 找到子分支
            const ChildNodeList = TalentNode.FindChildTraverse("ChildNodeList")!;
            let subNode = HeroSubNodeObject[id];
            ChildNodeList.RemoveAndDeleteChildren();
            let sub_node_ids: string[] = []
            for (let _id of subNode) {
                if (_id == 0) { continue };
                sub_node_ids.push(`${_id}`)
            }

            for (let i = 0; i < sub_node_ids.length; i++) {
                let _id = sub_node_ids[i];
                let is_only = sub_node_ids.length == 1;
                let is_first = !is_only && i == 0;
                let is_last = !is_only && i == sub_node_ids.length - 1;

                let TalentNode = $.CreatePanel("Panel", ChildNodeList, "");
                TalentNode.BLoadLayoutSnippet("ChildTalentNode");
                TalentNode.SetHasClass("is_first", is_first);
                TalentNode.SetHasClass("is_last", is_last);
                TalentNode.SetHasClass("is_only", is_only);

                const ChildTalentIcon = TalentNode.FindChildTraverse("ChildTalentIcon") as ImagePanel;
                let sub_data = TalentTreeConfig[_id as keyof typeof TalentTreeConfig];
                let img_src = GetTextureSrc(sub_data.img)
                ChildTalentIcon.SetImage(img_src);

                ChildTalentIcon.SetPanelEvent("onmouseover", () => {
                    ShowCustomTooltip(ChildTalentIcon, "talent_tree", "", _id, 0)
                })

                ChildTalentIcon.SetPanelEvent("onmouseout", () => {
                    HideCustomTooltip()
                })
            }

            let sub_count = ChildNodeList.GetChildCount();
            const ChildNodeHeader = TalentNode.FindChildTraverse("ChildNodeHeader")!;
            ChildNodeHeader.visible = sub_count > 0;

        }


        // if (talent_points > 0) {
        //     // let hero_data = talent_data[hero_name as keyof typeof talent_data];
        //     for (let id in hero_talent_list) {
        //         let talent_id = `talent_${id}`;
        //         let TalentNode = PlayerTalentTreeList.FindChildTraverse(talent_id);
        //         let loc_row_data = talent_data[id as keyof typeof talent_data];
        //         let node_index = loc_row_data.index;

        //         if (TalentNode) {
        //             let _data = hero_talent_list[id];
        //             let is_unlock = false;// _data.iu == 1;
        //             let row_hero_data = talent_data[id as "1"];
        //             let is_max = _data.uc >= talent_data[id as keyof typeof talent_data].max_number
        //             let is_show = is_unlock && !is_max;
        //             let level = _data.uc
        //             // $.Msg(["ddd",hero_talent_tree_object[node_index][id]])
        //             hero_talent_tree_object[node_index][id] = is_show
        //             TalentNode.Data<PanelDataObject>().used = _data.uc
        //             TalentNode.SetHasClass("Show", is_show)
        //             TalentNode.SetHasClass("IsNew", _data.uc == 0)
        //             TalentNode.SetHasClass("IsUp", _data.uc > 0)
        //             TalentNode.SetHasClass("IsAbility", row_hero_data.is_ability == 1)
        //             TalentNode.SetHasClass("IsAttribute", row_hero_data.tier_number == 99)

        //             TalentNode.SetDialogVariable("talent_name", $.Localize(`#custom_talent_${id}`))
        //             TalentNode.SetDialogVariableInt("uc", level)
        //             TalentNode.SetDialogVariableInt("max", row_hero_data.max_number)
        //             // 类型标签
        //             let TypesLabel = TalentNode.FindChildTraverse("TypesLabel")!;
        //             let types_value_list = row_hero_data.mark_types.split(",");
        //             let has_newTypes = row_hero_data.mark_types != "Null";
        //             TypesLabel.SetHasClass("Show", has_newTypes && level == 0)
        //             for (let type_key in AbilityTypesJson) {
        //                 for (let types_value of types_value_list) {
        //                     TypesLabel.SetHasClass(type_key, types_value == type_key);
        //                     if (types_value == type_key) {
        //                         TypesLabel.SetDialogVariable("type_label", $.Localize("#custom_ability_type_" + type_key))
        //                     }
        //                 }

        //             }
        //             

        //             


        //         }
        //     }


        // } else {
        //     // 关闭升级窗
        //     // TogglePlayerTalentTreeList(false);

        // }

    })

    GameEvents.SendCustomGameEventToServer("HeroTalentSystem", {
        event_name: "GetSelectTalentData",
        params: {}
    })
}

(function () {
    $.Msg(["ability_upgrade"])
    Init()
})();