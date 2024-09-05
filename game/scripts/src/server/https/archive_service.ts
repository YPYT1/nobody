import { HttpRequest } from "./http_request";


/**
 * 存档服务
 */
import { reloadable } from '../../utils/tstl-utils';
import { UIEventRegisterClass } from "../../modules/class_extends/ui_event_register_class";

@reloadable 
export class ArchiveService extends UIEventRegisterClass {
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
    //服务器版本
    _game_versions : string = "";
    //构造
    constructor() {
        super("ArchiveService")
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
        HttpRequest.AM2Post(ACTION_CREATE_GAME,
            {
                param : param_data 
            },
            (data: CreateGameReturn) => {
                if(data.code == 200){
                    this._game_id = data.data.game_id;
                    this._game_t = data.data.time;
                    this._game_versions = data.data.v;
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
    GameOver( state : number , exp : number[] = [] ,cj : string[] = [], hero : string []  = [], is_endless : number = -1 , is_nianshou : number = -1){
        print("==============游戏结束================");
        let param_data = <GameOverParam>{
            state: 1,
        }
        let steam_id = PlayerResource.GetSteamAccountID(0);

        HttpRequest.AM2Post(ACTION_GAME_OVER,
            {
                param: param_data
            },
            (data: GameOverReturn) => {
                print("==============获得返回数据================")
                DeepPrintTable(data);
                if (data.code == 200) {
                    //胜负状态
                    this.general_game_over_data_pass_data.state = state;
                    //通关评分
                    this.general_game_over_data_pass_data.time = 515;

                    this.general_game_over_data_pass_data.game_count = GameRules.MapChapter.game_count;
                    //
                    for (let index = 0; index < 4; index++) {
                        this.general_game_over_data_pass_data.player_list_data.push({
                            "exp" : 200,
                            "is_mvp" : 1,
                            "old_exp" : 100,
                            "player_id" : 0,
                            "steam_id" : steam_id,
                            "pass_item" : [
                                {
                                    "item_id" : "1",
                                    "item_number" : 100,
                                    "quality" : 3,
                                    "type" : 1,
                                },
                                {
                                    "item_id" : "2",
                                    "item_number" : 12,
                                    "quality" : 1,
                                    "type" : 1,
                                },
                                {
                                    "item_id" : "3",
                                    "item_number" : 1,
                                    "quality" : 2,
                                    "type" : 1,
                                },
                                {
                                    "item_id" : "4",
                                    "item_number" : 5,
                                    "quality" : 4,
                                    "type" : 1,
                                }
                            ],
                            "skill_exp" : [
                                {
                                    "1" : {
                                        "exp" : 123,
                                        "old_exp" : 23423,
                                    },
                                    "2" : {
                                        "exp" : 324,
                                        "old_exp" : 4234,
                                    },
                                    "3" : {
                                        "exp" : 20,
                                        "old_exp" : 53451,
                                    },
                                    "4" : {
                                        "exp" : 20,
                                        "old_exp" : 225432,
                                    },
                                }
                            ]
                        })
                        
                    }
                }
                let player_count = 6;
                //发送给每个玩家数据
                for (let index = 0 as PlayerID; index < player_count; index++) {
                    GameRules.ArchiveService.GetPlayerGameOverData(index , {})
                }
                GameRules.NpcSystem.CreationNpc();
            },
            (code: number, body: string) => {

            }
        )
    }

    /**
     * 获取天赋选择列表
     */
    GetPlayerGameOverData(player_id: PlayerID, params: CGED["ArchiveService"]["GetPlayerGameOverData"], callback?) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ArchiveService_GetPlayerGameOverData",
            {
                data: this.general_game_over_data_pass_data
            }
        );
    }
        
    /**
     * 玩家存档信息
     */
    //通关信息
    general_game_over_data_pass_data : CGEDGeneralGameOverDataPassData = {
        state : 0,
        time : 0,
        game_count : 0 ,
        player_list_data : [],
    };


    
    /**
     * 添加装备到服务器
     * @param player_id 
     * @param equipdata
     */
    AddEquip(player_id : PlayerID , equipdata : ServerEquip[]){
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <AddEquipParam>{
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
    UpdateEquip(player_id : PlayerID , equipdatalist : { [equip_id : string] : ServerEquip} , red_list : string = ""){
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <UpdateEquipParam>{
            sid: steam_id.toString(),
            equipdatalist : equipdatalist,
        }
        HttpRequest.AM2Post(ACTION_UPDATE_EQUIP,
            {
                param: param_data
            },
            (data: UpdateEquipReturn) => {
                print("==============获得返回数据================")
                if (data.code == 200) {
                    for (const key in data.data) {
                        let equipdata = data.data[key];
                        GameRules.ServiceEquipment.player_equip_list[player_id][equipdata.id] = GameRules.ServiceEquipment.EquipTEncode(equipdata);
                    }
                }
            },  
            (code: number, body: string) => {
            }
        )
    }

    //配置装备
    EquipCfgModify(player_id: PlayerID , Equip_cfg_obj : CGEDEquipConfigInfo,) {
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        if(this.player_is_debug == true){
            steam_id = this.debug_steam_id[player_id];
        }
        let param_data = {
            gid: this._game_id,
            sid : steam_id.toString(),
            Equip_cfg : JSON.encode(Equip_cfg_obj),
        }
        HttpRequest.AM2Post(ACTION_EQUIP_CFG_MODIFY,
            {
                param: param_data
            },
            (data: any) => {
                if(data.code == 1){
                    GameRules.ServiceEquipment.server_player_equip_config[player_id] = CustomDeepCopy(Equip_cfg_obj) as CGEDEquipConfigInfo;
                }else{
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id , "配置装备: 未知错误")
                }
                GameRules.ServiceEquipment.GetEquipConfig(player_id , {})
            },      
            (code: number, body: string) => {
                print("code : " ,code)
                print("body : " ,body) 
                GameRules.CMsg.SendErrorMsgToPlayer(player_id , "配置装备: 未知错误")
                GameRules.ServiceEquipment.GetEquipConfig(player_id , {})
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