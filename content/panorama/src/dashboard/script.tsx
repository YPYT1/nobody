// import React, { useRef, useState } from 'react';
// import { render, useGameEvent } from 'react-panorama-x';
// import { FindOfficialHUDUI, HideCustomTextTooltip, ShowCustomTextTooltip } from '../_global/method';
import { DASHBOARD_NAVBAR } from './components';

// import { Dashboard_Mall } from './mall';
// import { Dashboard_Archive } from './archive';
// import { Dashboard_Gacha } from './gacha';

import { DashboardPopups, RegisterKeyEscDashBoard } from './_popups';
import { HideCustomTooltip } from '../utils/custom_tooltip';
// import { StorePopups } from './mall/store/_store_popups';

// import { EquipContextMenu } from './archive/equip/_equip_contextmenu';
// import { ClearRecastingEquipPopups, DecomposePopups, ExtraDecomposePopups } from './archive/equip/_decompose';
// import { Dashboard_Profile } from './profile';
// import { DepcomposeRelicsPopups, RelicsConfirmPopups, SacrificeConfirmPopups } from './archive/relics/_relics_popups';
// import { EventEmitter } from 'events';
// import { RechargePopups } from './mall/store/_recharge_popups';
// import { CourierDecomposePopups } from './mall/courier/_decompose';
// import { Dashboard_Novice } from './novice';
// import { Dashboard_Ranking } from './ranking';
// import { setStorage } from '../utils/storage';
// import { EndlessRewardPopups } from './mall/store/_endless_reward_popups';
// import { Dashboard_Event } from './event';
// import { Popups_AbyssTickets } from './_popups/popups_abyss_tickets';
// import { Popups_AbyssReward } from './_popups/popups_abyss_reward';
// import { RuneContextMenu } from './archive/rune/_rune_contextmenu';
// import { RuneDecomposePopups } from './archive/rune/left_option/decompose';
// import { Dashboard_Handbook } from './handbook';
// import { Popups_Event_Nian } from './_popups/popups_event_nian';

let open_board = false;

const DASHBOARD_LIST = Object.keys(DASHBOARD_NAVBAR);

function ReturnButton() {

    return (
        <Button
            id='ReturnButton'
            className="DashboardButton"
            onactivate={() => {
                $.DispatchEvent('DOTAHUDShowDashboard');

                const GachaResults = $("#GachaResults");
                if (GachaResults) {
                    $.DispatchEvent("DropInputFocus", GachaResults);
                    GachaResults.SetAcceptsFocus(false);
                }

            }}
            onmouseover={(panel) => {
                // ShowCustomTextTooltip(panel, "", '#DOTA_HUD_BackToDashboard');
            }}
            onmouseout={(panel) => {
                // HideCustomTextTooltip();
            }}
        >

            <Panel className="TopbarIcon Exit"></Panel>
        </Button>
    );
}

function SettingsButton() {

    return (
        <Button
            id='SettingsButton'
            className="DashboardButton"
            onactivate={() => {
                $.DispatchEvent('DOTAShowSettingsPopup');
            }}
            onmouseover={(panel) => {
                // ShowCustomTextTooltip(panel, "", '#DOTA_HUD_Settings');

            }}
            onmouseout={(panel) => {
                // HideCustomTooltip();
            }}
        >
            <Panel className="TopbarIcon Setting" />
        </Button>
    );
}

// 档案 存档 装备 收集 商城
const DashboardButton = ({ board_id }: { board_id: string; }) => {

    let bonus_css = "";
    if (board_id == "Event") {
        bonus_css = "HintTip";
    }
    return (
        <Button
            id={"Button" + board_id}
            className={'DashboardButton ' + bonus_css}

            onload={(e) => {
                RegisterKeyEscDashBoard(e);
            }}

            onactivate={(e) => {
                e.RemoveClass("HintTip");
                const DashboardList = $("#DashboardList");
                const PlayerCurrency = $("#PlayerCurrency");
                const DashboardButtonList = e.GetParent()!;
                for (let id of DASHBOARD_LIST) {
                    let row_board = DashboardList.FindChildTraverse(id);
                    let row_button = DashboardButtonList.FindChildTraverse("Button" + id);
                    if (row_board && row_button) {
                        if (id == board_id) {
                            row_board.ToggleClass("Show");
                            row_button.ToggleClass("Selected");
                            open_board = e.BHasClass("Selected");
                            DashboardList.SetHasClass("IsOpen", open_board);
                            if (PlayerCurrency) {
                                PlayerCurrency.SetHasClass("IsOpen", open_board);
                            }

                            DashboardList.SetHasClass("IsClosed", !open_board);
                        } else {
                            row_board.SetHasClass("Show", false);
                            row_button.SetHasClass("Selected", false);
                        }
                    }

                }
                // 
                $.DispatchEvent("SetInputFocus", e);
            }}

            onmouseover={(panel) => {
                // ShowCustomTextTooltip(panel, "", `#dashboard_category_${board_id}`);
            }}
            onmouseout={(panel) => {
                // HideCustomTextTooltip();
            }}
        >
            <Panel className={'TopbarIcon ' + board_id} />
        </Button>
    );
};


function App() {

    // const game_difficulty = CustomNetTables.GetTableValue("game_setting", "game_difficulty")!;

    // useGameEvent("ServiceInterface_GetPlayerItem90", event => {
    //     let data = event.data;
    //     setStorage("ServerItem90", data);
    // });

    return (
        <Panel
            id="Dashboard"
            className='full-screen'
            hittest={false}
            onload={(e) => {


            }}
        >

            <Panel id='DashboardMainPage' hittest={false}>
                <Panel id="DashboardButtonList" className='flow-right'>
                    <ReturnButton />
                    <SettingsButton />
                    {
                        DASHBOARD_LIST.map((v, k) => {
                            return <DashboardButton key={k} board_id={v} />;
                        })
                    }
                </Panel>
                <Panel id="DashboardList" className='full-screen' hittest={false}>
                    

                </Panel>
            </Panel>

            {/* <Button id='GenericPopups' className='PopupsBackground' onactivate={() => { }}>
                <RechargePopups />
                <StorePopups />
                <RelicsConfirmPopups />
                <SacrificeConfirmPopups />
                <DepcomposeRelicsPopups />
                <DecomposePopups />
                <ExtraDecomposePopups />
                <ClearRecastingEquipPopups />
                <DashboardPopups />
                <CourierDecomposePopups />
                <EndlessRewardPopups />
                <Popups_AbyssTickets />
                <Popups_AbyssReward />
                <RuneDecomposePopups />
                <Popups_Event_Nian />
                <Panel id='PopupsLoading' className='VectorIcon Spinner Play' />
            </Button> */}
            {/* <Panel className='full-screen' hittest={false}>
                <EquipContextMenu />
                <RuneContextMenu />
            </Panel> */}
            <Panel id='PopupsDemoShow' className='PopupsBackground Show' visible={false} />
                
            

        </Panel>

    );
}


(() => {
    // 隐藏官方TOPBAR
    // render(<App />, $.GetContextPanel());
    // FindOfficialHUDUI("MenuButtons")!.visible = false;
})();
