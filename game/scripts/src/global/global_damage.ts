/** @noSelfInFile */
function PlayElementHitEffect(hUnit: CDOTA_BaseNPC, element_type?: ElementTypeEnum) {
    // print("PlayElementHitEffect", element_type)
    if (element_type == null) { return }
    if (element_type == ElementTypeEnum.thunder) {
        let hit_fx = ParticleManager.CreateParticle(
            "particles/diy/element_impact_thunder.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            hUnit
        )
        ParticleManager.SetParticleControl(hit_fx, 1, hUnit.GetAbsOrigin())
        ParticleManager.ReleaseParticleIndex(hit_fx);
    }
}

function ApplyCustomDamage(params: ApplyCustomDamageOptions) {
    const hAttacker = params.attacker;
    let element_type = params.ability.element_type;
    if (element_type == null) { element_type = params.element_type }
    const ability_category = params.ability_category
    PlayElementHitEffect(params.victim, element_type);



    // if (element_type == ElementTypeEnum.fire) {
    //     if ((ability_category & ArmsAbilityCategory.COUNT) == ArmsAbilityCategory.COUNT) {

    //     }
    // }
    return ApplyDamage(params);
}

