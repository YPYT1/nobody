const ServerShopList = GameUI.CustomUIConfig().KvData.server_shop_list;
const ServerItemList = GameUI.CustomUIConfig().KvData.ServerItemList;
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;

declare global {
    interface CustomUIConfig {
        SetStoreItemPanel(parent: Panel, goods_id: string): StoreItemPanel;
    }

    interface CDOTA_PanoramaScript_GameUI {
        SetStoreItemPanel(parent: Panel, goods_id: string): StoreItemPanel;
    }
}

interface StoreItemPanel extends Panel {
    StoreItem: StoreItem;
}

class StoreItem {
    ContentPanel: Panel;
    StoreIcon: ImagePanel;
    StorePurchaseBtn: Panel;

    g_limit_max: number;
    g_goods_id: string;
    rare_list = [1, 2, 3, 4, 5, 6, 7];

    constructor(e: Panel, goods_id: string) {
        e.BLoadLayoutSnippet('StoreItem');
        this.ContentPanel = e;
        this.g_goods_id = goods_id;
        this.g_limit_max = 0;
        this.StoreIcon = e.FindChildTraverse('StoreIcon') as ImagePanel;
        this.StorePurchaseBtn = e.FindChildTraverse('StorePurchaseBtn')!;
        this._SetGoodsId(goods_id);

        GameUI.CustomUIConfig().ServerEventBus.subscribe('shoping_limit_update', data => {
            if (data[this.g_goods_id] == null) {
                return;
            }
            const count = data[this.g_goods_id].c ?? 0;
            const MainPanel = this.ContentPanel;
            MainPanel.SetDialogVariable('count', '' + count);
            this._SetLimitCount(count);
        });
    }

    _SetGoodsId = (goods_id: string | number) => {
        const MainPanel = this.ContentPanel;
        const OriginalPanel = MainPanel.FindChildTraverse('OriginalPanel')!;
        const ActualPanel = MainPanel.FindChildTraverse('ActualPanel')!;
        const CurrencyIcon = MainPanel.FindChildTraverse('CurrencyIcon') as ImagePanel;

        const g_goods_id = '' + goods_id;
        const data = ServerShopList[g_goods_id as keyof typeof ServerShopList];
        MainPanel.Data<PanelDataObject>().goods_id = g_goods_id;
        // @ts-ignore
        MainPanel.Data<PanelDataObject>().filter = data.filter ?? -1;
        const goods_name = $.Localize('#custom_text_goods_' + g_goods_id);
        MainPanel.SetDialogVariable('goods_name', goods_name);
        MainPanel.SetDialogVariable('limit_type', '');
        MainPanel.SetDialogVariableInt('limit_count', 0);
        MainPanel.Data<PanelDataObject>().limit_count = 0;
        if (data) {
            const rarity = data.rarity;
            for (const rare of this.rare_list) {
                MainPanel.SetHasClass(`rare_${rare}`, rarity == rare);
            }
            MainPanel.Data<PanelDataObject>().rarity = rarity;

            const cost_arr = data.cost.split('_');
            const cost_type = cost_arr[0];
            CurrencyIcon.SetHasClass('is_rmb', cost_type == 'rmb');
            GameUI.CustomUIConfig().SetServerImagePanel(CurrencyIcon, cost_type);
            // 售价
            this.SetPriceView(OriginalPanel, data.original_cost);
            this.SetPriceView(ActualPanel, data.cost);
            // @ts-ignore
            let texture_name = data.AbilityTextureName ?? '';
            if (texture_name == 'null') {
                const item_id = '' + data.item_id;
                const item_data = ServerItemList[item_id as keyof typeof ServerItemList];
                texture_name = item_data.AbilityTextureName ?? '';
            }
            const image_src = GetTextureSrc(texture_name);
            this.StoreIcon.SetImage(image_src);

            // 热卖
            const is_hot = data.is_hot == 1;
            MainPanel.SetHasClass('is_hot', is_hot);

            // 折扣
            const discount = data.discount;
            MainPanel.SetHasClass('is_discount', discount != 10);
            MainPanel.SetDialogVariableInt('discount', discount);

            // 限购
            const purchase_limitation = data.purchase_limitation;
            this.g_limit_max = purchase_limitation;
            MainPanel.SetDialogVariableInt('limit_max', purchase_limitation);
            const purchase_str = data.purchase_limitation_time;
            MainPanel.SetHasClass('limit_purchase', purchase_str != 'N_0');
            const purchase_arr = purchase_str.split('_');
            const purchase_type = purchase_arr[0];
            const purchase_count = parseInt(purchase_arr[1] ?? '0');
            if (purchase_type == 'D') {
                if (purchase_count == 1) {
                    MainPanel.SetDialogVariable('limit_type', '每日');
                } else {
                    MainPanel.SetDialogVariable('limit_type', purchase_count + '日');
                }
            } else if (purchase_type == 'XG') {
                MainPanel.SetDialogVariable('limit_type', '终身');
            }

            this.StorePurchaseBtn.SetPanelEvent('onactivate', () => {
                if (cost_type == 'rmb') {
                    // GameUI.CustomUIConfig().ServerEventBus.publish("open_rmb_purchase", { id: "" + goods_id })
                    GameUI.CustomUIConfig().Popups_Payment('' + goods_id);
                } else {
                    // $.Msg(["Popups_StorePurchase",goods_id])
                    GameUI.CustomUIConfig().Popups_StorePurchase('' + goods_id);
                    // const limit_count = MainPanel.Data<PanelDataObject>().limit_count as number;
                    // GameUI.CustomUIConfig().ServerEventBus.publish("open_store_purchase", { id: "" + goods_id })
                }
            });
        } else {
            this.StoreIcon.SetImage('');
        }
    };

    SetPriceView(e: Panel, cost_str: string) {
        if (cost_str == '0_0') {
            e.SetDialogVariable('price_cost', 'Free');
        } else {
            const arr = cost_str.split('_');
            const price_type = arr[0];
            const price_cost = parseInt(arr[1]);

            // let CurrencyIcon = e.FindChildTraverse("CurrencyIcon") as ImagePanel;

            e.SetDialogVariable('price_cost', '' + price_cost);
        }
    }

    _SetLimitCount(count: number) {
        const MainPanel = this.ContentPanel;
        MainPanel.SetDialogVariableInt('limit_count', count);
        MainPanel.Data<PanelDataObject>().limit_count = count;
        const is_purchased = this.g_limit_max == count;
        MainPanel.SetHasClass('is_purchased', is_purchased);
        this.StorePurchaseBtn.enabled = !is_purchased;
    }
}

export function SetStoreItemPanel(parent: Panel, goods_id: string) {
    const e = $.CreatePanel('Panel', parent, goods_id);

    const e2 = e as StoreItemPanel;
    e2.StoreItem = new StoreItem(e, goods_id);
    return e2;
}
