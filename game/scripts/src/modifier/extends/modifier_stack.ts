import { BaseModifier } from "../../utils/dota_ts_adapter";

export class StackModifier extends BaseModifier {

    init_stack: number;
    limit_stack: number;

    OnCreated(params: any): void {
        if (!IsServer()) { return; }
        let init_stack = params.init_stack ?? 1;
        this.limit_stack = params.limit_stack ?? 1;
        this.SetStackCount(init_stack);
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return; }
        if (this.GetStackCount() < this.limit_stack) {
            this.IncrementStackCount();
        }
    }
}