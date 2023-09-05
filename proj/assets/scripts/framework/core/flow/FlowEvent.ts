import { BaseEvent } from "../event/BaseEvent";

export type FlowEventConfig = {
    // set to true to autocomplete a FlowEvent, otherwise you'll need to manually call event.;complete() at some point.
    autoComplete?: boolean;

    // delays the dispatching of a triggered event
    delay?: number,

    // // currently unsupported until Ben figures out what he wants to do with this.
    // targetTime?: number;

    // // these flags are the one/ones that will trigger your custom flow event when they complete
    // triggeringFlags?: BinaryArray | number,

    // // set to true if you want a flow event to trigger if/when the flow is killed.
    // triggerOnKill?: boolean
};
// export interface IFlowEvent {
//     complete: Function,
//     data: any,
//     name: string,
// }

export class FlowEvent<T> extends BaseEvent<T> {

    public autoComplete: boolean = false;
    public delay: number;

    constructor(name: string, data?: T, config?: FlowEventConfig){
        super(name, data);

        if (config) {
            this.autoComplete = config.autoComplete as any;
            this.delay = config.delay as any;
        } else {
            this.delay = 0;
        }
    }
}
