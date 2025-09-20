import { CreateCustomComponent } from '../../_components/component_manager';

const HotSellItemList = $('#HotSellItemList');
const ServerShopList = GameUI.CustomUIConfig().KvData.server_shop_list;
const hot_goods = ['1', '2', '3', '4', '5'];

export function Init() {
    HotSellItemList.RemoveAndDeleteChildren();
    for (const goods_id of hot_goods) {
        const StoreItem = GameUI.CustomUIConfig().SetStoreItemPanel(HotSellItemList, goods_id);
        // $.Msg(["goods_id",goods_id])
        StoreItem.StoreItem._SetGoodsId(goods_id);
    }
}

(() => {
    Init();
})();
