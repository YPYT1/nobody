
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_4	集体传送	
 * 开启传送阵吟唱3秒，将自身周围500码内所有小怪传送到最近的玩家附近包围（距离300码）
 * 瑞兹大招
 */
@registerAbility()
export class creature_elite_4 extends BaseCreatureAbility {

    OnAbilityPhaseStart(): boolean {
        this.hTarget = this.GetCursorTarget();
        this.vPoint = this.GetCursorPosition();
        this.nPreviewFX = GameRules.WarningMarker.Circular(this._radius,this._cast_point,this.hCaster.GetAbsOrigin())
        let effect_fx = ParticleManager.CreateParticle(
            "particles/econ/events/ti9/teleport_end_ti9.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.GetCaster()
        );
        ParticleManager.SetParticleControlEnt(effect_fx, 1,
            this.GetCaster(),
            ParticleAttachment.POINT_FOLLOW,
            "attach_hitloc",
            Vector(0, 0, 0),
            true
        );
        this.nPreviewFX_2 = effect_fx

        // let model_fx = ParticleManager.CreateParticle(
        //     "particles/items2_fx/teleport_end_image.vpcf",
        //     ParticleAttachment.CUSTOMORIGIN,
        //     this.hCaster
        // );
        // ParticleManager.SetParticleControl(model_fx, 0, this.vPoint);
        // ParticleManager.SetParticleControlEnt(model_fx, 3,
        //     this.hCaster,
        //     ParticleAttachment.POINT,
        //     "attach_hitloc",
        //     Vector(0, 0, 0),
        //     true
        // );
        // ParticleManager.SetParticleControlEnt(model_fx, 5,
        //     this.hCaster,
        //     ParticleAttachment.POINT,
        //     "attach_hitloc",
        //     Vector(0, 0, 0),
        //     true
        // );
        // ParticleManager.SetParticleControl(model_fx, 4, Vector(1, 0, 0));

        // this.nPreviewFX_List.push(model_fx)
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx()
        let hero_distance = this.GetSpecialValueFor("hero_distance")
        // let vTarget = this.hTarget.GetAbsOrigin();
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
            let vect = this.vPoint + Vector(
                RandomInt(-hero_distance, hero_distance),
                RandomInt(-hero_distance, hero_distance),
                0
            ) as Vector
            unit.SetAbsOrigin(vect)
        }
    }
}