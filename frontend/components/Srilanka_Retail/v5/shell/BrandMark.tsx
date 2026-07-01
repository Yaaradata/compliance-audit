"use client";

import Image from "next/image";
import { useKeystoneV5Colors } from "../theme/KeystoneV5ThemeProvider";

const LION_LOGO_SRC = "/Lion_Brewery_logo.svg.png";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const C = useKeystoneV5Colors();

  if (compact) {
    return (
      <div className="flex justify-center">
        <Image
          src={LION_LOGO_SRC}
          alt="Lion Brewery (Ceylon) PLC"
          width={36}
          height={36}
          priority
          className="h-9 w-9 object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-start gap-1">
      <Image
        src={LION_LOGO_SRC}
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
