/** @noSelfInFile */
declare const thisEntity: CDOTA_BaseNPC;

Object.assign(getfenv(), {
    Spawn: (entityKeyValues: any) => {
        Spawn(entityKeyValues);
    },
});


export function Spawn(entityKeyValues: any) {
    if (!IsServer()) { return; }
    if (!thisEntity) { return; }
    new GuardianAI(thisEntity);
}

export class GuardianAI {

    me: CDOTA_BaseNPC;
    hoster: CDOTA_BaseNPC;

    time_count: number;

    constructor(hUnit: CDOTA_BaseNPC) {
        this.me = hUnit;
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
                this._MoveToHoster();
            }
        } else {
            this._MoveToHoster();
        }

        return 0.2;
    }

    _MoveToHoster() {
        let hoster_vect = this.hoster.GetAbsOrigin();
        let target_vect = Vector(hoster_vect.x + RandomInt(-400, 400), hoster_vect.y + RandomInt(-400, 400), hoster_vect.z);
        ExecuteOrderFromTable({
            UnitIndex: this.me.entindex(),
            OrderType: UnitOrder.MOVE_TO_POSITION,
            Position: target_vect
        });
    }

    _GetDistance() {
        return (this.me.GetAbsOrigin() - this.hoster.GetAbsOrigin() as Vector).Length2D();
    }
}