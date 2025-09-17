import { RoleKnowledgeDTO } from "../validators/RoleKnowledgeValidator";
import { BaseService } from "./BaseService";
import db from "../config/db";

export class RoleKnowledgeService extends BaseService {
  async getRoleKnowledge(rootBusinessId: string) {
    try {
      const data = await db.roleKnowledge.findUnique({
        where: { rootBusinessId },
      });
      return {
        id: data?.id || "CURRENTLY_NOT_CREATED",
        audiencePersona: data?.audiencePersona || "",
        callToAction: data?.callToAction || "",
        goals: data?.goals || "",
        hashtags: data?.hashtags || [],
        rootBusinessId: rootBusinessId,
        targetAudience: data?.targetAudience || "",
        tone: data?.tone || "",
        deletedAt: data?.deletedAt || null,
        createdAt: data?.createdAt || null,
        updatedAt: data?.updatedAt || null,
      };
    } catch (err) {
      this.handleError("RoleKnowledgeService.getRoleKnowledge", err);
    }
  }

  async upsertRoleKnowledge(data: RoleKnowledgeDTO, rootBusinessId: string) {
    try {
      const [role, _] = await Promise.all([
        db.roleKnowledge.upsert({
          where: { rootBusinessId },
          update: data,
          create: {
            audiencePersona: data.audiencePersona,
            callToAction: data.callToAction,
            goals: data.goals,
            hashtags: data.hashtags,
            rootBusinessId: rootBusinessId,
            targetAudience: data.targetAudience,
            tone: data.tone,
          },
        }),
        db.rootBusiness.update({
          where: { id: rootBusinessId },
          data: { updatedAt: new Date() },
        }),
      ]);
      return role;
    } catch (err) {
      this.handleError("RoleKnowledgeService.upsertRoleKnowledge", err);
    }
  }
}
