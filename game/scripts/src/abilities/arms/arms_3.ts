import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";

@registerAbility()
export class arms_3 extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_arms_3"
    }
}

@registerModifier()
export class modifier_arms_3 extends BaseModifier {

    duraton: number;
    caster: CDOTA_BaseNPC;
    ability: CDOTABaseAbility;
    ability_range:number;
    ability_damage: number;

    OnCreated(params: object): void {
        this.OnRefresh(params)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        this.ability = this.GetAbility();
        this.caster = this.GetCaster();
        this.ability_range = 600;
        this.duraton = 3;
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
            this.AbilityEffect(enemies);
        }
    }

    AbilityEffect(hUnitList: CDOTA_BaseNPC[]) {
        this.ability_damage = this.caster.GetAverageTrueAttackDamage(null) * 2.5;
        let hTarget = hUnitList[0];
        let fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_zuus/zuus_arc_lightning.vpcf",
            ParticleAttachment.POINT,
            this.caster
        );
        ParticleManager.SetParticleControlEnt(fx, 1, hTarget, ParticleAttachment.POINT, "attach_hitloc", Vector(0, 0, 0), false);
        ParticleManager.ReleaseParticleIndex(fx);

        ApplyCustomDamage({
            victim: hTarget,
            attacker: this.caster,
            damage: this.ability_damage,
            damage_type: DamageTypes.MAGICAL,
            ability: this.GetAbility(),
            element_type: "thunder",
        })
    }
}