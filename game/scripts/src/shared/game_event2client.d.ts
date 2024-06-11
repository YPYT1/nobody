
interface MessageObjectDataProps {
    [key: string]: string | number
}

declare interface CustomGameEventDeclarations {

    CMsg_SendCommonMsgToPlayer: {
        data: {
            message: string;
            data?: MessageObjectDataProps;
        };
    };

    CMsg_SendErrorMsgToPlayer: {
        data: {
            message: string;
            data?: MessageObjectDataProps;
        };
    };


    CMsg_PopupNumbersToClients: {
        data: {
            // 值
            value: number,
            // 类型[伤害,治疗]
            // type: CGDamagePopups,
            // 单位实体
            entity: number,
            // 暴击
            is_crit: number,
            // 元素
            element_type?: CElementType;
            // 攻击/承伤
            IsAttack: 0 | 1;
        };
    }

    CMsg_PopupResourceNumber: {
        data: {
            resource_type: PlayerResourceTyps;
            amount: number;
        };
    };

    ResourceSystem_SendPlayerResources: {
        data: { [key in PlayerResourceTyps]: number }
    }
}
