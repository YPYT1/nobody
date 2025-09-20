import { LoadCustomComponent } from '../../dashboard/_components/component_manager';

const MainPanel = $.GetContextPanel();

const ItemList = $('#ItemList');

export const Init = () => {
    MainPanel.SetHasClass('Show', false);
    MainPanel.Data<PanelDataObject>().state = 0;

    MainPanel.SetPanelEvent('onactivate', () => {
        // $.Msg(["MainPanel onactivate"])
        const state = MainPanel.Data<PanelDataObject>().state;
        // $.Msg(["state", state])
        if (state == 1) {
            MainPanel.SetHasClass('Show', false);

            $.Schedule(0.1, () => {
                ClearItemListPanel();
            });
        }
    });

    ItemList.RemoveAndDeleteChildren();
    for (let i = 0; i < 10; i++) {
        const _ = $.CreatePanel('Panel', ItemList, '');
        _.BLoadLayoutSnippet('ResultItem');
        _.SetHasClass('is_odd', i % 2 == 0);
        const _ServerItem = _.FindChildTraverse('ServerItem')!;
        const ServerItem = LoadCustomComponent(_ServerItem, 'server_item');
        ServerItem._SetServerItemInfo({ show_count: false, show_tips: true });

        const _ConverServerItem = _.FindChildTraverse('ConverServerItem')!;
        const ConverServerItem = LoadCustomComponent(_ConverServerItem, 'server_item');
        ConverServerItem._SetServerItemInfo({ show_count: false, show_tips: true });
        _.SetDialogVariable('conver_item_count', '99999999');
        _.SetDialogVariable('item_count', '99999999');
        _.SetDialogVariable('item_name', '物品名字');
        _.visible = false;
    }

    // $.Msg(["Subscribe ServiceInterface_GetPlayerServerDrawLottery"])
    GameEvents.Subscribe('ServiceInterface_GetPlayerServerDrawLottery', event => {
        const list_data = Object.values(event.data);
        MainPanel.Data<PanelDataObject>().state = 0;
        GenerateGachaResult(list_data);
        $.Schedule(1, () => {
            if (MainPanel.BHasClass('Show')) {
                MainPanel.Data<PanelDataObject>().state = 1;
            }
        });
    });

    // GenerateGachaResult(testdata)
};

function GenerateGachaResult(list_data: AM2_Draw_Lottery_Data[]) {
    GameUI.CustomUIConfig().EventBus.publish('popup_loading', { show: false });
    ClearItemListPanel();
    for (let i = 0; i < ItemList.GetChildCount(); i++) {
        const rowPanel = ItemList.GetChild(i)!;
        rowPanel.visible = false;
        rowPanel.RemoveClass('Play');
    }

    for (let i = 0; i < list_data.length; i++) {
        const _data = list_data[i];
        const rowPanel = ItemList.GetChild(i)!;
        rowPanel.visible = true;
        rowPanel.AddClass('rare_' + _data.q);

        if (_data.r) {
            rowPanel.AddClass('Conver');
            // 实际奖品
            const rdata = _data.r;
            for (const _id in rdata) {
                const ServerItem = rowPanel.FindChildTraverse('ServerItem') as Component_ServerItem;
                ServerItem._SetItemId(_id);
                rowPanel.SetDialogVariable('item_count', '' + rdata[_id]);
                break;
            }

            // 原本物品
            const ConverServerItem = rowPanel.FindChildTraverse('ConverServerItem') as Component_ServerItem;
            ConverServerItem._SetItemId(_data.i);
            rowPanel.SetDialogVariable('conver_item_count', '' + _data.n);
        } else {
            const ServerItem = rowPanel.FindChildTraverse('ServerItem') as Component_ServerItem;
            ServerItem._SetItemId(_data.i);
            rowPanel.SetDialogVariable('item_count', '' + _data.n);
        }

        rowPanel.SetDialogVariable('item_name', $.Localize('#custom_serveritem_' + _data.i));
        rowPanel.AddClass('Play');
    }

    MainPanel.SetHasClass('Show', true);
}

function ClearItemListPanel() {
    for (let i = 0; i < ItemList.GetChildCount(); i++) {
        const rowPanel = ItemList.GetChild(i)!;
        rowPanel.RemoveClass('Conver');
        rowPanel.RemoveClass('Play');
        for (let r = 1; r <= 6; r++) {
            rowPanel.RemoveClass('rare_' + r);
        }
    }
}
(() => {
    Init();
})();
