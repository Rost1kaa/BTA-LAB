import type { Metadata } from "next";
import { ApplyPageClient } from "./apply-page-client";

export const metadata: Metadata = {
  title: "Apply | Entrepreneur Support Campaign",
  description: "Apply for the BTA LAB Entrepreneur Support Campaign",
};

export default function EntrepreneurSupportApplyPage() {
  return <ApplyPageClient />;
}
