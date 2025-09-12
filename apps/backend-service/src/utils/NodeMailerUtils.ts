import { APP_NAME, CONTACT_EMAIL } from "../constant";
import {
  SMTP_SERVICE,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_USER,
  SMTP_SECURE,
  SMTP_NAME,
  SMTP_SERVER_NAME,
  SMTP_FROM,
} from "../constant/smtp";
import { BaseUtils } from "./BaseUtils";
import nodemailer from "nodemailer";
import { EmailTemplateUtils } from "./EmailTemplateUtils";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export class NodeMailerUtils extends BaseUtils {
  constructor(private template: EmailTemplateUtils) {
    super();
  }

  /** Derive sane transport flags from env */
  private readonly _host = SMTP_HOST || "mx3.mailspace.id";
  private readonly _port = Number(SMTP_PORT || 587);
  private readonly _isImplicitTls = this._port === 465; // 465 = SMTPS
  private readonly _secure = this._isImplicitTls ? true : false; // ignore SMTP_SECURE when port=587
  private readonly _requireTLS = !this._isImplicitTls; // STARTTLS on 587
  private readonly _ehloName = SMTP_NAME || "postmatic.id";
  private readonly _sniName = SMTP_SERVER_NAME || this._host;
  private readonly _smtpUser = SMTP_USER || "team@postmatic.id";
  private readonly _smtpPass = SMTP_PASS || "";

  /**
   * From address:
   * - prioritise CONTACT_EMAIL if domain already .id
   * - else fallback to SMTP_FROM (if provided) or SMTP_USER
   */
  private readonly FROM_ADDR: string =
    CONTACT_EMAIL && /@postmatic\.id$/i.test(CONTACT_EMAIL)
      ? CONTACT_EMAIL
      : process.env.SMTP_FROM || this._smtpUser;

  private mailer = nodemailer.createTransport({
    host: this._host,
    port: this._port,
    secure: this._secure, // 465 = true, 587 = false
    requireTLS: this._requireTLS, // STARTTLS for 587
    name: this._ehloName, // EHLO / Message-ID domain hint
    auth: { user: this._smtpUser, pass: this._smtpPass },
    tls: { servername: this._sniName }, // SNI must match cert CN (mx3.mailspace.id)
    // Turn on detailed logs only in dev
    logger: process.env.NODE_ENV !== "production",
  } as SMTPTransport.Options);

  private buildMailOptions = (
    to: string,
    subject: string,
    html: string
  ): Mail.Options => ({
    // RFC5322.From (what recipients see)
    from: `"${APP_NAME}" <${this.FROM_ADDR}>`,
    // Envelope MAIL FROM (Return-Path) — must align to pass DMARC easily
    envelope: { from: this.FROM_ADDR, to },
    to,
    subject,
    html,
    // Always include a text alternative (helps deliverability)
    text: html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    // Ensure Message-ID uses your domain (avoid @postmatic.com artifacts)
    messageId: `${Date.now()}.${Math.random()
      .toString(36)
      .slice(2)}@postmatic.id`,
    replyTo: SMTP_FROM, // optional
  });

  private async sendTemplateEmail(
    context: string,
    to: string,
    subject: string,
    html: string
  ) {
    const msg = this.buildMailOptions(to, subject, html);

    // Guard common misconfig: port 587 + secure:true (should never happen here)
    if (this._port === 587 && this._secure) {
      console.warn(
        "smtp",
        "Misconfig detected: port=587 requires secure:false. Transport adjusted automatically."
      );
    }

    try {
      // Debug snapshot
      this.log("smtp-env", {
        SMTP_SERVICE,
        host: this._host,
        port: this._port,
        secure: this._secure,
        requireTLS: this._requireTLS,
        name: this._ehloName,
        sni: this._sniName,
        user: this._smtpUser,
        from: this.FROM_ADDR,
      });

      const info = await this.mailer.sendMail(msg);
      this.log("smtp", {
        response: info.response,
        id: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      });
      return info;
    } catch (error) {
      this.handleError(context, error);
    }
  }

  sendEmailVerification = async (
    target: string,
    name: string,
    link: string
  ) => {
    const subject = `${APP_NAME} - Verifikasi Email Anda`;
    const html = this.template.emailVerification(name, subject, link);
    await this.sendTemplateEmail(
      "sendEmailVerification",
      target,
      subject,
      html
    );
  };

  sendEmailInvitation = async (
    email: string,
    link: string,
    businessName: string
  ) => {
    const subject = `${APP_NAME} - Undangan`;
    const html = this.template.emailInvitation(
      email,
      subject,
      link,
      businessName
    );
    await this.sendTemplateEmail("sendEmailInvitation", email, subject, html);
  };

  sendEmailResetPassword = async (
    email: string,
    name: string,
    link: string
  ) => {
    const subject = `${APP_NAME} - Atur Ulang Password`;
    const html = this.template.emailResetPass(name, subject, link);
    await this.sendTemplateEmail(
      "sendEmailResetPassword",
      email,
      subject,
      html
    );
  };
}
