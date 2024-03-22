import { reloadable } from '../utils/tstl-utils';
import { Filter } from './filter';
import { ArmsEvolution } from './ingame/hero_extend/arms_evolution';
import { BasicRules } from './ingame/basic_rules';
import { BuffManager } from './ingame/public/buff_manager';
import { CustomAttribute } from './ingame/hero_extend/custom_attribute';
import { CustomOverrideAbility } from './ingame/hero_extend/custom_override_ability';
import { EntityKilled } from './ingame/public/entity_killed';
import { Spawns } from './ingame/spawns';

declare global {

    interface CDOTAGameRules {
        // 声明所有的GameRules模块，这个主要是为了方便其他地方的引用（保证单例模式）
        ArmsEvolution: ArmsEvolution;

        BasicRules: BasicRules;
        BuffManager: BuffManager;

        CustomAttribute: CustomAttribute;
        CustomOverrideAbility: CustomOverrideAbility;

        EntityKilled: EntityKilled;

        Spawns:Spawns;

    }
}

@reloadable
export class GameEvent {

    constructor() {
        ListenToGameEvent("entity_killed", event => this.OnEntityKilled(event), this);
        ListenToGameEvent("game_rules_state_change", event => this.OnGameRulesStateChange(), this);
        ListenToGameEvent("dota_on_hero_finish_spawn", event => this.OnEntityDotaOnHeroFinishSpawn(event), this);
        // ListenToGameEvent("dota_player_gained_level", this.OnEntityDotaPlayerGainedLevel);
        ListenToGameEvent("player_disconnect", event => this.OnPlayerDisconnect(event), this)
        ListenToGameEvent("player_connect", event => this.OnPlayerConnect(event), this)
        ListenToGameEvent("player_connect_full", event => this.OnPlayerConnectFull(event), this)

    }

    OnGameRulesStateChange() {
        print("[OnGameRulesStateChange]:", GameRules.State_Get())
        let State_Get = GameRules.State_Get();
        if (State_Get == GameState.INIT) { //初始化阶段

        } else if (State_Get == GameState.WAIT_FOR_PLAYERS_TO_LOAD) { //加载阶段

        } else if (State_Get == GameState.CUSTOM_GAME_SETUP) { //游戏设置阶段
            GameRules.ArmsEvolution = new ArmsEvolution();
            GameRules.BasicRules = new BasicRules();
            GameRules.CustomAttribute = new CustomAttribute();
            GameRules.CustomOverrideAbility = new CustomOverrideAbility()
            GameRules.BuffManager = new BuffManager();
            GameRules.EntityKilled = new EntityKilled();
            GameRules.Spawns = new Spawns();
        } else if (State_Get == GameState.HERO_SELECTION) { //英雄选择阶段

        } else if (State_Get == GameState.STRATEGY_TIME) { //战略阶段

        } else if (State_Get == GameState.TEAM_SHOWCASE) { //队伍展示阶段

        } else if (State_Get == GameState.WAIT_FOR_MAP_TO_LOAD) { //地图加载阶段
            new Filter(); // 加载过滤器
            
        } else if (State_Get == GameState.PRE_GAME) { //赛前阶段

        } else if (State_Get == GameState.SCENARIO_SETUP) { //场景设置阶段

        } else if (State_Get == GameState.GAME_IN_PROGRESS) { //游戏开始阶段

        } else if (State_Get == GameState.POST_GAME) { //推送结果阶段

        } else if (State_Get == GameState.DISCONNECT) { //断开阶段

        }
    }

    OnEntityKilled(event: GameEventProvidedProperties & EntityKilledEvent) {
        GameRules.EntityKilled.GeneralKilledEvent(event.entindex_killed, event.entindex_attacker)
    }

    OnEntityDotaOnHeroFinishSpawn(event: GameEventProvidedProperties & DotaOnHeroFinishSpawnEvent) {
        let hUnit = EntIndexToHScript(event.heroindex as EntityIndex) as CDOTA_BaseNPC_Hero;
        if (hUnit.isSpawned != true) {
            // 英雄重新配置
            hUnit.isSpawned = true;
            GameRules.CustomAttribute.InitHeroAttribute(hUnit)
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
}