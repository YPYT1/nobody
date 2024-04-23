import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 影压	"自身范围直径700码随机位置直径200码释放
毁灭阴影。3秒内被影压再次击中，伤害增加25%。
特效：sf1技能
cd：2秒
伤害系数：攻击力200%·暗元素伤害
作用范围：直径200码"

 */
@registerAbility()
export class arms_58 extends BaseArmsAbility {

    combo_duration: number;
    combo_bonus: number;

    _OnUpdateKeyValue(): void {
        this.combo_bonus = this.GetSpecialValueFor("combo_bonus") * 0.01;
        this.combo_duration = this.GetSpecialValueFor("combo_duration");
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart() {
        let ability_damage = this.GetAbilityDamage();
        let aoe_radius = this.GetSpecialValueFor("aoe_radius");
        let vPoint = this.FindRandomEnemyVect();

        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_nevermore/nevermore_shadowraze.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            null
        );
        ParticleManager.SetParticleControl(effect_fx, 0, vPoint);
        ParticleManager.ReleaseParticleIndex(effect_fx);
        EmitSoundOn("Hero_Nevermore.Shadowraze", this.caster);

        let enemies = FindUnitsInRadius(
            this.team,
            vPoint,
            null,
            aoe_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        for (let enemy of enemies) {
            let stack = enemy.GetModifierStackCount("modifier_arms_58_combo", this.caster);
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: ability_damage * (1 + stack * 0.25),
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypeEnum.dark
            });

            enemy.AddNewModifier(this.caster, this, "modifier_arms_58_combo", {
                duration: this.combo_duration
            })
        }
    }
}

@registerModifier()
export class modifier_arms_58 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_58_combo extends BaseModifier {

    OnCreated(params: object): void {
        this.SetStackCount(1)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        this.IncrementStackCount()
    }

}