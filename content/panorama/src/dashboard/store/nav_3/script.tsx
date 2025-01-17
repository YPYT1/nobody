import { CreateCustomComponent } from "../../_components/component_manager";


const ShopItemList = $("#ShopItemList");

const mall_category = "3";
const ServerShopList = GameUI.CustomUIConfig().KvData.server_shop_list

export function Init() {

    ShopItemList.RemoveAndDeleteChildren();
    for (let goods_id in ServerShopList) {
        let goods_data = ServerShopList[goods_id as keyof typeof ServerShopList];
        let mall_category_arr = ("" + goods_data.mall_category).split(",");
        if (mall_category_arr.indexOf(mall_category) != -1) {
            let StoreItem = GameUI.CustomUIConfig().SetStoreItemPanel(ShopItemList, goods_id);
            StoreItem.StoreItem._SetGoodsId(goods_id)
        }
    }


}

(() => {
    Init();
})();