import { BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_3a, modifier_drow_3a, modifier_drow_3a_summoned, modifier_drow_3a_summoned_collision } from "./drow_3a";


/**
 * 32	冰雹	"风暴环绕技能赋予冰元素效果，伤害变为冰元素伤害。
风暴数量增加%bonus_count%个"
33	暴雪	"使用风暴环绕技能之后，会记录造成的实际伤害值，并在风暴持续结束时释放一阵暴雪，暴雪的伤害为记录的伤害值的100%。
记录上限为英雄攻击力3000%/4500%/6000%。
爆炸范围：自身直径750码。"
 */
@registerAbility()
export class drow_3a_b extends drow_3a {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_3a_b"
    }

}

@registerModifier()
export class modifier_drow_3a_b extends modifier_drow_3a {

    surround_mdf = "modifier_drow_3a_b_summoned";

    UpdataSpecialValue(): void {
        this.bonus_count = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "32", 'bonus_count')
    }

    ExtraEffect(): void {
        let bx_state = (this.caster.hero_talent["33"] ?? 0) > 0;
        if (bx_state) {
            this.caster.RemoveModifierByName("modifier_drow_3a_b_storage")
            this.caster.AddNewModifier(this.caster, this.ability, "modifier_drow_3a_b_storage", {
                duration: this.surround_duration + 0.1,
            })
        }
    }
}

@registerModifier()
export class modifier_drow_3a_b_summoned extends modifier_drow_3a_summoned {

    ModifierAura = "modifier_drow_3a_b_summoned_collision";

}

@registerModifier()
export class modifier_drow_3a_b_summoned_collision extends modifier_drow_3a_summoned_collision {

    storage_buff: modifier_drow_3a_b_storage;

    OnCreated_Extends(): void {
        this.damage_type = DamageTypes.MAGICAL;
        this.element_type = ElementTypes.ICE
        this.storage_buff = this.caster.FindModifierByName("modifier_drow_3a_b_storage") as modifier_drow_3a_b_storage;
    }

    OnIntervalThink(): void {
        ApplyCustomDamage({
            victim: this.GetParent(),
            attacker: this.caster,
            damage: this.ability_damage,
            damage_type: this.damage_type,
            ability: this.ability,
            element_type: this.element_type,
            is_primary: true,
        })
        if (this.storage_buff) {
            this.storage_buff.DoAction({ value: this.ability_damage })
        }
    }
}

@registerModifier()
export class modifier_drow_3a_b_storage extends BaseModifier {

    bx_record_dmg: number;
    bx_record_pct: number;
    bx_limit_pct: number;
    bx_radius: number;

    // IsHidden(): boolean {
    //     return true
    // }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        let hCaster = this.GetCaster()
        this.bx_record_dmg = 0;
        this.bx_record_pct = GameRules.HeroTalentSystem.GetTalentKvOfUnit(hCaster, 'drow_ranger', '33', "record_pct")
        this.bx_limit_pct = GameRules.HeroTalentSystem.GetTalentKvOfUnit(hCaster, 'drow_ranger', '33', 'limit_pct')
        this.bx_radius = GameRules.HeroTalentSystem.GetTalentKvOfUnit(hCaster, 'drow_ranger', '33', 'radius')
    }


    DoAction(params: PlayEffectProps) {
        this.bx_record_dmg += params.value * this.bx_record_pct * 0.01;
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        let hCaster = this.GetCaster();
        let hAbility = this.GetAbility();
        if (hCaster == null || hAbility == null) { return }
        let cast_fx = ParticleManager.CreateParticle(
            "particles/econ/items/lich/frozen_chains_ti6/lich_frozenchains_frostnova.vpcf",
            ParticleAttachment.POINT,
            hCaster
        )

        let ability_damage = math.min(hCaster.GetAverageTrueAttackDamage(null) * this.bx_limit_pct * 0.01, this.bx_record_dmg);
        print("ability_damage", ability_damage)
        let enemies = FindUnitsInRadius(
            hCaster.GetTeam(),
            hCaster.GetAbsOrigin(),
            null,
            this.bx_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        for (let enemy of enemies) {
            ApplyCustomDamage({
                victim: enemy,
                attacker: hCaster,
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: hAbility,
                element_type: ElementTypes.ICE,
                // is_primary: true,
            })

        }
    }
}