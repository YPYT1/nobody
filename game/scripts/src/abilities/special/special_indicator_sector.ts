import { BaseAbility, BaseModifier, registerAbility, registerModifier } from '../../utils/dota_ts_adapter';

@registerAbility()
export class special_indicator_sector extends BaseAbility {
    warning_fx: ParticleID;
    angle: number;
    distance: number;

    OnAbilityPhaseStart(): boolean {
        this.angle = 30;
        this.distance = 1200;
        const cast_point = this.GetCastPoint();
        const hCaster = this.GetCaster();
        const vCaster = hCaster.GetAbsOrigin();
        const vTarget = (vCaster + hCaster.GetForwardVector() * this.distance) as Vector;
        this.warning_fx = GameRules.WarningMarker.Sector(
            this.GetCaster(),
            vCaster,
            vTarget,
            this.angle,
            this.distance,
            cast_point,
            Vector(255, 0, 0)
        );
        return true;
    }

    OnAbilityPhaseInterrupted() {
        this.DestroyWarningFx();
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        const hCaster = this.GetCaster();
        const vCaster = hCaster.GetAbsOrigin();
        const vTarget = (vCaster + hCaster.GetForwardVector() * this.distance) as Vector;
        const hUnits = Custom_FindUnitsInSector(
            DotaTeam.GOODGUYS,
            vCaster,
            vTarget,
            this.angle,
            this.distance,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY
        );

        for (const hUnit of hUnits) {
            hUnit.AddNewModifier(hCaster, this, 'modifier_special_indicator_sector', { duration: 3 });
        }
    }

    DestroyWarningFx() {
        if (this.warning_fx) {
            ParticleManager.DestroyParticle(this.warning_fx, true);
            this.warning_fx = null;
        }
    }
}

@registerModifier()
export class modifier_special_indicator_sector extends BaseModifier {
    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.GetParent().SetRenderColor(255, 0, 0);
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        this.GetParent().SetRenderColor(255, 255, 255);
    }
}
