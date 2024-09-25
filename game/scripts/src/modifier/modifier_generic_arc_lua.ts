/**
 * -- Created by Elfansoer

    Generic Jump Arc

    kv data (default):
    -- direction, provide just one (or none for default):
        dir_x/y (forward), for direction
        target_x/y (forward), for target point
    -- horizontal motion, provide 2 of 3, duration-only (for vertical arc), or all 3
        speed (0)
        duration (0)
        distance (0): zero means no horizontal motion
    -- vertical motion.
        height (0): max height. zero means no vertical motion
        start_offset (0), height offset from ground at start of jump
        }_offset (0), height offset from ground at} of jump
    -- arc types
        fix_end (true): if true, landing z-pos is the same as jumping z-pos, !respecting on landing terrain height (Pounce)
        fix_duration (true): if false, arc}s when unit touches ground, !respecting duration (Shield Crash)
        fix_height (true): if false, arc max height depends on jump distance, height provided is max-height (Tree Dance)
    -- other
        isStun (false), parent is stunned
        isRestricted (false), parent is command restricted
        isForward (false), lock parent forward facing
        activity (none), activity when leaping
**/

import { BaseModifierMotionBoth, registerModifier } from "../utils/dota_ts_adapter";


@registerModifier()
export class modifier_generic_arc_lua extends BaseModifierMotionBoth {

    interrupted: boolean;
    const1: number;
    const2: number;
    duration: number;
    height: number;
    distance: number;
    speed: number;
    end_offset: number;
    start_offset: number;
    activity: number;

    target_x: number;
    target_y: number;

    fix_duration: boolean;
    fix_end: boolean;
    fix_height: boolean;

    isStun: boolean;
    isRestricted: boolean;
    isForward: boolean;

    direction: Vector;
    parent: CDOTA_BaseNPC;

    endCallback: any;
    IsHidden(): boolean {
        return true;
    }

    IsDebuff(): boolean {
        return false;
    }

    IsStunDebuff(): boolean {
        return false;
    }

    IsPurgable(): boolean {
        return true;
    }

    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.MULTIPLE;
    }

    OnCreated(kv: any) {
        if (!IsServer()) { return; }
        this._OnCreated(kv);
        this.interrupted = false;
        this.SetJumpParameters(kv);
        this.Jump();
    }

    _OnCreated(kv: any) { }

    OnRefresh(kv: any): void {
        if (!IsServer()) { return }
        this._OnRefresh(kv)
    }

    _OnRefresh(kv: any): void {

    }

    OnDestroy(): void {
        if (!IsServer()) { return; }
        let pos = this.GetParent().GetOrigin();
        this.GetParent().RemoveHorizontalMotionController(this);
        this.GetParent().RemoveVerticalMotionController(this);
        if (this.end_offset != 0) {
            this.GetParent().SetOrigin(pos);
        }
        this._OnDestroy();
    }

    _OnDestroy() { }

    DeclareFunctions(): ModifierFunction[] {
        let funcs = [ModifierFunction.DISABLE_TURNING];
        if (this.GetStackCount() > 0) {
            funcs.push(ModifierFunction.OVERRIDE_ANIMATION);
        }
        return funcs;
    }

    GetModifierDisableTurning(): 0 | 1 {
        if (!this.isForward) { return; }
        return 1;
    }

    GetOverrideAnimation(): GameActivity {
        return this.GetStackCount();
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {

        return {
            [ModifierState.STUNNED]: this.isStun ?? false,
            [ModifierState.COMMAND_RESTRICTED]: this.isRestricted ?? false,
            [ModifierState.NO_UNIT_COLLISION]: true,

        };
    }

    UpdateHorizontalMotion(me: CDOTA_BaseNPC, dt: number): void {
        if ((this.fix_duration && this.GetElapsedTime()) >= this.duration) { return; }
        let pos = me.GetOrigin() + this.direction * this.speed * dt as Vector;
        me.SetOrigin(pos);
    }

    UpdateVerticalMotion(me: CDOTA_BaseNPC, dt: number): void {
        if ((this.fix_duration && this.GetElapsedTime()) >= this.duration) { return; }


        let pos = me.GetOrigin();
        let time = this.GetElapsedTime();


        let height = pos.z;
        let speed = this.GetVerticalSpeed(time);
        pos.z = height + speed * dt;
        me.SetOrigin(pos);

        if (!this.fix_duration) {
            let ground = GetGroundHeight(pos, me) + this.end_offset;
            if (pos.z <= ground) {
                pos.z = ground;
                me.SetOrigin(pos);
                this.Destroy();
            }
        }
    }

    OnHorizontalMotionInterrupted(): void {
        this.interrupted = true;
        this.Destroy();
    }

    OnVerticalMotionInterrupted(): void {
        this.interrupted = true;
        this.Destroy();
    }

    SetJumpParameters(kv: any) {
        this.parent = this.GetParent();

        this.fix_end = true;
        this.fix_duration = true;
        this.fix_height = true;
        if (kv.fix_end) {
            this.fix_end = kv.fix_end == 1;
        }
        if (kv.fix_duration) {
            this.fix_duration = kv.fix_duration == 1;
        }
        if (kv.fix_height) {
            this.fix_height = kv.fix_height == 1;
        }
        this.isStun = kv.isStun == 1;
        this.isRestricted = kv.isRestricted == 1;
        this.isForward = kv.isForward == 1;
        this.activity = kv.activity ?? 0;
        this.SetStackCount(this.activity);


        if (kv.target_x && kv.target_y) {
            let origin = this.parent.GetOrigin();
            let dir = Vector(kv.target_x, kv.target_y, 0) - origin as Vector;
            this.distance = dir.Length2D()
            dir.z = 0;
            dir = dir.Normalized();
            this.direction = dir;
        }

        if (kv.distance) {
            this.distance = kv.distance;
        }
        if (kv.dir_x && kv.dir_y) {
            this.direction = Vector(kv.dir_x, kv.dir_y, 0).Normalized();
        }
        if (!this.direction) {
            this.direction = this.parent.GetForwardVector();
        }

        this.duration = kv.duration;



        this.speed = kv.speed;

        if (!this.duration) {
            this.duration = this.distance / this.speed;
        }
        if (!this.distance) {
            this.speed = this.speed ?? 0;
            this.distance = this.speed * this.duration;
        }
        if (!this.speed) {
            this.distance = this.distance ?? 0;
            this.speed = this.distance / this.duration;
        }

        this.height = kv.height ?? 0;
        this.start_offset = kv.start_offset ?? 0;
        this.end_offset = kv.end_offset ?? 0;

        let pos_start = this.parent.GetOrigin();
        let pos_end = pos_start + this.direction * this.distance as Vector;
        let height_start = GetGroundHeight(pos_start, this.parent) + this.start_offset;
        let height_end = GetGroundHeight(pos_end, this.parent) + this.end_offset;
        let height_max = 0;
        if (!this.fix_height) {
            this.height = math.min(this.height, this.distance / 4);
        }
        if (this.fix_end) {
            height_end = height_start;
            height_max = height_start + this.height;
        } else {
            let tempmin = height_start;
            let tempmax = height_end;
            if (tempmin > tempmax) {
                [tempmin, tempmax] = [tempmax, tempmin];
            }
            let delta = (tempmax - tempmin) * 2 / 3;

            height_max = tempmin + delta + this.height;
        }


        if (!this.fix_duration) {
            this.SetDuration(-1, false);
        } else {
            this.SetDuration(this.duration, true);
        }
        this.InitVerticalArc(height_start, height_max, height_end, this.duration);

        this.C_OnCreated(kv);
    }

    C_OnCreated(kv) { }
    Jump() {
        if (this.distance > 0) {
            if (!this.ApplyHorizontalMotionController()) {
                this.interrupted = true;
                this.Destroy();
            }
        }


        if (this.height > 0) {
            if (!this.ApplyVerticalMotionController()) {
                this.interrupted = true;
                this.Destroy();
            }
        }
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


        let duration_end = (1 + math.sqrt(1 - height_end / height_max)) / 2;
        this.const1 = 4 * height_max * duration_end / duration;
        this.const2 = 4 * height_max * duration_end * duration_end / (duration * duration);
    }

    GetVerticalPos(time: number) {
        return this.const1 * time - this.const2 * time * time;
    }

    GetVerticalSpeed(time: number) {
        return this.const1 - 2 * this.const2 * time;
    }

    SetEndCallback(func: void) {
        this.endCallback = func;
    }

}






