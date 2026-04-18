/**
 * =============================================================================
 *  CHANGE MANAGEMENT & RELEASE CONTROLS — Audit Dashboard (Demo)
 * =============================================================================
 *  Stack : React + Tailwind CSS (core utilities only) + lucide-react
 *  Scope : Q1 2026 audit engagement at a regulated enterprise
 *  Data  : All collector payloads are inlined below. No imports, no I/O.
 *
 *  Pipeline:
 *     RAW collectors (Jira / GitHub / GHA / Deploy / Freeze / Rollback)
 *         │
 *         ▼
 *     buildViewModel(raw)      → one normalized record per change
 *         │
 *         ▼
 *     evaluateControls(ctx)    → 5 control families × Met / Not Met / Requires Review
 *         │
 *         ▼
 *     Auditor UI               → Overview · Register · Findings · Controls · Drawer
 *
 *  Every finding in the UI is traceable to a specific collector record.
 * =============================================================================
 */

import React, { useMemo, useState } from "react";
import {
  ShieldCheck, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Clock,
  FileText, GitPullRequest, GitBranch, Rocket, Lock, History, Users,
  ChevronRight, Search, Download, X, Calendar, Filter, ScrollText,
  CircleDot, TestTube2, KeyRound, Snowflake, Undo2, Workflow,
  ClipboardCheck, ClipboardList, CircleAlert, Info, ArrowUpRight,
  Package, Activity
} from "lucide-react";

/* ============================================================================
 * 1. RAW COLLECTOR DATA (inlined — see assumptions in _metadata)
 * ========================================================================= */
const RAW = {
  "_metadata": {
    "demo": true,
    "description": "Simulated enterprise change-management evidence for Q1 2026 audit. All data is fabricated.",
    "organization": "Northbank Financial Services",
    "audit_period": {
      "start": "2026-01-01",
      "end": "2026-03-31"
    },
    "audit_engagement": "ENG-2026-Q1-CM",
    "generated_at": "2026-04-18T09:00:00Z",
    "thresholds": {
      "emergency_cab_post_hoc_window_hours": 24,
      "required_testing_gates": [
        "unit_tests",
        "integration_tests",
        "uat_signoff",
        "security_scan"
      ]
    },
    "freeze_windows_reference": [
      {
        "id": "FW-2026-Q1-END",
        "start": "2026-03-25T00:00:00Z",
        "end": "2026-03-31T23:59:59Z",
        "reason": "Quarter-end financial close & regulatory reporting"
      },
      {
        "id": "FW-2026-FEB-RBI",
        "start": "2026-02-14T18:00:00Z",
        "end": "2026-02-16T06:00:00Z",
        "reason": "RBI monthly return submission window"
      }
    ]
  },
  "change_request_collector": {
    "_api": "jira.rest.api.3.search",
    "_endpoint": "GET /rest/api/3/search?jql=project=CHG AND created>=2026-01-01",
    "startAt": 0,
    "maxResults": 50,
    "total": 10,
    "issues": [
      {
        "id": "10100101",
        "key": "CHG-1001",
        "fields": {
          "summary": "Enhance customer statement export API (PDF + CSV)",
          "description": "Add multi-format (PDF/CSV) statement export endpoint for retail banking customers.",
          "issuetype": {
            "name": "Normal Change",
            "id": "10100"
          },
          "priority": {
            "name": "Medium"
          },
          "status": {
            "name": "Done",
            "statusCategory": {
              "key": "done"
            }
          },
          "created": "2026-02-05T10:00:00Z",
          "resolutiondate": "2026-02-10T14:45:00Z",
          "reporter": {
            "accountId": "acc-sowmya-krishnan",
            "displayName": "Sowmya Krishnan",
            "emailAddress": "sowmya.krishnan@northbank.example.com"
          },
          "assignee": {
            "accountId": "acc-release-team",
            "displayName": "Change Release Team",
            "emailAddress": "release-team@northbank.example.com"
          },
          "customfield_10200": {
            "value": "Normal"
          },
          "customfield_10201": "APPROVED",
          "customfield_10202": "cab.chair.jayaraman",
          "customfield_10203": "2026-02-08T15:30:00Z",
          "customfield_10204": null,
          "customfield_10205": null,
          "customfield_10210": "Revert deployment via pipeline rollback job. DB migration has down-script validated in test env on 2026-02-09.",
          "customfield_10211": [
            "dev",
            "test",
            "prod"
          ],
          "customfield_10212": "customer-api",
          "customfield_10213": "Low",
          "customfield_10214": "2026-02-10T14:00:00Z",
          "customfield_10215": "2026-02-10T16:00:00Z"
        },
        "changelog": {
          "histories": [
            {
              "id": "h1",
              "created": "2026-02-05T10:00:00Z",
              "author": {
                "displayName": "Sowmya Krishnan"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Open",
                  "toString": "Submitted"
                }
              ]
            },
            {
              "id": "h2",
              "created": "2026-02-08T15:30:00Z",
              "author": {
                "displayName": "Cab Chair Jayaraman"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Submitted",
                  "toString": "CAB Approved"
                }
              ]
            },
            {
              "id": "h3",
              "created": "2026-02-10T14:45:00Z",
              "author": {
                "displayName": "Change Release Team"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "CAB Approved",
                  "toString": "Done"
                }
              ]
            }
          ]
        }
      },
      {
        "id": "10100201",
        "key": "CHG-1002",
        "fields": {
          "summary": "[EMERGENCY] Payments DB connection pool exhaustion hotfix",
          "description": "P1 incident INC-88821: connection pool exhaustion causing 500s on /v2/payments. Hotfix raises pool size and adds eviction policy.",
          "issuetype": {
            "name": "Emergency Change",
            "id": "10100"
          },
          "priority": {
            "name": "Critical"
          },
          "status": {
            "name": "Done",
            "statusCategory": {
              "key": "done"
            }
          },
          "created": "2026-02-17T03:15:00Z",
          "resolutiondate": "2026-02-17T18:05:00Z",
          "reporter": {
            "accountId": "acc-murali-iyer",
            "displayName": "Murali Iyer",
            "emailAddress": "murali.iyer@northbank.example.com"
          },
          "assignee": {
            "accountId": "acc-release-team",
            "displayName": "Change Release Team",
            "emailAddress": "release-team@northbank.example.com"
          },
          "customfield_10200": {
            "value": "Emergency"
          },
          "customfield_10201": "POST_HOC_APPROVED",
          "customfield_10202": "cab.chair.jayaraman",
          "customfield_10203": "2026-02-17T18:00:00Z",
          "customfield_10204": "on-call.manager.verma",
          "customfield_10205": "2026-02-17T03:45:00Z",
          "customfield_10210": "Rollback to previous artifact via pipeline. Connection pool config is feature-flagged; toggle off if needed.",
          "customfield_10211": [
            "prod"
          ],
          "customfield_10212": "payments-service",
          "customfield_10213": "High",
          "customfield_10214": "2026-02-17T04:00:00Z",
          "customfield_10215": "2026-02-17T04:30:00Z"
        },
        "changelog": {
          "histories": [
            {
              "id": "h1",
              "created": "2026-02-17T03:15:00Z",
              "author": {
                "displayName": "Murali Iyer"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Open",
                  "toString": "Submitted"
                }
              ]
            },
            {
              "id": "h2",
              "created": "2026-02-17T18:00:00Z",
              "author": {
                "displayName": "Cab Chair Jayaraman"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Submitted",
                  "toString": "POST_HOC_APPROVED"
                }
              ]
            },
            {
              "id": "h3",
              "created": "2026-02-17T18:05:00Z",
              "author": {
                "displayName": "Change Release Team"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "CAB Approved",
                  "toString": "Done"
                }
              ]
            }
          ]
        }
      },
      {
        "id": "10100301",
        "key": "CHG-1003",
        "fields": {
          "summary": "[EMERGENCY] Auth service memory leak patch",
          "description": "P1 incident INC-88935: auth-service pods OOM-killed every ~6h. Patch addresses JWT cache leak.",
          "issuetype": {
            "name": "Emergency Change",
            "id": "10100"
          },
          "priority": {
            "name": "Critical"
          },
          "status": {
            "name": "Done",
            "statusCategory": {
              "key": "done"
            }
          },
          "created": "2026-02-22T22:40:00Z",
          "resolutiondate": "2026-02-25T03:35:00Z",
          "reporter": {
            "accountId": "acc-suresh-kumar",
            "displayName": "Suresh Kumar",
            "emailAddress": "suresh.kumar@northbank.example.com"
          },
          "assignee": {
            "accountId": "acc-release-team",
            "displayName": "Change Release Team",
            "emailAddress": "release-team@northbank.example.com"
          },
          "customfield_10200": {
            "value": "Emergency"
          },
          "customfield_10201": "POST_HOC_APPROVED_LATE",
          "customfield_10202": "cab.chair.jayaraman",
          "customfield_10203": "2026-02-25T03:30:00Z",
          "customfield_10204": "on-call.manager.bhatia",
          "customfield_10205": "2026-02-22T23:10:00Z",
          "customfield_10210": "Revert Deployment resource via kubectl rollout undo. Previous image tag pinned.",
          "customfield_10211": [
            "prod"
          ],
          "customfield_10212": "auth-service",
          "customfield_10213": "High",
          "customfield_10214": "2026-02-22T23:30:00Z",
          "customfield_10215": "2026-02-22T23:50:00Z"
        },
        "changelog": {
          "histories": [
            {
              "id": "h1",
              "created": "2026-02-22T22:40:00Z",
              "author": {
                "displayName": "Suresh Kumar"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Open",
                  "toString": "Submitted"
                }
              ]
            },
            {
              "id": "h2",
              "created": "2026-02-25T03:30:00Z",
              "author": {
                "displayName": "Cab Chair Jayaraman"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Submitted",
                  "toString": "POST_HOC_APPROVED_LATE"
                }
              ]
            },
            {
              "id": "h3",
              "created": "2026-02-25T03:35:00Z",
              "author": {
                "displayName": "Change Release Team"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "CAB Approved",
                  "toString": "Done"
                }
              ]
            }
          ]
        }
      },
      {
        "id": "10100401",
        "key": "CHG-1004",
        "fields": {
          "summary": "Update login page copy and terms link",
          "description": "Marketing-requested copy change on /login page plus updated link to latest T&C.",
          "issuetype": {
            "name": "Standard Change",
            "id": "10100"
          },
          "priority": {
            "name": "Low"
          },
          "status": {
            "name": "Done",
            "statusCategory": {
              "key": "done"
            }
          },
          "created": "2026-03-02T11:00:00Z",
          "resolutiondate": "2026-03-04T16:30:00Z",
          "reporter": {
            "accountId": "acc-karthik-menon",
            "displayName": "Karthik Menon",
            "emailAddress": "karthik.menon@northbank.example.com"
          },
          "assignee": {
            "accountId": "acc-release-team",
            "displayName": "Change Release Team",
            "emailAddress": "release-team@northbank.example.com"
          },
          "customfield_10200": {
            "value": "Normal"
          },
          "customfield_10201": "APPROVED",
          "customfield_10202": "cab.chair.jayaraman",
          "customfield_10203": "2026-03-03T14:00:00Z",
          "customfield_10204": null,
          "customfield_10205": null,
          "customfield_10210": "Revert via feature-flag toggle. Static content only.",
          "customfield_10211": [
            "dev",
            "test",
            "prod"
          ],
          "customfield_10212": "web-banking-portal",
          "customfield_10213": "Low",
          "customfield_10214": "2026-03-04T16:00:00Z",
          "customfield_10215": "2026-03-04T17:00:00Z"
        },
        "changelog": {
          "histories": [
            {
              "id": "h1",
              "created": "2026-03-02T11:00:00Z",
              "author": {
                "displayName": "Karthik Menon"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Open",
                  "toString": "Submitted"
                }
              ]
            },
            {
              "id": "h2",
              "created": "2026-03-03T14:00:00Z",
              "author": {
                "displayName": "Cab Chair Jayaraman"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Submitted",
                  "toString": "CAB Approved"
                }
              ]
            },
            {
              "id": "h3",
              "created": "2026-03-04T16:30:00Z",
              "author": {
                "displayName": "Change Release Team"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "CAB Approved",
                  "toString": "Done"
                }
              ]
            }
          ]
        }
      },
      {
        "id": "10100501",
        "key": "CHG-1005",
        "fields": {
          "summary": "Payment gateway SDK upgrade to v4.2.1",
          "description": "Upgrade to v4.2.1 to pick up PCI DSS 4.0 tokenization changes and critical CVE-2026-14421 fix.",
          "issuetype": {
            "name": "Normal Change",
            "id": "10100"
          },
          "priority": {
            "name": "High"
          },
          "status": {
            "name": "Done",
            "statusCategory": {
              "key": "done"
            }
          },
          "created": "2026-03-06T09:00:00Z",
          "resolutiondate": "2026-03-11T11:20:00Z",
          "reporter": {
            "accountId": "acc-subashini-rao",
            "displayName": "Subashini Rao",
            "emailAddress": "subashini.rao@northbank.example.com"
          },
          "assignee": {
            "accountId": "acc-release-team",
            "displayName": "Change Release Team",
            "emailAddress": "release-team@northbank.example.com"
          },
          "customfield_10200": {
            "value": "Normal"
          },
          "customfield_10201": "APPROVED",
          "customfield_10202": "cab.chair.jayaraman",
          "customfield_10203": "2026-03-09T15:00:00Z",
          "customfield_10204": null,
          "customfield_10205": null,
          "customfield_10210": "Downgrade SDK version via artifact pinning; rollback playbook validated in test.",
          "customfield_10211": [
            "dev",
            "test",
            "prod"
          ],
          "customfield_10212": "payments-service",
          "customfield_10213": "High",
          "customfield_10214": "2026-03-11T11:00:00Z",
          "customfield_10215": "2026-03-11T12:00:00Z"
        },
        "changelog": {
          "histories": [
            {
              "id": "h1",
              "created": "2026-03-06T09:00:00Z",
              "author": {
                "displayName": "Subashini Rao"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Open",
                  "toString": "Submitted"
                }
              ]
            },
            {
              "id": "h2",
              "created": "2026-03-09T15:00:00Z",
              "author": {
                "displayName": "Cab Chair Jayaraman"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Submitted",
                  "toString": "CAB Approved"
                }
              ]
            },
            {
              "id": "h3",
              "created": "2026-03-11T11:20:00Z",
              "author": {
                "displayName": "Change Release Team"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "CAB Approved",
                  "toString": "Done"
                }
              ]
            }
          ]
        }
      },
      {
        "id": "10100601",
        "key": "CHG-1006",
        "fields": {
          "summary": "Internal reporting service rewrite (Go \u2192 Java)",
          "description": "Rewrite internal reporting service in Java for long-term supportability; behind internal network only.",
          "issuetype": {
            "name": "Normal Change",
            "id": "10100"
          },
          "priority": {
            "name": "High"
          },
          "status": {
            "name": "Done",
            "statusCategory": {
              "key": "done"
            }
          },
          "created": "2026-03-05T10:00:00Z",
          "resolutiondate": "2026-03-13T10:10:00Z",
          "reporter": {
            "accountId": "acc-sowmya-krishnan",
            "displayName": "Sowmya Krishnan",
            "emailAddress": "sowmya.krishnan@northbank.example.com"
          },
          "assignee": {
            "accountId": "acc-release-team",
            "displayName": "Change Release Team",
            "emailAddress": "release-team@northbank.example.com"
          },
          "customfield_10200": {
            "value": "Normal"
          },
          "customfield_10201": "APPROVED",
          "customfield_10202": "cab.chair.jayaraman",
          "customfield_10203": "2026-03-12T14:30:00Z",
          "customfield_10204": null,
          "customfield_10205": null,
          "customfield_10210": "Blue-green switchover; keep old Go service warm for 72h. Rollback = repoint load balancer.",
          "customfield_10211": [
            "dev",
            "test",
            "prod"
          ],
          "customfield_10212": "internal-reporting",
          "customfield_10213": "Medium",
          "customfield_10214": "2026-03-13T10:00:00Z",
          "customfield_10215": "2026-03-13T11:00:00Z"
        },
        "changelog": {
          "histories": [
            {
              "id": "h1",
              "created": "2026-03-05T10:00:00Z",
              "author": {
                "displayName": "Sowmya Krishnan"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Open",
                  "toString": "Submitted"
                }
              ]
            },
            {
              "id": "h2",
              "created": "2026-03-12T14:30:00Z",
              "author": {
                "displayName": "Cab Chair Jayaraman"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Submitted",
                  "toString": "CAB Approved"
                }
              ]
            },
            {
              "id": "h3",
              "created": "2026-03-13T10:10:00Z",
              "author": {
                "displayName": "Change Release Team"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "CAB Approved",
                  "toString": "Done"
                }
              ]
            }
          ]
        }
      },
      {
        "id": "10100701",
        "key": "CHG-1007",
        "fields": {
          "summary": "Marketing banner A/B test configuration",
          "description": "Enable 50/50 A/B test of seasonal promotional banner on landing page. Low-risk UI change.",
          "issuetype": {
            "name": "Standard Change",
            "id": "10100"
          },
          "priority": {
            "name": "Low"
          },
          "status": {
            "name": "Done",
            "statusCategory": {
              "key": "done"
            }
          },
          "created": "2026-03-23T14:00:00Z",
          "resolutiondate": "2026-03-27T10:15:00Z",
          "reporter": {
            "accountId": "acc-anurag-desai",
            "displayName": "Anurag Desai",
            "emailAddress": "anurag.desai@northbank.example.com"
          },
          "assignee": {
            "accountId": "acc-release-team",
            "displayName": "Change Release Team",
            "emailAddress": "release-team@northbank.example.com"
          },
          "customfield_10200": {
            "value": "Normal"
          },
          "customfield_10201": "APPROVED",
          "customfield_10202": "cab.chair.jayaraman",
          "customfield_10203": "2026-03-24T13:00:00Z",
          "customfield_10204": null,
          "customfield_10205": null,
          "customfield_10210": "Feature flag controlled; disable flag to revert.",
          "customfield_10211": [
            "prod"
          ],
          "customfield_10212": "web-banking-portal",
          "customfield_10213": "Low",
          "customfield_10214": "2026-03-27T10:00:00Z",
          "customfield_10215": "2026-03-27T10:30:00Z"
        },
        "changelog": {
          "histories": [
            {
              "id": "h1",
              "created": "2026-03-23T14:00:00Z",
              "author": {
                "displayName": "Anurag Desai"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Open",
                  "toString": "Submitted"
                }
              ]
            },
            {
              "id": "h2",
              "created": "2026-03-24T13:00:00Z",
              "author": {
                "displayName": "Cab Chair Jayaraman"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Submitted",
                  "toString": "CAB Approved"
                }
              ]
            },
            {
              "id": "h3",
              "created": "2026-03-27T10:15:00Z",
              "author": {
                "displayName": "Change Release Team"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "CAB Approved",
                  "toString": "Done"
                }
              ]
            }
          ]
        }
      },
      {
        "id": "10100801",
        "key": "CHG-1008",
        "fields": {
          "summary": "Mobile app iOS version bump 14.2 \u2192 14.3",
          "description": "Bug fix release: biometric login retries, Arabic localisation strings. Submitted to App Store after sign-off.",
          "issuetype": {
            "name": "Normal Change",
            "id": "10100"
          },
          "priority": {
            "name": "Medium"
          },
          "status": {
            "name": "Done",
            "statusCategory": {
              "key": "done"
            }
          },
          "created": "2026-03-15T09:00:00Z",
          "resolutiondate": "2026-03-17T09:30:00Z",
          "reporter": {
            "accountId": "acc-karthik-menon",
            "displayName": "Karthik Menon",
            "emailAddress": "karthik.menon@northbank.example.com"
          },
          "assignee": {
            "accountId": "acc-release-team",
            "displayName": "Change Release Team",
            "emailAddress": "release-team@northbank.example.com"
          },
          "customfield_10200": {
            "value": "Normal"
          },
          "customfield_10201": "APPROVED",
          "customfield_10202": "cab.chair.jayaraman",
          "customfield_10203": "2026-03-16T15:00:00Z",
          "customfield_10204": null,
          "customfield_10205": null,
          "customfield_10210": "",
          "customfield_10211": [
            "test",
            "prod"
          ],
          "customfield_10212": "mobile-banking-ios",
          "customfield_10213": "Medium",
          "customfield_10214": "2026-03-17T09:00:00Z",
          "customfield_10215": "2026-03-17T10:00:00Z"
        },
        "changelog": {
          "histories": [
            {
              "id": "h1",
              "created": "2026-03-15T09:00:00Z",
              "author": {
                "displayName": "Karthik Menon"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Open",
                  "toString": "Submitted"
                }
              ]
            },
            {
              "id": "h2",
              "created": "2026-03-16T15:00:00Z",
              "author": {
                "displayName": "Cab Chair Jayaraman"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Submitted",
                  "toString": "CAB Approved"
                }
              ]
            },
            {
              "id": "h3",
              "created": "2026-03-17T09:30:00Z",
              "author": {
                "displayName": "Change Release Team"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "CAB Approved",
                  "toString": "Done"
                }
              ]
            }
          ]
        }
      },
      {
        "id": "10100901",
        "key": "CHG-1009",
        "fields": {
          "summary": "Kubernetes cluster upgrade 1.28 \u2192 1.30 (prod)",
          "description": "In-place upgrade of prod EKS cluster from 1.28 to 1.30. Follows successful dev/test upgrades in prior weeks.",
          "issuetype": {
            "name": "Normal Change",
            "id": "10100"
          },
          "priority": {
            "name": "High"
          },
          "status": {
            "name": "Done",
            "statusCategory": {
              "key": "done"
            }
          },
          "created": "2026-03-10T10:00:00Z",
          "resolutiondate": "2026-03-20T19:45:00Z",
          "reporter": {
            "accountId": "acc-murali-iyer",
            "displayName": "Murali Iyer",
            "emailAddress": "murali.iyer@northbank.example.com"
          },
          "assignee": {
            "accountId": "acc-release-team",
            "displayName": "Change Release Team",
            "emailAddress": "release-team@northbank.example.com"
          },
          "customfield_10200": {
            "value": "Normal"
          },
          "customfield_10201": "APPROVED",
          "customfield_10202": "cab.chair.jayaraman",
          "customfield_10203": "2026-03-18T16:00:00Z",
          "customfield_10204": null,
          "customfield_10205": null,
          "customfield_10210": "Rollback plan: restore etcd snapshot taken pre-upgrade; pin nodes to previous AMI; redeploy workloads via ArgoCD.",
          "customfield_10211": [
            "dev",
            "test",
            "prod"
          ],
          "customfield_10212": "platform-kubernetes",
          "customfield_10213": "High",
          "customfield_10214": "2026-03-20T18:00:00Z",
          "customfield_10215": "2026-03-20T20:00:00Z"
        },
        "changelog": {
          "histories": [
            {
              "id": "h1",
              "created": "2026-03-10T10:00:00Z",
              "author": {
                "displayName": "Murali Iyer"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Open",
                  "toString": "Submitted"
                }
              ]
            },
            {
              "id": "h2",
              "created": "2026-03-18T16:00:00Z",
              "author": {
                "displayName": "Cab Chair Jayaraman"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Submitted",
                  "toString": "CAB Approved"
                }
              ]
            },
            {
              "id": "h3",
              "created": "2026-03-20T19:45:00Z",
              "author": {
                "displayName": "Change Release Team"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "CAB Approved",
                  "toString": "Done"
                }
              ]
            }
          ]
        }
      },
      {
        "id": "10101001",
        "key": "CHG-1010",
        "fields": {
          "summary": "Core banking ledger schema migration (add multi-currency fields)",
          "description": "Extend ledger schema with currency_iso and fx_rate_ref columns. Reviewed by CAB in three sessions (2026-03-05, 2026-03-12, 2026-03-19). Architecture sign-off and risk committee approval attached.",
          "issuetype": {
            "name": "Major Change",
            "id": "10100"
          },
          "priority": {
            "name": "Critical"
          },
          "status": {
            "name": "Done",
            "statusCategory": {
              "key": "done"
            }
          },
          "created": "2026-02-20T09:00:00Z",
          "resolutiondate": "2026-03-21T03:15:00Z",
          "reporter": {
            "accountId": "acc-sridhar-raman",
            "displayName": "Sridhar Raman",
            "emailAddress": "sridhar.raman@northbank.example.com"
          },
          "assignee": {
            "accountId": "acc-release-team",
            "displayName": "Change Release Team",
            "emailAddress": "release-team@northbank.example.com"
          },
          "customfield_10200": {
            "value": "Normal"
          },
          "customfield_10201": "APPROVED",
          "customfield_10202": "cab.chair.jayaraman",
          "customfield_10203": "2026-03-19T17:00:00Z",
          "customfield_10204": null,
          "customfield_10205": null,
          "customfield_10210": "Dual-write mode for 48h; flag-controlled reader switch; full DB snapshot pre-migration; down-migration script validated in UAT.",
          "customfield_10211": [
            "dev",
            "test",
            "uat",
            "prod"
          ],
          "customfield_10212": "core-banking-ledger",
          "customfield_10213": "Critical",
          "customfield_10214": "2026-03-21T02:00:00Z",
          "customfield_10215": "2026-03-21T04:00:00Z"
        },
        "changelog": {
          "histories": [
            {
              "id": "h1",
              "created": "2026-02-20T09:00:00Z",
              "author": {
                "displayName": "Sridhar Raman"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Open",
                  "toString": "Submitted"
                }
              ]
            },
            {
              "id": "h2",
              "created": "2026-03-19T17:00:00Z",
              "author": {
                "displayName": "Cab Chair Jayaraman"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "Submitted",
                  "toString": "CAB Approved"
                }
              ]
            },
            {
              "id": "h3",
              "created": "2026-03-21T03:15:00Z",
              "author": {
                "displayName": "Change Release Team"
              },
              "items": [
                {
                  "field": "status",
                  "fromString": "CAB Approved",
                  "toString": "Done"
                }
              ]
            }
          ]
        }
      }
    ]
  },
  "pull_request_collector": {
    "_api": "github.rest.pulls.list",
    "_endpoint": "GET /repos/{owner}/{repo}/pulls?state=closed",
    "total_count": 10,
    "pull_requests": [
      {
        "id": 200412,
        "number": 412,
        "node_id": "PR_kwDOA412",
        "title": "feat: multi-format statement export",
        "state": "closed",
        "draft": false,
        "html_url": "https://github.com/northbank/customer-api/pull/412",
        "head": {
          "ref": "feature/stmt-export-pdf-csv",
          "sha": "0000412fffffffffffffffffffffffffffffffff"
        },
        "base": {
          "ref": "main",
          "sha": "main000000000000000000000000000000000000"
        },
        "user": {
          "login": "sowmya.krishnan",
          "id": 10169
        },
        "requested_reviewers": [
          {
            "login": "sridhar.raman"
          },
          {
            "login": "murali.iyer"
          }
        ],
        "reviews": [
          {
            "id": 30000,
            "user": {
              "login": "sridhar.raman"
            },
            "state": "APPROVED",
            "submitted_at": "2026-02-10T09:15:00Z",
            "body": "LGTM"
          },
          {
            "id": 30001,
            "user": {
              "login": "murali.iyer"
            },
            "state": "APPROVED",
            "submitted_at": "2026-02-10T09:15:00Z",
            "body": "LGTM"
          }
        ],
        "merged": true,
        "merged_at": "2026-02-10T09:15:00Z",
        "merged_by": {
          "login": "ops.release.bot",
          "type": "User"
        },
        "body": "Implements change CHG-1001.\n\nJira: CHG-1001",
        "linked_change_key": "CHG-1001",
        "repository": {
          "full_name": "northbank/customer-api",
          "default_branch": "main"
        },
        "changed_files": 5,
        "additions": 120,
        "deletions": 40
      },
      {
        "id": 200523,
        "number": 523,
        "node_id": "PR_kwDOA523",
        "title": "hotfix: raise db pool + eviction",
        "state": "closed",
        "draft": false,
        "html_url": "https://github.com/northbank/payments-service/pull/523",
        "head": {
          "ref": "hotfix/db-pool",
          "sha": "0000523fffffffffffffffffffffffffffffffff"
        },
        "base": {
          "ref": "main",
          "sha": "main000000000000000000000000000000000000"
        },
        "user": {
          "login": "murali.iyer",
          "id": 10575
        },
        "requested_reviewers": [
          {
            "login": "sridhar.raman"
          }
        ],
        "reviews": [
          {
            "id": 30000,
            "user": {
              "login": "sridhar.raman"
            },
            "state": "APPROVED",
            "submitted_at": "2026-02-17T03:55:00Z",
            "body": "LGTM"
          }
        ],
        "merged": true,
        "merged_at": "2026-02-17T03:55:00Z",
        "merged_by": {
          "login": "ops.release.bot",
          "type": "User"
        },
        "body": "Implements change CHG-1002.\n\nJira: CHG-1002",
        "linked_change_key": "CHG-1002",
        "repository": {
          "full_name": "northbank/payments-service",
          "default_branch": "main"
        },
        "changed_files": 5,
        "additions": 120,
        "deletions": 40
      },
      {
        "id": 200541,
        "number": 541,
        "node_id": "PR_kwDOA541",
        "title": "hotfix: close jwt cache leak",
        "state": "closed",
        "draft": false,
        "html_url": "https://github.com/northbank/auth-service/pull/541",
        "head": {
          "ref": "hotfix/jwt-cache-leak",
          "sha": "0000541fffffffffffffffffffffffffffffffff"
        },
        "base": {
          "ref": "main",
          "sha": "main000000000000000000000000000000000000"
        },
        "user": {
          "login": "suresh.kumar",
          "id": 10193
        },
        "requested_reviewers": [
          {
            "login": "sridhar.raman"
          }
        ],
        "reviews": [
          {
            "id": 30000,
            "user": {
              "login": "sridhar.raman"
            },
            "state": "APPROVED",
            "submitted_at": "2026-02-22T23:20:00Z",
            "body": "LGTM"
          }
        ],
        "merged": true,
        "merged_at": "2026-02-22T23:20:00Z",
        "merged_by": {
          "login": "ops.release.bot",
          "type": "User"
        },
        "body": "Implements change CHG-1003.\n\nJira: CHG-1003",
        "linked_change_key": "CHG-1003",
        "repository": {
          "full_name": "northbank/auth-service",
          "default_branch": "main"
        },
        "changed_files": 5,
        "additions": 120,
        "deletions": 40
      },
      {
        "id": 200641,
        "number": 641,
        "node_id": "PR_kwDOA641",
        "title": "chore: update login copy + T&C link",
        "state": "closed",
        "draft": false,
        "html_url": "https://github.com/northbank/web-banking-portal/pull/641",
        "head": {
          "ref": "chore/login-copy",
          "sha": "0000641fffffffffffffffffffffffffffffffff"
        },
        "base": {
          "ref": "main",
          "sha": "main000000000000000000000000000000000000"
        },
        "user": {
          "login": "karthik.menon",
          "id": 10595
        },
        "requested_reviewers": [
          {
            "login": "sowmya.krishnan"
          }
        ],
        "reviews": [
          {
            "id": 30000,
            "user": {
              "login": "sowmya.krishnan"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-04T16:05:00Z",
            "body": "LGTM"
          }
        ],
        "merged": true,
        "merged_at": "2026-03-04T16:05:00Z",
        "merged_by": {
          "login": "karthik.menon",
          "type": "User"
        },
        "body": "Implements change CHG-1004.\n\nJira: CHG-1004",
        "linked_change_key": "CHG-1004",
        "repository": {
          "full_name": "northbank/web-banking-portal",
          "default_branch": "main"
        },
        "changed_files": 3,
        "additions": 12,
        "deletions": 12
      },
      {
        "id": 200378,
        "number": 378,
        "node_id": "PR_kwDOA378",
        "title": "chore: bump payment-gateway-sdk to 4.2.1",
        "state": "closed",
        "draft": false,
        "html_url": "https://github.com/northbank/payments-service/pull/378",
        "head": {
          "ref": "chore/sdk-upgrade",
          "sha": "0000378fffffffffffffffffffffffffffffffff"
        },
        "base": {
          "ref": "main",
          "sha": "main000000000000000000000000000000000000"
        },
        "user": {
          "login": "subashini.rao",
          "id": 10668
        },
        "requested_reviewers": [
          {
            "login": "sridhar.raman"
          },
          {
            "login": "murali.iyer"
          }
        ],
        "reviews": [
          {
            "id": 30000,
            "user": {
              "login": "sridhar.raman"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-11T10:50:00Z",
            "body": "LGTM"
          },
          {
            "id": 30001,
            "user": {
              "login": "murali.iyer"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-11T10:50:00Z",
            "body": "LGTM"
          }
        ],
        "merged": true,
        "merged_at": "2026-03-11T10:50:00Z",
        "merged_by": {
          "login": "ops.release.bot",
          "type": "User"
        },
        "body": "Implements change CHG-1005.\n\nJira: CHG-1005",
        "linked_change_key": "CHG-1005",
        "repository": {
          "full_name": "northbank/payments-service",
          "default_branch": "main"
        },
        "changed_files": 5,
        "additions": 120,
        "deletions": 40
      },
      {
        "id": 200902,
        "number": 902,
        "node_id": "PR_kwDOA902",
        "title": "feat: initial java port of reporting service",
        "state": "closed",
        "draft": false,
        "html_url": "https://github.com/northbank/internal-reporting-java/pull/902",
        "head": {
          "ref": "feature/java-rewrite",
          "sha": "0000902fffffffffffffffffffffffffffffffff"
        },
        "base": {
          "ref": "main",
          "sha": "main000000000000000000000000000000000000"
        },
        "user": {
          "login": "sowmya.krishnan",
          "id": 10169
        },
        "requested_reviewers": [
          {
            "login": "sridhar.raman"
          },
          {
            "login": "subashini.rao"
          }
        ],
        "reviews": [
          {
            "id": 30000,
            "user": {
              "login": "sridhar.raman"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-13T09:40:00Z",
            "body": "LGTM"
          },
          {
            "id": 30001,
            "user": {
              "login": "subashini.rao"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-13T09:40:00Z",
            "body": "LGTM"
          }
        ],
        "merged": true,
        "merged_at": "2026-03-13T09:40:00Z",
        "merged_by": {
          "login": "ops.release.bot",
          "type": "User"
        },
        "body": "Implements change CHG-1006.\n\nJira: CHG-1006",
        "linked_change_key": "CHG-1006",
        "repository": {
          "full_name": "northbank/internal-reporting-java",
          "default_branch": "main"
        },
        "changed_files": 47,
        "additions": 3210,
        "deletions": 1804
      },
      {
        "id": 200771,
        "number": 771,
        "node_id": "PR_kwDOA771",
        "title": "feat: seasonal banner A/B flag",
        "state": "closed",
        "draft": false,
        "html_url": "https://github.com/northbank/web-banking-portal/pull/771",
        "head": {
          "ref": "feature/banner-ab",
          "sha": "0000771fffffffffffffffffffffffffffffffff"
        },
        "base": {
          "ref": "main",
          "sha": "main000000000000000000000000000000000000"
        },
        "user": {
          "login": "anurag.desai",
          "id": 10894
        },
        "requested_reviewers": [
          {
            "login": "sowmya.krishnan"
          }
        ],
        "reviews": [
          {
            "id": 30000,
            "user": {
              "login": "sowmya.krishnan"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-27T09:55:00Z",
            "body": "LGTM"
          }
        ],
        "merged": true,
        "merged_at": "2026-03-27T09:55:00Z",
        "merged_by": {
          "login": "ops.release.bot",
          "type": "User"
        },
        "body": "Implements change CHG-1007.\n\nJira: CHG-1007",
        "linked_change_key": "CHG-1007",
        "repository": {
          "full_name": "northbank/web-banking-portal",
          "default_branch": "main"
        },
        "changed_files": 2,
        "additions": 34,
        "deletions": 2
      },
      {
        "id": 200214,
        "number": 214,
        "node_id": "PR_kwDOA214",
        "title": "release: 14.3 \u2014 biometric retries + ar-localisation",
        "state": "closed",
        "draft": false,
        "html_url": "https://github.com/northbank/mobile-banking-ios/pull/214",
        "head": {
          "ref": "release/14.3",
          "sha": "0000214fffffffffffffffffffffffffffffffff"
        },
        "base": {
          "ref": "main",
          "sha": "main000000000000000000000000000000000000"
        },
        "user": {
          "login": "karthik.menon",
          "id": 10595
        },
        "requested_reviewers": [
          {
            "login": "sowmya.krishnan"
          },
          {
            "login": "sridhar.raman"
          }
        ],
        "reviews": [
          {
            "id": 30000,
            "user": {
              "login": "sowmya.krishnan"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-17T09:05:00Z",
            "body": "LGTM"
          },
          {
            "id": 30001,
            "user": {
              "login": "sridhar.raman"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-17T09:05:00Z",
            "body": "LGTM"
          }
        ],
        "merged": true,
        "merged_at": "2026-03-17T09:05:00Z",
        "merged_by": {
          "login": "ops.release.bot",
          "type": "User"
        },
        "body": "Implements change CHG-1008.\n\nJira: CHG-1008",
        "linked_change_key": "CHG-1008",
        "repository": {
          "full_name": "northbank/mobile-banking-ios",
          "default_branch": "main"
        },
        "changed_files": 22,
        "additions": 560,
        "deletions": 140
      },
      {
        "id": 200112,
        "number": 112,
        "node_id": "PR_kwDOA112",
        "title": "chore: bump cluster to 1.30",
        "state": "closed",
        "draft": false,
        "html_url": "https://github.com/northbank/platform-k8s-manifests/pull/112",
        "head": {
          "ref": "chore/k8s-1-30",
          "sha": "0000112fffffffffffffffffffffffffffffffff"
        },
        "base": {
          "ref": "main",
          "sha": "main000000000000000000000000000000000000"
        },
        "user": {
          "login": "murali.iyer",
          "id": 10575
        },
        "requested_reviewers": [
          {
            "login": "sridhar.raman"
          },
          {
            "login": "subashini.rao"
          },
          {
            "login": "suresh.kumar"
          }
        ],
        "reviews": [
          {
            "id": 30000,
            "user": {
              "login": "sridhar.raman"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-20T18:30:00Z",
            "body": "LGTM"
          },
          {
            "id": 30001,
            "user": {
              "login": "subashini.rao"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-20T18:30:00Z",
            "body": "LGTM"
          },
          {
            "id": 30002,
            "user": {
              "login": "suresh.kumar"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-20T18:30:00Z",
            "body": "LGTM"
          }
        ],
        "merged": true,
        "merged_at": "2026-03-20T18:30:00Z",
        "merged_by": {
          "login": "ops.release.bot",
          "type": "User"
        },
        "body": "Implements change CHG-1009.\n\nJira: CHG-1009",
        "linked_change_key": "CHG-1009",
        "repository": {
          "full_name": "northbank/platform-k8s-manifests",
          "default_branch": "main"
        },
        "changed_files": 8,
        "additions": 44,
        "deletions": 20
      },
      {
        "id": 200088,
        "number": 88,
        "node_id": "PR_kwDOA88",
        "title": "feat: add multi-currency columns to ledger schema",
        "state": "closed",
        "draft": false,
        "html_url": "https://github.com/northbank/core-banking-ledger/pull/88",
        "head": {
          "ref": "feature/multi-ccy-ledger",
          "sha": "0000088fffffffffffffffffffffffffffffffff"
        },
        "base": {
          "ref": "main",
          "sha": "main000000000000000000000000000000000000"
        },
        "user": {
          "login": "sridhar.raman",
          "id": 10486
        },
        "requested_reviewers": [
          {
            "login": "sowmya.krishnan"
          },
          {
            "login": "murali.iyer"
          },
          {
            "login": "subashini.rao"
          },
          {
            "login": "suresh.kumar"
          },
          {
            "login": "usha.patel"
          },
          {
            "login": "cab.chair.jayaraman"
          }
        ],
        "reviews": [
          {
            "id": 30000,
            "user": {
              "login": "sowmya.krishnan"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-21T02:30:00Z",
            "body": "LGTM"
          },
          {
            "id": 30001,
            "user": {
              "login": "murali.iyer"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-21T02:30:00Z",
            "body": "LGTM"
          },
          {
            "id": 30002,
            "user": {
              "login": "subashini.rao"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-21T02:30:00Z",
            "body": "LGTM"
          },
          {
            "id": 30003,
            "user": {
              "login": "suresh.kumar"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-21T02:30:00Z",
            "body": "LGTM"
          },
          {
            "id": 30004,
            "user": {
              "login": "usha.patel"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-21T02:30:00Z",
            "body": "LGTM"
          },
          {
            "id": 30005,
            "user": {
              "login": "cab.chair.jayaraman"
            },
            "state": "APPROVED",
            "submitted_at": "2026-03-21T02:30:00Z",
            "body": "LGTM"
          }
        ],
        "merged": true,
        "merged_at": "2026-03-21T02:30:00Z",
        "merged_by": {
          "login": "ops.release.bot",
          "type": "User"
        },
        "body": "Implements change CHG-1010.\n\nJira: CHG-1010",
        "linked_change_key": "CHG-1010",
        "repository": {
          "full_name": "northbank/core-banking-ledger",
          "default_branch": "main"
        },
        "changed_files": 34,
        "additions": 2104,
        "deletions": 88
      }
    ]
  },
  "cicd_evidence_collector": {
    "_api": "github.actions.list_workflow_runs_for_repo",
    "_endpoint": "GET /repos/{owner}/{repo}/actions/runs",
    "total_count": 10,
    "workflow_runs": [
      {
        "id": 9001001,
        "name": "build-test-release",
        "node_id": "WFR_kwDO9001001",
        "head_branch": "feature/stmt-export-pdf-csv",
        "head_sha": "0000412abcffffffffffffffffffffffffffffff",
        "path": ".github/workflows/build-test-release.yml",
        "display_title": "Build & Release (CHG-1001)",
        "run_number": 1,
        "event": "pull_request",
        "status": "completed",
        "conclusion": "success",
        "workflow_id": 556677,
        "html_url": "https://github.com/northbank/customer-api/actions/runs/9001001",
        "pull_requests": [
          {
            "number": 412
          }
        ],
        "created_at": "2026-02-09T14:00:00Z",
        "updated_at": "2026-02-09T14:48:00Z",
        "run_started_at": "2026-02-09T14:00:00Z",
        "triggering_actor": {
          "login": "sowmya.krishnan",
          "type": "User"
        },
        "repository": {
          "full_name": "northbank/customer-api"
        },
        "linked_change_key": "CHG-1001",
        "stages": [
          {
            "name": "unit_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-02-09T14:02:00Z",
            "completed_at": "2026-02-09T14:09:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/unit_tests",
            "notes": "2,340 tests \u00b7 100% pass \u00b7 coverage 87.2%"
          },
          {
            "name": "integration_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-02-09T14:10:00Z",
            "completed_at": "2026-02-09T14:28:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/integration_tests",
            "notes": "412 tests \u00b7 100% pass"
          },
          {
            "name": "security_scan",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-02-09T14:28:00Z",
            "completed_at": "2026-02-09T14:40:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/security_scan",
            "notes": "SAST: 0 high, 0 critical \u00b7 DAST: 0 critical"
          },
          {
            "name": "uat_signoff",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-02-09T15:30:00Z",
            "completed_at": "2026-02-09T16:00:00Z",
            "evidence_url": "https://jira.northbank.example.com/browse/CHG-1001?focusedCommentId=uat-42112",
            "notes": "UAT approved by qa.lead.deepa at 2026-02-09T16:00:00Z"
          },
          {
            "name": "artifact_build",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-02-09T14:40:00Z",
            "completed_at": "2026-02-09T14:48:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/artifact_build",
            "notes": "artifact: customer-api:2.14.0 signed & pushed"
          }
        ]
      },
      {
        "id": 9001002,
        "name": "build-test-release-emergency",
        "node_id": "WFR_kwDO9001002",
        "head_branch": "hotfix/db-pool",
        "head_sha": "0000523abcffffffffffffffffffffffffffffff",
        "path": ".github/workflows/build-test-release-emergency.yml",
        "display_title": "Build & Release (CHG-1002)",
        "run_number": 2,
        "event": "pull_request",
        "status": "completed",
        "conclusion": "success",
        "workflow_id": 556677,
        "html_url": "https://github.com/northbank/payments-service/actions/runs/9001002",
        "pull_requests": [
          {
            "number": 523
          }
        ],
        "created_at": "2026-02-17T03:30:00Z",
        "updated_at": "2026-02-17T03:55:00Z",
        "run_started_at": "2026-02-17T03:30:00Z",
        "triggering_actor": {
          "login": "murali.iyer",
          "type": "User"
        },
        "repository": {
          "full_name": "northbank/payments-service"
        },
        "linked_change_key": "CHG-1002",
        "stages": [
          {
            "name": "unit_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-02-17T03:31:00Z",
            "completed_at": "2026-02-17T03:37:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/unit_tests",
            "notes": "1,890 tests \u00b7 100% pass \u00b7 emergency fast-path"
          },
          {
            "name": "integration_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-02-17T03:37:00Z",
            "completed_at": "2026-02-17T03:45:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/integration_tests",
            "notes": "critical-path suite only \u00b7 112 tests \u00b7 pass"
          },
          {
            "name": "security_scan",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-02-17T03:45:00Z",
            "completed_at": "2026-02-17T03:50:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/security_scan",
            "notes": "SAST delta-only \u00b7 0 findings"
          },
          {
            "name": "uat_signoff",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-02-17T03:50:00Z",
            "completed_at": "2026-02-17T03:52:00Z",
            "evidence_url": "https://jira.northbank.example.com/browse/CHG-1002?emg-uat-1",
            "notes": "Emergency UAT waiver approved by on-call.manager.verma \u2014 config-only change"
          },
          {
            "name": "artifact_build",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-02-17T03:52:00Z",
            "completed_at": "2026-02-17T03:55:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/artifact_build",
            "notes": ""
          }
        ]
      },
      {
        "id": 9001003,
        "name": "build-test-release-emergency",
        "node_id": "WFR_kwDO9001003",
        "head_branch": "hotfix/jwt-cache-leak",
        "head_sha": "0000541abcffffffffffffffffffffffffffffff",
        "path": ".github/workflows/build-test-release-emergency.yml",
        "display_title": "Build & Release (CHG-1003)",
        "run_number": 3,
        "event": "pull_request",
        "status": "completed",
        "conclusion": "success",
        "workflow_id": 556677,
        "html_url": "https://github.com/northbank/auth-service/actions/runs/9001003",
        "pull_requests": [
          {
            "number": 541
          }
        ],
        "created_at": "2026-02-22T23:00:00Z",
        "updated_at": "2026-02-22T23:18:00Z",
        "run_started_at": "2026-02-22T23:00:00Z",
        "triggering_actor": {
          "login": "suresh.kumar",
          "type": "User"
        },
        "repository": {
          "full_name": "northbank/auth-service"
        },
        "linked_change_key": "CHG-1003",
        "stages": [
          {
            "name": "unit_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-02-22T23:01:00Z",
            "completed_at": "2026-02-22T23:06:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/unit_tests",
            "notes": ""
          },
          {
            "name": "integration_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-02-22T23:06:00Z",
            "completed_at": "2026-02-22T23:11:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/integration_tests",
            "notes": ""
          },
          {
            "name": "security_scan",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-02-22T23:11:00Z",
            "completed_at": "2026-02-22T23:14:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/security_scan",
            "notes": ""
          },
          {
            "name": "uat_signoff",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-02-22T23:14:00Z",
            "completed_at": "2026-02-22T23:16:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/uat_signoff",
            "notes": "Emergency UAT waiver by on-call.manager.bhatia"
          },
          {
            "name": "artifact_build",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-02-22T23:16:00Z",
            "completed_at": "2026-02-22T23:18:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/artifact_build",
            "notes": ""
          }
        ]
      },
      {
        "id": 9001004,
        "name": "build-test-release",
        "node_id": "WFR_kwDO9001004",
        "head_branch": "chore/login-copy",
        "head_sha": "0000641abcffffffffffffffffffffffffffffff",
        "path": ".github/workflows/build-test-release.yml",
        "display_title": "Build & Release (CHG-1004)",
        "run_number": 4,
        "event": "pull_request",
        "status": "completed",
        "conclusion": "success",
        "workflow_id": 556677,
        "html_url": "https://github.com/northbank/web-banking-portal/actions/runs/9001004",
        "pull_requests": [
          {
            "number": 641
          }
        ],
        "created_at": "2026-03-04T15:30:00Z",
        "updated_at": "2026-03-04T15:58:00Z",
        "run_started_at": "2026-03-04T15:30:00Z",
        "triggering_actor": {
          "login": "karthik.menon",
          "type": "User"
        },
        "repository": {
          "full_name": "northbank/web-banking-portal"
        },
        "linked_change_key": "CHG-1004",
        "stages": [
          {
            "name": "unit_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-04T15:31:00Z",
            "completed_at": "2026-03-04T15:37:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/unit_tests",
            "notes": ""
          },
          {
            "name": "integration_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-04T15:37:00Z",
            "completed_at": "2026-03-04T15:45:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/integration_tests",
            "notes": ""
          },
          {
            "name": "security_scan",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-04T15:45:00Z",
            "completed_at": "2026-03-04T15:50:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/security_scan",
            "notes": ""
          },
          {
            "name": "uat_signoff",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-04T15:50:00Z",
            "completed_at": "2026-03-04T15:55:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/uat_signoff",
            "notes": "UAT approved by qa.lead.deepa"
          },
          {
            "name": "artifact_build",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-04T15:55:00Z",
            "completed_at": "2026-03-04T15:58:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/artifact_build",
            "notes": ""
          }
        ]
      },
      {
        "id": 9001005,
        "name": "build-test-release",
        "node_id": "WFR_kwDO9001005",
        "head_branch": "chore/sdk-upgrade",
        "head_sha": "0000378abcffffffffffffffffffffffffffffff",
        "path": ".github/workflows/build-test-release.yml",
        "display_title": "Build & Release (CHG-1005)",
        "run_number": 5,
        "event": "pull_request",
        "status": "completed",
        "conclusion": "success",
        "workflow_id": 556677,
        "html_url": "https://github.com/northbank/payments-service/actions/runs/9001005",
        "pull_requests": [
          {
            "number": 378
          }
        ],
        "created_at": "2026-03-11T10:00:00Z",
        "updated_at": "2026-03-11T10:45:00Z",
        "run_started_at": "2026-03-11T10:00:00Z",
        "triggering_actor": {
          "login": "subashini.rao",
          "type": "User"
        },
        "repository": {
          "full_name": "northbank/payments-service"
        },
        "linked_change_key": "CHG-1005",
        "stages": [
          {
            "name": "unit_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-11T10:01:00Z",
            "completed_at": "2026-03-11T10:10:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/unit_tests",
            "notes": ""
          },
          {
            "name": "integration_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-11T10:10:00Z",
            "completed_at": "2026-03-11T10:25:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/integration_tests",
            "notes": ""
          },
          {
            "name": "security_scan",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-11T10:25:00Z",
            "completed_at": "2026-03-11T10:35:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/security_scan",
            "notes": ""
          },
          {
            "name": "uat_signoff",
            "status": "completed",
            "conclusion": "skipped",
            "started_at": "2026-03-11T10:35:00Z",
            "completed_at": "2026-03-11T10:35:01Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/uat_signoff",
            "notes": "STAGE SKIPPED \u2014 no UAT ticket linked \u00b7 no qa approval recorded"
          },
          {
            "name": "artifact_build",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-11T10:35:00Z",
            "completed_at": "2026-03-11T10:45:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/artifact_build",
            "notes": ""
          }
        ]
      },
      {
        "id": 9001006,
        "name": "build-test-release",
        "node_id": "WFR_kwDO9001006",
        "head_branch": "feature/java-rewrite",
        "head_sha": "0000902abcffffffffffffffffffffffffffffff",
        "path": ".github/workflows/build-test-release.yml",
        "display_title": "Build & Release (CHG-1006)",
        "run_number": 6,
        "event": "pull_request",
        "status": "completed",
        "conclusion": "success",
        "workflow_id": 556677,
        "html_url": "https://github.com/northbank/internal-reporting-java/actions/runs/9001006",
        "pull_requests": [
          {
            "number": 902
          }
        ],
        "created_at": "2026-03-13T09:00:00Z",
        "updated_at": "2026-03-13T09:38:00Z",
        "run_started_at": "2026-03-13T09:00:00Z",
        "triggering_actor": {
          "login": "sowmya.krishnan",
          "type": "User"
        },
        "repository": {
          "full_name": "northbank/internal-reporting-java"
        },
        "linked_change_key": "CHG-1006",
        "stages": [
          {
            "name": "unit_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-13T09:01:00Z",
            "completed_at": "2026-03-13T09:14:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/unit_tests",
            "notes": ""
          },
          {
            "name": "integration_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-13T09:14:00Z",
            "completed_at": "2026-03-13T09:26:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/integration_tests",
            "notes": ""
          },
          {
            "name": "security_scan",
            "status": "completed",
            "conclusion": "skipped",
            "started_at": "2026-03-13T09:26:00Z",
            "completed_at": "2026-03-13T09:26:01Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/security_scan",
            "notes": "STAGE SKIPPED \u2014 SAST policy exemption flag set but no waiver ticket found"
          },
          {
            "name": "uat_signoff",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-13T09:28:00Z",
            "completed_at": "2026-03-13T09:35:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/uat_signoff",
            "notes": "UAT approved by qa.lead.deepa"
          },
          {
            "name": "artifact_build",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-13T09:35:00Z",
            "completed_at": "2026-03-13T09:38:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/artifact_build",
            "notes": ""
          }
        ]
      },
      {
        "id": 9001007,
        "name": "build-test-release",
        "node_id": "WFR_kwDO9001007",
        "head_branch": "feature/banner-ab",
        "head_sha": "0000771abcffffffffffffffffffffffffffffff",
        "path": ".github/workflows/build-test-release.yml",
        "display_title": "Build & Release (CHG-1007)",
        "run_number": 7,
        "event": "pull_request",
        "status": "completed",
        "conclusion": "success",
        "workflow_id": 556677,
        "html_url": "https://github.com/northbank/web-banking-portal/actions/runs/9001007",
        "pull_requests": [
          {
            "number": 771
          }
        ],
        "created_at": "2026-03-27T09:20:00Z",
        "updated_at": "2026-03-27T09:48:00Z",
        "run_started_at": "2026-03-27T09:20:00Z",
        "triggering_actor": {
          "login": "anurag.desai",
          "type": "User"
        },
        "repository": {
          "full_name": "northbank/web-banking-portal"
        },
        "linked_change_key": "CHG-1007",
        "stages": [
          {
            "name": "unit_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-27T09:21:00Z",
            "completed_at": "2026-03-27T09:26:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/unit_tests",
            "notes": ""
          },
          {
            "name": "integration_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-27T09:26:00Z",
            "completed_at": "2026-03-27T09:32:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/integration_tests",
            "notes": ""
          },
          {
            "name": "security_scan",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-27T09:32:00Z",
            "completed_at": "2026-03-27T09:38:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/security_scan",
            "notes": ""
          },
          {
            "name": "uat_signoff",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-27T09:38:00Z",
            "completed_at": "2026-03-27T09:42:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/uat_signoff",
            "notes": ""
          },
          {
            "name": "artifact_build",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-27T09:42:00Z",
            "completed_at": "2026-03-27T09:48:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/artifact_build",
            "notes": ""
          }
        ]
      },
      {
        "id": 9001008,
        "name": "build-test-release-mobile",
        "node_id": "WFR_kwDO9001008",
        "head_branch": "release/14.3",
        "head_sha": "0000214abcffffffffffffffffffffffffffffff",
        "path": ".github/workflows/build-test-release-mobile.yml",
        "display_title": "Build & Release (CHG-1008)",
        "run_number": 8,
        "event": "pull_request",
        "status": "completed",
        "conclusion": "success",
        "workflow_id": 556677,
        "html_url": "https://github.com/northbank/mobile-banking-ios/actions/runs/9001008",
        "pull_requests": [
          {
            "number": 214
          }
        ],
        "created_at": "2026-03-17T08:30:00Z",
        "updated_at": "2026-03-17T09:02:00Z",
        "run_started_at": "2026-03-17T08:30:00Z",
        "triggering_actor": {
          "login": "karthik.menon",
          "type": "User"
        },
        "repository": {
          "full_name": "northbank/mobile-banking-ios"
        },
        "linked_change_key": "CHG-1008",
        "stages": [
          {
            "name": "unit_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-17T08:31:00Z",
            "completed_at": "2026-03-17T08:44:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/unit_tests",
            "notes": ""
          },
          {
            "name": "integration_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-17T08:44:00Z",
            "completed_at": "2026-03-17T08:52:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/integration_tests",
            "notes": ""
          },
          {
            "name": "security_scan",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-17T08:52:00Z",
            "completed_at": "2026-03-17T08:56:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/security_scan",
            "notes": ""
          },
          {
            "name": "uat_signoff",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-17T08:56:00Z",
            "completed_at": "2026-03-17T09:00:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/uat_signoff",
            "notes": ""
          },
          {
            "name": "artifact_build",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-17T09:00:00Z",
            "completed_at": "2026-03-17T09:02:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/artifact_build",
            "notes": ""
          }
        ]
      },
      {
        "id": 9001009,
        "name": "build-test-release-platform",
        "node_id": "WFR_kwDO9001009",
        "head_branch": "chore/k8s-1-30",
        "head_sha": "0000112abcffffffffffffffffffffffffffffff",
        "path": ".github/workflows/build-test-release-platform.yml",
        "display_title": "Build & Release (CHG-1009)",
        "run_number": 9,
        "event": "pull_request",
        "status": "completed",
        "conclusion": "success",
        "workflow_id": 556677,
        "html_url": "https://github.com/northbank/platform-k8s-manifests/actions/runs/9001009",
        "pull_requests": [
          {
            "number": 112
          }
        ],
        "created_at": "2026-03-20T17:30:00Z",
        "updated_at": "2026-03-20T18:25:00Z",
        "run_started_at": "2026-03-20T17:30:00Z",
        "triggering_actor": {
          "login": "murali.iyer",
          "type": "User"
        },
        "repository": {
          "full_name": "northbank/platform-k8s-manifests"
        },
        "linked_change_key": "CHG-1009",
        "stages": [
          {
            "name": "unit_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-20T17:31:00Z",
            "completed_at": "2026-03-20T17:42:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/unit_tests",
            "notes": "manifest lint + policy tests"
          },
          {
            "name": "integration_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-20T17:42:00Z",
            "completed_at": "2026-03-20T18:05:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/integration_tests",
            "notes": "upgraded test cluster end-to-end smoke"
          },
          {
            "name": "security_scan",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-20T18:05:00Z",
            "completed_at": "2026-03-20T18:15:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/security_scan",
            "notes": ""
          },
          {
            "name": "uat_signoff",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-20T18:15:00Z",
            "completed_at": "2026-03-20T18:20:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/uat_signoff",
            "notes": "Platform UAT approved by platform.lead.rao"
          },
          {
            "name": "artifact_build",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-20T18:20:00Z",
            "completed_at": "2026-03-20T18:25:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/artifact_build",
            "notes": ""
          }
        ]
      },
      {
        "id": 9001010,
        "name": "build-test-release-critical",
        "node_id": "WFR_kwDO9001010",
        "head_branch": "feature/multi-ccy-ledger",
        "head_sha": "0000088abcffffffffffffffffffffffffffffff",
        "path": ".github/workflows/build-test-release-critical.yml",
        "display_title": "Build & Release (CHG-1010)",
        "run_number": 10,
        "event": "pull_request",
        "status": "completed",
        "conclusion": "success",
        "workflow_id": 556677,
        "html_url": "https://github.com/northbank/core-banking-ledger/actions/runs/9001010",
        "pull_requests": [
          {
            "number": 88
          }
        ],
        "created_at": "2026-03-21T00:30:00Z",
        "updated_at": "2026-03-21T02:15:00Z",
        "run_started_at": "2026-03-21T00:30:00Z",
        "triggering_actor": {
          "login": "sridhar.raman",
          "type": "User"
        },
        "repository": {
          "full_name": "northbank/core-banking-ledger"
        },
        "linked_change_key": "CHG-1010",
        "stages": [
          {
            "name": "unit_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-21T00:31:00Z",
            "completed_at": "2026-03-21T00:52:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/unit_tests",
            "notes": "8,421 tests \u00b7 100% pass \u00b7 coverage 94.6%"
          },
          {
            "name": "integration_tests",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-21T00:52:00Z",
            "completed_at": "2026-03-21T01:30:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/integration_tests",
            "notes": "cross-service ledger contract tests pass (1,142 assertions)"
          },
          {
            "name": "security_scan",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-21T01:30:00Z",
            "completed_at": "2026-03-21T01:48:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/security_scan",
            "notes": "SAST + DAST + dependency + IaC scan \u00b7 0 high \u00b7 0 critical"
          },
          {
            "name": "uat_signoff",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-21T01:48:00Z",
            "completed_at": "2026-03-21T02:05:00Z",
            "evidence_url": "https://jira.northbank.example.com/browse/CHG-1010?uat-signoff",
            "notes": "UAT signed off by qa.lead.deepa & risk.committee.chair"
          },
          {
            "name": "artifact_build",
            "status": "completed",
            "conclusion": "success",
            "started_at": "2026-03-21T02:05:00Z",
            "completed_at": "2026-03-21T02:15:00Z",
            "evidence_url": "https://ci.northbank.example.com/artifacts/artifact_build",
            "notes": "artifact signed; provenance attestation generated"
          }
        ]
      }
    ]
  },
  "deployment_activity_collector": {
    "_api": "argocd.app.list_events \u00b7 aws.codedeploy.list_deployments",
    "_endpoint": "GET /api/v1/applications/{app}/events \u00b7 codedeploy:ListDeployments",
    "total": 10,
    "deployments": [
      {
        "id": "deploy-2001",
        "environment": "prod",
        "status": "succeeded",
        "release_version": "customer-api:2.14.0",
        "service": "customer-api",
        "deployed_by": "ops.release.bot",
        "actor_type": "ServiceAccount",
        "command_executed_by": "rakesh.ops",
        "timestamp": "2026-02-10T14:30:00Z",
        "source_ip": "10.40.12.15",
        "linked_change_key": "CHG-1001",
        "linked_pr_number": 412,
        "linked_pipeline_run_id": 9001001,
        "rollback_of_deployment": null,
        "deployment_target": {
          "cluster": "prod-eks-01",
          "namespace": "customer-api"
        },
        "artifact": {
          "image": "registry.northbank.example.com/customer-api:customer-api:2.14.0",
          "digest": "sha256:b31ca24300000000000000000000000000000000000000000000000000000000"
        }
      },
      {
        "id": "deploy-2002",
        "environment": "prod",
        "status": "succeeded",
        "release_version": "payments-service:3.8.2-hotfix.1",
        "service": "payments-service",
        "deployed_by": "ops.release.bot",
        "actor_type": "ServiceAccount",
        "command_executed_by": "sre.oncall.pradeep",
        "timestamp": "2026-02-17T04:05:00Z",
        "source_ip": "10.40.12.22",
        "linked_change_key": "CHG-1002",
        "linked_pr_number": 523,
        "linked_pipeline_run_id": 9001002,
        "rollback_of_deployment": null,
        "deployment_target": {
          "cluster": "prod-eks-01",
          "namespace": "payments-service"
        },
        "artifact": {
          "image": "registry.northbank.example.com/payments-service:payments-service:3.8.2-hotfix.1",
          "digest": "sha256:9afabfe500000000000000000000000000000000000000000000000000000000"
        }
      },
      {
        "id": "deploy-2003",
        "environment": "prod",
        "status": "succeeded",
        "release_version": "auth-service:2.1.5-hotfix.2",
        "service": "auth-service",
        "deployed_by": "ops.release.bot",
        "actor_type": "ServiceAccount",
        "command_executed_by": "sre.oncall.priya",
        "timestamp": "2026-02-22T23:35:00Z",
        "source_ip": "10.40.12.31",
        "linked_change_key": "CHG-1003",
        "linked_pr_number": 541,
        "linked_pipeline_run_id": 9001003,
        "rollback_of_deployment": null,
        "deployment_target": {
          "cluster": "prod-eks-01",
          "namespace": "auth-service"
        },
        "artifact": {
          "image": "registry.northbank.example.com/auth-service:auth-service:2.1.5-hotfix.2",
          "digest": "sha256:ac5260ff00000000000000000000000000000000000000000000000000000000"
        }
      },
      {
        "id": "deploy-2004",
        "environment": "prod",
        "status": "succeeded",
        "release_version": "web-banking-portal:5.12.3",
        "service": "web-banking-portal",
        "deployed_by": "karthik.menon",
        "actor_type": "User",
        "command_executed_by": "karthik.menon",
        "timestamp": "2026-03-04T16:30:00Z",
        "source_ip": "172.18.44.102",
        "linked_change_key": "CHG-1004",
        "linked_pr_number": 641,
        "linked_pipeline_run_id": 9001004,
        "rollback_of_deployment": null,
        "deployment_target": {
          "cluster": "prod-eks-01",
          "namespace": "web-banking-portal"
        },
        "artifact": {
          "image": "registry.northbank.example.com/web-banking-portal:web-banking-portal:5.12.3",
          "digest": "sha256:d4631d2700000000000000000000000000000000000000000000000000000000"
        }
      },
      {
        "id": "deploy-2005",
        "environment": "prod",
        "status": "succeeded",
        "release_version": "payments-service:3.9.0",
        "service": "payments-service",
        "deployed_by": "ops.release.bot",
        "actor_type": "ServiceAccount",
        "command_executed_by": "rakesh.ops",
        "timestamp": "2026-03-11T11:15:00Z",
        "source_ip": "10.40.12.18",
        "linked_change_key": "CHG-1005",
        "linked_pr_number": 378,
        "linked_pipeline_run_id": 9001005,
        "rollback_of_deployment": null,
        "deployment_target": {
          "cluster": "prod-eks-01",
          "namespace": "payments-service"
        },
        "artifact": {
          "image": "registry.northbank.example.com/payments-service:payments-service:3.9.0",
          "digest": "sha256:32c508a900000000000000000000000000000000000000000000000000000000"
        }
      },
      {
        "id": "deploy-2006",
        "environment": "prod",
        "status": "succeeded",
        "release_version": "internal-reporting-java:1.0.0",
        "service": "internal-reporting-java",
        "deployed_by": "ops.release.bot",
        "actor_type": "ServiceAccount",
        "command_executed_by": "rakesh.ops",
        "timestamp": "2026-03-13T10:05:00Z",
        "source_ip": "10.40.12.18",
        "linked_change_key": "CHG-1006",
        "linked_pr_number": 902,
        "linked_pipeline_run_id": 9001006,
        "rollback_of_deployment": null,
        "deployment_target": {
          "cluster": "prod-eks-01",
          "namespace": "internal-reporting-java"
        },
        "artifact": {
          "image": "registry.northbank.example.com/internal-reporting-java:internal-reporting-java:1.0.0",
          "digest": "sha256:d924212000000000000000000000000000000000000000000000000000000000"
        }
      },
      {
        "id": "deploy-2007",
        "environment": "prod",
        "status": "succeeded",
        "release_version": "web-banking-portal:5.13.1",
        "service": "web-banking-portal",
        "deployed_by": "ops.release.bot",
        "actor_type": "ServiceAccount",
        "command_executed_by": "rakesh.ops",
        "timestamp": "2026-03-27T10:10:00Z",
        "source_ip": "10.40.12.18",
        "linked_change_key": "CHG-1007",
        "linked_pr_number": 771,
        "linked_pipeline_run_id": 9001007,
        "rollback_of_deployment": null,
        "deployment_target": {
          "cluster": "prod-eks-01",
          "namespace": "web-banking-portal"
        },
        "artifact": {
          "image": "registry.northbank.example.com/web-banking-portal:web-banking-portal:5.13.1",
          "digest": "sha256:00cc4c8100000000000000000000000000000000000000000000000000000000"
        }
      },
      {
        "id": "deploy-2008",
        "environment": "prod",
        "status": "succeeded",
        "release_version": "mobile-banking-ios:14.3.0",
        "service": "mobile-banking-ios",
        "deployed_by": "ops.release.bot",
        "actor_type": "ServiceAccount",
        "command_executed_by": "mobile.release.lead",
        "timestamp": "2026-03-17T09:25:00Z",
        "source_ip": "10.40.12.18",
        "linked_change_key": "CHG-1008",
        "linked_pr_number": 214,
        "linked_pipeline_run_id": 9001008,
        "rollback_of_deployment": null,
        "deployment_target": {
          "cluster": "prod-eks-01",
          "namespace": "mobile-banking-ios"
        },
        "artifact": {
          "image": "registry.northbank.example.com/mobile-banking-ios:mobile-banking-ios:14.3.0",
          "digest": "sha256:844a3c6300000000000000000000000000000000000000000000000000000000"
        }
      },
      {
        "id": "deploy-2009",
        "environment": "prod",
        "status": "succeeded",
        "release_version": "k8s-manifests:1.30.0-apply",
        "service": "platform-kubernetes",
        "deployed_by": "ops.release.bot",
        "actor_type": "ServiceAccount",
        "command_executed_by": "platform.release.lead",
        "timestamp": "2026-03-20T19:00:00Z",
        "source_ip": "10.40.12.18",
        "linked_change_key": "CHG-1009",
        "linked_pr_number": 112,
        "linked_pipeline_run_id": 9001009,
        "rollback_of_deployment": null,
        "deployment_target": {
          "cluster": "prod-eks-01",
          "namespace": "platform-kubernetes"
        },
        "artifact": {
          "image": "registry.northbank.example.com/platform-kubernetes:k8s-manifests:1.30.0-apply",
          "digest": "sha256:9c442a8700000000000000000000000000000000000000000000000000000000"
        }
      },
      {
        "id": "deploy-2010",
        "environment": "prod",
        "status": "succeeded",
        "release_version": "core-banking-ledger:9.2.0",
        "service": "core-banking-ledger",
        "deployed_by": "ops.release.bot",
        "actor_type": "ServiceAccount",
        "command_executed_by": "release.lead.kannan",
        "timestamp": "2026-03-21T02:50:00Z",
        "source_ip": "10.40.12.18",
        "linked_change_key": "CHG-1010",
        "linked_pr_number": 88,
        "linked_pipeline_run_id": 9001010,
        "rollback_of_deployment": null,
        "deployment_target": {
          "cluster": "prod-eks-01",
          "namespace": "core-banking-ledger"
        },
        "artifact": {
          "image": "registry.northbank.example.com/core-banking-ledger:core-banking-ledger:9.2.0",
          "digest": "sha256:2c549ae700000000000000000000000000000000000000000000000000000000"
        }
      }
    ]
  },
  "freeze_window_collector": {
    "_api": "internal.change-policy.freeze-windows",
    "_endpoint": "GET /api/v1/policy/freeze-windows?period=2026Q1",
    "freeze_windows": [
      {
        "id": "FW-2026-Q1-END",
        "label": "Q1 2026 quarter-end freeze",
        "start": "2026-03-25T00:00:00Z",
        "end": "2026-03-31T23:59:59Z",
        "reason": "Quarter-end financial close & regulatory reporting (RBI quarterly return)",
        "applicable_environments": [
          "prod"
        ],
        "applicable_services": [
          "*"
        ],
        "owner": "cto.office",
        "declared_at": "2026-02-10T12:00:00Z"
      },
      {
        "id": "FW-2026-FEB-RBI",
        "label": "Feb 2026 RBI monthly return window",
        "start": "2026-02-14T18:00:00Z",
        "end": "2026-02-16T06:00:00Z",
        "reason": "RBI monthly return submission (no prod changes to data plane)",
        "applicable_environments": [
          "prod"
        ],
        "applicable_services": [
          "payments-service",
          "core-banking-ledger",
          "internal-reporting"
        ],
        "owner": "cto.office",
        "declared_at": "2026-01-20T12:00:00Z"
      }
    ],
    "exceptions": [
      {
        "id": "FREEZE-EXC-001",
        "freeze_window_id": "FW-2026-FEB-RBI",
        "linked_change_key": "CHG-1002",
        "requested_by": "murali.iyer",
        "approver": "cto.sundar",
        "approved_at": "2026-02-17T03:50:00Z",
        "justification": "P1 incident INC-88821 \u2014 production outage; deploy outside RBI freeze approved by CTO.",
        "status": "APPROVED"
      },
      {
        "id": "FREEZE-EXC-002",
        "freeze_window_id": "FW-2026-Q1-END",
        "linked_change_key": "CHG-1010",
        "requested_by": "sridhar.raman",
        "approver": "cto.sundar",
        "approved_at": "2026-03-19T17:30:00Z",
        "justification": "Pre-approved critical ledger migration \u2014 must complete before Q2. Risk committee approved 2026-03-19.",
        "status": "APPROVED"
      }
    ]
  },
  "rollback_evidence_collector": {
    "_api": "internal.release-metadata.rollback-records",
    "_endpoint": "GET /api/v1/releases/{change_key}/rollback",
    "records": [
      {
        "linked_change_key": "CHG-1001",
        "rollback_plan_present": true,
        "rollback_steps": "1) Pipeline triggers rollback job \u00b7 2) DB down-migration applied \u00b7 3) Artifact pinned to v2.13.x",
        "rollback_tested": true,
        "rollback_tested_at": "2026-02-09T11:30:00Z",
        "rollback_tested_in": "test",
        "rollback_validator": "qa.lead.deepa",
        "evidence_reference": "CI run 9000987 (rollback drill) \u00b7 Confluence CONF-CHG-1001-RB"
      },
      {
        "linked_change_key": "CHG-1002",
        "rollback_plan_present": true,
        "rollback_steps": "1) Revert to previous k8s image tag \u00b7 2) Disable pool-eviction feature flag",
        "rollback_tested": true,
        "rollback_tested_at": "2026-01-20T10:00:00Z",
        "rollback_tested_in": "test",
        "rollback_validator": "platform.lead.rao",
        "evidence_reference": "Quarterly rollback drill Q1-2026 \u00b7 Confluence CONF-RB-PAYMENTS"
      },
      {
        "linked_change_key": "CHG-1003",
        "rollback_plan_present": true,
        "rollback_steps": "kubectl rollout undo deployment/auth-service -n auth",
        "rollback_tested": true,
        "rollback_tested_at": "2026-01-22T14:00:00Z",
        "rollback_tested_in": "test",
        "rollback_validator": "platform.lead.rao",
        "evidence_reference": "Quarterly rollback drill Q1-2026 \u00b7 Confluence CONF-RB-AUTH"
      },
      {
        "linked_change_key": "CHG-1004",
        "rollback_plan_present": true,
        "rollback_steps": "Toggle static-copy feature flag off",
        "rollback_tested": true,
        "rollback_tested_at": "2026-03-03T10:00:00Z",
        "rollback_tested_in": "test",
        "rollback_validator": "qa.lead.deepa",
        "evidence_reference": "Flag toggle drill CONF-RB-WEB"
      },
      {
        "linked_change_key": "CHG-1005",
        "rollback_plan_present": true,
        "rollback_steps": "Pin SDK artifact to v4.1.x; rebuild & redeploy",
        "rollback_tested": true,
        "rollback_tested_at": "2026-03-09T12:00:00Z",
        "rollback_tested_in": "test",
        "rollback_validator": "qa.lead.deepa",
        "evidence_reference": "Rollback drill CONF-RB-PAY-SDK"
      },
      {
        "linked_change_key": "CHG-1006",
        "rollback_plan_present": true,
        "rollback_steps": "Load balancer target group switch back to Go service (warm-standby 72h)",
        "rollback_tested": true,
        "rollback_tested_at": "2026-03-11T09:00:00Z",
        "rollback_tested_in": "test",
        "rollback_validator": "platform.lead.rao",
        "evidence_reference": "Blue-green cutover drill CONF-RB-REPORTING"
      },
      {
        "linked_change_key": "CHG-1007",
        "rollback_plan_present": true,
        "rollback_steps": "Feature flag disable via config service",
        "rollback_tested": true,
        "rollback_tested_at": "2026-03-24T11:00:00Z",
        "rollback_tested_in": "test",
        "rollback_validator": "qa.lead.deepa",
        "evidence_reference": "Flag toggle drill CONF-RB-WEB"
      },
      {
        "linked_change_key": "CHG-1008",
        "rollback_plan_present": false,
        "rollback_steps": null,
        "rollback_tested": false,
        "rollback_tested_at": null,
        "rollback_tested_in": null,
        "rollback_validator": null,
        "evidence_reference": null,
        "notes": "Rollback field in CHG-1008 Jira ticket is blank; no release metadata recorded."
      },
      {
        "linked_change_key": "CHG-1009",
        "rollback_plan_present": true,
        "rollback_steps": "Restore etcd snapshot taken pre-upgrade; pin nodes to previous AMI; redeploy workloads via ArgoCD.",
        "rollback_tested": false,
        "rollback_tested_at": null,
        "rollback_tested_in": null,
        "rollback_validator": null,
        "evidence_reference": "Confluence CONF-RB-K8S-130 (plan doc only \u2014 no validation run)",
        "notes": "Rollback plan is documented but was not executed in a pre-prod environment prior to deployment."
      },
      {
        "linked_change_key": "CHG-1010",
        "rollback_plan_present": true,
        "rollback_steps": "1) Stop dual-write \u00b7 2) Toggle reader flag back \u00b7 3) Apply down-migration script \u00b7 4) Restore from snapshot 'pre-CHG-1010' if required",
        "rollback_tested": true,
        "rollback_tested_at": "2026-03-17T14:00:00Z",
        "rollback_tested_in": "uat",
        "rollback_validator": "qa.lead.deepa + risk.committee.chair",
        "evidence_reference": "CI run 9000999 (ledger rollback drill, 2026-03-10) \u00b7 Confluence CONF-CHG-1010-RB \u00b7 UAT replay evidence attached"
      }
    ]
  }
};

/* ============================================================================
 * 2. CONSTANTS
 * ========================================================================= */
const NOW = new Date(RAW._metadata.generated_at);
const EMERGENCY_CAB_HOURS = RAW._metadata.thresholds.emergency_cab_post_hoc_window_hours;
const REQUIRED_GATES = RAW._metadata.thresholds.required_testing_gates;

const CONTROL_FAMILIES = [
  { id: "approval",  label: "Change Approval Workflow",       icon: ClipboardCheck, short: "Approval"   },
  { id: "sod",       label: "Developer-to-Production Segregation", icon: Users,     short: "SoD"        },
  { id: "testing",   label: "Pre-deployment Testing",          icon: TestTube2,     short: "Testing"    },
  { id: "freeze",    label: "Change Freeze Adherence",         icon: Snowflake,     short: "Freeze"     },
  { id: "rollback",  label: "Rollback Capability",             icon: Undo2,         short: "Rollback"   },
];

const STATUS = { MET: "Met", NOT_MET: "Not Met", REVIEW: "Requires Review", NA: "N/A" };

/* ============================================================================
 * 3. HELPERS
 * ========================================================================= */
const hoursBetween = (a, b) =>
  (new Date(b).getTime() - new Date(a).getTime()) / 3_600_000;

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC"
  }) + " UTC";
};
const fmtDateShort = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC"
  });
};
const prettyUser = (u) =>
  u ? u.split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ") : "—";

const inFreezeWindow = (ts, window) =>
  new Date(ts) >= new Date(window.start) && new Date(ts) <= new Date(window.end);

const findFreezeWindowFor = (ts, env, freezeWindows) =>
  freezeWindows.find(w =>
    w.applicable_environments.includes(env) && inFreezeWindow(ts, w)
  ) || null;

/* ============================================================================
 * 4. VIEW MODEL — raw collectors → per-change audit context
 * ========================================================================= */
function buildViewModel(raw) {
  const issues = raw.change_request_collector.issues;
  const prs = raw.pull_request_collector.pull_requests;
  const runs = raw.cicd_evidence_collector.workflow_runs;
  const deps = raw.deployment_activity_collector.deployments;
  const freezeWindows = raw.freeze_window_collector.freeze_windows;
  const exceptions = raw.freeze_window_collector.exceptions;
  const rollbacks = raw.rollback_evidence_collector.records;

  const changes = issues.map(issue => {
    const key = issue.key;
    const f = issue.fields;
    const pr = prs.find(p => p.linked_change_key === key) || null;
    const run = runs.find(r => r.linked_change_key === key) || null;
    const dep = deps.find(d => d.linked_change_key === key) || null;
    const rollback = rollbacks.find(r => r.linked_change_key === key) || null;

    const emergency = f.customfield_10200?.value === "Emergency";
    const cabStatus = f.customfield_10201;
    const cabApprover = f.customfield_10202;
    const cabApprovedAt = f.customfield_10203;
    const rollbackNarrative = f.customfield_10210 || "";
    const targetEnvs = f.customfield_10211 || [];
    const businessService = f.customfield_10212;
    const riskLevel = f.customfield_10213;
    const requester = f.reporter?.emailAddress?.split("@")[0] || "—";

    // Testing gates
    const stagesByName = {};
    if (run) run.stages.forEach(s => { stagesByName[s.name] = s; });
    const gateStatus = {};
    REQUIRED_GATES.forEach(g => {
      const stage = stagesByName[g];
      gateStatus[g] = stage
        ? { present: stage.conclusion === "success", conclusion: stage.conclusion, ...stage }
        : { present: false, conclusion: "missing" };
    });

    // Freeze context
    const freezeHit = dep ? findFreezeWindowFor(dep.timestamp, dep.environment, freezeWindows) : null;
    const freezeException = freezeHit
      ? exceptions.find(e => e.linked_change_key === key && e.freeze_window_id === freezeHit.id && e.status === "APPROVED")
      : null;

    // SoD context
    const prAuthor = pr?.user?.login || null;
    const prMergedBy = pr?.merged_by?.login || null;
    const deployActor = dep?.deployed_by || null;
    const deployCommandActor = dep?.command_executed_by || null;

    const ctx = {
      key, issue, pr, run, dep, rollback,
      emergency, cabStatus, cabApprover, cabApprovedAt,
      rollbackNarrative, targetEnvs, businessService, riskLevel, requester,
      gateStatus, freezeHit, freezeException,
      prAuthor, prMergedBy, deployActor, deployCommandActor,
      createdAt: f.created, resolvedAt: f.resolutiondate,
    };

    const controls = evaluateControls(ctx);
    const overall = rollupChangeStatus(controls);

    return {
      key,
      title: f.summary,
      type: f.issuetype.name,
      priority: f.priority.name,
      businessService,
      riskLevel,
      emergency,
      requester,
      requesterDisplay: f.reporter.displayName,
      cabApprover, cabApprovedAt,
      environmentsTargeted: targetEnvs,
      createdAt: f.created, resolvedAt: f.resolutiondate,
      deployTimestamp: dep?.timestamp || null,
      deployEnvironment: dep?.environment || null,
      deployedBy: deployActor,
      deployCommandActor,
      deploymentId: dep?.id || null,
      prNumber: pr?.number || null,
      prAuthor, prMergedBy,
      repository: pr?.repository?.full_name || null,
      runId: run?.id || null,
      runConclusion: run?.conclusion || null,
      rollbackPlanPresent: rollback?.rollback_plan_present ?? null,
      rollbackTested: rollback?.rollback_tested ?? null,
      rollbackEvidenceRef: rollback?.evidence_reference ?? null,
      freezeHit, freezeException,
      gateStatus,
      issue, pr, run, dep, rollback,   // raw refs for drawer
      controls, overall,
    };
  });

  return { changes, freezeWindows, exceptions };
}

/* ============================================================================
 * 5. AUDIT RULES — deterministic, demo-grade
 *    Each control family returns { status, severity, reason, evidence[], subControls[] }
 * ========================================================================= */
function evaluateControls(ctx) {
  return {
    approval: evalApproval(ctx),
    sod:      evalSoD(ctx),
    testing:  evalTesting(ctx),
    freeze:   evalFreeze(ctx),
    rollback: evalRollback(ctx),
  };
}

function evalApproval(ctx) {
  const { emergency, cabStatus, cabApprovedAt, createdAt, issue, cabApprover } = ctx;
  const subs = [];
  // Sub 1: CAB approval present
  const cabApproved = cabStatus === "APPROVED" || cabStatus === "POST_HOC_APPROVED" || cabStatus === "POST_HOC_APPROVED_LATE";
  subs.push({
    label: "CAB approval recorded",
    status: cabApproved ? STATUS.MET : STATUS.NOT_MET,
    evidence: cabApproved
      ? `Jira ${issue.key} · customfield_10201="${cabStatus}" · approver ${cabApprover} · ${fmtDate(cabApprovedAt)}`
      : `Jira ${issue.key} · customfield_10201="${cabStatus}"`
  });

  // Sub 2: Emergency post-hoc within 24h (only if emergency)
  if (emergency) {
    const hours = cabApprovedAt ? hoursBetween(createdAt, cabApprovedAt) : Infinity;
    const inWindow = hours <= EMERGENCY_CAB_HOURS;
    subs.push({
      label: `Emergency post-hoc CAB within ${EMERGENCY_CAB_HOURS}h`,
      status: inWindow ? STATUS.MET : STATUS.NOT_MET,
      evidence: `Jira ${issue.key} · raised ${fmtDate(createdAt)} · CAB ${fmtDate(cabApprovedAt)} · elapsed ${hours.toFixed(1)}h`
    });
  }

  const anyNotMet = subs.some(s => s.status === STATUS.NOT_MET);
  return {
    status: anyNotMet ? STATUS.NOT_MET : STATUS.MET,
    severity: anyNotMet ? (emergency ? "High" : "High") : "Informational",
    reason: anyNotMet
      ? (emergency
          ? `Emergency change post-hoc CAB review exceeded the ${EMERGENCY_CAB_HOURS}h window.`
          : "CAB approval is missing or incomplete.")
      : "Change passed through CAB workflow within policy.",
    subControls: subs,
    evidenceSources: ["change_request_collector.issues[].changelog", "change_request_collector.issues[].customfield_10201"]
  };
}

function evalSoD(ctx) {
  const { prAuthor, deployActor, deployCommandActor, dep, pr } = ctx;
  if (!dep) {
    return { status: STATUS.REVIEW, severity: "Medium",
      reason: "No deployment record found — audit trail incomplete.",
      subControls: [], evidenceSources: ["deployment_activity_collector.deployments"] };
  }
  const selfDeployBot = deployActor === prAuthor;                            // human author = deployed_by
  const selfDeployCommand = deployCommandActor === prAuthor;                 // human author = executed deploy command
  const violation = selfDeployBot || selfDeployCommand;

  const subs = [
    {
      label: "Deployment actor is distinct from PR author",
      status: violation ? STATUS.NOT_MET : STATUS.MET,
      evidence: `PR #${pr?.number || "?"} author=${prAuthor || "?"} · deployment.deployed_by=${deployActor || "?"} · deployment.command_executed_by=${deployCommandActor || "?"}`
    }
  ];

  return {
    status: violation ? STATUS.NOT_MET : STATUS.MET,
    severity: violation ? "High" : "Informational",
    reason: violation
      ? `Developer ${prettyUser(prAuthor)} both authored the code change and executed the production deployment.`
      : "Deployment executed by a release/operations identity separate from the code author.",
    subControls: subs,
    evidenceSources: ["pull_request_collector.pull_requests[].user",
                      "deployment_activity_collector.deployments[].deployed_by",
                      "deployment_activity_collector.deployments[].command_executed_by"]
  };
}

function evalTesting(ctx) {
  const { gateStatus, run } = ctx;
  const subs = REQUIRED_GATES.map(g => {
    const s = gateStatus[g];
    const ok = s.present;
    const labels = {
      unit_tests: "Unit tests executed & passed",
      integration_tests: "Integration tests executed & passed",
      uat_signoff: "UAT sign-off recorded",
      security_scan: "Security scan (SAST/DAST) executed"
    };
    return {
      label: labels[g] || g,
      status: ok ? STATUS.MET : STATUS.NOT_MET,
      evidence: run
        ? `Pipeline run ${run.id} · stage "${g}" · conclusion="${s.conclusion}"${s.notes ? " · " + s.notes : ""}`
        : "No pipeline run linked to this change."
    };
  });

  const anyMissing = subs.some(s => s.status === STATUS.NOT_MET);
  const missingGates = subs.filter(s => s.status === STATUS.NOT_MET).map(s => s.label);
  return {
    status: anyMissing ? STATUS.NOT_MET : STATUS.MET,
    severity: anyMissing ? "High" : "Informational",
    reason: anyMissing
      ? `Required pre-deployment testing gate(s) not satisfied: ${missingGates.join("; ")}.`
      : "All required testing gates produced successful evidence prior to deployment.",
    subControls: subs,
    evidenceSources: ["cicd_evidence_collector.workflow_runs[].stages"]
  };
}

function evalFreeze(ctx) {
  const { freezeHit, freezeException, dep } = ctx;
  if (!dep) {
    return { status: STATUS.REVIEW, severity: "Medium",
      reason: "No deployment record to evaluate against freeze windows.",
      subControls: [], evidenceSources: [] };
  }
  if (!freezeHit) {
    return { status: STATUS.MET, severity: "Informational",
      reason: `Deployment on ${fmtDate(dep.timestamp)} fell outside all declared freeze windows.`,
      subControls: [{
        label: "Deployment not during a declared freeze window",
        status: STATUS.MET,
        evidence: `deployment ${dep.id} @ ${fmtDate(dep.timestamp)} · no freeze window active for ${dep.environment}`
      }],
      evidenceSources: ["freeze_window_collector.freeze_windows", "deployment_activity_collector.deployments"] };
  }
  const covered = !!freezeException;
  const subs = [
    { label: `Deployment during freeze window "${freezeHit.label}"`,
      status: covered ? STATUS.MET : STATUS.NOT_MET,
      evidence: covered
        ? `Exception ${freezeException.id} approved by ${freezeException.approver} at ${fmtDate(freezeException.approved_at)}`
        : `deployment ${dep.id} at ${fmtDate(dep.timestamp)} falls inside ${freezeHit.id} (${fmtDateShort(freezeHit.start)} → ${fmtDateShort(freezeHit.end)}) · no exception record found`
    }
  ];
  return {
    status: covered ? STATUS.MET : STATUS.NOT_MET,
    severity: covered ? "Informational" : "High",
    reason: covered
      ? `Deployment during "${freezeHit.label}" covered by approved exception ${freezeException.id}.`
      : `Deployment executed during "${freezeHit.label}" without an approved exception.`,
    subControls: subs,
    evidenceSources: ["freeze_window_collector.freeze_windows", "freeze_window_collector.exceptions"]
  };
}

function evalRollback(ctx) {
  const { rollback, key } = ctx;
  if (!rollback) {
    return { status: STATUS.NOT_MET, severity: "High",
      reason: "No rollback evidence record found for this change.",
      subControls: [], evidenceSources: ["rollback_evidence_collector.records"] };
  }
  const subs = [];
  subs.push({
    label: "Rollback plan documented",
    status: rollback.rollback_plan_present ? STATUS.MET : STATUS.NOT_MET,
    evidence: rollback.rollback_plan_present
      ? `rollback_evidence_collector record for ${key} · steps: "${(rollback.rollback_steps || "").slice(0, 90)}${(rollback.rollback_steps || "").length > 90 ? "…" : ""}"`
      : `rollback_evidence_collector record for ${key} · rollback_plan_present=false · ${rollback.notes || "no plan narrative in change ticket"}`
  });
  if (rollback.rollback_plan_present) {
    subs.push({
      label: "Rollback validated in pre-production",
      status: rollback.rollback_tested ? STATUS.MET : STATUS.REVIEW,
      evidence: rollback.rollback_tested
        ? `Tested in ${rollback.rollback_tested_in} on ${fmtDate(rollback.rollback_tested_at)} by ${rollback.rollback_validator} · ${rollback.evidence_reference}`
        : `rollback_tested=false · ${rollback.notes || "no validation execution recorded"}`
    });
  }
  const anyNotMet = subs.some(s => s.status === STATUS.NOT_MET);
  const anyReview = subs.some(s => s.status === STATUS.REVIEW);
  const overall = anyNotMet ? STATUS.NOT_MET : (anyReview ? STATUS.REVIEW : STATUS.MET);
  return {
    status: overall,
    severity: overall === STATUS.NOT_MET ? "High" : (overall === STATUS.REVIEW ? "Medium" : "Informational"),
    reason: !rollback.rollback_plan_present
      ? "Rollback plan is missing for a production change."
      : !rollback.rollback_tested
        ? "Rollback plan documented but not validated in a pre-production environment."
        : "Rollback plan documented and validated in pre-production prior to release.",
    subControls: subs,
    evidenceSources: ["rollback_evidence_collector.records"]
  };
}

function rollupChangeStatus(controls) {
  const values = Object.values(controls).map(c => c.status);
  if (values.includes(STATUS.NOT_MET)) return STATUS.NOT_MET;
  if (values.includes(STATUS.REVIEW)) return STATUS.REVIEW;
  return STATUS.MET;
}

/* ============================================================================
 * 6. STYLE TOKENS + PRIMITIVES
 * ========================================================================= */
const STATUS_STYLES = {
  [STATUS.MET]:     { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", solid: "bg-emerald-600", soft: "bg-emerald-100", icon: CheckCircle2, label: "Met" },
  [STATUS.NOT_MET]: { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500",     solid: "bg-red-600",     soft: "bg-red-100",     icon: XCircle,       label: "Not Met" },
  [STATUS.REVIEW]:  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500",   solid: "bg-amber-600",   soft: "bg-amber-100",   icon: AlertTriangle, label: "Requires Review" },
  [STATUS.NA]:      { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400",   solid: "bg-slate-500",   soft: "bg-slate-100",     icon: CircleDot,     label: "N/A" }
};
const SEVERITY_STYLES = {
  High:          { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200" },
  Medium:        { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  Low:           { bg: "bg-slate-50",  text: "text-slate-600",  border: "border-slate-200" },
  Informational: { bg: "bg-slate-50",  text: "text-slate-500",  border: "border-slate-200" },
  Critical:      { bg: "bg-red-100",   text: "text-red-800",    border: "border-red-300" },
};

function StatusPill({ status, size = "sm" }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES[STATUS.NA];
  const Icon = s.icon;
  const pad = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${pad} ${s.bg} ${s.text} ${s.border}`}>
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {s.label}
    </span>
  );
}

function StatusDot({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES[STATUS.NA];
  return <span className={`inline-block w-2 h-2 rounded-full ${s.dot}`}></span>;
}

function SeverityBadge({ severity }) {
  const s = SEVERITY_STYLES[severity] || SEVERITY_STYLES.Informational;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs font-semibold ${s.bg} ${s.text} ${s.border}`}>
      {severity}
    </span>
  );
}

function MonoChip({ children, muted = false }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border font-mono text-xs ${muted ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-slate-100 border-slate-200 text-slate-800"}`}>
      {children}
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children, subtitle, right }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
      <div>
        <h2 className="text-base font-bold tracking-tight text-slate-900">{children}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function KV({ k, v, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <dt className="text-xs uppercase tracking-wider text-slate-500 font-semibold shrink-0 pt-0.5">{k}</dt>
      <dd className={`text-sm text-slate-900 text-right break-words ${mono ? "font-mono text-xs break-all" : ""}`}>{v}</dd>
    </div>
  );
}

function EvidenceLine({ children }) {
  return (
    <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md p-2 font-mono leading-relaxed break-words">
      <ScrollText className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
      <span className="min-w-0 break-all">{children}</span>
    </div>
  );
}

/* ============================================================================
 * 7. MAIN COMPONENT
 * ========================================================================= */
const TABS = [
  { id: "overview",   label: "Audit Overview" },
  { id: "register",   label: "Change Register" },
  { id: "findings",   label: "Findings" },
  { id: "controls",   label: "Control Panels" }
];

export default function ChangeManagementDashboard() {
  const vm = useMemo(() => buildViewModel(RAW), []);
  const [tab, setTab] = useState("overview");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const metrics = useMemo(() => {
    const all = vm.changes.flatMap(c => Object.values(c.controls));
    const met     = all.filter(c => c.status === STATUS.MET).length;
    const notMet  = all.filter(c => c.status === STATUS.NOT_MET).length;
    const review  = all.filter(c => c.status === STATUS.REVIEW).length;
    const high    = all.filter(c => c.severity === "High" && c.status === STATUS.NOT_MET).length;
    const changesMet     = vm.changes.filter(c => c.overall === STATUS.MET).length;
    const changesNotMet  = vm.changes.filter(c => c.overall === STATUS.NOT_MET).length;
    const changesReview  = vm.changes.filter(c => c.overall === STATUS.REVIEW).length;
    return {
      totalChanges: vm.changes.length,
      totalControls: all.length,
      met, notMet, review, high,
      changesMet, changesNotMet, changesReview,
      complianceScore: Math.round((met / all.length) * 100)
    };
  }, [vm]);

  const filtered = useMemo(() => vm.changes.filter(c => {
    if (statusFilter !== "all" && c.overall !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.key.toLowerCase().includes(q) &&
          !c.title.toLowerCase().includes(q) &&
          !(c.businessService || "").toLowerCase().includes(q) &&
          !(c.requester || "").toLowerCase().includes(q)) return false;
    }
    return true;
  }), [vm.changes, search, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-slate-900">YaaraLabs</span>
              <span className="text-slate-300">/</span>
              <span className="text-sm text-slate-600">Audit Console</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
              <ClipboardList className="w-3 h-3" />
              {RAW._metadata.audit_engagement}
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
              {RAW._metadata.organization}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 font-medium">
              <Calendar className="w-3 h-3" />
              Q1 2026 · evidence pulled {fmtDateShort(RAW._metadata.generated_at)}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb + title */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <span>Engagement</span>
            <ChevronRight className="w-3 h-3" />
            <span>IT General Controls</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-medium">Module B · Change Management & Release Controls</span>
          </div>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Change Management & Release Controls</h1>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
                Quarterly review of production changes against five control families — approval workflow, developer-to-production segregation, pre-deployment testing, change-freeze adherence, and rollback capability. Every Met / Not Met assessment below is linked to its source collector evidence.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm">
                <Download className="w-4 h-4" /> Export evidence pack
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm">
                <FileText className="w-4 h-4" /> Generate audit memo
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
                  tab === t.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}>
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="pb-16">
          {tab === "overview" && <OverviewTab vm={vm} metrics={metrics} onOpen={setSelected} />}
          {tab === "register" && <RegisterTab changes={filtered} total={vm.changes.length} search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onOpen={setSelected} />}
          {tab === "findings" && <FindingsTab vm={vm} onOpen={setSelected} />}
          {tab === "controls" && <ControlsTab vm={vm} onOpen={setSelected} />}
        </div>
      </main>

      {selected && <ChangeDrawer change={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ============================================================================
 * 8. OVERVIEW TAB  (Audit Overview + Control Status Summary)
 * ========================================================================= */
function OverviewTab({ vm, metrics, onOpen }) {
  // Compute per-family Met / Not Met / Review counts across all changes
  const familyStats = CONTROL_FAMILIES.map(fam => {
    const counts = { [STATUS.MET]: 0, [STATUS.NOT_MET]: 0, [STATUS.REVIEW]: 0 };
    vm.changes.forEach(c => {
      const r = c.controls[fam.id];
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    const total = vm.changes.length;
    return { ...fam, counts, total };
  });

  // Highest-severity Not Met findings for quick read
  const topFindings = vm.changes
    .flatMap(c => Object.entries(c.controls).map(([famId, r]) => ({ change: c, famId, ...r })))
    .filter(f => f.status === STATUS.NOT_MET)
    .sort((a, b) => (b.severity === "High" ? 1 : 0) - (a.severity === "High" ? 1 : 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryCard icon={Package}       label="Changes reviewed"   value={metrics.totalChanges}  sub="Q1 2026 in-scope" />
        <SummaryCard icon={ClipboardCheck} label="Controls evaluated" value={metrics.totalControls} sub={`${CONTROL_FAMILIES.length} families × ${metrics.totalChanges} changes`} />
        <SummaryCard icon={CheckCircle2}  label="Met"                value={metrics.met}           sub={`${metrics.complianceScore}% of controls`} accent="emerald" />
        <SummaryCard icon={XCircle}       label="Not Met"            value={metrics.notMet}        sub={`${metrics.changesNotMet} of ${metrics.totalChanges} changes`} accent={metrics.notMet > 0 ? "red" : "slate"} />
        <SummaryCard icon={AlertTriangle} label="Requires review"    value={metrics.review}        sub={`${metrics.changesReview} of ${metrics.totalChanges} changes`} accent={metrics.review > 0 ? "amber" : "slate"} />
        <SummaryCard icon={ShieldAlert}   label="High-severity"      value={metrics.high}          sub="open findings" accent={metrics.high > 0 ? "red" : "slate"} />
      </div>

      {/* Control Status Summary */}
      <Card className="p-6">
        <SectionTitle subtitle="How each control family performs across all Q1 changes. Click a family to see per-change detail.">
          Control Status Summary
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {familyStats.map(fam => {
            const Icon = fam.icon;
            const allMet = fam.counts[STATUS.NOT_MET] === 0 && fam.counts[STATUS.REVIEW] === 0;
            const anyNotMet = fam.counts[STATUS.NOT_MET] > 0;
            const roll = anyNotMet ? STATUS.NOT_MET : (fam.counts[STATUS.REVIEW] > 0 ? STATUS.REVIEW : STATUS.MET);
            const s = STATUS_STYLES[roll];
            return (
              <div key={fam.id} className={`rounded-xl border p-4 ${s.bg} ${s.border}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white border ${s.border}`}>
                    <Icon className="w-4 h-4 text-slate-700" />
                  </div>
                  <StatusPill status={roll} />
                </div>
                <div className="text-sm font-bold text-slate-900 leading-tight">{fam.label}</div>
                <div className="mt-3 space-y-1.5">
                  <StatRow label="Met" value={fam.counts[STATUS.MET]} total={fam.total} tone="emerald" />
                  {fam.counts[STATUS.REVIEW] > 0 && <StatRow label="Requires review" value={fam.counts[STATUS.REVIEW]} total={fam.total} tone="amber" />}
                  {fam.counts[STATUS.NOT_MET] > 0 && <StatRow label="Not Met" value={fam.counts[STATUS.NOT_MET]} total={fam.total} tone="red" />}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top findings */}
        <Card className="p-6 lg:col-span-2">
          <SectionTitle subtitle="The most significant Not Met findings across in-scope changes" right={<span className="text-xs text-slate-500">{topFindings.length} shown</span>}>
            Priority findings for auditor attention
          </SectionTitle>
          {topFindings.length === 0 ? (
            <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-emerald-800">No Not Met findings across the in-scope change set.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {topFindings.map((f, i) => {
                const fam = CONTROL_FAMILIES.find(x => x.id === f.famId);
                return (
                  <button key={i} onClick={() => onOpen(f.change)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-colors">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                          <fam.icon className="w-4 h-4 text-red-700" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <MonoChip>{f.change.key}</MonoChip>
                            <SeverityBadge severity={f.severity} />
                            <span className="text-xs text-slate-500">{fam.label}</span>
                          </div>
                          <div className="text-sm font-semibold text-slate-900 truncate">{f.change.title}</div>
                          <div className="text-xs text-slate-600 mt-0.5">{f.reason}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* Evidence sources */}
        <Card className="p-6">
          <SectionTitle subtitle="Collectors feeding this audit">Evidence sources</SectionTitle>
          <div className="space-y-2">
            <SourceRow name="Change Requests" api="jira · /rest/api/3/search" count={`${RAW.change_request_collector.issues.length} issues`} />
            <SourceRow name="Pull Requests"   api="github · pulls.list"       count={`${RAW.pull_request_collector.pull_requests.length} PRs`} />
            <SourceRow name="CI/CD Runs"      api="github · actions.workflow_runs" count={`${RAW.cicd_evidence_collector.workflow_runs.length} runs`} />
            <SourceRow name="Deployments"     api="argocd · codedeploy"       count={`${RAW.deployment_activity_collector.deployments.length} events`} />
            <SourceRow name="Freeze Windows"  api="internal · policy"         count={`${RAW.freeze_window_collector.freeze_windows.length} windows · ${RAW.freeze_window_collector.exceptions.length} exceptions`} />
            <SourceRow name="Rollback Records" api="internal · release-md"    count={`${RAW.rollback_evidence_collector.records.length} records`} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatRow({ label, value, total, tone }) {
  const tones = {
    emerald: "bg-emerald-600",
    amber: "bg-amber-600",
    red: "bg-red-600",
  };
  const pct = total ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-0.5">
        <span className="text-slate-600">{label}</span>
        <span className="font-mono tabular-nums text-slate-700">{value}<span className="text-slate-400">/{total}</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-white border border-slate-200 overflow-hidden">
        <div className={`h-full ${tones[tone]} rounded-full`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, accent = "slate" }) {
  const accents = {
    slate:   "bg-slate-100 text-slate-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber:   "bg-amber-100 text-amber-600",
    red:     "bg-red-100 text-red-600",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accents[accent]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function SourceRow({ name, api, count }) {
  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-900">{name}</div>
        <div className="text-xs text-slate-500 font-mono truncate">{api}</div>
      </div>
      <span className="text-xs text-slate-600 font-medium shrink-0 tabular-nums">{count}</span>
    </div>
  );
}

/* ============================================================================
 * 9. REGISTER TAB  (Change Register Table)
 * ========================================================================= */
function RegisterTab({ changes, total, search, setSearch, statusFilter, setStatusFilter, onOpen }) {
  const filters = [
    { id: "all", label: "All" },
    { id: STATUS.MET, label: "Met" },
    { id: STATUS.NOT_MET, label: "Not Met" },
    { id: STATUS.REVIEW, label: "Requires Review" },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search change ID, title, service, or requester…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200">
          {filters.map(f => (
            <button key={f.id} onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === f.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 tabular-nums ml-auto">
          {changes.length} / {total} changes
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <Th>Change</Th>
              <Th>Type</Th>
              <Th>Requester</Th>
              <Th>Approver</Th>
              <Th>Environment · Deployed</Th>
              <Th align="center">Controls</Th>
              <Th>Overall audit status</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {changes.map(c => {
              const met = Object.values(c.controls).filter(x => x.status === STATUS.MET).length;
              const notMet = Object.values(c.controls).filter(x => x.status === STATUS.NOT_MET).length;
              const review = Object.values(c.controls).filter(x => x.status === STATUS.REVIEW).length;
              return (
                <tr key={c.key} onClick={() => onOpen(c)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-2 mb-1">
                      <MonoChip>{c.key}</MonoChip>
                      {c.emergency && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold uppercase bg-red-100 text-red-800 border border-red-200">Emergency</span>}
                      <SeverityBadge severity={c.priority === "Critical" ? "Critical" : c.priority === "High" ? "High" : c.priority === "Medium" ? "Medium" : "Low"} />
                    </div>
                    <div className="text-sm font-semibold text-slate-900 leading-snug">{c.title}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{c.businessService}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-slate-700">{c.type}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="text-sm text-slate-900">{prettyUser(c.requester)}</div>
                    <div className="text-xs text-slate-500 font-mono">{c.requester}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    {c.cabApprover ? (
                      <div>
                        <div className="text-sm text-slate-900">{prettyUser(c.cabApprover)}</div>
                        <div className="text-xs text-slate-500">{fmtDateShort(c.cabApprovedAt)}</div>
                      </div>
                    ) : <span className="text-xs text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {c.deployEnvironment ? (
                      <div>
                        <div className="text-sm font-semibold text-slate-900 uppercase tracking-wide">{c.deployEnvironment}</div>
                        <div className="text-xs text-slate-500">{fmtDateShort(c.deployTimestamp)}</div>
                      </div>
                    ) : <span className="text-xs text-slate-400">not deployed</span>}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold tabular-nums">
                        <CheckCircle2 className="w-3 h-3" />{met}
                      </span>
                      {review > 0 && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold tabular-nums">
                        <AlertTriangle className="w-3 h-3" />{review}
                      </span>}
                      {notMet > 0 && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-xs font-semibold tabular-nums">
                        <XCircle className="w-3 h-3" />{notMet}
                      </span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusPill status={c.overall} />
                  </td>
                  <td className="px-4 py-3 align-top"><ChevronRight className="w-4 h-4 text-slate-400" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {changes.length === 0 && (
          <div className="p-12 text-center text-sm text-slate-500">No changes match the current filter.</div>
        )}
      </div>
    </Card>
  );
}

function Th({ children, align = "left" }) {
  return <th className={`text-${align} font-semibold text-slate-600 text-xs uppercase tracking-wider px-4 py-3`}>{children}</th>;
}

/* ============================================================================
 * 10. FINDINGS TAB  (Not Met + Met + Requires Review)
 * ========================================================================= */
function FindingsTab({ vm, onOpen }) {
  const [mode, setMode] = useState("not_met");

  const flat = vm.changes.flatMap(c =>
    Object.entries(c.controls).map(([famId, r]) => ({ change: c, famId, ...r }))
  );

  const notMet  = flat.filter(f => f.status === STATUS.NOT_MET);
  const review  = flat.filter(f => f.status === STATUS.REVIEW);
  const met     = flat.filter(f => f.status === STATUS.MET);

  const current = mode === "not_met" ? notMet : mode === "review" ? review : met;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <FindingsToggle mode={mode} setMode={setMode} counts={{ not_met: notMet.length, review: review.length, met: met.length }} />
      </div>

      {current.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-sm text-slate-500">No items to show.</div>
        </Card>
      ) : (
        <div className="space-y-3">
          {current.map((f, i) => {
            const fam = CONTROL_FAMILIES.find(x => x.id === f.famId);
            const s = STATUS_STYLES[f.status];
            return (
              <button key={i} onClick={() => onOpen(f.change)}
                className={`w-full text-left rounded-xl border ${s.border} bg-white hover:shadow-md transition-shadow p-4`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-9 h-9 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center shrink-0`}>
                      <fam.icon className={`w-4 h-4 ${s.text}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <MonoChip>{f.change.key}</MonoChip>
                        <StatusPill status={f.status} />
                        {f.status !== STATUS.MET && <SeverityBadge severity={f.severity} />}
                        <span className="text-xs text-slate-500 font-medium">{fam.label}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mb-1">{f.change.title}</div>
                      <div className="text-sm text-slate-700 mb-2">{f.reason}</div>
                      {f.subControls.length > 0 && (
                        <div className="space-y-1.5 mt-2">
                          {f.subControls.map((sc, j) => (
                            <div key={j} className="flex items-start gap-2 text-xs">
                              <StatusDot status={sc.status} />
                              <div className="min-w-0 flex-1">
                                <span className="font-medium text-slate-800">{sc.label}</span>
                                <div className="text-slate-500 font-mono break-all mt-0.5">{sc.evidence}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FindingsToggle({ mode, setMode, counts }) {
  const opts = [
    { id: "not_met", label: "Not Met", count: counts.not_met, tone: "red" },
    { id: "review",  label: "Requires Review", count: counts.review, tone: "amber" },
    { id: "met",     label: "Met", count: counts.met, tone: "emerald" },
  ];
  const toneStyles = {
    red:     "bg-red-50 border-red-200 text-red-700",
    amber:   "bg-amber-50 border-amber-200 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  };
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200">
      {opts.map(o => {
        const active = mode === o.id;
        return (
          <button key={o.id} onClick={() => setMode(o.id)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}>
            <span>{o.label}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs font-bold tabular-nums border ${active ? toneStyles[o.tone] : "bg-slate-200 border-slate-300 text-slate-700"}`}>{o.count}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================================
 * 11. CONTROLS TAB  (5 control family panels)
 * ========================================================================= */
function ControlsTab({ vm, onOpen }) {
  const [panel, setPanel] = useState("approval");
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {CONTROL_FAMILIES.map(f => {
          const Icon = f.icon;
          const active = panel === f.id;
          return (
            <button key={f.id} onClick={() => setPanel(f.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                active ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}>
              <Icon className="w-4 h-4" />
              {f.short}
            </button>
          );
        })}
      </div>

      {panel === "approval" && <ApprovalPanel vm={vm} onOpen={onOpen} />}
      {panel === "sod"      && <SoDPanel vm={vm} onOpen={onOpen} />}
      {panel === "testing"  && <TestingPanel vm={vm} onOpen={onOpen} />}
      {panel === "freeze"   && <FreezePanel vm={vm} onOpen={onOpen} />}
      {panel === "rollback" && <RollbackPanel vm={vm} onOpen={onOpen} />}
    </div>
  );
}

function ControlRow({ change, status, left, right, onOpen }) {
  const s = STATUS_STYLES[status];
  return (
    <button onClick={() => onOpen(change)}
      className={`w-full text-left p-3 rounded-lg border ${s.border} bg-white hover:shadow-sm transition-shadow flex items-center justify-between gap-3 flex-wrap`}>
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <MonoChip>{change.key}</MonoChip>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{change.title}</div>
          <div className="text-xs text-slate-500 mt-0.5">{left}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {right}
        <StatusPill status={status} />
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </button>
  );
}

function ApprovalPanel({ vm, onOpen }) {
  const normals = vm.changes.filter(c => !c.emergency);
  const emergencies = vm.changes.filter(c => c.emergency);
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <SectionTitle subtitle="Normal changes — every change must pass CAB (or equivalent) before deployment">CAB approval — normal changes</SectionTitle>
        <div className="space-y-2">
          {normals.map(c => (
            <ControlRow key={c.key} change={c} status={c.controls.approval.status}
              onOpen={onOpen}
              left={`Approver: ${prettyUser(c.cabApprover)} · ${fmtDateShort(c.cabApprovedAt)}`}
              right={<MonoChip muted>{c.controls.approval.subControls[0]?.evidence.split("·")[0].trim()}</MonoChip>}
            />
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <SectionTitle subtitle={`Emergency changes require post-hoc CAB review within ${EMERGENCY_CAB_HOURS} hours of deployment`}>
          CAB post-hoc review — emergency changes
        </SectionTitle>
        {emergencies.length === 0 ? (
          <div className="text-sm text-slate-500">No emergency changes in scope.</div>
        ) : (
          <div className="space-y-2">
            {emergencies.map(c => {
              const hours = c.cabApprovedAt ? hoursBetween(c.createdAt, c.cabApprovedAt) : null;
              return (
                <ControlRow key={c.key} change={c} status={c.controls.approval.status}
                  onOpen={onOpen}
                  left={`Raised ${fmtDate(c.createdAt)} · CAB ${fmtDate(c.cabApprovedAt)}`}
                  right={<span className={`text-xs font-mono px-2 py-0.5 rounded ${hours != null && hours <= EMERGENCY_CAB_HOURS ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {hours != null ? `${hours.toFixed(1)}h elapsed` : "no CAB"}
                  </span>}
                />
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function SoDPanel({ vm, onOpen }) {
  const productionDeploys = vm.changes.filter(c => c.deployEnvironment === "prod");
  return (
    <Card className="p-6">
      <SectionTitle subtitle="A code author should not be the identity that executes the production deployment">
        Developer-to-Production Segregation
      </SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-y border-slate-200">
            <tr>
              <Th>Change</Th>
              <Th>PR author</Th>
              <Th>Deployed by (identity)</Th>
              <Th>Command actor</Th>
              <Th>SoD result</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productionDeploys.map(c => (
              <tr key={c.key} onClick={() => onOpen(c)} className="hover:bg-slate-50 cursor-pointer">
                <td className="px-4 py-3"><MonoChip>{c.key}</MonoChip>
                  <div className="text-xs text-slate-500 mt-1 truncate">{c.title}</div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-700 font-mono">{c.prAuthor || "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-700 font-mono">{c.deployedBy || "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-700 font-mono">{c.deployCommandActor || "—"}</td>
                <td className="px-4 py-3"><StatusPill status={c.controls.sod.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TestingPanel({ vm, onOpen }) {
  const gateLabels = {
    unit_tests: "Unit",
    integration_tests: "Integration",
    uat_signoff: "UAT",
    security_scan: "SAST/DAST"
  };
  return (
    <Card className="p-6">
      <SectionTitle subtitle="Unit, integration, UAT, and security-scan evidence must be present for every prod deployment">
        Pre-deployment Testing Evidence
      </SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-y border-slate-200">
            <tr>
              <Th>Change</Th>
              <Th>Pipeline run</Th>
              {REQUIRED_GATES.map(g => <Th key={g} align="center">{gateLabels[g]}</Th>)}
              <Th>Result</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vm.changes.map(c => (
              <tr key={c.key} onClick={() => onOpen(c)} className="hover:bg-slate-50 cursor-pointer">
                <td className="px-4 py-3"><MonoChip>{c.key}</MonoChip>
                  <div className="text-xs text-slate-500 mt-1 truncate">{c.title}</div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 font-mono">{c.runId || "—"}</td>
                {REQUIRED_GATES.map(g => {
                  const s = c.gateStatus[g];
                  return (
                    <td key={g} className="px-4 py-3 text-center">
                      {s.present
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                        : <XCircle className="w-4 h-4 text-red-600 inline-block" />}
                    </td>
                  );
                })}
                <td className="px-4 py-3"><StatusPill status={c.controls.testing.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function FreezePanel({ vm, onOpen }) {
  const inFreeze = vm.changes.filter(c => c.freezeHit);
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <SectionTitle subtitle="Declared change-freeze windows covering the audit period">Freeze windows in effect</SectionTitle>
        <div className="space-y-2">
          {vm.freezeWindows.map(w => (
            <div key={w.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <MonoChip>{w.id}</MonoChip>
                <span className="text-sm font-semibold text-slate-900">{w.label}</span>
              </div>
              <div className="text-xs text-slate-600 font-mono">{fmtDate(w.start)} → {fmtDate(w.end)} · envs: {w.applicable_environments.join(", ")}</div>
              <div className="text-xs text-slate-500 mt-1">{w.reason}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <SectionTitle subtitle="Changes deployed during a freeze window — exception approval required">
          Deployments during freeze windows
        </SectionTitle>
        {inFreeze.length === 0 ? (
          <div className="text-sm text-slate-500">No deployments intersected a declared freeze window.</div>
        ) : (
          <div className="space-y-2">
            {inFreeze.map(c => (
              <ControlRow key={c.key} change={c} status={c.controls.freeze.status}
                onOpen={onOpen}
                left={`${c.freezeHit.label} · deployed ${fmtDate(c.deployTimestamp)}`}
                right={c.freezeException
                  ? <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Exception {c.freezeException.id}</span>
                  : <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">No exception</span>
                }
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function RollbackPanel({ vm, onOpen }) {
  return (
    <Card className="p-6">
      <SectionTitle subtitle="Every change must have a documented rollback plan validated in pre-production">
        Rollback Readiness
      </SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-y border-slate-200">
            <tr>
              <Th>Change</Th>
              <Th align="center">Plan documented</Th>
              <Th align="center">Validated in pre-prod</Th>
              <Th>Evidence reference</Th>
              <Th>Result</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vm.changes.map(c => (
              <tr key={c.key} onClick={() => onOpen(c)} className="hover:bg-slate-50 cursor-pointer">
                <td className="px-4 py-3"><MonoChip>{c.key}</MonoChip>
                  <div className="text-xs text-slate-500 mt-1 truncate">{c.title}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  {c.rollbackPlanPresent
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                    : <XCircle className="w-4 h-4 text-red-600 inline-block" />}
                </td>
                <td className="px-4 py-3 text-center">
                  {c.rollbackTested === true
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                    : c.rollbackTested === false
                    ? <AlertTriangle className="w-4 h-4 text-amber-600 inline-block" />
                    : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 font-mono truncate max-w-xs">{c.rollbackEvidenceRef || "—"}</td>
                <td className="px-4 py-3"><StatusPill status={c.controls.rollback.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ============================================================================
 * 12. CHANGE DRAWER  (per-change evidence-backed audit view)
 * ========================================================================= */
function ChangeDrawer({ change, onClose }) {
  const c = change;
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30" onClick={onClose}></div>
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-3xl bg-white shadow-2xl z-40 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 z-10">
          <div className="px-6 py-4 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <MonoChip>{c.key}</MonoChip>
                <StatusPill status={c.overall} size="md" />
                {c.emergency && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase bg-red-100 text-red-800 border border-red-200">Emergency</span>}
                <SeverityBadge severity={c.priority === "Critical" ? "Critical" : c.priority === "High" ? "High" : c.priority === "Medium" ? "Medium" : "Low"} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{c.title}</h2>
              <div className="text-sm text-slate-500 mt-1">{c.type} · {c.businessService} · target environments: {c.environmentsTargeted.join(", ")}</div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 shrink-0">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Control-by-control summary */}
          <DrawerSection icon={ClipboardCheck} title="Control-by-control assessment">
            <div className="space-y-3">
              {CONTROL_FAMILIES.map(fam => {
                const r = c.controls[fam.id];
                const s = STATUS_STYLES[r.status];
                const Icon = fam.icon;
                return (
                  <div key={fam.id} className={`rounded-lg border ${s.border} ${s.bg} p-4`}>
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg bg-white border ${s.border} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-slate-700" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">{fam.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={r.severity} />
                        <StatusPill status={r.status} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{r.reason}</p>
                    {r.subControls.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {r.subControls.map((sc, i) => (
                          <div key={i} className="bg-white rounded-md border border-slate-200 p-2.5">
                            <div className="flex items-center gap-2 mb-1">
                              <StatusDot status={sc.status} />
                              <span className="text-xs font-semibold text-slate-800">{sc.label}</span>
                              <span className={`ml-auto text-xs font-semibold ${STATUS_STYLES[sc.status].text}`}>{STATUS_STYLES[sc.status].label}</span>
                            </div>
                            <div className="text-xs text-slate-600 font-mono break-all">{sc.evidence}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </DrawerSection>

          {/* Change request evidence */}
          <DrawerSection icon={FileText} title="Change request (Jira)">
            <dl>
              <KV k="Key" v={<MonoChip>{c.key}</MonoChip>} />
              <KV k="Type" v={c.type} />
              <KV k="Priority" v={c.priority} />
              <KV k="Emergency" v={c.emergency ? <span className="text-red-700 font-semibold">Yes</span> : "No"} />
              <KV k="Risk level" v={c.riskLevel} />
              <KV k="Requester" v={`${c.requesterDisplay} (${c.requester})`} />
              <KV k="Created" v={fmtDate(c.createdAt)} mono />
              <KV k="CAB approver" v={prettyUser(c.cabApprover) || "—"} />
              <KV k="CAB approved at" v={fmtDate(c.cabApprovedAt)} mono />
              <KV k="Resolution date" v={fmtDate(c.resolvedAt)} mono />
              <KV k="Target environments" v={c.environmentsTargeted.join(", ")} />
              <KV k="Business service" v={<MonoChip muted>{c.businessService}</MonoChip>} />
            </dl>
          </DrawerSection>

          {/* PR evidence */}
          {c.pr && (
            <DrawerSection icon={GitPullRequest} title="Code change (GitHub)">
              <dl>
                <KV k="Repository" v={<MonoChip muted>{c.repository}</MonoChip>} />
                <KV k="Pull request" v={<MonoChip muted>#{c.prNumber}</MonoChip>} />
                <KV k="Branch" v={<span className="font-mono text-xs">{c.pr.head.ref}</span>} />
                <KV k="Author" v={<span className="font-mono text-xs">{c.prAuthor}</span>} />
                <KV k="Reviewers" v={c.pr.reviews.map(r => r.user.login).join(", ") || "—"} />
                <KV k="Merged by" v={<span className="font-mono text-xs">{c.prMergedBy}</span>} />
                <KV k="Merged at" v={fmtDate(c.pr.merged_at)} mono />
                <KV k="Files changed" v={`${c.pr.changed_files} (+${c.pr.additions} / −${c.pr.deletions})`} />
              </dl>
            </DrawerSection>
          )}

          {/* CI/CD evidence */}
          {c.run && (
            <DrawerSection icon={Workflow} title="Pipeline evidence (CI/CD)">
              <div className="mb-3">
                <div className="text-xs text-slate-500 font-mono break-all">{c.run.html_url}</div>
                <div className="text-xs text-slate-500 mt-0.5">Triggered by <span className="font-mono">{c.run.triggering_actor.login}</span> · {fmtDate(c.run.run_started_at)} → {fmtDate(c.run.updated_at)}</div>
              </div>
              <div className="space-y-1.5">
                {c.run.stages.map((s, i) => {
                  const ok = s.conclusion === "success";
                  return (
                    <div key={i} className={`flex items-center justify-between gap-3 p-2.5 rounded-md border ${ok ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                          {s.notes && <div className="text-xs text-slate-600 mt-0.5">{s.notes}</div>}
                        </div>
                      </div>
                      <span className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{s.conclusion}</span>
                    </div>
                  );
                })}
              </div>
            </DrawerSection>
          )}

          {/* Deployment */}
          {c.dep && (
            <DrawerSection icon={Rocket} title="Production deployment">
              <dl>
                <KV k="Deployment ID" v={<MonoChip muted>{c.dep.id}</MonoChip>} />
                <KV k="Environment" v={<span className="font-semibold uppercase">{c.dep.environment}</span>} />
                <KV k="Release version" v={<span className="font-mono text-xs">{c.dep.release_version}</span>} />
                <KV k="Status" v={c.dep.status} />
                <KV k="Deployed_by (identity)" v={<span className="font-mono text-xs">{c.dep.deployed_by}</span>} />
                <KV k="Actor type" v={c.dep.actor_type} />
                <KV k="Command executed by" v={<span className="font-mono text-xs">{c.dep.command_executed_by}</span>} />
                <KV k="Timestamp" v={fmtDate(c.dep.timestamp)} mono />
                <KV k="Source IP" v={<span className="font-mono text-xs">{c.dep.source_ip}</span>} />
                <KV k="Artifact image" v={<span className="font-mono text-xs break-all">{c.dep.artifact.image}</span>} />
              </dl>
            </DrawerSection>
          )}

          {/* Freeze context */}
          {(c.freezeHit || c.freezeException) && (
            <DrawerSection icon={Snowflake} title="Freeze window evaluation">
              {c.freezeHit ? (
                <>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 mb-3">
                    <div className="flex items-center gap-2 mb-1"><MonoChip>{c.freezeHit.id}</MonoChip><span className="text-sm font-semibold text-slate-900">{c.freezeHit.label}</span></div>
                    <div className="text-xs text-slate-600 font-mono">{fmtDate(c.freezeHit.start)} → {fmtDate(c.freezeHit.end)}</div>
                    <div className="text-xs text-slate-500 mt-1">{c.freezeHit.reason}</div>
                  </div>
                  {c.freezeException ? (
                    <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                      <div className="flex items-center gap-2 mb-1"><ShieldCheck className="w-4 h-4 text-emerald-600" /><span className="text-sm font-semibold text-emerald-800">Exception approved</span></div>
                      <dl>
                        <KV k="Exception ID" v={<MonoChip muted>{c.freezeException.id}</MonoChip>} />
                        <KV k="Approver" v={prettyUser(c.freezeException.approver)} />
                        <KV k="Approved at" v={fmtDate(c.freezeException.approved_at)} mono />
                        <KV k="Justification" v={<span className="text-xs">{c.freezeException.justification}</span>} />
                      </dl>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-red-200 bg-red-50">
                      <div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-600" /><span className="text-sm font-semibold text-red-800">No exception record found for this deployment</span></div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-800">Deployment did not fall inside any declared freeze window.</span>
                </div>
              )}
            </DrawerSection>
          )}

          {/* Rollback */}
          {c.rollback && (
            <DrawerSection icon={Undo2} title="Rollback evidence">
              <dl>
                <KV k="Plan documented" v={c.rollback.rollback_plan_present ? "Yes" : <span className="text-red-700 font-semibold">No</span>} />
                {c.rollback.rollback_plan_present && (
                  <>
                    <KV k="Steps" v={<span className="text-xs">{c.rollback.rollback_steps}</span>} />
                    <KV k="Validated in pre-prod" v={c.rollback.rollback_tested ? "Yes" : <span className="text-amber-700 font-semibold">No</span>} />
                    <KV k="Tested in" v={c.rollback.rollback_tested_in || "—"} />
                    <KV k="Tested at" v={fmtDate(c.rollback.rollback_tested_at)} mono />
                    <KV k="Validator" v={c.rollback.rollback_validator || "—"} />
                    <KV k="Evidence ref" v={<span className="font-mono text-xs break-all">{c.rollback.evidence_reference || "—"}</span>} />
                  </>
                )}
                {c.rollback.notes && <KV k="Notes" v={<span className="text-xs text-amber-700">{c.rollback.notes}</span>} />}
              </dl>
            </DrawerSection>
          )}

          {/* Raw collector payloads */}
          <DrawerSection icon={ScrollText} title="Raw collector payloads">
            <div className="space-y-2">
              <RawBlock title="change_request_collector.issues[] entry" payload={c.issue} />
              {c.pr && <RawBlock title="pull_request_collector.pull_requests[] entry" payload={c.pr} />}
              {c.run && <RawBlock title="cicd_evidence_collector.workflow_runs[] entry" payload={c.run} />}
              {c.dep && <RawBlock title="deployment_activity_collector.deployments[] entry" payload={c.dep} />}
              {c.freezeHit && <RawBlock title="freeze_window_collector.freeze_windows[] entry" payload={c.freezeHit} />}
              {c.freezeException && <RawBlock title="freeze_window_collector.exceptions[] entry" payload={c.freezeException} />}
              {c.rollback && <RawBlock title="rollback_evidence_collector.records[] entry" payload={c.rollback} />}
            </div>
          </DrawerSection>
        </div>
      </div>
    </>
  );
}

function DrawerSection({ icon: Icon, title, children }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-600">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-sm font-bold tracking-tight text-slate-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function RawBlock({ title, payload }) {
  return (
    <details className="rounded-lg border border-slate-200 bg-slate-50">
      <summary className="px-3 py-2 cursor-pointer text-xs font-mono text-slate-700 font-semibold">{title}</summary>
      <pre className="px-3 pb-3 text-xs leading-relaxed text-slate-700 overflow-x-auto font-mono">{JSON.stringify(payload, null, 2)}</pre>
    </details>
  );
}
