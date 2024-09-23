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

    line_width:number
    line_distance:number;
    OnAbilityPhaseStart(): boolean {
        this.line_width = this.GetSpecialValueFor("line_width");
        this.line_distance = this.GetSpecialValueFor("line_distance")
        this.vPoint = this.GetCursorPosition();
        this.nPreviewFX = GameRules.WarningMarker.Line(
            this.hCaster,
            this.line_width,
            this.hCaster.GetAbsOrigin(),
            this.vPoint,
            this.line_distance ,
            this._cast_point
        )
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx()

        let direction = this.vPoint - this.hCaster.GetAbsOrigin() as Vector;
        direction.z = 0;
        direction = direction.Normalized();
        let vPoint = this.hCaster.GetAbsOrigin() + direction * this.line_distance  as Vector;

        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_creature_elite_14", {
            target_x: vPoint.x,
            target_y: vPoint.y,
            height: 0,
            speed: this.line_distance ,
        })

    }
}

@registerModifier()
export class modifier_creature_elite_14 extends modifier_generic_arc_lua {

    IsHidden(): boolean {
        return true
    }

    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return 150; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_creature_elite_14_aura"; }

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


        ApplyCustomDamage({
            victim: hParent,
            attacker: hCaster,
            ability: null,
            damage: damage,
            damage_type: DamageTypes.PHYSICAL,
            miss_flag: 1,
        })

        hParent.AddNewModifier(hCaster, null, "modifier_knockback_lua", {
            center_x: vCaster.x,
            center_y: vCaster.y,
            center_z: 0,
            knockback_height: 0,
            knockback_distance: 150,
            knockback_duration: 0.1,
            duration: 0.1,
        })


        this.OnDestroy();
    }
}