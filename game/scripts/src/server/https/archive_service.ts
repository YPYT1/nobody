import { HttpRequest } from "./http_request";


/**
 * 存档服务
 */
import { reloadable } from '../../utils/tstl-utils';
import { UIEventRegisterClass } from "../../modules/class_extends/ui_event_register_class";
import  * as ServerItemList  from "../../json/config/server/item/server_item_list.json";

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
    //构造  
    constructor() {
        super("ArchiveService" , true)
    }

    Init() {
       
    }
    //创建游戏
    CreateGame() {
        let count = GetPlayerCount();
        let param_data = <CreateGameParam>{
            steamids: []
        }
        for (let index = 0; index < count; index++) {
            let steam_id = PlayerResource.GetSteamAccountID(0);
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
                        GameRules.ArchiveService.GetCustomBackpack(index , "22,21");
                        //获取玩家地图经验 货币等..
                        GameRules.ServiceData.server_gold_package_list[index]["1001"].number = data.data.list[steam_id.toString()].cz_gold ?? 0;
                        GameRules.ServiceData.server_gold_package_list[index]["1002"].number = data.data.list[steam_id.toString()].jf_gold ?? 0;
                        GameRules.ServiceData.server_gold_package_list[index]["1003"].number = data.data.list[steam_id.toString()].jb_gold ?? 0;
                        GameRules.ServiceData.server_gold_package_list[index]["1004"].number = data.data.list[steam_id.toString()].exp ?? 0;
                        GameRules.ServiceData.server_gold_package_list[index]["1005"].number = data.data.list[steam_id.toString()].zs_gold ?? 0;

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

                        //发送存档数据
                        GameRules.ServiceInterface.GetServerTime( index  , {});
                        //加载限购数据
                        // GameRules.ServiceInterface.GetServerTime( index  , {});

                        //限购数据
                        GameRules.ServiceInterface.ShoppingLimit[index].limit = data.data.list[steam_id.toString()].limit;
                        GameRules.ServiceInterface.ShoppingLimit[index].sc = data.data.list[steam_id.toString()].sc;

                        GameRules.ServiceInterface.GetPlayerShoppingLimit(index , {})
                    }
                    //0号玩家 的难度作为默认难度
                    GameRules.MapChapter.DifficultySelectInit(GameRules.MapChapter.level_difficulty[0]);

                    Timers.CreateTimer(5, () => {
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
        let host_steam_id = PlayerResource.GetSteamAccountID(0);
        let param_data = <GameOverParam>{
            state: 1,
            host_steam_id : host_steam_id,
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

                    let player_count = GetPlayerCount();
                    
                    for (let index = 0 as PlayerID; index < player_count; index++) {
                        let steam_id = PlayerResource.GetSteamAccountID(index);
                        let steam_id_string = tostring(steam_id);
                        let PlayerPassItem : CGEDPlayerPassItem[] = [];
                        //获取掉落
                        if(data.data.list.hasOwnProperty(steam_id_string)){
                            let add_items = data.data.list[steam_id_string].add_items;
                            for (const add_item of add_items) {
                                let item_id = tostring(add_item.item_id);
                                let quality = ServerItemList[item_id as keyof typeof ServerItemList].quality;
                                let affiliation_class = ServerItemList[item_id as keyof typeof ServerItemList].affiliation_class;
                                PlayerPassItem.push({
                                    "item_id" : tostring(add_item.item_id),
                                    "number" : add_item.count,
                                    "quality" : quality,
                                    "type" : 1,
                                });
                                if(affiliation_class >= 10){
                                    GameRules.ServiceData.AddPackageItem(
                                        index , 
                                        add_item.id,
                                        add_item.item_id,
                                        add_item.customs,
                                        add_item.count
                                    );
                                }
                            }
                        }
                        let CGEDPlayerSkillExp : CGEDPlayerSkillExp[] = [
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
                        ];
                        this.general_game_over_data_pass_data.player_list_data.push({
                            "exp" : 200,
                            "is_mvp" : 1,
                            "old_exp" : 100,
                            "player_id" : index,
                            "steam_id" : steam_id,
                            "pass_item" : PlayerPassItem,
                            "skill_exp" : CGEDPlayerSkillExp,
                        })
                        //重新发送背包数据
                        GameRules.ServiceInterface.GetPlayerServerPackageData( index , {})
                    }
                    if(data.data.level_difficulty != GameRules.MapChapter.level_difficulty[0]){
                        GameRules.MapChapter.level_difficulty[0] = data.data.level_difficulty;
                        //触发难度选择重置
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
                DeepPrintTable(data);
                if (data.code == 200) {
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
    SkillDataUp(player_id: PlayerID , red_item : string , skill_data : string , add_item : string = "") {
        let steam_id = PlayerResource.GetSteamAccountID(player_id);
        let param_data = <SkillDataUpParam>{
            sid : tostring(steam_id) , //steamid
            skill_data : skill_data ,
            red_item : red_item,
            add_item : add_item,
        }
        HttpRequest.AM2Post(ACTION_SKILL_DATA_UP,
            {
                param: param_data
            },
            (data: SkillDataUpReturn) => {
                if (data.code == 200) {
                    //先删除再添加
                    let red_item = data.data.red_item;
                    for (const r_e of red_item) {
                        GameRules.ServiceData.DeletePackageItemSelect(player_id , r_e.item_id , r_e.number , r_e.id);
                    }
                    //循环根据类型添加到不同的地方
                    let add_item = data.data.add_item;
                    for (const a_e of add_item) {
                        let customs = "";
                        if(a_e.customs){
                            customs = a_e.customs;
                        }
                        GameRules.ServiceData.AddPackageItemSelect(player_id , a_e.id ,  a_e.item_id , customs , a_e.number )
                    }
                    GameRules.ServiceInterface.GetPlayerServerPackageData(player_id , {});
                    GameRules.ServiceInterface.GetPlayerServerGoldPackageData(player_id , {});
                    //更新存档技能数据
                    GameRules.ServiceInterface.PlayerServerSkillLevelExp[player_id] = 
                        JSON.decode(data.data.skill_data) as {
                            [skill_key : string] : number
                        };
                    GameRules.ServiceInterface.LoadSkillfulLevel(player_id);
                } else {
                    GameRules.ServiceData.server_package_list[player_id] = [];
                    GameRules.ServiceInterface.GetPlayerServerPackageData(player_id , {});
                }
            },
            (code: number, body: string) => {
                GameRules.CMsg.SendErrorMsgToPlayer(player_id , "存档技能:升级失败..")
                GameRules.ServiceData.server_package_list[player_id] = [];
                GameRules.ServiceInterface.GetPlayerServerPackageData(player_id , {});
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
        for (const r_e of red_item) {
            GameRules.ServiceData.DeletePackageItemSelect(player_id , r_e.item_id , r_e.number , r_e.id);
        }
        //循环根据类型添加到不同的地方
        for (const a_e of add_item) {
            let customs = "";
            if(a_e.customs){
                customs = a_e.customs;
            }
            GameRules.ServiceData.AddPackageItemSelect(player_id , a_e.id ,  a_e.item_id , customs , a_e.number )
        }
        GameRules.ServiceInterface.GetPlayerServerPackageData(player_id , {});
        GameRules.ServiceInterface.GetPlayerServerGoldPackageData(player_id , {});
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
        
    }
    
}