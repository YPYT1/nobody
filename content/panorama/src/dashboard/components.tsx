import React from 'react';

// 菜单列表
export const DASHBOARD_NAVBAR = {

    // 存档系统
    "Archive": {
        "Show": false,
        "Sub": {
            "Equip": true,
            "Rune": true,
        }
    },

    // 商城
    "Mall": {
        "Store": true, // 商城
    },

    // 抽奖
    "Gacha": {
        "Main": true,
    },

    "Novice": {
        "Main": true,
    },

    "Ranking": {
        "Main": true,
    },

    "Handbook": {
        "Main": true,
    },

};


export function NavbarButton<
    T extends keyof typeof DASHBOARD_NAVBAR,
    N1 extends keyof typeof DASHBOARD_NAVBAR[T]
>({ dashboard, nav, selected, show }: { dashboard: T; nav: N1; selected: boolean; show: boolean; }) {
    const nav_str = nav as string;
    return (
        <RadioButton
            className='NavbarButton'
            group={dashboard + "group"}
            selected={selected}
            visible={show}
            onload={(e) => {
                e.Data<PanelDataObject>().route = `${dashboard}_${nav_str}`;
                // if (selected) {
                //     const select_id = dashboard + "_" + nav_str;
                //     const NavDashboard = $("#" + dashboard);
                //     const DashboardContainers = NavDashboard.FindChildTraverse("DashboardContainers")!;
                // }
            }}
            onactivate={() => {
                DashboardRoute(dashboard, nav);
            }}
        >
            <Panel className='Selected' />
            <Label localizedText={`#dashboard_nav_${nav_str}`} />
        </RadioButton>
    );
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

// export const CServerStoreLabel = ({ item_id }: { item_id: string; }) => {
//     let item_data = ServerItemList[item_id as "1"];
//     let item_text = "null";
//     if (item_data != null) {
//         item_text = $.Localize("#custom_server_server_item_list_" + item_id);
//     }

//     return <Label className='CServerStoreLabel' text={item_text} />;
// };

// export const CServerStoreDesc = ({ item_id }: { item_id: string; }) => {
//     let item_data = ServerItemList[item_id as "1"];
//     let item_text = "null";
//     if (item_data != null) {
//         item_text = $.Localize("#custom_server_server_item_list_" + item_id + "_Description");
//     }

//     return <Label className='CServerStoreDesc' text={item_text} />;
// };

// export const GetServerItemRarity = (item_id: string) => {
//     let item_data = ServerItemList[item_id as "1"];
//     let rarity = 0;
//     if (item_data != null) {
//         rarity = item_data.rarity;
//     }
//     return rarity;
// };

// export const GetServerItemSrc = (item_id: string) => {
//     let item_data = ServerItemList[item_id as "1"];
//     let AbilityTextureName = "";
//     if (item_data != null) {
//         AbilityTextureName = item_data.AbilityTextureName;
//     }
//     return GetTextureSrc(AbilityTextureName);
// };





const DASHBOARD_LIST = Object.keys(DASHBOARD_NAVBAR);
export const ClosedDashboard = (e: Panel) => {
    const DashboardList = $("#DashboardList");
    const PlayerCurrency = $("#PlayerCurrency");
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