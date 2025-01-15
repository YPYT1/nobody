import { SetLabelDescriptionExtra } from "../../../utils/ability_description";
import { HideCustomTooltip, ShowCustomTooltip } from "../../../utils/custom_tooltip";
import { default as AbilityTypesJson } from "./../../../json/config/game/const/ability_types.json";


const SelectList = $("#SelectList");

const npc_abilities_custom = GameUI.CustomUIConfig().KvData.npc_abilities_custom;
const TalentTreeConfig = GameUI.CustomUIConfig().KvData.TalentTreeConfig
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;

let HeroSubNodeObject: { [id: string]: number[] } = {};
let ParentNodeObject: { [id: string]: string } = {};
let AbilityTalentId: { [ability: string]: string } = {}
export const Init = () => {
    InitTalentData()
    CustomEventSubscribe();
}

const InitTalentData = () => {
    HeroSubNodeObject = {};
    ParentNodeObject = {};
    AbilityTalentId = {};
    for (let id in TalentTreeConfig) {
        let row_data = TalentTreeConfig[id as keyof typeof TalentTreeConfig];
        HeroSubNodeObject[id] = row_data.unlock_key;
        if (row_data.is_ability == 1) {
            let ability_name = row_data.link_ability
            AbilityTalentId[ability_name] = id
        }
        for (let sub_id of row_data.unlock_key) {
            if (sub_id != 0) {
                ParentNodeObject[`${sub_id}`] = id;
            }
        }
    }
}
// GetSelectTalentData(player_id: PlayerID, params: CGED["HeroTalentSystem"]["GetSelectTalentData"], callback?)
let hero_talent_list: CGEDPlayerTalentSkillClientList = {}
const CustomEventSubscribe = () => {

    GameEvents.Subscribe("HeroTalentSystem_GetHeroTalentListData", (event) => {
        let data = event.data;
        hero_talent_list = data.hero_talent_list;
    })

    GameEvents.Subscribe("HeroTalentSystem_GetSelectTalentData", event => {
        let data = event.data.select;
        let show = data.is_show == 1;
        SelectList.visible = show;
        // $.Msg(data)
        let list = Object.values(data.data);
        // $.Msg(["111 HeroTalentSystem_GetSelectTalentData", list.length])
        SelectList.RemoveAndDeleteChildren();
        let order = 0;
        for (let _data of list) {
            order += 1;
            let id = _data.key;
            let type = _data.type;
            let level = _data.lv;
            let row_hero_data = TalentTreeConfig[id as keyof typeof TalentTreeConfig];

            let TalentNode = SelectList.GetChild(order - 1)!;
            if (TalentNode == null) {
                TalentNode = $.CreatePanel("Panel", SelectList, "");
                TalentNode.BLoadLayoutSnippet("TalentInfo");
            }
            TalentNode.Data<PanelDataObject>().index = order - 1;
            TalentNode.SetHasClass("is_invest", type == 2);
            let TypesLabel = TalentNode.FindChildTraverse("TypesLabel")!;
            if (type == 2) {
                let curr = _data.dq!;
                let next = _data.uph!;
                let lv = _data.lv;
                TalentNode.SetHasClass("adv_invest", lv > 3);
                TalentNode.SetDialogVariable("talent_name", $.Localize("#custom_text_soul_invest"))
                TalentNode.SetHasClass("IsAbility", false)
                TypesLabel.SetHasClass("Resource", true);
                TypesLabel.SetHasClass("Show", true)
                TypesLabel.SetDialogVariable("type_label", "理财型")
                // TalentNode.visible = false

                TalentNode.SetDialogVariableInt("up_value", lv)
                TalentNode.SetDialogVariableInt("curr", curr)
                TalentNode.SetDialogVariableInt("next", next)
                let label = $.Localize("#custom_text_soul_invest_Description", TalentNode)

                TalentNode.SetDialogVariable("soul_invest_title", label)

                // TalentNode.SetDialogVariableInt("max", -1)

                // $.Msg(_data)
                TalentNode.SetPanelEvent("onactivate", () => {
                    let index = TalentNode.Data<PanelDataObject>().index
                    GameEvents.SendCustomGameEventToServer("HeroTalentSystem", {
                        event_name: "HeroSelectTalentOfIndex",
                        params: {
                            index: index
                        }
                    })
                })
                continue
            } else {
                // TalentNode.visible = true
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

            // 显示父级分支
            // 技能类显示父技能,天赋类显示对应技能
            // 如果为技能显示父级ID,否则显示对应技能名的ID
            const ParentAbilityPanel = TalentNode.FindChildTraverse("ParentAbilityPanel") as ImagePanel;
            ParentAbilityPanel.SetPanelEvent("onmouseout", () => {
                HideCustomTooltip()
            })
            const link_ability = row_hero_data.link_ability;
            // $.Msg(["row_hero_data", id, row_hero_data])
            if (row_hero_data.is_ability == 1) {
                let ability_data = npc_abilities_custom[link_ability as "drow_4a"];
                let manacost = ability_data.AbilityManaCost ?? 0;
                let cooldown = ability_data.AbilityCooldown ?? 0;
                if (typeof (cooldown) == "string") {
                    cooldown = cooldown.split(" ")[0]
                }
                // $.Msg(["manacost", manacost, "cooldown", cooldown])
                TalentNode.SetDialogVariableInt("cooldown", parseInt(cooldown))
                TalentNode.SetDialogVariableInt("manacost", manacost)

                let parent_id = ParentNodeObject[id];
                // $.Msg(["parent_id", parent_id, parent_id != null])
                ParentAbilityPanel.visible = parent_id != null
                if (parent_id == null) {
                    ParentAbilityPanel.SetPanelEvent("onmouseover", () => { })
                } else {
                    let parent_talent = TalentTreeConfig[parent_id as "1"];
                    // $.Msg(["parent_talent", parent_talent])
                    ParentAbilityPanel.SetImage(GetTextureSrc(parent_talent.img))
                    ParentAbilityPanel.SetPanelEvent("onmouseover", () => {
                        let _data = hero_talent_list[parent_id]
                        // $.Msg(["_data",_data.uc])
                        ShowCustomTooltip(ParentAbilityPanel, "talent_tree", "", parent_id, _data.uc)
                    })
                }
            } else {
                let parent_ability_key = row_hero_data.parent_ability_key;
                // $.Msg(["parent_ability_key",parent_ability_key , parent_ability_key != null])
                if (parent_ability_key != "null") {
                    let parent_id = AbilityTalentId[link_ability];
                    let parent_talent = TalentTreeConfig[parent_id as "1"];
                    ParentAbilityPanel.SetImage(GetTextureSrc(parent_talent.img))
                    ParentAbilityPanel.SetPanelEvent("onmouseover", () => {
                        let _data = hero_talent_list[parent_id]
                        ShowCustomTooltip(ParentAbilityPanel, "talent_tree", "", parent_id, _data.uc)
                    })
                }

            }
            TalentNode.SetHasClass("IsAttribute", row_hero_data.tier_number == 99)
            TalentNode.SetDialogVariable("talent_name", $.Localize(`#custom_talent_${id}`))
            TalentNode.SetDialogVariableInt("max", row_hero_data.max_number)

            const TalentIcon = TalentNode.FindChildTraverse("TalentIcon") as ImagePanel;
            let img_src = GetTextureSrc(row_hero_data.img)
            TalentIcon.SetImage(img_src);


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
                level - 1,
                row_hero_data.AbilityValues,
                row_hero_data.ObjectValues,
                false
            );
            // $.Msg(["description_txt", level, description_txt])
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
                    let _data = hero_talent_list[_id]
                    let level = _data ? _data.uc : 0
                    ShowCustomTooltip(ChildTalentIcon, "talent_tree", "", _id, level)
                })

                ChildTalentIcon.SetPanelEvent("onmouseout", () => {
                    HideCustomTooltip()
                })
            }

            let sub_count = ChildNodeList.GetChildCount();
            const ChildNodeHeader = TalentNode.FindChildTraverse("ChildNodeHeader")!;
            ChildNodeHeader.visible = sub_count > 0;


        }
    })

    GameEvents.SendCustomGameEventToServer("HeroTalentSystem", {
        event_name: "GetSelectTalentData",
        params: {}
    })

    GameEvents.SendCustomGameEventToServer("HeroTalentSystem", {
        event_name: "GetHeroTalentListData",
        params: {}
    })
}

(function () {
    // $.Msg("ability_upgrade")
    Init()
})();