
import { DASHBOARD_NAVBAR } from './components';
import { HideCustomTooltip, ShowCustomTextTooltip } from '../utils/custom_tooltip';
import { FindOfficialHUDUI } from '../common/panel_operaton';


let open_board = false;

const DASHBOARD_LIST = Object.keys(DASHBOARD_NAVBAR);

const Initialize = () => {
    $.Msg(["FindOfficialHUDUI"])
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

    let MenuButtonsPanel = $("#MenuButtonsPanel");
    MenuButtonsPanel.RemoveAndDeleteChildren();
    // SettingsButton
    let SettingsButton = $.CreatePanel("Button", MenuButtonsPanel, "SettingsButton", { class: "DashboardButton" });
    // SettingsButton.BLoadLayoutSnippet("DashboardButton");
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
            let DashboardButton = $.CreatePanel("Button", MenuButtonsPanel, dashboard_id + "Button", { class: "DashboardButton" });
            SetDashboardButton(DashboardButton, dashboard_id)
        }
    }
}

const SetDashboardButton = (MenuButton: Button, dashboard_id: string) => {

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
