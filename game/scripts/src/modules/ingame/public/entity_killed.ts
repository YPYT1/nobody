import { modifier_rune_effect } from "../../../modifier/rune_effect/modifier_rune_effect";
import { reloadable } from "../../../utils/tstl-utils";

/** 实体击杀 */
@reloadable
export class EntityKilled {

    /** 通用击杀事件入口 */
    GeneralKilledEvent(entindex_killed: EntityIndex, entindex_attacker: EntityIndex, entindex_inflictor: EntityIndex) {
        let hKilled = EntIndexToHScript(entindex_killed) as CDOTA_BaseNPC;

        if (hKilled.GetTeamNumber() == DotaTeam.BADGUYS) {
            let hAttacker = EntIndexToHScript(entindex_attacker) as CDOTA_BaseNPC;
            let iPlayerID = hAttacker.GetPlayerOwnerID();
            let hHero = PlayerResource.GetSelectedHeroEntity(iPlayerID);

            GameRules.CustomAttribute.OnKillEvent(hAttacker, hKilled)

            // 符文效果
            let rune_buff = hKilled.FindModifierByName("modifier_rune_effect") as modifier_rune_effect
            if (rune_buff) { rune_buff.OnKillEvent(hKilled) }

            // this.KilledOnMdf(hAttacker, hKilled)
            // let hAbility = EntIndexToHScript(entindex_inflictor) as CDOTABaseAbility;
            // 技能击杀
            // this.ArmsKillAbility(hAttacker, hKilled,hAbility)
            // 掉落经验

            hKilled.SetContextThink("death_play", () => {
                hKilled.RemoveSelf()
                return null
            }, 0)

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