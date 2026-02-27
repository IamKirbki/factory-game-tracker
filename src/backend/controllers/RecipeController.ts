import { Model } from "@iamkirbki/database-handler-core";
import Recipe, { RecipeProps } from "../models/Recipe";
import Controller from "./Controller";
import { RecipeIOProps } from "../models/RecipeInput";
import RecipeInputController from "./RecipeInputController";
import { v4 as uuidv4 } from "uuid";
import RecipeOutputController from "./RecipeOutputController";
import ItemController from "./ItemController";

export type createRecipeProps = {
    id: string;
    name: string;
    machine_id: string;
    craft_time_seconds: number;
    inputs: RecipeIOProps[];
    outputs: RecipeIOProps[];
}

export default class RecipeController extends Controller<RecipeProps> {
    index(): Promise<Model<RecipeProps>[]> {
        const recipe = new Recipe();
        recipe.with("RecipeInputs").with('RecipeOutputs');
        return recipe.all();
    }

    async show(machineId: string | number): Promise<Model<RecipeProps>[]> {
        const recipe = new Recipe();
        recipe.with("RecipeInputs").with('RecipeOutputs');
        const recipes = await recipe.where({ machine_id: machineId }).all();

        await Promise.all(
            recipes.map(async (r) => {
                if (!Array.isArray(r.values.recipe_inputs)) {
                    r.values.recipe_inputs = [r.values.recipe_inputs];
                }
                r.values.recipe_inputs = await Promise.all(
                    r.values.recipe_inputs.map(async (input: RecipeIOProps) => {
                        const item = await ItemController.show(input.item_id);
                        return {
                            ...input,
                            item: item.values,
                        };
                    })
                );

                if (!Array.isArray(r.values.recipe_outputs)) {
                    r.values.recipe_outputs = [r.values.recipe_outputs];
                }
                r.values.recipe_outputs = await Promise.all(
                    r.values.recipe_outputs.map(async (output: RecipeIOProps) => {
                        const item = await ItemController.show(output.item_id);
                        return {
                            ...output,
                            item: item.values,
                        };
                    })
                );
            })
        );

        return recipes;
    }

    edit(value: string | number): Promise<Model<RecipeProps>> {
        throw new Error("Method not implemented.");
    }

    update(id: string | number, newValues: RecipeProps): Promise<Model<RecipeProps>> {
        throw new Error("Method not implemented.");
    }

    async create(data: createRecipeProps): Promise<Model<RecipeProps>> {
        console.log(data);
        const recipe = await Recipe.set({
            id: uuidv4(),
            name: data.name,
            machine_id: data.machine_id,
            craft_time_seconds: data.craft_time_seconds,
        }).save();

        if (!recipe?.values?.id) {
            throw new Error("Failed to create recipe");
        }

        data.inputs.forEach(input => {
            RecipeInputController.create({
                ...input,
                recipe_id: recipe.values.id!,
            });
        });

        data.outputs.forEach(output => {
            RecipeOutputController.create({
                ...output,
                recipe_id: recipe.values.id!,
            });
        });

        return recipe;
    }

    delete(id: string | number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}