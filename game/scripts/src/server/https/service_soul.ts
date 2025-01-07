/**
 *  存档装备服务接口
 */
import { reloadable } from '../../utils/tstl-utils';

import { UIEventRegisterClass } from '../../modules/class_extends/ui_event_register_class';

import * as ServerSoulAttr from "../../json/config/server/soul/server_soul_attr.json";

import * as ServerSoulLevelConfig from "../../json/config/server/soul/server_soul_level_config.json";

import * as ServerSoulConfig from "../../json/config/server/soul/server_soul_config.json";

@reloadable
export class ServiceSoul extends UIEventRegisterClass {
    
    //玩家魂石配置
    soul_list : CGEDGetSoulList[] = [];
    
    player_count : number = 4;
    //部位数量
    player_box_type_count : number = 6;
    //魂石最大镶嵌数量
    player_xq_count : number = 5;
    //降级消耗
    
    //魂石数据模板 type对应key
    box_type_data : {
        [box_type : number ] : string[]; //类型 - 表id
    }  = {};
    //魂石升级对应模板
    level_u_d_config : {
        up : { [level : number] : string } ,
        drop : { [level : number] : string } ,
    } = {
        up : {},
        drop : {},
    }
    constructor() {
        //初始化0
        super("ServiceSoul" , true);

        for (let index = 0; index < this.player_count; index++) {
            this.soul_list.push({
                i : {}
            })
            for (let c_i = 1; c_i <= this.player_box_type_count; c_i++) {
                this.soul_list[index].i[c_i] = {
                    "d" : [],
                    "l" : 0 ,
                    "z" : 0 ,
                }
            }
        }
        for (const key in ServerSoulAttr) {
            let spa_data = ServerSoulAttr[key as keyof typeof ServerSoulAttr];
            if(!this.box_type_data.hasOwnProperty(spa_data.box_type)){
                this.box_type_data[spa_data.box_type] = [];
            }
            this.box_type_data[spa_data.box_type].push(key);
        }

        for (const key in ServerSoulConfig) {
            let data = ServerSoulConfig[key as keyof typeof ServerSoulConfig];
            if(data.type == 1){
                this.level_u_d_config.up[data.level] = key;
            }else{
                this.level_u_d_config.drop[data.level] = key;
            }
        }
    }

    //加密
    EquipTDecode(t_object: object): string {
        let ret_string = "";
        ret_string = JSON.encode(t_object);
        return ret_string;
    }

    //解密
    EquipTEncode(EquipString: ServerEquip): CGEDGetEquipListInfo {
        let object: CGEDGetEquipListInfo = {
            id: EquipString.id , //唯一id
            n: EquipString.n , //装备key
            r: EquipString.r , //稀有度 0 1 2 3 4 => C B A S SS
            zl: EquipString.zl , //装备等级
            t : EquipString.t , //装备部位
            i : EquipString.i , //强化等级
            ma: [],//主attr属性,
            pa: [],//拼图属性,
            s: [] ,//套装
            is_new : 0, //没有就是老的  有就是新装备
            lk  : 0 , //装备锁
        };
        return object;
    }
    /**
     * 魂石添加方法
     * @param p_count 
     * @param puzzle_attr_random_key 
     * @returns 
     */
    SoulAddOfField(player_id: PlayerID, params: CGED["ServiceSoul"]["SoulAddOfField"]){
        let box_type = params.box_type;
        let key = params.key;
        if(box_type > 0 && box_type <= this.player_box_type_count){
            if(this.soul_list[player_id].i.hasOwnProperty(box_type)){
                let r_data = CustomDeepCopy(this.soul_list[player_id].i[box_type].d) as CGEDGetSoulListData[];
                let r_data_key_list = Object.keys(r_data);
                let max = math.min( math.floor(GameRules.ServiceInterface.player_map_level[player_id] / 10) , this.player_xq_count);
                if(r_data_key_list.length < max){
                    let is_meiyou = true;
                    for (let r_i = 0; r_i < r_data.length; r_i++) {
                        if(r_data[r_i].k == key){
                            is_meiyou = false;
                            break;
                        }
                    }
                    if(is_meiyou){
                        //获取数据...
                        let ret = this.SoulDataUp(key , 0 , 0);
                        if(ret.code == true){
                            let Sj_config_key = this.level_u_d_config.up[0];
                            let need_item = this.GetUpItem(Sj_config_key , key , 1);
                            for (const need_item_key in need_item) {
                                let need_item_id = tonumber(need_item_key);
                                let need_item_count = need_item[need_item_id];
                                if(ret.data.c.hasOwnProperty(need_item_id)){
                                    ret.data.c[need_item_id] += need_item_count;
                                }else{
                                    ret.data.c[need_item_id] = need_item_count;
                                }
                                print("need_item_id" , need_item_id);

                                let ret_ver = GameRules.ServiceData.SelectVerifyPackageItem(player_id , need_item_id , need_item_count);
                                if(ret_ver.is_verify){
                                    GameRules.ServiceData.DeletePackageItemSelect(player_id , ret_ver.index , need_item_count);
                                }else{
                                    GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:材料不足...")
                                    return ;
                                }
                            }
                            this.soul_list[player_id].i[box_type].d.push(ret.data);
                            this.soul_list[player_id].i[box_type].l ++;
                            this.soul_list[player_id].i[box_type].z ++;
                            //更新魂石数据
                            this.GetPlayerServerSoulData( player_id , {})
                            //更新背包数据
                            GameRules.ServiceInterface.GetPlayerServerPackageData(player_id , {} );
                        }else{
                            GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:升级失败...")
                        }
                    }else{
                        GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:已添加相同属性,请进行升级...")
                    }
                }else{
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:当前部位超过最大镶嵌数量...")
                }
            }else{
                GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:配置错误...")    
            }
        }else{
            GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:部位错误...")
        }
    }
    /**
     * 魂石升级/降级方法
     * @param p_count 
     * @param puzzle_attr_random_key 
     * @returns 
     */
    SoulIntensify(player_id: PlayerID, params: CGED["ServiceSoul"]["SoulIntensify"]){
        let box_type = params.box_type;
        let index = params.index;
        let type = params.type;
        let ext_item = params.ext_item;
        if(box_type > 0 && box_type <= this.player_box_type_count){
            if(this.soul_list[player_id].i.hasOwnProperty(box_type)){
                if(this.soul_list[player_id].i[box_type].d[index]){
                    let r_data = CustomDeepCopy(this.soul_list[player_id].i[box_type].d[index]) as CGEDGetSoulListData;
                    let level = r_data.l;
                    let value = r_data.v;
                    let key = r_data.k;
                    let l = this.soul_list[player_id].i[box_type].l;
                    if(type == 1){
                        if(level >= 5){
                            if(GameRules.ServiceInterface.player_map_level[player_id] >= 50){
                                if(level >= 15){
                                    if(l < 75){
                                        GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:历史总等级达到75,即可开放魂石上限为20级");
                                        return;
                                    }
                                }else if(level >= 10){
                                    if(l < 50){
                                        GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:历史总等级达到50,即可开放魂石上限为15级");
                                        return;
                                    }
                                }else if(level >= 5){
                                    if(l < 25){
                                        GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:历史总等级达到25,即可开放魂石上限为10级");
                                        return;
                                    }
                                }
                            }else{
                                GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:地图等级50级后开放更高的等级");
                                return;
                            }
                        }
                    }
                    let ret : { code : boolean , data : CGEDGetSoulListData , value : number} = {
                        code : false, 
                        data : {
                            k : key, //属性键
                            v : value, //属性数值
                            l : level,//拼图等级
                            c : [],
                        },
                        value : 0,
                    };
                    if(type == 1){
                        if(level < 20){
                            //获取数据...
                            ret = this.SoulDataUp(key , level , value);
                        }else{
                            GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:升级超过最大等级");
                            return
                        }
                    }else{
                        if(level >= 1){
                            //获取数据...
                            ret = this.SoulDataDrop(key , level , value);
                        }else{
                            GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:降级不能低于1级")
                            return
                        }
                    }
                    
                    if(ret.code == true){
                        let Sj_config_key = "";
                        let ext_pro = 0;
                        if(type == 1){
                            Sj_config_key = this.level_u_d_config.up[level];
                        }else{
                            Sj_config_key = this.level_u_d_config.drop[level];
                        }
                        let need_item = this.GetUpItem(Sj_config_key , key , type);
                        if(ext_item){
                            if(ext_item == 1283){ // 低级魂石升级保护卷
                                need_item[ext_item] = 1;
                                ext_pro = 5;
                            }else if(ext_item == 1284){ // 中级魂石升级保护卷
                                need_item[ext_item] = 1;
                                ext_pro = 10;
                            }else if(ext_item == 1285){ // 高级魂石升级保护卷
                                need_item[ext_item] = 1;
                                ext_pro = 15;
                            }
                        }
                        //附加数据记录
                        ret.data.c = r_data.c;
                        for (const need_item_key in need_item) {
                            let need_item_id = tonumber(need_item_key);
                            let need_item_count = need_item[need_item_id];
                            let set_item_id = need_item_id;
                            if(type == 1){
                                //通过不同的石头
                                if(set_item_id >= 10000 &&set_item_id < 20000){
                                    let ServerSoulConfigDataConsume = ServerSoulConfig[Sj_config_key as keyof typeof ServerSoulConfig].consume;
                                    let con_data = ServerSoulConfigDataConsume.split("_");
                                    if(con_data[0] == "1"){
                                        set_item_id = 1287;
                                    }else if(con_data[0] == "2"){
                                        set_item_id = 1288;
                                    }else if(con_data[0] == "3"){
                                        set_item_id = 1289;
                                    }else if(con_data[0] == "4"){
                                        set_item_id = 1290;
                                    }
                                }
                            }
                            if(ret.data.c.hasOwnProperty(set_item_id)){
                                ret.data.c[set_item_id] += need_item_count;
                            }else{
                                ret.data.c[set_item_id] = need_item_count;
                            }
                            let ret_ver = GameRules.ServiceData.SelectVerifyPackageItem(player_id , need_item_id , need_item_count);
                            if(ret_ver.is_verify){
                                GameRules.ServiceData.DeletePackageItemSelect(player_id , ret_ver.index , need_item_count);
                            }else{
                                GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:材料不足...")
                                return ;
                            }
                        }
                        //计算概率
                        let pro = ServerSoulConfig[Sj_config_key as keyof typeof ServerSoulConfig].pro + ext_pro;
                        if(RollPercentage(pro)){
                            this.soul_list[player_id].i[box_type].d[index] = ret.data;
                            if(type == 1){
                                this.soul_list[player_id].i[box_type].z ++;
                                if(this.soul_list[player_id].i[box_type].z > this.soul_list[player_id].i[box_type].l){
                                    this.soul_list[player_id].i[box_type].l = this.soul_list[player_id].i[box_type].z;
                                }
                                GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:升级成功:+" + ret.value)
                            }else{
                                this.soul_list[player_id].i[box_type].z --;
                                GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:降级成功:-" + ret.value)
                            }
                        }else{
                            if(type == 1){
                                GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:升级失败!")
                            }else{
                                GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:降级失败!")
                            }
                        }
                        //更新魂石数据
                        this.GetPlayerServerSoulData( player_id , {})
                        //更新背包数据
                        GameRules.ServiceInterface.GetPlayerServerPackageData(player_id , {} );
                    }else{
                        GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:升级失败...")
                    }
                }else{
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:参数错误...")
                }
            }else{
                GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:配置错误...")    
            }
        }else{ 
            GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:部位错误...")
        }
    }
    /**
     * 魂石属性创建/升级属性计算
     * @param key 魂石属性key
     * @param level 魂石等级
     * @param num 魂石属性值
     */
    SoulDataUp( key : string , level : number = 0 , value : number = 0) : { code : boolean , data : CGEDGetSoulListData , value : number}{
        let ret  : { code : boolean , data : CGEDGetSoulListData , value : number } = {
            code : true,
            data : {
                "k" : key,
                "l" : 0 ,
                "v" : 0 ,
                "c" : [],
            },
            value : 0,
        }
        if(level != 0){
            ret.data.l = level;
        }
        if(value != 0){
            ret.data.v = value;
        }
        let SoulAttr_data = ServerSoulAttr[key as keyof typeof ServerSoulAttr];
        let float = SoulAttr_data.float;
        let up_value = SoulAttr_data.up_value;
        let value_max = SoulAttr_data.value_max_5;
        let level_max = SoulAttr_data.level_max;
        if((level + 1) >= level_max){
            return ret;
        }
        let per = 100;
        if(level > 0){  // 1-4
            let value_per = SoulAttr_data.value_per_1_5;
            value_max = SoulAttr_data.value_max_5;
            if(level >= 4){ 
                per += value_per * 4;
            }else{
                per += value_per * level;
            }
        }

        if(level > 4){ //5-9
            let value_per = SoulAttr_data.value_per_6_10;
            value_max = SoulAttr_data.value_max_10;
            if(level >= 9){
                per += value_per * 5;
            }else{
                let cz_level = level - 4;
                per += value_per * cz_level;
            }
        }

        if(level > 9){ // 10-14
            let value_per = SoulAttr_data.value_per_11_15;
            value_max = SoulAttr_data.value_max_15;
            if(per >= 14){
                per += value_per * 5;
            }else{
                let cz_level = level - 9;
                per += value_per * cz_level;
            }
        }

        if(level > 14){ // 15-19
            let value_per = SoulAttr_data.value_per_16_20;
            value_max = SoulAttr_data.value_max_20;
            if(per >= 19){
                per += value_per * 5;
            }else{
                let cz_level = level - 14;
                per += value_per * cz_level;
            }
        }
        
        let newSection = this.SectionPer(up_value , float , per);
        let add_value = this.ZoomNumber(newSection , float)
        if((value + add_value ) >= value_max){
            ret.data.v = value_max;
        }else{
            ret.data.v += add_value;
            ret.value = add_value;
        }
        ret.data.l = level + 1;

        return ret;
    }


    /**
     * 魂石属性降级计算
     * @param key 魂石属性key
     * @param level 魂石等级
     * @param num 魂石属性值
     */
    SoulDataDrop( key : string , level : number = 0 , value : number = 0) : { code : boolean , data : CGEDGetSoulListData , value : number}{
        let ret  : { code : boolean , data : CGEDGetSoulListData , value : number} = {
            code : true,
            data : {
                "k" : key,
                "l" : level ,
                "v" : value ,
                "c" : [],
            },
            value : 0,
        }
        let SoulAttr_data = ServerSoulAttr[key as keyof typeof ServerSoulAttr];
        let float = SoulAttr_data.float;
        let drop_value = SoulAttr_data.drop_value;
        let value_min = 0;
        if((level - 1) < 0){
            return ret;
        }
        
        let per = 100;
        if(level > 1){  // 2-5
            let value_per = SoulAttr_data.value_per_1_5;
            if(level >= 5){ 
                per += value_per * 4;
            }else{
                per += value_per * level;
            }
        }

        if(level > 5){ //6-10
            let value_per = SoulAttr_data.value_per_6_10;
            if(level >= 10){
                per += value_per * 5;
            }else{
                let cz_level = level - 5;
                per += value_per * cz_level;
            }
        }

        if(level > 10){ // 11-15
            let value_per = SoulAttr_data.value_per_11_15;
            if(per >= 15){
                per += value_per * 5;
            }else{
                let cz_level = level - 10;
                per += value_per * cz_level;
            }
        }

        if(level > 15){ // 16-20
            let value_per = SoulAttr_data.value_per_16_20;
            if(per >= 20){
                per += value_per * 5;
            }else{
                let cz_level = level - 15;
                per += value_per * cz_level;
            }
        }
        
        let newSection = this.SectionPer(drop_value , float , per);
        let sub_value = this.ZoomNumber(newSection , float)
        if((value - sub_value ) <= value_min){
            ret.data.v = value_min;
        }else{
            ret.data.v -= sub_value;
            ret.value = sub_value;
        }
        ret.data.l--;

        return ret;
    }

    /**
     * 区间值百分比提升方法
     */
    SectionPer(value_scope : string , float : number , double : number) : string{
        let ret_scope = value_scope;
        let value_list = value_scope.split("-");

        let value_min = tonumber(value_list[0]);
        let value_max = tonumber(value_list[1]);
        //等比放大
        if (float > 0) {
            for (let index = 0; index < float; index++) {
                value_min = value_min * 10;
                value_max = value_max * 10;
            }
        }
        value_min = math.floor(value_min * double / 100);
        value_max = math.floor(value_max * double / 100);
        //等比缩小
        if (float > 0) {
            for (let index = 0; index < float; index++) {
                value_min = value_min / 10;
                value_max = value_max / 10;
            }
        }
        ret_scope = tostring(value_min) + "-" + tostring(value_max);
        return ret_scope ;
    }

    /**
     * 数字等比放大缩小功能
     * @param value_scope 
     * @param float 
     */
    ZoomNumber(value_scope : string , float : number) :  number{
        let attr_value = 0;
        let value_list = value_scope.split("-");
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
        attr_value = value_min + RandomInt(0, (value_max - value_min));
        //等比缩小
        if (float > 0) {
            for (let index = 0; index < float; index++) {
                attr_value = attr_value / 10;
            }
        }
        return attr_value;
    }
    /**
     * 获取物品升降级物品
     * @param key  //强化key
     * @param attr_key //属性key
     * @param consume  //主要消耗
     * @param items  //额外物品列表
     * @param type  //升级还是降级 1 升级 2降级
     */
    GetUpItem( key : string , attr_key : string , type : number ): {
        [item_id : number ]  : number,
    }{
        let ret : {
            [item_id : number ]  : number,
        } = {};
        let SoulUpData = ServerSoulConfig[key as keyof typeof ServerSoulConfig];
        let consume = SoulUpData.consume;
        let items = SoulUpData.items;
        
        if(consume != "null"){
            let con_data = consume.split("_");
            if(type == 1){
                let item_id_list = ServerSoulAttr[attr_key as keyof typeof ServerSoulAttr].item_id;
                let section = tonumber(con_data[0]) - 1;
                let get_item_id = item_id_list[section];
                ret[get_item_id] = tonumber(con_data[1]);    
            }else{
                ret[tonumber(con_data[0])] = tonumber(con_data[1]);
            }
        }
        for (const element of items) {
            if(element != "null"){
                let item_data = element.split("_");
                let item_id = tonumber(item_data[0]);
                let item_count = tonumber(item_data[1]);
                if(ret.hasOwnProperty(item_id)){
                    ret[item_id] += item_count;
                }else{
                    ret[item_id] = item_count;
                }
            }
        }
        return ret;
    } 
    /**
     * 获取魂石配置
     * @param player_id 
     * @param params 
     */
    GetPlayerServerSoulData(player_id: PlayerID, params:  CGED["ServiceSoul"]["GetPlayerServerSoulData"]){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceSoul_GetPlayerServerSoulData",
            {
                data: {
                    list : this.soul_list[player_id],
                    map_level : GameRules.ServiceInterface.player_map_level[player_id]
                }
                
                
            }
        );
    }
    /**
     * 预览魂石删除
     * @param player_id 
     * @param params 
     */
    DeforehandSoulDelete(player_id: PlayerID, params:  CGED["ServiceSoul"]["DeforehandSoulDelete"]){
        let box_type = params.box_type;
        let index = params.index;
        if(this.soul_list[player_id].i.hasOwnProperty(box_type)){
            if(this.soul_list[player_id].i[box_type].d[index]){
                let items = this.soul_list[player_id].i[box_type].d[index].c;
                let new_items = this.GetDeleteItems(items);
                CustomGameEventManager.Send_ServerToPlayer(
                    PlayerResource.GetPlayer(player_id),
                    "ServiceSoul_DeforehandSoulDelete",
                    {
                        data: {
                            itemsdata : new_items,
                            box_type : box_type,
                            index : index,
                        }
                    }
                );
            }else{
                GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:选择错误..")
            }
        }else{
            GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:没有此项..")
        }
    }

    /**
     * 魂石真删除
     * @param player_id 
     * @param params 
     */
    SoulDelete(player_id: PlayerID, params : CGED["ServiceSoul"]["SoulDelete"]){
        let box_type = params.box_type;
        let index = params.index;
        if(this.soul_list[player_id].i.hasOwnProperty(box_type)){
            if(this.soul_list[player_id].i[box_type].d[index]){
                let items = this.soul_list[player_id].i[box_type].d[index].c;
                let new_items = this.GetDeleteItems(items);
                for (const key in new_items.list) {
                    let count = new_items.list[key];
                    let item_id = tonumber(key);
                    GameRules.ServiceData.AddPackageItem(
                        player_id , 
                        key,
                        item_id,
                        "",
                        count
                    );
                }
                //删除符文数据
                this.soul_list[player_id].i[box_type].d.splice(index , 1);
                //更新魂石数据
                this.GetPlayerServerSoulData( player_id , {})
                //更新背包数据
                GameRules.ServiceInterface.GetPlayerServerPackageData(player_id , {} );
            }else{
                GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:没有此项..")
            }
        }else{
            GameRules.CMsg.SendErrorMsgToPlayer(player_id , "魂石功能:没有部位..")
        }
    }

    /**
     * 计算返回数据
     * @param items 
     * @returns 
     */
    GetDeleteItems(items : { //总消耗 //用于删除返回
        [ item_id : number] : number , //物品数量key
    } , pro : number = 70 ) : { 
        list : {
            [ item_id : number] : number , //物品数量key
        },
        pro : number,
    }{
        let ret_new : { 
            list : {
                [ item_id : number] : number , //物品数量key
            },
            pro : number,
        } = {
            list : {},
            pro : pro
        };
        for (const key in items) {
            let item_id = tonumber(key);
            let count = math.floor((items[key] / 100) * pro);
            if(count > 0){
                if(ret_new.list.hasOwnProperty(item_id)){
                    ret_new.list[item_id] += count;
                }else{
                    ret_new.list[item_id] = count;
                }
            }
        }
        return ret_new;
    }

    
    Debug(cmd: string, args: string[], player_id: PlayerID): void {
        if(cmd == "!HSadd"){
            this.SoulAddOfField( player_id , { "box_type" : 1 , "key" : "1" })
        }
        if(cmd == "!HSUP"){
            this.SoulIntensify( player_id , { "box_type" : 1 , "index" : 0 , "type" : 1})
        }
    }
}