"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
  rows?: number
  error?: string
  onFocus?: () => void
}

export function TextField({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  multiline = false,
  rows = 3,
  error,
  onFocus
}: TextFieldProps) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          onFocus={onFocus}
          className={`w-full bg-background-secondary ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={onFocus}
          className={`w-full bg-background-secondary ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        />
      )}
      {error && (
        <div className="flex items-center gap-1">
          <Info className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  )
}
