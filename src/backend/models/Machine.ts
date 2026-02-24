import { Model } from "@iamkirbki/database-handler-core";

export type MachineProps = {
    id?: string;
    name: string;
    multiplier: number;
    image: string;
}

export default class Machine extends Model<MachineProps> {
    constructor() {
        super();
        this.Configuration.table = "machines";
    }
}