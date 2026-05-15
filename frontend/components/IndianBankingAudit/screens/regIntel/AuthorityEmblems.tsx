'use client';

import React from 'react';
import type { SourceAuthorityEmblem } from '@/lib/IndianBankingAudit/regIntelSourceDocuments';

export function RBIEmblem({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden className="shrink-0">
      <circle cx="16" cy="16" r="13" stroke="#1F4E79" strokeWidth="2" />
      <text
        x="16"
        y="19"
        textAnchor="middle"
        className="fill-[#1F4E79] text-[8px] font-bold"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        RBI
      </text>
    </svg>
  );
}

export function FIUEmblem({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden className="shrink-0">
      <rect x="8" y="10" width="14" height="16" rx="1" stroke="#7B2D8B" strokeWidth="1.5" />
      <path d="M12 14h6M12 17h6M12 20h4" stroke="#7B2D8B" strokeWidth="1" strokeLinecap="round" />
      <circle cx="22" cy="12" r="5" stroke="#7B2D8B" strokeWidth="1.5" />
      <path d="M20.5 12h3M22 10.5v3" stroke="#7B2D8B" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function CERTInEmblem({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden className="shrink-0">
      <path d="M8 22L16 6l8 16H8z" stroke="#C0392B" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M14 18h4l-2-5-2 5z" fill="#C0392B" />
    </svg>
  );
}

export function SEBIEmblem({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden className="shrink-0">
      <path d="M8 22h16" stroke="#E8700A" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 22V12l5-4 5 4v10" stroke="#E8700A" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="16" cy="15" r="2" fill="#E8700A" />
    </svg>
  );
}

export function NPCIEmblem({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden className="shrink-0">
      <path
        d="M16 6a10 10 0 110 20 10 10 0 010-20z"
        stroke="#006FB4"
        strokeWidth="1.75"
        strokeDasharray="4 3"
        fill="none"
      />
      <path d="M22 10c2 2 2 10-6 12" stroke="#006FB4" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function MOFEmblem({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden className="shrink-0">
      <path d="M8 24V14l4-4h8l4 4v10H8z" stroke="#2C7A2C" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 18h8M12 21h6" stroke="#2C7A2C" strokeWidth="1" strokeLinecap="round" />
      <path d="M14 10V8h4v2" stroke="#2C7A2C" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function PeerRingsEmblem({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden className="shrink-0">
      <circle cx="13" cy="16" r="8" stroke="#B7580A" strokeWidth="1.75" />
      <circle cx="19" cy="16" r="8" stroke="#B7580A" strokeWidth="1.75" opacity={0.55} />
    </svg>
  );
}

export function AuthorityEmblemFor({ kind, size = 32 }: { kind: SourceAuthorityEmblem; size?: number }) {
  switch (kind) {
    case 'RBI':
      return <RBIEmblem size={size} />;
    case 'FIU-IND':
      return <FIUEmblem size={size} />;
    case 'CERT-IN':
      return <CERTInEmblem size={size} />;
    case 'SEBI':
      return <SEBIEmblem size={size} />;
    case 'NPCI':
      return <NPCIEmblem size={size} />;
    case 'MOF':
      return <MOFEmblem size={size} />;
    case 'PEER':
      return <PeerRingsEmblem size={size} />;
    default:
      return <RBIEmblem size={size} />;
  }
}
