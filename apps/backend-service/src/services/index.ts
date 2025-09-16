import { AppProductService } from "./AppProductService";
import { AuthService } from "./AuthService";
import { BusinessKnowledgeService } from "./BusinessKnowledgeService";
import { BusinessService } from "./BusinessService";
import { CloudinaryService } from "./CloudinaryService";
import { DiscountService } from "./DiscountService";
import { ImageContentOverviewService } from "./ImageContent/ImageContentOverviewService";
import { ImageContentGenerateService } from "./ImageContent/ImageContentGenerateService";
import { ImageContentGenerateMockService } from "./ImageContent/ImageContentGenerateMockService";
import { ImageManipulationService } from "./ImageManipulationService";
import { ImageService } from "./ImageService";
import { LinkedInService } from "./LinkedInService";
import { MasterRssService } from "./MasterRssService";
import { MemberService } from "./MemberService";
import { MidtransService } from "./MidtransService";
import { OpenAiService } from "./OpenAiService";
import { PlatformKnowledgeService } from "./PlatformKnowledgeService";
import { ProductKnowledgeService } from "./ProductKnowledgeService";
import { PurchaseService } from "./PurchaseService";
import { RoleKnowledgeService } from "./RoleKnowledgeService";
import { RoleService } from "./RoleService";
import { RssKnowledgeService } from "./RssKnowledgeService";
import { SchedulerService } from "./SchedulerService";
import { TemplateService } from "./TemplateService";
import { TierService } from "./TierService";
import { TimeService } from "./TimeService";
import { NodeMailerUtils } from "../utils/NodeMailerUtils";
import { EmailTemplateUtils } from "../utils/EmailTemplateUtils";
import { AntaraUtils } from "../utils/rss/AntaraUtils";
import { CnbcUtils } from "../utils/rss/CnbcUtils";
import { redisClient } from "../config/redis";
import { FacebookPageService } from "./FacebookPageService";
import { InstagramBusinessService } from "./InstagramBusinessService";

export const discountService = new DiscountService();
export const appProductService = new AppProductService(discountService);
export const emailTemplateUtils = new EmailTemplateUtils();
export const nodeMailerUtils = new NodeMailerUtils(emailTemplateUtils);
export const authService = new AuthService(nodeMailerUtils, discountService);
export const businessKnowledgeService = new BusinessKnowledgeService();
export const businessService = new BusinessService();
export const cloudinaryService = new CloudinaryService();
export const imageContentOverviewService = new ImageContentOverviewService();
export const imageManipulationService = new ImageManipulationService();
export const linkedInService = new LinkedInService();
export const openAiService = new OpenAiService();
export const tierService = new TierService();
export const facebookPageService = new FacebookPageService(cloudinaryService);
export const platformKnowledgeService = new PlatformKnowledgeService();
export const instagramBusinessService = new InstagramBusinessService(
  cloudinaryService
);
export const imageContentService = new ImageContentGenerateService({
  cloudinary: cloudinaryService,
  platformDeps: {
    socialFacebookPage: facebookPageService,
    socialLinkedIn: linkedInService,
    socialInstagramBusiness: instagramBusinessService,
  },
  openai: openAiService,
  token: tierService,
  manip: imageManipulationService,
  platformService: platformKnowledgeService,
});
export const imageService = new ImageService(cloudinaryService);
const antara = new AntaraUtils(redisClient);
const cnbc = new CnbcUtils(redisClient);
export const masterRssService = new MasterRssService(antara, cnbc);
export const memberService = new MemberService(nodeMailerUtils, authService);
export const midtransService = new MidtransService();

export const productKnowledgeService = new ProductKnowledgeService();
export const purchaseService = new PurchaseService(
  midtransService,
  appProductService,
  discountService
);
export const roleKnowledgeService = new RoleKnowledgeService();
export const roleService = new RoleService();
export const rssKnowledgeService = new RssKnowledgeService();
export const schedulerService = new SchedulerService({
  platformDeps: {
    socialFacebookPage: facebookPageService,
    socialLinkedIn: linkedInService,
    socialInstagramBusiness: instagramBusinessService,
  },
  platformService: platformKnowledgeService,
});
export const templateService = new TemplateService();
export const timeService = new TimeService();
export const imageContentServiceMock = new ImageContentGenerateMockService({
  cloudinary: cloudinaryService,
  platformDeps: {
    socialFacebookPage: facebookPageService,
    socialLinkedIn: linkedInService,
    socialInstagramBusiness: instagramBusinessService,
  },
  openai: openAiService,
  token: tierService,
  manip: imageManipulationService,
  platformService: platformKnowledgeService,
});
