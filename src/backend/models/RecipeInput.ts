import { Model } from "@iamkirbki/database-handler-core";

export type RecipeIOProps = {
    recipe_id: string;
    item_id: string;
    amount: number;
}

export default class RecipeInput extends Model<RecipeIOProps> {
    constructor() {
        super();
        this.Configuration.table = "recipe_inputs";
    }
}