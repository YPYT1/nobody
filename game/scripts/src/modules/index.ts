import { Debug } from './Debug';
import { GameConfig } from './GameConfig';
import { Development } from './development';
import { GameEvent } from './game_event';
import { CMsg } from './ingame/public/cmsg';
import { MapChapter } from './map_chapter';
import { XNetTable } from './xnet-table';

declare global {

    interface CDOTAGameRules {
        // 声明所有的GameRules模块，这个主要是为了方便其他地方的引用（保证单例模式）
        GameEvent: GameEvent;
        XNetTable: XNetTable;
        Development: Development;
        MapChapter: MapChapter;
        CMsg:CMsg;
    }
}

/**
 * 这个方法会在game_mode实体生成之后调用，且仅调用一次
 * 因此在这里作为单例模式使用
 **/
export function ActivateModules() {
    print("ActivateModules");
    // 初始化所有的GameRules模块
    GameRules.GameEvent = new GameEvent();
    GameRules.XNetTable = new XNetTable();
    GameRules.Development = new Development();
    GameRules.MapChapter = new MapChapter()
    GameRules.CMsg = new CMsg();
    // 如果某个模块不需要在其他地方使用，那么直接在这里使用即可
    new GameConfig();
    // 初始化测试模块xD
    new Debug();

}
