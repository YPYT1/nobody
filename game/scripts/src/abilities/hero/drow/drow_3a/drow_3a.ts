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

    Precache(context: CScriptPrecacheContext): void {
        print("Precache drow_3a")
        PrecacheResource('particle', "particles/units/heroes/hero_wisp/wisp_guardian_.vpcf", context);
    }

    GetIntrinsicModifierName(): string {
        return "modifier_drow_3a"
    }
}

@registerModifier()
export class modifier_drow_3a extends BaseHeroModifier {

    base_count: number;
    bonus_count: number;
    surround_duration: number;

    UpdataAbilityValue(): void {
        this.base_count = this.ability.GetSpecialValueFor("base_count");
        this.surround_duration = this.ability.GetSpecialValueFor("surround_duration");
    }

    UpdataSpecialValue(): void {
        this.bonus_count = 0
    }

    OnIntervalThink() {
        if (this.caster.IsAlive() && this.ability.IsCooldownReady() && this.caster.GetMana() >= this.ability.GetManaCost(0)) {
            this.ability.UseResources(true, true, true, true)
            let total_count = 3;//this.base_count + this.bonus_count;
            // 1个 面向 2个对角 3
            let pre_angle = 360 / total_count;
            for (let i = 0; i < total_count; i++) {
                let surround_qangle = i * pre_angle;
                let hSpirit = GameRules.SummonedSystem.CreatedUnit(
                    "npc_summoned_dummy",
                    this.caster.GetAbsOrigin() + Vector(0, 300, 0) as Vector,
                    this.caster,
                    this.surround_duration,
                    true
                )

                hSpirit.AddNewModifier(this.caster, this.ability, "modifier_drow_3a_summoned", {
                    duration: this.surround_duration,
                    surround_distance: 500,
                    surround_qangle: surround_qangle,
                    surround_speed: 500,
                    surround_entity: this.caster.entindex(),
                });
            }

        }
    }

}

@registerModifier()
export class modifier_drow_3a_summoned extends modifier_motion_surround {

    // IsAura(): boolean { return true; }
    // GetAuraRadius(): number { return 128; }
    // IsAuraActiveOnDeath() { return false; }
    // GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    // GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    // GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    // GetModifierAura() { return "modifier_drow_3a_summoned_collision"; }

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
        let hParent = this.GetParent();
        hParent.summoned_damage = this.GetAbility().GetAbilityDamage();
        let Vpcf1 = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_wisp/wisp_guardian_.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
        this.AddParticle(Vpcf1, false, false, 1, false, false);
    }

}