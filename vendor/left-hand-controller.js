let mouse = {x: 0, y: 0};
let el, self;

import {leftHandPosition, rightHandPosition} from './camera.js';
 
let previousLeftHandPosition = {x: 0, y: 0, z: 0};
var leftHandController;

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
    
        // Create geometry.
        // this.geometry = new THREE.BoxBufferGeometry(data.width, data.height, data.depth);
        this.geometry = new THREE.BoxGeometry(data.width, data.height, data.depth);
        self.geometry = this.geometry;
        // Create material.
        this.material = new THREE.MeshStandardMaterial({color: data.color});
        // Create mesh.
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        leftHandController = this.mesh;
        // leftHandController.position.set(0,0,0);
        // Set mesh on entity.
        el.setObject3D('mesh', this.mesh);
        this.mesh.name = "left-hand-controller"

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
        var camera = document.querySelector('#camera');
        var cameraEl = camera.object3D.children[1];

        const entities = document.querySelectorAll('[test]'); 
        const rightHand = document.querySelectorAll('[right-hand]'); 

        const rightHandObject = Array.from(rightHand)[0].object3D;
  
        mouse.x = (leftHandPosition.x / window.innerWidth) * 2 - 1;
        mouse.y = - (leftHandPosition.y / window.innerHeight) * 2 + 1;

        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        vector.unproject(cameraEl);

        var cameraElPosition = cameraEl.el.object3D.position;
        var dir = vector.sub(cameraElPosition).normalize();
        var distance = - cameraElPosition.z / dir.z;
        var pos = cameraElPosition.clone().add(dir.multiplyScalar(distance));

        // position of the left hand.
        el.object3D.position.copy(pos);

        // Raycasting
        // ------------------------
        const entitiesObjects = [];
        const leftHandVertices = el.object3D.el.object3D.children[0].geometry.vertices;
        const leftHandMesh = el.object3D.el.object3D.children[0];
        const leftHandPositionVector = el.object3D.position;

        if(Array.from(entities).length){
            for(var i = 0; i < Array.from(entities).length; i++){
                const beatMesh = entities[i].object3D.el.object3D.el.object3D.el.object3D.children[0].children[1];
                entitiesObjects.push(beatMesh);
            }
            
            var originPoint = leftHandPositionVector.clone();
            var directionVector;

             for (var vertexIndex = 0; vertexIndex < leftHandVertices.length; vertexIndex++) {
                var localVertex = leftHandVertices[vertexIndex].clone();
    
                var globalVertex = localVertex.applyMatrix4(leftHandMesh.matrix);
                var directionVector = globalVertex.sub(leftHandPositionVector);

                var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
                var collisionResults = ray.intersectObjects(entitiesObjects);
                if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                    collisionResults[0].object.el.attributes[0].ownerElement.parentEl.components.beat.destroyBeat();
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