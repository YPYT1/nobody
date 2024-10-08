import { modifier_prop_effect } from "../../../modifier/prop_effect/modifier_prop_effect";
import { modifier_rune_effect } from "../../../modifier/rune_effect/modifier_rune_effect";
import { reloadable } from "../../../utils/tstl-utils";

/** 实体击杀 */
@reloadable
export class EntityKilled {

    /** 通用击杀事件入口 */
    GeneralKilledEvent(entindex_killed: EntityIndex, entindex_attacker: EntityIndex, entindex_inflictor: EntityIndex) {
        let hTarget = EntIndexToHScript(entindex_killed) as CDOTA_BaseNPC;

        if (hTarget.GetTeamNumber() == DotaTeam.BADGUYS) {
            let hAttacker = EntIndexToHScript(entindex_attacker) as CDOTA_BaseNPC;
            // let iPlayerID = hAttacker.GetPlayerOwnerID();
            // let hHero = PlayerResource.GetSelectedHeroEntity(iPlayerID);

            if (hAttacker.GetTeamNumber() == DotaTeam.GOODGUYS) {
                GameRules.CustomAttribute.OnKillEvent(hAttacker, hTarget)
                // 符文效果
                let rune_buff = hAttacker.FindModifierByName("modifier_rune_effect") as modifier_rune_effect;
                if (rune_buff) { rune_buff.OnKillEvent(hTarget) }
                // 物品效果
                let prop_buff = hAttacker.FindModifierByName("modifier_prop_effect") as modifier_prop_effect;
                if (prop_buff) { prop_buff.OnKillEvent(hTarget) }

                // 圣坛效果

                // this.KilledOnMdf(hAttacker, hTarget)
                // let hAbility = EntIndexToHScript(entindex_inflictor) as CDOTABaseAbility;
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

    /** 死亡击飞 */
    PlayDeathAnimation(me: CDOTA_BaseNPC, hAttacker: CDOTA_BaseNPC) {
        let knockback_duration = 0.5;
        let knockback_distance = RandomInt(300, 600);
        let knockback_height = RandomInt(100, 200);
        let fGroundSpeed = knockback_distance / knockback_duration
        let attack_vect = hAttacker.GetOrigin();
        let unit_origin = me.GetAbsOrigin()
        let vDir = (unit_origin - attack_vect as Vector).Normalized()
        let vFinal = unit_origin + vDir * knockback_distance as Vector;
        let dt = 0.03
        let moved_distance = fGroundSpeed * dt;
        let fMovedDistance = 0;
        let fMovedHeigh = 0;
        let height_start = GetGroundHeight(unit_origin, me);
        let height_end = GetGroundHeight(vFinal, me);
        let height_max = height_start + knockback_height;
        height_end = height_end - height_start;
        height_max = height_max - height_start;
        if (height_max < height_end) { height_max = height_end + 0.01; }
        if (height_max <= 0) { height_max = 0.01; }
        let duration_end = (1 + math.sqrt(1 - height_end / height_max)) / 2;
        let fHeightConst1 = 4 * height_max * duration_end / knockback_duration;
        let fHeightConst2 = 4 * height_max * duration_end * duration_end / (knockback_duration * knockback_duration);
        let time = 0;
        me.SetContextThink("death_anima", () => {
            // let origin = hUnit.GetAbsOrigin();
            let speed = (fHeightConst1 - 2 * fHeightConst2 * time) * dt;
            let vNewLocation = me.GetOrigin() + vDir * fGroundSpeed * dt as Vector;
            vNewLocation.z += speed
            // 高度
            me.SetOrigin(vNewLocation);
            let ground = GetGroundHeight(vNewLocation, me);
            if (vNewLocation.z <= ground) {
                vNewLocation.z = ground;
                me.SetOrigin(vNewLocation);
                return null;
            }
            fMovedDistance += moved_distance;
            if (fMovedDistance >= knockback_distance) {
                return null;
            }

            time += dt
            return dt
        }, 0)
    }
}