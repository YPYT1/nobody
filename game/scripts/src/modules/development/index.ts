import { reloadable } from "../../utils/tstl-utils";
import { UIEventRegisterClass } from "../class_extends/ui_event_register_class";

/** 开发模式专用 模块 */
@reloadable
export class Development extends UIEventRegisterClass {

    constructor() {
        super("Development");
    }

    HeroLevelUp(player_id: PlayerID, params: CGED["Development"]["HeroLevelUp"]) {
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let value = params.value;
        for (let i = 0; i < value; i++) {
            hHero.HeroLevelUp(true)
            let level_up_fx = ParticleManager.CreateParticle(
                "particles/econ/events/ti10/hero_levelup_ti10.vpcf",
                ParticleAttachment.ABSORIGIN_FOLLOW,
                hHero
            )
            ParticleManager.ReleaseParticleIndex(level_up_fx)
        }
    }

    KillUnit(player_id: PlayerID, params: CGED["Development"]["KillUnit"]) {
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        hHero.Kill(null, hHero)
        // hHero.ForceKill(true)
    }

    RespawnHero(player_id: PlayerID, params: CGED["Development"]["RespawnHero"]) {
        let hHeroUnit = PlayerResource.GetSelectedHeroEntity(player_id);
        hHeroUnit.SetRespawnPosition(hHeroUnit.GetAbsOrigin());
        hHeroUnit.RespawnHero(false, false);
    }

    ReplaceHero(player_id: PlayerID, params: CGED["Development"]["ReplaceHero"]) {
        const heroid = params.heroid;
        const originHero = PlayerResource.GetSelectedHeroEntity(player_id);
        const hero_class = `npc_dota_hero_` + DOTAGameManager.GetHeroNameByID(heroid)
        PlayerResource.ReplaceHeroWithNoTransfer(player_id, hero_class, 0, 0);

        // PrecacheUnitByNameAsync(hero_class, () => { })
        // const lastSelectHero = PlayerResource.GetPlayer(player_id).GetAssignedHero();
        if (originHero) { UTIL_Remove(originHero); }
    }

    /** 替换技能 */
    ReplaceAbility(player_id: PlayerID, params: CGED["Development"]["ReplaceAbility"]) {
        const queryUnit = params.queryUnit;
        const hUnit = EntIndexToHScript(queryUnit) as CDOTA_BaseNPC;
        const ability_name = params.ability_name;
        const order = params.order;
        let order_ability = hUnit.GetAbilityByIndex(order);
        if (order_ability) {
            // order_ability.RemoveSelf()
            hUnit.RemoveAbilityByHandle(order_ability)
        }
        let new_ability = hUnit.AddAbility(ability_name)
        new_ability.SetLevel(1);
        // const hero_class = `npc_dota_hero_` + DOTAGameManager.GetHeroNameByID(heroid)
        // PlayerResource.ReplaceHeroWith(player_id, hero_class, 0, 0)
    }


    UpgradeAbility(player_id: PlayerID, params: CGED["Development"]["UpgradeAbility"]) {
        let ability_enti = EntIndexToHScript(params.ability_enti) as CDOTABaseAbility;
        ability_enti.UpgradeAbility(false)
    }

    DeleteAbility(player_id: PlayerID, params: CGED["Development"]["DeleteAbility"]) {
        let ability_order = params.ability_order;
        let hUnit = EntIndexToHScript(params.queryUnit) as CDOTA_BaseNPC;
        let hAbility = hUnit.GetAbilityByIndex(ability_order);
        hAbility.RemoveSelf()
        hUnit.RemoveAbilityByHandle(hAbility)
        // if (ability_order < 6) {
        //     hUnit.AddAbility("arms_passive_" + ability_order)
        // }
    }

    // 创建物品到单位身上
    CreatedItem(player_id: PlayerID, params: CGED["Development"]["CreatedItem"]) {
        const queryUnit = params.queryUnit;
        const hUnit = EntIndexToHScript(queryUnit) as CDOTA_BaseNPC;
        const item_name = params.item_name;

        let hNewItem = CreateItem(item_name, null, null);
        if (hUnit.HasInventory()) {
            // 有物品栏才可
            hUnit.AddItem(hNewItem);
        } else {
            // 掉落到地上
            let vDropPos = hUnit.GetAbsOrigin() + RandomVector(200) as Vector;
            CreateItemOnPositionSync(vDropPos, hNewItem);
        }

    }

    AddDummy(player_id: PlayerID, params: CGED["Development"]["AddDummy"]) {
        let hHeroUnit = PlayerResource.GetSelectedHeroEntity(player_id);
        let origin = hHeroUnit.GetAbsOrigin() + RandomVector(150) as Vector;
        let Dummy = CreateUnitByName("npc_public_dummy", origin, true, null, null, DotaTeam.BADGUYS);
        Dummy.CDResp = {};
        Dummy.SetControllableByPlayer(player_id, false)
    }

    RemoveUnit(player_id: PlayerID, params: CGED["Development"]["RemoveUnit"]) {
        for (let [k, v] of pairs(params.units)) {
            let entity = v as EntityIndex;
            let unit = EntIndexToHScript(entity) as CDOTA_BaseNPC;
            if (unit && !unit.IsNull() && unit != PlayerResource.GetSelectedHeroEntity(player_id)) {
                unit.Destroy()
            } else {
                print("不可删除的单位")
            }
        }

    }

    /** 修改单位属性 */
    ModiyAttribute(player_id: PlayerID, params: CGED["Development"]["ModiyAttribute"]) {
        let unit = EntIndexToHScript(params.unit) as CDOTA_BaseNPC;
        let attr_object = params.attr_object;
        GameRules.CustomAttribute.ModifyAttribute(unit, attr_object)
    }

    ModiyOverrideSpecialValue(player_id: PlayerID, params: CGED["Development"]["ModiyOverrideSpecialValue"]) {
        let special_key = params.special_key;
        let special_type = params.special_type;
        let special_value = params.special_value;
        GameRules.CustomOverrideAbility.ModifyOverrideSpecialValue(player_id, {
            [special_key]: {
                [special_type]: special_value
            }
        })
    }

    WarpUnit(player_id: PlayerID, params: CGED["Development"]["WarpUnit"]) {
        let hUnit = EntIndexToHScript(params.queryUnit) as CDOTA_BaseNPC;
        let vOrigin = hUnit.GetAbsOrigin();
        hUnit.SetAbsOrigin(Vector(params.x, params.y, vOrigin.z));
    }

    RemoveStakes() {
        let stakes = FindUnitsInRadius(
            DotaTeam.BADGUYS,
            Vector(0, 0, 0),
            null,
            99999,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )

        // let stakes = Entities.FindAllByName("npc_public_test");
        print("stakes", stakes.length);
        for (let stake of stakes) {
            stake.RemoveSelf();
        }
        // for(let unit of stakes){
        //     let 
        // }
    }
    CreateStakes(player_id: PlayerID) {
        const grid_size = 64;
        const max_x = 10;
        const max_y = 10;

        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let vOrigin = hHero.GetAbsOrigin() + hHero.GetForwardVector() * 400 as Vector;

        for (let x = 0; x < max_x; x++) {
            for (let y = 0; y < max_y; y++) {
                // Entities.CreateByClassname("");

                let Dummy = CreateUnitByName("npc_public_test",
                    Vector(
                        -max_x * grid_size / 2 + x * grid_size + vOrigin.x,
                        -max_y * grid_size / 2 + y * grid_size + vOrigin.x,
                        vOrigin.z
                    ),
                    true,
                    null,
                    null,
                    DotaTeam.BADGUYS
                );
                Dummy.CDResp = {};
                Dummy.SetControllableByPlayer(player_id, false)
                // unit.SetUnitCanRespawn(true);
                // unit.SetControllableByPlayer(0, true);
            }
        }

    }

    /** Debug命令 */
    DebugChat(cmd: string, args: string[], player_id: PlayerID) {
        if (cmd == "-reset") {
            // let hHeroUnit = PlayerResource.GetSelectedHeroEntity(player_id);
            PlayerResource.ReplaceHeroWith(player_id, "npc_dota_hero_sniper", 0, 0)
        }

        if (cmd == "-stake") {
            this.CreateStakes(player_id);
        }

        if (cmd == "-rmsk") {
            this.RemoveStakes()
        }

        if (cmd == "-prechace") {
            // PrecacheResourceList([
            //     'particles/econ/items/lich/frozen_chains_ti6/lich_frozenchains_frostnova.vpcf'
            // ], context)
        }

        if (cmd == "-vis") {
            print("add vis")
            // GameRules.GetGameModeEntity().SetFogOfWarDisabled(false)
            AddFOWViewer(DotaTeam.GOODGUYS, Vector(0, 0, 0), 5000, 3600, true)
        }

        if (cmd == "-hpbar") {
            SendToConsole("dota_hud_healthbars 1")
        }

        if (cmd == "-fuhuo") {
            let hHeroUnit = PlayerResource.GetSelectedHeroEntity(player_id);
            hHeroUnit.SetRespawnPosition(hHeroUnit.GetAbsOrigin());
            hHeroUnit.RespawnHero(false, false);
        }

        if (cmd == "-exp") {
            let hHeroUnit = PlayerResource.GetSelectedHeroEntity(player_id);
            const count = tonumber(args[0] ?? "1");
            for (let i = 0; i < count; i++) {
                let vDrop = hHeroUnit.GetAbsOrigin() + RandomVector(600) as Vector;
                vDrop.x += RandomInt(-600, 600)
                vDrop.y += RandomInt(-600, 600)
                GameRules.ResourceSystem.DropResourceItem("TeamExp", vDrop, 100);
            }

        }

        if (cmd == "-hb") {
            // let index = command[1] ?? "1";
            // print("bosshealthbar");
            let hHero = PlayerResource.GetSelectedHeroEntity(player_id)
            let boss_unit = CreateUnitByName(
                `npc_creature_boss_0`,
                hHero.GetAbsOrigin() + RandomVector(500) as Vector,
                true,
                null,
                null,
                DotaTeam.BADGUYS
            );
            // boss_unit.map_info = {};
            // print("boss_unit", boss_unit);
            GameRules.CMsg.SetBossHealthBar(boss_unit);
        }

        if (cmd == "-hbremove") {
            let unit_length = GameRules.CMsg.boss_list.length;
            // for(let i = 0;i<unit_length;i++ ){}
            for (let entity of GameRules.CMsg.boss_list) {
                let unit = EntIndexToHScript(entity) as CDOTA_BaseNPC;
                GameRules.CMsg.RemoveBossHealthBar(unit)
                unit.Kill();
            }
        }

        if (cmd == "-getall") {
            let hHeroUnit = PlayerResource.GetSelectedHeroEntity(player_id);
            let vPos = hHeroUnit.GetAbsOrigin();
            let ExpItems = FindUnitsInRadius(
                DotaTeam.GOODGUYS,
                vPos,
                null,
                9999,
                UnitTargetTeam.FRIENDLY,
                UnitTargetType.OTHER,
                UnitTargetFlags.INVULNERABLE,
                FindOrder.ANY,
                false
            )
            // print("ExpItems",ExpItems.length)
            for (let ExpItem of ExpItems) {
                // print("RowName",ExpItem.GetUnitName())
                if (ExpItem.GetUnitName() == "npc_exp") {
                    if (!ExpItem.HasModifier("modifier_pick_animation")) {
                        ExpItem.AddNewModifier(hHeroUnit, null, "modifier_pick_animation", {

                        })
                    }
                }

            }

        }

    }

}