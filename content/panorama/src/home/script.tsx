import { render } from "react-panorama-x";
import { HideCustomTooltip, ShowCustomTooltip } from "../utils/custom_tooltip";
// import "./panel/control/control";

export const HideOfficialLayoutUI = () => {

    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_TOP_TIMEOFDAY, false);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_TOP_HEROES, false);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ACTION_PANEL, false);
    // 小地图
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ACTION_MINIMAP, false);
    // 击杀
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_KILLCAM, false);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_QUICK_STATS, false);
    // 官方经济相关面板
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_PANEL, true);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_SHOP, false);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_ITEMS, true);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_QUICKBUY, true);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_COURIER, false);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_AGHANIMS_STATUS, false);


}

export const FindCursorItemID = (itemName: string) => {
    var entities = GameUI.FindScreenEntities(GameUI.GetCursorPosition());
    if (entities) {
        for (let k in entities) {
            let entity = entities[k].entityIndex;
            // $.Msg([entity,Entities.IsItemPhysical(entity)])
            if (Entities.IsItemPhysical(entity)) {
                let idx = Entities.GetContainedItem(entity) as number;
                idx &= ~0xFFFFC000;
                let item_index = idx as ItemEntityIndex
                if (Abilities.GetAbilityName(item_index) == itemName) {
                    return item_index;
                }
            }
        }
    }

    return -1 as ItemEntityIndex;
};

export const RegisterCustomTooltip = () => {

    $.RegisterForUnhandledEvent("DOTAShowAbilityTooltip", function (panel: Panel, itemName: string) {
        $.Schedule(0, () => {
            ShowCustomTooltip(panel, "ability", itemName)
        })
    })

    $.RegisterForUnhandledEvent("DOTAHideAbilityTooltip", function (
        panel: Panel, itemName: string) {
        HideCustomTooltip()
    })

    $.RegisterForUnhandledEvent("DOTAShowAbilityTooltipForEntityIndex", function (
        Panel: Panel,
        ability_name: string,
        ability_index: EntityIndex,
    ) {
        // $.Msg([ability_name, unit_index])
        $.Schedule(0, () => {
            // $.Msg([itemName, itemIndex])
            // let name = Entities.GetUnitName(ability_index);
            // $.Msg(["name",name])
            ShowCustomTooltip(Panel, "ability", ability_name,)
        })
    })

    $.RegisterForUnhandledEvent("DOTAShowDroppedItemTooltip", function (panel, x, y, itemName: string, num, boolean) {
        $.Msg(["DOTAShowDroppedItemTooltip"])
        // let TooltipPanel = $("#CustomItemTooltip");
        // TooltipPanel.SetPositionInPixels(x / panel.actualuiscale_x, y / panel.actualuiscale_y, 0);
        let ItemIndex = FindCursorItemID(itemName);
        // //$.Msg([itemName,ItemIndex])
        $.Schedule(0, function () {
            ShowCustomTooltip(panel, "item", "", ItemIndex);
        });

    });

    $.RegisterForUnhandledEvent("DOTAHideDroppedItemTooltip", function () {
        HideCustomTooltip();
    });

}

export const Initialize = () => {
    $("#control").BLoadLayout("file://{resources}/layout/custom_game/home/panel/control/control.xml", true, false);
    $("#resource").BLoadLayout("file://{resources}/layout/custom_game/home/panel/resource/resource.xml", true, false);
    $("#top_info").BLoadLayout("file://{resources}/layout/custom_game/home/panel/top_info/top_info.xml", true, false);
    $("#chapter").BLoadLayout("file://{resources}/layout/custom_game/home/panel/chapter/chapter.xml", true, false);

    GameEvents.Subscribe("MapChapter_GetGameSelectPhase", event => {
        let data = event.data;
        let game_select_phase = data.game_select_phase;
        // $.Msg(["MapChapter_GetGameSelectPhase",data])
        // if (GamePhase) { GamePhase.text = `GamePhase: ${game_select_phase}`; }
        let HudPanel = $.GetContextPanel();
        if (HudPanel) {
            HudPanel.SetHasClass("GameSelectPhase_0", game_select_phase == 0);
            HudPanel.SetHasClass("GameSelectPhase_1", game_select_phase == 1);
            HudPanel.SetHasClass("GameSelectPhase_2", game_select_phase == 2);
            HudPanel.SetHasClass("GameSelectPhase_3", game_select_phase == 3);
            HudPanel.SetHasClass("GameSelectPhase_4", game_select_phase == 4);
            HudPanel.SetHasClass("GameSelectPhase_999", game_select_phase == 999);
        }
        HudPanel.SetDialogVariableInt("game_phase", data.game_select_phase)
        // setGameSelectPhase(data.game_select_phase)
    })

    GameEvents.SendCustomGameEventToServer("MapChapter", {
        event_name: "GetDifficultyMax",
        params: {}
    })

    GameEvents.SendCustomGameEventToServer("MapChapter", {
        event_name: "GetGameSelectPhase",
        params: {}
    })
}

(function () {
    Initialize();
    HideOfficialLayoutUI();
    RegisterCustomTooltip();
})();

