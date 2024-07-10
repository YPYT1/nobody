import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_1, modifier_drow_1 } from "./drow_1";

/**
 * 爆炸分支
 * A:浓缩（1/2）：爆炸箭有10%概率2.5倍伤害。（2/2）5倍伤害。
 * B:炸裂（1/2）：爆炸箭范围变为450码（直径），灼烧伤害提高45%。
 */
@registerAbility()
export class drow_1a extends drow_1 {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_1a"
    }
}

@registerModifier()
export class modifier_drow_1a extends modifier_drow_1 {

    raidus = 300;
    mul_chance: number;

    UpdateSpecialValue(): void {
        this.fakeAttack = false;
        this.useProjectile = true;
        this.mul_chance = this.GetAbility().GetSpecialValueFor("mul_chance");
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
        let cast_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_warlock/warlock_ambient_explosion.vpcf",
            ParticleAttachment.WORLDORIGIN,
            this.caster
        )
        ParticleManager.SetParticleControl(cast_fx, 0, vPos);
        ParticleManager.ReleaseParticleIndex(cast_fx);

        // DebugDrawCircle(vPos, Vector(255, 0, 0), 100, this.raidus, true, 0.5)
        let ability_damage = this.caster.GetAverageTrueAttackDamage(null) * (1 + 0.4)
        let enemies = FindUnitsInRadius(
            this.team,
            vPos,
            null,
            this.raidus,
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
            // 添加灼烧
        }
    }

    GetModifierProjectileName(): string {
        return "particles/units/heroes/hero_clinkz/clinkz_searing_arrow.vpcf"
    }
}