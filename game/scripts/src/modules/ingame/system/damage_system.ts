
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
        if (params.attacker == null) { return }
        const hAttacker = params.attacker;
        const hTarget = params.victim;
        if (hAttacker == null || IsValid(hAttacker)) { return 0 }
        const iPlayerID = hAttacker.GetPlayerOwnerID();
        // print("iPlayerID",iPlayerID)
        if (hAttacker.GetTeam() == DotaTeam.BADGUYS) {
            return this.ApplyDamageForBadTeam(params)
        }

        let hAbility = params.ability;


        let element_type = params.element_type ?? ElementTypes.NONE;
        let is_primary = params.is_primary ?? false;
        let is_crit = 0;

        // 乘区计算
        let SelfAbilityMul = (params.SelfAbilityMul ?? 100) * 0.01;
        let DamageBonusMul = (params.DamageBonusMul ?? 0) + hAttacker.custom_attribute_value.DamageBonusMul;
        let AbilityImproved = (params.AbilityImproved ?? 0) + hAttacker.custom_attribute_value.AbilityImproved;
        let ElementDmgMul = (params.ElementDmgMul ?? 0);
        let FinalDamageMul = (params.FinalDamageMul ?? 0) + hAttacker.custom_attribute_value.FinalDamageMul;
        /** 元素伤害 */
        let ElementResist = 100;
        // 乘区

        DamageBonusMul + this.GetBonusDamageFromProp(params)

        // 游侠天赋击破效果
        let drow_13_stack_buff = hTarget.FindModifierByName("modifier_drow_2a_a_debuff")
        if (drow_13_stack_buff) {
            let stack = drow_13_stack_buff.GetStackCount();
            let stack_income = GameRules.HeroTalentSystem.GetTalentKvOfUnit(
                drow_13_stack_buff.GetCaster(),
                "drow_ranger",
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
                if (is_primary) {
                    // 添加灼烧
                    GameRules.ElementEffect.SetFirePrimary(params.attacker, params.victim)
                }


            } else if (element_type == ElementTypes.ICE) {
                // 受到伤害=造成伤害*（1-元素抗性百分比（=受伤害者元素抗性-攻击者元素穿透）最小值0）*（1-伤害减免百分比）+造成伤害2【总值最小为0】
                let IcePent = params.attacker.custom_attribute_value.IcePent ?? 0;
                let IceResist = params.victim.enemy_attribute_value.IceResist ?? 0;

                ElementResist += (IcePent - IceResist)
                if (is_primary) {
                    GameRules.ElementEffect.SetIcePrimary(params.attacker, params.victim)
                }

            } else if (element_type == ElementTypes.THUNDER) {
                // prop_22	【雷神之锤】	雷元素技能命中敌人时，50%概率额外追加3秒麻痹效果（相同敌人只受到一次效果）
                if (hTarget.SpecialMark["prop_22"] == null && hAttacker.prop_level_index["prop_22"]) {
                    let chance = GameRules.MysticalShopSystem.GetKvOfUnit(hAttacker, "prop_22", 'chance');
                    if (RollPercentage(chance)) {
                        hTarget.SpecialMark["prop_22"] = 1;
                        let duration = GameRules.MysticalShopSystem.GetKvOfUnit(hAttacker, "prop_22", 'duration');
                        // 强化麻痹效果
                        hTarget.AddNewModifier(hTarget, null, "modifier_element_effect_thunder", {
                            duration: duration
                        })
                    }
                }
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

        // print(params.damage, SelfAbilityMul, DamageBonusMul, AbilityImproved, ElementDmgMul, FinalDamageMul,'damagetype',params.damage_type)

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
        // print("ElementResist",ElementResist)
        params.damage = math.floor(params.damage * increased_injury);
        PopupDamageNumber(hAttacker, hTarget, params.damage_type, params.damage, is_crit, element_type)
        return ApplyDamage(params);
    }

    /**
     * 
     * @param params 
     * @returns 
     */
    ApplyDamageForBadTeam(params: ApplyCustomDamageOptions) {
        // 闪避判定
        let custom_attribute_value = params.victim.custom_attribute_value;
        if (custom_attribute_value == null) {
            return ApplyDamage(params);
        }
        let EvasionProb = custom_attribute_value ? custom_attribute_value.EvasionProb : 0;
        if (RollPercentage(EvasionProb)) {
            // 闪避
            PopupMiss(params.victim)
            return 0
        }
        // 护甲
        let armor = custom_attribute_value.PhyicalArmor ?? 0;
        params.damage = this.GetReduction(
            params.victim,
            params.damage,
            params.damage_type,
            params.element_type
        );
        params.damage_type = DamageTypes.PURE;
        // prop_17	【刃甲】	反弹40%受到的伤害
        if (params.victim.prop_level_index["prop_17"]) {
            let value = GameRules.MysticalShopSystem.GetKvOfUnit(params.victim, 'prop_17', 'value');
            let attack_damage = params.damage * value * 0.01;
            let hAbility = params.victim.FindAbilityByName("public_attribute")
            this.ApplyDamage({
                victim: params.attacker,
                attacker: params.victim,
                damage: attack_damage,
                damage_type: DamageTypes.PHYSICAL,
                ability: hAbility,
                element_type: ElementTypes.NONE,
                is_primary: false,
            })
        }

        // prop_38	【缚灵索】	攻击自身的敌人会被束缚1秒
        if (params.victim.prop_level_index["prop_38"]) {
            let root_duration = GameRules.MysticalShopSystem.GetKvOfUnit(params.victim, 'prop_38', 'root_duration');
            params.attacker.AddNewModifier(params.victim, null, "modifier_shop_prop_38", {
                duration: root_duration
            })
        }
        return ApplyDamage(params);
    }


    /** 获取来自 神秘商店相关的伤害加成 */
    GetBonusDamageFromProp(params: ApplyCustomDamageOptions) {
        let bonus = 0;
        let distance = (params.attacker.GetAbsOrigin() - params.victim.GetAbsOrigin() as Vector).Length2D();
        // prop_10	【生人勿进】	对自身250码范围内的敌人造成的伤害提升25%
        if (params.attacker.prop_level_index["prop_10"] && distance < 250) {
            bonus += GameRules.MysticalShopSystem.GetKvOfUnit(params.attacker, 'prop_10', 'harm')
        }
        // prop_11	【远有远的好处】	对自身600码以外的敌人造成的伤害提升25%
        if (params.attacker.prop_level_index["prop_11"] && distance > 600) {
            bonus += GameRules.MysticalShopSystem.GetKvOfUnit(params.attacker, 'prop_11', 'harm')
        }

        // prop_18	【致命及砍到】	对生命值大于80%小于20%的单位造成的伤害提升15%
        if (params.attacker.prop_level_index["prop_18"]) {
            let more_than_pct = GameRules.MysticalShopSystem.GetKvOfUnit(params.attacker, 'prop_18', 'more_than_pct');
            let less_than_pct = GameRules.MysticalShopSystem.GetKvOfUnit(params.attacker, 'prop_18', 'less_than_pct');
            let health_pct = params.victim.GetHealthPercent();
            if (health_pct > more_than_pct || health_pct < less_than_pct) {
                bonus += GameRules.MysticalShopSystem.GetKvOfUnit(params.attacker, 'prop_18', 'damage_bonus')
            }
        }
        return bonus
    }
}