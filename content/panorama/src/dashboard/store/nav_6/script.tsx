import { CreateCustomComponent } from '../../_components/component_manager';

const ShopItemList = $('#ShopItemList');

const mall_category = '6';
const ServerShopList = GameUI.CustomUIConfig().KvData.server_shop_list;

const ExchangeFilter = $('#ExchangeFilter_Nav6') as DropDown;

// 1级魂石兑换、2级魂石兑换、3级魂石兑换、4级魂石兑换

const filter_label: { [k: string]: string } = {
    '1287': '1级魂石兑换 ',
    '1288': '2级魂石兑换',
    '1289': '3级魂石兑换',
    '1290': '4级魂石兑换',
};
export function Init() {
    const filter_object: number[] = [-1];
    ShopItemList.RemoveAndDeleteChildren();
    for (const goods_id in ServerShopList) {
        const goods_data = ServerShopList[goods_id as keyof typeof ServerShopList];
        const mall_category_arr = ('' + goods_data.mall_category).split(',');
        if (mall_category_arr.indexOf(mall_category) != -1) {
            // $.Msg(["goods_id",goods_id])
            const storePanel = GameUI.CustomUIConfig().SetStoreItemPanel(ShopItemList, goods_id);
            const filter = storePanel.Data<PanelDataObject>().filter as number;
            if (filter_object.indexOf(filter) == -1) {
                filter_object.push(filter);
            }
        }
    }

    for (const _filter of filter_object) {
        const option_id = `${_filter}`;
        if (!ExchangeFilter.HasOption(option_id)) {
            let text = filter_label[option_id]; // $.Localize(`#custom_serveritem_${option_id}`);
            if (_filter <= 0) {
                text = '全部';
            }
            const optionLabel = $.CreatePanel('Label', ExchangeFilter, `${_filter}`, {
                text: text,
                html: true,
            });
            optionLabel.Data<PanelDataObject>().filter = _filter;
            ExchangeFilter.AddOption(optionLabel);
        }
    }

    ExchangeFilter.SetPanelEvent('oninputsubmit', () => {
        const config_index = parseInt(ExchangeFilter.GetSelected().id);
        g_filter = config_index;
        FliterStoreList();
    });

    ExchangeFilter.SetSelectedIndex(0);
}

let g_filter = -1;
function FliterStoreList() {
    for (let i = 0; i < ShopItemList.GetChildCount(); i++) {
        const ItemPanel = ShopItemList.GetChild(i)!;
        const loc_filter = ItemPanel.Data<PanelDataObject>().filter as number;
        const Show = g_filter == -1 || g_filter == loc_filter;
        ItemPanel.visible = Show;
    }
}
(() => {
    Init();
})();
