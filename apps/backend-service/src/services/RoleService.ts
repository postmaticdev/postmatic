import { BaseService } from "./BaseService";
import { $Enums } from "@prisma/client";

export class RoleService extends BaseService {
  async getRoles() {
    return Object.values($Enums.MemberRole);
  }
}
