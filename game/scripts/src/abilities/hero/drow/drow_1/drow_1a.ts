import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_1, modifier_drow_1 } from "./drow_1";

/**
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

    aoe_radius:number;
    bonus_radius:number;
    mul_chance: number;
    mul_bonus:number;

    branch_3:number;

    MdfUpdataAbilityValue_Extends(): void {
        this.aoe_radius = this.ability.GetSpecialValueFor("aoe_radius");
        // 浓缩
        this.mul_chance = 0;
        this.mul_bonus = 1;
        // 炸裂 灼烧伤害为属性值,
        this.bonus_radius = 0; 
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
            "particles/units/heroes/hero_warlock/warlock_ambient_explosion.vpcf",
            ParticleAttachment.WORLDORIGIN,
            this.caster
        )
        ParticleManager.SetParticleControl(cast_fx, 0, vPos);
        ParticleManager.ReleaseParticleIndex(cast_fx);

        // DebugDrawCircle(vPos, Vector(255, 0, 0), 100, this.raidus, true, 0.5)
        let ability_damage = this.caster.GetAverageTrueAttackDamage(null) * (1 + 0.4)
        if(RollPercentage(this.mul_chance)){
            ability_damage *= 2.5
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