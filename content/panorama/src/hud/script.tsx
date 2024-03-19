import 'panorama-polyfill-x/lib/console';
import 'panorama-polyfill-x/lib/timers';

import { useMemo, type FC } from 'react';
import { render } from 'react-panorama-x';
import { useXNetTableKey } from '../hooks/useXNetTable';
import { MoveControll } from './component/move_control';


 

const Test: FC = () => {
    return (
        <>
            <MoveControll />
        </>
    )
};

render(<Test />, $.GetContextPanel());

console.log(`Hello, world!`);
