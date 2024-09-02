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

            if (hAttacker.GetTeamNumber() == DotaTeam.GOODGUYS ) {
                GameRules.CustomAttribute.OnKillEvent(hAttacker, hTarget)
                // 符文效果
                let rune_buff = hAttacker.FindModifierByName("modifier_rune_effect") as modifier_rune_effect;
                if (rune_buff) { rune_buff.OnKillEvent(hTarget) }
                // 物品效果
                let prop_buff = hAttacker.FindModifierByName("modifier_prop_effect") as modifier_prop_effect;
                if (prop_buff) { prop_buff.OnKillEvent(hTarget) }
                // this.KilledOnMdf(hAttacker, hTarget)
                // let hAbility = EntIndexToHScript(entindex_inflictor) as CDOTABaseAbility;
                // 技能击杀
                // this.ArmsKillAbility(hAttacker, hTarget,hAbility)
                // 掉落经验
            }


            hTarget.AddNoDraw();
            hTarget.SetContextThink("death_play", () => {
                hTarget.RemoveSelf()
                return null
            }, 1)

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
}