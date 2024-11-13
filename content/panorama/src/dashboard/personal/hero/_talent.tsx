import { CustomMath } from "../../../utils/custom_math";


interface ServerTalentProps {
    id: string,
    sub: { [order: number]: ServerTalentProps }
}

interface ServerTalentTree {
    [heroid: string]: {
        init_id: string,
        sub: {
            [node: number]: {
                [order: number]: string
            }
        },
    }
}

const HeroTalentConfig = $("#HeroTalentConfig") as DropDown;
const HeroTalentTree = $("#HeroTalentTree");
const HeroTalentTreePath = $("#HeroTalentTreePath");
const HeroPopups_Talent = $("#HeroPopups_Talent");
const TalentClosedBtn = $("#TalentClosedBtn") as Button;

const TalentResetBtn = $("#TalentResetBtn") as Button;
const TalentSaveBtn = $("#TalentSaveBtn") as Button;
let INIT_TALENT_CONFIG_COUNT = 4;
let select_hero_id = -1;
let config_index = 0;



const server_talent_data = GameUI.CustomUIConfig().KvData.server_talent_data;

const InitTalentData = () => {
    let hero_talent_tree: ServerTalentTree = {};
    for (let id in server_talent_data) {
        let rowdata = server_talent_data[id as keyof typeof server_talent_data];
        let heroid = "" + rowdata.hero_id;
        let tier_number = rowdata.tier_number;
        let parent_node = rowdata.parent_node;

        if (tier_number == 0 && parent_node == 0) {
            hero_talent_tree[heroid] = {
                init_id: id,
                sub: {}
            }
        } else {
            if (hero_talent_tree[heroid].sub[tier_number] == null) {
                hero_talent_tree[heroid].sub[tier_number] = {}
            }
            hero_talent_tree[heroid].sub[tier_number][parent_node] = id;
        }

    }

    return hero_talent_tree
}

let hero_talent_tree = InitTalentData();
export const OpenHeroTalentView = (heroid: number) => {
    $.Msg(["OpenHeroTalentView 1"])
    if (select_hero_id == heroid) {
        HeroPopups_Talent.SetHasClass("Open", true)
        return
    }
    select_hero_id = heroid;
    HeroPopups_Talent.SetDialogVariableInt("talent_point", 0)

    HeroTalentConfig.RemoveAllOptions();
    const CONFIG_LEN = Object.values(localData[heroid]).length;
    for (let i = 0; i < CONFIG_LEN; i++) {
        let id = "" + i;
        let optionLabel = $.CreatePanel("Label", HeroTalentConfig, `${id}`, {
            text: "天赋页" + (i + 1),
            html: true,
        });
        optionLabel.Data<PanelDataObject>().index = i;
        HeroTalentConfig.AddOption(optionLabel)
    }
    $.Schedule(0.01, () => {
        HeroTalentConfig.SetSelectedIndex(0);
        HeroTalentConfig.SetPanelEvent("oninputsubmit", () => {
            config_index = parseInt(HeroTalentConfig.GetSelected().id);

            // $.Msg(["HeroTalentConfig id", config_index])
            // 更换配置
            EmptyTalentConfig();
            $.Schedule(0.1, () => {
                RenderTalentConfig()
            })

        })
    })


    SetHeroTalentTree(heroid);

    // 显示页面
    HeroPopups_Talent.SetHasClass("Open", true)

}

const HideDropdownMenu = () => {
    const HeroTalentConfigDropDownMenu = HeroTalentConfig.AccessDropDownMenu();
    HeroTalentConfigDropDownMenu.RemoveClass("DropDownMenuVisible")
}

const styleValue = [49, 42, 46]

const SetHeroTalentTree = (heroid: number) => {
    HeroTalentTree.RemoveAndDeleteChildren();
    HeroTalentTreePath.RemoveAndDeleteChildren();
    let talent_tree = hero_talent_tree[`${heroid}`];
    let init_id = talent_tree.init_id;
    const InitNode = CreateTreeNode(HeroTalentTree, init_id, 0)
    let sub_object = talent_tree.sub;
    for (let node in sub_object) {
        let node_object = Object.values(sub_object[node])
        for (let i = 0; i < node_object.length; i++) {
            let node_id = node_object[i];
            let is_final = (i == node_object.length - 1) ? 2 : 1;
            let nodePanel = CreateTreeNode(HeroTalentTree, node_id, is_final)

            if (i == 0) {
                CreateTreeNodePath(InitNode, 49, nodePanel, 42, node_id)
            } else {
                let parent_id = node_object[i - 1]
                let lastPanel = HeroTalentTree.FindChildTraverse(parent_id)!;
                CreateTreeNodePath(lastPanel, 42, nodePanel, 42, node_id)
            }
        }
    }


    RenderTalentConfig()
}


interface talentConfigProps {
    [x: number]: {
        c: number;
        k: {
            [x: string]: {
                uc: number;
            };
        };
    };
}


const CreateTreeNodePath = (panel1: Panel, devalue1: number, panel2: Panel, devalue2: number, node_id: string) => {
    const actualuiscale_x = HeroTalentTree.actualuiscale_x;
    const actualuiscale_y = HeroTalentTree.actualuiscale_y;
    let pos1 = panel1.Data<PanelDataObject>().pos as number[];
    let pos2 = panel2.Data<PanelDataObject>().pos as number[];
    let x1 = pos1[0] + devalue1;
    let y1 = pos1[1] + devalue1;
    let x2 = pos2[0] + devalue2;
    let y2 = pos2[1] + devalue2;
    let path_width = Math.floor(Game.Length2D([x1, y1, 0], [x2, y2, 0]))
    let PathPanel = $.CreatePanel("Panel", HeroTalentTreePath, node_id, { class: "TalentBorderPath" })
    PathPanel.style.width = path_width + "px";
    PathPanel.SetPositionInPixels(x1, y1, 0)
    let angle = Math.atan2((y2 - y1), (x2 - x1)) * 180 / Math.PI;
    PathPanel.style.transform = `rotateZ(${angle}deg)`
}
const CreateTreeNode = (e: Panel, id: string, type: number) => {

    // const actualuiscale_x = e.actualuiscale_x;
    // const actualuiscale_y = e.actualuiscale_y;
    let NodePanel = $.CreatePanel("Panel", e, id, { class: "TalentBorder" })
    NodePanel.BLoadLayoutSnippet("TalentBorder")
    let devalue = styleValue[type]
    NodePanel.SetHasClass("Init", type == 0);
    NodePanel.SetHasClass("Final", type == 2);

    let rowdata = server_talent_data[id as keyof typeof server_talent_data];
    let offset = rowdata.offset
    NodePanel.SetPositionInPixels(offset[0] - devalue, offset[1] - devalue, 0)
    NodePanel.Data<PanelDataObject>().pos = [offset[0] - devalue, offset[1] - devalue]
    NodePanel.SetDialogVariableInt("used", 0)

    let StatIcon = NodePanel.FindChildTraverse("StatIcon")!;
    StatIcon.AddClass(rowdata.img)
    StatIcon.enabled = false;
    StatIcon.SetPanelEvent("onactivate", () => {
        HideDropdownMenu();
        GameEvents.SendCustomGameEventToServer("ServiceTalent", {
            event_name: "ClickTalent",
            params: {
                key: id,
                index: config_index,
            }
        })
    })

    StatIcon.Data<PanelDataObject>().level = 0
    StatIcon.SetPanelEvent("onmouseover", () => {
        StatIcon.AddClass("onmouseover")
        let level = StatIcon.Data<PanelDataObject>().level as number
        SetTooltipsTalentConfig(StatIcon, id, level)
    });

    StatIcon.SetPanelEvent("onmouseout", () => {
        StatIcon.RemoveClass("onmouseover")
        GameUI.CustomUIConfig().HideCustomTooltip()
    });

    return NodePanel
}

const SetTooltipsTalentConfig = (e: Panel, id: string, level: number) => {
    $.DispatchEvent(
        "UIShowCustomLayoutParametersTooltip",
        e,
        "custom_tooltip_talentconfig",
        "file://{resources}/layout/custom_game/tooltip/talent_config/layout.xml",
        `id=${id}&level=${level}`,
    );
}

// 天赋数据
let serverData: { [hero_id: number]: NetworkedData<CGEDGetTalentListInfo[]> } = {};
let localData: { [hero_id: number]: NetworkedData<CGEDGetTalentListInfo[]> } = {};

export const InitHeroTalentView = () => {

    TalentClosedBtn.SetPanelEvent("onactivate", () => {
        HeroPopups_Talent.SetHasClass("Open", false)
        HideDropdownMenu();
    })

    GameEvents.Subscribe("ServiceTalent_GetPlayerServerTalent", event => {
        // $.Msg(["ServiceTalent_GetPlayerServerTalent", event.data])
        let data = event.data;
        serverData = data.server;
        localData = data.local;
        if (select_hero_id == -1) {
            TalentSaveBtn.enabled = false;
            HeroTalentConfig.enabled = true;
            return
        }
        // $.Msg(["localData", localData])
        // 更新天赋页面
        // $.Msg(Object.values(serverData[select_hero_id]).length)
        let server_config = Object.values(serverData[select_hero_id])[config_index];
        let config_data = Object.values(localData[select_hero_id])[config_index];
        // HeroPopups_Talent.SetDialogVariableInt("talent_point", config_data.y)
        RenderTalentConfig()
        const bIsSame = JSON.stringify(server_config.i) == JSON.stringify(config_data.i);
        TalentSaveBtn.enabled = !bIsSame;
        HeroTalentConfig.enabled = bIsSame;
    })


    GameEvents.Subscribe("ServiceTalent_EmptyTalentOfPlayer", event => {
        let data = event.data;
        let hero_id = data.hero_id;
        let config_index = data.index;
        // $.Msg(["ServiceTalent_EmptyTalentOfPlayer",data])
        // let ddd = localData[select_hero_id][config_index]
        EmptyTalentConfig();
    })

    TalentResetBtn.SetPanelEvent("onactivate", () => {
        HideDropdownMenu();
        GameEvents.SendCustomGameEventToServer("ServiceTalent", {
            event_name: "ResetTalentConfig",
            params: {
                hero_id: select_hero_id,
                index: config_index,
            }
        })
    })

    TalentSaveBtn.SetPanelEvent("onactivate", () => {
        HideDropdownMenu();
        GameEvents.SendCustomGameEventToServer("ServiceTalent", {
            event_name: "SaveTalentConfig",
            params: {
                hero_id: select_hero_id,
                index: config_index,
            }
        })
    })
}


const RenderTalentConfig = () => {
    let config_data = Object.values(localData[select_hero_id])[config_index];
    HeroPopups_Talent.SetDialogVariableInt("talent_point", config_data.y)
    const config_tree = config_data.i
    for (let tire in config_tree) {
        let row_data = config_tree[tire].k;
        for (let id in row_data) {
            let rowdata = server_talent_data[id as keyof typeof server_talent_data];
            let uc = row_data[id].uc;
            const NodePanel = HeroTalentTree.FindChildTraverse(id)!;
            const StatIcon = NodePanel.FindChildTraverse("StatIcon")!;
            NodePanel.SetDialogVariableInt("used", uc)
            // max_number
            NodePanel.SetHasClass("CanUp", uc < rowdata.max_number)
            NodePanel.SetHasClass("Max", uc >= rowdata.max_number)
            StatIcon.Data<PanelDataObject>().level = uc;
            StatIcon.enabled = uc < rowdata.max_number

            const PathNode = HeroTalentTreePath.FindChildTraverse(id)!;
            if (PathNode) { PathNode.AddClass("on"); }

            const bOnMouse = StatIcon.BHasClass("onmouseover")
            if (bOnMouse) {
                SetTooltipsTalentConfig(StatIcon, id, uc)
            }
        }

    }
}

const EmptyTalentConfig = () => {
    for (let i = 0; i < HeroTalentTree.GetChildCount(); i++) {
        const NodePanel = HeroTalentTree.GetChild(i)!;
        const id = NodePanel.id;
        const StatIcon = NodePanel.FindChildTraverse("StatIcon")!;
        NodePanel.SetDialogVariableInt("used", 0)
        NodePanel.RemoveClass("CanUp")
        NodePanel.RemoveClass("Max")
        const bIsInit = false;
        StatIcon.enabled = false
    }
    for (let i = 0; i < HeroTalentTreePath.GetChildCount(); i++) {
        const PathNode = HeroTalentTreePath.GetChild(i)!;
        if (PathNode) { PathNode.RemoveClass("on"); }
    }

}

