import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 召唤骷髅	"召唤一名骷髅，骷髅会跟随英雄攻击周围的敌方单位。
骷髅兵持续时间：40
骷髅兵攻击力：攻击力10%*暗元素伤害
骷髅兵攻击间隔：1.0
骷髅兵血量：自身最大生命值*（1+暗元素等级系数）*20%
骷髅兵护甲：3
骷髅兵移速：350
召唤上限：2
CD：15"

 */
@registerAbility()
export class arms_10 extends BaseArmsAbility {


    // InitCustomAbilityData(): void {
    //     this.RegisterEvent(["OnArmsInterval"])
    // }

    OnArmsInterval(): void {
        // this.ability_damage = this.GetAbilityDamage();
        // let summoned_duration = this.GetSpecialValueFor("summoned_duration")
        // let vLoc = this.caster.GetAbsOrigin() + RandomVector(200) as Vector;
        // let summoned_unit = GameRules.SummonedSystem.CreatedUnit(
        //     "summoned_skeleton1",
        //     vLoc,
        //     this.caster,
        //     summoned_duration
        // )
        // summoned_unit.AddNewModifier(this.caster, this, "modifier_arms_158_summoned", {})

    }


}

@registerModifier()
export class modifier_arms_10 extends BaseArmsModifier {

    aura_radius = 300;

    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return this.aura_radius; }
    IsAuraActiveOnDeath() { return false; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_modifier_arms_10_collision"; }

    C_OnCreated(params: any): void {
        print("FrameTime()", FrameTime())

        let raidus_px = ParticleManager.CreateParticle(
            "particles/ui_mouseactions/range_ring.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(raidus_px, 1, Vector(this.aura_radius, 1, 1))
        this.AddParticle(raidus_px, false, false, -1, false, false)
    }
}

@registerModifier()
export class modifier_modifier_arms_10_collision extends BaseModifier {

    caster: CDOTA_BaseNPC;
    pull_speed: number;
    hull_radius: number;
    rotate_speed: number;
    dt: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.hull_radius = this.GetCaster().GetHullRadius() + 80;
        print("hull_radius", this.hull_radius);
        this.pull_speed = 120;
        this.rotate_speed = 0.25
        this.dt = 0.03
        this.caster = this.GetCaster();
        this.StartIntervalThink(this.dt);
    }

    OnIntervalThink(): void {
        let vTarget = this.GetParent().GetOrigin() - this.caster.GetOrigin() as Vector;
        vTarget.z = 0;
        let distance = vTarget.Length2D();
        if (distance > this.hull_radius) {
            // 偏移
            // let targetL = distance - this.pull_speed * this.dt
            let dir = vTarget.Normalized();
            // let deg = math.atan2(dir.y, dir.x);
            // print("deg", deg);
            // let targetN = Vector(math.cos(deg + this.rotate_speed * this.dt), math.sin(deg + this.rotate_speed * this.dt), 0);
            let pos = this.GetParent().GetOrigin() - dir * this.dt * this.pull_speed as Vector
            FindClearSpaceForUnit(this.GetParent(), pos, false)
            // this.GetParent().SetAbsOrigin()
        } else {
            // 中心点
            FindClearSpaceForUnit(this.GetParent(), this.GetParent().GetOrigin(), false)
        }
    }
}