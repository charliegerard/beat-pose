let mouse = {x: 0, y: 0};
let el, self;

import {leftHandPosition} from './camera.js';
 
let previousLeftHandPosition = {x: 0, y: 0, z: -0.2};

AFRAME.registerComponent('left-hand-controller', {
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

        // Set mesh on entity.
        el.setObject3D('mesh', this.mesh);

        window.requestAnimationFrame(this.checkHands);
    },
    checkHands: function test() {
        if(leftHandPosition){
            if(leftHandPosition !== previousLeftHandPosition){
                self.onHandMove();
                previousLeftHandPosition = leftHandPosition;
            }
        }
        window.requestAnimationFrame(test);
    },
    onHandMove: function(){
        var mouse = new THREE.Vector2();
        mouse.x = (leftHandPosition.x / window.innerWidth) * 2 - 1;
        mouse.y = - (leftHandPosition.y / window.innerHeight) * 2 + 1;

        var cameraDiv = document.querySelector('#camera');
        var cameraEl = cameraDiv.object3D.children[1];

        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        vector.unproject(cameraEl);

        var cameraElPosition = cameraEl.el.object3D.position;
        var dir = vector.sub(cameraElPosition).normalize();
        var distance = - cameraElPosition.z / dir.z;
        var pos = cameraElPosition.clone().add(dir.multiplyScalar(distance));
        el.object3D.position.copy(pos);
        el.object3D.position.z = -0.2;


        const camera = self.el.sceneEl.camera;
        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const entities = document.querySelectorAll('[test]'); 

        // Raycasting
        // ------------------------
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

                if(beatColor === "red"){
                    if(beatType === "arrow" || beatType === "dot"){
                        beat.destroyBeat();
                    } 
                }
            }
        }
    },
});