import { reloadable } from "../../utils/tstl-utils";

/** 实体击杀 */
@reloadable
export class EntityKilled {

    /** 通用击杀事件入口 */
    GeneralKilledEvent(entindex_killed: EntityIndex, entindex_attacker: EntityIndex) {
        let hKilled = EntIndexToHScript(entindex_killed) as CDOTA_BaseNPC;
        let hAttacker = EntIndexToHScript(entindex_attacker) as CDOTA_BaseNPC;

        if (hKilled.GetTeamNumber() == DotaTeam.BADGUYS) {
            // 掉落经验
            let vect = hKilled.GetAbsOrigin();
            GameRules.BasicRules.DropExpItem(hAttacker, vect, 100);

            let vAttacker = hAttacker.GetAbsOrigin();
            let vDir = (vect - vAttacker as Vector).Normalized()
            vDir.z = 0;


            // hKilled.text
            hKilled.SetSingleMeshGroup("textures/dev/ggx_integrate_brdf_lut_schlick.vtex")
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
}