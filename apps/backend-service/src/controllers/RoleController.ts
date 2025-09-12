import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { RoleService } from "../services/RoleService";

export class RoleController extends BaseController {
  constructor(private roleService: RoleService) {
    super();
  }

  getRoles = async (req: Request, res: Response) => {
    try {
      const roles = await this.roleService.getRoles();
      return this.sendSuccess(res, roles, "Berhasil mengambil roles");
    } catch (err) {
      return this.sendError(res, err);
    }
  };
}
