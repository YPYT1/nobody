
import { modifier_motion_hit_target } from "../../../modifier/modifier_motion";
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_3	追踪导弹	
 * 发射一枚导弹，追踪玩家，7秒之后自动爆炸（伤害值为玩家最大生命值20%）。导弹弹道速度较慢（速度：325）。
 * 范围1000码
 */
@registerAbility()
export class creature_elite_3 extends BaseCreatureAbility {

    // particles/units/heroes/hero_gyrocopter/gyro_guided_missile_target.vpcf
    OnSpellStart(): void {
        let hTarget = this.GetCursorTarget();
        let speed = this.GetSpecialValueFor("speed");
        let Missile = CreateUnitByName(
            "npc_public_homing_missile",
            this.hCaster.GetAbsOrigin(),
            false,
            this.hCaster,
            this.hCaster,
            this.hCaster.GetTeam()
        )
        // print("Missile", Missile)

        Missile.AddNewModifier(this.hCaster, this, "modifier_creature_elite_3_tracking", {
            speed: speed,
            target_entity: hTarget.entindex(),
            duration: this._duration,
        })
    }


}

@registerModifier()
export class modifier_creature_elite_3_tracking extends modifier_motion_hit_target {

    _OnCreated(params: any): void {
        this.GetParent().RemoveGesture(GameActivity.DOTA_SPAWN);
        this.GetParent().StartGesture(GameActivity.DOTA_LOADOUT)
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        let vPos = this.GetParent().GetAbsOrigin()
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_gyrocopter/gyro_guided_missile_explosion.vpcf",
            ParticleAttachment.WORLDORIGIN,
            null
        )
        ParticleManager.SetParticleControl(effect_fx, 0, vPos);
        ParticleManager.ReleaseParticleIndex(effect_fx)

        let enemies = FindUnitsInRadius(
            this.GetCaster().GetTeam(),
            vPos,
            null,
            128,
            UnitTargetTeam.ENEMY,
            19, // 18 + 1
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        for (let enemy of enemies) {
            let damage = enemy.GetMaxHealth() * 0.2;
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.GetCaster(),
                ability: null,
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            })
        }
        UTIL_RemoveImmediate(this.GetParent());
    }
}