import { ADDRESS, APP_NAME, CONTACT_EMAIL, LOGO } from "../constant";
import { BaseUtils } from "./BaseUtils";

export class EmailTemplateUtils extends BaseUtils {
  private style = `
  <style>
    /* --- Base --- */
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #f4f4f7;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      font-family: Arial, sans-serif;
    }
    img { border: 0; line-height: 100%; vertical-align: middle; }
    a { text-decoration: none; }

    .container {
      width: 100%;
      padding: 40px 0;
      background-color: #f4f4f7;
      text-align: center;
    }
    .email-content {
      background-color: #ffffff;
      margin: 0 auto;
      max-width: 700px;
      border-radius: 12px;
      padding: 32px 28px;
      box-shadow: 0 2px 10px rgba(16,24,40,.06);
      text-align: left;
      border: 1px solid #eef2f7;
    }
    .email-header { text-align: center; margin-bottom: 16px; }
    .email-header img { width: 180px; height: auto; }

    .preheader {
      display: none !important;
      visibility: hidden;
      opacity: 0;
      color: transparent;
      height: 0;
      width: 0;
      overflow: hidden;
      mso-hide: all;
    }

    .eyebrow {
      font-size: 12px;
      line-height: 1;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: #6366f1;
      margin: 8px 0 16px;
      text-align: center;
      font-weight: 700;
    }

    .email-body { text-align: left; }
    .email-body h1 {
      font-size: 24px;
      line-height: 1.3;
      color: #0f172a;
      margin: 12px 0 8px;
    }
    .email-body p {
      font-size: 15px;
      line-height: 1.6;
      color: #334155;
      margin: 8px 0;
    }
    .muted { color: #64748b; }

    .divider {
      height: 1px;
      background: #eef2f7;
      margin: 24px 0;
      width: 100%;
    }

    /* --- CTA Button (class-level, tapi tetap inline nantinya untuk kompatibilitas) --- */
      .confirm-btn{
      display:inline-block;
      background-color:#1657e6;
      color:#ffffff !important;
      padding:12px 24px;
      font-size:16px;
      font-weight:600;
      border-radius:8px;
      text-decoration:none;
      border:1px solid #1657e6;
      line-height:100%;
      text-align:center;
    }
    .confirm-btn:hover{ filter:brightness(1.05); }

    @media only screen and (max-width:800px){
      .email-content{ width:88% !important; padding:20px !important; box-shadow:none; border-radius:8px; }
      .email-body h1{ font-size:22px !important; }
      .confirm-btn{
        display:block !important;
        margin:0 auto !important;   /* center di mobile */
        width:auto !important;
        text-align:center !important;
      }
    }

    .email-footer {
      margin-top: 28px;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
    }
    .email-footer a { color: #1657e6; text-decoration: underline; }

    @media only screen and (max-width: 800px) {
      .email-content { width: 88% !important; padding: 20px !important; box-shadow: none; border-radius: 8px; }
      .email-body h1 { font-size: 22px !important; }
      .confirm-btn { width: 100% !important; text-align: center !important; }
    }
  </style>
  `;

  private head = (subject: string) => `
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${APP_NAME + " - " + subject}</title>
      ${this.style}
    </head>
  `;

  /** Gunakan inline style di CTA agar teks PASTI putih di semua klien */
  private btn = (href: string, label: string) => `
  <!-- Outlook desktop fallback pakai VML -->
  <!--[if mso]>
  <div style="margin:20px 0;" align="center">
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
                 href="${href}" arcsize="12%" fillcolor="#1657e6" strokecolor="#1657e6"
                 style="v-text-anchor:middle; height:44px; width:260px; border:0;">
      <w:anchorlock/>
      <center style="color:#ffffff; font-family:Arial,sans-serif; font-size:16px; font-weight:600;">
        ${label}
      </center>
    </v:roundrect>
  </div>
  <![endif]-->

  <!-- Non-Outlook: flex wrapper full-width -->
  <!--[if !mso]><!-- -->
  <div style="margin:20px 0;">
    <!-- Fallback center tag untuk beberapa klien lama yang kurang bagus flex-nya -->
    <center>
      <div style="display:flex; justify-content:center; align-items:center; width:100%;">
        <a href="${href}"
           class="confirm-btn"
           role="button"
           aria-label="${label}"
           style="
             background-color:#1657e6;
             color:#ffffff !important;
             display:inline-block;
             padding:12px 24px;
             font-size:16px;
             font-weight:600;
             border-radius:8px;
             text-decoration:none;
             border:1px solid #1657e6;
             line-height:100%;
             text-align:center;
             margin:0 auto;          /* center saat bukan mobile */
           ">
          ${label}
        </a>
      </div>
    </center>
  </div>
  <!--<![endif]-->
`;

  emailVerification = (name: string, subject: string, confirmUrl: string) => `
    <!DOCTYPE html>
    <html lang="id">
    ${this.head(subject)}
    <body>
      <div class="preheader">${subject} · ${APP_NAME}</div>
      <div class="container">
        <div class="email-content">
          <div class="email-header">
            <img src="${LOGO}" alt="${APP_NAME}">
          </div>

          <div class="eyebrow">Verifikasi Email</div>

          <div class="email-body">
            <h1>Halo ${name}!</h1>
            <p>Terima kasih telah mendaftar di <strong>${APP_NAME}</strong>.</p>
            <p>${subject}</p>
            <p>Silakan klik tombol di bawah ini untuk mengonfirmasi alamat email Anda:</p>
            ${this.btn(confirmUrl, "Konfirmasi Email")}
            <div class="divider"></div>
            <p class="muted">Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
          </div>

          <div class="email-footer">
            <p>Butuh bantuan? Hubungi kami di <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
            <p>${ADDRESS}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  emailInvitation = (
    email: string,
    subject: string,
    confirmUrl: string,
    businessName: string
  ) => `
    <!DOCTYPE html>
    <html lang="id">
    ${this.head(subject)}
    <body>
      <div class="preheader">${subject} · ${APP_NAME}</div>
      <div class="container">
        <div class="email-content">
          <div class="email-header">
            <img src="${LOGO}" alt="${APP_NAME}">
          </div>

          <div class="eyebrow">Undangan Bergabung</div>

          <div class="email-body">
            <h1>Halo ${email}!</h1>
            <p>Anda telah diundang untuk bergabung dengan tim <strong>${businessName}</strong> di <strong>${APP_NAME}</strong>.</p>
            <p>Silakan klik tombol di bawah ini untuk menerima undangan dan bergabung dengan tim:</p>
            ${this.btn(confirmUrl, "Terima Undangan")}
            <div class="divider"></div>
            <p class="muted">Jika Anda merasa tidak mengenal ${businessName}, Anda bisa mengabaikan email ini.</p>
          </div>

          <div class="email-footer">
            <p>Butuh bantuan? Hubungi kami di <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
            <p>${ADDRESS}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  emailResetPass = (name: string, subject: string, resetUrl: string) => `
    <!DOCTYPE html>
    <html lang="id">
    ${this.head(subject)}
    <body>
      <div class="preheader">${subject} · ${APP_NAME}</div>
      <div class="container">
        <div class="email-content">
          <div class="email-header">
            <img src="${LOGO}" alt="${APP_NAME}">
          </div>

          <div class="eyebrow">Reset Password</div>

          <div class="email-body">
            <h1>Halo ${name}!</h1>
            <p>Anda menerima email ini karena ada permintaan untuk mengatur ulang password akun Anda di <strong>${APP_NAME}</strong>.</p>
            <p>Silakan klik tombol di bawah ini untuk mengatur ulang password Anda:</p>
            ${this.btn(resetUrl, "Reset Password")}
            <div class="divider"></div>
            <p class="muted">Jika Anda tidak meminta reset password, abaikan email ini. Password Anda akan tetap aman dan tidak berubah.</p>
          </div>

          <div class="email-footer">
            <p>Butuh bantuan? Hubungi kami di <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
            <p>${ADDRESS}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
