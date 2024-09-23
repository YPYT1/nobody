
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";


/**
 * creature_elite_9	极冰之路	
 * 引导1秒，向玩家方向铺出一条极冰之路，对玩家造成伤害（伤害值为玩家最大生命值20%）并减速50%，
 * 怪物在路径上行走会加速25%。路径长700码，宽200码。施法距离700码。
 */
@registerAbility()
export class creature_elite_9 extends BaseCreatureAbility {

    line_width:number
    line_distance:number
    OnAbilityPhaseStart(): boolean {
        // let hTarget = this.GetCursorTarget();
        this.vPoint = this.GetCursorPosition();
        this.line_width = this.GetSpecialValueFor("line_width")
        this.line_distance = this.GetSpecialValueFor("line_distance");
        this.nPreviewFX = GameRules.WarningMarker.Line(
            this.hCaster,
            this.line_width,
            this.hCaster.GetAbsOrigin(),
            this.vPoint,
            this.line_distance,
            this._cast_point
        )
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        // particles/units/heroes/hero_jakiro/jakiro_ice_path.vpcf
        let dir = (this.vPoint - this.hCaster.GetAbsOrigin() as Vector).Normalized();
        let vTarget = this.hCaster.GetAbsOrigin() + dir * this._duration as Vector;
        CreateModifierThinker(
            this.hCaster,
            this,
            "modifier_creature_elite_9_path",
            {
                duration: 5,
                x: vTarget.x,
                y: vTarget.y,
            },
            this.hCaster.GetAbsOrigin(),
            this.hCaster.GetTeam(),
            false
        )
    }
}

@registerModifier()
export class modifier_creature_elite_9_path extends BaseModifier {

    start: Vector;
    end: Vector;
    team: DotaTeam;

    line_width:number;
    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.line_width = this.GetAbility().GetSpecialValueFor("line_width")
        this.start = this.GetParent().GetAbsOrigin();
        this.end = Vector(params.x, params.y, this.start.z);
        this.team = this.GetCaster().GetTeam();
        let cast_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_jakiro/jakiro_ice_path.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(cast_fx, 1, this.end)
        ParticleManager.SetParticleControl(cast_fx, 2, Vector(0, 0, this.GetDuration()))
        this.AddParticle(cast_fx, false, false, -1, false, false)
        this.OnIntervalThink()
        this.StartIntervalThink(0.25)
    }

    OnIntervalThink(): void {
        let line_unit = FindUnitsInLine(
            this.GetParent().GetTeam(),
            this.start,
            this.end,
            null,
            this.line_width,
            UnitTargetTeam.BOTH,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE
        )
        for (let unit of line_unit) {
            if (unit.GetTeamNumber() == this.team) {
                // 加速
                unit.AddNewModifier(this.GetCaster(), this.GetAbility(), "modifier_creature_elite_9_buff", { duration: 1.5 })
            } else {
                // 伤害减速
                unit.AddNewModifier(this.GetCaster(), this.GetAbility(), "modifier_creature_elite_9_debuff", { duration: 1.5 })
            }
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.GetParent())
    }
}

@registerModifier()
export class modifier_creature_elite_9_buff extends BaseModifier {

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE
        ]
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return 25
    }
}

@registerModifier()
export class modifier_creature_elite_9_debuff extends BaseModifier {

    buff_key = "elite_9_debuff";

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        GameRules.CustomAttribute.SetAttributeInKey(this.GetParent(), this.buff_key, {
            "MoveSpeed": {
                "BasePercent": -50
            }
        })
        this.OnIntervalThink()
        // this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        let damage = this.GetParent().GetMaxHealth() * 0.2;
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