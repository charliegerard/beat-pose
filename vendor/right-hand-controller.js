let el, self;
import {rightHandPosition} from './pose-detection.js';
let previousRightHandPosition = {x: 0, y: 0, z: -0.2};

AFRAME.registerComponent('right-hand-controller', {
    schema: {
        width: {type: 'number', default: 1},
        height: {type: 'number', default: 1},
        depth: {type: 'number', default: 1},
        color: {type: 'color', default: '#AAA'},
    },
    init: function () {
        var data = this.data;
        el = this.el;
        self = this;
    
        this.geometry = new THREE.BoxGeometry(data.width, data.height, data.depth);
        this.material = new THREE.MeshStandardMaterial({color: data.color});
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        el.setObject3D('mesh', this.mesh);
    },
    update: function(){
        this.checkHands();
    },
    checkHands: function getHandsPosition() {
        if(rightHandPosition && rightHandPosition !== previousRightHandPosition){
            self.onHandMove();
            previousRightHandPosition = rightHandPosition;
        }
        window.requestAnimationFrame(getHandsPosition);
    },
    onHandMove: function(){
        const handVector = new THREE.Vector3();
        handVector.x = (rightHandPosition.x / window.innerWidth) * 2 - 1;
        handVector.y = - (rightHandPosition.y / window.innerHeight) * 2 + 1; 
        handVector.z = 0;

        const camera = self.el.sceneEl.camera;
        handVector.unproject(camera);

        const cameraObjectPosition = camera.el.object3D.position;
        const dir = handVector.sub(cameraObjectPosition).normalize();
        const distance = - cameraObjectPosition.z / dir.z;
        const pos = cameraObjectPosition.clone().add(dir.multiplyScalar(distance));
        el.object3D.position.copy(pos);
        el.object3D.position.z = -0.2;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(handVector, camera);

        const entities = document.querySelectorAll('[beatObject]'); 
        const entitiesObjects = [];

        if(Array.from(entities).length){
            for(var i = 0; i < Array.from(entities).length; i++){
                const beatMesh = entities[i].object3D.el.object3D.el.object3D.el.object3D.children[0].children[1];
                entitiesObjects.push(beatMesh);
            }

            let intersects = raycaster.intersectObjects(entitiesObjects, true);
            if(intersects.length){
                const beat = intersects[0].object.el.attributes[0].ownerElement.parentEl.components.beat;
                const beatColor = beat.attrValue.color;
                const beatType = beat.attrValue.type;

                if(beatColor === "blue"){
                    if(beatType === "arrow" || beatType === "dot"){
                        beat.destroyBeat();
                    } 
                }
            }
        }
    }
});