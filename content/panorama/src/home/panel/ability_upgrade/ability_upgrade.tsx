import { SetLabelDescriptionExtra } from '../../../utils/ability_description';
import { HideCustomTooltip, ShowCustomTooltip } from '../../../utils/custom_tooltip';
import { default as AbilityTypesJson } from './../../../json/config/game/const/ability_types.json';

const SelectList = $('#SelectList');

const npc_abilities_custom = GameUI.CustomUIConfig().KvData.npc_abilities_custom;
const TalentTreeConfig = GameUI.CustomUIConfig().KvData.TalentTreeConfig;
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;

let HeroSubNodeObject: { [id: string]: number[] } = {};
let ParentNodeObject: { [id: string]: string } = {};
let AbilityTalentId: { [ability: string]: string } = {};
export const Init = () => {
    InitTalentData();
    CustomEventSubscribe();
};

const InitTalentData = () => {
    HeroSubNodeObject = {};
    ParentNodeObject = {};
    AbilityTalentId = {};
    for (const id in TalentTreeConfig) {
        const row_data = TalentTreeConfig[id as keyof typeof TalentTreeConfig];
        HeroSubNodeObject[id] = row_data.unlock_key;
        if (row_data.is_ability == 1) {
            const ability_name = row_data.link_ability;
            AbilityTalentId[ability_name] = id;
        }
        for (const sub_id of row_data.unlock_key) {
            if (sub_id != 0) {
                ParentNodeObject[`${sub_id}`] = id;
            }
        }
    }
};
// GetSelectTalentData(player_id: PlayerID, params: CGED["HeroTalentSystem"]["GetSelectTalentData"], callback?)
let hero_talent_list: CGEDPlayerTalentSkillClientList = {};
const CustomEventSubscribe = () => {
    GameEvents.Subscribe('HeroTalentSystem_GetHeroTalentListData', event => {
        const data = event.data;
        hero_talent_list = data.hero_talent_list;
    });

    GameEvents.Subscribe('HeroTalentSystem_GetSelectTalentData', event => {
        const data = event.data.select;
        const show = data.is_show == 1;
        SelectList.visible = show;
        const list = Object.values(data.data);
        SelectList.RemoveAndDeleteChildren();
        let order = 0;
        for (const _data of list) {
            order += 1;
            const id = _data.key;
            const type = _data.type;
            const level = _data.lv;
            const row_hero_data = TalentTreeConfig[id as keyof typeof TalentTreeConfig];

            let TalentNode = SelectList.GetChild(order - 1)!;
            if (TalentNode == null) {
                TalentNode = $.CreatePanel('Panel', SelectList, '');
                TalentNode.BLoadLayoutSnippet('TalentInfo');
            }
            TalentNode.Data<PanelDataObject>().index = order - 1;
            TalentNode.SetHasClass('is_invest', type == 2);
            const TypesLabel = TalentNode.FindChildTraverse('TypesLabel')!;
            if (type == 2) {
                const curr = _data.dq!;
                const next = _data.uph!;
                const lv = _data.lv;
                TalentNode.SetHasClass('adv_invest', lv > 3);
                TalentNode.SetDialogVariable('talent_name', $.Localize('#custom_text_soul_invest'));
                TalentNode.SetHasClass('IsAbility', false);
                TypesLabel.SetHasClass('Resource', true);
                TypesLabel.SetHasClass('Show', true);
                TypesLabel.SetDialogVariable('type_label', '理财型');
                // TalentNode.visible = false

                TalentNode.SetDialogVariableInt('up_value', lv);
                TalentNode.SetDialogVariableInt('curr', curr);
                TalentNode.SetDialogVariableInt('next', next);
                const label = $.Localize('#custom_text_soul_invest_Description', TalentNode);

                TalentNode.SetDialogVariable('soul_invest_title', label);

                // TalentNode.SetDialogVariableInt("max", -1)

                // $.Msg(_data)
                TalentNode.SetPanelEvent('onactivate', () => {
                    const index = TalentNode.Data<PanelDataObject>().index;
                    GameEvents.SendCustomGameEventToServer('HeroTalentSystem', {
                        event_name: 'HeroSelectTalentOfIndex',
                        params: {
                            index: index,
                        },
                    });
                });
                continue;
            } else {
                // TalentNode.visible = true
            }
            TalentNode.SetPanelEvent('onactivate', () => {
                const index = TalentNode.Data<PanelDataObject>().index;
                // $.Msg(["HeroSelectTalentOfIndex",index])

                GameEvents.SendCustomGameEventToServer('HeroTalentSystem', {
                    event_name: 'HeroSelectTalentOfIndex',
                    params: {
                        index: index,
                    },
                });
            });

            TalentNode.SetDialogVariableInt('uc', level);
            TalentNode.SetHasClass('IsAbility', row_hero_data.is_ability == 1);

            // 显示父级分支
            // 技能类显示父技能,天赋类显示对应技能
            // 如果为技能显示父级ID,否则显示对应技能名的ID
            const ParentAbilityPanel = TalentNode.FindChildTraverse('ParentAbilityPanel') as ImagePanel;
            ParentAbilityPanel.SetPanelEvent('onmouseout', () => {
                HideCustomTooltip();
            });
            const link_ability = row_hero_data.link_ability;
            // $.Msg(["row_hero_data", id, row_hero_data])
            if (row_hero_data.is_ability == 1) {
                const ability_data = npc_abilities_custom[link_ability as 'drow_4a'];
                const manacost = ability_data.AbilityManaCost ?? 0;
                let cooldown = ability_data.AbilityCooldown ?? 0;
                if (typeof cooldown == 'string') {
                    cooldown = cooldown.split(' ')[0];
                }
                // $.Msg(["manacost", manacost, "cooldown", cooldown])
                TalentNode.SetDialogVariableInt('cooldown', parseInt(cooldown));
                TalentNode.SetDialogVariableInt('manacost', manacost);

                const parent_id = ParentNodeObject[id];
                // $.Msg(["parent_id", parent_id, parent_id != null])
                ParentAbilityPanel.visible = parent_id != null;
                if (parent_id == null) {
                    ParentAbilityPanel.SetPanelEvent('onmouseover', () => {});
                } else {
                    const parent_talent = TalentTreeConfig[parent_id as '1'];
                    // $.Msg(["parent_talent", parent_talent])
                    ParentAbilityPanel.SetImage(GetTextureSrc(parent_talent.img));
                    ParentAbilityPanel.SetPanelEvent('onmouseover', () => {
                        const _data = hero_talent_list[parent_id];
                        // $.Msg(["_data",_data.uc])
                        ShowCustomTooltip(ParentAbilityPanel, 'talent_tree', '', parent_id, _data.uc);
                    });
                }
            } else {
                const parent_ability_key = row_hero_data.parent_ability_key;
                // $.Msg(["parent_ability_key",parent_ability_key , parent_ability_key != null])
                if (parent_ability_key != 'null') {
                    const parent_id = AbilityTalentId[link_ability];
                    const parent_talent = TalentTreeConfig[parent_id as '1'];
                    ParentAbilityPanel.SetImage(GetTextureSrc(parent_talent.img));
                    ParentAbilityPanel.SetPanelEvent('onmouseover', () => {
                        const _data = hero_talent_list[parent_id];
                        ShowCustomTooltip(ParentAbilityPanel, 'talent_tree', '', parent_id, _data.uc);
                    });
                }
            }
            TalentNode.SetHasClass('IsAttribute', row_hero_data.tier_number == 99);
            TalentNode.SetDialogVariable('talent_name', $.Localize(`#custom_talent_${id}`));
            TalentNode.SetDialogVariableInt('max', row_hero_data.max_number);

            const TalentIcon = TalentNode.FindChildTraverse('TalentIcon') as ImagePanel;
            const img_src = GetTextureSrc(row_hero_data.img);
            TalentIcon.SetImage(img_src);

            const types_value_list = row_hero_data.mark_types.split(',');
            const has_newTypes = row_hero_data.mark_types != 'Null';
            TypesLabel.SetHasClass('Show', has_newTypes && level == 1);
            for (const type_key in AbilityTypesJson) {
                for (const types_value of types_value_list) {
                    TypesLabel.SetHasClass(type_key, types_value == type_key);
                    if (types_value == type_key) {
                        TypesLabel.SetDialogVariable('type_label', $.Localize('#custom_ability_type_' + type_key));
                    }
                }
            }

            // 元素
            const ExtraElement = TalentNode.FindChildTraverse('ExtraElement')!;
            const has_element = row_hero_data.mark_element;
            // $.Msg(["xxx", id, level, has_element > 0, level == 1])
            ExtraElement.SetHasClass('Show', has_element > 0 && level == 1);
            for (let i = 1; i <= 6; i++) {
                ExtraElement.SetHasClass('element_' + i, has_element == i);
            }
            const talent_desc = $.Localize(`#custom_talent_${id}_desc`);
            const description_txt = SetLabelDescriptionExtra(talent_desc, level - 1, row_hero_data.AbilityValues, row_hero_data.ObjectValues, false);
            // $.Msg(["description_txt", level, description_txt])
            TalentNode.SetDialogVariable('AbilityDescription', description_txt);

            // 找到子分支
            const ChildNodeList = TalentNode.FindChildTraverse('ChildNodeList')!;
            const subNode = HeroSubNodeObject[id];
            ChildNodeList.RemoveAndDeleteChildren();
            const sub_node_ids: string[] = [];
            for (const _id of subNode) {
                if (_id == 0) {
                    continue;
                }
                sub_node_ids.push(`${_id}`);
            }

            for (let i = 0; i < sub_node_ids.length; i++) {
                const _id = sub_node_ids[i];
                const is_only = sub_node_ids.length == 1;
                const is_first = !is_only && i == 0;
                const is_last = !is_only && i == sub_node_ids.length - 1;

                const TalentNode = $.CreatePanel('Panel', ChildNodeList, '');
                TalentNode.BLoadLayoutSnippet('ChildTalentNode');
                TalentNode.SetHasClass('is_first', is_first);
                TalentNode.SetHasClass('is_last', is_last);
                TalentNode.SetHasClass('is_only', is_only);

                const ChildTalentIcon = TalentNode.FindChildTraverse('ChildTalentIcon') as ImagePanel;
                const sub_data = TalentTreeConfig[_id as keyof typeof TalentTreeConfig];
                const img_src = GetTextureSrc(sub_data.img);
                ChildTalentIcon.SetImage(img_src);

                ChildTalentIcon.SetPanelEvent('onmouseover', () => {
                    const _data = hero_talent_list[_id];
                    const level = _data ? _data.uc : 0;
                    ShowCustomTooltip(ChildTalentIcon, 'talent_tree', '', _id, level);
                });

                ChildTalentIcon.SetPanelEvent('onmouseout', () => {
                    HideCustomTooltip();
                });
            }

            const sub_count = ChildNodeList.GetChildCount();
            const ChildNodeHeader = TalentNode.FindChildTraverse('ChildNodeHeader')!;
            ChildNodeHeader.visible = sub_count > 0;
        }
    });

    GameEvents.SendCustomGameEventToServer('HeroTalentSystem', {
        event_name: 'GetSelectTalentData',
        params: {},
    });

    GameEvents.SendCustomGameEventToServer('HeroTalentSystem', {
        event_name: 'GetHeroTalentListData',
        params: {},
    });
};

(function () {
    // $.Msg("ability_upgrade")
    Init();
})();
