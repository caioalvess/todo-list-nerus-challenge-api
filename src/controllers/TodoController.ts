import { Request, Response, NextFunction } from "express";
import * as todoService from "../services/TodoService";
import {
  createTodoSchema,
  updateTodoSchema,
} from "../validations/TodoValidation";

export const getTodosController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const filters = Object.fromEntries(
      Object.entries(req.query).map(([key, value]) => {
        if (key === "completed") {
          return [key, value === "true"];
        }
        return [key, value];
      })
    );
    delete filters.page;
    delete filters.limit;

    const todosResponse = await todoService.getTodos(
      page,
      limit,
      filters as { [key: string]: string | number | boolean }
    );

    res.json(todosResponse);
  } catch (error) {
    next(error);
  }
};

export const getTodoByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const todo = await todoService.getTodoById(id);

    res.json(todo);
  } catch (error) {
    next(error);
  }
};

export const createTodoController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = createTodoSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ errors: result.error.errors });
      return;
    }

    const { title, description, completed } = result.data;
    const newTodo = await todoService.createTodo({
      title,
      description,
      completed,
    });
    res.status(201).json(newTodo);
  } catch (error) {
    next(error);
  }
};

export const updateTodoController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const result = updateTodoSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ errors: result.error.errors });
      return;
    }

    const { title, description, completed } = result.data;
    const updated = await todoService.updateTodo(id, {
      title,
      description,
      completed,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteTodoController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await todoService.deleteTodo(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
