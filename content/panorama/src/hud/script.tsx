import 'panorama-polyfill-x/lib/console';
import 'panorama-polyfill-x/lib/timers';

import { render } from 'react-panorama-x';

import { MoveControll } from './component/move_control/move_control';
import { MessageContainer } from './component/message';
import { ResourceComponent } from './component/resource/resource';
import { CenterStatsContainer } from './component/center_stats/_center_stats';
import { ChapterSelect } from './component/chapter_select';


const HideOfficialLayoutUI = () => {
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_TOP_TIMEOFDAY, false);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_TOP_HEROES, false);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ACTION_PANEL, true);
    // 小地图
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ACTION_MINIMAP, false);
    // 击杀
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_KILLCAM, false);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_QUICK_STATS, false);
    // 官方经济相关面板
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_PANEL, true);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_SHOP, false);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_ITEMS, true);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_QUICKBUY, true);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_COURIER, false);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_AGHANIMS_STATUS, false);
}

const App = () => {

    return (
        <Panel
            className='root'
            hittest={false}
            onload={HideOfficialLayoutUI}
        >
            <CenterStatsContainer />
            <MoveControll />
            <MessageContainer />
            <ResourceComponent />

            <ChapterSelect />
        </Panel>
    )
};

render(<App />, $.GetContextPanel());


