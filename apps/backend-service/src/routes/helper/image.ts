import { upload } from "../../services/CloudinaryService";
import express from "express";
import { imageController } from "../../controllers";
import { useValidate } from "../../middleware/use-validate";
import { ImageSchema } from "../../validators/ImageValidator";

const businessKnowledgeRoute = express.Router();

businessKnowledgeRoute.post(
  "/single",
  upload.single("image"),
  imageController.uploadSingle
);

businessKnowledgeRoute.post(
  "/multiple",
  upload.array("images", 10),
  imageController.uploadMultiple
);

businessKnowledgeRoute.post(
  "/delete",
  useValidate({ body: ImageSchema }),
  imageController.deleteImage
);

export default businessKnowledgeRoute;
