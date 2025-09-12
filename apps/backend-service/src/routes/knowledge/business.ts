import express from "express";
import { useValidate } from "../../middleware/use-validate";
import { businessKnowledgeController } from "../../controllers";
import { BusinessKnowledgeSchema } from "../../validators/BusinessKnowledgeValidator";
import { useOwnedBusiness } from "../../middleware/use-owned-business";

const businessKnowledgeRoute = express.Router();

businessKnowledgeRoute.get(
  "/:rootBusinessId",
  useOwnedBusiness,
  businessKnowledgeController.getCurrentBusinessKnowledge
);

businessKnowledgeRoute.post(
  "/:rootBusinessId",
  useOwnedBusiness,
  useValidate({ body: BusinessKnowledgeSchema }),
  businessKnowledgeController.upsertBusinessKnowledge
);

export default businessKnowledgeRoute;
