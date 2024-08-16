/** @noSelf */
import { modifier_motion_surround } from "../../../../modifier/modifier_motion";
import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";

/**
 * 风暴环绕【环绕型】(5/5)：
召唤一阵风暴环绕自身，每1秒对触碰到风暴的敌人造成攻击力200%/250%/300%/350%/400%/450%的伤害，持续8秒。
cd:15秒
蓝量消耗：20
作用范围：生成在自身距离500码处
 */
@registerAbility()
export class drow_3a extends BaseHeroAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_3a"
    }

    UpdataAbilityValue(): void {
        this.SetCustomAbilityType("Surround", true)
    }
}

@registerModifier()
export class modifier_drow_3a extends BaseHeroModifier {

    base_count: number;
    bonus_count: number;
    surround_duration: number;
    surround_mdf = "modifier_drow_3a_summoned";

    UpdataAbilityValue(): void {
        this.base_count = this.ability.GetSpecialValueFor("base_count");
        this.surround_duration = this.ability.GetSpecialValueFor("surround_duration");
    }

    UpdataSpecialValue(): void {
        this.bonus_count = 0
    }

    OnIntervalThink() {
        if (this.caster.IsAlive()
            && this.ability.IsActivated()
            && this.ability.IsCooldownReady()
            && this.ability.IsMeetCastCondition()
        ) {
            this.DoExecutedAbility()
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();
            this.ExtraEffect()
            let total_count = this.base_count + this.bonus_count;
            let skv_surround_count = this.ability.GetTypesAffixValue(0, "Surround", "skv_surround_count");
            // print("skv_surround_count", skv_surround_count)
            total_count += this.ability.GetTypesAffixValue(0, "Surround", "skv_surround_count");
            // 1个 面向 2个对角 3
            let pre_angle = 360 / total_count;
            let surround_speed = this.ability.GetTypesAffixValue(300, "Surround", "skv_surround_speed");
            let surround_distance = this.ability.GetTypesAffixValue(500, "Surround", "skv_surround_distance")
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
                });
            }

        }
    }

    /** 额外效果 */
    ExtraEffect() {

    }
}

@registerModifier()
export class modifier_drow_3a_summoned extends modifier_motion_surround {

    aura_radius = 300;
    ModifierAura = "modifier_drow_3a_summoned_collision";

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
        let cast_fx = ParticleManager.CreateParticle(
            "particles/dev/tornado/tornado_1.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
        ParticleManager.SetParticleControl(cast_fx, 1, Vector(this.aura_radius, 1, 1))
        this.AddParticle(cast_fx, false, false, 1, false, false);
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.GetParent())
    }
}

@registerModifier()
export class modifier_drow_3a_summoned_collision extends BaseModifier {

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
        // rune_40	游侠#15	风暴环绕的基础伤害提高100%
        this.SelfAbilityMul += GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_40', 'base_value');
        this.ElementDmgMul = 0;
        this.DamageBonusMul = 0;
        this.interval = this.GetAbility().GetSpecialValueFor("interval");
        this.team = this.caster.GetTeamNumber();
        this.ability = this.GetAbility();
        this.ability_damage = this.caster.GetAverageTrueAttackDamage(null);
        this.OnCreated_Extends();
        this.OnIntervalThink();
        print("this.interval",this.interval)
        this.StartIntervalThink(this.interval);
    }

    OnCreated_Extends() {
        this.damage_type = DamageTypes.PHYSICAL;
        this.element_type = ElementTypes.NONE
        this.interval = 1;
    }

    OnIntervalThink(): void {
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
            DamageBonusMul: this.DamageBonusMul,
            ElementDmgMul: this.ElementDmgMul,
        })
    }
}