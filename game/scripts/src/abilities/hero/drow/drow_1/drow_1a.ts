import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_1, modifier_drow_1 } from "./drow_1";

/**
 * 攻击变为%aoe_radius%码范围伤害，伤害提高%bonus_value%%%，伤害变为火元素伤害。
 * 爆炸分支
 * A:浓缩（1/2）：爆炸箭有10%概率2.5倍伤害。（2/2）5倍伤害。
 * B:炸裂（1/2）：爆炸箭范围提高150码，灼烧伤害提高45%/90%。
 */
@registerAbility()
export class drow_1a extends drow_1 {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_1a"
    }
}

@registerModifier()
export class modifier_drow_1a extends modifier_drow_1 {

    // aoe_radius: number;
    // bonus_value: number;

    // mul_chance: number;
    // mul_value: number;

    bonus_radius: number;

    MdfUpdataAbilityValue_Extends(): void {
        // 基础
        this.aoe_radius = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "2", "aoe_radius");
        this.bonus_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "2", "bonus_value");

        // 浓缩
        this.mul_chance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "3", "mul_chance");
        this.mul_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "3", "mul_value");

        // 炸裂 灼烧伤害为属性值,
        this.bonus_radius = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "4", "aoe_radius");

        print("this.aoe_radius", this.aoe_radius, this.bonus_radius)
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.PROCATTACK_FEEDBACK,
            ModifierFunction.PROJECTILE_NAME,
        ]
    }

    GetModifierProcAttack_Feedback(event: ModifierAttackEvent): number {
        this.PlayAttackLanded({ hTarget: event.target })
        return - 1 * event.original_damage
    }

    /**
     * 攻击变为300码范围伤害（直径），伤害提高 40%/70%/120%，技能赋予火元素效果，伤害变为火元素伤害。
     * 伤害提高加算
     */
    PlayAttackLanded(params: PlayEffectProps): void {
        let hTarget = params.hTarget;
        let vPos = hTarget.GetAbsOrigin();
        let radius = this.aoe_radius + this.bonus_radius;
        let cast_fx = ParticleManager.CreateParticle(
            "particles/econ/items/abaddon/abaddon_alliance/abaddon_death_coil_alliance_explosion.vpcf",
            ParticleAttachment.WORLDORIGIN,
            this.caster
        )
        ParticleManager.SetParticleControl(cast_fx, 0, vPos);
        ParticleManager.ReleaseParticleIndex(cast_fx);

        // DebugDrawCircle(vPos, Vector(255, 0, 0), 100, radius, true, 0.5)
        let ability_damage = this.caster.GetAverageTrueAttackDamage(null) * (1 + (this.bonus_value) * 0.01)
        if (RollPercentage(this.mul_chance)) {
            ability_damage *= this.mul_value
        }
        let enemies = FindUnitsInRadius(
            this.team,
            vPos,
            null,
            radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.CLOSEST,
            false
        );

        for (let enemy of enemies) {
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this.GetAbility(),
                element_type: ElementTypeEnum.fire,
                is_primary: true,
            })
        }
    }

    GetModifierProjectileName(): string {
        return "particles/units/heroes/hero_clinkz/clinkz_searing_arrow.vpcf"
    }
}