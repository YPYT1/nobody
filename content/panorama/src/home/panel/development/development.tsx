import { default as AttributeConst } from '../../../json/config/game/attribute_const.json';
import { default as AttributeSub } from '../../../json/config/game/attribute_sub.json';
import { ConvertAttributeToLabel } from '../../../utils/attribute_method';
import { HideCustomTooltip, ShowCustomTextTooltip } from '../../../utils/custom_tooltip';
import { FormatNumberToTime } from '../../../utils/method';
import { SetHotKey } from '../control/_move_controller';

const DevCustomAttributeList = $('#DevCustomAttributeList');
const attr_sub_key_list = Object.keys(AttributeSub);
/** 开发模块,开发模式下才会显示的一些信息 */
const MainPanel = $.GetContextPanel();

const UpMouseOffset = () => {
    const offset = GameUI.GetCursorPosition();
    MainPanel.SetDialogVariable('mouse_offset', `${offset.join(',')}`);
    $.Schedule(0.03, UpMouseOffset);
};

const StartLoop = () => {
    UpdateInGameTime();
    // UpdateUnitAngle();
    $.Schedule(0.1, StartLoop);
};

const UpdateUnitAngle = () => {
    // let map_center = [6144 ,6144 ,128];
    const hHero = Players.GetPlayerHeroEntityIndex(0);
    const vHero = Entities.GetForward(hHero);

    $.Msg(vHero);
};
const UpdateInGameTime = () => {
    const DotaGameTime = Game.GetDOTATime(false, false);
    const TimeLabel = FormatNumberToTime(DotaGameTime);
    MainPanel.SetDialogVariable('dota_time', TimeLabel.join(':'));

    // 属性更新
    const queryUnit = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());
    // $.Msg(["queryUnit", queryUnit])
    const netdata = CustomNetTables.GetTableValue('unit_attribute', `${queryUnit}`);
    if (netdata == null) {
        return;
    }
    const valueData = netdata.value;
    // $.Msg(valueData)
    const objectData = netdata.table;
    // $.Msg(JSON.stringify(netdata).length)
    for (const _attr in valueData) {
        const attr_key = _attr as AttributeMainKey;
        const RowPanel = DevCustomAttributeList.FindChildTraverse(attr_key);
        if (RowPanel) {
            const table = objectData[attr_key];
            const value = valueData[attr_key] ?? 0;
            RowPanel.SetDialogVariable('attr_value', ConvertAttributeToLabel(attr_key, value));
            RowPanel.Data<PanelDataObject>().table = table;
        }
    }
};

const OpenAttributePanel = () => {
    DevCustomAttributeList.ToggleClass('Show');
};

export const Initialize = () => {
    MainPanel.SetDialogVariable('dota_time', '0');
    MainPanel.SetHasClass('tools_mode', Game.IsInToolsMode());
    if (DevCustomAttributeList) {
        DevCustomAttributeList.RemoveAndDeleteChildren();

        for (const key in AttributeConst) {
            const RowPanel = $.CreatePanel('Panel', DevCustomAttributeList, key);
            RowPanel.BLoadLayoutSnippet('AttributeRow');
            RowPanel.SetDialogVariable('attr_name', $.Localize(`#custom_attribute_${key}`).replace('%', ''));
            RowPanel.SetDialogVariable('attr_value', `999999`);
            RowPanel.Data<PanelDataObject>().table = {};
            RowPanel.SetPanelEvent('onmouseover', () => {
                const row_attr_table = RowPanel.Data<PanelDataObject>().table;
                if (row_attr_table == null) {
                    for (const k in attr_sub_key_list) {
                        RowPanel.SetDialogVariable(k, '0');
                    }
                } else {
                    for (const k in row_attr_table) {
                        const value = row_attr_table[k as keyof typeof row_attr_table] ?? 0;
                        RowPanel.SetDialogVariable(k, `${parseFloat(value)}`);
                    }
                }
                ShowCustomTextTooltip(RowPanel, '属性加成', '#custom_text_attr_bonus');
            });

            RowPanel.SetPanelEvent('onmouseout', () => {
                HideCustomTooltip();
            });
        }
    }

    GameEvents.Subscribe('MapChapter_GetGameSelectPhase', event => {
        const data = event.data;
        const game_select_phase = data.game_select_phase;
        MainPanel.SetDialogVariableInt('game_phase', data.game_select_phase);
    });

    SetHotKey('`', OpenAttributePanel);
    StartLoop();
    if (Game.IsInToolsMode()) {
        UpMouseOffset();
    }
};

function _flattenArrayOfTuples(arrOfTuples: number[][]) {
    const retVal: number[] = [];
    arrOfTuples.forEach(t => retVal.push(t[0]) && retVal.push(t[1]));
    return retVal;
}

(function () {
    Initialize();
})();
