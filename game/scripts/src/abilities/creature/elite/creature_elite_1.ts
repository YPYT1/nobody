import { modifier_generic_arc_lua } from "../../../modifier/modifier_generic_arc_lua";
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_1	冲刺	
 * 锁定一个玩家，原地蓄力3秒后冲刺，对玩家造成伤害（玩家最大生命值20%）并击飞1.5秒。
 * 冲刺700码，宽度100码。施法距离距离700码。
 */
@registerAbility()
export class creature_elite_1 extends BaseCreatureAbility {


    OnAbilityPhaseStart(): boolean {
        let hTarget = this.GetCursorTarget();
        this.vPoint = hTarget.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Line(
            this.hCaster,
            100,
            this.hCaster.GetAbsOrigin(),
            this.vPoint,
            700,
            this._cast_point
        )
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx()
        let distance = 700;
        let direction = this.vPoint - this.hCaster.GetAbsOrigin() as Vector;
        direction.z = 0;
        direction = direction.Normalized();
        let vPoint = this.hCaster.GetAbsOrigin() + direction * distance as Vector;

        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_creature_elite_1", {
            target_x: vPoint.x,
            target_y: vPoint.y,
            height: 0,
            speed: 1200,
        })

    }
}

@registerModifier()
export class modifier_creature_elite_1 extends modifier_generic_arc_lua {

    IsHidden(): boolean {
        return true
    }

    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return 100; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_creature_elite_1_aura"; }

}

@registerModifier()
export class modifier_creature_elite_1_aura extends BaseModifier {

    IsHidden(): boolean {
        return true
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        // 击飞500码
        let hParent = this.GetParent();
        let hCaster = this.GetCaster();
        let vCaster = hCaster.GetAbsOrigin()
        let damage = hParent.GetMaxHealth() * 0.2;

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
            knockback_height: 600,
            knockback_distance: 0,
            knockback_duration: 1.5,
            duration: 1.5,
        })


        this.OnDestroy();
    }
}