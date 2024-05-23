/**
 * 存档数据
 */
import { reloadable } from '../../utils/tstl-utils';

@reloadable
export class ServiceData {
    
    //整个游戏的game_id 用于API通信 在初始化的时候获取
    _game_id : string = null
    //服务器时间
    _game_t : number = 9703764246
    
}