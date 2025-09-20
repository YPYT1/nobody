import { reloadable } from '../../utils/tstl-utils';
import { UIEventRegisterClass } from '../class_extends/ui_event_register_class';

/** 开发模式专用 模块 */
@reloadable
export class Development extends UIEventRegisterClass {
    constructor() {
        super('Development');
    }

    HeroLevelUp(player_id: PlayerID, params: CGED['Development']['HeroLevelUp']) {
        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        const value = params.value;
        for (let i = 0; i < value; i++) {
            hHero.HeroLevelUp(true);
            const level_up_fx = ParticleManager.CreateParticle(
                'particles/econ/events/ti10/hero_levelup_ti10.vpcf',
                ParticleAttachment.ABSORIGIN_FOLLOW,
                hHero
            );
            ParticleManager.ReleaseParticleIndex(level_up_fx);
        }
    }

    KillUnit(player_id: PlayerID, params: CGED['Development']['KillUnit']) {
        const unit = params.unit;
        const hUnit = EntIndexToHScript(unit) as CDOTA_BaseNPC;
        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        hUnit.RemoveModifierByName('modifier_state_boss_phase_hp');
        hUnit.Kill(null, hHero);
        // hHero.ForceKill(true)
    }

    RespawnHero(player_id: PlayerID, params: CGED['Development']['RespawnHero']) {
        const hHeroUnit = PlayerResource.GetSelectedHeroEntity(player_id);
        hHeroUnit.SetRespawnPosition(hHeroUnit.GetAbsOrigin());
        hHeroUnit.RespawnHero(false, false);
    }

    RespawnHeroOfPlayerId(player_id: PlayerID, params: CGED['Development']['RespawnHeroOfPlayerId']) {
        const hHeroUnit = PlayerResource.GetSelectedHeroEntity(params.playerid);
        if (hHeroUnit == null) {
            return;
        }
        hHeroUnit.SetRespawnPosition(hHeroUnit.GetAbsOrigin());
        hHeroUnit.RespawnHero(false, false);
    }

    ReplaceHero(player_id: PlayerID, params: CGED['Development']['ReplaceHero']) {
        const heroid = params.heroid;
        const originHero = PlayerResource.GetSelectedHeroEntity(player_id);
        const hero_class = `npc_dota_hero_` + DOTAGameManager.GetHeroNameByID(heroid);

        PrecacheUnitByNameAsync(hero_class, () => {
            PlayerResource.ReplaceHeroWithNoTransfer(player_id, hero_class, 0, 0);
            if (originHero) {
                UTIL_Remove(originHero);
            }
        });
        // const lastSelectHero = PlayerResource.GetPlayer(player_id).GetAssignedHero();
    }

    /** 替换技能 */
    ReplaceAbility(player_id: PlayerID, params: CGED['Development']['ReplaceAbility']) {
        const queryUnit = params.queryUnit;
        const hUnit = EntIndexToHScript(queryUnit) as CDOTA_BaseNPC;
        const ability_name = params.ability_name;
        const order = params.order;
        const order_ability = hUnit.GetAbilityByIndex(order);
        if (order_ability) {
            // order_ability.RemoveSelf()
            hUnit.RemoveAbilityByHandle(order_ability);
        }
        const new_ability = hUnit.AddAbility(ability_name);
        new_ability.SetLevel(1);
        // const hero_class = `npc_dota_hero_` + DOTAGameManager.GetHeroNameByID(heroid)
        // PlayerResource.ReplaceHeroWith(player_id, hero_class, 0, 0)
    }

    UpgradeAbility(player_id: PlayerID, params: CGED['Development']['UpgradeAbility']) {
        const ability_enti = EntIndexToHScript(params.ability_enti) as CDOTABaseAbility;
        ability_enti.UpgradeAbility(false);
    }

    DeleteAbility(player_id: PlayerID, params: CGED['Development']['DeleteAbility']) {
        const ability_order = params.ability_order;
        const hUnit = EntIndexToHScript(params.queryUnit) as CDOTA_BaseNPC;
        const hAbility = hUnit.GetAbilityByIndex(ability_order);
        hAbility.RemoveSelf();
        hUnit.RemoveAbilityByHandle(hAbility);
        // if (ability_order < 6) {
        //     hUnit.AddAbility("arms_passive_" + ability_order)
        // }
    }

    ToggleAbility(player_id: PlayerID, params: CGED['Development']['ToggleAbility']) {
        const ability_order = params.ability_order;
        const hUnit = EntIndexToHScript(params.queryUnit) as CDOTA_BaseNPC;
        const hAbility = hUnit.GetAbilityByIndex(ability_order);
        const state = hAbility.IsActivated();
        hAbility.SetActivated(!state);
    }

    // 创建物品到单位身上
    CreatedItem(player_id: PlayerID, params: CGED['Development']['CreatedItem']) {
        const queryUnit = params.queryUnit;
        const hUnit = EntIndexToHScript(queryUnit) as CDOTA_BaseNPC;
        const item_name = params.item_name;

        const hNewItem = CreateItem(item_name, null, null);
        if (hUnit.HasInventory()) {
            // 有物品栏才可
            hUnit.AddItem(hNewItem);
        } else {
            // 掉落到地上
            const vDropPos = (hUnit.GetAbsOrigin() + RandomVector(200)) as Vector;
            CreateItemOnPositionSync(vDropPos, hNewItem);
        }
    }

    AddDummy(player_id: PlayerID, params: CGED['Development']['AddDummy']) {
        const hHeroUnit = PlayerResource.GetSelectedHeroEntity(player_id);
        const origin = (hHeroUnit.GetAbsOrigin() + RandomVector(150)) as Vector;
        const Dummy = GameRules.Spawn.CreepNormalCreate('npc_public_dummy', origin);
        // let Dummy = CreateUnitByName(, origin, true, null, null, DotaTeam.BADGUYS);
        Dummy.CDResp = {};
        Dummy.SetControllableByPlayer(player_id, false);
    }

    RemoveUnit(player_id: PlayerID, params: CGED['Development']['RemoveUnit']) {
        for (const [k, v] of pairs(params.units)) {
            const entity = v as EntityIndex;
            const unit = EntIndexToHScript(entity) as CDOTA_BaseNPC;
            const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
            if (unit && unit != hHero) {
                unit.Destroy();
            } else {
                print('不可删除的单位');
            }
        }
    }

    /** 修改单位属性 */
    ModiyAttribute(player_id: PlayerID, params: CGED['Development']['ModiyAttribute']) {
        const unit = EntIndexToHScript(params.unit) as CDOTA_BaseNPC;
        const attr_object = params.attr_object;
        GameRules.CustomAttribute.ModifyAttribute(unit, attr_object);
    }

    ModiyOverrideSpecialValue(player_id: PlayerID, params: CGED['Development']['ModiyOverrideSpecialValue']) {
        const special_key = params.special_key;
        const special_type = params.special_type;
        const special_value = params.special_value;
        GameRules.CustomOverrideAbility.ModifyOverrideSpecialValue(player_id, {
            [special_key]: {
                [special_type]: special_value,
            },
        });
    }

    WarpUnit(player_id: PlayerID, params: CGED['Development']['WarpUnit']) {
        const hUnit = EntIndexToHScript(params.queryUnit) as CDOTA_BaseNPC;
        const vOrigin = hUnit.GetAbsOrigin();
        hUnit.SetAbsOrigin(Vector(params.x, params.y, vOrigin.z));
    }

    RemoveStakes() {
        const stakes = FindUnitsInRadius(
            DotaTeam.BADGUYS,
            Vector(0, 0, 0),
            null,
            99999,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        // let stakes = Entities.FindAllByName("npc_public_test");
        print('stakes', stakes.length);
        for (const stake of stakes) {
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

        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        const vOrigin = (hHero.GetAbsOrigin() + hHero.GetForwardVector() * 400) as Vector;

        for (let x = 0; x < max_x; x++) {
            for (let y = 0; y < max_y; y++) {
                // Entities.CreateByClassname("");

                const Dummy = CreateUnitByName(
                    'npc_public_test',
                    Vector((-max_x * grid_size) / 2 + x * grid_size + vOrigin.x, (-max_y * grid_size) / 2 + y * grid_size + vOrigin.x, vOrigin.z),
                    true,
                    null,
                    null,
                    DotaTeam.BADGUYS
                );
                Dummy.CDResp = {};
                Dummy.SetControllableByPlayer(player_id, false);
                // unit.SetUnitCanRespawn(true);
                // unit.SetControllableByPlayer(0, true);
            }
        }
    }

    /** Debug命令 */
    DebugChat(cmd: string, args: string[], player_id: PlayerID) {
        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        // let vHero = PlayerResource.GetSelectedHeroEntity(player_id);
        if (cmd == '-reset') {
            // let hHeroUnit = PlayerResource.GetSelectedHeroEntity(player_id);
            PlayerResource.ReplaceHeroWith(player_id, 'npc_dota_hero_sniper', 0, 0);
        }

        if (cmd == '-stake') {
            this.CreateStakes(player_id);
        }

        if (cmd == '-rmsk') {
            this.RemoveStakes();
        }

        if (cmd == '-prechace') {
            // PrecacheResourceList([
            //     'particles/econ/items/lich/frozen_chains_ti6/lich_frozenchains_frostnova.vpcf'
            // ], context)
        }

        if (cmd == '-fog') {
            print('add vis');
            // hHero.AddNewModifier(hHero, null, 'modifier_mission_dire_6_vision', { duration: 10 })
            // AddFOWViewer(DotaTeam.GOODGUYS, hHero.GetAbsOrigin(), 9999, 10, false)
            GameRules.GetGameModeEntity().SetFogOfWarDisabled(true);
        }

        if (cmd == '-hpbar') {
            SendToConsole('dota_hud_healthbars 1');
        }

        if (cmd == '-fow') {
            GameRules.GetGameModeEntity().SetFogOfWarDisabled(true);
            // AddFOWViewer(DotaTeam.GOODGUYS, hHero.GetAbsOrigin(), 7000, 10, false)
            // AddFOWViewer(DotaTeam.BADGUYS, hHero.GetAbsOrigin(), 7000, 10, false)
        }

        if (cmd == '-shuag') {
            print('-shuag');
            for (let i = 0; i < 50; i++) {
                const hUnit = GameRules.Spawn.CreepNormalCreate(`npc_monster_normal_1`, (hHero.GetAbsOrigin() + RandomVector(600)) as Vector);
                hUnit.SetBaseMaxHealth(1);
                hUnit.SetMaxHealth(1);
                hUnit.SetHealth(1);
            }

            // let ability1 = hUnit.GetAbilityByIndex(0);
        }

        if (cmd == '-prop') {
            GameRules.MysticalShopSystem.RefreshMysticalShopItem();
            if (args[0]) {
                print('add prop_id arg', ...args);
                GameRules.MysticalShopSystem.AddPropAttribute(player_id, 'prop_' + args[0], 1);
            } else {
                print('add prop all');
                // let hAbility = hHero.FindAbilityByName("public_attribute");
                // for (let prop_id = 1; prop_id <= 60; prop_id++) {
                //     let prop_name = "prop_" + prop_id;
                //     GameRules.MysticalShopSystem.AddPropAttribute(player_id, prop_name , 1)
                // }
                // let buff = hHero.AddNewModifier(hHero, hAbility, "modifier_shop_prop_10", {})
                // print(buff)
            }
        }
        if (cmd == '-fullr') {
            // 英雄符文全满
            let order = 1;
            for (let i = 26; i <= 51; i++) {
                GameRules.RuneSystem.GetRune(player_id, { item_name: 'rune_' + i, item_index: order }, 0);
                order++;
            }
            GameRules.CustomAttribute.UpdataPlayerSpecialValue(player_id);
            DeepPrintTable(hHero.rune_level_index);
        }

        if (cmd == '-fuhuo') {
            hHero.SetRespawnPosition(hHero.GetAbsOrigin());
            hHero.RespawnHero(false, false);
        }

        if (cmd == '-exp') {
            const count = tonumber(args[0] ?? '1');
            for (let i = 0; i < count; i++) {
                const vDrop = (hHero.GetAbsOrigin() + RandomVector(600)) as Vector;
                vDrop.x += RandomInt(-600, 600);
                vDrop.y += RandomInt(-600, 600);
                GameRules.ResourceSystem.DropResourceItem('TeamExp', vDrop, RandomInt(0, 2));
            }
        }

        if (cmd == '-hb') {
            // let index = command[1] ?? "1";
            // print("bosshealthbar");
            // let hHero = PlayerResource.GetSelectedHeroEntity(player_id)
            const boss_unit = CreateUnitByName(`npc_creature_boss_1`, Vector(0, 0, 0), true, null, null, DotaTeam.BADGUYS);
            // boss_unit.map_info = {};
            // print("boss_unit", boss_unit);
            GameRules.CMsg.SetBossHealthBar(boss_unit);
        }

        if (cmd == '-rmhb') {
            GameRules.CMsg.RemoveAllHealthBar();
        }
        if (cmd == '-hbremove') {
            const unit_length = GameRules.CMsg.boss_list.length;
            // for(let i = 0;i<unit_length;i++ ){}
            for (const entity of GameRules.CMsg.boss_list) {
                const unit = EntIndexToHScript(entity) as CDOTA_BaseNPC;
                GameRules.CMsg.RemoveBossHealthBar(unit);
                unit.Kill();
            }
        }

        if (cmd == '-allt') {
            const heroname = hHero.GetUnitName().replace('npc_dota_hero_', '');
            for (let i = 1; i <= 57; i++) {
                hHero.hero_talent[heroname][`${i}`] = 5;
                // hHero.rune_level_index
            }
            GameRules.CustomAttribute.UpdataPlayerSpecialValue(player_id);
        }
        if (cmd == '-getall') {
            // let hHeroUnit = PlayerResource.GetSelectedHeroEntity(player_id);
            const vPos = hHero.GetAbsOrigin();
            const ExpItems = FindUnitsInRadius(
                DotaTeam.NEUTRALS,
                vPos,
                null,
                9999,
                UnitTargetTeam.FRIENDLY,
                UnitTargetType.OTHER,
                UnitTargetFlags.INVULNERABLE,
                FindOrder.ANY,
                false
            );
            for (const ExpItem of ExpItems) {
                print('RowName', ExpItem.GetUnitName());
                if (ExpItem.GetUnitName() == 'npc_exp') {
                    if (!ExpItem.HasModifier('modifier_pick_animation')) {
                        // 无敌状态只能自己给自己上BUFF
                        ExpItem.AddNewModifier(ExpItem, null, 'modifier_pick_animation', {
                            picker: hHero.entindex(),
                        });
                    }
                }
            }
        }

        if (cmd == '-tsg') {
            const vect = (hHero.GetAbsOrigin() + RandomVector(300)) as Vector;
            const unit = GameRules.Spawn.CreepNormalCreate('npc_public_test', vect);
            unit.SetControllableByPlayer(0, false);
        }
        if (cmd == '-ui') {
            // let clientui_dialog = Entities.CreateByClassname("point_clientui_dialog");
            // // Entities.GetLocalPlayer
            // print("clientui_dialog", clientui_dialog);
            // clientui_dialog.SetAbsOrigin(hHero.GetAbsOrigin())
            // print("clientui_dialog", clientui_dialog.GetClassname(), clientui_dialog.HasAttribute("XML"))
            // ShowGenericPopupToPlayer()
            // SpawnEntityGroupFromTable()
            // CustomUI.DynamicHud_Create()
            // DeepPrintTable(clientui_dialog)
        }
    }
}
