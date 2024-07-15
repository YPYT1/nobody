import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_1, modifier_drow_1 } from "./drow_1";

/**
 * 分裂箭【目标型】（1/3）：攻击可以同时命中2个敌人。（2/3）：同时命中3个敌人。（3/3）同时命中5个敌人。
 * 
 * 分支A:寒冰箭《冰》（1/2）：伤害提高150%，技能赋予冰元素效果，伤害变为冰元素伤害。（2/2）伤害提高300%
 * 分支B:积蓄（1/2）：分裂箭命中时会额外回复2点蓝量。（2/2）：分裂箭命中时会额外回复4点蓝量。
 */
@registerAbility()
export class drow_1c extends drow_1 {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_1c"
    }
}

@registerModifier()
export class modifier_drow_1c extends modifier_drow_1 {

    /** 寒冰箭天赋 */
    talent_9: number = 0;
    talent_9_percent: number = 0;
    /** 积蓄天赋 */
    talent_10: number = 0;

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.ON_ATTACK_START,
            ModifierFunction.PROCATTACK_FEEDBACK,
            ModifierFunction.PROJECTILE_NAME,
        ]
    }

    UpdataSpecialValue(): void {
        this.talent_9 = this.caster.hero_talent["9"] ?? 0;
        this.talent_9_percent = 150;
        this.talent_10 = 1;
    }

    OnAttackStart(event: ModifierAttackEvent): void {
        if (event.attacker != this.GetParent()) { return }
        this.PlayAttackStart({ hTarget: event.target })
    }

    PlayAttackStart(params: PlayEffectProps): void {
        let hTarget = params.hTarget;
        this.ability_damage = math.floor(
            this.caster.GetAverageTrueAttackDamage(null)
            * (1 + this.base_value * 0.01 + this.talent_9_percent * 0.01)
        )
        let enemies = FindUnitsInRadius(
            this.team,
            this.caster.GetAbsOrigin(),
            null,
            this.caster.Script_GetAttackRange() + 64,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        let count = 0;
        for (let enemy of enemies) {
            if (enemy != hTarget) {
                count += 1;
                this.caster.PerformAttack(
                    enemy,
                    true, // useCastAttackOrb
                    true, // processProcs
                    true, // skipCooldown
                    false, // ignoreInvis
                    true, // useProjectile
                    false, // fakeAttack
                    false // neverMiss
                );
            }

            if (count >= 5) {
                break
            }
        }
    }

    GetModifierProcAttack_Feedback(event: ModifierAttackEvent): number {
        if (this.talent_10 > 0) {
            // 额外回蓝
            this.caster.GiveMana(2);
        }
        // 寒冰箭150 / 300
        if (this.talent_9 > 0) {
            ApplyCustomDamage({
                victim: event.target,
                attacker: this.GetCaster(),
                damage: this.ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this.ability,
                element_type: ElementTypeEnum.ice
            })
            return -1 * event.original_damage
        }
        return 0

    }

    GetModifierProjectileName(): string {
        return "particles/econ/items/drow/drow_arcana/drow_arcana_frost_arrow.vpcf"
    }
}