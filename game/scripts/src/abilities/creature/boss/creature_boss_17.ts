
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";
import { modifier_generic_arc_lua } from '../../../modifier/modifier_generic_arc_lua';


/**
 * creature_boss_17	起飞~啰	蓄力3秒，然后跳向距离最远的玩家，落地造成高额范围伤害。
 * 伤害范围500码。（伤害为玩家最大生命值75%）
 */
@registerAbility()
export class creature_boss_17 extends BaseCreatureAbility {

    OnAbilityPhaseStart(): boolean {
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Circular(this._cast_range, this._cast_point, this.vOrigin)
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        let enemies = FindUnitsInRadius(
            this._team,
            this.vOrigin,
            null,
            9999,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.FARTHEST,
            false
        )

        if (enemies.length > 0) {
            let hTarget = enemies[0];
            let vTarget = hTarget.GetAbsOrigin();
            let distance = (this.vOrigin - vTarget as Vector).Length2D();
            let speed = 1000;
            let duration = distance / speed;
            // let height = 
            this.hCaster.AddNewModifier(this.hCaster, this, "modifier_creature_boss_17_jump", {
                target_x: vTarget.x,
                target_y: vTarget.y,
                target_z: vTarget.z,
                height: 200,
                speed: 1000,
                duration: duration,
            })
        }
    }

}

@registerModifier()
export class modifier_creature_boss_17_jump extends modifier_generic_arc_lua {

    radius: number;
    vPoint: Vector
    dmg_max_hp:number;
    _OnCreated(kv: any): void {
        // this.r 
        this.dmg_max_hp = this.GetAbility().GetSpecialValueFor("dmg_max_hp") * 0.01;
        this.radius = 500;//this.GetAbility().GetSpecialValueFor("radius")
        this.vPoint = Vector(kv.target_x, kv.target_y, kv.target_z);
        let aoe_fx = GameRules.WarningMarker.Circular(this.radius, this.GetDuration(), this.vPoint);
        this.AddParticle(aoe_fx,false,false,-1,false,false)
    }

    _OnDestroy(): void {
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_elder_titan/elder_titan_echo_stomp_physical.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            null
        )
        ParticleManager.SetParticleControl(effect_fx,0,this.vPoint)
        ParticleManager.ReleaseParticleIndex(effect_fx)

        
        let enemies = FindUnitsInRadius(
            this.GetCaster().GetTeam(),
            this.vPoint,
            null,
            this.radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        for (let enemy of enemies) {
            let damage = enemy.GetMaxHealth() * this.dmg_max_hp;
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.GetCaster(),
                ability: this.GetAbility(),
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            })
        }
        // particles/units/heroes/hero_elder_titan/elder_titan_echo_stomp_physical.vpcf
    }

}