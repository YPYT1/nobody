/** @noSelfInFile */
/**
 * 创建一个傀儡召唤物 [此单位为傀儡]
 * @param vPos 
 * @param hCaster 
 * @returns 
 */
function CreateSummonedDummy(vPos: Vector, hCaster: CDOTA_BaseNPC) {
    let hSummoned = CreateUnitByName(
        "npc_dota_beastmaster_axe",
        vPos,
        true,
        hCaster,
        hCaster,
        hCaster.GetTeam()
    );
    return hSummoned;
}
