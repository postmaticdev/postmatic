import express from "express";
import { useValidate } from "../../../middleware/use-validate";
import { useOwnedBusiness } from "../../../middleware/use-owned-business";
import { PostSchema } from "../../../validators/PostValidator";
import { useFilter } from "../../../middleware/use-filter";
import { imageContentController } from "../../../controllers";

const imagePostedRoute = express.Router();

imagePostedRoute.get(
  "/:rootBusinessId",
  useOwnedBusiness,
  useFilter(["caption"]),
  imageContentController.getAllPostedContents
);

imagePostedRoute.post(
  "/:rootBusinessId",
  useOwnedBusiness,
  useValidate({ body: PostSchema }),
  imageContentController.directPost
);

export default imagePostedRoute;
