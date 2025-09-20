import { BaseModifier, registerModifier } from '../../utils/dota_ts_adapter';

@registerModifier()
export class modifier_mission_dire_5_thinker extends BaseModifier {
    origin: Vector;
    current_hp: number;
    timer: number;
    interval: number;
    interval_value: number;
    radius: number;

    state: boolean;
    viewer: ViewerID;

    units: CDOTA_BaseNPC[];

    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        this.units = [];
        this.state = true;
        this.timer = 0;
        this.interval = 0.1;
        this.radius = params.radius;
        this.current_hp = 100; //GameRules.Spawn.GetCurrentRoundHP(-1, "normal")
        this.origin = this.GetParent().GetAbsOrigin();
        const effect_fx = ParticleManager.CreateParticle(
            'particles/econ/events/fall_2022/teleport/teleport_fall2022_end_lvl1.vpcf',
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.GetParent()
        );
        ParticleManager.SetParticleControl(effect_fx, 2, Vector(150, 0, 0));
        this.AddParticle(effect_fx, false, false, -1, false, false);

        const origin_fx = ParticleManager.CreateParticle(
            'particles/diy_particles/event_ring_anim/event_ring_anim_origin.vpcf',
            ParticleAttachment.POINT,
            this.GetParent()
        );
        ParticleManager.SetParticleControl(origin_fx, 0, Vector(this.origin.x, this.origin.y, this.origin.z + 5));
        ParticleManager.SetParticleControl(origin_fx, 2, Vector(this.radius - 32, 0, 0));
        ParticleManager.SetParticleControl(origin_fx, 3, Vector(255, 100, 100));
        this.AddParticle(origin_fx, false, false, -1, false, false);
        this.viewer = AddFOWViewer(DotaTeam.GOODGUYS, this.origin, 300, this.GetDuration(), false);
        this.StartIntervalThink(this.interval);
    }

    OnIntervalThink(): void {
        this.timer += 1;
        if (this.timer % 10 == 0) {
            const hUnit = GameRules.Spawn.CreepNormalCreate('npc_mission_dire_5', (this.origin + RandomVector(50)) as Vector);
            hUnit.AddNewModifier(hUnit, null, 'modifier_mission_dire_5_unit', {});
            FindClearSpaceForUnit(hUnit, this.origin, false);
            this.units.push(hUnit);
            // hUnit.SetControllableByPlayer(0, false)
            // GameRules.Spawn.SetUnitHealthLimit(hUnit, this.current_hp);
        }

        const heroes = FindUnitsInRadius(
            DotaTeam.BADGUYS,
            this.origin,
            null,
            this.radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        if (heroes.length == 0) {
            this.state = false;
            this.StartIntervalThink(-1);
            this.Destroy();
        }
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        print('this.timer', this.timer);
        RemoveFOWViewer(DotaTeam.GOODGUYS, this.viewer);
        GameRules.MissionSystem.DireMissionHandle.EndOfMission(this.state);

        for (const hUnit of this.units) {
            if (hUnit && !hUnit.IsNull()) {
                UTIL_Remove(hUnit);
            }
        }
        UTIL_Remove(this.GetParent());
    }
}

@registerModifier()
export class modifier_mission_dire_5_unit extends BaseModifier {
    caster: CDOTA_BaseNPC;

    IsHidden(): boolean {
        return true;
    }

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.caster = this.GetCaster();
        this.StartIntervalThink(1);
    }

    OnIntervalThink(): void {
        const enemies = FindUnitsInRadius(
            DotaTeam.BADGUYS,
            this.GetParent().GetAbsOrigin(),
            null,
            200,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.PLAYER_CONTROLLED,
            FindOrder.ANY,
            false
        );

        if (enemies.length > 0) {
            for (const enemy of enemies) {
                const attack_damage = enemy.GetMaxHealth() * 0.1;
                ApplyCustomDamage({
                    victim: enemy,
                    attacker: this.caster,
                    damage: attack_damage,
                    damage_type: DamageTypes.MAGICAL,
                    ability: this.GetAbility(),
                    element_type: ElementTypes.NONE,
                    // is_primary: true,
                });
            }
            // 播放声音

            // 动作
            this.caster.StartGesture(GameActivity.DOTA_ATTACK);
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [ModifierFunction.ATTACKSPEED_BASE_OVERRIDE];
    }

    GetModifierAttackSpeedBaseOverride(): number {
        return 0.001;
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
        };
    }
}
