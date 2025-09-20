import express from "express";
import { useOwnedBusiness } from "../../../middleware/use-owned-business";
import { useValidate } from "../../../middleware/use-validate";
import {
  ImageContentMaskSchema,
  ImageContentRegenerateSchema,
  ImageContentSchema,
} from "../../../validators/ImageContentValidator";
import { imageContentController } from "../../../controllers";
import { ImageContentRssSchema } from "../../../validators/ImageContentValidator";

const imageJobRoute = express.Router();

// WITH JOB
// BY KNOWLEDGE
imageJobRoute.post(
  "/:rootBusinessId/generate",
  useOwnedBusiness,
  useValidate({ body: ImageContentSchema }),
  imageContentController.enqueueGenerateContentBasedOnKnowledge
);

// BY RSS
imageJobRoute.post(
  "/:rootBusinessId/rss",
  useOwnedBusiness,
  useValidate({ body: ImageContentRssSchema }),
  imageContentController.enqueueGenerateContentBasedOnRss
);

// BY REGENERATE
imageJobRoute.post(
  "/:rootBusinessId/regenerate",
  useOwnedBusiness,
  useValidate({ body: ImageContentRegenerateSchema }),
  imageContentController.enqueueRegenerateContent
);

// BY MASK
imageJobRoute.post(
  "/:rootBusinessId/mask",
  useOwnedBusiness,
  useValidate({ body: ImageContentMaskSchema }),
  imageContentController.enqueueGenerateContentBasedOnMask
);

// BY MOCK
imageJobRoute.post(
  "/:rootBusinessId/mock",
  useOwnedBusiness,
  useValidate({ body: ImageContentSchema }),
  imageContentController.enqueueGenerateMockContent
);

// BY MOCK REGENERATE
imageJobRoute.post(
  "/:rootBusinessId/mock-regenerate",
  useOwnedBusiness,
  useValidate({ body: ImageContentRegenerateSchema }),
  imageContentController.enqueueRegenerateMockContent
);

// BY MOCK RSS
imageJobRoute.post(
  "/:rootBusinessId/mock-rss",
  useOwnedBusiness,
  useValidate({ body: ImageContentRssSchema }),
  imageContentController.enqueueGenerateMockContentBasedOnRss
);

// BY MOCK MASK
imageJobRoute.post(
  "/:rootBusinessId/mock-mask",
  useOwnedBusiness,
  useValidate({ body: ImageContentMaskSchema }),
  imageContentController.enqueueGenerateMockContentMask
);

// Poll satu job
imageJobRoute.get(
  "/:rootBusinessId/:jobId",
  useOwnedBusiness,
  imageContentController.getJob
);

// List history sementara (TTL 1 jam)
imageJobRoute.get(
  "/:rootBusinessId",
  useOwnedBusiness,
  imageContentController.listJobs
);

// Delete job by id
imageJobRoute.delete(
  "/:rootBusinessId/:jobId",
  useOwnedBusiness,
  imageContentController.deleteJobById
);

export default imageJobRoute;
