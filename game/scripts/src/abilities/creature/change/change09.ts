//change_08.ts
/**
 * 
 */

import { BaseAbility, registerAbility } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";
import { change_07 } from "./change07";

@registerAbility()
export class change_08 extends BaseCreatureAbility{

    Precache(context: CScriptPrecacheContext): void {
        // PrecacheResource:[]
    }
    OnSpellStart(): void {
        this.caster = this.GetCaster();
        // this.target = this.GetCursorTarget();
    }
}