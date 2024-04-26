import 'panorama-polyfill-x/lib/console';
import 'panorama-polyfill-x/lib/timers';

import { render } from 'react-panorama-x';

import { MoveControll } from './component/move_control/move_control';
import { MessageContainer } from './component/message';
import { ResourceComponent } from './component/resource/resource';
import { CenterStatsContainer } from './component/center_stats/_center_stats';
import { ChapterSelect } from './component/chapter_select';




const Test = () => {
    return (
        <>
            <CenterStatsContainer />
            <MoveControll />
            <MessageContainer />
            <ResourceComponent />

            <ChapterSelect />
        </>
    )
};

render(<Test />, $.GetContextPanel());

console.log(`Hello, world!`);
