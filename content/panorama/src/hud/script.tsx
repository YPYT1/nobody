import 'panorama-polyfill-x/lib/console';
import 'panorama-polyfill-x/lib/timers';

import { render, useGameEvent } from 'react-panorama-x';

import { MoveControll } from './component/move_control/move_control';
import { MessageContainer } from './component/message';
import { ResourceComponent } from './component/resource/resource';
import { ChapterSelect } from './component/chapter_select';
import { ArmsSelector } from './component/arms/arms_selector';
import { RuneSystemContainer } from './component/rune/rune_system';
import { ElementBondContainer } from './component/element_bond/element_bond';
import { BuffListContainer } from './component/center_stats/buff_list';
import { CenterStatsContainer } from './component/center_stats';
import { TopInfoContainer } from './component/top_Info';
import { HideCustomTooltip, ShowCustomTooltip } from '../utils/custom_tooltip';

let HudPanel: Panel;
let GamePhase: LabelPanel;
let GameSelectPhase = 0;

const HideOfficialLayoutUI = (e: Panel) => {

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

    HudPanel = e;
    // RegisterCustomTooltip();
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

const RegisterCustomTooltip = () => {

    $.RegisterForUnhandledEvent("DOTAShowAbilityTooltipForEntityIndex", function (panel: Panel, itemName: string, itemIndex: EntityIndex) {
        $.Schedule(0, () => {
            $.Msg([itemName, itemIndex])
            ShowCustomTooltip(panel, "ability", "", itemIndex)
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

const App = () => {

    useGameEvent("MapChapter_GetGameSelectPhase", event => {
        let data = event.data;
        let game_select_phase = data.game_select_phase;
        // $.Msg(["MapChapter_GetGameSelectPhase",data])
        if (GamePhase) { GamePhase.text = `GamePhase: ${game_select_phase}`; }
        if (HudPanel) {
            HudPanel.SetHasClass("GameSelectPhase_0", game_select_phase == 0);
            HudPanel.SetHasClass("GameSelectPhase_1", game_select_phase == 1);
            HudPanel.SetHasClass("GameSelectPhase_2", game_select_phase == 2);
            HudPanel.SetHasClass("GameSelectPhase_3", game_select_phase == 3);
            HudPanel.SetHasClass("GameSelectPhase_4", game_select_phase == 4);
            HudPanel.SetHasClass("GameSelectPhase_999", game_select_phase == 999);
        }
        // setGameSelectPhase(data.game_select_phase)
    })

    return (
        <Panel
            id='HUD'
            // className={`GameSelectPhase_0`}
            hittest={false}
            onload={HideOfficialLayoutUI}
        >
            <CenterStatsContainer />
            <MoveControll />
            <MessageContainer />

            <ResourceComponent />
            <ChapterSelect />
            <ArmsSelector />

            <RuneSystemContainer />
            <ElementBondContainer />
            <BuffListContainer />
            <TopInfoContainer />



            <Label id='GamePhase' text={`GamePhase: 0`} onload={(e) => { GamePhase = e; }} />
        </Panel>
    )
};

render(<App />, $.GetContextPanel());


// import { onMount } from 'solid-js';
// import { render } from 'solid-panorama-runtime';

// function HelloWorld() {
//     let root: Panel | undefined;
//     onMount(() => {
//         $.Msg(root);
//     });
//     return <Panel ref={root}></Panel>;
// }

// render(() => <HelloWorld />, $('#app'));