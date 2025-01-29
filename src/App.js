import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import "./App.css"; 

function App() {
  const [moveCount, setMoveCount] = useState(0);
  const mountRef = useRef(null);
  let rubikGroup = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222);

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(3, 4, 6);
    camera.lookAt(-1, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Grupo principal del cubo Rubik
    const group = createRubikCube();
    rubikGroup.current = group;
    scene.add(group);

    // Interacción con ratón
    let isDraggingScene = false;
    let isDraggingCube = false;
    let previousMousePosition = { x: 0, y: 0 };

    let selectedCubie = null;
    let selectedFaceNormal = null;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const allCubies = group.children;

    // Variables para la rotación (drag + snap)
    let tempGroup = null;
    let axis = null;
    let layerIndex = 0;
    let currentAngle = 0;
    let isSnapping = false;
    let snapStartAngle = 0;
    let snapEndAngle = 0;
    let snapStartTime = 0;
    const SNAP_DURATION = 200; 

    
    // Funciones para crear el cubo
    function createRubikCube() {
      const rubik = new THREE.Group();
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const offset = 1.1; 

      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            const materials = getCubieMaterials(x, y, z);
            const mesh = new THREE.Mesh(geometry, materials);
            mesh.position.set(x * offset, y * offset, z * offset);
            rubik.add(mesh);
          }
        }
      }
      return rubik;
    }

    function getCubieMaterials(x, y, z) {
      const black = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const mats = [
        black.clone(), 
        black.clone(), 
        black.clone(), 
        black.clone(), 
        black.clone(), 
        black.clone() 
      ];

      if (x === 1)  mats[0] = new THREE.MeshBasicMaterial({ color: 0xffa500 });
      if (x === -1) mats[1] = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      if (y === 1)  mats[2] = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      if (y === -1) mats[3] = new THREE.MeshBasicMaterial({ color: 0xffffff });
      if (z === 1)  mats[4] = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      if (z === -1) mats[5] = new THREE.MeshBasicMaterial({ color: 0x0000ff });

      return mats;
    }

    
    // Lógica de rotación (drag + snap)
    function startLayerRotation(subCubie, faceNormal) {
      const { x, y, z } = subCubie.position;
      const gridX = Math.round(x);
      const gridY = Math.round(y);
      const gridZ = Math.round(z);

      if (Math.abs(faceNormal.x) > 0.9) {
        axis = new THREE.Vector3(1, 0, 0);
        layerIndex = gridX;
      } else if (Math.abs(faceNormal.y) > 0.9) {
        axis = new THREE.Vector3(0, 1, 0);
        layerIndex = gridY;
      } else if (Math.abs(faceNormal.z) > 0.9) {
        axis = new THREE.Vector3(0, 0, 1);
        layerIndex = gridZ;
      }

      tempGroup = new THREE.Group();
      group.add(tempGroup);

      const subCubies = group.children.filter((mesh) => {
        if (mesh === tempGroup) return false;
        const px = Math.round(mesh.position.x);
        const py = Math.round(mesh.position.y);
        const pz = Math.round(mesh.position.z);

        if (axis.x !== 0) return px === layerIndex;
        if (axis.y !== 0) return py === layerIndex;
        if (axis.z !== 0) return pz === layerIndex;
        return false;
      });
      subCubies.forEach((c) => tempGroup.attach(c));

      currentAngle = 0;
    }

    function dragLayerRotation(deltaX) {
      const angle = deltaX * 0.01;
      currentAngle += angle;
      tempGroup.rotateOnWorldAxis(axis, angle);
    }

    function endLayerRotation() {
      // Snap al múltiplo de 90°
      const multiples90 = Math.round(currentAngle / (Math.PI / 2));
      snapEndAngle = multiples90 * (Math.PI / 2);
      snapStartAngle = currentAngle;
      snapStartTime = performance.now();
      isSnapping = true;
    }

    function updateSnapAnimation() {
      const now = performance.now();
      const elapsed = now - snapStartTime;
      const t = Math.min(elapsed / SNAP_DURATION, 1);

      const targetAngle = snapStartAngle + (snapEndAngle - snapStartAngle) * t;
      const delta = targetAngle - currentAngle;
      tempGroup.rotateOnWorldAxis(axis, delta);
      currentAngle = targetAngle;

      if (t >= 1) {
        
        isSnapping = false;
        const subCubies = tempGroup.children.slice();
        subCubies.forEach((c) => group.attach(c));
        group.remove(tempGroup);
        tempGroup = null;

        setMoveCount((prev) => prev + 1);
      }
    }

    
    // Handlers de ratón
    const onMouseDown = (event) => {
      event.preventDefault();
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(allCubies);

      if (intersects.length > 0) {
        isDraggingCube = true;
        selectedCubie = intersects[0].object;
        selectedFaceNormal = intersects[0].face.normal.clone();
        startLayerRotation(selectedCubie, selectedFaceNormal);
      } else {
        
        isDraggingScene = true;
      }

      previousMousePosition.x = event.clientX;
      previousMousePosition.y = event.clientY;
    };

    const onMouseMove = (event) => {
      event.preventDefault();
      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;

      if (isDraggingScene) {
        group.rotation.y += deltaX * 0.01;
        group.rotation.x += deltaY * 0.01;
      } else if (isDraggingCube && tempGroup) {
        dragLayerRotation(deltaX);
      }

      previousMousePosition.x = event.clientX;
      previousMousePosition.y = event.clientY;
    };

    const onMouseUp = () => {
      if (isDraggingCube && tempGroup) {
        endLayerRotation();
      }
      isDraggingScene = false;
      isDraggingCube = false;
      selectedCubie = null;
      selectedFaceNormal = null;
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown, false);
    renderer.domElement.addEventListener("mousemove", onMouseMove, false);
    renderer.domElement.addEventListener("mouseup", onMouseUp, false);

    
    const animate = () => {
      requestAnimationFrame(animate);
      if (isSnapping && tempGroup) {
        updateSnapAnimation();
      }
      renderer.render(scene, camera);
    };
    animate();

    
    return () => {
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseup", onMouseUp);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  //  NUEVA FUNCIÓN: ROTA UNA CAPA CON ANIMACIÓN (0° -> 90°)
  const rotateLayerAnimated = (
    rubikGroup,
    axisKey,
    layerIndex,
    angle,
    duration = 300,
    shouldIncrementCounter = true
  ) => {
    return new Promise((resolve) => {
      let axisVec;
      if (axisKey === "x") axisVec = new THREE.Vector3(1, 0, 0);
      if (axisKey === "y") axisVec = new THREE.Vector3(0, 1, 0);
      if (axisKey === "z") axisVec = new THREE.Vector3(0, 0, 1);

      const temp = new THREE.Group();
      rubikGroup.add(temp);

      const subCubies = rubikGroup.children.filter((mesh) => {
        if (mesh === temp) return false;
        const px = Math.round(mesh.position.x);
        const py = Math.round(mesh.position.y);
        const pz = Math.round(mesh.position.z);

        if (axisKey === "x") return px === layerIndex;
        if (axisKey === "y") return py === layerIndex;
        if (axisKey === "z") return pz === layerIndex;
        return false;
      });

      subCubies.forEach((c) => temp.attach(c));

      const startTime = performance.now();
      let oldT = 0;

      function animateRotation(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);

        const rotateStep = (t - oldT) * angle;
        oldT = t;
        temp.rotateOnWorldAxis(axisVec, rotateStep);

        if (t < 1) {
          requestAnimationFrame(animateRotation);
        } else {
          subCubies.forEach((c) => rubikGroup.attach(c));
          rubikGroup.remove(temp);

          if (shouldIncrementCounter) {
            setMoveCount((prev) => prev + 1);
          }
          resolve();
        }
      }

      requestAnimationFrame(animateRotation);
    });
  };

  // RANDOMIZAR: 10 movimientos secuenciales con animación
  const handleRandomize = async () => {
    if (!rubikGroup.current) return;

    
    const moves = [];
    for (let i = 0; i < 10; i++) {
      const randomAxis = ["x", "y", "z"][Math.floor(Math.random() * 3)];
      const randomLayer = [-1, 0, 1][Math.floor(Math.random() * 3)];
      const randomDirection = [1, -1][Math.floor(Math.random() * 2)];
      moves.push({
        axis: randomAxis,
        layer: randomLayer,
        angle: randomDirection * (Math.PI / 2),
      });
    }

    // Los aplicamos uno tras otro (secuencial)
    for (let move of moves) {
      await rotateLayerAnimated(
        rubikGroup.current,
        move.axis,
        move.layer,
        move.angle,
        300,
        false
      );
    }
  };

  return (
    <div className="App">
      <main className="main-container">
        <div ref={mountRef} className="canvas-container" />
      </main>

      <footer className="footer">
        <div>
          <h1 className="footer-title">Cubo de rubik con WebGL y three.js | Programación gráfica</h1>
        </div>

        <p className="footer-author">Jose María García Quijada</p>

        <div className="footer-right">
          <p className="move-count">
            <strong>Movimientos:</strong> {moveCount}
          </p>
          <button onClick={handleRandomize} className="randomize-button">
            Randomizar
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
