"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ScheduleItemPicker } from "@/components/ui/schedule-item-picker";
import { Calendar } from "lucide-react";
import { useContentSchedulerAutoGetSettings } from "@/services/content/content.api";
import { useParams } from "next/navigation";
import { PlatformEnum } from "@/models/api/knowledge/platform.type";
import {
  AutoSchedulerAutosaveProvider,
  useAutoSchedulerAutosave,
} from "@/contexts/auto-scheduler-autosave-context";

function AutoPostingInner() {
  const {
    enabled: globalEnabled,
    schedules,
    setGlobalEnabled,
    toggleDay,
    addTime,
    removeTime,
  } = useAutoSchedulerAutosave();

  return (
    <Card className="h-full">
      <CardContent className="py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Auto Posting</h2>
            <Switch
              checked={globalEnabled}
              onCheckedChange={(v) => setGlobalEnabled(v)}
            />
          </div>

          <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
            {schedules.schedulerAutoPostings.map((schedule) => (
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
                      <ScheduleItemPicker
                        onAddItem={(time, platforms) =>
                          addTime(
                            schedule.day,
                            time,
                            platforms as PlatformEnum[]
                          )
                        }
                        selectedItems={schedule.schedulerAutoPostingTimes.map(
                          (t) => ({
                            time: t.hhmm,
                            platforms: t.platforms as PlatformEnum[],
                          })
                        )}
                        onRemoveItem={(time) => removeTime(schedule.day, time)}
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

export function AutoPosting() {
  const { businessId } = useParams() as { businessId: string };
  const { data: scheduleData, isLoading } =
    useContentSchedulerAutoGetSettings(businessId);

  const globalEnabled = scheduleData?.data.data.isAutoPosting || false;
  const schedules = scheduleData?.data.data || {
    id: 0,
    isAutoPosting: false,
    rootBusinessId: "",
    schedulerAutoPostings: [],
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="py-6">Loading…</CardContent>
      </Card>
    );
  }

  return (
    <AutoSchedulerAutosaveProvider
      businessId={businessId}
      initialEnabled={globalEnabled}
      initialSchedules={schedules}
    >
      <AutoPostingInner />
    </AutoSchedulerAutosaveProvider>
  );
}
