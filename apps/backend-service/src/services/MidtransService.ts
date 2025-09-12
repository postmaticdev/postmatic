import axios, { AxiosError, AxiosInstance } from "axios";
import { BaseService } from "./BaseService";
import {
  MIDTRANS_IS_PRODUCTION,
  MIDTRANS_SERVER_KEY,
} from "../constant/midtrans";
import {
  GopayPayload,
  MidtransGopayResponseCharge,
  BankTransferPayload,
  MidtransBankTransferResponseCharge,
  MidtransResponseCheckStatusDTO,
} from "../validators/MidtransValidator";
import crypto from "crypto";

export class MidtransService extends BaseService {
  private MIDTRANS_API_URL = MIDTRANS_IS_PRODUCTION
    ? "https://api.midtrans.com/v2"
    : "https://api.sandbox.midtrans.com/v2";

  private midtrans: AxiosInstance;

  constructor() {
    super();
    this.midtrans = axios.create({
      baseURL: this.MIDTRANS_API_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64"),
      },
    });
  }

  async getGoPayQrPng(
    idOrOrderId: string,
    actionsUrl?: string, // URL dari actions.generate-qr-code (recommended)
    maxRetry = 6 // total ~ (0.3 + 0.6 + 1.2 + 2.4 + 4.8 + 9.6)s = ~19s
  ): Promise<Buffer> {
    const st = await this.getStatus(idOrOrderId);
    console.log(
      "[ST]",
      st.transaction_id,
      st.transaction_status,
      // st.expiry_time
    );

    if (["expire", "cancel"].includes(String(st.transaction_status))) {
      throw new Error(
        `Transaction is ${st.transaction_status}; QR no longer available`
      );
    }

    const url = actionsUrl ? actionsUrl : `/gopay/${st.transaction_id}/qr-code`;

    const doFetch = async (accept: "image/png" | "application/json") => {
      const isAbs = /^https?:\/\//i.test(url);
      return await this.midtrans.get(isAbs ? url : url, {
        baseURL: isAbs ? undefined : this.MIDTRANS_API_URL,
        responseType: accept === "image/png" ? "arraybuffer" : "text",
        headers: { Accept: accept },
        validateStatus: () => true,
      });
    };

    // small helper delay
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // Retry loop: QR GoPay kadang belum siap persis setelah charge.
    let lastRes: any;
    for (let i = 0; i < maxRetry; i++) {
      const res = await doFetch("image/png");
      lastRes = res;
      const ct = String(res.headers["content-type"] || "");
      if (res.status >= 200 && res.status < 300 && ct.includes("image/png")) {
        return Buffer.from(res.data as ArrayBuffer);
      }

      // 404 PNG kosong → sering berarti resource belum/ tidak tersedia
      if (res.status === 404) {
        // coba tunggu dan retry
        const backoff = Math.round(300 * Math.pow(2, i)); // 300ms, 600ms, 1200ms, ...
        console.log(
          `[QR] 404 png; retry in ${backoff}ms (${i + 1}/${maxRetry})`
        );
        await sleep(backoff);
        continue;
      }

      // Untuk non-404, coba preflight JSON (kalau-server berubah balas JSON)
      const pre = await doFetch("application/json");
      console.log("[QR] preflight", pre.status, pre.headers["content-type"]);
      if (pre.status >= 200 && pre.status < 300) {
        // just wait & retry—server kadang balik 200 text kosong
        const backoff = Math.round(300 * Math.pow(2, i));
        await sleep(backoff);
        continue;
      }
    }

    // Gagal total → berikan pesan + saran fallback
    const ct = String(lastRes?.headers?.["content-type"] || "");
    const body =
      typeof lastRes?.data === "string"
        ? lastRes.data
        : Buffer.isBuffer(lastRes?.data)
        ? lastRes.data.toString("utf8")
        : JSON.stringify(lastRes?.data || {});
    throw new Error(
      `GoPay QR not available (HTTP ${lastRes?.status}, CT: ${ct}). ` +
        `Likely your MID only has GoPay deeplink enabled. ` +
        `Use actions.deeplink-redirect for mobile, or switch to QRIS (acquirer: gopay) for desktop QR.`
    );
  }

  async gopayCharge(payload: GopayPayload): Promise<MidtransGopayResponseCharge> {
    console.log("============PAYLOAD==============");
    console.log(payload);
    console.log("============PAYLOAD==============");
    const response = await this.midtrans.post<MidtransGopayResponseCharge>(
      "/charge",
      payload
    );
    console.log("============RESPONSE=============");
    console.log(response.data);
    console.log("============RESPONSE=============");
    return response.data;
  }

  async bankCharge(
    payload: BankTransferPayload
  ): Promise<MidtransBankTransferResponseCharge> {
    console.log("============PAYLOAD==============");
    console.log(payload);
    console.log("============PAYLOAD==============");
    const response =
      await this.midtrans.post<MidtransBankTransferResponseCharge>(
        "/charge",
        payload
      );
    console.log("============RESPONSE=============");
    console.log(response.data);
    console.log("============RESPONSE=============");
    return response.data;
  }

  async getStatus(orderId: string): Promise<MidtransResponseCheckStatusDTO> {
    const response = await this.midtrans.get<MidtransResponseCheckStatusDTO>(
      `/${orderId}/status`
    );
    return response.data;
  }

  async cancelTransaction(orderId: string): Promise<any> {
    const response = await this.midtrans.post(`/${orderId}/cancel`);
    return response.data;
  }

  async expireTransaction(orderId: string): Promise<any> {
    const response = await this.midtrans.post(`/${orderId}/expire`);
    return response.data;
  }

  isValidSignature = (data: {
    order_id: string;
    status_code: string;
    gross_amount: string;
    signature_key: string;
  }): boolean => {
    const raw =
      data.order_id +
      data.status_code +
      data.gross_amount +
      MIDTRANS_SERVER_KEY;
    const expected = crypto.createHash("sha512").update(raw).digest("hex");
    return expected === data.signature_key;
  };
}
