
import { DASHBOARD_NAVBAR, ToggleDashboardLoading } from './../components';

const DASHBOARD = "card";
const SUB_OBJECT = DASHBOARD_NAVBAR[DASHBOARD].Sub;

const NavButtonList = $("#NavButtonList");
const ContentFrame = $("#ContentFrame");

const FRAME_PATH = "file://{resources}/layout/custom_game/dashboard/card/";


export const Init = () => {
    $.Msg(["card Layout"])
    // 加载nav button
    NavButtonList.RemoveAndDeleteChildren();
    ContentFrame.RemoveAndDeleteChildren();
    let order = 0;
    for (let sub_key in SUB_OBJECT) {
        let sub_state = SUB_OBJECT[sub_key as keyof typeof SUB_OBJECT];
        if (sub_state) {
            let radiobtn_id = `${DASHBOARD}_${sub_key}`
            let NavRadioBtn = $.CreatePanel("RadioButton", NavButtonList, radiobtn_id);
            NavRadioBtn.BLoadLayoutSnippet("CardNavRadioButton");
            NavRadioBtn.SetDialogVariable("button_txt", $.Localize("#custom_dashboard_nav_" + radiobtn_id))
            NavRadioBtn.checked = order == 0;
            NavRadioBtn.SetPanelEvent("onactivate", () => {
                for (let nav_key of Object.keys(SUB_OBJECT)) {
                    ContentFrame.SetHasClass(nav_key, nav_key == sub_key)
                }

            })

            let NavContent = $.CreatePanel("Panel", ContentFrame, radiobtn_id);
            let nav_path = `${FRAME_PATH}/${sub_key}/index.xml`;
            NavContent.BLoadLayout(nav_path, true, false);
            ContentFrame.SetHasClass(sub_key, order == 0)
            order++;
        }
    }

    InitCardPopups();
    CustomEventSub();
}

// Card Popups
const PopupsBackground = $("#Card_PopupsBg");
const CompoundCard = $("#CompoundCard");
const PlayerConsumeCard = $("#PlayerConsumeCard")

const InitCardPopups = () => {
    SetPopupsClosedBtn(CompoundCard);
    SetPopupsClosedBtn(PlayerConsumeCard);

    SetBtn_PlayerConsumeCard(PlayerConsumeCard);
}

const SetBtn_PlayerConsumeCard = (e: Panel) => {
    const BtnConfirm = e.FindChildTraverse("BtnConfirm") as Button;

    BtnConfirm.SetPanelEvent("onactivate", () => {
        ToggleDashboardLoading(true)
        let suit_id = e.Data<PanelDataObject>().suit_id;
        let card_id = e.Data<PanelDataObject>().card_id;
        GameEvents.SendCustomGameEventToServer("ServiceInterface", {
            event_name: "PlayerConsumeCard",
            params: {
                suit_id: suit_id,
                card_id: card_id,
            }
        })
        ClosedPopups(e)
    })



}
const SetPopupsClosedBtn = (e: Panel) => {
    const ClosedPopupsBtn = e.FindChildTraverse("ClosedPopupsBtn");
    ClosedPopupsBtn?.SetPanelEvent("onactivate", () => {
        ClosedPopups(e)

    })
}

const ClosedPopups = (e: Panel) => {
    e.AddClass("Closed");
    e.RemoveClass("Open");
    PopupsBackground.RemoveClass("Show");
}

const GetCompoundCardList = (event: NetworkedData<CustomGameEventDeclarations["ServiceInterface_GetCompoundCardList"]>) => {
    let data = event.data;
    $.Msg(["GetCompoundCardList", data])
}

const CustomEventSub = () => {

    GameEvents.Subscribe("ServiceInterface_GetCompoundCardList", GetCompoundCardList)

    GameEvents.Subscribe("custom_client_popups", event => {
        $.Msg(["custom_client_popups", event])
    })
}

(() => {
    // ces
    ToggleDashboardLoading(false)
    Init();
})();