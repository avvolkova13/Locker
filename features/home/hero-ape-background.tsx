"use client";

import { useEffect, useRef } from "react";
import styles from "./home-page.module.css";

type WebGL2 = WebGL2RenderingContext;

type Mesh = {
  indices: Uint16Array;
  positions: Float32Array;
  positions2: Float32Array;
  vertexCount: number;
};

type PointerState = {
  active: boolean;
  x: number;
  y: number;
  lastX: number;
  lastY: number;
  velocityX: number;
  velocityY: number;
};

type BufferData = Float32Array | Uint16Array;

const LINE_COLOR = [0.85, 1, 0.95, 0.18] as const;
const GRADIENT_FROM = [0.035, 0.045, 0.052] as const;
const GRADIENT_TO = [0.045, 0.245, 0.205] as const;

const pointerDefaults: PointerState = {
  active: false,
  x: 10,
  y: 10,
  lastX: 10,
  lastY: 10,
  velocityX: 0,
  velocityY: 0,
};

function compileShader(gl: WebGL2, type: number, source: string) {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error("Unable to create shader.");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader error";
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createProgram(
  gl: WebGL2,
  vertexSource: string,
  fragmentSource: string,
  transformVaryings?: string[],
) {
  const program = gl.createProgram();

  if (!program) {
    throw new Error("Unable to create program.");
  }

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  if (transformVaryings) {
    gl.transformFeedbackVaryings(program, transformVaryings, gl.INTERLEAVED_ATTRIBS);
  }

  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "Unknown program error";
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

function createBuffer(gl: WebGL2, data: BufferData, usage: number = gl.STATIC_DRAW) {
  const buffer = gl.createBuffer();

  if (!buffer) {
    throw new Error("Unable to create buffer.");
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data as unknown as BufferSource, usage);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return buffer;
}

function createIndexBuffer(gl: WebGL2, data: Uint16Array) {
  const buffer = gl.createBuffer();

  if (!buffer) {
    throw new Error("Unable to create index buffer.");
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data as unknown as BufferSource, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return buffer;
}

function createTransform(gl: WebGL2, buffer: WebGLBuffer) {
  const transformFeedback = gl.createTransformFeedback();

  if (!transformFeedback) {
    throw new Error("Unable to create transform feedback.");
  }

  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

  return transformFeedback;
}

function addRibbon(
  positions: number[],
  positions2: number[],
  indices: number[],
  points: Array<[number, number]>,
  width: number,
  opacity: number,
) {
  const start = positions.length / 3;

  for (let index = 0; index < points.length; index += 1) {
    const previous = points[Math.max(0, index - 1)];
    const current = points[index];
    const next = points[Math.min(points.length - 1, index + 1)];
    const tangentX = next[0] - previous[0];
    const tangentY = next[1] - previous[1];
    const length = Math.hypot(tangentX, tangentY) || 1;
    const normalX = (-tangentY / length) * width;
    const normalY = (tangentX / length) * width;
    const z = 1 - opacity;

    positions.push(current[0] - normalX, current[1] - normalY, z);
    positions.push(current[0] + normalX, current[1] + normalY, z);
    positions2.push(current[0] - normalX, current[1] - normalY);
    positions2.push(current[0] + normalX, current[1] + normalY);
  }

  for (let index = 0; index < points.length - 1; index += 1) {
    const a = start + index * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
}

function addClosedRibbon(
  positions: number[],
  positions2: number[],
  indices: number[],
  points: Array<[number, number]>,
  width: number,
  opacity: number,
) {
  const start = positions.length / 3;
  const pointCount = points.length;

  for (let index = 0; index < pointCount; index += 1) {
    const previous = points[(index - 1 + pointCount) % pointCount];
    const current = points[index];
    const next = points[(index + 1) % pointCount];
    const tangentX = next[0] - previous[0];
    const tangentY = next[1] - previous[1];
    const length = Math.hypot(tangentX, tangentY) || 1;
    const normalX = (-tangentY / length) * width;
    const normalY = (tangentX / length) * width;
    const z = 1 - opacity;

    positions.push(current[0] - normalX, current[1] - normalY, z);
    positions.push(current[0] + normalX, current[1] + normalY, z);
    positions2.push(current[0] - normalX, current[1] - normalY);
    positions2.push(current[0] + normalX, current[1] + normalY);
  }

  for (let index = 0; index < pointCount; index += 1) {
    const a = start + index * 2;
    const b = start + ((index + 1) % pointCount) * 2;
    indices.push(a, a + 1, b, a + 1, b + 1, b);
  }
}

function buildLineMesh(width: number): Mesh {
  const isMobile = width < 680;
  const positions: number[] = [];
  const positions2: number[] = [];
  const indices: number[] = [];
  const contourCount = isMobile ? 12 : 15;
  const segmentCount = isMobile ? 260 : 380;
  const scale = isMobile ? 0.92 : 1;

  for (let contour = 0; contour < contourCount; contour += 1) {
    const contourProgress = contour / Math.max(1, contourCount - 1);
    const points: Array<[number, number]> = [];
    const lineWidth = (isMobile ? 0.0068 : 0.0076) + contourProgress * 0.0009;
    const opacity = 1.14 + contourProgress * 0.38;
    const leftOffset = -1.42 + contour * 0.118;
    const topLift = 0.18 - contour * 0.012;

    for (let segment = 0; segment < segmentCount; segment += 1) {
      const t = segment / (segmentCount - 1);
      const waveA = Math.sin(t * Math.PI * 2.05 + contour * 0.34) * 0.04;
      const waveB = Math.sin(t * Math.PI * 5.2 - contour * 0.21) * 0.018;
      const shoulder = Math.exp(-((t - 0.48) ** 2) / 0.03);
      const lowerPull = Math.exp(-((t - 0.9) ** 2) / 0.024);
      const upperShelf = Math.exp(-((t - 0.18) ** 2) / 0.018);

      let x =
        leftOffset +
        Math.sin(t * Math.PI * 1.02) * (0.74 + contourProgress * 0.25) +
        t * (1.84 + contourProgress * 0.16) +
        waveA +
        shoulder * 0.16 -
        lowerPull * 0.12;
      let y =
        1.28 -
        t * 2.72 +
        Math.sin(t * Math.PI * 1.55 - 0.55) * (0.28 - contourProgress * 0.06) +
        waveB +
        upperShelf * 0.14 -
        lowerPull * 0.18 +
        topLift;

      const bend = Math.exp(-((x - 0.2) ** 2 / 0.44 + (y - 0.42) ** 2 / 0.12));
      x += bend * (0.22 - contourProgress * 0.06);
      y -= bend * (0.09 + contourProgress * 0.03);

      x = x * scale - (isMobile ? 0.18 : 0.06);
      y = y * scale + (isMobile ? 0.02 : 0.08);

      points.push([x, y]);
    }

    addRibbon(positions, positions2, indices, points, lineWidth, opacity);
  }

  for (let contour = 0; contour < (isMobile ? 4 : 5); contour += 1) {
    const points: Array<[number, number]> = [];
    const yBase = 0.78 - contour * 0.12;
    const lineWidth = isMobile ? 0.0064 : 0.0072;
    const opacity = 1.05 + contour * 0.08;

    for (let segment = 0; segment < segmentCount; segment += 1) {
      const t = segment / (segmentCount - 1);
      const x = -1.36 + t * 2.96;
      const y =
        yBase +
        Math.sin(t * Math.PI * 1.2 + contour * 0.46) * 0.11 +
        Math.sin(t * Math.PI * 4.6 - contour) * 0.025 -
        Math.exp(-((t - 0.58) ** 2) / 0.022) * 0.16;

      points.push([x, y]);
    }

    addRibbon(positions, positions2, indices, points, lineWidth, opacity);
  }

  return {
    indices: new Uint16Array(indices),
    positions: new Float32Array(positions),
    positions2: new Float32Array(positions2),
    vertexCount: positions.length / 3,
  };
}

const gradientVertex = `#version 300 es
precision highp float;

in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const gradientFragment = `#version 300 es
precision highp float;

in vec2 vUv;
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
out vec4 fragColor;

float random(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 cycleColor(vec3 a, vec3 b, vec3 c, float t) {
  float first = smoothstep(0.0, 0.5, t) * (1.0 - smoothstep(0.5, 1.0, t));
  float second = smoothstep(0.25, 0.75, t);
  vec3 ab = mix(a, b, smoothstep(0.0, 0.5, t));
  vec3 bc = mix(b, c, smoothstep(0.35, 0.85, t));
  vec3 ca = mix(c, a, smoothstep(0.72, 1.0, t));
  return mix(mix(ab, bc, second), ca, smoothstep(0.72, 1.0, t));
}

void main() {
  float currentAngle = sin(uTime) * 55.0;
  vec2 origin = vec2(0.5, 0.5);
  vec2 uv = vUv - origin;
  float angle = radians(90.0) - radians(currentAngle) + atan(uv.y, uv.x);
  float len = length(uv);
  uv = vec2(cos(angle) * len, sin(angle) * len) + origin;
  float gradient = smoothstep(0.0, 1.0, uv.x);
  float cycle = fract(uTime * 0.32);
  vec3 deepInk = vec3(0.018, 0.026, 0.034);
  vec3 deepWine = vec3(0.24, 0.035, 0.075);
  vec3 deepNavy = vec3(0.022, 0.052, 0.17);
  vec3 lockerMint = vec3(0.06, 0.36, 0.22);
  vec3 warmShadow = vec3(0.2, 0.115, 0.055);
  vec3 color1 = cycleColor(uColor1, deepWine, deepNavy, cycle);
  vec3 color2 = cycleColor(lockerMint, warmShadow, uColor2, fract(cycle + 0.32));
  vec3 color = mix(color1, color2, gradient);
  color += random(vUv) * 0.01;
  fragColor = vec4(color, 1.0);
}`;

const feedbackVertex = `#version 300 es
precision highp float;

in vec2 aPosition;
in vec4 aDisplacementIn;
uniform vec4 uCursor;
uniform vec2 uEffectsStrength;
out vec4 tf_disp;

void main() {
  vec2 velocity = aDisplacementIn.zw;
  vec2 pos = aPosition + aDisplacementIn.xy;
  vec2 cursorToPos = pos - uCursor.xy;
  float cursorDist = length(cursorToPos);
  float strength = clamp(1.0 / (1.0 + cursorDist / 0.05) - 0.1, 0.0, 1.0);

  velocity += uCursor.zw * 0.02 * strength * uEffectsStrength.x;
  velocity += -aDisplacementIn.xy * 0.1;
  velocity += cursorToPos * strength * uEffectsStrength.y;
  velocity *= 0.90;

  tf_disp.xy = aDisplacementIn.xy + velocity * 0.1;
  tf_disp.zw = velocity;
  tf_disp = clamp(tf_disp, -1.0, 1.0);
}`;

const feedbackFragment = `#version 300 es
precision highp float;
out vec4 fragColor;

void main() {
  fragColor = vec4(0.0);
}`;

const lineVertex = `#version 300 es
precision highp float;

in vec3 aPosition;
in vec4 aDisplacementIn;
uniform vec2 uVPRatio;
uniform float uDispStrength;
out float vOpacity;

void main() {
  vec2 pos = aPosition.xy + aDisplacementIn.xy * uDispStrength;
  pos *= uVPRatio;
  gl_Position = vec4(pos, 0.5, 1.0);
  vOpacity = 1.0 - aPosition.z;
}`;

const lineFragment = `#version 300 es
precision highp float;

in float vOpacity;
uniform vec4 uColor;
out vec4 fragColor;

void main() {
  fragColor = uColor;
  fragColor.a *= vOpacity;
  fragColor.rgb *= fragColor.a;
}`;

export function HeroApeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const canvasElement = canvas;
    const context = canvasElement.getContext("webgl2", {
      alpha: true,
      antialias: true,
      depth: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
      stencil: false,
    });

    if (!context) {
      return undefined;
    }

    const gl: WebGL2 = context;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gradientProgram = createProgram(gl, gradientVertex, gradientFragment);
    const feedbackProgram = createProgram(gl, feedbackVertex, feedbackFragment, ["tf_disp"]);
    const lineProgram = createProgram(gl, lineVertex, lineFragment);
    const quadBuffer = createBuffer(gl, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));
    let mesh = buildLineMesh(canvasElement.clientWidth || window.innerWidth);
    let positionBuffer = createBuffer(gl, mesh.positions);
    let position2Buffer = createBuffer(gl, mesh.positions2);
    let indexBuffer = createIndexBuffer(gl, mesh.indices);
    let displacementA = createBuffer(gl, new Float32Array(mesh.vertexCount * 4), gl.DYNAMIC_COPY);
    let displacementB = createBuffer(gl, new Float32Array(mesh.vertexCount * 4), gl.DYNAMIC_COPY);
    let feedbackA = createTransform(gl, displacementA);
    let feedbackB = createTransform(gl, displacementB);
    let readDisplacement = displacementA;
    let writeDisplacement = displacementB;
    let writeFeedback = feedbackB;
    let animationFrame = 0;
    let time = 0;
    let lastTime = performance.now();
    const pointer = { ...pointerDefaults };

    function resize() {
      const pixelRatio = Math.min(3, window.devicePixelRatio || 1);
      const width = Math.max(1, Math.floor(canvasElement.clientWidth * pixelRatio));
      const height = Math.max(1, Math.floor(canvasElement.clientHeight * pixelRatio));

      if (canvasElement.width !== width || canvasElement.height !== height) {
        canvasElement.width = width;
        canvasElement.height = height;
        gl.viewport(0, 0, width, height);

        mesh = buildLineMesh(canvasElement.clientWidth || width);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(position2Buffer);
        gl.deleteBuffer(indexBuffer);
        gl.deleteBuffer(displacementA);
        gl.deleteBuffer(displacementB);
        gl.deleteTransformFeedback(feedbackA);
        gl.deleteTransformFeedback(feedbackB);
        positionBuffer = createBuffer(gl, mesh.positions);
        position2Buffer = createBuffer(gl, mesh.positions2);
        indexBuffer = createIndexBuffer(gl, mesh.indices);
        displacementA = createBuffer(gl, new Float32Array(mesh.vertexCount * 4), gl.DYNAMIC_COPY);
        displacementB = createBuffer(gl, new Float32Array(mesh.vertexCount * 4), gl.DYNAMIC_COPY);
        feedbackA = createTransform(gl, displacementA);
        feedbackB = createTransform(gl, displacementB);
        readDisplacement = displacementA;
        writeDisplacement = displacementB;
        writeFeedback = feedbackB;
      }
    }

    function updatePointer(event: PointerEvent) {
      const rect = canvasElement.getBoundingClientRect();
      const normalizedX = (event.clientX - rect.left) / Math.max(1, rect.width);
      const normalizedY = (event.clientY - rect.top) / Math.max(1, rect.height);
      const x = normalizedX * 2 - 1;
      const y = (-2 * normalizedY + 1) * (rect.height / Math.max(1, rect.width));
      const now = performance.now();
      const delta = Math.max(16, now - lastTime) / 1000;
      const velocityX = (x - pointer.lastX) / delta;
      const velocityY = (y - pointer.lastY) / delta;
      const velocityLength = Math.hypot(velocityX, velocityY);

      pointer.active = rect.bottom > 0 && rect.top < window.innerHeight;
      pointer.x = x;
      pointer.y = y;
      pointer.velocityX = velocityLength > 10 ? 0 : velocityX;
      pointer.velocityY = velocityLength > 10 ? 0 : velocityY;
      pointer.lastX = x;
      pointer.lastY = y;
    }

    function drawGradient() {
      gl.useProgram(gradientProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      const positionLocation = gl.getAttribLocation(gradientProgram, "aPosition");
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(gl.getUniformLocation(gradientProgram, "uTime"), time);
      gl.uniform3fv(gl.getUniformLocation(gradientProgram, "uColor1"), GRADIENT_FROM);
      gl.uniform3fv(gl.getUniformLocation(gradientProgram, "uColor2"), GRADIENT_TO);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function updateDisplacement() {
      gl.useProgram(feedbackProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, position2Buffer);
      const positionLocation = gl.getAttribLocation(feedbackProgram, "aPosition");
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, readDisplacement);
      const displacementLocation = gl.getAttribLocation(feedbackProgram, "aDisplacementIn");
      gl.enableVertexAttribArray(displacementLocation);
      gl.vertexAttribPointer(displacementLocation, 4, gl.FLOAT, false, 0, 0);

      gl.uniform4f(
        gl.getUniformLocation(feedbackProgram, "uCursor"),
        pointer.active ? pointer.x : 10,
        pointer.active ? pointer.y : 10,
        pointer.velocityX,
        pointer.velocityY,
      );
      gl.uniform2f(gl.getUniformLocation(feedbackProgram, "uEffectsStrength"), 0.2, 0.2);
      gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, writeFeedback);
      gl.enable(gl.RASTERIZER_DISCARD);
      gl.beginTransformFeedback(gl.POINTS);
      gl.drawArrays(gl.POINTS, 0, mesh.vertexCount);
      gl.endTransformFeedback();
      gl.disable(gl.RASTERIZER_DISCARD);
      gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

      const nextRead = writeDisplacement;
      writeDisplacement = readDisplacement;
      readDisplacement = nextRead;
      writeFeedback = writeDisplacement === displacementA ? feedbackA : feedbackB;
    }

    function drawLines() {
      const ratioX = canvasElement.width / canvasElement.height > 1 ? 1 : canvasElement.height / canvasElement.width;
      const ratioY = canvasElement.width / canvasElement.height > 1 ? canvasElement.width / canvasElement.height : 1;

      gl.useProgram(lineProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      const positionLocation = gl.getAttribLocation(lineProgram, "aPosition");
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, readDisplacement);
      const displacementLocation = gl.getAttribLocation(lineProgram, "aDisplacementIn");
      gl.enableVertexAttribArray(displacementLocation);
      gl.vertexAttribPointer(displacementLocation, 4, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.uniform2f(gl.getUniformLocation(lineProgram, "uVPRatio"), ratioX, ratioY);
      gl.uniform1f(gl.getUniformLocation(lineProgram, "uDispStrength"), reducedMotion ? 0 : 1);
      gl.uniform4fv(gl.getUniformLocation(lineProgram, "uColor"), LINE_COLOR);
      gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
    }

    function render(now: number) {
      resize();
      const delta = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      time += delta * 0.5;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      drawGradient();

      if (!reducedMotion) {
        updateDisplacement();
      }

      drawLines();

      if (!reducedMotion) {
        animationFrame = requestAnimationFrame(render);
      }
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvasElement);
    document.body.addEventListener("pointermove", updatePointer, { passive: true });
    render(performance.now());

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      document.body.removeEventListener("pointermove", updatePointer);
      gl.deleteProgram(gradientProgram);
      gl.deleteProgram(feedbackProgram);
      gl.deleteProgram(lineProgram);
      gl.deleteBuffer(quadBuffer);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(position2Buffer);
      gl.deleteBuffer(indexBuffer);
      gl.deleteBuffer(displacementA);
      gl.deleteBuffer(displacementB);
      gl.deleteTransformFeedback(feedbackA);
      gl.deleteTransformFeedback(feedbackB);
    };
  }, []);

  return (
    <div className={styles.heroApeBackground} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
