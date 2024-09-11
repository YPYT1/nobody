/** @noSelfInFile */
import { CBossBase } from "./boss_base";
declare const thisEntity: CDOTA_BaseNPC;

Object.assign(getfenv(), {
    Spawn: (entityKeyValues: any) => {
        Spawn(entityKeyValues);
    },
});

export function Spawn(entityKeyValues: any) {
    if (!IsServer()) { return; }
    if (!thisEntity) { return; }
    let BossAI = new CustomAI_Elite(thisEntity, 0.5);
}

class CustomAI_Elite extends CBossBase { }
