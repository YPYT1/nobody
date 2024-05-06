import { reloadable } from "../../../utils/tstl-utils";

/** 实体击杀 */
@reloadable
export class EntityKilled {

    /** 通用击杀事件入口 */
    GeneralKilledEvent(entindex_killed: EntityIndex, entindex_attacker: EntityIndex, entindex_inflictor: EntityIndex) {
        let hKilled = EntIndexToHScript(entindex_killed) as CDOTA_BaseNPC;

        if (hKilled.GetTeamNumber() == DotaTeam.BADGUYS) {
            let hAttacker = EntIndexToHScript(entindex_attacker) as CDOTA_BaseNPC;

            this.KilledOnMdf(hAttacker, hKilled)
            // let hAbility = EntIndexToHScript(entindex_inflictor) as CDOTABaseAbility;
            // 技能击杀
            // this.ArmsKillAbility(hAttacker, hKilled,hAbility)
            // 掉落经验
            let vect = hKilled.GetAbsOrigin();
            GameRules.ResourceSystem.DropResourceItem("TeamExp", vect, 100);
            GameRules.ResourceSystem.ModifyResource(hAttacker.GetPlayerOwnerID(), {
                "Soul": 10
            })
            // let vAttacker = hAttacker.GetAbsOrigin();
            // let vDir = (vect - vAttacker as Vector).Normalized()
            // vDir.z = 0;


            // hKilled.text
            // hKilled.SetSingleMeshGroup("textures/dev/ggx_integrate_brdf_lut_schlick.vtex")
            hKilled.SetContextThink("death_play", () => {
                hKilled.RemoveSelf()
                return null
            }, 0)

            // hKilled.SetContextThink("death_play", () => {
            //     let vKilled = hKilled.GetAbsOrigin()
            //     let distance = (vKilled - vect as Vector).Length2D();
            //     if (distance < 50) {
            //         let vect = vKilled + vDir * 20 as Vector;
            //         hKilled.SetAbsOrigin(vect)
            //         return 0.03
            //     }
            //     return null
            // }, 0)
        }
    }

    // 击杀关联的MDF
    KilledOnMdf(hAttacker: CDOTA_BaseNPC, hDeathUnit: CDOTA_BaseNPC) {
        for (let mdf of hAttacker.KillOnMdfList) {
            mdf.C_OnKilled(hDeathUnit);
        }
    }

    ArmsKillAbility(hAttacker: CDOTA_BaseNPC, hDeathUnit: CDOTA_BaseNPC, hAbility: CDOTA_BaseNPC) {
        // 技能击杀
    }
}