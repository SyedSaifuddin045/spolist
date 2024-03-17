import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import React, { useRef, useEffect, useState } from 'react';

export default function Three() {
    const meshRef = useRef<THREE.Mesh>(null);
    const rotationSpeed = 0.03;

    const randomDirection = () => {
        const randomVector = new THREE.Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        );
        randomVector.normalize();
        return randomVector;
    };

    const [rotationAxis, setRotationAxis] = useState(randomDirection()); // Initial random direction

    useEffect(() => {
        const intervalId = setInterval(() => {
            setRotationAxis(randomDirection()); // Change rotation direction every 5 seconds
        }, 5000);

        return () => {
            clearInterval(intervalId); // Clean up the interval on unmount
        };
    }, []);

    const update = () => {
        if (meshRef.current) {
            meshRef.current.rotation.x += rotationAxis.x * rotationSpeed;
            meshRef.current.rotation.y += rotationAxis.y * rotationSpeed;
            meshRef.current.rotation.z += rotationAxis.z * rotationSpeed;
        }
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas
                style={{ background: 'black' }} // Set background color to black and occupy full space
                shadows={true}
                camera={{
                    position: [-6, 7, 7],
                }}
                onCreated={({ gl }) => {
                    gl.setAnimationLoop(() => {
                        update();
                    });
                }}
            >
                {/* Add your Three.js objects or components here */}
                <ambientLight intensity={1.0} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />

                {/* IcosahedronGeometry */}
                <mesh position={[0, 0, 0]} ref={meshRef}>
                    <icosahedronGeometry args={[5, 10]} /> {/* Radius = 5, Detail = 10 */}
                    <meshStandardMaterial wireframe={true} color="white" />
                </mesh>
            </Canvas>
        </div>
    );
}
