import { BaseModifier } from "../../utils/dota_ts_adapter";

export class StackModifier extends BaseModifier {

    init_stack:number;
    stack_limit:number;

    OnCreated(params: any): void {
        if (!IsServer()) { return; }
        // this._OnCreated(params);
        let init_stack = params.init_stack ?? 1;
        this.stack_limit = params.stack_limit ?? 1;
        this.SetStackCount(init_stack);
    }
}