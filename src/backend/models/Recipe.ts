import { Model } from "@iamkirbki/database-handler-core";
import RecipeInput from "./RecipeInput";
import RecipeOutput from "./RecipeOutput";

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

    RecipeInputs() {
        return this.hasMany(new RecipeInput(), "recipe_id", "id");
    }

    RecipeOutputs() {
        return this.hasMany(new RecipeOutput(), "recipe_id", "id");
    }
}