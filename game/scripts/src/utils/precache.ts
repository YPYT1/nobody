/** @noSelfInFile */
import { drow_precache } from "../kv_data/precache_data/hero_ability/drow";
import { skywrath_precache } from "../kv_data/precache_data/hero_ability/skywrath";
import { HeroList } from "../kv_data/precache_data/hero_list";
import "./../global/global_precache";
import * as NpcAbilitiesCustomJson from "../json/npc_abilities_custom.json";
import * as NpcUnitCustomJson from "../json/npc_units_custom.json";

const abilities_list = Object.keys(NpcAbilitiesCustomJson)
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
            'particles/diy_particles/move_glow.vpcf',
            'particles/test_particle/xulie/overhead_timer.vpcf',
            'particles/econ/events/fall_2022/teleport/teleport_fall2022_end_lvl1.vpcf',
            'particles/custom/altar/altar.vpcf',
            'particles/units/heroes/hero_razor/razor_plasmafield.vpcf',
            'particles/custom/element/ice/ice_effect_frozen.vpcf',
            'particles/custom/element/thunder/thunder_effect_debuff.vpcf',
            'particles/units/heroes/hero_zuus/zuus_lightning_bolt.vpcf',
            'particles/units/heroes/hero_zuus/zuus_lightning_bolt_aoe.vpcf',
            'particles/econ/events/fall_2021/teleport_end_fall_2021_lvl1.vpcf',
            'particles/units/heroes/hero_ursa/ursa_earthshock.vpcf',
            'particles/units/heroes/hero_skeletonking/wraith_king_ghosts_ambient.vpcf',
            'particles/units/heroes/hero_crystalmaiden/maiden_crystal_nova.vpcf',
            'particles/units/heroes/hero_huskar/huskar_burning_spear_debuff.vpcf',
            'particles/units/heroes/hero_pudge/pudge_rot.vpcf',
            'particles/units/heroes/hero_muerta/muerta_parting_shot_tether.vpcf',
            'particles/units/heroes/hero_techies/techies_land_mine_explode.vpcf',
            'particles/econ/items/phoenix/phoenix_solar_forge/phoenix_sunray_solar_forge.vpcf',
            'particles/title_fx/title00028/title00028.vpcf',
            'particles/econ/items/leshrac/leshrac_tormented_staff/leshrac_split_tormented.vpcf',
            'particles/econ/events/ti9/teleport_end_ti9.vpcf',
            'particles/units/heroes/hero_phoenix/phoenix_supernova_reborn.vpcf',
            'particles/econ/items/jakiro/jakiro_ti7_immortal_head/jakiro_ti7_immortal_head_ice_path_b.vpcf',
            'particles/units/heroes/hero_gyrocopter/gyro_guided_missile_target.vpct',
            'particles/units/heroes/hero_gyrocopter/gyro_guided_missile.vpcf',
            'particles/econ/items/death_prophet/death_prophet_acherontia/death_prophet_acher_swarm.vpcf',
            'particles/units/heroes/hero_magnataur/magnataur_skewer.vpcf',
            'particles/units/heroes/hero_treant/treant_overgrowth_cast.vpcf',
            'particles/econ/items/treant_protector/treant_ti10_immortal_head/treant_ti10_immortal_overgrowth_root_small.vpcf',
            'particles/units/heroes/hero_elder_titan/elder_titan_echo_stomp_physical.vpcf',
            'particles/ui_mouseactions/range_finder_tower_line.vpcf',
            'particles/custom/creature/boss/boss_20_mission.vpcf',
            'particles/diy_particles/unit_model_particles.vpcf',
            'particles/econ/items/lina/lina_ti7/lina_spell_light_strike_array_ti7.vpcf',
            'particles/units/heroes/hero_spirit_breaker/spirit_breaker_charge.vpcf',
            'particles/custom/creature/boss/boss_24_explode.vpcf',
            'particles/custom/creature/boss/boss_24_shield.vpcf',
            'particles/diy_particles/line_to_target.vpcf',
            'particles/units/heroes/hero_earthshaker/earthshaker_echoslam_start.vpcf',
            'particles/units/heroes/hero_techies/techies_remote_cart_explode.vpcf',
            'particles/diy/elite_state.vpcf',
            ...drow_precache,
            ...skywrath_precache,
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
            ...Object.keys(NpcUnitCustomJson),
            ...HeroList,
        ],
        context
    );
    // 需要预载入的物品
    precacheItems(
        [
            // 物品名称
            ...abilities_list,
            // 'item_***',
        ],
        context
    );
    print(`[Precache] Precache finished.`);
}
