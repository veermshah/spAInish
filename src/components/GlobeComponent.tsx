"use client";

import { useEffect, useRef, useState } from "react";

const GlobeComponent = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        let renderer: any, camera: any, scene: any, controls: any, Globe: any;

        const init = async () => {
            try {
                console.log("Starting globe initialization...");

                // Dynamic imports to avoid SSR issues
                // @ts-ignore - Module will be available at runtime
                const THREE = await import("three");
                console.log("Three.js loaded");

                // @ts-ignore - Module will be available at runtime
                const { OrbitControls } = await import(
                    "three/examples/jsm/controls/OrbitControls.js"
                );
                console.log("OrbitControls loaded");

                // @ts-ignore - Module will be available at runtime
                const ThreeGlobe = (await import("three-globe")).default;
                console.log("ThreeGlobe loaded");

                if (!containerRef.current) {
                    console.error("Container ref is null");
                    setError("Container not found");
                    return () => {};
                }

                console.log("Creating renderer...");
                // Initialize renderer
                renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    alpha: true,
                });

                // Get actual container dimensions
                const width = containerRef.current.clientWidth;
                const height = containerRef.current.clientHeight;

                console.log("Container client dimensions:", width, "x", height);

                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(width, height); // Use container dimensions, not window
                renderer.setClearColor(0x000000, 0);

                // Style the canvas element
                const canvas = renderer.domElement;
                canvas.style.display = "block";
                canvas.style.width = "100%";
                canvas.style.height = "100%";

                containerRef.current.appendChild(canvas);
                console.log("Renderer created and added to DOM");
                console.log(
                    "Canvas actual dimensions:",
                    canvas.width,
                    "x",
                    canvas.height
                );
                console.log(
                    "Canvas client dimensions:",
                    canvas.clientWidth,
                    "x",
                    canvas.clientHeight
                );
                console.log(
                    "Container dimensions:",
                    containerRef.current.offsetWidth,
                    "x",
                    containerRef.current.offsetHeight
                );

                // Initialize scene
                scene = new THREE.Scene();
                scene.add(new THREE.AmbientLight(0xffffff, 3)); // Even brighter!

                // Add multiple strong lights from all directions
                const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
                dirLight1.position.set(5, 3, 5);
                scene.add(dirLight1);

                const dirLight2 = new THREE.DirectionalLight(0xffffff, 2);
                dirLight2.position.set(-5, -3, -5);
                scene.add(dirLight2);

                const dirLight3 = new THREE.DirectionalLight(0xffffff, 2);
                dirLight3.position.set(0, 5, 0);
                scene.add(dirLight3);

                const pointLight = new THREE.PointLight(0xffffff, 3, 0);
                pointLight.position.set(0, 0, 300);
                scene.add(pointLight);

                console.log("Scene created with VERY strong lighting");

                // Initialize camera
                camera = new THREE.PerspectiveCamera(
                    75,
                    width / height, // Use container dimensions
                    0.1,
                    1000
                );
                camera.position.z = 200; // Move camera closer
                camera.position.y = 0;
                camera.position.x = 0;
                scene.add(camera);
                console.log("Camera created at position:", camera.position);

                // Initialize controls
                controls = new OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;
                controls.autoRotate = true;
                controls.autoRotateSpeed = 0.5;
                console.log("Controls created");

                // Create a simple textured Earth sphere instead of ThreeGlobe
                console.log("Creating simple Earth sphere...");
                const earthGeometry = new THREE.SphereGeometry(50, 64, 64);

                // Load Earth texture
                const textureLoader = new THREE.TextureLoader();
                const earthTexture = textureLoader.load(
                    "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
                    () => console.log("Earth texture loaded successfully"),
                    undefined,
                    (err) => console.error("Error loading texture:", err)
                );

                const earthMaterial = new THREE.MeshStandardMaterial({
                    map: earthTexture,
                    metalness: 0,
                    roughness: 0.5,
                    emissive: new THREE.Color(0x112244), // Make it glow slightly
                    emissiveIntensity: 0.2,
                });

                const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
                scene.add(earthMesh);
                console.log("Simple Earth sphere added to scene");

                // Remove the debug sphere since we have the Earth now
                // (Comment out the debug sphere code below)

                setIsLoading(false);
                console.log("Loading complete!");

                // Animation loop
                const animate = () => {
                    controls.update();
                    renderer.render(scene, camera);
                    animationRef.current = requestAnimationFrame(animate);
                };

                // Handle window resize
                const onWindowResize = () => {
                    if (!containerRef.current) return;
                    const newWidth = containerRef.current.clientWidth;
                    const newHeight = containerRef.current.clientHeight;
                    camera.aspect = newWidth / newHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(newWidth, newHeight);
                };

                window.addEventListener("resize", onWindowResize);
                animate();

                // Cleanup function
                return () => {
                    window.removeEventListener("resize", onWindowResize);
                    if (animationRef.current) {
                        cancelAnimationFrame(animationRef.current);
                    }
                    if (renderer) {
                        renderer.dispose();
                    }
                    if (containerRef.current && renderer?.domElement) {
                        try {
                            containerRef.current.removeChild(
                                renderer.domElement
                            );
                        } catch (e) {
                            console.log("Cleanup error:", e);
                        }
                    }
                };
            } catch (error) {
                console.error("Error initializing globe:", error);
                setError(
                    error instanceof Error ? error.message : "Unknown error"
                );
                setIsLoading(false);
                return () => {};
            }
        };

        const cleanup = init();

        return () => {
            cleanup.then((cleanupFn) => cleanupFn && cleanupFn());
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100vh",
                margin: 0,
                padding: 0,
                overflow: "hidden",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 1,
                pointerEvents: "auto",
            }}
        >
            {error && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#ff0000",
                        fontSize: "16px",
                        zIndex: 10,
                    }}
                >
                    Error: {error}
                </div>
            )}
        </div>
    );
};

export default GlobeComponent;
