
declare interface CustomGameEventDeclarations {

    CMsg_SendCommonMsgToPlayer: {
        data: {
            message: string;
            data?: object;
        };
    };

}
