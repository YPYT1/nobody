/** @noSelfInFile */
// 导出的预载入方法，用来给addon_game_mode.ts调用
export default function Precache(context: CScriptPrecacheContext) {
    // 需要预载的所有资源
    precacheResource(
        [
            'particles/econ/items/zeus/zeus_ti8_immortal_arms/zeus_ti8_immortal_arc.vpcf',
            'soundevents/game_sounds_heroes/game_sounds_zuus.vsndevts',
            'soundevents/game_sounds_heroes/game_sounds_hoodwink.vsndevts',
            'particles/econ/items/mirana/mirana_persona/mirana_starstorm.vpcf',
            'particles/econ/items/mirana/mirana_persona/mirana_starstorm_moonray.vpcf',
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
            // "npc_dota_hero_abaddon",
            // "npc_dota_hero_abyssal_underlord",
            // "npc_dota_hero_alchemist",
            // "npc_dota_hero_ancient_apparition",
            // "npc_dota_hero_antimage",
            // "npc_dota_hero_arc_warden",
            // "npc_dota_hero_axe",
            // "npc_dota_hero_bane",
            // "npc_dota_hero_base",
            // "npc_dota_hero_batrider",
            // "npc_dota_hero_beastmaster",
            // "npc_dota_hero_bloodseeker",
            // "npc_dota_hero_bounty_hunter",
            // "npc_dota_hero_brewmaster",
            // "npc_dota_hero_bristleback",
            // "npc_dota_hero_broodmother",
            // "npc_dota_hero_centaur",
            // "npc_dota_hero_chaos_knight",
            // "npc_dota_hero_chen",
            // "npc_dota_hero_clinkz",
            // "npc_dota_hero_crystal_maiden",
            // "npc_dota_hero_dark_seer",
            // "npc_dota_hero_dark_willow",
            // "npc_dota_hero_dazzle",
            // "npc_dota_hero_death_prophet",
            // "npc_dota_hero_disruptor",
            // "npc_dota_hero_doom_bringer",
            // "npc_dota_hero_dragon_knight",
            // "npc_dota_hero_drow_ranger",
            // "npc_dota_hero_earth_spirit",
            // "npc_dota_hero_earthshaker",
            // "npc_dota_hero_elder_titan",
            // "npc_dota_hero_ember_spirit",
            // "npc_dota_hero_enchantress",
            // "npc_dota_hero_enigma",
            // "npc_dota_hero_faceless_void",
            // "npc_dota_hero_furion",
            // "npc_dota_hero_grimstroke",
            // "npc_dota_hero_gyrocopter",
            // "npc_dota_hero_huskar",
            // "npc_dota_hero_invoker",
            // "npc_dota_hero_jakiro",
            // "npc_dota_hero_juggernaut",
            // "npc_dota_hero_keeper_of_the_light",
            // "npc_dota_hero_kunkka",
            // "npc_dota_hero_legion_commander",
            // "npc_dota_hero_leshrac",
            // "npc_dota_hero_lich",
            // "npc_dota_hero_life_stealer",
            // "npc_dota_hero_lina",
            // "npc_dota_hero_lion",
            // "npc_dota_hero_lone_druid",
            // "npc_dota_hero_luna",
            // "npc_dota_hero_lycan",
            // "npc_dota_hero_magnataur",
            // "npc_dota_hero_mars",
            // "npc_dota_hero_medusa",
            // "npc_dota_hero_meepo",
            // "npc_dota_hero_mirana",
            // "npc_dota_hero_monkey_king",
            // "npc_dota_hero_morphling",
            // "npc_dota_hero_naga_siren",
            // "npc_dota_hero_necrolyte",
            // "npc_dota_hero_nevermore",
            // "npc_dota_hero_night_stalker",
            // "npc_dota_hero_nyx_assassin",
            // "npc_dota_hero_obsidian_destroyer",
            // "npc_dota_hero_ogre_magi",
            // "npc_dota_hero_omniknight",
            // "npc_dota_hero_oracle",
            // "npc_dota_hero_pangolier",
            // "npc_dota_hero_phantom_assassin",
            // "npc_dota_hero_phantom_lancer",
            // "npc_dota_hero_phoenix",
            // "npc_dota_hero_puck",
            // "npc_dota_hero_pudge",
            // "npc_dota_hero_pugna",
            // "npc_dota_hero_queenofpain",
            // "npc_dota_hero_rattletrap",
            // "npc_dota_hero_razor",
            // "npc_dota_hero_riki",
            // "npc_dota_hero_rubick",
            // "npc_dota_hero_sand_king",
            // "npc_dota_hero_shadow_demon",
            // "npc_dota_hero_shadow_shaman",
            // "npc_dota_hero_shredder",
            // "npc_dota_hero_silencer",
            // "npc_dota_hero_skeleton_king",
            // "npc_dota_hero_skywrath_mage",
            // "npc_dota_hero_slardar",
            // "npc_dota_hero_slark",
            // "npc_dota_hero_snapfire",
            // "npc_dota_hero_sniper",
            // "npc_dota_hero_spectre",
            // "npc_dota_hero_spirit_breaker",
            // "npc_dota_hero_storm_spirit",
            // "npc_dota_hero_sven",
            // "npc_dota_hero_target_dummy",
            // "npc_dota_hero_techies",
            // "npc_dota_hero_templar_assassin",
            // "npc_dota_hero_terrorblade",
            // "npc_dota_hero_tidehunter",
            // "npc_dota_hero_tinker",
            // "npc_dota_hero_tiny",
            // "npc_dota_hero_treant",
            // "npc_dota_hero_troll_warlord",
            // "npc_dota_hero_tusk",
            // "npc_dota_hero_undying",
            // "npc_dota_hero_ursa",
            // "npc_dota_hero_vengefulspirit",
            // "npc_dota_hero_venomancer",
            // "npc_dota_hero_viper",
            // "npc_dota_hero_visage",
            // "npc_dota_hero_void_spirit",
            // "npc_dota_hero_warlock",
            // "npc_dota_hero_weaver",
            // "npc_dota_hero_windrunner",
            // "npc_dota_hero_winter_wyvern",
            // "npc_dota_hero_wisp",
            // "npc_dota_hero_witch_doctor",
            // "npc_dota_hero_zuus",
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
