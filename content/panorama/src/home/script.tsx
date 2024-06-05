import "./panel/hud";

let hudPanel: Panel;


const Initialize = () => {
    $.Msg("Initialize 2");
    hudPanel = $("#hud");
    hudPanel.RemoveAndDeleteChildren();
    hudPanel.BLoadLayout("file://{resources}/layout/custom_game/home/panel/hud.xml", false, false)
}

$.Msg(["MSG"]);
(function () {
    Initialize();
})();
