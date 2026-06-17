"use client";

import Image from "next/image";
import { useKeystoneV4Colors } from "../theme/KeystoneV4ThemeProvider";

export function BrandMark() {
  const C = useKeystoneV4Colors();
  return (
    <div className="flex flex-col items-start gap-2 px-5 py-5">
      <Image
        src="/Lion_Brewery_logo.svg.png"
        alt="Lion Brewery (Ceylon) PLC"
        width={148}
        height={40}
        priority
        className="h-9 w-auto max-w-[148px] object-contain object-left"
      />
      <div className="text-[10px] font-medium leading-tight" style={{ color: C.faint }}>
        Lion Brewery (Ceylon) PLC
      </div>
    </div>
  );
}
