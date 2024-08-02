import { reloadable } from '../utils/tstl-utils';
import { Filter } from './filter';
import { BasicRules } from './ingame/basic_rules';
import { BuffManager } from './ingame/public/buff_manager';
import { CustomAttribute } from './ingame/hero_extend/custom_attribute';
import { CustomOverrideAbility } from './ingame/hero_extend/custom_override_ability';
import { EntityKilled } from './ingame/public/entity_killed';
import { ItemArmsSystem } from './ingame/item_arms_system';
import { ResourceSystem } from './ingame/system/resource_system';
import { ArmsCombo } from './ingame/hero_extend/arms_combo';
import { SummonedSystem } from './ingame/system/summoned_system';
import { CustomMechanics } from './ingame/hero_extend/custom_mechanics';
import { Spawn } from './ingame/spawns/spawn';
import { CMsg } from './ingame/system/cmsg';
import { NewArmsEvolution } from './ingame/hero_extend/new_arms_evolution';
import { MysticalShopSystem } from './ingame/system/mystical_shop_system';
import { ArchiveService } from '../server/https/archive_service';
import { ServiceData } from '../server/https/service_data';
import { ServiceInterface } from '../server/https/service_interface';
import { ServiceEquipment } from '../server/https/service_equipment';
import { GameInformation } from './ingame/public/game_information';
import { WarningMarker } from './ingame/system/warning_marker';
import { DamageReduction } from './ingame/system/damage_reduction';
import { HeroTalentSystem } from './ingame/hero_extend/hero_talent_system';
import { NpcSystem } from './map_chapter/npc_system';
import { RuneSystem } from './ingame/rune/rune_system';

declare global {

    interface CDOTAGameRules {
        // 声明所有的GameRules模块，这个主要是为了方便其他地方的引用（保证单例模式）
        NewArmsEvolution: NewArmsEvolution;

        BasicRules: BasicRules;
        BuffManager: BuffManager;

        CustomAttribute: CustomAttribute;
        CustomOverrideAbility: CustomOverrideAbility;
        //局内相关
        EntityKilled: EntityKilled;
        ResourceSystem: ResourceSystem;
        ItemArmsSystem: ItemArmsSystem;
        Spawn: Spawn;
        ArmsCombo: ArmsCombo;
        CMsg: CMsg;
        GameInformation: GameInformation;
        NpcSystem: NpcSystem;

        SummonedSystem: SummonedSystem;
        CustomMechanics: CustomMechanics;
        RuneSystem: RuneSystem;
        MysticalShopSystem: MysticalShopSystem;
        HeroTalentSystem: HeroTalentSystem;
        // 自定义系统
        DamageReduction: DamageReduction;

        //服务器相关功能
        ArchiveService: ArchiveService;
        ServiceData: ServiceData;
        ServiceInterface: ServiceInterface;
        ServiceEquipment: ServiceEquipment;

        WarningMarker: WarningMarker;
    }
}

@reloadable
export class GameEvent {

    constructor() {
        ListenToGameEvent("entity_killed", event => this.OnEntityKilled(event), this);
        ListenToGameEvent("game_rules_state_change", event => this.OnGameRulesStateChange(), this);
        ListenToGameEvent("dota_on_hero_finish_spawn", event => this.OnEntityDotaOnHeroFinishSpawn(event), this);
        ListenToGameEvent("player_disconnect", event => this.OnPlayerDisconnect(event), this)
        ListenToGameEvent("player_connect", event => this.OnPlayerConnect(event), this)
        ListenToGameEvent("player_connect_full", event => this.OnPlayerConnectFull(event), this)
        // ListenToGameEvent("dota_player_gained_level", event => this.OnPlayerGainedLevel(event), this)
    }

    OnGameRulesStateChange() {
        print("[OnGameRulesStateChange]:", GameRules.State_Get())
        let State_Get = GameRules.State_Get();
        if (State_Get == GameState.INIT) { //初始化阶段

        } else if (State_Get == GameState.WAIT_FOR_PLAYERS_TO_LOAD) { //加载阶段

        } else if (State_Get == GameState.CUSTOM_GAME_SETUP) { //游戏设置阶段
            GameRules.ArchiveService = new ArchiveService();
            GameRules.NewArmsEvolution = new NewArmsEvolution();
            GameRules.BasicRules = new BasicRules();
            GameRules.CustomAttribute = new CustomAttribute();
            GameRules.CustomOverrideAbility = new CustomOverrideAbility()
            GameRules.BuffManager = new BuffManager();
            GameRules.EntityKilled = new EntityKilled();
            GameRules.ItemArmsSystem = new ItemArmsSystem();
            GameRules.Spawn = new Spawn();
            GameRules.ResourceSystem = new ResourceSystem();
            GameRules.ArmsCombo = new ArmsCombo();
            GameRules.SummonedSystem = new SummonedSystem();
            GameRules.CMsg = new CMsg();
            GameRules.RuneSystem = new RuneSystem();
            GameRules.MysticalShopSystem = new MysticalShopSystem();
            GameRules.ServiceInterface = new ServiceInterface();
            GameRules.ServiceEquipment = new ServiceEquipment();
            GameRules.GameInformation = new GameInformation();
            GameRules.WarningMarker = new WarningMarker();
            GameRules.DamageReduction = new DamageReduction();
            GameRules.HeroTalentSystem = new HeroTalentSystem();
            GameRules.NpcSystem = new NpcSystem();
            
            // @ts-expect-error @eslint-disable-next-line
            GameRules.ModuleActivated = true;
        } else if (State_Get == GameState.HERO_SELECTION) { //英雄选择阶段
            GameRules.CustomMechanics = new CustomMechanics();
        } else if (State_Get == GameState.STRATEGY_TIME) { //战略阶段

        } else if (State_Get == GameState.TEAM_SHOWCASE) { //队伍展示阶段

        } else if (State_Get == GameState.WAIT_FOR_MAP_TO_LOAD) { //地图加载阶段
            new Filter(); // 加载过滤器
            GameRules.MapChapter.InitChapterMap();
            SendToConsole("dota_hud_healthbars 1"); // 血条设置
        } else if (State_Get == GameState.PRE_GAME) { //赛前阶段

        } else if (State_Get == GameState.SCENARIO_SETUP) { //场景设置阶段

        } else if (State_Get == GameState.GAME_IN_PROGRESS) { //游戏开始阶段

        } else if (State_Get == GameState.POST_GAME) { //推送结果阶段

        } else if (State_Get == GameState.DISCONNECT) { //断开阶段

        }
    }

    OnEntityKilled(event: GameEventProvidedProperties & EntityKilledEvent) {
        GameRules.EntityKilled.GeneralKilledEvent(event.entindex_killed, event.entindex_attacker, event.entindex_inflictor)
        //单位死亡后续处理
        GameRules.Spawn.GeneralKilledEvent(event.entindex_killed, event.entindex_attacker, event.entindex_inflictor)
    }

    OnEntityDotaOnHeroFinishSpawn(event: GameEventProvidedProperties & DotaOnHeroFinishSpawnEvent) {
        let hUnit = EntIndexToHScript(event.heroindex as EntityIndex) as CDOTA_BaseNPC_Hero;
        if (hUnit.isSpawned != true) {
            let player_id = hUnit.GetPlayerOwnerID()
            // 英雄重新配置
            hUnit.isSpawned = true;
            GameRules.CustomAttribute.InitHeroAttribute(hUnit)
            //初始化可选技能
            GameRules.NewArmsEvolution.InitPlayerUpgradeStatus(player_id)
            //初始化可用符文
            GameRules.RuneSystem.InitPlayerUpgradeStatus(player_id, 1, hUnit)
            //初始化神秘商店
            GameRules.MysticalShopSystem.InitPlayerUpgradeStatus(player_id);



            let vect = Vector(GameRules.MapChapter.MAP_CAMP.x, GameRules.MapChapter.MAP_CAMP.y, 128);
            hUnit.SetOrigin(vect)
            // 刷新完成之后发送至前端
        }
    }

    OnPlayerDisconnect(event: GameEventProvidedProperties & PlayerDisconnectEvent) {
        print("[OnPlayerDisconnect]");
        DeepPrintTable(event);
    }

    OnPlayerConnect(event: GameEventProvidedProperties & PlayerConnectEvent) {
        print("[OnPlayerDisconnect]");
        DeepPrintTable(event)
    }

    OnPlayerConnectFull(event: GameEventProvidedProperties & PlayerConnectFullEvent) {
        print("[OnPlayerDisconnect Full]");
        DeepPrintTable(event)
    }

    // OnPlayerGainedLevel(event: GameEventProvidedProperties & DotaPlayerGainedLevelEvent) {
    //     // DeepPrintTable(event)
    //     let hHero = EntIndexToHScript(event.hero_entindex) as CDOTA_BaseNPC_Hero;
    //     // hHero.SetAbilityPoints(0);

    // }
}

export function ReloadModules() {
    // @ts-expect-error @eslint-disable-next-line
    if (!GameRules.ModuleActivated) {
        return;
    }
    print("ReloadAllModules Reload");
    //根据游戏进程选择更新某些模块
    let State_Get = GameRules.State_Get();
    GameRules.CustomAttribute.Reload();
    if (State_Get == GameState.INIT) { //初始化阶段---无UI

    } else if (State_Get == GameState.WAIT_FOR_PLAYERS_TO_LOAD) { //加载阶段---无UI

    } else if (State_Get == GameState.CUSTOM_GAME_SETUP) { //游戏设置阶段---队伍选择UI

    } else if (State_Get == GameState.HERO_SELECTION) { //英雄选择阶段---英雄选择UI

    } else if (State_Get == GameState.STRATEGY_TIME) { //战略阶段---英雄选择UI

    } else if (State_Get == GameState.TEAM_SHOWCASE) { //队伍展示阶段---英雄选择UI

    } else if (State_Get == GameState.WAIT_FOR_MAP_TO_LOAD) { //地图加载阶段---无UI

    } else if (State_Get == GameState.PRE_GAME) { //赛前阶段---无UI

    } else if (State_Get == GameState.SCENARIO_SETUP) { //场景设置阶段---无UI

    } else if (State_Get == GameState.GAME_IN_PROGRESS) { //游戏开始阶段---游戏内UI

    } else if (State_Get == GameState.POST_GAME) { //推送结果阶段---游戏内UI

    } else if (State_Get == GameState.DISCONNECT) { //断开阶段---游戏内UI

    }

}