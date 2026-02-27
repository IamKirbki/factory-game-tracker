import { Model } from "@iamkirbki/database-handler-core";
import { RecipeIOProps } from "../models/RecipeInput";
import Controller from "./Controller";
import RecipeOutput from "../models/RecipeOutput";

export default class RecipeOutputController extends Controller<RecipeIOProps> {
    index(): Promise<Model<RecipeIOProps>[]> {
        throw new Error("Method not implemented.");
    }

    show(value: string | number): Promise<Model<RecipeIOProps>> {
        throw new Error("Method not implemented.");
    }

    edit(value: string | number): Promise<Model<RecipeIOProps>> {
        throw new Error("Method not implemented.");
    }

    update(id: string | number, newValues: RecipeIOProps): Promise<Model<RecipeIOProps>> {
        throw new Error("Method not implemented.");
    }

    async create(data: RecipeIOProps): Promise<Model<RecipeIOProps>> {
        return await RecipeOutput.set(data).save();
    }

    delete(id: string | number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}