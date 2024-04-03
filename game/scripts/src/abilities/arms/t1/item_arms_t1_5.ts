// import { modifier_motion_surround } from "../../../modifier/modifier_motion";
// import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
// import { BaseArmsAbility, BaseArmsModifier } from "../base_arms";

// @registerAbility()
// export class item_arms_t1_5 extends BaseArmsAbility {

//     mdf_name = "modifier_item_arms_t1_5";

//     Precache(context: CScriptPrecacheContext): void {
//         PrecacheResource("particle", "particles/units/heroes/hero_windrunner/windrunner_spell_powershot.vpcf", context);
//     }

//     ArmsEffectStart(): void {
//         print("ArmsEffectStart")
//         const vPoint = this.caster.GetOrigin();
//         const projectile_distance = 600;

//         let enemies = FindUnitsInRadius(
//             this.caster.GetTeam(),
//             vPoint,
//             null,
//             projectile_distance,
//             UnitTargetTeam.ENEMY,
//             UnitTargetType.BASIC + UnitTargetType.HERO,
//             UnitTargetFlags.NONE,
//             FindOrder.ANY,
//             false
//         );
//         let target_vect: Vector;
//         if (enemies.length > 0) {
//             target_vect = enemies[0].GetOrigin();
//         } else {
//             target_vect = vPoint + this.caster.GetForwardVector() * 100 as Vector;
//         }

//         CreateModifierThinker(
//             this.caster,
//             this,
//             "modifier_item_arms_t1_5_powershot",
//             {
//             },
//             target_vect,
//             this.caster.GetTeamNumber(),
//             false
//         );

//         let extra_count = this.GetSpecialValueFor("projectile_count") - 1;
//         if (extra_count > 0) {
//             for (let i = 0; i < extra_count; i++) {
//                 let is_even = i % 2 == 0; // 偶数
//                 let angle_y = is_even ? 20 * math.floor(1 + i / 2) : -20 * math.floor(1 + i / 2);
//                 // print(i, is_even, angle_y);
//                 let point = RotatePosition(vPoint, QAngle(0, angle_y, 0), target_vect);
//                 CreateModifierThinker(
//                     this.caster,
//                     this,
//                     "modifier_item_arms_t1_5_powershot",
//                     {
//                         duration: 2
//                     },
//                     point,
//                     this.caster.GetTeamNumber(),
//                     false
//                 );

//             }
//         }
//         // 
//     }



//     OnProjectileHit_ExtraData(target: CDOTA_BaseNPC, location: Vector, extraData: object): boolean | void {
//         print("OnProjectileHit_ExtraData")
//         DeepPrintTable(extraData)
//     }

//     OnProjectileHit(target: CDOTA_BaseNPC, location: Vector): boolean | void {
//         print("OnProjectileHit")
//     }
// }

// @registerModifier()
// export class modifier_item_arms_t1_5 extends BaseArmsModifier { }



// @registerModifier()
// export class modifier_item_arms_t1_5_powershot extends BaseModifier {

//     OnCreated(params: object): void {
//         if (!IsServer()) { return }
//         let proj_radius = 150;
//         let hAbility = this.GetAbility();
//         let EffectName = "particles/units/heroes/hero_windrunner/windrunner_spell_powershot.vpcf";
//         let target_vect = this.GetParent().GetOrigin();
//         let speed = 1800;
//         let direction = target_vect - this.GetCaster().GetOrigin() as Vector;
//         direction.z = 0;
//         direction = direction.Normalized();
//         print((direction * speed),direction)
//         let projectile_id = ProjectileManager.CreateLinearProjectile({
//             EffectName: EffectName,
//             Ability: hAbility,
//             vSpawnOrigin: this.GetCaster().GetOrigin(),
//             fStartRadius: proj_radius,
//             fEndRadius: proj_radius,
//             vVelocity: (direction * speed) as Vector,
//             fDistance: 1000,
//             Source: this.GetCaster(),
//             iUnitTargetTeam: UnitTargetTeam.ENEMY,
//             iUnitTargetType: UnitTargetType.BASIC + UnitTargetType.HERO,
//             iUnitTargetFlags: UnitTargetFlags.NONE,
//             ExtraData: {
//                 thinker: this.GetParent().entindex()
//             }
//         });
//         print("modifier_item_arms_t1_5_powershot", projectile_id)
//     }
// }