/** @noSelfInFile */
declare const thisEntity: CDOTA_BaseNPC;

Object.assign(getfenv(), {
    Spawn: (entityKeyValues: any) => { Spawn(entityKeyValues); },
});


export function Spawn(entityKeyValues: any) {
    if (!IsServer()) { return; }
    if (!thisEntity) { return; }
    new GuardianAI(thisEntity);
}

export class GuardianAI {

    team: DotaTeam;
    me: CDOTA_BaseNPC;
    hoster: CDOTA_BaseNPC;

    time_count: number;

    constructor(hUnit: CDOTA_BaseNPC) {
        this.me = hUnit;
        this.team = hUnit.GetTeamNumber();
        this.hoster = PlayerResource.GetSelectedHeroEntity(hUnit.GetPlayerOwnerID());;
        this.time_count = 0;
        this.me.SetThink("OnBaseThink", this, "OnBaseThink", 0);
    }

    OnBaseThink(): number {
        let distance = this._GetDistance();
        if (distance < 600) {
            if (this.time_count < 7) {
                this.time_count++;
            } else {
                this.time_count = 0;
                return this._MoveToHoster()
            }
        } else {
            return this._MoveToHoster()
        }

        return 0.2;
    }

    _MoveToHoster() {
        let hoster_vect = this.hoster.GetAbsOrigin();
        let target_vect: Vector;
        let enemies = FindUnitsInRadius(
            this.team,
            hoster_vect,
            null,
            1000,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        if (enemies.length > 0) {
            target_vect = enemies[0].GetAbsOrigin() + Vector(RandomInt(-300, 300), RandomInt(-300, 300), 0) as Vector
        } else {
            target_vect = Vector(hoster_vect.x + RandomInt(-400, 400), hoster_vect.y + RandomInt(-400, 400), hoster_vect.z);
        }

        ExecuteOrderFromTable({
            UnitIndex: this.me.entindex(),
            OrderType: UnitOrder.MOVE_TO_POSITION,
            Position: target_vect
        });

        // print("distance", (this.me.GetAbsOrigin() - target_vect as Vector).Length2D())
        return math.min(1, (this.me.GetAbsOrigin() - target_vect as Vector).Length2D() / 700)
    }

    _GetDistance() {
        return (this.me.GetAbsOrigin() - this.hoster.GetAbsOrigin() as Vector).Length2D();
    }
}