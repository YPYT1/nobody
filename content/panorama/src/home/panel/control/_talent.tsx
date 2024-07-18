import { GetTextureSrc } from "../../../common/custom_kv_method";
import { FormatTalentTree, GetAllHeroTalentTree, GetHeroTalentTreeObject, HeroTreeObject } from "../../../common/custom_talent";
import { HideCustomTooltip, ShowCustomTooltip } from "../../../utils/custom_tooltip";


const PlayerTalentTreeList = $("#PlayerTalentTreeList");
let AbilityList = $("#AbilityList");
let local_player = Players.GetLocalPlayer();
let MainPanel = $.GetContextPanel();
let talent_data = HeroTreeObject;
let talent_points = 0;


PlayerTalentTreeList.SetPanelEvent("onactivate", () => {
    TogglePlayerTalentTreeList(false)
})

PlayerTalentTreeList.SetPanelEvent('oncontextmenu', () => {
    TogglePlayerTalentTreeList(false)
})

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
    let AbilityPanel = AbilityList.GetChild(node_index)!;
    if (show) {
        show = !CheckCurrentNodeAllMax(node_index);
    }
    AbilityPanel.SetHasClass("CanUpgrade", show);


}

/** 切换升级按钮 */
const ShowAllAbilityUpgradeBtn = (show: boolean) => {
    for (let i = 0; i < 5; i++) {
        ShowAbilityUpgradeBtn(i, show)
    }
}

/** 显示对应的技能树页面,或者直接关闭当前页面 */
const ToggleAbilityTreePanel = (node_index: number, show: boolean) => {

    for (let i = 0; i < PlayerTalentTreeList.GetChildCount(); i++) {
        let AbilityTreePanel = PlayerTalentTreeList.GetChild(i);
        if (AbilityTreePanel) {
            if (i == node_index) {
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

/** 当前节点分支全满 */
const CheckCurrentNodeAllMax = (node_index: number) => {
    // $.Msg(["CheckCurrentNodeAllMax", node_index])
    let AbilityTreePanel = PlayerTalentTreeList.GetChild(node_index);
    let is_max = true;
    if (AbilityTreePanel) {
        let TalentList = AbilityTreePanel.FindChildTraverse("TalentList")!;
        for (let i = 0; i < TalentList.GetChildCount(); i++) {
            let row_panel = TalentList.GetChild(i)!
            if (row_panel.visible == true) {
                return false
            }
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
    let hero_name = Entities.GetUnitName(local_hero).replace("npc_dota_hero_", "");
    MainPanel.SetDialogVariableInt("point_count", 0)
    CreateHeroTalentTree(hero_name)
    GameEventsSubscribe()

}

const CreateHeroTalentTree = (heroname: string) => {
    $.Msg(["CreateHeroTalentTree", heroname])
    PlayerTalentTreeList.RemoveAndDeleteChildren();
    let hero_data = talent_data[heroname as keyof typeof talent_data];
    let talent_tree = FormatTalentTree(heroname, hero_data);

    let index = 0;
    for (let id in hero_data) {
        let row_data = hero_data[id as keyof typeof hero_data];
        let tree_id = `ability_index_${row_data.index}`;
        let talent_id = `talent_${id}`;
        let AbilityTreePanel = PlayerTalentTreeList.FindChildTraverse(tree_id);
        if (AbilityTreePanel == null) {
            AbilityTreePanel = $.CreatePanel("Panel", PlayerTalentTreeList, tree_id, {
                class: "AbilityTreePanel"
            });
            AbilityTreePanel.BLoadLayoutSnippet("AbilityTreePanel")
            let AbilityPanel = AbilityList.GetChild(index);
            // $.Msg(["AbilityPanel", AbilityPanel])
            if (AbilityPanel) {
                let LevelUpBtn = AbilityPanel.FindChildTraverse("LevelUpBtn")!;
                let curr_index = index;
                LevelUpBtn.SetPanelEvent("onactivate", () => {
                    // $.Msg(["Try Open", curr_index])
                    ToggleAbilityTreePanel(curr_index, true)
                    // OpenCurrentAbilityTree(LevelUpBtn, curr_index)
                })
            }

            index++;
        }

        // let is_trunk = row_data.
        let TalentListPanel = AbilityTreePanel.FindChildTraverse("TalentList")!
        let TalentNode = $.CreatePanel("Panel", TalentListPanel, talent_id);
        TalentNode.BLoadLayoutSnippet("TalentInfo");
        let TalentIcon = TalentNode.FindChildTraverse("TalentIcon") as ImagePanel;
        let img_src = GetTextureSrc(row_data.img)
        TalentIcon.SetImage(img_src);

        let TalentNodeButton = TalentNode.FindChildTraverse("TalentNodeButton") as Button;
        TalentNodeButton.SetPanelEvent("onactivate", () => {
            // $.Msg(["talent button id", id])
            GameEvents.SendCustomGameEventToServer("HeroTalentSystem", {
                event_name: "HeroSelectTalent",
                params: {
                    key: id,
                }
            })
        })

        TalentNodeButton.SetPanelEvent("onmouseover", () => {
            let level = TalentNode.Data<PanelDataObject>().used as number;
            ShowCustomTooltip(TalentNodeButton, "talent_tree", heroname, id, level)
        })

        TalentNodeButton.SetPanelEvent("onmouseout", () => {
            HideCustomTooltip()
        })
    }

    $.Schedule(0, () => {
        let abi_pos = AbilityList.GetPositionWithinWindow();
        // let tree_id = `ability_index_${index + 1}`;
        for (let i = 0; i < PlayerTalentTreeList.GetChildCount(); i++) {
            let AbilityTreePanel = PlayerTalentTreeList.GetChild(i)!;
            AbilityTreePanel.style.marginLeft = `${abi_pos.x + 68.4 * i + 16}px`
        }
    })



}


// const OpenCurrentAbilityTree = (e: Panel, node_index: number) => {
//     ToggleAbilityTreePanle(node_index,true);
//     // $.Msg(["OpenCurrentAbilityTree", index])
//     // for (let i = 0; i < PlayerTalentTreeList.GetChildCount(); i++) {
//     //     let AbilityTreePanel = PlayerTalentTreeList.GetChild(i)!;
//     //     if (i == index) {
//     //         let last_state = AbilityTreePanel.BHasClass("Show");
//     //         AbilityTreePanel.SetHasClass("Show", !last_state);
//     //         PlayerTalentTreeList.SetHasClass("Show", !last_state)
//     //         for (let j = 0; j < AbilityList.GetChildCount(); j++) {
//     //             let AbilityPanel = AbilityList.GetChild(j)!;
//     //             AbilityPanel.SetHasClass("CanUpgrade", last_state)
//     //         }
//     //     } else {
//     //         AbilityTreePanel.SetHasClass("Show", i == index);
//     //     }
//     // }


// }

const GameEventsSubscribe = () => {

    GameEvents.Subscribe("HeroTalentSystem_ResetHeroTalent", (event) => {
        let data = event.data;
        let hero_name = data.hero_name.replace("npc_dota_hero_", "");
        CreateHeroTalentTree(hero_name)
    })

    GameEvents.Subscribe("HeroTalentSystem_GetHeroTalentListData", (event) => {
        // $.Msg(["HeroTalentSystem_GetHeroTalentListData"])
        let data = event.data;
        let hero_talent_list = data.hero_talent_list;
        talent_points = data.talent_points;
        let local_hero = Players.GetPlayerHeroEntityIndex(local_player);
        MainPanel.SetDialogVariableInt("point_count", talent_points);
        let hero_name = Entities.GetUnitName(local_hero).replace("npc_dota_hero_", "");
        if (talent_points > 0) {

            let hero_data = talent_data[hero_name as keyof typeof talent_data];
            for (let id in hero_talent_list) {
                let talent_id = `talent_${id}`;
                let TalentNode = PlayerTalentTreeList.FindChildTraverse(talent_id);
                if (TalentNode) {
                    let _data = hero_talent_list[id];
                    let is_unlock = _data.iu == 1;
                    let row_hero_data = hero_data[id as keyof typeof hero_data]
                    let is_max = _data.uc >= hero_data[id as keyof typeof hero_data].max_number
                    let is_show = is_unlock && !is_max;
                    TalentNode.Data<PanelDataObject>().used = _data.uc
                    TalentNode.SetHasClass("Show", is_show)
                    TalentNode.SetHasClass("IsNew", _data.uc == 0)
                    TalentNode.SetHasClass("IsUp", _data.uc > 0)
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
                    if (curr_max){
                        // 关闭升级窗口
                        ToggleAbilityTreePanel(open_state.index,false)
                    }
                 
                } else {
                    for (let i = 0; i < 5; i++) {
                        let is_max = CheckCurrentNodeAllMax(i);
                        ShowAbilityUpgradeBtn(i, !is_max)
                    }
                }

                // $.Schedule(0, () => {
                //     let open_state = GetOpenPopupsState()
                // })


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
}