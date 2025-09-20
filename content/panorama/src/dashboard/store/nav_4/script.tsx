import { CreateCustomComponent } from '../../_components/component_manager';

const ShopItemList = $('#ShopItemList');

const mall_category = '4';
const ServerShopList = GameUI.CustomUIConfig().KvData.server_shop_list;

export function Init() {
    ShopItemList.RemoveAndDeleteChildren();
    for (const goods_id in ServerShopList) {
        const goods_data = ServerShopList[goods_id as keyof typeof ServerShopList];
        const mall_category_arr = ('' + goods_data.mall_category).split(',');
        if (mall_category_arr.indexOf(mall_category) != -1) {
            GameUI.CustomUIConfig().SetStoreItemPanel(ShopItemList, goods_id);
        }
    }
}

(() => {
    Init();
})();
