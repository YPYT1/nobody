//使用此类的gamerules实例化时必须使用类名 使用参数
export class UIEventRegisterClass {
    /**
     * 禁用方法数组
     */
    ui_event_filter_func: string[] = [];
    /**
     * 
     * @param eventName 监听名
     * @param filter_func 禁止调用方法
     */
    constructor(eventName: string, open_debug = false) {
        CustomGameEventManager.RegisterListener(eventName, (_, event) => { this._UIEventRegister(event) });
        if (open_debug) {
            GameRules.Debug.RegisterDebug(eventName)
        }
    }

    _UIEventRegister(event: any) {
        let player_id = event.PlayerID as PlayerID;
        let event_name = event.event_name as string;
        let params = event.params ?? {};
        // 前端禁用方法
        // print(this.constructor.name, event_name)
        if (GameRules[this.constructor.name][event_name]) {
            GameRules[this.constructor.name][event_name](player_id, params);
        }
    }

    StopMove(hUnit: CDOTA_BaseNPC) {
        // print("StopMove")
        hUnit.AddNewModifier(hUnit, null, "modifier_basic_move", {
            "UP": 0,
            "DOWN": 0,
            "LEFT": 0,
            "RIGHT": 0
        })
        ExecuteOrderFromTable({
            UnitIndex: hUnit.entindex(),
            OrderType: UnitOrder.STOP,
            Queue: false,
        })
    }
    
    Debug(cmd: string, args: string[], player_id: PlayerID) {

    }
}