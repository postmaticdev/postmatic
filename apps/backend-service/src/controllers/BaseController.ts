import { Request, Response } from "express";
import { BACKEND_URL, DASHBOARD_URL, LANDINGPAGE_URL, LOGO } from "../constant";
import { Pagination } from "../services/BaseService";
import { FilterQueryType } from "../middleware/use-filter";

export class BaseController {
  protected sendSuccess(
    res: Response,
    data: any,
    message = "Success",
    code = 200,
    pagination?: Pagination,
    filterQuery?: FilterQueryType
  ) {
    return res.status(code).json({
      metaData: this.metaData(code),
      responseMessage: message,
      data,
      pagination,
      filterQuery,
    });
  }

  public metaData(code: number) {
    let message = "OK";
    switch (code) {
      case 200:
        message = "OK";
        break;
      case 201:
        message = "Created";
        break;
      case 204:
        message = "No Content";
        break;
      case 400:
        message = "Bad Request";
        break;
      case 401:
        message = "Unauthorized";
        break;
      case 403:
        message = "Forbidden";
        break;
      case 404:
        message = "Not Found";
        break;
      case 500:
        message = "Internal Server Error";
        break;
      default:
        break;
    }
    return {
      code,
      message,
    };
  }

  protected sendCreated(res: Response, data: any, message = "Created") {
    return res
      .status(201)
      .json({ metaData: this.metaData(201), responseMessage: message, data });
  }

  protected sendError(res: Response, error: Error | unknown, code = 500) {
    let message = "Internal server error";
    if (error instanceof Error) {
      message = error?.message || "Internal server error";
    }
    if (error instanceof Error && error.message?.includes("found")) {
      return this.notFound(res);
    }
    if (code === 500) {
      console.error("ERROR : ", message);
    }
    return res
      .status(code)
      .json({ metaData: this.metaData(code), responseMessage: message });
  }

  protected notFound(res: Response, message = "Data tidak ditemukan") {
    return res
      .status(404)
      .json({ metaData: this.metaData(404), responseMessage: message });
  }

  protected badRequest(res: Response, message = "Permintaan tidak valid") {
    return res
      .status(400)
      .json({ metaData: this.metaData(400), responseMessage: message });
  }

  protected unauthorized(res: Response, message = "Anda tidak memiliki akses") {
    return res
      .status(401)
      .json({ metaData: this.metaData(401), responseMessage: message });
  }

  protected forbidden(res: Response, message = "Anda tidak memiliki akses") {
    return res
      .status(403)
      .json({ metaData: this.metaData(403), responseMessage: message });
  }

  protected redirectToServer(res: Response, url?: string) {
    return res.redirect(url || "/");
  }

  protected redirectToClient(res: Response, to?: string) {
    const isAbsolute = /^https?:\/\//i.test(to || "");
    const path = to?.startsWith("/") ? to : `/${to}`;

    const target = isAbsolute ? to : new URL(path, DASHBOARD_URL).toString(); // jadikan absolute ke FE
    const status = 303;

    // PENTING: gunakan 303 utk POST -> GET agar tidak re-POST cross-origin
    return res.status(status).redirect(target || DASHBOARD_URL);
  }

  protected redirect(res: Response, url: string) {
    return res.redirect(url);
  }

  protected renderView(
    req: Request,
    res: Response,
    view: string,
    data: Record<string, any> = {},
    statusCode: number = 200
  ) {
    try {
      return res.status(statusCode).render(view, {
        ...data,
        DASHBOARD_URL,
        LANDINGPAGE_URL,
        BACKEND_URL,
        LOGO,
        csrfToken: req?.csrfToken(),
        metaData: this.metaData(200),
      });
    } catch (error) {
      console.error("ERROR : ", error);
      return res.status(statusCode).render(view, {
        ...data,
        DASHBOARD_URL,
        LANDINGPAGE_URL,
        BACKEND_URL,
        LOGO,
        csrfToken: "",
        metaData: this.metaData(200),
      });
    }
  }

  protected renderViewError(
    req: Request,
    res: Response,
    data: ErrorViewData = {}
  ) {
    return this.renderView(
      req,
      res,
      "error",
      {
        ...data,
        metaData: this.metaData(data.code || 500),
      },
      data.code || 500
    );
  }
}

interface ErrorViewData {
  title?: string;
  description?: string;
  code?: number;
  ctaText?: string;
  ctaHref?: string;
}
