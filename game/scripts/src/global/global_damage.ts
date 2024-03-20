

function ApplyCustomDamage(params: ApplyCustomDamageOptions) {
    PlayElementHitEffect(params.victim, params.element_type)
    return ApplyDamage(params);
}

function PlayElementHitEffect(hUnit: CDOTA_BaseNPC, element_type?: CElementType) {
    print("PlayElementHitEffect", element_type)
    if (element_type == null) { return }
    if (element_type == "thunder") {
        let hit_fx = ParticleManager.CreateParticle(
            "particles/diy/element_impact_thunder.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            hUnit
        )
        ParticleManager.SetParticleControl(hit_fx, 1, hUnit.GetAbsOrigin())
        ParticleManager.ReleaseParticleIndex(hit_fx);

    }
}