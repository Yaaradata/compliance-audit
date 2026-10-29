import { redirect } from "next/navigation";
import { LATEST_UK_BOARD_VERSION, UK_BOARD_PATHS } from "@/app/select_region/ukBoardVersions";

export default function UKBoardIndexPage() {
  redirect(UK_BOARD_PATHS[LATEST_UK_BOARD_VERSION]);
}
