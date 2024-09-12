
const DireMissionTips = $("#DireMissionTips")
const DireMissionContainer = $("#DireMissionContainer");


const Init = () => {

    DireMissionContainer.SetPanelEvent("onactivate", () => {
        // let bHas_RightSide = DireMissionContainer.BHasClass("RightSide")
        // DireMissionContainer.SetHasClass("RightSide", !bHas_RightSide)
        // DireMissionContainer.SetHasClass("Tip", bHas_RightSide)
        DireMissionContainer.ToggleClass("hover")
    })

    DireMissionTips.SetPanelEvent("onactivate", () => {
        let bHas_Tips = DireMissionTips.BHasClass("Tips");
        DireMissionTips.SetHasClass("Tips", !bHas_Tips)
        DireMissionTips.SetHasClass("Play", bHas_Tips)
    })
}
(function () {
    Init()
})();