"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Clock, Plus, X } from "lucide-react";
import { showToast } from "@/helper/show-toast";

interface TimePickerProps {
  onTimeSelect: (time: string) => void;
  selectedTimes: string[];
  onRemoveTime: (time: string) => void;
}

export function TimePicker({
  onTimeSelect,
  selectedTimes,
  onRemoveTime,
}: TimePickerProps) {
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");

  const handleAddTime = () => {
    try {
      if (hour && minute) {
        // Convert to 24-hour format
        const hour24 = parseInt(hour);

        const timeString = `${hour24
          .toString()
          .padStart(2, "0")}:${minute.padStart(2, "0")}`;

        // Check if time already exists
        if (!selectedTimes.includes(timeString)) {
          onTimeSelect(timeString);
          setHour("");
          setMinute("");
        } else {
          throw new Error("Waktu ini sudah ditambahkan");
        }
      } else {
        throw new Error("Harap isi jam dan menit");
      }
    } catch (error) {
      showToast("error", error);
    }
  };

  const handleHourChange = (value: string) => {
    const numValue = parseInt(value);
    if (value === "" || (numValue >= 1 && numValue <= 24)) {
      setHour(value);
    }
  };

  const handleMinuteChange = (value: string) => {
    const numValue = parseInt(value);
    if (value === "" || (numValue >= 0 && numValue <= 59)) {
      setMinute(value);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Input
            type="number"
            placeholder="12"
            value={hour}
            onChange={(e) => handleHourChange(e.target.value)}
            className="w-16 text-center"
            min="1"
            max="12"
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
        </div>

        <div className="hidden sm:block">
          <Button onClick={handleAddTime} className="px-3">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
      <div className="block sm:hidden w-full">
        <Button onClick={handleAddTime} className="px-3 w-full">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {selectedTimes.length > 0 && (
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Selected Times:</div>
          {selectedTimes.map((time, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-muted rounded px-3 py-2"
            >
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{time}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveTime(time)}
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
