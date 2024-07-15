import { modifier_motion_surround } from "../../../../modifier/modifier_motion";
import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";

/**
 * 向空中射出10/12/14/17/20支箭，随机打击范围1000码以内敌人，每支箭制造成攻击力200%的伤害。
 */
@registerAbility()
export class drow_3b extends BaseHeroAbility {

    Precache(context: CScriptPrecacheContext): void {
        // particles/econ/items/mirana/mirana_persona/mirana_starstorm_moonray_arrow.vpcf
    }

    GetIntrinsicModifierName(): string {
        return "modifier_drow_3b"
    }
}

@registerModifier()
export class modifier_drow_3b extends BaseHeroModifier {

    radius: number;

    UpdataAbilityValue(): void {
        this.radius = 1000;
    }

    OnIntervalThink(): void {
        if (this.caster.IsAlive() && this.ability.IsCooldownReady() && this.caster.GetMana() >= this.ability.GetManaCost(-1)) {
            // print("this.r",this.radius)
            let enemies = FindUnitsInRadius(
                this.team,
                this.caster.GetAbsOrigin(),
                null,
                this.radius,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO + UnitTargetType.BASIC,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );
            if (enemies.length == 0) { return }
            this.ability.UseResources(true, true, true, true)
            this.PlayEffect({})
        }
    }

    PlayEffect(params: PlayEffectProps): void {
        let vPos = this.caster.GetAbsOrigin();

        let cast_fx = ParticleManager.CreateParticle(
            "particles/econ/items/mirana/mirana_persona/mirana_starstorm_moonray_arrow.vpcf",
            ParticleAttachment.POINT,
            this.caster,
        )
        ParticleManager.ReleaseParticleIndex(cast_fx)

        CreateModifierThinker(
            this.caster,
            this.ability,
            "modifier_drow_3b_thinker",
            {
                duration: 2
            },
            vPos,
            this.team,
            false
        )
    }
}

@registerModifier()
export class modifier_drow_3b_thinker extends BaseModifier {

    arrow_count: number;
    parent: CDOTA_BaseNPC;
    ability_damage: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.arrow_count = 12;
        this.ability_damage = this.GetCaster().GetAverageTrueAttackDamage(null);
        this.parent = this.GetParent();
        this.StartIntervalThink(0.5)
    }

    OnIntervalThink(): void {
        this.StartIntervalThink(-1);

        let arrow_fx = ParticleManager.CreateParticle(
            "particles/econ/items/mirana/mirana_persona/mirana_starstorm_moonray_arrows.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        ParticleManager.ReleaseParticleIndex(arrow_fx);
        
        let enemies = FindUnitsInRadius(
            this.GetCaster().GetTeam(),
            this.GetParent().GetAbsOrigin(),
            null,
            1000,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        if (enemies.length > 0) {
            let count = 0;
            let hCaster = this.GetCaster()
            let hAbility = this.GetAbility()
            let ability_damage = this.ability_damage
            //
            
            this.parent.SetContextThink("drow_3b", () => {
                let rand = RandomInt(0, enemies.length - 1);
                let target = enemies[rand]
                let cast_fx = ParticleManager.CreateParticle(
                    "particles/econ/items/mirana/mirana_persona/mirana_starstorm.vpcf",
                    ParticleAttachment.POINT,
                    target,
                )
                ParticleManager.ReleaseParticleIndex(cast_fx);

                // print("this.ability_damage ", this.ability_damage)
                target.SetContextThink(DoUniqueString("drow3_b_delay"), () => {
                    ApplyCustomDamage({
                        victim: target,
                        attacker: hCaster,
                        damage: ability_damage,
                        damage_type: DamageTypes.PHYSICAL,
                        ability: hAbility,
                        is_primary: true,
                        // special_effect: true,
                    });
                    return null
                }, 0.3)



                count += 1;
                if (count >= this.arrow_count) {
                    this.Destroy();
                    return null
                }
                return 0.1
            }, 0.1)

        } else {

        }


    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.GetParent())
    }
}