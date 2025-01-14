import { CreateCustomComponent } from "../component_manager";

export const __COMPONENTS_NAME = "store_item_ex1";
const ServerShopList = GameUI.CustomUIConfig().KvData.server_shop_list;

declare global {
    interface Component_StoreItemEx1 extends Panel {
        _SetGoodsId(goods_id: string | number): void;
        _SetState(state: boolean): void;
        _GetGoodsId(): string;
    }
}
type ServerShopID = keyof typeof ServerShopList
type ServerShopTypeProp = typeof ServerShopList[ServerShopID];

const rare_list = [1, 2, 3, 4, 5, 6];
const MainPanel = $.GetContextPanel() as Component_StoreItemEx1;

const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;
const StoreIcon = $("#StoreIcon") as ImagePanel;
const MergeItemList = $("#MergeItemList")
const StorePurchaseBtn = $("#StorePurchaseBtn") as Button;

let g_goods_id = "-1"
let g_limit_max = 0;
const _SetGoodsId = (goods_id: string | number) => {
    g_goods_id = "" + goods_id;
    let data = ServerShopList["" + goods_id as keyof typeof ServerShopList];
    MainPanel.Data<PanelDataObject>().goods_id = goods_id
    if (data) {
        let rarity = data.rarity;
        for (let rare of rare_list) {
            MainPanel.SetHasClass(`rare_${rare}`, rarity == rare);
        }
        // 包含物品列表
        SetMergeItemList(data)
        // 物品价格
        SetPriceView(data)
        // 限购
        let purchase_limitation = data.purchase_limitation;
        g_limit_max = purchase_limitation
        // 物品图片
        // @ts-ignore
        let img = data.AbilityTextureName ?? "";
        MainPanel.SetHasClass("has_icon", img.length > 8)
        let image_src = GetTextureSrc(img);
        StoreIcon.SetImage(image_src);
        let cost = data.cost
        let cost_arr = cost.split("_");
        let cost_type = cost_arr[0];
        StorePurchaseBtn.SetPanelEvent("onactivate", () => {
            if (cost == "0_0") {
                // 直接领取
                GameUI.CustomUIConfig().EventBus.publish("popup_loading", { show: true });
                GameEvents.SendCustomGameEventToServer("ServiceInterface", {
                    event_name: "ShoppingBuy",
                    params: {
                        shop_id: "" + goods_id,
                        count: 1,
                    }
                })

            } else {
                if (cost_type == "rmb") {
                    GameUI.CustomUIConfig().EventBus.publish("open_rmb_purchase", { id: "" + goods_id })
                } else {
                    GameUI.CustomUIConfig().EventBus.publish("open_store_purchase", { id: "" + goods_id })
                }

            }

        })
    } else {
        StoreIcon.SetImage("");
    }
}
function _GetGoodsId() {
    return MainPanel.Data<PanelDataObject>().goods_id as string
}

function SetMergeItemList(data: ServerShopTypeProp) {
    MergeItemList.RemoveAndDeleteChildren();
    // 基本物品
    let item_object = { [`${data.item_id}`]: data.number, }
    //@ts-ignore
    let merge_str = (data.merge ?? "") as string;
    if (merge_str.length > 0) {
        let merge_arr = merge_str.split(",");
        for (let sub_merge of merge_arr) {
            let arr = sub_merge.split("_");
            let item_id = arr[0];
            let item_count = parseInt(arr[1])
            item_object[item_id] = item_count
        }
    }

    for (let item_id in item_object) {
        let itemPanel = CreateCustomComponent(MergeItemList, "server_item", item_id);
        itemPanel._SetServerItemInfo({
            item_id: item_id,
            show_count: true,
            item_count: item_object[item_id],
            show_tips: true,
        })
    }

}

/** 设置物品价格或者领取 */
function SetPriceView(data: ServerShopTypeProp) {
    let cost_arr = data.cost.split("_");
    let price_type = cost_arr[0];
    let price_count = parseInt(cost_arr[1]);
    MainPanel.SetHasClass("is_rmb", price_type == "rmb");

    if (price_type == "0") {
        MainPanel.SetDialogVariable("price_or_receive", "领取")
        MainPanel.SetDialogVariable("price_or_receive_dis", "已领取")

    } else {
        MainPanel.SetDialogVariable("price_or_receive", "" + price_count)
        MainPanel.SetDialogVariable("price_or_receive_dis", "已购买")
    }

}

function _SetState(state: boolean) {
    // 是否已购买已领取
    MainPanel.SetHasClass("is_disable", !state)
    StorePurchaseBtn.enabled = state;

}

function _SetLimitCount(count: number) {
    MainPanel.SetDialogVariableInt("limit_count", count);
    MainPanel.Data<PanelDataObject>().limit_count = count;
    const is_purchased = g_limit_max == count
    MainPanel.SetHasClass("is_purchased", is_purchased)
    StorePurchaseBtn.enabled = !is_purchased;

}

(function () {
    // GameUI.CustomUIConfig().EventBus.clear("shoping_limit_update");
    MainPanel.SetDialogVariable("days", "0天")
    let goods_id = MainPanel.Data<PanelDataObject>().goods_id as string;
    if (goods_id) {
        _SetGoodsId(goods_id);
    }

    MainPanel._SetGoodsId = _SetGoodsId;
    MainPanel._SetState = _SetState
    MainPanel._GetGoodsId = _GetGoodsId;

    GameEvents.Subscribe("ServiceInterface_GetPlayerVipData", event => {
        let data = event.data;
        let item_id = MainPanel.id;
        let time_data = data[item_id];
        if (time_data == null) { return };
        let shop_time = time_data.t;
        if (shop_time == 0) {
            MainPanel.SetDialogVariable("days", "0天");
        } else if (shop_time == -1) {
            MainPanel.SetDialogVariable("days", "无限");
        } else {
            let today_time = GameUI.CustomUIConfig().getStorage("today_time")!;
            let diff = shop_time - today_time;
            let day = Math.floor(diff / (60 * 60 * 24));
            // $.Msg({ shop_time, today_time, diff, day })
            MainPanel.SetDialogVariable("days", `${day}天`);
        }
    })

    GameUI.CustomUIConfig().EventBus.subscribe("shoping_limit_update", data => {
        if (data[g_goods_id] == null) { return }
        let count = data[g_goods_id].c
        const MainPanel = $.GetContextPanel()
        MainPanel.SetDialogVariable("count", "" + count);
        _SetLimitCount(count)
    })
})();