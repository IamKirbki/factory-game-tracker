import { Model } from "@iamkirbki/database-handler-core";
import { RecipeIOProps } from "./RecipeInput";

export default class RecipeOutput extends Model<RecipeIOProps> {
    constructor() {
        super();
        this.Configuration.table = "recipe_outputs";
    }
}