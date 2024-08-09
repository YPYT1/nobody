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
    if (params.attacker == null) { return }
    const hAttacker = params.attacker;
    const hTarget = params.victim;
    if (hAttacker == null || IsValid(hAttacker)) { return 0 }
    const iPlayerID = hAttacker.GetPlayerOwnerID();
    // print("iPlayerID",iPlayerID)
    if (iPlayerID == -1) {
        // 这里走敌人伤害方法
        return ApplyDamage(params);
    }

    let hAbility = params.ability;
    if (hAbility) {

    }

    let element_type = params.element_type ?? ElementTypes.NONE;
    let is_primary = params.is_primary ?? false;
    let is_crit = 0;

    // 乘区计算
    let bp_ingame = params.bp_ingame ?? 0;
    let bp_server = params.bp_server ?? 0;
    // 存档乘区
    bp_server += hAttacker.custom_attribute_value.DamageServerMul

    // 当局加成乘区
    let drow_13_stack_buff = hTarget.FindModifierByName("modifier_drow_2a_a_debuff")
    if (drow_13_stack_buff) {
        let stack = drow_13_stack_buff.GetStackCount();
        let stack_income = GameRules.HeroTalentSystem.GetTalentKvOfUnit(
            drow_13_stack_buff.GetCaster(),
            "drow_ranger",
            "13",
            'value'
        )
        bp_ingame += stack * stack_income
    }

    /** 综合乘区 */


    // let BondElement = GameRules.NewArmsEvolution.ElementBondDateCount[iPlayerID].Element




    if (params.damage_type == DamageTypes.PHYSICAL) {
        // 物理伤害
    } else if (params.damage_type == DamageTypes.MAGICAL) {

        if (element_type == ElementTypes.FIRE) {
            if (is_primary) {
                // 添加灼烧
                GameRules.ElementEffect.SetFirePrimary(params.attacker, params.victim)
            }
            // let bond_count_fire = BondElement[1];
            // // 3 火元素伤害+10%/
            // if (bond_count_fire >= 3) { increased_injury += 10; }
            // // 5火 对[灼烧]的单位造成伤害+30%/
            // if (bond_count_fire >= 5 && params.victim.HasModifier("modifier_element_bond_fire")) {
            //     increased_injury += 30;
            // }

            // // 7 火元素暴击概率+25%，火元素暴击伤害+50%
            // if (bond_count_fire >= 7) {
            //     crit_chance += 25
            //     crit_bonus_dmg += 50
            // }

        } else if (element_type == ElementTypes.ICE) {
            if (is_primary) {
                GameRules.ElementEffect.SetIcePrimary(params.attacker, params.victim)
            }
            // let bond_count_ice = BondElement[2];
            // let has_effect_ice = params.victim.HasModifier("modifier_element_bond_ice");
            // // 3冰元素技能伤害+10%/
            // if (bond_count_ice >= 3) { increased_injury += 10; }
            // // 4减速效果+20%/
            // // 5对冰冻的单位造成伤害+100%/
            // if (bond_count_ice >= 5 && has_effect_ice) {
            //     increased_injury += 100;
            // }
            // // 7冰元素暴击概率+25%，对冰冻的单位必定暴击
            // if (bond_count_ice >= 5) {
            //     crit_chance += 25
            //     if (has_effect_ice) { critical_flasg = 1 }
            // }

        } else if (element_type == ElementTypes.THUNDER) {
            if (is_primary) {
                GameRules.ElementEffect.SetThunderPrimary(params.attacker, params.victim)
            }
        } else if (element_type == ElementTypes.WIND) {
            if (is_primary && params.damage_vect) {
                GameRules.ElementEffect.SetWindPrimary(params.attacker, params.victim, params.damage_vect)
            }
        }


    } else {

    }
    let increased_injury = (1 + bp_ingame * 0.01) * (1 + bp_server * 0.01); // 
    params.damage = math.floor(params.damage * increased_injury);
    PopupDamageNumber(hAttacker, hTarget, params.damage_type, params.damage, is_crit, element_type)
    return ApplyDamage(params);
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