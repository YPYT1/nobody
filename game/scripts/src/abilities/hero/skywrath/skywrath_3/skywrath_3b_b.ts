import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { modifier_skywrath_3b, skywrath_3b } from "./skywrath_3b";

/**
 * 97	死亡空间	"以自身为中心召唤法阵，对法阵内的敌人造成持续的暗元素伤害，提升10%/20%/30%的技能基础伤害。

持续时间：8秒
作用范围：自身半径600码"
98	至暗	"处于阵法内的敌人元素抗性降低50%，但自身每1秒扣除最大生命值的5%。
真实伤害,不吃减免,血量少于5%则直接死亡"

 */
@registerAbility()
export class skywrath_3b_b extends skywrath_3b {

    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/ability/skywrath/skywrath_fazhen.vpcf", context)
    }

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_3b_b"
    }
}

@registerModifier()
export class modifier_skywrath_3b_b extends modifier_skywrath_3b {

    OnIntervalThink(): void {
        if (this.CastingConditions()) {
            this.DoExecutedAbility()
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();
            // 开始蓄力
            this.caster.RemoveModifierByName("modifier_skywrath_3b_b_field")
            this.caster.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_3b_b_field", {
                duration: this.fazhen_duration,
                manacost_bonus: manacost_bonus,
                is_clone: 0,
            })

            if (this.CheckClone()) {
                this.caster.clone_unit.RemoveModifierByName("modifier_skywrath_3b_b_field")
                this.caster.clone_unit.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_3b_b_field", {
                    duration: this.fazhen_duration,
                    manacost_bonus: manacost_bonus,
                    is_clone: 1,
                })
            }

            if (RollPercentage(this.aoe_multiple)) {
                this.caster.SetContextThink("multicast_skywrath_3b_b", () => {
                    this.PlayMultiCast(2);
                    this.caster.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_3b_b_field", {
                        duration: this.fazhen_duration,
                        manacost_bonus: manacost_bonus,
                        is_clone: 0,
                    })

                    if (this.CheckClone()) {
                        this.caster.clone_unit.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_3b_b_field", {
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

}

@registerModifier()
export class modifier_skywrath_3b_b_field extends BaseModifier {

    radius: number;
    reduc_max_hppct: number;

    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return this.radius; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_skywrath_3b_b_field_aura"; }

    GetAttributes(): DOTAModifierAttribute_t {
        return ModifierAttribute.MULTIPLE
    }

    OnCreated(params: any): void {
        this.radius = 0;
        if (!IsServer()) { return }
        this.GetAbility().SetFrozenCooldown(true)
        this.caster = this.GetCaster();
        this.GetParent().is_clone = params.is_clone;
        this.is_clone = params.is_clone;
        this.radius = this.caster.GetTalentKv("97", "radius");
        this.radius = this.GetAbility().GetTypesAffixValue(this.radius, "Aoe", "skv_aoe_radius");
        this.manacost_bonus = params.manacost_bonus;
        let effect_fx = ParticleManager.CreateParticle(
            "particles/ability/skywrath/skywrath_fazhen.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.caster
        )
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(this.radius, this.radius, this.radius))
        this.AddParticle(effect_fx, false, false, -1, false, false)

        this.reduc_max_hppct = this.caster.GetTalentKv("98", "reduc_max_hppct");
        if (this.reduc_max_hppct > 0 && this.is_clone == 0) {
            // rune_78	法爷#27	至暗移除生命值消耗
            if (this.caster.GetRuneKv("rune_78", "value") == 0) {
                this.StartIntervalThink(1)
            }

        }

    }

    OnIntervalThink(): void {
        let health = this.caster.GetMaxHealth() * this.reduc_max_hppct * 0.01;
        ApplyCustomDamage({
            victim: this.caster,
            attacker: this.caster,
            damage: health,
            damage_type: DamageTypes.PURE,
            ability: this.GetAbility(),
        })
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        this.GetAbility().SetFrozenCooldown(false)
    }
}

@registerModifier()
export class modifier_skywrath_3b_b_field_aura extends BaseModifier {

    attack_damage: number;
    buff_key = "skywrath_3b_b_field_aura";

    GetAttributes(): DOTAModifierAttribute_t {
        return ModifierAttribute.MULTIPLE
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        this.caster = this.GetCaster()
        this.team = this.caster.GetTeam()
        this.is_clone = this.GetAuraOwner().is_clone;
        this.attack_damage = this.caster.GetAverageTrueAttackDamage(null)
        this.SelfAbilityMul = this.caster.GetTalentKv("94", "base_value") + this.caster.GetTalentKv("97", "bonus_base");
        // rune_77	法爷#26	死亡空间的技能基础伤害提升100%
        this.SelfAbilityMul += this.caster.GetRuneKv("rune_77", "value");

        let interval_increase = this.GetAbility().GetTypesAffixValue(0, "Dot", "skv_dot_interval");
        let base_interval = 1
        let dot_interval = base_interval / (1 + interval_increase * 0.01);
        this.OnIntervalThink()
        this.StartIntervalThink(dot_interval)

        const element_resist = this.caster.GetTalentKv("98", "element_resist");
        if (element_resist != 0) {
            GameRules.EnemyAttribute.SetAttributeInKey(this.parent, this.buff_key, {
                "AllElementResist": {
                    "Base": element_resist
                }
            })
        }

    }

    OnIntervalThink(): void {
        ApplyCustomDamage({
            victim: this.GetParent(),
            attacker: this.caster,
            damage: this.attack_damage,
            damage_type: DamageTypes.MAGICAL,
            ability: this.GetAbility(),
            element_type: ElementTypes.DARK,
            is_primary: true,
            // 增伤
            SelfAbilityMul: this.SelfAbilityMul,
            DamageBonusMul: 0,
            is_clone: this.is_clone,
        })
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.EnemyAttribute.DelAttributeInKey(this.parent, this.buff_key)
    }
}