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


let INIT_TALENT_CONFIG_COUNT = 4;


let select_hero_id = -1;
let hero_talent_tree: ServerTalentTree = {};


const InitHeroTalentView = () => {
    hero_talent_tree = InitTalentData();
    HeroPopups_Talent.SetDialogVariableInt("talent_point", 0)

    HeroTalentConfig.RemoveAllOptions();
    for (let i = 0; i < INIT_TALENT_CONFIG_COUNT; i++) {
        let id = "" + i;
        let optionLabel = $.CreatePanel("Label", HeroTalentConfig, `${id}`, {
            text: "天赋页" + (i + 1),
            html: true,
        });
        HeroTalentConfig.AddOption(optionLabel)
    }
    HeroTalentConfig.SetSelectedIndex(0);
    HeroTalentConfig.SetPanelEvent("oninputsubmit", () => {
        let id = HeroTalentConfig.GetSelected().id
        $.Msg(["HeroTalentConfig id", id])
    })

    // HeroTalentTree.SetPanelEvent("onactivate", () => {
    //     $.Msg(["update"])
    //     let talent_xy = HeroTalentTree.GetPositionWithinWindow()
    //     let cursor_xy = GameUI.GetCursorPosition()
    //     const actualuiscale_x = HeroTalentTree.actualuiscale_x;
    //     const actualuiscale_y = HeroTalentTree.actualuiscale_y;
    //     const offx = Math.floor((cursor_xy[0] - talent_xy.x) / actualuiscale_x);
    //     const offy = Math.floor((cursor_xy[1] - talent_xy.y) / actualuiscale_y);
    //     MainPanel.SetDialogVariable("content_offset", `${offx},${offy}`)
    // })
    // 天赋树

    SetHeroTalentTree(6);
}

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
        // return

    }
}

const CreateTreeNodePath = (panel1: Panel, devalue1: number, panel2: Panel, devalue2: number, node_id: string) => {
    const actualuiscale_x = HeroTalentTree.actualuiscale_x;
    const actualuiscale_y = HeroTalentTree.actualuiscale_y;
    let pos1 = panel1.Data<PanelDataObject>().pos as number[];
    let pos2 = panel2.Data<PanelDataObject>().pos as number[];
    // $.Msg([pos1])
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


    // $.Msg([panel1.id, panel2.id, [x1, y1], [x2, y2], angle])
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

    let StatIcon = NodePanel.FindChildTraverse("StatIcon")!;
    StatIcon.AddClass(rowdata.img)
    return NodePanel
}





export const TalentInit = () => {

}