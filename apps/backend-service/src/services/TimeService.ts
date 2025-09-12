import { BaseService } from "./BaseService";
import moment from "moment-timezone";

export class TimeService extends BaseService {
  getAllTimezonesWithOffset() {
    try {
      const timezones = moment.tz.names();

      const formatted = timezones.map((tz) => {
        const offset = moment.tz(tz).format("Z");
        return {
          name: tz,
          offset, // e.g., "+07:00"
          label: `(GMT${offset}) ${tz}`,
        };
      });

      return formatted.sort((a, b) => {
        return moment.tz(a.name).utcOffset() - moment.tz(b.name).utcOffset();
      });
    } catch (error) {
      this.handleError("TimeService.getAllTimezonesWithOffset", error);
    }
  }
}
