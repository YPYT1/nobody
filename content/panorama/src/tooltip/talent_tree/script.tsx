import { GetTextureSrc } from '../../common/custom_kv_method';
import { default as talent_tree } from '../../json/config/game/hero/talent_tree/talent_tree_config.json';
import { SetLabelDescriptionExtra } from '../../utils/ability_description';
import { FormatDescription } from '../../utils/method';
import { default as AbilityTypesJson } from './../../json/config/game/const/ability_types.json';

const MainPanel = $.GetContextPanel();
// let TalentIcon = $("#TalentIcon") as ImagePanel;
const ExtraElement = $('#ExtraElement');
const ExtraTypes = $('#ExtraTypes');
const TypesLabel = $('#TypesLabel');

export function Init() {
    const m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
    $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
    $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
    m_TooltipPanel.FindChild('TopArrow')!.visible = false;
    m_TooltipPanel.FindChild('BottomArrow')!.visible = false;

    $.GetContextPanel().SetPanelEvent('ontooltiploaded', () => {
        UpdateTooltip();
    });

    CustomNetTables.SubscribeNetTableListener('hero_talent', PlayerTalentUpdateCallback);
}

function UpdateTalentTootipDesc(hero: string, key: string, level: number) {
    const talent_data = talent_tree[key as '1'];
    // $.Msg(["talent_data",key,talent_data])
    const img = talent_data.img;
    const AbilityValues = talent_data.AbilityValues;
    const ObjectValues = talent_data.ObjectValues;
    MainPanel.SetDialogVariableInt('max', talent_data.max_number);
    MainPanel.SetDialogVariableInt('level', level);
    const talent_name = $.Localize(`#custom_talent_${key}`);
    MainPanel.SetDialogVariable('talent_name', talent_name);
    const talent_desc = $.Localize(`#custom_talent_${key}_desc`);
    let description_txt = SetLabelDescriptionExtra(talent_desc, level - 1, AbilityValues, ObjectValues, true);

    const description_lv2 = $.Localize(`#custom_talent_${key}_desc_lv2`);
    if (description_lv2.indexOf('#') != 0) {
        const is_act = level >= 1;
        const desc_lv2 = SetLabelDescriptionExtra(description_lv2, 2, AbilityValues, ObjectValues, true);
        description_txt += `<br><br><span class="${is_act ? 'on' : 'off'}">新增: ${desc_lv2}</span>`;
    }

    MainPanel.SetDialogVariable('talent_desc', description_txt);
    // 风格
    MainPanel.SetHasClass('IsAbility', talent_data.is_ability == 1);
    // extra
    const has_element = talent_data.mark_element;
    ExtraElement.SetHasClass('Show', has_element > 0 && level == 0);
    for (let i = 1; i <= 6; i++) {
        ExtraElement.SetHasClass('element_' + i, has_element == i);
    }
    const has_newTypes = talent_data.mark_types != 'Null';
    const types_value = talent_data.mark_types;
    ExtraTypes.SetHasClass('Show', has_newTypes && level == 0);

    // TypesLabel.SetHasClass("Show",true)
    for (const type_key in AbilityTypesJson) {
        TypesLabel.SetHasClass(type_key, types_value == type_key);
        if (types_value == type_key) {
            TypesLabel.SetDialogVariable('type_label', $.Localize('#custom_ability_type_' + type_key));
        }
    }

    // 天赋类型
}
function PlayerTalentUpdateCallback<TName extends keyof CustomNetTableDeclarations, T extends CustomNetTableDeclarations['hero_talent']>(
    tableName: TName,
    key: keyof T,
    value: NetworkedData<T[keyof T]>
) {
    const unit = Players.GetLocalPlayerPortraitUnit();
    const player_id = Entities.GetPlayerOwnerID(unit);
    if (player_id == key) {
        const hero = MainPanel.Data<PanelDataObject>().hero as string;
        const talent_index = MainPanel.Data<PanelDataObject>().key as string;
        const row_data = value[talent_index];
        if (row_data == null) {
            return;
        }
        const level = row_data.uc;
        UpdateTalentTootipDesc(hero, talent_index, level);
    }
}

function UpdateTooltip() {
    const hero = MainPanel.GetAttributeString('hero', '');
    const key = MainPanel.GetAttributeString('key', '1');
    const level = MainPanel.GetAttributeInt('level', 0);

    // $.Msg([hero,key,level])
    MainPanel.Data<PanelDataObject>().hero = hero;
    MainPanel.Data<PanelDataObject>().key = key;
    UpdateTalentTootipDesc(hero, key, level);
}

(function () {
    Init();
})();
