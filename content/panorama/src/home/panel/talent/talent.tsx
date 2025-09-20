import { GetTextureSrc } from '../../../common/custom_kv_method';
import { HeroTreeObject } from '../../../common/custom_talent';
import type { default as talent_tree_config } from '../../../json/config/game/hero/talent_tree/talent_tree_config.json';
import { HideCustomTooltip, ShowCustomTooltip } from '../../../utils/custom_tooltip';

const TalentBackgroundHeight = $('#TalentBackgroundHeight');
const TalentNodeList = $('#TalentNodeList');
const TalentContainer = $('#TalentContainer');
const ToggleBtn = $('#ToggleBtn');

// type talent_id_type =
type talent_row_data = (typeof talent_tree_config)[keyof typeof talent_tree_config];

const HeroNameOfID: { [id: number]: string } = {
    [6]: 'npc_dota_hero_drow_ranger',
    [101]: 'npc_dota_hero_skywrath_mage',
};

interface TalentTreeObject {
    name: string;
    max: number;
    img: string;
    sub: TalentTreeObject[];
}

interface TalentTreeProps {
    [index: string]: TalentTreeObject[];
}

export const CreateTalentTreeNode = (HeroID: number, row: talent_row_data, id: string, NodePanel: Panel, parent_panel: UICanvas) => {
    const heroname = HeroNameOfID[HeroID];
    const TalentNode = $.CreatePanel('Panel', NodePanel, id);
    // TalentNode.enabled = false;
    TalentNode.BLoadLayoutSnippet('TalentNode');
    TalentNode.SetDialogVariable('talent_name', $.Localize(`#custom_talent_${id}`));
    TalentNode.SetDialogVariableInt('used', 0);
    TalentNode.SetDialogVariableInt('max', row.max_number);
    TalentNode.Data<PanelDataObject>().used = 0;
    const TalentIcon = TalentNode.FindChildTraverse('TalentIcon') as ImagePanel;
    const img_src = GetTextureSrc(row.img);
    TalentIcon.SetImage(img_src);

    const TalentNodeButton = TalentNode.FindChildTraverse('TalentNodeButton') as Button;
    TalentNodeButton.enabled = false;
    TalentNodeButton.SetPanelEvent('onactivate', () => {
        // $.Msg(["talent button id", id])
        GameEvents.SendCustomGameEventToServer('HeroTalentSystem', {
            event_name: 'HeroSelectTalent',
            params: {
                key: id,
            },
        });
    });

    TalentNodeButton.SetPanelEvent('onmouseover', () => {
        const level = TalentNode.Data<PanelDataObject>().used as number;
        ShowCustomTooltip(TalentNodeButton, 'talent_tree', heroname, id, level);
    });

    TalentNodeButton.SetPanelEvent('onmouseout', () => {
        HideCustomTooltip();
    });

    for (const sub_key of row.unlock_key) {
        if (sub_key != 0) {
            const key = `${sub_key}`;
            const row_data = HeroTreeObject[key as keyof typeof HeroTreeObject];
            const TalentChildNode = TalentNode.FindChildTraverse('TalentChildNode')!;
            if (TalentChildNode != null) {
                $.Schedule(0, () => {
                    CreateTalentTreeNode(HeroID, row_data, `${key}`, TalentChildNode, parent_panel);
                });
            }
        }
    }
};

function _flattenArrayOfTuples(arrOfTuples: number[][]) {
    const retVal: number[] = [];
    arrOfTuples.forEach(t => retVal.push(t[0]) && retVal.push(t[1]));
    return retVal;
}

export const GameEventsSubscribe = () => {
    GameEvents.Subscribe('HeroTalentSystem_ResetHeroTalent', event => {
        // $.Msg(["HeroTalentSystem_ResetHeroTalent"])
        // @ts-ignore
        const HeroID = Players.GetSelectedHeroID(Players.GetLocalPlayer()) as number;
        $.Schedule(0.1, () => {
            CreateHeroTalent(HeroID);
        });
    });

    GameEvents.Subscribe('HeroTalentSystem_GetHeroTalentListData', event => {
        const data = event.data;
        const hero_talent_list = data.hero_talent_list;
        for (const id in hero_talent_list) {
            const data = hero_talent_list[id];
            const TalentNode = TalentNodeList.FindChildTraverse(id);
            if (TalentNode == null) {
                continue;
            }
            TalentNode.Data<PanelDataObject>().used = data.uc;
            TalentNode.SetDialogVariableInt('used', data.uc);
            const TalentNodeButton = TalentNode.FindChildTraverse('TalentNodeButton') as Button;
            // TalentNodeButton.enabled = data.iu == 1;
        }
    });
};

export const CreateHeroTalent = (HeroID: number) => {
    $.Schedule(0, () => {
        TalentNodeList.RemoveAndDeleteChildren();
        let i = 0;
        const object_list = Object.entries(HeroTreeObject);
        for (const row of object_list) {
            // $.Msg(row)
            const key = row[0];
            const row_data = row[1];
            // let row_data = HeroTreeObject[key as keyof typeof HeroTreeObject];
            if (row_data.hero_id == HeroID && row_data.tier_number == 1) {
                const node_id = row_data.index;
                let row_node = TalentNodeList.FindChildTraverse(`Node_${node_id}`);
                if (row_node == null) {
                    row_node = $.CreatePanel('UICanvas', TalentNodeList, `Node_${node_id}`);
                    row_node.AddClass('RowNode');
                }
                CreateTalentTreeNode(HeroID, row_data, key, row_node, row_node as UICanvas);
                i++;
            }
        }

        $.Schedule(1, () => {
            // 画线
            for (let i = 0; i < TalentNodeList.GetChildCount(); i++) {
                const UICanvasPanel = TalentNodeList.GetChild(i) as UICanvas;
                const content_w = UICanvasPanel.contentwidth / UICanvasPanel.actualuiscale_x;
                const content_h = UICanvasPanel.contentheight / UICanvasPanel.actualuiscale_y;
                for (let i = 0; i < UICanvasPanel.GetChildCount(); i++) {
                    const NodePanel = UICanvasPanel.GetChild(i);
                    if (NodePanel) {
                        GetNodePanelOffset(UICanvasPanel, NodePanel, content_w);
                    }

                    // for(let subPanle )
                }
            }
        });
    });
};

const GetNodePanelOffset = (UICanvasPanel: UICanvas, RowPanel: Panel, content_w: number) => {
    const SubNodePanel = RowPanel.FindChildTraverse('TalentChildNode')!;
    if (SubNodePanel) {
        for (let i = 0; i < SubNodePanel.GetChildCount(); i++) {
            const points: number[][] = [];
            const NodePanel = RowPanel.FindChildTraverse('TalentNodeButton')!;
            const node_width = NodePanel.actuallayoutwidth / NodePanel.actualuiscale_x;
            const node_height = NodePanel.actuallayoutheight / NodePanel.actualuiscale_y;
            const offset1 = NodePanel.GetPositionWithinAncestor(UICanvasPanel);
            points.push([offset1.x / NodePanel.actualuiscale_x + node_width / 2, offset1.y / NodePanel.actualuiscale_y + node_height / 2]);
            const SubRowPanel = SubNodePanel.GetChild(i)!;
            const subNodePanel = SubRowPanel.FindChildTraverse('TalentNodeButton')!;
            const sub_node_width = subNodePanel.actuallayoutwidth / NodePanel.actualuiscale_x;
            const sub_node_height = subNodePanel.actuallayoutheight / NodePanel.actualuiscale_y;
            const offset2 = subNodePanel.GetPositionWithinAncestor(UICanvasPanel);
            points.push([
                offset2.x / subNodePanel.actualuiscale_x + sub_node_width / 2,
                offset2.y / subNodePanel.actualuiscale_y + sub_node_height / 2,
            ]);
            UICanvasPanel.DrawSoftLinePointsJS(points.length, _flattenArrayOfTuples(points), 5, 1, '#B5D4EEaa');

            GetNodePanelOffset(UICanvasPanel, SubRowPanel, content_w);
        }
    }
};

export const Init = () => {
    ToggleBtn.SetPanelEvent('onactivate', () => {
        TalentContainer.ToggleClass('Show');
    });

    GameEventsSubscribe();
    GameEvents.SendCustomGameEventToServer('HeroTalentSystem', {
        event_name: 'ResetHeroTalent',
        params: {},
    });
};

(function () {
    // if (Game.IsInToolsMode()) { Init() }
})();
