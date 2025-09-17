"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { TimePicker } from "@/components/ui/time-picker";
import { Calendar } from "lucide-react";
import {
  useContentSchedulerAutoGetSettings,
  useContentSchedulerAutoUpsertSetting,
} from "@/services/content/content.api";
import { useParams } from "next/navigation";
import { showToast } from "@/helper/show-toast";



export function AutoPosting() {
  const { businessId } = useParams() as { businessId: string };
  const { data: scheduleData } = useContentSchedulerAutoGetSettings(businessId);
  const globalEnabled = scheduleData?.data.data.isAutoPosting || false;
  const schedules = scheduleData?.data.data.schedulerAutoPostings || [];
  const mUpsertSetting = useContentSchedulerAutoUpsertSetting();

  const setGlobalEnabled = async () => {
    try {
      const res = await mUpsertSetting.mutateAsync({
        businessId,
        formData: {
          isAutoPosting: !globalEnabled,
          schedulerAutoPostings: schedules,
        },
      });
      showToast("success", res.data.responseMessage);
    } catch {}
  };

  const toggleDay = async (day: string) => {
    try {
      const findDay = schedules.find((schedule) => schedule.day === day);
      const res = await mUpsertSetting.mutateAsync({
        businessId,
        formData: {
          isAutoPosting: globalEnabled,
          schedulerAutoPostings: schedules.map((schedule) =>
            schedule.day === day
              ? { ...schedule, isActive: !findDay?.isActive }
              : schedule
          ),
        },
      });
      showToast("success", res.data.responseMessage);
    } catch {}
  };

  const addTime = async (day: string, time: string) => {
    try {
      const newSchedules = [...schedules];
      const findDay = newSchedules.find((schedule) => schedule.day === day);
      if (findDay) {
        findDay.times.push(time);
      }
      const payload = {
        isAutoPosting: globalEnabled,
        schedulerAutoPostings: newSchedules,
      };

      const res = await mUpsertSetting.mutateAsync({
        businessId,
        formData: payload,
      });
      showToast("success", res.data.responseMessage);
    } catch {}
  };

  const removeTime = async (day: string, timeToRemove: string) => {
    try {
      const findSchedule = schedules.find(
        (schedule) => schedule.day === day
      )?.times;
      const newSchedules = [...schedules];
      if (findSchedule) {
        findSchedule.splice(findSchedule.indexOf(timeToRemove), 1);
      }

      const res = await mUpsertSetting.mutateAsync({
        businessId,
        formData: {
          isAutoPosting: globalEnabled,
          schedulerAutoPostings: newSchedules,
        },
      });
      showToast("success", res.data.responseMessage);
    } catch {}
  };

  return (
    <Card className="h-full">
      <CardContent className="py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Auto Posting</h2>
            <Switch
              checked={globalEnabled}
              onCheckedChange={setGlobalEnabled}
            />
          </div>

          <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
            {schedules.map((schedule) => (
              <Card key={schedule.day} className="bg-gray-50 dark:bg-gray-800">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{schedule.day}</span>
                    </div>
                    <Switch
                      checked={schedule.isActive && globalEnabled}
                      onCheckedChange={() => toggleDay(schedule.day)}
                      disabled={!globalEnabled}
                    />
                  </div>

                  {schedule.isActive && globalEnabled && (
                    <div className="mt-3">
                      <TimePicker
                        onTimeSelect={(time) => addTime(schedule.day, time)}
                        selectedTimes={schedule.times}
                        onRemoveTime={(time) => removeTime(schedule.day, time)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
