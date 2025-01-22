
import * as HeroLevelConfig from "../json/config/game/hero_level_config.json";
export class GameConfig {
    constructor() {
        SendToServerConsole('dota_max_physical_items_purchase_limit 9999'); // 用来解决物品数量限制问题

        // if(GetMapName() == "hero_demo_main"){ 
        //     return 
        // }
        // GameRules.SetCustomGameSetupAutoLaunchDelay(3); // 游戏设置时间（默认的游戏设置是最开始的队伍分配）
        // GameRules.SetCustomGameSetupRemainingTime(3); // 游戏设置剩余时间
        // GameRules.SetCustomGameSetupTimeout(3); // 游戏设置阶段超时
        // GameRules.SetHeroSelectionTime(0); // 选择英雄阶段的持续时间
        // GameRules.SetShowcaseTime(0); // 选完英雄的展示时间
        // GameRules.SetPreGameTime(0); // 进入游戏后号角吹响前的准备时间
        // GameRules.SetPostGameTime(30); // 游戏结束后时长
        // GameRules.SetSameHeroSelectionEnabled(true); // 是否允许选择相同英雄
        // GameRules.SetStartingGold(0); // 设置初始金钱
        // GameRules.SetGoldTickTime(0); // 设置工资发放间隔
        // GameRules.SetGoldPerTick(0); // 设置工资发放数额
        // GameRules.SetHeroRespawnEnabled(false); // 是否允许英雄重生
        // GameRules.SetCustomGameAllowMusicAtGameStart(false); // 是否允许游戏开始时的音乐
        // GameRules.SetCustomGameAllowHeroPickMusic(false); // 是否允许英雄选择阶段的音乐
        // GameRules.SetCustomGameAllowBattleMusic(false); // 是否允许战斗阶段音乐
        // GameRules.SetUseUniversalShopMode(true); // 是否启用全地图商店模式（在基地也可以购买神秘商店的物品）* 这个不是设置在任何地方都可以购买，如果要设置这个，需要将购买区域覆盖全地图
        // GameRules.SetHideKillMessageHeaders(true); // 是否隐藏顶部的英雄击杀信息

        // const game: CDOTABaseGameMode = GameRules.GetGameModeEntity();
        // game.SetRemoveIllusionsOnDeath(true); // 是否在英雄死亡的时候移除幻象
        // game.SetSelectionGoldPenaltyEnabled(false); // 是否启用选择英雄时的金钱惩罚（超时每秒扣钱）
        // game.SetLoseGoldOnDeath(false); // 是否在英雄死亡时扣除金钱
        // game.SetBuybackEnabled(false); // 是否允许买活
        // game.SetDaynightCycleDisabled(true); // 是否禁用白天黑夜循环
        // game.SetForceRightClickAttackDisabled(true); // 是否禁用右键攻击
        // game.SetHudCombatEventsDisabled(true); // 是否禁用战斗事件（左下角的战斗消息）
        // game.SetCustomGameForceHero(`npc_dota_hero_wisp`); // 设置强制英雄（会直接跳过英雄选择阶段并直接为所有玩家选择这个英雄）
        // game.SetUseCustomHeroLevels(true); // 是否启用自定义英雄等级
        // game.SetCustomHeroMaxLevel(1); // 设置自定义英雄最大等级
        // game.SetCustomXPRequiredToReachNextLevel({
        //     // 设置自定义英雄每个等级所需经验，这里的经验是升级到这一级所需要的*总经验）
        //     1: 0,
        // });
        // game.SetDaynightCycleDisabled(true); // 是否禁用白天黑夜循环
        // game.SetDeathOverlayDisabled(true); // 是否禁用死亡遮罩（灰色的遮罩）

        // 设置自定义的队伍人数上限，这里的设置是10个队伍，每个队伍1人
        // GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 1);
        // GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 1);
        // for (let team = DotaTeam.CUSTOM_1; team <= DotaTeam.CUSTOM_8; ++team) {
        //     GameRules.SetCustomGameTeamMaxPlayers(team, 1);
        // }

        let gameEntity = GameRules.GetGameModeEntity();
        // gameEntity.SetCustomGameForceHero("npc_dota_hero_wisp");
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 4);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 0);
        // GameRules.SetEnableAlternateHeroGrids(true);
        GameRules.SetTimeOfDay(0.5); //白天时间
        GameRules.SetUseUniversalShopMode(true);
        GameRules.SetStrategyTime(0);
        GameRules.SetShowcaseTime(0);
        GameRules.SetPreGameTime(0);
        GameRules.SetPostGameTime(45);
        GameRules.SetHeroSelectionTime(99999);
        GameRules.SetHeroSelectPenaltyTime(0);
        GameRules.SetCustomGameAllowHeroPickMusic(false);
        GameRules.SetCustomGameAllowBattleMusic(false);
        GameRules.SetCustomGameAllowMusicAtGameStart(true);
        // SetUnitCanRespawn
        GameRules.SetCreepSpawningEnabled(false)
        // bit.band()
        GameRules.LockCustomGameSetupTeamAssignment(true);
        GameRules.EnableCustomGameSetupAutoLaunch(true);

        // DisableWearables
        // GameRules.wear
        // 自定义游戏加载事件
        GameRules.SetCustomGameSetupTimeout(-1);
        GameRules.SetCustomGameSetupAutoLaunchDelay(1);

        GameRules.SetStartingGold(0);
        GameRules.SetHeroRespawnEnabled(false);
        GameRules.SetSameHeroSelectionEnabled(true);

        GameRules.SetUseUniversalShopMode(true);
        //gameEntity.SetFreeCourierModeEnabled(true);
        GameRules.SetAllowOutpostBonuses(false);
        gameEntity.SetPauseEnabled(true);
        gameEntity.SetAnnouncerDisabled(true);
        gameEntity.SetRemoveIllusionsOnDeath(true);
        // gameEntity.SetFogOfWarDisabled(true);
        gameEntity.SetSelectionGoldPenaltyEnabled(false);
        gameEntity.SetLoseGoldOnDeath(false);
        gameEntity.SetBuybackEnabled(false);
        // gameEntity.SetCustomBackpackSwapCooldown(0);
        gameEntity.SetGiveFreeTPOnDeath(false);
        gameEntity.SetHudCombatEventsDisabled(true);
        // 禁用昼夜交替
        gameEntity.SetDaynightCycleDisabled(true);
        // gameEntity.SetTPScrollSlotItemOverride("item_backpack");
        // 平衡性
        gameEntity.SetCustomGameForceHero("npc_dota_hero_drow_ranger");
        gameEntity.SetMinimumAttackSpeed(1);
        gameEntity.SetMaximumAttackSpeed(9999);
        gameEntity.SetCustomAttributeDerivedStatValue(AttributeDerivedStats.STRENGTH_DAMAGE, 0);
        gameEntity.SetCustomAttributeDerivedStatValue(AttributeDerivedStats.STRENGTH_HP, 0);
        gameEntity.SetCustomAttributeDerivedStatValue(AttributeDerivedStats.STRENGTH_HP_REGEN, 0.00001);
        gameEntity.SetCustomAttributeDerivedStatValue(AttributeDerivedStats.AGILITY_DAMAGE, 0);
        gameEntity.SetCustomAttributeDerivedStatValue(AttributeDerivedStats.AGILITY_ARMOR, 0);
        gameEntity.SetCustomAttributeDerivedStatValue(AttributeDerivedStats.AGILITY_ATTACK_SPEED, 0);
        gameEntity.SetCustomAttributeDerivedStatValue(AttributeDerivedStats.INTELLIGENCE_DAMAGE, 0);
        gameEntity.SetCustomAttributeDerivedStatValue(AttributeDerivedStats.INTELLIGENCE_MANA, 0);
        gameEntity.SetCustomAttributeDerivedStatValue(AttributeDerivedStats.INTELLIGENCE_MANA_REGEN, 0.00001);
        gameEntity.SetCustomAttributeDerivedStatValue(AttributeDerivedStats.INTELLIGENCE_MAGIC_RESIST, 0);

        // gameEntity.SetForcedHUDSkin("aghanims_labyrinth_2021");

        const exp_level_list = GetHeroLevelTable();
        gameEntity.SetUseCustomHeroLevels(true);
        gameEntity.SetCustomXPRequiredToReachNextLevel(exp_level_list)
    }
}


function GetHeroLevelTable(max_level: number = 100) {
    let hero_xp_table: { [index: number]: number } = {};
    // let param = { LEVEL: 1 };
    for (let i = 0; i < max_level; i++) {
        let xp = 0;

        if (i == 0) {
            xp = 0;
        } else {
            xp = HeroLevelConfig[`${i}`] + hero_xp_table[i - 1];
        }
        hero_xp_table[i] = xp;
    }
    return hero_xp_table;
}