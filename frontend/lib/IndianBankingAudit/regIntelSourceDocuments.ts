/**
 * V2 Pass 4 — full Source Document seed for SourceDocumentDrawer.
 * Keys MUST match `instrument_ref` on each record in `regIntelMockData.ts`.
 */

export interface SourceDocumentParagraph {
  anchor: string;
  text: string;
}

export interface SourceDocumentAnnexure {
  ref: string;
  title: string;
}

export type SourceAuthorityEmblem = 'RBI' | 'FIU-IND' | 'CERT-IN' | 'SEBI' | 'NPCI' | 'MOF' | 'PEER';

export interface SourceDocument {
  instrument_ref: string;
  title: string;
  publication_date: string;
  effective_date: string | null;
  issuing_authority: string;
  signatory_role: string;
  signatory_name: string;
  body_paragraphs: SourceDocumentParagraph[];
  key_provisions: string[];
  annexures: SourceDocumentAnnexure[];
  applicability_scope: string;
  metadata: Record<string, string>;
  source_url: string;
  last_synced_at: string;
  source_hash: string;
  authority_emblem: SourceAuthorityEmblem;
}

export const sourceDocuments: Record<string, SourceDocument> = {
  'RBI/2025-26/51 DOR.AML.REC.30/14.01.001/2025-26': {
    instrument_ref: 'RBI/2025-26/51 DOR.AML.REC.30/14.01.001/2025-26',
    title: 'Reserve Bank of India (Know Your Customer (KYC)) (Amendment) Directions, 2025',
    publication_date: '2025-06-12',
    effective_date: '2026-01-01',
    issuing_authority: 'Department of Regulation, Reserve Bank of India',
    signatory_role: 'Chief General Manager',
    signatory_name: 'J.P. Sharma',
    authority_emblem: 'RBI',
    body_paragraphs: [
      {
        anchor: 'Para 1',
        text: 'Please refer to instructions on updation/periodic updation of KYC as contained in paragraph 38 of Master Direction — Know Your Customer (KYC) Direction, 2016 dated February 25, 2016 (as amended from time to time).',
      },
      {
        anchor: 'Para 2',
        text: 'The Reserve Bank has observed a large pendency in periodic updation of KYC including in the accounts opened for credit of Direct Benefit Transfer (DBT)/Electronic Benefit Transfer (EBT) under Government schemes.',
      },
      {
        anchor: 'Para 3',
        text: 'These Directions shall be called the Reserve Bank of India (Know Your Customer) (Amendment) Directions, 2025 and shall come into force with immediate effect.',
      },
      {
        anchor: 'Para 38(a)',
        text: 'The Regulated Entity (RE) shall complete the periodic updation of KYC within one year of its falling due for KYC or upto June 30, 2026, whichever is later. The RE shall subject accounts of such customers to regular monitoring. This shall also be applicable to low-risk individual customers for whom periodic updation of KYC has already fallen due.',
      },
      {
        anchor: 'Para 38(b)',
        text: 'It is, however, reiterated that the ultimate responsibility for periodic updation of KYC remains with the bank concerned.',
      },
      {
        anchor: 'Para 38(e)',
        text: "The RE shall intimate its customers, in advance, to update their KYC. Prior to the due date of periodic updation of KYC, the RE shall give at least three advance intimations, including at least one intimation by letter, at appropriate intervals to its customers through available communication options/channels. The intimation/reminder shall outline KYC instructions, escalation mechanism for seeking help, if required, and the consequences, if any, of failure to update KYC in time. Issue of such advance intimation/reminder shall be duly recorded in the RE's system against each customer for audit trail.",
      },
      {
        anchor: 'Para 38(f)',
        text: 'After the due date of periodic updation of KYC, the RE shall give at least three reminders, including at least one reminder by letter, at appropriate intervals to its customers through available communication options/channels.',
      },
      {
        anchor: 'Para 4',
        text: 'All other instructions contained in the Master Direction shall remain unchanged. REs are advised to implement the above requirements by January 1, 2026.',
      },
    ],
    key_provisions: [
      'Periodic KYC update window extended to 1 year from due date or June 30, 2026 — whichever is later — for low-risk individual customers.',
      'Three advance intimations including 1 by letter mandatory before KYC due date.',
      'Three reminders including 1 by letter mandatory after due date.',
      'Audit trail of every intimation and reminder to be recorded in RE systems.',
      'Implementation deadline: January 1, 2026.',
    ],
    annexures: [
      { ref: 'Annex A', title: 'Format for KYC Reminder Letter' },
      { ref: 'Annex B', title: 'Audit Trail Schema for KYC Reminders' },
    ],
    applicability_scope:
      'All Regulated Entities — commercial banks, payments banks, small finance banks, regional rural banks, primary (urban) cooperative banks, state cooperative banks, NBFCs, housing finance companies, and other applicable financial institutions.',
    metadata: {
      'Document Type': 'Master Direction Amendment',
      Department: 'Department of Regulation (DoR)',
      'AML Reference': 'DOR.AML.REC.30',
      'Statutory Basis': 'Banking Regulation Act 1949 Sections 35A & 56; RBI Act 1934 Section 45JA; PMLA 2002',
      Pages: '4',
      Annexures: '2',
    },
    source_url:
      'https://website.rbi.org.in/web/rbi/-/notifications/reserve-bank-of-india-know-your-customer-kyc-amendment-directions-2025',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_hash: '0xa1b2c3d4e5f6',
  },

  'CERT-In Directions 28 April 2022 (No. 20(3)/2022-CERT-In)': {
    instrument_ref: 'CERT-In Directions 28 April 2022 (No. 20(3)/2022-CERT-In)',
    title:
      'Directions under sub-section (6) of Section 70B of the IT Act, 2000 relating to information security practices, procedure, prevention, response and reporting of cyber incidents',
    publication_date: '2022-04-28',
    effective_date: '2022-06-27',
    issuing_authority:
      'Indian Computer Emergency Response Team (CERT-In), Ministry of Electronics and Information Technology, Government of India',
    signatory_role: 'Director General',
    signatory_name: 'Dr. Sanjay Bahl',
    authority_emblem: 'CERT-IN',
    body_paragraphs: [
      {
        anchor: 'Preamble',
        text: 'In exercise of the powers conferred by sub-section (6) of section 70B of the Information Technology Act, 2000 (IT Act) and after due consideration, the Director General, CERT-In hereby issues the following directions, which shall be effective after sixty (60) days from the date of this notification.',
      },
      {
        anchor: 'Direction (i)',
        text: 'Any service provider, intermediary, data centre, body corporate and Government organisation shall, when required by order/direction of CERT-In, take action or provide information for the purposes of cyber security mitigation actions, threat detection and response.',
      },
      {
        anchor: 'Direction (ii)',
        text: 'Any service provider, intermediary, data centre, body corporate and Government organisation shall mandatorily report cyber incidents as mentioned in Annexure I to CERT-In within 6 hours of noticing such incidents or being brought to notice about such incidents.',
      },
      {
        anchor: 'Direction (iii)',
        text: 'All service providers, intermediaries, data centres, body corporates and Government organisations shall connect to the Network Time Protocol (NTP) Server of National Informatics Centre (NIC) or National Physical Laboratory (NPL) or with NTP servers traceable to these NTP servers, for synchronisation of all their ICT systems clocks.',
      },
      {
        anchor: 'Direction (iv)',
        text: 'All service providers, intermediaries, data centres, body corporates and Government organisations shall mandatorily enable logs of all their ICT systems and maintain them securely for a rolling period of 180 days and the same shall be maintained within the Indian jurisdiction.',
      },
      {
        anchor: 'Direction (v)',
        text: 'Data Centres, Virtual Private Server (VPS) providers, Cloud Service providers and Virtual Private Network Service (VPN Service) providers shall be required to register and maintain accurate information of subscribers/customers hiring the services for a period of 5 years or longer duration as mandated by the law after any cancellation or withdrawal of the registration.',
      },
      {
        anchor: 'Direction (vi)',
        text: 'The virtual asset service providers, virtual asset exchange providers and custodian wallet providers shall mandatorily maintain all information obtained as part of Know Your Customer (KYC) and records of financial transactions for a period of five years.',
      },
    ],
    key_provisions: [
      '6-hour reporting clock from time of noticing the incident.',
      '20 categories of mandatorily reportable cyber incidents (Annex I).',
      '180-day rolling log retention within Indian jurisdiction.',
      'Clock synchronisation with NIC/NPL NTP servers required.',
      '5-year KYC retention for VPN, datacentre, cloud, and crypto exchange providers.',
      'Penalty up to ₹1 lakh per day under IT Act Section 70B for non-compliance.',
    ],
    annexures: [
      { ref: 'Annex I', title: 'List of 20 Mandatorily Reportable Cyber Incidents' },
      { ref: 'Annex II', title: 'Incident Reporting Format' },
    ],
    applicability_scope:
      'All service providers, intermediaries, data centres, body corporates, and Government organisations operating in India. Includes banks, NBFCs, insurers, payment aggregators, telecom providers, data centres, cloud and VPN service providers, virtual asset service providers.',
    metadata: {
      'Document Type': 'Direction under IT Act Section 70B(6)',
      Ministry: 'Ministry of Electronics and Information Technology',
      Effective: '60 days from notification (June 27, 2022)',
      'Penalty Provision': 'IT Act Section 70B — up to ₹1 lakh per day',
      'Related Rules': 'IT (CERT-In and Manner of Performing Functions and Duties) Rules, 2013',
    },
    source_url: 'https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_hash: '0xe5f6a1b2c3d4',
  },

  'RBI/DOR/2025-26/120 DoR.STR.REC.51/21.07.001/2025-26': {
    instrument_ref: 'RBI/DOR/2025-26/120 DoR.STR.REC.51/21.07.001/2025-26',
    title: 'Reserve Bank of India (Digital Lending) Directions, 2025',
    publication_date: '2025-05-08',
    effective_date: '2025-05-08',
    issuing_authority: 'Department of Regulation, Reserve Bank of India',
    signatory_role: 'Chief General Manager',
    signatory_name: 'R. Subramanian',
    authority_emblem: 'RBI',
    body_paragraphs: [
      {
        anchor: 'Para 1',
        text: 'These Directions shall be called the Reserve Bank of India (Digital Lending) Directions, 2025 and shall apply to all Regulated Entities (REs).',
      },
      {
        anchor: 'Para 2',
        text: 'These Directions shall supersede and repeal: (a) Guidelines on Digital Lending dated September 2, 2022; (b) Guidelines on Default Loss Guarantee in Digital Lending dated June 8, 2023; (c) all FAQs and clarifications issued in respect of the foregoing.',
      },
      {
        anchor: 'Para 6',
        text: "Where Lending Service Providers (LSPs) operate digital lending arrangements with multiple Regulated Entities and offer borrowers a choice of lender, the LSP shall, through the digital interface, display all loan offers from matching lenders that meet the borrower's request, and shall include the names of unmatched lenders as well. The digital view of loan offers from matching lenders shall include the name(s) of the RE(s) extending the loan offer, amount and tenor of loan, APR, monthly repayment obligation and penal charges (if applicable), in a way which enables the borrower to make a fair comparison between various offers. A link to the KFS shall also be provided in respect of each of the RE. This Paragraph shall come into force from November 1, 2025.",
      },
      {
        anchor: 'Para 8',
        text: 'REs shall provide a Key Fact Statement (KFS) to the borrower before the loan contract is executed in accordance with the Key Facts Statement (KFS) for Loans and Advances dated April 15, 2024. The KFS shall be displayed at the offer stage and not deferred to the disbursal stage. All disclosures concerning penal charges shall align with the RBI circular on Fair Lending Practice — Penal Charges in Loan Accounts and shall be included in the KFS.',
      },
      {
        anchor: 'Para 9',
        text: 'All loan disbursals and repayments shall be executed directly between the bank account of the borrower and the bank account of the RE, without any pass-through account/pool account of any third party, including LSPs. Cash recoveries shall be permitted only for delinquencies and shall be reflected in the borrower\'s account on the same day.',
      },
      {
        anchor: 'Para 17',
        text: "REs shall report to the RBI information about all the Digital Lending Apps (DLAs) engaged by them, in the prescribed format, on the Centralised Information Management System (CIMS) portal. The Chief Compliance Officer (or other officer designated by the RE) shall be responsible for certifying that data submitted on DLAs via CIMS portal is correct and that DLAs are complying with the applicable law and regulatory requirements. This Paragraph shall come into force from June 15, 2025.",
      },
    ],
    key_provisions: [
      'Repeals 2022 Digital Lending Guidelines + 2023 DLG Guidelines.',
      'Para 6 (multi-lender LSP arrangements) — effective Nov 1, 2025.',
      'Para 17 (DLA reporting on CIMS with CCO certification) — effective June 15, 2025.',
      'KFS must be shown at offer stage.',
      'Direct disbursal to borrower bank account only — no LSP pass-through.',
      'Cooling-off period without penalty as per RE loan policy.',
    ],
    annexures: [
      { ref: 'Annex I', title: 'KFS Template for Digital Lending' },
      { ref: 'Annex II', title: 'DLA Reporting Format for CIMS Portal' },
      { ref: 'Annex III', title: 'List of Repealed Circulars and FAQs' },
    ],
    applicability_scope:
      'All Regulated Entities — (i) commercial banks (incl. SFBs and payments banks); (ii) primary (urban) co-operative banks, state co-operative banks, central co-operative banks; (iii) NBFCs (including HFCs); (iv) all-India financial institutions.',
    metadata: {
      'Document Type': 'RBI Direction',
      Department: 'Department of Regulation (DoR)',
      'Statutory Basis':
        'Sections 21, 35A and 56 of the Banking Regulation Act, 1949; Section 45JA of the RBI Act, 1934',
      'Repealed Frameworks': '2022 Digital Lending Guidelines, 2023 DLG Guidelines',
      Pages: '32',
      Annexures: '3',
    },
    source_url: 'https://website.rbi.org.in/web/rbi/-/notifications/reserve-bank-of-india-digital-lending-directions-2025',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_hash: '0xc3d4e5f6a1b2',
  },

  'RBI/DOR/2025-26/238-series': {
    instrument_ref: 'RBI/DOR/2025-26/238-series',
    title:
      'RBI (Commercial Banks – Know Your Customer) Directions, 2025 (and 9 other sectoral KYC Master Directions)',
    publication_date: '2025-11-28',
    effective_date: '2025-11-28',
    issuing_authority: 'Department of Regulation, Reserve Bank of India',
    signatory_role: 'Executive Director',
    signatory_name: 'Meera Krishnan',
    authority_emblem: 'RBI',
    body_paragraphs: [
      {
        anchor: 'Para 1',
        text: 'These Directions shall be called the Reserve Bank of India (Commercial Banks – Know Your Customer) Directions, 2025 and shall apply to every Scheduled Commercial Bank excluding Regional Rural Banks.',
      },
      {
        anchor: 'Para 2',
        text: 'The Reserve Bank of India (Know Your Customer) Direction, 2016 dated February 25, 2016 is hereby repealed. All circulars, guidelines and instructions on matters covered under these Directions issued earlier to the extent they are inconsistent with these Directions stand repealed with effect from the date of this Master Direction.',
      },
      {
        anchor: 'Para 3',
        text: 'Making specific facial gestures, like blinking of eyes, smiling, frowning, etc. is not mandatory for liveness check. Regulated Entities may adopt alternate methods of liveness detection that are robust, auditable, and consistent with internal fraud-prevention standards.',
      },
      {
        anchor: 'Para 4',
        text: 'Aadhaar shall not be mandatory for undertaking Customer Due Diligence except where benefits under Section 7 of the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016 are involved, in accordance with applicable law.',
      },
      {
        anchor: 'Para 5',
        text: 'The provisions of this Master Direction shall apply to all branches and subsidiaries of the bank in India, and to overseas branches and subsidiaries to the extent permitted by local law. Internal audit and concurrent audit of the bank shall, while testing KYC compliance, reference the latest applicable Master Direction.',
      },
      {
        anchor: 'Para 6',
        text: 'Regulated Entities shall map legacy internal policies, SOPs, and control matrices that referenced pre-2025 circulars to the corresponding paragraphs of this Master Direction and shall retain evidence of such remapping for supervisory review.',
      },
    ],
    key_provisions: [
      'Consolidates approximately 3,500 circulars and directions into 238 Master Directions.',
      '9,445 circulars formally withdrawn on November 28, 2025.',
      '10 sectoral KYC Master Directions replace the single 2016 KYC MD.',
      'Aadhaar not mandatory for general KYC except Section 7 Aadhaar Act benefits.',
      'Facial gestures (blinking, smiling) not mandatory for liveness check in V-CIP.',
    ],
    annexures: [
      { ref: 'Annex I', title: 'Repealed Circulars Index (excerpt)' },
      { ref: 'Annex II', title: 'Sectoral MD Cross-Reference Table' },
    ],
    applicability_scope:
      'Scheduled Commercial Banks (excluding RRBs) and, under parallel sectoral MDs, NBFCs, payments banks, cooperative banks, and other RE classes as notified.',
    metadata: {
      'Document Type': 'Master Direction',
      Department: 'Department of Regulation (DoR)',
      'Statutory Basis': 'Banking Regulation Act, 1949; RBI Act, 1934; PMLA, 2002',
      'Consolidation Scope': '~3,500 instruments → 238 MDs',
      Pages: '248 (approx.)',
      Annexures: '2',
    },
    source_url: 'https://www.rbi.org.in/Scripts/BS_ViewMasterDirections.aspx',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_hash: '0xb2c3d4e5f6a1',
  },

  'FIU-IND PMLA Section 12 read with PML (Maintenance of Records) Rules, 2005': {
    instrument_ref: 'FIU-IND PMLA Section 12 read with PML (Maintenance of Records) Rules, 2005',
    title: 'Reporting of Suspicious Transactions under PMLA — FINnet 2.0 / FINgate 2.0 framework',
    publication_date: '2024-06-01',
    effective_date: null,
    issuing_authority: 'Financial Intelligence Unit – India (FIU-IND), Department of Revenue, Ministry of Finance',
    signatory_role: 'Director, FIU-IND',
    signatory_name: 'Vikramaditya Khanna',
    authority_emblem: 'FIU-IND',
    body_paragraphs: [
      {
        anchor: 'Section 12',
        text: 'Every reporting entity shall furnish information of such suspicious transactions occurring or attempted to be done before or after this Act in such form and manner as may be prescribed by the Central Government.',
      },
      {
        anchor: 'Rule 3',
        text: 'Every reporting entity shall maintain records of all transactions, including information relating to transactions whether attempted or executed, which are integrally connected or relevant to any other transaction, and which are required to be maintained under any other law for the time being in force.',
      },
      {
        anchor: 'Rule 7',
        text: 'Suspicious transactions shall be reported to the Director, FIU-IND within seven working days on being satisfied that the transaction is suspicious in nature, in such format and manner as may be directed from time to time.',
      },
      {
        anchor: 'Rule 9',
        text: 'Records referred to in rules 3, 5 and 7 shall be maintained for a period of five years from the date of transaction between the reporting entity and the client.',
      },
      {
        anchor: 'FINgate 2.0',
        text: 'Reporting entities shall file Suspicious Transaction Reports (STRs) exclusively through the FINgate 2.0 secure reporting channel unless exempted by FIU-IND for technical migration windows. Batch uploads shall comply with the published XSD schema and digital signature requirements.',
      },
      {
        anchor: 'Designated Director',
        text: 'Every reporting entity shall designate a Director on the Board or equivalent functionary to discharge obligations under Chapter IV of PMLA and these Rules, and shall designate a Principal Officer for day-to-day compliance and STR approval workflows.',
      },
    ],
    key_provisions: [
      'STR filing within 7 working days of conclusion of suspicion.',
      'Filed via FINgate 2.0 portal.',
      'Designated Director + Principal Officer regime mandatory.',
      'PML Rule 9 — record retention 5 years.',
      'Penalty up to ₹1 lakh per unreported transaction under PMLA Section 13.',
    ],
    annexures: [
      { ref: 'Annex A', title: 'STR XML Schema (FINgate 2.0)' },
      { ref: 'Annex B', title: 'Illustrative STR narrative fields' },
    ],
    applicability_scope:
      'All reporting entities under PMLA — banking companies, financial institutions, intermediaries, and prescribed professions as notified.',
    metadata: {
      'Document Type': 'Statutory framework + FIU operational guidance',
      Ministry: 'Ministry of Finance',
      Portal: 'FINgate 2.0',
      'Primary Act': 'Prevention of Money Laundering Act, 2002',
    },
    source_url: 'https://fiuindia.gov.in/',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_hash: '0xd4e5f6a1b2c3',
  },

  'SEBI/HO/ITD-1/ITD_CSC_EXT/P/CIR/2024/113': {
    instrument_ref: 'SEBI/HO/ITD-1/ITD_CSC_EXT/P/CIR/2024/113',
    title: 'Cybersecurity and Cyber Resilience Framework (CSCRF) for SEBI Regulated Entities',
    publication_date: '2024-08-20',
    effective_date: '2025-08-31',
    issuing_authority: 'Securities and Exchange Board of India — Information Technology Department',
    signatory_role: 'Executive Director',
    signatory_name: 'Anita Deshpande',
    authority_emblem: 'SEBI',
    body_paragraphs: [
      {
        anchor: 'Para 1',
        text: 'This circular introduces the Cybersecurity and Cyber Resilience Framework (CSCRF) for SEBI regulated entities and supersedes prior cybersecurity circulars to the extent inconsistent.',
      },
      {
        anchor: 'Para 2',
        text: 'Regulated entities shall align their cyber programmes to five resilience goals: Anticipate, Withstand, Contain, Recover, and Evolve, with board-level oversight and documented risk appetite.',
      },
      {
        anchor: 'Para 3',
        text: 'Market Infrastructure Institutions and Qualified REs shall maintain ISO/IEC 27001 certification for in-scope systems and shall obtain half-yearly third-party assessments of SOC efficacy.',
      },
      {
        anchor: 'Para 4',
        text: 'Red teaming exercises shall be conducted at a frequency proportionate to systemic importance, with remediation tracking logged to the CISO and board risk committee.',
      },
      {
        anchor: 'Para 5',
        text: 'Periodic cyber audits shall be performed by CERT-In empanelled information security auditors, with engagement letters retained for supervisory inspection.',
      },
      {
        anchor: 'Para 6',
        text: 'Material incidents shall be reported to SEBI in the format prescribed on the SEBI intermediary portal without undue delay, alongside any parallel CERT-In reporting obligations.',
      },
    ],
    key_provisions: [
      'Replaces all prior SEBI cybersecurity circulars where inconsistent.',
      'Resiliency goals: Anticipate, Withstand, Contain, Recover, Evolve.',
      'ISO 27001 mandatory for MIIs and Qualified REs.',
      'Half-yearly third-party SOC efficacy assessment for MIIs.',
      'Red teaming for MIIs + Qualified REs.',
      'CERT-In empanelled IS auditor for periodic audit.',
    ],
    annexures: [
      { ref: 'Annex I', title: 'CSCRF Control Themes (summary)' },
      { ref: 'Annex II', title: 'Reporting matrix — SEBI vs CERT-In' },
    ],
    applicability_scope:
      'SEBI regulated entities including stock exchanges, clearing corporations, depositories, mutual funds, KYC registration agencies, and intermediaries classified as Qualified REs under the circular.',
    metadata: {
      'Document Type': 'Circular',
      Department: 'ITD — Cybersecurity & Cyber Resilience',
      'Compliance Date': '2025-08-31 (extended)',
      'Related Framework': 'National Cybersecurity Strategy alignment',
    },
    source_url:
      'https://www.sebi.gov.in/legal/circulars/aug-2024/cybersecurity-and-cyber-resilience-framework-cscrf-for-sebi-regulated-entities-res-_85964.html',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_hash: '0xf6a1b2c3d4e5',
  },

  'NPCI/UPI/OC/2025-26/89': {
    instrument_ref: 'NPCI/UPI/OC/2025-26/89',
    title: 'UPI Operational Circular — Balance / List-Account API limits and Autopay execution windows',
    publication_date: '2025-05-21',
    effective_date: '2025-08-01',
    issuing_authority: 'National Payments Corporation of India (NPCI)',
    signatory_role: 'Chief Operating Officer',
    signatory_name: 'S. L. Jain',
    authority_emblem: 'NPCI',
    body_paragraphs: [
      {
        anchor: 'Clause 1',
        text: 'Member banks and PSPs shall implement rate limits of fifty (50) balance enquiry API calls per user per day per UPI application, and twenty-five (25) List Account API calls per user per day per application.',
      },
      {
        anchor: 'Clause 2',
        text: 'Background balance polling by UPI applications shall be disabled. Balance shall be displayed automatically after each successful transaction without additional user-initiated balance enquiry calls.',
      },
      {
        anchor: 'Clause 3',
        text: 'PSPs shall publish updated SDK guidance to merchant developers and shall monitor anomalous API traffic patterns indicative of polling loops.',
      },
      {
        anchor: 'Clause 4',
        text: 'Autopay debit execution shall be processed strictly within the specified time windows. Member banks shall not present autopay debit requests outside these windows.',
      },
      {
        anchor: 'Clause 5',
        text: 'All UPI service providers and member banks shall complete technical deployment and certification against this circular by July 31, 2025.',
      },
    ],
    key_provisions: [
      'Balance enquiry capped at 50 calls per day per UPI app.',
      'List Account API capped at 25 calls per day per app.',
      'Background balance polling removed.',
      'Autopay execution windows specified.',
      'Implementation by July 31, 2025.',
    ],
    annexures: [
      { ref: 'Annex A', title: 'Autopay execution window matrix' },
      { ref: 'Annex B', title: 'API telemetry fields for compliance reporting' },
    ],
    applicability_scope:
      'All NPCI member banks, UPI-enabled PSPs, TPAPs, and payment system participants operating UPI rails in India.',
    metadata: {
      'Document Type': 'Operational Circular',
      'UPI Version': 'As per NPCI UPI Procedural Guidelines',
      'Implementation Cut-off': '2025-07-31',
    },
    source_url: 'https://www.npci.org.in/circulars/upi',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_hash: '0xa1b2c3d4e5f7',
  },

  'RBI/2026-27/14 A.P.(DIR Series) Circular No. 03': {
    instrument_ref: 'RBI/2026-27/14 A.P.(DIR Series) Circular No. 03',
    title:
      'Liberalised Remittance Scheme (LRS) — Reporting of Remittances via Daily R-Return; Revised Submission Format',
    publication_date: '2026-05-12',
    effective_date: '2026-06-01',
    issuing_authority: 'Foreign Exchange Department, Reserve Bank of India',
    signatory_role: 'Chief General Manager',
    signatory_name: 'R. Subramanian',
    authority_emblem: 'RBI',
    body_paragraphs: [
      {
        anchor: 'Para 1',
        text: 'Attention of Authorised Dealer (AD) Category-I banks is invited to the Master Direction on Liberalised Remittance Scheme (Master Direction No. 7 dated January 1, 2016, as amended from time to time) and the A.P.(DIR Series) circulars issued thereunder, prescribing the format and frequency of reporting under the Liberalised Remittance Scheme.',
      },
      {
        anchor: 'Para 2',
        text: 'On a review of the data quality of LRS submissions and to enable purpose-code level analytics, it has been decided to revise the Daily R-Return submission format with effect from June 1, 2026, as set out in Annex A to this circular.',
      },
      {
        anchor: 'Para 3',
        text: 'The submission deadline shall remain unchanged at T+1 working day by 18:00 hours IST through the XBRL portal. AD Category-I banks shall ensure their internal LRS workflow captures the new fields at the point of transaction execution rather than at end-of-day reconciliation.',
      },
      {
        anchor: 'Para 4',
        text: 'Authorised Dealer banks shall capture the full purpose-code sub-level (Schedule III) and the beneficiary KYC reference number at the time of execution of every LRS outward remittance.',
      },
      {
        anchor: 'Para 7',
        text: 'The revised Daily R-Return shall be submitted via the XBRL portal by 18:00 hours IST on T+1 working day in the format specified at Annex A. Any reconciliation breaks against core banking shall be cleared within 2 working days.',
      },
      {
        anchor: 'Para 9',
        text: 'These directions are issued under Sections 10(4) and 11(1) of the Foreign Exchange Management Act, 1999 (42 of 1999), and any contravention or non-observance thereof is subject to penalties prescribed under the Act.',
      },
    ],
    key_provisions: [
      'Daily R-Return submission format revised; new fields for purpose-code sub-level and beneficiary KYC reference.',
      'Submission deadline unchanged: T+1 working day by 18:00 IST via XBRL portal.',
      'Authorised Dealer banks to update internal LRS workflow to capture new fields at transaction time.',
      'Reconciliation breaks against core banking to be cleared within 2 working days.',
      'Effective for remittances effected on or after June 1, 2026.',
    ],
    annexures: [
      { ref: 'Annex A', title: 'Revised Daily R-Return XBRL schema (v2026.1)' },
      { ref: 'Annex B', title: 'Purpose-code sub-level mapping (Schedule III, S0001–S1402)' },
    ],
    applicability_scope:
      'All Authorised Dealer Category-I banks and Authorised Persons handling outward LRS remittances on behalf of resident individual customers.',
    metadata: {
      'Document Type': 'A.P.(DIR Series) Circular',
      'Effective Date': '2026-06-01',
      'Legal Basis': 'FEMA, 1999 — Sections 10(4) and 11(1)',
      'Submission Channel': 'RBI XBRL Portal',
    },
    source_url:
      'https://website.rbi.org.in/web/rbi/-/notifications/lrs-daily-r-return-revised-format-2026',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_hash: '0x4f7c9d3b1e88',
  },

  'RBI/Draft/2026-27/02 DoR.SRD.REC.07/12.01.001/2026-27': {
    instrument_ref: 'RBI/Draft/2026-27/02 DoR.SRD.REC.07/12.01.001/2026-27',
    title:
      'Draft Disclosure Framework on Climate-related Financial Risks, 2026 — Master Direction for Regulated Entities',
    publication_date: '2026-03-15',
    effective_date: null,
    issuing_authority: 'Department of Regulation, Reserve Bank of India',
    signatory_role: 'Chief General Manager',
    signatory_name: 'P. Iyer',
    authority_emblem: 'RBI',
    body_paragraphs: [
      {
        anchor: 'Para 1',
        text: 'The Reserve Bank of India has issued the draft Disclosure Framework on Climate-related Financial Risks for Regulated Entities (REs) for public consultation. The framework operationalises the policy intent set out in the RBI Discussion Paper on Climate Risk and Sustainable Finance, 2022.',
      },
      {
        anchor: 'Para 4',
        text: 'The framework introduces four pillars of disclosure — Governance, Strategy, Risk Management, and Metrics & Targets — modelled on the recommendations of the Task Force on Climate-related Financial Disclosures (TCFD) and the IFRS Sustainability Disclosure Standards (ISSB-S2).',
      },
      {
        anchor: 'Para 6',
        text: 'A phased implementation is proposed: Scheduled Commercial Banks (other than RRBs) from FY 2027–28; Tier-I Urban Cooperative Banks and Top and Upper layer NBFCs from FY 2028–29; other regulated entities as and when notified.',
      },
      {
        anchor: 'Para 9',
        text: 'Scope 1 and Scope 2 financed emissions disclosures shall be mandatory from the first year of applicability. Scope 3 financed emissions disclosures shall be phased in over the subsequent two years, with sectoral concentration disclosures expected in year three.',
      },
      {
        anchor: 'Para 11',
        text: 'Disclosures shall form part of the Pillar 3 report and the Annual Report. The Audit Committee of the Board shall review the qualitative narratives, and the Risk Management Committee shall review the quantitative metrics.',
      },
      {
        anchor: 'Para 14',
        text: 'Comments and responses on the draft framework are invited from REs, industry bodies, academia, and the public latest by June 15, 2026. Responses may be submitted to climaterisk@rbi.org.in or via the RBI feedback portal.',
      },
    ],
    key_provisions: [
      'Phased disclosure starting FY 2027–28 for scheduled commercial banks; FY 2028–29 for Tier-I UCBs and Top/Upper layer NBFCs.',
      'Four pillars: Governance, Strategy, Risk Management, Metrics & Targets — modelled on TCFD/ISSB-S2.',
      'Scope 1 and Scope 2 financed emissions mandatory from year one; Scope 3 phase-in across two years.',
      'Disclosures to form part of the Pillar 3 report and the Annual Report.',
      'Audit Committee reviews qualitative narratives; Risk Management Committee reviews quantitative metrics.',
      'Comments and responses invited until June 15, 2026.',
    ],
    annexures: [
      { ref: 'Annex I', title: 'Illustrative disclosure templates (Governance, Strategy, Risk Mgmt, Metrics)' },
      { ref: 'Annex II', title: 'Definitions and scope of Scope 1 / 2 / 3 financed emissions' },
      { ref: 'Annex III', title: 'Phased applicability matrix by RE category and asset size' },
    ],
    applicability_scope:
      'Scheduled Commercial Banks, Urban Cooperative Banks (Tier-I), and Top / Upper layer NBFCs; phased applicability to other REs as notified.',
    metadata: {
      'Document Type': 'Draft Direction — Public Consultation',
      'Consultation Deadline': '2026-06-15',
      'Legal Basis': 'BR Act, 1949 (Ss. 21, 35A, 56); RBI Act, 1934 (S. 45L)',
      'Submission Channel': 'climaterisk@rbi.org.in / RBI feedback portal',
    },
    source_url:
      'https://website.rbi.org.in/web/rbi/-/notifications/draft-disclosure-framework-climate-related-financial-risks-2026',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_hash: '0x9d2e7f1a8c4b',
  },

  'SEBI/CP/MIRSD/2026-27/05': {
    instrument_ref: 'SEBI/CP/MIRSD/2026-27/05',
    title: 'Consultation Paper — Safer Participation of Retail Investors in Algorithmic Trading via APIs',
    publication_date: '2026-04-22',
    effective_date: null,
    issuing_authority: 'Market Intermediaries Regulation & Supervision Department, SEBI',
    signatory_role: 'General Manager',
    signatory_name: 'K. Iyer',
    authority_emblem: 'SEBI',
    body_paragraphs: [
      {
        anchor: 'Para 1',
        text: 'SEBI has, vide this consultation paper, sought public feedback on a proposed framework to enable safer participation of retail investors in algorithmic trading via Application Programming Interfaces (APIs) provided by stock brokers.',
      },
      {
        anchor: 'Para 3',
        text: 'It is proposed that stock brokers shall tag every API-originated order at the exchange level with an algo / non-algo flag. The order tagging shall be transmitted to the exchange in the order entry message.',
      },
      {
        anchor: 'Para 5',
        text: 'Retail-originated algorithmic strategies generating orders above the thresholds specified by the exchange shall be registered with the exchange. The broker shall be the registrant for and on behalf of the retail client.',
      },
      {
        anchor: 'Para 7',
        text: 'Stock brokers shall maintain an audit trail of every algo strategy parameter and parameter change for a period of not less than five years from the date of the last execution of the strategy.',
      },
      {
        anchor: 'Para 8',
        text: 'Where the retail algorithm is offered by a third-party algo provider, the broker shall ensure that the algo provider is empanelled as per the framework prescribed by SEBI/exchanges, and the liability allocation between the broker and the algo provider shall be documented.',
      },
      {
        anchor: 'Para 12',
        text: 'Comments and responses on this consultation paper are invited from market participants, industry bodies, and the public latest by May 25, 2026.',
      },
    ],
    key_provisions: [
      'Stock brokers to tag every API-originated order at the exchange level with algo / non-algo flag.',
      'Retail-originated algos above order-rate threshold to be registered with the exchange via the broker.',
      'Broker to maintain audit trail of algo strategy parameters and parameter changes for at least five years.',
      'Algo-provider empanelment framework for third-party vendors.',
      'Liability allocation between broker and third-party algo provider to be documented.',
      'Comments invited until May 25, 2026.',
    ],
    annexures: [
      { ref: 'Annex A', title: 'Proposed order tag schema and exchange message format' },
      { ref: 'Annex B', title: 'Indicative order-rate thresholds by segment' },
    ],
    applicability_scope:
      'Stock brokers, trading members, and third-party algo providers offering API-based execution to retail investors on Indian recognised stock exchanges.',
    metadata: {
      'Document Type': 'Consultation Paper',
      'Consultation Deadline': '2026-05-25',
      'Legal Basis': 'SEBI Act, 1992 (S. 11(1)); SEBI (Stock Brokers) Regulations, 1992',
      'Submission Channel': 'SEBI Public Comments Portal',
    },
    source_url:
      'https://www.sebi.gov.in/reports-and-statistics/reports/safer-participation-retail-algo-2026.html',
    last_synced_at: '2026-05-14T09:30:00+05:30',
    source_hash: '0x6a8c3e2f5d91',
  },

  'RBI Press Release: 2025-2026/134 (Order dated 3 April 2025)': {
    instrument_ref: 'RBI Press Release: 2025-2026/134 (Order dated 3 April 2025)',
    title:
      'RBI Press Release 2025-2026/134 — Monetary penalty on IDFC First Bank Limited for non-compliance with RBI directions on KYC/CDD',
    publication_date: '2025-04-17',
    effective_date: null,
    issuing_authority: 'Reserve Bank of India — Department of Regulation / Enforcement communication',
    signatory_role: 'Chief General Manager (Communications)',
    signatory_name: 'R. Mehta',
    authority_emblem: 'PEER',
    body_paragraphs: [
      {
        anchor: 'Para 1',
        text: 'The Reserve Bank of India (RBI), in exercise of its powers under the Banking Regulation Act, 1949, has imposed a monetary penalty of ₹38.60 lakh (Rupees thirty-eight lakh and sixty thousand only) on IDFC First Bank Limited, Mumbai.',
      },
      {
        anchor: 'Para 2',
        text: 'The penalty is based on deficiencies in regulatory compliance and is not intended to pronounce upon the validity of any transaction or agreement entered into by the bank with its customers.',
      },
      {
        anchor: 'Para 3',
        text: 'The statutory inspection of the bank was conducted by RBI with reference to its financial position as on March 31, 2023, and the examination of the Risk Assessment Report, Inspection Report and all related correspondence pertaining to the same.',
      },
      {
        anchor: 'Para 4',
        text: 'It was observed, inter alia, that the bank had failed to undertake requisite Customer Due Diligence (CDD) in respect of opening of current accounts of certain sole proprietary concerns, in contravention of/delays in adhering to RBI directions on Know Your Customer (KYC) norms.',
      },
      {
        anchor: 'Para 5',
        text: 'After considering the bank\'s reply to the notice, oral submissions made during the personal hearing, and additional submissions, RBI concluded that the aforesaid charge was sustained and warranted imposition of monetary penalty.',
      },
    ],
    key_provisions: [
      'RBI imposed monetary penalty of ₹38.60 lakh on IDFC First Bank Limited by order dated April 3, 2025.',
      'Charge sustained: failed to undertake requisite Customer Due Diligence process for opening current accounts of certain sole proprietary firms.',
      'Imposed under Section 47A(1)(c) read with Section 46(4)(i) of the Banking Regulation Act, 1949.',
      'Penalty follows scrutiny report findings, show-cause notice, and personal hearing.',
      'RBI clarifies action is based on regulatory non-compliance, not on validity of any specific customer transaction.',
    ],
    annexures: [{ ref: 'Annex', title: 'Order extract (redacted customer references)' }],
    applicability_scope:
      'Public disclosure of enforcement outcome; peer banks use for self-assessment against comparable KYC/CDD control gaps.',
    metadata: {
      'Document Type': 'Press release — monetary penalty',
      'Press Release No.': '2025-2026/134',
      'Order Date': '2025-04-03',
      'Legal Basis': 'Section 47A(1)(c) read with Section 46(4)(i), Banking Regulation Act, 1949',
    },
    source_url: 'https://website.rbi.org.in/documents/d/rbi/prpenaltyonidfcfirstbanklimited',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_hash: '0xb2c3d4e5f6a2',
  },
};

export function getSourceDocumentByRef(instrumentRef: string): SourceDocument | undefined {
  return sourceDocuments[instrumentRef];
}
