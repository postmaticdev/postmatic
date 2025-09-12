import { BaseService } from "./BaseService";
import path from "path";
import fs from "fs";
import axios from "axios";

export class ImageManipulationService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Resolve path relative to the /temp directory
   */
  resolveTempPath(...segments: string[]): string {
    if (!fs.existsSync(path.join(process.cwd(), "temp"))) {
      fs.mkdirSync(path.join(process.cwd(), "temp"), { recursive: true });
    }
    return path.join(process.cwd(), "temp", ...segments);
  }

  /**
   * Remove file if exists
   */
  removeIfExists(filePath: string | string[]) {
    if (Array.isArray(filePath)) {
      filePath.forEach((file) => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
    } else {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  /**
   * Write base64 string to a file in the /temp directory
   * @param base64 Base64 encoded string
   * @param extension Optional file extension (e.g., .png, .jpg)
   * @returns The path to the written file
   */
  private writeFromBase64(base64: string, extension: string = ""): string {
    const randomName = Math.random().toString(36).substring(2, 15);
    const tempPath = this.resolveTempPath(`${randomName}${extension}`);
    if (!fs.existsSync(tempPath)) {
      fs.writeFileSync(tempPath, Buffer.from(base64, "base64"));
    }
    return tempPath;
  }

  /**
   * Downloads a file from the given URL and saves it to a temporary file
   * in the /temp directory. Returns the path to the saved file.
   * @param url The URL of the file to download
   * @param extension Optional file extension (e.g., .png, .jpg)
   * @returns The path to the saved file
   */
  private async writeFromUrl(
    url: string,
    extension: string = ""
  ): Promise<string> {
    const randomName = Math.random().toString(36).substring(2, 15);
    const tempPath = this.resolveTempPath(`${randomName}${extension}`);
    if (!fs.existsSync(tempPath)) {
      try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(tempPath, response.data);
        return tempPath;
      } catch (error) {
        throw error;
      }
    }
    return tempPath;
  }

  /**
   * Writes content to a temporary file in the /temp directory. If the content
   * is a URL, it downloads the file from the URL. If the content is a base64
   * encoded string, it writes the decoded data. Returns the path to the saved file.
   * @param content The content to write, either a URL or a base64 encoded string.
   * @param extension Optional file extension (e.g., .png, .jpg).
   * @returns A promise that resolves to the path of the written file.
   */

  async write(content: string | null, extension: string = ""): Promise<string> {
    if (!content) return "";
    if (content.includes("http")) {
      return await this.writeFromUrl(content, extension);
    } else {
      return this.writeFromBase64(content, extension);
    }
  }
}
