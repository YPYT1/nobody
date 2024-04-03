// import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";

// @registerAbility()
// export class arms_t1_2 extends BaseAbility {

//     GetIntrinsicModifierName(): string {
//         return "modifier_arms_t1_2"
//     }
// }

// @registerModifier()
// export class modifier_arms_t1_2 extends BaseModifier {

//     caster: CDOTA_BaseNPC;
//     ability: CDOTABaseAbility;

//     OnCreated(params: object): void {
//         this.OnRefresh(params);
//     }

//     OnRefresh(params: object): void {
//         if (!IsServer()) { return }
//         this.ability = this.GetAbility();
//         this.caster = this.GetCaster();
//         this.StartIntervalThink(0.1)
//     }

//     OnIntervalThink(): void {
//         let hCaster = this.GetCaster();
//         if (hCaster.IsAlive() == false || this.ability == null) {
//             this.StartIntervalThink(-1)
//             return
//         }

//         if (this.GetAbility().IsCooldownReady()) {
//             this.GetAbility().UseResources(false, false, false, true);
//             this.GetAbility().SetFrozenCooldown(true);
//             let duration = this.ability.GetSpecialValueFor("duration");
//             this.caster.AddNewModifier(this.caster, this.ability, "modifier_arms_t1_2_ring", {
//                 duration: duration,
//             })

//             this.caster.AddNewModifier(this.caster, this.ability, "modifier_arms_t1_2_ring_circle", {
//                 duration: duration,
//             })

//         }
//     }

// }

// @registerModifier()
// export class modifier_arms_t1_2_ring extends BaseModifier {

//     effect_fx: ParticleID;
//     ability_range: number;
//     ability_damage: number;
//     interval: number;
//     caster: CDOTA_BaseNPC;
//     timer: number;
//     bonus_radius: number;

//     OnCreated(params: object): void {
//         this.ability_range = this.GetAbility().GetSpecialValueFor("radius");
//         this.interval = this.GetAbility().GetSpecialValueFor("interval");
//         this.caster = this.GetParent();
//         if (!IsServer()) { return }
//         this.ability_damage = this.caster.GetAverageTrueAttackDamage(null);
//         let effect_fx = ParticleManager.CreateParticle(
//             "particles/units/heroes/hero_razor/razor_plasmafield.vpcf",
//             ParticleAttachment.ABSORIGIN_FOLLOW,
//             this.GetParent()
//         )
//         ParticleManager.SetParticleControl(effect_fx, 1, Vector(9000, this.ability_range, 1))
//         this.effect_fx = effect_fx;
//         this.AddParticle(effect_fx, false, false, -1, false, false);
//         this.bonus_radius = 0;
//         this.timer = 0;
//         this.OnIntervalThink()
//         this.StartIntervalThink(0.01)
//     }

//     OnIntervalThink(): void {
//         this.timer += 1;
//         if (this.timer % (this.interval * 100) == 1) {
//             // 进行伤害
//             let enemies = FindUnitsInRing(
//                 DotaTeam.GOODGUYS,
//                 this.caster.GetAbsOrigin(),
//                 this.ability_range + this.bonus_radius, 24,
//                 UnitTargetTeam.ENEMY,
//                 UnitTargetType.BASIC + UnitTargetType.HERO,
//                 UnitTargetFlags.NONE
//             )
//             if (enemies.length == 0) { return }
//             let gameTime = GameRules.GetDOTATime(false, false)
//             for (let hUnit of enemies) {
//                 ApplyCustomDamage({
//                     victim: hUnit,
//                     attacker: this.caster,
//                     damage: this.ability_damage,
//                     damage_type: DamageTypes.MAGICAL,
//                     ability: this.GetAbility(),
//                     element_type: 0,
//                 })
//                 if ((hUnit.CDResp["arms_t1_2_ring_paralysis"] ?? 0) < gameTime) {
//                     hUnit.CDResp["arms_t1_2_ring_paralysis"] = gameTime + 2
//                     GameRules.BuffManager.AddGeneralDebuff(this.caster, hUnit, DebuffTypes.paralysis, 1)
//                 }
//             }
//         }
//         if (this.timer % 100 < 50) {
//             this.bonus_radius += 5
//         } else {
//             this.bonus_radius -= 5
//         }
//         ParticleManager.SetParticleControl(this.effect_fx, 1, Vector(1000, this.ability_range + this.bonus_radius, 1))
//     }

//     OnDestroy(): void {
//         if (!IsServer()) { return }
//         this.GetAbility().SetFrozenCooldown(false)
//     }
// }

// @registerModifier()
// export class modifier_arms_t1_2_ring_circle extends BaseModifier {

//     base_raidus: number;
//     aura_radius: number;
//     ring_buff: modifier_arms_t1_2_ring;

//     IsHidden(): boolean { return true; }
//     IsAura(): boolean { return true; }
//     GetAuraRadius(): number { return this.aura_radius; }
//     IsAuraActiveOnDeath() { return true; }
//     GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
//     GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
//     GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
//     GetModifierAura() { return "modifier_arms_t1_2_ring_circle_effect"; }
//     GetAuraDuration(): number { return 0.01 }

//     OnCreated(params: object): void {
//         this.base_raidus = this.GetAbility().GetSpecialValueFor("radius");
//         this.aura_radius = this.base_raidus
//         if (!IsServer()) { return }
//         this.ring_buff = this.GetCaster().FindModifierByName("modifier_arms_t1_2_ring") as modifier_arms_t1_2_ring;
//         this.OnIntervalThink()
//         this.StartIntervalThink(0.01)
//     }

//     OnIntervalThink(): void {
//         this.aura_radius = this.base_raidus + this.ring_buff.bonus_radius;
//     }
// }

// @registerModifier()
// export class modifier_arms_t1_2_ring_circle_effect extends BaseModifier {

//     ability_damage: number;

//     GetAttributes(): ModifierAttribute {
//         return ModifierAttribute.MULTIPLE
//     }

//     OnCreated(params: object): void {
//         if (!IsServer()) { return }
//         let buff = this.GetCaster().FindModifierByName("modifier_arms_t1_2_ring");
//         if (buff) {
//             let buff_create = buff.GetCreationTime();
//             let this_create = this.GetCreationTime()
//             // 如果创建时已经在圈里了就不会受到伤害
//             if (buff_create == this_create) { return }
//             this.ability_damage = this.GetCaster().GetAverageTrueAttackDamage(null) * 2;
//             ApplyCustomDamage({
//                 victim: this.GetParent(),
//                 attacker: this.GetCaster(),
//                 damage: this.ability_damage,
//                 damage_type: DamageTypes.MAGICAL,
//                 ability: this.GetAbility(),
//                 element_type: "thunder",
//             })
//         }
//     }

//     OnDestroy(): void {
//         if (!IsServer()) { return }
//         // 出圈 且施法者得有
//         if (this.GetCaster().HasModifier("modifier_arms_t1_2_ring")) {
//             ApplyCustomDamage({
//                 victim: this.GetParent(),
//                 attacker: this.GetCaster(),
//                 damage: this.ability_damage,
//                 damage_type: DamageTypes.MAGICAL,
//                 ability: this.GetAbility(),
//                 element_type: 0,
//             })
//         }
//     }
// }