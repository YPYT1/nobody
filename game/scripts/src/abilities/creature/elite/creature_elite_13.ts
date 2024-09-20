
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_13	
 * 尸骨毒	往玩家区域丢一潭毒液，造成持续伤害（每秒伤害为玩家最大生命值10%）并减速15%。
 * 毒潭范围直径500码，施法距离1000码，持续5秒。
 */
@registerAbility()
export class creature_elite_13 extends BaseCreatureAbility {

    OnAbilityPhaseStart(): boolean {
        this.vPoint = this.GetCursorPosition();
        this._radius = 500;
        this._duration = 5;
        this.nPreviewFX = GameRules.WarningMarker.Circular(
            this._radius,
            this._cast_point,
            this.vPoint
        )
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx()

        CreateModifierThinker(
            this.hCaster,
            this,
            "modifier_creature_elite_13",
            {
                duration: 5,
            },
            this.vPoint,
            this.hCaster.GetTeam(),
            false
        )
    }
}

@registerModifier()
export class modifier_creature_elite_13 extends BaseModifier {

    radius: number;

    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return this.radius; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_creature_elite_13_aura"; }

    OnCreated(params: object): void {
        this.radius = 500;
        if (!IsServer()) { return }
        let cast_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_viper/viper_nethertoxin.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )

        ParticleManager.SetParticleControl(cast_fx, 1, Vector(this.radius, 1, 1))
        this.AddParticle(cast_fx, false, false, -1, false, false)
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.GetParent())
    }
}

@registerModifier()
export class modifier_creature_elite_13_aura extends BaseModifier {

    buff_key = "elite_13_aura";

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        GameRules.CustomAttribute.SetAttributeInKey(this.GetParent(), this.buff_key, {
            "MoveSpeed": {
                "BasePercent": -15
            }
        })
        this.OnIntervalThink()
        this.StartIntervalThink(1)


    }

    OnIntervalThink(): void {
        let damage = this.GetParent().GetMaxHealth() * 0.1;
        ApplyCustomDamage({
            victim: this.GetParent(),
            attacker: this.GetCaster(),
            ability: this.GetAbility(),
            damage: damage,
            damage_type: DamageTypes.PHYSICAL,
            miss_flag: 1,
        })
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CustomAttribute.DelAttributeInKey(this.GetParent(), this.buff_key)
    }
}