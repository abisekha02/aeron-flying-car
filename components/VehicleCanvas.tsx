
"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

interface VehicleCanvasProps {
  mode: "road" | "flight";
  colorHex: string;
  autoRotate: boolean;
  zoomSignal: number;
  resetSignal: number;
}

function CarModel({
  mode,
  colorHex,
}: {
  mode: "road" | "flight";
  colorHex: string;
}) {
  const { scene } = useGLTF("/models/tesla_roadster.glb");
  const groupRef = useRef<THREE.Group>(null);
  const hoverTime = useRef(0);

  // Clone the GLB scene so material changes do not affect other instances.
  const model = useMemo(() => scene.clone(true), [scene]);

  // Calculate the actual centre and dimensions of the model.
  const modelSettings = useMemo(() => {
    const bounds = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    bounds.getCenter(center);
    bounds.getSize(size);

    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale = 5.2 / maxDimension;

    return {
      center,
      scale,
    };
  }, [model]);

  // Apply body colour and enable shadows.
  useEffect(() => {
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      child.castShadow = true;
      child.receiveShadow = true;

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach((material) => {
        const name = material.name.toLowerCase();

        const isPaint =
          name.includes("paint") ||
          name.includes("bodyshell") ||
          name.includes("body") ||
          name.includes("exterior");

        if (isPaint && "color" in material) {
          const mat = material as THREE.MeshStandardMaterial;
          mat.color.set(colorHex);
          mat.needsUpdate = true;
        }
      });
    });
  }, [model, colorHex]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    hoverTime.current += delta;

    const hover =
      mode === "flight"
        ? Math.sin(hoverTime.current * 2) * 0.07
        : 0;

    const targetY = mode === "flight" ? 0.55 + hover : 0;

    groupRef.current.position.y +=
      (targetY - groupRef.current.position.y) * 0.06;

    const targetTilt =
      mode === "flight"
        ? Math.sin(hoverTime.current * 1.3) * 0.015
        : 0;

    groupRef.current.rotation.z +=
      (targetTilt - groupRef.current.rotation.z) * 0.06;
  });

  return (
    <group ref={groupRef}>
      {/* Centre the model around the scene origin */}
      <primitive
        object={model}
        scale={modelSettings.scale}
        position={[
          -modelSettings.center.x * modelSettings.scale,
          -modelSettings.center.y * modelSettings.scale,
          -modelSettings.center.z * modelSettings.scale,
        ]}
      />

      <PropulsionRings mode={mode} />
    </group>
  );
}

function PropulsionRings({ mode }: { mode: "road" | "flight" }) {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;

    if (materialRef.current) {
      const target =
        mode === "flight"
          ? 0.7 + Math.sin(elapsed.current * 10) * 0.2
          : 0;

      materialRef.current.opacity +=
        (target - materialRef.current.opacity) * 0.1;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.5;
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* Horizontal propulsion ring */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.65, 0.72, 64]} />
        <meshBasicMaterial
          ref={materialRef}
          color="#56C8FF"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight
        position={[0, -0.2, 0]}
        color="#56C8FF"
        intensity={mode === "flight" ? 2 : 0}
        distance={3}
      />
    </group>
  );
}

function Stage() {
  return (
    <group position={[0, -1.05, 0]}>
      {/* Horizontal circular platform */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[4.2, 4.4, 0.12, 96]} />
        <meshStandardMaterial
          color="#0a0c10"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Inner blue ring */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.07, 0]}
      >
        <ringGeometry args={[3.5, 3.56, 96]} />
        <meshBasicMaterial
          color="#56C8FF"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer red ring */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.07, 0]}
      >
        <ringGeometry args={[4.0, 4.05, 96]} />
        <meshBasicMaterial
          color="#FF2638"
          side={THREE.DoubleSide}
        />
      </mesh>

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

function CameraRig({
  autoRotate,
  zoomSignal,
  resetSignal,
}: {
  autoRotate: boolean;
  zoomSignal: number;
  resetSignal: number;
}) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  const previousZoom = useRef(zoomSignal);
  const previousReset = useRef(resetSignal);

  useFrame(() => {
    if (zoomSignal !== previousZoom.current) {
      const difference = zoomSignal - previousZoom.current;

      const direction = new THREE.Vector3()
        .subVectors(new THREE.Vector3(0, 0.3, 0), camera.position)
        .normalize();

      camera.position.addScaledVector(direction, difference * 0.8);
      previousZoom.current = zoomSignal;
    }

    if (resetSignal !== previousReset.current) {
      if (controlsRef.current) {
        controlsRef.current.reset();
      } else {
        camera.position.set(0, 1.8, 6.5);
        camera.lookAt(0, 0.3, 0);
      }

      previousReset.current = resetSignal;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      autoRotate={autoRotate}
      autoRotateSpeed={0.6}
      minDistance={3}
      maxDistance={12}
      minPolarAngle={Math.PI * 0.1}
      maxPolarAngle={Math.PI * 0.65}
      target={[0, 0.3, 0]}
    />
  );
}

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
      camera={{
        position: [0, 1.8, 7],
        fov: 42,
        near: 0.1,
        far: 100,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.3,
        powerPreference: "high-performance",
      }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.6} />

      <directionalLight
        position={[5, 8, 5]}
        intensity={2.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <directionalLight
        position={[-6, 3, -5]}
        intensity={3}
        color="#56C8FF"
      />

      <directionalLight
        position={[6, -1, -4]}
        intensity={2.5}
        color="#FF2638"
      />

      <Environment preset="night" />

      <Stage />

      <React.Suspense fallback={null}>
        <CarModel mode={mode} colorHex={colorHex} />
      </React.Suspense>

      <CameraRig
        autoRotate={autoRotate}
        zoomSignal={zoomSignal}
        resetSignal={resetSignal}
      />
    </Canvas>
  );
}

useGLTF.preload("/models/tesla_roadster.glb");
