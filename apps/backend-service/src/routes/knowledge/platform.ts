import express from "express";
import { useValidate } from "../../middleware/use-validate";
import { useOwnedBusiness } from "../../middleware/use-owned-business";
import { platformKnowledgeController } from "../../controllers";
import { PlatformSchema } from "../../validators/PlatformValidator";

const platformKnowledgeRoute = express.Router();

platformKnowledgeRoute.get(
  "/:rootBusinessId",
  useOwnedBusiness,
  platformKnowledgeController.getConnected
);

platformKnowledgeRoute.post(
  "/:rootBusinessId/:platform",
  useOwnedBusiness,
  useValidate({ params: PlatformSchema }),
  platformKnowledgeController.disconnect
);

export default platformKnowledgeRoute;
