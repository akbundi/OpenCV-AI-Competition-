### Try RoadGuard — Sample Evaluation Videos

Three sample road videos are provided in [`demo/test_videos/`](demo/test_videos/) so judges can reproduce the cloud inspection workflow.

**Live Application:** https://13-204-218-48.sslip.io/

**How to evaluate:**

1. Download one of the sample MP4 videos from the repository.
2. Open the RoadGuard live application and enter the judge access code provided with the submission.
3. Navigate to **Overview & Upload**.
4. Upload the video and select **Run cloud inspection**.
5. Once processing completes, explore the detected road-damage candidates, annotated images, confidence information, and inspection evidence.
6. Review candidate events and record a human decision using the review interface.

The application uses OpenCV 5 and YOLO ONNX inference on AWS EC2. Evidence is stored in Amazon S3, and AWS Lambda generates a structured review summary.

**Note:** RoadGuard produces candidate detections rather than verified structural assessments. Results may include missed detections, false positives, and uncertain cases. The sample videos are intended to support reproducible functional testing, not establish a quantitative accuracy score.
