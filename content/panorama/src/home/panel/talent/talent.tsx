import { GetTextureSrc } from "../../../common/custom_kv_method";
import { default as talent_tree_drow_ranger } from "../../../json/config/game/hero/talent_tree/drow_ranger.json";
import { HideCustomTooltip, ShowCustomTooltip } from "../../../utils/custom_tooltip";

let TalentBackgroundHeight = $("#TalentBackgroundHeight");
let TalentNodeList = $("#TalentNodeList");

let hero_talent_tree: { [hero: string]: TalentTreeProps } = {};

interface TalentTreeObject {
    name: string,
    max: number,
    img: string;
    sub: TalentTreeObject[]
}

interface TalentTreeProps {
    [index: string]: TalentTreeObject[];
}



export const FormatTalentTree = (hero_name: string, talent_tree_obj: any) => {
    let temp_tree: TalentTreeProps = {};
    for (let k in talent_tree_obj) {
        let row_data = talent_tree_obj[k];
        let parent_node = `` + row_data.parent_node;
        let index = row_data.index;

        if (temp_tree[index] == null) { temp_tree[index] = []; }
        let temp_obj = { name: k, max: row_data.max_number, img: row_data.img, sub: [] }
        if (parent_node == "0") {
            temp_tree[index].push(temp_obj)
        } else {
            for (let sub_tree of temp_tree[index]) {
                if (sub_tree.name == parent_node) {
                    sub_tree.sub.push(temp_obj)
                    break
                }
                for (let sub_tree2 of sub_tree.sub) {
                    if (sub_tree2.name == parent_node) {
                        sub_tree2.sub.push(temp_obj)
                        break
                    }
                    for (let sub_tree3 of sub_tree2.sub) {
                        if (sub_tree3.name == parent_node) {
                            sub_tree3.sub.push(temp_obj)
                            break
                        }
                    }
                }
            }

        }

    }

    return temp_tree
    // hero_talent_tree[hero_name] =
}

export const RecursionTalentTree = () => {

}

export const CreateHeroTalentTreeUI = (heroname: string, NodePanel: Panel, index: string = "1") => {
    // TalentBackgroundHeight.RemoveAndDeleteChildren()

    let talent_tree = hero_talent_tree[heroname][index];
    for (let row of talent_tree) {
        CreateTalentTreeNode(heroname, row, NodePanel)
    }

}

export const CreateTalentTreeNode = (heroname: string, row: TalentTreeObject, NodePanel: Panel) => {
    let id = row.name;
    let TalentNode = $.CreatePanel("Panel", NodePanel, id);
    // TalentNode.enabled = false;
    TalentNode.BLoadLayoutSnippet("TalentNode");
    TalentNode.SetDialogVariable("talent_name", $.Localize(`#custom_talent_${heroname}_${id}`))
    TalentNode.SetDialogVariableInt("used", 0)
    TalentNode.SetDialogVariableInt("max", row.max)
    TalentNode.Data<PanelDataObject>().used = 0;
    let TalentIcon = TalentNode.FindChildTraverse("TalentIcon") as ImagePanel;
    let img_src = GetTextureSrc(row.img)
    TalentIcon.SetImage(img_src);

    let TalentNodeButton = TalentNode.FindChildTraverse("TalentNodeButton") as Button;
    TalentNodeButton.enabled = false;
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

    if (row.sub.length > 0) {
        let TalentChildNode = TalentNode.FindChildTraverse("TalentChildNode")!;
        for (let sub2 of row.sub) {
            CreateTalentTreeNode(heroname, sub2, TalentChildNode)
        }
    }
}

export const GameEventsSubscribe = () => {

    GameEvents.Subscribe("HeroTalentSystem_ResetHeroTalent", (event) => {
        // $.Msg(["HeroTalentSystem_ResetHeroTalent"])
        let data = event.data;
        let heroname = data.hero_name.replace("npc_dota_hero_", "");
        CreateHeroTalent(heroname);
    })

    GameEvents.Subscribe("HeroTalentSystem_GetHeroTalentListData", (event) => {
        let data = event.data;
        let hero_talent_list = data.hero_talent_list;
        // $.Msg(["hero_talent_list", hero_talent_list])
        for (let id in hero_talent_list) {
            let data = hero_talent_list[id];
            let TalentNode = TalentNodeList.FindChildTraverse(id)!;
            TalentNode.Data<PanelDataObject>().used = data.uc
            TalentNode.SetDialogVariableInt("used", data.uc)
            let TalentNodeButton = TalentNode.FindChildTraverse("TalentNodeButton") as Button;
            TalentNodeButton.enabled = data.iu == 1;
        }
    })



}

export const CreateHeroTalent = (heroname: string) => {
    // $.Msg(["CreateHeroTalent", heroname])
    TalentNodeList.RemoveAndDeleteChildren();
    for (let i = 1; i <= 5; i++) {
        let row_node = $.CreatePanel("Panel", TalentNodeList, `Node_${i}`);
        row_node.AddClass("RowNode");
        CreateHeroTalentTreeUI(heroname, row_node, `${i}`);
    }
}

export const Init = () => {

    GameEventsSubscribe()
    // 英雄天赋树
    hero_talent_tree["drow_ranger"] = FormatTalentTree("drow_ranger", talent_tree_drow_ranger);

    GameEvents.SendCustomGameEventToServer("HeroTalentSystem", {
        event_name: "ResetHeroTalent",
        params: {}
    })


}


(function () {
    // Init()
})();