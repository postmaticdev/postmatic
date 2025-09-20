"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Plus, X } from "lucide-react";
import { showToast } from "@/helper/show-toast";
import { useParams } from "next/navigation";
import { usePlatformKnowledgeGetAll } from "@/services/knowledge.api";
import { mapEnumPlatform } from "@/helper/map-enum-platform";
import { PlatformEnum } from "@/models/api/knowledge/platform.type";
import { cn } from "@/lib/utils";

interface ScheduleItemPickerProps {
  onAddItem: (time: string, platforms: PlatformEnum[]) => void;
  selectedItems: { time: string; platforms: PlatformEnum[] }[];
  onRemoveItem: (time: string) => void; // disederhanakan
}

export function ScheduleItemPicker({
  onAddItem,
  selectedItems,
  onRemoveItem,
}: ScheduleItemPickerProps) {
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [platforms, setPlatforms] = useState<PlatformEnum[]>([]);
  const { businessId } = useParams() as { businessId: string };
  const { data: dataPlatforms } = usePlatformKnowledgeGetAll(businessId);
  const availablePlatforms = (dataPlatforms?.data.data || []).filter(
    (p) => p.status === "connected"
  );

  const handleAddTime = () => {
    try {
      if (platforms.length === 0)
        throw new Error("Minimal 1 platform harus diisi");
      if (hour === "" || minute === "")
        throw new Error("Harap isi jam dan menit");

      const h = parseInt(hour, 10);
      const m = parseInt(minute, 10);
      if (Number.isNaN(h) || h < 0 || h > 23) throw new Error("Jam harus 0-23");
      if (Number.isNaN(m) || m < 0 || m > 59)
        throw new Error("Menit harus 0-59");

      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      const timeString = `${hh}:${mm}`;

      const exists = selectedItems.some((item) => item.time === timeString);
      if (exists) {
        throw new Error("Waktu ini sudah ditambahkan");
      }

      onAddItem(timeString, platforms);
      setHour("");
      setMinute("");
      setPlatforms([]);
    } catch (error) {
      showToast("error", error);
    }
  };

  const handleHourChange = (value: string) => {
    if (value === "") return setHour(value);
    const n = Number(value);
    if (!Number.isNaN(n) && n >= 0 && n <= 23) setHour(value);
  };

  const handleMinuteChange = (value: string) => {
    if (value === "") return setMinute(value);
    const n = Number(value);
    if (!Number.isNaN(n) && n >= 0 && n <= 59) setMinute(value);
  };

  const togglePlatform = (platform: PlatformEnum) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <div className="flex flex-col space-x-1">
          <div className="flex items-center space-x-1">
            <Input
              type="number"
              placeholder="09"
              value={hour}
              onChange={(e) => handleHourChange(e.target.value)}
              className="w-16 text-center"
              min="0"
              max="23"
            />
            <span className="text-muted-foreground">:</span>
            <Input
              type="number"
              placeholder="00"
              value={minute}
              onChange={(e) => handleMinuteChange(e.target.value)}
              className="w-16 text-center"
              min="0"
              max="59"
            />
            <div className="hidden sm:block">
              <Button onClick={handleAddTime} className="px-3">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <div className="flex flex-col space-x-1">
            <span className="text-muted-foreground text-sm mt-2">Platform</span>
            <div className="flex flex-wrap gap-2 w-full">
              {availablePlatforms.length > 0 ? (
                availablePlatforms.map((platform) => {
                  const p = platform.platform as PlatformEnum;
                  const selected = platforms.includes(p);
                  return (
                    <Button
                      key={platform.platform}
                      variant="outline"
                      onClick={() => togglePlatform(p)}
                      className={cn(
                        "flex-shrink-0",
                        selected
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="bg-background-secondary p-1 rounded-md">
                        {mapEnumPlatform.getPlatformIcon(p)}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          selected ? "text-white" : "text-muted-foreground"
                        )}
                      >
                        {mapEnumPlatform.getPlatformLabel(p)}
                      </span>
                    </Button>
                  );
                })
              ) : (
                <span className="text-muted-foreground text-sm">
                  Belum ada platform yang terhubung
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="block sm:hidden w-full">
        <Button onClick={handleAddTime} className="px-3 w-full">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {selectedItems.length > 0 && (
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Selected Times:</div>
          {selectedItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-muted rounded px-3 py-2"
            >
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{item.time}</span>
                <div className="flex flex-wrap gap-2 w-full">
                  {item.platforms.map((platform) => (
                    <span className="text-xs font-medium" key={platform}>
                      {mapEnumPlatform.getPlatformIcon(platform)}
                    </span>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(item.time)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
