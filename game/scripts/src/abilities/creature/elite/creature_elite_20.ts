// import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
// import { BaseCreatureAbility } from "../base_creature";

// /**
//  * creature_elite_20	集体传送
//  * 开启传送阵吟唱2秒，将自身周围1000码内所有英雄传送到最近的敌方玩家（1名）附近
//  * 瑞兹大招
//  */

// @registerAbility()
// export class creature_elite_20 extends BaseCreatureAbility {

//     Precache(context: CScriptPrecacheContext): void {
//         precacheResString("particles/custom/creature/elite/teleport_sphere.vpcf", context);
//         precacheResString("particles/custom/creature/elite/teleport_start.vpcf", context);
//         precacheResString("particles/custom/creature/elite/teleport_sphere_end.vpcf", context);

//     }
//     OnAbilityPhaseStart(): boolean {
//         const duration = 3;
//         const radius = 500;
//         const color = Vector(127, 87, 192)
//         // this.hTarget = this.GetCursorTarget();
//         this.vPoint = this.GetCursorPosition();
//         this.nPreviewFX = ParticleManager.CreateParticle(
//             "particles/custom/creature/elite/teleport_sphere.vpcf",
//             ParticleAttachment.POINT,
//             this.GetCaster()
//         )
//         ParticleManager.SetParticleControl(this.nPreviewFX, 1, Vector(duration, radius + 25, 0));
//         ParticleManager.SetParticleControl(this.nPreviewFX, 2, color);
//         let effect_fx = ParticleManager.CreateParticle(
//             "particles/custom/creature/elite/teleportf10a.vpcf",
//             ParticleAttachment.ABSORIGIN_FOLLOW,
//             this.GetCaster()
//         );
//         ParticleManager.SetParticleControlEnt(effect_fx, 0,
//             this.GetCaster(),
//             ParticleAttachment.ABSORIGIN_FOLLOW,
//             "",
//             Vector(0, 0, 0),
//             true
//         );
//         ParticleManager.SetParticleControlEnt(effect_fx, 1,
//             this.GetCaster(),
//             ParticleAttachment.ABSORIGIN_FOLLOW,
//             "",
//             Vector(0, 0, 0),
//             true
//         );
//         this.nPreviewFX_2 = effect_fx

//         let effect_fx2 = ParticleManager.CreateParticle(
//             "particles/custom/creature/elite/teleport_sphere_end.vpcf",
//             ParticleAttachment.CUSTOMORIGIN,
//             this.GetCaster()
//         )
//         ParticleManager.SetParticleControl(effect_fx2, 0, this.vPoint);
//         ParticleManager.SetParticleControl(effect_fx2, 1, Vector(duration, radius + 25, 0));
//         ParticleManager.SetParticleControl(effect_fx2, 2, color);
//         this.nPreviewFX_List.push(effect_fx2)

//         return true
//     }

//     OnSpellStart(): void {
//         this.DestroyWarningFx()
//         const color = Vector(127, 87, 192)
//         let hero_distance = this.GetSpecialValueFor("hero_distance")
//         // let vTarget = this.hTarget.GetAbsOrigin();
//         let friendly = FindUnitsInRadius(
//             this.hCaster.GetTeam(),
//             this.hCaster.GetAbsOrigin(),
//             null,
//             this._radius,
//             UnitTargetTeam.FRIENDLY,
//             UnitTargetType.BASIC + UnitTargetType.HERO,
//             UnitTargetFlags.NONE,
//             FindOrder.ANY,
//             false
//         )
//         for (let unit of friendly) {
//             let vect = this.vPoint + Vector(
//                 RandomInt(-hero_distance, hero_distance),
//                 RandomInt(-hero_distance, hero_distance),
//                 0
//             ) as Vector
//             unit.SetAbsOrigin(vect)
//             let effect_fx = ParticleManager.CreateParticle(
//                 "particles/custom/creature/elite/teleport_start.vpcf",
//                 ParticleAttachment.POINT,
//                 unit
//             )
//             ParticleManager.SetParticleControl(effect_fx, 2, color)
//             ParticleManager.ReleaseParticleIndex(effect_fx)

//             let effect_fx_end = ParticleManager.CreateParticle(
//                 "particles/custom/creature/elite/teleport_start.vpcf",
//                 ParticleAttachment.CUSTOMORIGIN,
//                 unit
//             )
//             ParticleManager.SetParticleControl(effect_fx_end, 0, vect)
//             ParticleManager.SetParticleControl(effect_fx_end, 2, color)
//             ParticleManager.ReleaseParticleIndex(effect_fx_end)
//         }
//     }
// }

import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

/**
 * creature_elite_20	集体传送
 * 开启传送阵吟唱2秒，将自身周围1000码内所有英雄传送到最近的敌方玩家（1名）附近
 * 瑞兹大招
 **/
@registerAbility()
export class creature_elite_20 extends BaseCreatureAbility {
    OnSpellStart(): void {
        const caster = this.GetCaster();
        const hero_distance = this.GetSpecialValueFor('hero_distance');
        const radius = 1000; // 固定，也可以用 GetSpecialValueFor("radius")

        // 找最近的敌方英雄
        const enemies = FindUnitsInRadius(
            caster.GetTeamNumber(),
            caster.GetAbsOrigin(),
            undefined,
            99999, // 全图
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.CLOSEST,
            false
        );

        if (enemies.length == 0) return;

        const nearestEnemy = enemies[0];
        const enemyPos = nearestEnemy.GetAbsOrigin();

        // 找范围内友方英雄
        const allies = FindUnitsInRadius(
            caster.GetTeamNumber(),
            caster.GetAbsOrigin(),
            undefined,
            radius,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        for (const ally of allies) {
            const offset = Vector(RandomInt(-hero_distance, hero_distance), RandomInt(-hero_distance, hero_distance), 0);
            // Ensure the sum is treated as a Vector for TS typing
            const targetPos = (enemyPos + offset) as Vector;
            ally.SetAbsOrigin(targetPos);
        }
    }
}
