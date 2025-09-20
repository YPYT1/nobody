import { LoadCustomComponent } from '../../dashboard/_components/component_manager';

const MainPanel = $.GetContextPanel();

const ItemList = $('#ItemList');

export const Init = () => {
    ItemList.RemoveAndDeleteChildren();
    for (let i = 0; i < 10; i++) {
        const _ = $.CreatePanel('Panel', ItemList, '');
        const ServerItem = LoadCustomComponent(_, 'server_item');
        ServerItem._SetServerItemInfo({ show_count: true, show_tips: true });
        ServerItem.visible = false;
    }

    MainPanel.SetPanelEvent('onactivate', () => {
        MainPanel.SetHasClass('Show', false);
    });

    GameEvents.Subscribe('ServiceInterface_GetServerItemPopUp', event => {
        GameUI.CustomUIConfig().EventBus.publish('popup_loading', { show: false });
        // $.Msg(["ServiceInterface_GetServerItemPopUp"]);
        // $.Msg(event.data)
        const items = Object.values(event.data.items ?? {});
        // $.Msg([items.length])
        if (items.length <= 0) {
            return;
        }
        for (let i = 0; i < ItemList.GetChildCount(); i++) {
            const rowPanel = ItemList.GetChild(i)!;
            rowPanel.visible = false;
        }
        for (let i = 0; i < items.length; i++) {
            const ServerItem = ItemList.GetChild(i) as Component_ServerItem;
            ServerItem.visible = true;
            const item_id = items[i].item_id;
            const item_count = items[i].number;
            ServerItem._SetItemId(item_id);
            ServerItem._SetCount(item_count);
        }

        MainPanel.SetHasClass('Show', true);
    });
};

(() => {
    Init();
})();
