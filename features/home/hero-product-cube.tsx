"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import {
  type KeyboardEvent,
  type MutableRefObject,
  type PointerEvent,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";
import { heroCubeProducts } from "@/mock-data/home";
import styles from "./home-page.module.css";

type CubeProduct = (typeof heroCubeProducts)[number];
type InteractionState = {
  dragging: boolean;
  pointerId: number;
  lastX: number;
  lastY: number;
  targetX: number;
  targetY: number;
  velocityX: number;
  velocityY: number;
};

const FACE_SIZE = 4.2;
const HALF_FACE = FACE_SIZE / 2;
const CARD_COLUMNS = 3;
const CARD_ROWS = 4;
const CARD_GAP = 0.12;
const CARD_WIDTH = (FACE_SIZE - CARD_GAP * (CARD_COLUMNS + 1)) / CARD_COLUMNS;
const CARD_HEIGHT = (FACE_SIZE - CARD_GAP * (CARD_ROWS + 1)) / CARD_ROWS;
const productTextureCache = new Map<string, THREE.CanvasTexture>();

const faceConfigs = [
  {
    name: "front",
    position: [0, 0, HALF_FACE],
    rotation: [0, 0, 0],
  },
  {
    name: "right",
    position: [HALF_FACE, 0, 0],
    rotation: [0, Math.PI / 2, 0],
  },
  {
    name: "back",
    position: [0, 0, -HALF_FACE],
    rotation: [0, Math.PI, 0],
  },
  {
    name: "left",
    position: [-HALF_FACE, 0, 0],
    rotation: [0, -Math.PI / 2, 0],
  },
  {
    name: "top",
    position: [0, HALF_FACE, 0],
    rotation: [-Math.PI / 2, 0, 0],
  },
  {
    name: "bottom",
    position: [0, -HALF_FACE, 0],
    rotation: [Math.PI / 2, 0, 0],
  },
] as const;

const cardPositions = Array.from({ length: CARD_COLUMNS * CARD_ROWS }, (_, index) => {
  const column = index % CARD_COLUMNS;
  const row = Math.floor(index / CARD_COLUMNS);

  return {
    x: -FACE_SIZE / 2 + CARD_GAP + CARD_WIDTH / 2 + column * (CARD_WIDTH + CARD_GAP),
    y: FACE_SIZE / 2 - CARD_GAP - CARD_HEIGHT / 2 - row * (CARD_HEIGHT + CARD_GAP),
  };
});

const defaultInteraction: InteractionState = {
  dragging: false,
  pointerId: -1,
  lastX: 0,
  lastY: 0,
  targetX: -0.34,
  targetY: -0.48,
  velocityX: 0,
  velocityY: 0,
};

function getFaceProducts(faceIndex: number) {
  return cardPositions.map((_, cardIndex) => {
    return heroCubeProducts[(cardIndex + faceIndex * 3) % heroCubeProducts.length];
  });
}

function drawFittedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  baseSize: number,
  weight = 700,
) {
  let fontSize = baseSize;
  context.font = `${weight} ${fontSize}px Tektur, Arial, sans-serif`;

  while (context.measureText(text).width > maxWidth && fontSize > 16) {
    fontSize -= 2;
    context.font = `${weight} ${fontSize}px Tektur, Arial, sans-serif`;
  }

  context.fillText(text, x, y);
}

function createProductTexture(product: CubeProduct) {
  const canvas = document.createElement("canvas");
  const width = 640;
  const height = 464;
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  context.scale(ratio, ratio);
  context.clearRect(0, 0, width, height);

  const accent = product.accent;
  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#151d21");
  background.addColorStop(0.42, "#090d10");
  background.addColorStop(1, "#040607");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const accentWash = context.createRadialGradient(width * 0.52, height * 0.42, 16, width * 0.52, height * 0.42, 240);
  accentWash.addColorStop(0, `${accent}66`);
  accentWash.addColorStop(0.5, `${accent}18`);
  accentWash.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = accentWash;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(244, 247, 241, 0.16)";
  context.lineWidth = 2;
  context.strokeRect(18, 18, width - 36, height - 36);

  context.strokeStyle = `${accent}80`;
  context.lineWidth = 2;
  context.strokeRect(34, 34, width - 68, height - 68);

  context.fillStyle = "rgba(255, 255, 255, 0.05)";
  context.fillRect(56, 88, width - 112, 178);
  context.strokeStyle = "rgba(255, 255, 255, 0.1)";
  context.strokeRect(56, 88, width - 112, 178);

  context.strokeStyle = `${accent}88`;
  context.lineWidth = 4;
  context.beginPath();
  context.arc(width / 2, 177, 58, 0, Math.PI * 2);
  context.stroke();
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(width / 2 - 42, 219);
  context.lineTo(width / 2 + 42, 135);
  context.stroke();

  context.fillStyle = `${accent}f0`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  drawFittedText(context, product.mark, width / 2, 177, 180, product.mark.length > 2 ? 58 : 76, 800);

  context.textBaseline = "alphabetic";
  context.textAlign = "left";
  context.fillStyle = "rgba(244, 247, 241, 0.62)";
  drawFittedText(context, product.category.toUpperCase(), 46, 62, 310, 20, 600);

  context.textAlign = "right";
  context.fillStyle = accent;
  drawFittedText(context, product.code, width - 48, 62, 84, 24, 800);

  context.fillStyle = "rgba(0, 0, 0, 0.48)";
  context.fillRect(52, height - 120, width - 104, 68);
  context.strokeStyle = `${accent}78`;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(92, height - 138);
  context.lineTo(width - 92, height - 138);
  context.stroke();

  context.textAlign = "center";
  context.fillStyle = "#f4f7f1";
  drawFittedText(context, product.title, width / 2, height - 92, width - 150, 36, 800);

  context.fillStyle = "rgba(244, 247, 241, 0.66)";
  drawFittedText(context, product.status, width / 2, height - 56, width - 180, 18, 600);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  return texture;
}

function getProductTexture(product: CubeProduct) {
  const key = `${product.code}-${product.title}-${product.accent}`;
  const cachedTexture = productTextureCache.get(key);

  if (cachedTexture) {
    return cachedTexture;
  }

  const texture = createProductTexture(product);

  if (texture) {
    productTextureCache.set(key, texture);
  }

  return texture;
}

function CardBar({
  color = "#152024",
  position,
  scale,
}: {
  color?: string;
  position: [number, number, number];
  scale: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} metalness={0.28} roughness={0.68} />
    </mesh>
  );
}

function LockerProductCard({
  product,
  index,
}: {
  product: CubeProduct;
  index: number;
}) {
  const accent = useMemo(() => new THREE.Color(product.accent), [product.accent]);
  const mutedAccent = useMemo(
    () => new THREE.Color(product.accent).lerp(new THREE.Color("#050708"), 0.72),
    [product.accent],
  );
  const labelTexture = useMemo(
    () => (typeof document === "undefined" ? null : getProductTexture(product)),
    [product],
  );
  const frameOffset = 0.014;
  const cardZ = 0.034 + (index % 3) * 0.002;

  return (
    <group position={[cardPositions[index].x, cardPositions[index].y, cardZ]}>
      <mesh castShadow receiveShadow>
        <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
        <meshStandardMaterial
          color="#0b1013"
          emissive={mutedAccent}
          emissiveIntensity={0.38}
          metalness={0.22}
          roughness={0.78}
        />
      </mesh>

      <CardBar
        color="#182125"
        position={[0, CARD_HEIGHT / 2 - frameOffset, 0.014]}
        scale={[CARD_WIDTH, frameOffset, frameOffset]}
      />
      <CardBar
        color="#050708"
        position={[0, -CARD_HEIGHT / 2 + frameOffset, 0.014]}
        scale={[CARD_WIDTH, frameOffset, frameOffset]}
      />
      <CardBar
        color="#131c20"
        position={[-CARD_WIDTH / 2 + frameOffset, 0, 0.014]}
        scale={[frameOffset, CARD_HEIGHT, frameOffset]}
      />
      <CardBar
        color="#050708"
        position={[CARD_WIDTH / 2 - frameOffset, 0, 0.014]}
        scale={[frameOffset, CARD_HEIGHT, frameOffset]}
      />

      <mesh position={[0, 0.11, 0.018]}>
        <planeGeometry args={[CARD_WIDTH - 0.18, CARD_HEIGHT * 0.38]} />
        <meshStandardMaterial
          color="#080d10"
          emissive={accent}
          emissiveIntensity={0.22}
          metalness={0.16}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0, 0.11, 0.022]}>
        <ringGeometry args={[0.17, 0.185, 48]} />
        <meshBasicMaterial color={accent} transparent opacity={0.52} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.11, 0.021]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.38, 0.012]} />
        <meshBasicMaterial color={accent} transparent opacity={0.46} />
      </mesh>

      <mesh position={[0, -CARD_HEIGHT / 2 + 0.12, 0.017]}>
        <planeGeometry args={[CARD_WIDTH - 0.16, 0.16]} />
        <meshBasicMaterial color="#050708" transparent opacity={0.72} />
      </mesh>
      <mesh position={[0, -CARD_HEIGHT / 2 + 0.215, 0.022]}>
        <planeGeometry args={[CARD_WIDTH - 0.34, 0.01]} />
        <meshBasicMaterial color={accent} transparent opacity={0.72} />
      </mesh>

      {labelTexture ? (
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[CARD_WIDTH - 0.025, CARD_HEIGHT - 0.025]} />
          <meshStandardMaterial
            map={labelTexture}
            metalness={0.1}
            roughness={0.72}
            transparent
          />
        </mesh>
      ) : null}
    </group>
  );
}

function Face({
  faceIndex,
  name,
  position,
  rotation,
}: {
  faceIndex: number;
  name: string;
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
}) {
  const products = useMemo(() => getFaceProducts(faceIndex), [faceIndex]);

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.018]} receiveShadow>
        <planeGeometry args={[FACE_SIZE, FACE_SIZE]} />
        <meshStandardMaterial
          color="#06090b"
          metalness={0.34}
          roughness={0.72}
          emissive="#07100e"
          emissiveIntensity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[FACE_SIZE + 0.08, FACE_SIZE + 0.08]} />
        <meshBasicMaterial
          color="#0f1518"
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
        />
      </mesh>
      {products.map((product, cardIndex) => (
        <LockerProductCard
          index={cardIndex}
          key={`${name}-${product.title}-${cardIndex}`}
          product={product}
        />
      ))}
    </group>
  );
}

function CubeFrame() {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#11171a",
        emissive: "#050708",
        metalness: 0.42,
        roughness: 0.62,
      }),
    [],
  );
  const edgeLength = FACE_SIZE + 0.06;
  const edgeDepth = 0.055;

  const edges: Array<{
    position: [number, number, number];
    scale: [number, number, number];
  }> = [
    { position: [0, HALF_FACE, HALF_FACE], scale: [edgeLength, edgeDepth, edgeDepth] },
    { position: [0, -HALF_FACE, HALF_FACE], scale: [edgeLength, edgeDepth, edgeDepth] },
    { position: [HALF_FACE, 0, HALF_FACE], scale: [edgeDepth, edgeLength, edgeDepth] },
    { position: [-HALF_FACE, 0, HALF_FACE], scale: [edgeDepth, edgeLength, edgeDepth] },
    { position: [0, HALF_FACE, -HALF_FACE], scale: [edgeLength, edgeDepth, edgeDepth] },
    { position: [0, -HALF_FACE, -HALF_FACE], scale: [edgeLength, edgeDepth, edgeDepth] },
    { position: [HALF_FACE, 0, -HALF_FACE], scale: [edgeDepth, edgeLength, edgeDepth] },
    { position: [-HALF_FACE, 0, -HALF_FACE], scale: [edgeDepth, edgeLength, edgeDepth] },
    { position: [HALF_FACE, HALF_FACE, 0], scale: [edgeDepth, edgeDepth, edgeLength] },
    { position: [-HALF_FACE, HALF_FACE, 0], scale: [edgeDepth, edgeDepth, edgeLength] },
    { position: [HALF_FACE, -HALF_FACE, 0], scale: [edgeDepth, edgeDepth, edgeLength] },
    { position: [-HALF_FACE, -HALF_FACE, 0], scale: [edgeDepth, edgeDepth, edgeLength] },
  ] as const;

  return (
    <group>
      {edges.map((edge, index) => (
        <mesh
          castShadow
          key={index}
          material={material}
          position={edge.position}
        >
          <boxGeometry args={edge.scale} />
        </mesh>
      ))}
    </group>
  );
}

function LockerCubeScene({
  interactionRef,
}: {
  interactionRef: MutableRefObject<InteractionState>;
}) {
  const cubeRef = useRef<THREE.Group>(null);
  const rotationRef = useRef({ x: -0.34, y: -0.48, z: -0.04 });
  const { size } = useThree();
  const sceneScale = size.width < 520 ? 0.54 : size.width < 900 ? 0.62 : 0.62;
  const sceneX = size.width < 520 ? -0.02 : size.width < 900 ? 0.02 : -0.08;

  useFrame((state, delta) => {
    const cube = cubeRef.current;
    if (!cube) {
      return;
    }

    const interaction = interactionRef.current;
    const rotation = rotationRef.current;
    const pointer = state.pointer;
    const baseX = -0.34 + pointer.y * 0.08;
    const baseY = interaction.targetY + pointer.x * 0.06;

    if (!interaction.dragging) {
      interaction.targetY -= delta * 0.055;
      interaction.targetY += interaction.velocityY;
      interaction.targetX += interaction.velocityX;
      interaction.velocityY *= Math.pow(0.9, delta * 60);
      interaction.velocityX *= Math.pow(0.88, delta * 60);
    }

    rotation.x = THREE.MathUtils.damp(rotation.x, interaction.dragging ? interaction.targetX : baseX, 5.4, delta);
    rotation.y = THREE.MathUtils.damp(rotation.y, baseY, 4.8, delta);
    rotation.z = THREE.MathUtils.damp(rotation.z, -0.04 + pointer.x * 0.018, 3.6, delta);

    cube.rotation.set(rotation.x, rotation.y, rotation.z);
    cube.position.y = Math.sin(state.clock.elapsedTime * 0.75) * 0.035;
  });

  return (
    <group ref={cubeRef} position={[sceneX, -0.08, 0]} scale={sceneScale}>
      <CubeFrame />
      {faceConfigs.map((face, index) => (
        <Face
          faceIndex={index}
          key={face.name}
          name={face.name}
          position={face.position}
          rotation={face.rotation}
        />
      ))}
    </group>
  );
}

export function HeroProductCube() {
  const stageRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<InteractionState>({ ...defaultInteraction });

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const interaction = interactionRef.current;
    interaction.dragging = true;
    interaction.pointerId = event.pointerId;
    interaction.lastX = event.clientX;
    interaction.lastY = event.clientY;
    interaction.velocityX = 0;
    interaction.velocityY = 0;
    stageRef.current?.setPointerCapture(event.pointerId);
    stageRef.current?.setAttribute("data-dragging", "true");
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const interaction = interactionRef.current;
    if (!interaction.dragging || interaction.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - interaction.lastX;
    const deltaY = event.clientY - interaction.lastY;
    interaction.targetY += deltaX * 0.0062;
    interaction.targetX += deltaY * 0.0048;
    interaction.targetX = THREE.MathUtils.clamp(interaction.targetX, -1.0, 0.35);
    interaction.velocityY = deltaX * 0.00072;
    interaction.velocityX = deltaY * 0.00045;
    interaction.lastX = event.clientX;
    interaction.lastY = event.clientY;
  }

  function releasePointer(event: PointerEvent<HTMLDivElement>) {
    const interaction = interactionRef.current;
    if (interaction.pointerId !== event.pointerId) {
      return;
    }

    interaction.dragging = false;
    interaction.pointerId = -1;
    stageRef.current?.removeAttribute("data-dragging");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const interaction = interactionRef.current;

    if (event.key === "ArrowLeft") {
      interaction.targetY += 0.22;
    }

    if (event.key === "ArrowRight") {
      interaction.targetY -= 0.22;
    }

    if (event.key === "ArrowUp") {
      interaction.targetX -= 0.18;
    }

    if (event.key === "ArrowDown") {
      interaction.targetX += 0.18;
    }

    interaction.targetX = THREE.MathUtils.clamp(interaction.targetX, -1.0, 0.35);
  }

  return (
    <div className={styles.cubeWrap} aria-label="Интерактивный куб с товарами Locker">
      <div
        className={styles.cubeStage}
        ref={stageRef}
        role="img"
        tabIndex={0}
        aria-label="3D-куб из карточек Steam Wallet, скинов, подписок и подарочных карт"
        onKeyDown={handleKeyDown}
        onPointerCancel={releasePointer}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={releasePointer}
      >
        <Canvas
          className={styles.cubeCanvas}
          dpr={[1, 1.75]}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          shadows
        >
          <PerspectiveCamera makeDefault fov={34} position={[0.12, 0.08, 7.25]} />
          <ambientLight intensity={0.85} />
          <directionalLight color="#d9fff3" intensity={2.2} position={[-2.8, 4.2, 4.5]} />
          <directionalLight color="#f26a2e" intensity={0.8} position={[4.2, 0.4, 2.4]} />
          <spotLight
            angle={0.38}
            color="#90f6d9"
            intensity={2.8}
            penumbra={0.82}
            position={[-3.4, 3.2, 4.4]}
          />
          <LockerCubeScene interactionRef={interactionRef} />
        </Canvas>
      </div>
    </div>
  );
}
