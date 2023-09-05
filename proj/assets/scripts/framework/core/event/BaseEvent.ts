export class BaseEvent<T> {

    public complete: Function;
    public name: string;
    public data: T;
    
    constructor (name: string, data:T) {
        this.name = name;
        this.data = data;
    }
}
