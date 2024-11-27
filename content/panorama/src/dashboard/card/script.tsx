
import { DASHBOARD_NAVBAR, ToggleDashboardLoading } from './../components';
import { LoadCustomComponent } from '../_components/component_manager';
import { CardPopupsToggle } from './_popups';

const DASHBOARD = "card";
const SUB_OBJECT = DASHBOARD_NAVBAR[DASHBOARD].Sub;

const NavButtonList = $("#NavButtonList");
const ContentFrame = $("#ContentFrame");
const FRAME_PATH = "file://{resources}/layout/custom_game/dashboard/card/";


export const Init = () => {
    // $.Msg(["card Layout"])
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
const DuguaiMoviePanel = $("#DuguaiMoviePanel") as MoviePanel;
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

let music_loop = -1;
let stop_loop_play = false;
let sound_handle = 0;

const SetPopupsClosedBtn = (e: Panel) => {
    const ClosedPopupsBtn = e.FindChildTraverse("ClosedPopupsBtn");
    ClosedPopupsBtn?.SetPanelEvent("onactivate", () => {
        // 关闭音乐
        $.CancelScheduled(music_loop as ScheduleID);
        stop_loop_play = true;
        Game.StopSound(sound_handle)
        ClosedPopups(e)
    })
}

const ClosedPopups = (e: Panel) => {
    e.AddClass("Closed");
    e.RemoveClass("Open");
    e.RemoveClass("Show");
    PopupsBackground.RemoveClass("Show");
}

const GetCompoundCardList = (event: NetworkedData<CustomGameEventDeclarations["ServiceInterface_GetCompoundCardList"]>) => {
    // $.Msg(["GetCompoundCardList", event])
    let data = event.data;
    let type = data.type
    ToggleDashboardLoading(false)
    CardPopupsToggle("CompoundCard", true)
    CompoundCard.SetHasClass("Gambling", type == 1)
    if (type == 1) {
        stop_loop_play = false;
        LoopPlayDdzBgm();
        DuguaiMoviePanel.Play()
        DuguaiMoviePanel.AddClass("Show")
        $.Schedule(3, () => {
            DuguaiMoviePanel.RemoveClass("Show")
        })
    }
    const CompoundCardList = CompoundCard.FindChildTraverse("CompoundCardList")!;
    CompoundCardList.RemoveAndDeleteChildren()
    let list = Object.values(data.card)
    for (let card_id of list) {
        let cardPanel = $.CreatePanel("Panel", CompoundCardList, card_id);
        cardPanel.BLoadLayoutSnippet("CompoundCardItem");
        const CardInfo = cardPanel.FindChildTraverse("CardInfo")!;
        const CardItem = LoadCustomComponent(CardInfo, "card_item");
        CardItem.SetCardItem(card_id, false, false)
        CardItem.ShowCardIcon(true);
        const DragPanel = cardPanel.FindChildTraverse("DragPanel")!;
        DragPanel.SetDraggable(true);
        $.RegisterEventHandler('DragStart', DragPanel, CompoundCard_OnDragStart);
        $.RegisterEventHandler('DragEnd', DragPanel, CompoundCard_DragEnd);
    }
}

const LoopPlayDdzBgm = () => {
    $.Msg(["LoopPlayDdzBgm", stop_loop_play])
    if (stop_loop_play) { return }
    sound_handle = Game.EmitSound("Custom.Doudizhu");
    music_loop = $.Schedule(15, LoopPlayDdzBgm)
}
const CompoundCard_OnDragStart = (panel: Panel, dragCallbacks: Panel) => {

    panel.visible = false;
    let displayPanel = $.CreatePanel("Panel", $.GetContextPanel(), "drag_CardImage");
    displayPanel.BLoadLayoutSnippet("CardBackPanel");

    displayPanel.Data<PanelDataObject>().m_DragCompleted = false; // whether the drag was successful

    const offset = panel.GetPositionWithinWindow()
    const origin_x = offset.x
    const origin_y = offset.y
    const cursor_offset = GameUI.GetCursorPosition()

    const offsetX = cursor_offset[0] - offset.x
    const offsetY = cursor_offset[1] - offset.y
    // $.Msg(offset,mouse_offset)
    // hook up the display panel, and specify the panel offset from the cursor
    dragCallbacks.displayPanel = displayPanel;
    dragCallbacks.offsetX = offsetX;
    dragCallbacks.offsetY = offsetY;

    // grey out the source panel while dragging
    // $.GetContextPanel().AddClass("dragging_from");
    return true;
}
const CompoundCard_DragEnd = (panel: Panel, draggedPanel: Panel) => {
    draggedPanel.DeleteAsync(0);
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