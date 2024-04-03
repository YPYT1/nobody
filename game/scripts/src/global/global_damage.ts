

function ApplyCustomDamage(params: ApplyCustomDamageOptions) {
    let element_type = params.ability.element_type;
    PlayElementHitEffect(params.victim, element_type)
    return ApplyDamage(params);
}

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