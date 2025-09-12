import express from "express";
import { useValidate } from "../../middleware/use-validate";
import { rssKnowledgeController } from "../../controllers";
import { RssKnowledgeSchema } from "../../validators/RssKnowledgeValidator";
import { useOwnedBusiness } from "../../middleware/use-owned-business";
import { useFilter } from "../../middleware/use-filter";

const rssKnowledgeRoute = express.Router();

rssKnowledgeRoute.get(
  "/:rootBusinessId",
  useOwnedBusiness,
  useFilter(["title", "masterRss.title"]),
  rssKnowledgeController.getAllRssKnowledges
);

rssKnowledgeRoute.post(
  "/:rootBusinessId",
  useOwnedBusiness,
  useValidate({ body: RssKnowledgeSchema }),
  rssKnowledgeController.createNewRssKnowledge
);

rssKnowledgeRoute.put(
  "/:rssKnowledgeId",
  useOwnedBusiness,
  useValidate({ body: RssKnowledgeSchema }),
  rssKnowledgeController.editRssKnowledge
);

rssKnowledgeRoute.delete(
  "/:rssKnowledgeId",
  useOwnedBusiness,
  rssKnowledgeController.deleteRssKnowledge
);

export default rssKnowledgeRoute;
