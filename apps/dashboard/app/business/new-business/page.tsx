import { Suspense } from "react";
import NewBusinessClient from "./client";

export default function NewBusiness() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewBusinessClient />
    </Suspense>
  );
}
