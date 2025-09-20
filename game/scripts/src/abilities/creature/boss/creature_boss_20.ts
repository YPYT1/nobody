import { modifier_motion_hit_target } from '../../../modifier/modifier_motion';
import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

/**
 * creature_boss_20	秩序攻击	
 * "蓄力3秒，为每一名玩家套上一个盾（可以抵挡该技能攻击伤害的90%），根据玩家最大数量进行攻击，
 * 比如4个玩家开局，无论现阶段存活多少玩家，boss该次技能会拥有4次攻击，每次攻击造成高额伤害（伤害为玩家最大生命值90%）。
技能说明：首先，boss会跟随机一名玩家连线（瞬间完成）。
连线完成时，延迟2秒会对连线的玩家造成攻击。
攻击时，会发射一个法球（紫色、黑色，飞行时间最大3秒）。
boss不会主动更换连线目标。如果需要更换连线，则需要boss与玩家中间去接线。
boss在上一次攻击完成时，会间隔3秒，再次进行攻击读条，依旧延迟2秒对连线的玩家造成攻击。
需要其他玩家站在boss与该玩家的连线之间去帮忙抵挡该次伤害。当任意一名玩家站在boss和被连线的玩家之间被boss攻击时，
该名玩家和boss的连线会到该次被攻击玩家身上。
"

 */
@registerAbility()
export class creature_boss_20 extends BaseCreatureAbility {
    Precache(context: CScriptPrecacheContext): void {
        precacheResString('particles/econ/items/sniper/sniper_fall20_immortal/sniper_fall20_immortal_assassinate.vpcf', context);
    }

    OnAbilityPhaseStart(): boolean {
        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_state_boss_invincible', {});
        this.hCaster.RemoveModifierByName('modifier_creature_boss_20_attack');
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Circular(this._cast_range, this._cast_point, this.vOrigin);
        GameRules.CMsg.BossCastWarning(true, 'custom_text_boss_cast_warning', {
            unitname: this.hCaster.GetUnitName(),
            ability: this.GetAbilityName(),
        });
        return true;
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_state_boss_invincible_channel', {});
        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_creature_boss_20_attack', {});
        GameRules.CMsg.BossCastWarning(true, 'custom_text_boss_cast_warning_12', {});
    }

    OnChannelFinish(interrupted: boolean): void {
        this.hCaster.RemoveModifierByName('modifier_creature_boss_20_attack');
        this.hCaster.RemoveModifierByName('modifier_creature_boss_20_line');
        this.hCaster.RemoveModifierByName('modifier_state_boss_invincible_channel');
        GameRules.CMsg.BossCastWarning(false);
    }

    OnProjectileHit(target: CDOTA_BaseNPC | undefined, location: Vector): boolean | void {
        if (target) {
            let base_damage = target.GetMaxHealth() * 0.9;
            if (target.HasModifier('modifier_creature_boss_20_shield')) {
                base_damage *= 0.1;
                target.RemoveModifierByName('modifier_creature_boss_20_shield');
            }
            ApplyCustomDamage({
                attacker: this.GetCaster(),
                victim: target,
                damage: base_damage,
                damage_type: DamageTypes.PHYSICAL,
                ability: this,
                miss_flag: 1,
            });
        }
    }
}

@registerModifier()
export class modifier_creature_boss_20_shield extends BaseModifier {
    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        const effect_fx = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_omniknight/omniknight_repel_buff.vpcf',
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.GetParent()
        );
        this.AddParticle(effect_fx, false, false, -1, false, false);
    }
}

@registerModifier()
export class modifier_creature_boss_20_attack extends BaseModifier {
    target_list: CDOTA_BaseNPC[];
    order: number;
    is_end: boolean;
    hCaster: CDOTA_BaseNPC;
    target: CDOTA_BaseNPC;

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        const heroes = HeroList.GetAllHeroes();
        ArrayScramblingByNumber(heroes);
        this.is_end = false;
        this.hCaster = this.GetCaster();
        this.order = 0;
        this.target_list = [];

        for (const hHero of heroes) {
            hHero.RemoveModifierByName('modifier_creature_boss_20_shield');
            const buff = hHero.AddNewModifier(this.hCaster, this.GetAbility(), 'modifier_creature_boss_20_shield', {});
            if (buff) {
                this.target_list.push(hHero);
            }
        }

        if (this.target_list.length <= 0) {
            this.Destroy();
            return;
        }
        this.target = this.target_list[0];
        this.hCaster.AddNewModifier(this.hCaster, this.GetAbility(), 'modifier_creature_boss_20_line', {
            entity: this.target.entindex(),
        });
        // this.OnIntervalThink()
        this.StartIntervalThink(2);
    }

    OnIntervalThink(): void {
        GameRules.CMsg.BossCastWarning(false);
        if (this.is_end == true) {
            this.Destroy();
            return;
        }
        if (this.target_list.length <= this.order) {
            this.is_end = true;
            this.hCaster.RemoveModifierByName('modifier_creature_boss_20_line');
            this.StartIntervalThink(1);
            return;
        }

        ProjectileManager.CreateTrackingProjectile({
            Source: this.GetCaster(),
            Target: this.target,
            Ability: this.GetAbility(),
            EffectName: 'particles/econ/items/sniper/sniper_fall20_immortal/sniper_fall20_immortal_assassinate.vpcf',
            iSourceAttachment: ProjectileAttachment.HITLOCATION,
            iMoveSpeed: 9999,
        });
        GameRules.CMsg.BossCastWarning(true, 'custom_text_boss_cast_warning_13', {});
        this.StartIntervalThink(3);
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.INVULNERABLE]: true,
        };
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        this.GetCaster().InterruptChannel();
        for (const hHero of HeroList.GetAllHeroes()) {
            hHero.RemoveModifierByName('modifier_creature_boss_20_shield');
        }
    }
}

// @registerModifier()
// export class modifier_creature_boss_20_target extends modifier_motion_hit_target {

//     _OnCreated(params: any): void {
//         this.team = this.GetCaster().GetTeam()
//         let effect_fx = ParticleManager.CreateParticle(
//             "particles/custom/creature/boss/boss_20_mission.vpcf",
//             ParticleAttachment.POINT_FOLLOW,
//             this.GetParent()

//         )
//         this.AddParticle(effect_fx, false, false, -1, false, false);
//         let target_fx = ParticleManager.CreateParticle(
//             "particles/diy_particles/line_to_target.vpcf",
//             ParticleAttachment.CUSTOMORIGIN,
//             null
//         )
//         ParticleManager.SetParticleControlEnt(target_fx, 0, this.GetParent(), ParticleAttachment.POINT_FOLLOW,
//             "attach_hitloc", Vector(0, 0, 0), true
//         )
//         ParticleManager.SetParticleControlEnt(target_fx, 1, this.target, ParticleAttachment.POINT_FOLLOW,
//             "attach_hitloc", Vector(0, 0, 0), true
//         )

//         this.AddParticle(target_fx, false, false, -1, false, false)
//         this.StartIntervalThink(0.03)
//     }

//     OnIntervalThink(): void {
//         this.speed += 6;
//         let origin = this.GetParent().GetAbsOrigin();
//         let enemies = FindUnitsInRadius(
//             this.team,
//             origin,
//             null,
//             125,
//             UnitTargetTeam.ENEMY,
//             UnitTargetType.HERO,
//             UnitTargetFlags.NONE,
//             FindOrder.ANY,
//             false
//         )
//         if (enemies.length >= 1) {
//             this.target = enemies[0]
//             this.Destroy()
//         }
//     }

//     OnDestroy(): void {
//         if (!IsServer()) { return; }
//         //移除这个单位 造成伤害
//         UTIL_RemoveImmediate(this.GetParent());
//     }

// }

@registerModifier()
export class modifier_creature_boss_20_line extends BaseModifier {
    line_fx: ParticleID;
    target: CDOTA_BaseNPC;
    origin: Vector;

    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        this.caster = this.GetCaster();
        this.origin = this.GetCaster().GetAbsOrigin();
        this.OnRefresh(params);
        this.StartIntervalThink(0.1);
    }

    OnRefresh(params: any): void {
        if (!IsServer()) {
            return;
        }
        const target = EntIndexToHScript(params.entity) as CDOTA_BaseNPC;
        this.SetUnitLine(target);
    }

    SetUnitLine(target: CDOTA_BaseNPC) {
        this.target = target;
        if (this.line_fx) {
            ParticleManager.DestroyParticle(this.line_fx, true);
        }
        this.line_fx = ParticleManager.CreateParticle('particles/diy_particles/line_to_target.vpcf', ParticleAttachment.CUSTOMORIGIN, null);
        // ParticleManager.SetParticleControl(this.line_fx, 0, this.GetCaster().GetAbsOrigin());
        ParticleManager.SetParticleControlEnt(
            this.line_fx,
            0,
            this.GetCaster(),
            ParticleAttachment.POINT_FOLLOW,
            'attach_hitloc',
            Vector(0, 0, 0),
            true
        );
        ParticleManager.SetParticleControlEnt(this.line_fx, 1, this.target, ParticleAttachment.POINT_FOLLOW, 'attach_hitloc', Vector(0, 0, 0), true);
        ParticleManager.SetParticleControl(this.line_fx, 2, Vector(255, 0, 0));

        const attack_buff = this.GetCaster().FindModifierByName('modifier_creature_boss_20_attack') as modifier_creature_boss_20_attack;
        attack_buff.target = target;

        for (const hHero of HeroList.GetAllHeroes()) {
            hHero.RemoveModifierByName('modifier_creature_boss_20_slow');
        }
        target.AddNewModifier(this.GetCaster(), this.GetAbility(), 'modifier_creature_boss_20_slow', {});
        // this.AddParticle(this.line_fx, false, false, -1, false, false)
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.PROVIDES_VISION]: true,
        };
    }

    OnIntervalThink(): void {
        if (!this.target.IsAlive()) {
            // 切换目标
            const enemies = FindUnitsInRadius(
                DotaTeam.GOODGUYS,
                this.origin,
                null,
                9999,
                UnitTargetTeam.FRIENDLY,
                UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.CLOSEST,
                false
            );
            if (enemies.length > 0) {
                this.SetUnitLine(enemies[0]);
            } else {
                this.Destroy();
            }
            return;
        }
        const units = FindUnitsInLine(
            DotaTeam.GOODGUYS,
            this.origin,
            this.target.GetAbsOrigin(),
            null,
            100,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE
        );
        if (units.length == 0) {
            this.StartIntervalThink(-1);
            this.Destroy();
            return;
        }
        if (units.length >= 2) {
            let min_dis = 9999;
            let target: CDOTA_BaseNPC;
            for (const unit of units) {
                const dis = ((unit.GetAbsOrigin() - this.origin) as Vector).Length2D();
                if (dis < min_dis) {
                    min_dis = dis;
                    target = unit;
                }
            }
            this.SetUnitLine(target);
        }
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        if (this.line_fx) {
            ParticleManager.DestroyParticle(this.line_fx, true);
        }
        this.caster.InterruptChannel();
        ExecuteOrderFromTable({
            UnitIndex: this.caster.entindex(),
            OrderType: UnitOrder.STOP,
            Queue: false,
        });
        for (const hHero of HeroList.GetAllHeroes()) {
            hHero.RemoveModifierByName('modifier_creature_boss_20_slow');
        }
        // 移除所有
    }
}

@registerModifier()
export class modifier_creature_boss_20_slow extends BaseModifier {
    buff_key = 'boss_20_slow';

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }

        GameRules.CustomAttribute.SetAttributeInKey(this.GetParent(), this.buff_key, {
            MoveSpeed: {
                BasePercent: -75,
            },
        });
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        GameRules.CustomAttribute.DelAttributeInKey(this.GetParent(), this.buff_key);
    }
}
