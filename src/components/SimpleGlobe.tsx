"use client";

import { useEffect, useRef } from "react";

// Ultra-simple test component to verify Three.js works
export default function SimpleGlobe() {
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const init = async () => {
            try {
                // @ts-ignore
                const THREE = await import("three");

                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(
                    75,
                    window.innerWidth / window.innerHeight,
                    0.1,
                    1000
                );
                const renderer = new THREE.WebGLRenderer({
                    alpha: true,
                    antialias: true,
                });

                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setClearColor(0x000000, 0);
                canvasRef.current?.appendChild(renderer.domElement);

                // Create a simple sphere
                const geometry = new THREE.SphereGeometry(100, 32, 32);
                const material = new THREE.MeshBasicMaterial({
                    color: 0x8a2be2,
                    wireframe: true,
                });
                const sphere = new THREE.Mesh(geometry, material);
                scene.add(sphere);

                camera.position.z = 300;

                function animate() {
                    requestAnimationFrame(animate);
                    sphere.rotation.y += 0.005;
                    renderer.render(scene, camera);
                }
                animate();

                console.log("Simple globe initialized!");
            } catch (err) {
                console.error("Error:", err);
            }
        };

        init();
    }, []);

    return <div ref={canvasRef} style={{ position: "absolute", inset: 0 }} />;
}
