import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


@registerAbility()
export class arms_3 extends BaseArmsAbility {

    aoe_radius: number;

    InitCustomAbilityData(): void {
        this.RegisterEvent(["OnArmsStart"])
    }

    
    OnArmsStart(): void {
        this.ability_damage = this.GetAbilityDamage();
        this.aoe_radius = this.GetSpecialValueFor("skv_aoe_radius");
        print("skv_aoe_radius", this.GetAbilityName(), this.aoe_radius)
        // const vOrigin = this.caster.GetOrigin();
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_phantom_assassin/phantom_assassin_shard_fan_of_knives.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.caster
        )
        // ParticleManager.SetParticleControl(effect_fx, 1, Vector(this.aoe_radius, this.aoe_radius, this.aoe_radius));
        ParticleManager.ReleaseParticleIndex(effect_fx)

        // particles/units/heroes/hero_phantom_assassin/phantom_assassin_shard_fan_of_knives.vpcf
    }

}
@registerModifier()
export class modifier_arms_3 extends BaseArmsModifier {}
/**
 * 灵魂交易
 * 每%arms_cd%秒损失%losing_soul%灵魂，
 * 替换该技能时获取已损失灵魂的%income_mul%倍收益。
 */
// @registerModifier()
// export class modifier_arms_3 extends BaseArmsModifier {

//     losing_soul: number;
//     lost_amount: number;
//     income_mul: number;

//     IsHidden(): boolean { return false }

//     C_OnCreated(params: any): void {
//         this.lost_amount = 0;
//         this.losing_soul = this.ability.GetSpecialValueFor("losing_soul")
//         this.income_mul = this.ability.GetSpecialValueFor("income_mul")
//         this.StartIntervalThink(1)
//     }

//     OnIntervalThink(): void {
//         let res = GameRules.ResourceSystem.ModifyResource(this.player_id, {
//             "Soul": -1 * this.losing_soul
//         })
//         if (res.status) {
//             this.lost_amount += this.losing_soul
//             this.SetStackCount(this.lost_amount)
//         }
//     }

//     _OnRemovedAfter(): void {
//         GameRules.ResourceSystem.ModifyResource(this.player_id, {
//             "Soul": this.lost_amount * this.income_mul
//         })
//     }
// }
