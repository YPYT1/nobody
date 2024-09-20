
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_15	地刺	
 * 缠绕玩家2秒使其无法移动。施法距离500码
 */
@registerAbility()
export class creature_elite_15 extends BaseCreatureAbility {

    OnAbilityPhaseStart(): boolean {
        this.vPoint = this.GetCursorPosition();
        this._radius = 300;
        // print("this._radius", this._radius, this._cast_point)
        this.nPreviewFX = GameRules.WarningMarker.Circular(
            this._radius,
            this._cast_point,
            this.vPoint
        )
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx()

        let enemies = FindUnitsInRadius(
            this.hCaster.GetTeam(),
            this.vPoint,
            null,
            this._radius,
            UnitTargetTeam.ENEMY,
            19, // 18 + 1
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )

        for (let enemy of enemies) {
            GameRules.BuffManager.AddGeneralDebuff(this.hCaster, enemy, DebuffTypes.rooted, 2)
        }
    }

}