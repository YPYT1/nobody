import { BaseModifier } from '../../utils/dota_ts_adapter';

export class StackModifier extends BaseModifier {
    max_stack: number;
    value: number;

    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        this.parent = this.GetParent();
        this.caster = this.GetCaster();
        this.UpdateValue(params);
        const init_stack = params.init_stack ?? 1;
        this.max_stack = params.max_stack ?? 1;
        this.SetStackCount(init_stack);
    }

    OnRefresh(params: any): void {
        if (!IsServer()) {
            return;
        }
        this.UpdateValue(params);
        this.max_stack = params.max_stack ?? this.max_stack;
        const stack_add = params.stack_add ?? 1;
        if (this.GetStackCount() < this.max_stack) {
            if (stack_add > 1) {
                const last_add = math.min(stack_add, this.max_stack - this.GetStackCount());
                this.SetStackCount(this.GetStackCount() + last_add);
            } else {
                this.IncrementStackCount();
            }
        }
    }

    UpdateValue(params: any) {}
}

/** 每层的buff独立计算 */
export class StackModifierIndep extends BaseModifier {
    max_stack: number;
    endtime: number[];
    stack_list: number[];

    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        this.parent = this.GetParent();
        const DestroyTime: number = GameRules.GetDOTATime(false, false) + params.duration;
        this.endtime = [DestroyTime];
        const fAddStack: number = params.fAddStack ?? 1;
        this.max_stack = params.fMaxStack ?? 999;
        this.stack_list = [fAddStack];
        let interval = this.GetAbility().GetSpecialValueFor('interval');
        if (interval == 0) {
            interval = 0.25;
        }
        this.SetStackCount(fAddStack);
        this.StartIntervalThink(interval);
    }

    OnRefresh(params: any): void {
        if (!IsServer()) {
            return;
        }
        const DestroyTime = GameRules.GetDOTATime(false, false) + params.duration;
        const fAddStack: number = params.fAddStack ?? 1;
        if (this.GetStackCount() >= this.max_stack) {
            return;
        }
        let add_stack = fAddStack;
        const current_stack = this.GetStackCount();
        if (current_stack + fAddStack >= this.max_stack) {
            add_stack = this.max_stack - current_stack;
        }
        table.insert(this.endtime, DestroyTime);
        table.insert(this.stack_list, add_stack);
        this.SetStackCount(current_stack + add_stack);
    }

    OnIntervalThink(): void {
        const hAbility = this.GetAbility();
        if (hAbility == null) {
            this.StartIntervalThink(-1);
            this.Destroy();
            return;
        }

        const nowTime = GameRules.GetDOTATime(false, false);
        for (const i of this.endtime) {
            if (i <= nowTime) {
                const reduce_stack = this.stack_list[0];
                table.remove(this.endtime, 1);
                table.remove(this.stack_list, 1);
                this.SetStackCount(this.GetStackCount() - reduce_stack);
            } else {
                print('end thinker', i, nowTime);
                return;
            }
        }
    }
}
