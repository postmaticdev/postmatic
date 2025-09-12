import { ZodError, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { BaseController } from "../controllers/BaseController";

export const useValidate =
  (schemas: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
    awaitedBody?: () => Promise<ZodSchema>;
  }) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.awaitedBody) {
        const awaitedSchema = await schemas.awaitedBody();
        req.body = awaitedSchema.parse(req.body);
      }
      next();
    } catch (err: any) {
      const controller = new BaseController();
      let message = "Invalid request";
      if (err instanceof ZodError) {
        message = err?.errors?.[0].message || "Harap isi form dengan benar";
      }
      return res.status(400).json({
        metaData: controller.metaData(400),
        responseMessage: message,
        errors: err?.errors || err,
      });
    }
  };
