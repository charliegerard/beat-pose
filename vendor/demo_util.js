const colorRight = 'aqua';
const colorLeft = 'red';

window.LEFT_WRIST;
window.RIGHT_WRIST;

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isMobile() {
  return isAndroid() || isiOS();
}

export function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Draw pose keypoints onto a canvas
 */
export function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
    window.LEFT_WRIST = keypoints.find(point => point.part === 'leftWrist');
    window.RIGHT_WRIST = keypoints.find(point => point.part === 'rightWrist');
    
    if (window.LEFT_WRIST.score > minConfidence) {
        const {y, x} = window.LEFT_WRIST.position;
        drawPoint(ctx, y * scale, x * scale, 10, colorLeft);
    }

    if (window.RIGHT_WRIST.score > minConfidence) {
        const {y, x} = window.RIGHT_WRIST.position;
        drawPoint(ctx, y * scale, x * scale, 10, colorRight);
    }
}