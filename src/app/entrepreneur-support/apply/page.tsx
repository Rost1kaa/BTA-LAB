import type { Metadata } from "next";
import { ApplyPageClient } from "./apply-page-client";

export const metadata: Metadata = {
  title: "განაცხადის გაგზავნა",
};

export default function EntrepreneurSupportApplyPage() {
  return <ApplyPageClient />;
}
