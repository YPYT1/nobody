export const MainPanel = $.GetContextPanel();

export const Init = () => {
    MainPanel.SetDialogVariable("stage", "1-1");
    MainPanel.SetDialogVariableInt("life", 0);
    MainPanel.SetDialogVariable("time_label", "0:0");
}

(function () {
    Init()
})();