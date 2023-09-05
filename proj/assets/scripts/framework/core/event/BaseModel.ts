import OnlyEventComponent from "../../componects/OnlyEventComponent";

export class BaseModel<T> extends OnlyEventComponent {

    protected data: T;

    public getData(): T { return this.data; }
    public setData(value: T | any) { this.data = value; }

    constructor() {
        super();
    }
}