"use client"

import * as React from "react"
import { useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/routing"

import { Button } from "@/components/ui/button"

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const toggleLanguage = () => {
    const newLocale = locale === 'id' ? 'en' : 'id'
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="h-9 w-9"
    >
      <span className="">{locale === 'id' ? 'ID' : 'EN'}</span>
      <span className="sr-only">Toggle language</span>
    </Button>
  )
}
