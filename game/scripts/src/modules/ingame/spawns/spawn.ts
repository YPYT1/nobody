/**
 * 地图模块化的一些测试方法
 */

import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";
import * as UnitNormal from "../../../json/units/monster/normal.json";
import * as EliteNormal from "../../../json/units/monster/elite.json";
import * as MapInfoRound from "../../../json/config/map_info_round.json";
import * as MapInfoDifficulty from "../../../json/config/map_info_difficulty.json";



@reloadable
export class Spawn extends UIEventRegisterClass {
    /**
     * 创建地图返回信息
     */
    _SpawnGroupHandle: SpawnGroupHandle;
    /**
     * 地图中点
     */
    _Vector: Vector;
    /**
     * 关卡boss点
     */
    StageBossVector: Vector;
    /**
     * 地图中点x坐标 地图中点y坐标
     */
    _map_middle_x: number;
    _map_middle_y: number;
    /**
     * 地图大小x 地图大小y
     */
    _map_x: number;
    _map_y: number;
    /**
     * 地图难度配置索引
     */
    _map_config_index: string;
    /**
     * 存在的怪物数量
     */
    _spawn_count: number = 0;
    //普通单位集合
    _map_Spawn_list: CDOTA_BaseNPC[] = [];
    //精英单位集合
    _map_elite_spawn_list: CDOTA_BaseNPC[] = [];
    //默认基础怪物
    _spawn_name: string = "npc_creature_normal_1";
    //最大单位数
    _unit_max: number = 100;
    //上线单位
    _unit_limit: number = 60;
    //基础怪出现时间
    _base_monster: string;
    //回合数
    _round_index: number = 1;
    //定时任务怪物数量缓存
    _map_timers_count: number = 0;
    //增加掉线刷怪坐标点
    _map_coord: Vector[] = [];
    //增加出怪坐标点
    _map_monster_coord: Vector[] = [];
    //刷怪总数(主要用于确定下标)
    _spawn_num_count: number = 0;
    //难度hp公式
    _hp_equation: string = "hp";
    //难度攻击公式
    _attack_equation: string = "attack";
    //难度护甲公式
    _armor_equation: string = "armor";
    //回合分类
    _round_class: number = 1;
    //每组怪物集合
    _monster_count_interval: { [index: string]: number } = {}
    //刷怪计数器
    _monster_count: number = 0;
    //击杀计数器 总击杀数
    _player_sum_kill: number[] = [];
    //回合击杀数量
    _player_round_sum_kill: number[] = [];
    //地图每回合信息
    public map_info_round: {
        [round_index: number]: {
            monster_type: number; //怪物类型 1只有小怪 2 精英 3关卡首领+小怪 4 小怪+开始团队boss
            t_time: number; //周期-刷怪时间（秒）
            interval_time: number; //周期-休息时间（秒）
            monster_list: { //怪物数组
                [monster_index: string]: string
            };
            monster_count_list: {
                [monster_index: string]: number
            };
            elite_name: string; //精英怪名字
            elite_count: number; //精英数量
            boss_name_list: string[]; //boss名字列表
        }
    } = {

        };
    //所有怪物血量换算公式
    _unit_hp_equation: {
        [name: string]: string
    } = {}
    //所有怪物攻击换算公式
    _unit_attack_equation: {
        [name: string]: string
    } = {}
    //所有怪物经验获取数组
    _unit_exp_list: {
        [name: string]: number
    } = {}
    //所有怪物金币获取数组
    _unit_gold_list: {
        [name: string]: string
    } = {}
    //玩家数量
    player_count = 6;


    _map_boss_unit: CDOTA_BaseNPC;

    _map_boss_refresh: boolean = false;

    _game_start: boolean = false;

    //最大回合数
    _round_max: number = 20;

    constructor() {
        super("Spawn");
    }

    //初始化地图信息
    Init(x: number, y: number) {
        //关卡boss
        this.StageBossVector = Vector(x, y, 0);
        this.player_count = GetPlayerCount();
        this._Vector = Vector(x, y, 128);
        //击杀计数器
        for (let index: PlayerID = 0; index < this.player_count; index++) {
            if (this._player_sum_kill.hasOwnProperty(index)) {
                this._player_sum_kill[index] = 0;
                this._player_round_sum_kill[index] = 0;
            } else {
                this._player_sum_kill.push(0);
                this._player_round_sum_kill.push(0);
            }
        }

        //加载怪物血量公式 加载怪物攻击公式
        for (const key in UnitNormal) {
            let init = UnitNormal[key as keyof typeof UnitNormal]
            if (init.hasOwnProperty("HealthEquation")) {
                this._unit_hp_equation[key] = init["HealthEquation"];
            }
            if (init.hasOwnProperty("AttackEquation")) {
                this._unit_attack_equation[key] = init["AttackEquation"];
            }
            if (init.hasOwnProperty("KillExp")) {
                this._unit_exp_list[key] = init["KillExp"];
            }
            if (init.hasOwnProperty("KillBounty")) {
                this._unit_gold_list[key] = init["KillBountyRange"];
            }
        }
        //查找当前地图

        let MapInfoDifficultyData = MapInfoDifficulty[GameRules.MapChapter.GameDifficulty as keyof typeof MapInfoDifficulty];


        //回合数量修改
        let round_class = MapInfoDifficultyData.round_class;


        // 回合内怪物信息
        for (let key in MapInfoRound) {
            let TwiceMapInfoRoundInit = MapInfoRound[key as keyof typeof MapInfoRound];
            //抽取那一拨怪物作为小怪
            if (TwiceMapInfoRoundInit.round_class == round_class) {
                let monster_list_kyes = Object.keys(TwiceMapInfoRoundInit.monster_list);
                let new_monster_list: { [monster_index: string]: string } = {}
                let monster_list_key = "1";
                if (monster_list_kyes.length > 1) {
                    // let keys_index = RandomInt( 0 , monster_list_kyes.length - 1);
                    // let monster_list_key = monster_list_kyes[keys_index];
                    new_monster_list = {
                        "1": TwiceMapInfoRoundInit.monster_list[monster_list_key] as string
                    }
                } else {
                    new_monster_list = {
                        "1": TwiceMapInfoRoundInit.monster_list[monster_list_key] as string
                    }
                }
                //根据玩家数量修改上线
                let monster_count_list: { [index: string]: number } = {};
                monster_count_list["1"] = math.ceil(TwiceMapInfoRoundInit.monster_count_list[monster_list_key]
                    * GameRules.PUBLIC_CONST.PLAYER_COUNT_REF_MONSTER[this.player_count - 1])
                // TwiceMapInfoRoundInit.round_index;
                this.map_info_round[TwiceMapInfoRoundInit.round_index] = {
                    monster_type: TwiceMapInfoRoundInit.monster_type,
                    t_time: TwiceMapInfoRoundInit.t_time,
                    monster_list: new_monster_list,
                    interval_time: TwiceMapInfoRoundInit.interval_time,
                    monster_count_list: monster_count_list,
                    elite_name: TwiceMapInfoRoundInit.elite_name,
                    elite_count: TwiceMapInfoRoundInit.elite_count,
                    boss_name_list: TwiceMapInfoRoundInit.boss_name,
                }
            }
        }

        //回合数量修改
        this._round_max = MapInfoDifficultyData.round_max;
        //怪物数量修改
        this._unit_limit = MapInfoDifficultyData.unit_limit;
        //根据玩家数量修改上线
        this._unit_limit = math.floor(this._unit_limit + GameRules.PUBLIC_CONST.PLAYER_COUNT_MONSTER_MAX[this.player_count - 1]);
        //初始化刷怪
        GameRules.Spawn.OnSpawnLoadCoord();
        //初始化流程怪物
        GameRules.Spawn.SpawnInit();
    }

    OnSpawnLoadCoord() {
        for (let index = 0; index < 200; index++) {
            let _Vector = Vector(this._Vector.x + RandomInt(3300, 3800), this._Vector.y, 128);
            let RandomQAngle = 0;
            if (this._map_coord.length % 4 == 0) {
                RandomQAngle = RandomInt(0, 89);
            } else if (this._map_coord.length % 4 == 1) {
                RandomQAngle = RandomInt(90, 179);
            } else if (this._map_coord.length % 4 == 2) {
                RandomQAngle = RandomInt(180, 269);
            } else {
                RandomQAngle = RandomInt(270, 359);
            }
            let target_Vector = RotatePosition(Vector(this._Vector.x, this._Vector.y, 128), QAngle(0, RandomQAngle, 0), _Vector);
            let GridNavBool = GridNav.CanFindPath(target_Vector, Vector(this._Vector.x, this._Vector.y, 128));
            if (GridNavBool == false) {
                index--;
                continue;
            }
            this._map_coord.push(target_Vector);
        }
        return null;
    }
    /**
     *  怪物初始化
     */
    SpawnInit() {
        this._round_index = 0;
    }

    //刷怪总控
    StartSpawnControl() {
        GameRules.GetGameModeEntity().SetContextThink("StartSpawnControl", () => {
            GameRules.Spawn._round_index++;
            GameRules.GameInformation.GetPlayGameHeadData(-1, {})
            if (GameRules.Spawn._round_index) {
                GameRules.GetGameModeEntity().StopThink("CreateMonsterTime" + "_" + (this._round_index - 1));
                //普通小怪刷怪器
                GameRules.Spawn.CreateMonsterTime();

                GameRules.GetGameModeEntity().StopThink("CreateEliteTime" + "_" + (this._round_index - 1));
                //精英刷怪器
                GameRules.Spawn.CreateEliteTime();
                //boss刷怪器
                GameRules.GetGameModeEntity().StopThink("CreateBossTime" + "_" + (this._round_index - 1));
                //精英刷怪器
                GameRules.Spawn.CreateBossTime();
            }
            let boss_name_list = this.map_info_round[this._round_index].boss_name_list;
            let boss_name_list_index = RandomInt(0, boss_name_list.length - 1);
            let boss_name = boss_name_list[boss_name_list_index];
            if (boss_name == "null") {
                return 60;
            }else{
                return 120;
            }
        }, 0)
    }
    //普通小怪刷怪器
    CreateMonsterTime() {
        let player_count = GetPlayerCount();
        this._player_round_sum_kill = [];
        for (let index: PlayerID = 0; index < player_count; index++) {
            this._player_round_sum_kill.push(0);
        }
        //怪物数量 
        this._monster_count = 0;
        this._monster_count_interval = {};
        //普通怪总和
        for (let index = 1; index <= Object.keys(this.map_info_round[this._round_index].monster_count_list).length; index++) {
            this._monster_count += tonumber(this.map_info_round[this._round_index].monster_count_list[index.toString()])
            this._monster_count_interval[index.toString()] = this._monster_count;
        }
        // 使用完毕 进入冷却 
        let monster_t_time = this.map_info_round[this._round_index].t_time / this._monster_count;
        let interval_time = this.map_info_round[this._round_index].interval_time;

        let refresh_type = 1; // 1. 正在刷怪 2. 处于间隔冷却
        let monster_refresh_count = 0;//刷新总数
        let Heros = HeroList.GetAllHeroes();
        GameRules.GetGameModeEntity().SetContextThink("CreateMonsterTime" + "_" + this._round_index, () => {
            //精英怪刷新
            let _map_coord_index = RandomInt(0, 199);
            //基础怪
            if (refresh_type == 1) {  //只有刷怪阶段才出怪
                let _unit_limit = 60;
                if (this._round_index > 100) {
                    _unit_limit = GameRules.Spawn._unit_limit
                }
                if (GameRules.Spawn._spawn_count < _unit_limit) {
                    let _Vector = Vector()

                    //普通模式
                    _Vector = GameRules.Spawn._map_coord[_map_coord_index];
                    for (const Hero of Heros) {
                        let hOrigin = Hero.GetAbsOrigin();
                        let jl = (hOrigin - _Vector as Vector).Length2D();
                        if (jl <= 700) {
                            return 0.05;
                        }
                    }
                    // DebugDrawCircle(_Vector, Vector( 255, 0 ,0 ),50 ,100 ,true , 0.5)
                    monster_refresh_count++;
                    let bs_spawn_name = "npc_creature_normal_1";
                    //判断该出什么怪物
                    for (let index = 1; index <= Object.keys(GameRules.Spawn.map_info_round[this._round_index].monster_list).length; index++) {
                        if (monster_refresh_count <= GameRules.Spawn._monster_count_interval[index.toString()]) {
                            bs_spawn_name = GameRules.Spawn.map_info_round[this._round_index].monster_list[index.toString()]
                            break;
                        }
                    }
                    let unit = GameRules.Spawn.CreateMonster(bs_spawn_name, _Vector, this._round_index);
                    //必须存在才计数
                    if (unit) {
                        GameRules.Spawn._map_Spawn_list.push(unit);
                        GameRules.Spawn._spawn_count++;
                        GameRules.Spawn._spawn_num_count++;
                    }
                } else {
                    //1秒钟后再检测
                    return 1;
                }
            }
            //刷怪周期
            if (refresh_type == 1) {
                if (monster_refresh_count >= GameRules.Spawn._monster_count) {
                    refresh_type = 2;
                    monster_refresh_count = 0
                }
                return monster_t_time;
            }
            if (refresh_type == 2) {
                refresh_type = 1; //修改状态
                return interval_time;
            }
            return 1;
        }, 0)
    }
    //精英刷怪器
    CreateEliteTime() {
        if (this.map_info_round[this._round_index].elite_name == "null") {
            return;
        }
        let monster_count = this.map_info_round[this._round_index].elite_count;
        // 使用完毕 进入冷却 
        let monster_t_time = 60 / this._monster_count;
        let monster_refresh_count = 0;//刷新总数    
        GameRules.GetGameModeEntity().SetContextThink("CreateEliteTime" + "_" + this._round_index, () => {
            //精英怪刷新
            if (monster_refresh_count >= monster_count) {
                return null;
            } else {
                let coord_index = RandomInt(0, 199);
                let elite_Vector = GameRules.Spawn._map_coord[coord_index];
                let elite_spawn_name = GameRules.Spawn.map_info_round[this._round_index].elite_name;
                let unit = GameRules.Spawn.CreateMonster(elite_spawn_name, elite_Vector, this._round_index);
                this._map_elite_spawn_list.push(unit);
            }
            monster_refresh_count++;
            return monster_t_time;
        }, 0)
    }
    //boss定时器 
    CreateBossTime() {
        let boss_name_list = this.map_info_round[this._round_index].boss_name_list;
        let boss_name_list_index = RandomInt(0, boss_name_list.length - 1);
        let boss_name = boss_name_list[boss_name_list_index];
        if (boss_name == "null") {
            return
        }
        //半分钟提示
        GameRules.GetGameModeEntity().SetContextThink("BossHint" + "_" + this._round_index, () => {
            if(this._round_index >= this._round_max){
                GameRules.CMsg.SendMsgToAll(CGMessageEventType.MESSAGE4);
                GameRules.CMsg.SendCommonMsgToPlayer(
                    -1 as PlayerID,
                    "关底 BOSS即将来袭 ",
                    {}
                );
            }else{
                GameRules.CMsg.SendMsgToAll(CGMessageEventType.MESSAGE3);
                GameRules.CMsg.SendCommonMsgToPlayer(
                    -1 as PlayerID,
                    "BOSS即将来袭",
                    {}
                );
            }
            
            return null;
        }, 30)
        //登场
        GameRules.GetGameModeEntity().SetContextThink("CreateBossTime" + "_" + this._round_index, () => {
            GameRules.Spawn.CreateBoss();
            return null;
        }, 57)
        //结束
        GameRules.GetGameModeEntity().SetContextThink("GameOverTime", () => {
            //切换成正常倒计时
            GameRules.GetGameModeEntity().SetContextThink("CreateBossKillTime" + "_" + this._round_index, () => {
                //重新设置时间
                GameRules.GameInformation.boss_time = 0;
                GameRules.GameInformation.SetPlayGameTime(1);
                return null;
            }, 3)
            GameRules.MapChapter.GameLoser()
            return null;
        }, 120);
    }

    /**
     * 获取玩家怪物数量
     * @param player_id 
     * @param params 
     * @param callback 
     */
    // GetSpawnCount(player_id: PlayerID, params: GEFPD["Spawn"]["GetSpawnCount"], callback?) {
    //     CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(player_id), "Spawn_SpawnCount", {    
    //         data: {
    //             _spawn_count: this._map_timers_count
    //         }
    //     });
    // }
    //刷新游戏boss
    CreateBoss(): CDOTA_BaseNPC {
        if (this._map_boss_refresh == false) {

            GameRules.CMsg.SendCommonMsgToPlayer(
                -1 as PlayerID,
                "强力 boss即将来袭…… ",
                {}
            );
            GameRules.CMsg.SendMsgToAll(CGMessageEventType.WARNINGBOSS);
            let unit = GameRules.Spawn.CreepNormalCreate("npc_creature_boss_1", this.StageBossVector);

            this.MonsterAmend(unit, "boss", 1, 1);

            unit.AddNewModifier(unit, null, "modifier_custom_appearance_underground", { duration: 3 });

            GameRules.CMsg.SetBossHealthBar(unit);

            //切换成boss倒计时
            GameRules.GetGameModeEntity().SetContextThink("CreateBossTimeComeOnStage" + "_" + this._round_index, () => {
                //重新设置时间
                GameRules.GameInformation.boss_time = GameRules.GetDOTATime(false, false) + 60;
                GameRules.GameInformation.SetPlayGameTime(1);
                //击杀所有怪物 并停止怪物刷新
                GameRules.GetGameModeEntity().StopThink("CreateMonsterTime" + "_" + this._round_index);
                GameRules.GetGameModeEntity().StopThink("CreateEliteTime" + "_" + this._round_index);
                // boss击杀小怪
                for (let xgunit of GameRules.Spawn._map_Spawn_list) {
                    if (xgunit.IsNull() == false) {
                        xgunit.Kill(null , unit)
                    }
                }
                GameRules.Spawn._spawn_count = 0;
                GameRules.Spawn._map_Spawn_list = [];
                // boss击杀精英
                for (let jyunit of GameRules.Spawn._map_elite_spawn_list) {
                    if (jyunit.IsNull() == false) {
                        jyunit.Kill(null , unit)
                    }
                }
                GameRules.Spawn._map_Spawn_list = [];
                return null;
            }, 3)

            this._map_boss_unit = unit;
            this._map_boss_refresh = true;
            GameRules.GetGameModeEntity().StopThink("StartSpawnControl");
            return unit;
        }
    }
    //刷新小怪
    CreateMonster(bs_spawn_name: string, _Vector: Vector, round_index: number, is_mine_spawn: boolean = false, is_test: boolean = false): CDOTA_BaseNPC {
        // print("_Vector :" , _Vector )
        let unit = GameRules.Spawn.CreepNormalCreate(bs_spawn_name, _Vector);
        //属性修改
        this.MonsterAmend(unit, "normal", 1, round_index);
        return unit;
    }

    //刷新精英
    CreateEliteMonster(bs_spawn_name: string, _Vector: Vector, round_index: number): CDOTA_BaseNPC {
        // print("_Vector :" , _Vector )
        let unit = GameRules.Spawn.CreepNormalCreate(bs_spawn_name, _Vector);
        //属性修改
        this.MonsterAmend(unit, "elite", 1, round_index);
        return unit;
    }
    //记录修改血量波数
    endless_hp_index = -1
    /**
     * 统一的怪物数据修改
     * @param round_index 
     */
    MonsterAmend(hUnit: CDOTA_BaseNPC, type: 'boss' | 'leader' | 'normal' | 'elite', level: number = 1, round_index: number = 1) {

    }
    /**
     * 任务怪记录信息
     */
    task_monster_spawn_list: { [task_name: string]: CDOTA_BaseNPC[] } = {};
    task_timers_name_list: { [task_name: string]: string } = {};
    /**
     * 向目标单位周围刷新怪物 
     * @param target 目标单位
     * @param task_name 任务名 默认值 "" 当为 "" 时自动生成 , 传入同名任务则会重置当前任务设置信息 不会清理怪物 如果需要直接停止任务 需使用TaskSpawnStop方法
     * @param _round_index 可选参数 使用第几波怪物作为模板 默认值 0 当前波数
     * @param time_max 持续时间 默认值 30 秒 传入 0 则持续时间无限
     * @param interval  刷怪间隔 默认值 0.5秒 参数小于0.1 则会强制修改为0.1
     * @param count_max  怪物数量上线
     * @returns { task_name : string , timers_name : string} // 任务名 , 定时器方法
     */
    TargetTaskSpawnStart(target: CDOTA_BaseNPC, task_name: string = "", _round_index: number = 0, time_max = 30, interval: number = 0.5, count_max: number = 30): {
        task_name: string,
        timers_name: string,
    } {
        let time_count = 0;
        let monster_refresh_count = 0;
        if (task_name == "") {
            task_name = DoUniqueString("tms");
        }
        if (this.task_timers_name_list.hasOwnProperty(task_name)) {
            Timers.RemoveTimer(task_name)
            this.task_timers_name_list[task_name] == "";
        } else {
            this.task_timers_name_list[task_name] == "";
            this.task_monster_spawn_list[task_name] = [];
        }
        if (interval < 0.1) {
            interval = 0.1
        }
        let _monster_count_interval = {};
        let _monster_count = 0;
        if (_round_index == 0) {
            _round_index = this._round_index
        }
        //普通怪总和
        for (let index = 1; index <= Object.keys(this.map_info_round[_round_index].monster_count_list).length; index++) {
            _monster_count += tonumber(this.map_info_round[_round_index].monster_count_list[index.toString()])
            _monster_count_interval[index.toString()] = _monster_count;
        }
        //以定时任务启动
        let timers_name = Timers.CreateTimer(0, () => {
            //时间到
            if (time_count >= time_max && time_max != 0) {
                Timers.RemoveTimer(this.task_timers_name_list[task_name]);
                delete this.task_timers_name_list[task_name];
                //移除怪物
                for (const monster of this.task_monster_spawn_list[task_name]) {
                    // UnitOperation.CreepNormalRemoveSelf(monster);
                }
                delete this.task_monster_spawn_list[task_name];
                return null;
            }
            if (target && target.IsAlive()) {
                if (this.task_monster_spawn_list[task_name].length >= count_max && count_max == 0) {
                    time_count += interval;
                    return interval;
                }
                let h_Vector = target.GetOrigin();
                let new_Vector = Vector(h_Vector.x + RandomInt(1100, 1300), h_Vector.y, 128);
                let target_Vector = Vector();
                let GridNavBool = false;
                let QAngleRandomInt = RandomInt(0, 359);
                //先随机一次 看是否成功
                target_Vector = RotatePosition(Vector(h_Vector.x, h_Vector.y, 128), QAngle(0, QAngleRandomInt, 0), new_Vector);
                if (GridNav.CanFindPath(target_Vector, Vector(this._Vector.x, this._Vector.y, 128))) {
                    GridNavBool = true;
                } else {
                    //不行转圈
                    for (let index = 0; index < 3; index++) {
                        target_Vector = RotatePosition(Vector(h_Vector.x, h_Vector.y, 128), QAngle(0, QAngleRandomInt + (90 * (index + 1)), 0), new_Vector);
                        if (GridNav.CanFindPath(target_Vector, Vector(this._Vector.x, this._Vector.y, 128))) {
                            GridNavBool = true;
                            break;
                        }
                    }
                }
                if (GridNavBool == false) {
                    time_count += interval;
                    return interval
                }
                //判断该出什么怪物
                let bs_spawn_name = "npc_creature_normal_1";

                for (let index = 1; index <= Object.keys(this.map_info_round[_round_index].monster_list).length; index++) {
                    //怪物上线问题
                    if (monster_refresh_count <= _monster_count_interval[index.toString()]) {
                        if (Object.keys(this.map_info_round[_round_index].monster_list).length == index
                            && monster_refresh_count == _monster_count_interval[index.toString()]) {
                            monster_refresh_count = 0;
                        }
                        bs_spawn_name = this.map_info_round[_round_index].monster_list[index.toString()]
                        break;
                    }
                }
                let unit = GameRules.Spawn.CreateMonster(bs_spawn_name, target_Vector, _round_index, true, false);
                // unit.task_name = task_name;
                this.task_monster_spawn_list[task_name].push(unit);
                time_count += interval;
                return interval;
            } else {
                time_count += interval;
                return interval;
            }
        });
        this.task_timers_name_list[task_name] = timers_name;
        return {
            task_name: task_name,
            timers_name: timers_name,
        }
    }
    /**
     * 停止任务刷怪 或清理当前任务所残留的怪物 通用各种刷怪任务
     * @param task_name 任务名
     */
    TaskSpawnStop(task_name: string) {
        //停止定时器
        if (this.task_timers_name_list[task_name]) {
            let timers_name = this.task_timers_name_list[task_name];
            Timers.RemoveTimer(timers_name)
            delete this.task_timers_name_list[task_name];
        }
        //移除怪物
        if (this.task_monster_spawn_list[task_name] && this.task_monster_spawn_list[task_name].length > 0) {
            for (const monster of this.task_monster_spawn_list[task_name]) {
                // UnitOperation.CreepNormalRemoveSelf(monster);
            }
            delete this.task_monster_spawn_list[task_name];
        }
    }

    /**
     * 向目标单位周围一次性刷怪
     * @param target 目标单位
     * @param task_name 任务名 传入同名任务则会增加到同一任务怪物数组中去 如果需要清理怪物 需使用TaskSpawnStop方法
     * @param count 刷怪总数
     * @param interval  刷怪间隔 默认值 0.5秒 参数小于0.1 则会强制修改为0.1
     * @param _round_index 可选参数 使用第几波怪物作为模板 默认值 0 当前波数
     * @returns  task_name 任务名 
     */
    TargetTaskSpawnDisposable(target: CDOTA_BaseNPC, task_name: string, count: number = 10, interval: number = 0.5, _round_index: number = 0):
        string {
        let f_count = 0;
        let monster_refresh_count = 0;
        if (task_name == "") {
            task_name = DoUniqueString("tms");
        }
        let _monster_count_interval = {};
        let _monster_count = 0;
        if (_round_index == 0) {
            _round_index = this._round_index
        }
        if (interval < 0.1) {
            interval = 0.1
        }
        if (this.task_timers_name_list.hasOwnProperty(task_name)) {
            Timers.RemoveTimer(task_name)
        } else {
            this.task_monster_spawn_list[task_name] = [];
        }
        //普通怪总和
        for (let index = 1; index <= Object.keys(this.map_info_round[_round_index].monster_count_list).length; index++) {
            _monster_count += tonumber(this.map_info_round[_round_index].monster_count_list[index.toString()])
            _monster_count_interval[index.toString()] = _monster_count;
        }
        //以定时任务启动
        let timers_name = Timers.CreateTimer(0, () => {
            if (f_count >= count) {
                return null;
            }
            if (IsValid(target)) {
                return null;
            }
            if (target && target.IsAlive()) {
                let h_Vector = target.GetOrigin();
                let new_Vector = Vector(h_Vector.x + RandomInt(1100, 1300), h_Vector.y, 128);
                let target_Vector = Vector();
                let GridNavBool = false;
                let QAngleRandomInt = RandomInt(0, 359);
                //先随机一次 看是否成功
                target_Vector = RotatePosition(Vector(h_Vector.x, h_Vector.y, 128), QAngle(0, QAngleRandomInt, 0), new_Vector);
                if (GridNav.CanFindPath(target_Vector, Vector(this._Vector.x, this._Vector.y, 128))) {
                    GridNavBool = true;
                } else {
                    //不行转圈
                    for (let index = 0; index < 3; index++) {
                        target_Vector = RotatePosition(Vector(h_Vector.x, h_Vector.y, 128), QAngle(0, QAngleRandomInt + (90 * (index + 1)), 0), new_Vector);
                        if (GridNav.CanFindPath(target_Vector, Vector(this._Vector.x, this._Vector.y, 128))) {
                            GridNavBool = true;
                            break;
                        }
                    }
                }
                if (GridNavBool == false) {
                    return interval
                }
                //判断该出什么怪物
                let bs_spawn_name = "npc_creature_normal_1";

                for (let index = 1; index <= Object.keys(this.map_info_round[_round_index].monster_list).length; index++) {
                    //怪物上线问题
                    if (monster_refresh_count <= _monster_count_interval[index.toString()]) {
                        if (Object.keys(this.map_info_round[_round_index].monster_list).length == index
                            && monster_refresh_count == _monster_count_interval[index.toString()]) {
                            monster_refresh_count = 0;
                        }
                        bs_spawn_name = this.map_info_round[_round_index].monster_list[index.toString()]
                        break;
                    }

                }
                let unit = GameRules.Spawn.CreateMonster(bs_spawn_name, target_Vector, _round_index, true, false);
                // unit.task_name = task_name;
                this.task_monster_spawn_list[task_name].push(unit);
                f_count++;
                return interval;
            } else {
                delete this.task_timers_name_list[task_name];
                return null;
            }
        });
        this.task_timers_name_list[task_name] = timers_name;
        return task_name;
    }
    /**
     * 暂时停止游戏 并开启商店
     */
    TemporarilyStopTheGame() {
        GameRules.GetGameModeEntity().SetContextThink("StopAllSpawnAndMonster", () => {
            GameRules.GetGameModeEntity().StopThink("StartSpawnControl");
            GameRules.GetGameModeEntity().StopThink("CreateMonsterTime" + "_" + this._round_index);
            GameRules.GetGameModeEntity().StopThink("CreateEliteTime" + "_" + this._round_index);
            GameRules.GetGameModeEntity().StopThink("CreateBossTime" + "_" + this._round_index);
            GameRules.GetGameModeEntity().StopThink("GameOverTime");
            // 清理小怪
            for (let unit of this._map_Spawn_list) {
                if (unit.IsNull() == false) {
                    //是通过击杀boss    
                    GameRules.Spawn.CreepNormalRemoveSelf(unit, 0.1);
                    this._spawn_count = 0;
                    this._map_Spawn_list = [];
                }
            }
            //清理精英
            for (let unit of GameRules.Spawn._map_elite_spawn_list) {
                if (unit.IsNull() == false) {
                    //是通过击杀boss    
                    GameRules.Spawn.CreepNormalRemoveSelf(unit, 0.1);
                }
            }
            GameRules.CMsg.SendCommonMsgToPlayer(
                -1 as PlayerID,
                "即将开启灵魂商店，可自行购买灵魂道具…… ",
                {}
            );
            GameRules.CMsg.SendMsgToAll(CGMessageEventType.MESSAGE5);
            GameRules.GetGameModeEntity().SetContextThink("RefreshMysticalShopItem" + "_" + this._round_index, () => {
                for (let hHero of HeroList.GetAllHeroes()) {
                    GameRules.BuffManager.AddGeneralDebuff(hHero,hHero,DebuffTypes.un_controll , 10); 
                    // hHero.AddNewModifier(hHero, null, "modifier_debuff_rooted", { duration: 10, });
                }
                //重新设置时间
                GameRules.MysticalShopSystem.RefreshMysticalShopItem();
                return null;
            }, 3)
            return null
        }, 0)
    }


    //清空所有怪物
    StopAllSpawnAndMonster() {
        GameRules.GetGameModeEntity().SetContextThink("StopAllSpawnAndMonster", () => {
            GameRules.Spawn._game_start = false;
            GameRules.MapChapter._game_select_phase = 999;
            //禁用英雄技能
            for (const hero of HeroList.GetAllHeroes()) {
                for (let index = 0; index < 5; index++) {
                    hero.GetAbilityByIndex(index).SetActivated(false);
                }
            }
            //移除物品
            GameRules.ResourceSystem.RemoveAllDropItem()
            GameRules.MapChapter.GetGameSelectPhase(-1, {})
            //游戏结束
            GameRules.GetGameModeEntity().StopThink("StartSpawnControl");
            GameRules.GetGameModeEntity().StopThink("CreateMonsterTime" + "_" + this._round_index);
            GameRules.GetGameModeEntity().StopThink("CreateEliteTime" + "_" + this._round_index);
            GameRules.GetGameModeEntity().StopThink("CreateBossTime" + "_" + this._round_index);
            GameRules.GetGameModeEntity().StopThink("GameOverTime");
            // 清理小怪
            for (let unit of GameRules.Spawn._map_Spawn_list) {
                if (unit.IsNull() == false) {
                    //是通过击杀boss    
                    GameRules.Spawn.CreepNormalRemoveSelf(unit, 0.1);
                }
            }
            GameRules.Spawn._spawn_count = 0;
            GameRules.Spawn._map_Spawn_list = [];
            //清理精英
            for (let unit of GameRules.Spawn._map_elite_spawn_list) {
                if (unit.IsNull() == false) {
                    //是通过击杀boss    
                    GameRules.Spawn.CreepNormalRemoveSelf(unit, 0.1);
                }
            }
            GameRules.Spawn._map_elite_spawn_list = [];
            //清理boss
            if (this._map_boss_refresh && this._map_boss_unit != null) {
                GameRules.CMsg.RemoveBossHealthBar(this._map_boss_unit);
                GameRules.Spawn.CreepNormalRemoveSelf(this._map_boss_unit, 0.1);
                this._map_boss_unit = null;
                this._map_boss_refresh = false;
            }
            return null;
        }, 0)
    }
    /**
     * debug 命令
     */
    Debug(cmd: string, args: string[], player_id: PlayerID) {
        if (cmd == "-ss") {
            let round = parseInt(args[0])
        }
        if (cmd == "-ssi") {
            GameRules.Spawn.Init(GameRules.MapChapter.MAP_CAMP.x, GameRules.MapChapter.MAP_CAMP.y)
        }
        if (cmd == "-boss") {
            GameRules.Spawn.CreateBoss();
        }
        if (cmd == "-sg") {
            GameRules.Spawn.CreateMonsterTime()
        }
        if (cmd == "-st") {

        }
        if (cmd == "--_player_sum_kill") {
            print("_player_sum_kill :")
            DeepPrintTable(this._player_sum_kill)
        }

        if(cmd == "--StartSpawnControl"){
            GameRules.Spawn._round_index = 4;
            GameRules.Spawn.StartSpawnControl();
        }
    }


    CreepNormalCreate(unit_name: string, vPos: Vector, is_mine_spawn: boolean = false) {
        let unit = CreateUnitByName(
            unit_name,
            vPos,
            true,
            null,
            null,
            DotaTeam.BADGUYS
        );
        unit.enemy_attribute_value = {};
        unit.enemy_attribute_table_key = {};
        unit.enemy_attribute_table = {};
        unit.SpecialMark = {};
        // GameRules.EnemyAttribute.ModifyAttribute(unit,{
        //     'DamageBonusMul'
        // })
        return unit;
    }

    GeneralKilledEvent(entindex_killed: EntityIndex, entindex_attacker: EntityIndex, entindex_inflictor: EntityIndex) {
        let target = EntIndexToHScript(entindex_killed) as CDOTA_BaseNPC;
        let killer = EntIndexToHScript(entindex_attacker) as CDOTA_BaseNPC;


        if (target && target.HasAbility("public_immortal") && !target.IsHero()) {

        } else if (
            entindex_attacker != entindex_killed
            && !target.IsHero()
            && target.GetTeam() == DotaTeam.BADGUYS
        ) {
            // 怪物死亡通用处理 优先级最高 只用记录单位的增减数量  高于一切事件
            GameRules.Spawn.MapUnitKilledCalculate(target, killer);
            //用于处理经验增加 掉落 刷怪等 和一些事件
            GameRules.Spawn.MapUnitKilled(target, killer);
        } else if (target.IsHero()) {
            //英雄单位死亡处理
            GameRules.GameInformation.HeroDie(target , killer);
        }
    }



    /**
     * 只处理增加减少 不处理特殊数据 不要混放
     * @param target 
     * @param killer 
     */
    MapUnitKilledCalculate(target: CDOTA_BaseNPC, killer: CDOTA_BaseNPC) {
        if(killer.IsHero()){
            let player_id = killer.GetPlayerOwnerID();
            let unit_label = target.GetUnitLabel();
            //普通怪处理
            if (unit_label == "creatur_normal") {
                //击杀普通怪数量减少
                GameRules.Spawn._spawn_count--;
            }
            //计数器 用于计算每个玩家击杀怪物数量
            GameRules.Spawn._player_sum_kill[player_id]++;
            GameRules.Spawn._player_round_sum_kill[player_id]++;
        }
    }

    /**
     * 通关前同一击杀处理
     * @param target 目标
     * @param killer 击杀者
     */
    MapUnitKilled(target: CDOTA_BaseNPC, killer: CDOTA_BaseNPC) {
        //非英雄击杀
        if(!killer.IsHero()){
            let unit_label = target.GetUnitLabel();
            let name = target.GetUnitName();
            let KillExpDrop = UnitNormal[name as keyof typeof UnitNormal].KillExpDrop;
            let vect = target.GetAbsOrigin();
            if (unit_label == "creatur_normal") {
                let ExpType = GetCommonProbability(KillExpDrop);
                GameRules.ResourceSystem.DropResourceItem("TeamExp", vect, ExpType, killer);
            } else if (unit_label == "unit_elite"){
                let ExpType = GetCommonProbability(KillExpDrop);
                GameRules.ResourceSystem.DropResourceItem("TeamExp", vect, ExpType, killer);
            }
            return 
        }
        let player_id = killer.GetPlayerOwnerID();
        let unit_label = target.GetUnitLabel();
        //普通怪处理
        if (unit_label == "creatur_normal") {
            //判断是否掉落全体宝物箱 排除任务怪
            let vect = target.GetAbsOrigin();
            let name = target.GetUnitName();
            let KillExpDrop = UnitNormal[name as keyof typeof UnitNormal].KillExpDrop;
            let KillSoul = UnitNormal[name as keyof typeof UnitNormal].KillSoul;
            let ExpType = GetCommonProbability(KillExpDrop);
            GameRules.ResourceSystem.DropResourceItem("TeamExp", vect, ExpType, killer);
            GameRules.ResourceSystem.ModifyResource(player_id, {
                "Soul": KillSoul,
                "Kills": 1,
            })
            //处理数据
        } else if (unit_label == "unit_elite") {//unit_elite
            //判断是否掉落全体宝物箱 排除任务怪
            let vect = target.GetAbsOrigin();
            let name = target.GetUnitName();
            let KillExpDrop = EliteNormal[name as keyof typeof EliteNormal].KillExpDrop;
            let KillSoul = EliteNormal[name as keyof typeof EliteNormal].KillSoul;
            let ExpType = GetCommonProbability(KillExpDrop);
            GameRules.ResourceSystem.DropResourceItem("TeamExp", vect, ExpType, killer);
            GameRules.ResourceSystem.ModifyResource(player_id, {
                "Soul": KillSoul,
                "Kills": 1,
            })
        } else if (unit_label == "creature_boss") {//boss
            GameRules.Spawn.BossKill(target);
        }
        // 单位回收
        // GameRules.Spawn.CreepNormalRecovery(killed_unit);
    }


    //击杀boss
    BossKill(killed_unit: CDOTA_BaseNPC) {
        GameRules.CMsg.SendCommonMsgToPlayer(
            -1 as PlayerID,
            "boss已被击杀",
            {}
        );
        //切换成boss倒计时
        GameRules.GetGameModeEntity().SetContextThink("CreateBossKillTime" + "_" + this._round_index, () => {
            //重新设置时间
            GameRules.GameInformation.boss_time = 0;
            GameRules.GameInformation.SetPlayGameTime(1);
            return null;
        }, 3)
        GameRules.CMsg.RemoveBossHealthBar(killed_unit);
        //击杀boss奖励
        this._map_boss_unit = null;
        this._map_boss_refresh = false;
        if (GameRules.Spawn._round_index < GameRules.Spawn._round_max) {
            GameRules.Spawn.TemporarilyStopTheGame();
        } else {
            GameRules.MapChapter.GameWin();
        }
    }

    //移除单位
    CreepNormalRemoveSelf(hUnit: CDOTA_BaseNPC, out_time: number = 3, test_mode: boolean = false) {
        if (test_mode && hUnit) {
            hUnit.AddNoDraw();
            hUnit.SetUnitCanRespawn(false);
            hUnit.ForceKill(true);
        } else if (hUnit && !hUnit.UnitCanRespawn()) {
            hUnit.AddNoDraw();
            hUnit.SetUnitCanRespawn(false);
            hUnit.ForceKill(true);
        }
    }
}

