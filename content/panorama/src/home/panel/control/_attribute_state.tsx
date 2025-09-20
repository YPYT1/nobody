import { AttributeIsPercent, ConvertAttributeToLabel } from '../../../utils/attribute_method';
const AttributeTooltip = $('#AttributeTooltip');
const HeroInfoBtn = $('#HeroInfoBtn') as Button;
const HeroAttributeContainer = $('#HeroAttributeContainer');
const BaseAttributeList = $('#BaseAttributeList');
const AdvAttributeList = $('#AdvAttributeList');
const base_attribute_list: AttributeMainKey[] = [
    'MaxHealth',
    'MaxMana',
    'AttackDamage',
    'AttackSpeed',
    'AttackRange',
    'PhyicalArmor',
    'MoveSpeed',
    'AbilityHaste',
];

const adv_attribute_list: AttributeMainKey[] = [
    'CriticalChance',
    'CriticalDamage',
    'PickItemRadius',
    'DamageBonusMul',
    'FinalDamageMul',
    'AllElementDamageBonus',
    'AllElementPent',
    'AllElementResist',
];

const Attributelist: AttributeMainKey[] = ['AttackDamage', 'PhyicalArmor', 'MoveSpeed'];

const AttributeRowsList: { [key in AttributeMainKey]?: Panel } = {};

/** 护甲减伤公式 */
const PhyicalArmorDmgReduction = (PhyicalArmor: number) => {
    return PhyicalArmor / (100 + Math.abs(PhyicalArmor));
};

const StartUpdateData = () => {
    UpdataAttributeData();
    $.Schedule(1, StartUpdateData);
};

const UpdataAttributeData = () => {
    const MainPanel = $.GetContextPanel();
    const AttributeState = MainPanel.FindChildTraverse('AttributeState');
    const queryUnit = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());
    //Players.GetLocalPlayerPortraitUnit();
    if (AttributeState) {
        AttributeState.SetDialogVariableInt('level', Entities.GetLevel(queryUnit));
    }

    const netdata = CustomNetTables.GetTableValue('unit_attribute', `${queryUnit}`);
    if (netdata == null) {
        return;
    }
    // 扩展数据
    const value = netdata.value;
    const table = netdata.table;

    for (const _key in AttributeRowsList) {
        const attr_key = _key as AttributeMainKey;
        const attrPanel = AttributeRowsList[attr_key];
        if (attrPanel) {
            attrPanel.SetDialogVariable('attr_value', ConvertAttributeToLabel(attr_key, value[attr_key]));
        }
    }

    for (const _attr in value) {
        const attr_key = _attr as AttributeMainKey;
        const attr_value = Math.floor(value[attr_key] ?? 0);
        const PanelAttributeRow = HeroAttributeContainer.FindChildTraverse(attr_key);
        if (PanelAttributeRow) {
            PanelAttributeRow.SetDialogVariable('stat_value', ConvertAttributeToLabel(attr_key, attr_value));
        }
        const sign = AttributeIsPercent(_attr as AttributeMainKey) ? '%' : '';
        HeroAttributeContainer.SetDialogVariable(_attr, "<span class='bonus'>" + attr_value + sign + '</span>');
    }

    const aps = Entities.GetAttacksPerSecond(queryUnit);
    HeroAttributeContainer.SetDialogVariable('APS', "<span class='bonus'>" + (1 / aps).toFixed(2) + '</span>');
    // 护甲减伤
    const armor_reduction = Math.floor(PhyicalArmorDmgReduction(value.PhyicalArmor ?? 0) * 100);
    HeroAttributeContainer.SetDialogVariable('ArmorReduction', "<span class='bonus'>" + armor_reduction + '%</span>');

    // $.Msg(["Update nettable"])
    for (const _attr in table) {
        const row_data = table[_attr as keyof typeof table];

        for (const row_key in row_data) {
            const _value = row_data[row_key as keyof typeof row_data] ?? 0;
            const dialog_key = _attr + '.' + row_key;
            let sign = AttributeIsPercent(_attr as AttributeMainKey) ? '%' : '';
            if (row_key == 'Bonus') {
                const attr_value = Math.floor((value[_attr as AttributeMainKey] ?? 0) - (row_data.Base ?? 0));
                HeroAttributeContainer.SetDialogVariable(dialog_key, "<span class='bonus'>" + attr_value + sign + '</span>');
            } else {
                if (row_key == 'BasePercent' || row_key == 'BonusPercent' || row_key == 'TotalPercent') {
                    sign = '%';
                }

                HeroAttributeContainer.SetDialogVariable(dialog_key, "<span class='bonus'>" + _value + sign + '</span>');
            }
        }
    }
};

export const CreatePanel_AttributeState = () => {
    const MainPanel = $.GetContextPanel();
    const AttributeState = MainPanel.FindChildTraverse('AttributeState');
    if (AttributeState == null) {
        $.Schedule(0.3, CreatePanel_AttributeState);
        return;
    }

    const queryUnit = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());
    AttributeState.SetDialogVariableInt('level', Entities.GetLevel(queryUnit));
    const UnitAttribute = AttributeState.FindChildTraverse('UnitAttribute');
    if (UnitAttribute) {
        UnitAttribute.RemoveAndDeleteChildren();
        for (const attr_key of Attributelist) {
            const AttributeRows = $.CreatePanel('Panel', UnitAttribute, attr_key);
            AttributeRows.BLoadLayoutSnippet('HudAttributeRow');
            AttributeRows.SetDialogVariable('attr_value', '0');
            AttributeRowsList[attr_key] = AttributeRows;
        }
    }

    UpdataAttributeData();
    StartUpdateData();
};

const InitHeroDetailsPanel = () => {
    BaseAttributeList.RemoveAndDeleteChildren();
    for (const _attr of base_attribute_list) {
        const PanelAttributeRow = $.CreatePanel('Panel', BaseAttributeList, _attr);
        PanelAttributeRow.BLoadLayoutSnippet('PanelAttributeRow');
        PanelAttributeRow.SetDialogVariable('stat_label', $.Localize(`#custom_attribute_${_attr}`).replace('%', ''));
        PanelAttributeRow.SetDialogVariable('stat_value', ConvertAttributeToLabel(_attr, 0));

        SetAttributePanelEvent(PanelAttributeRow, _attr);
    }

    AdvAttributeList.RemoveAndDeleteChildren();
    for (const _attr of adv_attribute_list) {
        const PanelAttributeRow = $.CreatePanel('Panel', AdvAttributeList, _attr);
        PanelAttributeRow.BLoadLayoutSnippet('PanelAttributeRow');
        PanelAttributeRow.SetDialogVariable('stat_label', $.Localize(`#custom_attribute_${_attr}`).replace('%', ''));
        PanelAttributeRow.SetDialogVariable('stat_value', ConvertAttributeToLabel(_attr, 0));

        SetAttributePanelEvent(PanelAttributeRow, _attr);
    }

    HeroInfoBtn.SetPanelEvent('onactivate', () => {
        HeroAttributeContainer.ToggleClass('Open');
    });

    CreatePanel_AttributeState();
};

function SetAttributePanelEvent(PanelAttributeRow: Panel, _attr: string) {
    PanelAttributeRow.SetPanelEvent('onmouseover', () => {
        const offset = PanelAttributeRow.GetPositionWithinWindow();
        const ScreenHeight = Game.GetScreenHeight();
        AttributeTooltip.AddClass('Show');
        let attr_tips_label = $.Localize(`#custom_attribute_${_attr}_tooltips`, HeroAttributeContainer);
        attr_tips_label = attr_tips_label.replaceAll('\n', '<br>');
        AttributeTooltip.SetDialogVariable('attr_tips', attr_tips_label);
        AttributeTooltip.style.marginBottom = `${ScreenHeight - offset.y + 64}px`;
        AttributeTooltip.style.marginLeft = `${offset.x}px`;
    });

    PanelAttributeRow.SetPanelEvent('onmouseout', () => {
        AttributeTooltip.RemoveClass('Show');
    });
}
(function () {
    InitHeroDetailsPanel();
})();
