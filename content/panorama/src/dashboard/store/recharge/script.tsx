const RechargeStoreList = $('#RechargeStoreList');

const recharge_list = ['6', '30', '98', '198', '328', '648'];

export function Init() {
    RechargeStoreList.RemoveAndDeleteChildren();
    for (const recharge_index of recharge_list) {
        const rechargePanel = $.CreatePanel('Panel', RechargeStoreList, `${recharge_index}`) as RechargePanel;
        rechargePanel.RechargeItem = new RechargeItem(rechargePanel, recharge_index);
    }

    GameEvents.Subscribe('ServiceInterface_GetPlayerShoppingLimit', event => {
        const sc = event.data.sc ?? '';
        const sc_arr = sc.split('|');

        for (let i = 0; i < RechargeStoreList.GetChildCount(); i++) {
            const rowPanel = RechargeStoreList.GetChild(i) as RechargePanel;
            const row_id = rowPanel.id;
            const has_first = sc_arr.indexOf(row_id) == -1;
            // $.Msg(["has_first",has_first])
            rowPanel.SetHasClass('Double', has_first);
        }
    });

    GameUI.CustomUIConfig().SendCustomEvent('ServiceInterface', 'GetPlayerShoppingLimit', {});
}

interface RechargePanel extends Panel {
    RechargeItem: RechargeItem;
}

class RechargeItem {
    ContentPanel: Panel;
    StoreIcon: ImagePanel;
    StorePurchaseBtn: Panel;

    recharge_index: string;

    recharge_num: number;

    constructor(e: Panel, recharge_index: string) {
        e.BLoadLayoutSnippet('StoreItem');
        this.recharge_num = parseInt(recharge_index);
        this.ContentPanel = e;
        this.recharge_index = recharge_index;
        this.StoreIcon = e.FindChildTraverse('StoreIcon') as ImagePanel;
        this.StorePurchaseBtn = e.FindChildTraverse('StorePurchaseBtn')!;
        // price_cost
        this.ContentPanel.SetDialogVariable('price_cost', recharge_index);
        this.ContentPanel.SetDialogVariable('goods_name', `${parseInt(recharge_index) * 100} 铂金`);
        this.ContentPanel.SetDialogVariable('bonus_amount', `${parseInt(recharge_index) * 3000}`);

        this.StorePurchaseBtn.SetPanelEvent('onactivate', () => {
            GameUI.CustomUIConfig().Popups_Payment('-1', this.recharge_num);

            // GameUI.CustomUIConfig().ServerEventBus.publish("open_rmb_purchase", { id: "rechargers", recharge: this.recharge_num })
        });
    }

    SetPriceView(e: Panel, cost_str: string) {
        if (cost_str == '0_0') {
            e.SetDialogVariable('price_cost', 'Free');
        } else {
            const arr = cost_str.split('_');
            const price_type = arr[0];
            const price_cost = parseInt(arr[1]);
            e.SetDialogVariable('price_cost', '' + price_cost);
        }
    }
}

(() => {
    Init();
})();
