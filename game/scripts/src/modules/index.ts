import { Debug } from './Debug';
import { GameConfig } from './GameConfig';
import { Development } from './development';
import { GameEvent } from './game_event';
import { MapChapter } from './map_chapter';
import { XNetTable } from './xnet-table';

import * as public_const from '../json/config/public_const.json';
import { ElementEffect } from './ingame/system/element_effect';
import { DamageSystem } from './ingame/system/damage_system';
import { CustomItem } from './ingame/system/custom_item';

declare global {
    interface CDOTAGameRules {
        // 声明所有的GameRules模块，这个主要是为了方便其他地方的引用（保证单例模式）
        GameEvent: GameEvent;
        XNetTable: XNetTable;
        Development: Development;
        MapChapter: MapChapter;
        ElementEffect: ElementEffect;
        DamageSystem: DamageSystem;
        Debug: Debug;
        CustomItem: CustomItem;
        /**常量 */
        PUBLIC_CONST: typeof public_const;
    }

    // interface CDOTA_BaseNPC {
    //     GetTalentKv<
    //         TIndex extends keyof typeof HeroTalentObject,
    //         T1 extends keyof typeof HeroTalentObject[TIndex]["AbilityValues"],
    //     >(index_key: TIndex, ability_key: T1): number
    // }
}

// @ts-expect-error @eslint-disable-next-line
GameRules.ModuleActivated = GameRules.ModuleActivated ?? false;

/**
 * 这个方法会在game_mode实体生成之后调用，且仅调用一次
 * 因此在这里作为单例模式使用
 **/
export function ActivateModules() {
    print('ActivateModules');
    //初始化常量
    GameRules.PUBLIC_CONST = public_const;
    GameRules.Debug = new Debug();
    // 初始化所有的GameRules模块
    GameRules.GameEvent = new GameEvent();
    GameRules.XNetTable = new XNetTable();
    GameRules.Development = new Development();
    GameRules.MapChapter = new MapChapter();
    GameRules.ElementEffect = new ElementEffect();
    GameRules.DamageSystem = new DamageSystem();
    GameRules.CustomItem = new CustomItem();
    // @ts-expect-error @eslint-disable-next-line
    GameRules.ModuleActivated = true;

    // 如果某个模块不需要在其他地方使用，那么直接在这里使用即可
    new GameConfig();
}
