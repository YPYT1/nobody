/**
 * 地图模块化的一些测试方法
 */

import { reloadable } from '../../../utils/tstl-utils';
import { UIEventRegisterClass } from '../../class_extends/ui_event_register_class';
import * as UnitNormal from '../../../json/units/monster/normal.json';
import * as EliteNormal from '../../../json/units/monster/elite.json';
import * as BossNormal from '../../../json/units/monster/boss.json';
import * as MapInfoRound from '../../../json/config/map_info_round.json';
import * as MapInfoDifficulty from '../../../json/config/map_info_difficulty.json';
import * as EliteAbilities from '../../../json/abilities/creature/elite.json';

import * as PictuerCardData from '../../../json/config/server/picture/pictuer_card_data.json';

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
    _spawn_name: string = 'npc_creature_normal_1';
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
    _hp_equation: string = 'hp';
    //难度攻击公式
    _attack_equation: string = 'attack';
    //难度护甲公式
    _armor_equation: string = 'armor';
    //每波时间
    _round_time: number = 60;
    //回合分类
    _round_class: number = 1;
    //每组怪物集合
    _monster_count_interval: { [index: string]: number } = {};
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
            monster_list: {
                //怪物数组
                [monster_index: string]: string;
            };
            monster_count_list: {
                [monster_index: string]: number;
            };
            monster_hp: number; //普通怪物血量
            monster_attack: number; //普通怪物血量
            monster_KillExpDrop: number[]; //普通怪物掉落
            monster_KillSoul: number; //普通怪物灵魂
            elite_name: string; //精英怪名字
            elite_count: number; //精英数量
            elite_hp: number; //精英怪血量
            elite_attack: number; //精英攻击力
            elite_KillExpDrop: number[]; //精英掉落
            elite_KillSoul: number; //精英灵魂
            boss_name_list: string[]; //boss名字列表
            boss_hp: number; //boss基础血量
            boss_attack: number; //boss基础倍率
            boss_CElementResistance: number[];
            elite_CElementResistance: number[];
            monster_CElementResistance: number[];
        };
    } = {};

    //所有怪物血量换算公式
    _unit_hp_equation: {
        [name: string]: string;
    } = {};

    //所有怪物攻击换算公式
    _unit_attack_equation: {
        [name: string]: string;
    } = {};

    //所有怪物经验获取数组
    _unit_exp_list: {
        [name: string]: number;
    } = {};

    //所有怪物金币获取数组
    _unit_gold_list: {
        [name: string]: string;
    } = {};

    //玩家数量
    player_count = 6;

    _map_boss_unit: CDOTA_BaseNPC;

    _map_boss_refresh: boolean = false;

    _game_start: boolean = false;

    //刷新的boss名字
    _game_boss_name: string = 'npc_creature_boss_1';

    //最大回合数
    _round_max: number = 20;

    //boss存在时间
    _game_boss_time: number = 180;

    //玩家是否死亡
    player_round_die: number[] = [];

    //玩家卡片掉落
    player_card_drop: {
        [item_id: string]: number;
    }[] = [];

    //怪物卡片稀有度获取
    _pictuer_card_data_rarity: {
        [item_id: string]: number;
    } = {};

    //稀有度概率
    _pictuer_rarity_pro: number[] = [1000, 1000, 1000, 500, 200, 1000];
    //怪物对应卡片
    _normal_card_data: {
        [name: string]: string;
    } = {};

    //最终boss击杀奖励池 获取当前所有卡片
    _pass_card_id_list: string[][] = [];
    //最终boss击杀奖励池概率
    _pass_card_id_pro: number[] = [];
    //击杀boss次数
    _kill_boss_count = 0;
    //击杀boss总数
    _boss_count = 0;
    constructor() {
        super('Spawn', true);
        for (const key in PictuerCardData) {
            const pic_data = PictuerCardData[key as keyof typeof PictuerCardData];
            this._pictuer_card_data_rarity[key] = pic_data.rarity;
        }
        for (const key in EliteAbilities) {
            const init = EliteAbilities[key as keyof typeof EliteAbilities];
            if (init.is_pass == 1) {
                this._elite_abi_list_.pass.push(key);
            } else {
                this._elite_abi_list_.no_pass.push(key);
            }
        }
        //卡片掉落信息
        for (const key in UnitNormal) {
            this._normal_card_data[key] = tostring(UnitNormal[key as keyof typeof UnitNormal].card_id);
        }
        for (const key in EliteNormal) {
            this._normal_card_data[key] = tostring(EliteNormal[key as keyof typeof EliteNormal].card_id);
        }
        for (const key in BossNormal) {
            this._normal_card_data[key] = tostring(BossNormal[key as keyof typeof BossNormal].card_id);
        }
        for (let index = 0; index < 7; index++) {
            this._pass_card_id_pro.push(0);
        }
    }

    //精英技能集合
    _elite_abi_list_: {
        pass: string[];
        no_pass: string[];
    } = {
        pass: [],
        no_pass: [],
    };

    //初始化地图信息
    Init(x: number, y: number) {
        //玩家通关卡片掉落
        this._pass_card_id_pro = [];
        this._pass_card_id_list = [];

        for (let index = 0; index < 7; index++) {
            this._pass_card_id_pro.push(0);
            this._pass_card_id_list.push([]);
        }
        //关卡boss
        this.StageBossVector = Vector(x, y, 0);
        this.player_count = GetPlayerCount();
        this._Vector = Vector(x, y, 128);
        GameRules.Spawn.player_round_die = [];
        this.player_card_drop = [];
        this._kill_boss_count = 0;
        //击杀计数器 卡片掉落
        for (let index: PlayerID = 0; index < this.player_count; index++) {
            this.player_card_drop.push({});
            GameRules.Spawn.player_round_die.push(1);
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
            const init = UnitNormal[key as keyof typeof UnitNormal];
            if (init.hasOwnProperty('HealthEquation')) {
                this._unit_hp_equation[key] = init['HealthEquation'];
            }
            if (init.hasOwnProperty('AttackEquation')) {
                this._unit_attack_equation[key] = init['AttackEquation'];
            }
            if (init.hasOwnProperty('KillExp')) {
                this._unit_exp_list[key] = init['KillExp'];
            }
            if (init.hasOwnProperty('KillBounty')) {
                this._unit_gold_list[key] = init['KillBountyRange'];
            }
        }
        //查找当前地图

        const MapInfoDifficultyData = MapInfoDifficulty[GameRules.MapChapter.GameDifficulty as keyof typeof MapInfoDifficulty];

        //难度血量公式
        this._hp_equation = MapInfoDifficultyData.hp_equation;
        this._attack_equation = MapInfoDifficultyData.attack_equation;
        this._round_time = MapInfoDifficultyData.round_time;

        //回合数量修改
        const round_class = MapInfoDifficultyData.round_class;

        // 回合内怪物信息
        for (const key in MapInfoRound) {
            const TwiceMapInfoRoundInit = MapInfoRound[key as keyof typeof MapInfoRound];
            //抽取那一拨怪物作为小怪
            if (TwiceMapInfoRoundInit.round_class == round_class) {
                const monster_list_kyes = Object.keys(TwiceMapInfoRoundInit.monster_list);
                let new_monster_list: { [monster_index: string]: string } = {};
                //根据玩家数量修改上线
                const monster_count_list: { [index: string]: number } = {};
                if (monster_list_kyes.length == 1) {
                    // let keys_index = RandomInt( 0 , monster_list_kyes.length - 1);
                    // let monster_list_key = monster_list_kyes[keys_index];
                    new_monster_list = {
                        '1': TwiceMapInfoRoundInit.monster_list['1'] as string,
                    };
                    GameRules.Spawn.AddPassCard(TwiceMapInfoRoundInit.monster_list['1']);
                    monster_count_list['1'] = math.ceil(TwiceMapInfoRoundInit.monster_count_list['1']);
                } else {
                    for (let index = 1; index <= monster_list_kyes.length; index++) {
                        new_monster_list[index.toString()] = TwiceMapInfoRoundInit.monster_list[index.toString()];
                        GameRules.Spawn.AddPassCard(TwiceMapInfoRoundInit.monster_list[index.toString()]);
                        monster_count_list[index.toString()] = math.ceil(
                            TwiceMapInfoRoundInit.monster_count_list[index.toString()] *
                                GameRules.PUBLIC_CONST.PLAYER_COUNT_REF_MONSTER[this.player_count - 1]
                        );
                    }
                }
                if (TwiceMapInfoRoundInit.elite_name != 'null') {
                    GameRules.Spawn.AddPassCard(TwiceMapInfoRoundInit.elite_name);
                }
                // TwiceMapInfoRoundInit.round_index;
                this.map_info_round[TwiceMapInfoRoundInit.round_index] = {
                    monster_type: TwiceMapInfoRoundInit.monster_type,
                    t_time: TwiceMapInfoRoundInit.t_time,
                    monster_list: new_monster_list,
                    monster_hp: TwiceMapInfoRoundInit.monster_hp,
                    monster_attack: TwiceMapInfoRoundInit.monster_attack,
                    monster_KillExpDrop: TwiceMapInfoRoundInit.monster_KillExpDrop,
                    monster_KillSoul: TwiceMapInfoRoundInit.monster_KillSoul,
                    interval_time: TwiceMapInfoRoundInit.interval_time,
                    monster_count_list: monster_count_list,
                    elite_name: TwiceMapInfoRoundInit.elite_name,
                    elite_count: TwiceMapInfoRoundInit.elite_count,
                    elite_hp: TwiceMapInfoRoundInit.elite_hp,
                    elite_attack: TwiceMapInfoRoundInit.elite_attack,
                    elite_KillExpDrop: TwiceMapInfoRoundInit.elite_KillExpDrop,
                    elite_KillSoul: TwiceMapInfoRoundInit.elite_KillSoul,
                    boss_name_list: TwiceMapInfoRoundInit.boss_name,
                    boss_hp: TwiceMapInfoRoundInit.boss_hp,
                    boss_attack: TwiceMapInfoRoundInit.boss_attack,
                    boss_CElementResistance: TwiceMapInfoRoundInit.boss_CElementResistance,
                    elite_CElementResistance: TwiceMapInfoRoundInit.elite_CElementResistance,
                    monster_CElementResistance: TwiceMapInfoRoundInit.monster_CElementResistance,
                };
            }
        }
        //回合数量修改
        this._round_max = MapInfoDifficultyData.round_max;
        //怪物数量修改
        this._unit_limit = MapInfoDifficultyData.unit_limit;
        //根据玩家数量修改上线
        this._unit_limit = math.floor(this._unit_limit + GameRules.PUBLIC_CONST.PLAYER_COUNT_MONSTER_MAX[this.player_count - 1]);
        //初始化刷怪
        // GameRules.Spawn.OnSpawnLoadCoord();
        //初始化流程怪物
        // GameRules.Spawn.SpawnInit();
    }

    /**
     * 通关boss掉落卡片数据
     * @param name
     */
    AddPassCard(name: string) {
        if (GameRules.Spawn._normal_card_data.hasOwnProperty(name)) {
            const item_id_str = GameRules.Spawn._normal_card_data[name];
            const item_id_r = GameRules.Spawn._pictuer_card_data_rarity[item_id_str];
            if (!GameRules.Spawn._pass_card_id_list[item_id_r].includes(item_id_str)) {
                GameRules.Spawn._pass_card_id_list[item_id_r].push(item_id_str);
                if (GameRules.Spawn._pass_card_id_pro[item_id_r] == 0) {
                    let pro = 0;
                    if (item_id_r == 2) {
                        pro = 66;
                    }
                    if (item_id_r == 3) {
                        pro = 30;
                    }
                    if (item_id_r == 4) {
                        pro = 3;
                    }
                    if (item_id_r == 5) {
                        pro = 1;
                    }
                    GameRules.Spawn._pass_card_id_pro[item_id_r] = pro;
                }
            }
        }
    }

    OnSpawnLoadCoord() {
        //重置地图上小怪坐标
        this._map_coord = [];
        for (let index = 0; index < 200; index++) {
            const _Vector = Vector(this._Vector.x + RandomInt(3300, 3800), this._Vector.y, 128);
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
            const target_Vector = RotatePosition(Vector(this._Vector.x, this._Vector.y, 128), QAngle(0, RandomQAngle, 0), _Vector);
            const GridNavBool = GridNav.CanFindPath(target_Vector, Vector(this._Vector.x, this._Vector.y, 128));
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
        GameRules.GetGameModeEntity().SetContextThink(
            'StartSpawnControl',
            () => {
                GameRules.Spawn._round_index++;
                if (GameRules.Spawn._round_index % 5 == 0) {
                    GameRules.CMsg.SendMsgToAll(CGMessageEventType.MESSAGE5);
                    GameRules.GetGameModeEntity().SetContextThink(
                        'RefreshMysticalShopItem' + '_' + this._round_index,
                        () => {
                            //重新设置时间
                            GameRules.MysticalShopSystem.RefreshMysticalShopItem();
                            return null;
                        },
                        3
                    );
                }
                GameRules.GameInformation.GetPlayGameHeadData(-1, {});
                const playercount = GetPlayerCount();
                for (let index = 0 as PlayerID; index < playercount; index++) {
                    const hHero = PlayerResource.GetSelectedHeroEntity(index);
                    //开摆
                    if (hHero.prop_count['prop_65'] && hHero.prop_count['prop_65'] > 0) {
                        hHero.prop_count['prop_65']--;
                        if (hHero.prop_count['prop_65'] == 0) {
                            GameRules.HeroTalentSystem.player_open_add[index] = false;
                            GameRules.HeroTalentSystem.GetSelectTalentData(index, {});
                            GameRules.CustomAttribute.DelAttributeInKey(hHero, 'shop_prop_65');
                        }
                    }
                    //肾上腺素
                    if (hHero.prop_count['prop_66'] && hHero.prop_count['prop_66'] > 0) {
                        hHero.prop_count['prop_66']--;
                        if (hHero.prop_count['prop_66'] == 0) {
                            GameRules.CustomAttribute.DelAttributeInKey(hHero, 'shop_prop_66');
                        }
                    }
                    //累积生存
                    if (hHero.rune_level_index['rune_112']) {
                        const kv_value = GameRules.RuneSystem.GetKvOfUnit_V2(hHero, 'rune_112', 'hp_pct');
                        hHero.rune_trigger_count['rune_112']++;
                        let value = hHero.rune_trigger_count['rune_112'] * kv_value;
                        //所有夜魇符文的累积的效果翻倍
                        if (hHero.rune_level_index['rune_118']) {
                            value = value * 2;
                        }
                        const attr_count: CustomAttributeTableType = {
                            MaxHealth: {
                                BasePercent: value,
                            },
                        };
                        GameRules.CustomAttribute.SetAttributeInKey(hHero, 'rune_112_MaxHealth', attr_count);
                    }
                    //砥砺前行
                    if (hHero.rune_level_index['rune_107']) {
                        if (GameRules.Spawn.player_round_die[index] == 1) {
                            const AHB_value = GameRules.RuneSystem.GetKvOfUnit_V2(hHero, 'rune_107', 'AHB');
                            const AIBP_value = GameRules.RuneSystem.GetKvOfUnit_V2(hHero, 'rune_107', 'AIBP');
                            hHero.rune_trigger_count['rune_107']++;
                            const AHB_value_1 = hHero.rune_trigger_count['rune_107'] * AHB_value;
                            const AIBP_value_1 = hHero.rune_trigger_count['rune_107'] * AIBP_value;
                            const attr_count: CustomAttributeTableType = {
                                AbilityHaste: {
                                    Base: AHB_value_1,
                                },
                                AbilityImproved: {
                                    Base: AIBP_value_1,
                                },
                            };
                            GameRules.CustomAttribute.SetAttributeInKey(hHero, 'rune_107_Attr', attr_count);
                        }
                    }
                    //重置死亡状态
                    GameRules.Spawn.player_round_die[index] = 1;
                }
                if (GameRules.Spawn._round_index) {
                    GameRules.GetGameModeEntity().StopThink('CreateMonsterTime' + '_' + (this._round_index - 1));
                    //普通小怪刷怪器
                    GameRules.Spawn.CreateMonsterTime();
                    GameRules.GetGameModeEntity().StopThink('CreateEliteTime' + '_' + (this._round_index - 1));
                    //精英刷怪器
                    GameRules.Spawn.CreateEliteTime();
                    //boss刷怪器
                    GameRules.GetGameModeEntity().StopThink('CreateBossTime' + '_' + (this._round_index - 1));
                    //boss刷怪器
                    GameRules.Spawn.CreateBossTime();
                    // 回合加速器
                    GameRules.BasicRules.CreateRoundAcceleration();
                }
                const boss_name_list = this.map_info_round[this._round_index].boss_name_list;
                const boss_name_list_index = RandomInt(0, boss_name_list.length - 1);
                const boss_name = boss_name_list[boss_name_list_index];
                if (boss_name == 'null') {
                    return this._round_time;
                } else {
                    return this._round_time + this._game_boss_time;
                }
            },
            0
        );
    }

    //普通小怪刷怪器
    CreateMonsterTime() {
        const player_count = GetPlayerCount();
        this._player_round_sum_kill = [];
        for (let index: PlayerID = 0; index < player_count; index++) {
            this._player_round_sum_kill.push(0);
        }
        //怪物数量
        this._monster_count = 0;
        this._monster_count_interval = {};
        //普通怪总和
        for (let index = 1; index <= Object.keys(this.map_info_round[this._round_index].monster_count_list).length; index++) {
            this._monster_count += tonumber(this.map_info_round[this._round_index].monster_count_list[index.toString()]);
            this._monster_count_interval[index.toString()] = this._monster_count;
        }
        // 使用完毕 进入冷却
        const monster_t_time = this.map_info_round[this._round_index].t_time / this._monster_count;
        const interval_time = this.map_info_round[this._round_index].interval_time;

        let refresh_type = 1; // 1. 正在刷怪 2. 处于间隔冷却
        let monster_refresh_count = 0; //刷新总数
        const Heros = HeroList.GetAllHeroes();
        GameRules.GetGameModeEntity().SetContextThink(
            'CreateMonsterTime' + '_' + this._round_index,
            () => {
                //精英怪刷新
                const _map_coord_index = RandomInt(0, 199);
                //基础怪
                if (refresh_type == 1) {
                    //只有刷怪阶段才出怪
                    let _unit_limit = 60;
                    if (this._round_index > 100) {
                        _unit_limit = GameRules.Spawn._unit_limit;
                    }
                    if (GameRules.Spawn._spawn_count < _unit_limit) {
                        let _Vector = Vector();

                        //普通模式
                        _Vector = GameRules.Spawn._map_coord[_map_coord_index];
                        for (const Hero of Heros) {
                            const hOrigin = Hero.GetAbsOrigin();
                            const jl = ((hOrigin - _Vector) as Vector).Length2D();
                            if (jl <= 700) {
                                return 0.05;
                            }
                        }
                        // DebugDrawCircle(_Vector, Vector( 255, 0 ,0 ),50 ,100 ,true , 0.5)
                        monster_refresh_count++;
                        let bs_spawn_name = 'npc_creature_normal_1';
                        //判断该出什么怪物
                        for (let index = 1; index <= Object.keys(GameRules.Spawn.map_info_round[this._round_index].monster_list).length; index++) {
                            if (monster_refresh_count <= GameRules.Spawn._monster_count_interval[index.toString()]) {
                                bs_spawn_name = GameRules.Spawn.map_info_round[this._round_index].monster_list[index.toString()];
                                break;
                            }
                        }
                        const unit = GameRules.Spawn.CreateMonster(bs_spawn_name, _Vector, this._round_index);
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
                        monster_refresh_count = 0;
                    }
                    return monster_t_time;
                }
                if (refresh_type == 2) {
                    refresh_type = 1; //修改状态
                    return interval_time;
                }
                return 1;
            },
            0
        );
    }

    //精英刷怪器
    CreateEliteTime() {
        if (this.map_info_round[this._round_index].elite_name == 'null') {
            return;
        }
        const monster_count = this.map_info_round[this._round_index].elite_count;
        // 使用完毕 进入冷却
        const monster_t_time = this._round_time / this._monster_count;
        let monster_refresh_count = 0; //刷新总数
        GameRules.GetGameModeEntity().SetContextThink(
            'CreateEliteTime' + '_' + this._round_index,
            () => {
                //精英怪刷新
                if (monster_refresh_count >= monster_count) {
                    return null;
                } else {
                    const elite_spawn_name = GameRules.Spawn.map_info_round[GameRules.Spawn._round_index].elite_name;
                    GameRules.Spawn.CreateElite(elite_spawn_name);
                }
                monster_refresh_count++;
                return monster_t_time;
            },
            0
        );
    }

    //创建精英怪方法
    CreateElite(elite_spawn_name: string) {
        const coord_index = RandomInt(0, 199);
        const elite_Vector = GameRules.Spawn._map_coord[coord_index];
        const unit = GameRules.Spawn.CreateEliteMonster(elite_spawn_name, elite_Vector, GameRules.Spawn._round_index);
        if (GameRules.MapChapter.GameDifficultyNumber > 101) {
            const long = GameRules.Spawn._elite_abi_list_.no_pass.length;
            const abl_i = RandomInt(0, long - 1);
            const no_pass_name = GameRules.Spawn._elite_abi_list_.no_pass[abl_i];
            //增加一个主动
            const AddAbility = unit.AddAbility(no_pass_name);
            AddAbility.SetLevel(1);
        }
        if (GameRules.MapChapter.GameDifficultyNumber >= 133) {
            //增加一个被动
            const long = GameRules.Spawn._elite_abi_list_.pass.length;
            const abl_i = RandomInt(0, long - 1);
            const pass_name = GameRules.Spawn._elite_abi_list_.pass[abl_i];
            const AddAbility = unit.AddAbility(pass_name);
            AddAbility.SetLevel(1);
        }
        this._map_elite_spawn_list.push(unit);
    }

    //boss定时器
    CreateBossTime() {
        const boss_name_list = this.map_info_round[this._round_index].boss_name_list;
        const boss_name_list_index = RandomInt(0, boss_name_list.length - 1);
        const boss_name = boss_name_list[boss_name_list_index];
        if (boss_name == 'null') {
            return;
        }
        GameRules.Spawn._game_boss_name = boss_name;
        GameRules.Spawn.AddPassCard(GameRules.Spawn._game_boss_name);
        //半分钟提示
        GameRules.GetGameModeEntity().SetContextThink(
            'BossHint' + '_' + this._round_index,
            () => {
                if (this._round_index >= this._round_max) {
                    GameRules.CMsg.SendMsgToAll(CGMessageEventType.MESSAGE4);
                    // GameRules.CMsg.SendCommonMsgToPlayer(
                    //     -1 as PlayerID,
                    //     "关底 BOSS即将来袭 ",
                    //     {}
                    // );
                } else {
                    GameRules.CMsg.SendMsgToAll(CGMessageEventType.MESSAGE3);
                    // GameRules.CMsg.SendCommonMsgToPlayer(
                    //     -1 as PlayerID,
                    //     "BOSS即将来袭",
                    //     {}
                    // );
                }

                return null;
            },
            this._round_time / 2
        );
        //登场
        GameRules.GetGameModeEntity().SetContextThink(
            'CreateBossTime' + '_' + this._round_index,
            () => {
                GameRules.Spawn.CreateBoss();
                return null;
            },
            this._round_time - 3
        );
        //结束
        GameRules.GetGameModeEntity().SetContextThink(
            'GameOverTime',
            () => {
                //切换成正常倒计时
                GameRules.GetGameModeEntity().SetContextThink(
                    'CreateBossKillTime' + '_' + this._round_index,
                    () => {
                        //重新设置时间
                        GameRules.GameInformation.boss_time = 0;
                        GameRules.GameInformation.SetPlayGameTime(0);
                        return null;
                    },
                    3
                );
                GameRules.MapChapter.GameLoser();
                return null;
            },
            this._round_time + this._game_boss_time
        );
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
    CreateBoss(boss_name = ''): CDOTA_BaseNPC {
        if (this._map_boss_refresh == false) {
            // GameRules.CMsg.SendCommonMsgToPlayer(
            //     -1 as PlayerID,
            //     "强力 boss即将来袭…… ",
            //     {}
            // );
            GameRules.CMsg.SendMsgToAll(CGMessageEventType.WARNINGBOSS);

            let unit: CDOTA_BaseNPC;
            if (boss_name != '') {
                unit = GameRules.Spawn.CreepNormalCreate(boss_name, this.StageBossVector);
            } else {
                unit = GameRules.Spawn.CreepNormalCreate(GameRules.Spawn._game_boss_name, this.StageBossVector);
            }
            GameRules.EnemyAttribute.SetCastAnimation(unit);

            this.MonsterAmend(unit, 'boss', 1, this._round_index);
            unit.AddNewModifier(unit, null, 'modifier_state_boss_growup', {});
            unit.AddNewModifier(unit, null, 'modifier_custom_appearance_underground', { duration: 3 });
            if (IsInToolsMode()) {
                unit.SetControllableByPlayer(0, false);
            }
            GameRules.CMsg.SetBossHealthBar(unit);

            //切换成boss倒计时
            GameRules.GetGameModeEntity().SetContextThink(
                'CreateBossTimeComeOnStage' + '_' + this._round_index,
                () => {
                    //重新设置时间
                    GameRules.GameInformation.boss_time = GameRules.GetDOTATime(false, false) + this._game_boss_time;
                    GameRules.GameInformation.SetPlayGameTime(1);
                    //击杀所有怪物 并停止怪物刷新
                    GameRules.GetGameModeEntity().StopThink('CreateMonsterTime' + '_' + this._round_index);
                    GameRules.GetGameModeEntity().StopThink('CreateEliteTime' + '_' + this._round_index);
                    // // boss击杀小怪
                    // for (let xgunit of GameRules.Spawn._map_Spawn_list) {
                    //     if (xgunit.IsNull() == false) {
                    //         xgunit.Kill(null , unit)
                    //     }
                    // }
                    // GameRules.Spawn._spawn_count = 0;
                    // GameRules.Spawn._map_Spawn_list = [];
                    // // boss击杀精英
                    // for (let jyunit of GameRules.Spawn._map_elite_spawn_list) {
                    //     if (jyunit.IsNull() == false) {
                    //         jyunit.Kill(null , unit)
                    //     }
                    // }
                    // GameRules.Spawn._map_Spawn_list = [];
                    return null;
                },
                3
            );

            this._map_boss_unit = unit;
            this._map_boss_refresh = true;
            GameRules.GetGameModeEntity().StopThink('StartSpawnControl');

            if (GameRules.Spawn._round_index < GameRules.Spawn._round_max) {
                // 小boss
                unit.SetIntAttr('is_final', 0);
            } else {
                // 尾王
                unit.SetIntAttr('is_final', 1);
            }

            return unit;
        }
    }

    //刷新小怪
    CreateMonster(
        bs_spawn_name: string,
        _Vector: Vector,
        round_index: number,
        is_mine_spawn: boolean = false,
        is_test: boolean = false
    ): CDOTA_BaseNPC {
        // print("_Vector :" , _Vector )
        const unit = GameRules.Spawn.CreepNormalCreate(bs_spawn_name, _Vector);

        GameRules.Spawn.map_info_round[this._round_index].monster_hp;
        //属性修改
        this.MonsterAmend(unit, 'normal', 1, round_index);
        return unit;
    }

    //刷新精英
    CreateEliteMonster(bs_spawn_name: string, _Vector: Vector, round_index: number): CDOTA_BaseNPC {
        // print("_Vector :" , _Vector )
        const unit = GameRules.Spawn.CreepNormalCreate(bs_spawn_name, _Vector);
        //属性修改
        this.MonsterAmend(unit, 'elite', 1, round_index);
        return unit;
    }

    //记录修改血量波数
    endless_hp_index = -1;
    /**
     * 统一的怪物数据修改
     * @param round_index
     */
    MonsterAmend(hUnit: CDOTA_BaseNPC, type: 'boss' | 'normal' | 'elite', level: number = 1, round_index: number = 1) {
        let healthmax = this.GetCurrentRoundHP(type, level, round_index);
        if (healthmax > 4200452371273100000) {
            healthmax = 4200452371273100000;
        }
        GameRules.Spawn.SetUnitHealthLimit(hUnit, healthmax);
        //攻击力
        const UnitDamage = this.GetCurrentRoundAttack(type, level, round_index);
        //人数加算 等级加算
        hUnit.SetBaseDamageMin(UnitDamage);
        hUnit.SetBaseDamageMax(UnitDamage);

        //设置怪物的波数
        hUnit.SetIntAttr('round_index', round_index);
        //设置抗性

        let _CElementResistance: number[];
        const map_info_round = GameRules.Spawn.map_info_round[round_index];
        if (type == 'boss') {
            _CElementResistance = map_info_round.boss_CElementResistance;
        } else if (type == 'elite') {
            _CElementResistance = map_info_round.elite_CElementResistance;
        } else if (type == 'normal') {
            _CElementResistance = map_info_round.monster_CElementResistance;
        }

        GameRules.EnemyAttribute.ModifyAttribute(hUnit, {
            FireResist: {
                Base: _CElementResistance[0],
            },
            IceResist: {
                Base: _CElementResistance[1],
            },
            ThunderResist: {
                Base: _CElementResistance[2],
            },
            WindResist: {
                Base: _CElementResistance[3],
            },
        });
    }

    /**
     * 获取加成后的血量
     * @param healthmax
     * @param type
     * @param level
     * @param round_index
     * @returns
     */
    GetCurrentRoundHP(type: 'boss' | 'normal' | 'elite', level: number = 1, round_index: number = 1): number {
        let healthmax = this.GetBaseMonsterHP(type, round_index);
        if (type == 'boss') {
            // healthmax = healthmax * GameRules.PUBLIC_CONST.PLAYER_COUNT_BOSS_HP[this.player_count - 1];
        } else if (type == 'elite') {
            // healthmax = healthmax * GameRules.PUBLIC_CONST.PLAYER_COUNT_LEADER_HP[this.player_count - 1]
        } else if (type == 'normal') {
            // healthmax = healthmax * GameRules.PUBLIC_CONST.PLAYER_COUNT_MONSTER_HP[this.player_count - 1]
        }
        //难度加算
        const eval_param = {
            hp: healthmax,
        };
        healthmax = LFUN.eval(this._hp_equation, eval_param);
        return healthmax;
    }

    /**
     * 获取怪物基础血量
     * @param type
     * @returns
     */
    GetBaseMonsterHP(type: 'boss' | 'normal' | 'elite', round_index: number = 1): number {
        let StatusHealth = 1;
        if (type == 'normal') {
            StatusHealth = GameRules.Spawn.map_info_round[round_index].monster_hp;
        } else if (type == 'elite') {
            StatusHealth = GameRules.Spawn.map_info_round[round_index].elite_hp;
        } else if (type == 'boss') {
            StatusHealth = GameRules.Spawn.map_info_round[round_index].boss_hp;
        }
        return StatusHealth;
    }

    /**
     * 获取加成后的攻击力
     * @param healthmax
     * @param type
     * @param level
     * @param round_index
     * @returns
     */
    GetCurrentRoundAttack(type: 'boss' | 'normal' | 'elite', level: number = 1, round_index: number = 1): number {
        let AttackMax = this.GetBaseMonsterAttack(type, round_index);
        //普通加成
        if (type == 'boss') {
            // healthmax = healthmax * GameRules.PUBLIC_CONST.PLAYER_COUNT_BOSS_HP[this.player_count - 1];
        } else if (type == 'elite') {
            // healthmax = healthmax * GameRules.PUBLIC_CONST.PLAYER_COUNT_LEADER_HP[this.player_count - 1]
        } else if (type == 'normal') {
            // healthmax = healthmax * GameRules.PUBLIC_CONST.PLAYER_COUNT_MONSTER_HP[this.player_count - 1]
        }
        //难度加算
        const eval_param = {
            attack: AttackMax,
        };
        AttackMax = LFUN.eval(this._attack_equation, eval_param);
        return AttackMax;
    }

    /**
     * 获取怪物基础攻击力
     * @param type
     * @returns
     */
    GetBaseMonsterAttack(type: 'boss' | 'normal' | 'elite', round_index: number = 1): number {
        let StatusAttack = 1;
        if (type == 'normal') {
            StatusAttack = GameRules.Spawn.map_info_round[round_index].monster_attack;
        } else if (type == 'elite') {
            StatusAttack = GameRules.Spawn.map_info_round[round_index].elite_attack;
        } else if (type == 'boss') {
            StatusAttack = GameRules.Spawn.map_info_round[round_index].boss_attack;
        }
        return StatusAttack;
    }

    /**
     * 设置单位的血量 （未实装可超出21亿）
     * @param hUnit
     * @param iHealth
     */
    SetUnitHealthLimit(hUnit: CDOTA_BaseNPC, iHealth: number) {
        const mul_power = iHealth / 2100000000;
        if (mul_power > 1) {
            const iMulte = math.ceil(mul_power);
            const iNewHealth = math.ceil(iHealth / iMulte);
            hUnit.SetBaseMaxHealth(iNewHealth);
            hUnit.SetMaxHealth(iNewHealth);
            hUnit.SetHealth(iNewHealth);
            hUnit.AddNewModifier(hUnit, null, 'modifier_common_mul_health', {
                iMulte: iMulte,
            });
        } else {
            hUnit.SetBaseMaxHealth(iHealth);
            hUnit.SetMaxHealth(iHealth);
            hUnit.SetHealth(iHealth);
        }
        return hUnit;
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
    TargetTaskSpawnStart(
        target: CDOTA_BaseNPC,
        task_name: string = '',
        _round_index: number = 0,
        time_max = 30,
        interval: number = 0.5,
        count_max: number = 30
    ): {
        task_name: string;
        timers_name: string;
    } {
        let time_count = 0;
        let monster_refresh_count = 0;
        if (task_name == '') {
            task_name = DoUniqueString('tms');
        }
        if (this.task_timers_name_list.hasOwnProperty(task_name)) {
            Timers.RemoveTimer(task_name);
            this.task_timers_name_list[task_name] == '';
        } else {
            this.task_timers_name_list[task_name] == '';
            this.task_monster_spawn_list[task_name] = [];
        }
        if (interval < 0.1) {
            interval = 0.1;
        }
        const _monster_count_interval = {};
        let _monster_count = 0;
        if (_round_index == 0) {
            _round_index = this._round_index;
        }
        //普通怪总和
        for (let index = 1; index <= Object.keys(this.map_info_round[_round_index].monster_count_list).length; index++) {
            _monster_count += tonumber(this.map_info_round[_round_index].monster_count_list[index.toString()]);
            _monster_count_interval[index.toString()] = _monster_count;
        }
        //以定时任务启动
        const timers_name = Timers.CreateTimer(0, () => {
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
                const h_Vector = target.GetOrigin();
                const new_Vector = Vector(h_Vector.x + RandomInt(1100, 1300), h_Vector.y, 128);
                let target_Vector = Vector();
                let GridNavBool = false;
                const QAngleRandomInt = RandomInt(0, 359);
                //先随机一次 看是否成功
                target_Vector = RotatePosition(Vector(h_Vector.x, h_Vector.y, 128), QAngle(0, QAngleRandomInt, 0), new_Vector);
                if (GridNav.CanFindPath(target_Vector, Vector(this._Vector.x, this._Vector.y, 128))) {
                    GridNavBool = true;
                } else {
                    //不行转圈
                    for (let index = 0; index < 3; index++) {
                        target_Vector = RotatePosition(
                            Vector(h_Vector.x, h_Vector.y, 128),
                            QAngle(0, QAngleRandomInt + 90 * (index + 1), 0),
                            new_Vector
                        );
                        if (GridNav.CanFindPath(target_Vector, Vector(this._Vector.x, this._Vector.y, 128))) {
                            GridNavBool = true;
                            break;
                        }
                    }
                }
                if (GridNavBool == false) {
                    time_count += interval;
                    return interval;
                }
                //判断该出什么怪物
                let bs_spawn_name = 'npc_creature_normal_1';

                for (let index = 1; index <= Object.keys(this.map_info_round[_round_index].monster_list).length; index++) {
                    //怪物上线问题
                    if (monster_refresh_count <= _monster_count_interval[index.toString()]) {
                        if (
                            Object.keys(this.map_info_round[_round_index].monster_list).length == index &&
                            monster_refresh_count == _monster_count_interval[index.toString()]
                        ) {
                            monster_refresh_count = 0;
                        }
                        bs_spawn_name = this.map_info_round[_round_index].monster_list[index.toString()];
                        break;
                    }
                }
                const unit = GameRules.Spawn.CreateMonster(bs_spawn_name, target_Vector, _round_index, true, false);
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
        };
    }

    /**
     * 停止任务刷怪 或清理当前任务所残留的怪物 通用各种刷怪任务
     * @param task_name 任务名
     */
    TaskSpawnStop(task_name: string) {
        //停止定时器
        if (this.task_timers_name_list[task_name]) {
            const timers_name = this.task_timers_name_list[task_name];
            Timers.RemoveTimer(timers_name);
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
     * 向目标单位周围一次性刷怪s
     * @param target 目标单位
     * @param task_name 任务名 传入同名任务则会增加到同一任务怪物数组中去 如果需要清理怪物 需使用TaskSpawnStop方法
     * @param count 刷怪总数
     * @param interval  刷怪间隔 默认值 0.5秒 参数小于0.1 则会强制修改为0.1
     * @param _round_index 可选参数 使用第几波怪物作为模板 默认值 0 当前波数
     * @returns  task_name 任务名
     */
    TargetTaskSpawnDisposable(
        target: CDOTA_BaseNPC,
        task_name: string,
        count: number = 10,
        interval: number = 0.5,
        _round_index: number = 0
    ): string {
        let f_count = 0;
        let monster_refresh_count = 0;
        if (task_name == '') {
            task_name = DoUniqueString('tms');
        }
        const _monster_count_interval = {};
        let _monster_count = 0;
        if (_round_index == 0) {
            _round_index = this._round_index;
        }
        if (interval < 0.1) {
            interval = 0.1;
        }
        if (this.task_timers_name_list.hasOwnProperty(task_name)) {
            Timers.RemoveTimer(task_name);
        } else {
            this.task_monster_spawn_list[task_name] = [];
        }
        //普通怪总和
        for (let index = 1; index <= Object.keys(this.map_info_round[_round_index].monster_count_list).length; index++) {
            _monster_count += tonumber(this.map_info_round[_round_index].monster_count_list[index.toString()]);
            _monster_count_interval[index.toString()] = _monster_count;
        }
        //以定时任务启动
        const timers_name = Timers.CreateTimer(0, () => {
            if (f_count >= count) {
                return null;
            }
            if (IsValid(target)) {
                return null;
            }
            if (target && target.IsAlive()) {
                const h_Vector = target.GetOrigin();
                const new_Vector = Vector(h_Vector.x + RandomInt(1100, 1300), h_Vector.y, 128);
                let target_Vector = Vector();
                let GridNavBool = false;
                const QAngleRandomInt = RandomInt(0, 359);
                //先随机一次 看是否成功
                target_Vector = RotatePosition(Vector(h_Vector.x, h_Vector.y, 128), QAngle(0, QAngleRandomInt, 0), new_Vector);
                if (GridNav.CanFindPath(target_Vector, Vector(this._Vector.x, this._Vector.y, 128))) {
                    GridNavBool = true;
                } else {
                    //不行转圈
                    for (let index = 0; index < 3; index++) {
                        target_Vector = RotatePosition(
                            Vector(h_Vector.x, h_Vector.y, 128),
                            QAngle(0, QAngleRandomInt + 90 * (index + 1), 0),
                            new_Vector
                        );
                        if (GridNav.CanFindPath(target_Vector, Vector(this._Vector.x, this._Vector.y, 128))) {
                            GridNavBool = true;
                            break;
                        }
                    }
                }
                if (GridNavBool == false) {
                    return interval;
                }
                //判断该出什么怪物
                let bs_spawn_name = 'npc_creature_normal_1';

                for (let index = 1; index <= Object.keys(this.map_info_round[_round_index].monster_list).length; index++) {
                    //怪物上线问题
                    if (monster_refresh_count <= _monster_count_interval[index.toString()]) {
                        if (
                            Object.keys(this.map_info_round[_round_index].monster_list).length == index &&
                            monster_refresh_count == _monster_count_interval[index.toString()]
                        ) {
                            monster_refresh_count = 0;
                        }
                        bs_spawn_name = this.map_info_round[_round_index].monster_list[index.toString()];
                        break;
                    }
                }
                const unit = GameRules.Spawn.CreateMonster(bs_spawn_name, target_Vector, _round_index, true, false);
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
        GameRules.GetGameModeEntity().SetContextThink(
            'StopAllSpawnAndMonster',
            () => {
                GameRules.GetGameModeEntity().StopThink('StartSpawnControl');
                GameRules.GetGameModeEntity().StopThink('CreateMonsterTime' + '_' + this._round_index);
                GameRules.GetGameModeEntity().StopThink('CreateEliteTime' + '_' + this._round_index);
                GameRules.GetGameModeEntity().StopThink('CreateBossTime' + '_' + this._round_index);
                GameRules.GetGameModeEntity().StopThink('GameOverTime');
                // 清理小怪
                for (const unit of this._map_Spawn_list) {
                    if (unit.IsNull() == false) {
                        //是通过击杀boss
                        GameRules.Spawn.CreepNormalRemoveSelf(unit, 0.1);
                        this._spawn_count = 0;
                        this._map_Spawn_list = [];
                    }
                }
                //清理精英
                for (const unit of GameRules.Spawn._map_elite_spawn_list) {
                    if (unit.IsNull() == false) {
                        //是通过击杀boss
                        GameRules.Spawn.CreepNormalRemoveSelf(unit, 0.1);
                    }
                }
                // GameRules.CMsg.SendCommonMsgToPlayer(
                //     -1 as PlayerID,
                //     "即将开启灵魂商店，可自行购买灵魂道具…… ",
                //     {}
                // );
                // GameRules.CMsg.SendMsgToAll(CGMessageEventType.MESSAGE5);
                // GameRules.GetGameModeEntity().SetContextThink("RefreshMysticalShopItem" + "_" + this._round_index, () => {
                //     //重新设置时间
                //     GameRules.MysticalShopSystem.RefreshMysticalShopItem();
                //     return null;
                // }, 3)
                return null;
            },
            0
        );
    }

    //清空所有怪物
    StopAllSpawnAndMonster() {
        GameRules.BasicRules.RemoveRoundAcceleration();
        GameRules.GetGameModeEntity().SetContextThink(
            'StopAllSpawnAndMonster',
            () => {
                GameRules.Spawn._game_start = false;
                GameRules.MapChapter._game_select_phase = 999;
                //停止收益
                GameRules.InvestSystem.StopEarnings();
                //禁用英雄技能
                if (!IsInToolsMode()) {
                    //测试模式下不禁用
                    for (const hero of HeroList.GetAllHeroes()) {
                        for (let index = 0; index < 5; index++) {
                            hero.GetAbilityByIndex(index).SetActivated(false);
                        }
                    }
                }
                //停止圣坛效果
                GameRules.Altar.Stop();
                //移除物品
                GameRules.ResourceSystem.RemoveAllDropItem();
                GameRules.MapChapter.GetGameSelectPhase(-1, {});
                //游戏结束
                GameRules.GetGameModeEntity().StopThink('StartSpawnControl');
                GameRules.GetGameModeEntity().StopThink('CreateMonsterTime' + '_' + this._round_index);
                GameRules.GetGameModeEntity().StopThink('CreateEliteTime' + '_' + this._round_index);
                GameRules.GetGameModeEntity().StopThink('CreateBossTime' + '_' + this._round_index);
                GameRules.GetGameModeEntity().StopThink('GameOverTime');
                // 清理小怪
                for (const unit of GameRules.Spawn._map_Spawn_list) {
                    if (unit.IsNull() == false) {
                        //是通过击杀boss
                        GameRules.Spawn.CreepNormalRemoveSelf(unit, 0.1);
                    }
                }
                GameRules.Spawn._spawn_count = 0;
                GameRules.Spawn._map_Spawn_list = [];
                //清理精英
                for (const unit of GameRules.Spawn._map_elite_spawn_list) {
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
            },
            0
        );
    }

    /**
     * debug 命令
     */
    Debug(cmd: string, args: string[], player_id: PlayerID) {
        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        if (cmd == '-ss') {
            const round = parseInt(args[0]);
        }
        if (cmd == '-ssi') {
            GameRules.Spawn.Init(GameRules.MapChapter.MAP_CAMP.x, GameRules.MapChapter.MAP_CAMP.y);
        }
        if (cmd == '-boss') {
            const boss_name = args[0] ?? '';
            GameRules.Spawn.CreateBoss(boss_name);
        }
        if (cmd == '-sg') {
            const _name = args[0] ?? '1';
            const name = 'npc_monster_normal_' + _name;
            const count = args[1] ? parseInt(args[1]) : 1;
            for (let index = 0; index < count; index++) {
                const _Vector = (hHero.GetAbsOrigin() + RandomVector(500)) as Vector;
                GameRules.Spawn.CreateMonster(name, _Vector, this._round_index);
            }
        }
        if (cmd == '-st') {
        }
        if (cmd == '-elite') {
            GameRules.Spawn._round_index = 1;
            const elite_name = args[0] ?? 'npc_monster_elite_1';
            GameRules.Spawn.CreateElite(elite_name);
        }
        if (cmd == '--_player_sum_kill') {
            print('_player_sum_kill :');
            DeepPrintTable(this._player_sum_kill);
        }

        if (cmd == '--StartSpawnControl') {
            GameRules.Spawn._round_index = 4;
            GameRules.Spawn.StartSpawnControl();
        }
    }

    CreepNormalCreate(unit_name: string, vPos: Vector, is_mine_spawn: boolean = false) {
        const unit = CreateUnitByName("npc_monster_elite_1", Vector( 0 , 0 , 0), true, null, null, DotaTeam.BADGUYS);
        GameRules.EnemyAttribute.SetUnitAttr(unit);
        // GameRules.EnemyAttribute.ModifyAttribute(unit,{
        //     'DamageBonusMul'
        // })
        return unit;
    }

    GeneralKilledEvent(entindex_killed: EntityIndex, entindex_attacker: EntityIndex, entindex_inflictor: EntityIndex) {
        const target = EntIndexToHScript(entindex_killed) as CDOTA_BaseNPC;
        const killer = EntIndexToHScript(entindex_attacker) as CDOTA_BaseNPC;
        if (target && target.HasAbility('public_immortal') && !target.IsHero()) {
        } else if (entindex_attacker != entindex_killed && !target.IsHero() && target.GetTeam() == DotaTeam.BADGUYS) {
            // 怪物死亡通用处理 优先级最高 只用记录单位的增减数量  高于一切事件
            GameRules.Spawn.MapUnitKilledCalculate(target, killer);
            //用于处理经验增加 掉落 刷怪等 和一些事件
            GameRules.Spawn.MapUnitKilled(target, killer);
        } else if (target.IsHero()) {
            //英雄单位死亡处理
            GameRules.GameInformation.HeroDie(target, killer);
        }
    }

    /**
     * 只处理增加减少 不处理特殊数据 不要混放
     * @param target
     * @param killer
     */
    MapUnitKilledCalculate(target: CDOTA_BaseNPC, killer: CDOTA_BaseNPC) {
        if (killer.IsHero()) {
            const player_id = killer.GetPlayerOwnerID();
            const unit_label = target.GetUnitLabel();
            //普通怪处理
            if (unit_label == 'creatur_normal') {
                //击杀普通怪数量减少
                GameRules.Spawn._spawn_count--;
            }
            //计数器 用于计算每个玩家击杀怪物数量
            GameRules.Spawn._player_sum_kill[player_id]++;
            GameRules.Spawn._player_round_sum_kill[player_id]++;
        }
    }

    player_double_exp = [0, 0, 0, 0];

    player_double_soul = [0, 0, 0, 0];
    /**
     * 通关前同一击杀处理
     * @param target 目标
     * @param killer 击杀者
     */
    MapUnitKilled(target: CDOTA_BaseNPC, killer: CDOTA_BaseNPC) {
        //非英雄击杀 boss击杀
        const round_index = target.GetIntAttr('round_index');
        if (!killer.IsHero()) {
            // killer.SetIntAttr("index" , 1);
            // killer.GetIntAttr("index");
            const unit_label = target.GetUnitLabel();
            const vect = target.GetAbsOrigin();
            if (unit_label == 'creatur_normal') {
                const KillExpDrop = GameRules.Spawn.map_info_round[round_index].monster_KillExpDrop;
                const ExpType = GetCommonProbability(KillExpDrop);
                GameRules.ResourceSystem.DropResourceItem('TeamExp', vect, ExpType, killer);
                //掉落物品
                // if(RollPercentage(2)){
                //     GameRules.CustomItem.Drop( "hp", vect , 120);
                // }
                // if(RollPercentage(2)){
                //     GameRules.CustomItem.Drop( "mp", vect , 120);
                // }
            } else if (unit_label == 'unit_elite') {
                const KillExpDrop = GameRules.Spawn.map_info_round[round_index].elite_KillExpDrop;
                const ExpType = GetCommonProbability(KillExpDrop);
                GameRules.ResourceSystem.DropResourceItem('TeamExp', vect, ExpType, killer);
                // GameRules.CustomItem.Drop("hp", vect , 120);
                // GameRules.CustomItem.Drop("mp", vect , 120);
            }
            return;
        }
        // let player_id = killer.GetPlayerOwnerID();
        const unit_label = target.GetUnitLabel();
        //卡片掉落

        //玩家卡片掉落
        // player_card_drop : {
        //     [item_id : string] : number,
        // }[] = [];

        // //怪物卡片稀有度获取
        // _pictuer_card_data_rarity : {
        //     [item_id : string] : number
        // } = {};
        // //稀有度概率
        // _pictuer_rarity_pro : number[] = [ 1000 , 1000 , 1000 , 500 , 200 , 1000];
        // //怪物对应卡片
        // _normal_card_data : {
        //     [name : string] : string
        // } = {}
        const unit_name = target.GetUnitName();
        if (GameRules.Spawn._normal_card_data.hasOwnProperty(unit_name)) {
            const item_id_str = GameRules.Spawn._normal_card_data[unit_name];
            if (GameRules.Spawn._pictuer_card_data_rarity.hasOwnProperty(item_id_str)) {
                const card_rarity = GameRules.Spawn._pictuer_card_data_rarity[item_id_str];
                const pro_v = GameRules.Spawn._pictuer_rarity_pro[card_rarity];
                const rd_n = RandomInt(1, pro_v);
                if (rd_n == pro_v) {
                    print('d card:', item_id_str, ' , pro_v :', pro_v, ',rd_n :', rd_n);
                    const p_id = killer.GetPlayerOwnerID();
                    if (GameRules.Spawn.player_card_drop[p_id].hasOwnProperty(item_id_str)) {
                        GameRules.Spawn.player_card_drop[p_id][item_id_str] += 1;
                    } else {
                        GameRules.Spawn.player_card_drop[p_id][item_id_str] = 1;
                    }
                }
            }
        }

        //普通怪处理
        if (unit_label == 'creatur_normal') {
            //判断是否掉落全体宝物箱 排除任务怪
            const vect = target.GetAbsOrigin();
            const KillExpDrop = GameRules.Spawn.map_info_round[round_index].monster_KillExpDrop;
            // let KillSoul = GameRules.Spawn.map_info_round[round_index].monster_KillSoul;
            const ExpType = GetCommonProbability(KillExpDrop);
            GameRules.ResourceSystem.DropResourceItem('TeamExp', vect, ExpType, killer);
            // GameRules.ResourceSystem.ModifyResource(player_id, {
            //     "Soul": KillSoul,
            //     "Kills": 1,
            // })
            //掉落物品
            let RIntNumber = RandomInt(1, 1000);
            if (RIntNumber <= GameRules.PUBLIC_CONST.CREATUR_NORMAL_DROP_HP) {
                GameRules.CustomItem.Drop('hp', vect, 120);
            }
            RIntNumber = RandomInt(1, 1000);
            if (RIntNumber <= GameRules.PUBLIC_CONST.CREATUR_NORMAL_DROP_MP) {
                GameRules.CustomItem.Drop('mp', vect, 120);
            }
        } else if (unit_label == 'unit_elite') {
            //unit_elite
            //判断是否掉落全体宝物箱 排除任务怪
            const vect = target.GetAbsOrigin();
            const KillExpDrop = GameRules.Spawn.map_info_round[round_index].elite_KillExpDrop;
            // let KillSoul = GameRules.Spawn.map_info_round[round_index].elite_KillSoul;
            const ExpType = GetCommonProbability(KillExpDrop);
            GameRules.ResourceSystem.DropResourceItem('TeamExp', vect, ExpType, killer);
            // GameRules.ResourceSystem.ModifyResource(player_id, {
            //     "Soul": KillSoul,
            //     "Kills": 1,
            // })
            GameRules.CustomItem.Drop('hp', vect, 120);
            GameRules.CustomItem.Drop('mp', vect, 120);
        } else if (unit_label == 'creature_boss') {
            //boss
            GameRules.Spawn.BossKill(target);
        }

        // 单位回收
        // GameRules.Spawn.CreepNormalRecovery(killed_unit);
    }

    //击杀boss
    BossKill(killed_unit: CDOTA_BaseNPC) {
        // GameRules.CMsg.SendCommonMsgToPlayer(
        //     -1 as PlayerID,
        //     "boss已被击杀",
        //     {}
        // );
        //切换成boss倒计时
        GameRules.GetGameModeEntity().SetContextThink(
            'CreateBossKillTime' + '_' + this._round_index,
            () => {
                //重新设置时间
                GameRules.GameInformation.boss_time = 0;
                GameRules.GameInformation.SetPlayGameTime(0);
                if (GameRules.Spawn._round_index < GameRules.Spawn._round_max) {
                    GameRules.Spawn.StartSpawnControl();
                }
                return null;
            },
            3
        );
        GameRules.CMsg.RemoveBossHealthBar(killed_unit);
        //击杀boss奖励
        this._map_boss_unit = null;
        this._map_boss_refresh = false;

        if (GameRules.Spawn._round_index < GameRules.Spawn._round_max) {
            this._kill_boss_count++;
            const vect = killed_unit.GetAbsOrigin();
            //击杀boss掉落物品
            GameRules.BasicRules.BossChestDrop(vect, this._kill_boss_count);

            GameRules.CustomItem.Drop('all', vect, 120);
            if (GameRules.MapChapter._game_select_phase != 999) {
                GameRules.Spawn.TemporarilyStopTheGame();
                GameRules.ServiceInterface.SendLuaLog(-1);
            }
            GameRules.CMsg.SendMsgToAll(CGMessageEventType.MESSAGE6);
        } else {
            //奖励卡片
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
