import { LoadCustomComponent } from "../../_components/component_manager";

const ServerDrawAcc = GameUI.CustomUIConfig().KvData.server_draw_acc;

const QuickPurchase = $("#QuickPurchase");
const QuickPurchaseButton = $("#QuickPurchaseButton") as Button;
const ServerShopList = GameUI.CustomUIConfig().KvData.server_shop_list;

// const CostItemPanel = LoadCustomComponent($("#CostItemPanel"), "server_item")
// CostItemPanel._SetServerItemInfo({ style: "horizontal", item_id: 1207 })
export function Init() {
    InitQuickPurchase();
    InitGachaButton();
    InitRewardItem();
    InitCurrentReward();
    InitGachaItemShow()
}

const GACHA_SHOP_ID = "11";
const GACHA_ITEM_ID = "1207";
function InitQuickPurchase() {
    let _ServerItem = QuickPurchase.FindChildTraverse("ServerItem")!;
    let ServerItem = LoadCustomComponent(_ServerItem, "server_item");
    ServerItem._SetServerItemInfo({ show_count: false, show_tips: false, hide_bg: true, item_id: GACHA_ITEM_ID })

    let _PriceIcon = QuickPurchase.FindChildTraverse("PriceIcon")!;
    let PriceIcon = LoadCustomComponent(_PriceIcon, "server_item");
    PriceIcon._SetServerItemInfo({ show_count: false, show_tips: false, hide_bg: true, item_id: "1001" })

    let gacha_item_data = ServerShopList[GACHA_SHOP_ID as keyof typeof ServerShopList];
    let qp_price = gacha_item_data.cost.split("_")[1];
    // $.Msg(["qp_price",qp_price])
    QuickPurchase.SetDialogVariableInt("qp_price", parseInt(qp_price))
    QuickPurchaseButton.SetPanelEvent("onactivate", () => {
        GameUI.CustomUIConfig().EventBus.publish("open_store_purchase", { id: GACHA_SHOP_ID })
    })
}

const GachaButtonList = $("#GachaButtonList")
const GACHA_BTN_CONFIG = [
    { count: 1, style: "x1", item: 1207, },
    { count: 10, style: "x10", item: 1207, }
]
function InitGachaButton() {
    GachaButtonList.RemoveAndDeleteChildren();
    for (let _data of GACHA_BTN_CONFIG) {
        let GachaButtonPanel = $.CreatePanel("Panel", GachaButtonList, "");
        GachaButtonPanel.BLoadLayoutSnippet("GachaButtonPanel");
        GachaButtonPanel.SetDialogVariableInt("count", _data.count);
        GachaButtonPanel.AddClass(_data.style);
        const _ServerItem = GachaButtonPanel.FindChildTraverse("ServerItem")!;
        const ServerItem = LoadCustomComponent(_ServerItem, "server_item");
        ServerItem._SetServerItemInfo({ show_count: false, show_tips: false, hide_bg: true, item_id: _data.item })

        GachaButtonPanel.SetPanelEvent("onactivate", () => {
            GameUI.CustomUIConfig().EventBus.publish("popup_loading", { show: true, })
            GameEvents.SendCustomGameEventToServer("ServiceInterface", {
                event_name: "DrawLottery",
                params: {
                    type: 1,
                    count: _data.count
                }
            })

            // 
        })
    }
}

/** 当期奖品显示 */
const GACHA_ITEM_SHOW = [1279, 1280, 1281, 1282, 1283, 1284]
const RewardItemShowList = $("#RewardItemShowList")
function InitRewardItem() {
    RewardItemShowList.RemoveAndDeleteChildren();
    for (let i = 0; i < GACHA_ITEM_SHOW.length; i++) {
        let item_id = GACHA_ITEM_SHOW[i];

        let RewardItemShow = $.CreatePanel("Panel", RewardItemShowList, `${i}`);
        RewardItemShow.BLoadLayoutSnippet("RewardItemShow");
        let _RewardItem = RewardItemShow.FindChildTraverse("RewardItem")!;
        let RewardItem = LoadCustomComponent(_RewardItem, "server_item")
        RewardItem._SetServerItemInfo({ item_id: item_id, hide_bg: true, show_count: false, show_tips: true })

    }
}

const CURRENT_PROGRESS_BONUS_WIDTH = 80;
const UI_SCALE = 2;
const CurrentProgress = $("#CurrentProgress") as ProgressBar;
const REWARD_LIST = Object.values(ServerDrawAcc)

const current_progress = 550;
const AccRewardList = $("#AccRewardList");
function InitCurrentReward() {
    AccRewardList.RemoveAndDeleteChildren()
    let order = 0;
    let max_progress = 0;
    let stage = 0;
    for (let _data of REWARD_LIST) {
        let value = _data.count;
        let item_info = GameUI.CustomUIConfig().ConvertServerItemToArray(_data.item_id)[0];
        let item_id = item_info.item_id;
        let item_count = item_info.item_count;
        let is_even = (order % 2) == 0;

        if (current_progress >= value){
            stage = order + 1;
        }
        // let receive = 0;
        // let is_active = current_progress >= value;
        // let can_receive = (receive == 0) && is_active;
        // let is_active = (receive == 0) && can_state;
        let AccRewardItem = $.CreatePanel("Panel", AccRewardList, `${value}`)
        AccRewardItem.BLoadLayoutSnippet("AccRewardItem");
        AccRewardItem.SetDialogVariableInt("reward_level", value)
        AccRewardItem.SetHasClass("is_even", !is_even);

        // AccRewardItem.SetHasClass("is_active", is_active);
        // AccRewardItem.SetHasClass("can_receive", can_receive)
        // AccRewardItem.SetHasClass("receive", receive_state);

        let offsetX = (1 + order) * 40;
        AccRewardItem.style.transform = `translatex(${(offsetX * UI_SCALE) - 40}px)`

        const _RewardItem = AccRewardItem.FindChildTraverse("RewardItem")!
        const RewardItem = LoadCustomComponent(_RewardItem, "server_item")
        RewardItem._SetServerItemInfo({ show_count: true, show_tips: true, item_id: item_id, item_count: item_count })

        max_progress = value;
        order++;
    }

    // $.Msg(["max_progress",max_progress])
    CurrentProgress.max = order * 40;
    CurrentProgress.style.width = `${order * 40 * UI_SCALE}px`;
    CurrentProgress.value = stage * 40;

}



function InitGachaItemShow() {
    const GachaServerItem = LoadCustomComponent($("#GachaServerItem"), "server_item")
    GachaServerItem._SetServerItemInfo({ hide_bg: true, show_tips: true, show_count: false, item_id: 1207 })

    const GachaItemCount = LoadCustomComponent($("#GachaItemCount"), "backpack_count");
    GachaItemCount._SetItemId("1207");
    GachaItemCount._SetLabelStyle({ font_size: 16, color: "#fffffe" })
}

(() => {
    Init();
})();