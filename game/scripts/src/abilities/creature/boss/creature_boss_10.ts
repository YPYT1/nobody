import { modifier_motion_surround } from '../../../modifier/modifier_motion';
import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

/**
 * creature_boss_10	垃圾分类【奖励版】	"蓄力1秒，召唤两个垃圾区域（范围直径300码）在自身周围直径1000码内的任意位置，
 * 同时1000码范围内会出现随机8个可回收垃圾和不可回收垃圾。
倒计时10秒，玩家需要去拾取垃圾然后再到对应的区域去置放垃圾。触碰垃圾即可拾取垃圾，到指定区域即可自动卸载垃圾。
分类3个垃圾以下，造成高额伤害。（伤害为玩家最大生命值75%）
分类3个到5个，给与低级奖励（经验值200）
分类6个到7个，给与中级奖励（经验值300）
分类8个，给与高级奖励（经验值500）"

 */
@registerAbility()
export class creature_boss_10 extends BaseCreatureAbility {
    OnAbilityPhaseStart(): boolean {
        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_state_boss_invincible', {});
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
        // 自身1000范围内随机两个点
        const recovery_vect1 = (this.vOrigin + RandomVector(1000)) as Vector;
        const recovery_vect2 = RotatePosition(this.vOrigin, QAngle(0, 180, 0), recovery_vect1);

        const count = this.GetSpecialValueFor('count');
        const count1 = RandomInt(2, 5);
        const count2 = count - count1;
        this.CreateRecoveryZone(recovery_vect1, 0, count1);
        this.CreateRecoveryZone(recovery_vect2, 1, count2);

        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_creature_boss_10_stack', {
            duration: this.channel_timer,
        });

        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_state_boss_invincible_channel', {});
        GameRules.CMsg.BossCastWarning(true, 'custom_text_boss_cast_warning_8', {});
    }

    CreateRecoveryZone(pos: Vector, type: number, garbage_count: number) {
        CreateModifierThinker(
            this.hCaster,
            this,
            'modifier_creature_boss_9_thinker_' + type,
            {
                duration: this.channel_timer + 0.1,
            },
            pos,
            this._team,
            false
        );

        for (let i = 0; i < garbage_count; i++) {
            const origin = (this.vOrigin + RandomVector(RandomInt(-this._cast_range, this._cast_range))) as Vector;
            this.CreateGarbage(origin, type, pos);
        }
    }

    /** 创建回收垃圾单位 */
    CreateGarbage(vPos: Vector, type: number, vTarget: Vector) {
        const garbage = CreateUnitByName('npc_public_garbage_' + type, vPos, false, null, null, DotaTeam.GOODGUYS);

        garbage.AddNewModifier(this.hCaster, this, 'modifier_creature_boss_9_garbag_search', {});
        garbage.AddNewModifier(this.hCaster, this, 'modifier_creature_boss_9_tag_' + type, {
            duration: this.channel_timer,
            target_x: vTarget.x,
            target_y: vTarget.y,
            radius: this._radius,
        });
    }
}

@registerModifier()
export class modifier_creature_boss_10_stack extends BaseModifier {
    dmg_max_hp: number;

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.dmg_max_hp = this.GetAbility().GetSpecialValueFor('dmg_max_hp') * 0.01;
        this.SetStackCount(1);
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.UNSELECTABLE]: true,
        };
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        const defen = this.GetStackCount() - 1;
        let score_label = 'c';
        if (defen < 3) {
            // 分类3个垃圾以下，造成高额伤害。（伤害为玩家最大生命值75%）
            for (const hHero of HeroList.GetAllHeroes()) {
                const damage = hHero.GetMaxHealth() * this.dmg_max_hp;
                ApplyCustomDamage({
                    victim: hHero,
                    attacker: this.GetCaster(),
                    ability: this.GetAbility(),
                    damage: damage,
                    damage_type: DamageTypes.PHYSICAL,
                    miss_flag: 1,
                });
            }
        } else if (defen <= 5) {
            score_label = 'b';
            // 分类3个到5个，给与低级奖励（经验值200）
            for (let i = 0 as PlayerID; i < PlayerResource.GetPlayerCountForTeam(DotaTeam.GOODGUYS); i++) {
                GameRules.ResourceSystem.ModifyResource(i, { SingleExp: 200 });
            }
        } else if (defen <= 7) {
            score_label = 'a';
            // 分类6个到7个，给与中级奖励（经验值300）
            for (let i = 0 as PlayerID; i < PlayerResource.GetPlayerCountForTeam(DotaTeam.GOODGUYS); i++) {
                GameRules.ResourceSystem.ModifyResource(i, { SingleExp: 300 });
            }
        } else {
            score_label = 's';
            // 分类8个，给与高级奖励（经验值500）
            for (let i = 0 as PlayerID; i < PlayerResource.GetPlayerCountForTeam(DotaTeam.GOODGUYS); i++) {
                GameRules.ResourceSystem.ModifyResource(i, { SingleExp: 500 });
            }
        }

        GameRules.CMsg.SendCommonMsgToPlayer(-1, '垃圾分类评级: {s:score_label}', {
            score_label: score_label,
        });
    }
}

@registerModifier()
export class modifier_creature_boss_9_thinker_0 extends BaseModifier {
    radius: number;

    icon_index = 13;
    color = Vector(0, 255, 0);
    mdf = 'modifier_creature_boss_9_debuff_0';

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }

        this.origin = this.GetParent().GetAbsOrigin();
        const effect_fx = ParticleManager.CreateParticle('particles/title_fx/title00028/title00028.vpcf', ParticleAttachment.POINT, this.GetParent());
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(this.icon_index, 0, 0));
        this.AddParticle(effect_fx, false, false, -1, false, false);

        // 范围
        this.radius = this.GetAbility().GetSpecialValueFor('radius');
        const origin_fx = ParticleManager.CreateParticle(
            'particles/diy_particles/event_ring_anim/event_ring_anim_origin.vpcf',
            ParticleAttachment.POINT,
            this.GetParent()
        );
        ParticleManager.SetParticleControl(origin_fx, 0, Vector(this.origin.x, this.origin.y, this.origin.z + 5));
        ParticleManager.SetParticleControl(origin_fx, 2, Vector(this.radius - 32, 0, 0));
        ParticleManager.SetParticleControl(origin_fx, 3, this.color);
        this.AddParticle(effect_fx, false, false, -1, false, false);
        // this.StartIntervalThink(0.1)
    }

    OnIntervalThink(): void {
        const enemies = FindUnitsInRadius(
            this.GetCaster().GetTeam(),
            this.origin,
            null,
            this.radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        UTIL_Remove(this.GetParent());
    }
}

@registerModifier()
export class modifier_creature_boss_9_thinker_1 extends modifier_creature_boss_9_thinker_0 {
    icon_index = 14;
    color = Vector(255, 0, 0);
}

@registerModifier()
export class modifier_creature_boss_9_tag_0 extends BaseModifier {
    icon = 13;
    target: Vector;
    radius: number;
    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        this.radius = this.GetAbility().GetSpecialValueFor('radius');
        this.origin = this.GetParent().GetAbsOrigin();
        const effect_fx = ParticleManager.CreateParticle(
            'particles/title_fx/title00028/title00028.vpcf',
            ParticleAttachment.OVERHEAD_FOLLOW,
            this.GetParent()
        );
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(this.icon, 0, 0));
        this.AddParticle(effect_fx, false, false, -1, false, false);

        this.target = Vector(params.target_x, params.target_y, 0);
        this.StartIntervalThink(0.1);
    }

    OnIntervalThink(): void {
        const origin = this.GetParent().GetAbsOrigin();
        const distance = ((origin - this.target) as Vector).Length2D();
        if (distance < this.radius) {
            // 加分
            const hCaster = this.GetCaster();
            const stack_buff = hCaster.FindModifierByName('modifier_creature_boss_10_stack');
            if (stack_buff) {
                stack_buff.IncrementStackCount();
            }
            this.Destroy();
        }
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.UNSELECTABLE]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
        };
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        UTIL_Remove(this.GetParent());
    }
}

@registerModifier()
export class modifier_creature_boss_9_tag_1 extends modifier_creature_boss_9_tag_0 {
    icon = 14;
}

@registerModifier()
export class modifier_creature_boss_9_garbag_search extends BaseModifier {
    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.origin = this.GetParent().GetAbsOrigin();
        this.StartIntervalThink(0.1);
    }

    OnIntervalThink(): void {
        const units = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            this.origin,
            null,
            250,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        if (units.length > 0) {
            const target = units[0];
            const vTarget = target.GetAbsOrigin();
            const hParent = this.GetParent();
            const dir = ((this.origin - vTarget) as Vector).Normalized();
            const cast_angle = VectorToAngles(dir).y;
            hParent.AddNewModifier(hParent, this.GetAbility(), 'modifier_creature_boss_9_garbag_follow', {
                surround_entity: target.GetEntityIndex(),
                surround_distance: 100,
                surround_qangle: cast_angle,
                surround_speed: 200,
                surround_height: 50,
                duration: 10,
            });
            this.StartIntervalThink(-1);
            this.Destroy();
        }
    }
}

@registerModifier()
export class modifier_creature_boss_9_garbag_follow extends modifier_motion_surround {
    C_OnCreated(params: any): void {
        print('garbag_follow C_OnCreated');
    }

    C_OnDestroy(): void {
        print('garbag_follow C_OnDestroy');
    }
}
