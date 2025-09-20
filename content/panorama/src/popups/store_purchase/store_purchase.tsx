import { GetTextureSrc } from '../../common/custom_kv_method';
import { LoadCustomComponent } from '../../dashboard/_components/component_manager';

const MainPanel = $.GetContextPanel();
const ServerShopList = GameUI.CustomUIConfig().KvData.server_shop_list;
const ServerItemList = GameUI.CustomUIConfig().KvData.ServerItemList;

const MultipleItemList = $('#MultipleItemList');

const CancelButton = $('#CancelButton');
const ConfirmButton = $('#ConfirmButton');
const StoreIcon = $('#StoreIcon') as ImagePanel;
const StoreCountSlider = $('#StoreCountSlider') as SliderPanel & Panel;

const CurrencyIcon = LoadCustomComponent($('#CurrencyIcon'), 'server_item');
CurrencyIcon._SetServerItemInfo({ hide_bg: true, show_count: false, show_tips: true });

let g_goods_id = '';
let g_goods_count = 0;
/** 原始单价 */
let g_original_price = 0;
/** 实际单价 */
let g_actual_price = 0;

let g_item_object: { [x: string]: number } = {};

let g_my_price = 0;

export const Init = () => {
    // MainPanel.SetPanelEvent('onload', () => {
    //     MainPanel.SetHasClass("Show", true);
    // })

    MultipleItemList.RemoveAndDeleteChildren();
    for (let i = 0; i < 10; i++) {
        const MultipleItemRows = $.CreatePanel('Panel', MultipleItemList, '');
        MultipleItemRows.BLoadLayoutSnippet('MultipleItemRows');
        const _ = MultipleItemRows.FindChildTraverse('ServerItem')!;
        const ServerItem = LoadCustomComponent(_, 'server_item');
        ServerItem._SetServerItemInfo({ show_count: false, show_tips: true });
    }

    CancelButton.SetPanelEvent('onactivate', () => {
        MainPanel.SetHasClass('Show', false);
        $.DispatchEvent('UIPopupButtonClicked', $.GetContextPanel());
    });

    // GameUI.CustomUIConfig().ServerEventBus.clear("open_store_purchase");
    MainPanel.SetPanelEvent('onload', () => {
        // GameUI.CustomUIConfig().ServerEventBus.subscribe("open_store_purchase", event => {
        MainPanel.SetHasClass('Show', true);
        // let goods_id = event.id;
        const goods_id = $.GetContextPanel().GetAttributeString('id', '');
        g_goods_id = goods_id;
        const data = ServerShopList[goods_id as keyof typeof ServerShopList];
        const goods_name = $.Localize('#custom_text_goods_' + goods_id);
        const goods_desc = $.Localize('#custom_text_goods_' + goods_id + '_desc').replaceAll('\n', '<br>');
        // $.Msg(["goods_desc",goods_desc])
        MainPanel.SetDialogVariable('goods_name', goods_name);
        MainPanel.SetDialogVariable('goods_desc', goods_desc);

        //@ts-ignore
        let texture_name = data.AbilityTextureName ?? 'null';
        if (texture_name == 'null') {
            const item_id = '' + data.item_id;
            const item_data = ServerItemList[item_id as keyof typeof ServerItemList];
            texture_name = item_data.AbilityTextureName ?? '';
        }
        const image_src = GetTextureSrc(texture_name);
        StoreIcon.SetImage(image_src);

        // 折扣
        const discount = data.discount;
        MainPanel.SetHasClass('is_discount', discount != 10);
        MainPanel.SetDialogVariableInt('discount', discount);

        // 热卖
        const is_hot = data.is_hot == 1;
        MainPanel.SetHasClass('is_hot', is_hot);

        // 复合型物品
        g_item_object = { [`${data.item_id}`]: data.number };
        //@ts-ignore
        const merge_str = (data.merge ?? '') as string;
        // MainPanel.SetHasClass("is_merge", merge_str.length > 0);
        // MultipleItemList.RemoveAndDeleteChildren()
        for (let i = 0; i < MultipleItemList.GetChildCount(); i++) {
            const MultipleItemRows = MultipleItemList.GetChild(i)!;
            MultipleItemRows.visible = false;
        }

        if (merge_str.length > 0) {
            const merge_arr = merge_str.split(',');
            for (const sub_merge of merge_arr) {
                const arr = sub_merge.split('_');
                const item_id = arr[0];
                const item_count = parseInt(arr[1]);
                g_item_object[item_id] = item_count;
            }
        }

        let index = 0;
        for (const item_id in g_item_object) {
            const MultipleItemRows = MultipleItemList.GetChild(index)!;
            MultipleItemRows.visible = true;
            const ServerItem = MultipleItemRows.FindChildTraverse('ServerItem') as Component_ServerItem;
            ServerItem._SetItemId(item_id);

            const item_name = $.Localize('#custom_serveritem_' + item_id);
            MultipleItemRows.SetDialogVariable('item_name', item_name);

            const count = g_item_object[item_id];
            MultipleItemRows.SetDialogVariableInt('count', count);
            index++;
        }

        // 当前货币
        const backpack_count_table = GameUI.CustomUIConfig().getStorage('backpack_count_table')!;
        const currency_count = GameUI.CustomUIConfig().getStorage('currency_count')!;
        // $.Msg(["currency_count", currency_count])
        // 购买所需货币
        // $.Msg(["backpack_count_table"])
        // $.Msg(backpack_count_table)
        // $.Msg(currency_count)
        const cost_arr = data.cost.split('_');

        const cost_type = cost_arr[0];
        // $.Msg(["cost_type",cost_type])
        CurrencyIcon.SetHasClass('is_rmb', cost_type == 'rmb');
        if (cost_type == 'rmb') {
            CurrencyIcon._SetItemId('rmb');
        } else {
            CurrencyIcon._SetItemId(cost_type);
            // $.Msg(["currency_count[cost_type]",currency_count[cost_type]])
            // $.Msg(["backpack_count_table[cost_type]",backpack_count_table[cost_type]])
            if (currency_count[cost_type] != null) {
                g_my_price = currency_count[cost_type];
            } else if (backpack_count_table[cost_type] != null) {
                g_my_price = backpack_count_table[cost_type];
            } else {
                g_my_price = 0;
            }
        }

        // 最大购买次数
        const shoping_limit = GameUI.CustomUIConfig().getStorage('shoping_limit') ?? {};
        const limit_count = shoping_limit[goods_id] ? shoping_limit[goods_id].c : 0;
        const is_limit = data.purchase_limitation != 0;
        const purchase_single = data.purchase_single;
        const single_max = is_limit ? purchase_single - limit_count : data.purchase_single;

        // 单价
        const original_cost_arr = data.original_cost.split('_');
        g_original_price = parseInt(original_cost_arr[1]);
        g_actual_price = parseInt(cost_arr[1]);
        const min_count = g_my_price >= g_actual_price ? 1 : 0;
        const max_count = Math.min(single_max, Math.floor(g_my_price / g_actual_price));
        StoreCountSlider.value = min_count;
        StoreCountSlider.min = min_count;
        StoreCountSlider.max = Math.max(min_count, max_count);
        StoreCountSlider.visible = (single_max == 99 || single_max > 1) && min_count > 0;
        MainPanel.SetDialogVariableInt('g_my_price', g_my_price);

        UpdateCurrentStoreCount(1);
    });

    StoreCountSlider.SetPanelEvent('onvaluechanged', () => {
        const count = Math.floor(StoreCountSlider.value);
        UpdateCurrentStoreCount(count);
    });

    ConfirmButton.SetPanelEvent('onactivate', () => {
        // 购买物品信息
        MainPanel.SetHasClass('Show', false);
        GameUI.CustomUIConfig().EventBus.publish('popup_loading', { show: true });
        GameEvents.SendCustomGameEventToServer('ServiceInterface', {
            event_name: 'ShoppingBuy',
            params: {
                shop_id: g_goods_id,
                count: g_goods_count,
            },
        });

        $.DispatchEvent('UIPopupButtonClicked', $.GetContextPanel());
    });
};

/** 更新商品当前数量和对应价格 */
function UpdateCurrentStoreCount(count: number) {
    g_goods_count = count;
    MainPanel.SetDialogVariableInt('purchase_count', count);

    const total_original_price = g_original_price * count;
    const total_actual_price = g_actual_price * count;

    MainPanel.SetDialogVariableInt('original_price', total_original_price);
    MainPanel.SetDialogVariableInt('actual_price', total_actual_price);

    let index = 0;
    for (const item_id in g_item_object) {
        const MultipleItemRows = MultipleItemList.GetChild(index)!;
        const item_count = g_item_object[item_id];
        MultipleItemRows.SetDialogVariableInt('count', item_count * count);
        index++;
    }

    const price_state = g_my_price >= total_actual_price;

    ConfirmButton.enabled = count > 0 && g_my_price >= total_actual_price;
}

(() => {
    Init();
})();
