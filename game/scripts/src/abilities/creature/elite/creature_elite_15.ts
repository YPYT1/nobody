
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_15		
 * 缠绕玩家2秒使其无法移动。施法距离500码
 */
@registerAbility()
export class creature_elite_15 extends BaseCreatureAbility {

    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource('particle', "particles/units/heroes/hero_treant/treant_overgrowth_cast.vpcf", context)
        PrecacheResource('particle', 'particles/econ/items/treant_protector/treant_ti10_immortal_head/treant_ti10_immortal_overgrowth_root_small.vpcf', context)
    }

    OnAbilityPhaseStart(): boolean {
        // this.vPoint = this.GetCursorPosition();
        // print("this._radius", this._radius, this._cast_point)
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Circular(
            this._cast_range,
            this._cast_point,
            this.vOrigin
        )
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_treant/treant_overgrowth_cast.vpcf",
            ParticleAttachment.POINT,
            this.GetCaster()
        );
        ParticleManager.ReleaseParticleIndex(effect_fx);


        let root_duration = this.GetSpecialValueFor("root_duration")
        let enemies = FindUnitsInRadius(
            this.hCaster.GetTeam(),
            this.vOrigin,
            null,
            this._cast_range,
            UnitTargetTeam.ENEMY,
            19, // 18 + 1
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )

        for (let enemy of enemies) {
            enemy.AddNewModifier(this.hCaster, this, "modifier_creature_elite_15_root", {
                duration: root_duration
            })
        }
    }

}

@registerModifier()
export class modifier_creature_elite_15_root extends BaseModifier {

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        let effect_fx = ParticleManager.CreateParticle(
            "particles/econ/items/treant_protector/treant_ti10_immortal_head/treant_ti10_immortal_overgrowth_root_small.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        this.AddParticle(effect_fx, false, false, -1, false, false);
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.ROOTED]: true
        }
    }


}