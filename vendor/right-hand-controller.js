let mouse = {x: 0, y: 0};
let el, self;

import {rightHandPosition} from './camera.js';

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
        // Set mesh on entity.
        el.setObject3D('mesh', this.mesh);

        window.requestAnimationFrame(this.checkHands);
    },
    checkHands: function test() {
        if(rightHandPosition){
            if(rightHandPosition !== previousRightHandPosition){
                self.onHandMove();
                previousRightHandPosition = rightHandPosition;
            }
        }
        window.requestAnimationFrame(test);
    },
    onHandMove: function(){
        var camera = document.querySelector('#camera');
        var cameraEl = camera.object3D.children[1];

        const entities = document.querySelectorAll('[test]'); 

        mouse.x = (rightHandPosition.x / window.innerWidth) * 2 - 1;
        mouse.y = - (rightHandPosition.y / window.innerHeight) * 2 + 1;
        mouse.z = 10;

  

        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        vector.unproject(cameraEl);

        var cameraElPosition = cameraEl.el.object3D.position;
        var dir = vector.sub(cameraElPosition).normalize();
        var distance = - cameraElPosition.z / dir.z;
        var pos = cameraElPosition.clone().add(dir.multiplyScalar(distance));
        el.object3D.position.copy(pos);

        // console.log(pos)
        el.object3D.position.z = -0.2;

        // Raycasting
        // ------------------------
        const entitiesObjects = [];
        const rightHandVertices = el.object3D.el.object3D.children[0].geometry.vertices;
        const rightHandMesh = el.object3D.el.object3D.children[0];
        const rightHandPositionVector = el.object3D.position;

        if(Array.from(entities).length){
            for(var i = 0; i < Array.from(entities).length; i++){
                const beatMesh = entities[i].object3D.el.object3D.el.object3D.el.object3D.children[0].children[1];
                entitiesObjects.push(beatMesh);
            }
            
            var originPoint = rightHandPositionVector.clone();
            var directionVector;

             for (var vertexIndex = 0; vertexIndex < rightHandVertices.length; vertexIndex++) {
                var localVertex = rightHandVertices[vertexIndex].clone();
    
                var globalVertex = localVertex.applyMatrix4(rightHandMesh.matrix);
                var directionVector = globalVertex.sub(rightHandPositionVector);

                var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
                var collisionResults = ray.intersectObjects(entitiesObjects);
                if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                    const beat = collisionResults[0].object.el.attributes[0].ownerElement.parentEl.components.beat;
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
    },
    update: function (oldData) {
        var data = this.data;
        var el = this.el;
        // If `oldData` is empty, then this means we're in the initialization process.
        // No need to update.
        if (Object.keys(oldData).length === 0) { return; }
        // Geometry-related properties changed. Update the geometry.
        if (data.width !== oldData.width ||
            data.height !== oldData.height ||
            data.depth !== oldData.depth) {
          el.getObject3D('mesh').geometry = new THREE.BoxBufferGeometry(data.width, data.height,
                                                                        data.depth);
        }
    
        // Material-related properties changed. Update the material.
        if (data.color !== oldData.color) {
          el.getObject3D('mesh').material.color = new THREE.Color(data.color);
        }
      }
  });