import { Model } from "@iamkirbki/database-handler-core";

export type ItemProps = {
  id: string;
  name: string;
  value: number;
}

export default class Item extends Model<ItemProps> {
    constructor() {
        super();
        this.Configuration.table = "machines";
    }
}