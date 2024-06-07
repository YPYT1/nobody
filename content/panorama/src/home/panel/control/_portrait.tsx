
export let iAttackRangeFx = 0 as ParticleID;
export let last_unit: EntityIndex;
export let last_unit_name: string;
export let UnitPortraitPanel = $("#UnitPortrait");

export const InitPanel = () => {
    // UnitPortraitPanel.SetPanelEvent("onmouseover", () => {
    //     let queryUnit = Players.GetLocalPlayerPortraitUnit();
    //     if (iAttackRangeFx > 0) {
    //         Particles.DestroyParticleEffect(iAttackRangeFx, false);
    //         iAttackRangeFx = -1 as ParticleID;
    //     }
    //     let fRange = Entities.GetAttackRange(queryUnit); //+ Entities.GetHullRadius(queryUnit);
    //     iAttackRangeFx = Particles.CreateParticle(
    //         "particles/ui_mouseactions/range_display.vpcf",
    //         ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW,
    //         queryUnit
    //     );
    //     Particles.SetParticleControl(iAttackRangeFx, 1, [fRange, fRange, fRange]);
    // })

    // UnitPortraitPanel.SetPanelEvent("onmouseout", () => {
    //     if (iAttackRangeFx > 0) {
    //         Particles.DestroyParticleEffect(iAttackRangeFx, true);
    //         iAttackRangeFx = -1 as ParticleID;
    //     }
    // })
}
export const UpdateLocalPlayer = () => {
    let select_unit = Players.GetLocalPlayerPortraitUnit();
    // $.Msg(last_unit <= 0 || select_unit == last_unit)
    if (last_unit <= 0 || select_unit == last_unit) { return }
    let unit_name = Entities.GetUnitName(select_unit);
    if (last_unit_name == unit_name) { return }
    last_unit_name = unit_name
    last_unit = select_unit;
    let is_hero = Entities.IsHero(select_unit);

    UnitPortraitPanel.RemoveAndDeleteChildren();
    $.CreatePanel("DOTAScenePanel", UnitPortraitPanel, "Portrait", {
        hittest: false,
        unit: unit_name,
        particleonly: false
    });
}

(function () {
    InitPanel();
    // CreatePanel_ExpBar();
    GameEvents.Subscribe("dota_player_update_selected_unit", UpdateLocalPlayer);
    GameEvents.Subscribe("dota_player_update_query_unit", UpdateLocalPlayer);
})();