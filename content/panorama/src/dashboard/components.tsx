// 菜单列表

const IsTestMode = Game.IsInToolsMode()
const FindOfficialHUDUI = GameUI.CustomUIConfig().FindOfficialHUDUI;
export const DASHBOARD_NAVBAR = {

    // 个人档案
    "personal": {
        "Show": IsTestMode,
        "Sub": { // 子菜单
            "hero": true,
            "skill": true,
            "stone": true,
        }
    },

    "card": {
        "Show": IsTestMode,
        "Sub": {
            "handbook": true,
            "register": true,
        }
    },

    "backpack": {
        "Show": IsTestMode,
        "Sub": {
            "all": true,
            "type1": true,
            "type2": true,
        }
    },

};

/** 跳转到指定路由 */
export function DashboardRoute<
    T extends keyof typeof DASHBOARD_NAVBAR,
    N1 extends keyof typeof DASHBOARD_NAVBAR[T]
>(dashboard: T, nav: N1) {
    // $.Msg(["DashboardRoute", dashboard, nav]);
    const nav_str = nav as string;
    const DashboardList = $("#DashboardList");
    const DashboardButtonList = $("#DashboardButtonList");
    const select_id = dashboard + "_" + nav_str;
    for (let i = 0; i < DashboardList.GetChildCount(); i++) {
        const DashRows = DashboardList.GetChild(i)!;
        const DashRowsId = DashRows.id;
        const Dashbutton = DashboardButtonList.FindChildTraverse("Button" + DashRowsId);
        // 首先,等于时,切换到该dashboard
        const bEqual = dashboard == DashRowsId;
        DashRows.SetHasClass("Show", bEqual);
        if (Dashbutton) Dashbutton.SetHasClass("Selected", bEqual);

        if (bEqual) {
            const DashboardContainers = DashRows.FindChildTraverse("DashboardContainers")!;
            for (let t1 = 0; t1 < DashboardContainers.GetChildCount(); t1++) {
                const row_panel = DashboardContainers.GetChild(t1);
                const sub_id = row_panel?.id;
                row_panel?.SetHasClass("Show", sub_id == select_id);
            }

            const NavButtonList = DashRows.FindChildTraverse("NavButtonList");
            if (NavButtonList) {
                for (let t2 = 0; t2 < NavButtonList.GetChildCount(); t2++) {
                    let RowRadioButto = NavButtonList.GetChild(t2) as RadioButton;
                    let route = RowRadioButto.Data<PanelDataObject>().route;
                    RowRadioButto.checked = route == select_id;
                }
            }
        }
    }
};


const DASHBOARD_LIST = Object.keys(DASHBOARD_NAVBAR);
export const ClosedDashboard = (e: Panel) => {
    const DashboardList = $("#DashboardList");
    const DashboardButtonList = $("#DashboardButtonList");
    for (let id of DASHBOARD_LIST) {
        let row_board = DashboardList.FindChildTraverse(id);
        let row_button = DashboardButtonList.FindChildTraverse("Button" + id);
        if (row_board && row_button) {
            row_board.SetHasClass("Show", false);
            row_button.SetHasClass("Selected", false);
        };
    }
    DashboardList.SetHasClass("IsOpen", false);
};

const DashboardLoadingSpinner = FindOfficialHUDUI("DashboardLoadingSpinner")!;
export function ToggleDashboardLoading(open: boolean) {
    // DashboardLoadingSpinner.SetHasClass("Show", open)

}