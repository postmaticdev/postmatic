import express from "express";
import { useValidate } from "../../middleware/use-validate";
import { productKnowledgeController } from "../../controllers";
import { ProductKnowledgeSchema } from "../../validators/ProductKnowledgeValidator";
import { useOwnedBusiness } from "../../middleware/use-owned-business";
import { useFilter } from "../../middleware/use-filter";

const productKnowledgeRoute = express.Router();

productKnowledgeRoute.get(
  "/:rootBusinessId",
  useOwnedBusiness,
  useFilter(["name"]),
  productKnowledgeController.getAllProductKnowledges
);

productKnowledgeRoute.get(
  "/:rootBusinessId/:productKnowledgeId",
  useOwnedBusiness,
  productKnowledgeController.getStatusProductKnowledge
);

productKnowledgeRoute.post(
  "/:rootBusinessId",
  useOwnedBusiness,
  useValidate({ body: ProductKnowledgeSchema }),
  productKnowledgeController.createNewProductKnowledge
);

productKnowledgeRoute.put(
  "/:productKnowledgeId",
  useOwnedBusiness,
  useValidate({ body: ProductKnowledgeSchema }),
  productKnowledgeController.editProductKnowledge
);

productKnowledgeRoute.delete(
  "/:productKnowledgeId",
  useOwnedBusiness,
  productKnowledgeController.deleteProductKnowledge
);

export default productKnowledgeRoute;
