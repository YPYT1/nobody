
let ServerItemPanel = $.GetContextPanel();
let ServerItemIcon = $("#ServerItemIcon");

const SetServerItemId = (item_id: string, item_count: number = 1) => {
    ServerItemPanel.SetHasClass("rare_2", true);
    ServerItemPanel.SetDialogVariable("count", `${item_count}`)
}

(function () {

    ServerItemPanel.Data<PanelDataObject>().SetItemId = SetServerItemId
})();