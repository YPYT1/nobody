import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

@registerAbility()
export class creature_normal_1 extends BaseCreatureAbility {

    proj_width: number;
    proj_speed: number;
    proj_name: string;

    Precache(context: CScriptPrecacheContext): void {

    }

    GetIntrinsicModifierName(): string {
        return "modifier_creature_normal_1"
    }

    OnAbilityPhaseStart(): boolean {
        this.nPreviewFX = GameRules.WarningMarker.CreateExclamation(this.hCaster)
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        this.proj_width = 32;
        this.proj_speed = 500;
        this.proj_name = "particles/dev/attack/attack_flame/attack_flame_2.vpcf";

        let origin = this.hCaster.GetAbsOrigin();
        let attack_game = this.hCaster.GetAverageTrueAttackDamage(null);
        let target_pos = this.GetCursorPosition()
        let direction = (target_pos - origin as Vector).Normalized()
        direction.z = 0;
        ProjectileManager.CreateLinearProjectile({
            EffectName: this.proj_name,
            Ability: this,
            vSpawnOrigin: origin,
            fStartRadius: this.proj_width,
            fEndRadius: this.proj_width,
            vVelocity: (direction * this.proj_speed) as Vector,
            fDistance: 1500,
            Source: this.caster,
            iUnitTargetTeam: UnitTargetTeam.ENEMY,
            iUnitTargetType: UnitTargetType.BASIC + UnitTargetType.HERO,
            iUnitTargetFlags: UnitTargetFlags.NONE,
        });
    }

    OnProjectileHit(target: CDOTA_BaseNPC | undefined, location: Vector): boolean | void {
        if (target) {
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                ability: this,
                damage: target.GetMaxHealth() * 0.1,
                damage_type: DamageTypes.PHYSICAL,
                element_type: 0,
                miss_flag: 1,
            })

            return true
        }
    }
}

@registerModifier()
export class modifier_creature_normal_1 extends BaseModifier {

    ability: CDOTABaseAbility;
    hullradius:number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();
        this.team = this.caster.GetTeam()
        this.hullradius = this.caster.GetHullRadius();
        // print("hullradius",this.hullradius)
        this.OnRefresh(params)
        this.StartIntervalThink(0.1)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        this.element_type = ElementTypes.ICE;
    }

    OnIntervalThink(): void {
        // print("OnIntervalThink")
        if (this.caster.IsAlive() == false) {
            this.StartIntervalThink(-1)
            return
        }
        if (this.ability.IsCooldownReady()) {
            let origin = this.caster.GetAbsOrigin()
            let enemies = FindUnitsInRadius(
                this.team,
                origin,
                null,
                550 + this.hullradius,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO + UnitTargetType.BASIC,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            )
            if (enemies.length > 0) {
                // print("enemies", enemies.length)
                ExecuteOrderFromTable({
                    UnitIndex: this.caster.entindex(),
                    OrderType: UnitOrder.CAST_POSITION,
                    AbilityIndex: this.ability.entindex(),
                    Position: enemies[0].GetAbsOrigin(),
                    Queue: false,
                })
                this.StartIntervalThink(2)
            } else {
                this.StartIntervalThink(0.1)
            }

        } 
    }
}