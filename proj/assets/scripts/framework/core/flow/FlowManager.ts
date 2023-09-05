import { BaseEvent } from "../event/BaseEvent";
import Flow from "./Flow";

export class FlowManager {
    static module: string = "【flow 流程管理】";
    module: string = null!;
    public Flow: typeof Flow = Flow;

    private flowsMap: Map<string, Flow[]> = new Map();

    public registerFlow(flow: Flow): void {
        if (this.flowsMap.get(flow.flowId)) {
            this.flowsMap.get(flow.flowId).push(flow);
        } else {
            this.flowsMap.set(flow.flowId, [flow]);
        }

        flow.start();
    }

    public killFlow(flowId: string): void {
        const flowsToKill: Flow[] = this.flowsMap.get(flowId);
        if (flowsToKill) {
            flowsToKill.reverse();

            flowsToKill.forEach(flow => {
                flow.kill();
            });
            this.flowsMap.clear();
        }
    }
   
    debug() {
        Log.d(`-------Flow流程快取資訊-------`);
        this.flowsMap.forEach((data, key) => {
            Log.d(key);
        });
    }
}