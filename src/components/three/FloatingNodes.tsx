"use client";
import React, { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";

const SphereNode = () => {
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Sphere args={[1, 16, 16]} scale={1.5}>
                <MeshDistortMaterial
                    color="#EFEDE3"
                    attach="material"
                    distort={0.3}
                    speed={1.5}
                    roughness={0.1}
                />
            </Sphere>
        </Float>
    );
};

const PointsNode = () => {
    const points = useMemo(() => {
        const p = new Float32Array(300 * 3); // Reduced count
        for (let i = 0; i < 300; i++) {
            p[i * 3] = (Math.random() - 0.5) * 4;
            p[i * 3 + 1] = (Math.random() - 0.5) * 4;
            p[i * 3 + 2] = (Math.random() - 0.5) * 4;
        }
        return p;
    }, []);

    return (
        <Points positions={points} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#EFEDE3"
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
            />
        </Points>
    );
};

export function FloatingAnimation({ type }: { type: 1 | 2 | 3 | 4 }) {
    const [dpr, setDpr] = React.useState(1.5);

    return (
        <div className="w-full h-full min-h-[250px] rounded-2xl overflow-hidden bg-black/5 backdrop-blur-sm border border-white/5">
            <Canvas
                shadows={false}
                dpr={dpr}
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{ antialias: false, powerPreference: "high-performance" }}
            >
                <PerformanceMonitor onDecline={() => setDpr(1)} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Suspense fallback={null}>
                    {type === 1 && <SphereNode />}
                    {type === 2 && <PointsNode />}
                    {(type === 3 || type === 4) && <SphereNode />}
                </Suspense>
            </Canvas>
        </div>
    );
}
