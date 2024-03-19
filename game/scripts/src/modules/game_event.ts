import { reloadable } from '../utils/tstl-utils';
import { Filter } from './filter';
import { BuffManager } from './ingame/buff_manager';
import { EntityKilled } from './ingame/entity_killed';

@reloadable
export class GameEvent {

    constructor() {
        ListenToGameEvent("entity_killed", event => this.OnEntityKilled(event), this);
        ListenToGameEvent("game_rules_state_change", event => this.OnGameRulesStateChange(), this);
        ListenToGameEvent("dota_on_hero_finish_spawn", event => this.OnEntityDotaOnHeroFinishSpawn(event), this);
        // ListenToGameEvent("dota_player_gained_level", this.OnEntityDotaPlayerGainedLevel);
        ListenToGameEvent("player_disconnect", event => this.OnPlayerDisconnect(event), this)
        ListenToGameEvent("player_connect", event => this.OnPlayerConnect(event), this)
    }

    OnGameRulesStateChange() {
        print("[OnGameRulesStateChange]:", GameRules.State_Get())
        let State_Get = GameRules.State_Get();
        if (State_Get == GameState.INIT) { //初始化阶段---无UI

        } else if (State_Get == GameState.WAIT_FOR_PLAYERS_TO_LOAD) { //加载阶段---无UI
    
        } else if (State_Get == GameState.CUSTOM_GAME_SETUP) { //游戏设置阶段---队伍选择UI
    
        } else if (State_Get == GameState.HERO_SELECTION) { //英雄选择阶段---英雄选择UI

        } else if (State_Get == GameState.STRATEGY_TIME) { //战略阶段---英雄选择UI
    
        } else if (State_Get == GameState.TEAM_SHOWCASE) { //队伍展示阶段---英雄选择UI
    
        } else if (State_Get == GameState.WAIT_FOR_MAP_TO_LOAD) { //地图加载阶段---无UI
            new Filter(); // 加载过滤器
            GameRules.BuffManager = new BuffManager();
            // GameRules.MapChapter.InitChapterMap()
        } else if (State_Get == GameState.PRE_GAME) { //赛前阶段---无UI
    
        } else if (State_Get == GameState.SCENARIO_SETUP) { //场景设置阶段---无UI
    
        } else if (State_Get == GameState.GAME_IN_PROGRESS) { //游戏开始阶段---游戏内UI
            GameRules.EntityKilled = new EntityKilled();
        } else if (State_Get == GameState.POST_GAME) { //推送结果阶段---游戏内UI
    
        } else if (State_Get == GameState.DISCONNECT) { //断开阶段---游戏内UI
    
        }
    }

    OnEntityKilled(event: GameEventProvidedProperties & EntityKilledEvent) {
        GameRules.EntityKilled.GeneralKilledEvent(event.entindex_killed,event.entindex_attacker)
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

    }

    OnPlayerConnect(event: GameEventProvidedProperties & PlayerConnectEvent) {

    }
}