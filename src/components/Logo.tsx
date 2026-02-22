// src/components/Logo.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export default function Logo({ clickable = true }: { clickable?: boolean }) {
  const logo = (
    <div className="flex items-center gap-2">
      {/* Sipher Logo Icon — replace with /public/logo.svg when ready */}
      <Image
        src="/logo.jpg"
        alt="Sipher Logo"
        width={28}
        height={28}
        priority
        className="drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]"
      />
      <span className="text-lg font-semibold tracking-wide text-white">
        Sipher<span className="text-purple-400">*</span>
      </span>
    </div>
  );

  return clickable ? <Link href="/">{logo}</Link> : logo;
}
