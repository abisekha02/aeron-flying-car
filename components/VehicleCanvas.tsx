"use client";

/**
 * VehicleCanvas.tsx
 * Lazy-loaded React Three Fiber canvas.
 * Loads tesla_roadster.glb, applies colour overrides, road/flight animation.
 * Imported via dynamic() in VehicleViewer3D.tsx (no SSR).
 */

import React, { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/* ─── types ─── */
interface VehicleCanvasProps {
  mode: "road" | "flight";
  colorHex: string;
  autoRotate: boolean;
  zoomSignal: number;
  resetSignal: number;
}

/* ─────────────────────────────────────────────
   The GLB model rendered inside R3F
───────────────────────────────────────────── */
function CarModel({
  mode,
  colorHex,
}: {
  mode: "road" | "flight";
  colorHex: string;
}) {
  const { scene } = useGLTF("/models/tesla_roadster.glb");
  const groupRef = useRef<THREE.Group>(null);

  // Target position/rotation for smooth lerp
  const targetY = useRef(mode === "flight" ? 0.5 : 0);
  const hoverOffset = useRef(0);
  const hoverTime = useRef(0);

  useEffect(() => {
    targetY.current = mode === "flight" ? 0.5 : 0;
  }, [mode]);

  // Apply colour override to body-paint-related materials
  useEffect(() => {
    const color = new THREE.Color(colorHex);
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = child.material;
      if (!mat) return;

      // Target body/paint meshes by material name patterns
      const matName: string =
        (mat as THREE.MeshStandardMaterial).name?.toLowerCase() ?? "";
      const isPaint =
        matName.includes("paint") ||
        matName.includes("body") ||
        matName.includes("bodyshell") ||
        matName.includes("exterior");

      if (isPaint) {
        const m = mat as THREE.MeshPhysicalMaterial;
        m.color.set(color);
        m.needsUpdate = true;
      }
    });
  }, [colorHex, scene]);

  // Enable shadows on all meshes
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    hoverTime.current += delta;

    // Smooth Y levitation in flight mode
    const hover =
      mode === "flight" ? Math.sin(hoverTime.current * 2.0) * 0.07 : 0;
    const tY = targetY.current + hover;

    groupRef.current.position.y +=
      (tY - groupRef.current.position.y) * 0.06;

    // Slight tilt in flight mode
    const tZ = mode === "flight" ? Math.sin(hoverTime.current * 1.3) * 0.015 : 0;
    groupRef.current.rotation.z +=
      (tZ - groupRef.current.rotation.z) * 0.06;
  });

  return (
    <group ref={groupRef} dispose={null}>
      {/* Scale and center the GLB */}
      <primitive
        object={scene}
        scale={[1.2, 1.2, 1.2]}
        rotation={[0, Math.PI / 6, 0]}
      />

      {/* Propulsion glow rings (visible in flight mode) */}
      <PropulsionRings mode={mode} />
    </group>
  );
}

/* ─────────────────────────────────────────────
   Propulsion glow effect (flight mode)
───────────────────────────────────────────── */
function PropulsionRings({ mode }: { mode: "road" | "flight" }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (matRef.current) {
      const target = mode === "flight" ? 0.7 + Math.sin(t.current * 10) * 0.2 : 0;
      matRef.current.opacity += (target - matRef.current.opacity) * 0.1;
    }
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 2;
    }
  });

  return (
    <group position={[0, -0.6, 0]}>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.65, 64]} />
        <meshBasicMaterial
          ref={matRef}
          color="#56C8FF"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight
        position={[0, -0.4, 0]}
        color="#56C8FF"
        intensity={mode === "flight" ? 3 : 0}
        distance={3}
      />
    </group>
  );
}

/* ─────────────────────────────────────────────
   Circular tech stage (ground disc + rings)
───────────────────────────────────────────── */
function Stage() {
  return (
    <group position={[0, -1.05, 0]}>
      {/* Main disc */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[4.2, 4.4, 0.12, 64]} />
        <meshStandardMaterial color="#0a0c10" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Inner ring – electricBlue */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <ringGeometry args={[3.5, 3.56, 64]} />
        <meshBasicMaterial color="#56C8FF" side={THREE.DoubleSide} />
      </mesh>

      {/* Outer ring – crimson */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <ringGeometry args={[4.0, 4.05, 64]} />
        <meshBasicMaterial color="#FF2638" side={THREE.DoubleSide} />
      </mesh>

      {/* Floor reflection plane */}
      <ContactShadows
        opacity={0.5}
        scale={10}
        blur={2}
        far={4}
        resolution={256}
        color="#000000"
      />
    </group>
  );
}

/* ─────────────────────────────────────────────
   Camera rig (orbit controls + zoom/reset signals)
───────────────────────────────────────────── */
function CameraRig({
  autoRotate,
  zoomSignal,
  resetSignal,
}: {
  autoRotate: boolean;
  zoomSignal: number;
  resetSignal: number;
}) {
  const orbitRef = useRef<any>(null);
  const { camera } = useThree();

  // Zoom signal handler
  const prevZoom = useRef(zoomSignal);
  const prevReset = useRef(resetSignal);

  useFrame(() => {
    // Handle zoom changes
    if (zoomSignal !== prevZoom.current) {
      const delta = zoomSignal - prevZoom.current;
      const dir = new THREE.Vector3()
        .subVectors(
          new THREE.Vector3(0, 0.5, 0),
          camera.position
        )
        .normalize();
      camera.position.addScaledVector(dir, delta * 0.8);
      prevZoom.current = zoomSignal;
    }

    // Handle reset
    if (resetSignal !== prevReset.current) {
      camera.position.set(0, 1.8, 6.5);
      camera.lookAt(0, 0.5, 0);
      if (orbitRef.current) orbitRef.current.reset();
      prevReset.current = resetSignal;
    }
  });

  return (
    <OrbitControls
      ref={orbitRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      autoRotate={autoRotate}
      autoRotateSpeed={0.6}
      minDistance={3.0}
      maxDistance={12}
      minPolarAngle={Math.PI * 0.1}
      maxPolarAngle={Math.PI * 0.65}
      target={[0, 0.2, 0]}
    />
  );
}

/* ─────────────────────────────────────────────
   Loading fallback (shows inside Canvas)
───────────────────────────────────────────── */
function CanvasLoader() {
  return null; // Outer Suspense fallback handles UI
}

/* ─────────────────────────────────────────────
   Root export — the full R3F canvas
───────────────────────────────────────────── */
export default function VehicleCanvas({
  mode,
  colorHex,
  autoRotate,
  zoomSignal,
  resetSignal,
}: VehicleCanvasProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.8, 6.5], fov: 42, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.3,
        powerPreference: "high-performance",
      }}
      style={{ background: "transparent" }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={2.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Rim lights – brand colours */}
      <directionalLight position={[-6, 3, -5]} intensity={3.0} color="#56C8FF" />
      <directionalLight position={[6, -1, -4]} intensity={2.5} color="#FF2638" />

      {/* Environment for PBR reflections */}
      <Environment preset="night" />

      {/* Stage platform */}
      <Stage />

      {/* GLB car model */}
      <React.Suspense fallback={<CanvasLoader />}>
        <CarModel mode={mode} colorHex={colorHex} />
      </React.Suspense>

      {/* Camera controls */}
      <CameraRig
        autoRotate={autoRotate}
        zoomSignal={zoomSignal}
        resetSignal={resetSignal}
      />
    </Canvas>
  );
}

// Preload GLB for faster initial render
useGLTF.preload("/models/tesla_roadster.glb");
