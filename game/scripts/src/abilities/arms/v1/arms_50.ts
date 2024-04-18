import { modifier_motion_bezier, modifier_motion_surround } from "../../../modifier/modifier_motion";
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 盾击	"丢出一个盾，围绕英雄一圈后回到手里，
对触碰到的敌人造成单体伤害。
（盾飞行时间：2s）
CD：3秒
伤害系数：护甲值500%·风元素伤害"

 */
@registerAbility()
export class arms_50 extends BaseArmsAbility {


    _OnUpdateKeyValue(): void {
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        // 参考小松鼠
        this.ability_damage = this.GetAbilityDamage();
        let hUnit = GameRules.SummonedSystem.CreateBullet(this.caster.GetOrigin(), this.caster);
        let qangle = this.caster.GetAngles().y;
        hUnit.AddNewModifier(this.caster, this, "modifier_arms_50_surround", {
            duration: 2.2,
            surround_distance: 10,
            surround_qangle: qangle + 180,
            surround_speed: 900,
            surround_entity: this.caster.entindex(),
        });
    }
}

@registerModifier()
export class modifier_arms_50 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_50_surround extends modifier_motion_surround {

    state: number;
    effect_fx: ParticleID;

    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return 128; }
    IsAuraActiveOnDeath() { return false; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_arms_50_surround_collision"; }

    C_OnCreated(params: any): void {
        let hUnit = this.GetParent();
        hUnit.summoned_damage = this.GetAbility().GetAbilityDamage();
        this.state = 0;
        this.effect_fx = ParticleManager.CreateParticle(
            "particles/custom/arms/arms_50_shield.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
        this.GetParent().EmitSound("Hero_Hoodwink.Boomerang.Projectile");
        this.StartIntervalThink(0.01)
    }

    OnIntervalThink(): void {
        this.state += 1;
        if (this.state == 1) {
            this.final_distance = 500;
            this.StartIntervalThink(1)
        } else if (this.state == 2) {
            this.final_distance = 1
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return; }
        ParticleManager.DestroyParticle(this.effect_fx, true)
        let hParent = this.GetParent();
        hParent.StopSound("Hero_Hoodwink.Boomerang.Projectile");
        hParent.EmitSound("Hero_Hoodwink.Boomerang.Return");
        UTIL_Remove(hParent);
    }
}

@registerModifier()
export class modifier_arms_50_surround_collision extends BaseModifier {

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