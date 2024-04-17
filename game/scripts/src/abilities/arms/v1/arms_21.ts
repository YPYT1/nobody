import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 替身	
 * "受到伤害时，英雄会进入隐身%buff_duration%秒并无视碰撞体积，
 * 在原地留下一个替身稻草人在%unit_duration%秒后爆炸造成%aoe_radius%范围伤害。（稻草人携带嘲讽）
伤害公式：%DamageFormula%"
 */
@registerAbility()
export class arms_21 extends BaseArmsAbility {

    _OnUpdateKeyValue(): void {
        this.AffectedAdd()
    }

    AffectedEffectStart(event: ModifierAttackEvent): void {
        let vLoc = this.caster.GetAbsOrigin();
        let time_duration = this.GetSpecialValueFor("time_duration")
        let buff_duration = this.GetSpecialValueFor("buff_duration")
        this.caster.AddNewModifier(this.caster, this, "modifier_arms_21_invisible", {
            duration: buff_duration
        })

        // 创建一个召唤物 summoned_scarecrow
        let summoned_unit = GameRules.SummonedSystem.CreatedUnit(
            "summoned_scarecrow",
            vLoc,
            this.caster,
            time_duration + 0.1,
            false
        )
        // let summoned_unit = CreateUnitByName("summoned_scarecrow", vLoc, false, this.caster, this.caster, this.team);
        summoned_unit.AddNewModifier(this.caster, this, "modifier_arms_21_summoned", {
            duration: time_duration
        })
    }
}

@registerModifier()
export class modifier_arms_21 extends BaseArmsModifier {

}

@registerModifier()
export class modifier_arms_21_summoned extends BaseModifier {

    aoe_radius: number;
    parent: CDOTA_BaseNPC;
    caster: CDOTA_BaseNPC;
    ability_damage: number;
    ability: CDOTABaseAbility;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();
        this.ability_damage = this.GetAbility().GetAbilityDamage();
        this.aoe_radius = this.GetAbility().GetSpecialValueFor("aoe_radius");
        this.OnIntervalThink();
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        EmitSoundOn("Hero_Axe.Berserkers_Call", this.parent);
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_axe/axe_beserkers_call_owner.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.parent
        );
        ParticleManager.SetParticleControlEnt(
            effect_fx,
            1,
            this.parent,
            ParticleAttachment.POINT_FOLLOW,
            "attach_hitloc",
            Vector(0, 0, 0),
            true
        );
        ParticleManager.ReleaseParticleIndex(effect_fx);

        let enemies = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            this.parent.GetAbsOrigin(),
            null,
            this.aoe_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )

        for (let enemy of enemies) {
            enemy.AddNewModifier(this.parent, this.GetAbility(), "modifier_debuff_taunt", {
                duration: 1
            })
        }
    }

    OnRemoved(death: boolean): void {
        if (!IsServer()) { return }
        if (this.GetAbility() == null) { return }
        let vPos = this.GetParent().GetAbsOrigin()

        // 爆炸
        let cast_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_techies/techies_land_mine_explode.vpcf",
            ParticleAttachment.WORLDORIGIN,
            null
        )
        ParticleManager.SetParticleControl(cast_fx, 0, vPos);
        ParticleManager.SetParticleControl(cast_fx, 1, Vector(0, 0, this.aoe_radius));
        ParticleManager.ReleaseParticleIndex(cast_fx);


        let enemies = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            vPos,
            null,
            this.aoe_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        for (let enemy of enemies) {
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: this.ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this.ability,
                element_type: ElementTypeEnum.fire,
            })
        }
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.MIN_HEALTH
        ]
    }

    GetMinHealth(): number {
        return 200
    }


}

@registerModifier()
export class modifier_arms_21_invisible extends BaseModifier {

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.INVISIBLE]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
        }
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.INVISIBILITY_LEVEL,
        ]
    }

    GetModifierInvisibilityLevel(): number {
        return 5
    }


}