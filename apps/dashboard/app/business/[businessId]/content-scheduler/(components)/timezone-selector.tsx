"use client";

import {
  useContentSchedulerTimezoneGetTimezone,
  useContentSchedulerTimezoneUpsertTimezone,
} from "@/services/content/content.api";
import { useParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { showToast } from "@/helper/show-toast";
import { useLibraryTime } from "@/services/library.api";

export function TimezoneSelector() {
  const { businessId } = useParams() as { businessId: string };
  const { data: timezone } = useContentSchedulerTimezoneGetTimezone(businessId);
  const { data: libraryTimezone } = useLibraryTime();
  const timezones = libraryTimezone?.data.data || [];
  const mUpdateTimezone = useContentSchedulerTimezoneUpsertTimezone();
  const onUpdate = async (value: string) => {
    try {
      const res = await mUpdateTimezone.mutateAsync({
        businessId,
        formData: {
          timezone: value,
        },
      });
      showToast("success", res.data.responseMessage);
    } catch {}
  };
  return (
    <Select
      value={timezone?.data.data.timezone}
      onValueChange={(value) => {
        onUpdate(value);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {timezones.map((timezone) => (
          <SelectItem key={timezone.name} value={timezone.name}>
            ({timezone.offset}) {timezone.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
