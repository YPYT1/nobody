/** @noSelfInFile */
function PlayElementHitEffect(hUnit: CDOTA_BaseNPC, element_type?: ElementTypes) {
    // print("PlayElementHitEffect", element_type)
    if (element_type == null) { return }
    if (element_type == ElementTypes.THUNDER) {
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
    return GameRules.DamageSystem.ApplyDamage(params)
}

/**
 * 技能附带3秒灼烧效果
 * @param hTarget 
 * @param hCaster 
 */
function ElementSpecialEffect_Fire(hTarget: CDOTA_BaseNPC, hCaster: CDOTA_BaseNPC) {
    let hAbility = hCaster.FindAbilityByName("public_arms");
    let iPlayerID = hCaster.GetPlayerOwnerID();
    let dot_buff = hTarget.FindModifierByNameAndCaster("modifier_element_bond_fire", hCaster);
    let bond_count = GameRules.NewArmsEvolution.ElementBondDateCount[iPlayerID].Element["1"];
    let dot_duration = bond_count >= 6 ? 6 : 3;
    if (dot_buff == null) {
        dot_buff = hTarget.AddNewModifier(hCaster, hAbility, "modifier_element_bond_fire", {
            duration: dot_duration
        })
    } else {
        // 刷新BUFF时间
        dot_buff.ForceRefresh()
    }


}

function PopupDamageNumber(
    attacker: CDOTA_BaseNPC,
    target: CDOTA_BaseNPC,
    damage_type: DamageTypes,
    value: number,
    is_crit: number = 0,
    element_type?: ElementTypes,
) {
    // print("PopupDamageNumber:", attacker, target, damage_type, value, is_crit, element_type)
    if (value <= 0) { return; }
    if (attacker.GetPlayerOwner()) {
        CustomGameEventManager.Send_ServerToPlayer(
            attacker.GetPlayerOwner(),
            "Popup_DamageNumberToClients",
            {
                data: {
                    value: math.floor(value),
                    type: damage_type,
                    entity: target.entindex(),
                    is_crit: is_crit,
                    element_type: element_type,
                    is_attack: 1,
                }
            }
        );
    }

}