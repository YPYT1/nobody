import { LoadCustomComponent } from '../../_components/component_manager';

const server_soul_attr = GameUI.CustomUIConfig().KvData.server_soul_attr;
const CheckAttrIsPercent = GameUI.CustomUIConfig().CheckAttrIsPercent;

const DeltetConfirmBtn = $('#DeltetConfirmBtn');
const DeltetCancelBtn = $('#DeltetCancelBtn');
const DeltetSoulStonePopups = $('#DeltetSoulStonePopups');
const DeleteGiveItemList = $('#DeleteGiveItemList');
export function Init() {
    InitButton();

    DeleteGiveItemList.RemoveAndDeleteChildren();
    for (let i = 0; i < 6; i++) {
        const _ = $.CreatePanel('Panel', DeleteGiveItemList, '');
        const itemPanel = LoadCustomComponent(_, 'server_item');
        itemPanel._SetServerItemInfo({ show_tips: true, show_count: true });
        itemPanel.visible = false;
    }

    GameEvents.Subscribe('ServiceSoul_DeforehandSoulDelete', event => {
        DeltetSoulStonePopups.visible = true;
        const del_attr = DeltetSoulStonePopups.Data<PanelDataObject>().del_attr as CGEDGetSoulListData;
        const key = del_attr.k;
        const attr_data = server_soul_attr[key as keyof typeof server_soul_attr];
        const MainProperty = attr_data.MainProperty as AttributeMainKey;
        const TypeProperty = attr_data.TypeProperty as AttributeSubKey;
        const pct_symbol = CheckAttrIsPercent(MainProperty, TypeProperty) ? '%' : '';
        const level = del_attr.l;
        const attr_name = `${$.Localize(`#custom_attribute_${MainProperty}`).replace('%', '')}`;
        const fixed_num = attr_data.float;
        DeltetSoulStonePopups.SetDialogVariable('popup_ss_name', `Lv.${level}${attr_name}`);
        DeltetSoulStonePopups.SetDialogVariable('popup_ss_attr', `${del_attr.v.toFixed(fixed_num)}${pct_symbol}`);

        const data = event.data;
        for (let i = 0; i < DeleteGiveItemList.GetChildCount(); i++) {
            const rowPanel = DeleteGiveItemList.GetChild(i)!;
            rowPanel.visible = false;
        }

        let index = 0;
        const item_list = data.itemsdata.list;
        for (const item_id in item_list) {
            const count = item_list[item_id];
            const rowPanel = DeleteGiveItemList.GetChild(index) as Component_ServerItem;
            rowPanel.visible = true;
            rowPanel._SetItemId(item_id);
            rowPanel._SetCount(count);
            index++;
        }

        DeltetSoulStonePopups.SetDialogVariableInt('give_ratio', data.itemsdata.pro);
    });
}

function InitButton() {
    DeltetCancelBtn.SetPanelEvent('onactivate', () => {
        DeltetSoulStonePopups.visible = false;
    });

    DeltetConfirmBtn.SetPanelEvent('onactivate', () => {
        DeltetSoulStonePopups.visible = false;
        const params = DeltetSoulStonePopups.Data<PanelDataObject>().params as CGED['ServiceSoul']['SoulDelete'];
        GameEvents.SendCustomGameEventToServer('ServiceSoul', {
            event_name: 'SoulDelete',
            params: params,
        });
    });
}
(() => {
    Init();
})();
