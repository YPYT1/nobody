import { LoadCustomComponent } from "../component_manager";

export const __COMPONENTS_NAME = "store_item";

declare global {
    interface Component_StoreItem extends Panel {
        _SetGoodsId(goods_id: string | number): void;

        /** 设置已限购次数 */
        _SetLimitCount(count: number): void;
        /** 设置是否可购买 */
        _SetState(state: boolean): void;
    }
}

const rare_list = [1, 2, 3, 4, 5, 6, 7];
const MainPanel = $.GetContextPanel() as Component_StoreItem;
const ServerShopList = GameUI.CustomUIConfig().KvData.server_shop_list;
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;
const StoreIcon = $("#StoreIcon") as ImagePanel;
const EventBus = GameUI.CustomUIConfig().EventBus;
const OriginalPanel = $("#OriginalPanel");
const ActualPanel = $("#ActualPanel");

const CurrencyIcon = LoadCustomComponent($("#CurrencyIcon"), "server_item");
CurrencyIcon._SetServerItemInfo({ hide_bg: true, show_count: false, show_tips: false });

const StorePurchaseBtn = $("#StorePurchaseBtn");

let g_goods_id: string | number = ""
let g_limit_max = 0;
const _SetGoodsId = (goods_id: string | number) => {
    g_goods_id = goods_id
    let data = ServerShopList["" + goods_id as keyof typeof ServerShopList];
    MainPanel.Data<PanelDataObject>().goods_id = goods_id
    let goods_name = $.Localize("#custom_text_goods_" + goods_id);
    MainPanel.SetDialogVariable("goods_name", goods_name + "  " + goods_id)
    MainPanel.SetDialogVariable("limit_type", "");
    MainPanel.SetDialogVariableInt("limit_count", 0);
    MainPanel.Data<PanelDataObject>().limit_count = 0;
    if (data) {
        let rarity = data.rarity;
        for (let rare of rare_list) {
            MainPanel.SetHasClass(`rare_${rare}`, rarity == rare);
        }
        MainPanel.Data<PanelDataObject>().rarity = rarity;

        let cost_arr = data.cost.split("_");
        let cost_type = cost_arr[0];
        CurrencyIcon.SetHasClass("is_rmb", cost_type == "rmb")
        if (cost_type == "rmb") {
            CurrencyIcon._SetItemId("rmb");
        } else {
            CurrencyIcon._SetItemId(cost_type)
        }

        // 售价 
        SetPriceView(OriginalPanel, data.original_cost);
        SetPriceView(ActualPanel, data.cost);
        let image_src = GetTextureSrc(data.AbilityTextureName ?? "");
        StoreIcon.SetImage(image_src);

        // 热卖
        let is_hot = data.is_hot == 1;
        MainPanel.SetHasClass("is_hot", is_hot)

        // 折扣
        let discount = data.discount;
        MainPanel.SetHasClass("is_discount", discount != 10);
        MainPanel.SetDialogVariableInt("discount", discount);

        // 限购
        let purchase_limitation = data.purchase_limitation;
        g_limit_max = purchase_limitation
        MainPanel.SetDialogVariableInt("limit_max", purchase_limitation)
        let purchase_str = data.purchase_limitation_time;
        MainPanel.SetHasClass("limit_purchase", purchase_str != "N_0")
        let purchase_arr = purchase_str.split("_");
        let purchase_type = purchase_arr[0];
        let purchase_count = parseInt(purchase_arr[1] ?? "0");
        if (purchase_type == "D") {
            if (purchase_count == 1) {
                MainPanel.SetDialogVariable("limit_type", "每日")
            } else {
                MainPanel.SetDialogVariable("limit_type", purchase_count + "日")
            }
        } else if (purchase_type == "XG") {
            MainPanel.SetDialogVariable("limit_type", "终身")
        }

        StorePurchaseBtn.SetPanelEvent("onactivate", () => {
            if (cost_type == "rmb") {
                $.Msg(["人民币购买需要单独弹窗", goods_id])
            } else {
                const limit_count = MainPanel.Data<PanelDataObject>().limit_count as number;
                GameUI.CustomUIConfig().EventBus.publish("open_store_purchase", { id: "" + goods_id })
            }

        })
    } else {
        StoreIcon.SetImage("");
    }
}

function _SetState(state: boolean) {
    StorePurchaseBtn.enabled = state;
    MainPanel.SetHasClass("is_purchased", !state)
}

function _SetLimitCount(count: number) {
    MainPanel.SetDialogVariableInt("limit_count", count);
    MainPanel.Data<PanelDataObject>().limit_count = count;
    const is_purchased = g_limit_max == count
    MainPanel.SetHasClass("is_purchased", is_purchased)
    StorePurchaseBtn.enabled = !is_purchased;

}

function SetPriceView(e: Panel, cost_str: string,) {
    if (cost_str == "0_0") {
        e.SetDialogVariable("price_cost", "Free")
    } else {
        let arr = cost_str.split("_");
        let price_type = arr[0];
        let price_cost = parseInt(arr[1])

        // let CurrencyIcon = e.FindChildTraverse("CurrencyIcon") as ImagePanel;

        e.SetDialogVariable("price_cost", "" + price_cost)
    }
}
(function () {
    MainPanel.Data<PanelDataObject>().rarity = 0
    MainPanel._SetGoodsId = _SetGoodsId;
    // MainPanel._SetState = _SetState;
    let goods_id = MainPanel.id;
    // let goods_id = MainPanel.Data<PanelDataObject>().goods_id as string;
    if (goods_id) {
        _SetGoodsId(goods_id)
    }

    EventBus.subscribe("shoping_limit_update", data => {
        let item_id = MainPanel.id;
        if (data[item_id] == null) { return }
        let count = data[item_id].c
        MainPanel.SetDialogVariable("count", "" + count);
        _SetLimitCount(count)
    })

})();