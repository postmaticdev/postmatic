"use client";

import { GenerateFormAdvanced } from "./generate-form-advanced";
import { GenerateFormBasic } from "./generate-form-basic";

export function GenerateFormBase() {
  return (
    <>
      <GenerateFormBasic />
      <GenerateFormAdvanced />
    </>
  );
}
