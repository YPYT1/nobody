import { BaseModifier, registerModifier } from '../../utils/dota_ts_adapter';

@registerModifier()
export class modifier_altar_npc extends BaseModifier {
    altar_radius: number;
    timer: number;
    receiving: boolean;
    residence_time: number;
    altar_index: number;
    origin: Vector;
    cast_fx: ParticleID;
    activate_time: number;

    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        this.receiving = false;
        this.residence_time = 0;
        this.activate_time = 2;
        this.altar_radius = params.altar_radius;
        this.altar_index = params.altar_index ?? 1;
        this.origin = this.GetParent().GetOrigin();
        this.SetStackCount(this.altar_index);
        this.StartIntervalThink(0.1);

        const origin_fx = ParticleManager.CreateParticle(
            'particles/diy_particles/event_ring_anim/event_ring_anim_origin.vpcf',
            ParticleAttachment.POINT,
            this.GetParent()
        );
        ParticleManager.SetParticleControl(origin_fx, 0, Vector(this.origin.x, this.origin.y, this.origin.z + 5));
        // ParticleManager.SetParticleControl(origin_fx, 1, Vector(255, 0, 0))
        ParticleManager.SetParticleControl(origin_fx, 2, Vector(this.altar_radius - 32, 0, 0));
        ParticleManager.SetParticleControl(origin_fx, 3, Vector(255, 255, 255));
        this.AddParticle(origin_fx, false, false, -1, false, false);

        // texiao1
        const fx1 = ParticleManager.CreateParticle(
            'particles/world_shrine/radiant_shrine_ambient.vpcf',
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
        this.AddParticle(fx1, false, false, -1, false, false);

        // let fx2 = ParticleManager.CreateParticle(
        //     "particles/world_shrine/radiant_shrine_active.vpcf",
        //     ParticleAttachment.POINT_FOLLOW,
        //     this.GetParent()
        // )
        // this.AddParticle(fx2, false, false, -1, false, false)
    }

    OnIntervalThink(): void {
        const players = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            this.origin,
            null,
            this.altar_radius,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        // print("players.length", players.length)
        if (players.length > 0) {
            this.residence_time += 0.1;
            if (this.residence_time == 0.1) {
                this.cast_fx = ParticleManager.CreateParticle(
                    'particles/diy_particles/event_ring_anim/event_ring_anim.vpcf',
                    ParticleAttachment.POINT,
                    this.GetParent()
                );
                ParticleManager.SetParticleControl(this.cast_fx, 0, Vector(this.origin.x, this.origin.y, this.origin.z + 5));
                ParticleManager.SetParticleControl(this.cast_fx, 1, Vector(this.activate_time, 0, 0));
                ParticleManager.SetParticleControl(this.cast_fx, 2, Vector(this.altar_radius - 32, 0, 0));
                ParticleManager.SetParticleControl(this.cast_fx, 3, Vector(255, 255, 255));
                ParticleManager.SetParticleControl(this.cast_fx, 4, Vector(0, 255, 0));
                // ParticleManager.ReleaseParticleIndex
                // ParticleManager.SetParticleControl(this.cast_fx, 1, Vector(5, 0, 0))
            }
            if (this.residence_time >= this.activate_time) {
                // this.residence_time = 0;
                this.receiving = true;
                // 添加祭坛效果
                print('GameRules.Altar.ApplayEffect', this.altar_index);
                GameRules.Altar.ApplayAltarEffect(this.altar_index, players);
                if (this.cast_fx) {
                    ParticleManager.DestroyParticle(this.cast_fx, true);
                }
                this.StartIntervalThink(-1);
                this.Destroy();
            }
        } else {
            this.residence_time = 0;
            if (this.cast_fx) {
                ParticleManager.DestroyParticle(this.cast_fx, true);
            }
        }
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.INVULNERABLE]: true,
        };
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        if (this.receiving == false) {
            GameRules.Altar.Timeout();
        }
        if (this.cast_fx) {
            ParticleManager.DestroyParticle(this.cast_fx, true);
        }

        UTIL_Remove(this.GetParent());
    }
}

@registerModifier()
export class modifier_altar_npc_prop55 extends BaseModifier {
    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        const hCaster = this.GetCaster(); // 道具拥有者
        const hParent = this.GetParent(); // 目标

        const line_pfx = ParticleManager.CreateParticle('particles/diy_particles/move.vpcf', ParticleAttachment.POINT_FOLLOW, hCaster);
        ParticleManager.SetParticleControl(line_pfx, 1, hParent.GetAbsOrigin());
        ParticleManager.SetParticleControl(line_pfx, 6, Vector(255, 255, 0));
        this.AddParticle(line_pfx, false, false, -1, false, false);
    }
}
