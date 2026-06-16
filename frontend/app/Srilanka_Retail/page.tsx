import { redirect } from "next/navigation";
import { LATEST_SRILANKA_RETAIL_VERSION, SRILANKA_RETAIL_PATHS } from "../select_region/srilankaRetailVersions";

export default function SrilankaRetailIndexPage() {
  redirect(SRILANKA_RETAIL_PATHS[LATEST_SRILANKA_RETAIL_VERSION]);
}
