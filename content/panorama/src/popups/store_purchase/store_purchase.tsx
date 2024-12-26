import { GetTextureSrc } from "../../common/custom_kv_method";
import { LoadCustomComponent } from "../../dashboard/_components/component_manager";

const MainPanel = $.GetContextPanel();
const ServerShopList = GameUI.CustomUIConfig().KvData.server_shop_list;
const ServerItemList = GameUI.CustomUIConfig().KvData.ServerItemList;


const MultipleItemList = $("#MultipleItemList");

const CancelButton = $("#CancelButton");
const ConfirmButton = $("#ConfirmButton");
const StoreIcon = $("#StoreIcon") as ImagePanel;
const StoreCountSlider = $("#StoreCountSlider") as SliderPanel & Panel;

const CurrencyIcon = LoadCustomComponent($("#CurrencyIcon"), "server_item");
CurrencyIcon._SetServerItemInfo({ hide_bg: true, show_count: false, show_tips: false });

let g_goods_id = ""
let g_goods_count = 0;
/** 原始单价 */
let g_original_price = 0;
/** 实际单价 */
let g_actual_price = 0;

let g_item_object: { [x: string]: number } = {}

export const Init = () => {

    MultipleItemList.RemoveAndDeleteChildren();
    for (let i = 0; i < 10; i++) {
        let MultipleItemRows = $.CreatePanel("Panel", MultipleItemList, "");
        MultipleItemRows.BLoadLayoutSnippet("MultipleItemRows");
        const _ = MultipleItemRows.FindChildTraverse("ServerItem")!;
        const ServerItem = LoadCustomComponent(_, "server_item");
        ServerItem._SetServerItemInfo({ show_count: false, show_tips: true })
    }


    CancelButton.SetPanelEvent("onactivate", () => {
        MainPanel.SetHasClass("Show", false);
    })


    GameUI.CustomUIConfig().EventBus.clear("open_store_purchase");
    GameUI.CustomUIConfig().EventBus.subscribe("open_store_purchase", event => {
        MainPanel.SetHasClass("Show", true);
        let goods_id = event.id;
        g_goods_id = goods_id;
        let data = ServerShopList[goods_id as keyof typeof ServerShopList];
        let goods_name = $.Localize("#custom_text_goods_" + goods_id);
        let goods_desc = $.Localize("#custom_text_goods_" + goods_id + "_desc").replaceAll("\n", "<br>");
        // $.Msg(["goods_desc",goods_desc])
        MainPanel.SetDialogVariable("goods_name", goods_name)
        MainPanel.SetDialogVariable("goods_desc", goods_desc)

        let image_src = GetTextureSrc(data.AbilityTextureName ?? "");
        StoreIcon.SetImage(image_src);

        // 折扣
        let discount = data.discount;
        MainPanel.SetHasClass("is_discount", discount != 10);
        MainPanel.SetDialogVariableInt("discount", discount);

        // 热卖
        let is_hot = data.is_hot == 1;
        MainPanel.SetHasClass("is_hot", is_hot)

        // 复合型物品
        g_item_object = { [`${data.item_id}`]: data.number, }
        //@ts-ignore
        let merge_str = (data.merge ?? "") as string;
        // MainPanel.SetHasClass("is_merge", merge_str.length > 0);
        // MultipleItemList.RemoveAndDeleteChildren()
        for (let i = 0; i < MultipleItemList.GetChildCount(); i++) {
            let MultipleItemRows = MultipleItemList.GetChild(i)!;
            MultipleItemRows.visible = false;
        }

        if (merge_str.length > 0) {
            let merge_arr = merge_str.split(",");
            for (let sub_merge of merge_arr) {
                let arr = sub_merge.split("_");
                let item_id = arr[0];
                let item_count = parseInt(arr[1])
                g_item_object[item_id] = item_count
            }
        }

        let index = 0;
        for (let item_id in g_item_object) {
            let MultipleItemRows = MultipleItemList.GetChild(index)!;
            MultipleItemRows.visible = true
            const ServerItem = MultipleItemRows.FindChildTraverse("ServerItem") as Component_ServerItem
            ServerItem._SetItemId(item_id)

            let item_name = $.Localize("#custom_serveritem_" + item_id)
            MultipleItemRows.SetDialogVariable("item_name", item_name)

            let count = g_item_object[item_id];
            MultipleItemRows.SetDialogVariableInt("count", count)
            index++;
        }



        // 购买所需货币
        let cost_arr = data.cost.split("_");

        let cost_type = cost_arr[0];
        CurrencyIcon.SetHasClass("is_rmb", cost_type == "rmb")
        if (cost_type == "rmb") {
            CurrencyIcon._SetItemId("rmb");
        } else {
            CurrencyIcon._SetItemId(cost_type)
        }
        // 单价
        let original_cost_arr = data.original_cost.split("_");
        g_original_price = parseInt(original_cost_arr[1]);
        g_actual_price = parseInt(cost_arr[1]);

        let limit_count = -1;
        let value_max = 100;
        let curr_value = 1;
        StoreCountSlider.value = curr_value;
        StoreCountSlider.min = 1;
        StoreCountSlider.max = value_max;
        StoreCountSlider.visible = (limit_count == -1) || limit_count > 1;

        UpdateCurrentStoreCount(1);


    })

    StoreCountSlider.SetPanelEvent("onvaluechanged", () => {
        let count = Math.floor(StoreCountSlider.value);
        UpdateCurrentStoreCount(count);
    })

    ConfirmButton.SetPanelEvent("onactivate", () => {
        // 购买物品信息
        $.Msg(["buy", g_goods_id, g_goods_count])
        MainPanel.SetHasClass("Show", false);

        GameUI.CustomUIConfig().EventBus.publish("popup_loading", { show: true, })

        GameEvents.SendCustomGameEventToServer("ServiceInterface", {
            event_name: "ShoppingBuy",
            params: {
                shop_id: g_goods_id,
                count: g_goods_count,
            }
        })
    })
}

/** 更新商品当前数量和对应价格 */
function UpdateCurrentStoreCount(count: number) {
    g_goods_count = count
    MainPanel.SetDialogVariableInt("purchase_count", count)

    let total_original_price = g_original_price * count;
    let total_actual_price = g_actual_price * count;

    MainPanel.SetDialogVariableInt("original_price", total_original_price)
    MainPanel.SetDialogVariableInt("actual_price", total_actual_price)

    let index = 0;
    for (let item_id in g_item_object) {
        let MultipleItemRows = MultipleItemList.GetChild(index)!;
        let item_count = g_item_object[item_id];
        MultipleItemRows.SetDialogVariableInt("count", item_count * count)
        index++;
    }

}

(() => {
    Init()
})();