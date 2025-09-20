/**
 *  存档装备服务接口
 */
import { reloadable } from '../../utils/tstl-utils';

import { UIEventRegisterClass } from '../../modules/class_extends/ui_event_register_class';

import * as ServerEquipInfo from '../../json/config/server/equip/server_equip_info.json';

import * as ServerEquipMainAttr from '../../json/config/server/equip/server_equip_main_attr.json';

import * as ServerEquipPuzzleAttr from '../../json/config/server/equip/server_equip_puzzle_attr.json';

import * as ServerEquipDropCount from '../../json/config/server/equip/server_equip_drop_count.json';

import * as ServerAttrIntensifyConfig from '../../json/config/server/equip/server_attr_intensify_config.json';

import * as ServerEquipRarity from '../../json/config/server/equip/server_equip_rarity.json';

@reloadable
export class ServiceEquipment extends UIEventRegisterClass {
    //装备背包信息
    player_equip_list: {
        [eq_id: string]: CGEDGetEquipListInfo;
    }[] = [];

    //装备配置
    player_equip_config: CGEDEquipConfigInfo[] = [];
    //server装备配置
    server_player_equip_config: CGEDEquipConfigInfo[] = [];
    //装备生成唯一标识
    request_flag_list: number[] = [0, 0, 0, 0, 0, 0];
    //词条概率数据
    Puzzle_Attr_SEAEP: { [key: string]: number[] } = {};
    //词条key数据
    Puzzle_Attr_SEAEKEY: { [key: string]: string[] } = {};
    //词条概率数据
    Main_Attr_SEAEP: { [key: string]: number[] } = {};
    //词条key数据
    Main_Attr_SEAEKEY: { [key: string]: string[] } = {};
    //是否显示装备加载信息
    is_show_show_log: boolean = false;
    //套装信息
    // ServerEquipDeputy: typeof ServerEquipDeputy;
    //强化数据总量
    PlayerIntensifyResource: {
        [r: string]: {
            [level: number]: {
                qhs: number;
                gold: number;
            };
        };
    } = {};

    constructor() {
        super('ServiceEquipment', true);
        for (let index = 0; index < 6; index++) {
            this.player_equip_list.push({});
        }
        //拼图词条
        for (const key in ServerEquipPuzzleAttr) {
            const SEAE_data = ServerEquipPuzzleAttr[key as keyof typeof ServerEquipPuzzleAttr];
            if (this.Puzzle_Attr_SEAEP[SEAE_data.box_type]) {
                this.Puzzle_Attr_SEAEP[SEAE_data.box_type].push(SEAE_data.item_probability);
                this.Puzzle_Attr_SEAEKEY[SEAE_data.box_type].push(key);
            } else {
                this.Puzzle_Attr_SEAEP[SEAE_data.box_type] = [];
                this.Puzzle_Attr_SEAEP[SEAE_data.box_type].push(SEAE_data.item_probability);
                this.Puzzle_Attr_SEAEKEY[SEAE_data.box_type] = [];
                this.Puzzle_Attr_SEAEKEY[SEAE_data.box_type].push(key);
            }
        }
        //主词条随机
        for (const key in ServerEquipMainAttr) {
            const SEAE_Main_data = ServerEquipMainAttr[key as keyof typeof ServerEquipMainAttr];
            if (this.Main_Attr_SEAEP[SEAE_Main_data.box_type]) {
                this.Main_Attr_SEAEP[SEAE_Main_data.box_type].push(SEAE_Main_data.item_probability);
                this.Main_Attr_SEAEKEY[SEAE_Main_data.box_type].push(key);
            } else {
                this.Main_Attr_SEAEP[SEAE_Main_data.box_type] = [];
                this.Main_Attr_SEAEP[SEAE_Main_data.box_type].push(SEAE_Main_data.item_probability);
                this.Main_Attr_SEAEKEY[SEAE_Main_data.box_type] = [];
                this.Main_Attr_SEAEKEY[SEAE_Main_data.box_type].push(key);
            }
        }

        // this.ServerEquipDeputy = ServerEquipDeputy;

        // 强化数据汇总
        let C_qhs = 0;
        let B_qhs = 0;
        let A_qhs = 0;
        let S_qhs = 0;
        let SS_qhs = 0;
        let C_gold = 0;
        let B_gold = 0;
        let A_gold = 0;
        let S_gold = 0;
        let SS_gold = 0;
        this.PlayerIntensifyResource['0'] = {};
        this.PlayerIntensifyResource['1'] = {};
        this.PlayerIntensifyResource['2'] = {};
        this.PlayerIntensifyResource['3'] = {};
        this.PlayerIntensifyResource['4'] = {};

        for (let index = 1; index <= Object.keys(ServerAttrIntensifyConfig).length; index++) {
            const key = tostring(index);
            const data = ServerAttrIntensifyConfig[key as keyof typeof ServerAttrIntensifyConfig];
            C_qhs += data['0_qhs'];
            B_qhs += data['1_qhs'];
            A_qhs += data['2_qhs'];
            S_qhs += data['3_qhs'];
            SS_qhs += data['4_qhs'];
            C_gold += data['0_gold'];
            B_gold += data['1_gold'];
            A_gold += data['2_gold'];
            S_gold += data['3_gold'];
            SS_gold += data['4_gold'];
            this.PlayerIntensifyResource['0'][index] = {
                gold: C_gold,
                qhs: C_qhs,
            };
            this.PlayerIntensifyResource['1'][index] = {
                gold: B_gold,
                qhs: B_qhs,
            };
            this.PlayerIntensifyResource['2'][index] = {
                gold: A_gold,
                qhs: A_qhs,
            };
            this.PlayerIntensifyResource['3'][index] = {
                gold: S_gold,
                qhs: S_qhs,
            };
            this.PlayerIntensifyResource['4'][index] = {
                gold: SS_gold,
                qhs: SS_qhs,
            };
        }
    }

    Init() {
        // let player_count = GetPlayerCount();
        // let init_config_data : CGEDEquipConfigInfo = {
        //     hero : {
        //     }
        // };
        //初始化每个玩家 装备配置
        // for (let main_i = 0; main_i < player_count; main_i++) {
        //     //初始化
        //     this.player_equi_config.push( CustomDeepCopy(init_config_data) as CGEDEquipConfigInfo);
        //     this.server_player_equi_config.push( CustomDeepCopy(init_config_data) as CGEDEquipConfigInfo );
        //     this.player_equip_list.push({});
        //     // this.GetEquipConfig(p_i as PlayerID, {});
        //     // this.GetEquipList(p_i as PlayerID, {});
        // }
    }

    /**
     * 通过难度生成装备信息 并添加到服务器
     * @param player_id
     * @param difficulty_index 难度
     * @param level 掉落等级
     */
    AddEquipByDifficulty(player_id: PlayerID, difficulty_index: string) {
        const add_equip_list: ServerEquip[] = [];
        let count = 0;
        const DropCount = ServerEquipDropCount[difficulty_index as keyof typeof ServerEquipDropCount];
        this.request_flag_list[player_id]++;

        if (DropCount.boss_drop > 0) {
            count += DropCount.boss_drop;
        }
        //tobo 增加掉落数量在这里处理

        //通过难度获得掉落数量
        if (count > 0) {
            for (let index = 0; index < count; index++) {
                let ram_key_index = -1;
                let equip_key = '';
                //装备信息
                ram_key_index = GetCommonProbability(DropCount.common_drop_list_pro);
                equip_key = DropCount.common_drop_list[ram_key_index];
                //装备品质
                let equip_r = 0;
                if (DropCount.boss_rare) {
                    equip_r = GetCommonProbability(DropCount.boss_rare);
                }
                //tobo 品质提升物品在这里处理
                const equip_data = ServerEquipInfo[equip_key as keyof typeof ServerEquipInfo];
                const main_attr_count = this.AttrCountFunc(equip_r, equip_data.main_attr_random_initial, equip_data.main_attr_random_initial_pro);
                const main_attr_list: {
                    //主属性词条信息
                    k: string; //键
                    v: number; //值
                }[] = this.MainAttrNumber(main_attr_count, equip_data.main_attr_random_key);

                const puzzle_attr_count = this.AttrCountFunc(
                    equip_r,
                    equip_data.puzzle_attr_random_initial,
                    equip_data.puzzle_attr_random_initial_pro
                );
                const puzzle_attr_list: {
                    //拼图词条信息
                    k: string; //键
                    v: number; //值
                    l: number; //等级
                }[] = this.PuzzleAttrNumber(puzzle_attr_count, equip_data.puzzle_attr_random_key);

                //套装？
                const t_ct_list: {
                    //attr属性
                    k: string; //键
                    v: number; //等级
                    a: {
                        //装备副attr属性
                        k: string; //键
                        v: number; //值
                    }[];
                }[] = [];
                add_equip_list.push({
                    n: equip_key, //装备key
                    r: equip_r, //稀有度 0 1 2 3 => n,r,sr,ssr
                    zl: 0, //装备等级
                    i: 0, //强化等级
                    ma: this.EquipTDecode(main_attr_list), //装备主属性
                    pa: this.EquipTDecode(puzzle_attr_list), // 装备拼图属性
                    s: '', //套装数据
                    lk: 0, //装备锁
                    t: equip_data.type,
                });
            }
        }
        //后续处理
        if (add_equip_list.length > 0) {
            GameRules.ArchiveService.AddEquip(player_id, add_equip_list);
        }
    }

    //装备加密
    EquipTDecode(t_object: object): string {
        let ret_string = '';
        ret_string = JSON.encode(t_object);
        return ret_string;
    }

    //解密
    EquipTEncode(EquipString: ServerEquip): CGEDGetEquipListInfo {
        const object: CGEDGetEquipListInfo = {
            id: EquipString.id, //唯一id
            n: EquipString.n, //装备key
            r: EquipString.r, //稀有度 0 1 2 3 4 => C B A S SS
            zl: EquipString.zl, //装备等级
            t: EquipString.t, //装备部位
            i: EquipString.i, //强化等级
            ma: [], //主attr属性,
            pa: [], //拼图属性,
            s: [], //套装
            is_new: 0, //没有就是老的  有就是新装备
            lk: 0, //装备锁
        };

        if (EquipString.ma && EquipString.ma != '') {
            object.ma = JSON.decode(EquipString.ma);
        }
        if (EquipString.pa && EquipString.pa != '') {
            object.pa = JSON.decode(EquipString.pa);
        }
        if (EquipString.s && EquipString.s != '') {
            object.s = JSON.decode(EquipString.s);
        }
        return object;
    }

    /**
     * 通过装备品质 和 挑战配置 获取主词条或拼图词条数量
     * @param equip_r
     * @param attr_random_initial 主词条内容
     * @param attr_random_initial_pro 主词条概率
     */
    AttrCountFunc(equip_r: number, attr_random_initial: number[], attr_random_initial_pro: number[]): number {
        let main_attr_count = 0;
        if (typeof attr_random_initial[equip_r] == 'number') {
            main_attr_count = tonumber(attr_random_initial[equip_r]);
        } else if (typeof attr_random_initial[equip_r] == 'string') {
            const main_count_string = attr_random_initial[equip_r].toString();
            if (main_count_string.includes(',')) {
                const main_count_list = main_count_string.split(',');
                const main_count_main_list: number[] = [];
                if (attr_random_initial_pro[equip_r] == 0) {
                    main_attr_count = tonumber(main_count_list[RandomInt(0, main_count_list.length - 1)]);
                } else {
                    const main_count_p_string = attr_random_initial_pro[equip_r].toString();
                    for (const v of main_count_p_string.split(',')) {
                        main_count_main_list.push(tonumber(v));
                    }
                    main_attr_count = tonumber(main_count_list[GetCommonProbability(main_count_main_list)]);
                }
            } else {
                main_attr_count = tonumber(main_count_string);
            }
        }
        return main_attr_count;
    }

    /**
     * 主属性随机值
     * @param p_count 生成主词条数量
     * @param main_attr_random_key
     */
    MainAttrNumber(
        p_count: number,
        main_attr_random_key: string
    ): {
        k: string; //键
        v: number; //值
    }[] {
        const p_ct_list: {
            //主属性词条
            k: string; //键
            v: number; //值
        }[] = [];
        //随机主词条
        if (p_count > 0) {
            //循环计数器
            let amount_count = 0;
            const amount_max = 50;
            const wp_list: string[] = [];

            let NEW_Main_Attr_SEAEP: number[] = []; //概率
            let NEW_Main_Attr_SEAEKEY: string[] = [];
            //主词条融合 追加数据
            if (main_attr_random_key.includes(',')) {
                const main_attr_random_key_list = main_attr_random_key.split(',');
                for (const random_key of main_attr_random_key_list) {
                    if (this.Main_Attr_SEAEKEY[random_key].length > 0) {
                        for (let index = 0; index < this.Main_Attr_SEAEKEY[random_key].length; index++) {
                            NEW_Main_Attr_SEAEKEY.push(this.Main_Attr_SEAEKEY[random_key][index]);
                            NEW_Main_Attr_SEAEP.push(this.Main_Attr_SEAEP[random_key][index]);
                        }
                    }
                }
            } else {
                if (this.Main_Attr_SEAEKEY[main_attr_random_key].length > 0) {
                    NEW_Main_Attr_SEAEKEY = this.Main_Attr_SEAEKEY[main_attr_random_key];
                    NEW_Main_Attr_SEAEP = this.Main_Attr_SEAEP[main_attr_random_key];
                }
            }
            if (NEW_Main_Attr_SEAEKEY.length > 0) {
                //当大于时只取最大数量
                if (p_count >= NEW_Main_Attr_SEAEKEY.length) {
                    for (let p_i = 0; p_i < NEW_Main_Attr_SEAEKEY.length; p_i++) {
                        amount_count++;
                        if (amount_count > amount_max) {
                            break;
                        }
                        const attr_key = NEW_Main_Attr_SEAEKEY[p_i];
                        if (wp_list.includes(attr_key)) {
                            //跳过本次
                            p_i--;
                            continue;
                        }
                        const SEAE_data = ServerEquipMainAttr[attr_key as keyof typeof ServerEquipMainAttr];
                        const attr_value = this.ZoomNumber(SEAE_data.value, SEAE_data.float);
                        if (attr_value > 0) {
                            p_ct_list.push({
                                k: attr_key,
                                v: attr_value,
                            });
                        }
                        wp_list.push(attr_key);
                    }
                } else {
                    for (let p_i = 0; p_i < p_count; p_i++) {
                        amount_count++;
                        if (amount_count > amount_max) {
                            break;
                        }
                        const attr_key_index = GetCommonProbability(NEW_Main_Attr_SEAEP);
                        const attr_key = NEW_Main_Attr_SEAEKEY[attr_key_index];
                        if (wp_list.includes(attr_key)) {
                            //跳过本次
                            p_i--;
                            continue;
                        }
                        const SEAE_data = ServerEquipMainAttr[attr_key as keyof typeof ServerEquipMainAttr];
                        const attr_value = this.ZoomNumber(SEAE_data.value, SEAE_data.float);
                        if (attr_value > 0) {
                            p_ct_list.push({
                                k: attr_key,
                                v: attr_value,
                            });
                        } else {
                            //重随一次
                            p_i--;
                            continue;
                        }
                        wp_list.push(attr_key);
                    }
                }
            }
        }
        return p_ct_list;
    }

    /**
     * 随机拼图词条方法
     * @param p_count
     * @param puzzle_attr_random_key
     * @returns
     */
    PuzzleAttrNumber(
        p_count: number,
        puzzle_attr_random_key: string
    ): {
        k: string; //键
        v: number; //值
        l: number; //拼图等级
    }[] {
        const p_ct_list: {
            //拼图属性词条
            k: string; //键
            v: number; //值
            l: number; //拼图等级
        }[] = [];

        //随机拼图词条
        if (p_count > 0) {
            //循环计数器
            let amount_count = 0;
            const amount_max = 50;
            const wp_list: string[] = [];

            let Attr_SEAEP: number[] = []; //概率
            let Attr_SEAEKEY: string[] = [];
            //主词条融合 追加数据
            if (puzzle_attr_random_key.includes(',')) {
                const puzzle_attr_random_key_list = puzzle_attr_random_key.split(',');
                for (const random_key of puzzle_attr_random_key_list) {
                    if (this.Puzzle_Attr_SEAEKEY[random_key].length > 0) {
                        for (let index = 0; index < this.Puzzle_Attr_SEAEKEY[random_key].length; index++) {
                            Attr_SEAEKEY.push(this.Puzzle_Attr_SEAEKEY[random_key][index]);
                            Attr_SEAEP.push(this.Puzzle_Attr_SEAEP[random_key][index]);
                        }
                    }
                }
            } else {
                if (this.Puzzle_Attr_SEAEKEY[puzzle_attr_random_key].length > 0) {
                    Attr_SEAEKEY = this.Puzzle_Attr_SEAEKEY[puzzle_attr_random_key];
                    Attr_SEAEP = this.Puzzle_Attr_SEAEP[puzzle_attr_random_key];
                }
            }
            if (Attr_SEAEKEY.length > 0) {
                //当大于时只取最大数量
                if (p_count >= Attr_SEAEKEY.length) {
                    for (let p_i = 0; p_i < Attr_SEAEKEY.length; p_i++) {
                        amount_count++;
                        if (amount_count > amount_max) {
                            break;
                        }
                        const attr_key = Attr_SEAEKEY[p_i];
                        if (wp_list.includes(attr_key)) {
                            //跳过本次
                            p_i--;
                            continue;
                        }
                        const SEAE_data = ServerEquipPuzzleAttr[attr_key as keyof typeof ServerEquipPuzzleAttr];
                        const attr_value = this.ZoomNumber(SEAE_data.value, SEAE_data.float);
                        if (attr_value > 0) {
                            p_ct_list.push({
                                k: attr_key,
                                v: attr_value,
                                l: 0,
                            });
                        }
                        wp_list.push(attr_key);
                    }
                } else {
                    for (let p_i = 0; p_i < p_count; p_i++) {
                        amount_count++;
                        if (amount_count > amount_max) {
                            break;
                        }
                        const attr_key_index = GetCommonProbability(Attr_SEAEP);
                        const attr_key = Attr_SEAEKEY[attr_key_index];
                        if (wp_list.includes(attr_key)) {
                            //跳过本次
                            p_i--;
                            continue;
                        }
                        const SEAE_data = ServerEquipPuzzleAttr[attr_key as keyof typeof ServerEquipPuzzleAttr];
                        const attr_value = this.ZoomNumber(SEAE_data.value, SEAE_data.float);
                        if (attr_value > 0) {
                            p_ct_list.push({
                                k: attr_key,
                                v: attr_value,
                                l: 0,
                            });
                        } else {
                            //重随一次
                            p_i--;
                            continue;
                        }
                        wp_list.push(attr_key);
                    }
                }
            }
        }
        return p_ct_list;
    }

    /**
     * 数字等比放大缩小功能
     * @param value_scope
     * @param float
     */
    ZoomNumber(value_scope: string, float: number): number {
        let attr_value = 0;
        const value_list = value_scope.split('-');
        let value_min = tonumber(value_list[0]);
        let value_max = tonumber(value_list[1]);
        //等比放大
        if (float > 0) {
            for (let index = 0; index < float; index++) {
                value_min = value_min * 10;
                value_max = value_max * 10;
            }
        }
        //计算出结果
        attr_value = value_min + RandomInt(0, value_max - value_min);
        //等比缩小
        if (float > 0) {
            for (let index = 0; index < float; index++) {
                attr_value = attr_value / 10;
            }
        }
        return attr_value;
    }

    /**
     * 拼图升级
     */
    PuzzleUpgrade(player_id: PlayerID, params: CGED['ServiceEquipment']['PuzzleUpgrade']) {
        const equip_id = params.equip_id;
        const index = params.index;
        if (GameRules.ServiceEquipment.player_equip_list[player_id].hasOwnProperty(equip_id)) {
            const equipobj = CustomDeepCopy(GameRules.ServiceEquipment.player_equip_list[player_id][equip_id]) as CGEDGetEquipListInfo;
            if (equipobj.pa[index]) {
                if (equipobj.pa[index].l < 20) {
                    //最大等级
                    const value = equipobj.pa[index].v;
                    const key = equipobj.pa[index].k;
                    const SEAE_data = ServerEquipPuzzleAttr[key as keyof typeof ServerEquipPuzzleAttr];
                    const float = SEAE_data.float;
                    const up_value = SEAE_data.up_value;
                    const up_value_per = SEAE_data.up_value_per;
                    const value_max = SEAE_data.value_max;
                    //倍率值
                    const dnl = equipobj.pa[index].l - 1;
                    const newSection = GameRules.ServiceEquipment.SectionPer(up_value, float, 100 + dnl * up_value_per);
                    const add_value = GameRules.ServiceEquipment.ZoomNumber(newSection, float);
                    if (value + add_value >= value_max) {
                        equipobj.pa[index].v = value_max;
                    } else {
                        equipobj.pa[index].v += add_value;
                    }
                    equipobj.pa[index].l++;

                    //tudo 需要扣除材料

                    //保存至服务器
                    const server_equip: { [equip_id: string]: ServerEquip } = {
                        [equipobj.id]: {
                            id: equipobj.id,
                            n: equipobj.n, //装备key
                            r: equipobj.r, //稀有度 0 1 2 3 => n,r,sr,ssr
                            zl: equipobj.zl, //装备等级
                            i: equipobj.i, //强化等级
                            ma: this.EquipTDecode(equipobj.ma), //装备主属性
                            pa: this.EquipTDecode(equipobj.pa), // 装备拼图属性
                            s: this.EquipTDecode(equipobj.s), //套装数据
                            lk: equipobj.lk, //装备锁
                            t: equipobj.t, //套装位置
                        },
                    };
                    GameRules.ArchiveService.UpdateEquip(player_id, server_equip);
                } else {
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id, '装备达到最大等级,请升级后重试...');
                }
            } else {
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, '词条位置错误...');
            }
        } else {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, '装备不存在...');
        }
    }

    /**
     * 拼图降级
     */
    PuzzleLower(player_id: PlayerID, params: CGED['ServiceEquipment']['PuzzleLower']) {
        const equip_id = params.equip_id;
        const index = params.index;
        if (GameRules.ServiceEquipment.player_equip_list[player_id].hasOwnProperty(equip_id)) {
            const equipobj = CustomDeepCopy(GameRules.ServiceEquipment.player_equip_list[player_id][equip_id]) as CGEDGetEquipListInfo;
            if (equipobj.pa[index]) {
                if (equipobj.pa[index].l > 0) {
                    //最大等级
                    const value = equipobj.pa[index].v;
                    const key = equipobj.pa[index].k;
                    const SEAE_data = ServerEquipPuzzleAttr[key as keyof typeof ServerEquipPuzzleAttr];
                    const float = SEAE_data.float;
                    const drop_value = SEAE_data.drop_value;
                    const drop_value_per = SEAE_data.drop_value_per;
                    //倍率值
                    const dnl = equipobj.pa[index].l - 1;
                    const newSection = GameRules.ServiceEquipment.SectionPer(drop_value, float, 100 + dnl * drop_value_per);
                    const red_value = GameRules.ServiceEquipment.ZoomNumber(newSection, float);
                    if (value - red_value <= 0) {
                        equipobj.pa[index].v = 0;
                    } else {
                        equipobj.pa[index].v -= red_value;
                    }
                    equipobj.pa[index].l--;
                    //tudo 需要扣除材料
                    //保存至服务器
                    const server_equip: { [equip_id: string]: ServerEquip } = {
                        [equipobj.id]: {
                            id: equipobj.id,
                            n: equipobj.n, //装备key
                            r: equipobj.r, //稀有度 0 1 2 3 => n,r,sr,ssr
                            zl: equipobj.zl, //装备等级
                            i: equipobj.i, //强化等级
                            ma: this.EquipTDecode(equipobj.ma), //装备主属性
                            pa: this.EquipTDecode(equipobj.pa), // 装备拼图属性
                            s: this.EquipTDecode(equipobj.s), //套装数据
                            lk: equipobj.lk, //装备锁
                            t: equipobj.t, //套装位置
                        },
                    };
                    GameRules.ArchiveService.UpdateEquip(player_id, server_equip);
                } else {
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id, '装备低于最低等级');
                }
            } else {
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, '词条位置错误...');
            }
        } else {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, '装备不存在...');
        }
    }

    /**
     * 区间值百分比提升方法
     */
    SectionPer(value_scope: string, float: number, double: number): string {
        let ret_scope = value_scope;
        const value_list = value_scope.split('-');
        const value_min = (tonumber(value_list[0]) * double) / 100;
        const value_max = (tonumber(value_list[1]) * double) / 100;
        ret_scope = tostring(value_min) + '-' + tostring(value_max);
        return ret_scope;
    }

    // /**
    //  * 深渊构造装备
    //  * @param player_id
    //  * @param difficulty_index 难度
    //  * @param drop_type 类型 leader_1 | leader_2 | leader_3 | boss | extra_succeed | extra_lose |
    //  * @param extra_add_count 自定义增加数量 不然使用配置
    //  * @param is_abyss 是否为深渊掉落 主要影响 是否有魔化套装效果和魔化词条
    //  * @param round_number 存档boss回合数 只针对强散有效 每5波必出
    //  * @param zl 初始等级
    //  * @param mz 最大等级
    //  */
    // ConstructionEquip(player_id: PlayerID) : ServerEquip[]{

    // }

    /**
     * 随机副词条方法
     * @param equip_data
     * @returns
     */
    // AttrSeae(equip_data: typeof ServerEquipInfo["1_0_1"]): { k: string, v: number; } {

    //     let NEW_Attr_SEAEKEY: string[] = [];
    //     let NEW_Attr_SEAEP: number[] = [];
    //     //词条融合 追加数据
    //     if (equip_data.attr_random_key.includes(",")) {
    //         let attr_random_key_list = equip_data.attr_random_key.split(",");
    //         for (const random_key of attr_random_key_list) {
    //             if (this.Attr_SEAEKEY[random_key].length > 0) {
    //                 for (let index = 0; index < this.Attr_SEAEKEY[random_key].length; index++) {
    //                     NEW_Attr_SEAEKEY.push(this.Attr_SEAEKEY[random_key][index]);
    //                     NEW_Attr_SEAEP.push(this.Attr_SEAEP[random_key][index]);
    //                 }
    //             }
    //         }
    //     } else {
    //         if (this.Attr_SEAEKEY[equip_data.attr_random_key].length > 0) {
    //             NEW_Attr_SEAEKEY = this.Attr_SEAEKEY[equip_data.attr_random_key];
    //             NEW_Attr_SEAEP = this.Attr_SEAEP[equip_data.attr_random_key];
    //         }
    //     }
    //     if (NEW_Attr_SEAEKEY.length > 0) {
    //         for (let a_i = 0; a_i < 1; a_i++) {
    //             let attr_key_index = GetCommonProbability(NEW_Attr_SEAEP);
    //             let attr_key = NEW_Attr_SEAEKEY[attr_key_index];
    //             let SEAE_data = ServerEquipAttrEntry[attr_key as keyof typeof ServerEquipAttrEntry];
    //             let attr_value = 0;
    //             let value_scope = "0-0";
    //             // if (SEAE_data.hasOwnProperty("value_" + equip_data.class_level)) {
    //             //     value_scope = SEAE_data["value_" + equip_data.class_level] as string;
    //             // } else {
    //                 value_scope = SEAE_data.value;
    //             // }
    //             let value_list = value_scope.split("-");
    //             let value_min = tonumber(value_list[0]);
    //             let value_max = tonumber(value_list[1]);
    //             //等比放大
    //             if (SEAE_data.float > 0) {
    //                 for (let index = 0; index < SEAE_data.float; index++) {
    //                     value_min = value_min * 10;
    //                     value_max = value_max * 10;
    //                 }
    //             }
    //             //计算出结果
    //             attr_value = value_min + RandomInt(0, (value_max - value_min));
    //             //等比缩小
    //             if (SEAE_data.float > 0) {
    //                 for (let index = 0; index < SEAE_data.float; index++) {
    //                     attr_value = attr_value / 10;
    //                 }
    //             }
    //             if (attr_value > 0) {
    //                 return {
    //                     k: attr_key,
    //                     v: attr_value,
    //                 };
    //             } else {
    //                 //重随一次
    //                 a_i--;
    //                 continue;
    //             }
    //         }
    //     }
    // }

    //获取玩家装备配置
    GetEquipConfig(player_id: PlayerID, params: CGED['ServiceEquipment']['GetEquipConfig'], callback?) {
        CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(player_id), 'ServiceEquipment_GetEquipConfig', {
            data: {
                server: this.server_player_equip_config[player_id],
                local: this.player_equip_config[player_id],
            },
        });
    }

    /**
     * 获取玩家背包装备列表
     * @param player_id
     * @param params
     * @param callback
     */
    GetEquipList(player_id: PlayerID, params: CGED['ServiceEquipment']['GetEquipList'], callback?) {
        CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(player_id), 'ServiceEquipment_GetEquipList', {
            data: {
                list: this.player_equip_list[player_id],
            },
        });
    }
    // //获取装备洗练结果
    // GetEquipResetEntry(player_id: PlayerID, data: CGEDGetEquipListInfo) {
    //     CustomGameEventManager.Send_ServerToPlayer(
    //         PlayerResource.GetPlayer(player_id),
    //         "ServiceEquipment_EquipResetEntry",
    //         {
    //             data: data
    //         }
    //     );
    // }
    // /**
    //  * 获取挑战信息
    //  * @param player_id
    //  * @param data
    //  */
    // GetSummonEquipCount(player_id: PlayerID, params: GEFPD["ServiceEquipment"]["GetSummonEquipCount"], callback?) {
    //     CustomGameEventManager.Send_ServerToPlayer(
    //         PlayerResource.GetPlayer(player_id),
    //         "ServiceEquipment_GetSummonEquipCount",
    //         {
    //             data: {
    //                 count: this.player_summon_equip_count[player_id],
    //                 is_challenge: GameRules.SpecialGameProcess.server_equio_is_challenge,
    //             }
    //         }
    //     );
    // }
    // //装备附魔/替换
    // EquipenChantment(player_id: PlayerID, params: GEFPD["ServiceEquipment"]["EquipenChantment"], callback?) {
    //     let eq_id = params.id;
    //     // let use_id = params.use_id;
    //     let source_id = params.source_id;
    //     if(eq_id != source_id){
    //         let adsor_type_1 = params.adsor_type_1;
    //         let adsor_type_2 = params.adsor_type_2;
    //         let adsor_type_3 = params.adsor_type_3;
    //         let equi_data = this.player_equi_list[player_id][eq_id];
    //         let source_equi_data = this.player_equi_list[player_id][source_id];
    //         // let imprinting_data = GameRules.ArchiveService.server_imprinting_list[player_id][use_id];
    //         let server_log = "FM_"
    //         if (equi_data && equi_data.id != eq_id) {
    //             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备附魔 : 装备信息错误...");
    //             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //             return
    //         } else if(source_equi_data && source_equi_data.id != source_id) {
    //             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备附魔 : 来源装备信息错误...");
    //             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //             return
    //         } else {
    //             let imprinting_level_1 = 0;
    //             let imprinting_level_2 = 0;
    //             let imprinting_level_3 = 0;
    //             let imprinting_item_id = 0;
    //             let source_equi_data_key = "";
    //             let del_list = source_id;
    //             if(adsor_type_1 == 0 && adsor_type_2 == 0 && adsor_type_3 == 0){
    //                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备附魔: 附魔类型错误");
    //                 GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                 return;
    //             }
    //             let jh_coung = 0;
    //             let qhs_count = 0;
    //             let shs_count = 0;
    //             let item_38_count = 0;
    //             let item_39_count = 0;
    //             let item_40_count = 0;
    //             if(adsor_type_1 == 1){ //1副职
    //                 if(source_equi_data.t && source_equi_data.t.length > 0){
    //                     imprinting_item_id = ServerEquipDeputyContrast[source_equi_data.t[0].k as keyof typeof ServerEquipDeputyContrast].item_id;
    //                     imprinting_level_1 = source_equi_data.t[0].v;
    //                     source_equi_data_key = source_equi_data.t[0].k;
    //                 }else{
    //                     GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备附魔 : 副职来源装备附魔数据错误...");
    //                     GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                     return
    //                 }
    //                 jh_coung += 10000;
    //                 qhs_count += 1000;
    //                 shs_count += 1000;
    //                 item_38_count += 1;
    //             }
    //             if(adsor_type_2 == 1){//2技能
    //                 if(source_equi_data.w && source_equi_data.w.length > 0){
    //                     imprinting_item_id = ServerEquipDemon[source_equi_data.w[0].k as keyof typeof ServerEquipDemon].item_id;
    //                     imprinting_level_2 = source_equi_data.w[0].v;
    //                     source_equi_data_key = source_equi_data.w[0].k;
    //                 }else{
    //                     GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备附魔 : 技能来源装备附魔数据错误...");
    //                     GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                     return
    //                 }
    //                 jh_coung += 10000;
    //                 qhs_count += 1000;
    //                 shs_count += 1000;
    //                 item_39_count += 1;
    //             }
    //             if(adsor_type_3 == 1){ //3七罪
    //                 if(source_equi_data.wt && source_equi_data.wt.length > 0){
    //                     imprinting_item_id = ServerEquipDemonSuitContras[source_equi_data.wt[0].k as keyof typeof ServerEquipDemonSuitContras].item_id;
    //                     imprinting_level_3 = source_equi_data.wt[0].v;
    //                     source_equi_data_key = source_equi_data.wt[0].k;
    //                 }else{
    //                     GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备附魔 : 七罪来源装备附魔数据错误...");
    //                     GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                     return
    //                 }
    //                 jh_coung += 10000;
    //                 qhs_count += 1000;
    //                 shs_count += 1000;
    //                 item_40_count += 1;
    //             }
    //             // if(!this.equip_encha_data[imprinting_type] || !this.equip_encha_data[imprinting_type][imprinting_level]){
    //             //     GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备附魔: 未找到配置id");
    //             //     GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //             //     return;
    //             // }
    //             let EquipIntensifyConfig = ServerEquipEnchaConfig["1"];
    //             if(!EquipIntensifyConfig){
    //                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备附魔: 配置错误");
    //                 GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                 return;
    //             }
    //             let power = EquipIntensifyConfig[(equi_data.r + "_consume_power")] as number;
    //             let need_materials : string[] = []
    //             if(jh_coung > 0){
    //                 need_materials.push("8_" + jh_coung );
    //             }
    //             if(qhs_count > 0){
    //                 need_materials.push("19_" + qhs_count );
    //             }
    //             if(shs_count > 0){
    //                 need_materials.push("18_" + shs_count );
    //             }
    //             if(item_38_count > 0){
    //                 need_materials.push("38_" + item_38_count );
    //             }
    //             if(item_39_count > 0){
    //                 need_materials.push("39_" + item_39_count );
    //             }
    //             if(item_40_count > 0){
    //                 need_materials.push("40_" + item_40_count );
    //             }
    //             // replace_count = math.ceil((replace_count * power))
    //             // if (GameRules.ArchiveService.imprinting_debris_list[player_id].hasOwnProperty(imprinting_item_id + 1)) {
    //             //     if (GameRules.ArchiveService.imprinting_debris_list[player_id][imprinting_item_id + 1].number < replace_count) {
    //             //         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备附魔:附魔碎片不足");
    //             //         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //             //         return;
    //             //     }
    //             // } else {
    //             //     GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备附魔:没有对应碎片");
    //             //     GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //             //     return;
    //             // }

    //             let need_list: {
    //                 [item_id: string]: number;
    //             } = {};
    //             for (const iterator of need_materials) {
    //                 if (iterator.includes("_")) {
    //                     let i_liet = iterator.split("_");
    //                     let item_id = tonumber(i_liet[0]);
    //                     let item_number = tonumber(i_liet[1]);
    //                     need_list[item_id] = math.ceil(item_number * power);
    //                     if(item_id == 8 ){ //箭魂特殊处理
    //                         if (GameRules.ArchiveService.player_currency[player_id].jian_hun < need_list[item_id]) {
    //                             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备附魔:箭魂不足");
    //                             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                             return;
    //                         }
    //                         continue
    //                     }
    //                     //预防服务器bug必须要全部检查一次
    //                     let record_count: number = 0;
    //                     let record_index: number = -1;
    //                     for (let index = 0; index < GameRules.ArchiveService.server_package_list[player_id].length; index++) {
    //                         if (GameRules.ArchiveService.server_package_list[player_id][index].item_id == item_id) {
    //                             if (GameRules.ArchiveService.server_package_list[player_id][index].number > record_count) {
    //                                 record_count = GameRules.ArchiveService.server_package_list[player_id][index].number;
    //                                 record_index = index;
    //                             }
    //                         }
    //                     }
    //                     if (record_index != -1) {
    //                         if (GameRules.ArchiveService.server_package_list[player_id][record_index].number < need_list[item_id]) {
    //                             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备附魔:附魔材料不足");
    //                             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                             return;
    //                         }
    //                     } else {
    //                         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备附魔:附魔材料无");
    //                         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                         return;
    //                     }
    //                 }
    //             }
    //             let consume = "";
    //             for (const key in need_list) {
    //                 consume += consume == "" ? key + "_" + need_list[key] + "_0" : "," + key + "_" + need_list[key] + "_0";
    //             }
    //             server_log += "ID:" + eq_id + ";"
    //             server_log += "CL:" + consume + ";";
    //             let i_type: number = 6;
    //             //根据类型改变
    //             //1副职 2强散技能 3套装
    //             let new_equi_data = CustomDeepCopy(equi_data) as CGEDGetEquipListInfo;
    //             let new_source_equi_data = CustomDeepCopy(source_equi_data) as CGEDGetEquipListInfo;
    //             if(adsor_type_1 == 1){
    //                 if(new_equi_data.t.length > 0 ){
    //                     new_equi_data.t[0] = new_source_equi_data.t[0]
    //                 }else{
    //                     new_equi_data.t.push(new_source_equi_data.t[0])
    //                 }
    //                 new_equi_data.t[0].v = imprinting_level_1;
    //             }
    //             if(adsor_type_2 == 1){
    //                 if(new_equi_data.w.length > 0 ){
    //                     new_equi_data.w[0] = new_source_equi_data.w[0]
    //                 }else{
    //                     new_equi_data.w.push(new_source_equi_data.w[0])
    //                 }
    //                 new_equi_data.w[0].v = imprinting_level_2;
    //             }
    //             if(adsor_type_3 == 1){
    //                 if(new_equi_data.wt.length > 0 ){
    //                     new_equi_data.wt[0] = new_source_equi_data.wt[0]
    //                 }else{
    //                     new_equi_data.wt.push(new_source_equi_data.wt[0])
    //                 }
    //                 new_equi_data.wt[0].v = imprinting_level_3;
    //             }
    //             server_log += "i:" + i_type + ";";
    //             server_log += "c:" + consume + ";";
    //             server_log += "dl:" + del_list + ";"
    //             let now: ServerEquip = this.EquipDataTransition(new_equi_data);
    //             let post_data = {
    //                 [eq_id]: now
    //             };
    //             GameRules.ArchiveService.EquipModify1(player_id, post_data, i_type , del_list,  consume, server_log  );
    //         }
    //     }else{
    //         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备附魔:不能自己附魔自己...");
    //         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //     }
    // }

    // //装备附魔 强化 1副职 2强散技能 3套装
    // EquipenChantmentIntensify(player_id: PlayerID, params: GEFPD["ServiceEquipment"]["EquipenChantmentIntensify"], callback?) {
    //     let eq_id = params.id;
    //     let equi_data = this.player_equi_list[player_id][eq_id];
    //     let server_log = "FMQH_";
    //     if (equi_data && equi_data.id != eq_id) {
    //         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "附魔强化:装备信息错误...");
    //         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //     } else {
    //         let imprinting_type = params.type;
    //         print("imprinting_type : " , imprinting_type )
    //         let imprinting_level = 0;
    //         let imprinting_item_id = 0;
    //         if(imprinting_type == 1){
    //             if(equi_data.t.length > 0 ){
    //                 imprinting_level = equi_data.t[0].v
    //                 imprinting_item_id = ServerEquipDeputyContrast[equi_data.t[0].k as keyof typeof ServerEquipDeputyContrast].item_id
    //             }else{
    //                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "附魔强化:当前位置没有附魔技能或者套装");
    //                 GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                 return;
    //             }
    //         }else if(imprinting_type == 2){
    //             if(equi_data.w.length > 0 ){
    //                 imprinting_level = equi_data.w[0].v
    //                 imprinting_item_id = ServerEquipDemon[equi_data.w[0].k as keyof typeof ServerEquipDemon].item_id
    //             }else{
    //                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "附魔强化:当前位置没有附魔技能或者套装");
    //                 GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                 return;
    //             }
    //         }else if(imprinting_type == 3){
    //             if(equi_data.wt.length > 0 ){
    //                 imprinting_level = equi_data.wt[0].v
    //                 imprinting_item_id = ServerEquipDemonSuitContras[equi_data.wt[0].k as keyof typeof ServerEquipDemonSuitContras].item_id
    //             }else{
    //                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "附魔强化:当前位置没有附魔技能或者套装");
    //                 GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                 return;
    //             }
    //         }else{
    //             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "附魔强化:参数错误");
    //             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //             return;
    //         }
    //         let need_list: {
    //             [item_id: string]: number;
    //         } = {};
    //         if (imprinting_level >= 10) {
    //             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "附魔强化:附魔强化等级超过上线...");
    //             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //         } else {
    //             if(!this.equip_encha_data[imprinting_type] || !this.equip_encha_data[imprinting_type][imprinting_level]){
    //                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "附魔强化: 未找到配置id");
    //                 GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                 return;
    //             }
    //             let EquipEnchaConfigId = this.equip_encha_data[imprinting_type][imprinting_level]
    //             let EquipIntensifyConfig = ServerEquipEnchaConfig[EquipEnchaConfigId as keyof typeof ServerEquipEnchaConfig];
    //             if(!EquipIntensifyConfig){
    //                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "附魔强化: 配置错误");
    //                 GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                 return;
    //             }
    //             //碎片数量
    //             let intensify_count = EquipIntensifyConfig.intensify_count;
    //             let need_materials = EquipIntensifyConfig.intensify_item_count;
    //             let power = EquipIntensifyConfig[(equi_data.r + "_consume_power")] as number;
    //             // intensify_count = math.ceil((intensify_count * power))
    //             need_list[imprinting_item_id + 1] = intensify_count;
    //             if (GameRules.ArchiveService.imprinting_debris_list[player_id].hasOwnProperty(imprinting_item_id + 1)) {
    //                 if (GameRules.ArchiveService.imprinting_debris_list[player_id][imprinting_item_id + 1].number < intensify_count) {
    //                     GameRules.CMsg.SendErrorMsgToPlayer(player_id, "附魔强化:附魔碎片不足");
    //                     GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                     return;
    //                 }
    //             } else {
    //                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "附魔强化:没有对应碎片");
    //                 GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                 return;
    //             }

    //             for (const iterator of need_materials) {
    //                 if (iterator.includes("_")) {
    //                     let i_liet = iterator.split("_");
    //                     let item_id = tonumber(i_liet[0]);
    //                     let item_number = tonumber(i_liet[1]);
    //                     need_list[item_id] = math.ceil((item_number * power));
    //                     if(item_id == 8 ){ //箭魂特殊处理
    //                         print("GameRules.ArchiveService.player_currency[player_id].jian_hun ",GameRules.ArchiveService.player_currency[player_id].jian_hun )
    //                         print("need_list[item_id]",need_list[item_id])
    //                         if (GameRules.ArchiveService.player_currency[player_id].jian_hun < need_list[item_id]) {
    //                             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "附魔强化:箭魂不足");
    //                             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                             return;
    //                         }
    //                         continue
    //                     }
    //                     //预防服务器bug必须要全部检查一次
    //                     let record_count: number = 0;
    //                     let record_index: number = -1;
    //                     for (let index = 0; index < GameRules.ArchiveService.server_package_list[player_id].length; index++) {
    //                         if (GameRules.ArchiveService.server_package_list[player_id][index].item_id == item_id) {
    //                             if (GameRules.ArchiveService.server_package_list[player_id][index].number > record_count) {
    //                                 record_count = GameRules.ArchiveService.server_package_list[player_id][index].number;
    //                                 record_index = index;
    //                             }
    //                         }
    //                     }
    //                     if (record_index != -1) {
    //                         if (GameRules.ArchiveService.server_package_list[player_id][record_index].number < need_list[item_id]) {
    //                             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "附魔强化:附魔材料不足");
    //                             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                             return;
    //                         }
    //                     } else {
    //                         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "附魔强化:附魔材料无");
    //                         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                         return;
    //                     }
    //                 }
    //             }
    //             //深拷贝一份数据
    //             let new_equi_data = CustomDeepCopy(equi_data) as CGEDGetEquipListInfo;
    //             let consume = "";
    //             for (const key in need_list) {
    //                 if (key.toString() == "8") {
    //                     new_equi_data.em22 += need_list[key];
    //                 } else if (key.toString() == "18") {
    //                     new_equi_data.em23 += need_list[key];
    //                 } else if (key.toString() == "19") {
    //                     new_equi_data.em24 += need_list[key];
    //                 } else if (key.toString() == "25") {
    //                     new_equi_data.em25 += need_list[key];
    //                 }
    //                 consume += consume == "" ? key + "_" + need_list[key] + "_0" : "," + key + "_" + need_list[key] + "_0";
    //             }
    //             server_log += "ID:" + eq_id + ";"
    //             server_log += "CL:" + consume + ";";
    //             print("consume",consume)
    //             let i_type: number = 7;
    //             //根据类型改变
    //             //1副职 2强散技能 3套装
    //             if(imprinting_type == 1){
    //                 new_equi_data.t[0].v ++;
    //             }else if(imprinting_type == 2){
    //                 new_equi_data.w[0].v ++;
    //             }else if(imprinting_type == 3){
    //                 new_equi_data.wt[0].v ++;
    //             }else{
    //                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备附魔:强化错误");
    //                 GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                 return;
    //             }
    //             server_log += "i:" + i_type + ";";
    //             let now: ServerEquip = this.EquipDataTransition(new_equi_data);
    //             let post_data = {
    //                 [eq_id]: now
    //             };

    //             // GameRules.ArchiveService.GetIntensifyPlayerEquip(player_id, post_data, i_type, consume, server_log );
    //             GameRules.ArchiveService.EquipModify1(player_id, post_data, i_type , "",  consume, server_log  );
    //         }
    //     }
    // }
    // //获取玩家最高飞升等级
    // GetPlayerEquipLevelMax(player_id: PlayerID, params: GEFPD["ServiceEquipment"]["GetPlayerEquipLevelMax"], callback?){
    //     CustomGameEventManager.Send_ServerToPlayer(
    //         PlayerResource.GetPlayer(player_id),
    //         "ServiceEquipment_GetPlayerEquipLevelMax",
    //         {
    //             data: {
    //                 equip_level_max : GameRules.ArchiveService.player_equip_level_max[player_id]
    //             }
    //         }
    //     );
    // }
    // //装备升级
    // EquipLevelUp(player_id: PlayerID, params: GEFPD["ServiceEquipment"]["EquipLevelUp"], callback?) {
    //     let eq_id = params.id;
    //     let equi_data = this.player_equi_list[player_id][eq_id];
    //     let server_log = "FS_"
    //     if (equi_data.id != eq_id) {
    //         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备飞升:装备信息错误...");
    //         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //     } else {
    //         if (GameRules.ArchiveService.player_equip_level_max[player_id] <= equi_data.zl || equi_data.zm <= equi_data.zl) {
    //             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备飞升:等级已到上限...");
    //             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //         } else {
    //             let EquipIntensifyConfig = SEIntensifyLevelConfig[(equi_data.zl).toString() as keyof typeof SEIntensifyLevelConfig];
    //             // let e_d = ServerEquipInfo[equi_data.n as keyof typeof ServerEquipInfo];

    //             let need_materials = EquipIntensifyConfig.level_materials
    //             // if (e_d.class_level == 5) {
    //             //     need_materials = EquipIntensifyConfig["class_level_5"];
    //             // } else if (e_d.class_level == 10) {
    //             //     need_materials = EquipIntensifyConfig["class_level_10"];
    //             // } else if (e_d.class_level == 15) {
    //             //     need_materials = EquipIntensifyConfig["class_level_15"];
    //             // } else if (e_d.class_level == 20) {
    //             //     need_materials = EquipIntensifyConfig["class_level_20"];
    //             // } else {
    //             //     GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备强化: 配置错误");
    //             //     GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //             //     return;
    //             // }
    //             // DeepPrintTable(need_materials)
    //             let power = EquipIntensifyConfig[(equi_data.r + "_consume_power")] as number;
    //             let need_list: {
    //                 [item_id: string]: number;
    //             } = {};

    //             for (const iterator of need_materials) {
    //                 if (iterator.includes("_")) {
    //                     let i_liet = iterator.split("_");
    //                     let item_id = tonumber(i_liet[0]);
    //                     let item_number = tonumber(i_liet[1]);
    //                     need_list[item_id] = math.ceil((item_number * power));

    //                     if(item_id == 8 ){ //箭魂特殊处理
    //                         if (GameRules.ArchiveService.player_currency[player_id].jian_hun < need_list[item_id]) {
    //                             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备飞升:箭魂不足");
    //                             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                             return;
    //                         }
    //                         continue
    //                     }
    //                     //预防服务器bug必须要全部检查一次

    //                     let record_count: number = 0;
    //                     let record_index: number = -1;

    //                     for (let index = 0; index < GameRules.ArchiveService.server_package_list[player_id].length; index++) {
    //                         if (GameRules.ArchiveService.server_package_list[player_id][index].item_id == item_id) {
    //                             if (GameRules.ArchiveService.server_package_list[player_id][index].number > record_count) {
    //                                 record_count = GameRules.ArchiveService.server_package_list[player_id][index].number;
    //                                 record_index = index;
    //                             }
    //                         }
    //                     }
    //                     if (record_index != -1) {
    //                         if (GameRules.ArchiveService.server_package_list[player_id][record_index].number < need_list[item_id]) {
    //                             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备飞升:强化材料不足");
    //                             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                             return;
    //                         }
    //                     } else {
    //                         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备飞升:没有强化材料");
    //                         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                         return;
    //                     }
    //                 }
    //             }
    //             //深拷贝一份数据
    //             let new_equi_data = CustomDeepCopy(equi_data) as CGEDGetEquipListInfo;
    //             let consume = "";

    //             for (const key in need_list) {
    //                 if (key.toString() == "8") {
    //                     new_equi_data.em22 += need_list[key];
    //                 } else if (key.toString() == "18") {
    //                     new_equi_data.em23 += need_list[key];
    //                 } else if (key.toString() == "19") {
    //                     new_equi_data.em24 += need_list[key];
    //                 } else if (key.toString() == "25") {
    //                     new_equi_data.em25 += need_list[key];
    //                 }
    //                 consume += consume == "" ? key + "_" + need_list[key] + "_0" : "," + key + "_" + need_list[key] + "_0";
    //             }

    //             server_log += "ID:" + eq_id + ";"
    //             server_log += "CL:" + consume + ";";
    //             print(server_log)
    //             let i_type: number = 0;
    //             new_equi_data.zl++;
    //             i_type = 5;

    //             //发生历史等级改变时增加一个词条
    //             // if (new_equi_data.l > new_equi_data.ll) {
    //             //     new_equi_data.ll = new_equi_data.l;
    //             //     //是否添加额外词条 增加一个额外词条
    //             //     if (new_equi_data.l % 5 == 0) {
    //             //         new_equi_data.a.push(this.AttrSeae(e_d));
    //             //     }
    //             // }
    //             server_log += "ZL:" + new_equi_data.zl + ";";
    //             server_log += "i:" + i_type + ";";
    //             let now: ServerEquip = this.EquipDataTransition(new_equi_data);
    //             let post_data = {
    //                 [eq_id]: now
    //             };

    //             // GameRules.ArchiveService.GetIntensifyPlayerEquip(player_id, post_data, i_type, consume, server_log );
    //             GameRules.ArchiveService.EquipModify1(player_id, post_data, i_type , "",  consume, server_log  );
    //         }
    //     }
    // }

    // /**
    //  * 装备剥离
    //  * @param player_id
    //  * @param params
    //  * @param callback
    //  * @returns
    //  */
    // EquipExfoliation(player_id: PlayerID, params: GEFPD["ServiceEquipment"]["EquipExfoliation"], callback?) {
    //     let equip_id = params.equip_id;
    //     let server_log = "BL_";
    //     let ResolveEquipData = this.GetExfoliationEquipItems(player_id , equip_id)
    //     let add_list_count = ResolveEquipData.add_list_count;
    //     let add_item_list = ResolveEquipData.add_item_list;
    //     let eq_id = params.equip_id;
    //     let equi_data = this.player_equi_list[player_id][eq_id];
    //     if (equi_data.id != eq_id) {
    //         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备剥离:装备信息错误...");
    //         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //     } else {
    //         let need_materials = [ ResolveEquipData.consume_item ]
    //         let need_list: {
    //             [item_id: string]: number;
    //         } = {};
    //         for (const iterator of need_materials) {
    //             if (iterator.includes("_")) {
    //                 let i_liet = iterator.split("_");
    //                 let item_id = tonumber(i_liet[0]);
    //                 let item_number = tonumber(i_liet[1]);
    //                 need_list[item_id] = math.ceil((item_number * 1));

    //                 if(item_id == 8 ){ //箭魂特殊处理
    //                     if (GameRules.ArchiveService.player_currency[player_id].jian_hun < need_list[item_id]) {
    //                         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备剥离:箭魂不足");
    //                         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                         return;
    //                     }
    //                     continue
    //                 }
    //                 //预防服务器bug必须要全部检查一次

    //                 let record_count: number = 0;
    //                 let record_index: number = -1;

    //                 for (let index = 0; index < GameRules.ArchiveService.server_package_list[player_id].length; index++) {
    //                     if (GameRules.ArchiveService.server_package_list[player_id][index].item_id == item_id) {
    //                         if (GameRules.ArchiveService.server_package_list[player_id][index].number > record_count) {
    //                             record_count = GameRules.ArchiveService.server_package_list[player_id][index].number;
    //                             record_index = index;
    //                         }
    //                     }
    //                 }
    //                 if (record_index != -1) {
    //                     if (GameRules.ArchiveService.server_package_list[player_id][record_index].number < need_list[item_id]) {
    //                         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备剥离:剥离材料不足");
    //                         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                         return;
    //                     }
    //                 } else {
    //                     GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备剥离:没有剥离材料");
    //                     GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                     return;
    //                 }
    //             }
    //         }
    //         //深拷贝一份数据
    //         let new_equi_data = CustomDeepCopy(equi_data) as CGEDGetEquipListInfo;
    //         let consume = "";
    //         for (const key in need_list) {
    //             consume += consume == "" ? key + "_" + need_list[key] + "_0" : "," + key + "_" + need_list[key] + "_0";
    //         }
    //         server_log += "ID:" + eq_id + ";"
    //         server_log += "CL:" + add_list_count + ";";
    //         let i_type: number = 0;
    //         new_equi_data.zl = 1;
    //         new_equi_data.l = 0;
    //         new_equi_data.em22 = 0;
    //         new_equi_data.em23 = 0;
    //         new_equi_data.em24 = 0;
    //         new_equi_data.em25 = 0;
    //         i_type = 8;
    //         let now: ServerEquip = this.EquipDataTransition(new_equi_data);
    //         let post_data = {
    //             [eq_id]: now
    //         };
    //         let add_list_string = "";
    //         for (const key in add_item_list) {
    //             add_list_string += add_list_string == "" ? key + "_" + math.floor(add_item_list[key]) : "," + key + "_" + math.floor(add_item_list[key]);
    //         }
    //         GameRules.ArchiveService.EquipModify1(player_id, post_data, i_type , "",  consume, server_log  ,add_list_string);
    //     }
    // }

    // /**
    //  * 获取剥离装备所获材料
    //  * @param player_id
    //  * @param params
    //  * @param callback
    //  */
    // GetEquipExfoliationData(player_id: PlayerID, params: GEFPD["ServiceEquipment"]["GetEquipExfoliationData"], callback?){
    //     let equip_id = params.equip_id;
    //     let ret_data = this.GetExfoliationEquipItems(player_id , equip_id);
    //     CustomGameEventManager.Send_ServerToPlayer(
    //         PlayerResource.GetPlayer(player_id),
    //         "ServiceEquipment_GetEquipExfoliationData",
    //         {
    //             data: {
    //                 list: ret_data.add_item_list,
    //                 consume_item : ret_data.consume_item,
    //                 equip_id : ret_data.equip_id,
    //             }
    //         }
    //     );
    // }

    //装备强化
    EquipIntensify(player_id: PlayerID, params: CGED['ServiceEquipment']['EquipIntensify'], callback?) {
        const equip_id = params.equip_id;
        if (GameRules.ServiceEquipment.player_equip_list[player_id].hasOwnProperty(equip_id)) {
            const equipobj = CustomDeepCopy(GameRules.ServiceEquipment.player_equip_list[player_id][equip_id]) as CGEDGetEquipListInfo;
            const level_max = Object.keys(ServerAttrIntensifyConfig).length;
            if (!equipobj.i) {
                equipobj.i = 0;
            }
            if (equipobj.i < level_max) {
                //最大等级
                //tudo 需要扣除材料
                const target_level = equipobj.i + 1;
                //获取目标key
                const IntensifyConfig = ServerAttrIntensifyConfig[tostring(target_level) as keyof typeof ServerAttrIntensifyConfig];
                //强化石需要数量
                const qhs_count = IntensifyConfig[equipobj.r + '_qhs'];
                //金币需要数量
                const gold_count = IntensifyConfig[equipobj.r + '_gold'];
                //强化成功失败
                if (RollPercentage(IntensifyConfig.probability)) {
                    equipobj.i++;
                } else {
                    if (IntensifyConfig.is_demotion == 1) {
                        equipobj.i--;
                    }
                }
                //tudo 需要扣除材料
                const server_equip: { [equip_id: string]: ServerEquip } = {
                    [equipobj.id]: {
                        id: equipobj.id,
                        n: equipobj.n, //装备key
                        r: equipobj.r, //稀有度 0 1 2 3 => n,r,sr,ssr
                        zl: equipobj.zl, //装备等级
                        i: equipobj.i,
                        ma: this.EquipTDecode(equipobj.ma), //装备主属性
                        pa: this.EquipTDecode(equipobj.pa), // 装备拼图属性
                        s: this.EquipTDecode(equipobj.s), //套装数据
                        lk: equipobj.lk, //装备锁
                        t: equipobj.t, //套装位置
                    },
                };
                DeepPrintTable(server_equip);
                GameRules.ArchiveService.UpdateEquip(player_id, server_equip);
            } else {
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, '装备强化已达到最大等级.');
            }
        } else {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, '装备不存在...');
        }
    }

    //强化转移
    IntensifyTransfer(player_id: PlayerID, params: CGED['ServiceEquipment']['IntensifyTransfer'], callback?) {
        const source_equip_id = params.source_equip_id; //来源装备
        const target_equip_id = params.source_equip_id; //目标装备id（增加强化的装备）
        if (!GameRules.ServiceEquipment.player_equip_list[player_id].hasOwnProperty(source_equip_id)) {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, '来源装备不存在...');
            return;
        }
        if (!GameRules.ServiceEquipment.player_equip_list[player_id].hasOwnProperty(target_equip_id)) {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, '目标装备不存在...');
            return;
        }

        const source_equip_obj = CustomDeepCopy(GameRules.ServiceEquipment.player_equip_list[player_id][source_equip_id]) as CGEDGetEquipListInfo;
        const target_equip_obj = CustomDeepCopy(GameRules.ServiceEquipment.player_equip_list[player_id][target_equip_id]) as CGEDGetEquipListInfo;
        //tudo 需要扣除材料
        const server_equip: { [equip_id: string]: ServerEquip } = {};
        server_equip[source_equip_obj.id] = {
            id: source_equip_obj.id,
            n: source_equip_obj.n, //装备key
            r: source_equip_obj.r, //稀有度 0 1 2 3 => n,r,sr,ssr
            zl: source_equip_obj.zl, //装备等级
            i: target_equip_obj.i, //交换强化等级
            ma: this.EquipTDecode(source_equip_obj.ma), //装备主属性
            pa: this.EquipTDecode(source_equip_obj.pa), // 装备拼图属性
            s: this.EquipTDecode(source_equip_obj.s), //套装数据
            lk: source_equip_obj.lk, //装备锁
            t: source_equip_obj.t, //套装位置
        };
        server_equip[target_equip_obj.id] = {
            id: target_equip_obj.id,
            n: target_equip_obj.n, //装备key
            r: target_equip_obj.r, //稀有度 0 1 2 3 => n,r,sr,ssr
            zl: target_equip_obj.zl, //装备等级
            i: source_equip_obj.i, //交换强化等级
            ma: this.EquipTDecode(target_equip_obj.ma), //装备主属性
            pa: this.EquipTDecode(target_equip_obj.pa), // 装备拼图属性
            s: this.EquipTDecode(target_equip_obj.s), //套装数据
            lk: target_equip_obj.lk, //装备锁
            t: target_equip_obj.t, //套装位置
        };
        DeepPrintTable(server_equip);
        GameRules.ArchiveService.UpdateEquip(player_id, server_equip);
    }

    /**
     * 混石转移
     * @param player_id
     * @param params
     * @param callback
     * @returns
     */
    PuzzleTransfer(player_id: PlayerID, params: CGED['ServiceEquipment']['PuzzleTransfer'], callback?) {
        const source_equip_id = params.source_equip_id; //来源装备
        const target_equip_id = params.source_equip_id; //目标装备id（增加强化的装备）
        if (!GameRules.ServiceEquipment.player_equip_list[player_id].hasOwnProperty(source_equip_id)) {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, '来源装备不存在...');
            return;
        }
        if (!GameRules.ServiceEquipment.player_equip_list[player_id].hasOwnProperty(target_equip_id)) {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, '目标装备不存在...');
            return;
        }

        const source_equip_obj = CustomDeepCopy(GameRules.ServiceEquipment.player_equip_list[player_id][source_equip_id]) as CGEDGetEquipListInfo;
        const target_equip_obj = CustomDeepCopy(GameRules.ServiceEquipment.player_equip_list[player_id][target_equip_id]) as CGEDGetEquipListInfo;
        //来源的装备必须大于目标
        if (source_equip_obj.n < target_equip_obj.n) {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, '来源装备品质必须大于目标装备...');
            return;
        }
        //tudo 需要扣除材料
        const server_equip: { [equip_id: string]: ServerEquip } = {};
        server_equip[source_equip_obj.id] = {
            id: source_equip_obj.id,
            n: source_equip_obj.n, //装备key
            r: source_equip_obj.r, //稀有度 0 1 2 3 => n,r,sr,ssr
            zl: source_equip_obj.zl, //装备等级
            i: source_equip_obj.i, //交换强化等级
            ma: this.EquipTDecode(source_equip_obj.ma), //装备主属性
            pa: this.EquipTDecode([]), // 装备拼图属性
            s: this.EquipTDecode(source_equip_obj.s), //套装数据
            lk: source_equip_obj.lk, //装备锁
            t: source_equip_obj.t, //套装位置
        };
        server_equip[target_equip_obj.id] = {
            id: target_equip_obj.id,
            n: target_equip_obj.n, //装备key
            r: target_equip_obj.r, //稀有度 0 1 2 3 => n,r,sr,ssr
            zl: target_equip_obj.zl, //装备等级
            i: target_equip_obj.i, //交换强化等级
            ma: this.EquipTDecode(target_equip_obj.ma), //装备主属性
            pa: this.EquipTDecode(source_equip_obj.pa), // 装备拼图属性
            s: this.EquipTDecode(target_equip_obj.s), //套装数据
            lk: target_equip_obj.lk, //装备锁
            t: target_equip_obj.t, //套装位置
        };
        DeepPrintTable(server_equip);
        GameRules.ArchiveService.UpdateEquip(player_id, server_equip);
    }

    // //安装装备
    InstallEquip(player_id: PlayerID, params: CGED['ServiceEquipment']['InstallEquip'], callback?) {
        const equip_id = params.equip_id;
        const equi_data = this.player_equip_list[player_id][equip_id];
        if (equi_data.id != equip_id) {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, '穿戴装备:装备信息错误...');
        } else {
            if (!params.hero_id) {
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, '穿戴装备:角色错误....');
            } else {
                if (!this.player_equip_list[player_id].hero[params.hero_id]) {
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id, '穿戴装备:未找到角色...');
                } else {
                    const e_d = ServerEquipInfo[equi_data.n as keyof typeof ServerEquipInfo];
                    this.player_equip_list[player_id].hero[params.hero_id][params.t - 1][e_d.type] = equi_data.id;
                }
            }
        }
        this.GetEquipConfig(player_id, {});
    }

    //保存装备
    SaveEquipConfig(player_id: PlayerID, params: CGED['ServiceEquipment']['SaveEquipConfig'], callback?) {
        GameRules.ArchiveService.EquipCfgModify(player_id, this.player_equip_config[player_id]);
    }

    //还原装备配置装备
    RestoreEquipConfig(player_id: PlayerID, params: CGED['ServiceEquipment']['RestoreEquipConfig'], callback?) {
        if (!this.player_equip_config[player_id].hero[params.hero_id]) {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, '还原配装:未找到角色...');
        } else {
            this.player_equip_config[player_id].hero[params.hero_id][params.t - 1] = CustomDeepCopy(
                this.server_player_equip_config[player_id].hero[params.hero_id][params.t - 1]
            ) as string[];
        }
        this.GetEquipConfig(player_id, {});
    }

    //解除装备
    UninstallEquip(player_id: PlayerID, params: CGED['ServiceEquipment']['UninstallEquip'], callback?) {
        if (!this.player_equip_config[player_id].hero[params.hero_id]) {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, '解除装备:未找到角色...');
        } else {
            this.player_equip_config[player_id].hero[params.hero_id][params.t - 1][params.equip_type] = '';
        }
        this.GetEquipConfig(player_id, {});
    }

    // //分解数量
    GetResolveEquipItems(
        player_id: PlayerID,
        l_list: {
            [index: string]: string;
        }
    ): {
        add_list_count: number;
        add_item_list: { [item_id: string]: number };
        del_list_id: string;
    } {
        const ret_data: {
            add_list_count: number;
            add_item_list: { [item_id: string]: number };
            del_list_id: string;
        } = { add_list_count: 0, add_item_list: {}, del_list_id: '' };
        // let add_item_list: { [item_id: string]: number; } = {};
        for (const equip_key in l_list) {
            const n = GameRules.ServiceEquipment.player_equip_list[player_id][l_list[equip_key]].n; //key
            const r = GameRules.ServiceEquipment.player_equip_list[player_id][l_list[equip_key]].r; //稀有度
            const zl = GameRules.ServiceEquipment.player_equip_list[player_id][l_list[equip_key]].zl; //装备等级
            const i = GameRules.ServiceEquipment.player_equip_list[player_id][l_list[equip_key]].i; //目标等级

            const equip_data = ServerEquipInfo[n as keyof typeof ServerEquipInfo];
            const IntensifyConfig = ServerAttrIntensifyConfig[tostring(i) as keyof typeof ServerAttrIntensifyConfig];

            const qhs_count = IntensifyConfig[r + '_qhs'];
            const gold_count = IntensifyConfig[r + '_gold'];
            //自身装备分解获得
            // for (const item_str of fj_item_list) {
            //     if (item_str.includes("_")) {
            //         let item_list = item_str.split("_");
            //         if (ret_data.add_item_list.hasOwnProperty(item_list[0])) {
            //             ret_data.add_item_list[item_list[0]] += tonumber(item_list[1]);
            //         } else {
            //             ret_data.add_item_list[item_list[0]] = tonumber(item_list[1]);
            //         }
            //     }
            // }

            // for (const item_str of fj_item_list) {
            //     if (item_str.includes("_")) {
            //         let item_list = item_str.split("_");
            //         if (ret_data.add_item_list.hasOwnProperty(item_list[0])) {
            //             ret_data.add_item_list[item_list[0]] += tonumber(item_list[1]);
            //         } else {
            //             ret_data.add_item_list[item_list[0]] = tonumber(item_list[1]);
            //         }
            //     }
            // }
            ret_data.del_list_id += ret_data.del_list_id == '' ? l_list[equip_key] : ',' + l_list[equip_key];
            ret_data.add_list_count++;
            //取整
            for (const key in ret_data.add_item_list) {
                ret_data.add_item_list[key] = math.floor(ret_data.add_item_list[key]);
            }
        }
        return ret_data;
    }

    // //剥离数量
    // GetExfoliationEquipItems( player_id :PlayerID , equip_id : string) : {
    //     add_list_count : number,
    //     add_item_list: { [item_id: string]: number; }
    //     equip_id : string,
    //     consume_item : string,
    // }{
    //     let ret_data : {
    //         add_list_count : number,
    //         add_item_list: { [item_id: string]: number; }
    //         equip_id : string,
    //         consume_item : string,
    //     } = { add_list_count : 0 , add_item_list : {} , equip_id : "" , consume_item : "89_1"};
    //     let consume_item_count = 0
    //     for (let index = 0; index < GameRules.ArchiveService.server_package_list[player_id].length; index++) {
    //         if (GameRules.ArchiveService.server_package_list[player_id][index].item_id == 89) {
    //             consume_item_count = GameRules.ArchiveService.server_package_list[player_id][index].number
    //         }
    //     }
    //     ret_data.consume_item = ret_data.consume_item + "_" + consume_item_count;
    //     let n = this.player_equi_list[player_id][equip_id].n;
    //     let em22 = this.player_equi_list[player_id][equip_id].em22;
    //     let em23 = this.player_equi_list[player_id][equip_id].em23;
    //     let em24 = this.player_equi_list[player_id][equip_id].em24;
    //     //记录值返回
    //     if(em22 > 0 ){
    //         let item_8 = math.ceil(em22 * 1)
    //         if (ret_data.add_item_list.hasOwnProperty("8")) {
    //             ret_data.add_item_list["8"] += item_8;
    //         } else {
    //             ret_data.add_item_list["8"] = item_8;
    //         }
    //     }
    //     if(em23 > 0 ){
    //         let item_18 = math.ceil(em23 * 1)
    //         if (ret_data.add_item_list.hasOwnProperty("18")) {
    //             ret_data.add_item_list["18"] += item_18;
    //         } else {
    //             ret_data.add_item_list["18"] = item_18;
    //         }
    //     }
    //     if(em24 > 0 ){
    //         let item_19 = math.ceil(em24 * 1)
    //         if (ret_data.add_item_list.hasOwnProperty("19")) {
    //             ret_data.add_item_list["19"] += item_19;
    //         } else {
    //             ret_data.add_item_list["19"] = item_19;
    //         }
    //     }
    //     ret_data.equip_id += ret_data.equip_id == "" ? equip_id : "," + equip_id;
    //     ret_data.add_list_count++;
    //     if(ret_data.add_item_list.hasOwnProperty("8") ){
    //         delete ret_data.add_item_list["8"] ; //= jh_count
    //     }
    //     return ret_data;
    // }
    /**
     * 获取分解装备所获材料
     * @param player_id
     * @param params
     * @param callback
     */
    GetResolveEquipData(player_id: PlayerID, params: CGED['ServiceEquipment']['GetResolveEquipData'], callback?) {
        const id_list = params.id_list as any;
        const id_list_obj = id_list as {
            [index: string]: string;
        };
        const ret_data = this.GetResolveEquipItems(player_id, id_list_obj);
        const add_item_list = ret_data.add_item_list;
        CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(player_id), 'ServiceEquipment_GetResolveEquipData', {
            data: {
                list: add_item_list,
            },
        });
    }

    /**
     * //分解装备
     * @param player_id
     * @param params
     * @param callback
     */
    ResolveEquip(player_id: PlayerID, params: CGED['ServiceEquipment']['ResolveEquip'], callback?) {
        const id_list = params.id_list as any;
        const id_list_obj = id_list as {
            [index: string]: string;
        };
        let add_list_string = '';
        let server_log = 'FJ_';
        const ResolveEquipData = this.GetResolveEquipItems(player_id, id_list_obj);
        const add_list_count = ResolveEquipData.add_list_count;
        const add_item_list = ResolveEquipData.add_item_list;
        const del_list_id = ResolveEquipData.del_list_id;
        if (del_list_id != '') {
            for (const key in add_item_list) {
                add_list_string +=
                    add_list_string == '' ? key + '_' + math.floor(add_item_list[key]) : ',' + key + '_' + math.floor(add_item_list[key]);
            }
            server_log += 'C:' + add_list_count + ';';
            server_log += 'CL:' + add_list_string + ';';
            // let item : AM2_Server_ToGetLog[] = [];
            // let add_list_list = add_list_string.split(",");
            // for(const add_list_info of add_list_list){
            //     if(add_list_info.includes("_")){
            //         let add_list_info_list = add_list_info.split("_");
            //         let add_item_key = tonumber(add_list_info_list[0]);
            //         let add_item_count = tonumber(add_list_info_list[1]);
            //         let ItemData = ServerItemList[add_item_key.toString() as keyof typeof ServerItemList];
            //         item.push({
            //             types  : ItemData.affiliation_class, // 物品表类型
            //             number : add_item_count, //数量
            //             item_id : add_item_key, // 物品id
            //             lv : ItemData.lv , //等级
            //             fj : 0, // 是否有子类 0无 1有
            //         })
            //         // let is_new_item = true;

            //         // GameRules.ArchiveService.server_package_list[player_id].map((v)=>{
            //         //     if(v.item_id == add_item_key){
            //         //         v.number += add_item_count;
            //         //         is_new_item = false;
            //         //     }
            //         // })
            //         // if(is_new_item == true){
            //         //         if(add_item_key == 1){
            //         //             GameRules.ArchiveService.player_currency[player_id].zuan_shi += add_item_count;
            //         //     }else if(add_item_key == 2){
            //         //         GameRules.ArchiveService.player_currency[player_id].jing_hua += add_item_count;
            //         //     }else if(add_item_key == 8){
            //         //         GameRules.ArchiveService.player_currency[player_id].jian_hun += add_item_count;
            //         //     }else{
            //         //         GameRules.ArchiveService.server_package_list[player_id].push({
            //         //             id : "0" ,
            //         //             item_id : add_item_key,	//物品表唯一id
            //         //             class :ItemData.affiliation_class,	//物品表分类
            //         //             lv  : ItemData.lv,	//物品等级
            //         //             number :add_item_count,	//物品数量
            //         //             customs : "", //自定义字段
            //         //         })
            //         //     }
            //         // }
            //     }
            // }
            // GameRules.ServiceEquipment.GetEquipList(player_id , {});
            //     GameRules.ServiceInterface.GetPlayerBase(player_id , {});
            //     GameRules.ServiceInterface.GetPlayerServerPackageData( player_id , {})
            //     GameRules.ServiceInterface.SendPlayerShoppingBuyData( player_id , 1 , "" , item);
            // return

            // GameRules.ArchiveService.DelPlayerEquip(player_id, del_list_id, add_list_string , server_log);
        } else {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, '分解装备:无效的装备');
            GameRules.ServiceEquipment.GetEquipList(player_id, {});
        }
    }

    // /**
    //  * //通过吸取印记进行分解装备
    //  * @param player_id
    //  * @param params
    //  * @param callback
    //  */
    // AdsorbEquip(player_id: PlayerID, params: GEFPD["ServiceEquipment"]["AdsorbEquip"], callback?) {
    //     let equip_id = params.equip_id
    //     let adsor_type = params.adsor_type
    //     let del_list_id = "";
    //     let add_list_count = 0;
    //     let add_list_string = "";
    //     let server_log = "XQ_"
    //     let add_item_list: { [item_id: string]: number; } = {};
    //     let n = this.player_equi_list[player_id][equip_id].n;
    //     let l = this.player_equi_list[player_id][equip_id].l;
    //     let r = this.player_equi_list[player_id][equip_id].r;
    //     let zl = this.player_equi_list[player_id][equip_id].zl;
    //     //副职
    //     let t = this.player_equi_list[player_id][equip_id].t;
    //     //技能
    //     let w = this.player_equi_list[player_id][equip_id].w;
    //     //套装
    //     let wt = this.player_equi_list[player_id][equip_id].wt;
    //     let equip_data = ServerEquipInfo[n as keyof typeof ServerEquipInfo];
    //     let fj_item_list = equip_data["disassembly_" + r] as string[];
    //     //等级返还量
    //     if (zl > 1) {
    //         let str_item_list : { [item_id: string]: number; } = {};
    //         for (let index = 2; index <= zl; index++) {
    //             let EquipIntensifyConfig = SEIntensifyLevelConfig[index.toString() as keyof typeof SEIntensifyLevelConfig];
    //             let lv_fj_item_list = EquipIntensifyConfig.level_materials as string[];
    //             for (const lv_item_str of lv_fj_item_list) {
    //                 if (lv_item_str.includes("_")) {
    //                     let item_list = lv_item_str.split("_");
    //                     let consume_power = EquipIntensifyConfig[r + "_consume_power"];
    //                     let value = math.floor(tonumber(item_list[1]) * consume_power);
    //                     if (value > 0) {
    //                         if (str_item_list.hasOwnProperty(item_list[0])) {
    //                             str_item_list[item_list[0]] += value;
    //                         } else {
    //                             str_item_list[item_list[0]] = value;
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //         //等级返回 0.5
    //         for (const key in str_item_list) {
    //             if (add_item_list.hasOwnProperty(key)) {
    //                 add_item_list[key] += str_item_list[key] * 0.5;
    //             } else {
    //                 add_item_list[key] = str_item_list[key] * 0.5;
    //             }
    //         }
    //     }
    //     //强化返回总量
    //     if (l > 0) {
    //         let str_item_list : { [item_id: string]: number; } = {};
    //         for (let index = 1; index <= l; index++) {
    //             let EquipIntensifyConfig = ServerNewEquipIntensify[index.toString() as keyof typeof ServerNewEquipIntensify];
    //             let lv_fj_item_list = EquipIntensifyConfig.class_level as string[];
    //             for (const lv_item_str of lv_fj_item_list) {
    //                 if (lv_item_str.includes("_")) {
    //                     let item_list = lv_item_str.split("_");
    //                     let consume_power = EquipIntensifyConfig[r + "_consume_power"];
    //                     let value = math.floor(tonumber(item_list[1]) * consume_power);
    //                     if (value > 0) {
    //                         if (str_item_list.hasOwnProperty(item_list[0])) {
    //                             str_item_list[item_list[0]] += value;
    //                         } else {
    //                             str_item_list[item_list[0]] = value;
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //         //强化返回 0.5
    //         for (const key in str_item_list) {
    //             if (add_item_list.hasOwnProperty(key)) {
    //                 add_item_list[key] += str_item_list[key] * 0.5;
    //             } else {
    //                 add_item_list[key] = str_item_list[key] * 0.5;
    //             }
    //         }
    //     }
    //     //副职印记碎片返回总量
    //     if (t.length > 0){
    //         let str_item_list : { [item_id: string]: number; } = {};
    //         let t_lv = t[0].v
    //         if(t_lv >= 0){
    //             for (let index = 0; index <= t_lv; index++) {
    //                 let encha_id = this.equip_encha_data[1][index];
    //                 let ServerEquipEnchaData = ServerEquipEnchaConfig[encha_id as keyof typeof ServerEquipEnchaConfig];
    //                 let lv_fj_item_list = ServerEquipEnchaData.intensify_item_count as string[];
    //                 for (const lv_item_str of lv_fj_item_list) {
    //                     if (lv_item_str.includes("_")) {
    //                         let item_list = lv_item_str.split("_");
    //                         let consume_power = ServerEquipEnchaData[r + "_consume_power"];
    //                         let value = math.floor(tonumber(item_list[1]) * consume_power);
    //                         if (value > 0) {
    //                             if (str_item_list.hasOwnProperty(item_list[0])) {
    //                                 str_item_list[item_list[0]] += value;
    //                             } else {
    //                                 str_item_list[item_list[0]] = value;
    //                             }
    //                         }
    //                     }
    //                 }
    //                 let intensify_count = ServerEquipEnchaData.intensify_count;
    //                 if(intensify_count > 0){
    //                     let item_id = ServerEquipDemon[t[0].k as keyof typeof  ServerEquipDemon].item_id + 1
    //                     if (str_item_list.hasOwnProperty(item_id)) {
    //                         str_item_list[item_id] += intensify_count;
    //                     } else {
    //                         str_item_list[item_id] = intensify_count;
    //                     }
    //                 }
    //             }
    //             //强化返回 0.5
    //             for (const key in str_item_list) {
    //                 if (add_item_list.hasOwnProperty(key)) {
    //                     add_item_list[key] += str_item_list[key] * 0.5;
    //                 } else {
    //                     add_item_list[key] = str_item_list[key] * 0.5;
    //                 }
    //             }
    //         }
    //     }
    //     //套装印记碎片返回总量
    //     if (wt.length > 0){
    //         let str_item_list : { [item_id: string]: number; } = {};
    //         let wt_lv = wt[0].v
    //         if(wt_lv >= 0){
    //             for (let index = 0; index <= wt_lv; index++) {
    //                 let encha_id = this.equip_encha_data[3][index];
    //                 let ServerEquipEnchaData = ServerEquipEnchaConfig[encha_id as keyof typeof ServerEquipEnchaConfig];
    //                 let lv_fj_item_list = ServerEquipEnchaData.intensify_item_count as string[];
    //                 for (const lv_item_str of lv_fj_item_list) {
    //                     if (lv_item_str.includes("_")) {
    //                         let item_list = lv_item_str.split("_");
    //                         let consume_power = ServerEquipEnchaData[r + "_consume_power"];
    //                         let value = math.floor(tonumber(item_list[1]) * consume_power);
    //                         if (value > 0) {
    //                             if (str_item_list.hasOwnProperty(item_list[0])) {
    //                                 str_item_list[item_list[0]] += value;
    //                             } else {
    //                                 str_item_list[item_list[0]] = value;
    //                             }
    //                         }
    //                     }
    //                 }
    //                 let intensify_count = ServerEquipEnchaData.intensify_count;
    //                 if(intensify_count > 0){
    //                     let item_id = ServerEquipDemonSuitContras[t[0].k as keyof typeof  ServerEquipDemonSuitContras].item_id + 1
    //                     if (str_item_list.hasOwnProperty(item_id)) {
    //                         str_item_list[item_id] += intensify_count;
    //                     } else {
    //                         str_item_list[item_id] = intensify_count;
    //                     }
    //                 }
    //             }
    //             //强化返回 0.5
    //             for (const key in str_item_list) {
    //                 if (add_item_list.hasOwnProperty(key)) {
    //                     add_item_list[key] += str_item_list[key] * 0.5;
    //                 } else {
    //                     add_item_list[key] = str_item_list[key] * 0.5;
    //                 }
    //             }
    //         }
    //     }
    //     //技能印记碎片返回总量
    //     if (w.length > 0){
    //         let str_item_list : { [item_id: string]: number; } = {};
    //         let w_lv = w[0].v
    //         if(w_lv >= 0){
    //             for (let index = 0; index <= w_lv; index++) {
    //                 let encha_id = this.equip_encha_data[2][index];
    //                 let ServerEquipEnchaData = ServerEquipEnchaConfig[encha_id as keyof typeof ServerEquipEnchaConfig];
    //                 let lv_fj_item_list = ServerEquipEnchaData.intensify_item_count as string[];
    //                 for (const lv_item_str of lv_fj_item_list) {
    //                     if (lv_item_str.includes("_")) {
    //                         let item_list = lv_item_str.split("_");
    //                         let consume_power = ServerEquipEnchaData[r + "_consume_power"];
    //                         let value = math.floor(tonumber(item_list[1]) * consume_power);
    //                         if (value > 0) {
    //                             if (str_item_list.hasOwnProperty(item_list[0])) {
    //                                 str_item_list[item_list[0]] += value;
    //                             } else {
    //                                 str_item_list[item_list[0]] = value;
    //                             }
    //                         }
    //                     }
    //                 }
    //                 let intensify_count = ServerEquipEnchaData.intensify_count;
    //                 if(intensify_count > 0){
    //                     let item_id = ServerEquipDeputyContrast[t[0].k as keyof typeof  ServerEquipDeputyContrast].item_id + 1
    //                     if (str_item_list.hasOwnProperty(item_id)) {
    //                         str_item_list[item_id] += intensify_count;
    //                     } else {
    //                         str_item_list[item_id] = intensify_count;
    //                     }
    //                 }
    //             }
    //             //强化返回 0.5
    //             for (const key in str_item_list) {
    //                 if (add_item_list.hasOwnProperty(key)) {
    //                     add_item_list[key] += str_item_list[key] * 0.5;
    //                 } else {
    //                     add_item_list[key] = str_item_list[key] * 0.5;
    //                 }
    //             }
    //         }
    //     }
    //     //装备分解获得
    //     for (const item_str of fj_item_list) {
    //         if (item_str.includes("_")) {
    //             let item_list = item_str.split("_");
    //             if (add_item_list.hasOwnProperty(item_list[0])) {
    //                 add_item_list[item_list[0]] += tonumber(item_list[1]);
    //             } else {
    //                 add_item_list[item_list[0]] = tonumber(item_list[1]);
    //             }
    //         }
    //     }
    //     del_list_id += del_list_id == "" ? equip_id : "," + equip_id;
    //     add_list_count++;
    //     if (del_list_id != "") {
    //         for (const key in add_item_list) {
    //             add_list_string += add_list_string == "" ? key + "_" + math.floor(add_item_list[key]) : "," + key + "_" + math.floor(add_item_list[key]);
    //         }
    //         server_log += "C:" + add_list_count + ";"
    //         server_log += "CL:" + add_list_string + ";"
    //         let item : AM2_Server_ToGetLog[] = [];
    //                 let add_list_list = add_list_string.split(",");
    //                 for(const add_list_info of add_list_list){
    //                     if(add_list_info.includes("_")){
    //                         let add_list_info_list = add_list_info.split("_");
    //                         let add_item_key = tonumber(add_list_info_list[0]);
    //                         let add_item_count = tonumber(add_list_info_list[1]);
    //                         let ItemData = ServerItemList[add_item_key.toString() as keyof typeof ServerItemList];
    //                         item.push({
    //                             types  : ItemData.affiliation_class, // 物品表类型
    //                             number : add_item_count, //数量
    //                             item_id : add_item_key, // 物品id
    //                             lv : ItemData.lv , //等级
    //                             fj : 0, // 是否有子类 0无 1有
    //                         })
    //                         // let is_new_item = true;

    //                         // GameRules.ArchiveService.server_package_list[player_id].map((v)=>{
    //                         //     if(v.item_id == add_item_key){
    //                         //         v.number += add_item_count;
    //                         //         is_new_item = false;
    //                         //     }
    //                         // })
    //                         // if(is_new_item == true){
    //                         //         if(add_item_key == 1){
    //                         //             GameRules.ArchiveService.player_currency[player_id].zuan_shi += add_item_count;
    //                         //     }else if(add_item_key == 2){
    //                         //         GameRules.ArchiveService.player_currency[player_id].jing_hua += add_item_count;
    //                         //     }else if(add_item_key == 8){
    //                         //         GameRules.ArchiveService.player_currency[player_id].jian_hun += add_item_count;
    //                         //     }else{
    //                         //         GameRules.ArchiveService.server_package_list[player_id].push({
    //                         //             id : "0" ,
    //                         //             item_id : add_item_key,	//物品表唯一id
    //                         //             class :ItemData.affiliation_class,	//物品表分类
    //                         //             lv  : ItemData.lv,	//物品等级
    //                         //             number :add_item_count,	//物品数量
    //                         //             customs : "", //自定义字段
    //                         //         })
    //                         //     }
    //                         // }
    //                     }
    //                 }
    //         // GameRules.ServiceEquipment.GetEquipList(player_id , {});
    //         //     GameRules.ServiceInterface.GetPlayerBase(player_id , {});
    //         //     GameRules.ServiceInterface.GetPlayerServerPackageData( player_id , {})
    //         //     GameRules.ServiceInterface.SendPlayerShoppingBuyData( player_id , 1 , "" , item);
    //         // return
    //         //1副职 2强散技能 3套装
    //         if(adsor_type){

    //         }

    //         GameRules.ArchiveService.DelPlayerEquip(player_id, del_list_id, add_list_string , server_log);
    //     } else {
    //         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "分解装备:无效的装备");
    //         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //     }
    // }
    // /**
    //  * 装备洗练
    //  * @param t_object
    //  * @returns
    //  */
    // EquipResetEntry(player_id: PlayerID, params: GEFPD["ServiceEquipment"]["EquipResetEntry"], callback?) {
    //     let eq_id = params.id;
    //     let eq_entry_index = params.index;
    //     let del_list = params.equip as any;
    //     let del_list_obj = del_list as {
    //         [index : string] : string
    //     }
    //     let equi_data = this.player_equi_list[player_id][eq_id];
    //     let server_log = "XL_"
    //     let del_string = "";
    //     if (equi_data) {
    //         let e_d = ServerEquipInfo[equi_data.n as keyof typeof ServerEquipInfo];
    //         let RecastData = ServerEquipRecastConfig[equi_data.r.toString() as keyof typeof ServerEquipRecastConfig];
    //         if(RecastData.is_effect == 0){
    //             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备洗练:此品质装备无法洗练");
    //             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //             return;
    //         }

    //         if(del_list_obj){
    //             for (const key in del_list_obj) {
    //                 const iterator = del_list[key];
    //                 if(eq_id == iterator){
    //                     GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备洗练:不能选自己作为材料");
    //                     GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                     return;
    //                 }
    //                 if(!this.player_equi_list[player_id][iterator]){
    //                     GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备洗练:装备素材无效");
    //                     GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                     return;
    //                 }else{
    //                     if(this.player_equi_list[player_id][iterator].r < equi_data.r){
    //                         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备洗练:必须同品质以上装备");
    //                         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                         return;
    //                     }
    //                 }
    //                 del_string += del_string == "" ? iterator : "," + iterator;
    //             }
    //         }else{
    //             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备洗练:请选择素材装备");
    //             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //             return;
    //         }
    //         if(equi_data.ex >= RecastData.recast_max){
    //             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备洗练:此装备已经超过最大洗练次数");
    //             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //             return;
    //         }
    //         if (RecastData) {
    //             //检查孔位是否正确或还有未选择的数据
    //             if (equi_data.xl.length > 0) {
    //                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备洗练:还有未选择的词条");
    //                 GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                 return;
    //             }
    //             if (equi_data.a.length < eq_entry_index || !equi_data.a[eq_entry_index]) {
    //                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备洗练:词条位置错误");
    //                 GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                 return;
    //             }
    //             //检查材料
    //             let need_list: {
    //                 [item_id: string]: number;
    //             } = {};
    //             let need_materials = RecastData.item_count;
    //             for (const iterator of need_materials) {
    //                 if (iterator.includes("_")) {
    //                     let i_liet = iterator.split("_");
    //                     let item_id = tonumber(i_liet[0]);
    //                     let item_number = tonumber(i_liet[1]);
    //                     //公式计算
    //                     need_list[item_id] = item_number;
    //                     if(item_id == 8){ //箭魂特殊处理
    //                         if (GameRules.ArchiveService.player_currency[player_id].jian_hun < need_list[item_id]) {
    //                             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备洗练:箭魂不足");
    //                             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                             return;
    //                         }
    //                         continue
    //                     }
    //                     //预防服务器bug必须要全部检查一次
    //                     let record_count: number = 0;
    //                     let record_index: number = -1;
    //                     for (let index = 0; index < GameRules.ArchiveService.server_package_list[player_id].length; index++) {
    //                         if (GameRules.ArchiveService.server_package_list[player_id][index].item_id == item_id) {
    //                             if (GameRules.ArchiveService.server_package_list[player_id][index].number > record_count) {
    //                                 record_count = GameRules.ArchiveService.server_package_list[player_id][index].number;
    //                                 record_index = index;
    //                             }
    //                         }
    //                     }
    //                     if (record_index != -1) {
    //                         if (GameRules.ArchiveService.server_package_list[player_id][record_index].number < need_list[item_id]) {
    //                             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备洗练:材料不足");
    //                             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                             return;
    //                         }
    //                     } else {
    //                         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备洗练:材料不足");
    //                         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                         return;
    //                     }
    //                 }
    //             }
    //             //深拷贝一份数据
    //             let new_equi_data = CustomDeepCopy(equi_data) as CGEDGetEquipListInfo;
    //             new_equi_data.ex++;
    //             let ct_list = this.AttrSeae(e_d);
    //             new_equi_data.xl.push({
    //                 k: ct_list.k,
    //                 v: ct_list.v,
    //                 i: eq_entry_index,
    //             });
    //             let consume = "";
    //             for (const key in need_list) {
    //                 consume += consume == "" ? key + "_" + need_list[key] + "_0" : "," + key + "_" + need_list[key] + "_0";
    //             }
    //             let now: ServerEquip = this.EquipDataTransition(new_equi_data);
    //             let post_data = {
    //                 [eq_id]: now
    //             };
    //             server_log += "Id:" + eq_id + ";";
    //             server_log += "CL:" + consume + ";";
    //             server_log += "Dl:" + del_string + ";";
    //             server_log += "New:" + JSON.encode({
    //                 k: ct_list.k,
    //                 v: ct_list.v,
    //                 i: eq_entry_index,
    //             }) + ";";
    //             GameRules.ArchiveService.EquipModify1(player_id, post_data, 3, del_string ,consume, server_log );
    //         } else {
    //             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备洗练:无效的配置");
    //             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //         }
    //     } else {
    //         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备洗练:无效的装备");
    //         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //     }
    // }
    // /**
    //  * 装备洗练确认
    //  * @param t_object
    //  * @returns
    //  */
    // EquipNotarizeResetEntry(player_id: PlayerID, params: GEFPD["ServiceEquipment"]["EquipNotarizeResetEntry"], callback?) {
    //     let eq_id = params.id;
    //     let is_replace = params.is_replace;
    //     let equi_data = this.player_equi_list[player_id][eq_id];
    //     let server_log = "QR_"
    //     if (equi_data) {
    //         let e_d = ServerEquipInfo[equi_data.n as keyof typeof ServerEquipInfo];
    //         let class_level = e_d.class_level;
    //         let RecastData = ServerEquipRecastConfig[class_level.toString() as keyof typeof ServerEquipRecastConfig];
    //         if (RecastData) {
    //             if (equi_data.xl.length <= 0) {
    //                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备洗练:没有可选择的词条");
    //                 GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                 return;
    //             }
    //             server_log += "Id:" + eq_id + ";";
    //             server_log += "Re:" + is_replace + ";";

    //             //深拷贝一份数据
    //             let new_equi_data = CustomDeepCopy(equi_data) as CGEDGetEquipListInfo;
    //             if (is_replace == 0) { //保留原版
    //                 new_equi_data.xl = [];
    //             } else {
    //                 server_log += "D:" + JSON.encode({
    //                     k: new_equi_data.a[new_equi_data.xl[0].i].k,
    //                     v: new_equi_data.a[new_equi_data.xl[0].i].v,
    //                     i: new_equi_data.xl[0].i,
    //                 }) + ";";
    //                 new_equi_data.a[new_equi_data.xl[0].i].k = new_equi_data.xl[0].k;
    //                 new_equi_data.a[new_equi_data.xl[0].i].v = new_equi_data.xl[0].v;
    //                 new_equi_data.xl = [];
    //             }
    //             let now: ServerEquip = this.EquipDataTransition(new_equi_data);
    //             let post_data = {
    //                 [eq_id]: now
    //             };

    //             GameRules.ArchiveService.EquipModify1(player_id, post_data, 4, "", "", server_log);
    //         } else {
    //             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备洗练:无效的配置");
    //             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //         }
    //     } else {
    //         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备洗练:无效的装备");
    //         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //     }
    // }
    // /**
    //  * 装备重置确认
    //  * @param t_object
    //  * @returns
    //  */
    // EquipNotarizeResetWashTimes(player_id: PlayerID, params: GEFPD["ServiceEquipment"]["EquipNotarizeResetWashTimes"], callback?) {
    //     let eq_id = params.id;
    //     let equi_data = this.player_equi_list[player_id][eq_id];
    //     let server_log = "CZQR_"

    //     if (equi_data) {
    //         if(equi_data.ec >= 3){
    //             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备重置:此装备已超过重置次数了");
    //             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //             return;
    //         }
    //         let RecastData = ServerEquipRecastConfig[equi_data.r.toString() as keyof typeof ServerEquipRecastConfig];
    //         if(RecastData.is_effect == 0){
    //             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备重置:此品质装备无法重置");
    //             GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //             return;
    //         }

    //         //检查材料
    //         let need_list: {
    //             [item_id: string]: number;
    //         } = {};
    //         let count = math.pow(2 , equi_data.ec)
    //         let need_materials : string[] = [];
    //         need_materials.push("92_" + count) ;
    //         for (const iterator of need_materials) {
    //             if (iterator.includes("_")) {
    //                 let i_liet = iterator.split("_");
    //                 let item_id = tonumber(i_liet[0]);
    //                 let item_number = tonumber(i_liet[1]);
    //                 //公式计算
    //                 need_list[item_id] = item_number;
    //                 if(item_id == 8){ //箭魂特殊处理
    //                     if (GameRules.ArchiveService.player_currency[player_id].jian_hun < need_list[item_id]) {
    //                         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备重置:箭魂不足");
    //                         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                         return;
    //                     }
    //                     continue
    //                 }
    //                 //预防服务器bug必须要全部检查一次
    //                 let record_count: number = 0;
    //                 let record_index: number = -1;
    //                 for (let index = 0; index < GameRules.ArchiveService.server_package_list[player_id].length; index++) {
    //                     if (GameRules.ArchiveService.server_package_list[player_id][index].item_id == item_id) {
    //                         if (GameRules.ArchiveService.server_package_list[player_id][index].number > record_count) {
    //                             record_count = GameRules.ArchiveService.server_package_list[player_id][index].number;
    //                             record_index = index;
    //                         }
    //                     }
    //                 }
    //                 if (record_index != -1) {
    //                     if (GameRules.ArchiveService.server_package_list[player_id][record_index].number < need_list[item_id]) {
    //                         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备重置:材料不足");
    //                         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                         return;
    //                     }
    //                 } else {
    //                     GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备重置:材料不足");
    //                     GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //                     return;
    //                 }
    //             }
    //         }
    //         //深拷贝一份数据
    //         let new_equi_data = CustomDeepCopy(equi_data) as CGEDGetEquipListInfo;
    //         new_equi_data.ec ++;
    //         new_equi_data.ex = 0;
    //         let consume = "";
    //         for (const key in need_list) {
    //             consume += consume == "" ? key + "_" + need_list[key] + "_0" : "," + key + "_" + need_list[key] + "_0";
    //         }

    //         server_log += "Id:" + eq_id + ";";
    //         let now: ServerEquip = this.EquipDataTransition(new_equi_data);
    //         let post_data = {
    //             [eq_id]: now
    //         };

    //         GameRules.ArchiveService.EquipModify1(player_id, post_data, 9, "", consume, server_log);
    //     } else {
    //         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备重置:无效的装备");
    //         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    //     }
    // }

    // // /**
    // //  * 装备锁定
    // //  * @param t_object
    // //  * @returns
    // //  */
    // // EquipEquipLock(player_id: PlayerID, params: GEFPD["ServiceEquipment"]["EquipLock"], callback?) {
    // //     let eq_id = params.id;
    // //     let equi_data = this.player_equi_list[player_id][eq_id];
    // //     let server_log = "ELK_"

    // //     if (equi_data) {
    // //         //检查材料
    // //         let new_equi_data = CustomDeepCopy(equi_data) as CGEDGetEquipListInfo;
    // //         if(new_equi_data.lk == 0){
    // //             new_equi_data.lk = 1;
    // //         }else{
    // //             new_equi_data.lk = 0;
    // //         }
    // //         let consume = "";
    // //         server_log += "Id:" + eq_id + ";";
    // //         let now: ServerEquip = this.EquipDataTransition(new_equi_data);
    // //         let post_data = {
    // //             [eq_id]: now
    // //         };
    // //         GameRules.ArchiveService.EquipModify1(player_id, post_data, 10, "", consume, server_log);
    // //     } else {
    // //         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备锁定:无效的装备");
    // //         GameRules.ServiceEquipment.GetEquipList(player_id, {});
    // //     }
    // // }

    // //装备加密
    // EquipTDecode(t_object: CGEDGetEquipListInfoDecode): string {
    //     let ret_string = "";
    //     ret_string = JSON.encode(t_object)
    //     // for (const key in t_object) {
    //     //     if (["p", "a", "i"].includes(key)) {
    //     //         if (t_object[key as "p"] && t_object[key as "p"].length > 0) {
    //     //             let value_string = "";
    //     //             for (const i of t_object[key as "p"]) {
    //     //                 value_string += value_string == "" ? i.k + "&" + i.v : "," + i.k + "&" + i.v;
    //     //             }
    //     //             ret_string += ret_string == "" ? key + ":" + value_string : "|" + key + ":" + value_string;
    //     //         }
    //     //     } else if (["w" ,"t" , "wt"].includes(key)) {
    //     //         if (t_object[key as "wt"] && t_object[key as "wt"].length > 0) {
    //     //             let value_string = "";
    //     //             for (const i of t_object[key as "wt"]) {
    //     //                 value_string += value_string == "" ? i.k : "," + i.k;
    //     //             }
    //     //             ret_string += ret_string == "" ? key + ":" + value_string : "|" + key + ":" + value_string;
    //     //         }
    //     //     } else if (["xl"].includes(key)) {
    //     //         if (t_object[key as "xl"] && t_object[key as "xl"].length > 0) {
    //     //             let value_string = "";
    //     //             for (const i of t_object[key as "xl"]) {
    //     //                 value_string += value_string == "" ? i.k + "&" + i.v + "&" + i.i : "," + i.k + "&" + i.v + "&" + i.i;
    //     //             }
    //     //             ret_string += ret_string == "" ? key + ":" + value_string : "|" + key + ":" + value_string;
    //     //         }
    //     //     } else if (["ei", "ex", "em22", "em23", "em24", "em25", "ll" , "zl", "zm"].includes(key)) {
    //     //         ret_string += ret_string == "" ? key + ":" + t_object[key] : "|" + key + ":" + t_object[key];
    //     //     }
    //     // }
    //     return ret_string;
    // }

    // /**
    //  * 装备数据加载
    //  */
    // EquipAttrLoad(player_id: PlayerID) {
    //     if (GameRules.ArchiveService.server_attr_is_load[player_id].equip_load == false) {
    //         let equip_config_list = GameRules.GamePlayer.equip_config_list[player_id];
    //         let config_data: string[] = [];
    //         if (equip_config_list.type == 1) {
    //             config_data = this.player_equi_config[player_id].public[equip_config_list.t - 1];
    //         } else {
    //             let hero_name = equip_config_list.hero_name;
    //             config_data = this.player_equi_config[player_id].hero[hero_name][equip_config_list.t - 1];
    //         }
    //         for (let i = 0; i < config_data.length; i++) {
    //             const element = config_data[i];
    //             if (element && element != "" && this.player_equi_list[player_id][element]) {
    //                 let equip_data = this.player_equi_list[player_id][element];
    //                 let main_attr_add = SEIntensifyLevelConfig[(equip_data.zl + 1).toString() as keyof typeof SEIntensifyLevelConfig].main_attr_add ?? 1;
    //                 let random_attr_add = SEIntensifyLevelConfig[(equip_data.zl + 1).toString() as keyof typeof SEIntensifyLevelConfig].random_attr_add ?? 1;
    //                 let deputy_attr_add = ServerNewEquipIntensify[(equip_data.l + 1).toString() as keyof typeof ServerNewEquipIntensify].main_attr_add ?? 1;
    //                 //主属性加载
    //                 for (const main_data of equip_data.p) {
    //                     let SEAE_Main_data = ServerEquipMainAttrEntry[p_data.k as keyof typeof ServerEquipMainAttrEntry];
    //                     if (SEAE_Main_data) {
    //                         let a_k = SEAE_Main_data.property;

    //                         let v_k = main_data.v * <number>SEAE_Main_data["eff_" + equip_data.r] * main_attr_add;
    //                         if (GameRules.ArchiveService.server_equip_attr[player_id].hasOwnProperty(a_k)) {
    //                             GameRules.ArchiveService.server_equip_attr[player_id][a_k] += v_k;
    //                         } else {
    //                             GameRules.ArchiveService.server_equip_attr[player_id][a_k] = v_k;
    //                         }
    //                         if(this.is_show_show_log){
    //                             print("main:" , a_k , v_k)
    //                         }
    //                     }
    //                 }
    //                 //副属性属性加载
    //                 for (const a_data of equip_data.a) {
    //                     let SEAE_data = ServerEquipAttrEntry[a_data.k as keyof typeof ServerEquipAttrEntry];
    //                     if (SEAE_data) {
    //                         let a_k = SEAE_data.property;
    //                         let v_k = a_data.v * <number>SEAE_data["eff_" + equip_data.r] * random_attr_add * deputy_attr_add;
    //                         if (GameRules.ArchiveService.server_equip_attr[player_id].hasOwnProperty(a_k)) {
    //                             GameRules.ArchiveService.server_equip_attr[player_id][a_k] += v_k;
    //                         } else {
    //                             GameRules.ArchiveService.server_equip_attr[player_id][a_k] = v_k;
    //                         }
    //                         if(this.is_show_show_log){
    //                             print("sub:" , a_k , v_k)
    //                         }
    //                     }
    //                 }
    //                 //加载魔化技能信息
    //                 for (const w_data of equip_data.w) {
    //                     //只加载等级最高的
    //                     if (GameRules.ArchiveService.hero_equip_demon_type[player_id].hasOwnProperty( "mh_" + w_data.k )) {
    //                         if(w_data.v > GameRules.ArchiveService.hero_equip_demon_type[player_id]["mh_" + w_data.k]){
    //                             GameRules.ArchiveService.hero_equip_demon_type[player_id]["mh_" + w_data.k] = w_data.v
    //                         }
    //                     }else{
    //                         GameRules.ArchiveService.hero_equip_demon_type[player_id]["mh_" + w_data.k] = w_data.v
    //                     }
    //                 }

    //                 //加载副职信息 普通
    //                 for (const t_data of equip_data.t) {
    //                     let EquipDeputy = ServerEquipDeputyContrast[t_data.k as keyof typeof ServerEquipDeputyContrast];
    //                     if (
    //                         equip_data.r < 4
    //                         && GameRules.ArchiveService.hero_equip_position_count[player_id][EquipDeputy.binding_skill_name] < 4
    //                         && GameRules.ArchiveService.hero_equip_position_count[player_id].hasOwnProperty(EquipDeputy.binding_skill_name)
    //                     ) {
    //                         GameRules.ArchiveService.hero_equip_position_count[player_id][EquipDeputy.binding_skill_name]++;
    //                         GameRules.ArchiveService.hero_equip_position_count_level[player_id][EquipDeputy.binding_skill_name] += t_data.v;
    //                     }
    //                 }

    //                 //加载深渊套装信息
    //                 for (const wt_data of equip_data.wt) {
    //                     let EquipDeputy = ServerEquipDemonSuitContras[wt_data.k as keyof typeof ServerEquipDemonSuitContras];
    //                     let skill_name = EquipDeputy.binding_skill_name as HeroEquipDemonSuitType
    //                     if (GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].hasOwnProperty(EquipDeputy.binding_skill_name)) {
    //                         //是否激活
    //                         if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][skill_name].is_basics == 0){
    //                             GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][skill_name].is_basics = 1
    //                         }
    //                         //等级

    //                         if( Object.values(equip_data.wt).length > 0){
    //                             GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][skill_name].lv += equip_data.wt[0].v;
    //                             //件数
    //                             GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][skill_name].count += 1;
    //                             // print(
    //                             //     "skill_name :" , skill_name,
    //                             //     ";count : ", GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][skill_name].count,
    //                             //     ";lv : " , GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][skill_name].lv
    //                             // )
    //                         }

    //                     }
    //                 }
    //             }
    //         }
    //         for (let i = 0; i < config_data.length; i++) {
    //             const element = config_data[i];
    //             if (element && element != "" && this.player_equi_list[player_id][element]) {
    //                 //加载副职信息 红装效果
    //                 let equip_data = this.player_equi_list[player_id][element];
    //                 for (const t_data of equip_data.t) {
    //                     let EquipDeputy = ServerEquipDeputyContrast[t_data.k as keyof typeof ServerEquipDeputyContrast];
    //                     if (equip_data.r >= 4 && GameRules.ArchiveService.hero_equip_position_count[player_id].hasOwnProperty(EquipDeputy.binding_skill_name)) {
    //                         GameRules.ArchiveService.hero_equip_position_count[player_id][EquipDeputy.binding_skill_name]++;
    //                         GameRules.ArchiveService.hero_equip_position_count_level[player_id][EquipDeputy.binding_skill_name] += t_data.v;
    //                     }
    //                 }
    //             }
    //         }
    //         //羁绊重构
    //         let highest_wt_name = "";
    //         let highest_wt_count = 0;
    //         let highest_wt_is_only = false;
    //         for (const suit_type_name in GameRules.ArchiveService.hero_equip_demon_suit_type[player_id]) {
    //             if(highest_wt_count == GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][suit_type_name as HeroEquipDemonSuitType].count){
    //                 highest_wt_is_only = false;
    //             }
    //             if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][suit_type_name as HeroEquipDemonSuitType].count > highest_wt_count  ){
    //                 highest_wt_count = GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][suit_type_name as HeroEquipDemonSuitType].count;
    //                 highest_wt_is_only = true; // = 5
    //                 highest_wt_name = suit_type_name;
    //             }
    //         }
    //         //标记唯一最高属性
    //         if(highest_wt_is_only){
    //             GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][highest_wt_name as HeroEquipDemonSuitType].is_only_highest = 1;
    //         }
    //          //羁绊数计算 暴食5 其他羁绊计数-1
    //          if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].b_0.count >= 5){
    //             for (const suit_type_name in GameRules.ArchiveService.hero_equip_demon_suit_type[player_id]) {
    //                 if(suit_type_name != "b_0"){
    //                     GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][suit_type_name as HeroEquipDemonSuitType].count -= 1;
    //                 }
    //             }
    //         }
    //         //羁绊数计算 怠惰5 所有羁绊计数+1
    //         if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].d_0.count >= 5){
    //             for (const suit_type_name in GameRules.ArchiveService.hero_equip_demon_suit_type[player_id]) {
    //                 if(suit_type_name != "d_0"){
    //                     GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][suit_type_name as HeroEquipDemonSuitType].is_basics == 1;
    //                     GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][suit_type_name as HeroEquipDemonSuitType].count += 1;
    //                 }
    //             }
    //         }
    //         //羁绊数计算 怠惰3 所有激活羁绊计数+1
    //         if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].d_0.count >= 3){
    //             for (const suit_type_name in GameRules.ArchiveService.hero_equip_demon_suit_type[player_id]) {
    //                 if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][suit_type_name as HeroEquipDemonSuitType].is_basics == 1){
    //                     if(suit_type_name != "d_0"){
    //                         GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][suit_type_name as HeroEquipDemonSuitType].count += 1;
    //                     }
    //                 }
    //             }
    //         }
    //         //羁绊数计算 怠惰1 数量最多的套装羁绊计数+1
    //         if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].d_0.count >= 1 && highest_wt_is_only){
    //             if(highest_wt_name != "d_0"){
    //                 GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][highest_wt_name as HeroEquipDemonSuitType].count += 1;
    //             }
    //         }

    //         //嫉妒降低 5件套
    //         if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].j_0.is_basics > 0
    //             && GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].j_0.count >= 5){
    //             // let probability = 30;
    //             let jd_probability = Math.floor(66 * GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].j_0.mul[3] * 0.01);
    //             GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].j_0.mul[1] += jd_probability;
    //             GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].j_0.mul[2] += jd_probability;
    //             GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].j_0.mul[3] += jd_probability;
    //             let probability = Math.floor(30 * GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].j_0.mul[3] * 0.01);
    //             for (const key in GameRules.ArchiveService.hero_equip_demon_suit_type[player_id]) {
    //                 if(key != "j_0"){
    //                     GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][key as HeroEquipDemonSuitType].mul[1] -= probability;
    //                     GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][key as HeroEquipDemonSuitType].mul[2] -= probability;
    //                     GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][key as HeroEquipDemonSuitType].mul[3] -= probability;
    //                 }
    //             }
    //         }
    //         //嫉妒降低 3件套
    //         if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].j_0.is_basics > 0
    //             && GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].j_0.count >= 3){
    //             let probability = Math.floor(20 * GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].j_0.mul[2] * 0.01);
    //             for (const key in GameRules.ArchiveService.hero_equip_demon_suit_type[player_id]) {
    //                 if(key != "j_0"){
    //                     GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][key as HeroEquipDemonSuitType].mul[1] -= probability;
    //                     GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][key as HeroEquipDemonSuitType].mul[2] -= probability;
    //                     GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][key as HeroEquipDemonSuitType].mul[3] -= probability;
    //                 }
    //             }
    //             GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].j_0.mul[0] += 100;
    //         }
    //         //暴食提升 暴食3效率
    //         if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].b_0.is_basics > 0
    //             && GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].b_0.count >= 3){
    //             let probability = Math.floor(50 * GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].b_0.mul[2] * 0.01);
    //             for (const key in GameRules.ArchiveService.hero_equip_demon_suit_type[player_id]) {
    //                 GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][key as HeroEquipDemonSuitType].mul[1] += probability;
    //                 //暴食提升 暴食5效果
    //                 if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].b_0.count >= 5 && key == "b_0"){
    //                     let bs_probability = Math.floor(1000 * GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].b_0.mul[3] * 0.01)
    //                         * GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][key as HeroEquipDemonSuitType].mul[1];
    //                     GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][key as HeroEquipDemonSuitType].mul[1] = bs_probability;
    //                 }
    //             }
    //         }
    //         //嫉妒1件套
    //         if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].j_0.is_basics > 0
    //             && GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].j_0.count >= 1){
    //             let probability = Math.floor(20 * GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].j_0.mul[1] * 0.01);
    //             for (const key in GameRules.ArchiveService.hero_equip_demon_suit_type[player_id]) {
    //                 if(key != "j_0"){
    //                     GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][key as HeroEquipDemonSuitType].mul[1] -= probability;
    //                     GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][key as HeroEquipDemonSuitType].mul[2] -= probability;
    //                     GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][key as HeroEquipDemonSuitType].mul[3] -= probability;
    //                 }
    //             }
    //         }

    //         //傲慢 1件套
    //         if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].a_0.is_basics > 0
    //             && GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].a_0.count >= 1
    //             && highest_wt_is_only){
    //             let probability = Math.floor(49 * GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].a_0.mul[1] * 0.01);
    //             if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][highest_wt_name as HeroEquipDemonSuitType].count >= 5){
    //                 GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][highest_wt_name as HeroEquipDemonSuitType].mul[3] += probability;
    //             }else if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][highest_wt_name as HeroEquipDemonSuitType].count >= 3){
    //                 GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][highest_wt_name as HeroEquipDemonSuitType].mul[2] += probability;
    //             }else if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][highest_wt_name as HeroEquipDemonSuitType].count >= 1){
    //                 GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][highest_wt_name as HeroEquipDemonSuitType].mul[1] += probability;
    //             }
    //         }

    //         // DeepPrintTable(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id]);
    //         let hero = PlayerResource.GetSelectedHeroEntity(player_id);
    //         let HeroEntityIndex = -1 as EntityIndex;
    //         if (hero) {
    //             HeroEntityIndex = hero.GetEntityIndex();
    //         }
    //         //属性修改相关

    //         //傲慢 3件套效果
    //         if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].a_0.is_basics > 0
    //             && GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].a_0.count >= 3
    //             && highest_wt_name == "a_0"
    //             && highest_wt_is_only){
    //             // let probability = Math.floor(49 * GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].a_0.mul[2] * 0.01);
    //             // GameRules.PlayerHeroAttributeData.base_data[HeroEntityIndex].ExtraAllAttrPct += probability;
    //         }
    //         GameRules.ArchiveService.server_attr_is_load[player_id].equip_load = true;
    //         //金币消耗率
    //         // if(GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].t_0.count >= 1){
    //         //     GameRules.ArchiveService.player_gold_rate[player_id] = 100
    //         //         + ( GameRules.ArchiveService.hero_equip_demon_suit_type[player_id].t_0.mul[1] / 100 )
    //         //         * 66;
    //         //     CustomNetTables.SetTableValue("game_setting", "player_gold_rate",  GameRules.ArchiveService.player_gold_rate);
    //         // }
    //         //加载装备信息
    //         if (GameRules.PlayerHeroAttributeData.player_hero_is_load[player_id] &&
    //             GameRules.ArchiveService.server_attr_add[player_id].equip_load == false &&
    //             HeroEntityIndex > 0) {
    //             GameRules.ServerLoad.EquipLoad(player_id , hero , HeroEntityIndex);
    //             GameRules.DemonSystem.InitHeroDemonSuit(hero);
    //             GameRules.DemonEnchant.InitLoadAttribute(hero)
    //             GameRules.PlayerHeroAttributeData.UpdateHeroAttribute(hero , true , "1");
    //         }
    //     }
    // }
    // /**
    //  * 装备信息转服务器信息
    //  * @param data
    //  * @returns
    //  */
    // EquipDataTransition(new_equi_data: CGEDGetEquipListInfo): ServerEquip {
    //     let now: ServerEquip = {
    //         n: new_equi_data.n, //装备key
    //         r: new_equi_data.r, //稀有度 0 1 2 3 => n,r,sr,ssr
    //         l: new_equi_data.l, //当前强化等级
    //         m: new_equi_data.m, //最大强化等级
    //         data: this.EquipTDecode({ //装备解析
    //             ll: new_equi_data.ll,
    //             p: new_equi_data.p,
    //             a: new_equi_data.a,
    //             t: new_equi_data.t,
    //             w: new_equi_data.w,
    //             i: new_equi_data.i,
    //             xl: new_equi_data.xl,
    //             wt : new_equi_data.wt,
    //             ei: new_equi_data.ei,
    //             ec: new_equi_data.ec,
    //             ex: new_equi_data.ex,
    //             zl: new_equi_data.zl,
    //             zm: new_equi_data.zm,
    //             em22: new_equi_data.em22,
    //             em23: new_equi_data.em23,
    //             em24: new_equi_data.em24,
    //             em25: new_equi_data.em25,
    //         })
    //     };
    //     return now;
    // }
    // /**
    //  * 发送获得信息
    //  */
    // SendPlayerAddEquipData(player_id: PlayerID, list: AM2_Server_Send_Qeuip_Data[] = []) {
    //     CustomGameEventManager.Send_ServerToPlayer(
    //         PlayerResource.GetPlayer(player_id),
    //         "ServiceEquipment_SendPlayerAddEquipData",
    //         {
    //             data: list
    //         }
    //     );
    // }
    // //发送回合信息
    // GetProcessData() {
    //     let data = {
    //         round_num: GameRules.ServiceEquipment.boss_equip_count,
    //         game_time: GameRules.TwiceGameProcess.game_time,
    //         ex_time : GameRules.TwiceGameProcess.monster_time_list[0],
    //         process_phase: 1, //流程阶段 1 刷怪阶段 进入 round_rest_time 休息时间 2休息阶段 进入 round_monster_time刷怪时间 3 额外时间阶段
    //         round_max: 99,
    //         waiting_time:GameRules.TwiceGameProcess.waiting_time,
    //     };
    //     CustomGameEventManager.Send_ServerToAllClients( "TwiceGameProcess_GetProcessData", {
    //         data
    //     });
    // }

    // /**
    //  * 获取排行榜数据
    //  * @param player_id
    //  * @param params
    //  * @param callback
    //  */
    // GetLeaderboardData(player_id: PlayerID, params: GEFPD["ServiceEquipment"]["GetLeaderboardData"], callback?) {
    //     let type = params.type ;
    //     CustomGameEventManager.Send_ServerToPlayer(
    //         PlayerResource.GetPlayer(player_id),
    //         "ServiceEquipment_GetLeaderboardData",
    //         {
    //             data: {
    //                 type: type ,
    //                 list: GameRules.ArchiveService.LeaderboardData[type],
    //             }
    //         }
    //     );
    // }

    // /**
    //  * 获取排行榜数据
    //  * @param player_id
    //  * @param params
    //  * @param callback
    //  */
    // GetLeaderboardDataExtra(player_id: PlayerID, params: GEFPD["ServiceEquipment"]["GetLeaderboardDataExtra"], callback?) {
    //     let type = params.type ;
    //     let index = params.index ;
    //     let d = GameRules.ArchiveService.LeaderboardDataExtra[type + "_" + index];
    //     let d_data = JSON.decode(d) as AM2_Server_Ranking_list_Data[];
    //     // let h_list = [25,5,21,59,10,91,123];
    //     // for (let index = 0; index < d_data.length; index++) {
    //     //     d_data[index].h = h_list[RandomInt(0,h_list.length -1)];
    //     // }

    //     CustomGameEventManager.Send_ServerToPlayer(
    //         PlayerResource.GetPlayer(player_id),
    //         "ServiceEquipment_GetLeaderboardDataExtra",
    //         {
    //             data : {
    //                 list : d_data,
    //                 type : type,
    //                 index : index,
    //             }
    //         }
    //     );
    // }
    // /**
    //  * 召唤挑战boss
    //  * @param player_id
    //  * @param params
    //  * @param callback
    //  */
    // CallEquipBoss() {
    //     // this.player_summon_equip_count[player_id]--;

    //     let _Vector = Vector(0, 200, 256);

    //     let boss_list = Object.keys(EquipBossConfig)
    //     let boss_index = RandomInt(0 , boss_list.length -1)
    //     let unit = UnitOperation.CreepNormalCreate(boss_list[boss_index], _Vector);
    //     this.equip_boss_entityindex = unit.GetEntityIndex();
    //     //修改血量
    //     unit.AddNewModifier(null, null, "modifier_custom_appearance_underground", { duration: 3 });
    //     // Timers.CreateTimer(3, () => {
    //     //     unit.AddNewModifier(unit, null, "modifier_common_countdown", { duration: 90 });
    //     //     return null;
    //     // });
    //     // this.equip_boss_timer_name = Timers.CreateTimer(93, () => {
    //     //     this.equip_boss_timer_name = "";
    //     //     this.EvolutionEquipBossLose();
    //     //     return null;
    //     // });
    //     GameRules.CMsg.SendMsgToAll(CGMessageEventType.WARNING);
    //     GameRules.TwiceMapSpawn.MonsterAmend(unit, "equipboss", this.boss_equip_count , this.boss_equip_count );
    //     GameRules.HealthBar.SetBossHealthBarToClient(unit);
    //     unit.BossWave = GameRules.CountSystem.AddCountDamageList();

    //     let player_count = GameRules.PlayerInfo.RetPCFT("EvolutionEquipBossLose");
    //     for (let index = 0 as PlayerID; index < player_count; index++) {
    //         this.GetSummonEquipCount(index, {});
    //     }
    // }
    // //全部玩家死亡 或时间到
    // EvolutionEquipBossLose() {
    //     GameRules.GetGameModeEntity().StopThink("CallEquipBoss");
    //     GameRules.GetGameModeEntity().StopThink("EvolutionEquipBossLose");
    //     let unit_equip_boss = EntIndexToHScript(this.equip_boss_entityindex) as CDOTA_BaseNPC_Hero;
    //     GameRules.HealthBar.RemoveBossHealthBarToClient(unit_equip_boss);
    //     if (unit_equip_boss) {
    //         UnitOperation.CreepNormalRemoveSelf(unit_equip_boss)
    //     }
    //     // this.server_equio_is_challenge = false;
    //     this.equip_boss_entityindex = -1 as EntityIndex;
    //     // if (this.equip_boss_timer_name != "") {
    //     //     Timers.RemoveTimer(this.equip_boss_timer_name);
    //     // }
    //     //奖励自发则一件装备
    //     // let main_player = unit_equip_boss.equip_boss_is_player_id;
    //     // this.AddEquip(main_player, GameRules.TwiceMapSelect._game_nd.toString(), "extra_lose");
    //     //
    //     let player_count = GameRules.PlayerInfo.RetPCFT("EvolutionEquipBossLose");
    //     for (let index = 0 as PlayerID; index < player_count; index++) {
    //         // this.GetSummonEquipCount(index, {});
    //         GameRules.CMsg.SendCommonMsgToPlayer(index, "存档装备:挑战失败！！！！");
    //     }
    //     //复活其他已死玩家
    //     // for (let index = 0 as PlayerID; index < player_count; index++) {
    //     //     let hHero = PlayerResource.GetSelectedHeroEntity(index);
    //     //     if (!hHero.IsAlive()) {
    //     //         Timers.CreateTimer(3, () => {
    //     //             hHero.SetRespawnPosition(hHero.GetAbsOrigin());
    //     //             hHero.RespawnHero(false, false);
    //     //             hHero.AddNewModifier(hHero, null, "modifier_state_invincible", { duration: 3 });
    //     //         });
    //     //     }
    //     // }
    // }

    // /**
    //  * 击杀存档boss事件
    //  * @param killed_unit  //击杀单位
    //  */
    // EvolutionEquipBossKill(killed_unit: CDOTA_BaseNPC) {
    //     this.boss_equip_count ++;
    //     GameRules.HealthBar.RemoveBossHealthBarToClient(killed_unit);
    //     //自发者 1个 // 第一名 100% 1 第二名 35% 1 第三名 10% 1 第四名 5%  1 //后面无
    //     // let main_player = killed_unit.equip_boss_is_player_id;
    //     let damage_index = killed_unit.BossWave;
    //     GameRules.SpecialGameProcess.server_equio_is_challenge = false;
    //     this.equip_boss_entityindex = -1 as EntityIndex;

    //     let mvp_player = GameRules.PlayerInfo.GetCurrentMvpPlayer(damage_index)
    //     // damage_list.sort()
    //     // if (this.equip_boss_timer_name != "") {
    //     //     Timers.RemoveTimer(this.equip_boss_timer_name);
    //     // }
    //     GameRules.ServiceEquipment.GetProcessData();
    //     let player_count = GameRules.PlayerInfo.RetPCFT("EvolutionEquipBossLose");
    //     for (let index = 0 as PlayerID; index < player_count; index++) {
    //         let add_equip_count = 1;
    //         //自发
    //         // if (main_player == index) {
    //         //     add_equip_count += DropCount.extra_succeed_drop;
    //         // }
    //         // //获得伤害名次
    //         if (mvp_player == index) { // 0 为第一名
    //             //轮回部件物品掉落
    //             if(RollPercentage(Math.ceil((player_count - 1) * 0.5))){
    //                 GameRules.ArchiveService.EndlessAddItem( index , "54_1" , "章节模式 ： 存档boss" + damage_index);
    //             }
    //             //10，15，20波额外掉落一件装备
    //             if(damage_index >= 10 && damage_index <= 20 && damage_index % 5 == 0){
    //                 add_equip_count ++;
    //             }
    //             //击杀第5，10波存档boss额外掉落一个当前章节战利品
    //             if(damage_index < 15 && damage_index % 5 == 0){
    //                 GameRules.ServiceInterface.AddRelics( index , Math.floor(GameRules.TwiceMapSelect._game_nd / 100).toString() , 1);
    //             }
    //         }

    //         if (add_equip_count > 0) {
    //             this.AddEquip(index, GameRules.TwiceMapSelect._game_nd.toString(), "extra_succeed", add_equip_count , false , ( this.boss_equip_count - 1 ));
    //         }
    //         // this.GetSummonEquipCount(index, {});
    //         // GameRules.CMsg.SendErrorMsgToPlayer(index, "存档装备:挑战成功！！！！");
    //         GameRules.CMsg.SendCommonMsgToPlayer(index, "存档装备:挑战成功,5秒后刷新下一个boss!!!!");
    //     }
    //     //复活其他已死玩家
    //     // for (let index = 0 as PlayerID; index < player_count; index++) {
    //     //     let hHero = PlayerResource.GetSelectedHeroEntity(index);
    //     //     if (!hHero.IsAlive()) {
    //     //         Timers.CreateTimer(3, () => {
    //     //             hHero.SetRespawnPosition(hHero.GetAbsOrigin());
    //     //             hHero.RespawnHero(false, false);
    //     //             hHero.AddNewModifier(hHero, null, "modifier_state_invincible", { duration: 3 });
    //     //         });
    //     //     }
    //     // }
    //     GameRules.GetGameModeEntity().SetContextThink("CallEquipBoss", () => {
    //         GameRules.ServiceEquipment.CallEquipBoss()
    //         return null;
    //     }, 5);

    // }
    // /**
    //  * 装备切换
    //  */
    // EquipSwitc(player_id: PlayerID, params: GEFPD["ServiceEquipment"]["EquipSwitc"], callback?) {
    //     let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
    //     let hero_name = hHero.GetUnitName();
    //     let name = hero_name.replace("npc_dota_hero_", "");
    //     let t_index = params.t_index;
    //     //休息时间可用
    //     if (GameRules.TwiceGameProcess._process_phase != 3) {
    //         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备切换 : 休息时间可用");
    //         return;
    //     }
    //     let dota_time = GameRules.GetDOTATime(false, false);
    //     if (this.EquipmentSwitchingCD[player_id] > dota_time) {
    //         let cd_count = Math.ceil(this.EquipmentSwitchingCD[player_id] - dota_time);
    //         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备切换 : cd未到..还有" + cd_count + "秒");
    //         return;
    //     }
    //     //cd
    //     if (IsInToolsMode()) {
    //         this.EquipmentSwitchingCD[player_id] = 3 + dota_time;
    //     } else {
    //         this.EquipmentSwitchingCD[player_id] = 60 + dota_time;
    //     }
    //     if (t_index > 0 && t_index <= 2) { //通用
    //         GameRules.GamePlayer.equip_config_list[player_id].type = 1;
    //         GameRules.GamePlayer.equip_config_list[player_id].t = t_index;
    //     } else if (t_index > 2 && t_index <= 4) { //专用
    //         GameRules.GamePlayer.equip_config_list[player_id].type = 2;
    //         GameRules.GamePlayer.equip_config_list[player_id].t = (t_index - 2);
    //     } else {
    //         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "装备切换 : t_index 错误");
    //         return;
    //     }
    //     GameRules.GamePlayer.equip_config_list[player_id].hero_name = name;
    //     let HeroEntityIndex = -1;
    //     if (hHero) {
    //         HeroEntityIndex = hHero.GetEntityIndex();
    //     }

    //     //重新加载装备信息
    //     GameRules.ArchiveService.server_attr_is_load[player_id].equip_load = false;
    //     GameRules.ArchiveService.server_attr_add[player_id].equip_load = false;
    //     //todo 忘记什么作用
    //     // if (GameRules.PlayerHeroAttributeData.player_hero_is_load[player_id] &&
    //     //     GameRules.ArchiveService.server_attr_add[player_id].equip_load == false &&
    //     //     HeroEntityIndex > 0) {
    //     //     Object.keys(GameRules.ArchiveService.server_equip_attr[player_id]).forEach(key => {
    //     //         if(GameRules.PlayerHeroAttributeData.shop_attribute[HeroEntityIndex].hasOwnProperty(key)){
    //     //             GameRules.PlayerHeroAttributeData.shop_attribute[HeroEntityIndex][key] -= GameRules.ArchiveService.server_equip_attr[player_id][key];
    //     //         }
    //     //     });
    //     // }
    //     //初始化存档属性信息
    //     GameRules.ArchiveService.server_equip_attr[player_id] = {};
    //     //初始化存档副职信息
    //     GameRules.ArchiveService.hero_equip_position_count[player_id] = {
    //         deputy_parasite: 0,
    //         deputy_driver: 0,
    //         deputy_killer: 0,
    //         deputy_lumberman: 0,
    //         deputy_blacksmith: 0,
    //         deputy_businessman: 0,
    //         deputy_scavenger: 0,
    //     };
    //     //初始化套装效果
    //     GameRules.ArchiveService.hero_equip_demon_suit_type[player_id] = {}
    //     for(let key of DEMON_SUIT_LIST ){
    //         GameRules.ArchiveService.hero_equip_demon_suit_type[player_id][key as HeroEquipDemonSuitType] = {
    //             is_basics : 0,
    //             count : 0,
    //             lv : 0,
    //             mul:[100,100,100,100],
    //             is_only_highest : 0 ,
    //         }
    //     }
    //     //重载装备信息
    //     this.EquipAttrLoad(player_id);
    //     //发送信息
    //     this.GetEquipSwitcData(player_id, params);
    // }
    // /**
    //  * 获取选中的信息
    //  * @param player_id
    //  * @param params
    //  * @param callback
    //  */
    // GetEquipSwitcData(player_id: PlayerID, params: GEFPD["ServiceEquipment"]["GetEquipSwitcData"], callback?) {
    //     if (PlayerResource.GetPlayer(player_id) == null) {
    //         return;
    //     }
    //     let t_index = 1;
    //     if (GameRules.GamePlayer.equip_config_list[player_id].type == 1) {
    //         t_index = GameRules.GamePlayer.equip_config_list[player_id].t;
    //     } else {
    //         t_index = GameRules.GamePlayer.equip_config_list[player_id].t + 2;
    //     }

    //     CustomGameEventManager.Send_ServerToPlayer(
    //         PlayerResource.GetPlayer(player_id),
    //         "ServiceEquipment_GetEquipSwitcData",
    //         {
    //             data: {
    //                 t_index: t_index,
    //                 cd: Math.ceil(this.EquipmentSwitchingCD[player_id]),
    //                 proces: GameRules.TwiceGameProcess._process_phase,
    //             }
    //         }
    //     );
    // }
    Debug(cmd: string, args: string[], player_id: PlayerID): void {
        if (cmd == '!AD') {
            this.AddEquipByDifficulty(player_id, '101');
        }
        if (cmd == '!PU') {
            this.PuzzleUpgrade(player_id, { equip_id: '202406051920108345010000', index: 0 });
        }
        if (cmd == '!pub') {
            this.PuzzleUpgrade(player_id, { equip_id: '202406051920108345010000', index: 0 });
        }
        if (cmd == '-getequip') {
            DeepPrintTable(GameRules.ServiceEquipment.player_equip_list[player_id]);
        }
        if (cmd == '-EquipIntensify') {
            //装备强化
            this.EquipIntensify(player_id, {
                equip_id: '202406051920108345010000',
            });
        }
    }
}
