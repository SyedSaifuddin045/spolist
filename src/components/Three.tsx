import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

export default function Three() {
    return (
        <div>
            <Canvas
                style={{ background: 'black' }} // Set background color to black
                shadows={true}
                camera={{
                    position: [-6, 7, 7],
                }}
            >
                {/* Add your Three.js objects or components here */}
                <ambientLight intensity={1.0} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </Canvas>
        </div>
    );
}
