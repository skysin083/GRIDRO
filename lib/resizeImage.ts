const MAX_BYTES = 5 * 1024 * 1024;

/**
 * 가로 기준 상한. 웹툰 원고는 세로로 길어서 '긴 변'을 기준으로 줄이면 가로가 같이 뭉개진다
 * (690×10000 원고를 긴 변 1600에 맞추면 가로가 110px까지 내려간다 — UT에서 실제로 깨진 원인).
 * 세로는 얼마든지 길어도 되므로 가로만 제한한다.
 */
const MAX_WIDTH = 1600;

/**
 * canvas는 브라우저마다 넓이·높이·총 픽셀 상한이 있고, 넘기면 예외 없이 '빈 이미지'가 나온다.
 * 세로로 이어붙인 원고가 이 선을 넘을 수 있어, 넘을 것 같으면 리사이즈를 포기하고 원본을 그대로 쓴다.
 * (Safari가 가장 빡빡해서 그 선에 맞춘다.)
 */
const MAX_CANVAS_SIDE = 8192;
const MAX_CANVAS_PIXELS = 16_777_216; // 4096 × 4096

export async function fileToImageUrl(file: File): Promise<string> {
  if (file.size <= MAX_BYTES) {
    return URL.createObjectURL(file);
  }
  try {
    return await resizeViaCanvas(file);
  } catch {
    // 리사이즈에 실패하면 화질이 깨진 이미지를 주느니 원본을 그대로 쓴다.
    return URL.createObjectURL(file);
  }
}

function resizeViaCanvas(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      // 줄여도 canvas 한계를 넘는 원고는 건드리지 않고 원본을 넘긴다.
      if (width > MAX_CANVAS_SIDE || height > MAX_CANVAS_SIDE || width * height > MAX_CANVAS_PIXELS) {
        resolve(objectUrl);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("canvas context 생성 실패"));
        return;
      }
      // 세로로 긴 원고를 줄일 때 리샘플링 품질이 눈에 띄게 갈린다.
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);
      // 원고는 선이 살아야 해서 0.85로는 선 주변이 뭉갠다.
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지 로드 실패"));
    };
    img.src = objectUrl;
  });
}
