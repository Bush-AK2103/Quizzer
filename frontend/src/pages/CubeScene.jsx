import  { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function CubeScene({ onFileSelect, loading }) {  // <-- accept loading prop
  const mountRef = useRef(null);
  const inputRef = useRef(null);
  const capRef = useRef(null);
  const capOpenRef = useRef(false);
  const cubeRef = useRef(null);  // <-- ref to rotate cube
  const loadingRef = useRef(loading);

  useEffect(() => {
    const mount = mountRef.current;
    

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(4, 4, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Cube
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(3, 3, 3),
      [
        new THREE.MeshStandardMaterial({ color: 0x00a5a9 }),
        new THREE.MeshStandardMaterial({ color: 0x00a5a9 }),
        new THREE.MeshStandardMaterial({ color: 0x000000 }),
        new THREE.MeshStandardMaterial({ color: 0x00a5a9 }),
        new THREE.MeshStandardMaterial({ color: 0x00a5a9 }),
        new THREE.MeshStandardMaterial({ color: 0x00a5a9 }),
      ]
    );
    cubeRef.current = cube;  // <-- store cube reference
    scene.add(cube);

    // Cap
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.6, 3),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    cap.position.set(0, 1.8, 0);
    capRef.current = cap;
    cube.add(cap);

    // Ribbon
    const ribbon = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.61, 3.02),
      new THREE.MeshStandardMaterial({ color: 0x00a5a9 })
    );
    cap.add(ribbon);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    // Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event) => {
      const bounds = mount.getBoundingClientRect();
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(cube);

      if (intersects.length > 0) {
        capOpenRef.current = true;
        inputRef.current.click();
      }
    };

    mount.addEventListener('click', handleClick);
    loadingRef.current = loading;

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);

      if (capRef.current) {
        const targetRotation = capOpenRef.current ? -Math.PI / 3 : 0;
        const targetPosition = capOpenRef.current
          ? new THREE.Vector3(1.5, 2.6, 0)
          : new THREE.Vector3(0, 1.8, 0);

        capRef.current.rotation.z = THREE.MathUtils.lerp(
          capRef.current.rotation.z,
          targetRotation,
          0.1
        );
        capRef.current.position.lerp(targetPosition, 0.1);
      }

      // 🔄 Add horizontal rotation if loading
      if (loadingRef.current && cubeRef.current) {
        cubeRef.current.rotation.y += 0.05;
      }

      renderer.render(scene, camera);
    };
    if (!loading && cubeRef.current && cubeRef.current.rotation.y !== 0) {
      cubeRef.current.rotation.y = THREE.MathUtils.lerp(cubeRef.current.rotation.y, 0, 0.1);
    }
    
    animate();

    // Resize
    const handleResize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      mount.removeEventListener('click', handleClick);
    };
  }, [loading]);  // <- rebind animation when loading changes

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      capOpenRef.current = false;
      return;
    }

    onFileSelect?.(file);
    capOpenRef.current = false;
  };

  return (
    <>
      <div
        ref={mountRef}
        style={{ width: '100%', height: '400px', cursor: 'pointer' }}
      />
      <input
        type="file"
        accept="application/pdf"
        ref={inputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  );
}
