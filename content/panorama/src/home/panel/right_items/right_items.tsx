import { GetTextureSrc } from '../../../common/custom_kv_method';
import { HideCustomTooltip, ShowCustomTextTooltip, ShowCustomTooltip } from '../../../utils/custom_tooltip';
import { default as RuneConfigJson } from './../../../json/config/game/rune/rune_config.json';
import { default as MysteriousShopConfig } from './../../../json/config/game/shop/mysterious_shop_config.json';

type PanleListType = 'AboutRune' | 'AboutShop';

const AboutPanleList = $('#AboutPanleList');
const ItemList_Rune = $('#ItemList_Rune');
const ItemList_Shop = $('#ItemList_Shop');
const RightItemsContainer = $('#RightItemsContainer');
const BtnAboutShop = $('#BtnAboutShop') as Button;
const BtnAboutRune = $('#BtnAboutRune') as Button;

const setStorage = GameUI.CustomUIConfig().setStorage;

const OpenAboutList = (list_type: PanleListType) => {
    for (let i = 0; i < AboutPanleList.GetChildCount(); i++) {
        const rowPanel = AboutPanleList.GetChild(i)!;
        const row_id = rowPanel.id;
        const has_show = rowPanel.BHasClass('Show');
        // $.Msg([row_id, row_id == list_type, !has_show])
        rowPanel.SetHasClass('Show', row_id == list_type && !has_show);

        const AboutBtn = RightItemsContainer.GetChild(i);
        if (AboutBtn) {
            AboutBtn.SetHasClass('Check', row_id == list_type && !has_show);
        }
    }
};
const CustomGameEventsSubscribe = () => {
    ItemList_Rune.RemoveAndDeleteChildren();
    ItemList_Shop.RemoveAndDeleteChildren();

    BtnAboutRune.SetPanelEvent('onactivate', () => {
        OpenAboutList('AboutRune');
    });
    BtnAboutShop.SetPanelEvent('onactivate', () => {
        OpenAboutList('AboutShop');
    });

    // 符文
    GameEvents.Subscribe('RuneSystem_GetPlayerRuneData', event => {
        const list_data = Object.values(event.data);
        for (const row of list_data) {
            const name = row.name;
            const rune_key = (name + '_attr') as '__rune_attr';
            setStorage(rune_key, row.attr_list);
            const ItemBorder = ItemList_Rune.FindChildTraverse(name);
            if (ItemBorder == null) {
                const ItemBorder = $.CreatePanel('Panel', ItemList_Rune, name);
                ItemBorder.BLoadLayoutSnippet('ItemBorder');
                // ItemBorder.AddClass("NoCount")

                const ItemData = RuneConfigJson[name as keyof typeof RuneConfigJson];
                const ItemImage = ItemBorder.FindChildTraverse('ItemImage') as ImagePanel;
                const textrue = ItemData.AbilityTextureName;
                ItemImage.SetImage(GetTextureSrc(textrue));
                ItemBorder.SetHasClass('rare_' + row.level, true);
                ItemBorder?.SetDialogVariable('count', ``);

                ItemBorder.SetPanelEvent('onmouseover', () => {
                    ShowCustomTooltip(ItemBorder, 'rune', name, -1, row.level_index);
                });

                ItemBorder.SetPanelEvent('onmouseout', () => {
                    HideCustomTooltip();
                });
            }
        }
    });

    GameEvents.Subscribe('MysticalShopSystem_GetPlayerShopBuyData', event => {
        const list_data = Object.values(event.data.player_shop_buy_data);
        const prop_count: { [key: string]: number } = {};
        for (const row of list_data) {
            const item_key = row.item_key;
            const count = row.count;
            const ItemData = MysteriousShopConfig[item_key as keyof typeof MysteriousShopConfig];
            let ItemBorder = ItemList_Shop.FindChildTraverse(item_key)!;
            if (ItemBorder == null) {
                ItemBorder = $.CreatePanel('Panel', ItemList_Shop, item_key)!;
                ItemBorder.BLoadLayoutSnippet('ItemBorder');
                const ItemImage = ItemBorder.FindChildTraverse('ItemImage') as ImagePanel;
                const textrue = ItemData.AbilityTextureName;
                ItemImage.SetImage(GetTextureSrc(textrue));
                ItemBorder.SetHasClass('rare_' + ItemData.rarity, true);
                ItemBorder.SetPanelEvent('onmouseover', () => {
                    ShowCustomTooltip(ItemBorder, 'prop', item_key, -1, ItemData.rarity);
                });
                ItemBorder.SetPanelEvent('onmouseout', () => {
                    HideCustomTooltip();
                });
                // ItemBorder.SetDialogVariableInt("count", count);
                // ItemBorder.Data<PanelDataObject>().count = count
            }
            if (prop_count[item_key] == null) {
                prop_count[item_key] = count;
            } else {
                prop_count[item_key] += count;
            }

            ItemBorder.SetDialogVariable('count', '' + prop_count[item_key]);
        }
    });

    GameEvents.SendCustomGameEventToServer('MysticalShopSystem', {
        event_name: 'GetPlayerShopBuyData',
        params: {},
    });
    GameEvents.SendCustomGameEventToServer('RuneSystem', {
        event_name: 'GetPlayerRuneData',
        params: {},
    });
};
export const Init = () => {
    GameEvents.Subscribe('dota_player_pick_hero', event => {
        // $.Msg(["dota_player_pick_hero"])
        ItemList_Rune.RemoveAndDeleteChildren();
        ItemList_Shop.RemoveAndDeleteChildren();
    });

    CustomGameEventsSubscribe();
};

(function () {
    Init();
})();
