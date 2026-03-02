import { Model } from "@iamkirbki/database-handler-core";
import RecipeInput from "./RecipeInput";
import RecipeOutput from "./RecipeOutput";
import Item from "./Item";

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

    InputOutputs() {
        return this.hasMany(new Item(), "id", "item_id", "input_items.items", "input_items");
    }

    RecipeOutputs() {
        return this.hasMany(new RecipeOutput(), "recipe_id", "id");
    }

    OutputItems() {
        return this.hasMany(new Item(), "id", "item_id", "output_items.items", "output_items");
    }
}