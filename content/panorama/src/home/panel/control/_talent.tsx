import { GetTextureSrc } from "../../../common/custom_kv_method";
import { HeroTreeObject } from "../../../common/custom_talent";
import { SetLabelDescriptionExtra } from "../../../utils/ability_description";
import { HideCustomTooltip, ShowCustomTooltip } from "../../../utils/custom_tooltip";
import { default as AbilityTypesJson } from "./../../../json/config/game/const/ability_types.json";

const CenterStatsContainer = $("#CenterStatsContainer");
const UnitPortraitPanel = $("#UnitPortrait") as ScenePanel;
const PlayerTalentTreeList = $("#PlayerTalentTreeList");
let AbilityList = $("#AbilityList");
let local_player = Players.GetLocalPlayer();
let MainPanel = $.GetContextPanel();
let talent_data = HeroTreeObject;
let talent_points = 0;
let hero_talent_list: CGEDPlayerTalentSkillClientList = {}

PlayerTalentTreeList.SetPanelEvent("onactivate", () => {
    TogglePlayerTalentTreeList(false)
})

PlayerTalentTreeList.SetPanelEvent('oncontextmenu', () => {
    TogglePlayerTalentTreeList(false)
})



// const InitTalentNodeTree = () => {
//     let object_list = Object.entries(HeroTreeObject)
//     for (let row of object_list) {
//         const key = row[0];
//         const row_data = row[1]

//     }
// }

/** 是否有存在升级页面的窗口 */
const GetOpenPopupsState = () => {
    let state = PlayerTalentTreeList.BHasClass("Show");
    let index = -1;
    for (let i = 0; i < PlayerTalentTreeList.GetChildCount(); i++) {
        let row_panel = PlayerTalentTreeList.GetChild(i)!;
        if (row_panel.BHasClass("Show")) {
            index = i
            break
        }
    }
    return { state, index }
}
/** 显示对应的技能升级按钮 */
const ShowAbilityUpgradeBtn = (node_index: number, show: boolean) => {
    // 如果已有打开的窗口,则不显示
    // $.Msg(["ShowAbilityUpgradeBtn", node_index, show, AbilityList.GetChildCount()])
    for (let i = 0; i < AbilityList.GetChildCount(); i++) {
        let AbilityPanel = AbilityList.GetChild(i)!;
        // AbilityPanel.SetHasClass("CanUpgrade", show);
        let index = AbilityPanel.Data<PanelDataObject>().index as number;
        if (index == node_index) {
            if (show) { show = !CheckCurrentNodeAllMax(node_index); }
            AbilityPanel.SetHasClass("CanUpgrade", show);
            break;
        }
    }



}

/** 切换升级按钮 */
const ShowAllAbilityUpgradeBtn = (show: boolean) => {
    for (let i = 0; i < 5; i++) {
        ShowAbilityUpgradeBtn(i, show)
    }
}

/** 显示对应的技能树页面,或者直接关闭当前页面 */
const ToggleAbilityTreePanel = (node_index: number, show: boolean) => {
    // $.Msg(["ToggleAbilityTreePanel"])
    for (let i = 0; i < PlayerTalentTreeList.GetChildCount(); i++) {
        let AbilityTreePanel = PlayerTalentTreeList.GetChild(i)!;
        if (AbilityTreePanel) {
            let panel_index = AbilityTreePanel.Data<PanelDataObject>().index as number
            if (panel_index == node_index) {
                if (show) {
                    let is_max = CheckCurrentNodeAllMax(node_index);
                    if (is_max) { show = false; }
                }
                PlayerTalentTreeList.SetHasClass("Show", show);
                AbilityTreePanel.SetHasClass("Show", show);
            } else {
                AbilityTreePanel.SetHasClass("Show", false);
            }


        }
    }
    // 关闭所有升级按钮
    ShowAllAbilityUpgradeBtn(!show)
}

/** 当前节点分支全满 需要优化,根据数据来判断*/
const CheckCurrentNodeAllMax = (node_index: number) => {
    let is_max = true;
    let row_tree = hero_talent_tree_object[node_index];
    for (let id in row_tree) {
        if (row_tree[id] == true) {
            return false
        }
    }
    return is_max
}

/**
 * 整个技能树窗口页面
 * @param bShow 
 */
const TogglePlayerTalentTreeList = (bShow: boolean) => {
    if (bShow) {
        PlayerTalentTreeList.AddClass("Show");
    } else {
        PlayerTalentTreeList.RemoveClass("Show");
        if (talent_points > 0) {
            ShowAllAbilityUpgradeBtn(true)
        } else {
            ShowAllAbilityUpgradeBtn(false)
        }

    }
}

export const CreatePanel_Talent = () => {
    let local_hero = Players.GetPlayerHeroEntityIndex(local_player);
    MainPanel.SetDialogVariableInt("point_count", 0)
    // CreateHeroTalentTree(6 as HeroID)
    GameEventsSubscribe()
}

let HeroSubNodeObject: { [id: string]: number[] } = {};
let hero_talent_tree_object: { [node: number]: { [key: string]: boolean } } = {}

const CreateHeroTalentTree = (heroId: HeroID) => {
    PlayerTalentTreeList.RemoveAndDeleteChildren();
    const ALPos = AbilityList.GetPositionWithinWindow();
    hero_talent_tree_object = {};
    HeroSubNodeObject = {};
    // let index = 0
    for (let id in talent_data) {
        let row_data = talent_data[id as keyof typeof talent_data];
        let node_index = row_data.index;
        let tree_id = `ability_index_${row_data.index}`;
        let talent_id = `talent_${id}`;
        let AbilityTreePanel = PlayerTalentTreeList.FindChildTraverse(tree_id);
        if (AbilityTreePanel == null) {
            hero_talent_tree_object[row_data.index] = {}
            AbilityTreePanel = $.CreatePanel("Button", PlayerTalentTreeList, tree_id);
            AbilityTreePanel.BLoadLayoutSnippet("AbilityTreePanel")
            AbilityTreePanel.SetPanelEvent("onactivate", () => { })
            AbilityTreePanel.Data<PanelDataObject>().index = row_data.index;
            let AbilityPanel = AbilityList.GetChild(node_index);
            if (AbilityPanel) {
                AbilityPanel.Data<PanelDataObject>().index = node_index
                let LevelUpBtn = AbilityPanel.FindChildTraverse("LevelUpBtn")!;
                let curr_index = row_data.index;
                LevelUpBtn.SetPanelEvent("onactivate", () => {
                    ToggleAbilityTreePanel(curr_index, true)
                })
            }
        }

        let TalentListPanel = AbilityTreePanel.FindChildTraverse("TalentList")!
        let TalentNode = $.CreatePanel("Panel", TalentListPanel, talent_id);
        hero_talent_tree_object[node_index][id] = false
        TalentNode.BLoadLayoutSnippet("TalentInfo");
        let TalentIcon = TalentNode.FindChildTraverse("TalentIcon") as ImagePanel;
        let img_src = GetTextureSrc(row_data.img)
        TalentIcon.SetImage(img_src);

        let TalentNodeButton = TalentNode.FindChildTraverse("TalentNodeButton") as Button;
        TalentNodeButton.SetPanelEvent("onactivate", () => {
            // 点击后关闭所有页面
            TogglePlayerTalentTreeList(false);
            GameEvents.SendCustomGameEventToServer("HeroTalentSystem", {
                event_name: "HeroSelectTalent",
                params: {
                    key: id,
                }
            })
        })

        HeroSubNodeObject[id] = row_data.unlock_key
    }


    SetLoaclPlayerHeroPortrait();
}


const GameEventsSubscribe = () => {

    GameEvents.Subscribe("HeroTalentSystem_ResetHeroTalent", (event) => {
        let data = event.data;
        let player_info = Game.GetPlayerInfo(Players.GetLocalPlayer())
        let heroid = player_info.player_selected_hero_id;
        CreateHeroTalentTree(heroid)
    })

    GameEvents.Subscribe("HeroTalentSystem_GetHeroTalentListData", (event) => {
        let data = event.data;
        hero_talent_list = data.hero_talent_list;
        talent_points = data.talent_points;
        let local_hero = Players.GetPlayerHeroEntityIndex(local_player);
        MainPanel.SetDialogVariableInt("point_count", talent_points);
        let hero_name = Entities.GetUnitName(local_hero).replace("npc_dota_hero_", "");
        if (talent_points > 0) {
            // let hero_data = talent_data[hero_name as keyof typeof talent_data];
            for (let id in hero_talent_list) {
                let talent_id = `talent_${id}`;
                let TalentNode = PlayerTalentTreeList.FindChildTraverse(talent_id);
                let loc_row_data = talent_data[id as keyof typeof talent_data];
                let node_index = loc_row_data.index;

                if (TalentNode) {
                    let _data = hero_talent_list[id];
                    let is_unlock = _data.iu == 1;
                    let row_hero_data = talent_data[id as "1"];
                    let is_max = _data.uc >= talent_data[id as keyof typeof talent_data].max_number
                    let is_show = is_unlock && !is_max;
                    let level = _data.uc
                    // $.Msg(["ddd",hero_talent_tree_object[node_index][id]])
                    hero_talent_tree_object[node_index][id] = is_show
                    TalentNode.Data<PanelDataObject>().used = _data.uc
                    TalentNode.SetHasClass("Show", is_show)
                    TalentNode.SetHasClass("IsNew", _data.uc == 0)
                    TalentNode.SetHasClass("IsUp", _data.uc > 0)
                    TalentNode.SetHasClass("IsAbility", row_hero_data.is_ability == 1)
                    TalentNode.SetHasClass("IsAttribute", row_hero_data.tier_number == 99)

                    TalentNode.SetDialogVariable("talent_name", $.Localize(`#custom_talent_${id}`))
                    TalentNode.SetDialogVariableInt("uc", level)
                    TalentNode.SetDialogVariableInt("max", row_hero_data.max_number)
                    // 类型标签
                    let TypesLabel = TalentNode.FindChildTraverse("TypesLabel")!;
                    let types_value_list = row_hero_data.mark_types.split(",");
                    let has_newTypes = row_hero_data.mark_types != "Null";
                    TypesLabel.SetHasClass("Show", has_newTypes && level == 0)
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
                    ExtraElement.SetHasClass("Show", has_element > 0 && level == 0);
                    for (let i = 1; i <= 6; i++) {
                        ExtraElement.SetHasClass("element_" + i, has_element == i)
                    }
                    let talent_desc = $.Localize(`#custom_talent_${id}_desc`)
                    let description_txt = SetLabelDescriptionExtra(
                        talent_desc,
                        level,
                        row_hero_data.AbilityValues,
                        null,
                        false
                    );
                    TalentNode.SetDialogVariable("AbilityDescription", description_txt)

                    // 找到子分支
                    const ChildNodeList = TalentNode.FindChildTraverse("ChildNodeList")!;
                    let subNode = HeroSubNodeObject[id];
                    ChildNodeList.RemoveAndDeleteChildren();
                    let sub_node_ids = []
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
                        let _data = talent_data[_id as keyof typeof talent_data];
                        let img_src = GetTextureSrc(_data.img)
                        ChildTalentIcon.SetImage(img_src);

                        ChildTalentIcon.SetPanelEvent("onmouseover", () => {
                            ShowCustomTooltip(ChildTalentIcon, "talent_tree", hero_name, _id, 0)
                        })

                        ChildTalentIcon.SetPanelEvent("onmouseout", () => {
                            HideCustomTooltip()
                        })
                    }

                }
            }

            $.Schedule(0, () => {
                // 显示按钮
                // 验证是否有打开的页面
                let open_state = GetOpenPopupsState()

                if (open_state.state) {
                    for (let i = 0; i < 5; i++) {
                        ShowAbilityUpgradeBtn(i, false)
                    }
                    let curr_max = CheckCurrentNodeAllMax(open_state.index);
                    if (curr_max) {
                        // 关闭升级窗口
                        ToggleAbilityTreePanel(open_state.index, false)
                    }

                } else {
                    for (let i = 0; i < 5; i++) {
                        let is_max = CheckCurrentNodeAllMax(i);
                        ShowAbilityUpgradeBtn(i, !is_max)
                    }
                }

            })
        } else {
            // 关闭升级窗
            TogglePlayerTalentTreeList(false);

        }

    })

    GameEvents.SendCustomGameEventToServer("HeroTalentSystem", {
        event_name: "ResetHeroTalent",
        params: {}
    })

    GameEvents.Subscribe("gameui_hidden", () => {
        let heroname = Players.GetPlayerSelectedHero(Players.GetLocalPlayer())
        $.Schedule(4, () => {
            UnitPortraitPanel.FireEntityInput(heroname, "Enable", "1")
        })
    });
}

const SetLoaclPlayerHeroPortrait = () => {
    let heroname = Players.GetPlayerSelectedHero(Players.GetLocalPlayer())
    UnitPortraitPanel.ReloadScene();
    checkHeroView(heroname)
}

const checkHeroView = (heroname: string) => {
    $.Schedule(1, () => {
        UnitPortraitPanel.FireEntityInput(heroname, "Enable", "1")
    })
}