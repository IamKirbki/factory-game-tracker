import { Container, Model } from "@iamkirbki/database-handler-core";
import { v4 as uuidv4 } from 'uuid';
import Item, { ItemProps } from "../models/Item";
import Controller from "./Controller";

export default class ItemController extends Controller<ItemProps> {
    async index(): Promise<Model<ItemProps>[]> {
        return await Item.all();
    }
    async show(value: string | number): Promise<Model<ItemProps>> {
        return await Item.whereId(value).first();
    }
    async edit(value: string | number): Promise<Model<ItemProps>> {
        return await Item.whereId(value).first();
    }
    async update(id: string | number, newValues: ItemProps): Promise<Model<ItemProps>> {
        return await Item.whereId(id).update(newValues);
    }
    async create(data: ItemProps): Promise<Model<ItemProps>> {
        return await Item.set({
            ...data,
            id: uuidv4()
        }).save();
    }
    async delete(id: string | number): Promise<boolean> {
        const adapter = Container.getInstance().getAdapter();
        const stmt = await adapter.prepare("DELETE FROM items WHERE id = ?");
        const result = await stmt.run({ id });
        return result ? true : false;
    }
}