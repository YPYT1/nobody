import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { modifier_skywrath_3b, skywrath_3b } from "./skywrath_3b";


/**
 * 95	极寒领域	"自身为中心召唤法阵，对法阵内的敌人造成持续的冰元素伤害，提升40%/70%/100%的技能基础伤害。

持续时间：与【法阵】技能相同
作用范围：自身半径600码"
96	冰尘	极寒领域cd减少10秒。

 */
@registerAbility()
export class skywrath_3b_a extends skywrath_3b {

    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/units/heroes/hero_crystalmaiden/maiden_freezing_field_caster.vpcf", context)
        precacheResString("particles/units/heroes/hero_crystalmaiden/maiden_freezing_field_snow.vpcf", context)
        precacheResString("particles/custom/hero/skywrath3b/jihan_fazhen.vpcf", context)
        precacheResString("particles/units/heroes/hero_crystalmaiden/maiden_freezing_field_explosion.vpcf", context)
    }

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_3b_a"
    }

    TriggerActive(params: PlayEffectProps): void {

    }
}

@registerModifier()
export class modifier_skywrath_3b_a extends modifier_skywrath_3b {

    constant_cd: number;

    UpdataSpecialValue(): void {
        this.constant_cd = this.caster.GetTalentKv("96", "reduce_cd");

    }

    OnIntervalThink(): void {
        if (this.CastingConditions()) {
            this.DoExecutedAbility()
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();
            // 开始蓄力
            // print("fazhen_duration",this.fazhen_duration)
            this.caster.RemoveModifierByName("modifier_skywrath_3b_a_jihan")
            this.caster.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_3b_a_jihan", {
                duration: this.fazhen_duration,
                manacost_bonus: manacost_bonus,
                is_clone: 0,
            })
            //

            if (this.CheckClone()) {
                this.caster.clone_unit.RemoveModifierByName("modifier_skywrath_3b_a_jihan");
                this.caster.clone_unit.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_3b_a_jihan", {
                    duration: this.fazhen_duration,
                    manacost_bonus: manacost_bonus,
                    is_clone: 1,
                })
            }

            if (RollPercentage(this.aoe_multiple)) {
                this.caster.SetContextThink("multicast_skywrath_3b_a", () => {
                    this.PlayMultiCast(2);
                    this.caster.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_3b_a_jihan", {
                        duration: this.fazhen_duration,
                        manacost_bonus: manacost_bonus,
                        is_clone: 0,
                    })

                    if (this.CheckClone()) {
                        this.caster.clone_unit.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_3b_a_jihan", {
                            duration: this.fazhen_duration,
                            manacost_bonus: manacost_bonus,
                            is_clone: 1,
                        })
                    }
                    return null
                }, 0.25)

            }
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.COOLDOWN_REDUCTION_CONSTANT
        ]
    }

    GetModifierCooldownReduction_Constant(event: ModifierAbilityEvent): number {
        if (event.ability == this.GetAbility()) {
            return this.constant_cd
        }
    }
}

@registerModifier()
export class modifier_skywrath_3b_a_jihan extends BaseModifier {

    radius: number;
    rune76: number;

    GetAttributes(): DOTAModifierAttribute_t {
        return ModifierAttribute.MULTIPLE
    }

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.GetAbility().SetFrozenCooldown(true)
        this.caster = this.GetCaster()
        this.parent = this.GetParent();
        this.team = this.caster.GetTeam()
        this.is_clone = params.is_clone;
        this.attack_damage = this.caster.GetAverageTrueAttackDamage(null)
        this.SelfAbilityMul = this.caster.GetTalentKv("94", "base_value") + this.caster.GetTalentKv("95", "bonus_base");
        this.radius = this.caster.GetTalentKv("95", "jihan_radius");

        this.radius = this.GetAbility().GetTypesAffixValue(this.radius, "Aoe", "skv_aoe_radius");

        this.manacost_bonus = params.manacost_bonus;
        let caster_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_crystalmaiden/maiden_freezing_field_caster.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.parent
        )
        this.AddParticle(caster_fx, false, false, -1, false, false)
        // rune_76	法爷#25	极寒领域对冻结的单位提升55%的最终伤害
        this.rune76 = this.caster.GetRuneKv("rune_76", "value");
        let snow_fx = ParticleManager.CreateParticle(
            "particles/custom/hero/skywrath3b/jihan_fazhen.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.caster
        )
        ParticleManager.SetParticleControl(snow_fx, 1, Vector(this.radius, 1, 1))
        this.AddParticle(snow_fx, false, false, -1, false, false)

        let interval_increase = this.GetAbility().GetTypesAffixValue(0, "Dot", "skv_dot_interval");
        let base_interval = 1
        let dot_interval = base_interval / (1 + interval_increase * 0.01);
        this.OnIntervalThink()
        this.StartIntervalThink(dot_interval)
    }

    OnIntervalThink(): void {
        const origin = this.parent.GetAbsOrigin();
        const enemies = FindUnitsInRadius(
            this.team,
            origin,
            null,
            this.radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HEROES_AND_CREEPS,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        for (let enemy of enemies) {
            let FinalDamageMul = 0;
            if (this.rune76 > 0 && enemy.State_Frozen()) {
                FinalDamageMul += this.rune76
            }
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: this.attack_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this.GetAbility(),
                element_type: ElementTypes.ICE,
                is_primary: true,
                // 增伤
                SelfAbilityMul: this.SelfAbilityMul,
                DamageBonusMul: this.manacost_bonus,
                FinalDamageMul: FinalDamageMul,
                is_clone: this.is_clone,
            })
        }

        // 极寒领域冰爆 TODO
        for (let i = 0; i < 6; i++) {
            let a = RandomInt(0, 359)
            let r = RandomInt(0, this.radius)
            let point = Vector(math.cos(a), math.sin(a), 0).Normalized() * r as Vector
            point = origin + point as Vector;
            this.PlayEffect2(point)
        }
    }

    PlayEffect2(vPos: Vector) {
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_crystalmaiden/maiden_freezing_field_explosion.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            null
        )
        ParticleManager.SetParticleControl(effect_fx, 0, vPos);
        ParticleManager.ReleaseParticleIndex(effect_fx)
        EmitSoundOnLocationWithCaster(vPos, "hero_Crystal.freezingField.explosion", this.caster)
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        this.GetAbility().SetFrozenCooldown(false)
    }
}