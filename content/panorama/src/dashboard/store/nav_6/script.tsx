import { CreateCustomComponent } from "../../_components/component_manager";


const ShopItemList = $("#ShopItemList");

const mall_category = "6";
const ServerShopList = GameUI.CustomUIConfig().KvData.server_shop_list

const ExchangeFilter = $("#ExchangeFilter_Nav6") as DropDown;

export function Init() {
    let filter_object: number[] = [-1]
    ShopItemList.RemoveAndDeleteChildren();
    for (let goods_id in ServerShopList) {
        let goods_data = ServerShopList[goods_id as keyof typeof ServerShopList];
        let mall_category_arr = ("" + goods_data.mall_category).split(",");
        if (mall_category_arr.indexOf(mall_category) != -1) {
            let storePanel = GameUI.CustomUIConfig().SetStoreItemPanel(ShopItemList, goods_id);
            const filter = storePanel.Data<PanelDataObject>().filter as number;
            if (filter_object.indexOf(filter) == -1) {
                filter_object.push(filter)
            }
        }
    }

    for (let _filter of filter_object) {
        const option_id = `${_filter}`
        if (!ExchangeFilter.HasOption(option_id)) {
            let text = $.Localize(`#custom_serveritem_${option_id}`);
            if (_filter <= 0) {
                text = "全部"
            }
            let optionLabel = $.CreatePanel("Label", ExchangeFilter, `${_filter}`, {
                text: text,
                html: true,
            });
            optionLabel.Data<PanelDataObject>().filter = _filter;
            ExchangeFilter.AddOption(optionLabel)
        }
    }

    ExchangeFilter.SetPanelEvent("oninputsubmit", () => {
        let config_index = parseInt(ExchangeFilter.GetSelected().id);
        g_filter = config_index;
        FliterStoreList()
    })


    ExchangeFilter.SetSelectedIndex(0);

}

let g_filter = -1;
function FliterStoreList() {
    for (let i = 0; i < ShopItemList.GetChildCount(); i++) {
        const ItemPanel = ShopItemList.GetChild(i)!;
        const loc_filter = ItemPanel.Data<PanelDataObject>().filter as number;
        let Show = (g_filter == -1 || g_filter == loc_filter);
        ItemPanel.visible = Show
    }
}
(() => {
    Init();
})();