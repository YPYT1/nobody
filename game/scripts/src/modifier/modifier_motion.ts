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
        // print("distance", distance)
        if (distance < 36) {
            this.Destroy();
            return;
        }
        // print("this.fCount", this.fCount)
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
        this.C_OnCreated(params);
        // DebugDrawCircle(this._origin, Vector(255, 0, 0), 1, 100, true, 1);
        // DebugDrawCircle(mid_point, Vector(255, 0, 0), 1, 100, true, 1);
        // DebugDrawCircle(this._end_point, Vector(0, 250, 0), 1, 100, true, 1);
        // DebugDrawCircle(this._mid_point, Vector(0, 0, 250), 1, 100, true, 1);
        // DebugDrawCircle(this._mid_point2, Vector(0, 0, 250), 1, 100, true, 1);
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

    C_OnCreated(params: any) { }

}

@registerModifier()
export class modifier_pick_animation extends modifier_motion_bezier {

    parent: CDOTA_BaseNPC;
    caster: CDOTA_BaseNPC;
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
        this.caster = EntIndexToHScript(params.picker) as CDOTA_BaseNPC;
        this.parent = this.GetParent();
        this.parent.is_picking = true;
        this.launch_acceleration = movespeed * 2;
        this._to_return = false;
        this.base_distance = 450;
        this.pre_ratio = 1;
        this._speed = movespeed;
        this._origin = this.GetParent().GetOrigin();
        this._end_point = this.caster.GetAbsOrigin();


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
        this.C_OnCreated(params);
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
        let vCaster = this.caster.GetAbsOrigin()

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
        let hCaster = this.caster;
        let hParent = this.GetParent();
        // print("OnDestroy", hCaster, hParent)
        if (hParent == null) { return }
        if (hCaster == null) { return }
        let resource_type = hParent.drop_resource_type;
        let resource_amount = hParent.drop_resource_amount;
        UTIL_Remove(this.GetParent());
        if (resource_type == null || resource_amount == null) { return }
        // print("resource_type", resource_type, "resource_amount", resource_amount)
        GameRules.ResourceSystem.ModifyResource(hCaster.GetPlayerOwnerID(), {
            [resource_type]: resource_amount
        }, hCaster, true)
        let effect_fx = ParticleManager.CreateParticle(
            "particles/diy/pick_item_fx2.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            hCaster
        )
        ParticleManager.ReleaseParticleIndex(effect_fx)

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


/**
 * Modifier 环绕
 */
@registerModifier()
export class modifier_motion_surround extends BaseModifierMotionBoth {

    /** 环绕高度 */
    surround_height: number;
    /** 当前环绕目标距离 */
    surround_distance: number;
    /** 环绕渐变距离 */
    surround_distance_bonus: number;
    _distance_bonus: number;
    /** 初始所处角度 */
    surround_qangle: number;
    /** 环绕速度 */
    surround_speed: number;
    /** 中心实体 */
    surround_entity: EntityIndex;
    /** 最终距离 */
    final_distance: number;
    /** x距离偏移 */
    forward_offset: number;
    /** 锁定面向 */
    lock_forward: number;

    _base_entity: CDOTA_BaseNPC;
    _rote_value: number;
    _downswing: boolean;
    parent: CDOTA_BaseNPC;
    caster: CDOTA_BaseNPC;

    IsHidden(): boolean { return true; }
    IsPurgable() { return false; }
    RemoveOnDeath(): boolean { return true; }

    GetPriority(): ModifierPriority {
        return ModifierPriority.ULTRA + 100;
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.UNSELECTABLE]: true,
            [ModifierState.NOT_ON_MINIMAP]: true,
        };
    }


    OnCreated(params: any): void {
        if (!IsServer()) { return; }
        // this.GetParent().RemoveHorizontalMotionController(this);
        // this.GetParent().RemoveVerticalMotionController(this);
        this.surround_distance = params.surround_distance;
        this.final_distance = params.surround_distance;
        this.surround_qangle = params.surround_qangle;
        this.surround_speed = params.surround_speed * 0.01;
        this.surround_entity = params.surround_entity;
        this.surround_height = params.surround_height ?? 0;
        this.forward_offset = params.forward_offset ?? 0;
        this.lock_forward = params.lock_forward ?? 0;
        this.surround_distance_bonus = params.surround_distance_bonus ?? 0;
        this._distance_bonus = 0;
        this._downswing = false;
        this._base_entity = EntIndexToHScript(this.surround_entity) as CDOTA_BaseNPC;
        this._rote_value = 0;
        this.parent = this.GetParent();
        this.caster = this.GetCaster();
        // print("this._base_entity", this._base_entity.GetUnitName())
        // print("this.ApplyHorizontalMotionController()",this.ApplyHorizontalMotionController())
        if (this.ApplyHorizontalMotionController() == false || this.ApplyVerticalMotionController() == false) {
            // print("Created Destroy")
            this.Destroy();
            return;
        }

        this.StartIntervalThink(0.1);
        this.C_OnCreated(params);
    }

    C_OnCreated(params: any) { }

    OnRefresh(params: any): void {
        if (!IsServer()) { return; }
        // 变更坐标
        this.final_distance = params.surround_distance;
    }

    OnIntervalThink(): void {
        if (this.GetCaster() == null || this.GetAbility() == null) {
            this.StartIntervalThink(-1);
            this.Destroy();
            return;
        }
        this._OnIntervalThink();
    }

    _OnIntervalThink() { }

    OnDestroy(): void {
        if (!IsServer()) { return; }
        this.GetParent().RemoveHorizontalMotionController(this);
        this.GetParent().RemoveVerticalMotionController(this);
        this.C_OnDestroy()
    }

    C_OnDestroy() {

    }
    OnVerticalMotionInterrupted() {
        if (!IsServer()) { return; }
        this.Destroy();
    }

    UpdateVerticalMotion(me: CDOTA_BaseNPC, dt: number): void {
        if (!IsServer()) { return; }
        let vCenterPos = this._base_entity.GetAbsOrigin();
        let vPos = me.GetAbsOrigin();
        vPos.z = vCenterPos.z + this.surround_height;
        me.SetOrigin(vPos);
    }

    // 水平
    UpdateHorizontalMotion(me: CDOTA_BaseNPC, dt: number): void {
        if (!IsServer()) { return; }
        if (IsValid(this._base_entity)) {
            this.Destroy();
            return;
        }
        let center_point = this._base_entity.GetAbsOrigin() + this._base_entity.GetForwardVector() * this.forward_offset as Vector;
        let int_offset: Vector;
        if (this.final_distance == this.surround_distance) {
            // 如果距离等于
            int_offset = Vector(center_point.x, center_point.y + this.surround_distance + this._distance_bonus, center_point.z);
            this._distance_bonus += this.surround_distance_bonus;
        } else {
            int_offset = Vector(center_point.x, center_point.y + this.surround_distance + this._distance_bonus, center_point.z);
            this.surround_distance += math.floor(this.final_distance - this.surround_distance) * 0.05;
        }
        let next_pos = RotatePosition(
            center_point,
            QAngle(0, (this.surround_qangle + this._rote_value), 0),
            int_offset
        );
        this._rote_value += this.surround_speed;
        if (this._rote_value > 360) { this._rote_value -= 360; }
        me.SetAbsOrigin(next_pos);
        if (this.lock_forward == 1) {
            let direction = this.GetCaster().GetOrigin() - me.GetOrigin() as Vector;
            let angleX = GetAngleByPosOfX(direction);
            me.SetAngles(0, angleX, 0);
        }
    }

}

@registerModifier()
export class modifier_motion_hit_target extends BaseModifierMotionHorizontal {

    speed: number;

    OnCreated(params: any): void {
        if (!IsServer()) { return; }
        this.fCount = 0;
        this.speed = params.speed ?? 100;;
        this.target = EntIndexToHScript(params.target_entity) as CDOTA_BaseNPC;
        // 贝塞尔曲线 参考点
        // let mid_vect = this.GetParent().GetOrigin().Lerp(this.target.GetOrigin(), 0.2);
        // this.vBezier = RotatePosition(this.GetParent().GetOrigin(), QAngle(0, RandomInt(0, 0), 0), mid_vect);
        this._OnCreated(params);
        if (this.ApplyHorizontalMotionController() == false) {
            this.Destroy();
            return;
        }
        // this.SetDuration(2, false);
    }

    _OnCreated(params: any): void { }
    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.NOT_ON_MINIMAP]: true,
            [ModifierState.UNSELECTABLE]: true,
            [ModifierState.INVULNERABLE]: true,
            // [ModifierState.INVISIBLE]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
        };
    }

    UpdateHorizontalMotion(me: CDOTA_BaseNPC, dt: number): void {
        if (!IsServer()) { return; }
        if (IsValid(this.target)) { this.Destroy(); }
        let vMePos = me.GetAbsOrigin();
        let distance = (this.target.GetAbsOrigin() - vMePos as Vector).Length2D();
        if (distance < 32) {
            this.Destroy()
            return
        }
        let direction = (this.target.GetAbsOrigin() - vMePos as Vector).Normalized();
        direction.z = 0;
        // 每秒朝目标点移动
        let vNew = vMePos + direction * dt * this.speed as Vector;
        let angle = VectorAngles(direction);
        me.SetAbsOrigin(vNew);
        me.SetAbsAngles(0, angle.y, 0)

    }

    OnDestroy(): void {
        if (!IsServer()) { return; }
        //移除这个单位 造成伤害
        UTIL_RemoveImmediate(this.GetParent());

    }

    fDamage: number;
    fSpeed: number;
    target: CDOTA_BaseNPC;
    vBezier: Vector;
    fCount: number;
    fdistance: number;
    tElement: CElementType;
    tDamageType: DamageTypes;
    fRadius: number;
}