import { SetLabelDescriptionExtra } from "../../../utils/ability_description";
import { default as RuneConfigJson } from "./../../../json/config/game/rune/rune_config.json"

type runeName = keyof typeof RuneConfigJson

const PlayerReviveContainer = $("#PlayerReviveContainer");
const PlayerRuneContainer = $("#PlayerRuneContainer");
const LocalPlayerRuneDialog = $("#LocalPlayerRuneDialog");
const RuneSelectList = $("#RuneSelectList");
const RefreshBtn = $("#RefreshBtn") as Button;
const localPlayer = Game.GetLocalPlayerID();
const BarHeight = 250

const StartThinkerLoop = () => {
    // UpdateLocalPlayerReviveState()
    UpdateLocalPlayerRuneDialog();
    $.Schedule(Game.GetGameFrameTime(), StartThinkerLoop)
}

const UpdateLocalPlayerRuneDialog = () => {
    const entity = Players.GetPlayerHeroEntityIndex(localPlayer);
    const pos = Entities.GetAbsOrigin(entity);
    // $.Msg(pos)
    if (pos == null) { return }
    let fOffset = Entities.GetHealthBarOffset(entity);
    fOffset = (fOffset === -1 || fOffset < BarHeight) ? BarHeight : fOffset;
    let xUI = Game.WorldToScreenX(pos[0], pos[1], pos[2] + fOffset);
    let yUI = Game.WorldToScreenY(pos[0], pos[1], pos[2] + fOffset);
    if (xUI < 0 || xUI > Game.GetScreenWidth() || yUI < 0 || yUI > Game.GetScreenHeight()) {
        LocalPlayerRuneDialog.visible = false;
        return;
    }
    LocalPlayerRuneDialog.visible = true;
    const [clampX, clampY] = GameUI.WorldToScreenXYClamped(pos);
    // $.Msg([clampX, clampY])
    const diffX = clampX - 0.5;
    const diffY = clampY - 0.5;
    xUI -= diffX * Game.GetScreenWidth() * 0.16;
    yUI -= diffY * Game.GetScreenHeight() * 0.10;

    let xoffset = 0;
    let yoffset = -30;
    LocalPlayerRuneDialog.SetPositionInPixels(
        (xUI - LocalPlayerRuneDialog.actuallayoutwidth / 2 - xoffset) / LocalPlayerRuneDialog.actualuiscale_x,
        (yUI - LocalPlayerRuneDialog.actuallayoutheight + yoffset) / LocalPlayerRuneDialog.actualuiscale_y,
        0,
    );
    let game_time = Game.GetDOTATime(false, false);
    let over_time = LocalPlayerRuneDialog.Data<PanelDataObject>().over_time;
    let select_timer = Math.floor(over_time - game_time)
    LocalPlayerRuneDialog.SetDialogVariableInt("select_timer", select_timer)
}



export const Init = () => {
    // PlayerReviveContainer.RemoveAndDeleteChildren();
    // PlayerRuneContainer.RemoveAndDeleteChildren()
    StartThinkerLoop();
    LocalPlayerRuneDialog.SetDialogVariableInt("refresh_count", 99);
    LocalPlayerRuneDialog.SetDialogVariableInt("select_timer", 99);

    RefreshBtn.SetPanelEvent("onactivate", () => {
        GameEvents.SendCustomGameEventToServer("RuneSystem", {
            event_name: "ConsumeRefreshCount",
            params: {}
        })
    })

    GameEvents.Subscribe("RuneSystem_GetRuneSelectData", event => {
        let data = event.data;
        let time = data.time;
        LocalPlayerRuneDialog.Data<PanelDataObject>().over_time = time
        LocalPlayerRuneDialog.SetDialogVariableInt("refresh_count", data.player_refresh_count);
        // $.Msg(["RuneSystem_GetRuneSelectData", data])
        let is_new = data.is_new_fate_check == 1;
        let rune_list = Object.values(data.item_list)
        RuneSelectList.RemoveAndDeleteChildren();
        let select_index = 0;
        for (let _data of rune_list) {
            let level = _data.level;
            let index = _data.level_index;
            let name = _data.name as runeName;
            let RuneInfo = $.CreatePanel("Panel", RuneSelectList, "");
            RuneInfo.BLoadLayoutSnippet("RuneInfo");
            let row_rune_data = RuneConfigJson[name];
            let ObjectValues = row_rune_data.ObjectValues;
            let AbilityValues = row_rune_data.AbilityValues;
            let rune_desc = SetLabelDescriptionExtra($.Localize(`#custom_${name}_Description`), index, AbilityValues, ObjectValues);
            $.Msg(["rune_desc", rune_desc])
            RuneInfo.SetDialogVariable("rune_desc", rune_desc)

            let RuneIconBtn = RuneInfo.FindChildTraverse("RuneIconBtn") as Button;
            let post_index = select_index
            RuneIconBtn.SetPanelEvent("onactivate", () => {
                // $.Msg(["select_index", post_index])
                GameEvents.SendCustomGameEventToServer("RuneSystem", {
                    event_name: "PostSelectRune",
                    params: {
                        index: post_index
                    }
                })

            })
            select_index++
        }
        LocalPlayerRuneDialog.SetHasClass("Show", is_new)
    })

    GameEvents.SendCustomGameEventToServer("RuneSystem", {
        event_name: "GetRuneSelectData",
        params: {}
    })
}

(function () {
    Init()
})();