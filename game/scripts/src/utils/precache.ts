/** @noSelfInFile */
import { drow_precache } from "../kv_data/precache_data/hero_ability/drow";
import { HeroList } from "../kv_data/precache_data/hero_list";

// 导出的预载入方法，用来给addon_game_mode.ts调用
export default function Precache(context: CScriptPrecacheContext) {
    // 需要预载的所有资源
    // PrecacheResourceList
    PrecacheResourceList(
        [
            'particles/diy/pick_item_fx2.vpcf',
            'particles/diy_particles/event_ring_anim/event_ring_anim.vpcf',
            'particles/diy_particles/event_ring_anim/event_ring_anim_origin.vpcf',
            'particles/units/heroes/hero_dark_willow/dark_willow_wisp_spell_debuff.vpcf',
            'particles/diy_particles/warning_aoe/ui_sphere.vpcf',
            'particles/diy_particles/warning_aoe/ui_sphere_reverse.vpcf',
            'particles/diy_particles/warning_sector/warning_sector2.vpcf',
            'particles/diy_particles/range_finder_cone.vpcf',
            'particles/diy_particles/warning_sector/warning_sector.vpcf',
            'particles/diy_particles/move.vpcf',
            'particles/test_particle/xulie/overhead_timer.vpcf',
            'particles/econ/events/fall_2022/teleport/teleport_fall2022_end_lvl1.vpcf',
            'particles/custom/altar/altar.vpcf',
            
            'particles/custom/element/ice/ice_effect_frozen.vpcf',
            'particles/custom/element/thunder/thunder_effect_debuff.vpcf',
            'particles/units/heroes/hero_zuus/zuus_lightning_bolt.vpcf',
            'particles/units/heroes/hero_zuus/zuus_lightning_bolt_aoe.vpcf',
            'particles/econ/events/fall_2021/teleport_end_fall_2021_lvl1.vpcf',
            'particles/units/heroes/hero_ursa/ursa_earthshock.vpcf',
            'particles/units/heroes/hero_skeletonking/wraith_king_ghosts_ambient.vpcf',
            'particles/units/heroes/hero_crystalmaiden/maiden_crystal_nova.vpcf',
            
            ...drow_precache,
        ],
        context
    );

    // 需要预载入的kv文件，会自动解析KV文件中的所有vpcf资源等等
    precacheEveryResourceInKV(
        [
            // kv文件路径
            // 'npc_abilities_custom.txt',
        ],
        context
    );

    // 需要预载入的单位
    precacheUnits(
        [
            // 单位名称
            ...HeroList,
        ],
        context
    );
    // 需要预载入的物品
    precacheItems(
        [
            // 物品名称
            // 'item_***',
        ],
        context
    );
    print(`[Precache] Precache finished.`);
}

// 预载入KV文件中的所有资源
function precacheEveryResourceInKV(kvFileList: string[], context: CScriptPrecacheContext) {
    kvFileList.forEach(file => {
        const kvTable = LoadKeyValues(file);
        precacheEverythingFromTable(kvTable, context);
    });
}
// 预载入资源列表
function precacheResource(resourceList: string[], context: CScriptPrecacheContext) {
    resourceList.forEach(resource => {
        precacheResString(resource, context);
    });
}
function precacheResString(res: string, context: CScriptPrecacheContext) {
    if (res.endsWith('.vpcf')) {
        PrecacheResource('particle', res, context);
    } else if (res.endsWith('.vsndevts')) {
        PrecacheResource('soundfile', res, context);
    } else if (res.endsWith('.vmdl')) {
        PrecacheResource('model', res, context);
    }
}

// 预载入单位列表
function precacheUnits(unitNamesList: string[], context?: CScriptPrecacheContext) {
    if (context != null) {
        unitNamesList.forEach(unitName => {
            PrecacheUnitByNameSync(unitName, context);
        });
    } else {
        unitNamesList.forEach(unitName => {
            PrecacheUnitByNameAsync(unitName, () => { });
        });
    }
}
// 预载入物品列表
function precacheItems(itemList: string[], context: CScriptPrecacheContext) {
    itemList.forEach(itemName => {
        PrecacheItemByNameSync(itemName, context);
    });
}

// 一个辅助的，从KV表中解析出所有资源并预载入的方法
function precacheEverythingFromTable(kvTable: any, context: CScriptPrecacheContext) {
    for (const [k, v] of pairs(kvTable)) {
        if (type(v) === 'table') {
            precacheEverythingFromTable(v, context);
        } else if (type(v) === 'string') {
            precacheResString(v, context);
        }
    }
}
