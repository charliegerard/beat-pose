/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ (() => {

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.BufferGeometryUtils = {

	computeTangents: function (geometry) {

		var index = geometry.index;
		var attributes = geometry.attributes;

		// based on http://www.terathon.com/code/tangent.html
		// (per vertex tangents)

		if (index === null || attributes.position === undefined || attributes.normal === undefined || attributes.uv === undefined) {

			console.warn('THREE.BufferGeometry: Missing required attributes (index, position, normal or uv) in BufferGeometry.computeTangents()');
			return;
		}

		var indices = index.array;
		var positions = attributes.position.array;
		var normals = attributes.normal.array;
		var uvs = attributes.uv.array;

		var nVertices = positions.length / 3;

		if (attributes.tangent === undefined) {

			geometry.addAttribute('tangent', new THREE.BufferAttribute(new Float32Array(4 * nVertices), 4));
		}

		var tangents = attributes.tangent.array;

		var tan1 = [],
		    tan2 = [];

		for (var k = 0; k < nVertices; k++) {

			tan1[k] = new THREE.Vector3();
			tan2[k] = new THREE.Vector3();
		}

		var vA = new THREE.Vector3(),
		    vB = new THREE.Vector3(),
		    vC = new THREE.Vector3(),
		    uvA = new THREE.Vector2(),
		    uvB = new THREE.Vector2(),
		    uvC = new THREE.Vector2(),
		    sdir = new THREE.Vector3(),
		    tdir = new THREE.Vector3();

		function handleTriangle(a, b, c) {

			vA.fromArray(positions, a * 3);
			vB.fromArray(positions, b * 3);
			vC.fromArray(positions, c * 3);

			uvA.fromArray(uvs, a * 2);
			uvB.fromArray(uvs, b * 2);
			uvC.fromArray(uvs, c * 2);

			var x1 = vB.x - vA.x;
			var x2 = vC.x - vA.x;

			var y1 = vB.y - vA.y;
			var y2 = vC.y - vA.y;

			var z1 = vB.z - vA.z;
			var z2 = vC.z - vA.z;

			var s1 = uvB.x - uvA.x;
			var s2 = uvC.x - uvA.x;

			var t1 = uvB.y - uvA.y;
			var t2 = uvC.y - uvA.y;

			var r = 1.0 / (s1 * t2 - s2 * t1);

			sdir.set((t2 * x1 - t1 * x2) * r, (t2 * y1 - t1 * y2) * r, (t2 * z1 - t1 * z2) * r);

			tdir.set((s1 * x2 - s2 * x1) * r, (s1 * y2 - s2 * y1) * r, (s1 * z2 - s2 * z1) * r);

			tan1[a].add(sdir);
			tan1[b].add(sdir);
			tan1[c].add(sdir);

			tan2[a].add(tdir);
			tan2[b].add(tdir);
			tan2[c].add(tdir);
		}

		var groups = geometry.groups;

		if (groups.length === 0) {

			groups = [{
				start: 0,
				count: indices.length
			}];
		}

		for (var j = 0, jl = groups.length; j < jl; ++j) {

			var group = groups[j];

			var start = group.start;
			var count = group.count;

			for (var i = start, il = start + count; i < il; i += 3) {

				handleTriangle(indices[i + 0], indices[i + 1], indices[i + 2]);
			}
		}

		var tmp = new THREE.Vector3(),
		    tmp2 = new THREE.Vector3();
		var n = new THREE.Vector3(),
		    n2 = new THREE.Vector3();
		var w, t, test;

		function handleVertex(v) {

			n.fromArray(normals, v * 3);
			n2.copy(n);

			t = tan1[v];

			// Gram-Schmidt orthogonalize

			tmp.copy(t);
			tmp.sub(n.multiplyScalar(n.dot(t))).normalize();

			// Calculate handedness

			tmp2.crossVectors(n2, t);
			test = tmp2.dot(tan2[v]);
			w = test < 0.0 ? -1.0 : 1.0;

			tangents[v * 4] = tmp.x;
			tangents[v * 4 + 1] = tmp.y;
			tangents[v * 4 + 2] = tmp.z;
			tangents[v * 4 + 3] = w;
		}

		for (var j = 0, jl = groups.length; j < jl; ++j) {

			var group = groups[j];

			var start = group.start;
			var count = group.count;

			for (var i = start, il = start + count; i < il; i += 3) {

				handleVertex(indices[i + 0]);
				handleVertex(indices[i + 1]);
				handleVertex(indices[i + 2]);
			}
		}
	},

	/**
  * @param  {Array<THREE.BufferGeometry>} geometries
  * @return {THREE.BufferGeometry}
  */
	mergeBufferGeometries: function (geometries, useGroups) {

		var isIndexed = geometries[0].index !== null;

		var attributesUsed = new Set(Object.keys(geometries[0].attributes));
		var morphAttributesUsed = new Set(Object.keys(geometries[0].morphAttributes));

		var attributes = {};
		var morphAttributes = {};

		var mergedGeometry = new THREE.BufferGeometry();

		var offset = 0;

		for (var i = 0; i < geometries.length; ++i) {

			var geometry = geometries[i];

			// ensure that all geometries are indexed, or none

			if (isIndexed !== (geometry.index !== null)) return null;

			// gather attributes, exit early if they're different

			for (var name in geometry.attributes) {

				if (!attributesUsed.has(name)) return null;

				if (attributes[name] === undefined) attributes[name] = [];

				attributes[name].push(geometry.attributes[name]);
			}

			// gather morph attributes, exit early if they're different

			for (var name in geometry.morphAttributes) {

				if (!morphAttributesUsed.has(name)) return null;

				if (morphAttributes[name] === undefined) morphAttributes[name] = [];

				morphAttributes[name].push(geometry.morphAttributes[name]);
			}

			// gather .userData

			mergedGeometry.userData.mergedUserData = mergedGeometry.userData.mergedUserData || [];
			mergedGeometry.userData.mergedUserData.push(geometry.userData);

			if (useGroups) {

				var count;

				if (isIndexed) {

					count = geometry.index.count;
				} else if (geometry.attributes.position !== undefined) {

					count = geometry.attributes.position.count;
				} else {

					return null;
				}

				mergedGeometry.addGroup(offset, count, i);

				offset += count;
			}
		}

		// merge indices

		if (isIndexed) {

			var indexOffset = 0;
			var indexList = [];

			for (var i = 0; i < geometries.length; ++i) {

				var index = geometries[i].index;

				if (indexOffset > 0) {

					index = index.clone();

					for (var j = 0; j < index.count; ++j) {

						index.setX(j, index.getX(j) + indexOffset);
					}
				}

				indexList.push(index);
				indexOffset += geometries[i].attributes.position.count;
			}

			var mergedIndex = this.mergeBufferAttributes(indexList);

			if (!mergedIndex) return null;

			mergedGeometry.index = mergedIndex;
		}

		// merge attributes

		for (var name in attributes) {

			var mergedAttribute = this.mergeBufferAttributes(attributes[name]);

			if (!mergedAttribute) return null;

			mergedGeometry.addAttribute(name, mergedAttribute);
		}

		// merge morph attributes

		for (var name in morphAttributes) {

			var numMorphTargets = morphAttributes[name][0].length;

			if (numMorphTargets === 0) break;

			mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
			mergedGeometry.morphAttributes[name] = [];

			for (var i = 0; i < numMorphTargets; ++i) {

				var morphAttributesToMerge = [];

				for (var j = 0; j < morphAttributes[name].length; ++j) {

					morphAttributesToMerge.push(morphAttributes[name][j][i]);
				}

				var mergedMorphAttribute = this.mergeBufferAttributes(morphAttributesToMerge);

				if (!mergedMorphAttribute) return null;

				mergedGeometry.morphAttributes[name].push(mergedMorphAttribute);
			}
		}

		return mergedGeometry;
	},

	/**
  * @param {Array<THREE.BufferAttribute>} attributes
  * @return {THREE.BufferAttribute}
  */
	mergeBufferAttributes: function (attributes) {

		var TypedArray;
		var itemSize;
		var normalized;
		var arrayLength = 0;

		for (var i = 0; i < attributes.length; ++i) {

			var attribute = attributes[i];

			if (attribute.isInterleavedBufferAttribute) return null;

			if (TypedArray === undefined) TypedArray = attribute.array.constructor;
			if (TypedArray !== attribute.array.constructor) return null;

			if (itemSize === undefined) itemSize = attribute.itemSize;
			if (itemSize !== attribute.itemSize) return null;

			if (normalized === undefined) normalized = attribute.normalized;
			if (normalized !== attribute.normalized) return null;

			arrayLength += attribute.array.length;
		}

		var array = new TypedArray(arrayLength);
		var offset = 0;

		for (var j = 0; j < attributes.length; ++j) {

			array.set(attributes[j].array, offset);

			offset += attributes[j].array.length;
		}

		return new THREE.BufferAttribute(array, itemSize, normalized);
	}

};

/***/ }),
/* 2 */
/***/ (() => {

/* global AFRAME, THREE */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

// Configuration for the MutationObserver used to refresh the whitelist.
// Listens for addition/removal of elements and attributes within the scene.
const OBSERVER_CONFIG = {
  childList: true,
  attributes: true,
  subtree: true
};

/**
 * Implement AABB collision detection for entities with a mesh.
 * https://en.wikipedia.org/wiki/Minimum_bounding_box#Axis-aligned_minimum_bounding_box
 *
 * @property {string} objects - Selector of entities to test for collision.
 */
AFRAME.registerComponent('aabb-collider', {
  schema: {
    collideNonVisible: {default: false},
    debug: {default: false},
    enabled: {default: true},
    interval: {default: 80},
    objects: {default: ''}
  },

  init: function () {
    this.centerDifferenceVec3 = new THREE.Vector3();
    this.clearedIntersectedEls = [];
    this.closestIntersectedEl = null;
    this.boundingBox = new THREE.Box3();
    this.boxCenter = new THREE.Vector3();
    this.boxHelper = new THREE.BoxHelper();
    this.boxMax = new THREE.Vector3();
    this.boxMin = new THREE.Vector3();
    this.hitClosestClearEventDetail = {};
    this.hitClosestEventDetail = {};
    this.intersectedEls = [];
    this.objectEls = [];
    this.newIntersectedEls = [];
    this.prevCheckTime = undefined;
    this.previousIntersectedEls = [];

    this.setDirty = this.setDirty.bind(this);
    this.observer = new MutationObserver(this.setDirty);
    this.dirty = true;

    this.hitStartEventDetail = {intersectedEls: this.newIntersectedEls};
  },

  play: function () {
    this.observer.observe(this.el.sceneEl, OBSERVER_CONFIG);
    this.el.sceneEl.addEventListener('object3dset', this.setDirty);
    this.el.sceneEl.addEventListener('object3dremove', this.setDirty);
  },

  remove: function () {
    this.observer.disconnect();
    this.el.sceneEl.removeEventListener('object3dset', this.setDirty);
    this.el.sceneEl.removeEventListener('object3dremove', this.setDirty);
  },

  tick: function (time) {
    const boundingBox = this.boundingBox;
    const centerDifferenceVec3 = this.centerDifferenceVec3;
    const clearedIntersectedEls = this.clearedIntersectedEls;
    const el = this.el;
    const intersectedEls = this.intersectedEls;
    const newIntersectedEls = this.newIntersectedEls;
    const objectEls = this.objectEls;
    const prevCheckTime = this.prevCheckTime;
    const previousIntersectedEls = this.previousIntersectedEls;

    let closestCenterDifference;
    let newClosestEl;
    let i;

    if (!this.data.enabled) { return; }

    // Only check for intersection if interval time has passed.
    if (prevCheckTime && (time - prevCheckTime < this.data.interval)) { return; }
    // Update check time.
    this.prevCheckTime = time;

    if (this.dirty) { this.refreshObjects(); }

    // Update the bounding box to account for rotations and position changes.
    boundingBox.setFromObject(el.object3D);
    this.boxMin.copy(boundingBox.min);
    this.boxMax.copy(boundingBox.max);
    boundingBox.getCenter(this.boxCenter);

    if (this.data.debug) {
      this.boxHelper.setFromObject(el.object3D);
      if (!this.boxHelper.parent) { el.sceneEl.object3D.add(this.boxHelper); }
    }

    copyArray(previousIntersectedEls, intersectedEls);

    // Populate intersectedEls array.
    intersectedEls.length = 0;
    for (i = 0; i < objectEls.length; i++) {
      if (objectEls[i] === this.el) { continue; }

      // Don't collide with non-visible if flag set.
      if (!this.data.collideNonVisible && !objectEls[i].getAttribute('visible')) {
        // Remove box helper if debug flag set and has box helper.
        if (this.data.debug) {
          const boxHelper = objectEls[i].object3D.boxHelper;
          if (boxHelper) {
            el.sceneEl.object3D.remove(boxHelper);
            objectEls[i].object3D.boxHelper = null;
          }
        }
        continue;
      }

      // Check for interection.
      if (this.isIntersecting(objectEls[i])) { intersectedEls.push(objectEls[i]); }
    }

    // Get newly intersected entities.
    newIntersectedEls.length = 0;
    for (i = 0; i < intersectedEls.length; i++) {
      if (previousIntersectedEls.indexOf(intersectedEls[i]) === -1) {
        newIntersectedEls.push(intersectedEls[i]);
      }
    }

    // Emit cleared events on no longer intersected entities.
    clearedIntersectedEls.length = 0;
    for (i = 0; i < previousIntersectedEls.length; i++) {
      if (intersectedEls.indexOf(previousIntersectedEls[i]) !== -1) { continue; }
      if (!previousIntersectedEls[i].hasAttribute('aabb-collider')) {
        previousIntersectedEls[i].emit('hitend');
      }
      clearedIntersectedEls.push(previousIntersectedEls[i]);
    }

    // Emit events on intersected entities. Do this after the cleared events.
    for (i = 0; i < newIntersectedEls.length; i++) {
      if (newIntersectedEls[i] === this.el) { continue; }
      if (newIntersectedEls[i].hasAttribute('aabb-collider')) { continue; }
      newIntersectedEls[i].emit('hitstart');
    }

    // Calculate closest intersected entity based on centers.
    for (i = 0; i < intersectedEls.length; i++) {
      if (intersectedEls[i] === this.el) { continue; }
      centerDifferenceVec3
        .copy(intersectedEls[i].object3D.boundingBoxCenter)
        .sub(this.boxCenter);
      if (closestCenterDifference === undefined ||
          centerDifferenceVec3.length() < closestCenterDifference) {
        closestCenterDifference = centerDifferenceVec3.length();
        newClosestEl = intersectedEls[i];
      }
    }

    // Emit events for the new closest entity and the old closest entity.
    if (!intersectedEls.length && this.closestIntersectedEl) {
      // No intersected entities, clear any closest entity.
      this.hitClosestClearEventDetail.el = this.closestIntersectedEl;
      this.closestIntersectedEl.emit('hitclosestclear');
      this.closestIntersectedEl = null;
      el.emit('hitclosestclear', this.hitClosestClearEventDetail);
    } else if (newClosestEl !== this.closestIntersectedEl) {
      // Clear the previous closest entity.
      if (this.closestIntersectedEl) {
        this.hitClosestClearEventDetail.el = this.closestIntersectedEl;
        this.closestIntersectedEl.emit('hitclosestclear', this.hitClosestClearEventDetail);
      }
      if (newClosestEl) {
        // Emit for the new closest entity.
        newClosestEl.emit('hitclosest');
        this.closestIntersectedEl = newClosestEl;
        this.hitClosestEventDetail.el = newClosestEl;
        el.emit('hitclosest', this.hitClosestEventDetail);
      }
    }

    if (clearedIntersectedEls.length) {
      el.emit('hitend');
    }

    if (newIntersectedEls.length) {
      el.emit('hitstart', this.hitStartEventDetail);
    }
  },

  /**
   * AABB collision detection.
   * 3D version of https://www.youtube.com/watch?v=ghqD3e37R7E
   */
  isIntersecting: (function () {
    const boundingBox = new THREE.Box3();

    return function (el) {
      let box;

      // Dynamic, recalculate each tick.
      if (el.dataset.aabbColliderDynamic) {
        // Box.
        boundingBox.setFromObject(el.object3D);
        box = boundingBox;
        // Center.
        el.object3D.boundingBoxCenter = el.object3D.boundingBoxCenter || new THREE.Vector3();
        box.getCenter(el.object3D.boundingBoxCenter);
      }

      // Static, reuse box and centers.
      if (!el.dataset.aabbColliderDynamic) {
        if (!el.object3D.aabbBox) {
          // Box.
          el.object3D.aabbBox = new THREE.Box3().setFromObject(el.object3D);
          // Center.
          el.object3D.boundingBoxCenter = new THREE.Vector3();
          el.object3D.aabbBox.getCenter(el.object3D.boundingBoxCenter);
        }
        box = el.object3D.aabbBox;
      }

      if (this.data.debug) {
        if (!el.object3D.boxHelper) {
          el.object3D.boxHelper = new THREE.BoxHelper(
            el.object3D, new THREE.Color(Math.random(), Math.random(), Math.random()));
          el.sceneEl.object3D.add(el.object3D.boxHelper);
        }
        el.object3D.boxHelper.setFromObject(el.object3D);
      }

      const boxMin = box.min;
      const boxMax = box.max;
      return (this.boxMin.x <= boxMax.x && this.boxMax.x >= boxMin.x) &&
             (this.boxMin.y <= boxMax.y && this.boxMax.y >= boxMin.y) &&
             (this.boxMin.z <= boxMax.z && this.boxMax.z >= boxMin.z);
    };
  })(),

  /**
   * Mark the object list as dirty, to be refreshed before next raycast.
   */
  setDirty: function () {
    this.dirty = true;
  },

  /**
   * Update list of objects to test for intersection.
   */
  refreshObjects: function () {
    const data = this.data;
    // If objects not defined, intersect with everything.
    this.objectEls = data.objects
      ? this.el.sceneEl.querySelectorAll(data.objects)
      : this.el.sceneEl.children;
    this.dirty = false;
  }
});

function copyArray (dest, source) {
  dest.length = 0;
  for (let i = 0; i < source.length; i++) { dest[i] = source[i]; }
}


/***/ }),
/* 3 */
/***/ ((module) => {

// For aux use.
var uvs = [
  new THREE.Vector2(),
  new THREE.Vector2(),
  new THREE.Vector2(),
  new THREE.Vector2()
];

/**
 * 1-indexed.
 */
AFRAME.registerComponent('atlas-uvs', {
  dependencies: ['geometry'],

  schema: {
    totalColumns: {type: 'int', default: 1},
    totalRows: {type: 'int', default: 1},
    column: {type: 'int', default: 1},
    row: {type: 'int', default: 1}
  },

  update: function () {
    const data = this.data;
    const uvs = getGridUvs(data.row - 1, data.column - 1, data.totalRows, data.totalColumns);

    const geometry = this.el.getObject3D('mesh').geometry;
    geometry.faceVertexUvs[0][0][0].copy(uvs[0]);
    geometry.faceVertexUvs[0][0][1].copy(uvs[1]);
    geometry.faceVertexUvs[0][0][2].copy(uvs[3]);
    geometry.faceVertexUvs[0][1][0].copy(uvs[1]);
    geometry.faceVertexUvs[0][1][1].copy(uvs[2]);
    geometry.faceVertexUvs[0][1][2].copy(uvs[3]);
    geometry.uvsNeedUpdate = true;
  }
});

AFRAME.registerComponent('dynamic-texture-atlas', {
  schema: {
    canvasId: {default: 'dynamicAtlas'},
    canvasHeight: {default: 1024},
    canvasWidth: {default: 1024},
    debug: {default: false},
    numColumns: {default: 8},
    numRows: {default: 8}
  },

  multiple: true,

  init: function () {
    const canvas = this.canvas = document.createElement('canvas');
    canvas.id = this.data.canvasId;
    canvas.height = this.data.canvasHeight;
    canvas.width = this.data.canvasWidth;
    this.ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    if (this.data.debug) {
      canvas.style.left = 0;
      canvas.style.top = 0;
      canvas.style.position = 'fixed';
      canvas.style.zIndex = 9999999999;
    }
  },

  drawTexture: function (image, row, column, width, height) {
    const canvas = this.canvas;
    const data = this.data;

    if (!image.complete) {
      image.onload = () => { this.drawTexture(image, row, column); }
    }

    const gridHeight = height || (canvas.height / data.numRows);
    const gridWidth = width || (canvas.width / data.numColumns);

    // image, dx, dy, dwidth, dheight
    this.ctx.drawImage(image, gridWidth * row, gridWidth * column, gridWidth, gridHeight);

    // Return UVs.
    return getGridUvs(row, column, data.numRows, data.numColumns);
  }
});

/**
 * Return UVs for an texture within an atlas, given the row and column info.
 */
function getGridUvs (row, column, totalRows, totalColumns) {
  const columnWidth = 1 / totalColumns;
  const rowHeight = 1 / totalRows;

  uvs[0].set(columnWidth * column,
             rowHeight * row + rowHeight);
  uvs[1].set(columnWidth * column,
             rowHeight * row);
  uvs[2].set(columnWidth * column + columnWidth,
             rowHeight * row);
  uvs[3].set(columnWidth * column + columnWidth,
             rowHeight * row + rowHeight);
  return uvs;
}
module.exports.getGridUvs = getGridUvs;


/***/ }),
/* 4 */
/***/ (() => {

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

var audioBufferCache = {};

/**
 * Audio visualizer component for A-Frame using AnalyserNode.
 */
AFRAME.registerComponent('audioanalyser', {
  schema: {
    buffer: {default: false},
    beatDetectionDecay: {default: 0.99},
    beatDetectionMinVolume: {default: 15},
    beatDetectionThrottle: {default: 250},
    enabled: {default: true},
    enableBeatDetection: {default: true},
    enableLevels: {default: true},
    enableWaveform: {default: true},
    enableVolume: {default: true},
    fftSize: {default: 2048},
    smoothingTimeConstant: {default: 0.8},
    src: {
      parse: function (val) {
        if (val.constructor !== String) { return val; }
        if (val.startsWith('#') || val.startsWith('.')) {
          return document.querySelector(val);
        }
        return val;
      }
    },
    unique: {default: false}
  },

  init: function () {
    this.audioEl = null;
    this.levels = null;
    this.waveform = null;
    this.volume = 0;
    this.xhr = null;

    this.initContext();
  },

  update: function (oldData) {
    var analyser = this.analyser;
    var data = this.data;

    // Update analyser stuff.
    if (oldData.fftSize !== data.fftSize ||
        oldData.smoothingTimeConstant !== data.smoothingTimeConstant) {
      analyser.fftSize = data.fftSize;
      analyser.smoothingTimeConstant = data.smoothingTimeConstant;
      this.levels = new Uint8Array(analyser.frequencyBinCount);
      this.waveform = new Uint8Array(analyser.fftSize);
    }

    if (!data.src) { return; }
    this.refreshSource();
  },

  /**
   * Update spectrum on each frame.
   */
  tick: function (t, dt) {
    var data = this.data;
    var volume;

    if (!data.enabled) { return; }

    // Levels (frequency).
    if (data.enableLevels || data.enableVolume) {
      this.analyser.getByteFrequencyData(this.levels);
    }

    // Waveform.
    if (data.enableWaveform) {
      this.analyser.getByteTimeDomainData(this.waveform);
    }

    // Average volume.
    if (data.enableVolume || data.enableBeatDetection) {
      var sum = 0;
      for (var i = 0; i < this.levels.length; i++) {
        sum += this.levels[i];;
      }
      this.volume = sum / this.levels.length;
    }

    // Beat detection.
    if (data.enableBeatDetection) {
      volume = this.volume;
      if (!this.beatCutOff) { this.beatCutOff = volume; }
      if (volume > this.beatCutOff && volume > this.data.beatDetectionMinVolume) {
        this.el.emit('audioanalyserbeat', null, false);
        this.beatCutOff = volume * 1.5;
        this.beatTime = 0;
      } else {
        if (this.beatTime <= this.data.beatDetectionThrottle) {
          this.beatTime += dt;
        } else {
          this.beatCutOff *= this.data.beatDetectionDecay;
          this.beatCutOff = Math.max(this.beatCutOff, this.data.beatDetectionMinVolume);
        }
      }
    }
  },

  initContext: function () {
    var data = this.data;
    var analyser;
    var gainNode;

    this.context = new (window.webkitAudioContext || window.AudioContext)();
    analyser = this.analyser = this.context.createAnalyser();
    gainNode = this.gainNode = this.context.createGain();
    gainNode.connect(analyser);
    analyser.connect(this.context.destination);
    analyser.fftSize = data.fftSize;
    analyser.smoothingTimeConstant = data.smoothingTimeConstant;
    this.levels = new Uint8Array(analyser.frequencyBinCount);
    this.waveform = new Uint8Array(analyser.fftSize);
  },

  refreshSource: function () {
    var analyser = this.analyser;
    var data = this.data;

    if (data.buffer && data.src.constructor === String) {
      this.getBufferSource().then(source => {
        this.source = source;
        this.source.connect(this.gainNode);
      });
    } else {
      this.source = this.getMediaSource();
      this.source.connect(this.gainNode);
    }
  },

  suspendContext: function () {
    this.context.suspend();
  },

  resumeContext: function () {
    this.context.resume();
  },

  /**
   * Fetch and parse buffer to audio buffer. Resolve a source.
   */
  fetchAudioBuffer: function (src) {
    // From cache.
    if (audioBufferCache[src]) {
      if (audioBufferCache[src].constructor === Promise) {
        return audioBufferCache[src];
      } else {
        return Promise.resolve(audioBufferCache[src]);
      }
    }

    audioBufferCache[src] = new Promise(resolve => {
      // Fetch if does not exist.
      const xhr = this.xhr = new XMLHttpRequest();
      xhr.open('GET', src);
      xhr.responseType = 'arraybuffer';
      xhr.addEventListener('load', () => {
        // Support Webkit with callback.
        function cb (audioBuffer) {
          audioBufferCache[src] = audioBuffer;
          resolve(audioBuffer);
        }
        const res = this.context.decodeAudioData(xhr.response, cb);
        if (res && res.constructor === Promise) {
          res.then(cb).catch(console.error);
        }
      });
      xhr.send();
    });
    return audioBufferCache[src];
  },

  getBufferSource: function () {
    var data = this.data;
    return this.fetchAudioBuffer(data.src).then(() => {
      var source;
      source = this.context.createBufferSource();
      source.buffer = audioBufferCache[data.src];
      this.el.emit('audioanalyserbuffersource', source, false);
      return source;
    }).catch(console.error);
  },

  getMediaSource: (function () {
    const nodeCache = {};

    return function () {
      const src = this.data.src.constructor === String ? this.data.src : this.data.src.src;
      if (nodeCache[src]) { return nodeCache[src]; }

      if (this.data.src.constructor === String) {
        this.audio = document.createElement('audio');
        this.audio.crossOrigin = 'anonymous';
        this.audio.setAttribute('src', this.data.src);
      } else {
        this.audio = this.data.src;
      }
      const node = this.context.createMediaElementSource(this.audio)
      nodeCache[src] = node;
      return node;
    };
  })()
});


/***/ }),
/* 5 */
/***/ (() => {

/* global AFRAME */
var styleParser = AFRAME.utils.styleParser;

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('event-set', {
  schema: {
    default: '',
    parse: function (value) {
      return styleParser.parse(value);
    }
  },

  multiple: true,

  init: function () {
    this.eventHandler = null;
    this.eventName = null;
  },

  update: function (oldData) {
    this.removeEventListener();
    this.updateEventListener();
    this.addEventListener();
  },

  remove: function () {
    this.removeEventListener();
  },

  pause: function () {
    this.removeEventListener();
  },

  play: function () {
    this.addEventListener();
  },

  /**
   * Update source-of-truth event listener registry.
   * Does not actually attach event listeners yet.
   */
  updateEventListener: function () {
    var data = this.data;
    var el = this.el;
    var event;
    var target;
    var targetEl;

    // Set event listener using `_event`.
    event = data._event || this.id;
    target = data._target;

    // Decide the target to `setAttribute` on.
    targetEl = target ? el.sceneEl.querySelector(target) : el;

    this.eventName = event;

    const handler = () => {
      var propName;
      // Set attributes.
      for (propName in data) {
        if (propName === '_event' || propName === '_target') { continue; }
        AFRAME.utils.entity.setComponentProperty.call(this, targetEl, propName,
                                                      data[propName]);
      }
    };

    if (!isNaN(data._delay)) {
      // Delay.
      this.eventHandler = () => { setTimeout(handler, parseFloat(data._delay)); };
    } else {
      this.eventHandler = handler;
    }
  },

  addEventListener: function () {
    this.el.addEventListener(this.eventName, this.eventHandler);
  },

  removeEventListener: function () {
    this.el.removeEventListener(this.eventName, this.eventHandler);
  }
});


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

if (!THREE.BufferGeometryUtils) {
  __webpack_require__(7);
}

AFRAME.registerComponent('geometry-merger', {
  schema: {
    preserveOriginal: {default: false}
  },

  init: function () {
    var faceIndexEnd;
    var faceIndexStart;
    var self = this;

    this.geometry = new THREE.Geometry();
    this.mesh = new THREE.Mesh(this.geometry);
    this.el.setObject3D('mesh', this.mesh);

    this.faceIndex = {};  // Keep index of original entity UUID to new face array.
    this.vertexIndex = {};  // Keep index of original entity UUID to vertex array.

    this.el.object3D.traverse(function (mesh) {
      if (mesh.type !== 'Mesh') { return; }
      if (mesh === self.mesh) { return; }

      self.faceIndex[mesh.parent.uuid] = [
        self.geometry.faces.length,
        self.geometry.faces.length + mesh.geometry.faces.length - 1
      ];

      self.vertexIndex[mesh.parent.uuid] = [
        self.geometry.vertices.length,
        self.geometry.vertices.length + mesh.geometry.vertices.length - 1
      ];

      // Merge. Use parent's matrix due to A-Frame's <a-entity>(Group-Mesh) hierarchy.
      mesh.parent.updateMatrix();
      self.geometry.merge(mesh.geometry, mesh.parent.matrix);

      // Remove mesh if not preserving.
      if (!self.data.preserveOriginal) { mesh.parent.remove(mesh); }
    });
  }
});

AFRAME.registerComponent('buffer-geometry-merger', {
  schema: {
    preserveOriginal: {default: false}
  },

  init: function () {
    var geometries = [];

    this.el.sceneEl.object3D.updateMatrixWorld()
    this.el.object3D.traverse(function (mesh) {
      if (mesh.type !== 'Mesh' || mesh.el === self.el) { return; }
      mesh.geometry.applyMatrix(mesh.matrixWorld);
      geometries.push(mesh.geometry.clone());
      mesh.parent.remove(mesh);
    });

    const geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
    this.mesh = new THREE.Mesh(geometry);
    this.el.setObject3D('mesh', this.mesh);
  }
});


/***/ }),
/* 7 */
/***/ (() => {

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.BufferGeometryUtils = {

	computeTangents: function ( geometry ) {

		var index = geometry.index;
		var attributes = geometry.attributes;

		// based on http://www.terathon.com/code/tangent.html
		// (per vertex tangents)

		if ( index === null ||
			 attributes.position === undefined ||
			 attributes.normal === undefined ||
			 attributes.uv === undefined ) {

			console.warn( 'THREE.BufferGeometry: Missing required attributes (index, position, normal or uv) in BufferGeometry.computeTangents()' );
			return;

		}

		var indices = index.array;
		var positions = attributes.position.array;
		var normals = attributes.normal.array;
		var uvs = attributes.uv.array;

		var nVertices = positions.length / 3;

		if ( attributes.tangent === undefined ) {

			geometry.addAttribute( 'tangent', new THREE.BufferAttribute( new Float32Array( 4 * nVertices ), 4 ) );

		}

		var tangents = attributes.tangent.array;

		var tan1 = [], tan2 = [];

		for ( var i = 0; i < nVertices; i ++ ) {

			tan1[ i ] = new THREE.Vector3();
			tan2[ i ] = new THREE.Vector3();

		}

		var vA = new THREE.Vector3(),
			vB = new THREE.Vector3(),
			vC = new THREE.Vector3(),

			uvA = new THREE.Vector2(),
			uvB = new THREE.Vector2(),
			uvC = new THREE.Vector2(),

			sdir = new THREE.Vector3(),
			tdir = new THREE.Vector3();

		function handleTriangle( a, b, c ) {

			vA.fromArray( positions, a * 3 );
			vB.fromArray( positions, b * 3 );
			vC.fromArray( positions, c * 3 );

			uvA.fromArray( uvs, a * 2 );
			uvB.fromArray( uvs, b * 2 );
			uvC.fromArray( uvs, c * 2 );

			var x1 = vB.x - vA.x;
			var x2 = vC.x - vA.x;

			var y1 = vB.y - vA.y;
			var y2 = vC.y - vA.y;

			var z1 = vB.z - vA.z;
			var z2 = vC.z - vA.z;

			var s1 = uvB.x - uvA.x;
			var s2 = uvC.x - uvA.x;

			var t1 = uvB.y - uvA.y;
			var t2 = uvC.y - uvA.y;

			var r = 1.0 / ( s1 * t2 - s2 * t1 );

			sdir.set(
				( t2 * x1 - t1 * x2 ) * r,
				( t2 * y1 - t1 * y2 ) * r,
				( t2 * z1 - t1 * z2 ) * r
			);

			tdir.set(
				( s1 * x2 - s2 * x1 ) * r,
				( s1 * y2 - s2 * y1 ) * r,
				( s1 * z2 - s2 * z1 ) * r
			);

			tan1[ a ].add( sdir );
			tan1[ b ].add( sdir );
			tan1[ c ].add( sdir );

			tan2[ a ].add( tdir );
			tan2[ b ].add( tdir );
			tan2[ c ].add( tdir );

		}

		var groups = geometry.groups;

		if ( groups.length === 0 ) {

			groups = [ {
				start: 0,
				count: indices.length
			} ];

		}

		for ( var i = 0, il = groups.length; i < il; ++ i ) {

			var group = groups[ i ];

			var start = group.start;
			var count = group.count;

			for ( var j = start, jl = start + count; j < jl; j += 3 ) {

				handleTriangle(
					indices[ j + 0 ],
					indices[ j + 1 ],
					indices[ j + 2 ]
				);

			}

		}

		var tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
		var n = new THREE.Vector3(), n2 = new THREE.Vector3();
		var w, t, test;

		function handleVertex( v ) {

			n.fromArray( normals, v * 3 );
			n2.copy( n );

			t = tan1[ v ];

			// Gram-Schmidt orthogonalize

			tmp.copy( t );
			tmp.sub( n.multiplyScalar( n.dot( t ) ) ).normalize();

			// Calculate handedness

			tmp2.crossVectors( n2, t );
			test = tmp2.dot( tan2[ v ] );
			w = ( test < 0.0 ) ? - 1.0 : 1.0;

			tangents[ v * 4 ] = tmp.x;
			tangents[ v * 4 + 1 ] = tmp.y;
			tangents[ v * 4 + 2 ] = tmp.z;
			tangents[ v * 4 + 3 ] = w;

		}

		for ( var i = 0, il = groups.length; i < il; ++ i ) {

			var group = groups[ i ];

			var start = group.start;
			var count = group.count;

			for ( var j = start, jl = start + count; j < jl; j += 3 ) {

				handleVertex( indices[ j + 0 ] );
				handleVertex( indices[ j + 1 ] );
				handleVertex( indices[ j + 2 ] );

			}

		}

	},

	/**
	 * @param  {Array<THREE.BufferGeometry>} geometries
	 * @return {THREE.BufferGeometry}
	 */
	mergeBufferGeometries: function ( geometries, useGroups ) {

		var isIndexed = geometries[ 0 ].index !== null;

		var attributesUsed = new Set( Object.keys( geometries[ 0 ].attributes ) );
		var morphAttributesUsed = new Set( Object.keys( geometries[ 0 ].morphAttributes ) );

		var attributes = {};
		var morphAttributes = {};

		var mergedGeometry = new THREE.BufferGeometry();

		var offset = 0;

		for ( var i = 0; i < geometries.length; ++ i ) {

			var geometry = geometries[ i ];

			// ensure that all geometries are indexed, or none

			if ( isIndexed !== ( geometry.index !== null ) ) return null;

			// gather attributes, exit early if they're different

			for ( var name in geometry.attributes ) {

				if ( ! attributesUsed.has( name ) ) return null;

				if ( attributes[ name ] === undefined ) attributes[ name ] = [];

				attributes[ name ].push( geometry.attributes[ name ] );

			}

			// gather morph attributes, exit early if they're different

			for ( var name in geometry.morphAttributes ) {

				if ( ! morphAttributesUsed.has( name ) ) return null;

				if ( morphAttributes[ name ] === undefined ) morphAttributes[ name ] = [];

				morphAttributes[ name ].push( geometry.morphAttributes[ name ] );

			}

			// gather .userData

      if (mergedGeometry.userData) {

        mergedGeometry.userData.mergedUserData = mergedGeometry.userData.mergedUserData || [];
        mergedGeometry.userData.mergedUserData.push( geometry.userData );

      }

			if ( useGroups ) {

				var count;

				if ( isIndexed ) {

					count = geometry.index.count;

				} else if ( geometry.attributes.position !== undefined ) {

					count = geometry.attributes.position.count;

				} else {

					return null;

				}

				mergedGeometry.addGroup( offset, count, i );

				offset += count;

			}

		}

		// merge indices

		if ( isIndexed ) {

			var indexOffset = 0;
			var mergedIndex = [];

			for ( var i = 0; i < geometries.length; ++ i ) {

				var index = geometries[ i ].index;

				for ( var j = 0; j < index.count; ++ j ) {

					mergedIndex.push( index.getX( j ) + indexOffset );

				}

				indexOffset += geometries[ i ].attributes.position.count;

			}

			mergedGeometry.setIndex( mergedIndex );

		}

		// merge attributes

		for ( var name in attributes ) {

			var mergedAttribute = this.mergeBufferAttributes( attributes[ name ] );

			if ( ! mergedAttribute ) return null;

			mergedGeometry.addAttribute( name, mergedAttribute );

		}

		// merge morph attributes

		for ( var name in morphAttributes ) {

			var numMorphTargets = morphAttributes[ name ][ 0 ].length;

			if ( numMorphTargets === 0 ) break;

			mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
			mergedGeometry.morphAttributes[ name ] = [];

			for ( var i = 0; i < numMorphTargets; ++ i ) {

				var morphAttributesToMerge = [];

				for ( var j = 0; j < morphAttributes[ name ].length; ++ j ) {

					morphAttributesToMerge.push( morphAttributes[ name ][ j ][ i ] );

				}

				var mergedMorphAttribute = this.mergeBufferAttributes( morphAttributesToMerge );

				if ( ! mergedMorphAttribute ) return null;

				mergedGeometry.morphAttributes[ name ].push( mergedMorphAttribute );

			}

		}

		return mergedGeometry;

	},

	/**
	 * @param {Array<THREE.BufferAttribute>} attributes
	 * @return {THREE.BufferAttribute}
	 */
	mergeBufferAttributes: function ( attributes ) {

		var TypedArray;
		var itemSize;
		var normalized;
		var arrayLength = 0;

		for ( var i = 0; i < attributes.length; ++ i ) {

			var attribute = attributes[ i ];

			if ( attribute.isInterleavedBufferAttribute ) return null;

			if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
			if ( TypedArray !== attribute.array.constructor ) return null;

			if ( itemSize === undefined ) itemSize = attribute.itemSize;
			if ( itemSize !== attribute.itemSize ) return null;

			if ( normalized === undefined ) normalized = attribute.normalized;
			if ( normalized !== attribute.normalized ) return null;

			arrayLength += attribute.array.length;

		}

		var array = new TypedArray( arrayLength );
		var offset = 0;

		for ( var i = 0; i < attributes.length; ++ i ) {

			array.set( attributes[ i ].array, offset );

			offset += attributes[ i ].array.length;

		}

		return new THREE.BufferAttribute( array, itemSize, normalized );

	}

};


/***/ }),
/* 8 */
/***/ (() => {

/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Haptics component for A-Frame.
 */
AFRAME.registerComponent('haptics', {
  schema: {
    actuatorIndex: {default: 0},
    dur: {default: 100},
    enabled: {default: true},
    events: {type: 'array'},
    eventsFrom: {type: 'string'},
    force: {default: 1}
  },

  multiple: true,

  init: function () {
    var data = this.data;
    var i;
    var self = this;

    this.callPulse = function () { self.pulse(); };

    var doInit = function () {
      self.gamepad = self.el.components['tracked-controls'].controller;
      if (self.gamepad.gamepad) {
        // WebXR.
         self.gamepad = self.gamepad.gamepad;
       }
       if (!self.gamepad || !self.gamepad.hapticActuators ||
       !self.gamepad.hapticActuators.length) { return; }
       self.addEventListeners();
    };

    // There may exist a tracked-controls when this component is initialized
    if (this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller) {
      doInit();
    } else {
      this.el.addEventListener('controllerconnected', function init () {
        doInit();
      });
    }
  },

  remove: function () {
    this.removeEventListeners();
  },

  pulse: function (force, dur) {
    var actuator;
    var data = this.data;
    if (!data.enabled || !this.gamepad || !this.gamepad.hapticActuators) { return; }
    actuator = this.gamepad.hapticActuators[data.actuatorIndex];
    actuator.pulse(force || data.force, dur || data.dur);
  },

  addEventListeners: function () {
    var data = this.data;
    var i;
    var listenTarget;

    listenTarget = data.eventsFrom ? document.querySelector(data.eventsFrom) : this.el;
    for (i = 0; i < data.events.length; i++) {
      listenTarget.addEventListener(data.events[i], this.callPulse);
    }
  },

  removeEventListeners: function () {
    var data = this.data;
    var i;
    var listenTarget;

    listenTarget = data.eventsFrom ? document.querySelector(data.eventsFrom) : this.el;
    for (i = 0; i < data.events.length; i++) {
      listenTarget.removeEventListener(data.events[i], this.callPulse);
    }
  }
});


/***/ }),
/* 9 */
/***/ ((module) => {

var positions = [];
var positionHelper = new THREE.Vector3();

/**
 * Layout component for A-Frame.
 * Some layouts adapted from http://www.vb-helper.com/tutorial_platonic_solids.html
 */
AFRAME.registerComponent('layout', {
  schema: {
    angle: {type: 'number', default: false, min: 0, max: 360, if: {type: ['circle']}},
    columns: {default: 1, min: 0, if: {type: ['box']}},
    margin: {default: 1, min: 0, if: {type: ['box', 'line']}},
    marginColumn: {default: 1, min: 0, if: {type: ['box']}},
    marginRow: {default: 1, min: 0, if: {type: ['box']}},
    orderAttribute: {default: ''},
    plane: {default: 'xy'},
    radius: {default: 1, min: 0, if: {type: ['circle', 'cube', 'dodecahedron', 'pyramid']}},
    reverse: {default: false},
    type: {default: 'line', oneOf: ['box', 'circle', 'cube', 'dodecahedron', 'line',
                                    'pyramid']},
    fill: {default: true, if: {type: ['circle']}},
    align: {default: 'end', oneOf: ['start', 'center', 'end']}
  },

  /**
   * Store initial positions in case need to reset on component removal.
   */
  init: function () {
    var self = this;
    var el = this.el;

    this.children = el.getChildEntities();
    this.initialPositions = [];

    this.children.forEach(function getInitialPositions (childEl) {
      if (childEl.hasLoaded) { return _getPositions(); }
      childEl.addEventListener('loaded', _getPositions);
      function _getPositions () {
        self.initialPositions.push(childEl.object3D.position.x);
        self.initialPositions.push(childEl.object3D.position.y);
        self.initialPositions.push(childEl.object3D.position.z);
      }
    });

    this.handleChildAttached = this.handleChildAttached.bind(this);
    this.handleChildDetached = this.handleChildDetached.bind(this);

    el.addEventListener('child-attached', this.handleChildAttached);
    el.addEventListener('child-detached', this.handleChildDetached);
    el.addEventListener('layoutrefresh', this.update.bind(this));
  },

  /**
   * Update child entity positions.
   */
  update: function (oldData) {
    var children = this.children;
    var data = this.data;
    var definedData;
    var el = this.el;
    var numChildren;
    var positionFn;

    numChildren = children.length;

    // Calculate different positions based on layout shape.
    switch (data.type) {
      case 'box': {
        positionFn = getBoxPositions;
        break;
      }
      case 'circle': {
        positionFn = getCirclePositions;
        break;
      }
      case 'cube': {
        positionFn = getCubePositions;
        break;
      }
      case 'dodecahedron': {
        positionFn = getDodecahedronPositions;
        break;
      }
      case 'pyramid': {
        positionFn = getPyramidPositions;
        break;
      }
      default: {
        // Line.
        positionFn = getLinePositions;
      }
    }

    definedData = el.getDOMAttribute('layout');
    positions.length = 0;
    positions = positionFn(
      data, numChildren,
      typeof definedData === 'string'
        ? definedData.indexOf('margin') !== -1
        : 'margin' in definedData
    );
    if (data.reverse) { positions.reverse(); }
    setPositions(children, positions, data.orderAttribute);
  },

  /**
   * Reset positions.
   */
  remove: function () {
    this.el.removeEventListener('child-attached', this.handleChildAttached);
    this.el.removeEventListener('child-detached', this.handleChildDetached);
    setPositions(this.children, this.initialPositions);
  },

  handleChildAttached: function (evt) {
    // Only update if direct child attached.
    var el = this.el;
    if (evt.detail.el.parentNode !== el) { return; }
    this.children.push(evt.detail.el);
    this.update();
  },

  handleChildDetached: function (evt) {
    // Only update if direct child detached.
    if (this.children.indexOf(evt.detail.el) === -1) { return; }
    this.children.splice(this.children.indexOf(evt.detail.el), 1);
    this.initialPositions.splice(this.children.indexOf(evt.detail.el), 1);
    this.update();
  }
});

/**
 * Get positions for `box` layout.
 */
function getBoxPositions (data, numChildren, marginDefined) {
  var column;
  var marginColumn;
  var marginRow;
  var offsetColumn;
  var offsetRow;
  var row;
  var rows = Math.ceil(numChildren / data.columns);

  marginColumn = data.marginColumn;
  marginRow = data.marginRow;
  if (marginDefined) {
    marginColumn = data.margin;
    marginRow = data.margin;
  }

  offsetRow = getOffsetItemIndex(data.align, rows);
  offsetColumn = getOffsetItemIndex(data.align, data.columns);

  for (row = 0; row < rows; row++) {
    for (column = 0; column < data.columns; column++) {
      positionHelper.set(0, 0, 0);
      if (data.plane.indexOf('x') === 0) {
        positionHelper.x = (column - offsetColumn) * marginColumn;
      }
      if (data.plane.indexOf('y') === 0) {
        positionHelper.y = (column - offsetColumn) * marginColumn;
      }
      if (data.plane.indexOf('y') === 1) {
        positionHelper.y = (row - offsetRow) * marginRow;
      }
      if (data.plane.indexOf('z') === 1) {
        positionHelper.z = (row - offsetRow) * marginRow;
      }
      pushPositionVec3(positionHelper);
    }
  }

  return positions;
}
module.exports.getBoxPositions = getBoxPositions;

/**
 * Get positions for `circle` layout.
 */
function getCirclePositions (data, numChildren) {
  var i;
  var rad;

  for (i = 0; i < numChildren; i++) {
    rad;

    if (isNaN(data.angle)) {
      rad = i * (2 * Math.PI) / numChildren;
    } else {
      rad = i * data.angle * 0.01745329252;  // Angle to radian.
    }

    positionHelper.set(0, 0, 0);
    if (data.plane.indexOf('x') === 0) {
      positionHelper.x = data.radius * Math.cos(rad);
    }
    if (data.plane.indexOf('y') === 0) {
      positionHelper.y = data.radius * Math.cos(rad);
    }
    if (data.plane.indexOf('y') === 1) {
      positionHelper.y = data.radius * Math.sin(rad);
    }
    if (data.plane.indexOf('z') === 1) {
      positionHelper.z = data.radius * Math.sin(rad);
    }
    pushPositionVec3(positionHelper);
  }
  return positions;
}
module.exports.getCirclePositions = getCirclePositions;

/**
 * Get positions for `line` layout.
 * TODO: 3D margins.
 */
function getLinePositions (data, numChildren) {
  data.columns = numChildren;
  return getBoxPositions(data, numChildren, true);
}
module.exports.getLinePositions = getLinePositions;

/**
 * Get positions for `cube` layout.
 */
function getCubePositions (data, numChildren) {
  pushPositions(
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
    -1, 0, 0,
    0, -1, 0,
    0, 0, -1
  );
  scalePositions(data.radius / 2);
  return positions;
}
module.exports.getCubePositions = getCubePositions;

/**
 * Get positions for `dodecahedron` layout.
 */
function getDodecahedronPositions (data, numChildren) {
  var PHI = (1 + Math.sqrt(5)) / 2;
  var B = 1 / PHI;
  var C = 2 - PHI;
  var NB = -1 * B;
  var NC = -1 * C;
  pushPositions(
    -1, C, 0,
    -1, NC, 0,
    0, -1, C,
    0, -1, NC,
    0, 1, C,
    0, 1, NC,
    1, C, 0,
    1, NC, 0,
    B, B, B,
    B, B, NB,
    B, NB, B,
    B, NB, NB,
    C, 0, 1,
    C, 0, -1,
    NB, B, B,
    NB, B, NB,
    NB, NB, B,
    NB, NB, NB,
    NC, 0, 1,
    NC, 0, -1
  );
  scalePositions(data.radius / 2);
  return positions;
}
module.exports.getDodecahedronPositions = getDodecahedronPositions;

/**
 * Get positions for `pyramid` layout.
 */
function getPyramidPositions (data, numChildren) {
  var SQRT_3 = Math.sqrt(3);
  var NEG_SQRT_1_3 = -1 / Math.sqrt(3);
  var DBL_SQRT_2_3 = 2 * Math.sqrt(2 / 3);
  pushPositions(
    0, 0, SQRT_3 + NEG_SQRT_1_3,
    -1, 0, NEG_SQRT_1_3,
    1, 0, NEG_SQRT_1_3,
    0, DBL_SQRT_2_3, 0
  );
  scalePositions(data.radius / 2);
  return positions;
}
module.exports.getPyramidPositions = getPyramidPositions;

/**
 * Return the item index in a given list to calculate offsets from
 *
 * @param {string} align - One of `'start'`, `'center'`, `'end'`
 * @param {integer} numItems - Total number of items
 */
function getOffsetItemIndex (align, numItems) {
  switch (align) {
    case 'start':
      return numItems - 1;
    case 'center':
      return (numItems - 1) / 2;
    case 'end':
      return 0;
  }
}

/**
 * Multiply all coordinates by a scale factor and add translate.
 *
 * @params {array} positions - Array of coordinates in array form.
 * @returns {array} positions
 */
function scalePositions (scale) {
  var i;
  for (i = 0; i < positions.length; i++) {
    positions[i] = positions[i] * scale;
  }
};

/**
 * Set position on child entities.
 *
 * @param {array} els - Child entities to set.
 * @param {array} positions - Array of coordinates.
 */
function setPositions (els, positions, orderAttribute) {
  var value;
  var i;
  var orderIndex;

  // Allow for controlling order explicitly since DOM order does not have as much
  // meaning in A-Frame.
  if (orderAttribute) {
    for (i = 0; i < els.length; i++) {
      value = els[i].getAttribute(orderAttribute);
      if (value === null || value === undefined) { continue; }
      orderIndex = parseInt(value, 10) * 3;
      els[i].object3D.position.set(positions[orderIndex], positions[orderIndex + 1],
                                   positions[orderIndex + 2]);
    }
    return;
  }

  for (i = 0; i < positions.length; i += 3) {
    if (!els[i / 3]) { return; }
    els[i / 3].object3D.position.set(positions[i], positions[i + 1], positions[i + 2]);
  }
}

function pushPositions () {
  var i;
  for (i = 0; i < arguments.length; i++) {
    positions.push(i);
  }
}

function pushPositionVec3 (vec3) {
  positions.push(vec3.x);
  positions.push(vec3.y);
  positions.push(vec3.z);
}


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(11);

var bind = AFRAME.utils.bind;

AFRAME.registerComponent('orbit-controls', {
  dependencies: ['camera'],

  schema: {
    autoRotate: {type: 'boolean'},
    autoRotateSpeed: {default: 2},
    dampingFactor: {default: 0.1},
    enabled: {default: true},
    enableDamping: {default: true},
    enableKeys: {default: true},
    enablePan: {default: true},
    enableRotate: {default: true},
    enableZoom: {default: true},
    initialPosition: {type: 'vec3'},
    keyPanSpeed: {default: 7},
    minAzimuthAngle: {type: 'number', default: - Infinity},
    maxAzimuthAngle: {type: 'number', default: Infinity},
    maxDistance: {default: 1000},
    maxPolarAngle: {default: AFRAME.utils.device.isMobile() ? 90 : 120},
    minDistance: {default: 1},
    minPolarAngle: {default: 0},
    minZoom: {default: 0},
    panSpeed: {default: 1},
    rotateSpeed: {default: 0.05},
    screenSpacePanning: {default: false},
    target: {type: 'vec3'},
    zoomSpeed: {default: 0.5}
  },

  init: function () {
    var el = this.el;
    var oldPosition;

    oldPosition = new THREE.Vector3();

    this.bindMethods();
    el.sceneEl.addEventListener('enter-vr', this.onEnterVR);
    el.sceneEl.addEventListener('exit-vr', this.onExitVR);

    document.body.style.cursor = 'grab';
    document.addEventListener('mousedown', () => {
      document.body.style.cursor = 'grabbing';
    });
    document.addEventListener('mouseup', () => {
      document.body.style.cursor = 'grab';
    });

    this.target = new THREE.Vector3();
    el.getObject3D('camera').position.copy(this.data.initialPosition);
  },

  pause: function () {
    this.controls.dispose();
  },

  play: function () {
    const el = this.el;
    this.controls = new THREE.OrbitControls(el.getObject3D('camera'), el.sceneEl.renderer.domElement);
    this.update();
  },

  onEnterVR: function() {
    var el = this.el;

    if (!AFRAME.utils.device.checkHeadsetConnected() &&
        !AFRAME.utils.device.isMobile()) { return; }
    this.controls.enabled = false;
    if (el.hasAttribute('look-controls')) {
      el.setAttribute('look-controls', 'enabled', true);
      oldPosition.copy(el.getObject3D('camera').position);
      el.getObject3D('camera').position.set(0, 0, 0);
    }
  },

  onExitVR: function() {
    var el = this.el;

    if (!AFRAME.utils.device.checkHeadsetConnected() &&
        !AFRAME.utils.device.isMobile()) { return; }
    this.controls.enabled = true;
    el.getObject3D('camera').position.copy(oldPosition);
    if (el.hasAttribute('look-controls')) {
      el.setAttribute('look-controls', 'enabled', false);
    }
  },

  bindMethods: function() {
    this.onEnterVR = bind(this.onEnterVR, this);
    this.onExitVR = bind(this.onExitVR, this);
  },

  update: function (oldData) {
    var controls = this.controls;
    var data = this.data;

    if (!controls) { return; }

    controls.target = this.target.copy(data.target);
    controls.autoRotate = data.autoRotate;
    controls.autoRotateSpeed = data.autoRotateSpeed;
    controls.dampingFactor = data.dampingFactor;
    controls.enabled = data.enabled;
    controls.enableDamping = data.enableDamping;
    controls.enableKeys = data.enableKeys;
    controls.enablePan = data.enablePan;
    controls.enableRotate = data.enableRotate;
    controls.enableZoom = data.enableZoom;
    controls.keyPanSpeed = data.keyPanSpeed;
    controls.maxPolarAngle = THREE.Math.degToRad(data.maxPolarAngle);
    controls.maxAzimuthAngle = THREE.Math.degToRad(data.maxAzimuthAngle);
    controls.maxDistance = data.maxDistance;
    controls.minDistance = data.minDistance;
    controls.minPolarAngle = THREE.Math.degToRad(data.minPolarAngle);
    controls.minAzimuthAngle = THREE.Math.degToRad(data.minAzimuthAngle);
    controls.minZoom = data.minZoom;
    controls.panSpeed = data.panSpeed;
    controls.rotateSpeed = data.rotateSpeed;
    controls.screenSpacePanning = data.screenSpacePanning;
    controls.zoomSpeed = data.zoomSpeed;
  },

  tick: function () {
    var controls = this.controls;
    var data = this.data;
    if (!data.enabled) { return; }
    if (controls.enabled && (controls.enableDamping || controls.autoRotate)) {
      this.controls.update();
    }
  },

  remove: function() {
    this.controls.reset();
    this.controls.dispose();

    this.el.sceneEl.removeEventListener('enter-vr', this.onEnterVR);
    this.el.sceneEl.removeEventListener('exit-vr', this.onExitVR);
  }
});


/***/ }),
/* 11 */
/***/ (() => {

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finger swipe

THREE.OrbitControls = function ( object, domElement ) {

	this.object = object;

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the object orbits around
	this.target = new THREE.Vector3();

	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// How far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
	this.enableDamping = false;
	this.dampingFactor = 0.25;

	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	// Set to false to disable rotating
	this.enableRotate = true;
	this.rotateSpeed = 1.0;

	// Set to false to disable panning
	this.enablePan = true;
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// Set to false to disable use of the keys
	this.enableKeys = true;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
	this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;

	//
	// public methods
	//

	this.getPolarAngle = function () {

		return spherical.phi;

	};

	this.getAzimuthalAngle = function () {

		return spherical.theta;

	};

	this.saveState = function () {

		scope.target0.copy( scope.target );
		scope.position0.copy( scope.object.position );
		scope.zoom0 = scope.object.zoom;

	};

	this.reset = function () {

		scope.target.copy( scope.target0 );
		scope.object.position.copy( scope.position0 );
		scope.object.zoom = scope.zoom0;

		scope.object.updateProjectionMatrix();
		scope.dispatchEvent( changeEvent );

		scope.update();

		state = STATE.NONE;

	};

	// this method is exposed, but perhaps it would be better if we can make it private...
	this.update = function () {

		var offset = new THREE.Vector3();

		// so camera.up is the orbit axis
		var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
		var quatInverse = quat.clone().inverse();

		var lastPosition = new THREE.Vector3();
		var lastQuaternion = new THREE.Quaternion();

		return function update() {

			var position = scope.object.position;

			offset.copy( position ).sub( scope.target );

			// rotate offset to "y-axis-is-up" space
			offset.applyQuaternion( quat );

			// angle from z-axis around y-axis
			spherical.setFromVector3( offset );

			if ( scope.autoRotate && state === STATE.NONE ) {

				rotateLeft( getAutoRotationAngle() );

			}

			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;

			// restrict theta to be between desired limits
			spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );

			// restrict phi to be between desired limits
			spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );

			spherical.makeSafe();


			spherical.radius *= scale;

			// restrict radius to be between desired limits
			spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

			// move target to panned location
			scope.target.add( panOffset );

			offset.setFromSpherical( spherical );

			// rotate offset back to "camera-up-vector-is-up" space
			offset.applyQuaternion( quatInverse );

			position.copy( scope.target ).add( offset );

			scope.object.lookAt( scope.target );

			if ( scope.enableDamping === true ) {

				sphericalDelta.theta *= ( 1 - scope.dampingFactor );
				sphericalDelta.phi *= ( 1 - scope.dampingFactor );

			} else {

				sphericalDelta.set( 0, 0, 0 );

			}

			scale = 1;
			panOffset.set( 0, 0, 0 );

			// update condition is:
			// min(camera displacement, camera rotation in radians)^2 > EPS
			// using small-angle approximation cos(x/2) = 1 - x^2 / 8

			if ( zoomChanged ||
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

				scope.dispatchEvent( changeEvent );

				lastPosition.copy( scope.object.position );
				lastQuaternion.copy( scope.object.quaternion );
				zoomChanged = false;

				return true;

			}

			return false;

		};

	}();

	this.dispose = function () {

		scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
		scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		scope.domElement.removeEventListener( 'wheel', onMouseWheel, false );

		scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
		scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
		scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		window.removeEventListener( 'keydown', onKeyDown, false );

		//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

	};

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	var STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };

	var state = STATE.NONE;

	var EPS = 0.000001;

	// current position in spherical coordinates
	var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();

	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function rotateLeft( angle ) {

		sphericalDelta.theta -= angle;

	}

	function rotateUp( angle ) {

		sphericalDelta.phi -= angle;

	}

	var panLeft = function () {

		var v = new THREE.Vector3();

		return function panLeft( distance, objectMatrix ) {

			v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
			v.multiplyScalar( - distance );

			panOffset.add( v );

		};

	}();

	var panUp = function () {

		var v = new THREE.Vector3();

		return function panUp( distance, objectMatrix ) {

			v.setFromMatrixColumn( objectMatrix, 1 ); // get Y column of objectMatrix
			v.multiplyScalar( distance );

			panOffset.add( v );

		};

	}();

	// deltaX and deltaY are in pixels; right and down are positive
	var pan = function () {

		var offset = new THREE.Vector3();

		return function pan( deltaX, deltaY ) {

			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

			if ( scope.object.isPerspectiveCamera ) {

				// perspective
				var position = scope.object.position;
				offset.copy( position ).sub( scope.target );
				var targetDistance = offset.length();

				// half of the fov is center to top of screen
				targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

				// we actually don't use screenWidth, since perspective camera is fixed to screen height
				panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
				panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );

			} else if ( scope.object.isOrthographicCamera ) {

				// orthographic
				panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
				panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );

			} else {

				// camera neither orthographic nor perspective
				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
				scope.enablePan = false;

			}

		};

	}();

	function dollyIn( dollyScale ) {

		if ( scope.object.isPerspectiveCamera ) {

			scale /= dollyScale;

		} else if ( scope.object.isOrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	function dollyOut( dollyScale ) {

		if ( scope.object.isPerspectiveCamera ) {

			scale *= dollyScale;

		} else if ( scope.object.isOrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	//
	// event callbacks - update the object state
	//

	function handleMouseDownRotate( event ) {

		//console.log( 'handleMouseDownRotate' );

		rotateStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownDolly( event ) {

		//console.log( 'handleMouseDownDolly' );

		dollyStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownPan( event ) {

		//console.log( 'handleMouseDownPan' );

		panStart.set( event.clientX, event.clientY );

	}

	function handleMouseMoveRotate( event ) {

		//console.log( 'handleMouseMoveRotate' );

		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleMouseMoveDolly( event ) {

		//console.log( 'handleMouseMoveDolly' );

		dollyEnd.set( event.clientX, event.clientY );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyIn( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyOut( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleMouseMovePan( event ) {

		//console.log( 'handleMouseMovePan' );

		panEnd.set( event.clientX, event.clientY );

		panDelta.subVectors( panEnd, panStart );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleMouseUp( event ) {

		// console.log( 'handleMouseUp' );

	}

	function handleMouseWheel( event ) {

		// console.log( 'handleMouseWheel' );

		if ( event.deltaY < 0 ) {

			dollyOut( getZoomScale() );

		} else if ( event.deltaY > 0 ) {

			dollyIn( getZoomScale() );

		}

		scope.update();

	}

	function handleKeyDown( event ) {

		//console.log( 'handleKeyDown' );

		switch ( event.keyCode ) {

			case scope.keys.UP:
				pan( 0, scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.BOTTOM:
				pan( 0, - scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.LEFT:
				pan( scope.keyPanSpeed, 0 );
				scope.update();
				break;

			case scope.keys.RIGHT:
				pan( - scope.keyPanSpeed, 0 );
				scope.update();
				break;

		}

	}

	function handleTouchStartRotate( event ) {

		//console.log( 'handleTouchStartRotate' );

		rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchStartDolly( event ) {

		//console.log( 'handleTouchStartDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyStart.set( 0, distance );

	}

	function handleTouchStartPan( event ) {

		//console.log( 'handleTouchStartPan' );

		panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchMoveRotate( event ) {

		//console.log( 'handleTouchMoveRotate' );

		rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleTouchMoveDolly( event ) {

		//console.log( 'handleTouchMoveDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyEnd.set( 0, distance );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyOut( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyIn( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleTouchMovePan( event ) {

		//console.log( 'handleTouchMovePan' );

		panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

		panDelta.subVectors( panEnd, panStart );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleTouchEnd( event ) {

		//console.log( 'handleTouchEnd' );

	}

	//
	// event handlers - FSM: listen for events and reset state
	//

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( event.button ) {

			case scope.mouseButtons.ORBIT:

				if ( scope.enableRotate === false ) return;

				handleMouseDownRotate( event );

				state = STATE.ROTATE;

				break;

			case scope.mouseButtons.ZOOM:

				if ( scope.enableZoom === false ) return;

				handleMouseDownDolly( event );

				state = STATE.DOLLY;

				break;

			case scope.mouseButtons.PAN:

				if ( scope.enablePan === false ) return;

				handleMouseDownPan( event );

				state = STATE.PAN;

				break;

		}

		if ( state !== STATE.NONE ) {

			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );

			scope.dispatchEvent( startEvent );

		}

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( state ) {

			case STATE.ROTATE:

				if ( scope.enableRotate === false ) return;

				handleMouseMoveRotate( event );

				break;

			case STATE.DOLLY:

				if ( scope.enableZoom === false ) return;

				handleMouseMoveDolly( event );

				break;

			case STATE.PAN:

				if ( scope.enablePan === false ) return;

				handleMouseMovePan( event );

				break;

		}

	}

	function onMouseUp( event ) {

		if ( scope.enabled === false ) return;

		handleMouseUp( event );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.enableZoom === false || ( state !== STATE.NONE && state !== STATE.ROTATE ) ) return;

		event.preventDefault();

		scope.dispatchEvent( startEvent );

		handleMouseWheel( event );

		scope.dispatchEvent( endEvent );

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;

		handleKeyDown( event );

	}

	function onTouchStart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:	// one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;

				handleTouchStartRotate( event );

				state = STATE.TOUCH_ROTATE;

				break;

			case 2:	// two-fingered touch: dolly

				if ( scope.enableZoom === false ) return;

				handleTouchStartDolly( event );

				state = STATE.TOUCH_DOLLY;

				break;

			case 3: // three-fingered touch: pan

				if ( scope.enablePan === false ) return;

				handleTouchStartPan( event );

				state = STATE.TOUCH_PAN;

				break;

			default:

				state = STATE.NONE;

		}

		if ( state !== STATE.NONE ) {

			scope.dispatchEvent( startEvent );

		}

	}

	function onTouchMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( event.touches.length ) {

			case 1: // one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;
				if ( state !== STATE.TOUCH_ROTATE ) return; // is this needed?...

				handleTouchMoveRotate( event );

				break;

			case 2: // two-fingered touch: dolly

				if ( scope.enableZoom === false ) return;
				if ( state !== STATE.TOUCH_DOLLY ) return; // is this needed?...

				handleTouchMoveDolly( event );

				break;

			case 3: // three-fingered touch: pan

				if ( scope.enablePan === false ) return;
				if ( state !== STATE.TOUCH_PAN ) return; // is this needed?...

				handleTouchMovePan( event );

				break;

			default:

				state = STATE.NONE;

		}

	}

	function onTouchEnd( event ) {

		if ( scope.enabled === false ) return;

		handleTouchEnd( event );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onContextMenu( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

	}

	//

	scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
	scope.domElement.addEventListener( 'wheel', onMouseWheel, false );

	scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
	scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
	scope.domElement.addEventListener( 'touchmove', onTouchMove, false );

	window.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start

	this.update();

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

Object.defineProperties( THREE.OrbitControls.prototype, {

	center: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .center has been renamed to .target' );
			return this.target;

		}

	},

	// backward compatibility

	noZoom: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			return ! this.enableZoom;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			this.enableZoom = ! value;

		}

	},

	noRotate: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			return ! this.enableRotate;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			this.enableRotate = ! value;

		}

	},

	noPan: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			return ! this.enablePan;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			this.enablePan = ! value;

		}

	},

	noKeys: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			return ! this.enableKeys;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			this.enableKeys = ! value;

		}

	},

	staticMoving: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			return ! this.enableDamping;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			this.enableDamping = ! value;

		}

	},

	dynamicDampingFactor: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			return this.dampingFactor;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			this.dampingFactor = value;

		}

	}

} );


/***/ }),
/* 12 */
/***/ (() => {

/**
 * Listen to event and forward to another entity or entities.
 */
AFRAME.registerComponent('proxy-event', {
  schema: {
    captureBubbles: {default: false},
    enabled: {default: true},
    event: {type: 'string'},
    from: {type: 'string'},
    to: {type: 'string'},
    as: {type: 'string'},
    bubbles: {default: false}
  },

  multiple: true,

  init: function () {
    var data = this.data;
    var el = this.el;
    var from;
    var i;
    var to;
    var self = this;

    if (data.from) {
      if (data.from === 'PARENT') {
        from = [el.parentNode];
      } else {
        from = document.querySelectorAll(data.from);
      }
    } else {
      if (data.to === 'CHILDREN') {
        to = el.querySelectorAll('*');
      } else if (data.to === 'SELF') {
        to = [el];
      } else {
        to = document.querySelectorAll(data.to);
      }
    }

    if (data.from) {
      for (i = 0; i < from.length; i++) {
        this.addEventListenerFrom(from[i]);
      }
    } else {
      el.addEventListener(data.event, function (evt) {
        var data = self.data;
        if (!data.enabled) { return; }
        if (!data.captureBubbles && evt.target !== el) { return; }
        for (i = 0; i < to.length; i++) {
          to[i].emit(data.as || data.event, evt['detail'] ? evt.detail : null, data.bubbles);
        }
      });
    }
  },

  addEventListenerFrom: function (fromEl) {
    var data = this.data;
    var self = this;
    fromEl.addEventListener(data.event, function (evt) {
      var data = self.data;
      if (!data.enabled) { return; }
      if (!data.captureBubbles && evt.target !== fromEl) { return; }
      self.el.emit(data.as || data.event, evt['detail'] ? evt.detail : null, false);
    });
  }
});


/***/ }),
/* 13 */
/***/ (function(module) {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else { var i, a; }
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __nested_webpack_require_573__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __nested_webpack_require_573__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__nested_webpack_require_573__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__nested_webpack_require_573__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__nested_webpack_require_573__.d = function(exports, name, getter) {
/******/ 		if(!__nested_webpack_require_573__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__nested_webpack_require_573__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__nested_webpack_require_573__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__nested_webpack_require_573__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__nested_webpack_require_573__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __nested_webpack_require_573__(__nested_webpack_require_573__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __nested_webpack_require_2850__) {

/* global AFRAME */

if (typeof AFRAME === 'undefined') {
	throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerShader('ring', {
	schema: {
		blur: { default: 0.01, is: 'uniform' },
		color: { type: 'color', is: 'uniform' },
		progress: { default: 0, is: 'uniform' },
		radiusInner: { default: 0.6, is: 'uniform' },
		radiusOuter: { default: 1, is: 'uniform' }
	},

	vertexShader: __nested_webpack_require_2850__(1),

	fragmentShader: __nested_webpack_require_2850__(2)
});

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = "varying vec2 vUv;\n\nvoid main () {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}\n"

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = "#extension GL_OES_standard_derivatives : enable\n#define PI 3.14159265358979\nuniform float blur;\nuniform float progress;\nuniform float radiusInner;\nuniform float radiusOuter;\nuniform vec3 color;\n\nvarying vec2 vUv;\n\nvoid main () {\n  // make uvs go from -1 to 1\n  vec2 uv = vec2(vUv.x * 2.0 - 1.0, vUv.y * 2.0 - 1.0);\n  // calculate distance of fragment to center\n  float r = uv.x * uv.x + uv.y * uv.y;\n  // calculate antialias\n  float aa = fwidth(r);\n  // make full circle (radiusOuter - radiusInner)\n  float col = (1.0 - smoothstep(radiusOuter - aa, radiusOuter + blur + aa, r)) * smoothstep(radiusInner - aa, radiusInner + blur + aa, r);\n  // radial gradient\n  float a = smoothstep(-PI-aa, PI+aa, atan(uv.y, uv.x));\n  // progress angle\n  float p = 1.0 - progress - blur;\n  // apply progress to full circle (1 for done part, 0 for part to go)\n  col *= smoothstep(p, p + blur, a);\n  // multiply by user color\n  gl_FragColor = vec4(color * col, col);\n}\n"

/***/ })
/******/ ]);
});

/***/ }),
/* 14 */
/***/ (function(module) {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else { var i, a; }
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __nested_webpack_require_573__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __nested_webpack_require_573__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__nested_webpack_require_573__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__nested_webpack_require_573__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__nested_webpack_require_573__.d = function(exports, name, getter) {
/******/ 		if(!__nested_webpack_require_573__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__nested_webpack_require_573__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__nested_webpack_require_573__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__nested_webpack_require_573__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__nested_webpack_require_573__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __nested_webpack_require_573__(__nested_webpack_require_573__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Pre-compiled functions.
var selectFunctions = {};

/**
 * Select value from store. Handles boolean operations, calls `selectProperty`.
 *
 * @param {object} state - State object.
 * @param {string} selector - Dot-delimited store keys (e.g., game.player.health).
 * @param {object} item - From bind-item.
 */
function select(state, selector, item) {
  if (!selectFunctions[selector]) {
    selectFunctions[selector] = new Function('state', 'item', 'return ' + generateExpression(selector) + ';');
  }
  return selectFunctions[selector](state, item);
}
module.exports.select = select;

var DOT_NOTATION_RE = /\.([A-Za-z][\w_-]*)/g;
var WHITESPACE_RE = /\s/g;
var STATE_SELECTOR_RE = /([=&|!?:+-])(\s*)([\(]?)([A-Za-z][\w_-]*)/g;
var ROOT_STATE_SELECTOR_RE = /^([\(]?)([A-Za-z][\w_-]*)/g;
var ITEM_RE = /state\["item"\]/g;
var STATE_STR = 'state';
function generateExpression(str) {
  str = str.replace(DOT_NOTATION_RE, '["$1"]');
  str = str.replace(ROOT_STATE_SELECTOR_RE, '$1state["$2"]');
  str = str.replace(STATE_SELECTOR_RE, '$1$2$3state["$4"]');
  str = str.replace(ITEM_RE, 'item');
  return str;
}
module.exports.generateExpression = generateExpression;

function clearObject(obj) {
  for (var key in obj) {
    delete obj[key];
  }
}
module.exports.clearObject = clearObject;

/**
 * Helper to compose object of handlers, merging functions handling same action.
 */
function composeHandlers() {
  var actionName;
  var i;
  var inputHandlers = arguments;
  var outputHandlers;

  outputHandlers = {};
  for (i = 0; i < inputHandlers.length; i++) {
    for (actionName in inputHandlers[i]) {
      if (actionName in outputHandlers) {
        // Initial compose/merge functions into arrays.
        if (outputHandlers[actionName].constructor === Array) {
          outputHandlers[actionName].push(inputHandlers[i][actionName]);
        } else {
          outputHandlers[actionName] = [outputHandlers[actionName], inputHandlers[i][actionName]];
        }
      } else {
        outputHandlers[actionName] = inputHandlers[i][actionName];
      }
    }
  }

  // Compose functions specified via array.
  for (actionName in outputHandlers) {
    if (outputHandlers[actionName].constructor === Array) {
      outputHandlers[actionName] = composeFunctions.apply(this, outputHandlers[actionName]);
    }
  }

  return outputHandlers;
}
module.exports.composeHandlers = composeHandlers;

function composeFunctions() {
  var functions = arguments;
  return function () {
    var i;
    for (i = 0; i < functions.length; i++) {
      functions[i].apply(this, arguments);
    }
  };
}
module.exports.composeFunctions = composeFunctions;

var NO_WATCH_TOKENS = ['||', '&&', '!=', '!==', '==', '===', '>', '<', '<=', '>='];
var WHITESPACE_PLUS_RE = /\s+/;
var SYMBOLS = /\(|\)|\!/g;
function parseKeysToWatch(keys, str, isBindItem) {
  var i;
  var tokens;
  tokens = split(str, WHITESPACE_PLUS_RE);
  for (i = 0; i < tokens.length; i++) {
    if (NO_WATCH_TOKENS.indexOf(tokens[i]) === -1 && !tokens[i].startsWith("'") && keys.indexOf(tokens[i]) === -1) {
      if (isBindItem && tokens[i] === 'item') {
        continue;
      }
      keys.push(parseKeyToWatch(tokens[i]).replace(SYMBOLS, ''));
    }
  }
  return keys;
}
module.exports.parseKeysToWatch = parseKeysToWatch;

function parseKeyToWatch(str) {
  var dotIndex;
  str = stripNot(str.trim());
  dotIndex = str.indexOf('.');
  if (dotIndex === -1) {
    return str;
  }
  return str.substring(0, str.indexOf('.'));
}

function stripNot(str) {
  if (str.indexOf('!!') === 0) {
    return str.replace('!!', '');
  } else if (str.indexOf('!') === 0) {
    return str.replace('!', '');
  }
  return str;
}

/**
 * Cached split.
 */
var SPLIT_CACHE = {};
function split(str, delimiter) {
  if (!SPLIT_CACHE[delimiter]) {
    SPLIT_CACHE[delimiter] = {};
  }
  if (SPLIT_CACHE[delimiter][str]) {
    return SPLIT_CACHE[delimiter][str];
  }
  SPLIT_CACHE[delimiter][str] = str.split(delimiter);
  return SPLIT_CACHE[delimiter][str];
}
module.exports.split = split;

function copyArray(dest, src) {
  var i;
  dest.length = 0;
  for (i = 0; i < src.length; i++) {
    dest[i] = src[i];
  }
}
module.exports.copyArray = copyArray;

/***/ }),
/* 1 */
/***/ (function(module, exports, __nested_webpack_require_7121__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

__nested_webpack_require_7121__(2);
var diff = __nested_webpack_require_7121__(3);
var lib = __nested_webpack_require_7121__(0);
var wrapArray = __nested_webpack_require_7121__(4).wrapArray;

// Singleton state definition.
var State = {
  initialState: {},
  nonBindedStateKeys: [],
  handlers: {},
  computeState: function computeState() {/* no-op */}
};

var STATE_UPDATE_EVENT = 'stateupdate';
var TYPE_OBJECT = 'object';
var WHITESPACE_REGEX = /s+/;

AFRAME.registerState = function (definition) {
  AFRAME.utils.extendDeep(State, definition);
};

AFRAME.registerSystem('state', {
  init: function init() {
    var _this = this;

    var key;

    this.arrays = [];
    this.dirtyArrays = [];
    this.diff = {};
    this.state = AFRAME.utils.clone(State.initialState);
    this.subscriptions = [];
    this.initEventHandlers();

    // Wrap array to detect dirty.
    for (key in this.state) {
      if (this.state[key] && this.state[key].constructor === Array) {
        this.arrays.push(key);
        this.state[key].__dirty = true;
        wrapArray(this.state[key]);
      }
    }

    this.lastState = AFRAME.utils.clone(this.state);

    this.eventDetail = {
      lastState: this.lastState,
      state: this.state
    };

    this.el.addEventListener('loaded', function () {
      var i;
      // Initial compute.
      State.computeState(_this.state, '@@INIT');
      // Initial dispatch.
      for (i = 0; i < _this.subscriptions.length; i++) {
        _this.subscriptions[i].onStateUpdate(_this.state);
      }
    });
  },

  /**
   * Dispatch action.
   */
  dispatch: function () {
    var toUpdate = [];

    return function (actionName, payload) {
      var dirtyArrays;
      var i;
      var key;
      var subscription;

      // Modify state.
      State.handlers[actionName](this.state, payload);

      // Post-compute.
      State.computeState(this.state, actionName, payload);

      // Get a diff to optimize bind updates.
      for (key in this.diff) {
        delete this.diff[key];
      }
      diff(this.lastState, this.state, this.diff, State.nonBindedStateKeys);

      this.dirtyArrays.length = 0;
      for (i = 0; i < this.arrays.length; i++) {
        if (this.state[this.arrays[i]].__dirty) {
          this.dirtyArrays.push(this.arrays[i]);
        }
      }

      // Notify subscriptions / binders.
      toUpdate.length = 0;
      for (i = 0; i < this.subscriptions.length; i++) {
        if (this.subscriptions[i].name === 'bind-for') {
          // For arrays and bind-for, check __dirty flag on array rather than the diff.
          if (!this.state[this.subscriptions[i].keysToWatch[0]].__dirty) {
            continue;
          }
        } else {
          if (!this.shouldUpdate(this.subscriptions[i].keysToWatch, this.diff, this.dirtyArrays)) {
            continue;
          }
        }

        // Keep track to only update subscriptions once.
        if (toUpdate.indexOf(this.subscriptions[i]) === -1) {
          toUpdate.push(this.subscriptions[i]);
        }
      }

      // Update subscriptions.
      for (i = 0; i < toUpdate.length; i++) {
        toUpdate[i].onStateUpdate();
      }

      // Unset array dirty.
      for (key in this.state) {
        if (this.state[key] && this.state[key].constructor === Array) {
          this.state[key].__dirty = false;
        }
      }

      // Store last state.
      this.copyState(this.lastState, this.state);

      // Emit.
      this.eventDetail.action = actionName;
      this.eventDetail.payload = payload;
      this.el.emit(STATE_UPDATE_EVENT, this.eventDetail);
    };
  }(),

  /**
   * Store last state through a deep extend, but not for arrays.
   */
  copyState: function copyState(lastState, state, isRecursive) {
    var key;

    for (key in state) {
      // Don't copy pieces of state keys that are non-binded or untracked.
      if (!isRecursive && State.nonBindedStateKeys.indexOf(key) !== -1) {
        continue;
      }

      // Nested state.
      if (state[key] && state[key].constructor === Object) {
        if (!(key in lastState)) {
          // Clone object if destination does not exist.
          lastState[key] = AFRAME.utils.clone(state[key]);
          continue;
        }
        // Recursively copy state.
        this.copyState(lastState[key], state[key], true);
        continue;
      }

      // Copy by value.
      lastState[key] = state[key];
    }
  },

  subscribe: function subscribe(component) {
    this.subscriptions.push(component);
  },

  unsubscribe: function unsubscribe(component) {
    this.subscriptions.splice(this.subscriptions.indexOf(component), 1);
  },

  /**
   * Check if state changes were relevant to this binding. If not, don't call.
   */
  shouldUpdate: function shouldUpdate(keysToWatch, diff, dirtyArrays) {
    for (var i = 0; i < keysToWatch.length; i++) {
      if (keysToWatch[i] in diff || dirtyArrays.indexOf(keysToWatch[i]) !== -1) {
        return true;
      }
    }
    return false;
  },

  /**
   * Proxy events to action dispatches so components can just bubble actions up as events.
   * Handlers define which actions they handle. Go through all and add event listeners.
   */
  initEventHandlers: function initEventHandlers() {
    var actionName;
    var registeredActions = [];
    var self = this;

    registerListener = registerListener.bind(this);

    // Use declared handlers to know what events to listen to.
    for (actionName in State.handlers) {
      // Only need to register one handler for each event.
      if (registeredActions.indexOf(actionName) !== -1) {
        continue;
      }
      registeredActions.push(actionName);
      registerListener(actionName);
    }

    function registerListener(actionName) {
      var _this2 = this;

      this.el.addEventListener(actionName, function (evt) {
        _this2.dispatch(actionName, evt.detail);
      });
    }
  },

  /**
   * Render template to string with item data.
   */
  renderTemplate: function () {
    // Braces, whitespace, optional item name, item key, whitespace, braces.
    var interpRegex = /{{\s*(\w*\.)?([\w.]+)\s*}}/g;

    return function (template, data, asString) {
      var match;
      var str;

      str = template;

      // Data will be null if initialize pool for bind-for.updateInPlace.
      if (data) {
        while (match = interpRegex.exec(template)) {
          str = str.replace(match[0], (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === TYPE_OBJECT ? lib.select(data, match[2]) || '' : data);
        }
      }

      // Return as string.
      if (asString) {
        return str;
      }

      // Return as DOM.
      return document.createRange().createContextualFragment(str);
    };
  }(),

  select: lib.select
});

/**
 * Bind component property to a value in state.
 *
 * bind="geometry.width: car.width""
 * bind__material="color: enemy.color; opacity: enemy.opacity"
 * bind__visible="player.visible"
 */
AFRAME.registerComponent('bind', {
  schema: {
    default: {},
    parse: function parse(value) {
      // Parse style-like object.
      var data;
      var i;
      var properties;
      var pair;

      // Using setAttribute with object, no need to parse.
      if (value.constructor === Object) {
        return value;
      }

      // Using instanced ID as component namespace for single-property component,
      // nothing to separate.
      if (value.indexOf(':') === -1) {
        return value;
      }

      // Parse style-like object as keys to values.
      data = {};
      properties = lib.split(value, ';');
      for (i = 0; i < properties.length; i++) {
        pair = lib.split(properties[i].trim(), ':');
        data[pair[0]] = pair[1].trim();
      }
      return data;
    }
  },

  multiple: true,

  init: function init() {
    var componentId;
    var data = this.data;
    var key;

    this.keysToWatch = [];
    this.onStateUpdate = this.onStateUpdate.bind(this);
    this.system = this.el.sceneEl.systems.state;

    // Whether we are binding by namespace (e.g., bind__foo="prop1: true").
    if (this.id) {
      componentId = lib.split(this.id, '__')[0];
    }

    this.isNamespacedBind = this.id && componentId in AFRAME.components && !AFRAME.components[componentId].isSingleProp || componentId in AFRAME.systems;

    this.lastData = {};
    this.updateObj = {};

    // Subscribe to store and register handler to do data-binding to components.
    this.system.subscribe(this);

    this.onStateUpdate = this.onStateUpdate.bind(this);
  },

  update: function update() {
    var data = this.data;
    var key;
    var property;

    // Index `keysToWatch` to only update state on relevant changes.
    this.keysToWatch.length = 0;
    if (typeof data === 'string') {
      lib.parseKeysToWatch(this.keysToWatch, data);
    } else {
      for (key in data) {
        lib.parseKeysToWatch(this.keysToWatch, data[key]);
      }
    }

    this.onStateUpdate();
  },

  /**
   * Handle state update.
   */
  onStateUpdate: function onStateUpdate() {
    // Update component with the state.
    var hasKeys = false;
    var el = this.el;
    var propertyName;
    var stateSelector;
    var state;
    var tempNode;
    var value;

    if (!el.parentNode) {
      return;
    }
    if (this.isNamespacedBind) {
      lib.clearObject(this.updateObj);
    }

    state = this.system.state;

    // Single-property bind.
    if (_typeof(this.data) !== TYPE_OBJECT) {
      try {
        value = lib.select(state, this.data);
      } catch (e) {
        throw new Error('[aframe-state-component] Key \'' + this.data + '\' not found in state.' + (' #' + this.el.getAttribute('id') + '[' + this.attrName + ']'));
      }

      if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== TYPE_OBJECT && _typeof(this.lastData) !== TYPE_OBJECT && this.lastData === value) {
        return;
      }

      AFRAME.utils.entity.setComponentProperty(el, this.id, value);
      this.lastData = value;
      return;
    }

    for (propertyName in this.data) {
      // Pointer to a value in the state (e.g., `player.health`).
      stateSelector = this.data[propertyName].trim();
      try {
        value = lib.select(state, stateSelector);
      } catch (e) {
        console.log(e);
        throw new Error('[aframe-state-component] Key \'' + stateSelector + '\' not found in state.' + (' #' + this.el.getAttribute('id') + '[' + this.attrName + ']'));
      }

      if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== TYPE_OBJECT && _typeof(this.lastData[propertyName]) !== TYPE_OBJECT && this.lastData[propertyName] === value) {
        continue;
      }

      // Remove component if value is `undefined`.
      if (propertyName in AFRAME.components && value === undefined) {
        el.removeAttribute(propertyName);
        return;
      }

      // Set using dot-delimited property name.
      if (this.isNamespacedBind) {
        // Batch if doing namespaced bind.
        this.updateObj[propertyName] = value;
      } else {
        AFRAME.utils.entity.setComponentProperty(el, propertyName, value);
      }

      this.lastData[propertyName] = value;
    }

    // Batch if doing namespaced bind.
    for (hasKeys in this.updateObj) {
      // See if object is empty.
    }
    if (this.isNamespacedBind && hasKeys) {
      el.setAttribute(this.id, this.updateObj);
    }
  },

  remove: function remove() {
    this.system.unsubscribe(this);
  }
});

/**
 * Toggle component attach and detach based on boolean value.
 *
 * bind-toggle__raycastable="isRaycastable""
 */
AFRAME.registerComponent('bind-toggle', {
  schema: { type: 'string' },

  multiple: true,

  init: function init() {
    this.system = this.el.sceneEl.systems.state;
    this.keysToWatch = [];
    this.onStateUpdate = this.onStateUpdate.bind(this);

    // Subscribe to store and register handler to do data-binding to components.
    this.system.subscribe(this);

    this.onStateUpdate();
  },

  update: function update() {
    this.keysToWatch.length = 0;
    lib.parseKeysToWatch(this.keysToWatch, this.data);
  },

  /**
   * Handle state update.
   */
  onStateUpdate: function onStateUpdate() {
    var el = this.el;
    var state;
    var value;

    state = this.system.state;

    try {
      value = lib.select(state, this.data);
    } catch (e) {
      throw new Error('[aframe-state-component] Key \'' + this.data + '\' not found in state.' + (' #' + this.el.getAttribute('id') + '[' + this.attrName + ']'));
    }

    if (value) {
      el.setAttribute(this.id, '');
    } else {
      el.removeAttribute(this.id);
    }
  },

  remove: function remove() {
    this.system.unsubscribe(this);
  }
});

module.exports = {
  composeFunctions: lib.composeFunctions,
  composeHandlers: lib.composeHandlers,
  select: lib.select
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __nested_webpack_require_20248__) {

"use strict";


var lib = __nested_webpack_require_20248__(0);

var ITEM_RE = /item/;
var ITEM_PREFIX_RE = /item./;
var ITEM_SELECTOR_RE = /item.(\w+)/;

/**
 * Render array from state.
 */
AFRAME.registerComponent('bind-for', {
  schema: {
    delay: { default: 0 },
    for: { type: 'string', default: 'item' },
    in: { type: 'string' },
    key: { type: 'string' },
    pool: { default: 0 },
    template: { type: 'string' },
    updateInPlace: { default: false }
  },

  init: function init() {
    // Subscribe to store and register handler to do data-binding to components.
    this.system = this.el.sceneEl.systems.state;
    this.onStateUpdate = this.onStateUpdate.bind(this);

    this.keysToWatch = [];
    this.renderedKeys = []; // Keys that are currently rendered.
    this.system.subscribe(this);

    if (this.el.children[0] && this.el.children[0].tagName === 'TEMPLATE') {
      this.template = this.el.children[0].innerHTML.trim();
    } else {
      this.template = document.querySelector(this.data.template).innerHTML.trim();
    }

    for (var i = 0; i < this.data.pool; i++) {
      this.el.appendChild(this.generateFromTemplate(null, i));
    }
  },

  update: function update() {
    this.keysToWatch[0] = lib.split(this.data.in, '.')[0];
    this.onStateUpdate();
  },

  /**
   * When items are swapped out, the old ones are removed, and new ones are added. All
   * entities will be reinitialized.
   */
  onStateUpdateNaive: function () {
    var activeKeys = [];

    return function () {
      var child;
      var data = this.data;
      var el = this.el;
      var list;
      var key;
      var keyValue;

      try {
        list = lib.select(this.system.state, data.in);
      } catch (e) {
        throw new Error('[aframe-state-component] Key \'' + data.in + '\' not found in state.' + (' #' + el.getAttribute('id') + '[' + this.attrName + ']'));
      }

      activeKeys.length = 0;
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        // If key not defined, use index (e.g., array of strings).
        activeKeys.push(data.key ? item[data.key].toString() : item.toString());
      }

      // Remove items by removing entities.
      var toRemoveEls = this.getElsToRemove(activeKeys, this.renderedKeys);
      for (var _i = 0; _i < toRemoveEls.length; _i++) {
        toRemoveEls[_i].parentNode.removeChild(toRemoveEls[_i]);
      }

      if (list.length) {
        this.renderItems(list, activeKeys, 0);
      }
    };
  }(),

  /**
   * Add or update item with delay support.
   */
  renderItems: function renderItems(list, activeKeys, i) {
    var _this = this;

    var data = this.data;
    var el = this.el;
    var itemEl;
    var item = list[i];

    // If key not defined, use index (e.g., array of strings).
    var keyValue = data.key ? item[data.key].toString() : item.toString();

    if (this.renderedKeys.indexOf(keyValue) === -1) {
      // Add.
      itemEl = this.generateFromTemplate(item, i);
      el.appendChild(itemEl);
      this.renderedKeys.push(keyValue);
    } else {
      // Update.
      if (list.length && list[0].constructor === String) {
        // Update index for simple list.
        var _keyValue = data.key ? item[data.key].toString() : item.toString();
        itemEl = el.querySelector('[data-bind-for-value="' + _keyValue + '"]');
        itemEl.setAttribute('data-bind-for-key', i);
      } else {
        var bindForKey = this.getBindForKey(item, i);
        itemEl = el.querySelector('[data-bind-for-key="' + bindForKey + '"]');
      }
      itemEl.emit('bindforupdate', item, false);
    }

    if (!list[i + 1]) {
      return;
    }

    if (this.data.delay) {
      setTimeout(function () {
        _this.renderItems(list, activeKeys, i + 1);
      }, this.data.delay);
    } else {
      this.renderItems(list, activeKeys, i + 1);
    }
  },

  /**
   * When items are swapped out, this algorithm will update component values in-place using
   * bind-item.
   */
  onStateUpdateInPlace: function () {
    var activeKeys = [];

    return function () {
      var data = this.data;
      var el = this.el;
      var list;
      var key;
      var keyValue;

      try {
        list = lib.select(this.system.state, data.in);
      } catch (e) {
        console.log(e);
        throw new Error('[aframe-state-component] Key \'' + data.in + '\' not found in state.' + (' #' + el.getAttribute('id') + '[' + this.attrName + ']'));
      }

      // Calculate keys that should be active.
      activeKeys.length = 0;
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        keyValue = data.key ? item[data.key].toString() : item.toString();
        activeKeys.push(keyValue);
      }

      // Remove items by pooling. Do before adding.
      var toRemoveEls = this.getElsToRemove(activeKeys, this.renderedKeys);
      for (var _i2 = 0; _i2 < toRemoveEls.length; _i2++) {
        toRemoveEls[_i2].object3D.visible = false;
        toRemoveEls[_i2].setAttribute('data-bind-for-active', 'false');
        toRemoveEls[_i2].removeAttribute('data-bind-for-key');
        toRemoveEls[_i2].removeAttribute('data-bind-for-value');
        toRemoveEls[_i2].emit('bindfordeactivate', null, false);
        toRemoveEls[_i2].pause();
      }

      if (list.length) {
        this.renderItemsInPlace(list, activeKeys, 0);
      }
    };
  }(),

  /**
   * Add, takeover, or update item with delay support.
   */
  renderItemsInPlace: function renderItemsInPlace(list, activeKeys, i) {
    var _this2 = this;

    var data = this.data;
    var el = this.el;
    var itemEl;

    var item = list[i];
    var bindForKey = this.getBindForKey(item, i);
    var keyValue = data.key ? item[data.key].toString() : item.toString();

    // Add item.
    if (this.renderedKeys.indexOf(keyValue) === -1) {
      if (!el.querySelector(':scope > [data-bind-for-active="false"]')) {
        // No items available in pool. Generate new entity.
        var _itemEl = this.generateFromTemplate(item, i);
        _itemEl.addEventListener('loaded', function () {
          _itemEl.emit('bindforupdateinplace', item, false);
        });
        el.appendChild(_itemEl);
      } else {
        // Take over inactive item.
        itemEl = el.querySelector('[data-bind-for-active="false"]');
        itemEl.setAttribute('data-bind-for-key', bindForKey);
        itemEl.setAttribute('data-bind-for-value', keyValue);
        itemEl.object3D.visible = true;
        itemEl.play();
        itemEl.setAttribute('data-bind-for-active', 'true');
        itemEl.emit('bindforupdateinplace', item, false);
      }
      this.renderedKeys.push(keyValue);
    } else if (activeKeys.indexOf(keyValue) !== -1) {
      // Update item.
      if (list.length && list[0].constructor === String) {
        // Update index for simple list.
        itemEl = el.querySelector('[data-bind-for-value="' + keyValue + '"]');
        itemEl.setAttribute('data-bind-for-key', i);
      } else {
        itemEl = el.querySelector('[data-bind-for-key="' + bindForKey + '"]');
      }
      itemEl.emit('bindforupdateinplace', item, false);
    }

    if (!list[i + 1]) {
      return;
    }

    if (this.data.delay) {
      setTimeout(function () {
        _this2.renderItemsInPlace(list, activeKeys, i + 1);
      }, this.data.delay);
    } else {
      this.renderItemsInPlace(list, activeKeys, i + 1);
    }
  },

  /**
   * Generate entity from template.
   */
  generateFromTemplate: function generateFromTemplate(item, i) {
    var data = this.data;

    this.el.appendChild(this.system.renderTemplate(this.template, item));
    var newEl = this.el.children[this.el.children.length - 1];;

    // From pool.true
    if (!item) {
      newEl.setAttribute('data-bind-for-key', '');
      newEl.setAttribute('data-bind-for-active', 'false');
      return newEl;
    }

    var bindForKey = this.getBindForKey(item, i);
    newEl.setAttribute('data-bind-for-key', bindForKey);
    if (!data.key) {
      newEl.setAttribute('data-bind-for-value', item);
    }

    // Keep track of pooled and non-pooled entities if updating in place.
    newEl.setAttribute('data-bind-for-active', 'true');
    return newEl;
  },

  /**
   * Get entities marked for removal.
   *
   * @param {array} activeKeys - List of key values that should be active.
   * @param {array} renderedKeys - List of key values currently rendered.
   */
  getElsToRemove: function () {
    var toRemove = [];

    return function (activeKeys, renderedKeys) {
      var data = this.data;
      var el = this.el;

      toRemove.length = 0;
      for (var i = 0; i < el.children.length; i++) {
        if (el.children[i].tagName === 'TEMPLATE') {
          continue;
        }
        var key = data.key ? el.children[i].getAttribute('data-bind-for-key') : el.children[i].getAttribute('data-bind-for-value');
        if (activeKeys.indexOf(key) === -1 && renderedKeys.indexOf(key) !== -1) {
          toRemove.push(el.children[i]);
          renderedKeys.splice(renderedKeys.indexOf(key), 1);
        }
      }
      return toRemove;
    };
  }(),

  /**
   * Get value to use as the data-bind-for-key.
   * For items, will be value specified by `bind-for.key`.
   * For simple list, will be the index.
   */
  getBindForKey: function getBindForKey(item, i) {
    return this.data.key ? item[this.data.key].toString() : i.toString();
  },

  /**
   * Handle state update.
   */
  onStateUpdate: function onStateUpdate() {
    if (this.data.updateInPlace) {
      this.onStateUpdateInPlace();
    } else {
      this.onStateUpdateNaive();
    }
  }
});

/**
 * Handle parsing and update in-place updates under bind-for.
 */
AFRAME.registerComponent('bind-item', {
  schema: {
    type: 'string'
  },

  multiple: true,

  init: function init() {
    this.itemData = null;
    this.keysToWatch = [];
    this.prevValues = {};

    // Listen to root item for events.
    var rootEl = this.rootEl = this.el.closest('[data-bind-for-key]');
    if (!rootEl) {
      throw new Error('bind-item component must be attached to entity under a bind-for item.');
    }
    rootEl.addEventListener('bindforupdateinplace', this.updateInPlace.bind(this));
    rootEl.addEventListener('bindfordeactivate', this.deactivate.bind(this));

    this.el.sceneEl.systems.state.subscribe(this);
  },

  update: function update() {
    this.parseSelector();
  },

  /**
   * Run with bind-for tells to via event `bindforupdateinplace`, passing item data.
   */
  updateInPlace: function updateInPlace(evt) {
    var propertyMap = this.propertyMap;

    if (this.rootEl.getAttribute('data-bind-for-active') === 'false') {
      return;
    }

    if (evt) {
      this.itemData = evt.detail;
    }

    for (var property in propertyMap) {
      // Get value from item.
      var value = this.select(this.itemData, propertyMap[property]);

      // Diff against previous value.
      if (value === this.prevValues[property]) {
        continue;
      }

      // Update.
      AFRAME.utils.entity.setComponentProperty(this.el, property, value);

      this.prevValues[property] = value;
    }
  },

  onStateUpdate: function onStateUpdate() {
    this.updateInPlace();
  },

  select: function select(itemData, selector) {
    return lib.select(this.el.sceneEl.systems.state.state, selector, itemData);
  },

  deactivate: function deactivate() {
    this.prevValues = {};
  },

  parseSelector: function parseSelector() {
    var propertyMap = this.propertyMap = {};
    this.keysToWatch.length = 0;

    var componentName = lib.split(this.id, '__')[0];

    // Different parsing for multi-prop components.
    if (componentName in AFRAME.components && !AFRAME.components[componentName].isSingleProp) {
      var propertySplitList = lib.split(this.data, ';');
      for (var i = 0; i < propertySplitList.length; i++) {
        var propertySplit = lib.split(propertySplitList[i], ':');
        propertyMap[this.id + '.' + propertySplit[0].trim()] = propertySplit[1].trim();
        lib.parseKeysToWatch(this.keysToWatch, propertySplit[1].trim(), true);
      }
      return;
    }

    propertyMap[this.id] = this.data;
    lib.parseKeysToWatch(this.keysToWatch, this.data, true);
  }
});

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Computes the difference between two objects with ability to ignore keys.
 *
 * @param {object} a - First object to compare (e.g., oldData).
 * @param {object} b - Second object to compare (e.g., newData).
 * @returns {object}
 *   Difference object where set of keys note which values were not equal, and values are
 *   `b`'s values.
 */
module.exports = function () {
  var keys = [];

  return function (a, b, targetObject, ignoreKeys) {
    var aVal;
    var bVal;
    var bKey;
    var diff;
    var key;
    var i;
    var isComparingObjects;

    diff = targetObject || {};

    // Collect A keys.
    keys.length = 0;
    for (key in a) {
      keys.push(key);
    }

    if (!b) {
      return diff;
    }

    // Collect B keys.
    for (bKey in b) {
      if (keys.indexOf(bKey) === -1) {
        keys.push(bKey);
      }
    }

    for (i = 0; i < keys.length; i++) {
      key = keys[i];

      // Ignore specified keys.
      if (ignoreKeys && ignoreKeys.indexOf(key) !== -1) {
        continue;
      }

      aVal = a[key];
      bVal = b[key];
      isComparingObjects = aVal && bVal && aVal.constructor === Object && bVal.constructor === Object;
      if (isComparingObjects && !AFRAME.utils.deepEqual(aVal, bVal) || !isComparingObjects && aVal !== bVal) {
        diff[key] = bVal;
      }
    }
    return diff;
  };
}();

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var fns = ['push', 'pop', 'shift', 'unshift', 'splice'];

function wrapArray(arr) {
  var i;
  if (arr.__wrapped) {
    return;
  }
  for (i = 0; i < fns.length; i++) {
    makeCallDirty(arr, fns[i]);
  }
  arr.__wrapped = true;
}
module.exports.wrapArray = wrapArray;

function makeCallDirty(arr, fn) {
  var originalFn = arr[fn];
  arr[fn] = function () {
    originalFn.apply(arr, arguments);
    arr.__dirty = true;
  };
}

/***/ })
/******/ ]);
});

/***/ }),
/* 15 */
/***/ (() => {

/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Slice9 component for A-Frame.
 */
AFRAME.registerComponent('slice9', {
  schema: {
    width: {default: 1, min: 0},
    height: {default: 1, min: 0},
    left: {default: 0, min: 0},
    right: {default: 0, min: 0},
    bottom: {default: 0, min: 0},
    top: {default: 0, min: 0},
    side: {default: 'front', oneOf: ['front', 'back', 'double']},
    padding: {default: 0.1, min: 0.01},
    color: {type: 'color', default: '#fff'},
    opacity: {default: 1.0, min: 0, max: 1},
    transparent: {default: true},
    debug: {default: false},
    src: {type: 'map'}
  },

  /**
   * Set if component needs multiple instancing.
   */
  multiple: false,

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    var data = this.data;
    var material = this.material = new THREE.MeshBasicMaterial({color: data.color, opacity: data.opacity, transparent: data.transparent, wireframe: data.debug});
    var geometry = this.geometry = new THREE.PlaneBufferGeometry(data.width, data.height, 3, 3);

    var textureLoader = new THREE.TextureLoader();
    this.plane = new THREE.Mesh(geometry, material);
    this.el.setObject3D('mesh', this.plane);
    this.textureSrc = null;
  },

  updateMap: function () {
    var src = this.data.src;

    if (src) {
      if (src === this.textureSrc) { return; }
      // Texture added or changed.
      this.textureSrc = src;
      this.el.sceneEl.systems.material.loadTexture(src, {src: src}, setMap.bind(this));
      return;
    }

    // Texture removed.
    if (!this.material.map) { return; }
    setMap(null);


    function setMap (texture) {
      this.material.map = texture;
      this.material.needsUpdate = true;
      this.regenerateMesh();
    }
  },

  regenerateMesh: function () {
    var data = this.data;
    var pos = this.geometry.attributes.position.array;
    var uvs = this.geometry.attributes.uv.array;
    var image = this.material.map.image;

    if (!image) {return;}

    /*
      0--1------------------------------2--3
      |  |                              |  |
      4--5------------------------------6--7
      |  |                              |  |
      |  |                              |  |
      |  |                              |  |
      8--9-----------------------------10--11
      |  |                              |  |
      12-13----------------------------14--15
    */
    function setPos(id, x, y) {
      pos[3 * id] = x;
      pos[3 * id + 1] = y;
    }

    function setUV(id, u, v) {
      uvs[2 * id] = u;
      uvs[2 * id + 1] = v;
    }

    // Update UVS
    var uv = {
      left: data.left / image.width,
      right: data.right / image.width,
      top: data.top / image.height,
      bottom: data.bottom / image.height
    };

    setUV(1,  uv.left,  1);
    setUV(2,  uv.right, 1);

    setUV(4,  0,        uv.bottom);
    setUV(5,  uv.left,  uv.bottom);
    setUV(6,  uv.right, uv.bottom);
    setUV(7,  1,        uv.bottom);

    setUV(8,  0,        uv.top);
    setUV(9,  uv.left,  uv.top);
    setUV(10, uv.right, uv.top);
    setUV(11, 1,        uv.top);

    setUV(13, uv.left,  0);
    setUV(14, uv.right, 0);

    // Update vertex positions
    var w2 = data.width / 2;
    var h2 = data.height / 2;
    var left = -w2 + data.padding;
    var right = w2 - data.padding;
    var top = h2 - data.padding;
    var bottom = -h2 + data.padding;

    setPos(0, -w2,    h2);
    setPos(1, left,   h2);
    setPos(2, right,  h2);
    setPos(3, w2,     h2);

    setPos(4, -w2,    top);
    setPos(5, left,   top);
    setPos(6, right,  top);
    setPos(7, w2,     top);

    setPos(8, -w2,    bottom);
    setPos(9, left,   bottom);
    setPos(10, right, bottom);
    setPos(11, w2,    bottom);

    setPos(13, left,  -h2);
    setPos(14, right, -h2);
    setPos(12, -w2,   -h2);
    setPos(15, w2,    -h2);

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.uv.needsUpdate = true;
  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
   update: function (oldData) {
     var data = this.data;

     this.material.color.setStyle(data.color);
     this.material.opacity = data.opacity;
     this.material.transparent = data.transparent;
     this.material.wireframe = data.debug;
     this.material.side = parseSide(data.side);

     var diff = AFRAME.utils.diff(data, oldData);
     if ('src' in diff) {
       this.updateMap();
     }
     else if ('width' in diff || 'height' in diff || 'padding' in diff || 'left' in diff || 'top' in diff || 'bottom' in diff || 'right' in diff) {
       this.regenerateMesh();
     }
   },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () { },

  /**
   * Called on each scene tick.
   */
  // tick: function (t) { },

  /**
   * Called when entity pauses.
   * Use to stop or remove any dynamic or background behavior such as events.
   */
  pause: function () { },

  /**
   * Called when entity resumes.
   * Use to continue or add any dynamic or background behavior such as events.
   */
  play: function () { }
});

function parseSide (side) {
  switch (side) {
    case 'back': {
      return THREE.BackSide;
    }
    case 'double': {
      return THREE.DoubleSide;
    }
    default: {
      // Including case `front`.
      return THREE.FrontSide;
    }
  }
}


/***/ }),
/* 16 */
/***/ (() => {

var TYPE_PAD = 'PAD';
var TYPE_STICK = 'STICK';

var ANGLE_RIGHT = 0;
var ANGLE_UP = 90;
var ANGLE_LEFT = 180;
var ANGLE_DOWN = 270;

var RIGHT = 'right';
var UP = 'up';
var LEFT = 'left';
var DOWN = 'down';

var ANGLES = [ANGLE_RIGHT, ANGLE_UP, ANGLE_LEFT, ANGLE_DOWN];
var DIRECTIONS = [RIGHT, UP, LEFT, DOWN];

var EVENTS = {NULL: {START: 'thumbstart', END: 'thumbend'}};
DIRECTIONS.forEach(direction => {
  EVENTS[direction] = {};
  EVENTS[direction].START = 'thumb' + direction + 'start';
  EVENTS[direction].END  = 'thumb' + direction + 'end';
});

// For debug.
var SIZE = 240;

/**
 * Normalize trackpad vs thumbstick controls.
 * `thumbstart`
 * `thumbend`
 * `thumbleftstart`
 * `thumbleftend`
 * `thumbrightstart`
 * `thumbrightend`
 * `thumbupstart`
 * `thumbupend`
 * `thumbdownstart`
 * `thumbdownend`
 */
AFRAME.registerComponent('thumb-controls', {
  dependencies: ['tracked-controls'],

  schema: {
    thresholdAngle: {default: 89.5},
    thresholdPad: {default: 0.05},
    thresholdStick: {default: 0.75}
  },

  init: function () {
    var el = this.el;
    this.onTrackpadDown = this.onTrackpadDown.bind(this)
    this.onTrackpadUp = this.onTrackpadUp.bind(this)

    this.directionStick = '';
    this.directionTrackpad = '';

    // Get thumb type (stick vs pad).
    this.type = TYPE_STICK;
    el.addEventListener('controllerconnected', evt => {
      if (evt.detail.name === 'oculus-touch-controls' ||
          evt.detail.name === 'windows-motion-controls') {
        this.type = TYPE_STICK;
        return;
      }
      this.type = TYPE_PAD;
    });

    this.axis = el.components['tracked-controls'].axis;
  },

  play: function () {
    var el = this.el;
    el.addEventListener('trackpaddown', this.onTrackpadDown);
    el.addEventListener('trackpadup', this.onTrackpadUp);
  },

  pause: function () {
    var el = this.el;
    el.removeEventListener('trackpaddown', this.onTrackpadDown);
    el.removeEventListener('trackpadup', this.onTrackpadUp);
  },

  // For pad.
  onTrackpadDown: function () {
    var direction;
    var el = this.el;
    var i;
    if (this.getDistance() < this.data.thresholdPad) { return; }
    direction = this.getDirection();
    if (!direction) { return; }
    this.directionTrackpad = direction;
    el.emit(EVENTS.NULL.START, null, false);
    el.emit(EVENTS[this.directionTrackpad].START, null, false);
  },

  // For pad.
  onTrackpadUp: function () {
    var el = this.el;
    if (!this.directionTrackpad) { return; }
    el.emit(EVENTS.NULL.END, null, false);
    el.emit(EVENTS[this.directionTrackpad].END, null, false);
    this.directionTrackpad = '';
  },

  // Axis.
  tick: function () {
    var direction;
    var el = this.el;

    if (this.type === TYPE_PAD) { return; }

    // Stick pulled. Store direction and emit start event.
    if (!this.directionStick && this.getDistance() > this.data.thresholdStick) {
      direction = this.getDirection();
      if (!direction) { return; }
      this.directionStick = direction;
      el.emit(EVENTS.NULL.START, null, false);
      el.emit(EVENTS[this.directionStick].START, null, false);
      return;
    }

    // Stick pulled back. Reset direciton and emit end event.
    if (this.directionStick && this.getDistance() < this.data.thresholdStick) {
      el.emit(EVENTS.NULL.END, null, false);
      el.emit(EVENTS[this.directionStick].END, null, false);
      this.directionStick = '';
    }
  },

  /**
   * Distance from center of thumb.
   */
  getDistance: function () {
    var axis = this.axis;
    return Math.sqrt(axis[1] * axis[1] + axis[0] * axis[0]);
  },

  /**
   * Translate angle into direction.
   */
  getDirection: function () {
    var angle;
    var bottomThreshold;
    var i;
    var threshold;
    var topThreshold;
    angle = this.getAngle();
    threshold = this.data.thresholdAngle / 2;
    for (i = 0; i < ANGLES.length; i++) {
      topThreshold = ANGLES[i] + threshold;
      if (topThreshold > 360) { topThreshold = topThreshold - 360; }

      bottomThreshold = ANGLES[i] - threshold;
      if (bottomThreshold < 0) {
        if ((angle >= 360 + bottomThreshold && angle <= 360) ||
            (angle >= 0 && angle <= topThreshold)) {
          return DIRECTIONS[i];
        }
      }

      if (angle >= bottomThreshold && angle <= topThreshold) {
        return DIRECTIONS[i];
      }
    }
  },

  /**
   * Get angle in degrees, with 0 starting on the right going to 360. Like unit circle.
   */
  getAngle: function () {
    var angle;
    var axis = this.axis;
    var flipY;
    flipY = this.type === TYPE_STICK ? -1 : 1;
    angle = Math.atan2(axis[1] * flipY, axis[0]);
    if (angle < 0) { angle = 2 * Math.PI + angle; }
    return THREE.Math.radToDeg(angle);
  }
});

AFRAME.registerComponent('thumb-controls-debug', {
  dependencies: ['thumb-controls', 'tracked-controls'],

  schema: {
    controllerType: {type: 'string'},
    hand: {type: 'string'},
    enabled: {default: false}
  },

  init: function () {
    var isActive;
    var axis;
    var axisMoveEventDetail;
    var canvas;
    var el = this.el;
    var data = this.data;

    if (!data.enabled && !AFRAME.utils.getUrlParameter('debug-thumb')) { return; }
    console.log('%c debug-thumb', 'background: #111; color: red');

    // Stub.
    el.components['tracked-controls'].handleAxes = () => {};

    axis = [0, 0, 0];
    axisMoveEventDetail = {axis: axis};
    el.components['tracked-controls'].axis = axis;
    el.components['thumb-controls'].axis = axis;

    canvas = this.createCanvas();

    canvas.addEventListener('click', evt => {
      if (this.data.controllerType === 'vive-controls') {
        if (isActive) {
          el.emit('trackpadup');
        } else {
          el.emit('trackpaddown');
        }
      } else {
        if (isActive) {
          axis[0] = 0;
          axis[1] = 0;
          el.emit('axismove', axisMoveEventDetail, false);
        }
      }
      isActive = !isActive;
    });

    canvas.addEventListener('mousemove', evt => {
      var rect;
      if (!isActive) { return; }
      rect = canvas.getBoundingClientRect();
      axis[0] = (evt.clientX - rect.left) / SIZE * 2 - 1;
      axis[1] = (evt.clientY - rect.top) / SIZE * 2 - 1;
      el.emit('axismove', axisMoveEventDetail, false);
    });

    canvas.addEventListener('mouseleave', evt => {
      if (!isActive) { return; }
      axis[0] = 0;
      axis[1] = 0;
      el.emit('axismove', axisMoveEventDetail, false);
    });
  },

  createCanvas: function () {
    var canvas;
    var ctx;
    canvas = document.createElement('canvas');
    canvas.classList.add('debugThumb');
    canvas.height = SIZE;
    canvas.width = SIZE;
    canvas.style.bottom = 0;
    canvas.style.borderRadius = '250px';
    canvas.style.opacity = 0.5;
    canvas.style.position = 'fixed';
    canvas.style.zIndex = 999999999;
    if (this.data.hand === 'left') {
      canvas.style.left = 0;
    } else {
      canvas.style.right = 0;
    }
    ctx = canvas.getContext('2d');
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, SIZE, SIZE);
    document.body.appendChild(canvas);
    return canvas;
  }
});


/***/ }),
/* 17 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./active-color.js": 18,
	"./audio-columns.js": 19,
	"./beams.js": 20,
	"./beat-generator.js": 21,
	"./beat-hit-sound.js": 24,
	"./beat.js": 25,
	"./blob-texture.js": 27,
	"./collider-check.js": 28,
	"./console-shortcuts.js": 29,
	"./copy-texture.js": 30,
	"./cursor-mesh.js": 31,
	"./debug-controller.js": 32,
	"./debug-cursor.js": 33,
	"./debug-song-time.js": 34,
	"./debug-state.js": 35,
	"./fake-glow.js": 36,
	"./floor-shader.js": 37,
	"./gpu-preloader.js": 38,
	"./iframe.js": 39,
	"./keyboard-raycastable.js": 40,
	"./materials.js": 41,
	"./mine-fragments-loader.js": 45,
	"./particleplayer.js": 46,
	"./pause.js": 47,
	"./pauser.js": 48,
	"./play-sound.js": 49,
	"./raycaster-target.js": 51,
	"./search.js": 52,
	"./song-controls.js": 54,
	"./song-progress-ring.js": 55,
	"./song.js": 56,
	"./stage-colors.js": 57,
	"./stage-lasers.js": 58,
	"./stage-shader.js": 59,
	"./stats-param.js": 60,
	"./sub-object.js": 61,
	"./super-keyboard.js": 62,
	"./toggle-pause-play.js": 63,
	"./twister.js": 64,
	"./user-gesture.js": 65,
	"./vertex-colors-buffer.js": 66,
	"./visible-raycastable.js": 67,
	"./wall-shader.js": 68,
	"./wall.js": 69,
	"./zip-loader.js": 70
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 17;

/***/ }),
/* 18 */
/***/ (() => {

/**
 * Active color.
 */
AFRAME.registerComponent('active-color', {
  dependencies: ['material'],

  schema: {
    active: { default: false },
    color: { default: '#ffffff' }
  },

  init: function () {
    this.defaultColor = this.el.getAttribute('material').color;
    this.materialObj = { color: this.data.color, opacity: 1 };
  },

  update: function () {
    var el = this.el;

    if (this.data.active) {
      el.setAttribute('material', this.materialObj);
      el.object3D.visible = true;
    } else {
      el.setAttribute('material', 'color', this.defaultColor);
      if (el.components.animation__mouseleave) {
        setTimeout(() => {
          el.emit('mouseleave', null, false);
        });
      }
    }
  }
});

AFRAME.registerComponent('active-text-color', {
  dependencies: ['text'],

  schema: {
    active: { default: false },
    color: { default: '#333' }
  },

  init: function () {
    this.defaultColor = this.el.getAttribute('text').color;
  },

  update: function () {
    var el = this.el;
    if (this.data.active) {
      el.setAttribute('text', 'color', this.data.color);
    } else {
      el.setAttribute('text', 'color', this.defaultColor);
    }
  }
});

/***/ }),
/* 19 */
/***/ (() => {


const NUM_VALUES_PER_BOX = 90;

/**
 * Column bars moving in sync to the audio via audio analyser.
 */
AFRAME.registerComponent('audio-columns', {
  schema: {
    analyser: { type: 'selector', default: '#audioAnalyser' },
    height: { default: 1.0 },
    mirror: { default: 3 },
    scale: { default: 4.0 },
    separation: { default: 0.3 },
    thickness: { default: 0.1 }
  },

  init: function () {
    var objData = document.getElementById('audiocolumnObj').data;
    var loader = new THREE.OBJLoader();
    var columnGeometry = loader.parse(objData).children[0].geometry;

    this.analyser = this.data.analyser.components.audioanalyser;

    // Number of levels is half the FFT size.
    this.frequencyBinCount = this.analyser.data.fftSize / 2;

    // Create boxes (one row on each side per level).
    const geometries = [];
    let zPosition = 0;
    for (let i = 0; i < this.frequencyBinCount; i++) {
      for (let side = 0; side < 2; side++) {
        const box = columnGeometry.clone();
        this.initBox(box, side === 0 ? 1 : -1, zPosition);
        geometries.push(box);
        // Move Z back.
        zPosition -= this.data.separation;
      }
    }

    this.geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
    const mesh = new THREE.Mesh(this.geometry, this.el.sceneEl.systems.materials.stageNormal);
    this.el.setObject3D('mesh', mesh);
  },

  tick: function () {
    // Step by 2 since we create one box of each side per level.
    for (let i = 0; i < this.frequencyBinCount * 2; i += 2) {
      let yScale = this.data.height / 2 + this.analyser.levels[Math.floor(i / 2)] / 256.0 * this.data.scale;
      if (isNaN(yScale)) {
        return;
      }
      this.setBoxHeight(this.frequencyBinCount * 2 - i - 1, yScale);
      this.setBoxHeight(this.frequencyBinCount * 2 - i - 2, yScale);
      this.geometry.attributes.position.needsUpdate = true;
    }
  },

  /**
   * Initialize box by changing vertex buffer, to set position and scale.
   */
  initBox: function (box, flip, zPosition) {
    const data = this.data;

    // Set position and scale of box via vertices.
    for (let v = 0; v < box.attributes.position.array.length; v += 3) {
      // Apply thickness to X and Z.
      // box.attributes.position.array[v] *= data.thickness;
      // box.attributes.position.array[v + 2] *= data.thickness;
      // Apply zPosition.
      box.attributes.position.array[v + 2] += zPosition;

      // Apply height to Y.
      box.attributes.position.array[v + 1] *= data.height / 2;

      // Change X vertex positions for mirroring.
      box.attributes.position.array[v] += flip * data.mirror;
    }
  },

  /**
   * Set Y of vertices.
   */
  setBoxHeight: function (boxNumber, height) {
    const boxIndex = boxNumber * NUM_VALUES_PER_BOX;
    for (let i = boxIndex; i < boxIndex + NUM_VALUES_PER_BOX; i += 3) {
      // Set Y.
      let yValue = this.geometry.attributes.position.array[i + 1];
      this.geometry.attributes.position.array[i + 1] = yValue >= 0 ? height : -1 * height;
    }
  }
});

/***/ }),
/* 20 */
/***/ (() => {

const ANIME = AFRAME.ANIME || AFRAME.anime;

AFRAME.registerComponent('beams', {
  schema: {
    isPlaying: { default: false },
    poolSize: { default: 3 }
  },

  init: function () {
    this.beams = [];
    this.currentRed = 0;
    this.currentBlue = 0;
    this.clearBeams = this.clearBeams.bind(this);
    this.el.sceneEl.addEventListener('cleargame', this.clearBeams);
  },

  update: function () {
    for (let i = 0; i < this.beams.length; i++) {
      if (this.beams[i].time) {
        this.beams[i].visible = this.data.isPlaying;
      }
    }
  },

  play: function () {
    // Beam pools.
    //const geometry = new THREE.PlaneBufferGeometry(0.4, 50).translate(0, 25, 0);

    var objData;
    var loader;
    var redGeometry, blueGeometry;

    var loader = new THREE.OBJLoader();
    objData = document.getElementById('redbeamObj').data;
    redGeometry = loader.parse(objData).children[0].geometry;

    objData = document.getElementById('bluebeamObj').data;
    blueGeometry = loader.parse(objData).children[0].geometry;

    this.redBeams = this.createBeamPool(redGeometry, this.el.sceneEl.systems.materials.stageAdditive);
    this.blueBeams = this.createBeamPool(blueGeometry, this.el.sceneEl.systems.materials.stageAdditive);
  },

  /**
   * Use tick for manual ANIME animations, else it will create RAF.
   */
  tick: function (t, dt) {
    if (!this.data.isPlaying) {
      return;
    }
    for (let i = 0; i < this.beams.length; i++) {
      let beam = this.beams[i];
      // Tie animation state to beam visibility.
      if (!beam.visible) {
        continue;
      }
      beam.time += dt;
      beam.animation.tick(beam.time);
    }
  },

  createBeamPool: function (geometry, material) {
    const beams = [];
    for (let i = 0; i < this.data.poolSize; i++) {
      let beam = new THREE.Mesh(geometry, material);
      beam.visible = false;
      beam.animation = ANIME({
        autoplay: false,
        targets: beam.scale,
        x: 0.00001,
        duration: 300,
        easing: 'easeInCubic',
        complete: () => {
          beam.visible = false;
        }
      });
      this.el.object3D.add(beam);
      beams.push(beam);
      this.beams.push(beam);
    }
    return beams;
  },

  newBeam: function (color, position) {
    var beam;
    if (color === 'red') {
      beam = this.redBeams[this.currentRed];
      this.currentRed = (this.currentRed + 1) % this.redBeams.length;
      // z offset to avoid z-fighting.
      beam.position.set(position.x, position.y, position.z + this.currentRed / 50.0);
    } else {
      beam = this.blueBeams[this.currentBlue];
      this.currentBlue = (this.currentBlue + 1) % this.blueBeams.length;
      beam.position.set(position.x, position.y, position.z + this.currentBlue / 50.0);
    }

    beam.visible = true;
    beam.scale.x = 1;
    beam.time = 0;
  },

  clearBeams: function () {
    for (let i = 0; i < this.beams.length; i++) {
      this.beams[i].visible = false;
      this.beams[i].time = 0;
      this.beams[i].scale.x = 1;
    }
  }
});

/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _constants_beat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(22);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(23);



let skipDebug = AFRAME.utils.getUrlParameter('skip') || 0;
skipDebug = parseInt(skipDebug, 10);

/**
 * Load beat data (all the beats and such).
 */
AFRAME.registerComponent('beat-generator', {
  dependencies: ['stage-colors'],

  schema: {
    beatAnticipationTime: { default: 1.1 },
    beatSpeed: { default: 8.0 },
    beatWarmupTime: { default: _constants_beat__WEBPACK_IMPORTED_MODULE_0__.BEAT_WARMUP_TIME / 1000 },
    beatWarmupSpeed: { default: _constants_beat__WEBPACK_IMPORTED_MODULE_0__.BEAT_WARMUP_SPEED },
    difficulty: { type: 'string' },
    isPlaying: { default: false }
  },

  orientationsHumanized: ['up', 'down', 'left', 'right', 'upleft', 'upright', 'downleft', 'downright'],

  horizontalPositions: [-0.75, -0.25, 0.25, 0.75],

  horizontalPositionsHumanized: {
    0: 'left',
    1: 'middleleft',
    2: 'middleright',
    3: 'right'
  },

  positionHumanized: {
    topLeft: { layer: 2, index: 0 },
    topCenterLeft: { layer: 2, index: 1 },
    topCenterRight: { layer: 2, index: 2 },
    topRight: { layer: 2, index: 3 },

    middleLeft: { layer: 1, index: 0 },
    middleCenterLeft: { layer: 1, index: 1 },
    middleCenterRight: { layer: 1, index: 2 },
    middleRight: { layer: 1, index: 3 },

    bottomLeft: { layer: 0, index: 0 },
    bottomCenterLeft: { layer: 0, index: 1 },
    bottomCenterRight: { layer: 0, index: 2 },
    bottomRight: { layer: 0, index: 3 }
  },

  verticalPositionsHumanized: {
    0: 'bottom',
    1: 'middle',
    2: 'top'
  },

  init: function () {
    this.audioAnalyserEl = document.getElementById('audioanalyser');
    this.beatData = null;
    this.beatDataProcessed = false;
    this.beatContainer = document.getElementById('beatContainer');
    this.beatsTime = undefined;
    this.beatsPreloadTime = 0;
    this.beatsPreloadTimeTotal = (this.data.beatAnticipationTime + this.data.beatWarmupTime) * 1000;
    this.bpm = undefined;
    this.stageColors = this.el.components['stage-colors'];
    // Beats arrive at sword stroke distance synced with the music.
    this.swordOffset = 1.5;
    this.twister = document.getElementById('twister');
    this.leftStageLasers = document.getElementById('leftStageLasers');
    this.rightStageLasers = document.getElementById('rightStageLasers');

    this.el.addEventListener('cleargame', this.clearBeats.bind(this));
    this.el.addEventListener('challengeloadend', evt => {
      this.allBeatData = evt.detail.beats;
      this.beatData = evt.detail.beats[this.data.difficulty || evt.detail.difficulty];
      this.info = evt.detail.info;
      this.processBeats();
    });
  },

  update: function (oldData) {
    if (oldData.difficulty && oldData.difficulty !== this.data.difficulty && this.allBeatData) {
      this.beatData = this.allBeatData[this.data.difficulty];
    }
  },

  /**
   * Load the beat data into the game.
   */
  processBeats: function () {
    // Reset variables used during playback.
    // Beats spawn ahead of the song and get to the user in sync with the music.
    this.beatsTime = 0;
    this.beatsPreloadTime = 0;
    this.beatData._events.sort(lessThan);
    this.beatData._obstacles.sort(lessThan);
    this.beatData._notes.sort(lessThan);
    this.bpm = this.info._beatsPerMinute;

    // Some events have negative time stamp to initialize the stage.
    const events = this.beatData._events;
    if (events.length && events[0]._time < 0) {
      for (let i = 0; events[i]._time < 0; i++) {
        this.generateEvent(events[i]);
      }
    }

    this.beatDataProcessed = true;
    console.log('[beat-generator] Finished processing beat data.');
  },

  /**
   * Generate beats and stuff according to timestamp.
   */
  tick: function (time, delta) {
    if (!this.data.isPlaying || !this.beatData) {
      return;
    }

    const song = this.el.components.song;
    const prevBeatsTime = this.beatsTime + skipDebug;
    const prevEventsTime = this.eventsTime + skipDebug;

    if (this.beatsPreloadTime === undefined) {
      // Get current song time.
      if (!song.isPlaying) {
        return;
      }
      this.beatsTime = (song.getCurrentTime() + this.data.beatAnticipationTime + this.data.beatWarmupTime) * 1000;
      this.eventsTime = song.getCurrentTime() * 1000;
    } else {
      // Song is not playing and is preloading beats, use maintained beat time.
      this.beatsTime = this.beatsPreloadTime;
      this.eventsTime = song.getCurrentTime() * 1000;
    }

    // Skip a frame to update prevBeats data.
    if (this.isSeeking) {
      this.isSeeking = false;
      return;
    }

    // Load in stuff scheduled between the last timestamp and current timestamp.
    // Beats.
    const beatsTime = this.beatsTime + skipDebug;
    const msPerBeat = 1000 * 60 / this.bpm;
    const notes = this.beatData._notes;
    for (let i = 0; i < notes.length; ++i) {
      let noteTime = notes[i]._time * msPerBeat;
      if (noteTime > prevBeatsTime && noteTime <= beatsTime) {
        notes[i].time = noteTime;
        this.generateBeat(notes[i]);
      }
    }

    // Walls.
    const obstacles = this.beatData._obstacles;
    for (let i = 0; i < obstacles.length; ++i) {
      let noteTime = obstacles[i]._time * msPerBeat;
      if (noteTime > prevBeatsTime && noteTime <= beatsTime) {
        this.generateWall(obstacles[i]);
      }
    }

    // Stage events.
    const eventsTime = this.eventsTime + skipDebug;
    const events = this.beatData._events;
    for (let i = 0; i < events.length; ++i) {
      let noteTime = events[i]._time * msPerBeat;
      if (noteTime > prevEventsTime && noteTime <= eventsTime) {
        this.generateEvent(events[i]);
      }
    }

    if (this.beatsPreloadTime === undefined) {
      return;
    }

    if (this.beatsPreloadTime >= this.beatsPreloadTimeTotal) {
      // Finished preload.
      this.el.sceneEl.emit('beatloaderpreloadfinish', null, false);
      this.beatsPreloadTime = undefined;
    } else {
      // Continue preload.
      this.beatsPreloadTime += delta;
    }
  },

  seek: function (time) {
    this.clearBeats(true);
    this.beatsTime = (time + this.data.beatAnticipationTime + this.data.beatWarmupTime) * 1000;
    this.isSeeking = true;
  },

  generateBeat: function () {
    const beatObj = {};

    return function (noteInfo) {
      const data = this.data;

      // if (Math.random() < 0.8) { noteInfo._type = 3; } // To debug mines.
      let color;
      let type = noteInfo._cutDirection === 8 ? 'dot' : 'arrow';
      if (noteInfo._type === 0) {
        color = 'red';
      } else if (noteInfo._type === 1) {
        color = 'blue';
      } else {
        type = 'mine';
        color = undefined;
      }

      const beatEl = this.requestBeat(type, color);
      if (!beatEl) {
        return;
      }

      // Apply sword offset. Blocks arrive on beat in front of the user.
      beatObj.anticipationPosition = -data.beatAnticipationTime * data.beatSpeed - this.swordOffset;
      beatObj.color = color;
      beatObj.cutDirection = this.orientationsHumanized[noteInfo._cutDirection];
      beatObj.horizontalPosition = this.horizontalPositionsHumanized[noteInfo._lineIndex];
      beatObj.speed = this.data.beatSpeed;
      beatObj.type = type;
      beatObj.verticalPosition = this.verticalPositionsHumanized[noteInfo._lineLayer], beatObj.warmupPosition = -data.beatWarmupTime * data.beatWarmupSpeed;
      beatEl.setAttribute('beat', beatObj);

      beatEl.play();
      beatEl.components.beat.onGenerate();
    };
  }(),

  generateWall: function () {
    const wallObj = {};
    const WALL_THICKNESS = 0.5;

    return function (wallInfo) {
      const el = this.el.sceneEl.components.pool__wall.requestEntity();

      if (!el) {
        return;
      }

      const data = this.data;
      const speed = this.data.beatSpeed;

      const durationSeconds = 60 * (wallInfo._duration / this.bpm);
      wallObj.anticipationPosition = -data.beatAnticipationTime * data.beatSpeed - this.swordOffset;
      wallObj.durationSeconds = durationSeconds;
      wallObj.horizontalPosition = this.horizontalPositionsHumanized[wallInfo._lineIndex];
      wallObj.isCeiling = wallInfo._type === 1;
      wallObj.speed = speed;
      wallObj.warmupPosition = -data.beatWarmupTime * data.beatWarmupSpeed;
      // wallInfo._width can be like 1 or 2. Map that to 0.5 thickness.
      wallObj.width = wallInfo._width * WALL_THICKNESS;
      el.setAttribute('wall', wallObj);
      el.play();
    };
  }(),

  generateEvent: function (event) {
    switch (event._type) {
      case 0:
        this.stageColors.setColor('bg', event._value);
        break;
      case 1:
        this.stageColors.setColor('tunnel', event._value);
        break;
      case 2:
        this.stageColors.setColor('leftlaser', event._value);
        break;
      case 3:
        this.stageColors.setColor('rightlaser', event._value);
        break;
      case 4:
        this.stageColors.setColor('floor', event._value);
        break;
      case 8:
        this.twister.components.twister.pulse(event._value);
        break;
      case 9:
        // zoom was a bit disturbing
        this.twister.components.twister.pulse(event._value);
        break;
      case 12:
        this.leftStageLasers.components['stage-lasers'].pulse(event._value);
        break;
      case 13:
        this.rightStageLasers.components['stage-lasers'].pulse(event._value);
        break;
    }
  },

  requestBeat: function (type, color) {
    var beatPoolName = 'pool__beat-' + type;
    var pool;
    if (color) {
      beatPoolName += '-' + color;
    }
    pool = this.el.sceneEl.components[beatPoolName];
    if (!pool) {
      console.warn('Pool ' + beatPoolName + ' unavailable');
      return;
    }
    return pool.requestEntity();
  },

  /**
   * Restart by returning all beats to pool.
   */
  clearBeats: function (isSeeking) {
    if (!isSeeking) {
      this.beatsPreloadTime = 0;
      this.beatsTime = 0;
      this.eventsTime = 0;
    }
    for (let i = 0; i < this.beatContainer.children.length; i++) {
      let child = this.beatContainer.children[i];
      if (child.components.beat) {
        child.components.beat.returnToPool();
      }
      if (child.components.wall) {
        child.components.wall.returnToPool();
      }
    }
  }
});

function lessThan(a, b) {
  return a._time - b._time;
}

/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BEAT_WARMUP_OFFSET": () => (/* binding */ BEAT_WARMUP_OFFSET),
/* harmony export */   "BEAT_WARMUP_SPEED": () => (/* binding */ BEAT_WARMUP_SPEED),
/* harmony export */   "BEAT_WARMUP_TIME": () => (/* binding */ BEAT_WARMUP_TIME)
/* harmony export */ });
const BEAT_WARMUP_OFFSET = 25;
const BEAT_WARMUP_SPEED = 155;
const BEAT_WARMUP_TIME = BEAT_WARMUP_OFFSET / BEAT_WARMUP_SPEED * 1000;

/***/ }),
/* 23 */
/***/ ((module) => {

const BASE_URL = 'https://saber.supermedium.com';

function getS3FileUrl(id, name) {
  return `${BASE_URL}/${id}-${name}?v=1`;
}
module.exports.getS3FileUrl = getS3FileUrl;

/***/ }),
/* 24 */
/***/ (() => {

var sourceCreatedCallback;

const LAYER_BOTTOM = 'bottom';
const LAYER_MIDDLE = 'middle';
const LAYER_TOP = 'top';
const VOLUME = 0.2;

// Allows for modifying detune. PR has been sent to three.js.
THREE.Audio.prototype.play = function () {
  if (this.isPlaying === true) {
    console.warn('THREE.Audio: Audio is already playing.');
    return;
  }

  if (this.hasPlaybackControl === false) {
    console.warn('THREE.Audio: this Audio has no playback control.');
    return;
  }

  var source = this.context.createBufferSource();
  source.buffer = this.buffer;
  source.detune.value = this.detune;
  source.loop = this.loop;
  source.onended = this.onEnded.bind(this);
  source.playbackRate.setValueAtTime(this.playbackRate, this.startTime);
  this.startTime = this.context.currentTime;
  if (sourceCreatedCallback) {
    sourceCreatedCallback(source);
  }
  source.start(this.startTime, this.offset);

  this.isPlaying = true;

  this.source = source;
  return this.connect();
};

/**
 * Beat hit sound using positional audio and audio buffer source.
 */
AFRAME.registerComponent('beat-hit-sound', {
  directionsToSounds: {
    up: '',
    down: '',
    upleft: 'left',
    upright: 'right',
    downleft: 'left',
    downright: 'right',
    left: 'left',
    right: 'right'
  },

  init: function () {
    this.currentBeatEl = null;
    this.currentCutDirection = '';
    this.processSound = this.processSound.bind(this);
    sourceCreatedCallback = this.sourceCreatedCallback.bind(this);

    // Sound pools.
    for (let i = 1; i <= 10; i++) {
      this.el.setAttribute(`sound__beathit${i}`, {
        poolSize: 4,
        src: `#hitSound${i}`,
        volume: VOLUME
      });
      this.el.setAttribute(`sound__beathit${i}left`, {
        poolSize: 4,
        src: `#hitSound${i}left`,
        volume: VOLUME
      });
      this.el.setAttribute(`sound__beathit${i}right`, {
        poolSize: 4,
        src: `#hitSound${i}right`,
        volume: VOLUME
      });
    }
  },

  play: function () {
    // Kick three.js loader...Don't know why sometimes doesn't load.
    for (let i = 1; i <= 10; i++) {
      setTimeout(() => {
        if (!this.el.components[`sound__beathit${i}`].loaded) {
          this.el.setAttribute(`sound__beathit${i}`, 'src', '');
          this.el.setAttribute(`sound__beathit${i}`, 'src', `#hitSound${i}`);
        }
      }, i * 10);
      setTimeout(() => {
        if (!this.el.components[`sound__beathit${i}left`].loaded) {
          this.el.setAttribute(`sound__beathit${i}left`, 'src', '');
          this.el.setAttribute(`sound__beathit${i}left`, 'src', `#hitSound${i}left`);
        }
      }, i * 20);
      setTimeout(() => {
        if (!this.el.components[`sound__beathit${i}right`].loaded) {
          this.el.setAttribute(`sound__beathit${i}right`, 'src', '');
          this.el.setAttribute(`sound__beathit${i}right`, 'src', `#hitSound${i}right`);
        }
      }, i * 30);
    }
  },

  playSound: function (beatEl, cutDirection) {
    const rand = 1 + Math.floor(Math.random() * 10);
    const dir = this.directionsToSounds[cutDirection || 'up'];
    const soundPool = this.el.components[`sound__beathit${rand}${dir}`];
    this.currentBeatEl = beatEl;
    soundPool.playSound(this.processSound);
  },

  /**
   * Set audio stuff before playing.
   */
  processSound: function (audio) {
    audio.detune = 0;
    this.currentBeatEl.object3D.getWorldPosition(audio.position);
  },

  /**
   * Function callback to process source buffer once created.
   * Set detune for pitch and inflections.
   */
  sourceCreatedCallback: function (source) {
    // Pitch based on layer.
    const layer = this.getLayer(this.currentBeatEl.object3D.position.y);
    if (layer === LAYER_BOTTOM) {
      source.detune.setValueAtTime(-400, 0);
    } else if (layer === LAYER_TOP) {
      source.detune.setValueAtTime(200, 0);
    }

    // Inflection on strike down or up.
    if (this.currentCutDirection === 'down') {
      source.detune.linearRampToValueAtTime(-400, 1);
    }
    if (this.currentCutDirection === 'up') {
      source.detune.linearRampToValueAtTime(400, 1);
    }
  },

  /**
   * Get whether beat is on bottom, middle, or top layer.
   */
  getLayer: function (y) {
    if (y === 1) {
      return LAYER_BOTTOM;
    }
    if (y === 1.70) {
      return LAYER_TOP;
    }
    return LAYER_MIDDLE;
  },

  setVolume: function (volume) {
    volume = volume * 0.4;
    for (let i = 1; i <= 10; i++) {
      for (let j = 0; j < 4; j++) {
        this.el.components[`sound__beathit${i}`].pool.children[j].setVolume(volume);
        this.el.components[`sound__beathit${i}left`].pool.children[j].setVolume(volume);
        this.el.components[`sound__beathit${i}right`].pool.children[j].setVolume(volume);
      }
    }
  }
});

/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _constants_beat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(22);

const COLORS = __webpack_require__(26);

const auxObj3D = new THREE.Object3D();
const collisionZThreshold = -1.65;
const BEAT_WARMUP_ROTATION_CHANGE = Math.PI / 5;
const BEAT_WARMUP_ROTATION_OFFSET = 0.4;
const BEAT_WARMUP_ROTATION_TIME = 750;
const DESTROYED_SPEED = 1.0;
const SWORD_OFFSET = 1.5;
const ONCE = { once: true };

const SCORE_POOL = {
  OK: 'pool__beatscoreok',
  GOOD: 'pool__beatscoregood',
  GREAT: 'pool__beatscoregreat',
  SUPER: 'pool__beatscoresuper'
};

/**
 * Bears, beats, Battlestar Galactica.
 * Create beat from pool, collision detection, movement, scoring.
 */
AFRAME.registerComponent('beat', {
  schema: {
    anticipationPosition: { default: 0 },
    color: { default: 'red', oneOf: ['red', 'blue'] },
    cutDirection: { default: 'down' },
    debug: { default: true },
    horizontalPosition: { default: 'middleleft', oneOf: ['left', 'middleleft', 'middleright', 'right'] },
    size: { default: 0.40 },
    speed: { default: 8.0 },
    type: { default: 'arrow', oneOf: ['arrow', 'dot', 'mine'] },
    verticalPosition: { default: 'middle', oneOf: ['middle', 'top'] },
    warmupPosition: { default: 0 }
  },

  materialColor: {
    blue: COLORS.BEAT_BLUE,
    red: COLORS.BEAT_RED
  },

  cutColor: {
    blue: '#fff',
    red: '#fff'
  },

  models: {
    arrow: 'beatObjTemplate',
    dot: 'beatObjTemplate',
    mine: 'mineObjTemplate'
  },

  signModels: {
    arrowred: 'arrowRedObjTemplate',
    arrowblue: 'arrowBlueObjTemplate',
    dotred: 'dotRedObjTemplate',
    dotblue: 'dotBlueObjTemplate'
  },

  orientations: [180, 0, 270, 90, 225, 135, 315, 45, 0],

  rotations: {
    up: 180,
    down: 0,
    left: 270,
    right: 90,
    upleft: 225,
    upright: 135,
    downleft: 315,
    downright: 45
  },

  horizontalPositions: {
    left: -0.75,
    middleleft: -0.25,
    middleright: 0.25,
    right: 0.75
  },

  verticalPositions: {
    middle: 1.20,
    top: 1.70
  },

  init: function () {
    this.beams = document.getElementById('beams').components.beams;
    this.beatBoundingBox = new THREE.Box3();
    this.currentRotationWarmupTime = 0;
    this.cutDirection = new THREE.Vector3();
    this.destroyed = false;
    this.gravityVelocity = 0;
    this.hitEventDetail = {};
    this.hitBoundingBox = new THREE.Box3();
    this.poolName = undefined;
    this.returnToPoolTimeStart = undefined;
    this.rotationAxis = new THREE.Vector3();
    this.scoreEl = null;
    this.scoreElTime = undefined;
    this.startPositionZ = undefined;

    this.particles = document.getElementById('saberParticles');
    this.mineParticles = document.getElementById('mineParticles');
    this.explodeEventDetail = { position: new THREE.Vector3(), rotation: new THREE.Euler() };
    this.glow = null;

    this.destroyBeat = this.destroyBeat;

    this.initBlock();
    if (this.data.type === 'mine') {
      this.initMineFragments();
    }
  },

  update: function () {
    this.updateBlock();

    if (this.data.type === 'mine') {
      this.poolName = `pool__beat-mine`;
    } else {
      this.poolName = `pool__beat-${this.data.type}-${this.data.color}`;
    }
  },

  pause: function () {
    this.el.object3D.visible = false;
  },

  play: function () {
    this.glow = this.el.sceneEl.components['pool__beat-glow'].requestEntity();
    this.blockEl.object3D.visible = true;

    this.el.setAttribute('beatObject', 'beat');

    this.destroyed = false;
    this.el.object3D.visible = true;
  },

  tock: function (time, timeDelta) {
    const el = this.el;
    const data = this.data;
    const position = el.object3D.position;
    const rotation = el.object3D.rotation;

    if (this.returnToPoolTimeStart && time - this.returnToPoolTimeStart > 800) {
      this.returnToPool();
      this.returnToPoolTimeStart = undefined;
      return;
    }

    // Move.
    if (position.z < data.anticipationPosition) {
      let newPositionZ = position.z + _constants_beat__WEBPACK_IMPORTED_MODULE_0__.BEAT_WARMUP_SPEED * (timeDelta / 1000);
      // Warm up / warp in.
      if (newPositionZ < data.anticipationPosition) {
        position.z = newPositionZ;
      } else {
        position.z = data.anticipationPosition;
        this.beams.newBeam(this.data.color, position);
      }
    } else {
      const oldPosition = position.z;

      // Standard moving.
      position.z += this.data.speed * (timeDelta / 1000);
      rotation.z = this.startRotationZ;

      if (oldPosition < -1 * SWORD_OFFSET && position.z >= -1 * SWORD_OFFSET) {
        this.returnToPoolTimeStart = time;
        if (this.data.type === 'mine') {
          this.destroyMine();
        }
      }
    }

    if (position.z > data.anticipationPosition - BEAT_WARMUP_ROTATION_OFFSET && this.currentRotationWarmupTime < BEAT_WARMUP_ROTATION_TIME) {
      const progress = AFRAME.ANIME.easings.easeOutBack(this.currentRotationWarmupTime / BEAT_WARMUP_ROTATION_TIME);
      el.object3D.rotation.z = this.rotationZStart + progress * this.rotationZChange;
      this.currentRotationWarmupTime += timeDelta;
    }
  },

  /**
   * Called when summoned by beat-generator.
   */
  onGenerate: function () {
    const el = this.el;
    const data = this.data;

    // Set position.
    el.object3D.position.set(this.horizontalPositions[data.horizontalPosition], this.verticalPositions[data.verticalPosition], data.anticipationPosition + data.warmupPosition);
    el.object3D.rotation.z = THREE.Math.degToRad(this.rotations[data.cutDirection]);

    // Set up rotation warmup.
    this.startRotationZ = this.el.object3D.rotation.z;
    this.currentRotationWarmupTime = 0;
    this.rotationZChange = BEAT_WARMUP_ROTATION_CHANGE;
    if (Math.random > 0.5) {
      this.rotationZChange *= -1;
    }
    this.el.object3D.rotation.z -= this.rotationZChange;
    this.rotationZStart = this.el.object3D.rotation.z;
    // Reset mine.
    if (this.data.type == 'mine') {
      this.resetMineFragments();
    }

    this.returnToPoolTimeStart = undefined;
  },

  initBlock: function () {
    var el = this.el;
    var blockEl = this.blockEl = document.createElement('a-entity');
    var signEl = this.signEl = document.createElement('a-entity');

    blockEl.setAttribute('mixin', 'beatBlock');
    blockEl.setAttribute('mixin', 'beatSign');

    // Small offset to prevent z-fighting when the blocks are far away
    signEl.object3D.position.z += 0.02;
    blockEl.appendChild(signEl);
    el.appendChild(blockEl);
  },

  updateBlock: function () {
    const blockEl = this.blockEl;
    const signEl = this.signEl;
    if (!blockEl) {
      return;
    }

    blockEl.setAttribute('material', {
      metalness: 0.7,
      roughness: 0.1,
      sphericalEnvMap: '#envmapTexture',
      emissive: this.materialColor[this.data.color],
      emissiveIntensity: 0.05,
      color: this.materialColor[this.data.color]
    });
    this.setObjModelFromTemplate(blockEl, this.models[this.data.type]);

    // Model is 0.29 size. We make it 1.0 so we can easily scale based on 1m size.
    blockEl.object3D.scale.set(1, 1, 1);
    blockEl.object3D.scale.multiplyScalar(3.45).multiplyScalar(this.data.size);

    if (this.data.type === 'mine') {
      const model = blockEl.getObject3D('mesh');
      if (model) {
        model.material = this.el.sceneEl.systems.materials['mineMaterial' + this.data.color];
      } else {
        blockEl.addEventListener('model-loaded', () => {
          model.material = this.el.sceneEl.systems.materials['mineMaterial' + this.data.color];
        }, ONCE);
      }
    } else {
      signEl.setAttribute('materials', { name: 'stageAdditive' });
      this.setObjModelFromTemplate(signEl, this.signModels[this.data.type + this.data.color]);
    }
  },

  initMineFragments: function () {
    var fragment;
    var fragments = this.el.sceneEl.systems['mine-fragments-loader'].fragments.children;
    var material = this.el.sceneEl.systems.materials['mineMaterial' + this.data.color];

    this.randVec = new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

    this.mineFragments = [];
    this.mineBroken = document.createElement('a-entity');
    this.el.appendChild(this.mineBroken);

    for (var i = 0; i < fragments.length; i++) {
      fragment = new THREE.Mesh(fragments[i].geometry, material);
      fragment.speed = new THREE.Vector3();
      fragment.speed.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      this.mineFragments.push(fragment);
      this.mineBroken.object3D.add(fragment);
    }
  },

  resetMineFragments: function () {
    if (this.data.type !== 'mine') {
      return;
    }
    for (let i = 0; i < this.mineFragments.length; i++) {
      let fragment = this.mineFragments[i];
      fragment.visible = false;
      fragment.position.set(0, 0, 0);
      fragment.scale.set(1, 1, 1);
      fragment.speed.set(Math.random() * 5 - 2.5, Math.random() * 5 - 2.5, Math.random() * 5 - 2.5);
    }
  },

  destroyMine: function () {
    for (let i = 0; i < this.mineFragments.length; i++) {
      this.mineFragments[i].visible = true;
    }

    this.blockEl.object3D.visible = false;
    this.destroyed = true;
    this.gravityVelocity = 0.1;
    this.returnToPoolTimer = 800;

    this.explodeEventDetail.position.copy(this.el.object3D.position);
    this.explodeEventDetail.rotation.copy(this.randVec);
    this.mineParticles.emit('explode', this.explodeEventDetail, false);
  },

  destroyBeat: function () {
    this.el.object3D.visible = false;

    this.el.parentNode.components['beat-hit-sound'].playSound(this.el, this.data.cutDirection);

    // Play sound and particles for viewer.
    this.explodeEventDetail.position.copy(this.el.object3D.position);
    this.explodeEventDetail.rotation.copy(this.el.object3D.rotation);
    this.particles.emit('explode', this.explodeEventDetail, false);

    if (this.glow) {
      this.glow.play();
      this.glow.object3D.visible = true;
      this.glow.object3D.position.copy(this.el.object3D.position);
      this.glow.object3D.rotation.z = Math.random() * 2.0;
      this.glow.emit('explode', null, false);

      if (this.data.type !== 'mine') {
        setTimeout(() => {
          this.el.sceneEl.components['pool__beat-glow'].returnEntity(this.glow);
        }, 350);
      }
    }
  },

  returnToPool: function () {
    this.el.sceneEl.components[this.poolName].returnEntity(this.el);
  },

  /**
   * Load OBJ from already parsed and loaded OBJ template.
   */
  setObjModelFromTemplate: function () {
    const geometries = {};

    return function (el, templateId) {
      if (!geometries[templateId]) {
        const templateEl = document.getElementById(templateId);
        if (templateEl.getObject3D('mesh')) {
          geometries[templateId] = templateEl.getObject3D('mesh').children[0].geometry;
        } else {
          templateEl.addEventListener('model-loaded', () => {
            geometries[templateId] = templateEl.getObject3D('mesh').children[0].geometry;
            this.setObjModelFromTemplate(el, templateId);
          });
          return;
        }
      }

      if (!el.getObject3D('mesh')) {
        el.setObject3D('mesh', new THREE.Mesh());
      }
      el.getObject3D('mesh').geometry = geometries[templateId];
    };
  }()
});

/**
 * Get velocity given current velocity using gravity acceleration.
 */
function getGravityVelocity(velocity, timeDelta) {
  const GRAVITY = -9.8;
  return velocity + GRAVITY * (timeDelta / 1000);
}

/***/ }),
/* 26 */
/***/ ((module) => {

module.exports = {
  OFF: '#111',
  RED: '#ff3a7b',
  BLUE: '#08bfa2',

  UI_ACCENT: '#fff',
  UI_ACCENT2: '#f01978',

  SKY_OFF: '#297547',
  SKY_BLUE: '#840d42',
  SKY_RED: '#154136',

  BG_OFF: '#081a0f',
  BG_BLUE: '#379f5e',
  BG_BRIGHTBLUE: '#4fd983',
  BG_RED: '#ff1f81',
  BG_BRIGHTRED: '#ff6bb0',

  NEON_OFF: '#000',
  NEON_BLUE: '#008a70',
  NEON_BRIGHTBLUE: '#87c2ff',
  NEON_RED: '#f01978',
  NEON_BRIGHTRED: '#ff70b5',

  TEXT_OFF: '#000',
  TEXT_NORMAL: '#444',
  TEXT_BOLD: '#888',

  BEAT_RED: '#660338',
  BEAT_BLUE: '#036657',

  MINE_RED: '#1c060e',
  MINE_RED_EMISSION: '#2a0d1b',
  MINE_BLUE: '#011114',
  MINE_BLUE_EMISSION: '#072020'
};

/***/ }),
/* 27 */
/***/ (() => {

AFRAME.registerComponent('blob-texture', {
  dependencies: ['material'],

  schema: {
    src: { type: 'string' }
  },

  update: function () {
    var el = this.el;
    var data = this.data;

    if (!data.src) {
      return;
    }

    if (!data.src.startsWith('blob')) {
      el.setAttribute('material', 'src', data.src);
      return;
    } else {
      const image = new Image();
      image.onload = function () {
        const map = new THREE.Texture();
        map.image = image;
        el.setAttribute('material', 'src', '');
        el.getObject3D('mesh').material.map = map;
        el.getObject3D('mesh').material.needsUpdate = true;
        map.needsUpdate = true;
      };
      image.src = data.src;
    }
  }
});

/***/ }),
/* 28 */
/***/ (() => {

AFRAME.registerComponent('collider-check', {
  dependencies: ['raycaster'],

  init: function () {
    console.log('coming here??');
    this.el.addEventListener('raycaster-intersected', function () {
      console.log('Player hit something!');
      this.raycaster = evt.detail.el;
      console.log(raycaster);
    });
  }
});

/***/ }),
/* 29 */
/***/ (() => {

AFRAME.registerComponent('console-shortcuts', {
  play: function () {
    window.$ = val => document.querySelector(val);
    window.$$ = val => document.querySelectorAll(val);
    window.$$$ = val => document.querySelector(`[${val}]`).getAttribute(val);
    window.$$$$ = val => document.querySelector(`[${val}]`).components[val];
    window.scene = this.el;
    window.state = this.el.systems.state.state;
  }
});

/***/ }),
/* 30 */
/***/ (() => {

AFRAME.registerComponent('copy-texture', {
  dependencies: ['geometry', 'material'],

  schema: {
    from: { type: 'selector' }
  },

  init: function () {
    const data = this.data;

    data.from.addEventListener('materialtextureloaded', () => {
      this.copyTexture();
    });
    this.copyTexture();
  },

  copyTexture: function () {
    const el = this.el;
    const target = this.data.from;
    const material = el.getObject3D('mesh').material;

    if (!target.getObject3D('mesh')) {
      return;
    }

    material.map = target.getObject3D('mesh').material.map;

    if (!material.map) {
      return;
    }

    material.map.needsUpdate = true;
    material.needsUpdate = true;
  }
});

/***/ }),
/* 31 */
/***/ (() => {

/**
 * Cursor mesh to show at intersection point with respective hand.
 */
AFRAME.registerComponent('cursor-mesh', {
  schema: {
    active: { default: true },
    cursorEl: { type: 'selector' }
  },

  init: function () {
    this.scenePivotEl = document.getElementById('scenePivot');
  },

  update: function () {
    this.el.object3D.visible = this.data.active;
  },

  tick: function () {
    var cursor;
    var cursorEl = this.data.cursorEl;
    var el = this.el;
    var intersection;
    var intersectedEl;
    var scenePivotEl = this.scenePivotEl;

    if (!this.data.active) {
      return;
    }

    cursor = cursorEl.components.cursor;
    if (!cursor) {
      return;
    }

    // Look for valid intersection target.
    intersectedEl = cursorEl.components.cursor.intersectedEl;
    if (intersectedEl) {
      el.object3D.visible = true;
    } else {
      el.object3D.visible = false;
      return;
    }

    // Update cursor mesh.
    intersection = cursorEl.components.raycaster.getIntersection(intersectedEl);
    if (!intersection) {
      return;
    }

    el.object3D.position.copy(intersection.point);

    if (scenePivotEl) {
      el.object3D.rotation.copy(scenePivotEl.object3D.rotation);
    }
  }
});

/***/ }),
/* 32 */
/***/ (() => {

/**
 * Keyboard bindings to control controller.
 * Position controller in front of camera.
 */
AFRAME.registerComponent('debug-controller', {
  init: function () {
    var primaryHand;
    var secondaryHand;

    if (!AFRAME.utils.getUrlParameter('debug')) {
      return;
    }

    console.log('%c debug-controller enabled ', 'background: #111; color: red');

    this.isCloning = false;
    this.isDeleting = false;
    this.isTriggerDown = false;

    window.addEventListener('mousemove', this.onMouseMove.bind(this));

    primaryHand = document.getElementById('rightHand');
    secondaryHand = document.getElementById('leftHand');

    window.addEventListener('click', evt => {
      if (!evt.isTrusted) {
        return;
      }
      primaryHand.emit('triggerdown');
      primaryHand.emit('triggerup');
    });

    if (AFRAME.utils.getUrlParameter('debug') === 'oculus') {
      primaryHand.emit('controllerconnected', { name: 'oculus-touch-controls' });
      secondaryHand.emit('controllerconnected', { name: 'oculus-touch-controls' });
      primaryHand.setAttribute('controller', 'controllerType', 'oculus-touch-controls');
      secondaryHand.setAttribute('controller', 'controllerType', 'oculus-touch-controls');
    } else {
      primaryHand.emit('controllerconnected', { name: 'vive-controls' });
      secondaryHand.emit('controllerconnected', { name: 'vive-controls' });
      primaryHand.setAttribute('controller', 'controllerType', 'vive-controls');
      secondaryHand.setAttribute('controller', 'controllerType', 'vive-controls');
    }

    // Enable raycaster.
    this.el.emit('enter-vr', null, false);

    document.addEventListener('keydown', evt => {
      var primaryPosition;
      var primaryRotation;
      var secondaryPosition;
      var secondaryRotation;

      if (!evt.shiftKey) {
        return;
      }

      // <space> for trigger.
      if (evt.keyCode === 32) {
        if (this.isTriggerDown) {
          primaryHand.emit('triggerup');
          this.isTriggerDown = false;
        } else {
          primaryHand.emit('triggerdown');
          this.isTriggerDown = true;
        }
        return;
      }

      // <q> for secondary trigger.
      if (evt.keyCode === 81) {
        if (this.isSecondaryTriggerDown) {
          secondaryHand.emit('triggerup');
          this.isSecondaryTriggerDown = false;
        } else {
          secondaryHand.emit('triggerdown');
          this.isSecondaryTriggerDown = true;
        }
        return;
      }

      // <n> secondary grip.
      if (evt.keyCode === 78) {
        if (this.secondaryGripDown) {
          secondaryHand.emit('gripup');
          this.secondaryGripDown = false;
        } else {
          secondaryHand.emit('gripdown');
          this.secondaryGripDown = true;
        }
      }

      // <m> primary grip.
      if (evt.keyCode === 77) {
        if (this.primaryGripDown) {
          primaryHand.emit('gripup');
          this.primaryGripDown = false;
        } else {
          primaryHand.emit('gripdown');
          this.primaryGripDown = true;
        }
      }

      // Menu button <1>.
      if (evt.keyCode === 49) {
        secondaryHand.emit('menudown');
      }

      // Position bindings.
      if (evt.ctrlKey) {
        secondaryPosition = secondaryHand.getAttribute('position');
        if (evt.keyCode === 72) {
          secondaryPosition.x -= 0.01;
        } // h.
        if (evt.keyCode === 74) {
          secondaryPosition.y -= 0.01;
        } // j.
        if (evt.keyCode === 75) {
          secondaryPosition.y += 0.01;
        } // k.
        if (evt.keyCode === 76) {
          secondaryPosition.x += 0.01;
        } // l.
        if (evt.keyCode === 59 || evt.keyCode === 186) {
          secondaryPosition.z -= 0.01;
        } // ;.
        if (evt.keyCode === 222) {
          secondaryPosition.z += 0.01;
        } // ;.
        secondaryHand.setAttribute('position', AFRAME.utils.clone(secondaryPosition));
      } else {
        primaryPosition = primaryHand.getAttribute('position');
        if (evt.keyCode === 72) {
          primaryPosition.x -= 0.01;
        } // h.
        if (evt.keyCode === 74) {
          primaryPosition.y -= 0.01;
        } // j.
        if (evt.keyCode === 75) {
          primaryPosition.y += 0.01;
        } // k.
        if (evt.keyCode === 76) {
          primaryPosition.x += 0.01;
        } // l.
        if (evt.keyCode === 59 || evt.keyCode === 186) {
          primaryPosition.z -= 0.01;
        } // ;.
        if (evt.keyCode === 222) {
          primaryPosition.z += 0.01;
        } // ;.
        primaryHand.setAttribute('position', AFRAME.utils.clone(primaryPosition));
      }

      // Rotation bindings.
      if (evt.ctrlKey) {
        secondaryRotation = secondaryHand.getAttribute('rotation');
        if (evt.keyCode === 89) {
          secondaryRotation.x -= 10;
        } // y.
        if (evt.keyCode === 79) {
          secondaryRotation.x += 10;
        } // o.
        if (evt.keyCode === 85) {
          secondaryRotation.y -= 10;
        } // u.
        if (evt.keyCode === 73) {
          secondaryRotation.y += 10;
        } // i.
        secondaryHand.setAttribute('rotation', AFRAME.utils.clone(secondaryRotation));
      } else {
        primaryRotation = primaryHand.getAttribute('rotation');
        if (evt.keyCode === 89) {
          primaryRotation.x -= 10;
        } // y.
        if (evt.keyCode === 79) {
          primaryRotation.x += 10;
        } // o.
        if (evt.keyCode === 85) {
          primaryRotation.y -= 10;
        } // u.
        if (evt.keyCode === 73) {
          primaryRotation.y += 10;
        } // i.
        primaryHand.setAttribute('rotation', AFRAME.utils.clone(primaryRotation));
      }
    });
  },

  play: function () {
    var primaryHand;
    var secondaryHand;

    this.bounds = document.body.getBoundingClientRect();

    if (!AFRAME.utils.getUrlParameter('debug')) {
      return;
    }

    primaryHand = document.getElementById('rightHand');
    secondaryHand = document.getElementById('leftHand');

    secondaryHand.object3D.position.set(-0.2, 1.5, -0.5);
    primaryHand.object3D.position.set(0.2, 1.5, -0.5);
    secondaryHand.setAttribute('rotation', { x: 35, y: 0, z: 0 });
  },

  onMouseMove: function () {
    const direction = new THREE.Vector3();
    const mouse = new THREE.Vector2();
    const cameraPos = new THREE.Vector3();

    return function (evt) {
      const bounds = this.bounds;
      const camera = this.el.sceneEl.camera;
      const left = evt.clientX - bounds.left;
      const top = evt.clientY - bounds.top;
      mouse.x = left / bounds.width * 2 - 1;
      mouse.y = -top / bounds.height * 2 - 1;

      document.getElementById('camera').object3D.getWorldPosition(cameraPos);
      direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(cameraPos).normalize();

      const handPos = document.getElementById('rightHand').object3D.position;
      const distance = -cameraPos.z / direction.z;
      camera.getWorldPosition(handPos).add(direction.multiplyScalar(distance));
      handPos.y += 0.8;
    };
  }()
});

/***/ }),
/* 33 */
/***/ (() => {

/**
 * Log cursor events.
 */
AFRAME.registerComponent('debug-cursor', {
  init: function () {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    this.el.addEventListener('mouseenter', evt => {
      this.log('mouseenter', evt.detail.intersectedEl, 'green');
    });

    this.el.addEventListener('mouseleave', evt => {
      this.log('mouseleave', evt.detail.intersectedEl, 'red');
    });

    this.el.addEventListener('click', evt => {
      this.log('click', evt.detail.intersectedEl, 'blue');
    });
  },

  log: function (event, intersectedEl, color) {
    if (intersectedEl.id) {
      console.log(`%c[${event}] ${intersectedEl.id}`, `color: ${color}`);
    } else {
      console.log(`%c[${event}]`, `color: ${color}`);
      console.log(intersectedEl);
    }
  }
});

/***/ }),
/* 34 */
/***/ (() => {

/**
 * Emit events from query parameter to state to automatically set up state.
 */
AFRAME.registerComponent('debug-song-time', {
  dependencies: ['song'],

  init: function () {
    if (!AFRAME.utils.getUrlParameter('debug-song-time')) {
      return;
    }
    setInterval(() => {
      console.log(this.el.components.song.getCurrentTime());
    }, 250);
  }
});

/***/ }),
/* 35 */
/***/ (() => {

/**
 * Emit events from query parameter to state to automatically set up state.
 */
AFRAME.registerComponent('debug-state', {
  play: function () {
    const flags = AFRAME.utils.getUrlParameter('debugstate').trim();
    if (!flags) {
      return;
    }

    setTimeout(() => {
      flags.split(',').forEach(flag => {
        this.el.sceneEl.emit(`debug${flag.trim()}`, null, false);
      });
    }, 500);
  }
});

/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var aframe_atlas_uvs_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

__webpack_require__(1);

const colorHelper = new THREE.Color();

const geometry = createGeometry();
const material = new THREE.MeshBasicMaterial({
  alphaMap: createAlphaMap(),
  transparent: true,
  vertexColors: THREE.VertexColors
});

/**
 * Fake glow using merged overlayed cylinders with alpha map.
 * Requires THREE.BufferGeometryUtils.
 */
AFRAME.registerComponent("fake-glow", {
  schema: {
    color: { default: "#FFF" }
  },

  play: function () {
    this.el.setObject3D("mesh", new THREE.Mesh(createGeometry(this.data.color), material));
  }
});

function createAlphaMap() {
  const alphaCanvas = document.createElement("canvas");
  alphaCanvas.height = 1;
  alphaCanvas.width = 4;

  const ctx = alphaCanvas.getContext("2d");

  // For first color.
  ctx.fillStyle = "rgb(10, 10, 10)";
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = "rgb(15, 15, 15)";
  ctx.fillRect(1, 0, 1, 1);
  ctx.fillStyle = "rgb(23, 23 ,23)";
  ctx.fillRect(2, 0, 1, 1);
  ctx.fillStyle = "rgb(28, 28, 28)";
  ctx.fillRect(3, 0, 1, 1);

  setTimeout(() => {
    alphaCanvas.style.position = "fixed";
    alphaCanvas.style.zIndex = 999999999999;
    alphaCanvas.style.left = 0;
    alphaCanvas.style.top = 0;
    document.body.appendChild(alphaCanvas);
  }, 1000);
  return new THREE.CanvasTexture(alphaCanvas);
}

function createGeometry(color) {
  var i;
  colorHelper.set(color);

  const cylinders = [{ height: 0.1831, radius: 0.0055 }, { height: 0.1832, radius: 0.0065 }, { height: 0.1833, radius: 0.0075 }, { height: 0.1834, radius: 0.0085 }];

  const geometries = cylinders.map((cylinderData, i) => {
    const cylinder = new THREE.CylinderBufferGeometry(cylinderData.radius, cylinderData.radius, cylinderData.height);

    const colorArray = [];
    for (i = 0; i < cylinder.attributes.position.array.length; i += 3) {
      colorArray[i] = colorHelper.r;
      colorArray[i + 1] = colorHelper.g;
      colorArray[i + 2] = colorHelper.b;
    }
    cylinder.addAttribute("color", new THREE.Float32BufferAttribute(colorArray, 3));

    const alphaUvs = (0,aframe_atlas_uvs_component__WEBPACK_IMPORTED_MODULE_0__.getGridUvs)(0, i, 1, 4);
    const uvs = cylinder.attributes.uv.array;
    for (i = 0; i < uvs.length; i += 6) {
      uvs[i] = alphaUvs[0].x;
      uvs[i + 1] = alphaUvs[0].y;

      uvs[i + 2] = alphaUvs[1].x;
      uvs[i + 3] = alphaUvs[1].y;

      uvs[i + 4] = alphaUvs[2].x;
      uvs[i + 5] = alphaUvs[2].y;
    }
    cylinder.attributes.uv.needsUpdate = true;

    return cylinder;
  });

  const geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
  return geometry;
}

/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


const COLORS = __webpack_require__(26);
const HIT_COLOR = new THREE.Color(COLORS.NEON_RED);
const BORDER_COLOR = new THREE.Color(COLORS.NEON_BLUE);

AFRAME.registerShader('floorShader', {
  schema: {
    normalMap: { type: 'map', is: 'uniform' },
    envMap: { type: 'map', is: 'uniform' },
    hitRight: { type: 'vec3', is: 'uniform', default: { x: 0, y: 1, z: 0 } },
    hitLeft: { type: 'vec3', is: 'uniform', default: { x: 0, y: 0, z: 0 } }
  },

  vertexShader: `
    varying vec2 uvs;
    varying vec3 worldPos;
    void main() {
      uvs.xy = uv.xy;
      vec4 p = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      worldPos = (modelMatrix * vec4( position, 1.0 )).xyz;
      gl_Position = p;
    }
  `,

  fragmentShader: `
    varying vec2 uvs;
    varying vec3 worldPos;
    uniform vec3 color;
    uniform sampler2D normalMap;
    uniform sampler2D envMap;
    uniform vec3 hitRight;
    uniform vec3 hitLeft;

    #define HIT_COLOR vec3(${HIT_COLOR.r}, ${HIT_COLOR.g}, ${HIT_COLOR.b})
    #define BORDER_COLOR vec3(${BORDER_COLOR.r}, ${BORDER_COLOR.g}, ${BORDER_COLOR.b})

    vec3 drawCircle(vec3 p, vec3 center, float radius, float edgeWidth, vec3 color) {
      return color*(1.0-smoothstep(radius, radius+edgeWidth, length(p-center)));
    }

    void main() {
      vec2 p = uvs.xy - 0.5;
      vec3 border = vec3(smoothstep(0.49, 0.495, abs(p.x)) + smoothstep(0.49, 0.495, abs(p.y)));
      border += BORDER_COLOR * (smoothstep(0.475, 0.495, abs(p.x)) + smoothstep(0.475, 0.495, abs(p.y))) * .7;
      p*= 4.0;

      vec3 hitColor = HIT_COLOR;
      vec3 hit = vec3(0.0);

      hit += drawCircle(worldPos, hitRight, 0.04, 0.05, hitColor);
      hit += drawCircle(worldPos, hitRight, 0.02, 0.03, vec3(0.7, 0.7, 0.7));
      hit += drawCircle(worldPos, hitLeft, 0.04, 0.05, hitColor);
      hit += drawCircle(worldPos, hitLeft, 0.02, 0.03, vec3(0.7, 0.7, 0.7));

      vec3 normal = normalize(texture2D(normalMap, uvs).xyz);

      // environment reflection
      vec3 reflectVec = normalize(reflect(normalize(worldPos - cameraPosition), normal));
      //vec3 reflectView = normalize((viewMatrix * vec4(reflectVec, 0.0)).xyz + vec3(0.0, 0.0, 1.0));

      vec3 ref = texture2D(envMap, reflectVec.xy * vec2(0.3, 1.0) + vec2(0.75, -cameraPosition.z * 0.05)).xyz * 0.14;

      gl_FragColor = vec4(ref + border + hit, 1.0);
    }
  `
});

/***/ }),
/* 38 */
/***/ (() => {

let i = 0;

/**
 * Preload textures to GPU that are not visible from the start..
 * three.js renderer by default will not upload textures from non-visible entities.
 */
AFRAME.registerComponent('gpu-preloader', {
  dependencies: ['materials'],

  play: function () {
    this.preloadMineEnvMaps();

    setTimeout(() => {
      this.preloadAtlas();
      this.preloadBeamMap();
      this.preloadBeatEnvMap();
    }, 1000);
  },

  preloadAtlas: function () {
    const stage = document.querySelector('#stageObj');
    this.preloadTexture(stage.getObject3D('mesh').children[0].material.uniforms.src.value);
  },

  preloadBeamMap: function () {
    const beams = document.querySelector('[beams]');
    this.preloadTexture(beams.components.beams.texture);
  },

  preloadBeatEnvMap: function () {
    const beat = document.querySelector('#beatContainer [mixin~="beat"]');
    beat.object3D.traverse(node => {
      if (!node.material) {
        return;
      }
      if (node.material.envMap) {
        this.preloadTexture(node.material.envMap);
      }
      if (node.material.map) {
        this.preloadTexture(node.material.map);
      }
    });
  },

  preloadKeyboard: function () {
    const keyboard = document.getElementById('keyboard').components['super-keyboard'];
    this.preloadTexture(keyboard.kbImg.getObject3D('mesh').material.map);
    this.preloadTexture(keyboard.keyColorPlane.getObject3D('mesh').material.map);
  },

  preloadMineEnvMaps: function () {
    const stageColors = this.el.sceneEl.components['stage-colors'];
    this.el.sceneEl.addEventListener('mineredenvmaploaded', () => {
      this.preloadTexture(stageColors.mineEnvMap.red);
    });
    this.el.sceneEl.addEventListener('mineblueenvmaploaded', () => {
      this.preloadTexture(stageColors.mineEnvMap.blue);
    });
  },

  preloadWallMap: function () {
    const wall = document.querySelector('a-entity[wall]');
    this.preloadTexture(wall.getObject3D('mesh').material.uniforms.tex.value);
    this.preloadTexture(wall.getObject3D('mesh').material.uniforms.env.value);
  },

  preloadTexture: function (texture) {
    if (!texture || !texture.image) {
      console.warn('[gpu-preloader] Error preloading texture', texture);
      return;
    }
    if (!texture.image.complete) {
      console.warn('[gpu-preloader] Error preloading, image not loaded', texture);
      return;
    }
    this.el.renderer.setTexture2D(texture, i++ % 8);
  }
});

/***/ }),
/* 39 */
/***/ (() => {

AFRAME.registerSystem('iframe', {
  init: function () {
    if (window.self !== window.top) {
      document.getElementById('vrButton').style.display = 'none';
    }
  }
});

/***/ }),
/* 40 */
/***/ (() => {

AFRAME.registerComponent('keyboard-raycastable', {
  dependencies: ['super-keyboard'],

  schema: {
    condition: { default: '' }
  },

  play: function () {
    this.el.components['super-keyboard'].kbImg.setAttribute('bind-toggle__raycastable', this.data.condition);
  }
});

/***/ }),
/* 41 */
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const COLORS = __webpack_require__(26);
const flatShaders = __webpack_require__(42);
const stageAdditiveShaders = __webpack_require__(43);
const stageNormalShaders = __webpack_require__(44);

AFRAME.registerSystem("materials", {
  init: function () {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", this.createMaterials.bind(this));
    } else {
      this.createMaterials();
    }
  },

  createMaterials: function () {
    this.stageNormal = new THREE.ShaderMaterial({
      uniforms: {
        skyColor: { value: new THREE.Color(COLORS.SKY_BLUE) },
        backglowColor: { value: new THREE.Color(COLORS.BG_BLUE) },
        src: {
          value: new THREE.TextureLoader().load(document.getElementById("atlasImg").src)
        }
      },
      vertexShader: stageNormalShaders.vertexShader,
      fragmentShader: stageNormalShaders.fragmentShader,
      fog: false,
      transparent: true
    });

    this.stageAdditive = new THREE.ShaderMaterial({
      uniforms: {
        tunnelNeon: { value: new THREE.Color(COLORS.NEON_RED) },
        floorNeon: { value: new THREE.Color(COLORS.NEON_RED) },
        leftLaser: { value: new THREE.Color(COLORS.NEON_BLUE) },
        rightLaser: { value: new THREE.Color(COLORS.NEON_BLUE) },
        textGlow: { value: new THREE.Color(COLORS.TEXT_OFF) },
        src: {
          value: new THREE.TextureLoader().load(document.getElementById("atlasImg").src)
        }
      },
      vertexShader: stageAdditiveShaders.vertexShader,
      fragmentShader: stageAdditiveShaders.fragmentShader,
      blending: THREE.AdditiveBlending,
      fog: false,
      transparent: true
    });

    this.logo = new THREE.ShaderMaterial({
      uniforms: {
        src: {
          value: new THREE.TextureLoader().load(document.getElementById("logotexImg").src)
        }
      },
      vertexShader: flatShaders.vertexShader,
      fragmentShader: flatShaders.fragmentShader,
      fog: false,
      transparent: true
    });

    this.logoadditive = new THREE.ShaderMaterial({
      uniforms: {
        src: {
          value: new THREE.TextureLoader().load(document.getElementById("logotexImg").src)
        }
      },
      vertexShader: flatShaders.vertexShader,
      fragmentShader: flatShaders.fragmentShader,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      fog: false,
      transparent: true
    });

    this.mineMaterialred = new THREE.MeshStandardMaterial({
      roughness: 0.38,
      metalness: 0.48,
      color: new THREE.Color(COLORS.MINE_RED),
      emissive: new THREE.Color(COLORS.MINE_RED_EMISSION),
      envMap: new THREE.TextureLoader().load("assets/img/mineenviro-red.jpg")
    });

    this.mineMaterialblue = new THREE.MeshStandardMaterial({
      roughness: 0.38,
      metalness: 0.48,
      color: new THREE.Color(COLORS.MINE_BLUE),
      emissive: new THREE.Color(COLORS.MINE_BLUE_EMISSION),
      envMap: new THREE.TextureLoader().load("assets/img/mineenviro-blue.jpg")
    });
  }
});

AFRAME.registerComponent("materials", {
  schema: {
    name: { default: "" },
    recursive: { default: true }
  },

  update: function () {
    if (this.data.name === "") {
      return;
    }

    const material = this.system[this.data.name];
    if (!material) {
      console.warn(`undefined material "${this.system[this.data.name]}"`);
      return;
    }

    const mesh = this.el.getObject3D("mesh");
    if (!mesh) {
      this.el.addEventListener("model-loaded", this.applyMaterial.bind(this));
    } else {
      this.applyMaterial(mesh);
    }
  },

  applyMaterial: function (obj) {
    const material = this.system[this.data.name];
    if (obj["detail"]) {
      obj = obj.detail.model;
    }
    if (this.data.recursive) {
      obj.traverse(o => {
        if (o.type === "Mesh") {
          o.material = material;
        }
      });
    } else {
      obj.material = material;
    }
  }
});

/***/ }),
/* 42 */
/***/ ((module) => {

module.exports = {
  vertexShader: `
    varying vec2 uvs;
    void main() {
      uvs.xy = uv.xy;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,

  fragmentShader: `
    varying vec2 uvs;
    uniform sampler2D src;

    void main() {
      gl_FragColor = texture2D(src, uvs);
    }
` };

/***/ }),
/* 43 */
/***/ ((module) => {

module.exports = {
  vertexShader: `
    varying vec2 uvs;
    varying vec3 worldPos;
    void main() {
      uvs.xy = uv.xy;
      vec4 p = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      worldPos = (modelMatrix * vec4( position, 1.0 )).xyz;
      gl_Position = p;
    }
  `,

  fragmentShader: `
    varying vec2 uvs;
    varying vec3 worldPos;
    uniform vec3 tunnelNeon;
    uniform vec3 leftLaser;
    uniform vec3 rightLaser;
    uniform vec3 floorNeon;
    uniform vec3 textGlow;
    uniform sampler2D src;

    void main() {
      float mask;
      vec4 col = texture2D(src, uvs);

      // tunnel neon
      mask = step(0.87, uvs.x) *  step(0.5, uvs.y) * (1.0 - step(0.935, uvs.x)) * ( 1.0 - step(0.75, uvs.y));
      col.xyz = mix(col.xyz, col.xyz * tunnelNeon, mask);

      // floor & corridor neons
      mask = step(0.935, uvs.x) * step(0.5, uvs.y) * ( 1.0 - step(0.75, uvs.y));
      col.xyz = mix(col.xyz, col.xyz * floorNeon, mask);

      // left laser
      mask = step(0.5, uvs.x) * (1.0 - step(0.625, uvs.x)) * (1.0 - step(0.5, uvs.y));
      col.xyz = mix(col.xyz, col.xyz * leftLaser, mask);

      // right laser
      mask = step(0.625, uvs.x) * (1.0 - step(0.75, uvs.x)) * (1.0 - step(0.5, uvs.y));
      col.xyz = mix(col.xyz, col.xyz * rightLaser, mask);

      // text glows
      mask = step(0.87, uvs.x) *  step(0.25, uvs.y) * (1.0 - step(0.935, uvs.x)) * ( 1.0 - step(0.5, uvs.y));
      col.xyz = mix(col.xyz, col.xyz * textGlow, mask);

      gl_FragColor = col;
    }
  `
};

/***/ }),
/* 44 */
/***/ ((module) => {

module.exports = {
  vertexShader: `
    varying vec2 uvs;
    varying vec3 worldPos;
    void main() {
      uvs.xy = uv.xy;
      vec4 p = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      worldPos = (modelMatrix * vec4( position, 1.0 )).xyz;
      gl_Position = p;
    }
  `,

  fragmentShader: `
    #define FOG_RADIUS  55.0
    #define FOG_FALLOFF 48.0
    #define FOG_COLOR_MULT 0.8
    varying vec2 uvs;
    varying vec3 worldPos;
    uniform vec3 skyColor;
    uniform vec3 backglowColor;
    uniform sampler2D src;

    void main() {
      vec4 col = texture2D(src, uvs);
      float mask;

      // bg
      mask = step(0.5, uvs.x);
      col.xyz = mix(col.xyz * skyColor, col.xyz, mask);

      // backglow
      mask = step(0.5, uvs.x) * step(0.5, uvs.y) * (1.0 - step(0.75, uvs.x));
      col.xyz = mix(col.xyz, col.xyz * backglowColor, mask);

      float fogDensity = 1.0 - pow(clamp(distance(worldPos, vec3(0., 0., -FOG_RADIUS)) / FOG_FALLOFF, 0.0, 1.0), 1.5);
      fogDensity += clamp(0.2 - pow(distance(worldPos, vec3(0.0, 0.0, worldPos.z)) / 10.0, 2.0), 0.0, 1.0);
      col.xyz = mix(col.xyz, backglowColor * FOG_COLOR_MULT, fogDensity);

      gl_FragColor = col;
    }
  `
};

/***/ }),
/* 45 */
/***/ (() => {

const objLoader = new THREE.OBJLoader();

AFRAME.registerSystem('mine-fragments-loader', {
  init: function () {
    this.fragments = null;
    const objData = document.getElementById('mineBrokenObj');
    objData.addEventListener('loaded', evt => {
      this.fragments = objLoader.parse(evt.target.data);
    });
  }
});

/***/ }),
/* 46 */
/***/ ((module) => {

const NUM_PLANE_POSITIONS = 12;

const BLENDINGS = {
  normal: THREE.NormalBlending,
  additive: THREE.AdditiveBlending,
  substractive: THREE.SubstractiveBlending,
  multiply: THREE.MultiplyBlending
};

const SHADERS = {
  flat: THREE.MeshBasicMaterial,
  lambert: THREE.MeshLambertMaterial,
  phong: THREE.MeshPhongMaterial,
  standard: THREE.MeshStandardMaterial
};

const OFFSCREEN_VEC3 = new THREE.Vector3(-99999, -99999, -99999);

/**
 * Particle Player component for A-Frame.
 */
AFRAME.registerComponent('particleplayer', {
  schema: {
    blending: {
      default: 'additive',
      oneOf: ['normal', 'additive', 'multiply', 'substractive']
    },
    color: { default: '#fff', type: 'color' },
    count: { default: '100%' },
    delay: { default: 0, type: 'int' },
    dur: { default: 1000, type: 'int' },
    img: { type: 'selector' },
    interpolate: { default: false },
    loop: { default: 'false' },
    on: { default: 'init' },
    poolSize: { default: 5, type: 'int' }, // number of simultaneous particle systems
    protation: { type: 'vec3' },
    pscale: { default: 1.0, type: 'float' },
    scale: { default: 1.0, type: 'float' },
    initialScale: { type: 'vec3' },
    finalScale: { type: 'vec3' },
    animateScale: { default: false },
    shader: {
      default: 'flat',
      oneOf: ['flat', 'lambert', 'phong', 'standard']
    },
    src: { type: 'selector' }
  },

  multiple: true,

  init: function () {
    this.frame = 0;
    this.framedata = null;
    this.indexPool = null;
    this.lastFrame = 0;
    this.material = null;
    this.msPerFrame = 0;
    this.numFrames = 0;
    this.numParticles = 0; // total number of particles per system
    this.originalVertexPositions = [];
    this.particleCount = 0; // actual number of particles to spawn per event (data.count)
    this.particleSystems = [];
    this.protation = false;
    this.restPositions = []; // position at first frame each particle is alive
    this.restRotations = [];
    this.sprite_rotation = false;
    this.systems = null;
    this.useRotation = false;
    this.useAge = false;
    this.scaleAnim = new THREE.Vector3();
    this.partScale = new THREE.Vector3(1.0, 1.0, 1.0);
  },

  update: function (oldData) {
    const data = this.data;

    if (!data.src) {
      return;
    }

    if (oldData.on !== data.on) {
      if (oldData.on) {
        this.el.removeEventListener(oldData.on, this.start);
      }
      if (data.on !== 'play') {
        this.el.addEventListener(data.on, this.start.bind(this));
      }
    }

    this.partScale.set(1.0, 1.0, 1.0);

    this.loadParticlesJSON(data.src, data.scale);

    this.numFrames = this.framedata.length;
    this.numParticles = this.numFrames > 0 ? this.framedata[0].length : 0;

    if (data.count[data.count.length - 1] === '%') {
      this.particleCount = Math.floor(parseInt(data.count) * this.numParticles / 100.0);
    } else {
      this.particleCount = parseInt(data.count);
    }
    this.particleCount = Math.min(this.numParticles, Math.max(0, this.particleCount));

    this.msPerFrame = data.dur / this.numFrames;

    this.indexPool = new Array(this.numParticles);

    const materialParams = {
      color: new THREE.Color(data.color),
      side: THREE.DoubleSide,
      blending: BLENDINGS[data.blending],
      map: data.img ? new THREE.TextureLoader().load(data.img.src) : null,
      depthWrite: false,
      opacity: data.opacity,
      transparent: !!data.img || data.blending !== 'normal' || data.opacity < 1
    };
    if (SHADERS[data.shader] !== undefined) {
      this.material = new SHADERS[data.shader](materialParams);
    } else {
      this.material = new SHADERS['flat'](materialParams);
    }

    this.createParticles(data.poolSize);

    if (data.on === 'init') {
      this.start();
    }
  },

  loadParticlesJSON: function (json, scale) {
    var alive;

    this.restPositions.length = 0;
    this.restRotations.length = 0;

    const jsonData = JSON.parse(json.data);
    const frames = jsonData.frames;
    const precision = jsonData.precision;

    this.useRotation = jsonData.rotation;
    this.useAge = jsonData['age'] !== undefined ? jsonData.age : false;

    if (jsonData.sprite_rotation !== false) {
      this.sprite_rotation = {
        x: jsonData.sprite_rotation[0] / precision,
        y: jsonData.sprite_rotation[1] / precision,
        z: jsonData.sprite_rotation[2] / precision
      };
    } else {
      this.sprite_rotation = false;
    }

    this.framedata = new Array(frames.length);
    for (let frameIndex = 0; frameIndex < frames.length; frameIndex++) {
      this.framedata[frameIndex] = new Array(frames[frameIndex].length);
      for (let particleIndex = 0; particleIndex < frames[frameIndex].length; particleIndex++) {
        let rawP = frames[frameIndex][particleIndex]; // data of particle i in frame f
        alive = rawP !== 0; // 0 means not alive yet this frame.

        let p = this.framedata[frameIndex][particleIndex] = {
          position: alive ? {
            x: rawP[0] / precision * scale,
            y: rawP[1] / precision * scale,
            z: rawP[2] / precision * scale
          } : null,
          alive: alive
        };

        if (this.useRotation) {
          p.rotation = alive ? {
            x: rawP[3] / precision,
            y: rawP[4] / precision,
            z: rawP[5] / precision
          } : null;
        }

        if (this.useAge) {
          p.age = alive ? rawP[6] / precision : 0;
        }

        if (alive && frameIndex === 0) {
          this.restPositions[particleIndex] = p.position ? { x: p.position.y, y: p.position.y, z: p.position.z } : null;
          this.restRotations[particleIndex] = p.rotation ? { x: p.rotation.y, y: p.rotation.y, z: p.rotation.z } : null;
        }
      }
    }
  },

  createParticles: function () {
    const tempGeometries = [];

    return function (numParticleSystems) {
      const data = this.data;
      var loop = parseInt(this.data.loop);

      this.particleSystems.length = 0;

      if (isNaN(loop)) {
        loop = this.data.loop === 'true' ? Number.MAX_VALUE : 0;
      }

      for (let i = 0; i < numParticleSystems; i++) {
        let particleSystem = {
          active: false,
          activeParticleIndices: new Array(this.particleCount),
          loopCount: 0,
          loopTotal: loop,
          mesh: null,
          time: 0
        };

        // Fill array of geometries to merge.
        const ratio = data.img ? data.img.width / data.img.height : 1;
        tempGeometries.length = 0;
        for (let p = 0; p < this.numParticles; p++) {
          let geometry = new THREE.PlaneBufferGeometry(0.1 * ratio * data.pscale, 0.1 * data.pscale);
          if (this.sprite_rotation !== false) {
            geometry.rotateX(this.sprite_rotation.x);
            geometry.rotateY(this.sprite_rotation.y);
            geometry.rotateZ(this.sprite_rotation.z);
          } else {
            geometry.rotateX(this.data.protation.x * Math.PI / 180);
            geometry.rotateY(this.data.protation.y * Math.PI / 180);
            geometry.rotateZ(this.data.protation.z * Math.PI / 180);
          }
          tempGeometries.push(geometry);
        }

        // Create merged geometry for whole particle system.
        let mergedBufferGeometry = THREE.BufferGeometryUtils.mergeBufferGeometries(tempGeometries);

        particleSystem.mesh = new THREE.Mesh(mergedBufferGeometry, this.material);
        particleSystem.mesh.visible = false;
        this.el.setObject3D(`particleplayer${i}`, particleSystem.mesh);
        copyArray(this.originalVertexPositions, mergedBufferGeometry.attributes.position.array);

        // Hide all particles by default.
        for (let i = 0; i < mergedBufferGeometry.attributes.position.array.length; i++) {
          mergedBufferGeometry.attributes.position.array[i] = -99999;
        }

        for (let i = 0; i < particleSystem.activeParticleIndices.length; i++) {
          particleSystem.activeParticleIndices[i] = i;
        }

        this.particleSystems.push(particleSystem);
      }
    };
  }(),

  start: function (evt) {
    if (this.data.delay > 0) {
      setTimeout(() => this.startAfterDelay(evt), this.data.delay);
    } else {
      this.startAfterDelay(evt);
    }
  },

  startAfterDelay: function (evt) {
    // position, rotation
    var found = -1;
    var particleSystem;
    var oldestTime = 0;
    var position = evt ? evt.detail.position : null;
    var rotation = evt ? evt.detail.rotation : null;

    if (!(position instanceof THREE.Vector3)) {
      position = new THREE.Vector3();
    }
    if (!(rotation instanceof THREE.Euler)) {
      rotation = new THREE.Euler();
    }

    // find available (or oldest) particle system
    for (var i = 0; i < this.particleSystems.length; i++) {
      if (this.particleSystems[i].active === false) {
        found = i;
        break;
      }
      if (this.particleSystems[i].time > oldestTime) {
        found = i;
        oldestTime = this.particleSystems[i].time;
      }
    }

    if (found === -1) {
      return;
    }

    particleSystem = this.particleSystems[found];
    particleSystem.active = true;
    particleSystem.loopCount = 1;
    particleSystem.mesh.visible = true;
    particleSystem.mesh.position.copy(position);
    particleSystem.mesh.rotation.copy(rotation);
    particleSystem.time = 0;
    this.resetParticles(particleSystem);
    return particleSystem;
  },

  doLoop: function (particleSystem) {
    particleSystem.loopCount++;
    particleSystem.frame = -1;
    particleSystem.time = 0;
    this.resetParticles(particleSystem);
  },

  resetParticle: function (particleSystem, particleIndex) {
    const geometry = particleSystem.mesh.geometry;

    if (this.restPositions[particleIndex]) {
      transformPlane(particleIndex, geometry, this.originalVertexPositions, this.restPositions[particleIndex], this.useRotation && this.restRotations[particleIndex], null);
    } else {
      // Hide.
      transformPlane(particleIndex, geometry, this.originalVertexPositions, OFFSCREEN_VEC3, undefined, null);
    }

    // TODO: Can update transformPlane for lookAt.
    // lookAt does not support rotated or translated parents! :_(
    // part.lookAt(this.camera.position);
  },

  /**
   * When starting or finishing (looping) animation, this resets particles
   * to their initial position and, if user asked for replaying less than 100%
   * of particles, randomly choose them.
   */
  resetParticles: function (particleSystem) {
    var i;
    var rand;

    // no picking, just hide and reset
    if (this.particleCount === this.numParticles) {
      for (i = 0; i < this.numParticles; i++) {
        this.resetParticle(particleSystem, i);
      }
      return;
    }

    // hide particles from last animation and initialize indexPool
    const geometry = particleSystem.mesh.geometry;
    for (i = 0; i < this.numParticles; i++) {
      if (i < this.particleCount) {
        transformPlane(particleSystem.activeParticleIndices[i], geometry, this.originalVertexPositions, OFFSCREEN_VEC3, undefined, null);
      }
      this.indexPool[i] = i;
    }

    // scramble indexPool
    for (i = 0; i < this.particleCount; i++) {
      rand = i + Math.floor(Math.random() * (this.numParticles - i));
      particleSystem.activeParticleIndices[i] = this.indexPool[rand];
      this.indexPool[rand] = this.indexPool[i];
      this.resetParticle(particleSystem, particleSystem.activeParticleIndices[i]);
    }
  },

  tick: function () {
    const helperPositionVec3 = new THREE.Vector3();

    return function (time, delta) {
      var frame; // current particle system frame
      var fdata; // all particles data in current frame
      var fdataNext; // next frame (for interpolation)
      var useRotation = this.useRotation;
      var frameTime; // time in current frame (for interpolation)
      var relTime; // current particle system relative time (0-1)
      var interpolate; // whether interpolate between frames or not
      const scaleSystem = this.data.animateScale && !this.useAge;
      const scaleParticle = this.data.animateScale && this.useAge;

      for (let particleSystemIndex = 0; particleSystemIndex < this.particleSystems.length; particleSystemIndex++) {
        let particleSystem = this.particleSystems[particleSystemIndex];
        if (!particleSystem.active) {
          continue;
        }

        // if the duration is so short that there's no need to interpolate, don't do it
        // even if user asked for it.
        interpolate = this.data.interpolate && this.data.dur / this.numFrames > delta;
        relTime = particleSystem.time / this.data.dur;
        frame = relTime * this.numFrames;
        fdata = this.framedata[Math.floor(frame)];
        if (interpolate) {
          frameTime = frame - Math.floor(frame);
          fdataNext = frame < this.numFrames - 1 ? this.framedata[Math.floor(frame) + 1] : null;
        }

        if (scaleSystem) {
          this.partScale.lerpVectors(this.data.initialScale, this.data.finalScale, relTime);
        }

        for (let activeParticleIndex = 0; activeParticleIndex < particleSystem.activeParticleIndices.length; activeParticleIndex++) {
          let particleIndex = particleSystem.activeParticleIndices[activeParticleIndex];
          let rotation = useRotation && fdata[particleIndex].rotation;

          if (scaleParticle) {
            this.partScale.lerpVectors(this.data.initialScale, this.data.finalScale, fdata[particleIndex].age);
          }

          // TODO: Add vertex position to original position to all vertices of plane...
          if (!fdata[particleIndex].alive) {
            // Hide plane off-screen when not alive.
            transformPlane(particleIndex, particleSystem.mesh.geometry, this.originalVertexPositions, OFFSCREEN_VEC3, undefined, null);
            continue;
          }

          if (interpolate && fdataNext && fdataNext[particleIndex].alive) {
            helperPositionVec3.lerpVectors(fdata[particleIndex].position, fdataNext[particleIndex].position, frameTime);
            transformPlane(particleIndex, particleSystem.mesh.geometry, this.originalVertexPositions, helperPositionVec3, rotation, this.partScale);
          } else {
            transformPlane(particleIndex, particleSystem.mesh.geometry, this.originalVertexPositions, fdata[particleIndex].position, rotation, this.partScale);
          }
        }

        particleSystem.time += delta;
        if (particleSystem.time >= this.data.dur) {
          if (particleSystem.loopCount < particleSystem.loopTotal) {
            this.el.emit('particleplayerloop', null, false);
            this.doLoop(particleSystem);
          } else {
            this.el.emit('particleplayerfinished', null, false);
            particleSystem.active = false;
            particleSystem.mesh.visible = false;
          }
          continue;
        }
      }
    };
  }(),

  _transformPlane: transformPlane
});

// Use triangle geometry as a helper for rotating.
const tri = function () {
  const tri = new THREE.Geometry();
  tri.vertices.push(new THREE.Vector3());
  tri.vertices.push(new THREE.Vector3());
  tri.vertices.push(new THREE.Vector3());
  tri.faces.push(new THREE.Face3(0, 1, 2));
  return tri;
}();

/**
 * Faces of a plane are v0, v2, v1 and v2, v3, v1.
 * Positions are 12 numbers: [v0, v1, v2, v3].
 */
function transformPlane(particleIndex, geometry, originalArray, position, rotation, scale) {
  const array = geometry.attributes.position.array;
  const index = particleIndex * NUM_PLANE_POSITIONS;

  // Calculate first face (0, 2, 1).
  tri.vertices[0].set(originalArray[index + 0], originalArray[index + 1], originalArray[index + 2]);
  tri.vertices[1].set(originalArray[index + 3], originalArray[index + 4], originalArray[index + 5]);
  tri.vertices[2].set(originalArray[index + 6], originalArray[index + 7], originalArray[index + 8]);
  if (scale !== null) {
    tri.scale(scale.x, scale.y, scale.z);
  }
  if (rotation) {
    tri.rotateX(rotation.x);
    tri.rotateY(rotation.y);
    tri.rotateZ(rotation.z);
  }
  tri.vertices[0].add(position);
  tri.vertices[1].add(position);
  tri.vertices[2].add(position);
  array[index + 0] = tri.vertices[0].x;
  array[index + 1] = tri.vertices[0].y;
  array[index + 2] = tri.vertices[0].z;
  array[index + 3] = tri.vertices[1].x;
  array[index + 4] = tri.vertices[1].y;
  array[index + 5] = tri.vertices[1].z;
  array[index + 6] = tri.vertices[2].x;
  array[index + 7] = tri.vertices[2].y;
  array[index + 8] = tri.vertices[2].z;

  // Calculate second face (2, 3, 1) just for the last vertex.
  tri.vertices[0].set(originalArray[index + 3], originalArray[index + 4], originalArray[index + 5]);
  tri.vertices[1].set(originalArray[index + 6], originalArray[index + 7], originalArray[index + 8]);
  tri.vertices[2].set(originalArray[index + 9], originalArray[index + 10], originalArray[index + 11]);
  if (scale !== null) {
    tri.scale(scale.x, scale.y, scale.z);
  }
  if (rotation) {
    tri.rotateX(rotation.x);
    tri.rotateY(rotation.y);
    tri.rotateZ(rotation.z);
  }
  tri.vertices[0].add(position);
  tri.vertices[1].add(position);
  tri.vertices[2].add(position);
  array[index + 9] = tri.vertices[2].x;
  array[index + 10] = tri.vertices[2].y;
  array[index + 11] = tri.vertices[2].z;

  geometry.attributes.position.needsUpdate = true;
}
module.exports.transformPlane = transformPlane;

function copyArray(dest, src) {
  dest.length = 0;
  for (let i = 0; i < src.length; i++) {
    dest[i] = src[i];
  }
}

/***/ }),
/* 47 */
/***/ (() => {

AFRAME.registerComponent('pause', {
  schema: {
    isPaused: { default: false }
  },

  update: function () {
    if (this.data.isPaused && this.el.isPlaying) {
      this.el.pause();
    } else if (!this.data.isPaused && !this.el.isPlaying && this.el.sceneEl.isPlaying) {
      this.el.play();
    }
  }
});

/***/ }),
/* 48 */
/***/ (() => {

/**
 * Tell app to pause game if playing.
 */
AFRAME.registerComponent('pauser', {
  schema: {
    enabled: { default: true }
  },

  init: function () {
    this.pauseGame = this.pauseGame.bind(this);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.pauseGame();
      }
    });
  },

  pauseGame: function () {
    if (!this.data.enabled) {
      return;
    }
    this.el.sceneEl.emit('pausegame', null, false);
  }
});

/***/ }),
/* 49 */
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var SoundPool = __webpack_require__(50);

AFRAME.registerSystem('play-sound', {
  init: function () {
    this.lastSoundPlayed = '';
    this.lastSoundPlayedTime = 0;
    this.pools = {};
  },

  createPool: function (sound, volume) {
    if (this.pools[sound]) {
      return;
    }
    this.pools[sound] = new SoundPool(sound, volume);
  },

  playSound: function (sound, volume) {
    if (!this.pools[sound]) {
      this.createPool(sound, volume);
    }
    this.pools[sound].play();

    this.lastSoundPlayed = sound;
    this.lastSoundTime = this.el.time;
  }
});

/**
 * Play sound on event.
 */
AFRAME.registerComponent('play-sound', {
  schema: {
    enabled: { default: true },
    event: { type: 'string' },
    sound: { type: 'string' },
    volume: { type: 'number', default: 1 }
  },

  multiple: true,

  init: function () {
    this.el.addEventListener(this.data.event, evt => {
      if (!this.data.enabled) {
        return;
      }
      this.system.playSound(this.src, this.data.volume);
    });
  },

  update: function () {
    this.src = this.data.sound;
    if (this.data.sound.startsWith('#')) {
      try {
        this.src = document.querySelector(this.data.sound).getAttribute('src');
      } catch (e) {
        console.log(e, this.data.sound);
      }
    }
  }
});

/***/ }),
/* 50 */
/***/ ((module) => {

/* global Audio */
module.exports = function SoundPool(src, volume) {
  var currSound = 0;
  var pool = [];
  var sound;

  sound = new Audio(src);
  sound.volume = volume;
  pool.push(sound);

  return {
    play: function () {
      // Dynamic size pool.
      if (pool[currSound].currentTime !== 0 || !pool[currSound].ended) {
        sound = new Audio(src);
        sound.volume = volume;
        pool.push(sound);
        currSound++;
      }

      if (pool[currSound].currentTime === 0 || pool[currSound].ended) {
        pool[currSound].play();
      }
      currSound = (currSound + 1) % pool.length;
    }
  };
};

/***/ }),
/* 51 */
/***/ (() => {

/**
 * Set raycast target as a child independnent from entity.
 * Useful for padding the raycast target of a mesh without changing the mesh.
 */
AFRAME.registerComponent('raycaster-target', {
  schema: {
    bindToggle: { default: '' },
    depth: { type: 'number' },
    height: { type: 'number' },
    position: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    rotation: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    useBoxTarget: { default: false },
    width: { type: 'number' }
  },

  init: function () {
    var boxGeometry = { primitive: 'box' };
    var planeGeometry = { primitive: 'plane' };

    return function () {
      var data = this.data;
      var el = this.el;
      var geometry;
      var raycastTarget;

      raycastTarget = document.createElement('a-entity');
      raycastTarget.classList.add('raycasterTarget');

      if (data.bindToggle) {
        raycastTarget.setAttribute('bind-toggle__raycastable', data.bindToggle);
      } else {
        raycastTarget.setAttribute('data-raycastable', '');
      }

      if (data.useBoxTarget) {
        // 3D target.
        geometry = boxGeometry;
        geometry.depth = data.depth;
        geometry.height = data.height;
        geometry.width = data.width;
      } else {
        // 2D target.
        geometry = planeGeometry;
        geometry.height = data.height;
        geometry.width = data.width;
      }
      raycastTarget.setAttribute('geometry', geometry);

      raycastTarget.object3D.visible = false;
      raycastTarget.object3D.position.copy(data.position);
      raycastTarget.object3D.rotation.x = THREE.Math.degToRad(data.rotation.x);
      raycastTarget.object3D.rotation.y = THREE.Math.degToRad(data.rotation.y);
      raycastTarget.object3D.rotation.z = THREE.Math.degToRad(data.rotation.z);

      el.appendChild(raycastTarget);
    };
  }()
});

/***/ }),
/* 52 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(53);


let scene;

/** @jsx h */
class Search extends preact__WEBPACK_IMPORTED_MODULE_0__.Component {
  constructor() {
    super();

    this.state = {
      open: false,
      results: [],
      url: 'supermedium.com/beatsaver-viewer'
    };

    // Close search when clicking anywhere else.
    document.addEventListener('click', evt => {
      if (!this.state.open) {
        return;
      }
      if (!evt.target.closest('#searchResultsContainer') && !evt.target.closest('#searchInput') && !evt.target.closest('#searchToggle')) {
        this.setState({ open: false });
      }
    });

    // Open search.
    document.getElementById('searchToggle').addEventListener('click', () => {
      this.setState({ open: !this.state.open });
      setTimeout(() => {
        document.getElementById('searchInput').focus();
      }, 15);
    });

    // Update URL.
    scene.addEventListener('challengeset', evt => {
      const id = evt.detail;
      if (!id) {
        return;
      }
      this.setState({ url: `supermedium.com/beatsaver-viewer?id=${id}` });
      setIdQueryParam(id);
    });

    this.search = debounce(this.search.bind(this), 100);
    this.selectSong = this.selectSong.bind(this);
  }

  componentDidUpdate() {
    // Close difficulty menu when search is toggled.
    if (this.state.open) {
      document.getElementById('controlsDifficultyOptions').classList.remove('.difficultyOptionsActive');
    }
  }

  search(evt) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://beatsaver.com/api/search/text/0?q=${evt.target.value}`);
    xhr.addEventListener('load', () => {
      this.setState({ results: JSON.parse(xhr.responseText).docs });
      ga('send', 'event', 'search', 'search');
    });
    xhr.send();
  }

  selectSong(evt) {
    scene.emit('songselect', this.state.results[evt.target.closest('.searchResult').dataset.i]);
    this.setState({ open: false });

    // Count as a pageview.
    ga('send', 'pageview');

    document.getElementById('searchInput').value = '';
  }

  render() {
    return (0,preact__WEBPACK_IMPORTED_MODULE_0__.h)(
      'div',
      { id: 'search' },
      (0,preact__WEBPACK_IMPORTED_MODULE_0__.h)(
        'div',
        {
          id: 'searchResultsContainer',
          style: { display: this.state.open && this.state.results.length ? 'flex' : 'none' } },
        (0,preact__WEBPACK_IMPORTED_MODULE_0__.h)(
          'h3',
          null,
          'Search Results (beatsaver.com)'
        ),
        (0,preact__WEBPACK_IMPORTED_MODULE_0__.h)(
          'ul',
          { id: 'searchResults' },
          this.state.results.map((result, i) => (0,preact__WEBPACK_IMPORTED_MODULE_0__.h)(
            'li',
            { 'class': 'searchResult', 'data-id': result.key, onClick: this.selectSong,
              key: result.key, 'data-i': i },
            (0,preact__WEBPACK_IMPORTED_MODULE_0__.h)('img', { src: `https://beatsaver.com${result.coverURL}` }),
            (0,preact__WEBPACK_IMPORTED_MODULE_0__.h)(
              'p',
              null,
              result.metadata.songSubName && truncate(result.metadata.songSubName, 20) + ' \u2014 ' || '',
              truncate(result.metadata.songName, 25)
            )
          ))
        )
      ),
      (0,preact__WEBPACK_IMPORTED_MODULE_0__.h)(
        'p',
        {
          id: 'url',
          style: { display: this.state.open ? 'none' : 'block' } },
        this.state.url
      ),
      (0,preact__WEBPACK_IMPORTED_MODULE_0__.h)('input', {
        id: 'searchInput',
        type: 'search',
        placeholder: 'Search BeatSaver songs...',
        onKeyUp: this.search,
        style: { display: this.state.open ? 'flex' : 'none' } })
    );
  }
}

AFRAME.registerSystem('search', {
  init: function () {
    scene = this.el;
    (0,preact__WEBPACK_IMPORTED_MODULE_0__.render)((0,preact__WEBPACK_IMPORTED_MODULE_0__.h)(Search, null), document.getElementById('controls'));
  }
});

function truncate(str, length) {
  if (!str) {
    return '';
  }
  if (str.length >= length) {
    return str.substring(0, length - 2) + '..';
  }
  return str;
}

function debounce(func, wait, immediate) {
  var timeout;

  return function executedFunction() {
    let context = this;
    let args = arguments;
    let later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

// Push state URL in browser.
const idRe = /id=[\d\w-]+/;
function setIdQueryParam(id) {
  let search = window.location.search.toString();
  if (search) {
    if (search.match(idRe)) {
      search = search.replace(idRe, `id=${id}`);
    } else {
      search += `&id=${id}`;
    }
  } else {
    search = `?id=${id}`;
  }

  let url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  url += search;
  window.history.pushState({ path: url }, '', url);
}

/***/ }),
/* 53 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "h": () => (/* binding */ h),
/* harmony export */   "createElement": () => (/* binding */ h),
/* harmony export */   "cloneElement": () => (/* binding */ cloneElement),
/* harmony export */   "createRef": () => (/* binding */ createRef),
/* harmony export */   "Component": () => (/* binding */ Component),
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "rerender": () => (/* binding */ rerender),
/* harmony export */   "options": () => (/* binding */ options)
/* harmony export */ });
var VNode = function VNode() {};

var options = {};

var stack = [];

var EMPTY_CHILDREN = [];

function h(nodeName, attributes) {
	var children = EMPTY_CHILDREN,
	    lastSimple,
	    child,
	    simple,
	    i;
	for (i = arguments.length; i-- > 2;) {
		stack.push(arguments[i]);
	}
	if (attributes && attributes.children != null) {
		if (!stack.length) stack.push(attributes.children);
		delete attributes.children;
	}
	while (stack.length) {
		if ((child = stack.pop()) && child.pop !== undefined) {
			for (i = child.length; i--;) {
				stack.push(child[i]);
			}
		} else {
			if (typeof child === 'boolean') child = null;

			if (simple = typeof nodeName !== 'function') {
				if (child == null) child = '';else if (typeof child === 'number') child = String(child);else if (typeof child !== 'string') simple = false;
			}

			if (simple && lastSimple) {
				children[children.length - 1] += child;
			} else if (children === EMPTY_CHILDREN) {
				children = [child];
			} else {
				children.push(child);
			}

			lastSimple = simple;
		}
	}

	var p = new VNode();
	p.nodeName = nodeName;
	p.children = children;
	p.attributes = attributes == null ? undefined : attributes;
	p.key = attributes == null ? undefined : attributes.key;

	if (options.vnode !== undefined) options.vnode(p);

	return p;
}

function extend(obj, props) {
  for (var i in props) {
    obj[i] = props[i];
  }return obj;
}

function applyRef(ref, value) {
  if (ref) {
    if (typeof ref == 'function') ref(value);else ref.current = value;
  }
}

var defer = typeof Promise == 'function' ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

function cloneElement(vnode, props) {
  return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
}

var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

var items = [];

function enqueueRender(component) {
	if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {
		(options.debounceRendering || defer)(rerender);
	}
}

function rerender() {
	var p;
	while (p = items.pop()) {
		if (p._dirty) renderComponent(p);
	}
}

function isSameNodeType(node, vnode, hydrating) {
	if (typeof vnode === 'string' || typeof vnode === 'number') {
		return node.splitText !== undefined;
	}
	if (typeof vnode.nodeName === 'string') {
		return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
	}
	return hydrating || node._componentConstructor === vnode.nodeName;
}

function isNamedNode(node, nodeName) {
	return node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
}

function getNodeProps(vnode) {
	var props = extend({}, vnode.attributes);
	props.children = vnode.children;

	var defaultProps = vnode.nodeName.defaultProps;
	if (defaultProps !== undefined) {
		for (var i in defaultProps) {
			if (props[i] === undefined) {
				props[i] = defaultProps[i];
			}
		}
	}

	return props;
}

function createNode(nodeName, isSvg) {
	var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
	node.normalizedNodeName = nodeName;
	return node;
}

function removeNode(node) {
	var parentNode = node.parentNode;
	if (parentNode) parentNode.removeChild(node);
}

function setAccessor(node, name, old, value, isSvg) {
	if (name === 'className') name = 'class';

	if (name === 'key') {} else if (name === 'ref') {
		applyRef(old, null);
		applyRef(value, node);
	} else if (name === 'class' && !isSvg) {
		node.className = value || '';
	} else if (name === 'style') {
		if (!value || typeof value === 'string' || typeof old === 'string') {
			node.style.cssText = value || '';
		}
		if (value && typeof value === 'object') {
			if (typeof old !== 'string') {
				for (var i in old) {
					if (!(i in value)) node.style[i] = '';
				}
			}
			for (var i in value) {
				node.style[i] = typeof value[i] === 'number' && IS_NON_DIMENSIONAL.test(i) === false ? value[i] + 'px' : value[i];
			}
		}
	} else if (name === 'dangerouslySetInnerHTML') {
		if (value) node.innerHTML = value.__html || '';
	} else if (name[0] == 'o' && name[1] == 'n') {
		var useCapture = name !== (name = name.replace(/Capture$/, ''));
		name = name.toLowerCase().substring(2);
		if (value) {
			if (!old) node.addEventListener(name, eventProxy, useCapture);
		} else {
			node.removeEventListener(name, eventProxy, useCapture);
		}
		(node._listeners || (node._listeners = {}))[name] = value;
	} else if (name !== 'list' && name !== 'type' && !isSvg && name in node) {
		try {
			node[name] = value == null ? '' : value;
		} catch (e) {}
		if ((value == null || value === false) && name != 'spellcheck') node.removeAttribute(name);
	} else {
		var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));

		if (value == null || value === false) {
			if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());else node.removeAttribute(name);
		} else if (typeof value !== 'function') {
			if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);else node.setAttribute(name, value);
		}
	}
}

function eventProxy(e) {
	return this._listeners[e.type](options.event && options.event(e) || e);
}

var mounts = [];

var diffLevel = 0;

var isSvgMode = false;

var hydrating = false;

function flushMounts() {
	var c;
	while (c = mounts.shift()) {
		if (options.afterMount) options.afterMount(c);
		if (c.componentDidMount) c.componentDidMount();
	}
}

function diff(dom, vnode, context, mountAll, parent, componentRoot) {
	if (!diffLevel++) {
		isSvgMode = parent != null && parent.ownerSVGElement !== undefined;

		hydrating = dom != null && !('__preactattr_' in dom);
	}

	var ret = idiff(dom, vnode, context, mountAll, componentRoot);

	if (parent && ret.parentNode !== parent) parent.appendChild(ret);

	if (! --diffLevel) {
		hydrating = false;

		if (!componentRoot) flushMounts();
	}

	return ret;
}

function idiff(dom, vnode, context, mountAll, componentRoot) {
	var out = dom,
	    prevSvgMode = isSvgMode;

	if (vnode == null || typeof vnode === 'boolean') vnode = '';

	if (typeof vnode === 'string' || typeof vnode === 'number') {
		if (dom && dom.splitText !== undefined && dom.parentNode && (!dom._component || componentRoot)) {
			if (dom.nodeValue != vnode) {
				dom.nodeValue = vnode;
			}
		} else {
			out = document.createTextNode(vnode);
			if (dom) {
				if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
				recollectNodeTree(dom, true);
			}
		}

		out['__preactattr_'] = true;

		return out;
	}

	var vnodeName = vnode.nodeName;
	if (typeof vnodeName === 'function') {
		return buildComponentFromVNode(dom, vnode, context, mountAll);
	}

	isSvgMode = vnodeName === 'svg' ? true : vnodeName === 'foreignObject' ? false : isSvgMode;

	vnodeName = String(vnodeName);
	if (!dom || !isNamedNode(dom, vnodeName)) {
		out = createNode(vnodeName, isSvgMode);

		if (dom) {
			while (dom.firstChild) {
				out.appendChild(dom.firstChild);
			}
			if (dom.parentNode) dom.parentNode.replaceChild(out, dom);

			recollectNodeTree(dom, true);
		}
	}

	var fc = out.firstChild,
	    props = out['__preactattr_'],
	    vchildren = vnode.children;

	if (props == null) {
		props = out['__preactattr_'] = {};
		for (var a = out.attributes, i = a.length; i--;) {
			props[a[i].name] = a[i].value;
		}
	}

	if (!hydrating && vchildren && vchildren.length === 1 && typeof vchildren[0] === 'string' && fc != null && fc.splitText !== undefined && fc.nextSibling == null) {
		if (fc.nodeValue != vchildren[0]) {
			fc.nodeValue = vchildren[0];
		}
	} else if (vchildren && vchildren.length || fc != null) {
			innerDiffNode(out, vchildren, context, mountAll, hydrating || props.dangerouslySetInnerHTML != null);
		}

	diffAttributes(out, vnode.attributes, props);

	isSvgMode = prevSvgMode;

	return out;
}

function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
	var originalChildren = dom.childNodes,
	    children = [],
	    keyed = {},
	    keyedLen = 0,
	    min = 0,
	    len = originalChildren.length,
	    childrenLen = 0,
	    vlen = vchildren ? vchildren.length : 0,
	    j,
	    c,
	    f,
	    vchild,
	    child;

	if (len !== 0) {
		for (var i = 0; i < len; i++) {
			var _child = originalChildren[i],
			    props = _child['__preactattr_'],
			    key = vlen && props ? _child._component ? _child._component.__key : props.key : null;
			if (key != null) {
				keyedLen++;
				keyed[key] = _child;
			} else if (props || (_child.splitText !== undefined ? isHydrating ? _child.nodeValue.trim() : true : isHydrating)) {
				children[childrenLen++] = _child;
			}
		}
	}

	if (vlen !== 0) {
		for (var i = 0; i < vlen; i++) {
			vchild = vchildren[i];
			child = null;

			var key = vchild.key;
			if (key != null) {
				if (keyedLen && keyed[key] !== undefined) {
					child = keyed[key];
					keyed[key] = undefined;
					keyedLen--;
				}
			} else if (min < childrenLen) {
					for (j = min; j < childrenLen; j++) {
						if (children[j] !== undefined && isSameNodeType(c = children[j], vchild, isHydrating)) {
							child = c;
							children[j] = undefined;
							if (j === childrenLen - 1) childrenLen--;
							if (j === min) min++;
							break;
						}
					}
				}

			child = idiff(child, vchild, context, mountAll);

			f = originalChildren[i];
			if (child && child !== dom && child !== f) {
				if (f == null) {
					dom.appendChild(child);
				} else if (child === f.nextSibling) {
					removeNode(f);
				} else {
					dom.insertBefore(child, f);
				}
			}
		}
	}

	if (keyedLen) {
		for (var i in keyed) {
			if (keyed[i] !== undefined) recollectNodeTree(keyed[i], false);
		}
	}

	while (min <= childrenLen) {
		if ((child = children[childrenLen--]) !== undefined) recollectNodeTree(child, false);
	}
}

function recollectNodeTree(node, unmountOnly) {
	var component = node._component;
	if (component) {
		unmountComponent(component);
	} else {
		if (node['__preactattr_'] != null) applyRef(node['__preactattr_'].ref, null);

		if (unmountOnly === false || node['__preactattr_'] == null) {
			removeNode(node);
		}

		removeChildren(node);
	}
}

function removeChildren(node) {
	node = node.lastChild;
	while (node) {
		var next = node.previousSibling;
		recollectNodeTree(node, true);
		node = next;
	}
}

function diffAttributes(dom, attrs, old) {
	var name;

	for (name in old) {
		if (!(attrs && attrs[name] != null) && old[name] != null) {
			setAccessor(dom, name, old[name], old[name] = undefined, isSvgMode);
		}
	}

	for (name in attrs) {
		if (name !== 'children' && name !== 'innerHTML' && (!(name in old) || attrs[name] !== (name === 'value' || name === 'checked' ? dom[name] : old[name]))) {
			setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
		}
	}
}

var recyclerComponents = [];

function createComponent(Ctor, props, context) {
	var inst,
	    i = recyclerComponents.length;

	if (Ctor.prototype && Ctor.prototype.render) {
		inst = new Ctor(props, context);
		Component.call(inst, props, context);
	} else {
		inst = new Component(props, context);
		inst.constructor = Ctor;
		inst.render = doRender;
	}

	while (i--) {
		if (recyclerComponents[i].constructor === Ctor) {
			inst.nextBase = recyclerComponents[i].nextBase;
			recyclerComponents.splice(i, 1);
			return inst;
		}
	}

	return inst;
}

function doRender(props, state, context) {
	return this.constructor(props, context);
}

function setComponentProps(component, props, renderMode, context, mountAll) {
	if (component._disable) return;
	component._disable = true;

	component.__ref = props.ref;
	component.__key = props.key;
	delete props.ref;
	delete props.key;

	if (typeof component.constructor.getDerivedStateFromProps === 'undefined') {
		if (!component.base || mountAll) {
			if (component.componentWillMount) component.componentWillMount();
		} else if (component.componentWillReceiveProps) {
			component.componentWillReceiveProps(props, context);
		}
	}

	if (context && context !== component.context) {
		if (!component.prevContext) component.prevContext = component.context;
		component.context = context;
	}

	if (!component.prevProps) component.prevProps = component.props;
	component.props = props;

	component._disable = false;

	if (renderMode !== 0) {
		if (renderMode === 1 || options.syncComponentUpdates !== false || !component.base) {
			renderComponent(component, 1, mountAll);
		} else {
			enqueueRender(component);
		}
	}

	applyRef(component.__ref, component);
}

function renderComponent(component, renderMode, mountAll, isChild) {
	if (component._disable) return;

	var props = component.props,
	    state = component.state,
	    context = component.context,
	    previousProps = component.prevProps || props,
	    previousState = component.prevState || state,
	    previousContext = component.prevContext || context,
	    isUpdate = component.base,
	    nextBase = component.nextBase,
	    initialBase = isUpdate || nextBase,
	    initialChildComponent = component._component,
	    skip = false,
	    snapshot = previousContext,
	    rendered,
	    inst,
	    cbase;

	if (component.constructor.getDerivedStateFromProps) {
		state = extend(extend({}, state), component.constructor.getDerivedStateFromProps(props, state));
		component.state = state;
	}

	if (isUpdate) {
		component.props = previousProps;
		component.state = previousState;
		component.context = previousContext;
		if (renderMode !== 2 && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === false) {
			skip = true;
		} else if (component.componentWillUpdate) {
			component.componentWillUpdate(props, state, context);
		}
		component.props = props;
		component.state = state;
		component.context = context;
	}

	component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
	component._dirty = false;

	if (!skip) {
		rendered = component.render(props, state, context);

		if (component.getChildContext) {
			context = extend(extend({}, context), component.getChildContext());
		}

		if (isUpdate && component.getSnapshotBeforeUpdate) {
			snapshot = component.getSnapshotBeforeUpdate(previousProps, previousState);
		}

		var childComponent = rendered && rendered.nodeName,
		    toUnmount,
		    base;

		if (typeof childComponent === 'function') {

			var childProps = getNodeProps(rendered);
			inst = initialChildComponent;

			if (inst && inst.constructor === childComponent && childProps.key == inst.__key) {
				setComponentProps(inst, childProps, 1, context, false);
			} else {
				toUnmount = inst;

				component._component = inst = createComponent(childComponent, childProps, context);
				inst.nextBase = inst.nextBase || nextBase;
				inst._parentComponent = component;
				setComponentProps(inst, childProps, 0, context, false);
				renderComponent(inst, 1, mountAll, true);
			}

			base = inst.base;
		} else {
			cbase = initialBase;

			toUnmount = initialChildComponent;
			if (toUnmount) {
				cbase = component._component = null;
			}

			if (initialBase || renderMode === 1) {
				if (cbase) cbase._component = null;
				base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, true);
			}
		}

		if (initialBase && base !== initialBase && inst !== initialChildComponent) {
			var baseParent = initialBase.parentNode;
			if (baseParent && base !== baseParent) {
				baseParent.replaceChild(base, initialBase);

				if (!toUnmount) {
					initialBase._component = null;
					recollectNodeTree(initialBase, false);
				}
			}
		}

		if (toUnmount) {
			unmountComponent(toUnmount);
		}

		component.base = base;
		if (base && !isChild) {
			var componentRef = component,
			    t = component;
			while (t = t._parentComponent) {
				(componentRef = t).base = base;
			}
			base._component = componentRef;
			base._componentConstructor = componentRef.constructor;
		}
	}

	if (!isUpdate || mountAll) {
		mounts.push(component);
	} else if (!skip) {

		if (component.componentDidUpdate) {
			component.componentDidUpdate(previousProps, previousState, snapshot);
		}
		if (options.afterUpdate) options.afterUpdate(component);
	}

	while (component._renderCallbacks.length) {
		component._renderCallbacks.pop().call(component);
	}if (!diffLevel && !isChild) flushMounts();
}

function buildComponentFromVNode(dom, vnode, context, mountAll) {
	var c = dom && dom._component,
	    originalComponent = c,
	    oldDom = dom,
	    isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
	    isOwner = isDirectOwner,
	    props = getNodeProps(vnode);
	while (c && !isOwner && (c = c._parentComponent)) {
		isOwner = c.constructor === vnode.nodeName;
	}

	if (c && isOwner && (!mountAll || c._component)) {
		setComponentProps(c, props, 3, context, mountAll);
		dom = c.base;
	} else {
		if (originalComponent && !isDirectOwner) {
			unmountComponent(originalComponent);
			dom = oldDom = null;
		}

		c = createComponent(vnode.nodeName, props, context);
		if (dom && !c.nextBase) {
			c.nextBase = dom;

			oldDom = null;
		}
		setComponentProps(c, props, 1, context, mountAll);
		dom = c.base;

		if (oldDom && dom !== oldDom) {
			oldDom._component = null;
			recollectNodeTree(oldDom, false);
		}
	}

	return dom;
}

function unmountComponent(component) {
	if (options.beforeUnmount) options.beforeUnmount(component);

	var base = component.base;

	component._disable = true;

	if (component.componentWillUnmount) component.componentWillUnmount();

	component.base = null;

	var inner = component._component;
	if (inner) {
		unmountComponent(inner);
	} else if (base) {
		if (base['__preactattr_'] != null) applyRef(base['__preactattr_'].ref, null);

		component.nextBase = base;

		removeNode(base);
		recyclerComponents.push(component);

		removeChildren(base);
	}

	applyRef(component.__ref, null);
}

function Component(props, context) {
	this._dirty = true;

	this.context = context;

	this.props = props;

	this.state = this.state || {};

	this._renderCallbacks = [];
}

extend(Component.prototype, {
	setState: function setState(state, callback) {
		if (!this.prevState) this.prevState = this.state;
		this.state = extend(extend({}, this.state), typeof state === 'function' ? state(this.state, this.props) : state);
		if (callback) this._renderCallbacks.push(callback);
		enqueueRender(this);
	},
	forceUpdate: function forceUpdate(callback) {
		if (callback) this._renderCallbacks.push(callback);
		renderComponent(this, 2);
	},
	render: function render() {}
});

function render(vnode, parent, merge) {
  return diff(merge, vnode, {}, false, parent, false);
}

function createRef() {
	return {};
}

var preact = {
	h: h,
	createElement: h,
	cloneElement: cloneElement,
	createRef: createRef,
	Component: Component,
	render: render,
	rerender: rerender,
	options: options
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (preact);

//# sourceMappingURL=preact.mjs.map


/***/ }),
/* 54 */
/***/ (() => {

const ONCE = { once: true };

let queryParamTime = AFRAME.utils.getUrlParameter('time').trim();
if (!queryParamTime || isNaN(queryParamTime)) {
  queryParamTime = undefined;
} else {
  queryParamTime = parseFloat(queryParamTime);
}

/**
 * Update the 2D UI. Handle pause and seek.
 */
AFRAME.registerComponent('song-controls', {
  dependencies: ['song'],

  schema: {
    difficulty: { default: '' },
    songName: { default: '' },
    songSubName: { default: '' },
    songImage: { default: '' },
    isPlaying: { default: false }
  },

  init: function () {
    this.song = this.el.components.song;
    this.tick = AFRAME.utils.throttleTick(this.tick.bind(this), 100);

    // Seek to ?time if specified.
    if (queryParamTime !== undefined) {
      this.el.sceneEl.addEventListener('songstartaudio', () => {
        setTimeout(() => {
          this.seek(queryParamTime);
        }, 100);
      }, ONCE);
    }

    const analyser = document.getElementById('audioAnalyser');
    analyser.addEventListener('audioanalyserbuffersource', evt => {
      document.getElementById('songDuration').innerHTML = formatSeconds(evt.detail.buffer.duration);
    });

    this.songProgress = document.getElementById('songProgress');
  },

  update: function () {
    if (!this.controls) {
      return;
    }

    if (this.data.isPlaying) {
      document.body.classList.add('isPlaying');
    } else {
      document.body.classList.remove('isPlaying');
    }

    document.getElementById('songImage').src = this.data.songImage;
    document.getElementById('songName').innerHTML = truncate(this.data.songName, 15);
    document.getElementById('songName').setAttribute('title', this.data.songName);
    document.getElementById('songSubName').innerHTML = truncate(this.data.songSubName, 18);
    document.getElementById('songSubName').setAttribute('title', this.data.songSubName);
    document.getElementById('controlsDifficulty').innerHTML = this.data.difficulty;
  },

  play: function () {
    this.controls = document.getElementById('controls');
    this.difficulty = document.getElementById('controlsDifficulty');
    this.difficultyOptions = document.getElementById('controlsDifficultyOptions');
    this.playhead = document.getElementById('playhead');
    const timeline = this.timeline = document.getElementById('timeline');
    const timelineHover = this.timelineHover = document.getElementById('timelineHover');

    const timelineWidth = timeline.offsetWidth;

    this.el.sceneEl.addEventListener('challengeloadend', evt => {
      // Show controls on load.
      this.controls.classList.add('challengeLoaded');

      // Update difficulty list.
      for (let i = 0; i < this.difficultyOptions.children.length; i++) {
        this.difficultyOptions.children[i].style.display = 'none';
      }
      evt.detail.info.difficultyLevels.forEach(difficulty => {
        const option = this.difficultyOptions.querySelector(`[data-difficulty="${difficulty._difficulty}"]`);
        option.style.display = 'inline-block';
      });
    });

    // Seek.
    timeline.addEventListener('click', event => {
      if (!this.song.source) {
        return;
      }

      const marginLeft = event.clientX - timeline.getBoundingClientRect().left;
      const percent = marginLeft / timeline.getBoundingClientRect().width;

      // Get new audio buffer source (needed every time audio is stopped).
      // Start audio at seek time.
      const time = percent * this.song.source.buffer.duration;
      this.seek(time);
      setTimeQueryParam(time);
    });

    // Seek hover.
    timeline.addEventListener('mouseenter', evt => {
      if (!this.song.source) {
        return;
      }
      timelineHover.classList.add('timelineHoverActive');
    });
    timeline.addEventListener('mousemove', evt => {
      const marginLeft = evt.clientX - timeline.getBoundingClientRect().left;
      const percent = marginLeft / timeline.getBoundingClientRect().width;
      timelineHover.style.left = marginLeft - 17 + 'px';
      timelineHover.innerHTML = formatSeconds(percent * this.song.source.buffer.duration);
    });
    timeline.addEventListener('mouseleave', evt => {
      timelineHover.classList.remove('timelineHoverActive');
    });

    // Pause.
    document.getElementById('controlsPause').addEventListener('click', () => {
      this.el.sceneEl.emit('pausegame', null, false);
    });

    // Difficulty dropdown.
    this.difficulty.addEventListener('click', () => {
      this.controls.classList.toggle('difficultyOptionsActive');
    });
    this.el.sceneEl.addEventListener('click', evt => {
      this.controls.classList.remove('difficultyOptionsActive');
    });

    // Difficulty select.
    this.difficultyOptions.addEventListener('click', evt => {
      this.songProgress.innerHTML = formatSeconds(0);
      this.playhead.style.width = '0%';
      this.el.sceneEl.emit('difficultyselect', evt.target.dataset.difficulty, false);
      this.controls.classList.remove('difficultyOptionsActive');
    });

    // Hide volume if click anywhere.
    document.addEventListener('click', evt => {
      if (evt.target.closest('#volumeSliderContainer') || evt.target.closest('#controlsVolume')) {
        return;
      }
      const slider = document.getElementById('volumeSliderContainer');
      const active = slider.classList.contains('volumeActive');
      if (!active) {
        return;
      }
      slider.classList.remove('volumeActive');
    });

    // Toggle volume slider.
    document.getElementById('controlsVolume').addEventListener('click', evt => {
      document.getElementById('volumeSliderContainer').classList.toggle('volumeActive');
    });

    // Update volume.
    document.getElementById('volumeSlider').addEventListener('change', evt => {
      this.song.audioAnalyser.gainNode.gain.cancelScheduledValues(0);
      this.song.audioAnalyser.gainNode.gain.value = evt.target.value;
      document.getElementById('beatContainer').components['beat-hit-sound'].setVolume(evt.target.value);
    });
  },

  tick: function () {
    if (!this.song.isPlaying || !this.song.source) {
      return;
    }
    this.updatePlayhead();
    this.songProgress.innerHTML = formatSeconds(this.song.getCurrentTime());
  },

  seek: function (time) {
    if (this.data.isPlaying) {
      this.song.stopAudio();
    }

    // Get new audio buffer source (needed every time audio is stopped).
    this.song.data.analyserEl.addEventListener('audioanalyserbuffersource', evt => {
      // Start audio at seek time.
      const source = this.song.source = evt.detail;

      this.song.startAudio(time);

      // Tell beat generator about seek.
      this.el.components['beat-generator'].seek(time);

      this.updatePlayhead();
    }, ONCE);

    this.song.audioAnalyser.refreshSource();
  },

  updatePlayhead: function () {
    const progress = Math.max(0, Math.min(100, 100 * (this.song.getCurrentTime() / this.song.source.buffer.duration)));
    this.playhead.style.width = progress + '%';
  }
});

function truncate(str, length) {
  if (!str) {
    return '';
  }
  if (str.length >= length) {
    return str.substring(0, length - 2) + '..';
  }
  return str;
}

const timeRe = /time=\d+/;
function setTimeQueryParam(time) {
  time = parseInt(time);
  let search = window.location.search.toString();
  if (search) {
    if (search.match(timeRe)) {
      search = search.replace(timeRe, `time=${time}`);
    } else {
      search += `&time=${time}`;
    }
  } else {
    search = `?time=${time}`;
  }

  let url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  url += search;
  window.history.pushState({ path: url }, '', url);
}

function formatSeconds(time) {
  // Hours, minutes, and seconds.
  const hrs = ~~(time / 3600);
  const mins = ~~(time % 3600 / 60);
  const secs = ~~time % 60;

  // Output like '1:01' or '4:03:59' or '123:03:59'.
  let ret = '';
  if (hrs > 0) {
    ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
  }
  ret += '' + mins + ':' + (secs < 10 ? '0' : '');
  ret += '' + secs;
  return ret;
}

/***/ }),
/* 55 */
/***/ (() => {

AFRAME.registerComponent('song-progress-ring', {
  dependencies: ['geometry', 'material'],

  schema: {
    enabled: { default: false }
  },

  init: function () {
    this.tick = AFRAME.utils.throttleTick(this.tick.bind(this), 1000);

    this.progress = this.el.getObject3D('mesh').material.uniforms.progress;
    this.el.sceneEl.addEventListener('cleargame', () => {
      this.progress.value = 0;
    });
  },

  update: function (oldData) {
    this.progress.value = 0;
  },

  updateRing: function () {
    const source = this.el.sceneEl.components.song.source;
    if (!source) {
      return;
    }

    const progress = this.el.sceneEl.components.song.getCurrentTime() / source.buffer.duration;
    this.progress.value = progress;
  },

  tick: function () {
    if (!this.data.enabled) {
      return;
    }
    this.updateRing();
  }
});

/***/ }),
/* 56 */
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const utils = __webpack_require__(23);

const GAME_OVER_LENGTH = 3.5;
const ONCE = { once: true };

let skipDebug = AFRAME.utils.getUrlParameter('skip');
if (!!skipDebug) {
  skipDebug = parseInt(skipDebug) / 1000;
} else {
  skipDebug = 0;
}

/**
 * Active challenge song / audio.
 *
 * Order of song init in conjuction with beat-generator:
 *
 * 1. previewStartTime is playing
 * 2. songloadfinish
 * 3. beat-generator preloading
 * 4. preloaded beats generated
 * 5. beat-generator preloading finish
 * 6. startAudio / songStartTime is set
 * 7. beat-generator continues off song current time
 */
AFRAME.registerComponent('song', {
  schema: {
    audio: { default: '' },
    analyserEl: { type: 'selector', default: '#audioAnalyser' },
    difficulty: { default: '' },
    hasReceivedUserGesture: { default: false },
    isBeatsPreloaded: { default: false },
    isPaused: { default: false },
    isPlaying: { default: false }
  },

  init: function () {
    this.analyserSetter = { buffer: true };
    this.audioAnalyser = this.data.analyserEl.components.audioanalyser;
    this.context = this.audioAnalyser.context;
    this.isPlaying = false;
    this.songLoadingIndicator = document.getElementById('songLoadingIndicator');
    this.songStartTime = 0;

    this.audioAnalyser.gainNode.gain.value = document.getElementById('volumeSlider').value || 0.35;

    this.el.addEventListener('gamemenurestart', this.onRestart.bind(this));
  },

  update: function (oldData) {
    const data = this.data;

    if (!this.el.sceneEl.isPlaying) {
      return;
    }

    // Resume.
    if (oldData.isPaused && !data.isPaused) {
      if (navigator.userAgent.indexOf('Chrome') !== -1) {
        this.source.playbackRate.value = 1;
      } else {
        this.audioAnalyser.resumeContext();
      }
      this.isPlaying = true;
    }

    // Difficulty select
    if (oldData.difficulty && oldData.difficulty !== data.difficulty) {
      this.onRestart();
    }

    // Play if we have loaded and were waiting for beats to preload.
    if (!oldData.isBeatsPreloaded && this.data.isBeatsPreloaded && this.source) {
      this.startAudio();
    }

    // New challenge, load audio and play when ready.
    if (oldData.audio !== data.audio && data.audio) {
      this.el.sceneEl.emit('songprocessingstart', null, false);
      this.getAudio().then(source => {
        this.el.sceneEl.emit('songprocessingfinish', null, false);
      }).catch(console.error);
    }

    // Pause / stop.
    if (!oldData.isPaused && data.isPaused) {
      if (navigator.userAgent.indexOf('Chrome') !== -1) {
        // Stupid Chrome audio policies. Can't resume.
        this.source.playbackRate.value = 0.000000001;
      } else {
        this.audioAnalyser.suspendContext();
      }
      this.isPlaying = false;
    }
  },

  pause: function () {
    if (this.data.isPlaying) {
      this.audioAnalyser.suspendContext();
    }
  },

  play: function () {
    if (this.data.isPlaying) {
      this.audioAnalyser.resumeContext();
    }
  },

  getAudio: function () {
    const data = this.data;

    this.isPlaying = false;
    return new Promise(resolve => {
      data.analyserEl.addEventListener('audioanalyserbuffersource', evt => {
        // Finished decoding.
        this.source = evt.detail;
        resolve(this.source);
      }, ONCE);
      this.analyserSetter.src = this.data.audio;
      data.analyserEl.setAttribute('audioanalyser', this.analyserSetter);
    });
  },

  stopAudio: function () {
    if (!this.source) {
      console.warn('[song] Tried to stopAudio, but not playing.');
      return;
    }
    this.source.stop();
    this.source.disconnect();
    this.source = null;
    this.isPlaying = false;
  },

  onRestart: function () {
    this.isPlaying = false;

    // Restart, get new buffer source node and play.
    if (this.source) {
      this.source.disconnect();
    }

    // Clear gain interpolation values from game over.
    const gain = this.audioAnalyser.gainNode.gain;
    gain.cancelScheduledValues(0);

    this.el.sceneEl.emit('songprocessingstart', null, false);
    this.data.analyserEl.addEventListener('audioanalyserbuffersource', evt => {
      this.source = evt.detail;
      this.el.sceneEl.emit('songprocessingfinish', null, false);
      if (this.data.isPlaying && this.data.isBeatsPreloaded) {
        this.startAudio();
      }
    }, ONCE);
    this.audioAnalyser.refreshSource();
  },

  startAudio: function (time) {
    const playTime = time || skipDebug || 0;
    this.songStartTime = this.context.currentTime - playTime;
    this.source.start(0, playTime);
    this.isPlaying = true;
    this.el.emit('songstartaudio');
  },

  getCurrentTime: function () {
    return this.context.currentTime - this.songStartTime;
  }
});

/***/ }),
/* 57 */
/***/ (() => {

function $(id) {
  return document.getElementById(id);
};

AFRAME.registerComponent('stage-colors', {
  dependencies: ['background'],

  schema: {
    color: { default: 'blue', oneOf: ['blue', 'red'] }
  },

  init: function () {
    this.colorCodes = ['off', 'blue', 'blue', 'bluefade', '', 'red', 'red', 'redfade'];
    this.el.addEventListener('cleargame', this.resetColors.bind(this));
  },

  setColor: function (target, code) {
    this.el.emit(`${target}color${this.colorCodes[code]}`, null, false);
  },

  resetColors: function () {
    this.el.emit('bgcolorblue', null, false);
    this.el.emit('tunnelcolorred', null, false);
    this.el.emit('floorcolorred', null, false);
    this.el.emit('leftlasercolorblue', null, false);
    this.el.emit('rightlasercolorblue', null, false);
  }
});

/***/ }),
/* 58 */
/***/ (() => {

AFRAME.registerComponent('stage-lasers', {
  schema: {
    enabled: { default: true }
  },

  init: function () {
    this.speed = 0;
    this.lasers = [this.el.children[0].object3D, this.el.children[1].object3D, this.el.children[2].object3D];
  },

  pulse: function (speed) {
    this.speed = speed / 8;
  },

  tick: function (time, delta) {
    if (this.speed === 0) {
      return;
    }
    delta /= 1000;
    if (!this.data.enabled) {
      this.speed *= 0.97;
      if (Math.abs(this.speed) < 0.01) {
        this.speed = 0;
        return;
      }
    }
    this.lasers[0].rotation.z += this.speed * delta;
    this.lasers[1].rotation.z -= this.speed * delta * 1.01;
    this.lasers[2].rotation.z += this.speed * delta * 1.02;
  }
});

/***/ }),
/* 59 */
/***/ (() => {

AFRAME.registerShader('stageShader', {
  schema: {
    color: { type: 'vec3', is: 'uniform', default: { x: 0, y: 0, z: 0 } },
    fogColor: { type: 'vec3', is: 'uniform', default: { x: 0, y: 0.48, z: 0.72 } },
    src: { type: 'map', is: 'uniform' }

  },

  vertexShader: `
    varying vec2 uvs;
    varying vec3 worldPos;
    void main() {
      uvs.xy = uv.xy;
      vec4 p = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      worldPos = (modelMatrix * vec4( position, 1.0 )).xyz;
      gl_Position = p;
    }
  `,

  fragmentShader: `
    #define FOG_RADIUS  50.0
    #define FOG_FALLOFF 45.0
    varying vec2 uvs;
    varying vec3 worldPos;
    uniform vec3 color;
    uniform vec3 fogColor;
    uniform sampler2D src;

    void main() {
      vec4 col = texture2D(src, uvs);
      col.xyz = mix(fogColor, col.xyz, clamp(distance(worldPos, vec3(0., 0., -FOG_RADIUS)) / FOG_FALLOFF, 0., 1.));
      gl_FragColor = col;
    }
  `
});

/***/ }),
/* 60 */
/***/ (() => {

AFRAME.registerComponent('stats-param', {
  init: function () {
    if (AFRAME.utils.getUrlParameter('stats') === 'true') {
      this.el.setAttribute('stats', '');
    }
  }
});

/***/ }),
/* 61 */
/***/ (() => {

/**
 * Pull a submesh out of a model file.
 */
AFRAME.registerComponent('sub-object', {
  schema: {
    from: { type: 'selector' },
    name: { type: 'string' }
  },

  init: function () {
    var el = this.el;
    var data = this.data;

    data.from.addEventListener('model-loaded', evt => {
      const model = evt.detail.model;
      const subset = model.getObjectByName(data.name);
      el.setObject3D('mesh', subset.clone());
      el.setAttribute('material', 'shader', 'flat');
      el.emit('subobjectloaded', null, false);
    });
  }
});

/***/ }),
/* 62 */
/***/ (() => {

/* global AFRAME */
var KEYBOARDS = {
  supersaber: { wrapCount: 20, inputOffsetY: 0.008, inputOffsetX: 0.08, img: 'keyboard.png', hoverImg: 'keyboard-hover.png', layout: [{ "key": "1", "x": 0.014, "y": 0.024, "w": 0.094, "h": 0.183 }, { "key": "2", "x": 0.108, "y": 0.024, "w": 0.094, "h": 0.183 }, { "key": "3", "x": 0.203, "y": 0.024, "w": 0.095, "h": 0.183 }, { "key": "4", "x": 0.299, "y": 0.024, "w": 0.094, "h": 0.183 }, { "key": "5", "x": 0.394, "y": 0.024, "w": 0.093, "h": 0.183 }, { "key": "6", "x": 0.487, "y": 0.024, "w": 0.095, "h": 0.183 }, { "key": "7", "x": 0.583, "y": 0.024, "w": 0.093, "h": 0.183 }, { "key": "8", "x": 0.677, "y": 0.024, "w": 0.095, "h": 0.183 }, { "key": "9", "x": 0.772, "y": 0.024, "w": 0.093, "h": 0.183 }, { "key": "0", "x": 0.866, "y": 0.024, "w": 0.093, "h": 0.183 }, { "key": "q", "x": 0.014, "y": 0.215, "w": 0.094, "h": 0.183 }, { "key": "w", "x": 0.108, "y": 0.215, "w": 0.094, "h": 0.183 }, { "key": "e", "x": 0.203, "y": 0.215, "w": 0.095, "h": 0.183 }, { "key": "r", "x": 0.299, "y": 0.215, "w": 0.094, "h": 0.183 }, { "key": "t", "x": 0.394, "y": 0.215, "w": 0.093, "h": 0.183 }, { "key": "y", "x": 0.487, "y": 0.215, "w": 0.095, "h": 0.183 }, { "key": "i", "x": 0.677, "y": 0.215, "w": 0.095, "h": 0.183 }, { "key": "u", "x": 0.583, "y": 0.215, "w": 0.093, "h": 0.183 }, { "key": "o", "x": 0.772, "y": 0.215, "w": 0.093, "h": 0.183 }, { "key": "p", "x": 0.866, "y": 0.215, "w": 0.093, "h": 0.183 }, { "key": "a", "x": 0.063, "y": 0.405, "w": 0.094, "h": 0.183 }, { "key": "s", "x": 0.158, "y": 0.405, "w": 0.094, "h": 0.183 }, { "key": "d", "x": 0.253, "y": 0.405, "w": 0.095, "h": 0.183 }, { "key": "f", "x": 0.349, "y": 0.405, "w": 0.094, "h": 0.183 }, { "key": "g", "x": 0.443, "y": 0.405, "w": 0.093, "h": 0.183 }, { "key": "h", "x": 0.537, "y": 0.405, "w": 0.095, "h": 0.183 }, { "key": "j", "x": 0.633, "y": 0.405, "w": 0.092, "h": 0.183 }, { "key": "k", "x": 0.726, "y": 0.405, "w": 0.095, "h": 0.183 }, { "key": "l", "x": 0.821, "y": 0.405, "w": 0.093, "h": 0.183 }, { "key": "z", "x": 0.111, "y": 0.598, "w": 0.093, "h": 0.181 }, { "key": "x", "x": 0.205, "y": 0.598, "w": 0.095, "h": 0.181 }, { "key": "c", "x": 0.301, "y": 0.598, "w": 0.095, "h": 0.181 }, { "key": "v", "x": 0.396, "y": 0.598, "w": 0.093, "h": 0.181 }, { "key": "b", "x": 0.49, "y": 0.598, "w": 0.094, "h": 0.181 }, { "key": "n", "x": 0.585, "y": 0.598, "w": 0.094, "h": 0.181 }, { "key": "m", "x": 0.68, "y": 0.598, "w": 0.093, "h": 0.181 }, { "key": "Delete", "x": 0.777, "y": 0.598, "w": 0.137, "h": 0.181 }, { "key": " ", "x": 0.297, "y": 0.788, "w": 0.381, "h": 0.201 }, { "key": "Escape", "x": 0.013, "y": 0.797, "w": 0.137, "h": 0.181 }, { "key": "Insert", "x": 0.014, "y": -0.001, "w": 0.01, "h": 0.005 }] }
};

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

var FontFactors = {
  roboto: 17,
  aileronsemibold: 20,
  dejavu: 20.5,
  exo2bold: 20,
  exo2semibold: 20.3,
  kelsonsans: 22.8,
  monoid: 19.5,
  mozillavr: 9.5,
  sourcecodepro: 20.3
};

AFRAME.registerComponent('super-keyboard', {
  schema: {
    align: { default: 'left', oneOf: ['left', 'center', 'right'] },
    blinkingSpeed: { type: 'int', default: 400 },
    filters: { type: 'array' },
    // roboto aileronsemibold dejavu exo2bold exo2semibold kelsonsans monoid sourcecodepro
    font: { default: 'aileronsemibold' },
    hand: { type: 'selector' },
    imagePath: { default: '.' },
    injectToRaycasterObjects: { default: true },
    inputColor: { type: 'color', default: '#6699ff' },
    interval: { type: 'int', default: 50 },
    keyBgColor: { type: 'color', default: '#000' },
    keyColor: { type: 'color', default: '#6699ff' },
    keyHoverColor: { type: 'color', default: '#1A407F' },
    keyPressColor: { type: 'color', default: '#5290F6' },
    label: { type: 'string', default: '' },
    labelColor: { type: 'color', default: '#aaa' },
    maxLength: { type: 'int', default: 0 },
    model: { default: 'basic' },
    show: { default: true },
    value: { type: 'string', default: '' },
    width: { default: 0.8 }
  },

  init: function () {
    this.el.addEventListener('click', this.click.bind(this));
    this.changeEventDetail = {};
    this.textInputObject = {};

    this.keys = null;
    this.focused = false;
    this.keyHover = null;
    this.prevCheckTime = null;
    this.shift = false;

    this.rawValue = this.data.value;
    this.defaultValue = this.data.value;

    this.userFilterFunc = null;
    this.intervalId = 0;

    // Create keyboard image.
    this.kbImg = document.createElement('a-entity');
    this.kbImg.classList.add('keyboardRaycastable');
    this.kbImg.classList.add('superKeyboardImage');
    this.kbImg.addEventListener('raycaster-intersected', this.hover.bind(this));
    this.kbImg.addEventListener('raycaster-intersected-cleared', this.blur.bind(this));
    this.el.appendChild(this.kbImg);

    // Create label.
    this.label = document.createElement('a-entity');
    this.label.setAttribute('text', {
      align: 'center',
      font: this.data.font,
      baseline: 'bottom',
      lineHeight: 40,
      shader: 'msdf',
      negate: true,
      value: this.data.label,
      color: this.data.labelColor,
      width: this.data.width,
      wrapCount: 30 });
    this.el.appendChild(this.label);

    // Create input.
    this.textInput = document.createElement('a-entity');
    this.textInput.setAttribute('mixin', 'superKeyboardTextInput');
    this.textInput.setAttribute('text', {
      align: this.data.align,
      font: this.data.font,
      lineHeight: 35,
      value: this.data.value,
      color: this.data.inputColor,
      width: this.data.width,
      wrapCount: 20
    });
    this.el.appendChild(this.textInput);

    this.cursor = document.createElement('a-entity');
    this.cursor.object3D.position.set(0, 0, 0.001);
    this.cursor.setAttribute('material', { shader: 'flat', color: this.data.inputColor });
    this.textInput.appendChild(this.cursor);
    this.cursorUpdated = false;

    this.keyBgColor = new THREE.Color();
    this.keyHoverColor = new THREE.Color();
    this.keyPressColor = new THREE.Color();

    var self = this;
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 't') {
        var ss = '';
        var s = 'abcdefghijklmopqrstuvQWIEUTGASDLIGKBXACQWETL102394676457';
        var l = Math.floor(Math.random() * 20);
        for (var i = 0; i < l; i++) ss += s[Math.floor(Math.random() * s.length)];
        self.el.setAttribute('super-keyboard', { value: ss });
      }
    });

    document.addEventListener('show', this.open.bind(this));

    this.hand = null;
    this.handListenersSet = false;
    this.raycaster = null;
  },

  update: function (oldData) {
    var kbdata = KEYBOARDS[this.data.model];
    var w = this.data.width;
    var h = this.data.width / 2;
    var w2 = w / 2;
    var h2 = h / 2;

    if (kbdata === undefined) {
      console.error('super-keyboard ERROR: model "' + this.data.model + '" undefined.');
      return;
    }

    if (!oldData || this.defaultValue !== oldData.defaultValue) {
      this.rawValue = this.data.value;
      this.defaultValue = this.data.value;
      this.updateTextInput(this.filter(this.data.value));
    } else {
      this.updateTextInput(this.filter(this.rawValue));
    }

    if (this.data.width !== oldData.width || this.data.height !== oldData.height || this.data.keyColor !== oldData.keyColor) {
      this.kbImg.setAttribute('geometry', { primitive: 'plane', width: w, height: h });
      this.kbImg.setAttribute('material', {
        shader: 'flat',
        src: this.data.imagePath + '/' + kbdata.img,
        color: this.data.keyColor,
        transparent: true
      });
    }

    if (this.data.label !== oldData.label || this.data.labelColor !== oldData.labelColor || this.data.width !== oldData.width) {
      this.label.setAttribute('text', {
        value: this.data.label, color: this.data.labelColor, width: this.data.width });
      this.label.object3D.position.set(0, 0.35 * w, -0.02);
    }

    if (this.data.width !== oldData.width || this.data.keyBgColor !== oldData.keyBgColor) {
      this.initKeyColorPlane();
    }

    var inputx = this.data.align !== 'center' ? kbdata.inputOffsetX * w : 0;
    if (this.data.align === 'right') {
      inputx *= -1;
    }

    if (this.data.font !== oldData.font || this.data.inputColor !== oldData.inputColor || this.data.width !== oldData.width || this.data.align !== oldData.align) {
      this.textInput.setAttribute('text', {
        font: this.data.font,
        color: this.data.inputColor,
        width: w,
        wrapCount: kbdata.wrapCount,
        align: this.data.align
      });
    }

    // Some hack where the inputRect is stored in the Insert key.
    for (var i = 0; i < kbdata.layout.length; i++) {
      var kdata = kbdata.layout[i];
      if (kdata.key === 'Insert') {
        this.inputRect = kdata;
      }
    }

    this.textInput.object3D.position.set(inputx, w / 4 - (this.inputRect.y + this.inputRect.h / 2) * w / 2 + kbdata.inputOffsetY * w, 0.002);

    if (this.data.width !== oldData.width) {
      this.cursor.setAttribute('geometry', {
        primitive: 'plane', width: 0.03 * w, height: 0.01 * w });
    }

    this.updateCursorPosition();
    this.setupHand();

    this.keyBgColor.set(this.data.keyBgColor);
    this.keyHoverColor.set(this.data.keyHoverColor);
    this.keyPressColor.set(this.data.keyPressColor);

    if (this.data.show) {
      this.open();
    } else {
      this.close();
    }
  },

  tick: function (time) {
    var intersection;

    if (this.prevCheckTime && time - this.prevCheckTime < this.data.interval) {
      return;
    }
    if (!this.prevCheckTime) {
      this.prevCheckTime = time;
      return;
    }

    if (!this.raycaster) {
      return;
    }
    if (!this.focused) {
      return;
    }

    intersection = this.raycaster.getIntersection(this.kbImg);
    if (!intersection) {
      return;
    }

    var uv = intersection.uv;
    var keys = KEYBOARDS[this.data.model].layout;
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (uv.x > k.x && uv.x < k.x + k.w && 1.0 - uv.y > k.y && 1.0 - uv.y < k.y + k.h) {
        if (this.keyHover !== k) {
          // Update key hover.
          this.keyHover = k;
          this.updateKeyColorPlane(this.keyHover.key, this.keyHoverColor);
        }
        break;
      }
    }
  },

  play: function () {
    if (!this.cursorUpdated) {
      return;
    }
    this.startBlinking();
  },

  pause: function () {
    this.stopBlinking();
  },

  /**
   * The plane for visual feedback when a key is hovered or clicked
   */
  initKeyColorPlane: function () {
    var kbdata = KEYBOARDS[this.data.model];
    var keyColorPlane = this.keyColorPlane = document.createElement('a-entity');
    keyColorPlane.classList.add('superKeyboardKeyColorPlane');
    keyColorPlane.object3D.position.z = 0.001;
    keyColorPlane.object3D.visible = false;
    keyColorPlane.setAttribute('geometry', { primitive: 'plane', buffer: false });
    keyColorPlane.setAttribute('material', { shader: 'flat', color: this.data.keyBgColor,
      transparent: true });
    if (kbdata.hoverImg) {
      keyColorPlane.setAttribute('material', { src: this.data.imagePath + '/' + kbdata.hoverImg });
    }

    keyColorPlane.addEventListener('componentinitialized', function (evt) {
      if (evt.detail.name !== 'material') {
        return;
      }
      if (!kbdata.hoverImg) {
        this.getObject3D('mesh').material.blending = THREE.AdditiveBlending;
      }
    });
    this.el.appendChild(keyColorPlane);
  },

  /**
   * Move key color plane to appropriate position, scale, and change color.
   */
  updateKeyColorPlane: function (key, color) {
    var kbdata = KEYBOARDS[this.data.model];
    var keyColorPlane = this.keyColorPlane;

    // Unset.
    if (!key) {
      keyColorPlane.object3D.visible = false;
      return;
    }

    for (var i = 0; i < kbdata.layout.length; i++) {
      var kdata = kbdata.layout[i];
      if (kdata.key !== key) {
        continue;
      }
      var w = this.data.width;
      var h = this.data.width / 2;
      var w2 = w / 2;
      var h2 = h / 2;
      var keyw = kdata.w * w;
      var keyh = kdata.h * h;
      // Size.
      keyColorPlane.object3D.scale.x = keyw;
      keyColorPlane.object3D.scale.y = keyh;
      // Position.
      keyColorPlane.object3D.position.x = kdata.x * w - w2 + keyw / 2;
      keyColorPlane.object3D.position.y = (1 - kdata.y) * h - h2 - keyh / 2;
      // Color.
      keyColorPlane.getObject3D('mesh').material.color.copy(color);
      // UVs.

      var geometry = keyColorPlane.getObject3D('mesh').geometry;
      var uvSet = geometry.faceVertexUvs[0];
      var kdataY = 1 - kdata.y;
      uvSet[0][0].set(kdata.x, kdataY);
      uvSet[0][1].set(kdata.x, kdataY - kdata.h);
      uvSet[0][2].set(kdata.x + kdata.w, kdataY);
      uvSet[1][0].set(kdata.x, kdataY - kdata.h);
      uvSet[1][1].set(kdata.x + kdata.w, kdataY - kdata.h);
      uvSet[1][2].set(kdata.x + kdata.w, kdataY);
      geometry.uvsNeedUpdate = true;
      break;
    }
    keyColorPlane.object3D.visible = true;
  },

  setupHand: function () {
    if (this.hand && this.hand.ownRaycaster) {
      this.hand.removeAttribute('raycaster');
    }
    if (this.data.hand) {
      this.hand = this.data.hand;
    } else {
      this.hand = document.querySelector(['[cursor]', '[vive-controls]', '[tracked-controls]', '[oculus-touch-controls]', '[windows-motion-controls]', '[hand-controls]', '[daydream-controls] [cursor] > [raycaster]'].join(','));
    }

    if (!this.hand) {
      console.error('super-keyboard: no controller found. Add <a-entity> with controller or specify with super-keyboard="hand: #selectorToController".');
    } else {
      if (!this.hand.hasLoaded) {
        this.hand.addEventListener('loaded', this.setupHand.bind(this));
        return;
      }
      var raycaster = this.hand.components['raycaster'];
      var params = {};

      if (!raycaster) {
        this.hand.ownRaycaster = true;
        params.showLine = this.data.show;
        params.enabled = this.data.show;
        if (this.data.injectToRaycasterObjects) {
          params.objects = '.keyboardRaycastable';
        }
        this.hand.setAttribute('raycaster', params);
      } else {
        this.hand.ownRaycaster = false;
        if (this.data.injectToRaycasterObjects) {
          var objs = raycaster.data.objects.split(',');
          if (objs.indexOf('.keyboardRaycastable') === -1) {
            objs.push('.keyboardRaycastable');
          }
          params.objects = objs.join(',').replace(/^,/, '');
          this.hand.setAttribute('raycaster', params);
        }
      }

      this.raycaster = this.hand.components.raycaster;
    }
  },

  filter: function (str) {
    if (str === '') {
      return '';
    }
    for (var i = 0; i < this.data.filters.length; i++) {
      switch (this.data.filters[i]) {
        case 'custom':
          {
            if (this.userFilterFunc) str = this.userFilterFunc(str);
            break;
          }
        case 'allupper':
          {
            str = str.toUpperCase();
            break;
          }
        case 'alllower':
          {
            str = str.toLowerCase();
            break;
          }
        case 'title':
          {
            str = str.split(' ').map(function (s) {
              return s[0].toUpperCase() + s.substr(1);
            }).join(' ');
            break;
          }
        case 'numbers':
          {
            str = str.split('').filter(function (c) {
              return !isNaN(parseInt(c)) || c === '.';
            }).join('');
            break;
          }
        case 'first':
          {
            str = str[0].toUpperCase() + str.substr(1);
            break;
          }
        case 'trim':
          {
            str = str.trim();
            break;
          }
      }
    }
    return this.data.maxLength > 0 ? str.substr(0, this.data.maxLength) : str;
  },

  click: function (ev) {
    if (!this.keyHover) {
      return;
    }

    switch (this.keyHover.key) {
      case 'Enter':
        {
          this.accept();
          break;
        }
      case 'Insert':
        {
          return;
        }
      case 'Delete':
        {
          this.rawValue = this.rawValue.substr(0, this.rawValue.length - 1);
          var newValue = this.filter(this.rawValue);
          this.el.setAttribute('super-keyboard', 'value', newValue);
          this.updateTextInput(newValue);
          this.changeEventDetail.value = newValue;
          this.el.emit('superkeyboardchange', this.changeEventDetail);
          break;
        }
      case 'Shift':
        {
          this.shift = !this.shift;
          this.keyHover.el.setAttribute('material', 'color', this.shift ? this.data.keyHoverColor : this.data.keyBgColor);
          break;
        }
      case 'Escape':
        {
          this.dismiss();
          break;
        }
      default:
        {
          if (this.data.maxLength > 0 && this.rawValue.length > this.data.maxLength) {
            break;
          }
          this.rawValue += this.shift ? this.keyHover.key.toUpperCase() : this.keyHover.key;
          var newValue = this.filter(this.rawValue);
          this.el.setAttribute('super-keyboard', 'value', newValue);
          this.updateTextInput(newValue);
          this.changeEventDetail.value = newValue;
          this.el.emit('superkeyboardchange', this.changeEventDetail);
          break;
        }
    }

    this.updateKeyColorPlane(this.keyHover.key, this.keyPressColor);
    var self = this;
    setTimeout(function () {
      self.updateKeyColorPlane(self.keyHover.key, self.keyHoverColor);
    }, 100);
    this.updateCursorPosition();
  },

  open: function () {
    this.el.object3D.visible = true;
    if (this.hand && this.hand.ownRaycaster) {
      this.hand.setAttribute('raycaster', { showLine: true, enabled: true });
    }
  },

  close: function () {
    this.el.object3D.visible = false;
    if (this.hand && this.hand.ownRaycaster) {
      this.hand.setAttribute('raycaster', { showLine: false, enabled: false });
    }
  },

  accept: function () {
    this.el.object3D.visible = false;
    if (this.hand && this.hand.ownRaycaster) {
      this.hand.setAttribute('raycaster', { showLine: false, enabled: false });
    }
    this.el.emit('superkeyboardinput', { value: this.data.value });
    this.data.show = false;
  },

  dismiss: function () {
    this.data.value = this.defaultValue;
    this.updateTextInput();
    this.el.object3D.visible = false;
    if (this.hand && this.hand.ownRaycaster) {
      this.hand.setAttribute('raycaster', { showLine: false, enabled: false });
    }
    this.el.emit('superkeyboarddismiss');
    this.data.show = false;
  },

  blur: function (ev) {
    this.focused = false;
    if (this.keyHover && this.keyHover.key !== 'Shift') {
      this.updateKeyColorPlane(this.keyHover.key, this.keyBgColor);
    }
    this.keyHover = null;
  },

  hover: function (ev) {
    this.focused = true;
  },

  startBlinking: function () {
    this.stopBlinking();
    this.intervalId = window.setInterval(this.blink.bind(this), this.data.blinkingSpeed);
  },

  stopBlinking: function () {
    window.clearInterval(this.intervalId);
    this.intervalId = 0;
  },

  blink: function () {
    this.cursor.object3D.visible = !this.cursor.object3D.visible;
  },

  setCustomFilter: function (f) {
    this.userFilterFunc = f;
  },

  addCustomModel: function (name, model) {
    if (!name) {
      return;
    }
    KEYBOARDS[name] = model;
  },

  updateCursorPosition: function () {
    var font = this.textInput.components.text.currentFont;
    if (!font) {
      var self = this;
      this.cursor.object3D.visible = false;
      window.setTimeout(function () {
        self.updateCursorPosition();
        self.startBlinking();
      }, 700);
      return;
    }

    var w = this.data.width;
    var kbdata = KEYBOARDS[this.data.model];
    var posy = -this.inputRect.h / 2 * w / 2.4 + kbdata.inputOffsetY * w;
    var ratio = this.data.width / this.textInput.components.text.data.wrapCount;
    var pos = 0;
    var fontFactor = FontFactors[this.textInput.components.text.data.font];
    if (fontFactor === undefined) {
      fontFactor = 20;
    }
    for (var i = 0; i < this.data.value.length; i++) {
      var char = findFontChar(font.chars, this.data.value.charCodeAt(i));
      pos += char.width + char.xadvance * (char.id === 32 ? 2 : 1);
    }
    if (this.data.align === 'center') {
      pos = pos * ratio * fontFactor * 0.0011 / 2.0 + 0.02 * w;
    } else if (this.data.align === 'left') {
      pos = pos * ratio * fontFactor * 0.0011 + 0.02 * w;
      pos -= w / 2;
    } else if (this.data.align === 'right') {
      pos = -pos * ratio * fontFactor * 0.0011 - 0.02 * w;
      pos += w / 2;
    }
    this.cursor.object3D.position.set(pos, posy, 0.001);
    this.cursorUpdated = true;
  },

  updateTextInput: function (value) {
    this.textInputObject.value = value || this.data.value;
    this.textInput.setAttribute('text', this.textInputObject);
  }
});

function findFontChar(chars, code) {
  for (var i = 0; i < chars.length; i++) {
    if (chars[i].id === code) {
      return chars[i];
    }
  }
  return null;
}

/***/ }),
/* 63 */
/***/ (() => {

AFRAME.registerComponent('toggle-pause-play', {
  schema: {
    isPlaying: { default: false }
  },

  update: function () {
    const action = this.data.isPlaying ? 'pause' : 'play';
    parent.postMessage(JSON.stringify({ verify: 'game-action', action }), '*');
  }
});

/***/ }),
/* 64 */
/***/ (() => {

const NUM_VALUES_PER_SEGMENT = 75;

AFRAME.registerComponent('twister', {
  schema: {
    enabled: { default: false },
    twist: { default: 0 },
    vertices: { default: 4, type: 'int' },
    count: { default: 12, type: 'int' },
    positionIncrement: { default: 1.4 },
    radiusIncrement: { default: 0.40 },
    thickness: { default: 0.37 }
  },

  init: function () {
    this.currentTwist = 0;
    this.animate = false;
    this.geometry = null;
  },

  pulse: function (twist) {
    if (!this.data.enabled) {
      return;
    }
    if (twist == 0) {
      twist = 0.03 + Math.random() * 0.25;
    } else twist = Math.min(twist * 0.4, 0.4);
    twist *= Math.random() < 0.5 ? -1 : 1; // random direction
    this.el.setAttribute('twister', { twist: twist });
  },

  update: function (oldData) {
    var radius = 6;
    var segments = [];

    if (Math.abs(this.data.twist - this.currentTwist) > 0.001) {
      this.animate = true;
      return;
    }

    this.clear();

    for (var i = 0; i < this.data.count; i++) {
      let segment = this.createSegment(radius);
      segment.translate(0, this.data.positionIncrement * i, 0);
      segments.push(segment);
      radius += this.data.radiusIncrement;
    }
    this.geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(segments);
    var material = this.el.sceneEl.systems.materials.stageNormal;
    var mesh = new THREE.Mesh(this.geometry, material);
    this.el.object3D.add(mesh);
  },

  createSegment: function (radius) {
    const R = this.data.thickness;
    var geometry;
    var points = [new THREE.Vector2(radius - R, R), new THREE.Vector2(radius - R, -R), new THREE.Vector2(radius + R, -R), new THREE.Vector2(radius + R, R), new THREE.Vector2(radius - R, R)];
    geometry = new THREE.LatheBufferGeometry(points, this.data.vertices);
    // move uvs to a specific point in atlas.png
    for (let i = 0; i < geometry.attributes.uv.array.length; i += 2) {
      geometry.attributes.uv.array[i] = 0.77;
      geometry.attributes.uv.array[i + 1] = 0.001;
    }
    return geometry;
  },

  clear: function () {
    this.el.object3D.remove(this.el.object3D.children[0]);
    if (this.geometry) this.geometry.dispose();
    this.geometry = new THREE.BufferGeometry();
  },

  tick: function (time, delta) {
    if (!this.animate) {
      return;
    }

    var posArray = this.geometry.attributes.position.array;
    var rotation;
    var x, y;
    var sin, cos;
    var diff;

    delta *= 0.001;

    diff = (this.data.twist - this.currentTwist) * delta;

    this.currentTwist += diff;
    rotation = diff * 3.0;

    for (var s = 0; s < this.data.count; s++) {
      for (var i = 0; i < NUM_VALUES_PER_SEGMENT; i += 3) {
        cos = Math.cos(rotation);
        sin = Math.sin(rotation);
        x = posArray[s * NUM_VALUES_PER_SEGMENT + i];
        y = posArray[s * NUM_VALUES_PER_SEGMENT + i + 2];
        posArray[s * NUM_VALUES_PER_SEGMENT + i] = x * cos - y * sin;
        posArray[s * NUM_VALUES_PER_SEGMENT + i + 2] = y * cos + x * sin;
      }
      rotation *= 1.05;
    }
    this.geometry.attributes.position.needsUpdate = true;

    if (Math.abs(this.data.twist - this.currentTwist) < 0.001) {
      this.animate = false;
    }
  }
});

/***/ }),
/* 65 */
/***/ (() => {

/**
 * Lame Chrome user gesture policy.
 */
AFRAME.registerComponent('user-gesture', {
  play: function () {
    document.addEventListener('click', evt => {
      if (evt.target.closest('#controls')) {
        return;
      }
      this.el.sceneEl.emit('usergesturereceive', null, false);
    });
  }
});

/***/ }),
/* 66 */
/***/ (() => {

var colorHelper = new THREE.Color();

/**
 * Set geometry vertex colors, allows for geometry merging using one material
 * while retaining colors.
 */
AFRAME.registerComponent('vertex-colors-buffer', {
  schema: {
    baseColor: { type: 'color' },
    itemSize: { default: 3 }
  },

  update: function (oldData) {
    var colors;
    var data = this.data;
    var i;
    var el = this.el;
    var geometry;
    var mesh;
    var self = this;

    mesh = this.el.getObject3D('mesh');

    if (!mesh || !mesh.geometry) {
      el.addEventListener('object3dset', function reUpdate(evt) {
        if (evt.detail.type !== 'mesh') {
          return;
        }
        el.removeEventListener('object3dset', reUpdate);
        self.update(oldData);
      });
      return;
    }

    geometry = mesh.geometry;

    // Empty geometry.
    if (!geometry.attributes.position) {
      console.warn('Geometry has no vertices', el);
      return;
    }

    if (!geometry.attributes.color) {
      geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.array.length), 3));
    }

    colors = geometry.attributes.color.array;

    // TODO: For some reason, incrementing loop by 3 doesn't work. Need to do by 4 for glTF.
    colorHelper.set(data.baseColor);
    for (i = 0; i < colors.length; i += data.itemSize) {
      colors[i] = colorHelper.r;
      colors[i + 1] = colorHelper.g;
      colors[i + 2] = colorHelper.b;
    }

    geometry.attributes.color.needsUpdate = true;
  }
});

/***/ }),
/* 67 */
/***/ (() => {

/**
 * Couple visibility and raycastability.
 */
AFRAME.registerComponent('visible-raycastable', {
  schema: {
    default: true
  },

  update: function () {
    this.el.object3D.visible = this.data;
    if (this.data) {
      this.el.setAttribute('raycastable', '');
    } else {
      this.el.removeAttribute('raycastable', '');
    }
  }
});

/***/ }),
/* 68 */
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const COLORS = __webpack_require__(26);

const WALL_COLOR = new THREE.Color(COLORS.NEON_RED);
const WALL_BG = new THREE.Color(COLORS.SKY_RED);

AFRAME.registerShader('wallShader', {
  schema: {
    iTime: { type: 'time', is: 'uniform' },
    hitRight: { type: 'vec3', is: 'uniform', default: { x: 0, y: 1, z: 0 } },
    hitLeft: { type: 'vec3', is: 'uniform', default: { x: 0, y: 0, z: 0 } }
  },

  vertexShader: `
    varying vec2 uvs;
    varying vec3 nrml;
    varying vec3 worldPos;
    void main() {
      uvs.xy = uv.xy;
      nrml.xyz = normal.xyz;
      vec4 p = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      worldPos = (modelMatrix * vec4( position, 1.0 )).xyz;
      gl_Position = p;
    }
  `,

  fragmentShader: `
    varying vec2 uvs;
    varying vec3 nrml;
    varying vec3 worldPos;
    uniform float iTime;
    //uniform sampler2D env;
    uniform vec3 hitRight;
    uniform vec3 hitLeft;

    #define SEED 19.1254
    #define time (3.0 + iTime)/1000.0 * 0.15

    float noise(vec3 uv) {
      return fract(sin(uv.x*123243. + uv.y*424. + uv.z*642. + SEED) * 1524.);
    }

    vec3 drawCircle(vec3 p, vec3 center, float radius, float edgeWidth, vec3 color) {
      return color * (1.0 - smoothstep(radius, radius + edgeWidth, length(p - center)));
    }

    float smoothNoise(vec3 uvw, float frec){
      vec3 luvw = vec3(smoothstep(0.0, 1.0, fract(uvw.xy * frec)), fract(uvw.z * frec));
      vec3 id = floor(uvw * frec);
      float blt = noise(id);
      float brt = noise(id + vec3(1.0, 0.0, 0.0));
      float tlt = noise(id + vec3(0.0, 1.0, 0.0));
      float trt = noise(id + vec3(1.0, 1.0, 0.0));

      float blb = noise(id + vec3(0.0, 0.0, 1.0));
      float brb = noise(id + vec3(1.0, 0.0, 1.0));
      float tlb = noise(id + vec3(0.0, 1.0, 1.0));
      float trb = noise(id + vec3(1.0, 1.0, 1.0));

      float a = mix(blt, brt, luvw.x);
      float b = mix(tlt, trt, luvw.x);
      float c = mix(a, b, luvw.y);

      float d = mix(blb, brb, luvw.x);
      float e = mix(tlb, trb, luvw.x);
      float f = mix(d, e, luvw.y);

      return mix(c, f, luvw.z);
    }

    #define WALL_COLOR vec3(${WALL_COLOR.r}, ${WALL_COLOR.g}, ${WALL_COLOR.b})
    #define WALL_BG vec3(${WALL_BG.r}, ${WALL_BG.g}, ${WALL_BG.b})

    void main() {
      vec2 uv1 = uvs.xy-0.5;
      float angle = time / 10.0;
      vec2 uv;
      uv.x = uv1.x * cos(angle) - uv1.y * sin(angle);
      uv.y = uv1.y * cos(angle) + uv1.x * sin(angle);
      uv.x += sin(uv.y * 2.7 + time / 1.7) * 0.2;
      uv.y += sin(uv.x * 3.1 + time / 2.4) * 0.3;

      float w, r, bg;
      r = smoothNoise(vec3(uv + worldPos.x, time / 2.0), 3.0) * 0.65;
      r += smoothNoise(vec3(uv, time / 6.0), 8.0) * 0.3;
      r += smoothNoise(vec3(uv, time / 14.0), 50.0) * 0.04;

      bg = smoothstep(0.5, 1.0, r) + smoothstep(0.5, 0.0, r);
      r = smoothstep(0.4, 0.50, r) - smoothstep(0.50, 0.6, r);
      w = smoothstep(0.97, 1.0, r);


      r += smoothstep(0.44, 0.50, abs(uv1.x));
      r += smoothstep(0.44, 0.50, abs(uv1.y));

      w += smoothstep(0.49, 0.498, abs(uv1.x));
      w += smoothstep(0.49, 0.498, abs(uv1.y));

      w *= 0.9;
      bg *= 0.5;

      vec3 COL = WALL_COLOR;
      vec3 BG = WALL_BG * 0.1;

      vec3 col = vec3(r * COL.r + w + BG.r, r * COL.g + w + BG.g, r * COL.b + w + BG.b);

      vec3 hit;
      hit = drawCircle(worldPos, hitRight, 0.04, 0.05, COL);
      hit += drawCircle(worldPos, hitRight, 0.02, 0.03, vec3(0.7, 0.7, 0.7));
      hit += drawCircle(worldPos, hitLeft, 0.04, 0.05, COL);
      hit += drawCircle(worldPos, hitLeft, 0.02, 0.03, vec3(0.7, 0.7, 0.7));

      gl_FragColor = vec4(col + hit, 0.7 + w + hit.x);
    }
`

});

/***/ }),
/* 69 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _constants_beat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(22);


// So wall does not clip the stage ground.
const RAISE_Y_OFFSET = 0.15;

const CEILING_THICKNESS = 1.5;
const CEILING_HEIGHT = 1.4 + CEILING_THICKNESS / 2;
const CEILING_WIDTH = 4;

/**
 * Wall to dodge.
 */
AFRAME.registerComponent('wall', {
  schema: {
    anticipationPosition: { default: 0 },
    durationSeconds: { default: 0 },
    height: { default: 1.3 },
    horizontalPosition: { default: 'middleleft',
      oneOf: ['left', 'middleleft', 'middleright', 'right'] },
    isCeiling: { default: false },
    speed: { default: 1.0 },
    warmupPosition: { default: 0 },
    width: { default: 1 }
  },

  horizontalPositions: {
    left: -0.75,
    middleleft: -0.25,
    middleright: 0.25,
    right: 0.75
  },

  init: function () {
    this.maxZ = 10;
  },

  update: function () {
    const el = this.el;
    const data = this.data;
    const width = data.width;

    const halfDepth = data.durationSeconds * data.speed / 2;

    if (data.isCeiling) {
      el.object3D.position.set(0, CEILING_HEIGHT, data.anticipationPosition + data.warmupPosition - halfDepth);
      el.object3D.scale.set(CEILING_WIDTH, CEILING_THICKNESS, data.durationSeconds * data.speed);
      return;
    }

    // Box geometry is constructed from the local 0,0,0 growing in the positive and negative
    // x and z axis. We have to shift by half width and depth to be positioned correctly.
    el.object3D.position.set(this.horizontalPositions[data.horizontalPosition] + width / 2 - 0.25, data.height + RAISE_Y_OFFSET, data.anticipationPosition + data.warmupPosition - halfDepth);
    el.object3D.scale.set(width, 2.5, data.durationSeconds * data.speed);
  },

  pause: function () {
    this.el.object3D.visible = false;
    this.el.removeAttribute('data-collidable-head');
  },

  play: function () {
    this.el.object3D.visible = true;
    this.el.setAttribute('data-collidable-head', '');
  },

  tock: function (time, timeDelta) {
    const data = this.data;
    const halfDepth = data.durationSeconds * data.speed / 2;
    const position = this.el.object3D.position;

    // Move.
    this.el.object3D.visible = true;
    if (position.z < data.anticipationPosition - halfDepth) {
      let newPositionZ = position.z + _constants_beat__WEBPACK_IMPORTED_MODULE_0__.BEAT_WARMUP_SPEED * (timeDelta / 1000);
      // Warm up / warp in.
      if (newPositionZ < data.anticipationPosition - halfDepth) {
        position.z = newPositionZ;
      } else {
        position.z = data.anticipationPosition - halfDepth;
      }
    } else {
      // Standard moving.
      position.z += this.data.speed * (timeDelta / 1000);
    }

    if (this.el.object3D.position.z > this.maxZ + halfDepth) {
      this.returnToPool();
      return;
    }
  },

  returnToPool: function () {
    this.el.sceneEl.components.pool__wall.returnEntity(this.el);
    this.el.object3D.position.z = 9999;
    this.el.pause();
    this.el.removeAttribute('data-collidable-head');
  }
});

/***/ }),
/* 70 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var zip_loader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(71);
const utils = __webpack_require__(23);


const zipUrl = AFRAME.utils.getUrlParameter('zip');

AFRAME.registerComponent('zip-loader', {
  schema: {
    id: { default: zipUrl ? '' : AFRAME.utils.getUrlParameter('id') || '4a6' },
    isSafari: { default: false },
    difficulty: { default: AFRAME.utils.getUrlParameter('difficulty') }
  },

  init: function () {
    this.fetchedZip = '';
    this.hash = '';
  },

  init: function () {
    if (zipUrl) {
      this.fetchZip(zipUrl);
    }
  },

  update: function (oldData) {
    if (!this.data.id) {
      return;
    }

    if (oldData.id !== this.data.id || oldData.difficulty !== this.data.difficulty) {
      this.fetchData(this.data.id);
      this.el.sceneEl.emit('cleargame', null, false);
    }
    this.el.sceneEl.emit('challengeset', this.data.id);
  },

  play: function () {
    this.loadingIndicator = document.getElementById('challengeLoadingIndicator');
  },

  /**
   * Read API first to get hash and URLs.
   */
  fetchData: function (id) {
    return fetch(`https://beatsaver.com/api/maps/detail/${id}/`).then(res => {
      res.json().then(data => {
        this.hash = data.hash;
        this.el.sceneEl.emit('challengeimage', `https://beatsaver.com${data.coverURL}`);
        this.fetchZip(zipUrl || getZipUrl(this.data.id, this.hash));
      });
    });
  },

  fetchZip: function (zipUrl) {
    if (this.data.isSafari) {
      return;
    }

    // Already fetching.
    if (this.isFetching === zipUrl || this.fetchedZip === this.data.id) {
      return;
    }

    this.el.emit('challengeloadstart', this.data.id, false);
    this.isFetching = zipUrl;

    // Fetch and unzip.
    const loader = new zip_loader__WEBPACK_IMPORTED_MODULE_0__.default(zipUrl);

    loader.on('error', err => {
      this.el.emit('challengeloaderror', null);
      this.isFetching = '';
    });

    loader.on('progress', evt => {
      this.loadingIndicator.object3D.visible = true;
      this.loadingIndicator.setAttribute('material', 'progress', evt.loaded / evt.total);
    });

    loader.on('load', () => {
      this.fetchedZip = this.data.id;

      let imageBlob;
      let songBlob;
      const event = {
        audio: '',
        beats: {},
        difficulties: null,
        id: this.data.id,
        image: '',
        info: ''
      };

      // Process info first.
      Object.keys(loader.files).forEach(filename => {
        if (filename.endsWith('info.dat')) {
          event.info = jsonParseClean(loader.extractAsText(filename));
        }
      });

      // Default to hardest.
      event.info.difficultyLevels = event.info._difficultyBeatmapSets[0]._difficultyBeatmaps;
      const difficulties = event.info.difficultyLevels;
      if (!event.difficulty) {
        event.difficulty = this.data.difficulty || difficulties.sort(d => d._diificultyRank)[0]._difficulty;
      }
      event.difficulties = difficulties.sort(d => d._difficultyRank).map(difficulty => difficulty._difficulty);

      Object.keys(loader.files).forEach(filename => {
        for (let i = 0; i < difficulties.length; i++) {
          let difficulty = difficulties[i]._difficulty;
          if (filename.endsWith(`${difficulty}.dat`)) {
            event.beats[difficulty] = loader.extractAsJSON(filename);
          }
        }

        // Only needed if loading ZIP directly and not from API.
        if (!this.data.id) {
          if (filename.endsWith('jpg')) {
            event.image = loader.extractAsBlobUrl(filename, 'image/jpg');
          }
          if (filename.endsWith('png')) {
            event.image = loader.extractAsBlobUrl(filename, 'image/png');
          }
        }

        if (filename.endsWith('egg') || filename.endsWith('ogg')) {
          event.audio = loader.extractAsBlobUrl(filename, 'audio/ogg');
        }
      });

      if (!event.image && !this.data.id) {
        event.image = 'assets/img/logo.png';
      }

      this.isFetching = '';
      this.el.emit('challengeloadend', event, false);
    });

    loader.load();
  }
});

/**
 * Beatsaver JSON sometimes have weird characters in front of JSON in utf16le encoding.
 */
function jsonParseClean(str) {
  try {
    str = str.trim();
    str = str.replace(/\u0000/g, '').replace(/\u\d\d\d\d/g, '');
    str = str.replace('\b', ' ');
    if (str[0] !== '{') {
      str = str.substring(str.indexOf('{'), str.length);
    }

    // Remove Unicode escape sequences.
    // stringified = stringified.replace(/\\u..../g, ' ');
    return jsonParseLoop(str, 0);
  } catch (e) {
    // Should not reach here.
    console.log(e, str);
    return null;
  }
}

const errorRe1 = /column (\d+)/m;
const errorRe2 = /position (\d+)/m;

function jsonParseLoop(str, i) {
  try {
    return JSON.parse(str);
  } catch (e) {
    let match = e.toString().match(errorRe1);
    if (!match) {
      match = e.toString().match(errorRe2);
    }
    if (!match) {
      throw e;
    }
    const errorPos = parseInt(match[1]);
    str = str.replace(str[errorPos], 'x');
    str = str.replace(str[errorPos + 1], 'x');
    str = str.replace(str[errorPos + 2], 'x');
    return jsonParseLoop(str, i + 1);
  }
}

function getZipUrl(key, hash) {
  return `https://beatsaver.com/cdn/${key}/${hash}.zip`;
}

/***/ }),
/* 71 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/*!
 * ZipLoader
 * (c) 2017 @yomotsu
 * Released under the MIT License.
 * 
 * ZipLoader uses the library pako released under the MIT license :
 * https://github.com/nodeca/pako/blob/master/LICENSE
 */
function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var common = createCommonjsModule(function (module, exports) {


var TYPED_OK =  (typeof Uint8Array !== 'undefined') &&
                (typeof Uint16Array !== 'undefined') &&
                (typeof Int32Array !== 'undefined');

function _has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

exports.assign = function (obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    var source = sources.shift();
    if (!source) { continue; }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be non-object');
    }

    for (var p in source) {
      if (_has(source, p)) {
        obj[p] = source[p];
      }
    }
  }

  return obj;
};


// reduce buffer size, avoiding mem copy
exports.shrinkBuf = function (buf, size) {
  if (buf.length === size) { return buf; }
  if (buf.subarray) { return buf.subarray(0, size); }
  buf.length = size;
  return buf;
};


var fnTyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    if (src.subarray && dest.subarray) {
      dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
      return;
    }
    // Fallback to ordinary array
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function (chunks) {
    var i, l, len, pos, chunk, result;

    // calculate data length
    len = 0;
    for (i = 0, l = chunks.length; i < l; i++) {
      len += chunks[i].length;
    }

    // join chunks
    result = new Uint8Array(len);
    pos = 0;
    for (i = 0, l = chunks.length; i < l; i++) {
      chunk = chunks[i];
      result.set(chunk, pos);
      pos += chunk.length;
    }

    return result;
  }
};

var fnUntyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function (chunks) {
    return [].concat.apply([], chunks);
  }
};


// Enable/Disable typed arrays use, for testing
//
exports.setTyped = function (on) {
  if (on) {
    exports.Buf8  = Uint8Array;
    exports.Buf16 = Uint16Array;
    exports.Buf32 = Int32Array;
    exports.assign(exports, fnTyped);
  } else {
    exports.Buf8  = Array;
    exports.Buf16 = Array;
    exports.Buf32 = Array;
    exports.assign(exports, fnUntyped);
  }
};

exports.setTyped(TYPED_OK);
});
var common_1 = common.assign;
var common_2 = common.shrinkBuf;
var common_3 = common.setTyped;
var common_4 = common.Buf8;
var common_5 = common.Buf16;
var common_6 = common.Buf32;

// Note: adler32 takes 12% for level 0 and 2% for level 6.
// It isn't worth it to make additional optimizations as in original.
// Small size is preferable.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function adler32(adler, buf, len, pos) {
  var s1 = (adler & 0xffff) |0,
      s2 = ((adler >>> 16) & 0xffff) |0,
      n = 0;

  while (len !== 0) {
    // Set limit ~ twice less than 5552, to keep
    // s2 in 31-bits, because we force signed ints.
    // in other case %= will fail.
    n = len > 2000 ? 2000 : len;
    len -= n;

    do {
      s1 = (s1 + buf[pos++]) |0;
      s2 = (s2 + s1) |0;
    } while (--n);

    s1 %= 65521;
    s2 %= 65521;
  }

  return (s1 | (s2 << 16)) |0;
}


var adler32_1 = adler32;

// Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// Use ordinary array, since untyped makes no boost here
function makeTable() {
  var c, table = [];

  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  return table;
}

// Create table on load. Just 255 signed longs. Not a problem.
var crcTable = makeTable();


function crc32(crc, buf, len, pos) {
  var t = crcTable,
      end = pos + len;

  crc ^= -1;

  for (var i = pos; i < end; i++) {
    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
  }

  return (crc ^ (-1)); // >>> 0;
}


var crc32_1 = crc32;

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// See state defs from inflate.js
var BAD = 30;       /* got a data error -- remain here until reset */
var TYPE = 12;      /* i: waiting for type bits, including last-flag bit */

/*
   Decode literal, length, and distance codes and write out the resulting
   literal and match bytes until either not enough input or output is
   available, an end-of-block is encountered, or a data error is encountered.
   When large enough input and output buffers are supplied to inflate(), for
   example, a 16K input buffer and a 64K output buffer, more than 95% of the
   inflate execution time is spent in this routine.

   Entry assumptions:

        state.mode === LEN
        strm.avail_in >= 6
        strm.avail_out >= 258
        start >= strm.avail_out
        state.bits < 8

   On return, state.mode is one of:

        LEN -- ran out of enough output space or enough available input
        TYPE -- reached end of block code, inflate() to interpret next block
        BAD -- error in block data

   Notes:

    - The maximum input bits used by a length/distance pair is 15 bits for the
      length code, 5 bits for the length extra, 15 bits for the distance code,
      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
      Therefore if strm.avail_in >= 6, then there is enough input to avoid
      checking for available input while decoding.

    - The maximum bytes that a single length/distance pair can output is 258
      bytes, which is the maximum length that can be coded.  inflate_fast()
      requires strm.avail_out >= 258 for each loop to avoid checking for
      output space.
 */
var inffast = function inflate_fast(strm, start) {
  var state;
  var _in;                    /* local strm.input */
  var last;                   /* have enough input while in < last */
  var _out;                   /* local strm.output */
  var beg;                    /* inflate()'s initial strm.output */
  var end;                    /* while out < end, enough space available */
//#ifdef INFLATE_STRICT
  var dmax;                   /* maximum distance from zlib header */
//#endif
  var wsize;                  /* window size or zero if not using window */
  var whave;                  /* valid bytes in the window */
  var wnext;                  /* window write index */
  // Use `s_window` instead `window`, avoid conflict with instrumentation tools
  var s_window;               /* allocated sliding window, if wsize != 0 */
  var hold;                   /* local strm.hold */
  var bits;                   /* local strm.bits */
  var lcode;                  /* local strm.lencode */
  var dcode;                  /* local strm.distcode */
  var lmask;                  /* mask for first level of length codes */
  var dmask;                  /* mask for first level of distance codes */
  var here;                   /* retrieved table entry */
  var op;                     /* code bits, operation, extra bits, or */
                              /*  window position, window bytes to copy */
  var len;                    /* match length, unused bytes */
  var dist;                   /* match distance */
  var from;                   /* where to copy match from */
  var from_source;


  var input, output; // JS specific, because we have no pointers

  /* copy state to local variables */
  state = strm.state;
  //here = state.here;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
//#ifdef INFLATE_STRICT
  dmax = state.dmax;
//#endif
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  s_window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;


  /* decode literals and length/distances until end-of-block or not enough
     input data or output space */

  top:
  do {
    if (bits < 15) {
      hold += input[_in++] << bits;
      bits += 8;
      hold += input[_in++] << bits;
      bits += 8;
    }

    here = lcode[hold & lmask];

    dolen:
    for (;;) { // Goto emulation
      op = here >>> 24/*here.bits*/;
      hold >>>= op;
      bits -= op;
      op = (here >>> 16) & 0xff/*here.op*/;
      if (op === 0) {                          /* literal */
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        output[_out++] = here & 0xffff/*here.val*/;
      }
      else if (op & 16) {                     /* length base */
        len = here & 0xffff/*here.val*/;
        op &= 15;                           /* number of extra bits */
        if (op) {
          if (bits < op) {
            hold += input[_in++] << bits;
            bits += 8;
          }
          len += hold & ((1 << op) - 1);
          hold >>>= op;
          bits -= op;
        }
        //Tracevv((stderr, "inflate:         length %u\n", len));
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = dcode[hold & dmask];

        dodist:
        for (;;) { // goto emulation
          op = here >>> 24/*here.bits*/;
          hold >>>= op;
          bits -= op;
          op = (here >>> 16) & 0xff/*here.op*/;

          if (op & 16) {                      /* distance base */
            dist = here & 0xffff/*here.val*/;
            op &= 15;                       /* number of extra bits */
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
            }
            dist += hold & ((1 << op) - 1);
//#ifdef INFLATE_STRICT
            if (dist > dmax) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break top;
            }
//#endif
            hold >>>= op;
            bits -= op;
            //Tracevv((stderr, "inflate:         distance %u\n", dist));
            op = _out - beg;                /* max distance in output */
            if (dist > op) {                /* see if copy from window */
              op = dist - op;               /* distance back in window */
              if (op > whave) {
                if (state.sane) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD;
                  break top;
                }

// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                if (len <= op - whave) {
//                  do {
//                    output[_out++] = 0;
//                  } while (--len);
//                  continue top;
//                }
//                len -= op - whave;
//                do {
//                  output[_out++] = 0;
//                } while (--op > whave);
//                if (op === 0) {
//                  from = _out - dist;
//                  do {
//                    output[_out++] = output[from++];
//                  } while (--len);
//                  continue top;
//                }
//#endif
              }
              from = 0; // window index
              from_source = s_window;
              if (wnext === 0) {           /* very common case */
                from += wsize - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              else if (wnext < op) {      /* wrap around window */
                from += wsize + wnext - op;
                op -= wnext;
                if (op < len) {         /* some from end of window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = 0;
                  if (wnext < len) {  /* some from start of window */
                    op = wnext;
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = _out - dist;      /* rest from output */
                    from_source = output;
                  }
                }
              }
              else {                      /* contiguous in window */
                from += wnext - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              while (len > 2) {
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                len -= 3;
              }
              if (len) {
                output[_out++] = from_source[from++];
                if (len > 1) {
                  output[_out++] = from_source[from++];
                }
              }
            }
            else {
              from = _out - dist;          /* copy direct from output */
              do {                        /* minimum length is three */
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                len -= 3;
              } while (len > 2);
              if (len) {
                output[_out++] = output[from++];
                if (len > 1) {
                  output[_out++] = output[from++];
                }
              }
            }
          }
          else if ((op & 64) === 0) {          /* 2nd level distance code */
            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
            continue dodist;
          }
          else {
            strm.msg = 'invalid distance code';
            state.mode = BAD;
            break top;
          }

          break; // need to emulate goto via "continue"
        }
      }
      else if ((op & 64) === 0) {              /* 2nd level length code */
        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
        continue dolen;
      }
      else if (op & 32) {                     /* end-of-block */
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.mode = TYPE;
        break top;
      }
      else {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD;
        break top;
      }

      break; // need to emulate goto via "continue"
    }
  } while (_in < last && _out < end);

  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;

  /* update state and return */
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
  state.hold = hold;
  state.bits = bits;
  return;
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.



var MAXBITS = 15;
var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

var CODES = 0;
var LENS = 1;
var DISTS = 2;

var lbase = [ /* Length codes 257..285 base */
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
];

var lext = [ /* Length codes 257..285 extra */
  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
];

var dbase = [ /* Distance codes 0..29 base */
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
  8193, 12289, 16385, 24577, 0, 0
];

var dext = [ /* Distance codes 0..29 extra */
  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
  28, 28, 29, 29, 64, 64
];

var inftrees = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts)
{
  var bits = opts.bits;
      //here = opts.here; /* table entry for duplication */

  var len = 0;               /* a code's length in bits */
  var sym = 0;               /* index of code symbols */
  var min = 0, max = 0;          /* minimum and maximum code lengths */
  var root = 0;              /* number of index bits for root table */
  var curr = 0;              /* number of index bits for current table */
  var drop = 0;              /* code bits to drop for sub-table */
  var left = 0;                   /* number of prefix codes available */
  var used = 0;              /* code entries in table used */
  var huff = 0;              /* Huffman code */
  var incr;              /* for incrementing code, index */
  var fill;              /* index for replicating entries */
  var low;               /* low bits for current root entry */
  var mask;              /* mask for low root bits */
  var next;             /* next available space in table */
  var base = null;     /* base value table to use */
  var base_index = 0;
//  var shoextra;    /* extra bits table to use */
  var end;                    /* use base and extra for symbol > end */
  var count = new common.Buf16(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
  var offs = new common.Buf16(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
  var extra = null;
  var extra_index = 0;

  var here_bits, here_op, here_val;

  /*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.

   This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.

   The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.

   The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
   */

  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }

  /* bound code lengths, force root to be within code lengths */
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) { break; }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {                     /* no symbols to code at all */
    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;


    //table.op[opts.table_index] = 64;
    //table.bits[opts.table_index] = 1;
    //table.val[opts.table_index++] = 0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;

    opts.bits = 1;
    return 0;     /* no symbols, but wait for decoding to report error */
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) { break; }
  }
  if (root < min) {
    root = min;
  }

  /* check for an over-subscribed or incomplete set of lengths */
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }        /* over-subscribed */
  }
  if (left > 0 && (type === CODES || max !== 1)) {
    return -1;                      /* incomplete set */
  }

  /* generate offsets into symbol table for each length for sorting */
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }

  /* sort symbols by length, by symbol order within each length */
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }

  /*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.

   root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.

   When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.

   used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.

   sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
   */

  /* set up for code type */
  // poor man optimization - use if-else instead of switch,
  // to avoid deopts in old v8
  if (type === CODES) {
    base = extra = work;    /* dummy value--not used */
    end = 19;

  } else if (type === LENS) {
    base = lbase;
    base_index -= 257;
    extra = lext;
    extra_index -= 257;
    end = 256;

  } else {                    /* DISTS */
    base = dbase;
    extra = dext;
    end = -1;
  }

  /* initialize opts for loop */
  huff = 0;                   /* starting code */
  sym = 0;                    /* starting code symbol */
  len = min;                  /* starting code length */
  next = table_index;              /* current table to fill in */
  curr = root;                /* current table index bits */
  drop = 0;                   /* current bits to drop from code for index */
  low = -1;                   /* trigger new sub-table when len > root */
  used = 1 << root;          /* use root table entries */
  mask = used - 1;            /* mask for comparing low */

  /* check available table space */
  if ((type === LENS && used > ENOUGH_LENS) ||
    (type === DISTS && used > ENOUGH_DISTS)) {
    return 1;
  }

  /* process all codes and make table entries */
  for (;;) {
    /* create table entry */
    here_bits = len - drop;
    if (work[sym] < end) {
      here_op = 0;
      here_val = work[sym];
    }
    else if (work[sym] > end) {
      here_op = extra[extra_index + work[sym]];
      here_val = base[base_index + work[sym]];
    }
    else {
      here_op = 32 + 64;         /* end of block */
      here_val = 0;
    }

    /* replicate for those indices with low len bits equal to huff */
    incr = 1 << (len - drop);
    fill = 1 << curr;
    min = fill;                 /* save offset to next table */
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
    } while (fill !== 0);

    /* backwards increment the len-bit code huff */
    incr = 1 << (len - 1);
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }

    /* go to next symbol, update count, len */
    sym++;
    if (--count[len] === 0) {
      if (len === max) { break; }
      len = lens[lens_index + work[sym]];
    }

    /* create new sub-table if needed */
    if (len > root && (huff & mask) !== low) {
      /* if first time, transition to sub-tables */
      if (drop === 0) {
        drop = root;
      }

      /* increment past last table */
      next += min;            /* here min is 1 << curr */

      /* determine length of next table */
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) { break; }
        curr++;
        left <<= 1;
      }

      /* check for enough space */
      used += 1 << curr;
      if ((type === LENS && used > ENOUGH_LENS) ||
        (type === DISTS && used > ENOUGH_DISTS)) {
        return 1;
      }

      /* point entry in root table to sub-table */
      low = huff & mask;
      /*table.op[low] = curr;
      table.bits[low] = root;
      table.val[low] = next - opts.table_index;*/
      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
    }
  }

  /* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */
  if (huff !== 0) {
    //table.op[next + huff] = 64;            /* invalid code marker */
    //table.bits[next + huff] = len - drop;
    //table.val[next + huff] = 0;
    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
  }

  /* set return parameters */
  //opts.table_index += used;
  opts.bits = root;
  return 0;
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.







var CODES$1 = 0;
var LENS$1 = 1;
var DISTS$1 = 2;

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
//var Z_NO_FLUSH      = 0;
//var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
//var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;

/* The deflate compression method */
var Z_DEFLATED  = 8;


/* STATES ====================================================================*/
/* ===========================================================================*/


var    HEAD = 1;       /* i: waiting for magic header */
var    FLAGS = 2;      /* i: waiting for method and flags (gzip) */
var    TIME = 3;       /* i: waiting for modification time (gzip) */
var    OS = 4;         /* i: waiting for extra flags and operating system (gzip) */
var    EXLEN = 5;      /* i: waiting for extra length (gzip) */
var    EXTRA = 6;      /* i: waiting for extra bytes (gzip) */
var    NAME = 7;       /* i: waiting for end of file name (gzip) */
var    COMMENT = 8;    /* i: waiting for end of comment (gzip) */
var    HCRC = 9;       /* i: waiting for header crc (gzip) */
var    DICTID = 10;    /* i: waiting for dictionary check value */
var    DICT = 11;      /* waiting for inflateSetDictionary() call */
var        TYPE$1 = 12;      /* i: waiting for type bits, including last-flag bit */
var        TYPEDO = 13;    /* i: same, but skip check to exit inflate on new block */
var        STORED = 14;    /* i: waiting for stored size (length and complement) */
var        COPY_ = 15;     /* i/o: same as COPY below, but only first time in */
var        COPY = 16;      /* i/o: waiting for input or output to copy stored block */
var        TABLE = 17;     /* i: waiting for dynamic block table lengths */
var        LENLENS = 18;   /* i: waiting for code length code lengths */
var        CODELENS = 19;  /* i: waiting for length/lit and distance code lengths */
var            LEN_ = 20;      /* i: same as LEN below, but only first time in */
var            LEN = 21;       /* i: waiting for length/lit/eob code */
var            LENEXT = 22;    /* i: waiting for length extra bits */
var            DIST = 23;      /* i: waiting for distance code */
var            DISTEXT = 24;   /* i: waiting for distance extra bits */
var            MATCH = 25;     /* o: waiting for output space to copy string */
var            LIT = 26;       /* o: waiting for output space to write literal */
var    CHECK = 27;     /* i: waiting for 32-bit check value */
var    LENGTH = 28;    /* i: waiting for 32-bit length (gzip) */
var    DONE = 29;      /* finished check, done -- remain here until reset */
var    BAD$1 = 30;       /* got a data error -- remain here until reset */
var    MEM = 31;       /* got an inflate() memory error -- remain here until reset */
var    SYNC = 32;      /* looking for synchronization bytes to restart inflate() */

/* ===========================================================================*/



var ENOUGH_LENS$1 = 852;
var ENOUGH_DISTS$1 = 592;
//var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_WBITS = MAX_WBITS;


function zswap32(q) {
  return  (((q >>> 24) & 0xff) +
          ((q >>> 8) & 0xff00) +
          ((q & 0xff00) << 8) +
          ((q & 0xff) << 24));
}


function InflateState() {
  this.mode = 0;             /* current inflate mode */
  this.last = false;          /* true if processing last block */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.havedict = false;      /* true if dictionary provided */
  this.flags = 0;             /* gzip header method and flags (0 if zlib) */
  this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
  this.check = 0;             /* protected copy of check value */
  this.total = 0;             /* protected copy of output count */
  // TODO: may be {}
  this.head = null;           /* where to save gzip header information */

  /* sliding window */
  this.wbits = 0;             /* log base 2 of requested window size */
  this.wsize = 0;             /* window size or zero if not using window */
  this.whave = 0;             /* valid bytes in the window */
  this.wnext = 0;             /* window write index */
  this.window = null;         /* allocated sliding window, if needed */

  /* bit accumulator */
  this.hold = 0;              /* input bit accumulator */
  this.bits = 0;              /* number of bits in "in" */

  /* for string and stored block copying */
  this.length = 0;            /* literal or length of data to copy */
  this.offset = 0;            /* distance back to copy string from */

  /* for table and code decoding */
  this.extra = 0;             /* extra bits needed */

  /* fixed and dynamic code tables */
  this.lencode = null;          /* starting table for length/literal codes */
  this.distcode = null;         /* starting table for distance codes */
  this.lenbits = 0;           /* index bits for lencode */
  this.distbits = 0;          /* index bits for distcode */

  /* dynamic table building */
  this.ncode = 0;             /* number of code length code lengths */
  this.nlen = 0;              /* number of length code lengths */
  this.ndist = 0;             /* number of distance code lengths */
  this.have = 0;              /* number of code lengths in lens[] */
  this.next = null;              /* next available space in codes[] */

  this.lens = new common.Buf16(320); /* temporary storage for code lengths */
  this.work = new common.Buf16(288); /* work area for code table building */

  /*
   because we don't have pointers in js, we use lencode and distcode directly
   as buffers so we don't need codes
  */
  //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */
  this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
  this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
  this.sane = 0;                   /* if false, allow invalid distance too far */
  this.back = 0;                   /* bits back of last unprocessed length/lit */
  this.was = 0;                    /* initial length of match */
}

function inflateResetKeep(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = ''; /*Z_NULL*/
  if (state.wrap) {       /* to support ill-conceived Java test suite */
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.dmax = 32768;
  state.head = null/*Z_NULL*/;
  state.hold = 0;
  state.bits = 0;
  //state.lencode = state.distcode = state.next = state.codes;
  state.lencode = state.lendyn = new common.Buf32(ENOUGH_LENS$1);
  state.distcode = state.distdyn = new common.Buf32(ENOUGH_DISTS$1);

  state.sane = 1;
  state.back = -1;
  //Tracev((stderr, "inflate: reset\n"));
  return Z_OK;
}

function inflateReset(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);

}

function inflateReset2(strm, windowBits) {
  var wrap;
  var state;

  /* get the state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;

  /* extract wrap request from windowBits parameter */
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  }
  else {
    wrap = (windowBits >> 4) + 1;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }

  /* set number of window bits, free window if different */
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }

  /* update state and reset the rest of it */
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
}

function inflateInit2(strm, windowBits) {
  var ret;
  var state;

  if (!strm) { return Z_STREAM_ERROR; }
  //strm.msg = Z_NULL;                 /* in case we return an error */

  state = new InflateState();

  //if (state === Z_NULL) return Z_MEM_ERROR;
  //Tracev((stderr, "inflate: allocated\n"));
  strm.state = state;
  state.window = null/*Z_NULL*/;
  ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK) {
    strm.state = null/*Z_NULL*/;
  }
  return ret;
}

function inflateInit(strm) {
  return inflateInit2(strm, DEF_WBITS);
}


/*
 Return state with length and distance decoding tables and index sizes set to
 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
 If BUILDFIXED is defined, then instead this routine builds the tables the
 first time it's called, and returns those tables the first time and
 thereafter.  This reduces the size of the code by about 2K bytes, in
 exchange for a little execution time.  However, BUILDFIXED should not be
 used for threaded applications, since the rewriting of the tables and virgin
 may not be thread-safe.
 */
var virgin = true;

var lenfix, distfix; // We have no pointers in JS, so keep tables separate

function fixedtables(state) {
  /* build fixed huffman tables if first call (may not be thread safe) */
  if (virgin) {
    var sym;

    lenfix = new common.Buf32(512);
    distfix = new common.Buf32(32);

    /* literal/length table */
    sym = 0;
    while (sym < 144) { state.lens[sym++] = 8; }
    while (sym < 256) { state.lens[sym++] = 9; }
    while (sym < 280) { state.lens[sym++] = 7; }
    while (sym < 288) { state.lens[sym++] = 8; }

    inftrees(LENS$1,  state.lens, 0, 288, lenfix,   0, state.work, { bits: 9 });

    /* distance table */
    sym = 0;
    while (sym < 32) { state.lens[sym++] = 5; }

    inftrees(DISTS$1, state.lens, 0, 32,   distfix, 0, state.work, { bits: 5 });

    /* do this just once */
    virgin = false;
  }

  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
}


/*
 Update the window with the last wsize (normally 32K) bytes written before
 returning.  If window does not exist yet, create it.  This is only called
 when a window is already in use, or when output has been written during this
 inflate call, but the end of the deflate stream has not been reached yet.
 It is also called to create a window for dictionary data when a dictionary
 is loaded.

 Providing output buffers larger than 32K to inflate() should provide a speed
 advantage, since only the last 32K of output is copied to the sliding window
 upon return from inflate(), and since all distances after the first 32K of
 output will fall in the output data, making match copies simpler and faster.
 The advantage may be dependent on the size of the processor's data caches.
 */
function updatewindow(strm, src, end, copy) {
  var dist;
  var state = strm.state;

  /* if it hasn't been done already, allocate space for the window */
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;

    state.window = new common.Buf8(state.wsize);
  }

  /* copy state->wsize or less output bytes into the circular window */
  if (copy >= state.wsize) {
    common.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
    state.wnext = 0;
    state.whave = state.wsize;
  }
  else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    //zmemcpy(state->window + state->wnext, end - copy, dist);
    common.arraySet(state.window, src, end - copy, dist, state.wnext);
    copy -= dist;
    if (copy) {
      //zmemcpy(state->window, end - copy, copy);
      common.arraySet(state.window, src, end - copy, copy, 0);
      state.wnext = copy;
      state.whave = state.wsize;
    }
    else {
      state.wnext += dist;
      if (state.wnext === state.wsize) { state.wnext = 0; }
      if (state.whave < state.wsize) { state.whave += dist; }
    }
  }
  return 0;
}

function inflate(strm, flush) {
  var state;
  var input, output;          // input/output buffers
  var next;                   /* next input INDEX */
  var put;                    /* next output INDEX */
  var have, left;             /* available input and output */
  var hold;                   /* bit buffer */
  var bits;                   /* bits in bit buffer */
  var _in, _out;              /* save starting available input and output */
  var copy;                   /* number of stored or match bytes to copy */
  var from;                   /* where to copy match bytes from */
  var from_source;
  var here = 0;               /* current decoding table entry */
  var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
  //var last;                   /* parent table entry */
  var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
  var len;                    /* length to copy for repeats, bits to drop */
  var ret;                    /* return code */
  var hbuf = new common.Buf8(4);    /* buffer for gzip header crc calculation */
  var opts;

  var n; // temporary var for NEED_BITS

  var order = /* permutation of code lengths */
    [ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ];


  if (!strm || !strm.state || !strm.output ||
      (!strm.input && strm.avail_in !== 0)) {
    return Z_STREAM_ERROR;
  }

  state = strm.state;
  if (state.mode === TYPE$1) { state.mode = TYPEDO; }    /* skip check */


  //--- LOAD() ---
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  //---

  _in = have;
  _out = left;
  ret = Z_OK;

  inf_leave: // goto emulation
  for (;;) {
    switch (state.mode) {
      case HEAD:
        if (state.wrap === 0) {
          state.mode = TYPEDO;
          break;
        }
        //=== NEEDBITS(16);
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
          state.check = 0/*crc32(0L, Z_NULL, 0)*/;
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//

          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          state.mode = FLAGS;
          break;
        }
        state.flags = 0;           /* expect zlib header */
        if (state.head) {
          state.head.done = false;
        }
        if (!(state.wrap & 1) ||   /* check if zlib header allowed */
          (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
          strm.msg = 'incorrect header check';
          state.mode = BAD$1;
          break;
        }
        if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD$1;
          break;
        }
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
        len = (hold & 0x0f)/*BITS(4)*/ + 8;
        if (state.wbits === 0) {
          state.wbits = len;
        }
        else if (len > state.wbits) {
          strm.msg = 'invalid window size';
          state.mode = BAD$1;
          break;
        }
        state.dmax = 1 << len;
        //Tracev((stderr, "inflate:   zlib header ok\n"));
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = hold & 0x200 ? DICTID : TYPE$1;
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        break;
      case FLAGS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.flags = hold;
        if ((state.flags & 0xff) !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD$1;
          break;
        }
        if (state.flags & 0xe000) {
          strm.msg = 'unknown header flags set';
          state.mode = BAD$1;
          break;
        }
        if (state.head) {
          state.head.text = ((hold >> 8) & 1);
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = TIME;
        /* falls through */
      case TIME:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.time = hold;
        }
        if (state.flags & 0x0200) {
          //=== CRC4(state.check, hold)
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          hbuf[2] = (hold >>> 16) & 0xff;
          hbuf[3] = (hold >>> 24) & 0xff;
          state.check = crc32_1(state.check, hbuf, 4, 0);
          //===
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = OS;
        /* falls through */
      case OS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.xflags = (hold & 0xff);
          state.head.os = (hold >> 8);
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = EXLEN;
        /* falls through */
      case EXLEN:
        if (state.flags & 0x0400) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length = hold;
          if (state.head) {
            state.head.extra_len = hold;
          }
          if (state.flags & 0x0200) {
            //=== CRC2(state.check, hold);
            hbuf[0] = hold & 0xff;
            hbuf[1] = (hold >>> 8) & 0xff;
            state.check = crc32_1(state.check, hbuf, 2, 0);
            //===//
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        else if (state.head) {
          state.head.extra = null/*Z_NULL*/;
        }
        state.mode = EXTRA;
        /* falls through */
      case EXTRA:
        if (state.flags & 0x0400) {
          copy = state.length;
          if (copy > have) { copy = have; }
          if (copy) {
            if (state.head) {
              len = state.head.extra_len - state.length;
              if (!state.head.extra) {
                // Use untyped array for more convenient processing later
                state.head.extra = new Array(state.head.extra_len);
              }
              common.arraySet(
                state.head.extra,
                input,
                next,
                // extra field is limited to 65536 bytes
                // - no need for additional size check
                copy,
                /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                len
              );
              //zmemcpy(state.head.extra + len, next,
              //        len + copy > state.head.extra_max ?
              //        state.head.extra_max - len : copy);
            }
            if (state.flags & 0x0200) {
              state.check = crc32_1(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            state.length -= copy;
          }
          if (state.length) { break inf_leave; }
        }
        state.length = 0;
        state.mode = NAME;
        /* falls through */
      case NAME:
        if (state.flags & 0x0800) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            // TODO: 2 or 1 bytes?
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.name_max*/)) {
              state.head.name += String.fromCharCode(len);
            }
          } while (len && copy < have);

          if (state.flags & 0x0200) {
            state.check = crc32_1(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.name = null;
        }
        state.length = 0;
        state.mode = COMMENT;
        /* falls through */
      case COMMENT:
        if (state.flags & 0x1000) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.comm_max*/)) {
              state.head.comment += String.fromCharCode(len);
            }
          } while (len && copy < have);
          if (state.flags & 0x0200) {
            state.check = crc32_1(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.comment = null;
        }
        state.mode = HCRC;
        /* falls through */
      case HCRC:
        if (state.flags & 0x0200) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (hold !== (state.check & 0xffff)) {
            strm.msg = 'header crc mismatch';
            state.mode = BAD$1;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        if (state.head) {
          state.head.hcrc = ((state.flags >> 9) & 1);
          state.head.done = true;
        }
        strm.adler = state.check = 0;
        state.mode = TYPE$1;
        break;
      case DICTID:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        strm.adler = state.check = zswap32(hold);
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = DICT;
        /* falls through */
      case DICT:
        if (state.havedict === 0) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          return Z_NEED_DICT;
        }
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = TYPE$1;
        /* falls through */
      case TYPE$1:
        if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case TYPEDO:
        if (state.last) {
          //--- BYTEBITS() ---//
          hold >>>= bits & 7;
          bits -= bits & 7;
          //---//
          state.mode = CHECK;
          break;
        }
        //=== NEEDBITS(3); */
        while (bits < 3) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.last = (hold & 0x01)/*BITS(1)*/;
        //--- DROPBITS(1) ---//
        hold >>>= 1;
        bits -= 1;
        //---//

        switch ((hold & 0x03)/*BITS(2)*/) {
          case 0:                             /* stored block */
            //Tracev((stderr, "inflate:     stored block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = STORED;
            break;
          case 1:                             /* fixed block */
            fixedtables(state);
            //Tracev((stderr, "inflate:     fixed codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = LEN_;             /* decode codes */
            if (flush === Z_TREES) {
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
              break inf_leave;
            }
            break;
          case 2:                             /* dynamic block */
            //Tracev((stderr, "inflate:     dynamic codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = TABLE;
            break;
          case 3:
            strm.msg = 'invalid block type';
            state.mode = BAD$1;
        }
        //--- DROPBITS(2) ---//
        hold >>>= 2;
        bits -= 2;
        //---//
        break;
      case STORED:
        //--- BYTEBITS() ---// /* go to byte boundary */
        hold >>>= bits & 7;
        bits -= bits & 7;
        //---//
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
          strm.msg = 'invalid stored block lengths';
          state.mode = BAD$1;
          break;
        }
        state.length = hold & 0xffff;
        //Tracev((stderr, "inflate:       stored length %u\n",
        //        state.length));
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = COPY_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case COPY_:
        state.mode = COPY;
        /* falls through */
      case COPY:
        copy = state.length;
        if (copy) {
          if (copy > have) { copy = have; }
          if (copy > left) { copy = left; }
          if (copy === 0) { break inf_leave; }
          //--- zmemcpy(put, next, copy); ---
          common.arraySet(output, input, next, copy, put);
          //---//
          have -= copy;
          next += copy;
          left -= copy;
          put += copy;
          state.length -= copy;
          break;
        }
        //Tracev((stderr, "inflate:       stored end\n"));
        state.mode = TYPE$1;
        break;
      case TABLE:
        //=== NEEDBITS(14); */
        while (bits < 14) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
//#ifndef PKZIP_BUG_WORKAROUND
        if (state.nlen > 286 || state.ndist > 30) {
          strm.msg = 'too many length or distance symbols';
          state.mode = BAD$1;
          break;
        }
//#endif
        //Tracev((stderr, "inflate:       table sizes ok\n"));
        state.have = 0;
        state.mode = LENLENS;
        /* falls through */
      case LENLENS:
        while (state.have < state.ncode) {
          //=== NEEDBITS(3);
          while (bits < 3) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
          //--- DROPBITS(3) ---//
          hold >>>= 3;
          bits -= 3;
          //---//
        }
        while (state.have < 19) {
          state.lens[order[state.have++]] = 0;
        }
        // We have separate tables & no pointers. 2 commented lines below not needed.
        //state.next = state.codes;
        //state.lencode = state.next;
        // Switch to use dynamic table
        state.lencode = state.lendyn;
        state.lenbits = 7;

        opts = { bits: state.lenbits };
        ret = inftrees(CODES$1, state.lens, 0, 19, state.lencode, 0, state.work, opts);
        state.lenbits = opts.bits;

        if (ret) {
          strm.msg = 'invalid code lengths set';
          state.mode = BAD$1;
          break;
        }
        //Tracev((stderr, "inflate:       code lengths ok\n"));
        state.have = 0;
        state.mode = CODELENS;
        /* falls through */
      case CODELENS:
        while (state.have < state.nlen + state.ndist) {
          for (;;) {
            here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          if (here_val < 16) {
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            state.lens[state.have++] = here_val;
          }
          else {
            if (here_val === 16) {
              //=== NEEDBITS(here.bits + 2);
              n = here_bits + 2;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              if (state.have === 0) {
                strm.msg = 'invalid bit length repeat';
                state.mode = BAD$1;
                break;
              }
              len = state.lens[state.have - 1];
              copy = 3 + (hold & 0x03);//BITS(2);
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
            }
            else if (here_val === 17) {
              //=== NEEDBITS(here.bits + 3);
              n = here_bits + 3;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 3 + (hold & 0x07);//BITS(3);
              //--- DROPBITS(3) ---//
              hold >>>= 3;
              bits -= 3;
              //---//
            }
            else {
              //=== NEEDBITS(here.bits + 7);
              n = here_bits + 7;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 11 + (hold & 0x7f);//BITS(7);
              //--- DROPBITS(7) ---//
              hold >>>= 7;
              bits -= 7;
              //---//
            }
            if (state.have + copy > state.nlen + state.ndist) {
              strm.msg = 'invalid bit length repeat';
              state.mode = BAD$1;
              break;
            }
            while (copy--) {
              state.lens[state.have++] = len;
            }
          }
        }

        /* handle error breaks in while */
        if (state.mode === BAD$1) { break; }

        /* check for end-of-block code (better have one) */
        if (state.lens[256] === 0) {
          strm.msg = 'invalid code -- missing end-of-block';
          state.mode = BAD$1;
          break;
        }

        /* build code tables -- note: do not change the lenbits or distbits
           values here (9 and 6) without reading the comments in inftrees.h
           concerning the ENOUGH constants, which depend on those values */
        state.lenbits = 9;

        opts = { bits: state.lenbits };
        ret = inftrees(LENS$1, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.lenbits = opts.bits;
        // state.lencode = state.next;

        if (ret) {
          strm.msg = 'invalid literal/lengths set';
          state.mode = BAD$1;
          break;
        }

        state.distbits = 6;
        //state.distcode.copy(state.codes);
        // Switch to use dynamic table
        state.distcode = state.distdyn;
        opts = { bits: state.distbits };
        ret = inftrees(DISTS$1, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.distbits = opts.bits;
        // state.distcode = state.next;

        if (ret) {
          strm.msg = 'invalid distances set';
          state.mode = BAD$1;
          break;
        }
        //Tracev((stderr, 'inflate:       codes ok\n'));
        state.mode = LEN_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case LEN_:
        state.mode = LEN;
        /* falls through */
      case LEN:
        if (have >= 6 && left >= 258) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          inffast(strm, _out);
          //--- LOAD() ---
          put = strm.next_out;
          output = strm.output;
          left = strm.avail_out;
          next = strm.next_in;
          input = strm.input;
          have = strm.avail_in;
          hold = state.hold;
          bits = state.bits;
          //---

          if (state.mode === TYPE$1) {
            state.back = -1;
          }
          break;
        }
        state.back = 0;
        for (;;) {
          here = state.lencode[hold & ((1 << state.lenbits) - 1)];  /*BITS(state.lenbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if (here_bits <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if (here_op && (here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.lencode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        state.length = here_val;
        if (here_op === 0) {
          //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
          //        "inflate:         literal '%c'\n" :
          //        "inflate:         literal 0x%02x\n", here.val));
          state.mode = LIT;
          break;
        }
        if (here_op & 32) {
          //Tracevv((stderr, "inflate:         end of block\n"));
          state.back = -1;
          state.mode = TYPE$1;
          break;
        }
        if (here_op & 64) {
          strm.msg = 'invalid literal/length code';
          state.mode = BAD$1;
          break;
        }
        state.extra = here_op & 15;
        state.mode = LENEXT;
        /* falls through */
      case LENEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
        //Tracevv((stderr, "inflate:         length %u\n", state.length));
        state.was = state.length;
        state.mode = DIST;
        /* falls through */
      case DIST:
        for (;;) {
          here = state.distcode[hold & ((1 << state.distbits) - 1)];/*BITS(state.distbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if ((here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.distcode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        if (here_op & 64) {
          strm.msg = 'invalid distance code';
          state.mode = BAD$1;
          break;
        }
        state.offset = here_val;
        state.extra = (here_op) & 15;
        state.mode = DISTEXT;
        /* falls through */
      case DISTEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.offset += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
//#ifdef INFLATE_STRICT
        if (state.offset > state.dmax) {
          strm.msg = 'invalid distance too far back';
          state.mode = BAD$1;
          break;
        }
//#endif
        //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
        state.mode = MATCH;
        /* falls through */
      case MATCH:
        if (left === 0) { break inf_leave; }
        copy = _out - left;
        if (state.offset > copy) {         /* copy from window */
          copy = state.offset - copy;
          if (copy > state.whave) {
            if (state.sane) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD$1;
              break;
            }
// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//          Trace((stderr, "inflate.c too far\n"));
//          copy -= state.whave;
//          if (copy > state.length) { copy = state.length; }
//          if (copy > left) { copy = left; }
//          left -= copy;
//          state.length -= copy;
//          do {
//            output[put++] = 0;
//          } while (--copy);
//          if (state.length === 0) { state.mode = LEN; }
//          break;
//#endif
          }
          if (copy > state.wnext) {
            copy -= state.wnext;
            from = state.wsize - copy;
          }
          else {
            from = state.wnext - copy;
          }
          if (copy > state.length) { copy = state.length; }
          from_source = state.window;
        }
        else {                              /* copy from output */
          from_source = output;
          from = put - state.offset;
          copy = state.length;
        }
        if (copy > left) { copy = left; }
        left -= copy;
        state.length -= copy;
        do {
          output[put++] = from_source[from++];
        } while (--copy);
        if (state.length === 0) { state.mode = LEN; }
        break;
      case LIT:
        if (left === 0) { break inf_leave; }
        output[put++] = state.length;
        left--;
        state.mode = LEN;
        break;
      case CHECK:
        if (state.wrap) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            // Use '|' instead of '+' to make sure that result is signed
            hold |= input[next++] << bits;
            bits += 8;
          }
          //===//
          _out -= left;
          strm.total_out += _out;
          state.total += _out;
          if (_out) {
            strm.adler = state.check =
                /*UPDATE(state.check, put - _out, _out);*/
                (state.flags ? crc32_1(state.check, output, _out, put - _out) : adler32_1(state.check, output, _out, put - _out));

          }
          _out = left;
          // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
          if ((state.flags ? hold : zswap32(hold)) !== state.check) {
            strm.msg = 'incorrect data check';
            state.mode = BAD$1;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   check matches trailer\n"));
        }
        state.mode = LENGTH;
        /* falls through */
      case LENGTH:
        if (state.wrap && state.flags) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (hold !== (state.total & 0xffffffff)) {
            strm.msg = 'incorrect length check';
            state.mode = BAD$1;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   length matches trailer\n"));
        }
        state.mode = DONE;
        /* falls through */
      case DONE:
        ret = Z_STREAM_END;
        break inf_leave;
      case BAD$1:
        ret = Z_DATA_ERROR;
        break inf_leave;
      case MEM:
        return Z_MEM_ERROR;
      case SYNC:
        /* falls through */
      default:
        return Z_STREAM_ERROR;
    }
  }

  // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

  /*
     Return from inflate(), updating the total counts and the check value.
     If there was no progress during the inflate() call, return a buffer
     error.  Call updatewindow() to create and/or update the window state.
     Note: a memory error from inflate() is non-recoverable.
   */

  //--- RESTORE() ---
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  //---

  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD$1 &&
                      (state.mode < CHECK || flush !== Z_FINISH))) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
      state.mode = MEM;
      return Z_MEM_ERROR;
    }
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if (state.wrap && _out) {
    strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
      (state.flags ? crc32_1(state.check, output, _out, strm.next_out - _out) : adler32_1(state.check, output, _out, strm.next_out - _out));
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) +
                    (state.mode === TYPE$1 ? 128 : 0) +
                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {
    ret = Z_BUF_ERROR;
  }
  return ret;
}

function inflateEnd(strm) {

  if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/) {
    return Z_STREAM_ERROR;
  }

  var state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK;
}

function inflateGetHeader(strm, head) {
  var state;

  /* check state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR; }

  /* save header structure */
  state.head = head;
  head.done = false;
  return Z_OK;
}

function inflateSetDictionary(strm, dictionary) {
  var dictLength = dictionary.length;

  var state;
  var dictid;
  var ret;

  /* check state */
  if (!strm /* == Z_NULL */ || !strm.state /* == Z_NULL */) { return Z_STREAM_ERROR; }
  state = strm.state;

  if (state.wrap !== 0 && state.mode !== DICT) {
    return Z_STREAM_ERROR;
  }

  /* check for correct dictionary identifier */
  if (state.mode === DICT) {
    dictid = 1; /* adler32(0, null, 0)*/
    /* dictid = adler32(dictid, dictionary, dictLength); */
    dictid = adler32_1(dictid, dictionary, dictLength, 0);
    if (dictid !== state.check) {
      return Z_DATA_ERROR;
    }
  }
  /* copy dictionary to window using updatewindow(), which will amend the
   existing dictionary if appropriate */
  ret = updatewindow(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state.mode = MEM;
    return Z_MEM_ERROR;
  }
  state.havedict = 1;
  // Tracev((stderr, "inflate:   dictionary set\n"));
  return Z_OK;
}

var inflateReset_1 = inflateReset;
var inflateReset2_1 = inflateReset2;
var inflateResetKeep_1 = inflateResetKeep;
var inflateInit_1 = inflateInit;
var inflateInit2_1 = inflateInit2;
var inflate_2 = inflate;
var inflateEnd_1 = inflateEnd;
var inflateGetHeader_1 = inflateGetHeader;
var inflateSetDictionary_1 = inflateSetDictionary;
var inflateInfo = 'pako inflate (from Nodeca project)';

/* Not implemented
exports.inflateCopy = inflateCopy;
exports.inflateGetDictionary = inflateGetDictionary;
exports.inflateMark = inflateMark;
exports.inflatePrime = inflatePrime;
exports.inflateSync = inflateSync;
exports.inflateSyncPoint = inflateSyncPoint;
exports.inflateUndermine = inflateUndermine;
*/

var inflate_1 = {
	inflateReset: inflateReset_1,
	inflateReset2: inflateReset2_1,
	inflateResetKeep: inflateResetKeep_1,
	inflateInit: inflateInit_1,
	inflateInit2: inflateInit2_1,
	inflate: inflate_2,
	inflateEnd: inflateEnd_1,
	inflateGetHeader: inflateGetHeader_1,
	inflateSetDictionary: inflateSetDictionary_1,
	inflateInfo: inflateInfo
};

// Quick check if we can use fast array to bin string conversion
//
// - apply(Array) can fail on Android 2.2
// - apply(Uint8Array) can fail on iOS 5.1 Safari
//
var STR_APPLY_OK = true;
var STR_APPLY_UIA_OK = true;

try { String.fromCharCode.apply(null, [ 0 ]); } catch (__) { STR_APPLY_OK = false; }
try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch (__) { STR_APPLY_UIA_OK = false; }


// Table with utf8 lengths (calculated by first byte of sequence)
// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
// because max possible codepoint is 0x10ffff
var _utf8len = new common.Buf8(256);
for (var q = 0; q < 256; q++) {
  _utf8len[q] = (q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1);
}
_utf8len[254] = _utf8len[254] = 1; // Invalid sequence start


// convert string to array (typed, when possible)
var string2buf = function (str) {
  var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

  // count binary size
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }

  // allocate buffer
  buf = new common.Buf8(buf_len);

  // convert
  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    if (c < 0x80) {
      /* one byte */
      buf[i++] = c;
    } else if (c < 0x800) {
      /* two bytes */
      buf[i++] = 0xC0 | (c >>> 6);
      buf[i++] = 0x80 | (c & 0x3f);
    } else if (c < 0x10000) {
      /* three bytes */
      buf[i++] = 0xE0 | (c >>> 12);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    } else {
      /* four bytes */
      buf[i++] = 0xf0 | (c >>> 18);
      buf[i++] = 0x80 | (c >>> 12 & 0x3f);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    }
  }

  return buf;
};

// Helper (used in 2 places)
function buf2binstring(buf, len) {
  // use fallback for big arrays to avoid stack overflow
  if (len < 65537) {
    if ((buf.subarray && STR_APPLY_UIA_OK) || (!buf.subarray && STR_APPLY_OK)) {
      return String.fromCharCode.apply(null, common.shrinkBuf(buf, len));
    }
  }

  var result = '';
  for (var i = 0; i < len; i++) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
}


// Convert byte array to binary string
var buf2binstring_1 = function (buf) {
  return buf2binstring(buf, buf.length);
};


// Convert binary string (typed, when possible)
var binstring2buf = function (str) {
  var buf = new common.Buf8(str.length);
  for (var i = 0, len = buf.length; i < len; i++) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
};


// convert array to string
var buf2string = function (buf, max) {
  var i, out, c, c_len;
  var len = max || buf.length;

  // Reserve max possible length (2 words per char)
  // NB: by unknown reasons, Array is significantly faster for
  //     String.fromCharCode.apply than Uint16Array.
  var utf16buf = new Array(len * 2);

  for (out = 0, i = 0; i < len;) {
    c = buf[i++];
    // quick process ascii
    if (c < 0x80) { utf16buf[out++] = c; continue; }

    c_len = _utf8len[c];
    // skip 5 & 6 byte codes
    if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len - 1; continue; }

    // apply mask on first byte
    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
    // join the rest
    while (c_len > 1 && i < len) {
      c = (c << 6) | (buf[i++] & 0x3f);
      c_len--;
    }

    // terminated by end of string?
    if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

    if (c < 0x10000) {
      utf16buf[out++] = c;
    } else {
      c -= 0x10000;
      utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
      utf16buf[out++] = 0xdc00 | (c & 0x3ff);
    }
  }

  return buf2binstring(utf16buf, out);
};


// Calculate max possible position in utf8 buffer,
// that will not break sequence. If that's not possible
// - (very small limits) return max size as is.
//
// buf[] - utf8 bytes array
// max   - length limit (mandatory);
var utf8border = function (buf, max) {
  var pos;

  max = max || buf.length;
  if (max > buf.length) { max = buf.length; }

  // go back from last position, until start of sequence found
  pos = max - 1;
  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

  // Very small and broken sequence,
  // return max, because we should return something anyway.
  if (pos < 0) { return max; }

  // If we came to start of buffer - that means buffer is too small,
  // return max too.
  if (pos === 0) { return max; }

  return (pos + _utf8len[buf[pos]] > max) ? pos : max;
};

var strings = {
	string2buf: string2buf,
	buf2binstring: buf2binstring_1,
	binstring2buf: binstring2buf,
	buf2string: buf2string,
	utf8border: utf8border
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var constants = {

  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH:         0,
  Z_PARTIAL_FLUSH:    1,
  Z_SYNC_FLUSH:       2,
  Z_FULL_FLUSH:       3,
  Z_FINISH:           4,
  Z_BLOCK:            5,
  Z_TREES:            6,

  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK:               0,
  Z_STREAM_END:       1,
  Z_NEED_DICT:        2,
  Z_ERRNO:           -1,
  Z_STREAM_ERROR:    -2,
  Z_DATA_ERROR:      -3,
  //Z_MEM_ERROR:     -4,
  Z_BUF_ERROR:       -5,
  //Z_VERSION_ERROR: -6,

  /* compression levels */
  Z_NO_COMPRESSION:         0,
  Z_BEST_SPEED:             1,
  Z_BEST_COMPRESSION:       9,
  Z_DEFAULT_COMPRESSION:   -1,


  Z_FILTERED:               1,
  Z_HUFFMAN_ONLY:           2,
  Z_RLE:                    3,
  Z_FIXED:                  4,
  Z_DEFAULT_STRATEGY:       0,

  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY:                 0,
  Z_TEXT:                   1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN:                2,

  /* The deflate compression method */
  Z_DEFLATED:               8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var messages = {
  2:      'need dictionary',     /* Z_NEED_DICT       2  */
  1:      'stream end',          /* Z_STREAM_END      1  */
  0:      '',                    /* Z_OK              0  */
  '-1':   'file error',          /* Z_ERRNO         (-1) */
  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function ZStream() {
  /* next input byte */
  this.input = null; // JS specific, because we have no pointers
  this.next_in = 0;
  /* number of bytes available at input */
  this.avail_in = 0;
  /* total number of input bytes read so far */
  this.total_in = 0;
  /* next output byte should be put there */
  this.output = null; // JS specific, because we have no pointers
  this.next_out = 0;
  /* remaining free space at output */
  this.avail_out = 0;
  /* total number of bytes output so far */
  this.total_out = 0;
  /* last error message, NULL if no error */
  this.msg = ''/*Z_NULL*/;
  /* not visible by applications */
  this.state = null;
  /* best guess about the data type: binary or text */
  this.data_type = 2/*Z_UNKNOWN*/;
  /* adler32 value of the uncompressed data */
  this.adler = 0;
}

var zstream = ZStream;

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function GZheader() {
  /* true if compressed data believed to be text */
  this.text       = 0;
  /* modification time */
  this.time       = 0;
  /* extra flags (not used when writing a gzip file) */
  this.xflags     = 0;
  /* operating system */
  this.os         = 0;
  /* pointer to extra field or Z_NULL if none */
  this.extra      = null;
  /* extra field length (valid if extra != Z_NULL) */
  this.extra_len  = 0; // Actually, we don't need it in JS,
                       // but leave for few code modifications

  //
  // Setup limits is not necessary because in js we should not preallocate memory
  // for inflate use constant limit in 65536 bytes
  //

  /* space at extra (only when reading header) */
  // this.extra_max  = 0;
  /* pointer to zero-terminated file name or Z_NULL */
  this.name       = '';
  /* space at name (only when reading header) */
  // this.name_max   = 0;
  /* pointer to zero-terminated comment or Z_NULL */
  this.comment    = '';
  /* space at comment (only when reading header) */
  // this.comm_max   = 0;
  /* true if there was or will be a header crc */
  this.hcrc       = 0;
  /* true when done reading gzip header (not used when writing a gzip file) */
  this.done       = false;
}

var gzheader = GZheader;

var toString = Object.prototype.toString;

/**
 * class Inflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[inflate]]
 * and [[inflateRaw]].
 **/

/* internal
 * inflate.chunks -> Array
 *
 * Chunks of output data, if [[Inflate#onData]] not overridden.
 **/

/**
 * Inflate.result -> Uint8Array|Array|String
 *
 * Uncompressed result, generated by default [[Inflate#onData]]
 * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Inflate#push]] with `Z_FINISH` / `true` param) or if you
 * push a chunk with explicit flush (call [[Inflate#push]] with
 * `Z_SYNC_FLUSH` param).
 **/

/**
 * Inflate.err -> Number
 *
 * Error code after inflate finished. 0 (Z_OK) on success.
 * Should be checked if broken data possible.
 **/

/**
 * Inflate.msg -> String
 *
 * Error message, if [[Inflate.err]] != 0
 **/


/**
 * new Inflate(options)
 * - options (Object): zlib inflate options.
 *
 * Creates new inflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `windowBits`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw inflate
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 * By default, when no options set, autodetect deflate/gzip data format via
 * wrapper header.
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * var inflate = new pako.Inflate({ level: 3});
 *
 * inflate.push(chunk1, false);
 * inflate.push(chunk2, true);  // true -> last chunk
 *
 * if (inflate.err) { throw new Error(inflate.err); }
 *
 * console.log(inflate.result);
 * ```
 **/
function Inflate(options) {
  if (!(this instanceof Inflate)) return new Inflate(options);

  this.options = common.assign({
    chunkSize: 16384,
    windowBits: 0,
    to: ''
  }, options || {});

  var opt = this.options;

  // Force window size for `raw` data, if not set directly,
  // because we have no header for autodetect.
  if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) { opt.windowBits = -15; }
  }

  // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
  if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
      !(options && options.windowBits)) {
    opt.windowBits += 32;
  }

  // Gzip header has no info about windows size, we can do autodetect only
  // for deflate. So, if window size not set, force it to max when gzip possible
  if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
    // bit 3 (16) -> gzipped data
    // bit 4 (32) -> autodetect gzip/deflate
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm   = new zstream();
  this.strm.avail_out = 0;

  var status  = inflate_1.inflateInit2(
    this.strm,
    opt.windowBits
  );

  if (status !== constants.Z_OK) {
    throw new Error(messages[status]);
  }

  this.header = new gzheader();

  inflate_1.inflateGetHeader(this.strm, this.header);
}

/**
 * Inflate#push(data[, mode]) -> Boolean
 * - data (Uint8Array|Array|ArrayBuffer|String): input data
 * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
 *
 * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
 * new output chunks. Returns `true` on success. The last data block must have
 * mode Z_FINISH (or `true`). That will flush internal pending buffers and call
 * [[Inflate#onEnd]]. For interim explicit flushes (without ending the stream) you
 * can use mode Z_SYNC_FLUSH, keeping the decompression context.
 *
 * On fail call [[Inflate#onEnd]] with error code and return false.
 *
 * We strongly recommend to use `Uint8Array` on input for best speed (output
 * format is detected automatically). Also, don't skip last param and always
 * use the same type in your code (boolean or number). That will improve JS speed.
 *
 * For regular `Array`-s make sure all elements are [0..255].
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Inflate.prototype.push = function (data, mode) {
  var strm = this.strm;
  var chunkSize = this.options.chunkSize;
  var dictionary = this.options.dictionary;
  var status, _mode;
  var next_out_utf8, tail, utf8str;
  var dict;

  // Flag to properly process Z_BUF_ERROR on testing inflate call
  // when we check that all output data was flushed.
  var allowBufError = false;

  if (this.ended) { return false; }
  _mode = (mode === ~~mode) ? mode : ((mode === true) ? constants.Z_FINISH : constants.Z_NO_FLUSH);

  // Convert data if needed
  if (typeof data === 'string') {
    // Only binary strings can be decompressed on practice
    strm.input = strings.binstring2buf(data);
  } else if (toString.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  do {
    if (strm.avail_out === 0) {
      strm.output = new common.Buf8(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    status = inflate_1.inflate(strm, constants.Z_NO_FLUSH);    /* no bad return value */

    if (status === constants.Z_NEED_DICT && dictionary) {
      // Convert data if needed
      if (typeof dictionary === 'string') {
        dict = strings.string2buf(dictionary);
      } else if (toString.call(dictionary) === '[object ArrayBuffer]') {
        dict = new Uint8Array(dictionary);
      } else {
        dict = dictionary;
      }

      status = inflate_1.inflateSetDictionary(this.strm, dict);

    }

    if (status === constants.Z_BUF_ERROR && allowBufError === true) {
      status = constants.Z_OK;
      allowBufError = false;
    }

    if (status !== constants.Z_STREAM_END && status !== constants.Z_OK) {
      this.onEnd(status);
      this.ended = true;
      return false;
    }

    if (strm.next_out) {
      if (strm.avail_out === 0 || status === constants.Z_STREAM_END || (strm.avail_in === 0 && (_mode === constants.Z_FINISH || _mode === constants.Z_SYNC_FLUSH))) {

        if (this.options.to === 'string') {

          next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

          tail = strm.next_out - next_out_utf8;
          utf8str = strings.buf2string(strm.output, next_out_utf8);

          // move tail
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail) { common.arraySet(strm.output, strm.output, next_out_utf8, tail, 0); }

          this.onData(utf8str);

        } else {
          this.onData(common.shrinkBuf(strm.output, strm.next_out));
        }
      }
    }

    // When no more input data, we should check that internal inflate buffers
    // are flushed. The only way to do it when avail_out = 0 - run one more
    // inflate pass. But if output data not exists, inflate return Z_BUF_ERROR.
    // Here we set flag to process this error properly.
    //
    // NOTE. Deflate does not return error in this case and does not needs such
    // logic.
    if (strm.avail_in === 0 && strm.avail_out === 0) {
      allowBufError = true;
    }

  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== constants.Z_STREAM_END);

  if (status === constants.Z_STREAM_END) {
    _mode = constants.Z_FINISH;
  }

  // Finalize on the last chunk.
  if (_mode === constants.Z_FINISH) {
    status = inflate_1.inflateEnd(this.strm);
    this.onEnd(status);
    this.ended = true;
    return status === constants.Z_OK;
  }

  // callback interim results if Z_SYNC_FLUSH.
  if (_mode === constants.Z_SYNC_FLUSH) {
    this.onEnd(constants.Z_OK);
    strm.avail_out = 0;
    return true;
  }

  return true;
};


/**
 * Inflate#onData(chunk) -> Void
 * - chunk (Uint8Array|Array|String): output data. Type of array depends
 *   on js engine support. When string output requested, each chunk
 *   will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Inflate.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Inflate#onEnd(status) -> Void
 * - status (Number): inflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called either after you tell inflate that the input stream is
 * complete (Z_FINISH) or should be flushed (Z_SYNC_FLUSH)
 * or if an error happened. By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Inflate.prototype.onEnd = function (status) {
  // On success - join
  if (status === constants.Z_OK) {
    if (this.options.to === 'string') {
      // Glue & convert here, until we teach pako to send
      // utf8 aligned strings to onData
      this.result = this.chunks.join('');
    } else {
      this.result = common.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * inflate(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Decompress `data` with inflate/ungzip and `options`. Autodetect
 * format via wrapper header by default. That's why we don't provide
 * separate `ungzip` method.
 *
 * Supported options are:
 *
 * - windowBits
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , input = pako.deflate([1,2,3,4,5,6,7,8,9])
 *   , output;
 *
 * try {
 *   output = pako.inflate(input);
 * } catch (err)
 *   console.log(err);
 * }
 * ```
 **/
function inflate$1(input, options) {
  var inflator = new Inflate(options);

  inflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (inflator.err) { throw inflator.msg || messages[inflator.err]; }

  return inflator.result;
}


/**
 * inflateRaw(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * The same as [[inflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function inflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return inflate$1(input, options);
}


/**
 * ungzip(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Just shortcut to [[inflate]], because it autodetects format
 * by header.content. Done for convenience.
 **/


var Inflate_1 = Inflate;
var inflate_2$1 = inflate$1;
var inflateRaw_1 = inflateRaw;
var ungzip  = inflate$1;

var inflate_1$1 = {
	Inflate: Inflate_1,
	inflate: inflate_2$1,
	inflateRaw: inflateRaw_1,
	ungzip: ungzip
};

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LITTLE_ENDIAN = true;

var _class = function () {
	function _class(buffer) {
		_classCallCheck(this, _class);

		this.dataView = new DataView(buffer);
		this.position = 0;
	}

	_class.prototype.skip = function skip(length) {

		this.position += length;
	};

	_class.prototype.readBytes = function readBytes(length) {

		var type = length === 4 ? 'getUint32' : length === 2 ? 'getUint16' : 'getUint8';
		var start = this.position;
		this.position += length;
		return this.dataView[type](start, LITTLE_ENDIAN);
	};

	return _class;
}();

var LOCAL_FILE_HEADER = 0x04034b50;
var CENTRAL_DIRECTORY = 0x02014b50;
// const END_OF_CENTRAL_DIRECTORY = 0x06054b50;

var parseZip = function parseZip(buffer) {

	var reader = new _class(buffer);
	var files = {};

	while (true) {

		var signature = reader.readBytes(4);

		if (signature === LOCAL_FILE_HEADER) {

			var file = parseLocalFile(reader);
			files[file.name] = { buffer: file.buffer };
			continue;
		}

		if (signature === CENTRAL_DIRECTORY) {

			parseCentralDirectory(reader);
			continue;
		}

		break;
	}

	return files;
};

// # Local file header
// 
// | Offset |  Length  | Contents                                 |
// | ------ | -------- | ---------------------------------------- |
// |   0    |  4 bytes | Local file header signature (0x04034b50) |
// |   4    |  2 bytes | Version needed to extract                |
// |   6    |  2 bytes | General purpose bit flag                 |
// |   8    |  2 bytes | Compression method                       |
// |  10    |  2 bytes | Last mod file time                       |
// |  12    |  2 bytes | Last mod file date                       |
// |  14    |  4 bytes | CRC-32                                   |
// |  18    |  4 bytes | Compressed size (n)                      |
// |  22    |  4 bytes | Uncompressed size                        |
// |  26    |  2 bytes | Filename length (f)                      |
// |  28    |  2 bytes | Extra field length (e)                   |
// |        | (f)bytes | Filename                                 |
// |        | (e)bytes | Extra field                              |
// |        | (n)bytes | Compressed data                          |
var parseLocalFile = function parseLocalFile(reader) {

	var i = 0;
	var data = void 0;
	reader.skip(4);
	// const version          = reader.readBytes( 2 );
	// const bitFlag          = reader.readBytes( 2 );
	var compression = reader.readBytes(2);
	reader.skip(8);
	// const lastModTime      = reader.readBytes( 2 );
	// const lastModDate      = reader.readBytes( 2 );
	// const crc32            = reader.readBytes( 4 );
	var compressedSize = reader.readBytes(4);
	reader.skip(4);
	// const uncompressedSize = reader.readBytes( 4 );
	var filenameLength = reader.readBytes(2);
	var extraFieldLength = reader.readBytes(2);
	var filename = [];
	// const extraField     = [];
	var compressedData = new Uint8Array(compressedSize);

	for (i = 0; i < filenameLength; i++) {

		filename.push(String.fromCharCode(reader.readBytes(1)));
	}

	reader.skip(extraFieldLength);
	// for ( i = 0; i < extraFieldLength; i ++ ) {

	// 	extraField.push( reader.readBytes( 1 ) );

	// }

	for (i = 0; i < compressedSize; i++) {

		compressedData[i] = reader.readBytes(1);
	}

	switch (compression) {

		case 0:
			data = compressedData;
			break;
		case 8:
			data = new Uint8Array(inflate_1$1.inflate(compressedData, { raw: true }));
			break;
		default:
			console.log(filename.join('') + ': unsupported compression type');
			data = compressedData;

	}

	return {
		name: filename.join(''),
		buffer: data
	};
};

// # Central directory
//
// | Offset |  Length  | Contents                                   |
// | ------ | -------- | ------------------------------------------ |
// |   0    |  4 bytes | Central file header signature (0x02014b50) |
// |   4    |  2 bytes | Version made by                            |
// |   6    |  2 bytes | Version needed to extract                  |
// |   8    |  2 bytes | General purpose bit flag                   |
// |  10    |  2 bytes | Compression method                         |
// |  12    |  2 bytes | Last mod file time                         |
// |  14    |  2 bytes | Last mod file date                         |
// |  16    |  4 bytes | CRC-32                                     |
// |  20    |  4 bytes | Compressed size                            |
// |  24    |  4 bytes | Uncompressed size                          |
// |  28    |  2 bytes | Filename length (f)                        |
// |  30    |  2 bytes | Extra field length (e)                     |
// |  32    |  2 bytes | File comment length (c)                    |
// |  34    |  2 bytes | Disk number start                          |
// |  36    |  2 bytes | Internal file attributes                   |
// |  38    |  4 bytes | External file attributes                   |
// |  42    |  4 bytes | Relative offset of local header            |
// |  46    | (f)bytes | Filename                                   |
// |        | (e)bytes | Extra field                                |
// |        | (c)bytes | File comment                               |
var parseCentralDirectory = function parseCentralDirectory(reader) {

	// let i = 0;
	reader.skip(24);
	// const versionMadeby        = reader.readBytes( 2 );
	// const versionNeedToExtract = reader.readBytes( 2 );
	// const bitFlag              = reader.readBytes( 2 );
	// const compression          = reader.readBytes( 2 );
	// const lastModTime          = reader.readBytes( 2 );
	// const lastModDate          = reader.readBytes( 2 );
	// const crc32                = reader.readBytes( 4 );
	// const compressedSize       = reader.readBytes( 4 );
	// const uncompressedSize     = reader.readBytes( 4 );
	var filenameLength = reader.readBytes(2);
	var extraFieldLength = reader.readBytes(2);
	var fileCommentLength = reader.readBytes(2);
	reader.skip(12);
	// const diskNumberStart      = reader.readBytes( 2 );
	// const internalFileAttrs    = reader.readBytes( 2 );
	// const externalFileAttrs    = reader.readBytes( 4 );
	// const relativeOffset       = reader.readBytes( 4 );
	// const filename    = [];
	// const extraField  = [];
	// const fileComment = [];

	reader.skip(filenameLength);
	// for ( i = 0; i < filenameLength; i ++ ) {

	// 	filename.push( String.fromCharCode( reader.readBytes( 1 ) ) );

	// }

	reader.skip(extraFieldLength);
	// for ( i = 0; i < extraFieldLength; i ++ ) {

	// 	extraField.push( reader.readBytes( 1 ) );

	// }

	reader.skip(fileCommentLength);
	// for ( i = 0; i < fileCommentLength; i ++ ) {

	// 	fileComment.push( reader.readBytes( 1 ) );

	// }
};

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isPromiseSuppoted = typeof Promise === 'function';
var PromiseLike = isPromiseSuppoted ? Promise : function PromiseLike(executor) {
	_classCallCheck$1(this, PromiseLike);

	var callback = function callback() {};
	var resolve = function resolve() {

		callback();
	};

	executor(resolve);

	return {
		then: function then(_callback) {

			callback = _callback;
		}
	};
};

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
var count = 0;
var THREE = void 0;

var ZipLoader = function () {
	ZipLoader.unzip = function unzip(blobOrFile) {

		return new PromiseLike(function (resolve) {

			var instance = new ZipLoader();
			var fileReader = new FileReader();

			fileReader.onload = function (event) {

				var arrayBuffer = event.target.result;
				instance.files = parseZip(arrayBuffer);
				resolve(instance);
			};

			if (blobOrFile instanceof Blob) {

				fileReader.readAsArrayBuffer(blobOrFile);
			}
		});
	};

	function ZipLoader(url) {
		_classCallCheck$2(this, ZipLoader);

		this._id = count;
		this._listeners = {};
		this.url = url;
		this.files = null;
		count++;
	}

	ZipLoader.prototype.load = function load() {
		var _this = this;

		return new PromiseLike(function (resolve) {

			var startTime = Date.now();
			var xhr = new XMLHttpRequest();
			xhr.open('GET', _this.url, true);
			xhr.responseType = 'arraybuffer';

			xhr.onprogress = function (e) {

				_this.dispatch({
					type: 'progress',
					loaded: e.loaded,
					total: e.total,
					elapsedTime: Date.now() - startTime
				});
			};

			xhr.onload = function () {

				_this.files = parseZip(xhr.response);
				_this.dispatch({
					type: 'load',
					elapsedTime: Date.now() - startTime
				});
				resolve();
			};

			xhr.onerror = function (e) {

				_this.dispatch({
					type: 'error',
					error: e
				});
			};

			xhr.send();
		});
	};

	ZipLoader.prototype.extractAsBlobUrl = function extractAsBlobUrl(filename, type) {

		if (this.files[filename].url) {

			return this.files[filename].url;
		}

		var blob = new Blob([this.files[filename].buffer], { type: type });
		this.files[filename].url = URL.createObjectURL(blob);
		return this.files[filename].url;
	};

	ZipLoader.prototype.extractAsText = function extractAsText(filename) {

		var buffer = this.files[filename].buffer;

		if (typeof TextDecoder !== 'undefined') {

			return new TextDecoder().decode(buffer);
		}

		var str = '';

		for (var i = 0, l = buffer.length; i < l; i++) {

			str += String.fromCharCode(buffer[i]);
		}

		return decodeURIComponent(escape(str));
	};

	ZipLoader.prototype.extractAsJSON = function extractAsJSON(filename) {

		return JSON.parse(this.extractAsText(filename));
	};

	ZipLoader.prototype.loadThreeJSON = function loadThreeJSON(filename) {
		var _this2 = this;

		var json = this.extractAsJSON(filename);
		var dirName = filename.replace(/\/.+\.json$/, '/');
		var pattern = '__ziploader_' + this._id + '__';
		var regex = new RegExp(pattern);

		if (!THREE.Loader.Handlers.handlers.indexOf(regex) !== -1) {

			THREE.Loader.Handlers.add(regex, {
				load: function load(filename) {

					return _this2.loadThreeTexture(filename.replace(regex, ''));
				}
			});
		}

		return THREE.JSONLoader.prototype.parse(json, pattern + dirName);
	};

	ZipLoader.prototype.loadThreeTexture = function loadThreeTexture(filename) {

		var texture = new THREE.Texture();
		var type = /\.jpg$/.test(filename) ? 'image/jpeg' : /\.png$/.test(filename) ? 'image/png' : /\.gif$/.test(filename) ? 'image/gif' : undefined;
		var blob = new Blob([this.files[filename].buffer], { type: type });

		var onload = function onload() {

			texture.needsUpdate = true;
			texture.image.removeEventListener('load', onload);
			URL.revokeObjectURL(texture.image.src);
		};

		texture.image = new Image();
		texture.image.addEventListener('load', onload);
		texture.image.src = URL.createObjectURL(blob);
		return texture;
	};

	ZipLoader.prototype.on = function on(type, listener) {

		if (!this._listeners[type]) {

			this._listeners[type] = [];
		}

		if (this._listeners[type].indexOf(listener) === -1) {

			this._listeners[type].push(listener);
		}
	};

	ZipLoader.prototype.off = function off(type, listener) {

		var listenerArray = this._listeners[type];

		if (!!listenerArray) {

			var index = listenerArray.indexOf(listener);

			if (index !== -1) {

				listenerArray.splice(index, 1);
			}
		}
	};

	ZipLoader.prototype.dispatch = function dispatch(event) {

		var listenerArray = this._listeners[event.type];

		if (!!listenerArray) {

			event.target = this;
			var length = listenerArray.length;

			for (var i = 0; i < length; i++) {

				listenerArray[i].call(this, event);
			}
		}
	};

	ZipLoader.prototype.clear = function clear(filename) {

		if (!!filename) {

			URL.revokeObjectURL(this.files[filename].url);
			delete this.files[filename];
			return;
		}

		for (var key in this.files) {

			URL.revokeObjectURL(this.files[key].url);
		}

		delete this.files;

		if (!!THREE) {

			var pattern = '__ziploader_' + this._id + '__';

			THREE.Loader.Handlers.handlers.some(function (el, i) {

				if (el instanceof RegExp && el.source === pattern) {

					THREE.Loader.Handlers.handlers.splice(i, 2);
					return true;
				}
			});
		}
	};

	ZipLoader.install = function install(option) {

		if (!!option.THREE) {

			THREE = option.THREE;
		}
	};

	return ZipLoader;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ZipLoader);


/***/ }),
/* 72 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./index.js": 73
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 72;

/***/ }),
/* 73 */
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/* global localStorage */
var utils = __webpack_require__(23);

const DEBUG_CHALLENGE = {
  author: 'Superman',
  difficulty: 'Expert',
  id: '31',
  image: 'assets/img/molerat.jpg',
  songName: 'Friday',
  songSubName: 'Rebecca Black'
};

const emptyChallenge = {
  audio: '',
  author: '',
  difficulty: '',
  id: '',
  image: 'assets/img/logo.png',
  songName: '',
  songNameMedium: '',
  songNameShort: '',
  songSubName: '',
  songSubNameShort: ''
};

const isSafari = navigator.userAgent.toLowerCase().indexOf('safari') !== -1 && navigator.userAgent.toLowerCase().indexOf('chrome') === -1;

/**
 * State handler.
 *
 * 1. `handlers` is an object of events that when emitted to the scene will run the handler.
 *
 * 2. The handler function modifies the state.
 *
 * 3. Entities and components that are `bind`ed automatically update:
 *    `bind__<componentName>="<propertyName>: some.item.in.state"`
 */
AFRAME.registerState({
  initialState: {
    challenge: Object.assign({ // Actively playing challenge.
      hasLoadError: isSafari,
      isLoading: false,
      isBeatsPreloaded: false, // Whether we have passed the negative time.
      loadErrorText: isSafari ? 'iOS and Safari support coming soon! We need to convert songs to MP3 first.' : ''
    }, emptyChallenge),
    hasReceivedUserGesture: false,
    inVR: false,
    isPaused: false, // Playing, but paused.
    isPlaying: false, // Actively playing.
    isSafari: isSafari,
    isSongBufferProcessing: false
  },

  handlers: {
    beatloaderpreloadfinish: state => {
      state.challenge.isBeatsPreloaded = true;
    },

    challengeimage: (state, payload) => {
      state.challenge.image = payload;
    },

    challengeloadstart: (state, payload) => {
      state.challenge.isLoading = true;
    },

    challengeloadend: (state, payload) => {
      state.challenge.audio = payload.audio;
      state.challenge.author = payload.info._levelAuthorName;
      if (!state.challenge.difficulty || payload.difficulties.indexOf(state.challenge.difficulty) === -1) {
        state.challenge.difficulty = payload.difficulty;
      }
      state.challenge.id = payload.id;
      if (payload.image) {
        state.challenge.image = payload.image;
      }
      state.challenge.isLoading = false;
      state.challenge.songName = payload.info._songName;
      state.challenge.songNameShort = truncate(payload.info._songName, 18);
      state.challenge.songNameMedium = truncate(payload.info._songName, 30);
      state.challenge.songSubName = payload.info._songSubName;
      state.challenge.songSubNameShort = truncate(payload.info._songSubName, 21);
    },

    challengeloaderror: (state, payload) => {
      state.challenge.hasLoadError = true;
      state.challenge.isLoading = false;
      state.challenge.loadErrorText = `Sorry, song ${AFRAME.utils.getUrlParameter('id')} was not found or ZIP requires CORS headers.`;
    },

    controllerconnected: (state, payload) => {
      state.controllerType = payload.name;
    },

    /**
     * ?debugstate=loading
     */
    debugloading: state => {
      DEBUG_CHALLENGE.id = '-1';
      Object.assign(state.challenge, DEBUG_CHALLENGE);
      state.challenge.isLoading = true;
    },

    difficultyselect: (state, payload) => {
      state.challenge.difficulty = payload;
      state.challenge.isBeatsPreloaded = false;
      state.isPaused = false;
    },

    gamemenuresume: state => {
      state.isPaused = false;
    },

    gamemenurestart: state => {
      state.challenge.isBeatsPreloaded = false;
      state.isPaused = false;
      state.isSongBufferProcessing = true;
    },

    pausegame: state => {
      if (!state.isPlaying) {
        return;
      }
      state.isPaused = true;
    },

    songprocessingfinish: state => {
      state.isSongBufferProcessing = false;
    },

    songprocessingstart: state => {
      state.isSongBufferProcessing = true;
    },

    /**
     * From search.
     */
    songselect: (state, payload) => {
      state.challenge = Object.assign(state.challenge, emptyChallenge);
      state.challenge.id = payload.key;
      state.challenge.author = payload.metadata.levelAuthorName;
      state.challenge.image = `https://beatsaver.com${payload.coverURL}`;
      state.challenge.songName = payload.metadata.songName;
      state.challenge.songNameShort = truncate(payload.metadata.songName, 18);
      state.challenge.songNameMedium = truncate(payload.metadata.songName, 30);
      state.challenge.songSubName = payload.metadata.songSubName;
      state.challenge.songSubNameShort = truncate(payload.metadata.songSubName, 21);
      state.challenge.isBeatsPreloaded = false;
      state.challenge.isLoading = true;

      state.hasReceivedUserGesture = false;
      state.isPaused = false;
      state.isSongBufferProcessing = false;
    },

    usergesturereceive: state => {
      state.hasReceivedUserGesture = true;
    },

    'enter-vr': state => {
      state.inVR = true;
    },

    'exit-vr': state => {
      state.inVR = false;
    }
  },

  /**
   * Post-process the state after each action.
   */
  computeState: state => {
    state.isPlaying = !state.isPaused && !state.isSongBufferProcessing && !state.challenge.isLoading && state.hasReceivedUserGesture;
  }
});

function truncate(str, length) {
  if (!str) {
    return '';
  }
  if (str.length >= length) {
    return str.substring(0, length - 2) + '..';
  }
  return str;
}

/***/ }),
/* 74 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var content = __webpack_require__(75);

if(typeof content === 'string') content = [[module.id, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(77)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),
/* 75 */
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(76);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.id, "html {\n  background: #111;\n}\n#controls {\n  align-items: center;\n  background: rgba(0,0,0,0.85);\n  border-radius: 10px;\n  bottom: 0;\n  display: none;\n  font-family: system-ui, BlinkMacSystemFont, -apple-system, \"Segoe UI\", Helvetica, Arial, sans-serif;\n  left: 0;\n  margin: 0 auto 10px auto;\n  padding: 10px;\n  position: fixed;\n  right: 0;\n  width: 675px;\n  z-index: 99999999;\n}\n#controls.challengeLoaded {\n  display: flex;\n}\n#controls #controlsVolume {\n  cursor: pointer;\n  padding: 3px 10px 0 3px;\n}\n#controls #controlsVolume img {\n  height: 20px;\n  width: 20px;\n}\n#controls #volumeSliderContainer {\n  background: rgba(0,0,0,0.85);\n  border-radius: 0 5px 5px 0;\n  bottom: 95px;\n  cursor: pointer;\n  display: none;\n  left: 9px;\n  padding-top: 4px;\n  position: absolute;\n  transform: rotate(-90deg);\n  z-index: 999999999;\n}\n#controls #volumeSliderContainer.volumeActive {\n  display: block;\n}\n#controls #volumeSliderContainer input {\n  cursor: pointer;\n  padding: 0;\n  width: 100px;\n}\n#controls #pause {\n  cursor: pointer;\n  display: flex;\n  padding-right: 10px;\n  opacity: 0;\n  transition: opacity 0.5s;\n}\n#controls #pause:hover #pauseSymbol {\n  fill: #d11769;\n}\n#controls #logo {\n  margin-right: 10px;\n}\n#controls #logo img {\n  height: 32px;\n  width: 32px;\n}\n#timeline {\n  height: 12px;\n  width: 160px;\n}\n#timeline:hover #timelineLine {\n  height: 6px;\n  background: #d11769;\n  margin-top: 3px;\n}\n#timelineLine {\n  height: 2px;\n  background: #8c1248;\n  border-radius: 2px;\n  margin-top: 5px;\n  transition: background 0.2s, height 0.2s, margin-top 0.2s;\n}\n#playhead {\n  background: #fafafa;\n  position: relative;\n  border-radius: 2px 0 0 2px;\n  height: 100%;\n  width: 0%;\n}\n#songTime {\n  color: #ccc;\n  font-size: 11px;\n  margin-left: 15px;\n  margin-right: 5px;\n  width: 70px;\n}\n#songInfoContainer {\n  align-items: center;\n  display: flex;\n}\n#songInfoContainer img {\n  height: 32px;\n  width: 32px;\n}\n#songInfoContainer p {\n  font-size: 13px;\n  margin: 0;\n  text-shadow: 0 0 4px #000;\n}\n#songInfoContainer #songInfo {\n  display: flex;\n  flex-direction: column;\n  padding-left: 10px;\n}\n#songInfoContainer #songName {\n  color: #ccc;\n  font-weight: bold;\n  font-size: 14px;\n}\n#songInfoContainer #songSubName {\n  color: #ff3690;\n}\n#songInfoContainer #songInfoSelect {\n  align-items: center;\n  display: flex;\n  position: absolute;\n  right: 0;\n}\n#songInfoContainer #controlsDifficulty {\n  border: 1px solid #ccc;\n  border-radius: 5px;\n  color: #ccc;\n  cursor: pointer;\n  padding: 5px 10px;\n  text-align: center;\n  transition: all 0.1s;\n}\n#songInfoContainer #controlsDifficulty p {\n  font-family: system-ui, BlinkMacSystemFont, -apple-system, \"Segoe UI\", Helvetica, Arial, sans-serif;\n}\n#songInfoContainer #controlsDifficulty:after {\n  content: '\\25B2';\n  display: inline-block;\n  font-size: 11px;\n  margin-left: 5px;\n}\n#songInfoContainer #controlsDifficulty:hover {\n  border-color: #fafafa;\n  color: #fafafa;\n}\n#controlsDifficultyOptions {\n  background: #020202;\n  border: 1px solid #ccc;\n  border-radius: 5px;\n  bottom: 50px;\n  color: #fafafa;\n  display: none;\n  flex-direction: column;\n  font-family: system-ui, BlinkMacSystemFont, -apple-system, \"Segoe UI\", Helvetica, Arial, sans-serif;\n  font-size: 13px;\n  list-style: none;\n  margin: 0;\n  opacity: 0;\n  padding: 0;\n  position: absolute;\n  right: 35px;\n  transition: all 0.2s;\n}\n#controlsDifficultyOptions li {\n  cursor: pointer;\n  padding: 10px;\n  min-width: 65px;\n  transition: all 0.1s;\n}\n#controlsDifficultyOptions li:hover {\n  color: #d11769;\n}\n.difficultyOptionsActive #controlsDifficultyOptions {\n  display: flex;\n  opacity: 1;\n}\n#timeline {\n  cursor: pointer;\n  position: relative;\n}\n#timelineHover {\n  bottom: 0;\n  color: #fafafa;\n  font-size: 11px;\n  display: none;\n  padding: 5px;\n  position: absolute;\n}\n#timelineHover.timelineHoverActive {\n  display: block;\n}\n#vrButton {\n  background: url(\"assets/img/enter-vr-button-background.png\") no-repeat;\n  background-size: cover;\n  border: 0;\n  bottom: 25px;\n  cursor: pointer;\n  height: 23.5px;\n  position: absolute;\n  right: 30px;\n  width: 42px;\n  z-index: 9999999;\n}\n#vrButton.a-hidden {\n  visibility: hidden;\n}\n#vrButton:active {\n  border: 0;\n}\n#vrButton:hover {\n  background-position: 0 -25px;\n}\n.github-corner {\n  opacity: 1;\n  transition: 0.1s opacity;\n}\n.isPlaying .github-corner {\n  opacity: 0;\n}\n.isPlaying #controls,\n.isPlaying #controls #pause {\n  opacity: 1;\n}\n.a-loader-title {\n  display: none !important;\n}\n#songInfoContainer #searchToggle {\n  cursor: pointer;\n  height: 30px;\n  padding: 0 5px 0 15px;\n  width: 30px;\n}\n#songInfoContainer #searchToggle svg {\n  left: 5px;\n  position: relative;\n  top: 5px;\n  transform: scale(1.5);\n}\n#songInfoContainer #searchToggle g {\n  stroke: #ccc;\n  transition: stroke 0.1s;\n}\n#songInfoContainer #searchToggle:hover g {\n  stroke: #fafafa;\n}\n#search {\n  bottom: 50px;\n  align-items: center;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  left: 0;\n  margin: 0 auto;\n  position: absolute;\n  right: 0;\n  width: 400px;\n}\n#search input,\n#search #url {\n  background: rgba(0,0,0,0.85);\n  border-radius: 10px;\n  font-family: system-ui, BlinkMacSystemFont, -apple-system, \"Segoe UI\", Helvetica, Arial, sans-serif;\n  font-size: 14px;\n  position: relative;\n}\ninput {\n  border: 1px solid #ccc;\n  bottom: 15px;\n  color: #fafafa;\n  padding: 8px 20px;\n  width: 340px;\n}\n#url {\n  border: 1px solid #222;\n  color: #ccc;\n  padding: 8px 20px;\n  text-align: center;\n}\n#searchResultsContainer {\n  background: rgba(0,0,0,0.95);\n  border: 1px solid #ccc;\n  border-radius: 10px;\n  bottom: 25px;\n  display: flex;\n  flex-direction: column;\n  padding-bottom: 6px;\n  position: relative;\n  width: 340px;\n}\n#searchResultsContainer > h3 {\n  color: #ccc;\n  font-size: 14px;\n  text-align: center;\n  margin: 8px 0 0 0;\n}\n#searchResults {\n  display: flex;\n  flex-direction: column;\n  margin: 0;\n  max-height: 200px;\n  list-style: none;\n  overflow: auto;\n  padding: 5px 0 5px 0;\n}\n#searchResults li {\n  align-items: center;\n  background: none;\n  color: #ccc;\n  cursor: pointer;\n  display: flex;\n  font-size: 12px;\n  margin: 0;\n  margin-bottom: 2px;\n  padding-left: 10px;\n  transition: background 0.1s;\n}\n#searchResults li:hover {\n  background: rgba(30,30,30,0.95);\n}\n#searchResults li img {\n  height: 24px;\n  width: 24px;\n}\n#searchResults li p {\n  margin: 0;\n  padding-left: 10px;\n}\n#breakWarning {\n  background: #111;\n  border-radius: 5px;\n  color: #fafafa;\n  font-family: system-ui, BlinkMacSystemFont, -apple-system, \"Segoe UI\", Helvetica, Arial, sans-serif;\n  font-size: 18px;\n  left: 0;\n  margin: 0 15%;\n  opacity: 0.75;\n  padding: 10px;\n  position: fixed;\n  right: 0;\n  text-align: center;\n  z-index: 999999999;\n  top: 20px;\n}\n", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),
/* 76 */
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join("");
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === "string") {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, ""]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),
/* 77 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target, parent) {
  if (parent){
    return parent.querySelector(target);
  }
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target, parent) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target, parent);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(78);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertAt.before, target);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}

	if(options.attrs.nonce === undefined) {
		var nonce = getNonce();
		if (nonce) {
			options.attrs.nonce = nonce;
		}
	}

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function getNonce() {
	if (false) {}

	return __webpack_require__.nc;
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = typeof options.transform === 'function'
		 ? options.transform(obj.css) 
		 : options.transform.default(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 78 */
/***/ ((module) => {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
function requireAll(req) {
  req.keys().forEach(req);
}

console.time = () => {};
console.timeEnd = () => {};

__webpack_require__(1);

__webpack_require__(2);
__webpack_require__(3);
__webpack_require__(4);
__webpack_require__(5);
__webpack_require__(6);
__webpack_require__(8);
__webpack_require__(9);
__webpack_require__(10);
__webpack_require__(12);
__webpack_require__(13);
__webpack_require__(14);
__webpack_require__(15);
__webpack_require__(16);

requireAll(__webpack_require__(17));
requireAll(__webpack_require__(72));

__webpack_require__(74);
})();

/******/ })()
;