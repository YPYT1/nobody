import { modifier_motion_bezier } from "../../../modifier/modifier_motion";
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 飞盾抛掷	"丢出两个盾，对沿途的敌人造成伤害后，回到手里。
特效：兽王1技能
cd：3秒
伤害系数：护甲值1000%·风元素伤害"
 */
@registerAbility()
export class arms_51 extends BaseArmsAbility {

    _OnUpdateKeyValue(): void {
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        // 参考小松鼠
        this.ability_damage = this.GetAbilityDamage();
        let vPoint = this.caster.GetAbsOrigin() + this.caster.GetForwardVector() * 1000 as Vector;
        // DebugDrawCircle(vPoint, Vector(255, 0, 0), 1, 100, true, 1);
        let hUnit1 = GameRules.SummonedSystem.CreateBullet(this.caster.GetOrigin(), this.caster);
        hUnit1.AddNewModifier(this.caster, this, "modifier_arms_51_surround", {
            point_x: vPoint.x,
            point_y: vPoint.y,
            point_z: vPoint.z,
            movemode: 0,
            movespeed: 900,
        });


        let hUnit2 = GameRules.SummonedSystem.CreateBullet(this.caster.GetOrigin(), this.caster);
        hUnit2.AddNewModifier(this.caster, this, "modifier_arms_51_surround", {
            point_x: vPoint.x,
            point_y: vPoint.y,
            point_z: vPoint.z,
            movemode: 1,
            movespeed: 900,
        });
    }
}

@registerModifier()
export class modifier_arms_51 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_51_surround extends modifier_motion_bezier {

    effect_fx: ParticleID;
    do_gather: boolean;

    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return 128; }
    IsAuraActiveOnDeath() { return false; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_arms_51_surround_collision"; }

    OnCreated(params: any): void {
        if (!IsServer()) { return; }
        let movemode = params.movemode ?? 0;
        this._to_return = false;
        this._speed = params.movespeed / 25;
        this._origin = this.GetParent().GetOrigin();
        this._end_point = Vector(params.point_x, params.point_y, params.point_z);
        let mid_point = this._origin.Lerp(this._end_point, 0.9);
        if (movemode == 0){
            this._mid_point = RotatePosition(this._origin, QAngle(0, -30, 0), mid_point);
            this._mid_point2 = RotatePosition(this._origin, QAngle(0, 30, 0), mid_point);
        } else {
            this._mid_point2 = RotatePosition(this._origin, QAngle(0, -30, 0), mid_point);
            this._mid_point = RotatePosition(this._origin, QAngle(0, 30, 0), mid_point);
        }
        
        this._init_distance = (this._origin - this._end_point as Vector).Length2D();
        this._pre_speed = (params.movespeed / 25) / this._init_distance;
        this._value = 0;
        this.C_OnCreated(params);
        if (this.ApplyHorizontalMotionController() == false || this.ApplyVerticalMotionController() == false) {
            this.Destroy();
            return;
        }
    }

    C_OnCreated(params: any): void {
        let hUnit = this.GetParent();
        hUnit.summoned_damage = this.GetAbility().GetAbilityDamage();
        this.effect_fx = ParticleManager.CreateParticle(
            "particles/custom/arms/arms_50_shield.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
    }

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


    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.NOT_ON_MINIMAP]: true,
        };
    }

    OnDestroy(): void {
        if (!IsServer()) { return; }
        ParticleManager.DestroyParticle(this.effect_fx, true);
        let hParent = this.GetParent();
        hParent.StopSound("Hero_Hoodwink.Boomerang.Projectile");
        hParent.EmitSound("Hero_Hoodwink.Boomerang.Return");
        UTIL_Remove(hParent);

    }


}

@registerModifier()
export class modifier_arms_51_surround_collision extends BaseModifier {

    IsHidden(): boolean { return true; }

    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.MULTIPLE;
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return; }
        let hAuraUnit = this.GetAuraOwner();
        ApplyCustomDamage({
            victim: this.GetParent(),
            attacker: this.GetCaster(),
            damage: hAuraUnit.summoned_damage,
            damage_type: DamageTypes.MAGICAL,
            ability: this.GetAbility(),
            element_type: ElementTypeEnum.wind
        });
    }

}