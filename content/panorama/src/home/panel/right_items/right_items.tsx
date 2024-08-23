import { GetTextureSrc } from "../../../common/custom_kv_method";
import { HideCustomTooltip, ShowCustomTextTooltip, ShowCustomTooltip } from "../../../utils/custom_tooltip";
import { default as RuneConfigJson } from "./../../../json/config/game/rune/rune_config.json"
import { default as MysteriousShopConfig } from "./../../../json/config/game/shop/mysterious_shop_config.json"

type PanleListType = "AboutRune" | "AboutShop";

const AboutPanleList = $("#AboutPanleList");
const ItemList_Rune = $("#ItemList_Rune")
const ItemList_Shop = $("#ItemList_Shop");
const RightItemsContainer = $("#RightItemsContainer");
const BtnAboutShop = $("#BtnAboutShop") as Button;
const BtnAboutRune = $("#BtnAboutRune") as Button;


const OpenAboutList = (list_type: PanleListType) => {
    for (let i = 0; i < AboutPanleList.GetChildCount(); i++) {
        let rowPanel = AboutPanleList.GetChild(i)!;
        let row_id = rowPanel.id;
        let has_show = rowPanel.BHasClass("Show");
        // $.Msg([row_id, row_id == list_type, !has_show])
        rowPanel.SetHasClass("Show", row_id == list_type && !has_show)
    }
}
const CustomGameEventsSubscribe = () => {
    ItemList_Rune.RemoveAndDeleteChildren();
    ItemList_Shop.RemoveAndDeleteChildren();

    BtnAboutRune.SetPanelEvent("onactivate", () => {
        OpenAboutList("AboutRune")
    })
    BtnAboutShop.SetPanelEvent("onactivate", () => {
        OpenAboutList("AboutShop")
    })

    // 符文
    GameEvents.Subscribe("RuneSystem_GetPlayerRuneData", event => {
        let list_data = Object.values(event.data);

        for (let row of list_data) {
            let name = row.name;
            let ItemBorder = ItemList_Rune.FindChildTraverse(name);
            if (ItemBorder == null) {
                let ItemBorder = $.CreatePanel("Panel", ItemList_Rune, name);
                ItemBorder.BLoadLayoutSnippet("ItemBorder")
            }
            let ItemData = RuneConfigJson[name as keyof typeof RuneConfigJson];
            // ItemBorder.SetDialogVariableInt("count", row.);
        }

    })


    GameEvents.Subscribe("MysticalShopSystem_GetPlayerShopBuyData", event => {
        let list_data = Object.values(event.data.player_shop_buy_data);
        // $.Msg(list_data)
        for (let row of list_data) {
            let item_key = row.item_key;
            let count = row.count;
            let ItemData = MysteriousShopConfig[item_key as keyof typeof MysteriousShopConfig];
            let ItemBorder = ItemList_Shop.FindChildTraverse(item_key)!;
            if (ItemBorder == null) {
                ItemBorder = $.CreatePanel("Panel", ItemList_Shop, item_key)!;
                ItemBorder.BLoadLayoutSnippet("ItemBorder")
                let ItemImage = ItemBorder.FindChildTraverse("ItemImage") as ImagePanel;
                let textrue = ItemData.AbilityTextureName;
                ItemImage.SetImage(GetTextureSrc(textrue));
                ItemBorder.SetHasClass("rare_" + ItemData.rarity, true)
                ItemBorder.SetPanelEvent("onmouseover", () => {
                    ShowCustomTextTooltip(ItemBorder, "#custom_shopitem_" + item_key)
                    // ShowCustomTooltip(ItemBorder, "item", item_key)
                })
                ItemBorder.SetPanelEvent("onmouseout", () => {
                    HideCustomTooltip()
                })
            }
            ItemBorder.SetDialogVariableInt("count", count);
            // ItemBorder.SetDialogVariableInt("count", row.);
        }

        // for (let i = 1; i <= 10; i++) {
        //     let ItemBorder = $.CreatePanel("Panel", ItemList_Rune, "");
        //     ItemBorder.BLoadLayoutSnippet("ItemBorder")
        //    
        //     let item_key = `prop_` + i;
        //     let ItemData = MysteriousShopConfig[item_key as keyof typeof MysteriousShopConfig];
        //     
        //    
        //     

        //     


        // }
    })


    GameEvents.SendCustomGameEventToServer("MysticalShopSystem", {
        event_name: "GetPlayerShopBuyData",
        params: {}
    })
    GameEvents.SendCustomGameEventToServer("RuneSystem", {
        event_name: "GetPlayerRuneData",
        params: {}
    })
}
export const Init = () => {

    GameEvents.Subscribe("dota_player_pick_hero", event => {
        // $.Msg(["dota_player_pick_hero"])
        ItemList_Rune.RemoveAndDeleteChildren();
        ItemList_Shop.RemoveAndDeleteChildren();
    })


    CustomGameEventsSubscribe()
}

(function () {
    Init()
})();