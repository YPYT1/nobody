import 'panorama-polyfill-x/lib/console';
import 'panorama-polyfill-x/lib/timers';

import { render } from 'react-panorama-x';

import { MoveControll } from './component/move_control';
import { MessageContainer } from './component/message';


 

const Test = () => {
    return (
        <>
            <MoveControll />
            <MessageContainer />
        </>
    )
};

render(<Test />, $.GetContextPanel());

console.log(`Hello, world!`);
