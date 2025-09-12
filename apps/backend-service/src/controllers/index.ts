import {
  appProductService,
  authService,
  businessKnowledgeService,
  businessService,
  facebookPageService,
  imageContentOverviewService,
  imageContentService,
  imageContentServiceMock,
  imageService,
  linkedInService,
  masterRssService,
  memberService,
  platformKnowledgeService,
  productKnowledgeService,
  purchaseService,
  roleKnowledgeService,
  roleService,
  rssKnowledgeService,
  schedulerService,
  templateService,
  tierService,
  timeService,
  instagramBusinessService,
} from "../services";
import { AppProductController } from "./AppProductController";
import { AuthController } from "./AuthController";
import { BusinessController } from "./BusinessController";
import { BusinessKnowledgeController } from "./BusinessKnowledgeController";
import { CronController } from "./CronController";
import { FacebookPageController } from "./FacebookPageController";
import { ImageContentController } from "./ImageContentController";
import { ImageContentOverviewController } from "./ImageContentOverviewController";
import { ImageController } from "./ImageController";
import { InstagramBusinessController } from "./InstagramBusinessController";
import { LinkedInController } from "./LinkedInController";
import { MasterRssController } from "./MasterRssController";
import { MemberController } from "./MemberController";
import { PlatformKnowledgeController } from "./PlatformKnowledgeController";
import { ProductKnowledgeController } from "./ProductKnowledgeController";
import { PurchaseController } from "./PurchaseController";
import { RoleController } from "./RoleController";
import { RoleKnowledgeController } from "./RoleKnowledgeController";
import { RssKnowledgeController } from "./RssKnowledgeController";
import { SchedulerController } from "./SchedulerController";
import { TemplateController } from "./TemplateController";
import { TierController } from "./TierController";
import { TimeController } from "./TimeController";

export const appProductController = new AppProductController(appProductService);
export const authController = new AuthController(authService);
export const businessController = new BusinessController(businessService);
export const businessKnowledgeController = new BusinessKnowledgeController(
  businessKnowledgeService
);
export const cronController = new CronController();
export const imageContentController = new ImageContentController(
  imageContentService,
  imageContentServiceMock
);
export const imageContentOverviewController =
  new ImageContentOverviewController(imageContentOverviewService);
export const imageController = new ImageController(imageService);
export const linkedInController = new LinkedInController(linkedInService);
export const masterRssController = new MasterRssController(masterRssService);
export const memberController = new MemberController(memberService);
export const platformKnowledgeController = new PlatformKnowledgeController(
  platformKnowledgeService
);
export const productKnowledgeController = new ProductKnowledgeController(
  productKnowledgeService
);
export const purchaseController = new PurchaseController(purchaseService);
export const roleController = new RoleController(roleService);
export const roleKnowledgeController = new RoleKnowledgeController(
  roleKnowledgeService
);
export const rssKnowledgeController = new RssKnowledgeController(
  rssKnowledgeService
);
export const schedulerController = new SchedulerController(schedulerService);
export const templateController = new TemplateController(templateService);
export const tierController = new TierController(tierService);
export const timeController = new TimeController(timeService);
export const facebookPageController = new FacebookPageController(
  facebookPageService
);
export const instagramBusinessController = new InstagramBusinessController(
  instagramBusinessService
);
