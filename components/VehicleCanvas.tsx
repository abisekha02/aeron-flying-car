
"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

/* --------------------------------------------------
   TYPES
-------------------------------------------------- */

interface VehicleCanvasProps {
  mode: "road" | "flight";
  colorHex: string;
  autoRotate: boolean;
  zoomSignal: number;
  resetSignal: number;
}

/* --------------------------------------------------
   PLASMA JET
   One jet beneath each tyre
-------------------------------------------------- */

function PlasmaJet({
  length,
  delay = 0,
}: {
  length: number;
  delay?: number;
}) {
  const jetRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.MeshBasicMaterial>(null);
  const innerRef = useRef<THREE.MeshBasicMaterial>(null);
  const particleRefs = useRef<(THREE.Mesh | null)[]>([]);
  const time = useRef(delay);

  useFrame((_, delta) => {
    time.current += delta;

    const pulse = (Math.sin(time.current * 9) + 1) / 2;
    const lengthScale = 0.75 + pulse * 0.3;

    if (jetRef.current) {
      jetRef.current.scale.y = lengthScale;
    }

    if (outerRef.current) {
      outerRef.current.opacity = 0.48 + pulse * 0.35;
    }

    if (innerRef.current) {
      innerRef.current.opacity = 0.65 + pulse * 0.3;
    }

    particleRefs.current.forEach((particle, index) => {
      if (!particle) return;

      const phase = (time.current * 1.8 + index * 0.33) % 1;

      particle.position.y = -length * phase;
      particle.scale.setScalar(0.035 * (1 - phase));
    });
  });

  return (
    <group ref={jetRef}>
      {/* Outer blue plasma flame */}
      <mesh
        position={[0, -length / 2, 0]}
        rotation={[Math.PI, 0, 0]}
      >
        <coneGeometry args={[0.19, length, 20, 1]} />
        <meshBasicMaterial
          ref={outerRef}
          color="#36BFFF"
          transparent
          opacity={0.7}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Bright white-blue flame core */}
      <mesh
        position={[0, -length * 0.35, 0]}
        rotation={[Math.PI, 0, 0]}
      >
        <coneGeometry args={[0.075, length * 0.7, 16, 1]} />
        <meshBasicMaterial
          ref={innerRef}
          color="#E8FFFF"
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Subtle red propulsion core */}
      <mesh position={[0, -0.04, 0]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshBasicMaterial
          color="#FF2638"
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Moving plasma particles */}
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          ref={(element) => {
            particleRefs.current[index] = element;
          }}
          position={[0, 0, 0]}
        >
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial
            color="#B8F5FF"
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      <pointLight
        position={[0, -length * 0.25, 0]}
        color="#38C8FF"
        intensity={2.5}
        distance={length * 1.5}
      />
    </group>
  );
}

/* --------------------------------------------------
   FOUR TYRE PLASMA JETS
-------------------------------------------------- */

function TyrePlasmaJets({
  mode,
  positions,
  length,
}: {
  mode: "road" | "flight";
  positions: [number, number, number][];
  length: number;
}) {
  if (mode !== "flight") return null;

  return (
    <group>
      {positions.map((position, index) => (
        <group key={index} position={position}>
          <PlasmaJet
            length={length}
            delay={index * 0.4}
          />
        </group>
      ))}
    </group>
  );
}

/* --------------------------------------------------
   CAR MODEL
-------------------------------------------------- */

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

  // Clone model and materials
  const model = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      if (Array.isArray(child.material)) {
        child.material = child.material.map((material) =>
          material.clone()
        );
      } else {
        child.material = child.material.clone();
      }

      child.castShadow = true;
      child.receiveShadow = true;
    });

    return cloned;
  }, [scene]);

  // Calculate actual model dimensions and center
  const modelSettings = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    box.getCenter(center);
    box.getSize(size);

    const maxDimension = Math.max(size.x, size.z);
    const scale = 4.8 / maxDimension;

    /*
      Assumption: X is the vehicle's width
      and Z is its length.

      The four jet positions are estimated from
      the vehicle's bounding box.
    */

    const wheelX = size.x * 0.34;
    const wheelZ = size.z * 0.32;
    const wheelY = box.min.y + size.y * 0.25;

    const tyrePositions: [number, number, number][] = [
      [center.x - wheelX, wheelY, center.z - wheelZ],
      [center.x + wheelX, wheelY, center.z - wheelZ],
      [center.x - wheelX, wheelY, center.z + wheelZ],
      [center.x + wheelX, wheelY, center.z + wheelZ],
    ];

    return {
      center,
      size,
      scale,
      tyrePositions,
      jetLength: size.y * 0.85,
    };
  }, [model]);

  // Change body paint
  useEffect(() => {
    const selectedColor = new THREE.Color(colorHex);

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach((material) => {
        const name = material.name.toLowerCase();

        const isBodyPaint =
          name.includes("paint") ||
          name.includes("bodyshell") ||
          name.includes("body") ||
          name.includes("exterior");

        if (isBodyPaint && "color" in material) {
          (material as THREE.MeshStandardMaterial).color.set(
            selectedColor
          );
          material.needsUpdate = true;
        }
      });
    });
  }, [colorHex, model]);

  // Flight levitation animation
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    hoverTime.current += delta;

    const hover =
      mode === "flight"
        ? 0.35 + Math.sin(hoverTime.current * 2) * 0.045
        : 0;

    groupRef.current.position.y +=
      (hover - groupRef.current.position.y) * 0.07;

    const tilt =
      mode === "flight"
        ? Math.sin(hoverTime.current * 1.3) * 0.012
        : 0;

    groupRef.current.rotation.z +=
      (tilt - groupRef.current.rotation.z) * 0.06;
  });

  return (
    <group ref={groupRef}>
      {/* Center and scale the actual Tesla model */}
      <group
        scale={modelSettings.scale}
        position={[
          -modelSettings.center.x * modelSettings.scale,
          -modelSettings.center.y * modelSettings.scale,
          -modelSettings.center.z * modelSettings.scale,
        ]}
      >
        <primitive object={model} />

        {/* Four downward-facing plasma jets */}
        <TyrePlasmaJets
          mode={mode}
          positions={modelSettings.tyrePositions}
          length={modelSettings.jetLength}
        />
      </group>
    </group>
  );
}

/* --------------------------------------------------
   HORIZONTAL CIRCULAR DISPLAY PLATFORM
-------------------------------------------------- */

function Stage() {
  return (
    <group position={[0, -0.65, 0]}>
      {/* Cylinder's default Y axis is already vertical.
          Do NOT rotate this cylinder by -Math.PI / 2. */}
      <mesh receiveShadow>
        <cylinderGeometry args={[3.7, 3.9, 0.12, 96]} />
        <meshStandardMaterial
          color="#0a0c10"
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* Blue ring - ringGeometry lies in XY by default */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.07, 0]}
      >
        <ringGeometry args={[2.9, 2.94, 96]} />
        <meshBasicMaterial
          color="#56C8FF"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Red outer ring */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.075, 0]}
      >
        <ringGeometry args={[3.45, 3.5, 96]} />
        <meshBasicMaterial
          color="#FF2638"
          side={THREE.DoubleSide}
        />
      </mesh>

      <ContactShadows
        position={[0, -0.055, 0]}
        opacity={0.5}
        scale={9}
        blur={2}
        far={4}
        resolution={256}
        color="#000000"
      />
    </group>
  );
}

/* --------------------------------------------------
   CAMERA CONTROLS
-------------------------------------------------- */

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

  const previousZoom = useRef(zoomSignal);
  const previousReset = useRef(resetSignal);

  useFrame(() => {
    if (zoomSignal !== previousZoom.current) {
      const difference = zoomSignal - previousZoom.current;

      const direction = new THREE.Vector3()
        .subVectors(
          new THREE.Vector3(0, 0.2, 0),
          camera.position
        )
        .normalize();

      camera.position.addScaledVector(
        direction,
        difference * 0.7
      );

      previousZoom.current = zoomSignal;
    }

    if (resetSignal !== previousReset.current) {
      camera.position.set(0, 2.2, 8);
      camera.lookAt(0, 0.2, 0);

      orbitRef.current?.reset();

      previousReset.current = resetSignal;
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
      minDistance={4}
      maxDistance={13}
      minPolarAngle={Math.PI * 0.12}
      maxPolarAngle={Math.PI * 0.65}
      target={[0, 0.2, 0]}
    />
  );
}

/* --------------------------------------------------
   MAIN CANVAS
-------------------------------------------------- */

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
        position: [0, 2.2, 8],
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
      {/* Lighting */}
      <ambientLight intensity={0.7} />

      <directionalLight
        position={[5, 8, 5]}
        intensity={2.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <directionalLight
        position={[-6, 3, -5]}
        intensity={2.5}
        color="#56C8FF"
      />

      <directionalLight
        position={[6, -1, -4]}
        intensity={2}
        color="#FF2638"
      />

      {/* Environment reflections */}
      <Environment preset="night" />

      {/* Platform */}
      <Stage />

      {/* Actual Tesla Roadster */}
      <React.Suspense fallback={null}>
        <CarModel
          mode={mode}
          colorHex={colorHex}
        />
      </React.Suspense>

      {/* Camera */}
      <CameraRig
        autoRotate={autoRotate}
        zoomSignal={zoomSignal}
        resetSignal={resetSignal}
      />
    </Canvas>
  );
}

// Preload model
useGLTF.preload("/models/tesla_roadster.glb");
