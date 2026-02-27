import express from 'express'
import MachineController from '../controllers/MachineController';
import Controller from '../controllers/Controller';
import { columnType } from '@iamkirbki/database-handler-core';
import { MachineProps } from '../models/Machine';
import { ItemProps } from '../models/Item';
import ItemController from '../controllers/ItemController';
import RecipeController from '../controllers/RecipeController';

const apiRouter = express.Router();

const registerResourceRoutes = <T extends columnType>(resourceName: string, controller: Controller<T>) => {
    apiRouter.get(`/${resourceName}`, async (_req, res) => {
        try {
            const data = await controller.index();
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: (err as Error).message });
        }
    });

    apiRouter.get(`/${resourceName}/:id`, async (req, res) => {
        try {
            const data = await controller.show(req.params.id);
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: (err as Error).message });
        }
    });

    apiRouter.post(`/${resourceName}`, async (req, res) => {
        try {
            const newItem = await controller.create(req.body);
            res.status(201).json(newItem);
        } catch (err) {
            res.status(500).json({ error: (err as Error).message });
        }
    });

    apiRouter.put(`/${resourceName}/:id`, async (req, res) => {
        try {
            const updatedItem = await controller.update(req.params.id, req.body);
            res.json(updatedItem);
        } catch (err) {
            res.status(500).json({ error: (err as Error).message });
        }
    });

    apiRouter.delete(`/${resourceName}/:id`, async (req, res) => {
        try {
            const success = await controller.delete(req.params.id);
            if (success) {
                res.json({ message: `${resourceName} deleted successfully` });
            } else {
                res.status(404).json({ error: `${resourceName} not found` });
            }
        } catch (err) {
            res.status(500).json({ error: (err as Error).message });
        }
    });
}

registerResourceRoutes<MachineProps>('machines', MachineController);
registerResourceRoutes<ItemProps>('items', ItemController);
registerResourceRoutes('recipes', RecipeController)

export default apiRouter;