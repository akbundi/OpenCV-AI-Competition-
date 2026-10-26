# RoadGuard — AWS integration and teammate handoff

## Purpose and current working status (2026-10-26)
RoadGuard is an OpenCV 5 + multi-country YOLOv8n road-damage inspector. The local vision agent samples video, detects damage with a global ONNX model, groups related image-space detections, calls additional frame-based OpenCV inference, compares sparse optical flow, and produces an auditable inspection trace for **human** review. This is an advisory inspection system, **not** a road-repair automation or a calibrated structural assessment.

**Verified by local terminal output:** 300 frames read, 60 initially sampled, 25 detection observations, 10 tentative candidate groups, 44 additional vision inferences, and 10 human-review events (4 candidate review; 2 possible camera artifacts; 4 uncertain). On held-out multi-country images (3,833 samples): precision 0.5857, recall 0.4815, mAP@50 0.5092, mAP@50–95 0.2518. Those test metrics do **not** measure real-world UK dashcam performance.

**Not yet deployed/validated:** AWS S3-to-Lambda pipeline, persistent human approval UI, hosted inference, COOL/Graviton.

## Ownership, access, and compliance
- Use an **authorized** AWS account. If this is an employer-owned account, obtain explicit employer/team authorization before deploying a personal hackathon project. Do **not** share root credentials, IAM access keys, or account passwords.
- Prefer an account/team member with permission to administer an isolated S3 bucket and Lambda. Assign narrowly scoped roles, MFA/SSO when possible, and set a billing budget alert.
- Keep S3 private: Block Public Access on, bucket-owner-enforced object ownership, SSE-S3 encryption.
- Do not upload raw RDD2022 datasets, road video containing bystanders/plates, or private road-frame evidence to a public GitHub repository. Respect source video license/consent and dataset/model licenses.
- If another person materially contributes to the project, follow competition team/member rules.

## Repository layout
```text
RoadGuard/
  opencv_detector.py               # OpenCV 5 / YOLO global ONNX detection
  video_detector.py                # video processing
  roadguard_agent.py               # global agent and structured trace
  aws_upload.py                    # S3 uploader (run on authorized AWS machine)
  lambda_roadguard_report.py       # AWS Lambda review summary generator
  package_roadguard_evidence.py    # package private evidence for teammate
  models/
    roadguard_global_yolov8n.onnx  # model expected by detector (~13 MB)
  output/agent_global/              # generated locally, NOT committed
  data/videos/                      # video input, NOT committed
```

## Target AWS flow
```text
Local / workstation with permitted video access
  OpenCV 5 + global YOLO ONNX + agent
       ↓ produces trace + original and annotated evidence
Private transfer of ZIP to authorized teammate
       ↓ uploads using aws_upload.py
S3 bucket (ap-south-1)
  incoming/<run_id>/evidence/*.jpg
  incoming/<run_id>/inspection_trace.json  <-- uploaded LAST
       ↓ ObjectCreated event filtered prefix incoming/ suffix inspection_trace.json
Lambda roadguard-generate-review-report
       ↓ builds ordered human review queue (no OpenCV inference on Lambda)
S3: reports/<run_id>/review_summary.json
       ↓ teammate downloads/reviews JSON; separate human review UI not implemented yet
```
The **OpenCV 5 workload currently runs locally**, and AWS executes server-side review-queue processing. Do not say OpenCV runs on AWS or that human approve/reject is hosted unless those capabilities are subsequently deployed and verified.

## Teammate deployment checklist (AWS Console path)
1. Sign into an **approved** AWS account; choose **Asia Pacific (Mumbai), `ap-south-1`** for all resources. Confirm you are allowed to create these resources and that a spend alert is in place.
2. S3 → Create bucket, uniquely named e.g. `roadguard-agent-<unique-id>`, same Region; general purpose, Block Public Access **on**, bucket-owner-enforced ownership, default encryption SSE-S3. No public website access needed.
3. IAM → Create Lambda execution role with trusted service `lambda.amazonaws.com`; attach AWS-managed `AWSLambdaBasicExecutionRole` for CloudWatch Logs; add the narrowly scoped inline policy from `lambda_s3_policy_template.json`, replacing `YOUR_BUCKET_NAME`. This role needs only read of `incoming/*/inspection_trace.json` and write to `reports/*`. S3 trigger permission is **separate** and is usually added when the trigger is created in the Lambda console.
4. Lambda → Create function `roadguard-generate-review-report`, Python 3.12 or supported newer version; `ap-south-1`, execution role above, handler `lambda_roadguard_report.lambda_handler`, memory ~256 MB, timeout ~30 seconds. Upload a ZIP with `lambda_roadguard_report.py` at the ZIP root or paste its code into `lambda_function.py` and change handler accordingly. The console-hosted Lambda runtime includes Boto3; for production, bundle and pin dependency versions.
5. In Lambda → Add trigger → S3 → choose bucket, event `All object create events`, prefix `incoming/`, suffix `inspection_trace.json`; acknowledge recursive invocation caution. Using the outgoing `reports/` prefix prevents this function from triggering itself. Bucket and Lambda **must** be in the same Region.
6. Test with **synthetic data first** or the private trace/evidence bundle. Once permission is granted to the teammate, run from cloned repo root:
   ```bash
   python -m pip install boto3
   python aws_upload.py --bucket YOUR_BUCKET_NAME --trace output/agent_global/inspection_trace.json --dry-run
   python aws_upload.py --bucket YOUR_BUCKET_NAME --trace output/agent_global/inspection_trace.json
   ```
   This uses the machine's configured AWS credential chain; never write credentials into Python code.
7. Confirm the script logs a successful `s3://.../incoming/<run_id>/inspection_trace.json` path, then verify `s3://.../reports/<run_id>/review_summary.json` exists. Check Lambda's CloudWatch log group `/aws/lambda/roadguard-generate-review-report` for errors. Download the JSON and verify the review queue contains **10 entries**, with status counts **4 / 2 / 4**, for the supplied existing sample trace.
8. Record evidence of the AWS deployment (AWS region, architecture, S3 object paths with identifiers redacted, sanitized Lambda/CloudWatch screenshot, summary JSON) for the judges. Do not post account numbers, private evidence, or credentials to GitHub.

## Passing the private agent evidence to the teammate
On the developer's machine (in the RoadGuard project root):
```powershell
python package_roadguard_evidence.py
```
This produces `roadguard_evidence_private.zip` containing the *trace and only its referenced evidence photos*, preserving relative paths. Send by an approved private channel, **not a public GitHub commit**. Teammate extracts the ZIP **at the root of their clone** so `output/agent_global/inspection_trace.json` and its relative image paths are recreated. Then run `aws_upload.py` as above. This avoids AWS access from the company laptop entirely.

## GitHub publishing
1. Create a GitHub repository named `roadguard-agentic-road-inspector` under the project owner's account (initially **private**). Invite teammate as collaborator if approved.
2. Append `roadguard_gitignore_additions.txt` contents to the existing `.gitignore` **before staging**. Check that `RDD2022`, `data`, `output`, `.env`, archives, access keys and private media are excluded. Keep the global ONNX file only if redistribution is allowed under applicable model/license terms.
3. From PowerShell, in the RoadGuard root:
   ```powershell
   git status
   git init                        # only if repository is not initialized
   git branch -M main
   git add .
   git diff --cached --name-only  # inspect carefully before committing
   git commit -m "RoadGuard global agent and AWS deployment handoff"
   git remote -v                  # check existing remote before adding
   git remote add origin https://github.com/YOUR_USERNAME/roadguard-agentic-road-inspector.git
   git push -u origin main
   ```
   If remote `origin` already exists, don't add it again; inspect the URL and use `git remote set-url origin ...` only if you intend to change it. GitHub password authentication isn't supported for Git over HTTPS; sign in using Git Credential Manager or an approved authenticated mechanism.
4. Check the remote repository via GitHub UI. For a private repo, ensure judges can access an archive/repository according to the competition rules; don't assume they can access a private repo automatically.

## Validation and limitations
- Local visual agent verification is **not** independent evidence of correct crack detections. Camera-fixed artifact classifier is heuristic, and grouping is tentative.
- Vision model on a held-out multi-country split: P .5857, R .4815, mAP50 .5092, mAP50–95 .2518. Do not interpret precision/recall as absolute on any unseen driving environment.
- S3 + Lambda handles **cloud-side review prioritization**. It is a real AWS processing component, but not hosted OpenCV, not a public web demo, and not a complete review UI.
- OpenCV 5 proof should be captured from local runtime output. If you later add hosted OpenCV, separately prove execution there.
- The optional COOL award requires real COOL execution on AWS Graviton, with comparative measurements. This setup alone does not qualify.

## Useful references
- Competition: https://opencv26.devpost.com/
- Official rules: https://opencv26.devpost.com/rules
- AWS S3 → Lambda: https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html
- AWS S3 notifications: https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html
- AWS Lambda Python deployment: https://docs.aws.amazon.com/lambda/latest/dg/python-package.html
