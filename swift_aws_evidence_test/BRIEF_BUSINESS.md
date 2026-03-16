# SWIFT AWS Evidence — Brief (Business View)

## What we’re doing

We’re building a way to **prove your AWS environment meets SWIFT 2026 controls** by automatically **gathering evidence from AWS**, **storing it in one place**, and **showing it per control** so you (and auditors) can see what’s in place.

---

## How the approach has gone so far

1. **Define what evidence is needed**  
   We aligned to the SWIFT 2026 framework and the SWIFT–AWS evidence sheet: which controls (e.g. access, encryption, logging) need which kinds of proof (e.g. user lists, backup config, trail status).

2. **Decide where evidence lives**  
   We chose to pull proof from **AWS** (your cloud) and keep a **record of what was collected** in our own system (database in GCP), with the **actual evidence files** stored in **AWS S3** so they’re auditable and tamper‑aware (hashes stored).

3. **Automate the pull from AWS**  
   We built **14 automated “collectors”** that log into your AWS account (with the credentials you provide), call the right AWS APIs (e.g. IAM, Config, GuardDuty, backups, networking), and save the results as evidence. One button (“Fetch AWS evidence”) or one command runs them all.

4. **Store and link evidence to controls**  
   Each run is recorded (when, success/fail, how many evidence items). Each evidence item is linked to **which control(s)** it supports, so we can show “for Control 5.1, here is the evidence we have.”

5. **Present it simply**  
   A small web app lets you see runs, see evidence per control, see which AWS calls back each control, and open the actual evidence content. You can also add manual evidence (e.g. policy docs) for controls that aren’t fully automated yet.

6. **Make it runnable without manual setup**  
   On startup, the app creates the needed **database tables in GCP** and the **evidence bucket in AWS** if they don’t exist, so you don’t have to run SQL or create the bucket by hand.

---

## Where AWS integration stands today

- **Stage: in use and wired end‑to‑end.**

  - **Connection:** We use your AWS credentials (in config) to talk to your AWS account.
  - **Collection:** 14 collectors run inside your environment (one region today) and pull security and config data from AWS services (IAM, EC2, VPC, CloudTrail, Config, SSM, KMS, ACM, Backup, GuardDuty, Inspector, Secrets Manager, etc.).
  - **Storage:** Evidence files are written to **your AWS S3 bucket** (created automatically if missing); the app stores only metadata and hashes in our database.
  - **Usage:** You trigger collection from the UI or a command; the app then lists runs, shows evidence by control, and lets you open evidence content (served from S3). Per control, we show which AWS APIs were used to gather that evidence.

So: **AWS is integrated for evidence collection, storage (S3), and display** — we’re past “design” and “proof of concept” and into “working flow you can use for SWIFT 2026 evidence from AWS.”

---

## In one sentence

We automatically pull security and configuration evidence from your AWS account into a dedicated S3 bucket and our database, link it to SWIFT 2026 controls, and show it in a simple dashboard so you can see what’s been collected and what each control is backed by.
