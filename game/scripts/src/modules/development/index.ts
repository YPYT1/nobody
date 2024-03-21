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
        hHero.ForceKill(false)
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

        // const lastSelectHero = PlayerResource.GetPlayer(player_id).GetAssignedHero();
        if (originHero) { UTIL_Remove(originHero); }
    }

    /** 替换技能 */
    ReplaceAbility(player_id: PlayerID, params: CGED["Development"]["ReplaceAbility"]) {
        const queryUnit = params.queryUnit;
        const hUnit = EntIndexToHScript(queryUnit) as CDOTA_BaseNPC;
        const ability_name = params.ability_name;
        const order = params.order;
        print("ability_name", ability_name)
        if (hUnit.HasAbility(ability_name)) {
            print("已有该技能,现在进行位置替换")
            return
        }

        let order_ability = hUnit.GetAbilityByIndex(order);

        let new_ability = hUnit.AddAbility(ability_name)
        print("new_ability", new_ability)
        new_ability.SetLevel(1);
        if (order_ability) {
            let order_ability_name = order_ability.GetAbilityName()
            // 如果这个位置有技能,则进行替换

            hUnit.SwapAbilities(order_ability_name, ability_name, true, true)
            hUnit.RemoveAbilityByHandle(order_ability)
        }

        // const hero_class = `npc_dota_hero_` + DOTAGameManager.GetHeroNameByID(heroid)
        // PlayerResource.ReplaceHeroWith(player_id, hero_class, 0, 0)
    }


    UpgradeAbility(player_id: PlayerID, params: CGED["Development"]["UpgradeAbility"]) {
        let ability_enti = EntIndexToHScript(params.ability_enti) as CDOTABaseAbility;
        ability_enti.UpgradeAbility(false)
    }

    DeleteAbility(player_id: PlayerID, params: CGED["Development"]["DeleteAbility"]) {
        let ability_enti = EntIndexToHScript(params.ability_enti) as CDOTABaseAbility;
        ability_enti.RemoveSelf()
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
        let Dummy = CreateUnitByName("npc_dota_hero_target_dummy", origin, true, null, null, DotaTeam.NEUTRALS)
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

    ModiyAbilitySpecialValue(player_id: PlayerID, params: CGED["Development"]["ModiyAbilitySpecialValue"]) {
        DeepPrintTable(params)
        let ability_name = params.ability_name;
        let special_key = params.special_key;
        let special_type = params.special_type;
        let special_value = params.special_value;
        GameRules.CustomOverrideAbility.ModifySpecialValue(player_id, ability_name, special_key, special_type, special_value)
    }

    /** Debug命令 */
    DebugChat(cmd: string, args: string[], player_id: PlayerID) {
        if (cmd == "-reset") {
            // let hHeroUnit = PlayerResource.GetSelectedHeroEntity(player_id);
            PlayerResource.ReplaceHeroWith(player_id, "npc_dota_hero_sniper", 0, 0)
        }
        if (cmd == "-sg" || cmd == "-xg") {
            const count = tonumber(args[0] ?? "1");
            let amount = 0;
            const unit_name_list = [
                "npc_public_test",
                // "npc_public_test2",
                // "npc_public_test3",
            ]
            const hHero = PlayerResource.GetPlayer(player_id).GetAssignedHero()
            GameRules.GetGameModeEntity().SetContextThink("devxg", () => {
                amount += 1
                for (let unit_name of unit_name_list) {
                    let unit = CreateUnitByName(
                        unit_name,
                        hHero.GetAbsOrigin() + RandomVector(800) as Vector,
                        true,
                        null,
                        null,
                        DotaTeam.BADGUYS
                    )
                    unit.SetControllableByPlayer(0, true)
                    unit.SetHullRadius(36);
                }
                if (amount >= count) {
                    return null
                }
                return 0.25
            }, 0.25)
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
                GameRules.BasicRules.DropExpItem(hHeroUnit, vDrop, 100)
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