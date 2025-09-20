export const __COMPONENTS_NAME = 'card_item';

declare global {
    interface Component_CardItem extends Panel {
        _Init(): void;
        SetCardItem: (card_id: string, ShowCount?: boolean, ShowRarity?: boolean) => void;
        ShowCardIcon: (bShow: boolean) => void;
    }
}

const CardPanel = $.GetContextPanel() as Component_CardItem;
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;
const GetPictureCardData = GameUI.CustomUIConfig().GetPictureCardData;

const SetCardItem = (card_id: string, ShowCount: boolean = true, ShowRarity: boolean = true) => {
    const card_data = GetPictureCardData(card_id);
    const card_r = card_data.rarity;
    CardPanel.SetDialogVariableInt('count', 0);
    CardPanel.SetDialogVariable('card_name', $.Localize(`#custom_server_card_${card_id}`));
    CardPanel.SetHasClass('rare_' + card_r, true);
    CardPanel.Data<PanelDataObject>().card_id = card_id;
    CardPanel.Data<PanelDataObject>().rarity = card_r;
    CardPanel.Data<PanelDataObject>().has = 0;
    // 卡片图标
    const CardImage = CardPanel.FindChildTraverse('CardImage') as ImagePanel;
    const texture = GetTextureSrc(card_data.AbilityTextureName);
    CardImage.SetImage(texture);

    CardPanel.SetHasClass('ShowCount', ShowCount);
    CardPanel.SetHasClass('ShowRarity', ShowRarity);
    // CardPanel.Data<PanelDataObject>().name = $.Localize(`#custom_serveritem_${item_id}`)
};

const ShowCardIcon = (bShow: boolean) => {
    CardPanel.SetHasClass('ShowIcon', bShow);
};

(function () {
    CardPanel.SetCardItem = SetCardItem;
    CardPanel.ShowCardIcon = ShowCardIcon;
})();
