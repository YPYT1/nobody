/**
 *  服务接口
 */
import { UIEventRegisterClass } from '../../modules/class_extends/ui_event_register_class';
import { reloadable } from '../../utils/tstl-utils';

@reloadable
export class ServiceInterface extends UIEventRegisterClass{
    
    constructor() {
        super("ServiceInterface")
    }
    //游戏激活状态
    _game_activate = 0;

    //获取游戏是否激活
    GetGameActivate(player_id: PlayerID, params: any, callback?) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetGameActivate",
            {
                data: {
                    Activate: GameRules.ServiceInterface._game_activate
                }
            }
        );
    }
    //激活游戏
    PlyaerGameActivate(player_id: PlayerID, params: any, callback?) {
        let key:string = params.key;
        GameRules.ArchiveService.VerificationCode(player_id, key);
    }
    
}