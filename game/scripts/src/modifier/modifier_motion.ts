import { BaseModifier, registerModifier, BaseModifierMotionBoth, BaseModifierMotionHorizontal } from '../utils/dota_ts_adapter';

@registerModifier()
export class modifier_pick_animation2 extends BaseModifierMotionBoth {

    fSpeed: number;
    target: CDOTA_BaseNPC;
    vBezier: Vector;
    vOrigin: Vector;
    fCount: number;
    fdistance: number;
    tDamageType: DamageTypes;
    bState: boolean;

    GetPriority(): ModifierPriority {
        return ModifierPriority.ULTRA + 10001;
    }

    OnCreated(params: any): void {
        if (!IsServer()) { return; }
        let vParent = this.GetParent().GetAbsOrigin()
        this.fCount = 0;
        this.target = this.GetCaster();
        this.bState = false;

        this.vOrigin = vParent;
        // 中间点
        let direction = vParent - this.target.GetAbsOrigin() as Vector;
        direction.z = 0;
        direction = direction.Normalized();
        let mid_vect = vParent + direction * 300 as Vector;
        // DebugDrawCircle(mid_vect, Vector(255, 0, 0), 255, 75, true, 1)
        this.vBezier = RotatePosition(vParent, QAngle(0, RandomInt(0, 0), 0), mid_vect);
        if (this.ApplyHorizontalMotionController() == false) {
            this.Destroy();
            return;
        }
        this.SetDuration(2, false);
    }

    UpdateHorizontalMotion(me: CDOTA_BaseNPC, dt: number): void {
        if (!IsServer()) { return; }
        if (IsValid(this.target)) { this.Destroy(); }
        this.fCount += dt * 1;
        const distance = (this.GetCaster().GetAbsOrigin() - this.GetParent().GetAbsOrigin() as Vector).Length2D();
        print("distance", distance)
        if (distance < 36) {
            this.Destroy();
            return;
        }
        print("this.fCount", this.fCount)
        let b1 = GetQuadraticVector(this.GetParent().GetOrigin(), this.target.GetOrigin(), this.vBezier, this.fCount);
        this.GetParent().SetOrigin(b1);


    }

    OnDestroy(): void {
        if (!IsServer()) { return; }
        //移除这个单位 造成伤害
        UTIL_RemoveImmediate(this.GetParent());
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.OUT_OF_GAME]: true
        }
    }
}

@registerModifier()
export class modifier_motion_bezier extends BaseModifierMotionBoth {

    _return: number; // 填1表示会回旋
    _end_point: Vector;
    _origin: Vector;
    _mid_point: Vector;
    _mid_point2: Vector;
    _speed: number;
    _init_distance: number;
    _value: number;

    _pre_speed: number;

    _to_return: boolean;

    OnCreated(params: any): void {
        if (!IsServer()) { return; }
        this._to_return = false;
        this._speed = params.movespeed / 25;
        this._origin = this.GetParent().GetOrigin();
        this._end_point = Vector(params.point_x, params.point_y, params.point_z);
        let mid_point = this._origin.Lerp(this._end_point, 0.8);
        this._mid_point = RotatePosition(this._origin, QAngle(0, -30, 0), mid_point);
        this._mid_point2 = RotatePosition(this._origin, QAngle(0, 30, 0), mid_point);
        this._init_distance = (this._origin - this._end_point as Vector).Length2D();
        this._pre_speed = (params.movespeed / 25) / this._init_distance;
        this._value = 0;
        this._OnCreated(params);
        DebugDrawCircle(this._origin, Vector(255, 0, 0), 1, 100, true, 1);
        DebugDrawCircle(mid_point, Vector(255, 0, 0), 1, 100, true, 1);
        DebugDrawCircle(this._end_point, Vector(0, 250, 0), 1, 100, true, 1);
        DebugDrawCircle(this._mid_point, Vector(0, 0, 250), 1, 100, true, 1);
        DebugDrawCircle(this._mid_point2, Vector(0, 0, 250), 1, 100, true, 1);
        if (this.ApplyHorizontalMotionController() == false || this.ApplyVerticalMotionController() == false) {
            this.Destroy();
            return;
        }
    }

    _ToTargetPoint(vPoint: Vector) { }

    UpdateHorizontalMotion(me: CDOTA_BaseNPC, dt: number): void {
        let b1: Vector;
        this._value += this._pre_speed;
        if (this._value > 1) {
            if (this._to_return == false) {
                this._ToTargetPoint(me.GetOrigin());
                this._to_return = true;
            }
            b1 = GetQuadraticVector(this._end_point, this.GetCaster().GetOrigin(), this._mid_point2, this._value - 1);
        } else {
            b1 = GetQuadraticVector(this._origin, this._end_point, this._mid_point, this._value);
        }
        this.GetParent().SetOrigin(b1);
        if (this._value > 2) {
            this.Destroy();
        }
    }

    _OnCreated(params: any) { }

}

@registerModifier()
export class modifier_pick_animation extends modifier_motion_bezier {

    parent: CDOTA_BaseNPC;
    outer_point: Vector;
    back_start: Vector;
    launch_direction: Vector;
    base_distance: number;
    launch_acceleration: number;
    const1: number;
    const2: number;
    init_distance: number;
    pre_ratio: number;

    OnCreated(params: any): void {
        if (!IsServer()) { return; }
        const movespeed = params.movespeed ?? 450;
        this.parent = this.GetParent();
        this.launch_acceleration = movespeed * 2;
        this._to_return = false;
        this.base_distance = 450;
        this.pre_ratio = 1;
        this._speed = movespeed;
        this._origin = this.GetParent().GetOrigin();
        this._end_point = this.GetCaster().GetAbsOrigin();


        let direction = this._origin - this._end_point as Vector;
        this.init_distance = direction.Length2D();
        if (this.init_distance > this.base_distance) {
            this.pre_ratio = math.min(0.5, this.base_distance / this.init_distance)
        }
        direction.z = 0;
        direction = direction.Normalized();
        // let mid_point = this._origin + direction * 650 as Vector;
        let outer_point = this._origin + direction * this.base_distance * 2 as Vector;
        this.outer_point = outer_point;
        let dir = Vector(outer_point.x, outer_point.y, 0) - this._origin as Vector;
        dir.z = 0;
        dir = dir.Normalized();
        this.launch_direction = dir;
        this._pre_speed = movespeed / (this.base_distance);
        this._value = 0;


        let height_start = GetGroundHeight(this._origin, this.parent);
        let height_end = GetGroundHeight(this._end_point, this.parent);
        let height_max = height_start + 400;
        // this.InitVerticalArc(height_start, height_max, height_end, 2);
        this._OnCreated(params);
        // DebugDrawCircle(this._origin, Vector(255, 0, 0), 1, 100, true, 1);
        // DebugDrawCircle(outer_point, Vector(255, 0, 0), 1, 64, true, 2);
        // DebugDrawCircle(this._origin, Vector(255, 255, 255), 1, 64, true, 2);
        // DebugDrawCircle(this._end_point, Vector(0, 250, 0), 1, 100, true, 1);
        // DebugDrawCircle(this._mid_point, Vector(255, 0, 0), 1, 100, true, 1);
        // DebugDrawCircle(this._mid_point2, Vector(255, 255, 255), 1, 100, true, 1);
        // this.SetDuration(4, false)
        if (this.ApplyHorizontalMotionController() == false || this.ApplyVerticalMotionController() == false) {
            this.Destroy();
            return;
        }
    }

    UpdateHorizontalMotion(me: CDOTA_BaseNPC, dt: number): void {
        let b1: Vector;
        // print("_pre_speed", this._pre_speed)
        // 贝塞尔曲线点
        let vCaster = this.GetCaster().GetAbsOrigin()

        if (this._to_return) {
            this._value += this._pre_speed * dt * this.pre_ratio;
            // print("this._value", this._value)
            this._value += 0.01
            let back_vect = GetQuadraticVector(this._origin, vCaster, this.outer_point, this._value);
            me.SetOrigin(back_vect);
            const distance = (me.GetAbsOrigin() - vCaster as Vector).Length2D();
            if (distance < 36 || this._value > 1) {
                this.Destroy();
                return
            }
        } else {
            this._value += this._pre_speed * dt;
            let launch_vect = GetQuadraticVector(this._origin, vCaster, this.outer_point, this._value);
            me.SetOrigin(launch_vect);
            if (this._value > 0.5) {
                this._to_return = true;
                // me.SetModelScale(5);
            }
        }

    }

    // UpdateVerticalMotion(me: CDOTA_BaseNPC, dt: number): void {
    //     if (this._to_return) {
    //         let pos = me.GetOrigin();
    //         let time = this.GetElapsedTime();
    //         let height = pos.z;
    //         let speed = this.GetVerticalSpeed(time);
    //         pos.z = height + speed * dt;
    //         me.SetOrigin(pos);
    //         let ground = GetGroundHeight(pos, me);
    //         if (pos.z <= ground) {
    //             pos.z = ground;
    //             me.SetOrigin(pos);
    //             this.Destroy();
    //         }
    //     }
    // }

    GetVerticalSpeed(time: number) {
        return this.const1 - 2 * this.const2 * time;
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

    OnDestroy(): void {
        if (!IsServer()) { return; }
        let hCaster = this.GetCaster();
        let effect_fx = ParticleManager.CreateParticle(
            "particles/diy/pick_item_fx2.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            hCaster
        )
        // ParticleManager.SetParticleControlEnt(
        //     effect_fx,
        //     0,
        //     hCaster,
        //     ParticleAttachment.ABSORIGIN,
        //     "attach_hitloc",
        //     Vector(0, 0, -500),
        //     false
        // )
        ParticleManager.ReleaseParticleIndex(effect_fx)
        UTIL_RemoveImmediate(this.GetParent());
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.MODEL_SCALE,
            ModifierFunction.MODEL_SCALE_ANIMATE_TIME,
        ]
    }

    GetModifierModelScaleAnimateTime() {
        return 0.5
    }

    GetModifierModelScale(): number {
        if (this._to_return) {
            return 0.01
        } else {
            return 75
        }
    }
}