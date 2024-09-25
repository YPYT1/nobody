import { modifier_generic_arc_lua } from "../../../modifier/modifier_generic_arc_lua";
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_14	野蛮冲撞	
 * 只会冲撞一条直线，触碰到玩家时造成伤害（玩家最大生命值40%）但不会停下，冲撞到最大距离才会停下。
 * 冲撞距离1000码，宽度150码。施法距离700码。
 */
@registerAbility()
export class creature_elite_14 extends BaseCreatureAbility {

    line_width: number
    line_distance: number;

    final_vect: Vector;
    direction: Vector;
    OnAbilityPhaseStart(): boolean {
        this.line_width = this.GetSpecialValueFor("line_width");
        this.line_distance = this.GetSpecialValueFor("line_distance")
        this.vPoint = this.GetCursorPosition();
        this.nPreviewFX = GameRules.WarningMarker.Line(
            this.hCaster,
            this.line_width,
            this.hCaster.GetAbsOrigin(),
            this.vPoint,
            this.line_distance,
            this._cast_point
        )
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx()

        let direction = this.vPoint - this.hCaster.GetAbsOrigin() as Vector;
        direction.z = 0;
        direction = direction.Normalized();
        this.direction = direction
        let vPoint = this.hCaster.GetAbsOrigin() + direction * this.line_distance as Vector;

        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_creature_elite_14", {
            target_x: vPoint.x,
            target_y: vPoint.y,
            height: 0,
            speed: this.line_distance,
        })
        this.final_vect = vPoint
    }
}

@registerModifier()
export class modifier_creature_elite_14 extends modifier_generic_arc_lua {

    IsHidden(): boolean {
        return true
    }

    IsAura(): boolean { return true; }
    // GetAuraDuration(): number { return 0.1 }
    GetAuraRadius(): number { return 150; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_creature_elite_14_aura"; }

    _OnCreated(kv: any): void {
        let hParent = this.GetParent()
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_magnataur/magnataur_skewer.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        )
        ParticleManager.SetParticleControlEnt(effect_fx, 1, this.GetParent(),
            ParticleAttachment.POINT_FOLLOW,
            "attach_head",
            Vector(0, 0, 0),
            true)
        this.AddParticle(effect_fx, false, false, -1, false, false)
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.DISABLE_TURNING
        ]
    }

    GetModifierDisableTurning(): 0 | 1 {
        return 1
    }
}

@registerModifier()
export class modifier_creature_elite_14_aura extends BaseModifier {

    IsHidden(): boolean {
        return true
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        // 击飞500码
        let hParent = this.GetParent();
        let hCaster = this.GetCaster();
        let vCaster = hCaster.GetAbsOrigin()
        let damage = hParent.GetMaxHealth() * 0.4;
        let hAbility = this.GetAbility() as creature_elite_14;
        let final_vect = hAbility.final_vect;
        let speed = hAbility.line_distance;
        let direction = hAbility.direction;
        let distance = (vCaster - final_vect as Vector).Length2D()
        let vTarget = hParent.GetAbsOrigin() + hCaster.GetForwardVector() * distance as Vector

        ApplyCustomDamage({
            victim: hParent,
            attacker: hCaster,
            ability: null,
            damage: damage,
            damage_type: DamageTypes.PHYSICAL,
            miss_flag: 1,
        })

        hParent.AddNewModifier(hCaster, this.GetAbility(), "modifier_generic_arc_lua", {
            target_x: vTarget.x,
            target_y: vTarget.y,
            height: 0,
            speed: speed,
            isStun: 1,
            isRestricted: 1,
        })
    }

}