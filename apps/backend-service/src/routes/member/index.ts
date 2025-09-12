import express from "express";
import { memberController } from "../../controllers";
import { useOwnedBusiness } from "../../middleware/use-owned-business";
import { useValidate } from "../../middleware/use-validate";
import {
  MemberEditSchema,
  MemberSchema,
  ResendEmailInvitationSchema,
} from "../../validators/MemberValidator";
import { useAuth } from "../../middleware/use-auth";
import { useTurnstile } from "../../middleware/use-turnstile";
import { useCsrf } from "../../middleware/use-csrf";

const memberRoute = express.Router();

memberRoute.get(
  "/business/:rootBusinessId",
  useAuth,
  useOwnedBusiness,
  memberController.getBusinessMembers
);

memberRoute.get(
  "/:inviteToken/invitation",
  useCsrf.protection,
  useCsrf.exposeToken,
  useTurnstile.expose,
  memberController.openLinkInvitation
);

memberRoute.post(
  "/:inviteToken/invitation",
  useCsrf.protection,
  useCsrf.exposeToken,
  useTurnstile.expose,
  useTurnstile.softVerify,
  memberController.answerLinkInvitation
);

memberRoute.post(
  "/:rootBusinessId",
  useAuth,
  useValidate({ body: MemberSchema }),
  useOwnedBusiness,
  memberController.sendInvitation
);

memberRoute.put(
  "/:memberId",
  useAuth,
  useOwnedBusiness,
  useValidate({ body: MemberEditSchema }),
  memberController.editMember
);

memberRoute.delete(
  "/:memberId",
  useAuth,
  useOwnedBusiness,
  memberController.removeMember
);

memberRoute.post(
  "/:rootBusinessId/resend-email-invitation",
  useAuth,
  useOwnedBusiness,
  useValidate({ body: ResendEmailInvitationSchema }),
  memberController.resendEmailInvitation
);

export default memberRoute;
