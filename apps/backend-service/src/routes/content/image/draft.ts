import express from "express";
import { useValidate } from "../../../middleware/use-validate";
import { useOwnedBusiness } from "../../../middleware/use-owned-business";
import {
  ImageContentEditSchema,
  ImageContentSaveSchema,
} from "../../../validators/ImageContentValidator";
import { imageContentController } from "../../../controllers";
import { PostSchema } from "../../../validators/PostValidator";
import { useFilter } from "../../../middleware/use-filter";

const imageDraftRoute = express.Router();

imageDraftRoute.get(
  "/:rootBusinessId",
  useOwnedBusiness,
  useFilter(["caption"]),
  imageContentController.getAllDraftContents
);

imageDraftRoute.post(
  "/:rootBusinessId",
  useOwnedBusiness,
  useValidate({ body: ImageContentSaveSchema }),
  imageContentController.saveGeneratedImage
);

imageDraftRoute.post(
  "/:rootBusinessId/post",
  useOwnedBusiness,
  useValidate({ body: PostSchema }),
  imageContentController.directPost
);

imageDraftRoute.put(
  "/:rootBusinessId/:generatedImageContentId",
  useOwnedBusiness,
  useValidate({ body: ImageContentEditSchema }),
  imageContentController.editGeneratedContent
);

imageDraftRoute.patch(
  "/:rootBusinessId/:generatedImageContentId",
  useOwnedBusiness,
  imageContentController.setReadyToPost
);

imageDraftRoute.delete(
  "/:rootBusinessId/:generatedImageContentId",
  useOwnedBusiness,
  imageContentController.deleteGeneratedContent
);

export default imageDraftRoute;
