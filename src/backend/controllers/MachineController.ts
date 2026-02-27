import { Model, Query } from "@iamkirbki/database-handler-core";
import { v4 as uuidv4 } from 'uuid';
import Machine, { MachineProps } from "../models/Machine";
import Controller from "./Controller";

export default class MachineController extends Controller<MachineProps> {
    async index(): Promise<Model<MachineProps>[]> {
        return await Machine.all();
    }

    async show(value: string | number): Promise<Model<MachineProps>> {
        return await Machine.whereId(value).first();
    }

    async edit(value: string | number): Promise<Model<MachineProps>> {
        return await Machine.whereId(value).first();
    }

    async update(id: string | number, newValues: MachineProps): Promise<Model<MachineProps>> {
        return await Machine.whereId(id).update(newValues);
    }

    async create(data: MachineProps): Promise<Model<MachineProps>> {
        return await Machine.set({
            ...data,
            id: uuidv4(),
        }).save();
    }

    async delete(id: string | number): Promise<boolean> {
        const query = await new Query({
            tableName: "machines",
            query: "DELETE FROM machines WHERE id = ?",
            parameters: {
                id: id,
            },
        })

        query.Run();
        return query ? true : false;
    }
}