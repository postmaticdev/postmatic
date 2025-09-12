import express from "express";
import { useValidate } from "../../../middleware/use-validate";
import { TemplateSaveSchema } from "../../../validators/TemplateValidator";
import { useOwnedBusiness } from "../../../middleware/use-owned-business";
import { useFilter } from "../../../middleware/use-filter";
import { templateController } from "../../../controllers";

const templateSavedRoute = express.Router();

templateSavedRoute.get(
  "/:rootBusinessId",
  useOwnedBusiness,
  useFilter(["name"]),
  templateController.getSavedTemplates
);

templateSavedRoute.post(
  "/:rootBusinessId",
  useValidate({
    body: TemplateSaveSchema,
  }),
  useOwnedBusiness,
  templateController.saveTemplate
);

templateSavedRoute.delete(
  "/:rootBusinessId/:templateImageContentId",
  useOwnedBusiness,
  templateController.deleteTemplate
);

export default templateSavedRoute;
