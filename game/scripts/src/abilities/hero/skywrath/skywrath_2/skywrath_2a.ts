import { modifier_motion_surround } from "../../../../modifier/modifier_motion";
import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";

/**
 * "2技能可选技能：
元素缠绕（5/5）"	"在自身650码距离生成一种随机元素（风、雷、冰、火四个之中一个），对触碰到的敌人造成对应元素伤害。

伤害系数：攻击力120%/140%/160%/180%/240%·对应元素技能基础伤害
伤害间隔：1.0s
蓝量消耗：30
持续时间：8秒
cd：10秒"

 */

export const element_orb = {
    [ElementTypes.WIND]: "particles/units/heroes/hero_wisp/wisp_guardian_.vpcf",
    [ElementTypes.THUNDER]: "particles/units/heroes/hero_invoker_kid/invoker_kid_wex_orb.vpcf",
    [ElementTypes.ICE]: "particles/units/heroes/hero_invoker_kid/invoker_kid_quas_orb.vpcf",
    [ElementTypes.FIRE]: "particles/units/heroes/hero_invoker_kid/invoker_kid_exort_orb.vpcf",
}

@registerAbility()
export class skywrath_2a extends BaseHeroAbility {

    Precache(context: CScriptPrecacheContext): void {
        precacheResString(element_orb[ElementTypes.WIND], context)
        precacheResString(element_orb[ElementTypes.THUNDER], context)
        precacheResString(element_orb[ElementTypes.ICE], context)
        precacheResString(element_orb[ElementTypes.FIRE], context)
    }
    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_2a"
    }

    UpdataAbilityValue(): void {
        this.SetCustomAbilityType("Surround", true)
    }
}

@registerModifier()
export class modifier_skywrath_2a extends BaseHeroModifier {

    surround_radius: number;
    surround_duration: number;
    surround_count: number;
    surround_limit: number;
    surround_mdf = "modifier_skywrath_2a_surround";

    UpdataAbilityValue(): void {
        const hAbility = this.GetAbility();
        this.SelfAbilityMul = hAbility.GetSpecialValueFor("base_value");
        this.surround_radius = 650;//hAbility.GetSpecialValueFor("surround_radius");
        this.surround_duration = 8;//hAbility.GetSpecialValueFor("surround_duration");
        this.surround_count = 1;
    }

    OnIntervalThink() {
        if (this.CastingConditions()) {
            this.DoExecutedAbility()
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();
            const clone_unit = this.caster.clone_unit;

            this.ExtraEffect()
            let total_count = this.surround_count
            // 1个 面向 2个对角 3
            let pre_angle = 360 / total_count;
            let surround_speed = 300;//this.ability.GetTypesAffixValue(300, "Surround", "skv_surround_speed");
            let surround_distance = this.surround_radius;//this.ability.GetTypesAffixValue(, "Surround", "skv_surround_distance")
            for (let i = 0; i < total_count; i++) {
                let surround_qangle = i * pre_angle;

                let hSpirit = GameRules.SummonedSystem.CreatedUnit(
                    "npc_summoned_dummy",
                    this.caster.GetAbsOrigin() + Vector(0, 300, 0) as Vector,
                    this.caster,
                    this.surround_duration,
                    true
                )

                hSpirit.AddNewModifier(this.caster, this.ability, this.surround_mdf, {
                    duration: this.surround_duration,
                    surround_distance: surround_distance,
                    surround_qangle: surround_qangle,
                    surround_speed: surround_speed,
                    surround_entity: this.caster.entindex(),
                    manacost_bonus: manacost_bonus,
                    is_clone: 0,
                });
                // 如果有克隆体
                if (clone_unit != null && clone_unit.HasModifier("modifier_skywrath_5_clone_show")) {
                    // const clone_factor = this.caster.clone_factor;
                    let hSpirit2 = GameRules.SummonedSystem.CreatedUnit(
                        "npc_summoned_dummy",
                        clone_unit.GetAbsOrigin() + Vector(0, 300, 0) as Vector,
                        this.caster,
                        this.surround_duration,
                        true
                    )
                    hSpirit2.AddNewModifier(this.caster, this.ability, this.surround_mdf, {
                        duration: this.surround_duration,
                        surround_distance: surround_distance,
                        surround_qangle: surround_qangle,
                        surround_speed: surround_speed,
                        surround_entity: clone_unit.entindex(),
                        manacost_bonus: manacost_bonus,
                        is_clone: 1,
                    });
                }
            }
        }
    }

    SummonedUnit(hUnit: CDOTA_BaseNPC, manacost_bonus: number, clone_factor: number) {

    }
    ExtraEffect() {

    }
}

@registerModifier()
export class modifier_skywrath_2a_surround extends modifier_motion_surround {

    aura_radius = 100;
    ModifierAura = "modifier_skywrath_2a_surround_collision";
    element_type: ElementTypes;

    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return this.aura_radius; }
    IsAuraActiveOnDeath() { return false; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return this.ModifierAura; }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.INVISIBLE]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.NOT_ON_MINIMAP]: true,
            [ModifierState.UNSELECTABLE]: true,
        };
    }

    C_OnCreated(params: any): void {
        this.element_type = RandomInt(1, 4) as ElementTypes;
        this.GetParent().element_type = this.element_type
        this.GetParent().manacost_bonus = params.manacost_bonus;
        this.GetParent().is_clone = params.is_clone;
        let effect_name = element_orb[this.element_type];
        let cast_fx = ParticleManager.CreateParticle(
            effect_name,
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.GetParent()
        );
        ParticleManager.SetParticleControlEnt(
            cast_fx, 1, this.GetParent(), ParticleAttachment.POINT_FOLLOW, "", Vector(0, 0, 0), true
        )
        this.AddParticle(cast_fx, false, false, 1, false, false);
    }

    _OnIntervalThink() {
        if (!this.caster.IsAlive()) {
            this.Destroy()
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.GetParent())
    }
}

@registerModifier()
export class modifier_skywrath_2a_surround_collision extends BaseModifier {

    caster: CDOTA_BaseNPC;
    team: DotaTeam;
    ability_damage: number;
    ability: CDOTABaseAbility;
    radius: number;

    damage_type: DamageTypes;
    element_type: ElementTypes;

    interval: number;

    GetAttributes(): DOTAModifierAttribute_t {
        return ModifierAttribute.MULTIPLE
    }

    IsHidden(): boolean {
        return true
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.SelfAbilityMul = this.GetAbility().GetSpecialValueFor("base_value");
        this.SelfAbilityMul += this.caster.GetTalentKv("72", "base_bonus");
        // rune_59	法爷#8	元素缠绕系列技能基础伤害提高200%
        this.SelfAbilityMul += this.caster.GetRuneKv("rune_59", "value");

        this.ElementDmgMul = 0;
        this.DamageBonusMul = 0;
        this.interval = 1;
        // rune_61	法爷#10	元素缠绕系列基础伤害间隔减少50%
        let rune_61 = this.caster.GetRuneKv("rune_61", "interval_increase");
        this.interval = this.interval * (100 - rune_61) * 0.01

        this.team = this.caster.GetTeamNumber();
        this.ability = this.GetAbility();
        // const clone_factor = this.GetAuraOwner().clone_factor;
        this.ability_damage = this.caster.GetAverageTrueAttackDamage(null);
        this.OnCreated_Extends();

    }

    OnCreated_Extends() {
        this.damage_type = DamageTypes.MAGICAL
        this.element_type = this.GetAuraOwner().element_type
        this.manacost_bonus = this.GetAuraOwner().manacost_bonus;

        const is_clone = this.GetAuraOwner().is_clone
        ApplyCustomDamage({
            victim: this.GetParent(),
            attacker: this.GetCaster(),
            damage: this.ability_damage,
            damage_type: this.damage_type,
            ability: this.ability,
            element_type: this.element_type,
            is_primary: true,
            damage_vect: this.GetParent().GetAbsOrigin(),
            SelfAbilityMul: this.SelfAbilityMul,
            DamageBonusMul: this.manacost_bonus,
            is_clone: is_clone,
        })

        UTIL_Remove(this.GetAuraOwner())

    }


}