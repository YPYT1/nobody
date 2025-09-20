import { reloadable } from '../../../utils/tstl-utils';

const AbilityIdIndex: { [type: string]: number } = {
    Summon: 1,
    Ring: 2,
    Surround: 3,
    Aoe: 4,
    Bounce: 5,
    Missile: 6,
    Targeting: 7,
    Dot: 8,
    Orb: 9,
    Resource: 10,
    Growth: 11,
    Buff: 12,
};

/** 实体击杀 */
@reloadable
export class HeroAbilityType {
    /** 玩家技能类型经验 */
    skill_type_exp: { [type_id: string]: number }[] = [];

    constructor() {
        GameRules.Debug.RegisterDebug(this.constructor.name);
        this.InitTypeExp();
    }

    /** 初始玩家技能类型经验 */
    InitTypeExp() {
        this.skill_type_exp = [];
        for (let i = 0; i < 6; i++) {
            const new_obj = {};
            for (const k in AbilityIdIndex) {
                const type_id = '' + AbilityIdIndex[k];
                new_obj[type_id] = 0;
            }
            this.skill_type_exp.push(new_obj);
        }
    }

    /** 增加技能类型经验 */
    AddAbilityTypeExp(player_id: PlayerID, skv_type: { [key in CustomHeroAbilityTypes]: boolean }) {
        // DeepPrintTable(this.skill_type_exp[player_id])
        for (const k in skv_type) {
            const state = skv_type[k as keyof typeof skv_type];
            if (state) {
                const type_id = '' + AbilityIdIndex[k];
                // print("type_id",type_id);
                const curr_exp = this.skill_type_exp[player_id][type_id] ?? 0;
                this.skill_type_exp[player_id][type_id] = curr_exp + 1;
            }
        }
    }

    /** 获的当前玩家的技能经验 */
    GetAbilityTypeExp() {
        return this.skill_type_exp;
    }

    Debug(cmd: string, args: string[], player_id: PlayerID) {
        if (cmd == '-typeex') {
            DeepPrintTable(this.skill_type_exp[player_id]);
        }

        if (cmd == '-typeinit') {
            this.InitTypeExp();
        }
    }
}
