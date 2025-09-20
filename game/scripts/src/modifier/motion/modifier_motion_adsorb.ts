import { BaseModifier, BaseModifierMotionBoth } from '../../utils/dota_ts_adapter';

/**
 * 吸附modifier,默认中心点为施法者
 */
export class modifier_motion_adsorb extends BaseModifier {
    origin: Vector;
    speed: number;
    dt: number;
    parent: CDOTA_BaseNPC;
    GetPriority(): ModifierPriority {
        return ModifierPriority.ULTRA + 10001;
    }

    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        this.origin = this.GetCaster().GetAbsOrigin();
        this.parent = this.GetParent();
        this.speed = 50;
        this.dt = GameRules.GetGameFrameTime();
        this._OnCreated(params);
        this.StartIntervalThink(this.dt);
        // if (this.ApplyHorizontalMotionController() == false) {
        //     this.Destroy();
        //     return;
        // }
    }

    _OnCreated(params: any) {}

    OnIntervalThink(): void {
        const target_vect = this.parent.GetAbsOrigin();
        let direction = (target_vect - this.origin) as Vector;
        const distance = direction.Length2D();
        direction = direction.Normalized();
        if (distance > 100) {
            this.parent.SetOrigin((target_vect - direction * this.speed * this.dt) as Vector);
            // FindClearSpaceForUnit(, false)
        } else {
            FindClearSpaceForUnit(this.parent, (target_vect - direction * this.speed * this.dt) as Vector, false);
        }
    }

    UpdateHorizontalMotion(me: CDOTA_BaseNPC, dt: number): void {}

    // OnDestroy(): void {
    //     if (!IsServer()) { return; }
    //     this.GetParent().RemoveHorizontalMotionController(this);
    //     this.GetParent().RemoveVerticalMotionController(this);
    // }

    // OnVerticalMotionInterrupted() {
    //     if (!IsServer()) { return; }
    //     this.Destroy();
    // }
}
