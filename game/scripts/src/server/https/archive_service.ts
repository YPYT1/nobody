import { HttpRequest } from "./http_request";


/**
 * 存档服务
 */
import { reloadable } from '../../utils/tstl-utils';

@reloadable 
export class ArchiveService {
    /**
     * 测试模式下使用的steam_id
     */
    player_is_debug = IsInToolsMode() ? false : false;
    //使用的steam_id
    debug_steam_id = [
        859509413,999992,999993,999994,999995,999997
    ];
    //整个游戏的game_id 用于API通信 在初始化的时候获取
    _game_id : string = null;
    //服务器时间
    _game_t : number = 9703764246;

    //构造
    constructor() {

    }

    Init() {
       
    }

    //创建游戏
    CreateGame() {  
        let param_data = <CreateGameParam>{
            steamids: []
        }
        let player_count = 6;
        let steam_id = PlayerResource.GetSteamAccountID(0);
        param_data.steamids.push(steam_id);
        HttpRequest.AM2Post(ACTION_CREATE_GAME ,
            {
                param : param_data 
            } ,
            (data: CreateGameReturn) => {
                if(data.code == 200){
                    this._game_id = data.data.game_id;
                    this._game_t = data.data.time;
                    for (let index = 0 as PlayerID; index < 1; index++) {
                        let steam_id = PlayerResource.GetSteamAccountID(index as PlayerID);
                    }
                    if(data.data.list[steam_id.toString()]){
                        
                    }
                }else{

                }
            },
            (code: number, body: string) => {

            }
        )
    }

    //验证激活码
    VerificationCode(player_id: PlayerID, code: string) {
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <VerificationCodeParam>{
            sid: steam_id.toString(),
            code: code,
        }
        HttpRequest.AM2Post(ACTION_VERIFICATION_CODE,
            {
                param: param_data
            },
            (data: VerificationCodeReturn) => {
                if (data.code == 200) {

                    if(data.data.inside == 1){
                        GameRules.ServiceInterface._game_activate = 1;
                        for (let index = 0 as PlayerID; index < GetPlayerCount(); index++) {
                            GameRules.ServiceInterface.GetGameActivate(index , {})
                        }
                    }else{
                        
                    }
                } else {
                }
            },
            (code: number, body: string) => {

            }
        )
    }
    /**
     * 确认难度
     * @param cmd 
     * @param args 
     * @param player_id 
     */
    ConfirmDifficulty(){
        print("==============提交确认难度================")
        let param_data = <ConfirmDifficultyParam>{
            gid: this._game_id,
            nd: parseInt(GameRules.MapChapter.GameDifficulty),
        }
        HttpRequest.AM2Post(ACTION_CONFIRM_DIFFICULTY,
            {
                param: param_data
            },
            (data: ConfirmDifficultyReturn) => {
                print("==============获得返回数据================")
                if (data.code == 200) {

                }
            },
            (code: number, body: string) => {
            }
        )
    }
    /**
     * 游戏结束
     * @param cmd 
     * @param args 
     * @param player_id 
     */
    GameOver(){
        print("==============游戏结束================")
        let param_data = <GameOverParam>{
            gid: this._game_id,
            state: 1,
        }
        HttpRequest.AM2Post(ACTION_GAME_OVER,
            {
                param: param_data
            },
            (data: GameOverReturn) => {
                print("==============获得返回数据================")
                if (data.code == 200) {

                }
            },
            (code: number, body: string) => {
            }
        )
    }
        


    
    /**
     * 添加装备到服务器
     * @param player_id 
     * @param equipdata
     */
    AddEquip(player_id : PlayerID , equipdata : ServerEquip[]){
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <AddEquipParam>{
            gid: this._game_id,
            sid: steam_id.toString(),
            equipdata : equipdata,
        }
        HttpRequest.AM2Post(ACTION_ADD_EQUIP,
            {
                param: param_data
            },
            (data: AddEquipReturn) => {
                print("==============获得返回数据================")
                if (data.code == 200) {
                    let equip_obj = data.data;
                    for (const key in equip_obj) {
                        GameRules.ServiceEquipment.player_equip_list[player_id][key] = GameRules.ServiceEquipment.EquipTEncode(equip_obj[key]);
                    }
                }
            },
            (code: number, body: string) => {
            }
        )
    }

    /**
     * 获取自身装备
     * @param player_id 
     * @param equipdata
     */
    GetEquip(player_id : PlayerID){
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <GetEquipParam>{
            gid: this._game_id,
            sid: steam_id.toString(),
            limit : 50 ,
        }
        HttpRequest.AM2Post(ACTION_GET_EQUIP,
            {
                param: param_data
            },
            (data: GetEquipReturn) => {
                print("==============获得返回数据================")
                if (data.code == 200) {
                    let equip_obj = data.data;
                    for (const key in equip_obj) {
                        GameRules.ServiceEquipment.player_equip_list[player_id][key] = GameRules.ServiceEquipment.EquipTEncode(equip_obj[key]);
                    }
                }
            },
            (code: number, body: string) => {


            }
        )
    }

    /**
     * 修改装备到服务器
     * @param player_id 
     * @param equipdata
     */
    UpdateEquip(player_id : PlayerID , equipdata : ServerEquip){
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <UpdateEquipParam>{
            gid: this._game_id,
            sid: steam_id.toString(),
            equipdata : equipdata,
        }
        HttpRequest.AM2Post(ACTION_UPDATE_EQUIP,
            {
                param: param_data
            },
            (data: UpdateEquipReturn) => {
                print("==============获得返回数据================")
                if (data.code == 200) {
                    GameRules.ServiceEquipment.player_equip_list[player_id][data.data.id] = GameRules.ServiceEquipment.EquipTEncode(data.data);
                }
            },  
            (code: number, body: string) => {
            }
        )
    }


    


    Debug( cmd: string, args: string[], player_id: PlayerID){
        //游戏结束提交数据
        if (cmd == "-CreateGame") {
            GameRules.ArchiveService.CreateGame()
        }
        if(cmd == "-VerificationCode"){
            GameRules.ArchiveService.VerificationCode(player_id , "code");
        }
        if(cmd == "!GE"){
            this.GetEquip(player_id)

        }
    }
    
}