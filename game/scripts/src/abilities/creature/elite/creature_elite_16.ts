
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_16	射线	
 * 精英怪被动技能：死亡时，在死亡地点生成一个爆炸点，往两面生出长500码的射线并顺时针转圈，持续5秒。
 * （射线伤害值为玩家最大生命值20%，伤害间隔为1秒）
 */
@registerAbility()
export class creature_elite_16 extends BaseCreatureAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_creature_elite_16"
    }
}

@registerModifier()
export class modifier_creature_elite_16 extends BaseModifier {

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.ON_DEATH
        ]
    }

    OnDeath(event: ModifierInstanceEvent): void {
        if (event.unit == this.GetParent()) {
            CreateModifierThinker(
                event.unit,
                this.GetAbility(),
                "modifier_creature_elite_16_thinker",
                {
                    duration: 10
                },
                event.unit.GetAbsOrigin(),
                event.unit.GetTeam(),
                false
            )
        }
    }
}

@registerModifier()
export class modifier_creature_elite_16_thinker extends BaseModifier {

    line_fx1: ParticleID;
    line_fx2: ParticleID;

    line_pos1: Vector;
    line_pos2: Vector;
    origin: Vector;
    distance: number;
    interval: number;
    team: DotaTeam;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.distance = 500;
        this.origin = this.GetParent().GetAbsOrigin();
        this.origin.z += 10;
        this.team = this.GetParent().GetTeam();

        let base_pos = this.origin + Vector(500, 0, 0) as Vector

        this.line_pos1 = RotatePosition(this.origin, QAngle(0, RandomInt(0, 359), 0), base_pos);
        let line_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_muerta/muerta_parting_shot_tether.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(line_fx, 1, this.line_pos1)

        this.AddParticle(line_fx, false, false, -1, false, false);

        this.line_pos2 = RotatePosition(this.origin, QAngle(0, 180, 0), this.line_pos1);
        let line_fx2 = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_muerta/muerta_parting_shot_tether.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(line_fx2, 1, this.line_pos2)
        this.AddParticle(line_fx2, false, false, -1, false, false);

        this.line_fx1 = line_fx;
        this.line_fx2 = line_fx2;


        this.interval = GameRules.GetGameFrameTime();

        print("this.interval", this.interval)
        this.OnIntervalThink()
        this.StartIntervalThink(this.interval)
        // particles/units/heroes/hero_muerta/muerta_parting_shot_tether.vpcf
    }

    OnIntervalThink(): void {

        this.line_pos1 = RotatePosition(this.origin, QAngle(0, 25 * this.interval, 0), this.line_pos1);
        ParticleManager.SetParticleControl(this.line_fx1, 1, this.line_pos1)

        let enemies = FindUnitsInLine(
            this.team,
            this.origin,
            this.line_pos1,
            null,
            50,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE
        )

        this.line_pos2 = RotatePosition(this.origin, QAngle(0, 25 * this.interval, 0), this.line_pos2);
        ParticleManager.SetParticleControl(this.line_fx2, 1, this.line_pos2)

        let enemies2 = FindUnitsInLine(
            this.team,
            this.origin,
            this.line_pos2,
            null,
            50,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE
        )

        for (let enemy of enemies) {
            enemy.AddNewModifier(this.GetCaster(), this.GetAbility(), "modifier_creature_elite_16_dmg", {
                duration: 0.3
            })
        }

        for (let enemy of enemies2) {
            enemy.AddNewModifier(this.GetCaster(), this.GetAbility(), "modifier_creature_elite_16_dmg", {
                duration: 0.3
            })
        }
    }
}

@registerModifier()
export class modifier_creature_elite_16_dmg extends BaseModifier {

    IsHidden(): boolean {
        return true
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.OnIntervalThink()
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        const damage = this.GetParent().GetMaxHealth() * 0.2;
        ApplyCustomDamage({
            victim: this.GetParent(),
            attacker: this.GetCaster(),
            ability: null,
            damage: damage,
            damage_type: DamageTypes.PHYSICAL,
            miss_flag: 1,
        })
    }
}