import * as THREE from 'three';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

class CasablancaBuoyEntity {

  isLoaded = false;

  constructor(scene){
    // https://www.youtube.com/watch?v=6LA8vEB47Nk&ab_channel=DirkTeucher
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/CasablancaBuoy/Assets/CasablancaBuoy/CasablancaBuoy.glb', (gltf) => {
      // GLTF scene
      const root = gltf.scene;
      // Fix frustrum culling
      root.children[0].frustumCulled = false;
      // Scene direction fix
      const angleFix = 90;

      root.rotation.y = angleFix * Math.PI / 180;

      this.root = root;

      // Material AO
      let mesh = root.children[0];
      let material = mesh.material;    

      // Move upwards
      mesh.translateY(0.3);


      scene.add(root);
      this.isLoaded = true;

    });
  }
}

export { CasablancaBuoyEntity }