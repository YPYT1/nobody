import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";

/**
 * 【唤雷】：召唤雷电对范围内单个敌人进行电疗。
 * 技能cd：3s
   技能范围：800码
   技能伤害：500%英雄攻击力·雷元素·伤害
   技能特效：宙斯大招
 */
@registerAbility()
export class arms_t1_1 extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_arms_t1_1"
    }
    
}

@registerModifier()
export class modifier_arms_t1_1 extends BaseModifier {

    ability_range: number;
    caster: CDOTA_BaseNPC;
    ability: CDOTABaseAbility;

    OnCreated(params: object): void {
        this.OnRefresh(params)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        print("OnRefresh")
        this.ability = this.GetAbility();
        this.caster = this.GetCaster();
        this.ability_range = 600;
        this.StartIntervalThink(0.1)
    }

    OnIntervalThink(): void {
        let hCaster = this.GetCaster();
        if (hCaster.IsAlive() == false || this.ability == null) {
            this.StartIntervalThink(-1)
            return
        }

        // let ent = Entities.FindAllByClassnameWithin()
        let enemies = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            hCaster.GetAbsOrigin(),
            null,
            this.ability_range,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        if (enemies.length > 0 && this.GetAbility().IsCooldownReady()) {
            this.GetAbility().UseResources(false, false, false, true);
            this.AbilityEffect(enemies[0]);
        }
    }

    AbilityEffect(hUnit: CDOTA_BaseNPC) {
        let vTarget = hUnit.GetAbsOrigin()
        let fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_zuus/zuus_lightning_bolt.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            this.caster
        );
        ParticleManager.SetParticleControl( fx, 0, Vector(vTarget.x, vTarget.y, 4000) )
		ParticleManager.SetParticleControlEnt( fx, 1, hUnit, ParticleAttachment.POINT_FOLLOW, "attach_hitloc", vTarget, true )
		ParticleManager.ReleaseParticleIndex( fx )


        // ParticleManager.SetParticleControl(fx, 0, vTarget);
        // ParticleManager.SetParticleControl(fx, 1, );
        // ParticleManager.ReleaseParticleIndex(fx);
        EmitSoundOnLocationWithCaster(vTarget, "Hero_Zuus.LightningBolt", this.caster);

        let ability_damage = this.caster.GetAverageTrueAttackDamage(null) * 5;
        ApplyCustomDamage({
            victim: hUnit,
            attacker: this.caster,
            damage: ability_damage,
            damage_type: DamageTypes.MAGICAL,
            ability: this.GetAbility(),
            element_type: "thunder",
        })

        GameRules.BuffManager.AddGeneralDebuff(this.caster, hUnit, DebuffTypes.stunned, 0.1)
        // hUnit.AddNewModifier()
    }

}