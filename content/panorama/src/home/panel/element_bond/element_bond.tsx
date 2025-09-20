import { HideCustomTooltip, ShowCustomTooltip } from '../../../utils/custom_tooltip';

const MainPanel = $.GetContextPanel();
const element_enum_label: CElementType[] = ['fire', 'ice', 'thunder', 'wind', 'light', 'dark'];

export const Init = () => {
    MainPanel.RemoveAndDeleteChildren();
    for (let i = 0; i < 6; i++) {
        const element_id = element_enum_label[i];
        const ElementSynergy = $.CreatePanel('Panel', MainPanel, element_id);
        ElementSynergy.BLoadLayoutSnippet('ElementSynergy');
        ElementSynergy.SetDialogVariableInt('current_count', 0);
        ElementSynergy.Data<PanelDataObject>().element_count = 0;

        ElementSynergy.SetPanelEvent('onmouseover', () => {
            const element_count = ElementSynergy.Data<PanelDataObject>().element_count as number;
            ShowCustomTooltip(ElementSynergy, 'element_syenrgy', '', -1, i + 1, element_count);
        });

        ElementSynergy.SetPanelEvent('onmouseout', () => {
            HideCustomTooltip();
        });
    }

    GameEvents.Subscribe('NewArmsEvolution_GetArmssElementBondDateList', event => {
        const data = event.data;
        const element_obj = data.Element;

        for (const key in element_obj) {
            if (key == '0') {
                continue;
            }
            const key_index = parseInt(key);
            const index = parseInt(key) - 1;
            const element_id = element_enum_label[index];
            const element_count = element_obj[key_index as keyof typeof element_obj];
            const elementPanel = MainPanel.FindChildTraverse(element_id)!;
            elementPanel.SetHasClass('Enabled', element_count >= 2);
            elementPanel.SetHasClass('Show', element_count > 0);
            elementPanel.SetDialogVariableInt('current_count', element_count);
            elementPanel.Data<PanelDataObject>().element_count = element_count;
        }
    });

    GameEvents.SendCustomGameEventToServer('NewArmsEvolution', {
        event_name: 'GetArmssElementBondDateList',
        params: {},
    });
};

(function () {
    // Init()
})();
