import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";

/**
 * 攻击1名敌人，
造成攻击力100%的伤害，并回复5点蓝量
间隔基于自身攻击速度,
 */
@registerAbility()
export class drow_1 extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_1"
    }

}

@registerModifier()
export class modifier_drow_1 extends BaseModifier {

    caster: CDOTA_BaseNPC;
    team: DotaTeam;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.team = this.caster.GetTeamNumber();
        this.UpdateSpecialValue();
        this.OnIntervalThink()
        this.StartIntervalThink(0.03)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        this.UpdateSpecialValue()
    }

    UpdateSpecialValue() {}

    OnIntervalThink(): void {
        if (this.caster.AttackReady()) {
            let attackrange = this.caster.Script_GetAttackRange() + 64;
            let enemies = FindUnitsInRadius(
                this.team,
                this.caster.GetAbsOrigin(),
                null,
                attackrange,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO + UnitTargetType.BASIC,
                UnitTargetFlags.NONE,
                FindOrder.CLOSEST,
                false
            )
            if (enemies.length <= 0) { return }
            let hTarget = enemies[0];
            // this.caster.in_process_attack = true;
            this.caster.PerformAttack(
                hTarget,
                true, // useCastAttackOrb
                true, // processProcs
                false, // skipCooldown
                false, // ignoreInvis
                true, // useProjectile
                false, // fakeAttack
                false // neverMiss
            );
            // this.caster.in_process_attack = false;
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.PROCATTACK_FEEDBACK,
            ModifierFunction.PROJECTILE_NAME,
        ]
    }

    GetModifierProcAttack_Feedback(event: ModifierAttackEvent): number {
        this.caster.GiveMana(5);
        return 0
    }

}