import { GetTextureSrc } from '../../common/custom_kv_method';
import { SetLabelDescriptionExtra } from '../../utils/ability_description';
import { default as RuneConfig } from './../../json/config/game/rune/rune_config.json';

const MainPanel = $.GetContextPanel();
const RuneAttrList = $('#RuneAttrList');
const getStorage = GameUI.CustomUIConfig().getStorage;
const ConverAttrAndValueLabel = GameUI.CustomUIConfig().ConverAttrAndValueLabel;

const RuneAttrConfig = GameUI.CustomUIConfig().KvData.RuneAttrConfig;

export function Init() {
    const m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
    $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
    $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
    m_TooltipPanel.FindChild('TopArrow')!.visible = false;
    m_TooltipPanel.FindChild('BottomArrow')!.visible = false;

    MainPanel.SetPanelEvent('ontooltiploaded', () => {
        const index = $.GetContextPanel().GetAttributeInt('level', 0);
        const name = $.GetContextPanel().GetAttributeString('name', '');
        const Data = RuneConfig[name as keyof typeof RuneConfig];
        const rarity = Data.item_level_section[index];
        const Image = $('#Image') as ImagePanel;
        const textrue = Data.AbilityTextureName;
        Image.SetImage(GetTextureSrc(textrue));

        for (let r = 1; r <= 7; r++) {
            MainPanel.SetHasClass('rare_' + r, rarity == r);
        }
        MainPanel.SetDialogVariable('title', $.Localize(`#custom_${name}`));

        const ObjectValues = Data.ObjectValues;
        const AbilityValues = Data.AbilityValues;

        const rune_desc = SetLabelDescriptionExtra($.Localize(`#custom_${name}_Description`), index, AbilityValues, ObjectValues);
        MainPanel.SetDialogVariable('desc', rune_desc);
        // MainPanel.SetDialogVariable("desc", $.Localize(`#custom_${name}_Description`))
        // SetAbilityBaseInfo(name, entityIndex)

        RuneAttrList.RemoveAndDeleteChildren();
        const rune_key = (name + '_attr') as '__rune_attr';
        const attr_list = getStorage(rune_key);
        for (const attr_id in attr_list) {
            const attr_config = RuneAttrConfig[attr_id as keyof typeof RuneAttrConfig];
            const attr_name = $.Localize(`#custom_attribute_${attr_config.AttrName}`).replace('%', '');
            const attr_value = attr_list[attr_id];
            const attr_value_label = ConverAttrAndValueLabel(attr_config.AttrName, attr_value, attr_config.Decimal);
            let attr_rare = 0;
            if (attr_value < attr_config.r_5) {
                attr_rare = 4;
            } else if (attr_value < attr_config.r_6) {
                attr_rare = 5;
            } else {
                attr_rare = 6;
            }
            const RuneAttrRows = $.CreatePanel('Panel', RuneAttrList, '');
            RuneAttrRows.BLoadLayoutSnippet('RuneAttrRows');
            RuneAttrRows.SetHasClass('rare_' + attr_rare, true);
            RuneAttrRows.SetDialogVariable('rune_attr', `${attr_name}+${attr_value_label}`);
            // attr_label.push(`${attr_name}+${attr_value_label}`)
        }
    });
}

(function () {
    Init();
})();
