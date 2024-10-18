import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";

/**
 * 113	奥术分身	"召唤一个分身，分身只会模仿本体释放的技能，但只会造成25%的伤害
cd：80秒
持续时间：20秒"
114	冰语	分身获得冰元素之力，模仿冰元素技能时伤害额外提升25%，且提高50%的冰元素伤害
115	雷临	分身获得雷元素之力，模仿雷元素技能时伤害额外提升25%，且分身持续期间，所有技能冷却时间减少50%
116	火烬	分身获得火元素之力，模仿火元素技能时伤害额外提升75%
117	暗影	分身获得暗元素之力，模仿任意技能均结算为暗元素伤害。

 */
@registerAbility()
export class skywrath_5 extends BaseHeroAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_5"
    }
}

@registerModifier()
export class modifier_skywrath_5 extends BaseHeroModifier {

    duration: number;

    CloneUnit: CDOTA_BaseNPC;

    reduc_cd: number;
    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.team = this.caster.GetTeamNumber();
        this.ability = this.GetAbility() as BaseHeroAbility;
        this.ability_damage = 0;
        this.ability.IntrinsicMdf = this;
        this.reduc_cd = 0;
        // 初始化分身
        this.OnRefresh(params)
        this.StartIntervalThink(0.1)


        this.CloneUnit = CreateUnitByName(
            "npc_summoned_skywrath",
            this.caster.GetAbsOrigin(),
            false,
            this.caster,
            this.caster,
            this.team
        )
        this.CloneUnit.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_5_clone", {})

        this.caster.clone_unit = this.CloneUnit

    }


    UpdataAbilityValue(): void {
        this.duration = this.caster.GetTalentKv("113", "duration");
    }

    UpdataSpecialValue(): void {
        // rune_80	法爷#29	分身的基础cd减少20秒
        this.reduc_cd = this.caster.GetRuneKv("rune_80", "value")
    }

    OnIntervalThink(): void {
        if (this.CastingConditions()) {
            this.DoExecutedAbility();
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();
            this.CloneUnit.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_5_clone_show", {
                duration: 10,//this.duration
            })
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.COOLDOWN_REDUCTION_CONSTANT
        ]
    }

    GetModifierCooldownReduction_Constant(event: ModifierAbilityEvent): number {
        if (event.ability == this.GetAbility()) {
            return this.reduc_cd
        }
    }
    
    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.CloneUnit)
    }
}

@registerModifier()
export class modifier_skywrath_5_clone_show extends BaseModifier {

    IsHidden(): boolean {
        return true
    }
    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        this.caster = this.GetCaster();

        this.parent.SetOrigin(this.caster.GetAbsOrigin() + RandomVector(RandomInt(300, 600)) as Vector)
        this.GetParent().RemoveNoDraw();
    }


    OnDestroy(): void {
        if (!IsServer()) { return }
        let killed_fx = ParticleManager.CreateParticle(
            "particles/generic_gameplay/illusion_killed.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            null
        )
        ParticleManager.SetParticleControl(killed_fx, 0, this.GetParent().GetAbsOrigin())
        ParticleManager.ReleaseParticleIndex(killed_fx);

        this.parent.SetOrigin(Vector(0, 0, 0))
        this.GetParent().AddNoDraw();
    }


}
@registerModifier()
export class modifier_skywrath_5_clone extends BaseModifier {

    movespeed: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster()
        this.parent = this.GetParent();
        this.parent.AddNoDraw();
        // this.parent.clone_factor = this.caster.GetTalentKv("113", "image_dmg");
    }


    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.UNSELECTABLE]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.INVISIBLE]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MOVESPEED_BASE_OVERRIDE
        ]
    }

    GetModifierMoveSpeedOverride(): number {
        return this.GetCaster().GetBaseMoveSpeed()
    }
}