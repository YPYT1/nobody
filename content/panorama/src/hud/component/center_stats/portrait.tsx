let last_unit: EntityIndex;
let last_unit_name: string;
let UnitPortraitPanel: Panel;

const UpdateLocalPlayer = () => {
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
        // style: "width: 100%;height: 100%; align: center center;",
        hittest: false,
        unit: unit_name,
        particleonly: false
    });
}

export const PortraitContainer = () => {

    let iAttackRangeFx = 0 as ParticleID;

    GameEvents.Subscribe("dota_player_update_selected_unit", UpdateLocalPlayer);
    GameEvents.Subscribe("dota_player_update_query_unit", UpdateLocalPlayer);

    return (
        <Panel id="PortraitContainer" hittest={false}>
            <Panel id='PortraitGround' hittest={false} />
            <Panel id='PortraitBorder' hittest={false}>
                <Panel
                    id="UnitPortrait"
                    onload={(e) => {
                        UnitPortraitPanel = e;
                        // let DOTAPortrait = $.CreatePanel("DOTAPortrait", e, "portraitHUDOverlay,", {
                        //     style: "width: 100%;height: 100%; align: center center;",
                        //     hittest: false,
                        // });
                    }}
                    onmouseover={() => {
                        // $("#AllAttributeContainer").SetHasClass("show", true);
                        // 显示攻击距离
                        let queryUnit = Players.GetLocalPlayerPortraitUnit();
                        if (iAttackRangeFx != -1) {
                            Particles.DestroyParticleEffect(iAttackRangeFx, false);
                            iAttackRangeFx = -1 as ParticleID;
                        }
                        let fRange = Entities.GetAttackRange(queryUnit); //+ Entities.GetHullRadius(queryUnit);
                        iAttackRangeFx = Particles.CreateParticle(
                            "particles/ui_mouseactions/range_display.vpcf",
                            ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW,
                            queryUnit
                        );
                        Particles.SetParticleControl(iAttackRangeFx, 1, [fRange, fRange, fRange]);

                    }}
                    onmouseout={() => {
                        // $("#AllAttributeContainer").SetHasClass("show", false);
                        if (iAttackRangeFx != -1) {
                            Particles.DestroyParticleEffect(iAttackRangeFx, true);
                            iAttackRangeFx = -1 as ParticleID;
                        }
                    }}
                >
                    {/* <DOTAScenePanel id="Portrait" unit="npc_dota_hero_omniknight" className="full" particleonly={false} /> */}
                </Panel>
            </Panel>


        </Panel>
    );

}