
import { modifier_prop_effect } from "../../../modifier/prop_effect/modifier_prop_effect";
import { modifier_rune_effect } from "../../../modifier/rune_effect/modifier_rune_effect";
import { modifier_talent_effect } from "../../../modifier/talent_effect/modifier_talent_effect";
import { reloadable } from "../../../utils/tstl-utils";

/**
 * 伤害系统
 */
@reloadable
export class DamageSystem {

    constructor() {
        print("加载伤害系统")
    }

    /**
    * [设置]一个减伤/增伤乘区
    * @param hUnit 
    * @param key 索引key `必要`
    * @param value 值,正数为减伤,负数为增伤
    * @param timer 持续时间.默认永久
    */
    SetReduction(hUnit: CDOTA_BaseNPC, key: string, value: number, timer: number = -1) {
        key = "reduction_" + key;
        if (hUnit.ReductionPct == null) { hUnit.ReductionPct = {}; }
        hUnit.ReductionPct[key] = value;
        if (timer > 0) {
            hUnit.SetContextThink(key, () => {
                this.DelReduction(hUnit, key);
                return null;
            }, timer);
        }
        this.UpdateReduction(hUnit);
    }

    DelReduction(hUnit: CDOTA_BaseNPC, key: string) {
        if (hUnit == null || hUnit.ReductionPct == null) { return; }
        key = "reduction_" + key;
        if (hUnit.ReductionPct.hasOwnProperty(key)) {
            delete hUnit.ReductionPct[key];
        }
        this.UpdateReduction(hUnit);
    }

    UpdateReduction(hUnit: CDOTA_BaseNPC) {
        hUnit.SetContextThink("UpdateReduction", () => {
            let base_value = 1;
            for (let key in hUnit.ReductionPct) {
                let value = hUnit.ReductionPct[key];
                base_value = base_value * math.abs(1 - value * 0.01);
            }
            hUnit.ReductionResult = base_value;
            return null;
        }, 0.03);
    }

    /** 获得总减伤转换后的值 */
    GetReduction(hUnit: CDOTA_BaseNPC, damage: number, damage_type: DamageTypes, element_type?: ElementTypes) {
        let custom_attribute = hUnit.custom_attribute_value;
        if (element_type == ElementTypes.NONE) {
            // 物理护甲 碰撞伤害
            let PhyicalArmor = custom_attribute.PhyicalArmor;
            let armor_dmg_reduction = PhyicalArmor / (100 + math.abs(PhyicalArmor));
            damage = damage * (1 - armor_dmg_reduction)
        } else {

        }
        // print(damage, "element_type", element_type)
        return damage
    }

    ApplyDamage(params: ApplyCustomDamageOptions) {
        // print("params.attacker",params.attacker)
        if (params.attacker == null) { return }
        const hAttacker = params.attacker;
        const hTarget = params.victim;
        // print(hAttacker == null, IsValid(hAttacker))
        if (hAttacker == null || IsValid(hAttacker)) { return 0 }
        // print()
        const iPlayerID = hAttacker.GetPlayerOwnerID();
        // print("hAttacker iPlayerID",iPlayerID)
        params.miss_flag = params.miss_flag ?? 0;
        if (hAttacker.GetTeam() == DotaTeam.BADGUYS) {
            return this.ApplyDamageForBadTeam(params)
        }

        if (params.victim.enemy_attribute_value == null) {
            params.victim.enemy_attribute_value = {}
        }
        let hAbility = params.ability;
        let element_type = params.element_type ?? ElementTypes.NONE;
        let is_primary = params.is_primary ?? false;
        let is_crit = 0;
        let critical_flag = params.critical_flag ?? 0;

        if (hTarget.HasModifier("modifier_basic_hits")) {
            params.damage = 1;
            PopupDamageNumber(hAttacker, hTarget, params.damage_type, params.damage, is_crit, element_type);
            return ApplyDamage(params);
        }

        // 暴击
        let CriticalChance = hAttacker.custom_attribute_value.CriticalChance;
        let CriticalDamage = hAttacker.custom_attribute_value.CriticalDamage;
        // 乘区计算
        // let BasicAbilityDmg = (params.BasicAbilityDmg ?? 100) * 0.01
        let SelfAbilityMul = (params.SelfAbilityMul ?? 100) * 0.01;
        let DamageBonusMul = (params.DamageBonusMul ?? 0) + hAttacker.custom_attribute_value.DamageBonusMul;
        let AbilityImproved = (params.AbilityImproved ?? 0) + hAttacker.custom_attribute_value.AbilityImproved;
        let ElementDmgMul = (params.ElementDmgMul ?? 0) + hAttacker.custom_attribute_value.AllElementDamageBonus;
        let FinalDamageMul = (params.FinalDamageMul ?? 0) + hAttacker.custom_attribute_value.FinalDamageMul;
        /** 元素伤害 */
        let ElementResist = 100;
        // 乘区
        DamageBonusMul += this.GetBonusDamageFromProp(params)
        // 游侠天赋击破效果
        let drow_13_stack_buff = hTarget.FindModifierByName("modifier_drow_2a_a_debuff")
        if (drow_13_stack_buff) {
            let stack = drow_13_stack_buff.GetStackCount();
            let stack_income = GameRules.HeroTalentSystem.GetTalentKvOfUnit(
                drow_13_stack_buff.GetCaster(),
                "13",
                'value'
            )
            DamageBonusMul += stack * stack_income
        }

        /** 综合乘区 */
        if (params.damage_type == DamageTypes.PHYSICAL) {
            // 物理伤害
        } else if (params.damage_type == DamageTypes.MAGICAL) {

            if (element_type == ElementTypes.FIRE) {
                ElementDmgMul += params.attacker.custom_attribute_value.FireDamageBonus;
                let EPent = params.attacker.custom_attribute_value.FirePent ?? 0;
                let EResist = params.victim.enemy_attribute_value.FireResist ?? 0;
                ElementResist += math.min(0, (EPent - EResist))
                if (is_primary) {
                    // 添加灼烧
                    GameRules.ElementEffect.SetFirePrimary(params.attacker, params.victim)
                }
                // prop_3	【啊，是火！】	火元素技能造成伤害的灼烧会额外增加攻击力40%的伤害，并降低火元素抗性20%，持续3秒。
                if (params.attacker.prop_count["prop_3"]) {
                    let FireResist = GameRules.MysticalShopSystem.GetKvOfUnit(params.attacker, 'prop_3', 'FireResist');
                    let duration = GameRules.MysticalShopSystem.GetKvOfUnit(params.attacker, 'prop_3', 'duration');
                    GameRules.EnemyAttribute.SetAttributeInKey(params.victim, "prop_3_effect", {
                        "FireResist": {
                            "Base": FireResist
                        }
                    }, duration)
                }


            } else if (element_type == ElementTypes.ICE) {
                ElementDmgMul += params.attacker.custom_attribute_value.IceDamageBonus;
                // 受到伤害=造成伤害*（1-元素抗性百分比（=受伤害者元素抗性-攻击者元素穿透）最小值0）*（1-伤害减免百分比）+造成伤害2【总值最小为0】
                let EPent = params.attacker.custom_attribute_value.FirePent ?? 0;
                let EResist = params.victim.enemy_attribute_value.FireResist ?? 0;
                ElementResist += math.min(0, (EPent - EResist))
                if (is_primary) {
                    GameRules.ElementEffect.SetIcePrimary(params.attacker, params.victim)
                }


            } else if (element_type == ElementTypes.THUNDER) {
                ElementDmgMul += params.attacker.custom_attribute_value.ThunderDamageBonus;
                let EPent = params.attacker.custom_attribute_value.ThunderPent ?? 0;
                let EResist = params.victim.enemy_attribute_value.ThunderResist ?? 0;
                ElementResist += math.min(0, (EPent - EResist))
                if (is_primary) {
                    GameRules.ElementEffect.SetThunderPrimary(params.attacker, params.victim)
                }
            } else if (element_type == ElementTypes.WIND) {
                ElementDmgMul += params.attacker.custom_attribute_value.WindDamageBonus;
                let EPent = params.attacker.custom_attribute_value.WindPent ?? 0;
                let EResist = params.victim.enemy_attribute_value.WindResist ?? 0;
                ElementResist += math.min(0, (EPent - EResist))
                if (is_primary && params.damage_vect) {
                    GameRules.ElementEffect.SetWindPrimary(params.attacker, params.victim, params.damage_vect)
                }
            }
        } else {
            // 真实伤害
            PopupDamageNumber(hAttacker, hTarget, params.damage_type, params.damage, is_crit, element_type)
            return ApplyDamage(params);
        }

        // print(params.damage, "SelfAbilityMul:", SelfAbilityMul, DamageBonusMul, AbilityImproved, ElementDmgMul, FinalDamageMul, 'damagetype', params.damage_type)
        // print("DamageBonusMul",DamageBonusMul)
        /**
         * 造成伤害1=(攻击者攻击力*【1+攻击力加成百分比】*对应技能伤害)*伤害加成*(1+最终伤害)*技能增强*元素伤害百分比*远程或近战伤害增加百分比
            造成伤害2=固定伤害（=攻击者固定伤害-受攻击者固定伤害减免）【造成伤害最小值1】
         */
        let increased_injury = 1
            * SelfAbilityMul
            * (1 + DamageBonusMul * 0.01)
            * (1 + AbilityImproved * 0.01)
            * (1 + ElementDmgMul * 0.01)
            * (1 + FinalDamageMul * 0.01)
            * ElementResist * 0.01
            ;
        // print("increased_injury",increased_injury)
        // print("ElementResist", ElementResist)
        params.damage = math.floor(params.damage * increased_injury);
        // 暴击
        if ((critical_flag != -1 && RollPercentage(CriticalChance)) || critical_flag == 1) {
            is_crit = 1;
            params.damage = math.floor(params.damage * CriticalDamage * 0.01)
        }
        let talent_mdf = hAttacker.FindModifierByName("modifier_talent_effect") as modifier_talent_effect
        if (talent_mdf) {
            talent_mdf.OnCriticalStrike(params.victim)
        }
        // 特殊机制
        let bonus_dmg_pct = this.AboutSpecialMechanism(params)
        params.damage *= bonus_dmg_pct;
        PopupDamageNumber(hAttacker, hTarget, params.damage_type, params.damage, is_crit, element_type);
        // 伤害系统
        let actual_damage = math.min(params.damage, params.victim.GetHealth());
        GameRules.CMsg.AddDamageRecord(iPlayerID, actual_damage);
        // 击飞
        if (params.damage < params.victim.GetHealth()) {
            this.OnKnockback(params.victim, params.attacker)
        }

        return ApplyDamage(params);
    }

    /**
     * 
     * @param params 
     * @returns 
     */
    ApplyDamageForBadTeam(params: ApplyCustomDamageOptions) {

        // 无敌
        if (params.victim.HasModifier("modifier_altar_effect_6")) {
            return 0
        }
        params.damage_type = DamageTypes.PURE;
        let custom_attribute_value = params.victim.custom_attribute_value;
        if (custom_attribute_value == null) {
            return ApplyDamage(params);
        }

        let EvasionProb = custom_attribute_value ? custom_attribute_value.EvasionProb : 0;
        if (params.miss_flag != 1 && RollPercentage(EvasionProb)) {
            // 闪避
            GameRules.CMsg.Popups(params.victim, 'Miss', 0, params.victim.GetPlayerOwner())
            return 0
        }

        // 护甲
        // let armor = custom_attribute_value.PhyicalArmor ?? 0;
        params.damage = this.GetReduction(
            params.victim,
            params.damage,
            params.damage_type,
            params.element_type
        );

        params.damage = params.damage * (100 - custom_attribute_value.DmgReductionPct) * 0.01;

        let rune_buff = params.victim.FindModifierByName("modifier_rune_effect") as modifier_rune_effect;
        if (rune_buff) { rune_buff.OnBeInjured(params) }

        let prop_buff = params.victim.FindModifierByName("modifier_prop_effect") as modifier_prop_effect;
        if (prop_buff) { prop_buff.OnBeInjured(params) }

        if (params.damage <= 0) {
            GameRules.CMsg.Popups(params.victim, 'Miss', 0, params.victim.GetPlayerOwner())
            return 0
        }


        return ApplyDamage(params);
    }


    /** 获取来自 神秘商店相关的伤害加成 */
    GetBonusDamageFromProp(params: ApplyCustomDamageOptions) {
        let bonus = 0;
        let distance = (params.attacker.GetAbsOrigin() - params.victim.GetAbsOrigin() as Vector).Length2D();
        // prop_8	【否定信仰】	队伍对有控制状态效果的人额外造成15%伤害
        let prop_8_count = GameRules.MysticalShopSystem.GetTeamPropCount("prop_8");
        if (prop_8_count > 0) {
            let prop_8_value = GameRules.MysticalShopSystem.GetTKV('prop_8', 'value', 0);
            bonus += (prop_8_count * prop_8_value)
        }

        // prop_10	【生人勿进】	对自身250码范围内的敌人造成的伤害提升25%
        // DeepPrintTable(params.attacker.prop_count)
        // print(params.attacker.prop_count["prop_10"] , distance < 250)
        if (params.attacker.prop_count["prop_10"] && distance < 250) {
            bonus += GameRules.MysticalShopSystem.GetKvOfUnit(params.attacker, 'prop_10', 'harm') * params.attacker.prop_count["prop_10"];

        }
        // prop_11	【远有远的好处】	对自身600码以外的敌人造成的伤害提升25%
        if (params.attacker.prop_count["prop_11"] && distance > 600) {
            bonus += GameRules.MysticalShopSystem.GetKvOfUnit(params.attacker, 'prop_11', 'harm')
        }

        // prop_18	【致命及砍到】	对生命值大于80%小于20%的单位造成的伤害提升15%
        if (params.attacker.prop_count["prop_18"]) {
            let more_than_pct = GameRules.MysticalShopSystem.GetKvOfUnit(params.attacker, 'prop_18', 'more_than_pct');
            let less_than_pct = GameRules.MysticalShopSystem.GetKvOfUnit(params.attacker, 'prop_18', 'less_than_pct');
            let health_pct = params.victim.GetHealthPercent();
            if (health_pct > more_than_pct || health_pct < less_than_pct) {
                bonus += GameRules.MysticalShopSystem.GetKvOfUnit(params.attacker, 'prop_18', 'damage_bonus')
            }
        }

        // prop_24	【无极】	队伍对有负面效果的人额外造成15%伤害
        let prop_24_count = GameRules.MysticalShopSystem.GetTeamPropCount("prop_24");
        if (prop_24_count > 0) {
            let mdf_list = params.victim.FindAllModifiers()
            let has_debuff = false;
            for (let mdf of mdf_list) {
                if (mdf.IsDebuff()) {
                    has_debuff = true
                    break;
                }
            }
            if (has_debuff) {
                bonus += (prop_24_count * GameRules.MysticalShopSystem.GetTKV('prop_24', 'value'))
            }
        }

        // print("final bonus",bonus)
        return bonus
    }

    /** 一些特殊机制 */
    AboutSpecialMechanism(params: ApplyCustomDamageOptions) {
        let base_multiplying = 1;
        if (params.victim.HasModifier("modifier_creature_boss_19")
            && params.attacker.HasModifier("modifier_creature_boss_19_note3")
        ) {
            base_multiplying *= 2
        }
        return base_multiplying
    }

    /** 击退 */
    OnKnockback(hUnit: CDOTA_BaseNPC, hAttacker?: CDOTA_BaseNPC) {
        if (hAttacker == null) { return }
        const dotatime = GameRules.GetDOTATime(false, false);
        const knockback_time = hUnit.knockback_time ?? 0;
        // 且未处于击飞状态
        const is_vert_cont = hUnit.IsCurrentlyVerticalMotionControlled()
        const is_hor_cont = hUnit.IsCurrentlyHorizontalMotionControlled()
        // print("is_vert_cont", is_vert_cont, "is_hor_cont", is_hor_cont)
        if (!is_hor_cont && !is_hor_cont && knockback_time < dotatime) {
            const vOrigin = hAttacker.GetAbsOrigin()
            hUnit.knockback_time = dotatime + 1;
            hUnit.AddNewModifier(hUnit, null, "modifier_knockback_lua", {
                center_x: vOrigin.x,
                center_y: vOrigin.y,
                center_z: 0,
                knockback_height: 0,
                knockback_distance: 20,
                knockback_duration: 0.2,
                duration: 0.2,
            })
        }
    }
}