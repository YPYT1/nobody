import { BaseModifier } from "../../utils/dota_ts_adapter";

export class StackModifier extends BaseModifier {

    max_stack: number;
    value: number;

    OnCreated(params: any): void {
        if (!IsServer()) { return; }
        this.parent = this.GetParent()
        this.UpdateValue(params)
        let init_stack = params.init_stack ?? 1;
        this.max_stack = params.max_stack ?? 1;
        this.SetStackCount(init_stack);

    }

    OnRefresh(params: any): void {
        if (!IsServer()) { return; }
        this.UpdateValue(params)
        this.max_stack = params.max_stack ?? this.max_stack;
        let stack_add = params.stack_add ?? 1;
        if (this.GetStackCount() < this.max_stack) {
            if (stack_add > 1) {
                let last_add = math.min(stack_add, this.max_stack - this.GetStackCount());
                this.SetStackCount(this.GetStackCount() + last_add);
            } else {
                this.IncrementStackCount();
            }
        }
    }

    UpdateValue(params: any) { }
}

/** 每层的buff独立计算 */
export class StackModifierIndep extends BaseModifier {

    max_stack: number;
    endtime: number[];
    stack_list: number[];

    OnCreated(params: any): void {
        if (!IsServer()) { return; }
        this.parent = this.GetParent()
        let DestroyTime: number = GameRules.GetDOTATime(false, false) + params.duration;
        this.endtime = [DestroyTime];
        let fAddStack: number = params.fAddStack ?? 1;
        this.max_stack = params.fMaxStack ?? 999;
        this.stack_list = [fAddStack];
        let interval = this.GetAbility().GetSpecialValueFor("interval");
        if (interval == 0) { interval = 0.25; }
        this.SetStackCount(fAddStack);
        this.StartIntervalThink(interval);
    }

    OnRefresh(params: any): void {
        if (!IsServer()) { return; }
        let DestroyTime = GameRules.GetDOTATime(false, false) + params.duration;
        let fAddStack: number = params.fAddStack ?? 1;
        if (this.GetStackCount() >= this.max_stack) { return; }
        let add_stack = fAddStack;
        let current_stack = this.GetStackCount();
        if (current_stack + fAddStack >= this.max_stack) {
            add_stack = this.max_stack - current_stack;
        }
        table.insert(this.endtime, DestroyTime);
        table.insert(this.stack_list, add_stack);
        this.SetStackCount(current_stack + add_stack);

    }

    OnIntervalThink(): void {
        let hAbility = this.GetAbility();
        if (hAbility == null) {
            this.StartIntervalThink(-1);
            this.Destroy();
            return;
        }

        let nowTime = GameRules.GetDOTATime(false, false);
        for (let i of this.endtime) {
            if (i <= nowTime) {
                let reduce_stack = this.stack_list[0];
                table.remove(this.endtime, 1);
                table.remove(this.stack_list, 1);
                this.SetStackCount(this.GetStackCount() - reduce_stack);
            } else {
                print("end thinker", i, nowTime)
                return
            }


        }
    }


}