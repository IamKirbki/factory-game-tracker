import { Model } from "@iamkirbki/database-handler-core";

export type RecipeProps = {
    id?: string;
    craft_time_seconds: number;
    machine_id: string;
}

export default class Recipe extends Model<RecipeProps> {
    constructor() {
        super();
        this.Configuration.table = "recipes";
    }
}