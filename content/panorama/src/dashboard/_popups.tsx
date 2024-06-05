import React from 'react';
import { DASHBOARD_NAVBAR } from './components';


export const ShowErrorDashboardPopups = (popups_title: string, popups_desc: string) => {
    const DashboardPopups = $("#DashboardPopups");
    DashboardPopups.SetDialogVariable("popups_title", popups_title);
    DashboardPopups.SetDialogVariable("popups_desc", popups_desc);
    GenericPopupsToggle("DashboardPopups", true);
};
// 弹窗
export const DashboardPopups = () => {

    return (

        <Panel id='DashboardPopups' className='Popups'>
            <Panel className='PopupsHeader'>
                <Label id='PopupsTitle' localizedText='{s:popups_title}' />
            </Panel>
            <Panel className='PopupsBody'>
                <Panel className='LabelContent'>
                    <Label id='PopupsDesc' localizedText='{s:popups_desc}' />
                </Panel>
            </Panel>
            <Panel className='PopupsFooter'>
                <Panel className='ButtonGroup'>
                    <Button className='AM2Button' onactivate={() => {
                        GenericPopupsToggle("DashboardPopups", false);
                    }}>
                        <Label text={"关闭"} />
                    </Button>
                </Panel>

            </Panel>
        </Panel>


    );
};


type GenericPopupsTypes = "DashboardPopups" | "StorePopups"



export function GenericPopupsToggle(popups: GenericPopupsTypes, open: boolean, func_name?: string) {
    const GenericPopups = $("#GenericPopups");
    let server_item_popups = false;
    for (let i = 0; i < GenericPopups.GetChildCount(); i++) {
        let PopupsRows = GenericPopups.GetChild(i);
        if (PopupsRows) {
            let popups_id = PopupsRows.id;
            // if (open == false && popups != "GetServerItemContainers" && popups_id == "GetServerItemContainers") {
            //     server_item_popups = PopupsRows.BHasClass("Show");
            //     continue;
            // }
            PopupsRows.SetHasClass("Show", open && popups_id == popups);
        }
    }
    GenericPopups.SetHasClass("Show", open || server_item_popups);

    if (func_name) {
        $.Msg(["func_name:", func_name]);
    }
}

export function PopupsIsLoading() {
    const GenericPopups = $("#GenericPopups");
    const PopupsLoadingPanel = GenericPopups.FindChildTraverse("PopupsLoading")!;
    const bIsShow = PopupsLoadingPanel.BHasClass("Show");
    return bIsShow;
}

const DASHBOARD_LIST = Object.keys(DASHBOARD_NAVBAR);

export const RegisterKeyEscDashBoard = (e: Panel) => {
    $.RegisterKeyBind(e, "key_Escape", () => {
        $.DispatchEvent("DropInputFocus", e);
        const DashboardList = $("#DashboardList");
        const PlayerCurrency = $("#PlayerCurrency");
        const DashboardButtonList = $("#DashboardButtonList");
        for (let id of DASHBOARD_LIST) {
            let row_board = DashboardList.FindChildTraverse(id);
            if (row_board) { row_board.SetHasClass("Show", false); }
            let row_button = DashboardButtonList.FindChildTraverse("Button" + id);
            if (row_button) { row_button.SetHasClass("Selected", false); }

        }
        DashboardList.SetHasClass("IsClosed", false);
        PlayerCurrency.SetHasClass("IsOpen", false);
    });
};

export const RegisterKeyEscPopups = (e: Panel) => {
    $.RegisterKeyBind(e, "key_Escape", () => {
        GenericPopupsToggle("StorePopups", false);
        let row_board = $("#DashboardButtonList").GetChild(2)!;
        $.DispatchEvent("SetInputFocus", row_board);
    });
};