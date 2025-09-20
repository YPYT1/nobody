import { modifier_generic_arc_lua } from '../../../modifier/modifier_generic_arc_lua';
import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

/**
 * creature_elite_1	追踪导弹复刻	发射一枚导弹，追踪玩家，造成爆炸伤害（400）
 */
@registerAbility()
export class creature_elite_18 extends BaseCreatureAbility {
    // 配置参数
    private CONFIG = {
        ATTACK_INTERVAL: 0.2, // 攻击间隔（秒）
        SEARCH_RADIUS: 500, // 索敌范围
        PROJECTILE_SPEED: 900, // 弹道速度（单位/秒）
        PARTICLE_HIT: 'particles/units/heroes/hero_phoenix/phoenix_base_attack_explosion_ember.vpcf', //命中特效
        PARTICLE_PROJECTILE: 'particles/units/heroes/hero_phoenix/phoenix_base_attack.vpcf', // 弹道特效
    };

    Precache(context: CScriptPrecacheContext): void {
        precacheResString('particles/units/heroes/hero_phoenix/phoenix_base_attack.vpcf', context);
        precacheResString('particles/units/heroes/hero_phoenix/phoenix_base_attack_explosion_ember.vpcf', context);
    }

    OnAbilityPhaseStart(): boolean {
        const hTarget = this.GetCursorTarget();
        // this.line_width = this.GetSpecialValueFor("line_width");
        // this.line_distance = this.GetSpecialValueFor("line_distance");
        // this.vPoint = this.GetCursorPosition();
        // this.nPreviewFX = GameRules.WarningMarker.Line(
        //     this.hCaster,
        //     this.line_width,
        //     this.hCaster.GetAbsOrigin(),
        //     this.vPoint,
        //     this.line_distance,
        //     this._cast_point
        // )
        return true;
    }

    OnSpellStart(): void {
        const hTarget = this.GetCursorTarget();
        const caster = this.GetCaster();

        const p_info: CreateTrackingProjectileOptions = {
            EffectName: this.CONFIG.PARTICLE_PROJECTILE,
            Source: caster,
            Target: hTarget,
            Ability: this,
            iSourceAttachment: ProjectileAttachment.ATTACK_1,
            // vSourceLoc: SourceLoc,
            iMoveSpeed: this.CONFIG.PROJECTILE_SPEED,
            ExtraData: {},
        };
        ProjectileManager.CreateTrackingProjectile(p_info);

        // let Missile = CreateUnitByName(
        //     "npc_public_homing_missile",
        //     this.hCaster.GetAbsOrigin() + RandomVector(200) as Vector,
        //     false,
        //     this.hCaster,
        //     this.hCaster,
        //     this.hCaster.GetTeam()
        // )
        // // print("Missile", Missile)
        // Missile.AddNewModifier(this.hCaster, this, "modifier_basic_countdown", { duration: 3 })
        // Missile.AddNewModifier(this.hCaster, this, "modifier_creature_elite_3_delay", {
        //     duration: 3,
        //     target: hTarget.entindex(),
        //     _duration: this._duration,
        // })
    }

    //命中回调
    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: object): boolean | void {
        print('target : ', target);
        if (!target) return;
        // 计算伤害
        // let ablilty_damage = this.GetCaster().custom_total_attribute.Intellect  + 10;
        // if(!this.damage_pro){
        //     this.damage_pro = this.GetSpecialValueFor("damage_pro") * 0.01;
        // }
        // ablilty_damage = ablilty_damage * this.damage_pro;
        const hero = this.GetCaster();
        let damage = 500;
        if (hero.IsHero()) {
            damage = hero.GetHealth();
        }
        ApplyCustomDamage({
            victim: target,
            attacker: this.GetCaster(),
            ability: this,
            damage: damage,
            damage_type: DamageTypes.PHYSICAL,
            miss_flag: 1,
        });
        // 命中特效
        ParticleManager.ReleaseParticleIndex(ParticleManager.CreateParticle(this.CONFIG.PARTICLE_HIT, ParticleAttachment.ABSORIGIN, target));
    }
}

@registerModifier()
export class modifier_creature_elite_1 extends modifier_generic_arc_lua {
    // IsHidden(): boolean {
    //     return true
    // }
    // IsAura(): boolean { return true; }
    // GetAuraRadius(): number { return 100; }
    // GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    // GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    // GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    // GetModifierAura() { return "modifier_creature_elite_1_aura"; }
    // _OnCreated(kv: any): void {
    //     let effect_fx = ParticleManager.CreateParticle(
    //         "particles/units/heroes/hero_spirit_breaker/spirit_breaker_charge.vpcf",
    //         ParticleAttachment.POINT_FOLLOW,
    //         this.GetParent()
    //     )
    //     this.AddParticle(effect_fx, false, false, -1, false, false)
    // }
}

@registerModifier()
export class modifier_creature_elite_1_aura extends BaseModifier {
    // knockback_duration: number;
    // IsHidden(): boolean {
    //     return true
    // }
    // OnCreated(params: object): void {
    //     if (!IsServer()) { return }
    //     // 击飞500码
    //     this.knockback_duration = this.GetAbility().GetSpecialValueFor("knockback_duration")
    //     let hParent = this.GetParent();
    //     let hCaster = this.GetCaster();
    //     let vCaster = hCaster.GetAbsOrigin()
    //     let damage = hParent.GetMaxHealth() * 0.2;
    //     ApplyCustomDamage({
    //         victim: hParent,
    //         attacker: hCaster,
    //         ability: null,
    //         damage: damage,
    //         damage_type: DamageTypes.PHYSICAL,
    //         miss_flag: 1,
    //     })
    //     hParent.AddNewModifier(hCaster, null, "modifier_knockback_lua", {
    //         center_x: vCaster.x,
    //         center_y: vCaster.y,
    //         center_z: 0,
    //         knockback_height: 600,
    //         knockback_distance: 0,
    //         knockback_duration: this.knockback_duration,
    //         duration: this.knockback_duration,
    //     })
    //     this.OnDestroy();
    // }
}
