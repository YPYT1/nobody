import 'panorama-polyfill-x/lib/console';
import 'panorama-polyfill-x/lib/timers';

import { render } from 'react-panorama-x';

import { MoveControll } from './component/move_control';
import { MessageContainer } from './component/message';
import { ResourceComponent } from './component/resource/resource';


 

const Test = () => {
    return (
        <>
            <MoveControll />
            <MessageContainer />
            <ResourceComponent />
        </>
    )
};

render(<Test />, $.GetContextPanel());

console.log(`Hello, world!`);
