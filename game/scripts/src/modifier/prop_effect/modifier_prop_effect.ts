import { BaseAbility, BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";
import * as MysteriousShopConfig from "../../json/config/game/shop/mysterious_shop_config.json";

type runeName = keyof typeof MysteriousShopConfig;

/** 通用神秘商店效果 */
@registerModifier()
export class modifier_prop_effect extends BaseModifier {

    caster: CDOTA_BaseNPC;
    player_id: PlayerID;
    ability: CDOTABaseAbility;

    object: { [rune: string]: AbilityValuesProps };

    timer_prop_42: number;
    timer_prop_43: number;
    timer_prop_45: number;


    IsHidden(): boolean { return true }
    IsPermanent(): boolean { return true }
    RemoveOnDeath(): boolean { return false }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();
        this.player_id = this.caster.GetPlayerOwnerID();
        this.object = {}

        // 部分定时器
        this.timer_prop_42 = 0;
        this.timer_prop_43 = 0;
        this.timer_prop_45 = 0;
        this.OnRefresh(params);
        this.StartIntervalThink(1)
    }

    Prop_Object<
        Key extends keyof typeof MysteriousShopConfig,
        T2 extends typeof MysteriousShopConfig[Key]
    >(prop_name: Key, rune_key: keyof T2["AbilityValues"]) {
        return this.object[prop_name as string][rune_key as string]
    }

    Prop_InputAbilityValues(prop_name: string, rune_input: AbilityValuesProps): void {
        this.object[prop_name] = rune_input
    }

    Prop_OnKilled(hTarget: CDOTA_BaseNPC): void {
        this.Prop_Object("prop_1", 'value')
    }

    OnIntervalThink(): void {
        if (!this.caster.IsAlive()) { return }
        // prop_12	【勇气勋章】	生命值大于50%，攻击力提高20%；生命值低于50%，防御力提高20%
        if (this.object["prop_12"]) {
            let heal_pct = this.Prop_Object("prop_12", 'heal_pct');
            if (this.caster.GetHealthPercent() > heal_pct) {
                let attack_pct = this.Prop_Object('prop_12', 'attack_pct')
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, "prop_12_effect", {
                    'AttackDamage': {
                        "BasePercent": attack_pct
                    },
                    'PhyicalArmor': {
                        "BasePercent": 0,
                    }
                })
            } else {
                let armor_pct = this.Prop_Object('prop_12', 'armor_pct')
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, "prop_12_effect", {
                    'AttackDamage': {
                        "BasePercent": 0
                    },
                    'PhyicalArmor': {
                        "BasePercent": armor_pct,
                    }
                })
            }
        }

        // prop_15	【走钢索】	血量越低伤害越高，最低临界值10%血量，提高伤害100%
        if (this.object["prop_15"]) {
            let heal_pct = this.Prop_Object('prop_15', 'heal_pct');
            let damage_bonus_max = this.Prop_Object('prop_15', 'damage_bonus_max');
            let curr_pct = math.max(heal_pct, this.caster.GetHealthPercent())
            let bonus_damage = math.floor((100 - curr_pct) / 0.9);
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, "prop_15_effect", {
                'DamageBonusMul': {
                    "Base": bonus_damage
                },
            })
        }

        // prop_40	【急不可耐】	每秒钟获得1点灵魂（上限10）
        if (this.object["prop_40"]) {
            if (GameRules.MapChapter._game_select_phase == 3) {
                let count = GameRules.MysticalShopSystem.player_shop_buy_data[this.player_id]["prop_40"];
                let limit = this.Prop_Object("prop_40", "limit");
                let value = this.Prop_Object("prop_40", "value");
                GameRules.ResourceSystem.ModifyResource(this.player_id, {
                    "Soul": value * math.min(count, limit)
                })
            }

        }

        // prop_42	【神罚】	
        if (this.object["prop_42"]) {
            this.timer_prop_42 += 1;
            if (this.timer_prop_42 >= this.Prop_Object("prop_42", 'interval')) {
                this.timer_prop_42 = 0;
                this.Effect_Prop42()
            }
        }
        // prop_43	【定时收获】	自己无法拾取经验球，但每过120秒会自动拾取全地图的经验球
        if (this.object["prop_43"]) {
            this.timer_prop_43 += 1;

            if (this.timer_prop_43 >= this.Prop_Object("prop_43", 'auto_pick_interval')) {
                // 拾取全部经验球
                this.timer_prop_43 = 0;
                GameRules.BasicRules.PickAllExp(this.caster)
            }
        }

        // prop_45	【冰霜之心】	每过10秒，冻结自身半径500码敌人1秒
        if (this.object["prop_45"]) {
            this.timer_prop_45 += 1
            if (this.timer_prop_45 >= this.Prop_Object("prop_45", 'interval')) {
                let radius = this.Prop_Object('prop_45', 'root_radius');
                let duration = this.Prop_Object('prop_45', 'root_duration');
                let enemies = FindUnitsInRadius(
                    DotaTeam.GOODGUYS,
                    this.caster.GetAbsOrigin(),
                    null,
                    radius,
                    UnitTargetTeam.ENEMY,
                    UnitTargetType.BASIC + UnitTargetType.HERO,
                    UnitTargetFlags.NONE,
                    FindOrder.ANY,
                    false
                )

                for (let enemy of enemies) {
                    // enemy.IsCreepHero
                    GameRules.BuffManager.AddGeneralDebuff(this.caster, enemy, DebuffTypes.rooted, duration)
                }


                // effect
                // let effect_fx = ParticleManager.CreateParticle("")
            }
        }
    }

    OnBeInjured(params: ApplyCustomDamageOptions) {
        // prop_17	【刃甲】	反弹40%受到的伤害
        if (params.victim.prop_count["prop_17"]) {
            let value = GameRules.MysticalShopSystem.GetKvOfUnit(params.victim, 'prop_17', 'value');
            let attack_damage = params.damage * value * 0.01;
            let hAbility = params.victim.FindAbilityByName("public_attribute")
            GameRules.DamageSystem.ApplyDamage({
                victim: params.attacker,
                attacker: params.victim,
                damage: attack_damage,
                damage_type: DamageTypes.PHYSICAL,
                ability: hAbility,
                element_type: ElementTypes.NONE,
                is_primary: false,
            })
        }

        // prop_20	【你的滑板孩】	常驻移动速度+25%，但在受到伤害后变为移动速度降低50%持续3秒
        if (params.victim.prop_count["prop_20"]) {
            let move_speed_pct = GameRules.MysticalShopSystem.GetKvOfUnit(params.victim, 'prop_20', 'move_speed_pct');
            let duration = GameRules.MysticalShopSystem.GetKvOfUnit(params.victim, 'prop_20', 'duration');
            GameRules.CustomAttribute.SetAttributeInKey(params.victim, "prop_20_debuff", {
                'MoveSpeed': {
                    'BasePercent': move_speed_pct
                }
            }, duration)
        }

        // prop_27	【永世法衣】	增加40%技能强度，受到伤害时回复5点法力值（超稀有）
        if (params.victim.prop_count["prop_27"]) {
            let restore_mana = GameRules.MysticalShopSystem.GetKvOfUnit(params.victim, 'prop_27', 'restore_mana');
            GameRules.BasicRules.RestoreMana(params.victim, restore_mana)
        }

        // prop_38	【缚灵索】	攻击自身的敌人会被束缚1秒
        if (params.victim.prop_count["prop_38"]) {
            let root_duration = GameRules.MysticalShopSystem.GetKvOfUnit(params.victim, 'prop_38', 'root_duration');
            params.attacker.AddNewModifier(params.victim, null, "modifier_shop_prop_38", {
                duration: root_duration
            })
        }
    }

    /** 神罚效果 */
    Effect_Prop42() {
        let origin = this.caster.GetAbsOrigin();
        let radius = this.Prop_Object("prop_42", 'radius');
        let cast_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_zuus/zuus_lightning_bolt.vpcf",
            ParticleAttachment.POINT,
            this.caster
        )
        ParticleManager.SetParticleControl(cast_fx, 1, origin)
        ParticleManager.SetParticleControl(cast_fx, 0, origin + Vector(0, 0, 999) as Vector)
        ParticleManager.ReleaseParticleIndex(cast_fx)

        let aoe_cast_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_zuus/zuus_lightning_bolt_aoe.vpcf",
            ParticleAttachment.POINT,
            this.caster
        )
        ParticleManager.SetParticleControl(aoe_cast_fx, 0, origin)
        ParticleManager.SetParticleControl(aoe_cast_fx, 1, Vector(radius, 1, 1))
        ParticleManager.ReleaseParticleIndex(aoe_cast_fx)

        let damage_ratio = this.Prop_Object('prop_42', 'damage_ratio') * 0.01;
        let aoe_damage = this.caster.GetAverageTrueAttackDamage(null) * damage_ratio;

        let self_ratio = this.Prop_Object('prop_42', 'self_ratio') * 0.01;
        let self_damage = this.caster.GetAverageTrueAttackDamage(null) * damage_ratio * self_ratio;

        let unitlist = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            origin,
            null,
            radius,
            UnitTargetTeam.BOTH,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.FOW_VISIBLE,
            FindOrder.ANY,
            false
        )
        for (let unit of unitlist) {

            if (unit.GetTeam() == DotaTeam.GOODGUYS) {
                // 对自身造成伤害
                ApplyCustomDamage({
                    victim: unit,
                    attacker: this.caster,
                    damage: self_damage,
                    damage_type: DamageTypes.PURE,
                    element_type: ElementTypes.NONE,
                    ability: this.ability,
                    is_primary: false,
                })
            } else {
                ApplyCustomDamage({
                    victim: unit,
                    attacker: this.caster,
                    damage: aoe_damage,
                    damage_type: DamageTypes.PURE,
                    element_type: ElementTypes.NONE,
                    ability: this.ability,
                    is_primary: false,
                })
            }

        }


    }
}