import { CreateCustomComponent } from "../../_components/component_manager";

const HotSellItemList = $("#HotSellItemList")
const ServerShopList = GameUI.CustomUIConfig().KvData.server_shop_list
const hot_goods = ["1", "2", "3", "4", "5"]

export function Init() {

    HotSellItemList.RemoveAndDeleteChildren()
    for (let goods_id of hot_goods) {
        let StoreItem = CreateCustomComponent(HotSellItemList, "store_item", goods_id)
        StoreItem._SetGoodsId(goods_id)
    }
}

(() => {
    Init();
})();