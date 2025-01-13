import { GetTextureSrc } from "../../../common/custom_kv_method";
import { CustomMath } from "../../../utils/custom_math";
import { LoadCustomComponent } from "../../_components/component_manager";

const CheckAttrIsPercent = GameUI.CustomUIConfig().CheckAttrIsPercent
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
const TalentClearBtn = $("#TalentClearBtn") as Button;

let INIT_TALENT_CONFIG_COUNT = 4;
let select_hero_id = -1;
let config_index = 0;


const HeroDetailsPanel = $("#HeroDetailsPanel");
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
const HeroAttributeList = $("#HeroAttributeList")
export const SetHeroDetails = (hero_id: number) => {
    // select_hero_id = hero_id;
    // 需要获取对应英雄数据
    const heroname = GameUI.CustomUIConfig().HeroIDToName(hero_id)
    HeroDetailsPanel.SetDialogVariable("hero_name", $.Localize("#" + heroname))
    HeroDetailsPanel.SetDialogVariableInt("curr_count", 0);
    HeroDetailsPanel.SetDialogVariableInt("need_count", 5);

    const talent_config_index = GameUI.CustomUIConfig().getStorage("talent_config_index")!;
    if (talent_config_index == null) {
        return
    }
    const config_index = talent_config_index[hero_id]

    if (localData[hero_id] != null) {
        const config_data = Object.values(localData[hero_id])[config_index];
        UpdateHeroAttributeList(config_data)
    }

}

const UpdateHeroAttributeList = (config_data: CGEDGetTalentListInfo) => {
    const config_tree = config_data.i

    let attr_object: { [main: string]: { [sub: string]: number } } = {}
    for (let tire in config_tree) {
        let row_data = config_tree[tire].k;
        for (let id in row_data) {
            let row_talent = row_data[id];
            let rowdata = server_talent_data[id as keyof typeof server_talent_data];
            const ObjectValues = rowdata.ObjectValues as CustomAttributeTableType

            for (let main_key in ObjectValues) {
                if (attr_object[main_key] == null) {
                    attr_object[main_key] = {}
                }
                let main_data = ObjectValues[main_key as keyof typeof ObjectValues];
                for (let sub_key in main_data) {
                    let value = main_data[sub_key as keyof typeof main_data]! * row_talent.uc;
                    if (value > 0) {
                        if (attr_object[main_key][sub_key] == null) {
                            attr_object[main_key][sub_key] = 0
                        }
                        attr_object[main_key][sub_key] += (value)
                    }

                }
            }

        }
    }


    // 生成属性
    HeroAttributeList.RemoveAndDeleteChildren();
    for (let main_key in attr_object) {
        for (let sub_key in attr_object[main_key]) {
            let value = attr_object[main_key][sub_key];
            let _Panel = $.CreatePanel("Panel", HeroAttributeList, "");
            let PanelAttributeRow = LoadCustomComponent(_Panel, "row_attribute");
            PanelAttributeRow.SetAttributeMainKey(main_key, value, 0)
            // PanelAttributeRow.SetAttributeMainKey(attr_main, value);
            let is_pct = CheckAttrIsPercent(main_key, sub_key)

            PanelAttributeRow.IsPercent(is_pct)
            PanelAttributeRow.SetPercentValue(value)
        }

    }
}

let hero_talent_config_index = {}
let hero_talent_tree = InitTalentData();

export const OpenHeroTalentView = (heroid: number) => {
    // $.Msg(["OpenHeroTalentView",heroid])
    let talent_config_index = GameUI.CustomUIConfig().getStorage("talent_config_index")!;
    const SelectedIndex = talent_config_index[heroid]
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
        // let talent_config_index = GameUI.CustomUIConfig().getStorage("talent_config_index")!;
        HeroTalentConfig.SetSelectedIndex(SelectedIndex);
        HeroTalentConfig.SetPanelEvent("oninputsubmit", () => {
            let select_panel = HeroTalentConfig.GetSelected();
            if (select_panel == null) {
                config_index = SelectedIndex
            } else {
                config_index = parseInt(HeroTalentConfig.GetSelected().id);
            }

            talent_config_index[select_hero_id] = config_index;
            GameUI.CustomUIConfig().setStorage("talent_config_index", talent_config_index);
            // 更换配置
            EmptyTalentConfig();

            $.Schedule(0.01, () => {
                let config_data = Object.values(localData[select_hero_id])[config_index];
                RenderTalentConfig(config_data)
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

    let config_data = Object.values(localData[select_hero_id])[config_index];
    RenderTalentConfig(config_data)
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
    // $.Msg(["CreateTreeNode 1"])
    let StatIcon = NodePanel.FindChildTraverse("StatIcon") as ImagePanel;
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
        GameUI.CustomUIConfig().setStorage("talent_data", localData)
        let server_config = Object.values(serverData[select_hero_id])[config_index];
        let config_data = Object.values(localData[select_hero_id])[config_index];
        // HeroPopups_Talent.SetDialogVariableInt("talent_point", config_data.y)
        RenderTalentConfig(config_data)
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

    TalentClearBtn.SetPanelEvent("onactivate", () => {
        HideDropdownMenu();
        GameEvents.SendCustomGameEventToServer("ServiceTalent", {
            event_name: "ResetTalentConfig",
            params: {
                hero_id: select_hero_id,
                index: config_index,
            }
        })
    })

    TalentResetBtn.SetPanelEvent("onactivate", () => {
        HideDropdownMenu();
        GameEvents.SendCustomGameEventToServer("ServiceTalent", {
            event_name: "RestoreTalentConfig",
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


const RenderTalentConfig = (config_data: CGEDGetTalentListInfo) => {

    HeroPopups_Talent.SetDialogVariableInt("talent_point", config_data.y)
    // 重置所有天赋等级为0
    for (let i = 0; i < HeroTalentTree.GetChildCount(); i++) {
        const NodePanel = HeroTalentTree.GetChild(i)!;
        const StatIcon = NodePanel.FindChildTraverse("StatIcon")!;
        StatIcon.Data<PanelDataObject>().level = 0;
    }


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

    //
    UpdateHeroAttributeList(config_data)
}

const EmptyTalentConfig = () => {
    for (let i = 0; i < HeroTalentTree.GetChildCount(); i++) {
        const NodePanel = HeroTalentTree.GetChild(i)!;
        const id = NodePanel.id;
        // $.Msg(["EmptyTalentConfig"])
        const StatIcon = NodePanel.FindChildTraverse("StatIcon") as ImagePanel;
        NodePanel.SetDialogVariableInt("used", 0)
        NodePanel.RemoveClass("CanUp")
        NodePanel.RemoveClass("Max")
        const bIsInit = false;
        StatIcon.enabled = false;
        let rowdata = server_talent_data[id as keyof typeof server_talent_data];
        let is_ability = rowdata.is_ability == 1;
        if (is_ability) {
            let img = rowdata.img
            StatIcon.SetImage(GetTextureSrc(img))
        }
    }

    for (let i = 0; i < HeroTalentTreePath.GetChildCount(); i++) {
        const PathNode = HeroTalentTreePath.GetChild(i)!;
        if (PathNode) { PathNode.RemoveClass("on"); }
    }

}

