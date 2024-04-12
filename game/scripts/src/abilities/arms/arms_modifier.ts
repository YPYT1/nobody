import { BaseModifier } from "../../utils/dota_ts_adapter";

/**
 * DOT类
 */
export class ArmsModifier_DOT extends BaseModifier {

    dot_damage: number
    dot_interval: number
    dot_element: ElementTypeEnum

    total_damage: number;

    parent: CDOTA_BaseNPC;
    caster: CDOTA_BaseNPC;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.dot_element = params.dot_element;
        this.OnRefresh(params)
        
        this.C_OnCreated(params);
    }

    OnRefresh(params: any): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.parent = this.GetParent();
        this.dot_damage = params.dot_damage;
        this.dot_interval = params.dot_interval;
        this.total_damage = this.dot_damage * (this.dot_interval / 1) * this.GetDuration();
        this.StartIntervalThink(this.dot_interval)
    }

    C_OnCreated(params: any): void { }

    OnIntervalThink(): void {

        ApplyCustomDamage({
            victim: this.parent,
            attacker: this.caster,
            damage: this.dot_damage,
            damage_type: DamageTypes.MAGICAL,
            ability: this.GetAbility(),
            element_type: this.dot_element
        });
        this.total_damage -= this.dot_damage
        print("last damage", this.total_damage)
    }

    /** 引爆DOT,直接造成剩余DOT伤害 */
    Detonate() {

    }
}