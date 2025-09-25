/**
 * name 亡命飞行
 * Description: 主动使用: 获得飞行能力, 无视体积碰撞与地形，移动速度+20。每秒有5%的概率死亡并坠机。
 * 每当死亡时对300范围内敌人造成攻击力*50的伤害。
 * 持续时间20秒。死亡或时间结束时移除此效果, 冷却时间50秒。
 * hero: 矮人直升机
 */
import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

@registerAbility()
export class change_01 extends BaseCreatureAbility {
    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource('particle', 'particles/units/heroes/hero_hoodwink/hoodwink_hunters_boomrang_d.vpcf', context);
        PrecacheResource('particle', 'particles/units/heroes/hero_gyrocopter/gyro_calldown_explosion.vpcf', context);
    }
    OnSpellStart(): void {
        const caster = this.GetCaster();
        const duration = this.GetSpecialValueFor('duration');
        caster.AddNewModifier(caster, this, 'modifier_change_01', { duration });
    }
}

@registerModifier()
export class modifier_change_01 extends BaseModifier {
    private radius = 0;
    private damageFactor = 0;
    private moveSpeed = 0;
    private crashChance = 0;
    private exploded = false;

    IsHidden(): boolean {
        return false;
    }

    IsPurgable(): boolean {
        return false;
    }
    RemoveOnDeath(): boolean {
        return false;
    }

    OnCreated(params: object): void {
        this.ReadValues();
        this.exploded = false;

        if (!IsServer()) {
            return;
        }

        this.StartIntervalThink(1);
        this.CreateFlightFx();
    }

    // DeclareFunctions(): modifierfunction[] {
    //     return [ModifierFunction.MOVESPEED_BONUS_CONSTANT, ModifierFunction.ON_DEATH];
    // }
    DeclareFunctions(): modifierfunction[] {
        return [ModifierFunction.MOVESPEED_BONUS_CONSTANT, ModifierFunction.ON_DEATH];
    }

    GetModifierMoveSpeedBonus_Constant(): number {
        return this.moveSpeed;
    }

    // OnDeath(event: ModifierInstanceEvent): void {
    //     if (event.unit !== this.GetParent() || this.exploded) {
    //         return;
    //     }
    //     if (!IsServer()) {
    //         return;
    //     }

    //     const parent = this.GetParent();

    //     const deathFx = ParticleManager.CreateParticle(
    //         'particles/units/heroes/hero_hoodwink/hoodwink_hunters_boomrang_d0.vpcf',
    //         ParticleAttachment.ABSORIGIN_FOLLOW,
    //         parent
    //     );
    //     ParticleManager.SetParticleControl(deathFx, 0, parent.GetAbsOrigin());
    //     ParticleManager.ReleaseParticleIndex(deathFx);

    //     parent.EmitSound('Hero_Tinker.Heat-Seeking_Missile');

    //     this.exploded = true;
    // }
    OnDeath(event: ModifierInstanceEvent): void {
        if (event.unit !== this.GetParent() || this.exploded) {
            return;
        }
        if (!IsServer()) {
            return;
        }
        const parent = this.GetParent();
        const death_fx = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_hoodwink/hoodwink_hunters_boomrang_d.vpcf',
            ParticleAttachment.ABSORIGIN_FOLLOW,
            parent
        );
        ParticleManager.SetParticleControl(death_fx, 0, parent.GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(death_fx);

        parent.EmitSound('Hero_Tinker.Heat-Seeking_Missile');

        this.exploded = true;
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.FLYING]: true,
            [ModifierState.FLYING_FOR_PATHING_PURPOSES_ONLY]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
        };
    }

    OnIntervalThink(): void {
        if (!IsServer()) {
            return;
        }
        print('计时器开始进行判定');
        const parent = this.GetParent();
        if (!parent.IsAlive()) {
            return;
        }
        if (RollPercentage(this.crashChance)) {
            const parent = this.GetParent();
            print('自杀');
            parent.Kill(this.GetAbility(), parent);
            print('开始造成伤害');
            const ability = this.GetAbility();
            let Caster = this.GetCaster();
            const pos = parent.GetAbsOrigin();
            const damage = Caster.GetDamageMax() * this.damageFactor;
            print('damage', damage);
            print('damageFactor', this.damageFactor);

            const fx = ParticleManager.CreateParticle(
                'particles/units/heroes/hero_gyrocopter/gyro_calldown_explosion.vpcf',
                ParticleAttachment.WORLDORIGIN,
                undefined
            );
            ParticleManager.SetParticleControl(fx, 0, pos);
            ParticleManager.SetParticleControl(fx, 1, Vector(this.radius, 0, 0));
            ParticleManager.ReleaseParticleIndex(fx);
            let new_pos = Vector(pos.x, pos.y, 0);
            const enemies = FindUnitsInRadius(
                parent.GetTeamNumber(),
                new_pos,
                undefined,
                this.radius,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO + UnitTargetType.BASIC,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );
            for (const enemy of enemies) {
                ApplyCustomDamage({
                    victim: enemy,
                    attacker: parent,
                    ability,
                    damage,
                    damage_type: DamageTypes.PHYSICAL,
                    miss_flag: 1,
                });
            }
            // StopSoundOn("Hero_Tinker.Heat-Seeking_Missile" , this.GetCaster());
        }
        print('计时器结束');
    }

    private ReadValues(): void {
        const ability = this.GetAbility();
        if (!ability) {
            return;
        }
        this.radius = ability.GetSpecialValueFor('radius');
        this.damageFactor = ability.GetSpecialValueFor('damage_atk_factor');
        this.moveSpeed = ability.GetSpecialValueFor('move_speed_bonus');
        const rawChance = ability.GetSpecialValueFor('crash_chance');
        this.crashChance = math.min(100, rawChance > 1 ? rawChance : rawChance * 100);
    }

    private CreateFlightFx(): void {
        const parent = this.GetParent();
        const fx = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_winter_wyvern/wyvern_arctic_burn_flying.vpcf',
            ParticleAttachment.ABSORIGIN_FOLLOW,
            parent
        );
        ParticleManager.SetParticleControl(fx, 1, Vector(1, 0, 0));
        this.AddParticle(fx, false, false, -1, false, false);
    }
}
