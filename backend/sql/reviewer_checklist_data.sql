-- Reviewer checklist data from Reviewer_doc/Reviewer.xlsx
-- Run after reviewer_checklist_ddl.sql

BEGIN;
TRUNCATE reviewer_checklist CASCADE;

INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A1', 'Network architecture diagram', '1.1', 'SWIFT Environment Protection', 'M', 'Confirm the ''Network architecture diagram'' has been submitted as a Diagram + Text. Check: (1) File is present and can be opened. (2) It is the correct document type (Diagram + Text). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control SWIFT Environment Protection.', 'Review the ''Network architecture diagram'' to confirm it technically satisfies Control ''SWIFT Environment Protection'':
MUST SHOW — Secure zone boundary clearly drawn with logical and physical separation indicated | Stateful firewall devices shown at every ingress/egress point of the secure zone | All SWIFT systems within secure zone visible: messaging interface, communication interface, GUI, SwiftNet Link, HSM, connectors, jump server | Dedicated operator PCs shown inside zone; general-purpose PCs shown outside zone | Jump server placement visible — inside secure zone or equivalent secure zone
PASS IF — Zone boundary is explicitly drawn with firewall at every entry/exit point | All 7+ SWIFT component types visible inside zone (messaging, comm, GUI, SNL, HSM, connector, jump server) | Operator PC classification visible (dedicated inside, general-purpose outside) | Jump server positioned inside zone or equivalent secure zone
FAIL IF — No clear zone boundary drawn | SWIFT components shown outside secure zone without justification | Enterprise AD shown as shared authentication crossing zone boundary without separate auth
CROSS-CHECK — Every system on diagram must appear in A2 inventory | Every firewall on diagram must have corresponding A4 rule set', 'Independently attest ''Network architecture diagram'' for Control ''SWIFT Environment Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Zone boundary is explicitly drawn with firewall at every entry/exit point
  • All 7+ SWIFT component types visible inside zone (messaging, comm, GUI, SNL, HSM, connector, jump server)
  • Operator PC classification visible (dedicated inside, general-purpose outside)
  • Jump server positioned inside zone or equivalent secure zone
CROSS-CHECK VALIDATION:
  • Every system on diagram must appear in A2 inventory
  • Every firewall on diagram must have corresponding A4 rule set
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A1', 'Network architecture diagram', '1.4', 'Restriction of Internet Access', 'M', 'Confirm the ''Network architecture diagram'' has been submitted as a Diagram + Text. Check: (1) File is present and can be opened. (2) It is the correct document type (Diagram + Text). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Restriction of Internet Access.', 'Review the ''Network architecture diagram'' to confirm it technically satisfies Control ''Restriction of Internet Access'':
MUST SHOW — No direct internet connectivity path from any system inside the secure zone | No direct internet connectivity from the jump server | Proxy/gateway placement shown if indirect internet access exists for allowlisted URLs | General-purpose operator PC internet access path visible — through remote desktop, proxy with content inspection, or web gateway | Internet access from dedicated operator PCs blocked or highly restricted (shown)
PASS IF — No uncontrolled internet path from secure zone systems | Jump server explicitly shown with no internet access | Proxy/gateway architecture visible for any permitted access
FAIL IF — Direct internet line from secure zone components | Jump server shown with internet connectivity | No indication of internet access control for operator PCs
CROSS-CHECK — Firewall rules in A4 must confirm deny-outbound for internet from zone', 'Independently attest ''Network architecture diagram'' for Control ''Restriction of Internet Access'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • No uncontrolled internet path from secure zone systems
  • Jump server explicitly shown with no internet access
  • Proxy/gateway architecture visible for any permitted access
CROSS-CHECK VALIDATION:
  • Firewall rules in A4 must confirm deny-outbound for internet from zone
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A1', 'Network architecture diagram', '1.5', 'Customer Environment Protection', 'M', 'Confirm the ''Network architecture diagram'' has been submitted as a Diagram + Text. Check: (1) File is present and can be opened. (2) It is the correct document type (Diagram + Text). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Customer Environment Protection.', 'Review the ''Network architecture diagram'' to confirm it technically satisfies Control ''Customer Environment Protection'':
MUST SHOW — Customer connector zone boundaries drawn with equivalent protection to main secure zone | Firewall/ACL at boundary between customer connector zone and enterprise environment | Segmentation between customer connector zone and main SWIFT secure zone shown | Customer connector, dedicated PCs, jump server, HSM (if used with connector) positioned in zone | Alliance Connect VPN placement shown in secured environment
PASS IF — Customer connector zone has explicit boundary with firewall protection | All customer connectors visible inside protected zone | Segmentation between customer zone and SWIFT zone shown
FAIL IF — Customer connector floating outside any zone boundary | No firewall between customer zone and enterprise', 'Independently attest ''Network architecture diagram'' for Control ''Customer Environment Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Customer connector zone has explicit boundary with firewall protection
  • All customer connectors visible inside protected zone
  • Segmentation between customer zone and SWIFT zone shown
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A1', 'Network architecture diagram', '2.1', 'Internal Data Flow Security', 'M', 'Confirm the ''Network architecture diagram'' has been submitted as a Diagram + Text. Check: (1) File is present and can be opened. (2) It is the correct document type (Diagram + Text). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Internal Data Flow Security.', 'Review the ''Network architecture diagram'' to confirm it technically satisfies Control ''Internal Data Flow Security'':
MUST SHOW — All data flow paths between SWIFT components annotated with direction arrows | Flows between: Local RMA↔messaging interface, GUI↔messaging interface, GUI↔communication interface, messaging↔communication interface identified | Each flow annotated with protocol indicator (e.g., LAU+TLS, two-way TLS) | Flows spanning multiple environments (on-prem to cloud) explicitly shown | Boundary crossing points where encryption is required clearly identified
PASS IF — All inter-component data flows shown with direction | Protocol type annotated per flow (even if summary level) | Cross-environment flows highlighted
FAIL IF — Data flows between SWIFT components not shown | No indication of encryption on flows crossing boundaries
CROSS-CHECK — Encryption details must be confirmed in B3 config exports', 'Independently attest ''Network architecture diagram'' for Control ''Internal Data Flow Security'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • All inter-component data flows shown with direction
  • Protocol type annotated per flow (even if summary level)
  • Cross-environment flows highlighted
CROSS-CHECK VALIDATION:
  • Encryption details must be confirmed in B3 config exports
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A1', 'Network architecture diagram', '2.4A', 'Back Office Data Flow Security', 'A', 'Confirm the ''Network architecture diagram'' has been submitted as a Diagram + Text. Check: (1) File is present and can be opened. (2) It is the correct document type (Diagram + Text). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Back Office Data Flow Security.', 'Review the ''Network architecture diagram'' to confirm it technically satisfies Control ''Back Office Data Flow Security'':
MUST SHOW — Back-office to secure zone data flow paths explicitly drawn | Bridging servers (middleware/file transfer) identified with network placement | Direct flows vs indirect flows (through bridging servers) distinguishable | New flows (post-2025) vs legacy flows marked if applicable | Each flow''s boundary crossing point identified
PASS IF — Back-office flow paths clearly visible with bridging servers identified | Direct vs indirect flow paths distinguishable | Boundary crossings marked
FAIL IF — No back-office connectivity visible on diagram | Bridging servers not shown despite being in A2 inventory
CROSS-CHECK — Bridging servers on diagram must appear in A2; encryption per flow in B3', 'Independently attest ''Network architecture diagram'' for Control ''Back Office Data Flow Security'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Back-office flow paths clearly visible with bridging servers identified
  • Direct vs indirect flow paths distinguishable
  • Boundary crossings marked
CROSS-CHECK VALIDATION:
  • Bridging servers on diagram must appear in A2; encryption per flow in B3
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A1', 'Network architecture diagram', '2.5A', 'External Transmission Data Protection', 'A', 'Confirm the ''Network architecture diagram'' has been submitted as a Diagram + Text. Check: (1) File is present and can be opened. (2) It is the correct document type (Diagram + Text). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control External Transmission Data Protection.', 'Review the ''Network architecture diagram'' to confirm it technically satisfies Control ''External Transmission Data Protection'':
MUST SHOW — External communication paths for SWIFT operations visible (to service bureaus, SWIFT network, cloud environments) | Backup/replication paths from secure zone to external storage locations shown | Data extraction paths for offline processing identified | Paths between data centres or on-prem to cloud environments shown | SAN/NAS connectivity from secure zone visible if applicable
PASS IF — External transmission paths clearly visible | Backup/replication paths to external storage shown
FAIL IF — No external paths visible despite operational backups existing
CROSS-CHECK — Encryption on each path confirmed in B3', 'Independently attest ''Network architecture diagram'' for Control ''External Transmission Data Protection'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • External transmission paths clearly visible
  • Backup/replication paths to external storage shown
CROSS-CHECK VALIDATION:
  • Encryption on each path confirmed in B3
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A2', 'SWIFT component inventory', '1.1', 'SWIFT Environment Protection', 'M', 'Confirm the ''SWIFT component inventory'' has been submitted as a Spreadsheet. Check: (1) File is present and can be opened. (2) It is the correct document type (Spreadsheet). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control SWIFT Environment Protection.', 'Review the ''SWIFT component inventory'' to confirm it technically satisfies Control ''SWIFT Environment Protection'':
MUST SHOW — Complete list of ALL systems within secure zone: hostname, IP address, OS version, function/role | Each system tagged with zone membership: Secure Zone, Customer Zone, DMZ, Enterprise | Component type classification per system: messaging interface, communication interface, GUI, SwiftNet Link, HSM, connector, jump server, dedicated PC, general-purpose PC, network device | Test vs production status clearly marked | Co-hosted systems identified (VMs sharing same host)
PASS IF — All 7+ SWIFT component types represented in inventory | Every system has hostname, IP, OS, zone membership | Test systems marked as excluded with separation justification
FAIL IF — Fewer systems than expected for declared architecture type | Missing component types (e.g., no HSM listed for A1/A2) | No zone membership indicator
CROSS-CHECK — Every system must appear on A1 diagram | Count of systems must be consistent with D2 patch levels and B1 hardening configs', 'Independently attest ''SWIFT component inventory'' for Control ''SWIFT Environment Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • All 7+ SWIFT component types represented in inventory
  • Every system has hostname, IP, OS, zone membership
  • Test systems marked as excluded with separation justification
CROSS-CHECK VALIDATION:
  • Every system must appear on A1 diagram
  • Count of systems must be consistent with D2 patch levels and B1 hardening configs
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A2', 'SWIFT component inventory', '1.3', 'Virtualisation/Cloud Platform Protection', 'M/A', 'Confirm the ''SWIFT component inventory'' has been submitted as a Spreadsheet. Check: (1) File is present and can be opened. (2) It is the correct document type (Spreadsheet). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Virtualisation/Cloud Platform Protection.', 'Review the ''SWIFT component inventory'' to confirm it technically satisfies Control ''Virtualisation/Cloud Platform Protection'':
MUST SHOW — Identification of which SWIFT components are virtualised vs physical | Hypervisor/cloud platform type and version per virtualised system | Host-to-guest VM mapping: which VMs run on which physical host | Shared hosts identified (SWIFT VMs co-located with non-SWIFT workloads) | Cloud provider identification with service model (IaaS/PaaS/SaaS)
PASS IF — Every virtualised system has host mapping | Shared hosts explicitly flagged | Cloud provider identified with service model
FAIL IF — Virtualised systems without host identification | No separation between SWIFT and non-SWIFT VMs identified
CROSS-CHECK — Virtualisation platform security verified via B4', 'Independently attest ''SWIFT component inventory'' for Control ''Virtualisation/Cloud Platform Protection'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Every virtualised system has host mapping
  • Shared hosts explicitly flagged
  • Cloud provider identified with service model
CROSS-CHECK VALIDATION:
  • Virtualisation platform security verified via B4
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A2', 'SWIFT component inventory', '1.5', 'Customer Environment Protection', 'M', 'Confirm the ''SWIFT component inventory'' has been submitted as a Spreadsheet. Check: (1) File is present and can be opened. (2) It is the correct document type (Spreadsheet). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Customer Environment Protection.', 'Review the ''SWIFT component inventory'' to confirm it technically satisfies Control ''Customer Environment Protection'':
MUST SHOW — All customer connectors listed with: hostname, IP, type (server/client/API), zone placement | Customer connector associated HSMs identified | Dedicated PCs for customer connectivity zone listed | Jump server for customer zone identified | Alliance Connect VPN boxes/instances listed
PASS IF — All customer connectors in inventory with zone placement | Associated equipment (HSM, PCs, jump server) listed
FAIL IF — Customer connectors missing from inventory', 'Independently attest ''SWIFT component inventory'' for Control ''Customer Environment Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • All customer connectors in inventory with zone placement
  • Associated equipment (HSM, PCs, jump server) listed
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A2', 'SWIFT component inventory', '2.4A', 'Back Office Data Flow Security', 'A', 'Confirm the ''SWIFT component inventory'' has been submitted as a Spreadsheet. Check: (1) File is present and can be opened. (2) It is the correct document type (Spreadsheet). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Back Office Data Flow Security.', 'Review the ''SWIFT component inventory'' to confirm it technically satisfies Control ''Back Office Data Flow Security'':
MUST SHOW — Bridging servers (middleware/file transfer) explicitly identified with: hostname, IP, function, zone placement | Dedicated vs shared status per bridging server documented | Data exchange role documented: which back-office systems connect through each bridging server | Network placement relative to secure zone boundary indicated | New vs legacy flow association per bridging server if applicable
PASS IF — All bridging servers identified with complete details | Dedicated/shared status documented
FAIL IF — Bridging servers on A1 diagram not in inventory | No role description for bridging servers
CROSS-CHECK — Must match bridging servers on A1 and A3 diagrams', 'Independently attest ''SWIFT component inventory'' for Control ''Back Office Data Flow Security'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • All bridging servers identified with complete details
  • Dedicated/shared status documented
CROSS-CHECK VALIDATION:
  • Must match bridging servers on A1 and A3 diagrams
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A2', 'SWIFT component inventory', '2.8', 'Outsourced Critical Activity Protection', 'M', 'Confirm the ''SWIFT component inventory'' has been submitted as a Spreadsheet. Check: (1) File is present and can be opened. (2) It is the correct document type (Spreadsheet). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Outsourced Critical Activity Protection.', 'Review the ''SWIFT component inventory'' to confirm it technically satisfies Control ''Outsourced Critical Activity Protection'':
MUST SHOW — Components managed by third parties flagged with: vendor name, service type, access level | Mapping of which vendors have access to which SWIFT components | Remote vs on-site management indicated | Cloud-hosted components identified with provider | Components managed by SWIFT connectivity providers identified separately
PASS IF — All third-party managed components flagged | Vendor-to-component mapping complete | Cloud-hosted vs on-prem distinction clear
FAIL IF — Components with no management ownership indicated | Third-party access not documented
CROSS-CHECK — Vendors must match F1 vendor inventory; access must be in C3 user access list', 'Independently attest ''SWIFT component inventory'' for Control ''Outsourced Critical Activity Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • All third-party managed components flagged
  • Vendor-to-component mapping complete
  • Cloud-hosted vs on-prem distinction clear
CROSS-CHECK VALIDATION:
  • Vendors must match F1 vendor inventory; access must be in C3 user access list
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A3', 'Data flow diagrams', '2.1', 'Internal Data Flow Security', 'M', 'Confirm the ''Data flow diagrams'' has been submitted as a Diagram. Check: (1) File is present and can be opened. (2) It is the correct document type (Diagram). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Internal Data Flow Security.', 'Review the ''Data flow diagrams'' to confirm it technically satisfies Control ''Internal Data Flow Security'':
MUST SHOW — All internal data flows between SWIFT components shown with: source, destination, direction, protocol | Specific flows: Local RMA↔messaging, GUI↔messaging, GUI↔communication, messaging↔communication | Protocol per flow: LAU+TLS, two-way TLS, or alternative secure mechanism | Flows crossing zone boundaries highlighted | Cross-environment flows (on-prem to cloud) explicitly marked
PASS IF — All expected inter-component flows documented with protocols | Direction and encryption method per flow visible
FAIL IF — Missing flows between known components (compare to A2 inventory) | Flows shown without security mechanism annotation
CROSS-CHECK — Encryption config details verified in B3', 'Independently attest ''Data flow diagrams'' for Control ''Internal Data Flow Security'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • All expected inter-component flows documented with protocols
  • Direction and encryption method per flow visible
CROSS-CHECK VALIDATION:
  • Encryption config details verified in B3
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A3', 'Data flow diagrams', '2.4A', 'Back Office Data Flow Security', 'A', 'Confirm the ''Data flow diagrams'' has been submitted as a Diagram. Check: (1) File is present and can be opened. (2) It is the correct document type (Diagram). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Back Office Data Flow Security.', 'Review the ''Data flow diagrams'' to confirm it technically satisfies Control ''Back Office Data Flow Security'':
MUST SHOW — Detailed back-office to secure zone flows showing: source back-office system, destination SWIFT component, bridging servers in path | Each flow classified: direct (point-to-point) vs indirect (through bridging servers) | Security method per leg/segment documented: end-to-end protection (LAU, XML DSIG, AES-GCM) OR per-leg TLS | New flows (post-2025) vs legacy flows distinguished | Flows to/from HSM separately shown
PASS IF — All back-office flows mapped with complete path | Direct vs indirect classification present | Security method documented per flow/segment
FAIL IF — Flows without security method annotation | Bridging servers in path not identified
CROSS-CHECK — Bridging servers match A2 inventory; encryption config in B3', 'Independently attest ''Data flow diagrams'' for Control ''Back Office Data Flow Security'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • All back-office flows mapped with complete path
  • Direct vs indirect classification present
  • Security method documented per flow/segment
CROSS-CHECK VALIDATION:
  • Bridging servers match A2 inventory; encryption config in B3
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A3', 'Data flow diagrams', '2.5A', 'External Transmission Data Protection', 'A', 'Confirm the ''Data flow diagrams'' has been submitted as a Diagram. Check: (1) File is present and can be opened. (2) It is the correct document type (Diagram). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control External Transmission Data Protection.', 'Review the ''Data flow diagrams'' to confirm it technically satisfies Control ''External Transmission Data Protection'':
MUST SHOW — External transmission paths shown: backup replication, data extraction, offline processing, cross-datacenter transfers | Encryption method annotated per external path: TLS for transit, AES for data at rest | SAN/NAS connectivity paths identified | Cloud storage paths with encryption requirements shown | Paths between secure zones across different environments marked
PASS IF — External paths documented with encryption annotations | Backup and replication paths included
FAIL IF — No external paths despite backups existing
CROSS-CHECK — Encryption details verified in B3', 'Independently attest ''Data flow diagrams'' for Control ''External Transmission Data Protection'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • External paths documented with encryption annotations
  • Backup and replication paths included
CROSS-CHECK VALIDATION:
  • Encryption details verified in B3
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A4', 'Firewall rule sets', '1.1', 'SWIFT Environment Protection', 'M', 'Confirm the ''Firewall rule sets'' has been submitted as a Config Export. Check: (1) File is present and can be opened. (2) It is the correct document type (Config Export). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control SWIFT Environment Protection.', 'Review the ''Firewall rule sets'' to confirm it technically satisfies Control ''SWIFT Environment Protection'':
MUST SHOW — Rule sets from EVERY firewall at secure zone boundary exported | Deny-by-default posture confirmed: explicit default-deny rule at end of each ruleset | Only explicitly permitted traffic allowed (allowlisting approach) — no ''allow any'' rules | Each rule has: source, destination, port, protocol, action, direction (inbound/outbound) | Rules categorised: back-office connectivity, MV-SIPN/internet, operator PC to jump server, admin/backup outbound
PASS IF — Default-deny at end of every ruleset | No ''allow any'' rules present | Every rule has source/dest/port/protocol/action | Annual review evidence with sign-off date within 12 months
FAIL IF — ''Allow any'' rules found in ruleset | No default-deny posture | Rules permitting direct internet from zone components
CROSS-CHECK — Firewalls match placement on A1 diagram', 'Independently attest ''Firewall rule sets'' for Control ''SWIFT Environment Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Default-deny at end of every ruleset
  • No ''allow any'' rules present
  • Every rule has source/dest/port/protocol/action
  • Annual review evidence with sign-off date within 12 months
CROSS-CHECK VALIDATION:
  • Firewalls match placement on A1 diagram
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A4', 'Firewall rule sets', '1.4', 'Restriction of Internet Access', 'M', 'Confirm the ''Firewall rule sets'' has been submitted as a Config Export. Check: (1) File is present and can be opened. (2) It is the correct document type (Config Export). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Restriction of Internet Access.', 'Review the ''Firewall rule sets'' to confirm it technically satisfies Control ''Restriction of Internet Access'':
MUST SHOW — Explicit deny rules for outbound internet from ALL secure zone systems | Jump server internet access explicitly blocked in rules | If allowlisted URL access exists: proxy destination rules with content inspection noted | General-purpose operator PC internet rules: through proxy/web gateway only | Any internet exception rules documented with: justification, approval, review date
PASS IF — Explicit deny for outbound internet from zone | Jump server has no internet-permitting rule | Any exceptions documented with justification
FAIL IF — No deny rules for internet from zone | Broad internet access permitted from zone systems | Jump server has internet-permitting rule', 'Independently attest ''Firewall rule sets'' for Control ''Restriction of Internet Access'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Explicit deny for outbound internet from zone
  • Jump server has no internet-permitting rule
  • Any exceptions documented with justification
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A4', 'Firewall rule sets', '1.5', 'Customer Environment Protection', 'M', 'Confirm the ''Firewall rule sets'' has been submitted as a Config Export. Check: (1) File is present and can be opened. (2) It is the correct document type (Config Export). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Customer Environment Protection.', 'Review the ''Firewall rule sets'' to confirm it technically satisfies Control ''Customer Environment Protection'':
MUST SHOW — Segmentation rules between customer connector zone and enterprise network | Deny-by-default for customer zone boundary equivalent to 1.1 protection | Only explicitly permitted traffic between customer zone and enterprise | Segmentation rules between customer zone and main SWIFT secure zone | Annual review evidence for customer zone firewall rules
PASS IF — Customer zone has deny-by-default equivalent to main zone | Explicit rules only for permitted traffic
FAIL IF — No firewall rules for customer zone boundary', 'Independently attest ''Firewall rule sets'' for Control ''Customer Environment Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Customer zone has deny-by-default equivalent to main zone
  • Explicit rules only for permitted traffic
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A5', 'Architecture type declaration', 'ALL', 'All 32 Controls (Scoping)', 'M+A', 'Confirm the ''Architecture type declaration'' has been submitted as a Form / Declaration. Check: (1) File is present and can be opened. (2) It is the correct document type (Form / Declaration). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control All 32 Controls (Scoping).', 'Review the ''Architecture type declaration'' to confirm it technically satisfies Control ''All 32 Controls (Scoping)'':
MUST SHOW — Formal declaration of architecture type: A1, A2, A3, A4, or B | Decision rationale documented: why this architecture type applies | Key infrastructure characteristics supporting the declaration: | SWIFT BIC(s) covered by this assessment listed | Changes from previous architecture type noted (if applicable)
PASS IF — Architecture type formally declared with rationale | BIC(s) listed for scope | Declaration matches actual infrastructure in A2
FAIL IF — No formal declaration | Declared type contradicts component inventory (e.g., declared A4 but has messaging interface)', 'Independently attest ''Architecture type declaration'' for Control ''All 32 Controls (Scoping)'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Architecture type formally declared with rationale
  • BIC(s) listed for scope
  • Declaration matches actual infrastructure in A2
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A6', 'Secure zone design rationale', '1.1', 'SWIFT Environment Protection', 'M', 'Confirm the ''Secure zone design rationale'' has been submitted as a Document. Check: (1) File is present and can be opened. (2) It is the correct document type (Document). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control SWIFT Environment Protection.', 'Review the ''Secure zone design rationale'' to confirm it technically satisfies Control ''SWIFT Environment Protection'':
MUST SHOW — Written rationale for WHY specific zone boundaries were drawn at those points | Reference to SWIFT Security Guidance and/or CSCF Appendix B reference architectures | Justification for zone scope: why certain systems are included/excluded | Explanation of segmentation approach chosen (dedicated SWIFT zone vs extended production zone vs payment zone) | Authentication zone separation rationale: why separate AD/LDAP used
PASS IF — Written rationale exists referencing SWIFT guidance | Zone scope justified with inclusion/exclusion reasoning | Segmentation approach explained
FAIL IF — No written rationale document | Zone design contradicts CSCF guidance without justification
CROSS-CHECK — Rationale aligns with actual zone shown in A1', 'Independently attest ''Secure zone design rationale'' for Control ''SWIFT Environment Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Written rationale exists referencing SWIFT guidance
  • Zone scope justified with inclusion/exclusion reasoning
  • Segmentation approach explained
CROSS-CHECK VALIDATION:
  • Rationale aligns with actual zone shown in A1
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('A6', 'Secure zone design rationale', '1.5', 'Customer Environment Protection', 'M', 'Confirm the ''Secure zone design rationale'' has been submitted as a Document. Check: (1) File is present and can be opened. (2) It is the correct document type (Document). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Customer Environment Protection.', 'Review the ''Secure zone design rationale'' to confirm it technically satisfies Control ''Customer Environment Protection'':
MUST SHOW — Rationale for customer connector zone design choices | Explanation of why equivalent protection to main secure zone is achieved | Justification for segmentation between customer zone and main SWIFT zone | Risk assessment for customer zone scope decisions
PASS IF — Customer zone rationale documents equivalent protection | Segmentation approach justified
FAIL IF — No rationale for customer zone design', 'Independently attest ''Secure zone design rationale'' for Control ''Customer Environment Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Customer zone rationale documents equivalent protection
  • Segmentation approach justified
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('B1', 'OS hardening configuration', '1.2', 'OS Privileged Account Control', 'M', 'Confirm the ''OS hardening configuration'' has been submitted as a Config / Screenshots. Check: (1) File is present and can be opened. (2) It is the correct document type (Config / Screenshots). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control OS Privileged Account Control.', 'Review the ''OS hardening configuration'' to confirm it technically satisfies Control ''OS Privileged Account Control'':
MUST SHOW — Privileged account restriction settings per system: sudo configuration, UAC settings, admin group memberships | Built-in administrator account status: disabled for interactive login or restricted to maintenance mode | Individual administrator accounts configured with escalation (sudo) rather than shared admin | Service account restrictions: minimal privileges, no interactive login where possible | Privilege elevation logging enabled (sudo logs, Windows security event log)
PASS IF — Built-in admin accounts disabled for normal login | Individual admin accounts with sudo/escalation configured | Privilege elevation logging enabled | Admin passwords not stored in enterprise AD
FAIL IF — Built-in admin account enabled for interactive login | Shared admin accounts without individual accountability | No privilege elevation logging', 'Independently attest ''OS hardening configuration'' for Control ''OS Privileged Account Control'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Built-in admin accounts disabled for normal login
  • Individual admin accounts with sudo/escalation configured
  • Privilege elevation logging enabled
  • Admin passwords not stored in enterprise AD
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('B1', 'OS hardening configuration', '2.3', 'System Hardening', 'M', 'Confirm the ''OS hardening configuration'' has been submitted as a Config / Screenshots. Check: (1) File is present and can be opened. (2) It is the correct document type (Config / Screenshots). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control System Hardening.', 'Review the ''OS hardening configuration'' to confirm it technically satisfies Control ''System Hardening'':
MUST SHOW — Hardening baseline applied: CIS benchmark, DISA STIG, NIST, or vendor security guidance identified | Default passwords changed on all systems | Unnecessary user accounts disabled or removed | Unnecessary services, ports, and protocols disabled or restricted | Unnecessary software removed
PASS IF — Identified hardening baseline applied | Default passwords changed | Unnecessary services/ports/software removed | USB/removable media restricted
FAIL IF — Default passwords still active | Unnecessary services running (e.g., FTP, Telnet, print spooler) | No auto-lock or >15 min timeout', 'Independently attest ''OS hardening configuration'' for Control ''System Hardening'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Identified hardening baseline applied
  • Default passwords changed
  • Unnecessary services/ports/software removed
  • USB/removable media restricted
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('B2', 'SWIFT application security config', '2.6', 'Operator Session Confidentiality', 'M', 'Confirm the ''SWIFT application security config'' has been submitted as a Config / Screenshots. Check: (1) File is present and can be opened. (2) It is the correct document type (Config / Screenshots). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Operator Session Confidentiality.', 'Review the ''SWIFT application security config'' to confirm it technically satisfies Control ''Operator Session Confidentiality'':
MUST SHOW — Encrypted session configuration for all operator connections: TLS version (1.2+), SSH version | Cipher suites configured: current accepted algorithms (AES, ECDHE) | GUI access security settings: HTTPS enforced, certificate validation enabled | Session timeout/inactivity lock-out configured at application level | Jump server to application connection protection: TLS or equivalent
PASS IF — TLS 1.2+ enforced for all operator sessions | Strong cipher suites only (AES-256, ECDHE) | Session timeout configured | Weak protocols disabled
FAIL IF — TLS 1.0/1.1 still enabled | Weak ciphers present (RC4, DES, 3DES) | No session timeout configured
CROSS-CHECK — Aligns with B3 transport-level encryption config', 'Independently attest ''SWIFT application security config'' for Control ''Operator Session Confidentiality'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • TLS 1.2+ enforced for all operator sessions
  • Strong cipher suites only (AES-256, ECDHE)
  • Session timeout configured
  • Weak protocols disabled
CROSS-CHECK VALIDATION:
  • Aligns with B3 transport-level encryption config
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('B2', 'SWIFT application security config', '2.10', 'Application Hardening', 'M', 'Confirm the ''SWIFT application security config'' has been submitted as a Config / Screenshots. Check: (1) File is present and can be opened. (2) It is the correct document type (Config / Screenshots). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Application Hardening.', 'Review the ''SWIFT application security config'' to confirm it technically satisfies Control ''Application Hardening'':
MUST SHOW — SWIFT application hardened per Alliance Security Guidance or vendor documentation | Default application passwords changed | Unnecessary user accounts disabled or removed | Unnecessary application components, adaptors, or connectivity methods disabled | Adaptors and connectivity methods securely configured
PASS IF — Alliance Security Guidance applied | Default passwords changed at application level | Unnecessary adaptors/components disabled | Deviations documented
FAIL IF — Default application passwords still active | Unnecessary connectivity methods enabled | No evidence of vendor guidance application
CROSS-CHECK — Compare against B6 baseline comparison results', 'Independently attest ''SWIFT application security config'' for Control ''Application Hardening'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Alliance Security Guidance applied
  • Default passwords changed at application level
  • Unnecessary adaptors/components disabled
  • Deviations documented
CROSS-CHECK VALIDATION:
  • Compare against B6 baseline comparison results
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('B3', 'Encryption configuration', '2.1', 'Internal Data Flow Security', 'M', 'Confirm the ''Encryption configuration'' has been submitted as a Config Export. Check: (1) File is present and can be opened. (2) It is the correct document type (Config Export). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Internal Data Flow Security.', 'Review the ''Encryption configuration'' to confirm it technically satisfies Control ''Internal Data Flow Security'':
MUST SHOW — Encryption configuration for each internal SWIFT-to-SWIFT component flow: | Per-flow detail: TLS version, cipher suite, certificate type (mutual/one-way) | LAU configuration if used (in combination with TLS) | Cross-environment flow encryption (on-prem to cloud) | Cryptographic algorithm validation: AES, ECDHE with current key lengths
PASS IF — Every inter-component flow has encryption config documented | TLS 1.2+ with strong ciphers for each flow | Cross-environment flows encrypted
FAIL IF — Any flow without encryption configured | Weak TLS versions or cipher suites | Self-signed certificates without justification
CROSS-CHECK — Flows must match A3 data flow diagrams', 'Independently attest ''Encryption configuration'' for Control ''Internal Data Flow Security'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Every inter-component flow has encryption config documented
  • TLS 1.2+ with strong ciphers for each flow
  • Cross-environment flows encrypted
CROSS-CHECK VALIDATION:
  • Flows must match A3 data flow diagrams
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('B3', 'Encryption configuration', '2.4A', 'Back Office Data Flow Security', 'A', 'Confirm the ''Encryption configuration'' has been submitted as a Config Export. Check: (1) File is present and can be opened. (2) It is the correct document type (Config Export). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Back Office Data Flow Security.', 'Review the ''Encryption configuration'' to confirm it technically satisfies Control ''Back Office Data Flow Security'':
MUST SHOW — Encryption/protection config for EACH back-office to secure zone flow: | Two-way TLS configuration for direct point-to-point flows | Bridging server TLS config for each leg (back-office→bridging, bridging→SWIFT) | Flows to HSM encryption config | For unprotected legacy flows: risk assessment and remediation plan documented
PASS IF — Protection config documented per flow/leg | Current cryptographic algorithms used | Unprotected flows have risk assessment + plan
FAIL IF — Back-office flows with no encryption evidence | Legacy flows without risk assessment
CROSS-CHECK — Flows match A3 diagrams; bridging servers match A2', 'Independently attest ''Encryption configuration'' for Control ''Back Office Data Flow Security'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Protection config documented per flow/leg
  • Current cryptographic algorithms used
  • Unprotected flows have risk assessment + plan
CROSS-CHECK VALIDATION:
  • Flows match A3 diagrams; bridging servers match A2
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('B3', 'Encryption configuration', '2.5A', 'External Transmission Data Protection', 'A', 'Confirm the ''Encryption configuration'' has been submitted as a Config Export. Check: (1) File is present and can be opened. (2) It is the correct document type (Config Export). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control External Transmission Data Protection.', 'Review the ''Encryption configuration'' to confirm it technically satisfies Control ''External Transmission Data Protection'':
MUST SHOW — Encryption-in-transit config for external transmissions: TLS 1.2+ with strong ciphers | Encryption-at-rest config for SWIFT data stored outside secure zone: AES-256 or equivalent | Backup encryption configuration: encryption method, key management | Data replication encryption between data centres or to cloud | SAN/NAS encryption if used for SWIFT data
PASS IF — Transit encryption TLS 1.2+ for all external paths | At-rest encryption for backups and replicated data | Key management documented
FAIL IF — Backups stored unencrypted outside zone | Weak encryption algorithms | No key management process', 'Independently attest ''Encryption configuration'' for Control ''External Transmission Data Protection'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Transit encryption TLS 1.2+ for all external paths
  • At-rest encryption for backups and replicated data
  • Key management documented
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('B3', 'Encryption configuration', '2.6', 'Operator Session Confidentiality', 'M', 'Confirm the ''Encryption configuration'' has been submitted as a Config Export. Check: (1) File is present and can be opened. (2) It is the correct document type (Config Export). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Operator Session Confidentiality.', 'Review the ''Encryption configuration'' to confirm it technically satisfies Control ''Operator Session Confidentiality'':
MUST SHOW — Transport-level encryption config for ALL operator session types: | TLS version and cipher suite per session type | Certificate configuration: type, validation, expiry monitoring | Inactivity lock-out at transport level if not at application level
PASS IF — Every session type has encryption config | TLS 1.2+ with strong ciphers for all sessions | Certificate validation enabled
FAIL IF — Unencrypted session types (plain HTTP, Telnet) | Weak ciphers or protocol versions', 'Independently attest ''Encryption configuration'' for Control ''Operator Session Confidentiality'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Every session type has encryption config
  • TLS 1.2+ with strong ciphers for all sessions
  • Certificate validation enabled
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('B4', 'Virtualisation platform configuration', '1.3', 'Virtualisation/Cloud Platform Protection', 'M/A', 'Confirm the ''Virtualisation platform configuration'' has been submitted as a Config Export / Screenshots. Check: (1) File is present and can be opened. (2) It is the correct document type (Config Export / Screenshots). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Virtualisation/Cloud Platform Protection.', 'Review the ''Virtualisation platform configuration'' to confirm it technically satisfies Control ''Virtualisation/Cloud Platform Protection'':
MUST SHOW — Hypervisor/cloud platform security configuration showing equivalent protection to physical systems | VM isolation configuration: prevents lateral movement between VMs | Network flow filtering for SWIFT VMs: external to hypervisor or enforced at hypervisor level | Platform located in secure zone or equivalent secure zone | Privileged access restrictions on virtualisation platform
PASS IF — VM isolation configured and verified | Platform in secure zone with equivalent controls | Privileged access restricted on platform | Platform patched and updated
FAIL IF — No VM isolation evidence | Platform outside any secure zone | Default admin credentials on platform
CROSS-CHECK — VMs match A2 inventory host/guest mapping', 'Independently attest ''Virtualisation platform configuration'' for Control ''Virtualisation/Cloud Platform Protection'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • VM isolation configured and verified
  • Platform in secure zone with equivalent controls
  • Privileged access restricted on platform
  • Platform patched and updated
CROSS-CHECK VALIDATION:
  • VMs match A2 inventory host/guest mapping
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('B5', 'Password policy configuration', '4.1', 'Password Policy', 'M', 'Confirm the ''Password policy configuration'' has been submitted as a Config / Screenshots. Check: (1) File is present and can be opened. (2) It is the correct document type (Config / Screenshots). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Password Policy.', 'Review the ''Password policy configuration'' to confirm it technically satisfies Control ''Password Policy'':
MUST SHOW — Password policy settings enforced through technical means (AD Group Policy, application settings): | PIN settings for tokens and mobile devices used as second factor | Separate policy considerations for: | Passwords for zone systems stored only in zone-local authentication (not enterprise AD) | LM hash prevention configured (NoLMHash registry on Windows)
PASS IF — Password length ≥15 chars for Windows systems | Complexity, expiration, history all enforced technically | Account lockout configured with reasonable threshold | NoLMHash enabled on Windows
FAIL IF — Password length <8 characters | No complexity requirement | No account lockout', 'Independently attest ''Password policy configuration'' for Control ''Password Policy'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Password length ≥15 chars for Windows systems
  • Complexity, expiration, history all enforced technically
  • Account lockout configured with reasonable threshold
  • NoLMHash enabled on Windows
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('B6', 'Hardening baseline comparison', '2.3', 'System Hardening', 'M', 'Confirm the ''Hardening baseline comparison'' has been submitted as a Scan Report. Check: (1) File is present and can be opened. (2) It is the correct document type (Scan Report). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control System Hardening.', 'Review the ''Hardening baseline comparison'' to confirm it technically satisfies Control ''System Hardening'':
MUST SHOW — Comparison results of current system config against selected hardening baseline (CIS/DISA STIG/NIST/vendor) | Baseline name and version identified | Per-system compliance score or pass/fail per hardening rule | Deviations from baseline listed with: deviation description, justification, compensating control | Scan date within last 6 months (checked at least twice per year per CSCF)
PASS IF — Identified baseline applied and compared | Deviations documented with justification | Scan date within 6 months | All system types covered
FAIL IF — No baseline identified | Deviations without justification | Scan older than 6 months', 'Independently attest ''Hardening baseline comparison'' for Control ''System Hardening'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Identified baseline applied and compared
  • Deviations documented with justification
  • Scan date within 6 months
  • All system types covered
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('B6', 'Hardening baseline comparison', '2.10', 'Application Hardening', 'M', 'Confirm the ''Hardening baseline comparison'' has been submitted as a Scan Report. Check: (1) File is present and can be opened. (2) It is the correct document type (Scan Report). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Application Hardening.', 'Review the ''Hardening baseline comparison'' to confirm it technically satisfies Control ''Application Hardening'':
MUST SHOW — SWIFT application settings compared to Alliance Security Guidance or vendor documentation | Feature/service minimisation verified: unnecessary components disabled | Default credential changes confirmed at application level | Application-specific hardening rules checked | Deviations from vendor guidance documented with justification
PASS IF — Application config compared against vendor guidance | Unnecessary features disabled | Default credentials changed
FAIL IF — No vendor guidance comparison | Default credentials still active', 'Independently attest ''Hardening baseline comparison'' for Control ''Application Hardening'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Application config compared against vendor guidance
  • Unnecessary features disabled
  • Default credentials changed
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('B6', 'Hardening baseline comparison', '6.2', 'Software Integrity', 'M', 'Confirm the ''Hardening baseline comparison'' has been submitted as a Check Results. Check: (1) File is present and can be opened. (2) It is the correct document type (Check Results). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Software Integrity.', 'Review the ''Hardening baseline comparison'' to confirm it technically satisfies Control ''Software Integrity'':
MUST SHOW — Provides the AUTHORIZED SOFTWARE BASELINE against which integrity checks (E4) are compared | List of authorized/approved SWIFT software with: name, version, hash/checksum | Unauthorized or unexpected software flagged | Baseline established and version-controlled | Change history showing authorized updates to baseline
PASS IF — Authorized software list established with hashes | Baseline version-controlled
FAIL IF — No authorized baseline exists', 'Independently attest ''Hardening baseline comparison'' for Control ''Software Integrity'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Authorized software list established with hashes
  • Baseline version-controlled
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('B7', 'MFA configuration', '4.2', 'Multi-Factor Authentication', 'M', 'Confirm the ''MFA configuration'' has been submitted as a Config / Screenshots. Check: (1) File is present and can be opened. (2) It is the correct document type (Config / Screenshots). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Multi-Factor Authentication.', 'Review the ''MFA configuration'' to confirm it technically satisfies Control ''Multi-Factor Authentication'':
MUST SHOW — MFA implementation per access point (all must be documented): | Second factor type per access point: TOTP, RSA SecurID, Digipass, USB token, smart card, 3-Skey Digital, mobile app | CRITICAL: Second factor device is DIFFERENT from first factor device (phone ≠ PC entering password) | MFA system authentication credentials stored within secure zone (not enterprise AD) | Individual assignment of authentication factors confirmed
PASS IF — MFA configured at all required access points | Second factor is on separate device from first factor | Factors individually assigned | MFA system credentials in secure zone
FAIL IF — Any required access point without MFA | Both factors on same device (app on same PC) | Shared tokens/factors
CROSS-CHECK — Access points must match C1 policy requirements', 'Independently attest ''MFA configuration'' for Control ''Multi-Factor Authentication'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • MFA configured at all required access points
  • Second factor is on separate device from first factor
  • Factors individually assigned
  • MFA system credentials in secure zone
CROSS-CHECK VALIDATION:
  • Access points must match C1 policy requirements
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('B8', 'Operator session configuration', '2.6', 'Operator Session Confidentiality', 'M', 'Confirm the ''Operator session configuration'' has been submitted as a Config / Screenshots. Check: (1) File is present and can be opened. (2) It is the correct document type (Config / Screenshots). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Operator Session Confidentiality.', 'Review the ''Operator session configuration'' to confirm it technically satisfies Control ''Operator Session Confidentiality'':
MUST SHOW — Session timeout/inactivity lock-out settings per session type: | Timeout value: recommended ≤15 minutes inactivity | Session recording configuration for privileged accounts (optional enhancement but recommended) | Re-authentication requirements after timeout | Concurrent session restrictions if configured
PASS IF — Session timeout configured ≤15 minutes for all session types | Screen lock on all operator PCs | Re-authentication required after timeout
FAIL IF — No session timeout at any level | Timeout >30 minutes | Privileged sessions without recording (acceptable but noted)', 'Independently attest ''Operator session configuration'' for Control ''Operator Session Confidentiality'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Session timeout configured ≤15 minutes for all session types
  • Screen lock on all operator PCs
  • Re-authentication required after timeout
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('C1', 'Access control policy', '1.2', 'OS Privileged Account Control', 'M', 'Confirm the ''Access control policy'' has been submitted as a Policy Document. Check: (1) File is present and can be opened. (2) It is the correct document type (Policy Document). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control OS Privileged Account Control.', 'Review the ''Access control policy'' to confirm it technically satisfies Control ''OS Privileged Account Control'':
MUST SHOW — Policy governing privileged account allocation and usage on ALL in-scope component types: | Conditions for admin access: software install, config, maintenance, emergency only | Duration limits: admin access limited to activity duration | Built-in admin account policy: restricted to emergency/break-glass only | Individual admin accounts required (no shared admin)
PASS IF — Policy exists covering all in-scope component types | Conditions for admin usage defined | Built-in admin restricted to emergency | Individual accountability required
FAIL IF — No policy document exists | Policy doesn''t cover all component types (e.g., missing network devices) | No restriction on admin account usage', 'Independently attest ''Access control policy'' for Control ''OS Privileged Account Control'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Policy exists covering all in-scope component types
  • Conditions for admin usage defined
  • Built-in admin restricted to emergency
  • Individual accountability required
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('C1', 'Access control policy', '1.3', 'Virtualisation/Cloud Platform Protection', 'M/A', 'Confirm the ''Access control policy'' has been submitted as a Policy Document. Check: (1) File is present and can be opened. (2) It is the correct document type (Policy Document). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Virtualisation/Cloud Platform Protection.', 'Review the ''Access control policy'' to confirm it technically satisfies Control ''Virtualisation/Cloud Platform Protection'':
MUST SHOW — Policy covering virtualisation/cloud platform access control | Segregation of admin roles for platform management | VM provisioning and decommissioning approval process | Platform access restricted to authorised administrators only | For cloud: shared responsibility delineation per CSCF Appendix G
PASS IF — Platform access policy exists | Admin role segregation defined | Cloud shared responsibility addressed
FAIL IF — No virtualisation access policy | No cloud shared responsibility model', 'Independently attest ''Access control policy'' for Control ''Virtualisation/Cloud Platform Protection'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Platform access policy exists
  • Admin role segregation defined
  • Cloud shared responsibility addressed
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('C1', 'Access control policy', '2.6', 'Operator Session Confidentiality', 'M', 'Confirm the ''Access control policy'' has been submitted as a Policy Document. Check: (1) File is present and can be opened. (2) It is the correct document type (Policy Document). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Operator Session Confidentiality.', 'Review the ''Access control policy'' to confirm it technically satisfies Control ''Operator Session Confidentiality'':
MUST SHOW — Session management rules: encryption requirements for all operator sessions | Session timeout policy: maximum inactivity period defined | Remote access policy: VPN+MFA requirement for off-site access | Session recording policy for privileged accounts | Acceptable session types and protocols defined
PASS IF — Session encryption requirement documented | Timeout period defined | Remote access rules documented
FAIL IF — No session management policy | No remote access policy', 'Independently attest ''Access control policy'' for Control ''Operator Session Confidentiality'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Session encryption requirement documented
  • Timeout period defined
  • Remote access rules documented
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('C1', 'Access control policy', '4.2', 'Multi-Factor Authentication', 'M', 'Confirm the ''Access control policy'' has been submitted as a Policy Document. Check: (1) File is present and can be opened. (2) It is the correct document type (Policy Document). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Multi-Factor Authentication.', 'Review the ''Access control policy'' to confirm it technically satisfies Control ''Multi-Factor Authentication'':
MUST SHOW — MFA requirements for each access point to SWIFT infrastructure | Which access points require MFA (admin, end user, remote, VPN, cloud, HSM) | Approved second factor types and NIST AAL2 guidance reference | Same-device prohibition: second factor must be on different device from first factor | Individual factor assignment requirement
PASS IF — MFA requirements per access point documented | Same-device prohibition stated | Approved factor types listed
FAIL IF — No MFA policy | Same-device prohibition not addressed
CROSS-CHECK — Policy requirements match B7 MFA technical implementation', 'Independently attest ''Access control policy'' for Control ''Multi-Factor Authentication'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • MFA requirements per access point documented
  • Same-device prohibition stated
  • Approved factor types listed
CROSS-CHECK VALIDATION:
  • Policy requirements match B7 MFA technical implementation
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('C1', 'Access control policy', '5.1', 'Logical Access Control', 'M', 'Confirm the ''Access control policy'' has been submitted as a Policy Document. Check: (1) File is present and can be opened. (2) It is the correct document type (Policy Document). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Logical Access Control.', 'Review the ''Access control policy'' to confirm it technically satisfies Control ''Logical Access Control'':
MUST SHOW — Need-to-know principle: only operators with continuing requirement have zone access | Least privilege: privileges tailored to individual needs; additional privileges temporary only | Separation of duties: transaction submission ≠ approval; app admin ≠ security officer; network admin ≠ OS admin | Four-eyes principle for sensitive operations on: messaging interface, communication interface, GUI, connectors, HSM, O2M, Secure Channel | Account review mandate: at least annually (more frequently recommended)
PASS IF — All four principles documented (need-to-know, least privilege, SoD, four-eyes) | Annual review mandate stated | JML process defined | Emergency access procedure documented
FAIL IF — Missing any of the four core principles | No account review mandate | No JML process', 'Independently attest ''Access control policy'' for Control ''Logical Access Control'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • All four principles documented (need-to-know, least privilege, SoD, four-eyes)
  • Annual review mandate stated
  • JML process defined
  • Emergency access procedure documented
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('C2', 'Privileged account inventory', '1.2', 'OS Privileged Account Control', 'M', 'Confirm the ''Privileged account inventory'' has been submitted as a Spreadsheet. Check: (1) File is present and can be opened. (2) It is the correct document type (Spreadsheet). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control OS Privileged Account Control.', 'Review the ''Privileged account inventory'' to confirm it technically satisfies Control ''OS Privileged Account Control'':
MUST SHOW — Complete list of ALL privileged accounts per in-scope SWIFT system: | Justification for each account: why it exists and requires admin privileges | Last review date per account | Owner/assignee per individual admin account | Built-in admin accounts: marked as break-glass with controlled access documentation
PASS IF — Every in-scope system has its privileged accounts listed | Each account has justification and owner | Built-in admins marked as break-glass | Review date within 12 months
FAIL IF — Systems with no accounts listed (compare to A2) | Accounts without justification | Shared admin accounts without individual accountability
CROSS-CHECK — Systems match A2 inventory; accounts align with C3 access list', 'Independently attest ''Privileged account inventory'' for Control ''OS Privileged Account Control'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Every in-scope system has its privileged accounts listed
  • Each account has justification and owner
  • Built-in admins marked as break-glass
  • Review date within 12 months
CROSS-CHECK VALIDATION:
  • Systems match A2 inventory; accounts align with C3 access list
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('C2', 'Privileged account inventory', '5.1', 'Logical Access Control', 'M', 'Confirm the ''Privileged account inventory'' has been submitted as a Spreadsheet. Check: (1) File is present and can be opened. (2) It is the correct document type (Spreadsheet). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Logical Access Control.', 'Review the ''Privileged account inventory'' to confirm it technically satisfies Control ''Logical Access Control'':
MUST SHOW — Privileged accounts cross-referenced with RBAC roles (C4) | Evidence of quarterly/annual review with: review date, reviewer, actions taken | Stale/orphan accounts identified and removed or justified | Separation of duties verified: no single account has conflicting roles | Provider accounts reviewed against current engagement status
PASS IF — Accounts mapped to RBAC roles | Review evidence with actions | Stale accounts addressed
FAIL IF — No review evidence | Conflicting roles on single account', 'Independently attest ''Privileged account inventory'' for Control ''Logical Access Control'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Accounts mapped to RBAC roles
  • Review evidence with actions
  • Stale accounts addressed
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('C3', 'User access list', '5.1', 'Logical Access Control', 'M', 'Confirm the ''User access list'' has been submitted as a Spreadsheet / Export. Check: (1) File is present and can be opened. (2) It is the correct document type (Spreadsheet / Export). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Logical Access Control.', 'Review the ''User access list'' to confirm it technically satisfies Control ''Logical Access Control'':
MUST SHOW — Complete list of ALL user accounts (not just privileged) across all in-scope SWIFT systems: | Covers: OS accounts, application accounts (messaging interface, GUI, connector), network device accounts, virtualisation platform accounts, O2M accounts | Access justified by job function (need-to-know demonstrated) | Account status: active, disabled, locked | Last login date per account (identify unused accounts)
PASS IF — All in-scope systems have user lists exported | Every account has assigned role and justification | External accounts identified with end dates
FAIL IF — Systems missing from user list | Accounts without role assignment | Inactive accounts (no login >90 days) without explanation
CROSS-CHECK — Must cover all systems in A2 inventory', 'Independently attest ''User access list'' for Control ''Logical Access Control'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • All in-scope systems have user lists exported
  • Every account has assigned role and justification
  • External accounts identified with end dates
CROSS-CHECK VALIDATION:
  • Must cover all systems in A2 inventory
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('C4', 'RBAC role definitions', '5.1', 'Logical Access Control', 'M', 'Confirm the ''RBAC role definitions'' has been submitted as a Document / Config Export. Check: (1) File is present and can be opened. (2) It is the correct document type (Document / Config Export). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Logical Access Control.', 'Review the ''RBAC role definitions'' to confirm it technically satisfies Control ''Logical Access Control'':
MUST SHOW — Role definitions for ALL in-scope SWIFT applications and systems: | Per role: permissions/privileges, access scope, data access level | Separation of duties enforced in role design: transaction submit ≠ approve; app admin ≠ security officer | Four-eyes principle enforced: sensitive operations require two separate roles | Vendor role separation guidance followed (Alliance Security Guidance)
PASS IF — Roles defined for all SWIFT application and system types | SoD enforced in role design | Four-eyes for sensitive operations | Vendor guidance on role separation followed
FAIL IF — No role definitions | Single role with both submit and approve | No separation between admin and security officer
CROSS-CHECK — Roles must map to accounts in C2 and C3', 'Independently attest ''RBAC role definitions'' for Control ''Logical Access Control'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Roles defined for all SWIFT application and system types
  • SoD enforced in role design
  • Four-eyes for sensitive operations
  • Vendor guidance on role separation followed
CROSS-CHECK VALIDATION:
  • Roles must map to accounts in C2 and C3
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('C5', 'Quarterly access reviews', '5.1', 'Logical Access Control', 'M', 'Confirm the ''Quarterly access reviews'' has been submitted as a Review Records. Check: (1) File is present and can be opened. (2) It is the correct document type (Review Records). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Logical Access Control.', 'Review the ''Quarterly access reviews'' to confirm it technically satisfies Control ''Logical Access Control'':
MUST SHOW — Evidence of access review conducted at least annually (quarterly recommended): | Findings documented: accounts to remove, roles to adjust, exceptions to approve | Actions taken after review: account removals, role changes, with completion dates | Privileged account review: extra scrutiny with justification confirmation | Provider account review: aligned with current engagement status
PASS IF — Review conducted within last 12 months | Scope covers all in-scope systems | Findings documented with actions taken | Privileged accounts reviewed with extra scrutiny
FAIL IF — No review evidence in last 12 months | Review scope incomplete (missing systems) | Findings identified but no remediation actions', 'Independently attest ''Quarterly access reviews'' for Control ''Logical Access Control'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Review conducted within last 12 months
  • Scope covers all in-scope systems
  • Findings documented with actions taken
  • Privileged accounts reviewed with extra scrutiny
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('C6', 'Joiner/mover/leaver process', '5.1', 'Logical Access Control', 'M', 'Confirm the ''Joiner/mover/leaver process'' has been submitted as a Process Document + Records. Check: (1) File is present and can be opened. (2) It is the correct document type (Process Document + Records). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Logical Access Control.', 'Review the ''Joiner/mover/leaver process'' to confirm it technically satisfies Control ''Logical Access Control'':
MUST SHOW — Documented JML process covering: | Provider JML: same process for third-party/contractor accounts | Timeline standards: leaver access revoked within X days of departure | Evidence of process execution: sample joiner/mover/leaver tickets with dates and actions | Escalation process: what happens if access is not revoked on time
PASS IF — JML process documented for all three stages | Provider accounts included in process | Evidence of actual execution (sample tickets) | Timely revocation (within defined SLA)
FAIL IF — No JML process documented | No leaver revocation evidence | Leaver accounts still active after departure date
CROSS-CHECK — Leaver accounts should not appear as active in C3', 'Independently attest ''Joiner/mover/leaver process'' for Control ''Logical Access Control'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • JML process documented for all three stages
  • Provider accounts included in process
  • Evidence of actual execution (sample tickets)
  • Timely revocation (within defined SLA)
CROSS-CHECK VALIDATION:
  • Leaver accounts should not appear as active in C3
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('C7', 'Token/certificate inventory and lifecycle', '5.2', 'Token Management', 'M', 'Confirm the ''Token/certificate inventory and lifecycle'' has been submitted as a Spreadsheet + Process. Check: (1) File is present and can be opened. (2) It is the correct document type (Spreadsheet + Process). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Token Management.', 'Review the ''Token/certificate inventory and lifecycle'' to confirm it technically satisfies Control ''Token Management'':
MUST SHOW — Complete inventory of ALL tokens used for SWIFT operations: | Per token: token ID/serial, type, assigned person, assignment date, status (active/revoked/lost) | Assignment and distribution process: controlled with documented approval | Annual review of token assignments: date, reviewer, findings | Revocation process: tokens recalled when individual no longer needs access
PASS IF — All tokens inventoried with assignment records | Annual review completed with findings | Revocation process documented and executed | PED key management with safe storage and access logging
FAIL IF — Tokens without assigned owner | No annual review evidence | Revoked tokens not recalled', 'Independently attest ''Token/certificate inventory and lifecycle'' for Control ''Token Management'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • All tokens inventoried with assignment records
  • Annual review completed with findings
  • Revocation process documented and executed
  • PED key management with safe storage and access logging
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('C8', 'Credential storage evidence', '5.4', 'Password Repository Protection', 'M', 'Confirm the ''Credential storage evidence'' has been submitted as a Config / Process. Check: (1) File is present and can be opened. (2) It is the correct document type (Config / Process). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Password Repository Protection.', 'Review the ''Credential storage evidence'' to confirm it technically satisfies Control ''Password Repository Protection'':
MUST SHOW — Password repository protection method documented: | Covers ALL account types: emergency/break-glass, privileged, operator, application-to-application, local auth keys | Passwords not in user manuals or operational documents (unless properly stored) | Passwords not hardcoded in scripts or code | Emergency access process: password changed immediately after emergency use; safe combination optionally changed
PASS IF — Encryption at rest for digital password store | Authenticated access with logging | Physical passwords in sealed envelopes in safe | Emergency password change process documented
FAIL IF — Plain text password storage | Passwords in scripts or code | No access logging on password repository
CROSS-CHECK — Access logs must be in E7 admin monitoring', 'Independently attest ''Credential storage evidence'' for Control ''Password Repository Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Encryption at rest for digital password store
  • Authenticated access with logging
  • Physical passwords in sealed envelopes in safe
  • Emergency password change process documented
CROSS-CHECK VALIDATION:
  • Access logs must be in E7 admin monitoring
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('C9', 'Personnel vetting records', '5.3A', 'Staff Screening Process', 'A', 'Confirm the ''Personnel vetting records'' has been submitted as a Records / Process. Check: (1) File is present and can be opened. (2) It is the correct document type (Records / Process). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Staff Screening Process.', 'Review the ''Personnel vetting records'' to confirm it technically satisfies Control ''Staff Screening Process'':
MUST SHOW — Screening process documented for ALL staff with operational/admin access to SWIFT systems: | Initial screening verifications: | Periodic screening verifications: | Screening records maintained with: screening date, verification type, result, next screening due date | Catch-up plan for staff not yet screened who are already in role
PASS IF — Screening process documented | Initial screening covers all 6 verifications | Periodic screening within 5-year cycle | Records maintained with due dates
FAIL IF — No screening process | Staff in role >5 years without screening | Missing key verifications (no criminal check)', 'Independently attest ''Personnel vetting records'' for Control ''Staff Screening Process'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Screening process documented
  • Initial screening covers all 6 verifications
  • Periodic screening within 5-year cycle
  • Records maintained with due dates
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('D1', 'Patch management policy', '2.2', 'Security Updates', 'M', 'Confirm the ''Patch management policy'' has been submitted as a Policy Document. Check: (1) File is present and can be opened. (2) It is the correct document type (Policy Document). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Security Updates.', 'Review the ''Patch management policy'' to confirm it technically satisfies Control ''Security Updates'':
MUST SHOW — Documented patch management policy covering: | Scope: ALL in-scope components (servers, PCs, jump servers, network devices, HSM, virtualisation platform) | [Advisory: bridging servers included in scope]
PASS IF — Policy exists with criticality-based timelines | Vendor support lifecycle monitoring included | Source validation required before patching | All component types in scope
FAIL IF — No patch management policy | No criticality-based timelines | No source validation requirement', 'Independently attest ''Patch management policy'' for Control ''Security Updates'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Policy exists with criticality-based timelines
  • Vendor support lifecycle monitoring included
  • Source validation required before patching
  • All component types in scope
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('D2', 'Current patch levels', '2.2', 'Security Updates', 'M', 'Confirm the ''Current patch levels'' has been submitted as a Report / Export. Check: (1) File is present and can be opened. (2) It is the correct document type (Report / Export). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Security Updates.', 'Review the ''Current patch levels'' to confirm it technically satisfies Control ''Security Updates'':
MUST SHOW — Current patch status per in-scope system showing: | Summary: % of systems fully patched, systems with critical patches outstanding, systems approaching end-of-support | Per CSCF timeline compliance: critical patches applied <1 month, high <3 months | Vendor support expiry tracking: systems approaching end of active support
PASS IF — All A2 systems have patch status documented | All software within active vendor support | Critical patches applied within 1 month | SWIFT mandatory updates applied within deadline
FAIL IF — Systems with critical patches outstanding >1 month | Systems running end-of-support software | SWIFT mandatory updates overdue
CROSS-CHECK — System list must match A2 inventory exactly', 'Independently attest ''Current patch levels'' for Control ''Security Updates'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • All A2 systems have patch status documented
  • All software within active vendor support
  • Critical patches applied within 1 month
  • SWIFT mandatory updates applied within deadline
CROSS-CHECK VALIDATION:
  • System list must match A2 inventory exactly
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('D3', 'Patch deployment records', '2.2', 'Security Updates', 'M', 'Confirm the ''Patch deployment records'' has been submitted as a Records / Logs. Check: (1) File is present and can be opened. (2) It is the correct document type (Records / Logs). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Security Updates.', 'Review the ''Patch deployment records'' to confirm it technically satisfies Control ''Security Updates'':
MUST SHOW — Patch deployment history for last 12 months showing: | Emergency patching records with expedited timeline justification | Failed deployments: rollback actions, remediation | Deployment coverage: all in-scope system types included
PASS IF — 12-month deployment history exists | Critical patches deployed within 1-month SLA | Source validation recorded per deployment | Post-deployment verification documented
FAIL IF — No deployment records | Critical patches deployed >1 month after release | No source validation evidence', 'Independently attest ''Patch deployment records'' for Control ''Security Updates'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • 12-month deployment history exists
  • Critical patches deployed within 1-month SLA
  • Source validation recorded per deployment
  • Post-deployment verification documented
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('D4', 'Vulnerability scan reports', '2.7', 'Vulnerability Scanning', 'M', 'Confirm the ''Vulnerability scan reports'' has been submitted as a Scan Reports. Check: (1) File is present and can be opened. (2) It is the correct document type (Scan Reports). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Vulnerability Scanning.', 'Review the ''Vulnerability scan reports'' to confirm it technically satisfies Control ''Vulnerability Scanning'':
MUST SHOW — Vulnerability scan results covering ALL in-scope systems: | Scan tool identification: reputable vendor, profiles updated within 1 month before scan | Scan type: most appropriate for environment (authenticated vs network-based; internal vs external) | Scan frequency: at least annually AND after significant environment changes | Per-vulnerability: CVE ID, severity (CVSS), affected system, description, remediation recommendation
PASS IF — All in-scope systems scanned (compare to A2) | Scan tool reputable with profiles <1 month old | Scan within last 12 months | Per-vulnerability details documented
FAIL IF — In-scope systems missing from scan | Scan older than 12 months | Unknown/unreputable scan tool
CROSS-CHECK — System count matches A2; remediation tracked in D5', 'Independently attest ''Vulnerability scan reports'' for Control ''Vulnerability Scanning'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • All in-scope systems scanned (compare to A2)
  • Scan tool reputable with profiles <1 month old
  • Scan within last 12 months
  • Per-vulnerability details documented
CROSS-CHECK VALIDATION:
  • System count matches A2; remediation tracked in D5
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('D5', 'Vulnerability remediation tracking', '2.7', 'Vulnerability Scanning', 'M', 'Confirm the ''Vulnerability remediation tracking'' has been submitted as a Tracking Log. Check: (1) File is present and can be opened. (2) It is the correct document type (Tracking Log). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Vulnerability Scanning.', 'Review the ''Vulnerability remediation tracking'' to confirm it technically satisfies Control ''Vulnerability Scanning'':
MUST SHOW — Tracking log for ALL identified vulnerabilities from D4 scans: | Critical findings (CVSS 9.0+): resolution evidence within 1 month | High findings (CVSS 7.0-8.9): resolution evidence within 3 months | Risk-accepted vulnerabilities: formal risk acceptance with approver, justification, review date | Summary metrics: total open, critical open, average time to remediate
PASS IF — All D4 scan findings tracked with status | Critical findings resolved within 1 month | Risk acceptances formally documented with approval | Owner assigned per vulnerability
FAIL IF — Scan findings not tracked | Critical vulnerabilities open >1 month | Risk acceptance without formal approval', 'Independently attest ''Vulnerability remediation tracking'' for Control ''Vulnerability Scanning'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • All D4 scan findings tracked with status
  • Critical findings resolved within 1 month
  • Risk acceptances formally documented with approval
  • Owner assigned per vulnerability
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('D5', 'Vulnerability remediation tracking', '7.3A', 'Penetration Testing', 'A', 'Confirm the ''Vulnerability remediation tracking'' has been submitted as a Tracking Log. Check: (1) File is present and can be opened. (2) It is the correct document type (Tracking Log). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Penetration Testing.', 'Review the ''Vulnerability remediation tracking'' to confirm it technically satisfies Control ''Penetration Testing'':
MUST SHOW — Tracking log for ALL penetration test findings from D6 reports: | High/critical findings: prioritised remediation with evidence | Findings feeding back into security update process
PASS IF — All pen test findings tracked | High/critical findings remediated with retest | Retest confirms resolution
FAIL IF — Pen test findings not tracked | High/critical findings unresolved without justification', 'Independently attest ''Vulnerability remediation tracking'' for Control ''Penetration Testing'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • All pen test findings tracked
  • High/critical findings remediated with retest
  • Retest confirms resolution
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('D6', 'Penetration test reports', '7.3A', 'Penetration Testing', 'A', 'Confirm the ''Penetration test reports'' has been submitted as a Report. Check: (1) File is present and can be opened. (2) It is the correct document type (Report). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Penetration Testing.', 'Review the ''Penetration test reports'' to confirm it technically satisfies Control ''Penetration Testing'':
MUST SHOW — Penetration test report covering SWIFT secure zone and entry points: | Test frequency: at least every 2 years, and ideally after significant changes | Test date and version of environment tested | Findings: vulnerability description, exploitation path, severity, affected component | Recommendation per finding
PASS IF — Pen test conducted within last 2 years | Independent tester confirmed | Scope covers zone boundary and entry points | Findings documented with severity
FAIL IF — No pen test within 2 years | Test performed by infrastructure team (not independent) | Scope too narrow (missing key components)
CROSS-CHECK — Findings must be tracked in D5', 'Independently attest ''Penetration test reports'' for Control ''Penetration Testing'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Pen test conducted within last 2 years
  • Independent tester confirmed
  • Scope covers zone boundary and entry points
  • Findings documented with severity
CROSS-CHECK VALIDATION:
  • Findings must be tracked in D5
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('E1', 'Anti-malware configuration and updates', '6.1', 'Malware Protection', 'M', 'Confirm the ''Anti-malware configuration and updates'' has been submitted as a Config / Screenshots. Check: (1) File is present and can be opened. (2) It is the correct document type (Config / Screenshots). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Malware Protection.', 'Review the ''Anti-malware configuration and updates'' to confirm it technically satisfies Control ''Malware Protection'':
MUST SHOW — Anti-malware/EPP/EDR software installed on ALL Windows in-scope systems: | Software from reputable vendor identified | On-access (real-time) scanning enabled on all systems | On-demand full scanning: weekly for operator PCs (daily preferred), regular schedule for servers | Scan scope: all files on in-scope systems (exclusions require risk assessment documentation)
PASS IF — Anti-malware installed on all Windows in-scope systems | Reputable vendor identified | Real-time scanning enabled | Scheduled full scans configured
FAIL IF — In-scope systems without anti-malware | Signatures outdated (>30 days) | Real-time scanning disabled
CROSS-CHECK — System list matches A2 inventory (Windows systems)', 'Independently attest ''Anti-malware configuration and updates'' for Control ''Malware Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Anti-malware installed on all Windows in-scope systems
  • Reputable vendor identified
  • Real-time scanning enabled
  • Scheduled full scans configured
CROSS-CHECK VALIDATION:
  • System list matches A2 inventory (Windows systems)
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('E2', 'SIEM/logging configuration', '6.4', 'Logging and Monitoring', 'M', 'Confirm the ''SIEM/logging configuration'' has been submitted as a Config / Screenshots. Check: (1) File is present and can be opened. (2) It is the correct document type (Config / Screenshots). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Logging and Monitoring.', 'Review the ''SIEM/logging configuration'' to confirm it technically satisfies Control ''Logging and Monitoring'':
MUST SHOW — Logging infrastructure configuration showing: | Log retention configuration: | Log integrity protection: logs protected from enterprise admin compromise (separate system/credentials) | Log collection from remote/cloud components included
PASS IF — All in-scope systems forwarding logs to SIEM | Application logs retained ≥12 months | Firewall/DB logs retained ≥31 days | Logs protected from enterprise admin compromise
FAIL IF — In-scope systems not forwarding logs | Retention below minimum requirements | Logs stored without integrity protection
CROSS-CHECK — Log sources must cover all A2 systems', 'Independently attest ''SIEM/logging configuration'' for Control ''Logging and Monitoring'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • All in-scope systems forwarding logs to SIEM
  • Application logs retained ≥12 months
  • Firewall/DB logs retained ≥31 days
  • Logs protected from enterprise admin compromise
CROSS-CHECK VALIDATION:
  • Log sources must cover all A2 systems
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('E3', 'Alert rules and escalation procedures', '6.4', 'Logging and Monitoring', 'M', 'Confirm the ''Alert rules and escalation procedures'' has been submitted as a Documentation. Check: (1) File is present and can be opened. (2) It is the correct document type (Documentation). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Logging and Monitoring.', 'Review the ''Alert rules and escalation procedures'' to confirm it technically satisfies Control ''Logging and Monitoring'':
MUST SHOW — Alert rule definitions for SWIFT environment: | Escalation procedures for each alert type: | Monitoring process: | Evidence of regular log review execution (sample review records)
PASS IF — Alert rules defined for suspicious logins, admin access, changes | Escalation procedures documented with timelines | Daily monitoring process defined | Evidence of regular review execution
FAIL IF — No alert rules defined | No escalation procedures | No monitoring process', 'Independently attest ''Alert rules and escalation procedures'' for Control ''Logging and Monitoring'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Alert rules defined for suspicious logins, admin access, changes
  • Escalation procedures documented with timelines
  • Daily monitoring process defined
  • Evidence of regular review execution
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('E3', 'Alert rules and escalation procedures', '6.5A', 'Intrusion Detection', 'A', 'Confirm the ''Alert rules and escalation procedures'' has been submitted as a Documentation. Check: (1) File is present and can be opened. (2) It is the correct document type (Documentation). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Intrusion Detection.', 'Review the ''Alert rules and escalation procedures'' to confirm it technically satisfies Control ''Intrusion Detection'':
MUST SHOW — IDS/IPS-specific alert rules: | Response procedures for IDS alerts:
PASS IF — IDS alert rules defined for zone boundary | Both signature and anomaly detection configured | Response procedures documented
FAIL IF — No IDS-specific rules | No response procedures for IDS alerts', 'Independently attest ''Alert rules and escalation procedures'' for Control ''Intrusion Detection'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • IDS alert rules defined for zone boundary
  • Both signature and anomaly detection configured
  • Response procedures documented
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('E4', 'Software integrity verification', '6.2', 'Software Integrity', 'M', 'Confirm the ''Software integrity verification'' has been submitted as a Check Results. Check: (1) File is present and can be opened. (2) It is the correct document type (Check Results). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Software Integrity.', 'Review the ''Software integrity verification'' to confirm it technically satisfies Control ''Software Integrity'':
MUST SHOW — Integrity verification check results for ALL in-scope SWIFT components: | Check frequency: at startup + at least once daily | Implementation method: integrated product feature OR third-party FIM (File Integrity Monitoring) tool | Check results showing: baseline comparison result, any modifications detected, alert status | Download/deployment integrity: source/site validation and checksum verification before applying software
PASS IF — Integrity checks running on all in-scope components | Check frequency at startup + daily | Results show no unexpected modifications | Download integrity verification process documented
FAIL IF — Components without integrity checking | Checks not running at required frequency | Unexplained integrity violations without remediation
CROSS-CHECK — Baseline should reference B6 authorized software list', 'Independently attest ''Software integrity verification'' for Control ''Software Integrity'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Integrity checks running on all in-scope components
  • Check frequency at startup + daily
  • Results show no unexpected modifications
  • Download integrity verification process documented
CROSS-CHECK VALIDATION:
  • Baseline should reference B6 authorized software list
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('E4', 'Software integrity verification', '2.10', 'Application Hardening', 'M', 'Confirm the ''Software integrity verification'' has been submitted as a Check Results. Check: (1) File is present and can be opened. (2) It is the correct document type (Check Results). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Application Hardening.', 'Review the ''Software integrity verification'' to confirm it technically satisfies Control ''Application Hardening'':
MUST SHOW — Application whitelisting evidence: only authorized SWIFT applications running | Software version matches SWIFT-approved versions: verification against SWIFT release notes | No unauthorized application modifications detected | Application configuration integrity maintained against approved baseline
PASS IF — Only authorized applications running | Software versions match SWIFT-approved
FAIL IF — Unauthorized software detected | Software version mismatch', 'Independently attest ''Software integrity verification'' for Control ''Application Hardening'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Only authorized applications running
  • Software versions match SWIFT-approved
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('E5', 'Database integrity evidence', '6.3', 'Database Integrity', 'M', 'Confirm the ''Database integrity evidence'' has been submitted as a Check Results / Config. Check: (1) File is present and can be opened. (2) It is the correct document type (Check Results / Config). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Database Integrity.', 'Review the ''Database integrity evidence'' to confirm it technically satisfies Control ''Database Integrity'':
MUST SHOW — Database integrity check configuration and results for: | Integrity check type: record-level checksum/signature + sequential transaction number gap detection | Implementation: integrated messaging interface feature OR database product feature (if hosted DB protected to SWIFT level) | Check frequency: regular intervals (daily recommended; full check ideally every two weeks) | Results showing: integrity status, any violations detected, gaps in sequential numbering
PASS IF — Integrity checks enabled on transaction databases | Record-level checksums and sequential numbering checked | Regular check schedule (at minimum weekly) | Results show no integrity violations
FAIL IF — No integrity checking on SWIFT databases | Gaps in sequential transaction numbering unexplained | Integrity violations without remediation', 'Independently attest ''Database integrity evidence'' for Control ''Database Integrity'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Integrity checks enabled on transaction databases
  • Record-level checksums and sequential numbering checked
  • Regular check schedule (at minimum weekly)
  • Results show no integrity violations
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('E6', 'IDS/IPS configuration', '6.5A', 'Intrusion Detection', 'A', 'Confirm the ''IDS/IPS configuration'' has been submitted as a Config / Screenshots. Check: (1) File is present and can be opened. (2) It is the correct document type (Config / Screenshots). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Intrusion Detection.', 'Review the ''IDS/IPS configuration'' to confirm it technically satisfies Control ''Intrusion Detection'':
MUST SHOW — IDS/IPS system deployment configuration: | Configuration details: | Integration with SIEM/logging (forwarding to E2) | Cloud/remote environment coverage: detection for remote virtualisation platform | Large VLAN specific configuration if applicable
PASS IF — IDS deployed at zone boundary | Both signature and anomaly detection enabled | Signatures current (updated regularly) | Integrated with SIEM
FAIL IF — No IDS deployment | Signatures outdated | No anomaly detection capability', 'Independently attest ''IDS/IPS configuration'' for Control ''Intrusion Detection'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • IDS deployed at zone boundary
  • Both signature and anomaly detection enabled
  • Signatures current (updated regularly)
  • Integrated with SIEM
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('E7', 'Admin activity monitoring logs', '1.1', 'SWIFT Environment Protection', 'M', 'Confirm the ''Admin activity monitoring logs'' has been submitted as a Log Extracts. Check: (1) File is present and can be opened. (2) It is the correct document type (Log Extracts). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control SWIFT Environment Protection.', 'Review the ''Admin activity monitoring logs'' to confirm it technically satisfies Control ''SWIFT Environment Protection'':
MUST SHOW — Admin access logs for secure zone systems showing: | Zone boundary access monitoring: connections crossing zone boundary logged | Connection logging through boundary firewalls per 1.1 section (c)
PASS IF — Admin zone access logged with timestamps | Administrative actions recorded | Anomalous access alerting configured
FAIL IF — No admin access logging for zone systems | No boundary crossing logs
CROSS-CHECK — Must match E2 SIEM configuration scope', 'Independently attest ''Admin activity monitoring logs'' for Control ''SWIFT Environment Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Admin zone access logged with timestamps
  • Administrative actions recorded
  • Anomalous access alerting configured
CROSS-CHECK VALIDATION:
  • Must match E2 SIEM configuration scope
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('E7', 'Admin activity monitoring logs', '1.2', 'OS Privileged Account Control', 'M', 'Confirm the ''Admin activity monitoring logs'' has been submitted as a Log Extracts. Check: (1) File is present and can be opened. (2) It is the correct document type (Log Extracts). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control OS Privileged Account Control.', 'Review the ''Admin activity monitoring logs'' to confirm it technically satisfies Control ''OS Privileged Account Control'':
MUST SHOW — Admin login events captured per in-scope system: | Privilege escalation events logged: sudo usage on Linux, UAC elevation on Windows, root group actions | Administrative actions logged: config changes, user account modifications, software installations, service changes | Unusual admin activity alerting: logins outside business hours, multiple failed attempts, unexpected privilege escalation | Log review evidence: regular review of admin logs (daily recommended)
PASS IF — Admin login events captured with all fields | Privilege escalation events logged | Administrative actions tracked | Anomalous activity alerting configured
FAIL IF — No admin login logging | No privilege escalation logging | No admin action tracking', 'Independently attest ''Admin activity monitoring logs'' for Control ''OS Privileged Account Control'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Admin login events captured with all fields
  • Privilege escalation events logged
  • Administrative actions tracked
  • Anomalous activity alerting configured
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('E7', 'Admin activity monitoring logs', '5.4', 'Password Repository Protection', 'M', 'Confirm the ''Admin activity monitoring logs'' has been submitted as a Log Extracts. Check: (1) File is present and can be opened. (2) It is the correct document type (Log Extracts). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Password Repository Protection.', 'Review the ''Admin activity monitoring logs'' to confirm it technically satisfies Control ''Password Repository Protection'':
MUST SHOW — Credential store/password repository access logs: | Physical safe access logs (if passwords stored physically): | Emergency password retrieval events: logged and reviewed | Anomalous repository access: alerts for unusual access patterns or times
PASS IF — Repository access logged with user and action | Physical safe access logged | Emergency access events captured
FAIL IF — No access logging on password repository | No physical access tracking for safe
CROSS-CHECK — Access patterns should align with C8 credential storage evidence', 'Independently attest ''Admin activity monitoring logs'' for Control ''Password Repository Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Repository access logged with user and action
  • Physical safe access logged
  • Emergency access events captured
CROSS-CHECK VALIDATION:
  • Access patterns should align with C8 credential storage evidence
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('E7', 'Admin activity monitoring logs', '6.4', 'Logging and Monitoring', 'M', 'Confirm the ''Admin activity monitoring logs'' has been submitted as a Log Extracts. Check: (1) File is present and can be opened. (2) It is the correct document type (Log Extracts). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Logging and Monitoring.', 'Review the ''Admin activity monitoring logs'' to confirm it technically satisfies Control ''Logging and Monitoring'':
MUST SHOW — Admin activity logs integrated with SIEM/centralised logging: | Retention compliance for admin logs: | Log integrity: admin logs protected from enterprise admin compromise | Regular review evidence: procedures for reviewing admin logs (daily recommended) with sample review records | Session recording for privileged accounts (optional enhancement but check if implemented)
PASS IF — Admin logs forwarded to SIEM | Retention meets minimums | Regular review evidence exists
FAIL IF — Admin logs not in SIEM | Retention below requirements | No review process', 'Independently attest ''Admin activity monitoring logs'' for Control ''Logging and Monitoring'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Admin logs forwarded to SIEM
  • Retention meets minimums
  • Regular review evidence exists
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('F1', 'Third-party vendor inventory', '2.8', 'Outsourced Critical Activity Protection', 'M', 'Confirm the ''Third-party vendor inventory'' has been submitted as a Spreadsheet. Check: (1) File is present and can be opened. (2) It is the correct document type (Spreadsheet). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Outsourced Critical Activity Protection.', 'Review the ''Third-party vendor inventory'' to confirm it technically satisfies Control ''Outsourced Critical Activity Protection'':
MUST SHOW — Complete list of ALL third parties managing/operating SWIFT-related components or activities: | Remote vs on-site management indicator | Third parties operating on their own equipment vs user''s equipment
PASS IF — All third parties identified with services and components | Critical activities classification per vendor | Contract dates current (not expired) | Agent vs provider distinction noted
FAIL IF — Third parties in A2 not in F1 | No critical activity classification | Expired contracts without renewal
CROSS-CHECK — Must match A2 third-party flags', 'Independently attest ''Third-party vendor inventory'' for Control ''Outsourced Critical Activity Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • All third parties identified with services and components
  • Critical activities classification per vendor
  • Contract dates current (not expired)
  • Agent vs provider distinction noted
CROSS-CHECK VALIDATION:
  • Must match A2 third-party flags
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('F2', 'SLA/NDA agreements', '2.8', 'Outsourced Critical Activity Protection', 'M', 'Confirm the ''SLA/NDA agreements'' has been submitted as a Agreement Copies / Summary. Check: (1) File is present and can be opened. (2) It is the correct document type (Agreement Copies / Summary). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Outsourced Critical Activity Protection.', 'Review the ''SLA/NDA agreements'' to confirm it technically satisfies Control ''Outsourced Critical Activity Protection'':
MUST SHOW — SLA in place with EVERY third party performing critical SWIFT activities: | NDA in place covering SWIFT-related sensitive data | Connectivity provider SLAs for hosted components (when acting as outsourcing agent) | Agreement review: SLAs reviewed periodically and updated | Summary: % of vendors with SLA, % with NDA, any gaps
PASS IF — SLA exists for every critical-activity vendor | NDA covers SWIFT data | Right to audit included | Security requirements defined in SLA
FAIL IF — Vendor without SLA/NDA | SLA without security requirements | No right to audit clause', 'Independently attest ''SLA/NDA agreements'' for Control ''Outsourced Critical Activity Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • SLA exists for every critical-activity vendor
  • NDA covers SWIFT data
  • Right to audit included
  • Security requirements defined in SLA
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('F3', 'Third-party security risk assessments', '2.8', 'Outsourced Critical Activity Protection', 'M', 'Confirm the ''Third-party security risk assessments'' has been submitted as a Assessment Reports. Check: (1) File is present and can be opened. (2) It is the correct document type (Assessment Reports). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Outsourced Critical Activity Protection.', 'Review the ''Third-party security risk assessments'' to confirm it technically satisfies Control ''Outsourced Critical Activity Protection'':
MUST SHOW — Security risk assessment for EACH third party performing critical activities: | Risk assessment content: | Assessment date and next review date documented | Assessor independence (if external assessment used)
PASS IF — Risk assessment exists per critical-activity vendor | Conducted at engagement start and reviewed periodically | Gaps and risks documented | Alignment with SWIFT OASRB addressed
FAIL IF — Vendor without risk assessment | Assessment not reviewed in >2 years | No gap/risk identification', 'Independently attest ''Third-party security risk assessments'' for Control ''Outsourced Critical Activity Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Risk assessment exists per critical-activity vendor
  • Conducted at engagement start and reviewed periodically
  • Gaps and risks documented
  • Alignment with SWIFT OASRB addressed
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('F4', 'Third-party ongoing monitoring evidence', '2.8', 'Outsourced Critical Activity Protection', 'M', 'Confirm the ''Third-party ongoing monitoring evidence'' has been submitted as a Reports / Records. Check: (1) File is present and can be opened. (2) It is the correct document type (Reports / Records). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Outsourced Critical Activity Protection.', 'Review the ''Third-party ongoing monitoring evidence'' to confirm it technically satisfies Control ''Outsourced Critical Activity Protection'':
MUST SHOW — Reasonable comfort evidence from EACH third party that outsourced activities maintained per SWIFT OASRB: | Regular monitoring activities: | For connectivity providers acting as outsourcing agents: additional comfort for hosted components | Annual attestation or comfort letter from third party
PASS IF — Current certifications from each vendor | Certification scope covers SWIFT services | Regular monitoring meetings documented | Annual comfort obtained
FAIL IF — No certifications or comfort evidence | Expired certifications | Certification scope does not cover SWIFT services', 'Independently attest ''Third-party ongoing monitoring evidence'' for Control ''Outsourced Critical Activity Protection'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Current certifications from each vendor
  • Certification scope covers SWIFT services
  • Regular monitoring meetings documented
  • Annual comfort obtained
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('G1', 'Physical access controls', '3.1', 'Physical Security', 'M', 'Confirm the ''Physical access controls'' has been submitted as a Evidence Package. Check: (1) File is present and can be opened. (2) It is the correct document type (Evidence Package). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Physical Security.', 'Review the ''Physical access controls'' to confirm it technically satisfies Control ''Physical Security'':
MUST SHOW — Physical security controls for each environment type:
PASS IF — Removable equipment supervised or stored securely | Server environment in locked room/data centre with access control | Video surveillance with recording | Equipment disposal with data sanitisation
FAIL IF — Tokens left plugged in unattended | Servers in unlocked/uncontrolled room | No video surveillance', 'Independently attest ''Physical access controls'' for Control ''Physical Security'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Removable equipment supervised or stored securely
  • Server environment in locked room/data centre with access control
  • Video surveillance with recording
  • Equipment disposal with data sanitisation
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('G2', 'Physical access logs', '3.1', 'Physical Security', 'M', 'Confirm the ''Physical access logs'' has been submitted as a Log Exports / Records. Check: (1) File is present and can be opened. (2) It is the correct document type (Log Exports / Records). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Physical Security.', 'Review the ''Physical access logs'' to confirm it technically satisfies Control ''Physical Security'':
MUST SHOW — Physical access logs for sensitive equipment areas: | Log retention: ≥6 months (minimum), compliant with local laws and regulations | Logs available for audit and investigations | Log review: periodic review for anomalous physical access patterns | Visitor access records for sensitive areas
PASS IF — Physical access logs maintained for all sensitive areas | Retention ≥6 months | Logs available for audit
FAIL IF — No physical access logging | Retention below 6 months | Log gaps or missing entries', 'Independently attest ''Physical access logs'' for Control ''Physical Security'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Physical access logs maintained for all sensitive areas
  • Retention ≥6 months
  • Logs available for audit
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('G3', 'Video surveillance evidence', '3.1', 'Physical Security', 'M', 'Confirm the ''Video surveillance evidence'' has been submitted as a Config / Sample. Check: (1) File is present and can be opened. (2) It is the correct document type (Config / Sample). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Physical Security.', 'Review the ''Video surveillance evidence'' to confirm it technically satisfies Control ''Physical Security'':
MUST SHOW — Video surveillance configuration for server environment: | Compliance with applicable laws and regulations for video recording documented | Sample footage or system screenshot showing operational status
PASS IF — Video surveillance operational with movement detection | Recording active with ≥3 month retention | Legal compliance documented
FAIL IF — No video surveillance in server environment | No recording (live only) | Retention <3 months without justification', 'Independently attest ''Video surveillance evidence'' for Control ''Physical Security'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Video surveillance operational with movement detection
  • Recording active with ≥3 month retention
  • Legal compliance documented
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('G4', 'Equipment disposal records', '3.1', 'Physical Security', 'M', 'Confirm the ''Equipment disposal records'' has been submitted as a Records. Check: (1) File is present and can be opened. (2) It is the correct document type (Records). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Physical Security.', 'Review the ''Equipment disposal records'' to confirm it technically satisfies Control ''Physical Security'':
MUST SHOW — Equipment disposal/reuse records for in-scope SWIFT equipment: | Covers: servers, PCs, HSMs, tokens, removable media, backup tapes, network devices | Disposal process documented in policy
PASS IF — Disposal records exist with sanitisation method | Verification of data destruction | All equipment types covered
FAIL IF — Equipment disposed without sanitisation | No disposal records | Missing equipment types from disposal process', 'Independently attest ''Equipment disposal records'' for Control ''Physical Security'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Disposal records exist with sanitisation method
  • Verification of data destruction
  • All equipment types covered
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('H1', 'Incident response plan', '7.1', 'Cyber Incident Response Planning', 'M', 'Confirm the ''Incident response plan'' has been submitted as a Document. Check: (1) File is present and can be opened. (2) It is the correct document type (Document). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Cyber Incident Response Planning.', 'Review the ''Incident response plan'' to confirm it technically satisfies Control ''Cyber Incident Response Planning'':
MUST SHOW — Cyber incident response plan documented and annually updated: | Plan includes steps to: | Backup and recovery plan exists for all critical business lines | Plan tested at least every 2 years (test records in H2) | Plan revision history showing annual update
PASS IF — IR plan exists with annual update evidence | SWIFT Recovery roadmap referenced | Internal + external notification steps included | Containment, evidence preservation, recovery steps included
FAIL IF — No IR plan | Plan not updated in >12 months | Missing notification procedures', 'Independently attest ''Incident response plan'' for Control ''Cyber Incident Response Planning'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • IR plan exists with annual update evidence
  • SWIFT Recovery roadmap referenced
  • Internal + external notification steps included
  • Containment, evidence preservation, recovery steps included
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('H2', 'IR exercise/test records', '7.1', 'Cyber Incident Response Planning', 'M', 'Confirm the ''IR exercise/test records'' has been submitted as a Test Reports. Check: (1) File is present and can be opened. (2) It is the correct document type (Test Reports). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Cyber Incident Response Planning.', 'Review the ''IR exercise/test records'' to confirm it technically satisfies Control ''Cyber Incident Response Planning'':
MUST SHOW — IR plan testing conducted at least every 2 years: | Most recent test within last 2 years | Safe recovery of critical business operations demonstrated | Minimised outage time objectives validated | External party participation if outsourced activities involved
PASS IF — Test conducted within last 2 years | Results and lessons learned documented | Plan updated based on findings
FAIL IF — No test within 2 years | No lessons learned or plan updates | Test scope too narrow (not covering SWIFT)', 'Independently attest ''IR exercise/test records'' for Control ''Cyber Incident Response Planning'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Test conducted within last 2 years
  • Results and lessons learned documented
  • Plan updated based on findings
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('H3', 'SWIFT ISAC participation evidence', '7.1', 'Cyber Incident Response Planning', 'M', 'Confirm the ''SWIFT ISAC participation evidence'' has been submitted as a Records. Check: (1) File is present and can be opened. (2) It is the correct document type (Records). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Cyber Incident Response Planning.', 'Review the ''SWIFT ISAC participation evidence'' to confirm it technically satisfies Control ''Cyber Incident Response Planning'':
MUST SHOW — SWIFT Information Sharing and Analysis Centre (ISAC) participation: | Integration with incident response: ISAC intelligence feeds into IR plan | Mandatory incident reporting to SWIFT for SWIFT-related cyber incidents
PASS IF — SWIFT ISAC subscription active | Internal distribution process exists | Evidence of acting on ISAC intelligence
FAIL IF — No ISAC participation | No evidence of alert distribution internally', 'Independently attest ''SWIFT ISAC participation evidence'' for Control ''Cyber Incident Response Planning'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • SWIFT ISAC subscription active
  • Internal distribution process exists
  • Evidence of acting on ISAC intelligence
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('H4', 'Security training program documentation', '7.2', 'Security Training & Awareness', 'M', 'Confirm the ''Security training program documentation'' has been submitted as a Program Document. Check: (1) File is present and can be opened. (2) It is the correct document type (Program Document). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Security Training & Awareness.', 'Review the ''Security training program documentation'' to confirm it technically satisfies Control ''Security Training & Awareness'':
MUST SHOW — Annual security awareness programme documented covering: | Target audience: ALL staff with access to SWIFT-related systems | Additional training for privileged access users: specific to their environment/architecture | Training frequency: annual at minimum | Training delivery method: e-learning, classroom, workshop documented
PASS IF — Training programme documented with relevant topics | Covers all staff with SWIFT access | Additional content for privileged users | Annual frequency defined
FAIL IF — No training programme | Relevant topics missing (phishing, passwords) | Privileged users not addressed separately', 'Independently attest ''Security training program documentation'' for Control ''Security Training & Awareness'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Training programme documented with relevant topics
  • Covers all staff with SWIFT access
  • Additional content for privileged users
  • Annual frequency defined
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('H5', 'Training completion records', '7.2', 'Security Training & Awareness', 'M', 'Confirm the ''Training completion records'' has been submitted as a Records / Report. Check: (1) File is present and can be opened. (2) It is the correct document type (Records / Report). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Security Training & Awareness.', 'Review the ''Training completion records'' to confirm it technically satisfies Control ''Security Training & Awareness'':
MUST SHOW — Training completion tracking for current year: | Completion rate: % of required staff who completed training | Non-completion escalation: process for staff who haven''t completed within deadline | Privileged user additional training completion tracked separately | Third-party/contractor training completion if they have SWIFT access
PASS IF — Training completed by >90% of required staff | Privileged users have additional training records | Non-completion escalation process exists
FAIL IF — <50% completion rate | No tracking of training completion | Privileged users without additional training', 'Independently attest ''Training completion records'' for Control ''Security Training & Awareness'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Training completed by >90% of required staff
  • Privileged users have additional training records
  • Non-completion escalation process exists
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('H6', 'Transaction control procedures', '2.9', 'Transaction Business Controls', 'M', 'Confirm the ''Transaction control procedures'' has been submitted as a Process Document / Config. Check: (1) File is present and can be opened. (2) It is the correct document type (Process Document / Config). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Transaction Business Controls.', 'Review the ''Transaction control procedures'' to confirm it technically satisfies Control ''Transaction Business Controls'':
MUST SHOW — Documented transaction detection, prevention, and validation controls: | Four-eyes principle for sensitive transaction operations | Inbound transaction monitoring (optional but recommended) | Alert/exception handling process for triggered controls
PASS IF — At least 2 transaction control types implemented | Controls based on analysis of normal activity | Alert/exception process documented
FAIL IF — No transaction business controls | Controls not based on normal activity analysis | No alert/exception process', 'Independently attest ''Transaction control procedures'' for Control ''Transaction Business Controls'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • At least 2 transaction control types implemented
  • Controls based on analysis of normal activity
  • Alert/exception process documented
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('H7', 'Transaction monitoring configuration/evidence', '2.9', 'Transaction Business Controls', 'M', 'Confirm the ''Transaction monitoring configuration/evidence'' has been submitted as a Config / Reports. Check: (1) File is present and can be opened. (2) It is the correct document type (Config / Reports). (3) All sections/fields are populated — no blanks for this Mandatory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Transaction Business Controls.', 'Review the ''Transaction monitoring configuration/evidence'' to confirm it technically satisfies Control ''Transaction Business Controls'':
MUST SHOW — Technical implementation evidence for transaction controls: | Transaction parameters documented: what limits, thresholds, or patterns are configured | Evidence of periodic review and adjustment of parameters based on business changes | False positive management: process for reviewing and tuning alerts
PASS IF — Active control configuration verified | Alert/exception evidence shows controls are operational | Parameters reviewed and adjusted periodically
FAIL IF — Controls configured but not operational | No evidence of alerts or exceptions (suggests controls may not be active) | Parameters never reviewed since initial setup', 'Independently attest ''Transaction monitoring configuration/evidence'' for Control ''Transaction Business Controls'' [MANDATORY — no gaps permitted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Active control configuration verified
  • Alert/exception evidence shows controls are operational
  • Parameters reviewed and adjusted periodically
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('H8', 'RMA management procedures and review evidence', '2.11A', 'RMA Business Controls', 'A', 'Confirm the ''RMA management procedures and review evidence'' has been submitted as a Process + Records. Check: (1) File is present and can be opened. (2) It is the correct document type (Process + Records). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control RMA Business Controls.', 'Review the ''RMA management procedures and review evidence'' to confirm it technically satisfies Control ''RMA Business Controls'':
MUST SHOW — RMA management process documented: | Evidence of latest annual review: | RMA relationship inventory: counterparty name, creation date, last review, status
PASS IF — RMA management process documented | Annual review conducted with evidence | Obsolete relationships removed
FAIL IF — No RMA management process | No annual review in last 12 months | Obsolete relationships retained without justification', 'Independently attest ''RMA management procedures and review evidence'' for Control ''RMA Business Controls'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • RMA management process documented
  • Annual review conducted with evidence
  • Obsolete relationships removed
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');
INSERT INTO reviewer_checklist (item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check) VALUES ('H9', 'Risk assessment methodology and register', '7.4A', 'Scenario Risk Assessment', 'A', 'Confirm the ''Risk assessment methodology and register'' has been submitted as a Document / Register. Check: (1) File is present and can be opened. (2) It is the correct document type (Document / Register). (3) All sections/fields are populated — no blanks for this Advisory control. (4) Document is dated within the current assessment window. (5) It is linked/tagged to Control Scenario Risk Assessment.', 'Review the ''Risk assessment methodology and register'' to confirm it technically satisfies Control ''Scenario Risk Assessment'':
MUST SHOW — Scenario-based risk assessment documented and conducted regularly: | Risk assessment framework identified (e.g., CIS-Critical Security Controls, ISO 27005, NIST RMF) | Assessment scope includes: people, processes, infrastructure | For cloud-hosted: third-party risk assessment covering remote platform | Risk register: all identified risks with status, owner, treatment plan
PASS IF — Scenario-based assessment conducted | SWIFT-specific threats evaluated | Existing controls mapped per scenario | Residual risk and mitigation plan documented
FAIL IF — No risk assessment | SWIFT-specific scenarios not covered | No risk register', 'Independently attest ''Risk assessment methodology and register'' for Control ''Scenario Risk Assessment'' [ADVISORY — documented deviations accepted].
INDEPENDENTLY VERIFY (do not rely on L2 outcome):
  • Scenario-based assessment conducted
  • SWIFT-specific threats evaluated
  • Existing controls mapped per scenario
  • Residual risk and mitigation plan documented
ASSESS: Is evidence authentic (not paper compliance)? Raise formal comment if L2 ''Sufficient'' rating is disputed.
RATE: Compliant | Partially Compliant | Non-Compliant | N/A');

COMMIT;
