import { SetStoreItemPanel } from '../../components/store_item/store_item';
import { LoadCustomComponent } from '../_components/component_manager';
import { DASHBOARD_NAVBAR } from '../components';

const ServerShopList = GameUI.CustomUIConfig().KvData.server_shop_list;

const DASHBOARD = 'store';
const SUB_OBJECT = DASHBOARD_NAVBAR[DASHBOARD].Sub;
const NavButtonList = $('#NavButtonList');
const ContentFrame = $('#ContentFrame');
const FRAME_PATH = `file://{resources}/layout/custom_game/dashboard/${DASHBOARD}/`;

const CurrencyList = $('#CurrencyList');

const ChapterBpRouteBtn = $('#ChapterBpRouteBtn');
/**
 * 1001,1002,1003,1004,1005,1006,1007,1008
 */
/** 顶部显示的货币列表 */
const Show_Top_Currency = [1001, 1003, 1005];

export function Init() {
    InitNavMenu();
}

function InitNavMenu() {
    $.GetContextPanel().SetPanelEvent('onactivate', () => {});
    NavButtonList.RemoveAndDeleteChildren();
    ContentFrame.RemoveAndDeleteChildren();
    let order = 0;
    for (const sub_key in SUB_OBJECT) {
        const sub_state = SUB_OBJECT[sub_key as keyof typeof SUB_OBJECT];
        if (sub_state) {
            const radiobtn_id = `${DASHBOARD}_${sub_key}`;
            const NavRadioBtn = $.CreatePanel('RadioButton', NavButtonList, radiobtn_id);
            NavRadioBtn.BLoadLayoutSnippet('NavRadioButton');
            NavRadioBtn.SetDialogVariable('button_txt', $.Localize('#custom_dashboard_nav_' + radiobtn_id));
            NavRadioBtn.checked = order == 0;

            NavRadioBtn.SetPanelEvent('onselect', () => {
                for (const nav_key of Object.keys(SUB_OBJECT)) {
                    ContentFrame.SetHasClass(nav_key, nav_key == sub_key);
                }
            });

            const NavContent = $.CreatePanel('Panel', ContentFrame, radiobtn_id, {
                hittest: false,
            });
            const nav_path = `${FRAME_PATH}/${sub_key}/index.xml`;
            NavContent.BLoadLayout(nav_path, true, false);
            ContentFrame.SetHasClass(sub_key, order == 0);
            order++;
        }
    }

    // 货币列表
    CurrencyList.RemoveAndDeleteChildren();
    for (const currency_id of Show_Top_Currency) {
        const ServerCurrency = $.CreatePanel('Panel', CurrencyList, '' + currency_id);
        ServerCurrency.BLoadLayoutSnippet('ServerCurrency');
        ServerCurrency.SetDialogVariableInt('currency_count', 0);
        const _CurrencyIcon = ServerCurrency.FindChildTraverse('CurrencyIcon')!;
        const CurrencyIcon = LoadCustomComponent(_CurrencyIcon, 'server_item');
        CurrencyIcon._SetServerItemInfo({ item_id: currency_id, show_count: false, hide_bg: true, show_tips: true });
    }

    GameEvents.Subscribe('ServiceInterface_GetPlayerServerGoldPackageData', event => {
        const data = event.data;
        const ItemList = Object.values(data);

        const currency_object: { [item: string]: number } = {};
        for (const _data of ItemList) {
            const item_id = _data.item_id;
            const item_count = _data.number;
            const ServerCurrency = CurrencyList.FindChildTraverse(`${item_id}`);
            currency_object[item_id] = item_count;
            if (ServerCurrency == null) {
                continue;
            }
            ServerCurrency.SetDialogVariableInt('currency_count', item_count);
        }

        GameUI.CustomUIConfig().setStorage('currency_count', currency_object);
    });

    GameEvents.Subscribe('ServiceInterface_GetPlayerShoppingLimit', event => {
        const limit = event.data.limit;
        // $.Msg(["limit",limit])
        const limit_data: AM2_Server_Shopping_Limit_List = {};
        const today_time = GameUI.CustomUIConfig().getStorage('today_time')!;
        // $.Msg(["today_time",today_time])
        for (const goods_id in limit) {
            const data = limit[goods_id];
            const shop_data = ServerShopList[('' + goods_id) as keyof typeof ServerShopList];
            const limitdata = shop_data.purchase_limitation_time.split('_');
            let limit_time = 0; //限购时长
            // $.Msg(["limitdata[0]",limitdata[0]])
            if (limitdata[0] == 'XG') {
                limit_time = 99999999999;
            } else if (limitdata[0] == 'D') {
                //天
                limit_time = 1 * 60 * 60 * 24 - 1; //
            } else if (limitdata[0] == 'W') {
                //周
                limit_time = 1 * 60 * 60 * 24 * 7 - 1; //
            } else {
                //没有配置
            }
            //购买时间转成当天时间 这里时区概念 需要补时间
            const today_str = new Date((data.t + 28800) * 1000).toISOString().split('T')[0];
            const myDate = new Date(today_str);
            const today_time_unix = Math.floor(myDate.getTime() / 1000) - 28800;
            if (today_time > today_time_unix + limit_time) {
                //时间过期 重置时间和购买数量
                data.c = 0;
            }
        }
        GameUI.CustomUIConfig().setStorage('shoping_limit', limit);
        GameUI.CustomUIConfig().ServerEventBus.publish('shoping_limit_update', limit);
    });

    // 获取存档货币
    GameUI.CustomUIConfig().SendCustomEvent('ServiceInterface', 'GetPlayerServerGoldPackageData', {});
    GameUI.CustomUIConfig().SendCustomEvent('ServiceInterface', 'GetPlayerVipData', {});
    // 每日限购
    $.Schedule(0.1, () => {
        GameUI.CustomUIConfig().SendCustomEvent('ServiceInterface', 'GetPlayerShoppingLimit', {});
    });

    ChapterBpRouteBtn.SetPanelEvent('onactivate', () => {
        GameUI.CustomUIConfig().DashboardRoute('event', 'bp');
    });
}

(() => {
    // $.Msg([" "])
    GameUI.CustomUIConfig().ServerEventBus.clear('shoping_limit_update');
    Init();
})();
