import { reloadable } from "../../utils/tstl-utils";
import * as MapInfo from "../../json/config/map_info.json"
import * as MapInfoDifficulty from "../../json/config/map_info_difficulty.json"
import * as NpcHeroesCustom from "../../json/npc_heroes_custom.json"
import { UIEventRegisterClass } from "../class_extends/ui_event_register_class";
import { MissionSystem } from "../ingame/mission/mission_system";
import * as ChapterInfo from "../../json/config/chapter_info.json"


//营地信息

@reloadable
export class MapChapter extends UIEventRegisterClass {

    CampMapHandle : SpawnGroupHandle;

    ChapterMapHandle : SpawnGroupHandle;

    GameDifficulty: keyof typeof MapInfoDifficulty = "101";
    //难度数字类型
    GameDifficultyNumber : number = 101;

    MapIndex: keyof typeof MapInfo = "m1";

    MAP_CAMP = { name: "camp", x: 0, y: 0 };

    map_list_config : {
        [ map_key : string] : {
            x : number,
            y : number,
        }
    } = {};

    map_list_init : { x : number , y : number}[] = [
        { x : -8192 , y : 8192 },
        { x : 8192 , y : 8192 },
        { x : 8192 , y : -8192 },
        { x : -8192 , y : -8192 },
    ];

    map_list_count : number = 0;

    hero_list: { [key: number]: string } = {}

    // 1 选择地图难度 2选择英雄 3游戏开始了
    _game_select_phase: number = 0;
    //地图数据
    ChapterData : typeof MapInfo["m1"] = null;
    //根据等级可用地图
    _map_list : { [key : string ] : UserMapSelectDifficulty }  = {};
    //玩家已通关的难度  
    level_difficulty : string[] = [];
    //玩家可用英雄列表  
    player_hero_available : MapSelectHeroData[][] = [];
    //玩家选择英雄记录
    player_select_hero : MapSelectHeroList[] = [];
    //玩家数量
    player_count : number = 1;
    //新玩家标记
    is_new_player : number = 0;
    //确认时间
    select_map_time : number = 60;
    //客服端确认时间    
    countdown_select_map_time : number = 0;
    //确认英雄时间
    select_hero_time : number = 60; 
    //客服端确认时间
    countdown_select_hero_time : number = 0;
    //投票确认时间
    vote_time : number = 15;
    //客服端确认时间
    countdown_vote_time : number = 0;
    //玩家投票信息
    vote_data: MapVote = {
        playervote : [],
        state : 0,
        vote_time : 0 ,
    };

    game_count = 0; 

    constructor() {
        super("MapChapter", true) 
        for (let index = 0; index < 4; index++) {
            this.level_difficulty.push("");
        }
    }

    InitChapterMap() {
        let current_map = GetMapName();

        this.DifficultySelectInit("|107|109|121")
        if (current_map != "main") { return }
        //加载营地ma
        GameRules.MapChapter.OnCreatedCampMap();

        this.player_count = GetPlayerCount();

        let sort_hero : { [key : number] : number} = {};
        for (let [key, RowData] of pairs(NpcHeroesCustom)) {
            if (RowData.Enable == 1) {
                this.hero_list[RowData.HeroID] = key;
                sort_hero[RowData.sort] = RowData.HeroID;
            }
        }   
        for (let index = 0; index < this.player_count; index++) {
            let hero_key : MapSelectHeroData[] = [];
            for (let index = 0; index < Object.keys(sort_hero).length; index++) {
                hero_key.push({
                    hero_id : sort_hero[index],
                    lv : 1,
                    star : 1,
                })
            }
            this.player_hero_available.push(hero_key);
            this.player_select_hero.push({
                hero_id: hero_key[0].hero_id,
                state: 0, //是否确认
                star : 1,
                lv : 1, 
            });
        }

        // GameRules.GetGameModeEntity().SetFogOfWarDisabled(true);
        // for (let hHero of HeroList.GetAllHeroes()) {
        //     let vect = hHero.GetAbsOrigin();
        //     vect.z += 128;
        //     hHero.SetOrigin(vect)
        // }

        /**
         *  //是否为新号标记
         */
        GameRules.MapChapter.is_new_player = 1;

        if(GameRules.MapChapter.is_new_player == 1){
            GameRules.MapChapter.GetNewPlayerStatus( 0 , {})
        }
        //开始游戏确认功能
        GameRules.MapChapter.SelectDifficultyAffirmThink();
    }
    //难度初始化
    DifficultySelectInit( str : string = "|103"){
        this._map_list = {};
        this._map_list["c1"] = {
            user_difficulty: 101, // 玩家最高可选难度
            difficulty_max: 108, // 地图最高难度
            map_key: "m1", //地图编号 m1 m2 
        };
        if(str != ""){
            str = str.slice(1);
            let str_list = str.split("|");
            for (let index = 0; index < str_list.length; index++) {
                let mid = str_list[index];
                let mid_number = tonumber(mid);
                print("mid_number : " , mid_number);
                let MidData = MapInfoDifficulty[mid as keyof typeof MapInfoDifficulty];
                let unlock_difficulty_list = MidData.unlock_difficulty;
                let chapter_key = MidData.chapter_key;
                let map_key = MidData.map_key;
                //当前难度
                if(!this._map_list.hasOwnProperty(chapter_key)){
                    let default_difficulty = ChapterInfo[chapter_key as keyof typeof ChapterInfo].default_difficulty;
                    let default_max = ChapterInfo[chapter_key as keyof typeof ChapterInfo].default_max;
                    let difficulty_max = default_difficulty + default_max - 1;
                    this._map_list[chapter_key] = {
                        user_difficulty : mid_number, // 玩家最高可选难度
                        difficulty_max : difficulty_max, // 地图最高难度
                        map_key: map_key, //地图编号 m1 m2 
                    };
                }else{  
                    //如果有则覆盖
                    if(this._map_list[chapter_key].user_difficulty < mid_number){
                        this._map_list[chapter_key].user_difficulty = mid_number;
                    }   
                }
                //解锁下个难度
                for (const unlock_difficulty of unlock_difficulty_list) {
                    if(unlock_difficulty != "null"){
                        let unlock_difficulty_str = tostring(unlock_difficulty);
                        let UnlockMidData = MapInfoDifficulty[unlock_difficulty_str as keyof typeof MapInfoDifficulty];
                        let UnlockChapterKey = UnlockMidData.chapter_key;
                        if(!this._map_list.hasOwnProperty(UnlockChapterKey)){
                            if(this._map_list[UnlockChapterKey].user_difficulty < mid_number){
                                this._map_list[UnlockChapterKey].user_difficulty = mid_number;
                            }
                        }else{
                            let unlock_default_difficulty = ChapterInfo[UnlockChapterKey as keyof typeof ChapterInfo].default_difficulty;
                            let unlock_default_max = ChapterInfo[UnlockChapterKey as keyof typeof ChapterInfo].default_max;
                            let unlock_difficulty_max = unlock_default_difficulty + unlock_default_max - 1;
                            this._map_list[UnlockChapterKey] = {
                                user_difficulty : tonumber(unlock_difficulty), // 玩家最高可选难度
                                difficulty_max : unlock_difficulty_max, // 地图最高难度
                                map_key: map_key, //地图编号 m1 m2 
                            };
                        }
                    }
                }
            }
        }

        DeepPrintTable(this._map_list);

        // if(str && str != ""){
        //     let str_list = str.split(",");
        //     let cache_map_list : number[] = [];
        //     for (let index = 0; index < this._map_list.length; index++) {
        //         cache_map_list.push(0)
        //     }
        //     for (const map_id of str_list) {
        //         if(map_id.length >= 3){ //设置默认值
        //             let di_decade = tonumber(map_id.slice(map_id.length - 2));
        //             let chapter = tonumber(map_id.slice(0 , -2));
        //             if(chapter >= 20 && chapter <= 30){
        //                 continue;
        //             }
        //             //章节递归
        //             if(di_decade > cache_map_list[chapter - 1] ){
        //                 cache_map_list[chapter - 1] = di_decade
        //             }
        //         }
        //     }
        //     for (let index = (cache_map_list.length - 1) ; 0 <= index ; index --) {
        //         if(cache_map_list[index] > 0){
        //             //优先解锁自己这个难度
        //             this._map_list[index].is_unlock = 1;
        //             //前面有 则解锁前面难度    
        //             if(index != 0){
        //                 for (let i = 0; i < index; i++) {
        //                     this._map_list[i].is_unlock = 1;
        //                 }
        //             }
        //             //当前难度设定
        //             let TwiceMapData = TwiceMapInfo[this._map_list[index].map_index as keyof typeof TwiceMapInfo]; 
 
        //             let default_max = TwiceMapData.default_max;
        //             let map_di = -1;
        //             let map_difficulty = 0;
        //             if((cache_map_list[index] + 1) >= default_max){
        //                 map_di = (index + 1) * 100 + default_max;
        //                 map_difficulty = default_max;
        //             }else{
        //                 map_di = (index + 1) * 100 + cache_map_list[index] + 1;
        //                 map_difficulty = cache_map_list[index] + 1;
        //             }
        //             this._map_list[index].user_difficulty = map_di;
        //             //下个难度解锁设定
        //             for (const key in TwiceMapInfo) {
        //                 if(TwiceMapInfo[key as keyof typeof TwiceMapInfo].unlock_difficulty == 0){
        //                     continue;
        //                 }
        //                 let chapter_num =  math.floor(TwiceMapInfo[key as keyof typeof TwiceMapInfo].unlock_difficulty / 100); //章节
        //                 let difficulty_num = TwiceMapInfo[key as keyof typeof TwiceMapInfo].unlock_difficulty % 100; //难度
        //                 if(chapter_num == (index + 1) && difficulty_num <= cache_map_list[index]){
        //                     if(TwiceMapInfo[key as keyof typeof TwiceMapInfo].is_open == 1){
        //                         let key_index = tonumber(key.replace("m","")) - 1;
        //                         if(this._map_list[key_index]){
        //                             this._map_list[key_index].is_unlock = 1;
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
    }


    SelectDifficultyAffirmThink(){
        let cd_select_map_time = this.select_map_time;
        if(!IsInToolsMode()){
            this.countdown_select_map_time = GameRules.GetDOTATime(false, false) + cd_select_map_time;
            GameRules.GetGameModeEntity().SetContextThink("SELECT_DIFFICULTY_AFFIRM", () => {
                GameRules.MapChapter.SelectDifficultyAffirm( 0 , {});
                return null;
            }, cd_select_map_time);
        }else{
            this.countdown_select_map_time = 9999999;
        }
    }
    
    /** 生成营地 */
    OnCreatedCampMap() {
        if (this.CampMapHandle == null) {
            let vLocation = Vector(GameRules.MapChapter.MAP_CAMP.x, GameRules.MapChapter.MAP_CAMP.y, 0);
            for (let hHero of HeroList.GetAllHeroes()) {
                hHero.SetOrigin(vLocation)
            }
            this.CampMapHandle = DOTA_SpawnMapAtPosition(
                "camp",
                vLocation,
                false,
                this.OnCampReadyToSpawn,
                this.OnSpawnCampComplete,
                this
            );
        }
    }

    //营地创建前置
    OnCampReadyToSpawn(spawnGroupHandle: SpawnGroupHandle) {
        print("OnCampReadyToSpawn", spawnGroupHandle);
        ManuallyTriggerSpawnGroupCompletion(spawnGroupHandle)
    }

    //营地创建后置
    OnSpawnCampComplete(spawnGroupHandle: SpawnGroupHandle) {
        print("OnSpawnCampComplete", spawnGroupHandle);
    }
    
    /**
     * 获取玩家新号状态 
     * @param player_id 
     * @param params    
     */
    GetNewPlayerStatus(player_id: PlayerID , params: CGED["MapChapter"]["GetNewPlayerStatus"]){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "MapChapter_GetNewPlayerStatus",
            {
                data: {
                    status : GameRules.MapChapter.is_new_player, //状态
                }
            }
        );
    }


    //获取游戏最高难度
    GetDifficultyMax(player_id: PlayerID, params: CGED["MapChapter"]["GetDifficultyMax"]) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "MapChapter_GetDifficultyMax",
            {
                data: {
                    map_difficulty: this._map_list,
                    level_difficulty: this.level_difficulty,
                }
            }
        );
    }

    //选择游戏难度
    SelectDifficulty(player_id: PlayerID, params: CGED["MapChapter"]["SelectDifficulty"]) {
        if (this._game_select_phase == 0 && player_id == 0 && params.difficulty != "-1") {
            this.GameDifficulty = params.difficulty as keyof typeof MapInfoDifficulty;
            this.GameDifficultyNumber = tonumber(this.GameDifficulty);
            let MapIndex = MapInfoDifficulty[this.GameDifficulty].map_key as keyof typeof MapInfo;
            if(!this.map_list_config.hasOwnProperty(MapIndex)){
                let ky_count = Object.keys(this.map_list_config).length;
                if(ky_count >= this.map_list_init.length){
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id, "地图超过最大使用量");
                    return ; 
                }   
            }
            this.MapIndex = MapIndex;
        }
        CustomGameEventManager.Send_ServerToAllClients(
            "MapChapter_SelectDifficulty",
            {   
                data: {
                    select_map: this.MapIndex,
                    select_difficulty: this.GameDifficulty,
                }
            }
        );
    }
    //获取游戏难度
    GetDifficulty(player_id: PlayerID, params: CGED["MapChapter"]["GetDifficulty"]){
        //获取游戏难度
        if(player_id == -1){
            CustomGameEventManager.Send_ServerToAllClients(
                "MapChapter_GetDifficulty",
                {
                    data: {
                        select_map : this.MapIndex,
                        select_difficulty: this.GameDifficulty,
                        time : this.countdown_select_map_time
                    }
                }
            );
        }else{
            CustomGameEventManager.Send_ServerToPlayer(
                PlayerResource.GetPlayer(player_id),
                "MapChapter_GetDifficulty",
                {
                    data: {
                        select_map : this.MapIndex,
                        select_difficulty: this.GameDifficulty,
                        time : this.countdown_select_map_time
                    }
                }
            );
        }
    }

    //确认难度
    SelectDifficultyAffirm(player_id: PlayerID, params: CGED["MapChapter"]["SelectDifficultyAffirm"]) {
        if (this._game_select_phase == 0) {
            this._game_select_phase = 1; //修改游戏进程
            this.GetGameSelectPhase(-1, {})
            //完成时间
            this.countdown_select_hero_time = GameRules.GetDOTATime(false, false) + this.select_hero_time;
            GameRules.GetGameModeEntity().SetContextThink("SELECT_HERO_AFFIRM", () => {
                for (let index = 0 as PlayerID; index < GameRules.MapChapter.player_count; index++) {
                    this.player_select_hero[index].state = 1;
                }
                GameRules.MapChapter.SelectHeroAffirm( 0 , {});
                return null;
            }, this.select_hero_time);

            //发送选择英雄信息
            for (let index = 0 as PlayerID; index < GameRules.MapChapter.player_count; index++) {
                let steam_id = PlayerResource.GetSteamAccountID(index);
                //清空玩家选择状态
                if(steam_id == 0){
                    this.player_select_hero[index].state = 1;
                }else{
                    this.player_select_hero[index].state = 0;
                }
                GameRules.MapChapter.GetPlayerHeroList(index, {})
            }
        }
        CustomNetTables.SetTableValue("game_setting", "game_mode",  {
            mode : 0 , 
            difficulty : this.GameDifficulty,
        });
        GameRules.GetGameModeEntity().StopThink("SELECT_DIFFICULTY_AFFIRM");
    }

    /**
     * 从选择英雄返回到选择难度
     * @param player_id 
     * @param params 
     */
    ReturnSelectDifficulty(player_id: PlayerID, params: CGED["MapChapter"]["ReturnSelectDifficulty"]) {
        if (this._game_select_phase == 1 && player_id == 0) {
            this._game_select_phase = 0; //返回到选择难度
            this.GetGameSelectPhase(-1, {})
            for (let index = 0 as PlayerID; index < GameRules.MapChapter.player_count; index++) {
                //清空玩家选择状态
                this.player_select_hero[index].state = 0;
            }
            GameRules.MapChapter.SelectDifficulty( -1 , { difficulty : "-1"})
        }
    }

    //获取玩家可用英雄列表
    GetPlayerHeroList(player_id: PlayerID, params: CGED["MapChapter"]["GetPlayerHeroList"]) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "MapChapter_GetPlayerHeroList",
            {
                data: {
                    hero_id: this.player_hero_available[player_id],
                    time : this.countdown_select_hero_time
                }
            }
        );
    }
    //获取玩家已选英雄列表
    GetPlayerSelectHeroList(player_id: PlayerID, params: CGED["MapChapter"]["GetPlayerSelectHeroList"]) {
        if (player_id == -1) {
            CustomGameEventManager.Send_ServerToAllClients(
                "MapChapter_GetPlayerSelectHeroList",
                {
                    data: {
                        hero_ids: this.player_select_hero,
                    }
                }
            );
        } else {
            CustomGameEventManager.Send_ServerToPlayer(
                PlayerResource.GetPlayer(player_id),
                "MapChapter_GetPlayerSelectHeroList",
                {
                    data: {
                        hero_ids: this.player_select_hero,
                    }
                }
            )
        }
    }

    //获取当前游戏流程
    GetGameSelectPhase(player_id: PlayerID, params: CGED["MapChapter"]["GetGameSelectPhase"]) {
        if (player_id == -1) {
            CustomGameEventManager.Send_ServerToAllClients(
                "MapChapter_GetGameSelectPhase",
                {
                    data: {
                        game_select_phase: this._game_select_phase,
                    }
                }
            );
        } else {
            CustomGameEventManager.Send_ServerToPlayer(
                PlayerResource.GetPlayer(player_id),
                "MapChapter_GetGameSelectPhase",
                {
                    data: {
                        game_select_phase: this._game_select_phase,
                    }
                }
            )
        }
    }

    //选择英雄
    SelectHero(player_id: PlayerID, params: CGED["MapChapter"]["SelectHero"]) {
        if (this._game_select_phase == 1) {
            if (this.player_select_hero[player_id].state == 0) {
                let hero_id = params.hero_id;
                this.player_select_hero[player_id].hero_id = hero_id;
                GameRules.MapChapter.GetPlayerSelectHeroList(-1, {})
            }
        }
    }
    //确认英雄
    SelectHeroAffirm(player_id: PlayerID, params: CGED["MapChapter"]["SelectHeroAffirm"]) {
        if (this._game_select_phase == 1 && this.player_select_hero[player_id].state == 0) {
            this.player_select_hero[player_id].state = 1;
            GameRules.MapChapter.GetPlayerSelectHeroList(-1, {})
        }
        for (const date of this.player_select_hero) {
            if (date.state != 1) {
                return
            }   
        }
        //修改流程
        this._game_select_phase = 2;

        this.GetGameSelectPhase(-1, {})

        GameRules.MapChapter.is_new_player = 0;

        GameRules.GetGameModeEntity().StopThink("SELECT_HERO_AFFIRM");

        //调用确认游戏开始
        GameRules.ArchiveService.ConfirmDifficulty();   
        //todo 需要修改成流程中

        //重新设置时间
        GameRules.GameInformation.play_game_time = GameRules.GetDOTATime(false, false);
        GameRules.GameInformation.SetPlayGameTime(0);

        //初始化技能全局可用数量
        GameRules.NewArmsEvolution.ArmsGlobalInit();

        GameRules.MapChapter.GetPlayerSelectHeroList(-1, {})


        this.ChapterData = MapInfo[this.MapIndex];

        if(this.map_list_config.hasOwnProperty(this.MapIndex)){
            this.ChapterData.map_centre_x = this.map_list_config[this.MapIndex].x
            this.ChapterData.map_centre_y = this.map_list_config[this.MapIndex].y
            this.ChapterData.map_x = this.map_list_config[this.MapIndex].x;
            this.ChapterData.map_y = this.map_list_config[this.MapIndex].y;
            this.ChapterData.z = 0;

            GameRules.MapChapter.GameStart()

        }else{  
            this.ChapterData.map_centre_x = this.map_list_init[this.map_list_count].x
            this.ChapterData.map_centre_y = this.map_list_init[this.map_list_count].y
            this.ChapterData.map_x = this.map_list_init[this.map_list_count].x;
            this.ChapterData.map_y = this.map_list_init[this.map_list_count].y;
            this.ChapterData.z = 0;

            let vLocation = Vector(this.ChapterData.map_centre_x, this.ChapterData.map_centre_y, 0);
            this.ChapterMapHandle = DOTA_SpawnMapAtPosition(
                this.ChapterData.map_name,
                vLocation,
                false,
                this.OnRoomReadyToSpawn,
                this.OnSpawnRoomComplete,
                this
            );
        }
        
        
    }

    //根据选择刷出地图
    OnLoadChapterMap(map_index: keyof typeof MapInfo, difficulty: keyof typeof MapInfoDifficulty) {
        this.MapIndex = map_index;
        this.GameDifficulty = difficulty;
    }

    //游戏地图创建前置
    OnRoomReadyToSpawn(spawnGroupHandle: SpawnGroupHandle) {
        // print("OnCampReadyToSpawn", spawnGroupHandle);
        ManuallyTriggerSpawnGroupCompletion(spawnGroupHandle)
    }
    shiye : ViewerID;
    //游戏地图创建后置
    OnSpawnRoomComplete(spawnGroupHandle: SpawnGroupHandle) {
        // print("OnSpawnRoomComplete", spawnGroupHandle);
        // GameRules.GetGameModeEntity().SetFogOfWarDisabled(true);

        //记录生成的地图信息
        GameRules.MapChapter.map_list_config[this.MapIndex] = {
            x : this.ChapterData.map_centre_x,
            y : this.ChapterData.map_centre_y,
        }
        GameRules.MapChapter.map_list_count ++;

        GameRules.MapChapter.GameStart()
    }

    //游戏开始前操作
    GameStart(){
        let vLocation = Vector(this.ChapterData.map_centre_x, this.ChapterData.map_centre_y, 0);
        this.shiye  = AddFOWViewer(DotaTeam.BADGUYS,vLocation , 9999 , 999999 , true);
        GameRules.Altar.SetMapCenter();
        GameRules.MissionSystem = new MissionSystem()
        GameRules.GameInformation.ResetNumberofDeaths();
        for (let index = 0 as PlayerID; index < GameRules.MapChapter.player_count; index++) {
            let hHero = PlayerResource.GetSelectedHeroEntity(index);
            hHero.SetOrigin(vLocation);
            let hname = GameRules.MapChapter.hero_list[this.player_select_hero[index].hero_id];
            PlayerResource.ReplaceHeroWith(
                index,
                hname,
                0,
                0
            );
            UTIL_Remove(hHero)
        }

        for (const hero of HeroList.GetAllHeroes()) {
            GameRules.BuffManager.AddGeneralDebuff(hero,hero,DebuffTypes.un_controll , 4); 
        }
        this.game_count ++;
        this.NewPlay(-1 , {});
        this._game_select_phase = 3;
        this.GetGameSelectPhase(-1, {})
        //初始化 刷怪地点
        GameRules.Spawn.Init(this.ChapterData.map_centre_x, this.ChapterData.map_centre_y)
        GameRules.Spawn._game_start = true;
        GameRules.GetGameModeEntity().SetContextThink(
            "StartSpawnHint",
            () => {
                // GameRules.CMsg.SendCommonMsgToPlayer(
                //     -1 as PlayerID,
                //     "海量怪物即将来袭，是男人就坚持下去……",
                //     {}
                // );
                GameRules.CMsg.SendMsgToAll(CGMessageEventType.MESSAGE1);

                GameRules.CMsg.SendTopCountdown(GameRules.GetDOTATime(false,false) + 3)
                
                return null;
            },
            1
        );
        GameRules.GetGameModeEntity().SetContextThink(
            "StartSpawn",
            () => {
                // GameRules.CMsg.SendCommonMsgToPlayer(
                //     -1 as PlayerID,
                //     "请使用W,A,S,D或方向键进行移动",
                //     {}
                // );
                GameRules.CMsg.SendMsgToAll(CGMessageEventType.MESSAGE2);
                GameRules.Spawn.StartSpawnControl()
                GameRules.MissionSystem.Start(180);
                return null;
            },
            4
        );
    }

    //获取当前游戏次数
    NewPlay(player_id: PlayerID, params: CGED["MapChapter"]["NewPlay"]) {
        if (player_id == -1) {
            CustomGameEventManager.Send_ServerToAllClients(
                "MapChapter_NewPlay",
                {
                    data: {
                        count : this.game_count , //游戏次数
                        extend : {} , //扩展参数
                    }
                }
            );
        } else {
            CustomGameEventManager.Send_ServerToPlayer(
                PlayerResource.GetPlayer(player_id),
                "MapChapter_NewPlay",
                {
                    data: {
                        count : this.game_count , //游戏次数
                        extend : {} , //扩展参数
                    }
                }
            )
        }
    }

    OnRemoveChapterMap() {

    }
    //重开状态
    is_reopen = false;
    //开启重开投票
    OpenReopenVote(player_id: PlayerID, params: CGED["MapChapter"]["OpenReopenVote"]) {
        if (player_id == 0 && this._game_select_phase == 999) {
            if(this.is_reopen == false){
                this.is_reopen = true;
                this.vote_data.state = 1;
                this.vote_data.playervote = [];
                let plyaer_count = GetPlayerCount()
                for (let index = 0 as PlayerID ; index < plyaer_count ; index++) {
                    
                    let steam_id = PlayerResource.GetSteamAccountID(index);
                    //清空玩家选择状态
                    // if(steam_id == 0){
                    //     this.vote_data.playervote.push(1);
                    // }else{
                    this.vote_data.playervote.push(-1);
                    // }
                }
                //完成时间
                this.countdown_vote_time = GameRules.GetDOTATime(false, false) + this.vote_time;
                //投票时间
                this.vote_data.vote_time = this.countdown_vote_time;
                GameRules.GetGameModeEntity().SetContextThink("VOTE_TIME", () => {
                    GameRules.MapChapter.VoteTimeLose();
                    return null;
                }, this.vote_time);
                this.GetPlayerVoteData(-1 , {});
                GameRules.CMsg.SendCommonMsgToPlayer(
                    -1,
                    "主机开机投票",
                    {}
                );
            }else{
                GameRules.CMsg.SendErrorMsgToPlayer(
                    player_id,
                    "已经开启重开投票",
                    {}
                );
            }
        }else{
            GameRules.CMsg.SendErrorMsgToPlayer(
                player_id,
                "主机才能开启投票,或游戏未结束",
                {}
            );
        }
    }

    //玩家投票
    PlayerVote(player_id: PlayerID, params: CGED["MapChapter"]["PlayerVote"]) {
        if(this.is_reopen && this._game_select_phase == 999){
            if(this.vote_data.playervote[player_id] == -1){
                if(params.vote == 1){
                    this.vote_data.playervote[player_id] = params.vote;

                    GameRules.CMsg.SendCommonMsgToPlayer(
                        -1,
                        "{s:player_id} 玩家同意重开",
                        {
                            player_id: player_id
                        }
                    );

                    let plyaer_count = GetPlayerCount()
                    for (let index = 0 as PlayerID ; index < plyaer_count ; index++) {
                        if(this.vote_data.playervote[index] != 1){
                            this.GetPlayerVoteData(-1 , {});
                            return 
                        }
                    }
                    GameRules.MapChapter.VoteTimeSucceed();
                }else{
                    this.vote_data.playervote[player_id] = params.vote;
                    GameRules.CMsg.SendCommonMsgToPlayer(
                        -1,
                        "{s:player_id} 玩家拒绝重开",
                        {
                            player_id: player_id
                        }
                    );
                    GameRules.MapChapter.VoteTimeLose();
                }
            }else{
                GameRules.CMsg.SendErrorMsgToPlayer(
                    -1 as PlayerID,
                    "你已投票....",
                    {}
                );
            }
        }else{
            GameRules.CMsg.SendErrorMsgToPlayer(
                -1 as PlayerID,
                "未开启投票,或游戏未结束",
                {}
            );
        }
    }


    //投票重开失败
    VoteTimeLose(){
        GameRules.GetGameModeEntity().StopThink("VOTE_TIME");
        this.is_reopen = false;
        this.vote_data.state = 0;
        GameRules.Spawn._game_start = false;
        this.GetPlayerVoteData(-1 , {});
    }

    //投票重开成功
    VoteTimeSucceed(){
        GameRules.GetGameModeEntity().StopThink("VOTE_TIME");
        this.is_reopen = false;
        this.vote_data.state = 0;
        GameRules.Spawn._game_start = false;
        this.GetPlayerVoteData(-1 , {});
        this.ReturntoCamp();
    }
    
    /**
     * 投票信息
     * @param player_id 
     * @param params 
     */
    GetPlayerVoteData(player_id: PlayerID, params: CGED["MapChapter"]["GetPlayerVoteData"]){
        if (player_id == -1) {
            CustomGameEventManager.Send_ServerToAllClients(
                "MapChapter_GetPlayerVoteData",
                {
                    data: {
                        vote_data: this.vote_data,
                    }
                }
            );
        } else {
            CustomGameEventManager.Send_ServerToPlayer(
                PlayerResource.GetPlayer(player_id),
                "MapChapter_GetPlayerVoteData",
                {
                    data: {
                        vote_data: this.vote_data,
                    }
                }
            )
        }
    }

    //返回到营地
    ReturntoCamp() {
        GameRules.NpcSystem.RemoveNPC();
        //删除视野
        RemoveFOWViewer(DotaTeam.BADGUYS , this.shiye);
        //开始游戏确认功能
        GameRules.MapChapter.SelectDifficultyAffirmThink();

        //清空伤害数据
        GameRules.CMsg.ClearDamageRecord()

        let hDropItemList = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            Vector(0,0,0),
            null,
            99999,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.OTHER,
            UnitTargetFlags.INVULNERABLE,
            FindOrder.ANY,
            false
        )
        for(let hItem of hDropItemList){
            hItem.RemoveSelf()
        }
        // let unitlist = Entities.FindAllByClassname("npc_exp");
        // print("unitlist", unitlist.length)
        if (GameRules.Spawn._game_start == false && this._game_select_phase == 999) {
            this._game_select_phase = 0;
            this.GetGameSelectPhase(-1, {})
            for (let index = 0 as PlayerID; index < GameRules.MapChapter.player_count; index++) {
                this.player_select_hero[index].state = 0;
                //初始化可选技能 == 清理
                GameRules.NewArmsEvolution.InitPlayerUpgradeStatus(index)
                //初始化可用符文 == 清理
                GameRules.RuneSystem.InitPlayerUpgradeStatus(index)
                //初始化神秘商店
                GameRules.MysticalShopSystem.InitPlayerUpgradeStatus(index)

            }
            let vLocation = Vector(GameRules.MapChapter.MAP_CAMP.x, GameRules.MapChapter.MAP_CAMP.y, 0);
            for (let index = 0 as PlayerID; index < GameRules.MapChapter.player_count; index++) {
                let hHero = PlayerResource.GetSelectedHeroEntity(index)
                hHero.SetOrigin(vLocation);
                let hname = GameRules.MapChapter.hero_list[this.player_select_hero[index].hero_id];
                
                PlayerResource.ReplaceHeroWith(
                    index,
                    "npc_dota_hero_wisp",
                    0,
                    0
                );
                UTIL_Remove(hHero)
            }
            //不移除地图
            // if (this.ChapterMapHandle) { 
            //     UnloadSpawnGroupByHandle(this.ChapterMapHandle)
            //     this.ChapterMapHandle = null;
            // }
            GameRules.MapChapter.SelectDifficulty( -1 , { difficulty : "-1"})

            GameRules.ResourceSystem.InitAllPlayer();
        }
    }
    TimersXYWIN : {x : number , y : number }[] = [
        { x : -100 , y : -100 },
        { x : 100 , y : -100 },
        { x : 100 , y : 100 },
        { x : -100 , y : 100 },
    ]

    //游戏胜利 普通关卡
    GameWin() {
        print("GameWin : " )
        Timers.CreateTimer(3, () => {
            let player_count = GetPlayerCount();

            for (let index = 0 as PlayerID; index < player_count; index++) {
                let hHero = PlayerResource.GetSelectedHeroEntity(index);
                
                let vLocation = Vector(this.ChapterData.map_centre_x + this.TimersXYWIN[index].x, this.ChapterData.map_centre_y + this.TimersXYWIN[index].y, 0);
                if(hHero.IsAlive() == false){
                    hHero.SetRespawnPosition(vLocation);
                    hHero.RespawnHero(false, false);
                    hHero.AddNewModifier(hHero, null, "modifier_state_invincible", { duration: 3 });
                }else{
                    hHero.SetOrigin(vLocation);
                }
                hHero.SetAbsAngles(0 , 45 + index * 90, 100 )
            }
        })
        if(GameRules.MapChapter._game_select_phase == 999){
            return
        }
        //清理任务
        GameRules.MissionSystem.Stop();

        GameRules.Spawn.StopAllSpawnAndMonster();
        let exp_list: number[] = [];
        let cj_list: string[] = [];
        let hero_list: string[] = [];
        //通关结算
        GameRules.ArchiveService.GameOver(
            1,
            exp_list,
            cj_list,
            hero_list
        );
        GameRules.CMsg.SendCommonMsgToPlayer(
            -1 as PlayerID,
            "游戏胜利",
            {}
        );
        GameRules.ServiceInterface.PostLuaLog(-1 , "--------------游戏胜利--------------");
        GameRules.ServiceInterface.SendLuaLog(-1);
    }
    //游戏失败 普通关卡
    GameLoser() {
        Timers.CreateTimer(3, () => {
            let player_count = GetPlayerCount();
            for (let index = 0 as PlayerID; index < player_count; index++) {
                let vLocation = Vector(this.ChapterData.map_centre_x + this.TimersXYWIN[index].x , this.ChapterData.map_centre_y + this.TimersXYWIN[index].y , 0);
                let hHero = PlayerResource.GetSelectedHeroEntity(index);
                if(hHero.IsAlive() == false){
                    hHero.SetRespawnPosition(vLocation);
                    hHero.RespawnHero(false, false);
                    hHero.AddNewModifier(hHero, null, "modifier_state_invincible", { duration: 3 });
                }else{
                    hHero.SetOrigin(vLocation);
                }
                hHero.SetAbsAngles(0 , 45 + index * 90, 100 )
            }
        })  
        if(GameRules.MapChapter._game_select_phase == 999){
            return
        }
        //清理任务
        GameRules.MissionSystem.Stop();
        
        GameRules.Spawn.StopAllSpawnAndMonster();
        let exp_list: number[] = [];
        let cj_list: string[] = [];
        let hero_list: string[] = [];

        //通关结算
        GameRules.ArchiveService.GameOver(
            2,
            exp_list,
            cj_list,
            hero_list
        );
        //停止定时器
        GameRules.CMsg.SendCommonMsgToPlayer(
            -1 as PlayerID,
            "游戏失败",
            {}
        );
        GameRules.ServiceInterface.PostLuaLog(-1 , "--------------游戏失败--------------");
        GameRules.ServiceInterface.SendLuaLog(-1);
    }

    Debug(cmd: string, args: string[], player_id: PlayerID) {
        if (cmd == "-fh") {
            this.ReturntoCamp()
        }
        if (cmd == "-qzfh") {
            GameRules.Spawn._game_start = false
            this._game_select_phase = 999
            this.ReturntoCamp()
        }
        if (cmd == "-di") {
            let map_index = (args[0] ?? "m1") as keyof typeof MapInfo;
            let difficulty = (args[0] ?? "101") as keyof typeof MapInfoDifficulty;
            this.OnLoadChapterMap(map_index, difficulty)
        }
        if (cmd == "-sh") {
            let hero_index = args[0] ?? "6";
            this.SelectHero(player_id, { hero_id: parseInt(hero_index) })
        }
        if(cmd == "-sha"){
            this.SelectHeroAffirm(player_id , {});
        }
        if (cmd == "-sd"){
            this.SelectDifficulty( player_id , { "difficulty" : "101"})
        }
        if( cmd == "-sda"){
            this.SelectDifficultyAffirm( player_id , {})
        }
        if(cmd == "-win"){
            GameRules.MapChapter.GameWin()
        }
        if(cmd == "-loser"){
            GameRules.MapChapter.GameLoser()
        }
        if(cmd == "-VoteTimeSucceed"){
            GameRules.MapChapter.VoteTimeSucceed();
        }
        if (cmd == "-mapinfo") {
            print("GameRules.Spawn._game_start", GameRules.Spawn._game_start)
            print("this._game_select_phase", this._game_select_phase)
            this.ReturnSelectDifficulty(player_id, {})
        }
        if(cmd == "-getplayer"){
            print(GetPlayerCount())
        }
    }
}