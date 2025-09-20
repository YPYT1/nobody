import { registerModifier, BaseModifierMotionBoth } from '../utils/dota_ts_adapter';

/**
 * 击退方法
 * 中心点,目标点,然后按照两点对比进行击退和击飞的距离
 */
@registerModifier()
export class modifier_knockback_lua extends BaseModifierMotionBoth {
    bFindPath: boolean;
    interrupted: boolean;

    vCenter: Vector;
    vDir: Vector;
    vFinal: Vector;

    fGroundSpeed: number; // 移动速度
    fHeightSpeed: number; // 高度速度
    fMovedDistance: number;
    fDistance: number;
    fHeight: number;

    fHeightConst1: number;
    fHeightConst2: number;

    IsHidden(): boolean {
        return true;
    }

    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        // DeepPrintTable(params)
        const hParent = this.GetParent();
        if (hParent.HasModifier('modifier_motion_surround') || hParent.HasModifier('modifier_generic_arc_lua') || hParent.IsBossCreature()) {
            this.Destroy();
            return;
        }
        this.interrupted = false;
        this.vCenter = Vector(params.center_x, params.center_y, params.center_z ?? 0);
        this.fMovedDistance = 0;
        const knockback_distance = (params.knockback_distance as number) ?? 0;
        const knockback_duration = (params.knockback_duration as number) ?? 1;
        /** 可否穿墙 */
        const knockback_cross = params.knockback_cross as number;
        const knockback_activity = params.knockback_activity ?? 0;
        this.SetStackCount(knockback_activity);
        this.fGroundSpeed = knockback_distance / knockback_duration;
        this.fDistance = math.abs(knockback_distance);
        // 如果目标点处于中心点,则随机方向击退
        this.vDir = ((this.GetParent().GetOrigin() - this.vCenter) as Vector).Normalized();
        if (this.vDir.x == 0) {
            this.vDir.x = RandomFloat(0, 1) * (RollPercentage(50) ? -1 : 1);
        }
        if (this.vDir.y == 0) {
            this.vDir.y = RandomFloat(0, 1) * (RollPercentage(50) ? -1 : 1);
        }
        // 终点位置
        this.vFinal = (this.GetParent().GetAbsOrigin() + this.vDir * knockback_distance) as Vector;
        // 如果终点为可到达路过程不用判断寻路,否则到
        if (knockback_cross == 0) {
            this.bFindPath = false;
        } else {
            this.bFindPath = GridNav.CanFindPath(this.vFinal, this.GetParent().GetOrigin());
        }

        // 高度
        const knockback_height = (params.knockback_height ?? 0) as number;
        this.fHeight = knockback_height;
        const height_start = GetGroundHeight(this.GetParent().GetAbsOrigin(), this.GetParent());
        const height_end = GetGroundHeight(this.vFinal, this.GetParent());
        const height_max = height_start + knockback_height;
        this.InitVerticalArc(height_start, height_max, height_end, knockback_duration);
        this.Jump(params);
    }

    _OnCreated(params: any) {}

    Jump(params: any) {
        if (this.fDistance != 0) {
            if (!this.ApplyHorizontalMotionController()) {
                this.interrupted = true;
                this.Destroy();
                return;
            }
        }

        if (this.fHeight != 0) {
            if (!this.ApplyVerticalMotionController()) {
                this.interrupted = true;
                this.Destroy();
                return;
            }
        }
        this._OnCreated(params);
    }

    OnHorizontalMotionInterrupted(): void {
        this.interrupted = true;
        this.Destroy();
    }

    OnVerticalMotionInterrupted(): void {
        this.interrupted = true;
        this.Destroy();
    }

    InitVerticalArc(height_start: number, height_max: number, height_end: number, duration: number) {
        height_end = height_end - height_start;
        height_max = height_max - height_start;
        if (height_max < height_end) {
            height_max = height_end + 0.01;
        }
        if (height_max <= 0) {
            height_max = 0.01;
        }
        const duration_end = (1 + math.sqrt(1 - height_end / height_max)) / 2;
        this.fHeightConst1 = (4 * height_max * duration_end) / duration;
        this.fHeightConst2 = (4 * height_max * duration_end * duration_end) / (duration * duration);
    }

    UpdateVerticalMotion(me: CDOTA_BaseNPC, dt: number): void {
        const pos = me.GetOrigin();
        const time = this.GetElapsedTime();
        const height = pos.z;
        const speed = this.GetVerticalSpeed(time);
        pos.z = height + speed * dt;
        me.SetOrigin(pos);
        const ground = GetGroundHeight(pos, me);
        if (pos.z <= ground) {
            pos.z = ground;
            me.SetOrigin(pos);
            this.Destroy();
        }
    }

    // 水平
    UpdateHorizontalMotion(me: CDOTA_BaseNPC, dt: number): void {
        const moved_distance = this.fGroundSpeed * dt;
        const vNewLocation = (this.GetParent().GetOrigin() + this.vDir * this.fGroundSpeed * dt) as Vector;
        if (this.bFindPath == false && GridNav.CanFindPath(this.GetParent().GetOrigin(), vNewLocation) == false) {
            this.Destroy();
            return;
        }
        me.SetOrigin(vNewLocation);
        this.fMovedDistance += moved_distance;
        if (this.fMovedDistance >= this.fDistance) {
            // print("vNewLocation", vNewLocation);
            this.Destroy();
            return;
        }
    }

    DeclareFunctions(): ModifierFunction[] {
        const funcs = [];
        if (this.GetStackCount() > 0) {
            funcs.push(ModifierFunction.OVERRIDE_ANIMATION);
        }
        return funcs;
    }

    GetOverrideAnimation(): GameActivity {
        return this.GetStackCount();
    }

    GetVerticalPos(time: number) {
        return this.fHeightConst1 * time - this.fHeightConst2 * time * time;
    }

    GetVerticalSpeed(time: number) {
        return this.fHeightConst1 - 2 * this.fHeightConst2 * time;
    }
}
