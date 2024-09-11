import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

@registerModifier()
export class modifier_mission_radiant_1_football extends BaseModifier {

    hFootball: CDOTA_BaseNPC;
    goal_vect: Vector;
    goal_radius: number;

    state: boolean;
    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.state = false;
        // 足球逻辑 当有单位接近时,通过角度进行位移一段距离
        this.goal_vect = Vector(params.goal_x, params.goal_y, params.goal_z)
        this.goal_radius = params.goal_radius;
        this.hFootball = this.GetParent();
        // 添加终点辅助线
        let line_pfx = ParticleManager.CreateParticle(
            "particles/diy_particles/move.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.hFootball,
        );
        ParticleManager.SetParticleControl(line_pfx, 1, this.goal_vect);
        this.AddParticle(line_pfx, false, false, -1, false, false);

        this.StartIntervalThink(0.1)
    }

    OnIntervalThink(): void {
        let vect = this.GetParent().GetAbsOrigin();
        // 检查是否到达终点
        let distance = (this.goal_vect - vect as Vector).Length2D();
        if (distance < this.goal_radius) {
            // 进球
            GameRules.MissionSystem.MissionHandle.r_1.AddProgressValue(1);
            this.StartIntervalThink(-1)
            this.Destroy();
            return
        }
        if (this.hFootball.HasModifier("modifier_knockback_lua")) { return }

        let hHeroes = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            vect,
            null,
            100,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        if (hHeroes.length > 0) {
            let vStart = hHeroes[0].GetAbsOrigin();
            this.hFootball.AddNewModifier(this.hFootball, null, "modifier_knockback_lua", {
                center_x: vStart.x,
                center_y: vStart.y,
                center_z: 0,
                knockback_distance: 450,
                knockback_duration: 0.35,
                duration: 0.5,
            })
        }
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.UNSLOWABLE]: true,
            [ModifierState.INVULNERABLE]: true,
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.GetParent())
    }
}

@registerModifier()
export class modifier_mission_radiant_1_football_goal extends BaseModifier {

    origin: Vector;
    radius: number;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.origin = this.GetParent().GetOrigin();
        this.radius = params.goal_radius;
        let origin_fx = ParticleManager.CreateParticle(
            "particles/diy_particles/event_ring_anim/event_ring_anim_origin.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(origin_fx, 0, Vector(this.origin.x, this.origin.y, this.origin.z + 5))
        ParticleManager.SetParticleControl(origin_fx, 1, Vector(60, 0, 0))
        ParticleManager.SetParticleControl(origin_fx, 2, Vector(this.radius - 32, 0, 0))
        ParticleManager.SetParticleControl(origin_fx, 3, Vector(0, 255, 0))
        this.AddParticle(origin_fx, false, false, -1, false, false)
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.UNSLOWABLE]: true,
            [ModifierState.INVULNERABLE]: true,
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        // GameRules.MissionSystem.MissionHandle.r_1.EndOfMission(false)
        UTIL_Remove(this.GetParent())
    }
}