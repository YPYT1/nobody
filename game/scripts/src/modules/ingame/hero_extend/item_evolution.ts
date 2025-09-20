import { reloadable } from '../../../utils/tstl-utils';
import { UIEventRegisterClass } from '../../class_extends/ui_event_register_class';
import * as ItemArmsJson from '../../../json/items/item_arms.json';

/** 技能升级相关 */
@reloadable
export class ItemEvolution extends UIEventRegisterClass {
    //每个玩家可选列表
    PlayerUpgradePool: {
        [player: number]: {
            //玩家
            [qualiy: number]: {
                //品质
                key: string[]; //物品key
                pro: number[]; //物品概率
            };
        };
    } = {};

    ItemQmax: number = 1; //物品最高品质

    EvolutionPoint: number[] = []; //技能点

    ConsumeEvolutionPoint: number[] = []; //已使用的技能点

    constructor() {
        super('ItemEvolution');
        for (let index = 0; index < GameRules.PUBLIC_CONST.PLAYER_COUNT; index++) {
            this.PlayerUpgradePool[index] = {};
            this.EvolutionPoint.push(0);
        }
    }

    /**
     * 初始化玩家可选物品概率(可重复调用)
     * @param player_id
     */
    InitPlayerUpgradeStatus(player_id: PlayerID, hUnit: CDOTA_BaseNPC) {
        this.PlayerUpgradePool[player_id] = {};
        this.EvolutionPoint[player_id] = 0;
        for (const [key, val] of pairs(ItemArmsJson)) {
            if (val.Rarity > 0) {
                if (!this.PlayerUpgradePool[player_id].hasOwnProperty(val.Rarity)) {
                    this.PlayerUpgradePool[player_id][val.Rarity] = {
                        key: [],
                        pro: [],
                    };
                }
                this.PlayerUpgradePool[player_id][val.Rarity].key.push(key);
                this.PlayerUpgradePool[player_id][val.Rarity].pro.push(val.Probability);
                if (this.ItemQmax < val.Rarity) {
                    this.ItemQmax = val.Rarity;
                }
            }
        }
        //给英雄初始6个物品
        // for (let index = 0; index < 6; index++) {
        //     let new_item = this.GetNewItem(GameRules.PUBLIC_CONST.HREO_INIT_ITEM_NAME);
        //     hUnit.AddItem(new_item);
        // }
    }

    /**
     * 升级
     */
    ItemUpgrade(player_id: PlayerID, param: CGED['ItemEvolution']['ItemUpgrade']) {
        const MyHero = PlayerResource.GetSelectedHeroEntity(player_id);
        const Index = param.index;
        const Item = MyHero.GetItemInSlot(Index);
        const Key = Item.GetAbilityName();
        if (this.EvolutionPoint[player_id] <= 0) {
            print('技能点不足！');
            return;
        }
        const Quality = ItemArmsJson[Key as keyof typeof ItemArmsJson].Rarity;
        if (this.ItemQmax == Quality) {
            print('已经是最高品质了！');
            return;
        }
        const key_list = this.PlayerUpgradePool[player_id][Quality + 1].key;
        const pro_list = this.PlayerUpgradePool[player_id][Quality + 1].pro;
        const new_item_key = key_list[GetCommonProbability(pro_list)];
        //移除物品
        Item.RemoveSelf();
        const new_item = this.GetNewItem(new_item_key);
        MyHero.AddItem(new_item);
    }

    /**
     * 创建一个没有归属人的物品
     * @param item_name
     * @param item_level
     * @returns
     */
    GetNewItem(item_name: string, item_level: number = 1): CDOTA_Item {
        // let Label = Kv.Item[item_name].Label;
        const hItem = CreateItem(item_name, null, null);
        item_level = math.max(1, item_level);
        hItem.SetLevel(item_level);
        return hItem;
    }

    /**
     * 选择列表
     */
    PostSelectArms(player_id: PlayerID, params: CGED['ArmsEvolution']['PostSelectArms']) {}

    /**
     * 获取物品信息初始化信息
     */
    GetArmssSelectData(player_id: PlayerID, params: CGED['ArmsEvolution']['GetArmssSelectData']) {}

    /**
     * 增加技能点
     */
    AddEvolutionPoint(player_id: PlayerID, count: number) {
        this.EvolutionPoint[player_id] += count;
        this.GetArmssSelectData(player_id, {});
    }

    Debug(cmd: string, args: string[], player_id: PlayerID) {
        if (cmd == '-tf_add') {
            const count = parseInt(args[0]) ?? 1;
            this.AddEvolutionPoint(player_id, count);
        }
        if (cmd == '-iu') {
            const index = parseInt(args[0]) ?? 1;
            this.ItemUpgrade(player_id, {
                index: index,
            });
        }
    }
}
