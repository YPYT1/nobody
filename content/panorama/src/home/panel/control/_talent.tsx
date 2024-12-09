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



const AbilityPoint = $("#AbilityPoint")

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
    // let local_hero = Players.GetPlayerHeroEntityIndex(local_player);
    // MainPanel.SetDialogVariableInt("point_count", 0)
    // GameEventsSubscribe()
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
        // CreateHeroTalentTree(heroid)
    })

    GameEvents.Subscribe("HeroTalentSystem_GetHeroTalentListData", (event) => {
        let data = event.data;
        hero_talent_list = data.hero_talent_list;
        talent_points = data.talent_points;
        // let local_hero = Players.GetPlayerHeroEntityIndex(local_player);
        MainPanel.SetDialogVariableInt("point_count", talent_points);
        

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