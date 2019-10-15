let mouse = {x: 0, y: 0};
let el, self;

import {handsKeyPoints, leftHandPosition} from './camera.js';
 
let previousLeftHandPosition = {x: 0, y: 0, z: 0};

var raycaster = new THREE.Raycaster();
var intersects;
var direction = new THREE.Vector3();
var far = new THREE.Vector3();

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
        this.geometry = new THREE.BoxBufferGeometry(data.width, data.height, data.depth);
        self.geometry = this.geometry;
        // Create material.
        this.material = new THREE.MeshStandardMaterial({color: data.color});
        // Create mesh.
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
        var camera = document.querySelector('#camera');
        var cameraEl = camera.object3D.children[1];

        const entities = document.querySelectorAll('[test]'); 
  
        mouse.x = (leftHandPosition.x / window.innerWidth) * 2 - 1;
        mouse.y = - (leftHandPosition.y / window.innerHeight) * 2 + 1;

        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        vector.unproject(cameraEl);

        var cameraElPosition = cameraEl.el.object3D.position;
        var dir = vector.sub(cameraElPosition).normalize();
        var distance = - cameraElPosition.z / dir.z;
        var pos = cameraElPosition.clone().add(dir.multiplyScalar(distance));
        el.object3D.position.copy(pos);

        // Raycasting
        // ------------------------
        // console.log(el.object3D.el.object3DMap.mesh.geometry)
        // console.log(el.object3D.el.children[0].geometry)
        // console.log(el.getObject3D('mesh').geometry.vertices)
        // console.log(el.getObject3D('mesh').geometry.attributes)

        console.log(el.object3D.isMesh)

        // const position = self.geometry.attributes.position;
        // const vector = new THREE.Vector3();
     
        // for ( let i = 0, l = position.count; i < l; i ++ )
     
        //    vector.fromBufferAttribute( position, i );
        //    vector.applyMatrix4( self.matrixWorld );
        //    console.log(vector);
        // }

        // if(entities){
        //     var originPoint = el.object3D.position.clone();

        //     for (var vertexIndex = 0; vertexIndex < el.object3D.el.children[0].Mesh.geometry.vertices.length; vertexIndex++) {
        //         var localVertex = el.object3D.el.children[0].geometry.vertices[vertexIndex].clone();
    
        //         var globalVertex = localVertex.applyMatrix4(cube.matrix);
        //         var directionVector = globalVertex.sub(cube.position);
        //         var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        //         var collisionResults = ray.intersectObjects([entities]);
        //         if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
        //             console.log(collisionResults);
        //             // collisionResults[0].object.material.transparent = true;
        //             // collisionResults[0].object.material.opacity = 0.4;
        //         }
        //     }
        // }


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