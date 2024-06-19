import { reloadable } from '../utils/tstl-utils';

@reloadable
export class Filter {


    constructor() {
        // GameRules.GetGameModeEntity().SetItemAddedToInventoryFilter((params) => this.ItemAddedToInventory(params), this);
        GameRules.GetGameModeEntity().SetDamageFilter((params) => this.DamageFilter(params), this);
        // GameRules.GetGameModeEntity().SetExecuteOrderFilter((params) => this.ExecuteOrderFilter(params), this);
    }

    Reload() {
        // GameRules.GetGameModeEntity().SetItemAddedToInventoryFilter((params) => this.ItemAddedToInventory(params), this);
        GameRules.GetGameModeEntity().SetDamageFilter((params) => this.DamageFilter(params), this);
        // GameRules.GetGameModeEntity().SetExecuteOrderFilter((params) => this.ExecuteOrderFilter(params), this);
    }

    ItemAddedToInventory(keys: ItemAddedToInventoryFilterEvent): boolean {
        return true
    }

    DamageFilter(params: DamageFilterEvent): boolean {
        let hUnit = EntIndexToHScript(params.entindex_victim_const) as CDOTA_BaseNPC;
        let player_id = hUnit.GetPlayerOwnerID();
        // if (player_id != -1) {
        //     PopupNumbersToTarget(hUnit, "phy", params.damage);
        // }
        // const hIllusionsBuff = hUnit.FindModifierByName("modifier_state_illusions_timelife");
        // if(hIllusionsBuff){
        //     let damage_income = hIllusionsBuff.GetStackCount();
        //     params.damage = params.damage * damage_income * 0.01;
        // }
        // 倍率
        const hMulBuff = hUnit.FindModifierByName("modifier_common_mul_health");
        if (hMulBuff) {
            let iMulStack = hMulBuff.GetStackCount();
            params.damage = params.damage / iMulStack;
        }
        if (params.damage > 2100000000) { params.damage = 2100000000; }
        // print(params.damage)
        return true;
    }

    ExecuteOrderFilter(params: ExecuteOrderFilterEvent) {
        // DeepPrintTable(params)
        return true
    }
}