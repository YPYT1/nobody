import { HideCustomTooltip, ShowCustomTooltip } from "../utils/custom_tooltip";

const screen = $("#screen");

const HideOfficialLayoutUI = () => {

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

const FindCursorItemID = (itemName: string) => {
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

    // $.RegisterForUnhandledEvent("DOTAShowAbilityTooltipForEntityIndex", function (
    //     Panel: Panel,
    //     ability_name: string,
    //     ability_index: EntityIndex,
    // ) {
    //     // $.Msg([ability_name, unit_index])
    //     $.Schedule(0, () => {
    //         // $.Msg([itemName, itemIndex])
    //         // let name = Entities.GetUnitName(ability_index);
    //         // $.Msg(["name",name])
    //         ShowCustomTooltip(Panel, "ability", ability_name,)
    //     })
    // })

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
    const layout_path = "file://{resources}/layout/custom_game/home/panel";

    const control = $("#control");
    control.RemoveAndDeleteChildren()
    control.BLoadLayout(layout_path + "/control/control.xml", true, false);
    $("#resource").BLoadLayout(layout_path + "/resource/resource.xml", true, false);
    $("#top_info").BLoadLayout(layout_path + "/top_info/top_info.xml", true, false);
    $("#chapter").BLoadLayout(layout_path + "/chapter/chapter.xml", true, false);
    $("#message").BLoadLayout(layout_path + "/message/message.xml", true, false);
    $("#mystical_shop").BLoadLayout(layout_path + "/mystical_shop/mystical_shop.xml", true, false);
    $("#element_bond").BLoadLayout(layout_path + "/element_bond/element_bond.xml", true, false);
    $("#hero_selection").BLoadLayout(layout_path + "/hero_selection/hero_selection.xml", true, false);
    $("#health_bar").BLoadLayout(layout_path + "/health_bar/health_bar.xml", true, false);
    $("#game_end").BLoadLayout(layout_path + "/game_end/game_end.xml", true, false);
    $("#scoreboard").BLoadLayout(layout_path + "/scoreboard/scoreboard.xml", true, false);
    $("#player_dialog").BLoadLayout(layout_path + "/player_dialog/player_dialog.xml", true, false);
    $("#npc_interact").BLoadLayout(layout_path + "/npc_interact/npc_interact.xml", true, false);
    $("#right_items").BLoadLayout(layout_path + "/right_items/right_items.xml", true, false);
    $("#talent").BLoadLayout(layout_path + "/talent/talent.xml", true, false);
    $("#mission").BLoadLayout(layout_path + "/mission/mission.xml", true, false);

    
    if (Game.IsInToolsMode()) {
        $("#development").BLoadLayout(layout_path + "/development/development.xml", true, false);
        $.GetContextPanel().SetHasClass("IsInToolsMode", true);
    }

    GameEvents.Subscribe("MapChapter_GetGameSelectPhase", event => {
        let data = event.data;
        let game_select_phase = data.game_select_phase;
        $("#top_info").Data<PanelDataObject>().GameSelectPhase = game_select_phase
        let HudPanel = $.GetContextPanel();
        if (HudPanel) {
            for (let phase = 0; phase < 10; phase++) {
                HudPanel.SetHasClass("GameSelectPhase_" + phase, game_select_phase == phase);
            }
            HudPanel.SetHasClass("GameSelectPhase_999", game_select_phase == 999);
            if (game_select_phase != 999 && game_select_phase != 2) {
                screen.RemoveClass("Play");
                screen.AddClass("Play");
            }
        }
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

const DelayLoadFunc = () => {
    GameEvents.SendCustomGameEventToServer("MapChapter", {
        event_name: 'NewPlay',
        params: {}
    })
}

(function () {
    let MainPanel = $.GetContextPanel();
    Initialize();
    HideOfficialLayoutUI();
    RegisterCustomTooltip();
    // DelayLoadFunc();
})();

