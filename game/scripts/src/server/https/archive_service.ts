import { HttpRequest } from "./http_request";


/**
 * 存档服务
 */
import { reloadable } from '../../utils/tstl-utils';
import { UIEventRegisterClass } from "../../modules/class_extends/ui_event_register_class";
import  * as ServerItemList  from "../../json/config/server/item/server_item_list.json";
import { Development } from '../../modules/development/index';

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
    _game_t : number = 1;
    //服务器版本
    _game_versions : string = "";

    //获取背包数据class 
    _b_class : string = "21,22,28";
    //构造  
    constructor() {
        super("ArchiveService" , true)
    }

    //累抽数据

    

    Init() {
       
    }
    //创建游戏
    CreateGame() {
        let count = GetPlayerCount();
        let param_data = <CreateGameParam>{
            steamids: []
        }
        for (let index = 0 as PlayerID; index < count; index++) {
            let steam_id = PlayerResource.GetSteamAccountID(index);
            param_data.steamids.push(steam_id);
        }
        HttpRequest.AM2Post(ACTION_CREATE_GAME,
            {
                param : param_data 
            },
            (data: CreateGameReturn) => {
                if(data.code == 200){
                    this._game_id = data.data.game_id;
                    this._game_t = data.data.time;
                    this._game_versions = data.data.v;
                    for (let index = 0 as PlayerID; index < count; index++) {
                        let steam_id = PlayerResource.GetSteamAccountID(index as PlayerID);
                        GameRules.MapChapter.level_difficulty[index] = data.data.list[steam_id.toString()].level_difficulty;
                        //获取背包数据
                        GameRules.ArchiveService.GetCustomBackpack(index , this._b_class);
                        //获取图鉴数据
                        GameRules.ArchiveService.GetPictuerDataParam(index);
                        
                        //获取玩家地图经验 货币等..
                        GameRules.ServiceData.server_gold_package_list[index]["1001"].number = data.data.list[steam_id.toString()].cz_gold ?? 0;
                        GameRules.ServiceData.server_gold_package_list[index]["1002"].number = data.data.list[steam_id.toString()].jf_gold ?? 0;
                        GameRules.ServiceData.server_gold_package_list[index]["1003"].number = data.data.list[steam_id.toString()].jb_gold ?? 0;
                        GameRules.ServiceData.server_gold_package_list[index]["1004"].number = data.data.list[steam_id.toString()].exp ?? 0;
                        GameRules.ServiceData.server_gold_package_list[index]["1005"].number = data.data.list[steam_id.toString()].zs_gold ?? 0;
                        GameRules.ServiceInterface.GetPlayerServerGoldPackageData(index , {});
                        //玩家VIP信息
                        GameRules.ServiceData.player_vip_data[index].vip_times = data.data.list[steam_id.toString()].vip_times ?? 0;
                        GameRules.ServiceData.player_vip_data[index].vip_zs = data.data.list[steam_id.toString()].vip_zs ?? 0;
                        GameRules.ServiceInterface.GetPlayerVipData(index , {});
                        //加载技能数据
                        if(data.data.list[steam_id.toString()].skill_data && data.data.list[steam_id.toString()].skill_data != ""){
                            GameRules.ServiceInterface.PlayerServerSkillLevelExp[index] = 
                            JSON.decode(data.data.list[steam_id.toString()].skill_data) as {
                                [skill_key : string] : number
                            };
                            GameRules.ServiceInterface.LoadSkillfulLevel(index);
                        }else{
                            GameRules.ServiceInterface.LoadSkillfulLevelInit(index);
                        }

                        //加载魂石数据
                        if(data.data.list[steam_id.toString()].pa && data.data.list[steam_id.toString()].pa != ""){
                            GameRules.ServiceSoul.soul_list[index] = 
                            JSON.decode(data.data.list[steam_id.toString()].pa) as CGEDGetSoulList;
                            GameRules.ServiceSoul.GetPlayerServerSoulData(index , {});
                        }

                        //发送服务器时间
                        GameRules.ServiceInterface.GetServerTime( index  , {});
                        //
                        //获取累抽次数
                        GameRules.ServiceInterface.DrawRecord[index] = data.data.list[steam_id.toString()].draw_record;
                        GameRules.ServiceInterface.GetPlayerServerDrawLotteryDrawRecord(index , {});

                        //限购数据
                        GameRules.ServiceInterface.ShoppingLimit[index].limit = data.data.list[steam_id.toString()].limit;
                        GameRules.ServiceInterface.ShoppingLimit[index].sc = data.data.list[steam_id.toString()].sc;
                        //成长礼
                        GameRules.ServiceInterface.PassRecord[index] = data.data.list[steam_id.toString()].pass_record;
                        GameRules.ServiceInterface.GetPlayerServerPassRecord(index , {});
                        //发送限购数据
                        GameRules.ServiceInterface.GetPlayerShoppingLimit(index , {})
                        //地图经验
                        let player_map_level = GameRules.ServiceInterface.GetServerMapLevel(GameRules.ServiceData.server_gold_package_list[index]["1004"].number);
                        GameRules.ServiceInterface.player_map_level[index] = player_map_level;
                        
                        let talentdata = data.data.list[steam_id.toString()].talentdata;
                        //初始化天赋
                        GameRules.ServiceTalent.ServiceTalentInitByPlayerId(index , GameRules.ServiceInterface.player_map_level[index].level , talentdata);
                        
                    }
                    //0号玩家 的难度作为默认难度
                    GameRules.MapChapter.DifficultySelectInit(GameRules.MapChapter.level_difficulty[0]);

                    Timers.CreateTimer(2, () => {
                        //初始化完成
                        GameRules.MapChapter._game_select_phase = 0;

                        GameRules.MapChapter.GetGameSelectPhase(-1, {})
                        return null;
                    });
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
                        for (let index = 0 as PlayerID; index < GetPlayerCount(); index++) {
                            GameRules.ServiceInterface.GetGameActivate(index , {})
                        }
                    }
                } else {
                    for (let index = 0 as PlayerID; index < GetPlayerCount(); index++) {
                        GameRules.ServiceInterface.GetGameActivate(index , {})
                    }
                }
            },
            (code: number, body: string) => {
                for (let index = 0 as PlayerID; index < GetPlayerCount(); index++) {
                    GameRules.ServiceInterface.GetGameActivate(index , {})
                }
            }
        )
    }
    //验证激活码
    CheckjhmCode(player_id: PlayerID) {
        //只验证主机
        let param_data = <CreateGameParam>{
            steamids: []
        }
        let player_count = 6;
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        param_data.steamids.push(steam_id);
        HttpRequest.AM2Post(ACTION_CHECKJHM_CODE,
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
                    //获取玩家背包
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
        //技能经验获取
        let exp_list = GameRules.HeroAbilityType.GetAbilityTypeExp();

        let host_steam_id = PlayerResource.GetSteamAccountID(0);
        let param_data = <GameOverParam>{
            state: state,
            host_steam_id : host_steam_id,
            ext_items : {},
            skill_exp : {},
        }
        let player_count = GetPlayerCount();
        for (let p_id = 0 as PlayerID; p_id < player_count; p_id++) {
            //掉落卡片
            let player_steam_id = tostring(PlayerResource.GetSteamAccountID(p_id));
            param_data.ext_items[player_steam_id] = GameRules.Spawn.player_card_drop[p_id];
            //技能经验
            let skill_exp = CustomDeepCopy(GameRules.ServiceInterface.PlayerServerSkillLevelExp[p_id]) as {
                [skill_key: string]: number;
            };
            for (const e_k in exp_list[p_id]) {
                if(skill_exp.hasOwnProperty(e_k)){
                    skill_exp[e_k] += exp_list[p_id][e_k];
                }else{
                    skill_exp[e_k] = exp_list[p_id][e_k];
                }
            }
            param_data.skill_exp[player_steam_id] = JSON.encode(skill_exp);
        }
        HttpRequest.AM2Post(ACTION_GAME_OVER,
            {
                param: param_data
            },
            (data: GameOverReturn) => {
                print("==============获得返回数据================")
                if (data.code == 200) {
                    //胜负状态
                    this.general_game_over_data_pass_data.state = state;
                    //通关评分
                    this.general_game_over_data_pass_data.time = 515;

                    this.general_game_over_data_pass_data.game_count = GameRules.MapChapter.game_count;

                    this.general_game_over_data_pass_data.player_list_data = [];
                    
                    let player_count = GetPlayerCount();
                    
                    for (let index = 0 as PlayerID; index < player_count; index++) {
                        let steam_id = PlayerResource.GetSteamAccountID(index);
                        let steam_id_string = tostring(steam_id);
                        let PlayerPassItem : CGEDPlayerPassItem[] = [];
                        let player_exp : number = 0;
                        let CGEDPlayerSkillExp : CGEDPlayerSkillExp = {};
                        //获取掉落
                        if(data.data.list.hasOwnProperty(steam_id_string)){
                            let add_items = data.data.list[steam_id_string].add_items;
                            for (const add_item of add_items) {
                                let item_id = tostring(add_item.item_id);
                                if(item_id == "1004"){
                                    player_exp = add_item.number;
                                }else{
                                    let quality = ServerItemList[item_id as keyof typeof ServerItemList].quality;
                                    PlayerPassItem.push({
                                        "item_id" : tostring(add_item.item_id),
                                        "number" : add_item.number,
                                        "quality" : quality,
                                        "type" : 1,
                                    });
                                }
                            }
                            GameRules.ArchiveService.RedAndAddBackpack(index , [] , add_items);
                            // 构造老的技能经验数据
                            for (const e_l_k in exp_list[index]) {
                                if(exp_list[index][e_l_k] > 0){
                                    let skill_old_exp = GameRules.ServiceInterface.PlayerServerSkillLevelExp[index][e_l_k];
                                    let skill_exp = exp_list[index][e_l_k];
                                    CGEDPlayerSkillExp[e_l_k] = {
                                        "old_exp" : skill_old_exp,
                                        "exp" : skill_exp,
                                    }
                                }
                            }
                            //经验经验
                            GameRules.ServiceInterface.PlayerServerSkillLevelExp[index] = 
                                JSON.decode(data.data.list[steam_id_string].skill_exp) as {
                                    [skill_key: string]: number;
                                };
                            GameRules.ServiceInterface.LoadSkillfulLevel(index);
                        }
                        
                        this.general_game_over_data_pass_data.player_list_data.push({
                            "exp" : player_exp,
                            "is_mvp" : 1,
                            "old_exp" : 100,
                            "player_id" : index,
                            "steam_id" : steam_id,
                            "pass_item" : PlayerPassItem,
                            "skill_exp" : CGEDPlayerSkillExp,
                        })
                        //重新发送背包数据
                        GameRules.ServiceInterface.GetPlayerServerPackageData(index , {});
                        GameRules.ServiceInterface.GetPlayerServerGoldPackageData(index , {});

                        //难度问题
                        if(index == 0){
                            if(data.data.list[steam_id_string].level_difficulty != GameRules.MapChapter.level_difficulty[0]){
                                GameRules.MapChapter.DifficultySelectInit(data.data.list[steam_id_string].level_difficulty);
                            }
                        }
                        GameRules.MapChapter.level_difficulty[index] = data.data.list[steam_id_string].level_difficulty;
                    }
                }
                let player_count = 4;
                //发送给每个玩家数据
                for (let index = 0 as PlayerID; index < player_count; index++) {
                    GameRules.Spawn.player_card_drop[index] = {};
                    GameRules.ArchiveService.GetPlayerGameOverData(index , {})
                    // GameRules.MapChapter.GetDifficultyMax( index , {});
                }
                
                GameRules.NpcSystem.CreationNpc();
                //清理技能经验
                GameRules.HeroAbilityType.InitTypeExp();
            },
            (code: number, body: string) => {

            }
        )
    }

    /**
     * 游戏结束数据
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
                
            },
            player_id
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
            limit : 50,
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

            },
            player_id
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
                
            },
            player_id
        )
    }

    //配置装备
    EquipCfgModify(player_id: PlayerID , Equip_cfg_obj : CGEDEquipConfigInfo,) {
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        if(this.player_is_debug == true){
            steam_id = this.debug_steam_id[player_id];
        }
        let param_data = {
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
            },
            player_id
        )
    }

    //获取缓存
    PostLuaLog(player_id: PlayerID  , data_string : { [sid: string]: string; }) {
        let param_data = <GameLogParam>{
            data : data_string , 
        }
        // DeepPrintTable(param_data)
        HttpRequest.AM2Post(ACTION_LUA_LOG,
            {
                param: param_data
            },
            (data: GameLogReturn) => {
                // DeepPrintTable(data)
                print("日志已发送")
            },
            (code: number, body: string) => {
                // print("code" , code , "body" , body )
            },
            player_id
        )
    }

    //商城购买
    ShoppingBuy(player_id: PlayerID , shop_id : number , buy_count : number , buy_types : number = 1) {
        //只验证主机
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <ShoppingBuyParam>{
            sid : tostring(steam_id) , //steamid
            shop_id : shop_id , //商品id
            buy_count : buy_count , //购买数量
            buy_types : buy_types , // 支付方式 1 内部货币  //扫码支付 和充值统一
        }
        HttpRequest.AM2Post(ACTION_SHOPPING_BUY,
            {
                param: param_data
            },
            (data: ShoppingBuyReturn) => {
                if (data.code == 200) {
                    //先删除再添加 
                    let red_item = data.data.red_item;
                    let add_item = data.data.add_item;
                    let gold_data = data.data.base;
                    //Vip信息
                    GameRules.ArchiveService.PlayerVipUpdate(player_id , gold_data);
                    //货币信息
                    GameRules.ArchiveService.PlayerGoldUpdate(player_id , gold_data);
                    GameRules.ArchiveService.RedAndAddBackpack(player_id , red_item , add_item);
                    //限购数据
                    GameRules.ServiceInterface.ShoppingLimit[player_id].limit = data.data.limit;
                    // GameRules.ServiceInterface.ShoppingLimit[player_id].sc = data.data.limit.sc;
                    GameRules.ServiceInterface.GetPlayerShoppingLimit(player_id , {})
                    
                    GameRules.ServiceInterface.GetServerItemPopUp(player_id , add_item);
                } else {
                    GameRules.ServiceInterface.GetPlayerServerPackageData(player_id , {});
                    GameRules.ServiceInterface.GetPlayerServerGoldPackageData(player_id , {});
                }
                /**
                 * 通用关闭弹窗
                 */
                GameRules.ServiceInterface.PulbicLoadClose(player_id);
            },
            (code: number, body: string) => {
                GameRules.CMsg.SendErrorMsgToPlayer(player_id , "购买出错..")
                GameRules.ServiceInterface.GetPlayerServerPackageData(player_id , {});
                GameRules.ServiceInterface.GetPlayerServerGoldPackageData(player_id , {});
            },
            player_id
        )
    }
    /**
     * 获取对应类型背包数据
     * @param player_id 
     * @param shop_id 
     * @param buy_count 
     * @param buy_types 
     */
    GetCustomBackpack(player_id: PlayerID , aff_class : string) {
        //只验证主机
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <GetCustomBackpackParam>{
            sid : tostring(steam_id) , //steamid
            aff_class : aff_class ,
        }
        HttpRequest.AM2Post(ACTION_GET_CUSTOM_BACKPACK,
            {
                param: param_data
            },
            (data: GetCustomBackpackReturn) => {
                if (data.code == 200) {
                    //更新普通背包
                    GameRules.ServiceData.server_package_list[player_id] = data.data.list;
                    GameRules.ServiceInterface.GetPlayerServerPackageData(player_id , {});
                } else {
                    GameRules.ServiceData.server_package_list[player_id] = [];
                    GameRules.ServiceInterface.GetPlayerServerPackageData(player_id , {});
                }
            },
            (code: number, body: string) => {
                GameRules.ServiceData.server_package_list[player_id] = [];
                GameRules.ServiceInterface.GetPlayerServerPackageData(player_id , {});
            },
            player_id
        )
    }


    /**
     * 抽奖
     * @param player_id 
     * @param shop_id 
     * @param buy_count 
     * @param buy_types 
     */
    DrawLottery(player_id: PlayerID , type : number = 1 , count : number = 1) {
        //只验证主机
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <DrawLotteryParam>{
            sid : tostring(steam_id) , //steamid
            types : type ,
            number : count ,
        }
        HttpRequest.AM2Post(ACTION_DRAW_LOTTERY,
            {
                param: param_data
            },
            (data: DrawLotteryReturn) => {
                if (data.code == 200) {
                    let red_item = data.data.red_item;
                    let add_item = data.data.add_item;
                    GameRules.ArchiveService.RedAndAddBackpack(player_id , red_item , add_item);
                    GameRules.ServiceInterface.GetPlayerServerDrawLottery(player_id , data.data.draw_result);
                    //获取累抽次数
                    GameRules.ServiceInterface.DrawRecord[player_id] = data.data.draw_record;
                    GameRules.ServiceInterface.GetPlayerServerDrawLotteryDrawRecord(player_id , {});

                    DeepPrintTable(data);
                } else {

                }
            },
            (code: number, body: string) => {

            },
            player_id
        )
    }


    /**
     * 领取累抽奖励
     * @param player_id 
     * @param shop_id 
     * @param buy_count 
     * @param buy_types 
     */
    GetServerDrawAcc(player_id: PlayerID , type : number = 1 , count : number = 1) {
        //只验证主机
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <GetServerDrawAccParam>{
            sid : tostring(steam_id) , //steamid
            type : type ,
            count : count ,
        }
        HttpRequest.AM2Post(ACTION_GET_SERVER_DRAW_ACC,
            {
                param: param_data
            },
            (data: GetServerDrawAccReturn) => {
                if (data.code == 200) {
                    // let red_item = data.data.red_item;
                    let add_item = data.data.add_item;
                    GameRules.ArchiveService.RedAndAddBackpack(player_id , [] , add_item);
                    GameRules.ServiceInterface.GetServerItemPopUp(player_id , add_item);
                    //获取累抽次数
                    GameRules.ServiceInterface.DrawRecord[player_id] = data.data.draw_record;
                    GameRules.ServiceInterface.GetPlayerServerDrawLotteryDrawRecord(player_id , {});

                    DeepPrintTable(data);
                } else {

                }
            },
            (code: number, body: string) => {

            },
            player_id
        )
    }

    /**
     * 通行证领取
     * @param player_id 
     * @param shop_id 
     * @param buy_count 
     * @param buy_types 
     */
    GetServerPass(player_id: PlayerID , type : number = 1 , count : number = 1 , get_type : number = 1) {
        //只验证主机  AM2_Draw_Pass_Record
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <GetServerPassParam>{
            sid : tostring(steam_id) , //steamid
            type : type ,
            count : count ,
            get_type : get_type,
        }
        HttpRequest.AM2Post(ACTION_GET_SERVER_PASS,
            {
                param: param_data
            },
            (data: GetServerPassReturn) => {
                if (data.code == 200) {
                    // let red_item = data.data.red_item;
                    let add_item = data.data.add_item;
                    GameRules.ArchiveService.RedAndAddBackpack(player_id , [] , add_item);
                    GameRules.ServiceInterface.GetServerItemPopUp(player_id , add_item);
                    //
                    GameRules.ServiceInterface.PassRecord[player_id] = data.data.pass_record;
                    GameRules.ServiceInterface.GetPlayerServerPassRecord(player_id , {});
                } else {

                }
            },
            (code: number, body: string) => {

            },
            player_id
        )
    }

    /**
     * 获取图鉴
     * @param player_id 
     * @param shop_id 
     * @param buy_count 
     * @param buy_types 
     */
    GetPictuerDataParam(player_id: PlayerID) {
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <SkillDataUpParam>{
            sid : tostring(steam_id) , //steamid
        }
        HttpRequest.AM2Post(ACTION_GET_PICTUER_DATA,
            {
                param: param_data
            },
            (data: GetPictuerDataReturn) => {
                if (data.code == 200) {
                    //更新图鉴数据
                    GameRules.ServiceData.server_monster_package_list[player_id] = data.data.list;

                    if(data.data.pictuer.pictuer_data && data.data.pictuer.pictuer_data != ""){
                        GameRules.ServiceData.server_pictuer_fetter_list[player_id] = JSON.decode(data.data.pictuer.pictuer_data) as ServerPlayerConfigPictuerFetter;
                    }
                    
                    GameRules.ServiceInterface.GetPlayerCardList(player_id , {});

                    //配置数据
                    if(data.data.pictuer.pictuer_config && data.data.pictuer.pictuer_config != ""){
                        GameRules.ServiceData.server_player_config_pictuer_fetter[player_id] = 
                          JSON.decode(data.data.pictuer.pictuer_config) as string[][];
                        GameRules.ServiceData.locality_player_config_pictuer_fetter[player_id] = 
                            JSON.decode(data.data.pictuer.pictuer_config) as string[][];
                    }
                    GameRules.ServiceInterface.GetConfigPictuerFetter(player_id , {});

                    
                } else {

                }
            },
            (code: number, body: string) => {

            },
            player_id
        )
    }

    /**
     * 图鉴保存等功能
     * @param player_id 
     * @param pictuer_data 
     * @param pictuer_config 
     * @param red_item_str 
     * @param type 
     */ 
    PictuerSave(player_id: PlayerID , 
        pictuer_data : string , 
        pictuer_config : string , 
        red_item_str : string , 
        check_data ? : {count : number , index : number},
        type : number = 1,
    ) {
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <PictuerSaveParam>{
            sid : tostring(steam_id) , //steamid
            pictuer_data : pictuer_data,
            pictuer_config : pictuer_config,
            red_item_str : red_item_str,
        }
        HttpRequest.AM2Post(ACTION_PICTUER_SAVE,
            {
                param: param_data
            },
            (data: PictuerSaveReturn) => {
                if (data.code == 200) {
                    //扣除物品 保存至服务器
                    if(check_data){
                        if(check_data.count == 1){
                            delete GameRules.ServiceData.server_monster_package_list[player_id][check_data.index];
                            GameRules.ServiceData.server_monster_package_list[player_id].splice(check_data.index , 1)
                        }else{
                            GameRules.ServiceData.server_monster_package_list[player_id][check_data.index].number -- ;
                        }
                    }
                    if(data.data.pictuer.pictuer_data && data.data.pictuer.pictuer_data != ""){
                        let d : ServerPlayerConfigPictuerFetter = JSON.decode(data.data.pictuer.pictuer_data) as any;
                        GameRules.ServiceData.server_pictuer_fetter_list[player_id] =  d;
                    }
                    GameRules.ServiceInterface.GetPlayerCardList(player_id , {});

                    //配置数据
                    if(pictuer_config && data.data.pictuer.pictuer_config && data.data.pictuer.pictuer_config != ""){
                        GameRules.ServiceData.server_player_config_pictuer_fetter[player_id] = 
                        JSON.decode(data.data.pictuer.pictuer_config) as string[][];
                        GameRules.ServiceData.locality_player_config_pictuer_fetter[player_id] = 
                        JSON.decode(data.data.pictuer.pictuer_config) as string[][];
                    }
                    GameRules.ServiceInterface.GetConfigPictuerFetter(player_id , {});

                    if(type == 1){
                        GameRules.CMsg.SendErrorMsgToPlayer(player_id, "图鉴:激活成功");
                    }else if(type == 2){
                        GameRules.CMsg.SendErrorMsgToPlayer(player_id, "图鉴:保存成功");
                    }
                } else {

                }
            },
            (code: number, body: string) => {

            },
            player_id
        )
    }

    /**
     * 存档技能升级
     * @param player_id 
     * @param shop_id 
     * @param buy_count 
     * @param buy_types 
     */
    SkillDataUp(player_id: PlayerID , skill_data : string , red_item_str : string  , zz_exp : number, skill_key : string) {
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <SkillDataUpParam>{
            sid : tostring(steam_id) , //steamid
            skill_data : skill_data ,
            red_item_str : red_item_str,
        }
        HttpRequest.AM2Post(ACTION_SKILL_DATA_UP,
            {
                param: param_data
            },
            (data: SkillDataUpReturn) => {
                if (data.code == 200) {
                    //先删除再添加
                    let red_item = data.data.red_item;
                    GameRules.ArchiveService.RedAndAddBackpack(player_id , red_item , []);
                    //更新存档技能数据
                    GameRules.ServiceInterface.PlayerServerSkillLevelExp[player_id] = 
                        JSON.decode(data.data.skill_data) as {
                            [skill_key : string] : number
                        };
                    GameRules.ServiceInterface.GenerateSkillLevel(player_id, skill_key , zz_exp);
                    GameRules.ServiceInterface.GenerateSkillTypeLevel(player_id , skill_key );
                    
                    print("fasong...")
                    GameRules.ServiceInterface.GetPlayerServerSkillData(player_id , {});
                } else {
                }
            },
            (code: number, body: string) => {

            },
            player_id
        )
    }

    /**
     * 魂石保存等功能
     * @param player_id 
     * @param pictuer_data 
     * @param pictuer_config 
     * @param red_item_str 
     * @param type 
     */ 
    PlayerSoulStoneSave(player_id: PlayerID , 
        pa_data : string , 
        red_item_str : string , 
        type : number = 1,
        add_item_str ? : string , 
        up_num : number = 0,
    ) {
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <PlayerSoulStoneSaveParam>{
            sid : tostring(steam_id) , //steamid
            pa : pa_data,
            red_item_str : red_item_str,
            add_item_str : add_item_str,
            
        }
        HttpRequest.AM2Post(ACTION_PLAYER_SOUL_STONE_SAVE,
            {
                param: param_data
            },
            (data: PlayerSoulStoneSaveReturn) => {
                if (data.code == 200) {
                    //扣除物品 保存至服务器
                    GameRules.ServiceSoul.soul_list[player_id] = JSON.decode(data.data.pa) as CGEDGetSoulList;
                    //更新魂石数据
                    GameRules.ServiceSoul.GetPlayerServerSoulData( player_id , {})
                    //更新背包数据
                    let red_item = data.data.red_item;
                    let add_item = data.data.add_item;
                    GameRules.ArchiveService.RedAndAddBackpack(player_id , red_item , add_item);
                    
                    if(type == 1){
                        GameRules.CMsg.SendErrorMsgToPlayer(player_id, "魂石:镶嵌成功");
                    }else if(type == 2){
                        if(up_num != 0){
                            GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:升级成功:+" + up_num)
                        }else{
                            GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:升级失败!")
                        }
                    }else if(type == 3){
                        if(up_num != 0){
                            GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:降级成功:-" + up_num)
                        }else{
                            GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:降级失败!")
                        }
                    }else if(type == 4){
                        if(add_item != null && add_item.length > 0){
                            GameRules.ServiceInterface.GetServerItemPopUp(player_id , add_item);
                        }
                    }
                    
                } else {

                }
            },
            (code: number, body: string) => {

            },
            player_id
        )
    }

    /**
     * 天赋保存等功能
     * @param player_id 
     * @param talentdata 
     */ 
    PlayerTalentSave(player_id: PlayerID , 
        talentdata : string , 
    ) {
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <PlayerTalentSaveParam>{
            sid : tostring(steam_id) , //steamid
            talentdata : talentdata,
            
        }
        HttpRequest.AM2Post(ACTION_PLAYER_TALENT_SAVE,
            {
                param: param_data
            },
            (data: PlayerTalentSaveReturn) => {
                if (data.code == 200) {
                    GameRules.ServiceTalent.player_server_talent_list[player_id] = JSON.decode( data.data.talentdata) as {
                        [hero_id: number]: CGEDGetTalentListInfo[];
                    }
                    GameRules.ServiceTalent.GetPlayerServerTalent(player_id, {});
                } else {

                }
            },
            (code: number, body: string) => {

            },
            player_id
        )
    }

    /**
     * 公共更新背包内容
     * @param player_id 
     * @param red_item 
     * @param add_item 
     */
    RedAndAddBackpack( player_id :PlayerID , red_item : AM2_Server_Backpack[] , add_item : AM2_Server_Backpack[]){
        //先删除再添加
        if(red_item){
            for (const r_e of red_item) {
                GameRules.ServiceData.DeletePackageItemSelect(player_id , r_e.item_id , r_e.number , r_e.id);
            }
        }
        
        //循环根据类型添加到不同的地方
        if(add_item){
            for (const a_e of add_item) {
                let customs = "";
                if(a_e.customs){
                    customs = a_e.customs;
                }
                GameRules.ServiceData.AddPackageItemSelect(player_id , a_e.id ,  a_e.item_id , customs , a_e.number )
            }
        }
        GameRules.ServiceInterface.GetPlayerServerPackageData(player_id , {});
        GameRules.ServiceInterface.GetPlayerServerGoldPackageData(player_id , {});
        GameRules.ServiceInterface.GetPlayerCardList(player_id , {});
    }
    /**
     * 公共更新vip信息
     * @param cmd 
     * @param args 
     * @param player_id 
     */
    PlayerVipUpdate(player_id :PlayerID , data : ServerPlayerVipData){
        //获取玩家地图经验 货币等..
        // GameRules.ServiceData.server_gold_package_list[player_id]["1001"].number = data.cz_gold ?? 0;
        // GameRules.ServiceData.server_gold_package_list[player_id]["1002"].number = data.jf_gold ?? 0;
        // GameRules.ServiceData.server_gold_package_list[player_id]["1003"].number = data.jb_gold ?? 0;
        // GameRules.ServiceData.server_gold_package_list[player_id]["1004"].number = data.exp ?? 0;
        // GameRules.ServiceData.server_gold_package_list[player_id]["1005"].number = data.zs_gold ?? 0;
        // GameRules.ServiceInterface.GetPlayerServerGoldPackageData(player_id , {});
        //玩家VIP信息
        GameRules.ServiceData.player_vip_data[player_id].vip_times = data.vip_times ?? 0;
        GameRules.ServiceData.player_vip_data[player_id].vip_zs = data.vip_zs ?? 0;
        GameRules.ServiceInterface.GetPlayerVipData(player_id , {});
    }


    /**
     * 公共更新货币信息
     * @param cmd 
     * @param args 
     * @param player_id 
     */
    PlayerGoldUpdate(player_id :PlayerID , data : PlayerInfoData){
        //更新经验相关的数据 必须优先更新
        GameRules.ServiceInterface.MapExpUpdate(player_id , data.exp);
        //获取玩家地图经验 货币等..
        GameRules.ServiceData.server_gold_package_list[player_id]["1001"].number = data.cz_gold ?? 0;
        GameRules.ServiceData.server_gold_package_list[player_id]["1002"].number = data.jf_gold ?? 0;
        GameRules.ServiceData.server_gold_package_list[player_id]["1003"].number = data.jb_gold ?? 0;
        GameRules.ServiceData.server_gold_package_list[player_id]["1004"].number = data.exp ?? 0;
        GameRules.ServiceData.server_gold_package_list[player_id]["1005"].number = data.zs_gold ?? 0;
        GameRules.ServiceInterface.GetPlayerServerGoldPackageData(player_id , {});
        
        //玩家VIP信息
        // GameRules.ServiceData.player_vip_data[player_id].vip_times = data.vip_times ?? 0;
        // GameRules.ServiceData.player_vip_data[player_id].vip_zs = data.vip_zs ?? 0;
        // GameRules.ServiceInterface.GetPlayerVipData(player_id , {});
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
        if(cmd == "!gm"){
            let shop_id = args[0] ?? "1";
            this.ShoppingBuy(player_id , tonumber(shop_id) , 1 )
        }
        if(cmd == "!gp"){
            let aff_class = args[0] ?? "21,2,22";
            this.GetCustomBackpack(player_id , aff_class)
        }
        if(cmd == "!dl"){
            this.DrawLottery(player_id)
        }
        if(cmd == "!GetServerDrawAcc"){
            this.GetServerDrawAcc(player_id , 1 , -1);
        }
        if(cmd == "!GetServerPass"){
            this.GetServerPass(player_id , 1 , 20 , 1)
        }
        if(cmd == "!GetPlayerGameOverData"){
            this.GetPlayerGameOverData(player_id , {});
        }
        
    }
    
}