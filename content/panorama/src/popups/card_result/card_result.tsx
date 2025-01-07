import { LoadCustomComponent } from "../../dashboard/_components/component_manager";

const ContextPanel = $.GetContextPanel();
const CompoundCard = $("#CompoundCard");
const DuguaiMoviePanel = $("#DuguaiMoviePanel") as MoviePanel;
DuguaiMoviePanel.SetPanelEvent("onactivate", () => {
    DuguaiMoviePanel.RemoveClass("Show");
});

export const Init = () => {
    SetPopupsClosedBtn(CompoundCard);
    CustomEventSub();
}


const GetCompoundCardList = (event: NetworkedData<CustomGameEventDeclarations["ServiceInterface_GetCompoundCardList"]>) => {
    $.Msg(["GetCompoundCardList", event])
    let data = event.data;
    let type = data.type
    // ToggleDashboardLoading(false)
    // CardPopupsToggle("CompoundCard", true)
    ContextPanel.SetHasClass("Show", true);
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


const LoopPlayDdzBgm = () => {
    $.Msg(["LoopPlayDdzBgm", stop_loop_play])
    if (stop_loop_play) { 
        Game.StopSound(sound_handle)
        return 
    }
    sound_handle = Game.EmitSound("Custom.Doudizhu");
    music_loop = $.Schedule(15, LoopPlayDdzBgm)
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
    ContextPanel.RemoveClass("Show");
}

const CustomEventSub = () => {
    GameEvents.Subscribe("ServiceInterface_GetCompoundCardList", GetCompoundCardList)
}

(() => {
    Init();
    ContextPanel.SetHasClass("Show", false)

    // $.Msg(["11111"])
})();