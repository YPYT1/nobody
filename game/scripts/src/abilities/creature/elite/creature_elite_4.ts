
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_4	集体传送	
 * 开启传送阵吟唱3秒，将自身周围500码内所有小怪传送到最近的玩家附近包围（距离300码）
 */
@registerAbility()
export class creature_elite_4 extends BaseCreatureAbility {

    OnAbilityPhaseStart(): boolean {
        this.hTarget = this.GetCursorTarget();
        this.nPreviewFX = GameRules.WarningMarker.Circular(
            this._radius,
            this._cast_point,
            this.hCaster.GetAbsOrigin()
        )
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx()
        let vTarget = this.hTarget.GetAbsOrigin();
        let friendly = FindUnitsInRadius(
            this.hCaster.GetTeam(),
            this.hCaster.GetAbsOrigin(),
            null,
            this._radius,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        for (let unit of friendly) {
            let vect = vTarget + Vector(RandomInt(-300, 300), RandomInt(-300, 300), 0) as Vector
            unit.SetAbsOrigin(vect)
        }
    }
}