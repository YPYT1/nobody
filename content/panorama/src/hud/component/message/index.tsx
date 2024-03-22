import React from 'react';
import { CommonMessage } from './_common_msg';
// import { render, useGameEvent } from 'react-panorama-x';

// import { DamageFloatingHud } from './components/_damage_floating';


/** 消息容器 */
export const MessageContainer = () => {

    return (
        <Panel id='MessageContainer' className='full-screen' hittest={false} >
            <CommonMessage />
        </Panel>
    );
};

