import { MissleNameList } from "../../modules/ingame/mission/mission_system";
import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

@registerModifier()
export class modifier_mission_thinker extends BaseModifier {

    mission_name: MissleNameList;
    mission_type: number;
    is_timeout: boolean;
    origin: Vector;
    residence_time: number;

    radius: number;
    cast_fx: ParticleID;
    origin_fx: ParticleID;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.radius = 400;
        this.residence_time = 0;
        this.origin = this.GetParent().GetAbsOrigin()
        this.is_timeout = true;
        this.mission_name = params.mission_name;
        this.mission_type = params.mission_type;
        this.origin_fx = ParticleManager.CreateParticle(
            "particles/diy_particles/event_ring_anim/event_ring_anim_origin.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(this.origin_fx, 0, Vector(this.origin.x, this.origin.y, this.origin.z + 5))
        ParticleManager.SetParticleControl(this.origin_fx, 2, Vector(this.radius - 32, 0, 0))

        let glow_fx = ParticleManager.CreateParticle(
            "particles/diy_particles/move_glow.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(glow_fx, 1, this.GetParent().GetAbsOrigin())
        if (this.mission_type == 1) {
            // 天辉金色
            ParticleManager.SetParticleControl(this.origin_fx, 3, Vector(255, 165, 0))
            // 光晕绿色
            ParticleManager.SetParticleControl(glow_fx, 6, Vector(255, 165, 0))
        } else if (this.mission_type == 2) {
            //  夜宴红色
            ParticleManager.SetParticleControl(this.origin_fx, 3, Vector(255, 10, 10))
            // 光晕红色
            ParticleManager.SetParticleControl(glow_fx, 6, Vector(255, 10, 10))
        }

        this.AddParticle(glow_fx, false, false, -1, false, false)
        this.StartIntervalThink(0.1)
    }

    OnIntervalThink(): void {
        let players = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            this.origin,
            null,
            this.radius,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        // print("players.length", players.length)
        if (players.length > 0) {
            this.residence_time += 0.1
            if (this.residence_time == 0.1) {
                this.cast_fx = ParticleManager.CreateParticle(
                    "particles/diy_particles/event_ring_anim/event_ring_anim.vpcf",
                    ParticleAttachment.POINT,
                    this.GetParent()
                )
                ParticleManager.SetParticleControl(this.cast_fx, 0, Vector(this.origin.x, this.origin.y, this.origin.z + 5))
                ParticleManager.SetParticleControl(this.cast_fx, 1, Vector(5, 0, 0))
                ParticleManager.SetParticleControl(this.cast_fx, 2, Vector(this.radius - 32, 0, 0))
                // ParticleManager.SetParticleControl(this.cast_fx, 3, Vector(0, 0, 0))
                if (this.mission_type == 1) {
                    // 天辉蓝色
                    ParticleManager.SetParticleControl(this.cast_fx, 3, Vector(255, 165, 0))
                } else if (this.mission_type == 2) {
                    //  夜宴红色
                    ParticleManager.SetParticleControl(this.cast_fx, 3, Vector(255, 10, 10))
                }
                ParticleManager.SetParticleControl(this.cast_fx, 4, Vector(255, 200, 100))
                // ParticleManager.ReleaseParticleIndex
                // ParticleManager.SetParticleControl(this.cast_fx, 1, Vector(5, 0, 0))
            }
            if (this.residence_time >= 5) {
                this.residence_time = 0;
                // 执行任务
                GameRules.MissionSystem.MissionHandle[this.mission_name].StartTheMission(this.origin)
                if (this.cast_fx) {
                    ParticleManager.DestroyParticle(this.cast_fx, true)
                }
                this.is_timeout = false
                this.StartIntervalThink(-1);
                this.Destroy()
            }
        } else {
            this.residence_time = 0;
            if (this.cast_fx) {
                ParticleManager.DestroyParticle(this.cast_fx, true)
            }
            // ParticleManager.SetParticleControl(this.cast_fx, 1, Vector(999, 0, 0))
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        ParticleManager.DestroyParticle(this.origin_fx, true);
        UTIL_Remove(this.GetParent())
    }

}

@registerModifier()
export class modifier_mission_thinker_countdown extends BaseModifier {

    mission_type: number;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.mission_type = params.mission_type
    }
    OnDestroy(): void {
        if (!IsServer()) { return }
        if (this.mission_type == 1) {
            GameRules.MissionSystem.RadiantMissionHandle.MissionOverTime()
        } else {
            GameRules.MissionSystem.DireMissionHandle.MissionOverTime()
        }
        // 
        UTIL_Remove(this.GetParent())
    }
}


@registerModifier()
export class modifier_mission_npc extends BaseModifier {

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        let hParent = this.GetParent();
        hParent.SetAngles(0, -90, 0);
        hParent.ClearActivityModifiers()
        hParent.AddActivityModifier("idle_multi");
        hParent.SetSequence("idle_multi")

        this.StartIntervalThink(0.1)
    }

    OnIntervalThink(): void {
        // print("modifier_mission_npc OnIntervalThink")
        let hParent = this.GetParent();
        
        hParent.StartGesture(GameActivity.DOTA_CUSTOM_TOWER_IDLE)
        this.StartIntervalThink(-1)
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.INVULNERABLE]: true,
            // [ModifierState.NO_UNIT_COLLISION]: true,
            // [ModifierState.NO_HEALTH_BAR]: true,
            // [ModifierState.UNSELECTABLE]: true,
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.OVERRIDE_ANIMATION
        ]
    }

    GetOverrideAnimation(): GameActivity_t {
        return GameActivity.DOTA_CUSTOM_TOWER_IDLE
    }
}