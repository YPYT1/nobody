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

    branch_a: number;
    branch_b: number;

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.ON_ATTACK_START,
            ModifierFunction.PROCATTACK_FEEDBACK,
            ModifierFunction.PROJECTILE_NAME,
        ]
    }

    UpdateSpecialValue(): void {
        this.branch_a = 1;
        this.branch_b = 1;
    }

    // OnIntervalThink(): void {
    //     if (this.caster.AttackReady()) {
    //         let attackrange = this.caster.Script_GetAttackRange() + 64;
    //         let enemies = FindUnitsInRadius(
    //             this.team,
    //             this.caster.GetAbsOrigin(),
    //             null,
    //             attackrange,
    //             UnitTargetTeam.ENEMY,
    //             UnitTargetType.HERO + UnitTargetType.BASIC,
    //             UnitTargetFlags.NONE,
    //             FindOrder.ANY,
    //             false
    //         )
    //         if (enemies.length <= 0) { return }
    //         let hTarget = enemies[0];
    //         this.caster.in_process_attack = true;
    //         this.caster.GiveMana(5);
    //         this.caster.PerformAttack(
    //             hTarget,
    //             true, // useCastAttackOrb
    //             true, // processProcs
    //             false, // skipCooldown
    //             false, // ignoreInvis
    //             true, // useProjectile
    //             false, // fakeAttack
    //             false // neverMiss
    //         );
    //         this.caster.in_process_attack = false;
    //         this.PlayEffect({ hTarget: hTarget, unit_list: enemies })
    //     }
    // }

    OnAttackStart(event: ModifierAttackEvent): void {
        if (event.attacker != this.GetParent()) { return }
        this.PlayAttackStart({ hTarget: event.target })
    }

    PlayAttackStart(params: PlayEffectProps): void {
        let hTarget = params.hTarget;
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
        if (this.branch_b > 0) {
            // 额外回蓝
            this.caster.GiveMana(2);
        }
        // 寒冰箭150 / 300
        return event.original_damage * 1.5
    }

    GetModifierProjectileName(): string {
        return "particles/econ/items/drow/drow_arcana/drow_arcana_frost_arrow.vpcf"
    }
}