import { reloadable } from "../../../utils/tstl-utils";


type PlayerAttributeProps = { [key in PlayerAttributeTypes]?: number }
/** 玩家属性 */
@reloadable
export class PlayerAttribute {

    AttributeData: PlayerAttributeProps[]

    constructor() {
        this._Init()
    }

    Reload() {
        this._Init()
    }

    private _Init() {
        this.AttributeData = [{}, {}, {}, {}];
    }

    InitPlayerAttribute(player_id: PlayerID) {
        this.AttributeData[player_id] = {
            "drop_double_exp": 0,
            "drop_double_soul": 0,
        }
    }

    ModifyPlayerAttribute(player_id: PlayerID, attr_list: PlayerAttributeProps) {
        for (let k in attr_list) {
            let pattr = k as PlayerAttributeTypes
            let value = attr_list[pattr];
            this.AttributeData[player_id][pattr] += value
        }
    }
}