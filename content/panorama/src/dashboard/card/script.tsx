import { DASHBOARD_NAVBAR } from './../components';

const DASHBOARD = 'card';
const SUB_OBJECT = DASHBOARD_NAVBAR[DASHBOARD].Sub;

const NavButtonList = $('#NavButtonList');
const ContentFrame = $('#ContentFrame');
const FRAME_PATH = 'file://{resources}/layout/custom_game/dashboard/card/';

export const Init = () => {
    InitRegisterCard();
    NavButtonList.RemoveAndDeleteChildren();
    ContentFrame.RemoveAndDeleteChildren();
    let order = 0;
    for (const sub_key in SUB_OBJECT) {
        const sub_state = SUB_OBJECT[sub_key as keyof typeof SUB_OBJECT];
        if (sub_state) {
            const radiobtn_id = `${DASHBOARD}_${sub_key}`;
            const NavRadioBtn = $.CreatePanel('RadioButton', NavButtonList, radiobtn_id);
            NavRadioBtn.BLoadLayoutSnippet('CardNavRadioButton');
            NavRadioBtn.SetDialogVariable('button_txt', $.Localize('#custom_dashboard_nav_' + radiobtn_id));
            NavRadioBtn.checked = order == 0;
            NavRadioBtn.SetPanelEvent('onselect', () => {
                for (const nav_key of Object.keys(SUB_OBJECT)) {
                    ContentFrame.SetHasClass(nav_key, nav_key == sub_key);
                }
            });

            const NavContent = $.CreatePanel('Panel', ContentFrame, radiobtn_id);
            const nav_path = `${FRAME_PATH}/${sub_key}/index.xml`;
            NavContent.BLoadLayout(nav_path, false, false);
            ContentFrame.SetHasClass(sub_key, order == 0);
            order++;
        }
    }
};

const Card_PopupsBg = $('#Card_PopupsBg');
const PlayerConsumeCard = $('#PlayerConsumeCard');
const InitRegisterCard = () => {
    SetPopupsClosedBtn(PlayerConsumeCard);
    SetBtn_PlayerConsumeCard(PlayerConsumeCard);
};

const SetBtn_PlayerConsumeCard = (e: Panel) => {
    const BtnConfirm = e.FindChildTraverse('BtnConfirm') as Button;
    BtnConfirm.SetPanelEvent('onactivate', () => {
        GameUI.CustomUIConfig().EventBus.publish('popup_loading', { show: true });
        const suit_id = e.Data<PanelDataObject>().suit_id;
        const card_id = e.Data<PanelDataObject>().card_id;
        GameEvents.SendCustomGameEventToServer('ServiceInterface', {
            event_name: 'PlayerConsumeCard',
            params: {
                suit_id: suit_id,
                card_id: card_id,
            },
        });
        ClosedPopups(e);
    });
};

const SetPopupsClosedBtn = (e: Panel) => {
    const ClosedPopupsBtn = e.FindChildTraverse('ClosedPopupsBtn')!;
    ClosedPopupsBtn.SetPanelEvent('onactivate', () => {
        ClosedPopups(e);
    });
};

const ClosedPopups = (e: Panel) => {
    e.AddClass('Closed');
    e.RemoveClass('Open');
    e.RemoveClass('Show');
    Card_PopupsBg.RemoveClass('Show');
};

(() => {
    Init();
})();
