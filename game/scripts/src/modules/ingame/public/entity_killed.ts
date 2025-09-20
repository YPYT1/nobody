import type { modifier_prop_effect } from '../../../modifier/prop_effect/modifier_prop_effect';
import type { modifier_rune_effect } from '../../../modifier/rune_effect/modifier_rune_effect';
import { reloadable } from '../../../utils/tstl-utils';

/** 实体击杀 */
@reloadable
export class EntityKilled {
    /** 通用击杀事件入口 */
    GeneralKilledEvent(entindex_killed: EntityIndex, entindex_attacker: EntityIndex, entindex_inflictor: EntityIndex) {
        const hTarget = EntIndexToHScript(entindex_killed) as CDOTA_BaseNPC;

        if (hTarget.GetTeamNumber() == DotaTeam.BADGUYS) {
            const hAttacker = EntIndexToHScript(entindex_attacker) as CDOTA_BaseNPC;
            // let iPlayerID = hAttacker.GetPlayerOwnerID();
            // let hHero = PlayerResource.GetSelectedHeroEntity(iPlayerID);

            if (hAttacker.GetTeamNumber() == DotaTeam.GOODGUYS) {
                GameRules.CustomAttribute.OnKillEvent(hAttacker, hTarget);
                // 符文效果
                const rune_buff = hAttacker.FindModifierByName('modifier_rune_effect') as modifier_rune_effect;
                if (rune_buff) {
                    rune_buff.OnKillEvent(hTarget);
                }
                // 物品效果
                const prop_buff = hAttacker.FindModifierByName('modifier_prop_effect') as modifier_prop_effect;
                if (prop_buff) {
                    prop_buff.OnKillEvent(hTarget);
                }

                // 圣坛效果

                // this.KilledOnMdf(hAttacker, hTarget)
                const hAbility = EntIndexToHScript(entindex_inflictor) as CDOTABaseAbility;
                if (hAbility) {
                    if (hAbility.custom_ability_types != null) {
                        GameRules.HeroAbilityType.AddAbilityTypeExp(hAttacker.GetPlayerOwnerID(), hAbility.custom_ability_types.skv_type);
                    }
                }
                // 技能击杀
                // this.ArmsKillAbility(hAttacker, hTarget,hAbility)
                // 掉落经验
            }

            /** 延迟1秒删除 */
            // hTarget.AddNoDraw();
            // let delay = 4;
            // if (hTarget.HasAbility("creature_elite_16")) {
            //     delay = 10;
            // }
            // hTarget.SetContextThink("death_play", () => {
            //     hTarget.RemoveSelf()
            //     return null
            // }, delay)
            if (hTarget.IsBossCreature()) {
                // BOSS死亡特效
                this.PlayBossDeath(hTarget);
            } else {
                this.PlayDeathAnimation(hTarget, hAttacker);
            }
        }
    }

    // 击杀关联的MDF
    // KilledOnMdf(hAttacker: CDOTA_BaseNPC, hDeathUnit: CDOTA_BaseNPC) {
    //     for (let mdf of hAttacker.KillOnMdfList) {
    //         mdf.C_OnKilled(hDeathUnit);
    //     }
    // }

    // ArmsKillAbility(hAttacker: CDOTA_BaseNPC, hDeathUnit: CDOTA_BaseNPC, hAbility: CDOTA_BaseNPC) {
    //     // 技能击杀
    // }

    PlayBossDeath(me: CDOTA_BaseNPC) {
        let state = true;
        me.SetContextThink(
            'boss_death_animation',
            () => {
                if (state) {
                    state = false;
                    const effect_fx = ParticleManager.CreateParticle(
                        'particles/units/heroes/hero_techies/techies_remote_cart_explode.vpcf',
                        ParticleAttachment.CUSTOMORIGIN,
                        null
                    );
                    ParticleManager.SetParticleControl(effect_fx, 0, me.GetAbsOrigin());
                    ParticleManager.SetParticleControl(effect_fx, 1, Vector(0, 0, 1300));
                    ParticleManager.ReleaseParticleIndex(effect_fx);
                    return 0.2;
                }
                me.AddEffects(EntityEffects.EF_NODRAW);
                return null;
            },
            3
        );
    }

    /** 死亡击飞 */
    PlayDeathAnimation(me: CDOTA_BaseNPC, hAttacker: CDOTA_BaseNPC) {
        const knockback_duration = 0.5;
        const knockback_distance = 200;
        const knockback_height = 10;
        const fGroundSpeed = knockback_distance / knockback_duration;
        const attack_vect = hAttacker.GetOrigin();
        const unit_origin = me.GetAbsOrigin();
        const vDir = ((unit_origin - attack_vect) as Vector).Normalized();
        const vFinal = (unit_origin + vDir * knockback_distance) as Vector;
        const dt = 0.03;
        const moved_distance = fGroundSpeed * dt;
        let fMovedDistance = 0;
        const fMovedHeigh = 0;
        const height_start = GetGroundHeight(unit_origin, me);
        let height_end = GetGroundHeight(vFinal, me);
        let height_max = height_start + knockback_height;
        height_end = height_end - height_start;
        height_max = height_max - height_start;
        if (height_max < height_end) {
            height_max = height_end + 0.01;
        }
        if (height_max <= 0) {
            height_max = 0.01;
        }
        const duration_end = (1 + math.sqrt(1 - height_end / height_max)) / 2;
        const fHeightConst1 = (4 * height_max * duration_end) / knockback_duration;
        const fHeightConst2 = (4 * height_max * duration_end * duration_end) / (knockback_duration * knockback_duration);
        let time = 0;
        me.SetContextThink(
            'death_anima',
            () => {
                // let origin = hUnit.GetAbsOrigin();
                const speed = (fHeightConst1 - 2 * fHeightConst2 * time) * dt;
                const vNewLocation = (me.GetOrigin() + vDir * fGroundSpeed * dt) as Vector;
                vNewLocation.z += speed;
                // 高度
                me.SetOrigin(vNewLocation);
                const ground = GetGroundHeight(vNewLocation, me);
                if (vNewLocation.z <= ground) {
                    vNewLocation.z = ground;
                    me.SetOrigin(vNewLocation);
                    return null;
                }
                fMovedDistance += moved_distance;
                if (fMovedDistance >= knockback_distance) {
                    return null;
                }

                time += dt;
                return dt;
            },
            0
        );
    }
}
