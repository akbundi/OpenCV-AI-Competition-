# RoadGuard — public AWS-hosted inspector

**This package adapts your attached Inspector Dashboard design** (IBM Plex typography, olive canvas, dark green logo, evidence queue, frame comparisons and decision trace). The original bundled mockup is preserved as `frontend/original_design_reference.html`. The working replacement is `frontend/index.html`, now driven by a FastAPI backend instead of simulated React state.

## What is REAL vs not yet verified

- The user uploads a video through an AWS-hosted HTML dashboard.
- The **EC2 instance** executes the existing `roadguard_agent.py` and global ONNX model using Python/OpenCV 5 on CPU. No GPU requirement.
- The agent saves original/annotated images and `inspection_trace.json` to a per-run server folder.
- The server uploads the source video, evidence images, and **inspection JSON last** into the existing private S3 bucket `roadguard-ai-mumbai-2026-123`. Your existing Lambda S3 trigger creates `reports/<run-id>/review_summary.json`.
- The web server reads the Lambda report from S3 and shows candidate classes, bounding boxes, scores, frame support, and agent tool trace.
- Review decisions are written to `reviews/<run-id>/decisions.json` in S3, with history.
- Nothing in this ZIP is automatically deployed to your AWS account. Running the full video loop on your EC2 is required to verify hosting. Browser page alone is not inference.
- This is a **single-instance hackathon deployment**, not an autoscaling production backend. The last AWS Lambda you deployed remains your report generator; do **not** place OpenCV inference in that tiny Lambda.

## Merge into your existing Git repository

The output ZIP contains `backend/`, `frontend/`, `deploy/`, `requirements_public.txt`, and `.env.example`.

1. Extract ZIP to a temporary folder on your HP laptop.
2. Copy the directories/files to the **root** of your clone `C:\Users\HP\OpenCV-AI-Competition-` (the same folder as `roadguard_agent.py`).
3. Verify `models/roadguard_global_yolov8n.onnx` exists; the model must be uploaded to the EC2 host, e.g. via a private download or `scp` if not in your repository.
4. Commit *source code only* to the `roadguard-gayathri-2026` branch. Do not commit video, images, `.env`, private keys, or private inputs. `.gitignore` entries from this package must be **appended** to your existing `.gitignore` rather than overwrite it.

## AWS setup — Mumbai region, EC2 Ubuntu 24.04 LTS

### A. Give the EC2 machine its **own** IAM role

Create role in IAM → Roles → Create role → AWS service → **EC2**, name `roadguard-ec2-s3-role`. Attach a customer inline policy from `deploy/ec2_s3_policy.json`. This role is **different** from the Lambda execution role. No access keys are embedded in code. Attach the EC2 role in the EC2 launch wizard Advanced details → IAM instance profile. Existing EC2: Actions → Security → Modify IAM role. Keep the S3 bucket private.

### B. Launch the cloud CPU

EC2 → Launch instance: Ubuntu Server 24.04 LTS, **x86_64** (not ARM unless you've tested your dependencies), `t3.large` **only if your account permits and you accept the on-demand charge** (2 vCPU, 8GB; CPU inference will be slower than GPU). In some accounts `m7i-flex.large` may also be eligible for credits; verify instance eligibility and pricing before launch. Disk: >=20GB gp3. Region: `ap-south-1`.

Security group inbound: HTTP **80** from public only for a temporary connectivity smoke test; SSH **22** only from *your own public IP*; **do not** expose port 8000. For a public demo with uploaded private video, configure HTTPS (443) and avoid sending a demo access code over HTTP. Set a budget alarm and stop instance after judging. If your account cannot launch that instance type, don't blindly upgrade your plan.

### C. Install Python on Ubuntu and pull your project

Log into the EC2 Ubuntu host with SSH or the EC2 console. Run:

```bash
sudo apt-get update
sudo apt-get install -y git python3 python3-venv python3-pip nginx libgl1 libglib2.0-0
cd /home/ubuntu
git clone -b roadguard-gayathri-2026 https://github.com/akbundi/OpenCV-AI-Competition-.git roadguard
cd roadguard
```

Ensure the **new** dashboard package files are committed to the repo. If the repo is private, authenticate using an approved GitHub deploy token or upload a source ZIP with `scp`; do not paste secrets into shell commands.

```bash
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/pip install -r requirements_public.txt
.venv/bin/python -c 'import cv2; print(cv2.__version__)'
ls -lh models/roadguard_global_yolov8n.onnx
```

You should see OpenCV version **5.0.0** and the ONNX file at the path that `opencv_detector.py` expects. `opencv-python-headless==5.0.0.93` includes OpenCV 5 on Linux. If the project requires other local dependencies, install them into the same venv.

Create a **random** demo access code using `python3 -c 'import secrets; print(secrets.token_urlsafe(22))'`. Configure `/home/ubuntu/roadguard/.env` using `.env.example`. Ensure it is readable only by the Ubuntu user: `chmod 600 .env`. Never commit this file or put the code directly into frontend HTML.

### D. Start web API as a background system service

```bash
sudo cp deploy/roadguard.service /etc/systemd/system/roadguard.service
sudo systemctl daemon-reload
sudo systemctl enable --now roadguard
sudo systemctl status roadguard --no-pager
curl http://127.0.0.1:8000/api/health
```

For temporary HTTP smoke testing:

```bash
sudo cp deploy/nginx_rate.conf /etc/nginx/conf.d/roadguard_rate.conf
sudo cp deploy/nginx_roadguard.conf /etc/nginx/sites-available/roadguard
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/roadguard /etc/nginx/sites-enabled/roadguard
sudo nginx -t
sudo systemctl restart nginx
```

Open `http://EC2_PUBLIC_IPV4/` **for a display/health smoke test only**. Don't send access codes or private road videos over unencrypted HTTP.

### E. HTTPS for real judge access

Use a DNS hostname you control with an A record pointing to a stable AWS Elastic IP. After DNS resolves, set `server_name your.domain.example;` in Nginx, open HTTPS 443 in EC2 security group, then use Certbot per official Nginx instructions to obtain TLS certificates:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your.domain.example
```

Certbot's certificate issuance requires DNS and inbound port 80 for HTTP-01 verification. **Do not claim HTTPS is active before the certificate succeeds.** Without a domain, use a trusted managed TLS endpoint such as an ALB with ACM or an approved HTTPS tunnel; those need separate setup and may cost more. For demo reliability, allocate Elastic IP only while you need it and check current AWS public IPv4 pricing.

### F. Test with the real dashboard

1. Open the HTTPS URL, enter the demo access code (protect against public abuse).
2. Click **Load existing cloud inspection** with `roadguard-run-001` to verify S3 report/images.
3. Upload a short MP4 (<=80 MB) and click **Run cloud inspection**.
4. Check live stages. CPU inference may take a while; first **300 frames only** are analyzed by default, not the entire video.
5. Verify `incoming/<new-id>/source_video.mp4`, `incoming/<new-id>/evidence/*`, `incoming/<new-id>/inspection_trace.json`, and `reports/<new-id>/review_summary.json` inside S3.
6. Review an actual event and confirm/reject; verify `reviews/<new-id>/decisions.json` exists. Make sure you can see the innovation page.
7. `sudo journalctl -u roadguard -n 100 --no-pager` for server errors; Lambda errors in CloudWatch Logs for `roadguard-generate-review-report`.

### Notes and limitations

- Sensitive content: keep the bucket blocked from public access, confirm consent/license for videos, avoid real number plates/faces in your public demo where possible. Do not post private S3 URIs as public image links.
- The frontend is publicly served; API requests require a demo access code. Share the code with judges privately. Use HTTPS for upload/authenticated interactions.
- No raw video deletion policy has been implemented; implement S3 lifecycle deletion if retaining only short-lived demo evidence.
- Review JSON read-modify-write is acceptable for **a single web worker**; it is not safe for high-volume concurrent reviewers. For production use DynamoDB conditional updates and real user authentication.
- The server controls upload maximums, processes at most one video simultaneously, and limits processing to a frame cap. Apply additional AWS WAF/ALB protections if you remove the demo code.
- No proof of deployed service is implied by code generation. Test live before your Devpost submission.

## Faster temporary HTTPS test without buying a domain

If your main priority is **proving public hosted AWS inference during a live demo tonight**, you may run a [Cloudflare Quick Tunnel](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/) on **the EC2 host**. The CPU inference still happens on AWS EC2; Cloudflare only proxies HTTPS traffic to the EC2-local API. This does **not** require Nginx or inbound public ports and is more secure than submitting private uploads over HTTP.

```bash
# Run on the Ubuntu EC2 host, not the laptop
cd /tmp
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
# RoadGuard service must already be running on 127.0.0.1:8000
cloudflared tunnel --url http://127.0.0.1:8000
```

Cloudflare prints an `https://...trycloudflare.com` URL. Keep the command running and share only the HTTPS URL and separately communicate the demo access code. **Important**: Quick Tunnel URLs are temporary, stop when the command stops, and change on reconnect. Do not rely on one as a lasting Devpost public URL: for the actual submission use a stable custom domain + TLS, or a stable named Cloudflare Tunnel. The named option requires control of a domain. See [official Quick Tunnel documentation](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/).
