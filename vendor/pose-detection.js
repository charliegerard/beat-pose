import { isMobile } from "./demo_util.js";

const videoWidth = window.innerWidth;
const videoHeight = window.innerHeight;

export let handsKeyPoints;
export let leftHandPosition;
export let rightHandPosition;

async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "Browser API navigator.mediaDevices.getUserMedia not available"
    );
  }

  const video = document.getElementById("video");
  video.width = videoWidth;
  video.height = videoHeight;

  const mobile = isMobile();
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
      width: mobile ? undefined : videoWidth,
      height: mobile ? undefined : videoHeight,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => resolve(video);
  });
}

let net;

const guiState = {
  algorithm: "single-pose",
  input: {
    architecture: "MobileNetV1",
    outputStride: 16,
    inputResolution: 513,
    multiplier: isMobile() ? 0.5 : 0.75,
    quantBytes: 2,
  },
  singlePoseDetection: {
    minPoseConfidence: 0.1,
    minPartConfidence: 0.5,
  },
  output: {
    showVideo: false,
    showSkeleton: false,
    showPoints: true,
    showBoundingBox: false,
  },
  net: null,
};

function getLeftHand(keypoints) {
  for (var i = 0; i < keypoints.length; i++) {
    if (keypoints[i].name === "left_wrist") {
      return { x: keypoints[i].x, y: keypoints[i].y };
    }
  }
}

function getRightHand(keypoints) {
  const rightWristKeypoints = keypoints.filter(
    (k) => k.name === "right_wrist"
  )[0];
  // for (var i = 0; i < keypoints.length; i++) {
  // if (keypoints[i].name === "right_wrist") {
  // console.log(keypoints[i].score);
  // console.log("right hand");

  // if (rightWristKeypoints.score > 0.3) {
  return { x: rightWristKeypoints.x, y: rightWristKeypoints.y };
  // }

  // }
  // }
}

function detectPoseInRealTime(video, net) {
  const canvas = document.getElementById("output");
  const ctx = canvas.getContext("2d");

  // since images are being fed from a webcam, we want to feed in the
  // original image and then just flip the keypoints' x coordinates. If instead
  // we flip the image, then correcting left-right keypoint pairs requires a
  // permutation on all the keypoints.

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  async function poseDetectionFrame() {
    let poses = [];
    let minPoseConfidence;
    let minPartConfidence;

    switch (guiState.algorithm) {
      case "single-pose":
        const pose = await guiState.net.estimatePoses(video, {
          flipHorizontal: false,
        });

        poses = poses.concat(pose);
        minPoseConfidence = +guiState.singlePoseDetection.minPoseConfidence;
        minPartConfidence = +guiState.singlePoseDetection.minPartConfidence;
        break;
    }

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    // if (guiState.output.showVideo) {
    // ctx.save();
    // ctx.scale(-1, 1);
    // ctx.translate(-videoWidth, 0);
    // ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    // ctx.restore();
    // }

    poses.forEach(({ score, keypoints }) => {
      if (score >= minPoseConfidence) {
        // if (guiState.output.showPoints) {
        handsKeyPoints = keypoints;
        leftHandPosition = getLeftHand(keypoints);
        rightHandPosition = getRightHand(keypoints);
        // }
      }
    });

    requestAnimationFrame(poseDetectionFrame);
  }

  poseDetectionFrame();
}

export async function init() {
  const detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet
  );

  guiState.net = detector;
  let video;

  try {
    video = await setupCamera();
    video.play();
  } catch (e) {
    throw e;
  }
  detectPoseInRealTime(video, net);
}

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;
init();
