import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

// prop_47	【不休尸王的钢盔】	复活时间减少15%，受到致死打击后还能继续存活6秒
@registerModifier()
export class modifier_shop_prop_47 extends BaseModifier {

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.caster.SetHealth(1)
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_skeletonking/wraith_king_ghosts_ambient.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
        this.AddParticle(effect_fx, false, false, -1, false, false);
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        this.caster.Kill(null, this.caster)
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MIN_HEALTH,
            ModifierFunction.DISABLE_HEALING,
        ]
    }

    GetDisableHealing(): 0 | 1 {
        return 1;
    }

    GetMinHealth(): number {
        return 1
    }

    GetStatusEffectName(): string {
        return "particles/status_fx/status_effect_wraithking_ghosts.vpcf";
    }

}