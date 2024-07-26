
import { DASHBOARD_NAVBAR } from './components';
import { HideCustomTooltip, ShowCustomTextTooltip } from '../utils/custom_tooltip';
import { FindOfficialHUDUI } from '../common/panel_operaton';

const DashboardList = $("#DashboardList");
let open_board = false;

const DASHBOARD_LIST = Object.keys(DASHBOARD_NAVBAR);

const Initialize = () => {
    FindOfficialHUDUI("MenuButtons")!.visible = false;
    CreateMenuButtons()
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

    let MenuButtonList = $("#MenuButtonList");
    MenuButtonList.RemoveAndDeleteChildren();
    // SettingsButton
    let SettingsButton = $.CreatePanel("RadioButton", MenuButtonList, "settingsButton", {
        class: 'DashboardButton',
        group: 'MenuRadioGroup',
    });
    SettingsButton.BLoadLayoutSnippet("DashboardButton");
    // const DashboardButton = SettingsButton.FindChildTraverse("DashboardButton") as Button;
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
    for (let dashboard_id in DASHBOARD_NAVBAR) {
        let row_data = DASHBOARD_NAVBAR[dashboard_id as keyof typeof DASHBOARD_NAVBAR];
        if (row_data.Show) {
            let DashboardButton = $.CreatePanel("RadioButton", MenuButtonList, dashboard_id + "Button", {
                class: 'DashboardButton',
                group: 'MenuRadioGroup',
            });
            DashboardButton.BLoadLayoutSnippet("DashboardButton")
            SetDashboardButton(DashboardButton, dashboard_id)
        }
    }

    DashboardList.RemoveAndDeleteChildren()
    // let personal = $.CreatePanel("Panel", DashboardList, "personal",{
    //     class:"DashBoardPanel"
    // });
    // personal.BLoadLayout("file://{resources}/layout/custom_game/dashboard/personal/index.xml", true, false);

}

const SetDashboardButton = (MenuButton: Button, dashboard_id: string) => {
    // const DashboardButton = MenuButton.FindChildTraverse("DashboardButton") as Button;
    MenuButton.SetPanelEvent("onactivate", () => {
        $.Msg(["MenuButton onactivate", dashboard_id])
        // $.DispatchEvent('DOTAShowSettingsPopup');
    })
    MenuButton.SetPanelEvent("onmouseover", () => {
        ShowCustomTextTooltip(MenuButton, "", dashboard_id);
    })
    MenuButton.SetPanelEvent("onmouseout", () => {
        HideCustomTooltip();
    })

}

(() => {
    Initialize();
})();
