
import { DASHBOARD_NAVBAR } from './components';
import { HideCustomTooltip, ShowCustomTextTooltip } from '../utils/custom_tooltip';

// import { FindOfficialHUDUI } from '../common/panel_operaton';
const ContentPanel = $.GetContextPanel();
const DashboardList = $("#DashboardList");
const DashboardButtonList = $("#DashboardButtonList");
const DASHBOARD_LIST = Object.keys(DASHBOARD_NAVBAR);
const dashboard_path = "file://{resources}/layout/custom_game/dashboard/";
const localPlayer = Game.GetLocalPlayerID();
let open_board = false;

const Initialize = () => {
    GameUI.CustomUIConfig().FindOfficialHUDUI("MenuButtons")!.visible = false;
    const DashboardLoadingSpinner = GameUI.CustomUIConfig().FindOfficialHUDUI("DashboardLoadingSpinner")!;
    DashboardLoadingSpinner.SetHasClass("Show", false)
    CreateMenuButtons();
    GetServerTime();
}

const CreateMenuButtons = () => {
    // ReturnButton
    let ReturnButton = $("#ReturnButton");
    ReturnButton.SetPanelEvent("onactivate", () => {
        $.DispatchEvent('DOTAHUDShowDashboard');
    })
    ReturnButton.SetPanelEvent("onmouseover", () => {
        ShowCustomTextTooltip(ReturnButton, "", '#DOTA_HUD_BackToDashboard');
    })
    ReturnButton.SetPanelEvent("onmouseout", () => {
        HideCustomTooltip();
    })


    DashboardButtonList.RemoveAndDeleteChildren();
    // SettingsButton
    let SettingsButton = $.CreatePanel("Button", DashboardButtonList, "settingsButton", {
        class: 'DashboardButton',
        group: 'MenuRadioGroup',
    });
    SettingsButton.BLoadLayoutSnippet("DashboardButton");
    SettingsButton.SetPanelEvent("onactivate", () => {
        $.DispatchEvent('DOTAShowSettingsPopup');
    })
    SettingsButton.SetPanelEvent("onmouseover", () => {
        ShowCustomTextTooltip(SettingsButton, "", '#DOTA_HUD_Settings');
    })
    SettingsButton.SetPanelEvent("onmouseout", () => {
        HideCustomTooltip();
    })

    // 其他按钮
    const DASHBOARD_NAVBAR_LIST = Object.entries(DASHBOARD_NAVBAR)
    $.Each(DASHBOARD_NAVBAR_LIST, (data, i) => {
        const dashboard_id = data[0];
        const row_data = data[1];
        // $.Msg(["dashboard_id",dashboard_id])
        // let row_data = DASHBOARD_NAVBAR[dashboard_id as keyof typeof DASHBOARD_NAVBAR];
        if (row_data.Show) {
            let DashboardButton = $.CreatePanel("Button", DashboardButtonList, dashboard_id + "Button", {
                class: 'DashboardButton',
            });
            DashboardButton.BLoadLayoutSnippet("DashboardButton")
            SetDashboardButton(DashboardButton, dashboard_id)
            let DashboardPanel = DashboardList.FindChildTraverse(dashboard_id)!;
            if (DashboardPanel == null) {
                DashboardPanel = $.CreatePanel("Panel", DashboardList, dashboard_id);
                DashboardPanel.BLoadLayout(dashboard_path + dashboard_id + "/index.xml", false, false);
            }

            const DashboardClosedBtn = DashboardPanel.FindChildTraverse("DashboardClosedBtn");
            if (DashboardClosedBtn) {
                DashboardClosedBtn.SetPanelEvent("onactivate", () => {
                    DashboardPanel.SetHasClass("Show", false);
                    DashboardButton.SetHasClass("Selected", false);
                    DashboardList.SetHasClass("IsOpen", false);
                })
            }
        }
    })

    DashboardList.SetHasClass("IsOpen", false);
}

const RegisterKeyEscDashBoard = (e: Panel) => {
    $.RegisterKeyBind(e, "key_Escape", () => {
        $.DispatchEvent("DropInputFocus", e);
        for (let id in DASHBOARD_NAVBAR) {
            let row_board = DashboardList.FindChildTraverse(id);
            let row_button = DashboardButtonList.FindChildTraverse(id + "Button");
            if (row_board && row_button) {
                row_board.RemoveClass("Show");
                row_button.RemoveClass("Selected");
            }

        }
        DashboardList.SetHasClass("IsOpen", false);
    });
};



const SetDashboardButton = (MenuButton: Button, dashboard_id: string) => {
    // const DashboardButton = MenuButton.FindChildTraverse("DashboardButton") as Button;
    MenuButton.SetPanelEvent("onactivate", () => {
        for (let id in DASHBOARD_NAVBAR) {
            let row_board = DashboardList.FindChildTraverse(id);
            let row_button = DashboardButtonList.FindChildTraverse(id + "Button");
            if (row_board && row_button) {
                if (id == dashboard_id) {
                    row_board.ToggleClass("Show");
                    row_button.ToggleClass("Selected");
                    open_board = MenuButton.BHasClass("Selected");
                    DashboardList.SetHasClass("IsOpen", open_board);
                } else {
                    row_board.SetHasClass("Show", false);
                    row_button.SetHasClass("Selected", false);
                }
            }
        }

        $.DispatchEvent("SetInputFocus", MenuButton);

    })

    MenuButton.SetPanelEvent("onmouseover", () => {
        ShowCustomTextTooltip(MenuButton, "", dashboard_id);
    })
    MenuButton.SetPanelEvent("onmouseout", () => {
        HideCustomTooltip();
    })

    // 注册
    RegisterKeyEscDashBoard(MenuButton);

}

function GetServerTime() {

    GameEvents.Subscribe("ServiceInterface_GetServerTime", event => {
        let data = event.data;
        let time_string = event.data.time_string;
        GameUI.CustomUIConfig().setStorage("unix_time", data.time)
        const unix_date = new Date(Date.UTC(
            time_string.yy,
            time_string.mm - 1,
            time_string.dd,
            0,
            0,
            0,
        ));
        let today_time = Math.floor(unix_date.getTime() / 1000) - 28800;
        GameUI.CustomUIConfig().setStorage("today_time", today_time)
    })

    GameEvents.SendCustomGameEventToServer("ServiceInterface", {
        event_name: "GetServerTime",
        params: {}
    })
}

function DashboardRoute<
    Key extends keyof typeof DASHBOARD_NAVBAR,
    T2 extends typeof DASHBOARD_NAVBAR[Key],
>(dashboard_id: Key, nav: keyof T2["Sub"]) {
    const sub = nav as string;
    for (let id in DASHBOARD_NAVBAR) {
        let row_board = DashboardList.FindChildTraverse(id);
        let row_button = DashboardButtonList.FindChildTraverse(id + "Button");
        if (row_board && row_button) {
            if (id == dashboard_id) {
                row_board.ToggleClass("Show");
                row_button.ToggleClass("Selected");
                DashboardList.SetHasClass("IsOpen", true);
                $.DispatchEvent("SetInputFocus", row_button);
            } else {
                row_board.SetHasClass("Show", false);
                row_button.SetHasClass("Selected", false);
            }
        }
    }

    // 然后查找
    const SunNavFrame = DashboardList.FindChildTraverse(dashboard_id)!;
    const NavButtonList = SunNavFrame.FindChildTraverse("NavButtonList")!;
    const route_id = `${dashboard_id}_${sub}`;
    const TargetNavBtn = NavButtonList.FindChildTraverse(`${route_id}`) as RadioButton;
    if (TargetNavBtn) { TargetNavBtn.checked = true; }
}


(() => {
    GameUI.CustomUIConfig().DashboardRoute = DashboardRoute;
    Initialize();
})();
