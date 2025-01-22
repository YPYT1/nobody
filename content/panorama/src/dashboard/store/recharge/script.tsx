const RechargeStoreList = $("#RechargeStoreList");

const recharge_list = [
    "6",
    "30",
    "98",
    "198",
    "328",
    "648",
]

export function Init() {
    RechargeStoreList.RemoveAndDeleteChildren();
    for (let recharge_index of recharge_list) {
        let rechargePanel = $.CreatePanel("Panel", RechargeStoreList, `${recharge_index}`) as RechargePanel;
        rechargePanel.RechargeItem = new RechargeItem(rechargePanel, recharge_index)
    }
}


interface RechargePanel extends Panel {
    RechargeItem: RechargeItem;
}

class RechargeItem {

    ContentPanel: Panel;
    StoreIcon: ImagePanel;
    StorePurchaseBtn: Panel;

    recharge_index: string;

    recharge_num: number;

    constructor(e: Panel, recharge_index: string) {
        e.BLoadLayoutSnippet("StoreItem");
        this.recharge_num = parseInt(recharge_index)
        this.ContentPanel = e;
        this.recharge_index = recharge_index;
        this.StoreIcon = e.FindChildTraverse("StoreIcon") as ImagePanel;
        this.StorePurchaseBtn = e.FindChildTraverse("StorePurchaseBtn")!;
        // price_cost
        this.ContentPanel.SetDialogVariable("price_cost", recharge_index)
        this.ContentPanel.SetDialogVariable("goods_name", `${parseInt(recharge_index) * 10} 钻石`)
        this.ContentPanel.SetDialogVariable("bonus_amount", `${parseInt(recharge_index) * 3}`)


        this.StorePurchaseBtn.SetPanelEvent("onactivate", () => {
            GameUI.CustomUIConfig().Popups_Payment("-1" ,this.recharge_num);
            
            // GameUI.CustomUIConfig().ServerEventBus.publish("open_rmb_purchase", { id: "rechargers", recharge: this.recharge_num })

        })
    }



    SetPriceView(e: Panel, cost_str: string,) {
        if (cost_str == "0_0") {
            e.SetDialogVariable("price_cost", "Free")
        } else {
            let arr = cost_str.split("_");
            let price_type = arr[0];
            let price_cost = parseInt(arr[1])
            e.SetDialogVariable("price_cost", "" + price_cost)
        }
    }


}

(() => {
    Init();
})();