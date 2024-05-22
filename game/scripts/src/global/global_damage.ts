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
    const iPlayerID = hAttacker.GetPlayerOwnerID();
    let element_type = params.ability.element_type;
    if (params.element_type != null) { element_type = params.element_type }
    // const ability_category = params.ability_category
    //补充 默认参数
    params.critical_flasg = params.critical_flasg ?? 0;
    params.crit_chance = params.crit_chance ?? 0;
    params.crit_bonus_dmg = 150 + params.crit_bonus_dmg ?? 0;
    params.extra_percent = params.extra_percent ?? 0;
    params.special_effect = params.special_effect ?? true;
    PlayElementHitEffect(params.victim, element_type);

    let increased_injury = 0;// 增伤乘区
    let BondElement = GameRules.NewArmsEvolution.ElementBondDateList[iPlayerID].Element






    if (element_type == ElementTypeEnum.fire) {
        let bond_count_fire = BondElement["1"];
        // 3 火元素伤害+10%/
        if (bond_count_fire >= 3) { increased_injury += 10; }
        // 5火 对[灼烧]的单位造成伤害+30%/
        if (bond_count_fire >= 5 && params.victim.HasModifier("modifier_element_bond_fire")) {
            increased_injury += 30;
        }

        // 7 火元素暴击概率+25%，火元素暴击伤害+50%
        if (bond_count_fire >= 7) {
            params.crit_chance += 25
            params.crit_bonus_dmg += 50
        }

    } else if (element_type == ElementTypeEnum.ice) {
        let bond_count_ice = BondElement["2"];
        let has_effect_ice = params.victim.HasModifier("modifier_element_bond_ice");
        // 3冰元素技能伤害+10%/
        if (bond_count_ice >= 3) { increased_injury += 10; }
        // 4减速效果+20%/
        // 5对冰冻的单位造成伤害+100%/
        if (bond_count_ice >= 5 && has_effect_ice) {
            increased_injury += 100;
        }
        // 7冰元素暴击概率+25%，对冰冻的单位必定暴击
        if (bond_count_ice >= 5) {
            params.crit_chance += 25
            if (has_effect_ice) { params.critical_flasg = 1 }
        }

    } else if (element_type == ElementTypeEnum.thunder) {
        let bond_count_thunder = BondElement["3"];
        // 3 雷元素技能极速+10
        // 5 对麻痹的敌人额外+25%伤害
        if (bond_count_thunder >= 5 && params.victim.HasModifier("modifier_element_bond_thunder")) {
            increased_injury += 25;
        }
        // 7 雷元素暴击概率+25%，雷元素抗性穿透+25%
        if (bond_count_thunder >= 7) {
            params.crit_chance += 25
        }
    } else if (element_type == ElementTypeEnum.wind) {
        let bond_count_wind = BondElement["4"];
        /**
         * 3风元素伤害+10%
4击退效果+50%
5风元素造成伤害之后3秒内，增伤+15%
6风元素抗性穿透+30%
7风元素暴击概率+25%，增伤持续时间改为5秒，增伤+35%
         */
        if (bond_count_wind >= 3) {
            increased_injury += 10
        }

    } else if (element_type == ElementTypeEnum.light) {
        let bond_count_light = BondElement["5"];
    } else if (element_type == ElementTypeEnum.dark) {
        let bond_count_dark = BondElement["6"];
    }

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
    let bond_count = GameRules.NewArmsEvolution.ElementBondDateList[iPlayerID].Element["1"];
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