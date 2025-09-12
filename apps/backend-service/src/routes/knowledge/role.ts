import express from "express";
import { useValidate } from "../../middleware/use-validate";
import { roleKnowledgeController } from "../../controllers";
import { RoleKnowledgeSchema } from "../../validators/RoleKnowledgeValidator";
import { useOwnedBusiness } from "../../middleware/use-owned-business";

const roleKnowledgeRoute = express.Router();

roleKnowledgeRoute.get(
  "/:rootBusinessId",
  useOwnedBusiness,
  roleKnowledgeController.getCurrentRoleKnowledge
);

roleKnowledgeRoute.post(
  "/:rootBusinessId",
  useOwnedBusiness,
  useValidate({ body: RoleKnowledgeSchema }),
  roleKnowledgeController.upsertRoleKnowledge
);

export default roleKnowledgeRoute;
