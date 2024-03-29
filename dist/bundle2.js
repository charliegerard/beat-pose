(function (modules) {
  function __webpack_require__(moduleId) {
    if (installedModules[moduleId]) return installedModules[moduleId].exports;
    var module = (installedModules[moduleId] = {
      i: moduleId,
      l: !1,
      exports: {},
    });
    return (
      modules[moduleId].call(
        module.exports,
        module,
        module.exports,
        __webpack_require__
      ),
      (module.l = !0),
      module.exports
    );
  }
  var installedModules = {};
  return (
    (__webpack_require__.m = modules),
    (__webpack_require__.c = installedModules),
    (__webpack_require__.i = function (value) {
      return value;
    }),
    (__webpack_require__.d = function (exports, name, getter) {
      __webpack_require__.o(exports, name) ||
        Object.defineProperty(exports, name, {
          configurable: !1,
          enumerable: !0,
          get: getter,
        });
    }),
    (__webpack_require__.n = function (module) {
      var getter =
        module && module.__esModule
          ? function getDefault() {
              return module["default"];
            }
          : function getModuleExports() {
              return module;
            };
      return __webpack_require__.d(getter, "a", getter), getter;
    }),
    (__webpack_require__.o = function (object, property) {
      return Object.prototype.hasOwnProperty.call(object, property);
    }),
    (__webpack_require__.p = ""),
    __webpack_require__((__webpack_require__.s = 70))
  );
})([
  function (module) {
    module.exports = {
      OFF: "#111",
      RED: "#ff3a7b",
      BLUE: "#08bfa2",
      UI_ACCENT: "#fff",
      UI_ACCENT2: "#f01978",
      SKY_OFF: "#297547",
      SKY_BLUE: "#840d42",
      SKY_RED: "#154136",
      BG_OFF: "#081a0f",
      BG_BLUE: "#379f5e",
      BG_BRIGHTBLUE: "#4fd983",
      BG_RED: "#ff1f81",
      BG_BRIGHTRED: "#ff6bb0",
      NEON_OFF: "#000",
      NEON_BLUE: "#008a70",
      NEON_BRIGHTBLUE: "#87c2ff",
      NEON_RED: "#f01978",
      NEON_BRIGHTRED: "#ff70b5",
      TEXT_OFF: "#000",
      TEXT_NORMAL: "#444",
      TEXT_BOLD: "#888",
      BEAT_RED: "#660338",
      BEAT_BLUE: "#036657",
      MINE_RED: "#1c060e",
      MINE_RED_EMISSION: "#2a0d1b",
      MINE_BLUE: "#011114",
      MINE_BLUE_EMISSION: "#072020",
    };
  },
  function (module) {
    module.exports.getS3FileUrl = function getS3FileUrl(id, name) {
      return `${"https://saber.supermedium.com"}/${id}-${name}?v=1`;
    };
  },
  function (module, __webpack_exports__) {
    "use strict";
    const BEAT_WARMUP_SPEED = 155;
    __webpack_exports__.a = BEAT_WARMUP_SPEED;
    __webpack_exports__.b = 1e3 * (25 / BEAT_WARMUP_SPEED);
  },
  function (module) {
    function getGridUvs(row, column, totalRows, totalColumns) {
      const columnWidth = 1 / totalColumns,
        rowHeight = 1 / totalRows;
      return (
        uvs[0].set(columnWidth * column, rowHeight * row + rowHeight),
        uvs[1].set(columnWidth * column, rowHeight * row),
        uvs[2].set(columnWidth * column + columnWidth, rowHeight * row),
        uvs[3].set(
          columnWidth * column + columnWidth,
          rowHeight * row + rowHeight
        ),
        uvs
      );
    }
    var uvs = [
      new THREE.Vector2(),
      new THREE.Vector2(),
      new THREE.Vector2(),
      new THREE.Vector2(),
    ];
    AFRAME.registerComponent("atlas-uvs", {
      dependencies: ["geometry"],
      schema: {
        totalColumns: { type: "int", default: 1 },
        totalRows: { type: "int", default: 1 },
        column: { type: "int", default: 1 },
        row: { type: "int", default: 1 },
      },
      update: function () {
        const data = this.data,
          uvs = getGridUvs(
            data.row - 1,
            data.column - 1,
            data.totalRows,
            data.totalColumns
          ),
          geometry = this.el.getObject3D("mesh").geometry;
        geometry.faceVertexUvs[0][0][0].copy(uvs[0]),
          geometry.faceVertexUvs[0][0][1].copy(uvs[1]),
          geometry.faceVertexUvs[0][0][2].copy(uvs[3]),
          geometry.faceVertexUvs[0][1][0].copy(uvs[1]),
          geometry.faceVertexUvs[0][1][1].copy(uvs[2]),
          geometry.faceVertexUvs[0][1][2].copy(uvs[3]),
          (geometry.uvsNeedUpdate = !0);
      },
    }),
      AFRAME.registerComponent("dynamic-texture-atlas", {
        schema: {
          canvasId: { default: "dynamicAtlas" },
          canvasHeight: { default: 1024 },
          canvasWidth: { default: 1024 },
          debug: { default: !1 },
          numColumns: { default: 8 },
          numRows: { default: 8 },
        },
        multiple: !0,
        init: function () {
          const canvas = (this.canvas = document.createElement("canvas"));
          (canvas.id = this.data.canvasId),
            (canvas.height = this.data.canvasHeight),
            (canvas.width = this.data.canvasWidth),
            (this.ctx = canvas.getContext("2d")),
            document.body.appendChild(canvas),
            this.data.debug &&
              ((canvas.style.left = 0),
              (canvas.style.top = 0),
              (canvas.style.position = "fixed"),
              (canvas.style.zIndex = 9999999999));
        },
        drawTexture: function (image, row, column, width, height) {
          const canvas = this.canvas,
            data = this.data;
          image.complete ||
            (image.onload = () => {
              this.drawTexture(image, row, column);
            });
          const gridHeight = height || canvas.height / data.numRows,
            gridWidth = width || canvas.width / data.numColumns;
          return (
            this.ctx.drawImage(
              image,
              gridWidth * row,
              gridWidth * column,
              gridWidth,
              gridHeight
            ),
            getGridUvs(row, column, data.numRows, data.numColumns)
          );
        },
      }),
      (module.exports.getGridUvs = getGridUvs);
  },
  function () {
    THREE.BufferGeometryUtils = {
      computeTangents: function (geometry) {
        function handleTriangle(a, b, c) {
          vA.fromArray(positions, 3 * a),
            vB.fromArray(positions, 3 * b),
            vC.fromArray(positions, 3 * c),
            uvA.fromArray(uvs, 2 * a),
            uvB.fromArray(uvs, 2 * b),
            uvC.fromArray(uvs, 2 * c);
          var x1 = vB.x - vA.x,
            x2 = vC.x - vA.x,
            y1 = vB.y - vA.y,
            y2 = vC.y - vA.y,
            z1 = vB.z - vA.z,
            z2 = vC.z - vA.z,
            s1 = uvB.x - uvA.x,
            s2 = uvC.x - uvA.x,
            t1 = uvB.y - uvA.y,
            t2 = uvC.y - uvA.y,
            r = 1 / (s1 * t2 - s2 * t1);
          sdir.set(
            (t2 * x1 - t1 * x2) * r,
            (t2 * y1 - t1 * y2) * r,
            (t2 * z1 - t1 * z2) * r
          ),
            tdir.set(
              (s1 * x2 - s2 * x1) * r,
              (s1 * y2 - s2 * y1) * r,
              (s1 * z2 - s2 * z1) * r
            ),
            tan1[a].add(sdir),
            tan1[b].add(sdir),
            tan1[c].add(sdir),
            tan2[a].add(tdir),
            tan2[b].add(tdir),
            tan2[c].add(tdir);
        }
        function handleVertex(v) {
          n.fromArray(normals, 3 * v),
            n2.copy(n),
            (t = tan1[v]),
            tmp.copy(t),
            tmp.sub(n.multiplyScalar(n.dot(t))).normalize(),
            tmp2.crossVectors(n2, t),
            (test = tmp2.dot(tan2[v])),
            (w = 0 > test ? -1 : 1),
            (tangents[4 * v] = tmp.x),
            (tangents[4 * v + 1] = tmp.y),
            (tangents[4 * v + 2] = tmp.z),
            (tangents[4 * v + 3] = w);
        }
        var index = geometry.index,
          attributes = geometry.attributes;
        if (
          null === index ||
          void 0 === attributes.position ||
          void 0 === attributes.normal ||
          void 0 === attributes.uv
        )
          return void console.warn(
            "THREE.BufferGeometry: Missing required attributes (index, position, normal or uv) in BufferGeometry.computeTangents()"
          );
        var indices = index.array,
          positions = attributes.position.array,
          normals = attributes.normal.array,
          uvs = attributes.uv.array,
          nVertices = positions.length / 3;
        attributes.tangent === void 0 &&
          geometry.addAttribute(
            "tangent",
            new THREE.BufferAttribute(new Float32Array(4 * nVertices), 4)
          );
        for (
          var tangents = attributes.tangent.array, tan1 = [], tan2 = [], k = 0;
          k < nVertices;
          k++
        )
          (tan1[k] = new THREE.Vector3()), (tan2[k] = new THREE.Vector3());
        var vA = new THREE.Vector3(),
          vB = new THREE.Vector3(),
          vC = new THREE.Vector3(),
          uvA = new THREE.Vector2(),
          uvB = new THREE.Vector2(),
          uvC = new THREE.Vector2(),
          sdir = new THREE.Vector3(),
          tdir = new THREE.Vector3(),
          groups = geometry.groups;
        0 === groups.length && (groups = [{ start: 0, count: indices.length }]);
        for (var j = 0, jl = groups.length; j < jl; ++j)
          for (
            var group = groups[j],
              start = group.start,
              count = group.count,
              i = start,
              il = start + count;
            i < il;
            i += 3
          )
            handleTriangle(indices[i + 0], indices[i + 1], indices[i + 2]);
        for (
          var tmp = new THREE.Vector3(),
            tmp2 = new THREE.Vector3(),
            n = new THREE.Vector3(),
            n2 = new THREE.Vector3(),
            j = 0,
            jl = groups.length,
            w,
            t,
            test;
          j < jl;
          ++j
        )
          for (
            var group = groups[j],
              start = group.start,
              count = group.count,
              i = start,
              il = start + count;
            i < il;
            i += 3
          )
            handleVertex(indices[i + 0]),
              handleVertex(indices[i + 1]),
              handleVertex(indices[i + 2]);
      },
      mergeBufferGeometries: function (geometries, useGroups) {
        for (
          var isIndexed = null !== geometries[0].index,
            attributesUsed = new Set(Object.keys(geometries[0].attributes)),
            morphAttributesUsed = new Set(
              Object.keys(geometries[0].morphAttributes)
            ),
            attributes = {},
            morphAttributes = {},
            mergedGeometry = new THREE.BufferGeometry(),
            offset = 0,
            i = 0,
            geometry;
          i < geometries.length;
          ++i
        ) {
          if (
            ((geometry = geometries[i]), isIndexed != (null !== geometry.index))
          )
            return null;
          for (var name in geometry.attributes) {
            if (!attributesUsed.has(name)) return null;
            void 0 === attributes[name] && (attributes[name] = []),
              attributes[name].push(geometry.attributes[name]);
          }
          for (var name in geometry.morphAttributes) {
            if (!morphAttributesUsed.has(name)) return null;
            void 0 === morphAttributes[name] && (morphAttributes[name] = []),
              morphAttributes[name].push(geometry.morphAttributes[name]);
          }
          if (
            ((mergedGeometry.userData.mergedUserData =
              mergedGeometry.userData.mergedUserData || []),
            mergedGeometry.userData.mergedUserData.push(geometry.userData),
            useGroups)
          ) {
            var count;
            if (isIndexed) count = geometry.index.count;
            else if (void 0 !== geometry.attributes.position)
              count = geometry.attributes.position.count;
            else return null;
            mergedGeometry.addGroup(offset, count, i), (offset += count);
          }
        }
        if (isIndexed) {
          for (
            var indexOffset = 0, indexList = [], i = 0, index;
            i < geometries.length;
            ++i
          ) {
            if (((index = geometries[i].index), 0 < indexOffset)) {
              index = index.clone();
              for (var j = 0; j < index.count; ++j)
                index.setX(j, index.getX(j) + indexOffset);
            }
            indexList.push(index),
              (indexOffset += geometries[i].attributes.position.count);
          }
          var mergedIndex = this.mergeBufferAttributes(indexList);
          if (!mergedIndex) return null;
          mergedGeometry.index = mergedIndex;
        }
        for (var name in attributes) {
          var mergedAttribute = this.mergeBufferAttributes(attributes[name]);
          if (!mergedAttribute) return null;
          mergedGeometry.addAttribute(name, mergedAttribute);
        }
        for (var name in morphAttributes) {
          var numMorphTargets = morphAttributes[name][0].length;
          if (0 === numMorphTargets) break;
          (mergedGeometry.morphAttributes =
            mergedGeometry.morphAttributes || {}),
            (mergedGeometry.morphAttributes[name] = []);
          for (var i = 0, morphAttributesToMerge; i < numMorphTargets; ++i) {
            morphAttributesToMerge = [];
            for (var j = 0; j < morphAttributes[name].length; ++j)
              morphAttributesToMerge.push(morphAttributes[name][j][i]);
            var mergedMorphAttribute = this.mergeBufferAttributes(
              morphAttributesToMerge
            );
            if (!mergedMorphAttribute) return null;
            mergedGeometry.morphAttributes[name].push(mergedMorphAttribute);
          }
        }
        return mergedGeometry;
      },
      mergeBufferAttributes: function (attributes) {
        for (
          var arrayLength = 0,
            i = 0,
            TypedArray,
            itemSize,
            normalized,
            attribute;
          i < attributes.length;
          ++i
        ) {
          if (
            ((attribute = attributes[i]),
            attribute.isInterleavedBufferAttribute)
          )
            return null;
          if (
            (void 0 == TypedArray && (TypedArray = attribute.array.constructor),
            TypedArray !== attribute.array.constructor)
          )
            return null;
          if (
            (void 0 == itemSize && (itemSize = attribute.itemSize),
            itemSize !== attribute.itemSize)
          )
            return null;
          if (
            (void 0 == normalized && (normalized = attribute.normalized),
            normalized !== attribute.normalized)
          )
            return null;
          arrayLength += attribute.array.length;
        }
        for (
          var array = new TypedArray(arrayLength), offset = 0, j = 0;
          j < attributes.length;
          ++j
        )
          array.set(attributes[j].array, offset),
            (offset += attributes[j].array.length);
        return new THREE.BufferAttribute(array, itemSize, normalized);
      },
    };
  },
  function () {
    function copyArray(dest, source) {
      var i;
      for (dest.length = 0, i = 0; i < source.length; i++) dest[i] = source[i];
    }
    if ("undefined" == typeof AFRAME)
      throw new Error(
        "Component attempted to register before AFRAME was available."
      );
    var OBSERVER_CONFIG = { childList: !0, attributes: !0, subtree: !0 };
    AFRAME.registerComponent("aabb-collider", {
      schema: {
        collideNonVisible: { default: !1 },
        debug: { default: !1 },
        enabled: { default: !0 },
        interval: { default: 80 },
        objects: { default: "" },
      },
      init: function () {
        (this.centerDifferenceVec3 = new THREE.Vector3()),
          (this.clearedIntersectedEls = []),
          (this.closestIntersectedEl = null),
          (this.boundingBox = new THREE.Box3()),
          (this.boxCenter = new THREE.Vector3()),
          (this.boxHelper = new THREE.BoxHelper()),
          (this.boxMax = new THREE.Vector3()),
          (this.boxMin = new THREE.Vector3()),
          (this.hitClosestClearEventDetail = {}),
          (this.hitClosestEventDetail = {}),
          (this.intersectedEls = []),
          (this.objectEls = []),
          (this.newIntersectedEls = []),
          (this.prevCheckTime = void 0),
          (this.previousIntersectedEls = []),
          (this.setDirty = this.setDirty.bind(this)),
          (this.observer = new MutationObserver(this.setDirty)),
          (this.dirty = !0),
          (this.hitStartEventDetail = {
            intersectedEls: this.newIntersectedEls,
          });
      },
      play: function () {
        this.observer.observe(this.el.sceneEl, OBSERVER_CONFIG),
          this.el.sceneEl.addEventListener("object3dset", this.setDirty),
          this.el.sceneEl.addEventListener("object3dremove", this.setDirty);
      },
      remove: function () {
        this.observer.disconnect(),
          this.el.sceneEl.removeEventListener("object3dset", this.setDirty),
          this.el.sceneEl.removeEventListener("object3dremove", this.setDirty);
      },
      tick: function (time) {
        var boundingBox = this.boundingBox,
          centerDifferenceVec3 = this.centerDifferenceVec3,
          clearedIntersectedEls = this.clearedIntersectedEls,
          intersectedEls = this.intersectedEls,
          el = this.el,
          newIntersectedEls = this.newIntersectedEls,
          objectEls = this.objectEls,
          prevCheckTime = this.prevCheckTime,
          previousIntersectedEls = this.previousIntersectedEls,
          self = this,
          boxHelper,
          closestCenterDifference,
          newClosestEl,
          i;
        if (
          this.data.enabled &&
          !(prevCheckTime && time - prevCheckTime < this.data.interval)
        ) {
          for (
            this.prevCheckTime = time,
              this.dirty && this.refreshObjects(),
              boundingBox.setFromObject(el.object3D),
              this.boxMin.copy(boundingBox.min),
              this.boxMax.copy(boundingBox.max),
              boundingBox.getCenter(this.boxCenter),
              this.data.debug &&
                (this.boxHelper.setFromObject(el.object3D),
                !this.boxHelper.parent &&
                  el.sceneEl.object3D.add(this.boxHelper)),
              copyArray(previousIntersectedEls, intersectedEls),
              intersectedEls.length = 0,
              i = 0;
            i < objectEls.length;
            i++
          )
            if (objectEls[i] !== this.el) {
              if (
                !this.data.collideNonVisible &&
                !objectEls[i].getAttribute("visible")
              ) {
                this.data.debug &&
                  ((boxHelper = objectEls[i].object3D.boxHelper),
                  boxHelper &&
                    (el.sceneEl.object3D.remove(boxHelper),
                    (objectEls[i].object3D.boxHelper = null)));
                continue;
              }
              this.isIntersecting(objectEls[i]) &&
                intersectedEls.push(objectEls[i]);
            }
          for (
            newIntersectedEls.length = 0, i = 0;
            i < intersectedEls.length;
            i++
          )
            -1 === previousIntersectedEls.indexOf(intersectedEls[i]) &&
              newIntersectedEls.push(intersectedEls[i]);
          for (
            clearedIntersectedEls.length = 0, i = 0;
            i < previousIntersectedEls.length;
            i++
          )
            -1 === intersectedEls.indexOf(previousIntersectedEls[i]) &&
              (previousIntersectedEls[i].hasAttribute("aabb-collider") ||
                previousIntersectedEls[i].emit("hitend"),
              clearedIntersectedEls.push(previousIntersectedEls[i]));
          for (i = 0; i < newIntersectedEls.length; i++)
            newIntersectedEls[i] !== this.el &&
              (newIntersectedEls[i].hasAttribute("aabb-collider") ||
                newIntersectedEls[i].emit("hitstart"));
          for (i = 0; i < intersectedEls.length; i++)
            intersectedEls[i] !== this.el &&
              (centerDifferenceVec3
                .copy(intersectedEls[i].object3D.boundingBoxCenter)
                .sub(this.boxCenter),
              (void 0 == closestCenterDifference ||
                centerDifferenceVec3.length() < closestCenterDifference) &&
                ((closestCenterDifference = centerDifferenceVec3.length()),
                (newClosestEl = intersectedEls[i])));
          !intersectedEls.length && this.closestIntersectedEl
            ? ((this.hitClosestClearEventDetail.el = this.closestIntersectedEl),
              this.closestIntersectedEl.emit("hitclosestclear"),
              (this.closestIntersectedEl = null),
              el.emit("hitclosestclear", this.hitClosestClearEventDetail))
            : newClosestEl !== this.closestIntersectedEl &&
              (this.closestIntersectedEl &&
                ((this.hitClosestClearEventDetail.el =
                  this.closestIntersectedEl),
                this.closestIntersectedEl.emit(
                  "hitclosestclear",
                  this.hitClosestClearEventDetail
                )),
              newClosestEl &&
                (newClosestEl.emit("hitclosest"),
                (this.closestIntersectedEl = newClosestEl),
                (this.hitClosestEventDetail.el = newClosestEl),
                el.emit("hitclosest", this.hitClosestEventDetail))),
            clearedIntersectedEls.length && el.emit("hitend"),
            newIntersectedEls.length &&
              el.emit("hitstart", this.hitStartEventDetail);
        }
      },
      isIntersecting: (function () {
        var boundingBox = new THREE.Box3();
        return function (el) {
          var boxMin, boxMax;
          return (
            boundingBox.setFromObject(el.object3D),
            this.data.debug &&
              (!el.object3D.boxHelper &&
                ((el.object3D.boxHelper = new THREE.BoxHelper(
                  el.object3D,
                  new THREE.Color(Math.random(), Math.random(), Math.random())
                )),
                el.sceneEl.object3D.add(el.object3D.boxHelper)),
              el.object3D.boxHelper.setFromObject(el.object3D)),
            (boxMin = boundingBox.min),
            (boxMax = boundingBox.max),
            (el.object3D.boundingBoxCenter =
              el.object3D.boundingBoxCenter || new THREE.Vector3()),
            boundingBox.getCenter(el.object3D.boundingBoxCenter),
            this.boxMin.x <= boxMax.x &&
              this.boxMax.x >= boxMin.x &&
              this.boxMin.y <= boxMax.y &&
              this.boxMax.y >= boxMin.y &&
              this.boxMin.z <= boxMax.z &&
              this.boxMax.z >= boxMin.z
          );
        };
      })(),
      setDirty: function () {
        this.dirty = !0;
      },
      refreshObjects: function () {
        var data = this.data;
        (this.objectEls = data.objects
          ? this.el.sceneEl.querySelectorAll(data.objects)
          : this.el.sceneEl.children),
          (this.dirty = !1);
      },
    });
  },
  function () {
    if ("undefined" == typeof AFRAME)
      throw new Error(
        "Component attempted to register before AFRAME was available."
      );
    var audioBufferCache = {};
    AFRAME.registerComponent("audioanalyser", {
      schema: {
        buffer: { default: !1 },
        beatDetectionDecay: { default: 0.99 },
        beatDetectionMinVolume: { default: 15 },
        beatDetectionThrottle: { default: 250 },
        enabled: { default: !0 },
        enableBeatDetection: { default: !0 },
        enableLevels: { default: !0 },
        enableWaveform: { default: !0 },
        enableVolume: { default: !0 },
        fftSize: { default: 2048 },
        smoothingTimeConstant: { default: 0.8 },
        src: {
          parse: function (val) {
            return val.constructor === String
              ? val.startsWith("#") || val.startsWith(".")
                ? document.querySelector(val)
                : val
              : val;
          },
        },
        unique: { default: !1 },
      },
      init: function () {
        (this.audioEl = null),
          (this.levels = null),
          (this.waveform = null),
          (this.volume = 0),
          (this.xhr = null),
          this.initContext();
      },
      update: function (oldData) {
        var analyser = this.analyser,
          data = this.data;
        (oldData.fftSize !== data.fftSize ||
          oldData.smoothingTimeConstant !== data.smoothingTimeConstant) &&
          ((analyser.fftSize = data.fftSize),
          (analyser.smoothingTimeConstant = data.smoothingTimeConstant),
          (this.levels = new Uint8Array(analyser.frequencyBinCount)),
          (this.waveform = new Uint8Array(analyser.fftSize)));
        data.src && this.refreshSource();
      },
      tick: function (t, dt) {
        var data = this.data,
          volume;
        if (data.enabled) {
          if (
            ((data.enableLevels || data.enableVolume) &&
              this.analyser.getByteFrequencyData(this.levels),
            data.enableWaveform &&
              this.analyser.getByteTimeDomainData(this.waveform),
            data.enableVolume || data.enableBeatDetection)
          ) {
            for (var sum = 0, i = 0; i < this.levels.length; i++)
              sum += this.levels[i];
            this.volume = sum / this.levels.length;
          }
          data.enableBeatDetection &&
            ((volume = this.volume),
            !this.beatCutOff && (this.beatCutOff = volume),
            volume > this.beatCutOff &&
            volume > this.data.beatDetectionMinVolume
              ? (this.el.emit("audioanalyserbeat", null, !1),
                (this.beatCutOff = 1.5 * volume),
                (this.beatTime = 0))
              : this.beatTime <= this.data.beatDetectionThrottle
              ? (this.beatTime += dt)
              : ((this.beatCutOff *= this.data.beatDetectionDecay),
                (this.beatCutOff = Math.max(
                  this.beatCutOff,
                  this.data.beatDetectionMinVolume
                ))));
        }
      },
      initContext: function () {
        var data = this.data,
          analyser,
          gainNode;
        (this.context = new (window.webkitAudioContext ||
          window.AudioContext)()),
          (analyser = this.analyser = this.context.createAnalyser()),
          (gainNode = this.gainNode = this.context.createGain()),
          gainNode.connect(analyser),
          analyser.connect(this.context.destination),
          (analyser.fftSize = data.fftSize),
          (analyser.smoothingTimeConstant = data.smoothingTimeConstant),
          (this.levels = new Uint8Array(analyser.frequencyBinCount)),
          (this.waveform = new Uint8Array(analyser.fftSize));
      },
      refreshSource: function () {
        var analyser = this.analyser,
          data = this.data;
        data.buffer && data.src.constructor === String
          ? this.getBufferSource().then((source) => {
              (this.source = source), this.source.connect(this.gainNode);
            })
          : ((this.source = this.getMediaSource()),
            this.source.connect(this.gainNode));
      },
      suspendContext: function () {
        this.context.suspend();
      },
      resumeContext: function () {
        this.context.resume();
      },
      fetchAudioBuffer: function (src) {
        return audioBufferCache[src]
          ? audioBufferCache[src].constructor === Promise
            ? audioBufferCache[src]
            : Promise.resolve(audioBufferCache[src])
          : ((audioBufferCache[src] = new Promise((resolve) => {
              const xhr = (this.xhr = new XMLHttpRequest());
              xhr.open("GET", src),
                (xhr.responseType = "arraybuffer"),
                xhr.addEventListener("load", () => {
                  function cb(audioBuffer) {
                    (audioBufferCache[src] = audioBuffer), resolve(audioBuffer);
                  }
                  const res = this.context.decodeAudioData(xhr.response, cb);
                  res &&
                    res.constructor === Promise &&
                    res.then(cb).catch(console.error);
                }),
                xhr.send();
            })),
            audioBufferCache[src]);
      },
      getBufferSource: function () {
        var data = this.data;
        return this.fetchAudioBuffer(data.src)
          .then(() => {
            var source;
            return (
              (source = this.context.createBufferSource()),
              (source.buffer = audioBufferCache[data.src]),
              this.el.emit("audioanalyserbuffersource", source, !1),
              source
            );
          })
          .catch(console.error);
      },
      getMediaSource: function () {
        return (
          this.data.src.constructor === String
            ? (!this.audio &&
                ((this.audio = document.createElement("audio")),
                (this.audio.crossOrigin = "anonymous")),
              this.audio.setAttribute("src", this.data.src))
            : (this.audio = this.data.src),
          this.context.createMediaElementSource(this.audio)
        );
      },
    });
  },
  function () {
    var styleParser = AFRAME.utils.styleParser;
    if ("undefined" == typeof AFRAME)
      throw new Error(
        "Component attempted to register before AFRAME was available."
      );
    AFRAME.registerComponent("event-set", {
      schema: {
        default: "",
        parse: function (value) {
          return styleParser.parse(value);
        },
      },
      multiple: !0,
      init: function () {
        (this.eventHandler = null), (this.eventName = null);
      },
      update: function () {
        this.removeEventListener(),
          this.updateEventListener(),
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
      updateEventListener: function () {
        var data = this.data,
          el = this.el,
          event,
          target,
          targetEl;
        (event = data._event || this.id),
          (target = data._target),
          (targetEl = target ? el.sceneEl.querySelector(target) : el),
          (this.eventName = event),
          (this.eventHandler = function handler() {
            for (var propName in data)
              "_event" !== propName &&
                "_target" !== propName &&
                AFRAME.utils.entity.setComponentProperty.call(
                  this,
                  targetEl,
                  propName,
                  data[propName]
                );
          });
      },
      addEventListener: function () {
        this.el.addEventListener(this.eventName, this.eventHandler);
      },
      removeEventListener: function () {
        this.el.removeEventListener(this.eventName, this.eventHandler);
      },
    });
  },
  function (module, exports, __webpack_require__) {
    THREE.BufferGeometryUtils || __webpack_require__(20),
      AFRAME.registerComponent("geometry-merger", {
        schema: { preserveOriginal: { default: !1 } },
        init: function () {
          var self = this;
          (this.geometry = new THREE.Geometry()),
            (this.mesh = new THREE.Mesh(this.geometry)),
            this.el.setObject3D("mesh", this.mesh),
            (this.faceIndex = {}),
            (this.vertexIndex = {}),
            this.el.object3D.traverse(function (mesh) {
              "Mesh" !== mesh.type ||
                mesh === self.mesh ||
                ((self.faceIndex[mesh.parent.uuid] = [
                  self.geometry.faces.length,
                  self.geometry.faces.length + mesh.geometry.faces.length - 1,
                ]),
                (self.vertexIndex[mesh.parent.uuid] = [
                  self.geometry.vertices.length,
                  self.geometry.vertices.length +
                    mesh.geometry.vertices.length -
                    1,
                ]),
                mesh.parent.updateMatrix(),
                self.geometry.merge(mesh.geometry, mesh.parent.matrix),
                !self.data.preserveOriginal && mesh.parent.remove(mesh));
            });
        },
      }),
      AFRAME.registerComponent("buffer-geometry-merger", {
        schema: { preserveOriginal: { default: !1 } },
        init: function () {
          var geometries = [];
          this.el.sceneEl.object3D.updateMatrixWorld(),
            this.el.object3D.traverse(function (mesh) {
              "Mesh" !== mesh.type ||
                mesh.el === self.el ||
                (mesh.geometry.applyMatrix(mesh.matrixWorld),
                geometries.push(mesh.geometry.clone()),
                mesh.parent.remove(mesh));
            });
          const geometry =
            THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
          (this.mesh = new THREE.Mesh(geometry)),
            this.el.setObject3D("mesh", this.mesh);
        },
      });
  },
  function () {
    if ("undefined" == typeof AFRAME)
      throw new Error(
        "Component attempted to register before AFRAME was available."
      );
    AFRAME.registerComponent("haptics", {
      dependencies: ["tracked-controls"],
      schema: {
        actuatorIndex: { default: 0 },
        dur: { default: 100 },
        enabled: { default: !0 },
        events: { type: "array" },
        eventsFrom: { type: "string" },
        force: { default: 1 },
      },
      multiple: !0,
      init: function () {
        var data = this.data,
          self = this;
        if (
          ((this.callPulse = function () {
            self.pulse();
          }),
          this.el.components["tracked-controls"].controller)
        ) {
          if (
            ((this.gamepad = this.el.components["tracked-controls"].controller),
            !this.gamepad || !this.gamepad.hapticActuators.length)
          )
            return;
          this.addEventListeners();
        } else
          this.el.addEventListener("controllerconnected", function init() {
            setTimeout(function () {
              (self.gamepad =
                self.el.components["tracked-controls"].controller),
                self.gamepad &&
                  self.gamepad.hapticActuators.length &&
                  self.addEventListeners();
            }, 150);
          });
      },
      remove: function () {
        this.removeEventListeners();
      },
      pulse: function (force, dur) {
        var data = this.data,
          actuator;
        data.enabled &&
          this.gamepad &&
          this.gamepad.hapticActuators &&
          ((actuator = this.gamepad.hapticActuators[data.actuatorIndex]),
          actuator.pulse(force || data.force, dur || data.dur));
      },
      addEventListeners: function () {
        var data = this.data,
          i,
          listenTarget;
        for (
          listenTarget = data.eventsFrom
            ? document.querySelector(data.eventsFrom)
            : this.el,
            i = 0;
          i < data.events.length;
          i++
        )
          listenTarget.addEventListener(data.events[i], this.callPulse);
      },
      removeEventListeners: function () {
        var data = this.data,
          i,
          listenTarget;
        for (
          listenTarget = data.eventsFrom
            ? document.querySelector(data.eventsFrom)
            : this.el,
            i = 0;
          i < data.events.length;
          i++
        )
          listenTarget.removeEventListener(data.events[i], this.callPulse);
      },
    });
  },
  function (module) {
    function getBoxPositions(data, numChildren, marginDefined) {
      var rows = Math.ceil(numChildren / data.columns),
        column,
        marginColumn,
        marginRow,
        offsetColumn,
        offsetRow,
        row;
      for (
        marginColumn = data.marginColumn,
          marginRow = data.marginRow,
          marginDefined &&
            ((marginColumn = data.margin), (marginRow = data.margin)),
          offsetRow = getOffsetItemIndex(data.align, rows),
          offsetColumn = getOffsetItemIndex(data.align, data.columns),
          row = 0;
        row < rows;
        row++
      )
        for (column = 0; column < data.columns; column++)
          positionHelper.set(0, 0, 0),
            0 === data.plane.indexOf("x") &&
              (positionHelper.x = (column - offsetColumn) * marginColumn),
            0 === data.plane.indexOf("y") &&
              (positionHelper.y = (column - offsetColumn) * marginColumn),
            1 === data.plane.indexOf("y") &&
              (positionHelper.y = (row - offsetRow) * marginRow),
            1 === data.plane.indexOf("z") &&
              (positionHelper.z = (row - offsetRow) * marginRow),
            pushPositionVec3(positionHelper);
      return positions;
    }
    function getCirclePositions(data, numChildren) {
      var i, rad;
      for (i = 0; i < numChildren; i++)
        rad,
          (rad = isNaN(data.angle)
            ? (i * (2 * Math.PI)) / numChildren
            : 0.01745329252 * (i * data.angle)),
          positionHelper.set(0, 0, 0),
          0 === data.plane.indexOf("x") &&
            (positionHelper.x = data.radius * _Mathcos(rad)),
          0 === data.plane.indexOf("y") &&
            (positionHelper.y = data.radius * _Mathcos(rad)),
          1 === data.plane.indexOf("y") &&
            (positionHelper.y = data.radius * _Mathsin(rad)),
          1 === data.plane.indexOf("z") &&
            (positionHelper.z = data.radius * _Mathsin(rad)),
          pushPositionVec3(positionHelper);
      return positions;
    }
    function getLinePositions(data, numChildren) {
      return (
        (data.columns = numChildren), getBoxPositions(data, numChildren, !0)
      );
    }
    function getCubePositions(data) {
      return (
        pushPositions(1, 0, 0, 0, 1, 0, 0, 0, 1, -1, 0, 0, 0, -1, 0, 0, 0, -1),
        scalePositions(data.radius / 2),
        positions
      );
    }
    function getDodecahedronPositions(data) {
      var PHI = (1 + 2.23606797749979) / 2,
        B = 1 / PHI,
        C = 2 - PHI,
        NB = -1 * B,
        NC = -1 * C;
      return (
        pushPositions(
          -1,
          C,
          0,
          -1,
          NC,
          0,
          0,
          -1,
          C,
          0,
          -1,
          NC,
          0,
          1,
          C,
          0,
          1,
          NC,
          1,
          C,
          0,
          1,
          NC,
          0,
          B,
          B,
          B,
          B,
          B,
          NB,
          B,
          NB,
          B,
          B,
          NB,
          NB,
          C,
          0,
          1,
          C,
          0,
          -1,
          NB,
          B,
          B,
          NB,
          B,
          NB,
          NB,
          NB,
          B,
          NB,
          NB,
          NB,
          NC,
          0,
          1,
          NC,
          0,
          -1
        ),
        scalePositions(data.radius / 2),
        positions
      );
    }
    function getPyramidPositions(data) {
      var NEG_SQRT_1_3 = -1 / 1.7320508075688772;
      return (
        pushPositions(
          0,
          0,
          1.7320508075688772 + NEG_SQRT_1_3,
          -1,
          0,
          NEG_SQRT_1_3,
          1,
          0,
          NEG_SQRT_1_3,
          0,
          2 * 0.816496580927726,
          0
        ),
        scalePositions(data.radius / 2),
        positions
      );
    }
    function getOffsetItemIndex(align, numItems) {
      return "start" === align
        ? numItems - 1
        : "center" === align
        ? (numItems - 1) / 2
        : "end" === align
        ? 0
        : void 0;
    }
    function scalePositions(scale) {
      var i;
      for (i = 0; i < positions.length; i++) positions[i] *= scale;
    }
    function setPositions(els, positions, orderAttribute) {
      var value, i, orderIndex;
      if (orderAttribute) {
        for (i = 0; i < els.length; i++)
          ((value = els[i].getAttribute(orderAttribute)),
          null !== value && void 0 !== value) &&
            ((orderIndex = 3 * parseInt(value, 10)),
            els[i].object3D.position.set(
              positions[orderIndex],
              positions[orderIndex + 1],
              positions[orderIndex + 2]
            ));
        return;
      }
      for (i = 0; i < positions.length; i += 3) {
        if (!els[i / 3]) return;
        els[i / 3].object3D.position.set(
          positions[i],
          positions[i + 1],
          positions[i + 2]
        );
      }
    }
    function pushPositions() {
      var i;
      for (i = 0; i < arguments.length; i++) positions.push(i);
    }
    function pushPositionVec3(vec3) {
      positions.push(vec3.x), positions.push(vec3.y), positions.push(vec3.z);
    }
    var _Mathsin = Math.sin,
      _Mathcos = Math.cos,
      positions = [],
      positionHelper = new THREE.Vector3();
    AFRAME.registerComponent("layout", {
      schema: {
        angle: {
          type: "number",
          default: !1,
          min: 0,
          max: 360,
          if: { type: ["circle"] },
        },
        columns: { default: 1, min: 0, if: { type: ["box"] } },
        margin: { default: 1, min: 0, if: { type: ["box", "line"] } },
        marginColumn: { default: 1, min: 0, if: { type: ["box"] } },
        marginRow: { default: 1, min: 0, if: { type: ["box"] } },
        orderAttribute: { default: "" },
        plane: { default: "xy" },
        radius: {
          default: 1,
          min: 0,
          if: { type: ["circle", "cube", "dodecahedron", "pyramid"] },
        },
        reverse: { default: !1 },
        type: {
          default: "line",
          oneOf: ["box", "circle", "cube", "dodecahedron", "line", "pyramid"],
        },
        fill: { default: !0, if: { type: ["circle"] } },
        align: { default: "end", oneOf: ["start", "center", "end"] },
      },
      init: function () {
        var self = this,
          el = this.el;
        (this.children = el.getChildEntities()),
          (this.initialPositions = []),
          this.children.forEach(function getInitialPositions(childEl) {
            function _getPositions() {
              self.initialPositions.push(childEl.object3D.position.x),
                self.initialPositions.push(childEl.object3D.position.y),
                self.initialPositions.push(childEl.object3D.position.z);
            }
            return childEl.hasLoaded
              ? _getPositions()
              : void childEl.addEventListener("loaded", _getPositions);
          }),
          (this.handleChildAttached = this.handleChildAttached.bind(this)),
          (this.handleChildDetached = this.handleChildDetached.bind(this)),
          el.addEventListener("child-attached", this.handleChildAttached),
          el.addEventListener("child-detached", this.handleChildDetached),
          el.addEventListener("layoutrefresh", this.update.bind(this));
      },
      update: function () {
        var children = this.children,
          data = this.data,
          el = this.el,
          definedData,
          numChildren,
          positionFn;
        switch (((numChildren = children.length), data.type)) {
          case "box": {
            positionFn = getBoxPositions;
            break;
          }
          case "circle": {
            positionFn = getCirclePositions;
            break;
          }
          case "cube": {
            positionFn = getCubePositions;
            break;
          }
          case "dodecahedron": {
            positionFn = getDodecahedronPositions;
            break;
          }
          case "pyramid": {
            positionFn = getPyramidPositions;
            break;
          }
          default:
            positionFn = getLinePositions;
        }
        (definedData = el.getDOMAttribute("layout")),
          (positions.length = 0),
          (positions = positionFn(
            data,
            numChildren,
            "string" == typeof definedData
              ? -1 !== definedData.indexOf("margin")
              : "margin" in definedData
          )),
          data.reverse && positions.reverse(),
          setPositions(children, positions, data.orderAttribute);
      },
      remove: function () {
        this.el.removeEventListener("child-attached", this.handleChildAttached),
          this.el.removeEventListener(
            "child-detached",
            this.handleChildDetached
          ),
          setPositions(this.children, this.initialPositions);
      },
      handleChildAttached: function (evt) {
        var el = this.el;
        evt.detail.el.parentNode !== el ||
          (this.children.push(evt.detail.el), this.update());
      },
      handleChildDetached: function (evt) {
        -1 === this.children.indexOf(evt.detail.el) ||
          (this.children.splice(this.children.indexOf(evt.detail.el), 1),
          this.initialPositions.splice(this.children.indexOf(evt.detail.el), 1),
          this.update());
      },
    }),
      (module.exports.getBoxPositions = getBoxPositions),
      (module.exports.getCirclePositions = getCirclePositions),
      (module.exports.getLinePositions = getLinePositions),
      (module.exports.getCubePositions = getCubePositions),
      (module.exports.getDodecahedronPositions = getDodecahedronPositions),
      (module.exports.getPyramidPositions = getPyramidPositions);
  },
  function (module, exports, __webpack_require__) {
    __webpack_require__(21),
      AFRAME.registerComponent("orbit-controls", {
        dependencies: ["camera"],
        schema: {
          autoRotate: { type: "boolean" },
          autoRotateSpeed: { default: 2 },
          dampingFactor: { default: 0.1 },
          enabled: { default: !0 },
          enableDamping: { default: !0 },
          enableKeys: { default: !0 },
          enablePan: { default: !0 },
          enableRotate: { default: !0 },
          enableZoom: { default: !0 },
          initialPosition: { type: "vec3" },
          keyPanSpeed: { default: 7 },
          minAzimuthAngle: { type: "number", default: Infinity },
          maxAzimuthAngle: { type: "number", default: Infinity },
          maxDistance: { default: 1e3 },
          maxPolarAngle: { default: AFRAME.utils.device.isMobile() ? 90 : 120 },
          minDistance: { default: 1 },
          minPolarAngle: { default: 0 },
          minZoom: { default: 0 },
          panSpeed: { default: 1 },
          rotateSpeed: { default: 0.05 },
          screenSpacePanning: { default: !1 },
          target: { type: "vec3" },
          zoomSpeed: { default: 0.5 },
        },
        init: function () {
          var el = this.el,
            oldPosition;
          (this.controls = new THREE.OrbitControls(
            el.getObject3D("camera"),
            el.sceneEl.renderer.domElement
          )),
            (oldPosition = new THREE.Vector3()),
            el.sceneEl.addEventListener("enter-vr", () => {
              (AFRAME.utils.device.checkHeadsetConnected() ||
                AFRAME.utils.device.isMobile()) &&
                ((this.controls.enabled = !1),
                el.hasAttribute("look-controls") &&
                  (el.setAttribute("look-controls", "enabled", !0),
                  oldPosition.copy(el.getObject3D("camera").position),
                  el.getObject3D("camera").position.set(0, 0, 0)));
            }),
            el.sceneEl.addEventListener("exit-vr", () => {
              (AFRAME.utils.device.checkHeadsetConnected() ||
                AFRAME.utils.device.isMobile()) &&
                ((this.controls.enabled = !0),
                el.getObject3D("camera").position.copy(oldPosition),
                el.hasAttribute("look-controls") &&
                  el.setAttribute("look-controls", "enabled", !1));
            }),
            (document.body.style.cursor = "grab"),
            document.addEventListener("mousedown", () => {
              document.body.style.cursor = "grabbing";
            }),
            document.addEventListener("mouseup", () => {
              document.body.style.cursor = "grab";
            }),
            (this.target = new THREE.Vector3()),
            el.getObject3D("camera").position.copy(this.data.initialPosition);
        },
        update: function () {
          var controls = this.controls,
            data = this.data;
          (controls.target = this.target.copy(data.target)),
            (controls.autoRotate = data.autoRotate),
            (controls.autoRotateSpeed = data.autoRotateSpeed),
            (controls.dampingFactor = data.dampingFactor),
            (controls.enabled = data.enabled),
            (controls.enableDamping = data.enableDamping),
            (controls.enableKeys = data.enableKeys),
            (controls.enablePan = data.enablePan),
            (controls.enableRotate = data.enableRotate),
            (controls.enableZoom = data.enableZoom),
            (controls.keyPanSpeed = data.keyPanSpeed),
            (controls.maxPolarAngle = THREE.Math.degToRad(data.maxPolarAngle)),
            (controls.maxDistance = data.maxDistance),
            (controls.minDistance = data.minDistance),
            (controls.minPolarAngle = THREE.Math.degToRad(data.minPolarAngle)),
            (controls.minZoom = data.minZoom),
            (controls.panSpeed = data.panSpeed),
            (controls.rotateSpeed = data.rotateSpeed),
            (controls.screenSpacePanning = data.screenSpacePanning),
            (controls.zoomSpeed = data.zoomSpeed);
        },
        tick: function () {
          var controls = this.controls,
            data = this.data;
          !data.enabled ||
            (controls.enabled &&
              (controls.enableDamping || controls.autoRotate) &&
              this.controls.update());
        },
      });
  },
  function () {
    AFRAME.registerComponent("proxy-event", {
      schema: {
        captureBubbles: { default: !1 },
        enabled: { default: !0 },
        event: { type: "string" },
        from: { type: "string" },
        to: { type: "string" },
        as: { type: "string" },
        bubbles: { default: !1 },
      },
      multiple: !0,
      init: function () {
        var data = this.data,
          el = this.el,
          self = this,
          from,
          i,
          to;
        if (
          (data.from
            ? "PARENT" === data.from
              ? (from = [el.parentNode])
              : (from = document.querySelectorAll(data.from))
            : "CHILDREN" === data.to
            ? (to = el.querySelectorAll("*"))
            : "SELF" === data.to
            ? (to = [el])
            : (to = document.querySelectorAll(data.to)),
          data.from)
        )
          for (i = 0; i < from.length; i++) this.addEventListenerFrom(from[i]);
        else
          el.addEventListener(data.event, function (evt) {
            var data = self.data;
            if (data.enabled && (data.captureBubbles || evt.target === el))
              for (i = 0; i < to.length; i++)
                to[i].emit(
                  data.as || data.event,
                  evt.detail ? evt.detail : null,
                  data.bubbles
                );
          });
      },
      addEventListenerFrom: function (fromEl) {
        var data = this.data,
          self = this;
        fromEl.addEventListener(data.event, function (evt) {
          var data = self.data;
          data.enabled &&
            (data.captureBubbles || evt.target === fromEl) &&
            self.el.emit(
              data.as || data.event,
              evt.detail ? evt.detail : null,
              !1
            );
        });
      },
    });
  },
  function (module) {
    (function webpackUniversalModuleDefinition(root, factory) {
      module.exports = factory();
    })("undefined" == typeof self ? this : self, function () {
      return (function (modules) {
        function __webpack_require__(moduleId) {
          if (installedModules[moduleId])
            return installedModules[moduleId].exports;
          var module = (installedModules[moduleId] = {
            i: moduleId,
            l: !1,
            exports: {},
          });
          return (
            modules[moduleId].call(
              module.exports,
              module,
              module.exports,
              __webpack_require__
            ),
            (module.l = !0),
            module.exports
          );
        }
        var installedModules = {};
        return (
          (__webpack_require__.m = modules),
          (__webpack_require__.c = installedModules),
          (__webpack_require__.d = function (exports, name, getter) {
            __webpack_require__.o(exports, name) ||
              Object.defineProperty(exports, name, {
                configurable: !1,
                enumerable: !0,
                get: getter,
              });
          }),
          (__webpack_require__.n = function (module) {
            var getter =
              module && module.__esModule
                ? function getDefault() {
                    return module["default"];
                  }
                : function getModuleExports() {
                    return module;
                  };
            return __webpack_require__.d(getter, "a", getter), getter;
          }),
          (__webpack_require__.o = function (object, property) {
            return Object.prototype.hasOwnProperty.call(object, property);
          }),
          (__webpack_require__.p = ""),
          __webpack_require__((__webpack_require__.s = 0))
        );
      })([
        function (module, exports, __webpack_require__) {
          if ("undefined" == typeof AFRAME)
            throw new Error(
              "Component attempted to register before AFRAME was available."
            );
          AFRAME.registerShader("ring", {
            schema: {
              blur: { default: 0.01, is: "uniform" },
              color: { type: "color", is: "uniform" },
              progress: { default: 0, is: "uniform" },
              radiusInner: { default: 0.85, is: "uniform" },
              radiusOuter: { default: 1, is: "uniform" },
            },
            vertexShader: __webpack_require__(1),
            fragmentShader: __webpack_require__(2),
          });
        },
        function (module) {
          module.exports =
            "varying vec2 vUv;\n\nvoid main () {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}\n";
        },
        function (module) {
          module.exports =
            "#define PI 3.14159265358979\nuniform float blur;\nuniform float progress;\nuniform float radiusInner;\nuniform float radiusOuter;\nuniform vec3 color;\n\nvarying vec2 vUv;\n\nvoid main () {\n  vec2 uv = vec2(vUv.x * 2. - 1., vUv.y * 2. - 1.);\n  float r = uv.x * uv.x + uv.y * uv.y;\n  float col = (1.0 - smoothstep(radiusOuter, radiusOuter + blur, r)) * smoothstep(radiusInner, radiusInner + blur, r);\n  float a = smoothstep(-PI, PI, atan(uv.y, uv.x));\n  float p = 1.0 - progress - blur;\n  col *= smoothstep(p, p + blur, a);\n  gl_FragColor = vec4(color * col, col);\n}\n";
        },
      ]);
    });
  },
  function () {
    function parseSide(side) {
      return "back" === side
        ? THREE.BackSide
        : "double" === side
        ? THREE.DoubleSide
        : THREE.FrontSide;
    }
    if ("undefined" == typeof AFRAME)
      throw new Error(
        "Component attempted to register before AFRAME was available."
      );
    AFRAME.registerComponent("slice9", {
      schema: {
        width: { default: 1, min: 0 },
        height: { default: 1, min: 0 },
        left: { default: 0, min: 0 },
        right: { default: 0, min: 0 },
        bottom: { default: 0, min: 0 },
        top: { default: 0, min: 0 },
        side: { default: "front", oneOf: ["front", "back", "double"] },
        padding: { default: 0.1, min: 0.01 },
        color: { type: "color", default: "#fff" },
        opacity: { default: 1, min: 0, max: 1 },
        transparent: { default: !0 },
        debug: { default: !1 },
        src: { type: "map" },
      },
      multiple: !1,
      init: function () {
        var data = this.data,
          material = (this.material = new THREE.MeshBasicMaterial({
            color: data.color,
            opacity: data.opacity,
            transparent: data.transparent,
            wireframe: data.debug,
          })),
          geometry = (this.geometry = new THREE.PlaneBufferGeometry(
            data.width,
            data.height,
            3,
            3
          )),
          textureLoader = new THREE.TextureLoader();
        (this.plane = new THREE.Mesh(geometry, material)),
          this.el.setObject3D("mesh", this.plane),
          (this.textureSrc = null);
      },
      updateMap: function () {
        function setMap(texture) {
          (this.material.map = texture),
            (this.material.needsUpdate = !0),
            this.regenerateMesh();
        }
        var src = this.data.src;
        return src
          ? src === this.textureSrc
            ? void 0
            : ((this.textureSrc = src),
              void this.el.sceneEl.systems.material.loadTexture(
                src,
                { src: src },
                setMap.bind(this)
              ))
          : void (!this.material.map || setMap(null));
      },
      regenerateMesh: function () {
        function setPos(id, x, y) {
          (pos[3 * id] = x), (pos[3 * id + 1] = y);
        }
        function setUV(id, u, v) {
          (uvs[2 * id] = u), (uvs[2 * id + 1] = v);
        }
        var data = this.data,
          pos = this.geometry.attributes.position.array,
          uvs = this.geometry.attributes.uv.array,
          image = this.material.map.image;
        if (image) {
          var uv = {
            left: data.left / image.width,
            right: data.right / image.width,
            top: data.top / image.height,
            bottom: data.bottom / image.height,
          };
          setUV(1, uv.left, 1),
            setUV(2, uv.right, 1),
            setUV(4, 0, uv.bottom),
            setUV(5, uv.left, uv.bottom),
            setUV(6, uv.right, uv.bottom),
            setUV(7, 1, uv.bottom),
            setUV(8, 0, uv.top),
            setUV(9, uv.left, uv.top),
            setUV(10, uv.right, uv.top),
            setUV(11, 1, uv.top),
            setUV(13, uv.left, 0),
            setUV(14, uv.right, 0);
          var w2 = data.width / 2,
            h2 = data.height / 2,
            left = -w2 + data.padding,
            right = w2 - data.padding,
            top = h2 - data.padding,
            bottom = -h2 + data.padding;
          setPos(0, -w2, h2),
            setPos(1, left, h2),
            setPos(2, right, h2),
            setPos(3, w2, h2),
            setPos(4, -w2, top),
            setPos(5, left, top),
            setPos(6, right, top),
            setPos(7, w2, top),
            setPos(8, -w2, bottom),
            setPos(9, left, bottom),
            setPos(10, right, bottom),
            setPos(11, w2, bottom),
            setPos(13, left, -h2),
            setPos(14, right, -h2),
            setPos(12, -w2, -h2),
            setPos(15, w2, -h2),
            (this.geometry.attributes.position.needsUpdate = !0),
            (this.geometry.attributes.uv.needsUpdate = !0);
        }
      },
      update: function (oldData) {
        var data = this.data;
        this.material.color.setStyle(data.color),
          (this.material.opacity = data.opacity),
          (this.material.transparent = data.transparent),
          (this.material.wireframe = data.debug),
          (this.material.side = parseSide(data.side));
        var diff = AFRAME.utils.diff(data, oldData);
        "src" in diff
          ? this.updateMap()
          : ("width" in diff ||
              "height" in diff ||
              "padding" in diff ||
              "left" in diff ||
              "top" in diff ||
              "bottom" in diff ||
              "right" in diff) &&
            this.regenerateMesh();
      },
      remove: function () {},
      pause: function () {},
      play: function () {},
    });
  },
  function (module) {
    (function webpackUniversalModuleDefinition(root, factory) {
      module.exports = factory();
    })("undefined" == typeof self ? this : self, function () {
      return (function (modules) {
        function __webpack_require__(moduleId) {
          if (installedModules[moduleId])
            return installedModules[moduleId].exports;
          var module = (installedModules[moduleId] = {
            i: moduleId,
            l: !1,
            exports: {},
          });
          return (
            modules[moduleId].call(
              module.exports,
              module,
              module.exports,
              __webpack_require__
            ),
            (module.l = !0),
            module.exports
          );
        }
        var installedModules = {};
        return (
          (__webpack_require__.m = modules),
          (__webpack_require__.c = installedModules),
          (__webpack_require__.d = function (exports, name, getter) {
            __webpack_require__.o(exports, name) ||
              Object.defineProperty(exports, name, {
                configurable: !1,
                enumerable: !0,
                get: getter,
              });
          }),
          (__webpack_require__.n = function (module) {
            var getter =
              module && module.__esModule
                ? function getDefault() {
                    return module["default"];
                  }
                : function getModuleExports() {
                    return module;
                  };
            return __webpack_require__.d(getter, "a", getter), getter;
          }),
          (__webpack_require__.o = function (object, property) {
            return Object.prototype.hasOwnProperty.call(object, property);
          }),
          (__webpack_require__.p = ""),
          __webpack_require__((__webpack_require__.s = 1))
        );
      })([
        function (module) {
          "use strict";
          function generateExpression(str) {
            return (
              (str = str.replace(DOT_NOTATION_RE, '["$1"]')),
              (str = str.replace(ROOT_STATE_SELECTOR_RE, '$1state["$2"]')),
              (str = str.replace(STATE_SELECTOR_RE, '$1$2$3state["$4"]')),
              (str = str.replace(ITEM_RE, "item")),
              str
            );
          }
          function composeFunctions() {
            var functions = arguments;
            return function () {
              var i;
              for (i = 0; i < functions.length; i++)
                functions[i].apply(this, arguments);
            };
          }
          function parseKeyToWatch(str) {
            var dotIndex;
            return (
              (str = stripNot(str.trim())),
              (dotIndex = str.indexOf(".")),
              -1 === dotIndex ? str : str.substring(0, str.indexOf("."))
            );
          }
          function stripNot(str) {
            if (0 === str.indexOf("!!")) return str.replace("!!", "");
            return 0 === str.indexOf("!") ? str.replace("!", "") : str;
          }
          function split(str, delimiter) {
            return (SPLIT_CACHE[delimiter] || (SPLIT_CACHE[delimiter] = {}),
            SPLIT_CACHE[delimiter][str])
              ? SPLIT_CACHE[delimiter][str]
              : ((SPLIT_CACHE[delimiter][str] = str.split(delimiter)),
                SPLIT_CACHE[delimiter][str]);
          }
          var selectFunctions = {};
          module.exports.select = function select(state, selector, item) {
            return (
              selectFunctions[selector] ||
                (selectFunctions[selector] = new Function(
                  "state",
                  "item",
                  "return " + generateExpression(selector) + ";"
                )),
              selectFunctions[selector](state, item)
            );
          };
          var DOT_NOTATION_RE = /\.([A-Za-z][\w_-]*)/g,
            WHITESPACE_RE = /\s/g,
            STATE_SELECTOR_RE = /([=&|!?:+-])(\s*)([\(]?)([A-Za-z][\w_-]*)/g,
            ROOT_STATE_SELECTOR_RE = /^([\(]?)([A-Za-z][\w_-]*)/g,
            ITEM_RE = /state\["item"\]/g;
          (module.exports.generateExpression = generateExpression),
            (module.exports.clearObject = function clearObject(obj) {
              for (var key in obj) delete obj[key];
            }),
            (module.exports.composeHandlers = function composeHandlers() {
              var inputHandlers = arguments,
                actionName,
                i,
                outputHandlers;
              for (outputHandlers = {}, i = 0; i < inputHandlers.length; i++)
                for (actionName in inputHandlers[i])
                  actionName in outputHandlers
                    ? outputHandlers[actionName].constructor === Array
                      ? outputHandlers[actionName].push(
                          inputHandlers[i][actionName]
                        )
                      : (outputHandlers[actionName] = [
                          outputHandlers[actionName],
                          inputHandlers[i][actionName],
                        ])
                    : (outputHandlers[actionName] =
                        inputHandlers[i][actionName]);
              for (actionName in outputHandlers)
                outputHandlers[actionName].constructor === Array &&
                  (outputHandlers[actionName] = composeFunctions.apply(
                    this,
                    outputHandlers[actionName]
                  ));
              return outputHandlers;
            }),
            (module.exports.composeFunctions = composeFunctions);
          var NO_WATCH_TOKENS = [
              "||",
              "&&",
              "!=",
              "!==",
              "==",
              "===",
              ">",
              "<",
              "<=",
              ">=",
            ],
            WHITESPACE_PLUS_RE = /\s+/;
          module.exports.parseKeysToWatch = function parseKeysToWatch(
            keys,
            str,
            isBindItem
          ) {
            var i, tokens;
            for (
              tokens = split(str, WHITESPACE_PLUS_RE), i = 0;
              i < tokens.length;
              i++
            )
              if (
                -1 === NO_WATCH_TOKENS.indexOf(tokens[i]) &&
                !tokens[i].startsWith("'") &&
                -1 === keys.indexOf(tokens[i])
              ) {
                if (isBindItem && "item" === tokens[i]) continue;
                keys.push(parseKeyToWatch(tokens[i]));
              }
          };
          var SPLIT_CACHE = {};
          (module.exports.split = split),
            (module.exports.copyArray = function copyArray(dest, src) {
              var i;
              for (dest.length = 0, i = 0; i < src.length; i++)
                dest[i] = src[i];
            });
        },
        function (module, exports, __webpack_require__) {
          "use strict";
          var _typeof =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (obj) {
                  return typeof obj;
                }
              : function (obj) {
                  return obj &&
                    "function" == typeof Symbol &&
                    obj.constructor === Symbol &&
                    obj !== Symbol.prototype
                    ? "symbol"
                    : typeof obj;
                };
          __webpack_require__(2);
          var diff = __webpack_require__(3),
            lib = __webpack_require__(0),
            wrapArray = __webpack_require__(4).wrapArray,
            State = {
              initialState: {},
              nonBindedStateKeys: [],
              handlers: {},
              computeState: function computeState() {},
            },
            TYPE_OBJECT = "object",
            WHITESPACE_REGEX = /s+/;
          (AFRAME.registerState = function (definition) {
            AFRAME.utils.extend(State, definition);
          }),
            AFRAME.registerSystem("state", {
              init: function init() {
                var _this = this,
                  key;
                for (key in ((this.arrays = []),
                (this.dirtyArrays = []),
                (this.diff = {}),
                (this.state = AFRAME.utils.clone(State.initialState)),
                (this.subscriptions = []),
                this.initEventHandlers(),
                this.state))
                  this.state[key] &&
                    this.state[key].constructor === Array &&
                    (this.arrays.push(key),
                    (this.state[key].__dirty = !0),
                    wrapArray(this.state[key]));
                (this.lastState = AFRAME.utils.clone(this.state)),
                  (this.eventDetail = {
                    lastState: this.lastState,
                    state: this.state,
                  }),
                  this.el.addEventListener("loaded", function () {
                    var i;
                    for (
                      State.computeState(_this.state, "@@INIT"), i = 0;
                      i < _this.subscriptions.length;
                      i++
                    )
                      _this.subscriptions[i].onStateUpdate(_this.state);
                  });
              },
              dispatch: function dispatch(actionName, payload) {
                var i, key;
                for (key in (State.handlers[actionName](this.state, payload),
                State.computeState(this.state, actionName, payload),
                this.diff))
                  delete this.diff[key];
                for (
                  diff(
                    this.lastState,
                    this.state,
                    this.diff,
                    State.nonBindedStateKeys
                  ),
                    this.dirtyArrays.length = 0,
                    i = 0;
                  i < this.arrays.length;
                  i++
                )
                  this.state[this.arrays[i]].__dirty &&
                    this.dirtyArrays.push(this.arrays[i]);
                for (i = 0; i < this.subscriptions.length; i++) {
                  if ("bind-for" === this.subscriptions[i].name) {
                    if (
                      !this.state[this.subscriptions[i].keysToWatch[0]].__dirty
                    )
                      continue;
                  } else if (
                    !this.shouldUpdate(
                      this.subscriptions[i].keysToWatch,
                      this.diff,
                      this.dirtyArrays
                    )
                  )
                    continue;
                  this.subscriptions[i].onStateUpdate();
                }
                for (key in this.state)
                  this.state[key] &&
                    this.state[key].constructor === Array &&
                    (this.state[key].__dirty = !1);
                this.copyState(this.lastState, this.state),
                  (this.eventDetail.action = actionName),
                  (this.eventDetail.payload = payload),
                  this.el.emit("stateupdate", this.eventDetail);
              },
              copyState: function copyState(lastState, state, isRecursive) {
                for (var key in state)
                  if (
                    isRecursive ||
                    -1 === State.nonBindedStateKeys.indexOf(key)
                  ) {
                    if (state[key] && state[key].constructor === Object) {
                      if (!(key in lastState)) {
                        lastState[key] = AFRAME.utils.clone(state[key]);
                        continue;
                      }
                      this.copyState(lastState[key], state[key], !0);
                      continue;
                    }
                    lastState[key] = state[key];
                  }
              },
              subscribe: function subscribe(component) {
                this.subscriptions.push(component);
              },
              unsubscribe: function unsubscribe(component) {
                this.subscriptions.splice(
                  this.subscriptions.indexOf(component),
                  1
                );
              },
              shouldUpdate: function shouldUpdate(
                keysToWatch,
                diff,
                dirtyArrays
              ) {
                for (var i = 0; i < keysToWatch.length; i++)
                  if (
                    keysToWatch[i] in diff ||
                    -1 !== dirtyArrays.indexOf(keysToWatch[i])
                  )
                    return !0;
                return !1;
              },
              initEventHandlers: function initEventHandlers() {
                function registerListener(actionName) {
                  var _this2 = this;
                  this.el.addEventListener(actionName, function (evt) {
                    _this2.dispatch(actionName, evt.detail);
                  });
                }
                var registeredActions = [],
                  self = this,
                  actionName;
                for (actionName in ((registerListener =
                  registerListener.bind(this)),
                State.handlers))
                  -1 === registeredActions.indexOf(actionName) &&
                    (registeredActions.push(actionName),
                    registerListener(actionName));
              },
              renderTemplate: (function () {
                var interpRegex = /{{\s*(\w*\.)?([\w.]+)\s*}}/g;
                return function (template, data, asString) {
                  var match, str;
                  if (((str = template), data))
                    for (; (match = interpRegex.exec(template)); )
                      str = str.replace(
                        match[0],
                        ("undefined" == typeof data
                          ? "undefined"
                          : _typeof(data)) === TYPE_OBJECT
                          ? lib.select(data, match[2]) || ""
                          : data
                      );
                  return asString
                    ? str
                    : document.createRange().createContextualFragment(str);
                };
              })(),
              select: lib.select,
            }),
            AFRAME.registerComponent("bind", {
              schema: {
                default: {},
                parse: function parse(value) {
                  var data, i, properties, pair;
                  if (value.constructor === Object) return value;
                  if (-1 === value.indexOf(":")) return value;
                  for (
                    data = {}, properties = lib.split(value, ";"), i = 0;
                    i < properties.length;
                    i++
                  )
                    (pair = lib.split(properties[i].trim(), ":")),
                      (data[pair[0]] = pair[1].trim());
                  return data;
                },
              },
              multiple: !0,
              init: function init() {
                var data = this.data,
                  componentId;
                (this.keysToWatch = []),
                  (this.onStateUpdate = this.onStateUpdate.bind(this)),
                  (this.system = this.el.sceneEl.systems.state),
                  this.id && (componentId = lib.split(this.id, "__")[0]),
                  (this.isNamespacedBind =
                    (this.id &&
                      componentId in AFRAME.components &&
                      !AFRAME.components[componentId].isSingleProp) ||
                    componentId in AFRAME.systems),
                  (this.lastData = {}),
                  (this.updateObj = {}),
                  this.system.subscribe(this),
                  (this.onStateUpdate = this.onStateUpdate.bind(this));
              },
              update: function update() {
                var data = this.data,
                  key;
                if (((this.keysToWatch.length = 0), "string" == typeof data))
                  lib.parseKeysToWatch(this.keysToWatch, data);
                else
                  for (key in data)
                    lib.parseKeysToWatch(this.keysToWatch, data[key]);
                this.onStateUpdate();
              },
              onStateUpdate: function onStateUpdate() {
                var hasKeys = !1,
                  el = this.el,
                  propertyName,
                  stateSelector,
                  state,
                  value;
                if (el.parentNode) {
                  if (
                    (this.isNamespacedBind && lib.clearObject(this.updateObj),
                    (state = this.system.state),
                    _typeof(this.data) !== TYPE_OBJECT)
                  ) {
                    try {
                      value = lib.select(state, this.data);
                    } catch (e) {
                      throw new Error(
                        "[aframe-state-component] Key '" +
                          this.data +
                          "' not found in state." +
                          (" #" +
                            this.el.getAttribute("id") +
                            "[" +
                            this.attrName +
                            "]")
                      );
                    }
                    return ("undefined" == typeof value
                      ? "undefined"
                      : _typeof(value)) !== TYPE_OBJECT &&
                      _typeof(this.lastData) !== TYPE_OBJECT &&
                      this.lastData === value
                      ? void 0
                      : (AFRAME.utils.entity.setComponentProperty(
                          el,
                          this.id,
                          value
                        ),
                        void (this.lastData = value));
                  }
                  for (propertyName in this.data) {
                    stateSelector = this.data[propertyName].trim();
                    try {
                      value = lib.select(state, stateSelector);
                    } catch (e) {
                      throw (
                        (console.log(e),
                        new Error(
                          "[aframe-state-component] Key '" +
                            stateSelector +
                            "' not found in state." +
                            (" #" +
                              this.el.getAttribute("id") +
                              "[" +
                              this.attrName +
                              "]")
                        ))
                      );
                    }
                    if (
                      ("undefined" == typeof value
                        ? "undefined"
                        : _typeof(value)) === TYPE_OBJECT ||
                      _typeof(this.lastData[propertyName]) === TYPE_OBJECT ||
                      this.lastData[propertyName] !== value
                    ) {
                      if (propertyName in AFRAME.components && void 0 === value)
                        return void el.removeAttribute(propertyName);
                      this.isNamespacedBind
                        ? (this.updateObj[propertyName] = value)
                        : AFRAME.utils.entity.setComponentProperty(
                            el,
                            propertyName,
                            value
                          ),
                        (this.lastData[propertyName] = value);
                    }
                  }
                  for (hasKeys in this.updateObj);
                  this.isNamespacedBind &&
                    hasKeys &&
                    el.setAttribute(this.id, this.updateObj);
                }
              },
              remove: function remove() {
                this.system.unsubscribe(this);
              },
            }),
            AFRAME.registerComponent("bind-toggle", {
              schema: { type: "string" },
              multiple: !0,
              init: function init() {
                (this.system = this.el.sceneEl.systems.state),
                  (this.keysToWatch = []),
                  (this.onStateUpdate = this.onStateUpdate.bind(this)),
                  this.system.subscribe(this),
                  this.onStateUpdate();
              },
              update: function update() {
                (this.keysToWatch.length = 0),
                  lib.parseKeysToWatch(this.keysToWatch, this.data);
              },
              onStateUpdate: function onStateUpdate() {
                var el = this.el,
                  state,
                  value;
                state = this.system.state;
                try {
                  value = lib.select(state, this.data);
                } catch (e) {
                  throw new Error(
                    "[aframe-state-component] Key '" +
                      this.data +
                      "' not found in state." +
                      (" #" +
                        this.el.getAttribute("id") +
                        "[" +
                        this.attrName +
                        "]")
                  );
                }
                value
                  ? el.setAttribute(this.id, "")
                  : el.removeAttribute(this.id);
              },
              remove: function remove() {
                this.system.unsubscribe(this);
              },
            }),
            (module.exports = {
              composeFunctions: lib.composeFunctions,
              composeHandlers: lib.composeHandlers,
              select: lib.select,
            });
        },
        function (module, exports, __webpack_require__) {
          "use strict";
          var lib = __webpack_require__(0),
            ITEM_RE = /item/,
            ITEM_PREFIX_RE = /item./,
            ITEM_SELECTOR_RE = /item.(\w+)/;
          AFRAME.registerComponent("bind-for", {
            schema: {
              delay: { default: 0 },
              for: { type: "string", default: "item" },
              in: { type: "string" },
              key: { type: "string" },
              pool: { default: 0 },
              template: { type: "string" },
              updateInPlace: { default: !1 },
            },
            init: function init() {
              (this.system = this.el.sceneEl.systems.state),
                (this.onStateUpdate = this.onStateUpdate.bind(this)),
                (this.keysToWatch = []),
                (this.renderedKeys = []),
                this.system.subscribe(this),
                (this.template =
                  this.el.children[0] &&
                  "TEMPLATE" === this.el.children[0].tagName
                    ? this.el.children[0].innerHTML.trim()
                    : document
                        .querySelector(this.data.template)
                        .innerHTML.trim());
              for (var i = 0; i < this.data.pool; i++)
                this.el.appendChild(this.generateFromTemplate(null, i));
            },
            update: function update() {
              (this.keysToWatch[0] = lib.split(this.data.in, ".")[0]),
                this.onStateUpdate();
            },
            onStateUpdateNaive: (function () {
              var activeKeys = [];
              return function () {
                var data = this.data,
                  el = this.el,
                  list;
                try {
                  list = lib.select(this.system.state, data.in);
                } catch (e) {
                  throw new Error(
                    "[aframe-state-component] Key '" +
                      data.in +
                      "' not found in state." +
                      (" #" + el.getAttribute("id") + "[" + this.attrName + "]")
                  );
                }
                activeKeys.length = 0;
                for (var i = 0, item; i < list.length; i++)
                  (item = list[i]),
                    activeKeys.push(
                      data.key ? item[data.key].toString() : item.toString()
                    );
                for (
                  var toRemoveEls = this.getElsToRemove(
                      activeKeys,
                      this.renderedKeys
                    ),
                    _i = 0;
                  _i < toRemoveEls.length;
                  _i++
                )
                  toRemoveEls[_i].parentNode.removeChild(toRemoveEls[_i]);
                list.length && this.renderItems(list, activeKeys, 0);
              };
            })(),
            renderItems: function renderItems(list, activeKeys, i) {
              var _this = this,
                data = this.data,
                el = this.el,
                item = list[i],
                keyValue = data.key
                  ? item[data.key].toString()
                  : item.toString(),
                itemEl;
              if (-1 === this.renderedKeys.indexOf(keyValue))
                (itemEl = this.generateFromTemplate(item, i)),
                  el.appendChild(itemEl),
                  this.renderedKeys.push(keyValue);
              else {
                if (list.length && list[0].constructor === String) {
                  var _keyValue = data.key
                    ? item[data.key].toString()
                    : item.toString();
                  (itemEl = el.querySelector(
                    '[data-bind-for-value="' + _keyValue + '"]'
                  )),
                    itemEl.setAttribute("data-bind-for-key", i);
                } else {
                  var bindForKey = this.getBindForKey(item, i);
                  itemEl = el.querySelector(
                    '[data-bind-for-key="' + bindForKey + '"]'
                  );
                }
                itemEl.emit("bindforupdate", item, !1);
              }
              list[i + 1] &&
                (this.data.delay
                  ? setTimeout(function () {
                      _this.renderItems(list, activeKeys, i + 1);
                    }, this.data.delay)
                  : this.renderItems(list, activeKeys, i + 1));
            },
            onStateUpdateInPlace: (function () {
              var activeKeys = [];
              return function () {
                var data = this.data,
                  el = this.el,
                  list,
                  keyValue;
                try {
                  list = lib.select(this.system.state, data.in);
                } catch (e) {
                  throw (
                    (console.log(e),
                    new Error(
                      "[aframe-state-component] Key '" +
                        data.in +
                        "' not found in state." +
                        (" #" +
                          el.getAttribute("id") +
                          "[" +
                          this.attrName +
                          "]")
                    ))
                  );
                }
                activeKeys.length = 0;
                for (var i = 0, item; i < list.length; i++)
                  (item = list[i]),
                    (keyValue = data.key
                      ? item[data.key].toString()
                      : item.toString()),
                    activeKeys.push(keyValue);
                for (
                  var toRemoveEls = this.getElsToRemove(
                      activeKeys,
                      this.renderedKeys
                    ),
                    _i2 = 0;
                  _i2 < toRemoveEls.length;
                  _i2++
                )
                  (toRemoveEls[_i2].object3D.visible = !1),
                    toRemoveEls[_i2].setAttribute(
                      "data-bind-for-active",
                      "false"
                    ),
                    toRemoveEls[_i2].removeAttribute("data-bind-for-key"),
                    toRemoveEls[_i2].removeAttribute("data-bind-for-value"),
                    toRemoveEls[_i2].emit("bindfordeactivate", null, !1),
                    toRemoveEls[_i2].pause();
                list.length && this.renderItemsInPlace(list, activeKeys, 0);
              };
            })(),
            renderItemsInPlace: function renderItemsInPlace(
              list,
              activeKeys,
              i
            ) {
              var _this2 = this,
                data = this.data,
                el = this.el,
                item = list[i],
                bindForKey = this.getBindForKey(item, i),
                keyValue = data.key
                  ? item[data.key].toString()
                  : item.toString(),
                itemEl;
              if (-1 === this.renderedKeys.indexOf(keyValue)) {
                if (
                  !el.querySelector(':scope > [data-bind-for-active="false"]')
                ) {
                  var _itemEl = this.generateFromTemplate(item, i);
                  _itemEl.addEventListener("loaded", function () {
                    _itemEl.emit("bindforupdateinplace", item, !1);
                  }),
                    el.appendChild(_itemEl);
                } else
                  (itemEl = el.querySelector('[data-bind-for-active="false"]')),
                    itemEl.setAttribute("data-bind-for-key", bindForKey),
                    itemEl.setAttribute("data-bind-for-value", keyValue),
                    (itemEl.object3D.visible = !0),
                    itemEl.play(),
                    itemEl.setAttribute("data-bind-for-active", "true"),
                    itemEl.emit("bindforupdateinplace", item, !1);
                this.renderedKeys.push(keyValue);
              } else
                -1 !== activeKeys.indexOf(keyValue) &&
                  (list.length && list[0].constructor === String
                    ? ((itemEl = el.querySelector(
                        '[data-bind-for-value="' + keyValue + '"]'
                      )),
                      itemEl.setAttribute("data-bind-for-key", i))
                    : (itemEl = el.querySelector(
                        '[data-bind-for-key="' + bindForKey + '"]'
                      )),
                  itemEl.emit("bindforupdateinplace", item, !1));
              list[i + 1] &&
                (this.data.delay
                  ? setTimeout(function () {
                      _this2.renderItemsInPlace(list, activeKeys, i + 1);
                    }, this.data.delay)
                  : this.renderItemsInPlace(list, activeKeys, i + 1));
            },
            generateFromTemplate: function generateFromTemplate(item, i) {
              var data = this.data;
              this.el.appendChild(
                this.system.renderTemplate(this.template, item)
              );
              var newEl = this.el.children[this.el.children.length - 1];
              if (!item)
                return (
                  newEl.setAttribute("data-bind-for-key", ""),
                  newEl.setAttribute("data-bind-for-active", "false"),
                  newEl
                );
              var bindForKey = this.getBindForKey(item, i);
              return (
                newEl.setAttribute("data-bind-for-key", bindForKey),
                data.key || newEl.setAttribute("data-bind-for-value", item),
                newEl.setAttribute("data-bind-for-active", "true"),
                newEl
              );
            },
            getElsToRemove: (function () {
              var toRemove = [];
              return function (activeKeys, renderedKeys) {
                var data = this.data,
                  el = this.el;
                toRemove.length = 0;
                for (var i = 0; i < el.children.length; i++)
                  if ("TEMPLATE" !== el.children[i].tagName) {
                    var key = data.key
                      ? el.children[i].getAttribute("data-bind-for-key")
                      : el.children[i].getAttribute("data-bind-for-value");
                    -1 === activeKeys.indexOf(key) &&
                      -1 !== renderedKeys.indexOf(key) &&
                      (toRemove.push(el.children[i]),
                      renderedKeys.splice(renderedKeys.indexOf(key), 1));
                  }
                return toRemove;
              };
            })(),
            getBindForKey: function getBindForKey(item, i) {
              return this.data.key
                ? item[this.data.key].toString()
                : i.toString();
            },
            onStateUpdate: function onStateUpdate() {
              this.data.updateInPlace
                ? this.onStateUpdateInPlace()
                : this.onStateUpdateNaive();
            },
          }),
            AFRAME.registerComponent("bind-item", {
              schema: { type: "string" },
              multiple: !0,
              init: function init() {
                (this.itemData = null),
                  (this.keysToWatch = []),
                  (this.prevValues = {});
                var rootEl = (this.rootEl = this.el.closest(
                  "[data-bind-for-key]"
                ));
                if (!rootEl)
                  throw new Error(
                    "bind-item component must be attached to entity under a bind-for item."
                  );
                rootEl.addEventListener(
                  "bindforupdateinplace",
                  this.updateInPlace.bind(this)
                ),
                  rootEl.addEventListener(
                    "bindfordeactivate",
                    this.deactivate.bind(this)
                  ),
                  this.el.sceneEl.systems.state.subscribe(this);
              },
              update: function update() {
                this.parseSelector();
              },
              updateInPlace: function updateInPlace(evt) {
                var propertyMap = this.propertyMap;
                if (
                  "false" !== this.rootEl.getAttribute("data-bind-for-active")
                )
                  for (var property in (evt && (this.itemData = evt.detail),
                  propertyMap)) {
                    var value = this.select(
                      this.itemData,
                      propertyMap[property]
                    );
                    value !== this.prevValues[property] &&
                      (AFRAME.utils.entity.setComponentProperty(
                        this.el,
                        property,
                        value
                      ),
                      (this.prevValues[property] = value));
                  }
              },
              onStateUpdate: function onStateUpdate() {
                this.updateInPlace();
              },
              select: function select(itemData, selector) {
                return lib.select(
                  this.el.sceneEl.systems.state.state,
                  selector,
                  itemData
                );
              },
              deactivate: function deactivate() {
                this.prevValues = {};
              },
              parseSelector: function parseSelector() {
                var propertyMap = (this.propertyMap = {});
                this.keysToWatch.length = 0;
                var componentName = lib.split(this.id, "__")[0];
                if (
                  componentName in AFRAME.components &&
                  !AFRAME.components[componentName].isSingleProp
                ) {
                  for (
                    var propertySplitList = lib.split(this.data, ";"),
                      i = 0,
                      propertySplit;
                    i < propertySplitList.length;
                    i++
                  )
                    (propertySplit = lib.split(propertySplitList[i], ":")),
                      (propertyMap[this.id + "." + propertySplit[0].trim()] =
                        propertySplit[1].trim()),
                      lib.parseKeysToWatch(
                        this.keysToWatch,
                        propertySplit[1].trim(),
                        !0
                      );
                  return;
                }
                (propertyMap[this.id] = this.data),
                  lib.parseKeysToWatch(this.keysToWatch, this.data, !0);
              },
            });
        },
        function (module) {
          "use strict";
          module.exports = (function () {
            var keys = [];
            return function (a, b, targetObject, ignoreKeys) {
              var aVal, bVal, bKey, diff, key, i, isComparingObjects;
              for (key in ((diff = targetObject || {}), (keys.length = 0), a))
                keys.push(key);
              if (!b) return diff;
              for (bKey in b) -1 === keys.indexOf(bKey) && keys.push(bKey);
              for (i = 0; i < keys.length; i++)
                ((key = keys[i]),
                !(ignoreKeys && -1 !== ignoreKeys.indexOf(key))) &&
                  ((aVal = a[key]),
                  (bVal = b[key]),
                  (isComparingObjects =
                    aVal &&
                    bVal &&
                    aVal.constructor === Object &&
                    bVal.constructor === Object),
                  ((!isComparingObjects ||
                    AFRAME.utils.deepEqual(aVal, bVal)) &&
                    (isComparingObjects || aVal === bVal)) ||
                    (diff[key] = bVal));
              return diff;
            };
          })();
        },
        function (module) {
          "use strict";
          function makeCallDirty(arr, fn) {
            var originalFn = arr[fn];
            arr[fn] = function () {
              originalFn.apply(arr, arguments), (arr.__dirty = !0);
            };
          }
          var fns = ["push", "pop", "shift", "unshift", "splice"];
          module.exports.wrapArray = function wrapArray(arr) {
            var i;
            if (!arr.__wrapped) {
              for (i = 0; i < fns.length; i++) makeCallDirty(arr, fns[i]);
              arr.__wrapped = !0;
            }
          };
        },
      ]);
    });
  },
  function () {
    var TYPE_PAD = "PAD",
      TYPE_STICK = "STICK",
      ANGLES = [0, 90, 180, 270],
      DIRECTIONS = ["right", "up", "left", "down"],
      EVENTS = { NULL: { START: "thumbstart", END: "thumbend" } };
    DIRECTIONS.forEach((direction) => {
      (EVENTS[direction] = {}),
        (EVENTS[direction].START = "thumb" + direction + "start"),
        (EVENTS[direction].END = "thumb" + direction + "end");
    });
    var SIZE = 240;
    AFRAME.registerComponent("thumb-controls", {
      dependencies: ["tracked-controls"],
      schema: {
        thresholdAngle: { default: 89.5 },
        thresholdPad: { default: 0.05 },
        thresholdStick: { default: 0.75 },
      },
      init: function () {
        var el = this.el;
        (this.onTrackpadDown = this.onTrackpadDown.bind(this)),
          (this.onTrackpadUp = this.onTrackpadUp.bind(this)),
          (this.directionStick = ""),
          (this.directionTrackpad = ""),
          (this.type = TYPE_STICK),
          el.addEventListener("controllerconnected", (evt) =>
            "oculus-touch-controls" === evt.detail.name ||
            "windows-motion-controls" === evt.detail.name
              ? void (this.type = TYPE_STICK)
              : void (this.type = TYPE_PAD)
          ),
          (this.axis = el.components["tracked-controls"].axis);
      },
      play: function () {
        var el = this.el;
        el.addEventListener("trackpaddown", this.onTrackpadDown),
          el.addEventListener("trackpadup", this.onTrackpadUp);
      },
      pause: function () {
        var el = this.el;
        el.removeEventListener("trackpaddown", this.onTrackpadDown),
          el.removeEventListener("trackpadup", this.onTrackpadUp);
      },
      onTrackpadDown: function () {
        var el = this.el,
          direction;
        this.getDistance() < this.data.thresholdPad ||
          ((direction = this.getDirection()),
          direction &&
            ((this.directionTrackpad = direction),
            el.emit(EVENTS.NULL.START, null, !1),
            el.emit(EVENTS[this.directionTrackpad].START, null, !1)));
      },
      onTrackpadUp: function () {
        var el = this.el;
        this.directionTrackpad &&
          (el.emit(EVENTS.NULL.END, null, !1),
          el.emit(EVENTS[this.directionTrackpad].END, null, !1),
          (this.directionTrackpad = ""));
      },
      tick: function () {
        var el = this.el,
          direction;
        return this.type === TYPE_PAD
          ? void 0
          : !this.directionStick &&
            this.getDistance() > this.data.thresholdStick
          ? ((direction = this.getDirection()), !direction)
            ? void 0
            : ((this.directionStick = direction),
              el.emit(EVENTS.NULL.START, null, !1),
              void el.emit(EVENTS[this.directionStick].START, null, !1))
          : void (
              this.directionStick &&
              this.getDistance() < this.data.thresholdStick &&
              (el.emit(EVENTS.NULL.END, null, !1),
              el.emit(EVENTS[this.directionStick].END, null, !1),
              (this.directionStick = ""))
            );
      },
      getDistance: function () {
        var axis = this.axis;
        return Math.sqrt(axis[1] * axis[1] + axis[0] * axis[0]);
      },
      getDirection: function () {
        var angle, bottomThreshold, i, threshold, topThreshold;
        for (
          angle = this.getAngle(),
            threshold = this.data.thresholdAngle / 2,
            i = 0;
          i < ANGLES.length;
          i++
        ) {
          if (
            ((topThreshold = ANGLES[i] + threshold),
            360 < topThreshold && (topThreshold -= 360),
            (bottomThreshold = ANGLES[i] - threshold),
            0 > bottomThreshold &&
              ((angle >= 360 + bottomThreshold && 360 >= angle) ||
                (0 <= angle && angle <= topThreshold)))
          )
            return DIRECTIONS[i];
          if (angle >= bottomThreshold && angle <= topThreshold)
            return DIRECTIONS[i];
        }
      },
      getAngle: function () {
        var axis = this.axis,
          angle,
          flipY;
        return (
          (flipY = this.type === TYPE_STICK ? -1 : 1),
          (angle = Math.atan2(axis[1] * flipY, axis[0])),
          0 > angle && (angle = 2 * Math.PI + angle),
          THREE.Math.radToDeg(angle)
        );
      },
    }),
      AFRAME.registerComponent("thumb-controls-debug", {
        dependencies: ["thumb-controls", "tracked-controls"],
        schema: {
          controllerType: { type: "string" },
          hand: { type: "string" },
          enabled: { default: !1 },
        },
        init: function () {
          var el = this.el,
            data = this.data,
            isActive,
            axis,
            axisMoveEventDetail,
            canvas;
          (data.enabled || AFRAME.utils.getUrlParameter("debug-thumb")) &&
            (console.log("%c debug-thumb", "background: #111; color: red"),
            (el.components["tracked-controls"].handleAxes = () => {}),
            (axis = [0, 0, 0]),
            (axisMoveEventDetail = { axis: axis }),
            (el.components["tracked-controls"].axis = axis),
            (el.components["thumb-controls"].axis = axis),
            (canvas = this.createCanvas()),
            canvas.addEventListener("click", () => {
              "vive-controls" === this.data.controllerType
                ? isActive
                  ? el.emit("trackpadup")
                  : el.emit("trackpaddown")
                : isActive &&
                  ((axis[0] = 0),
                  (axis[1] = 0),
                  el.emit("axismove", axisMoveEventDetail, !1)),
                (isActive = !isActive);
            }),
            canvas.addEventListener("mousemove", (evt) => {
              var rect;
              isActive &&
                ((rect = canvas.getBoundingClientRect()),
                (axis[0] = 2 * ((evt.clientX - rect.left) / SIZE) - 1),
                (axis[1] = 2 * ((evt.clientY - rect.top) / SIZE) - 1),
                el.emit("axismove", axisMoveEventDetail, !1));
            }),
            canvas.addEventListener("mouseleave", () => {
              isActive &&
                ((axis[0] = 0),
                (axis[1] = 0),
                el.emit("axismove", axisMoveEventDetail, !1));
            }));
        },
        createCanvas: function () {
          var canvas, ctx;
          return (
            (canvas = document.createElement("canvas")),
            canvas.classList.add("debugThumb"),
            (canvas.height = SIZE),
            (canvas.width = SIZE),
            (canvas.style.bottom = 0),
            (canvas.style.borderRadius = "250px"),
            (canvas.style.opacity = 0.5),
            (canvas.style.position = "fixed"),
            (canvas.style.zIndex = 999999999),
            "left" === this.data.hand
              ? (canvas.style.left = 0)
              : (canvas.style.right = 0),
            (ctx = canvas.getContext("2d")),
            (ctx.fillStyle = "#333"),
            ctx.fillRect(0, 0, SIZE, SIZE),
            document.body.appendChild(canvas),
            canvas
          );
        },
      });
  },
  function (module, exports, __webpack_require__) {
    var content = __webpack_require__(73);
    "string" == typeof content && (content = [[module.i, content, ""]]);
    var options = { hmr: !0 },
      transform;
    (options.transform = transform), (options.insertInto = void 0);
    __webpack_require__(76)(content, options);
    content.locals && (module.exports = content.locals), !1;
  },
  function (module, exports, __webpack_require__) {
    function webpackContext(req) {
      return __webpack_require__(webpackContextResolve(req));
    }
    function webpackContextResolve(req) {
      var id = map[req];
      if (!(id + 1)) throw new Error("Cannot find module '" + req + "'.");
      return id;
    }
    var map = {
      "./active-color.js": 25,
      "./audio-columns.js": 26,
      "./beams.js": 27,
      "./beat-generator.js": 28,
      "./beat-hit-sound.js": 29,
      "./beat.js": 30,
      "./blob-texture.js": 31,
      "./collider-check.js": 32,
      "./console-shortcuts.js": 33,
      "./copy-texture.js": 34,
      "./cursor-mesh.js": 35,
      "./debug-controller.js": 36,
      "./debug-cursor.js": 37,
      "./debug-song-time.js": 38,
      "./debug-state.js": 39,
      "./fake-glow.js": 40,
      "./floor-shader.js": 41,
      "./gpu-preloader.js": 42,
      "./iframe.js": 43,
      "./keyboard-raycastable.js": 44,
      "./materials.js": 45,
      "./mine-fragments-loader.js": 46,
      "./particleplayer.js": 47,
      "./pause.js": 48,
      "./pauser.js": 49,
      "./play-sound.js": 50,
      "./raycaster-target.js": 51,
      "./search.js": 52,
      "./song-controls.js": 53,
      "./song-progress-ring.js": 54,
      "./song.js": 55,
      "./stage-colors.js": 56,
      "./stage-lasers.js": 57,
      "./stage-shader.js": 58,
      "./stats-param.js": 59,
      "./sub-object.js": 60,
      "./super-keyboard.js": 61,
      "./toggle-pause-play.js": 62,
      "./twister.js": 63,
      "./user-gesture.js": 64,
      "./vertex-colors-buffer.js": 65,
      "./visible-raycastable.js": 66,
      "./wall-shader.js": 67,
      "./wall.js": 68,
      "./zip-loader.js": 69,
    };
    (webpackContext.keys = function webpackContextKeys() {
      return Object.keys(map);
    }),
      (webpackContext.resolve = webpackContextResolve),
      (module.exports = webpackContext),
      (webpackContext.id = 18);
  },
  function (module, exports, __webpack_require__) {
    function webpackContext(req) {
      return __webpack_require__(webpackContextResolve(req));
    }
    function webpackContextResolve(req) {
      var id = map[req];
      if (!(id + 1)) throw new Error("Cannot find module '" + req + "'.");
      return id;
    }
    var map = { "./index.js": 72 };
    (webpackContext.keys = function webpackContextKeys() {
      return Object.keys(map);
    }),
      (webpackContext.resolve = webpackContextResolve),
      (module.exports = webpackContext),
      (webpackContext.id = 19);
  },
  function () {
    THREE.BufferGeometryUtils = {
      computeTangents: function (geometry) {
        function handleTriangle(a, b, c) {
          vA.fromArray(positions, 3 * a),
            vB.fromArray(positions, 3 * b),
            vC.fromArray(positions, 3 * c),
            uvA.fromArray(uvs, 2 * a),
            uvB.fromArray(uvs, 2 * b),
            uvC.fromArray(uvs, 2 * c);
          var x1 = vB.x - vA.x,
            x2 = vC.x - vA.x,
            y1 = vB.y - vA.y,
            y2 = vC.y - vA.y,
            z1 = vB.z - vA.z,
            z2 = vC.z - vA.z,
            s1 = uvB.x - uvA.x,
            s2 = uvC.x - uvA.x,
            t1 = uvB.y - uvA.y,
            t2 = uvC.y - uvA.y,
            r = 1 / (s1 * t2 - s2 * t1);
          sdir.set(
            (t2 * x1 - t1 * x2) * r,
            (t2 * y1 - t1 * y2) * r,
            (t2 * z1 - t1 * z2) * r
          ),
            tdir.set(
              (s1 * x2 - s2 * x1) * r,
              (s1 * y2 - s2 * y1) * r,
              (s1 * z2 - s2 * z1) * r
            ),
            tan1[a].add(sdir),
            tan1[b].add(sdir),
            tan1[c].add(sdir),
            tan2[a].add(tdir),
            tan2[b].add(tdir),
            tan2[c].add(tdir);
        }
        function handleVertex(v) {
          n.fromArray(normals, 3 * v),
            n2.copy(n),
            (t = tan1[v]),
            tmp.copy(t),
            tmp.sub(n.multiplyScalar(n.dot(t))).normalize(),
            tmp2.crossVectors(n2, t),
            (test = tmp2.dot(tan2[v])),
            (w = 0 > test ? -1 : 1),
            (tangents[4 * v] = tmp.x),
            (tangents[4 * v + 1] = tmp.y),
            (tangents[4 * v + 2] = tmp.z),
            (tangents[4 * v + 3] = w);
        }
        var index = geometry.index,
          attributes = geometry.attributes;
        if (
          null === index ||
          void 0 === attributes.position ||
          void 0 === attributes.normal ||
          void 0 === attributes.uv
        )
          return void console.warn(
            "THREE.BufferGeometry: Missing required attributes (index, position, normal or uv) in BufferGeometry.computeTangents()"
          );
        var indices = index.array,
          positions = attributes.position.array,
          normals = attributes.normal.array,
          uvs = attributes.uv.array,
          nVertices = positions.length / 3;
        attributes.tangent === void 0 &&
          geometry.addAttribute(
            "tangent",
            new THREE.BufferAttribute(new Float32Array(4 * nVertices), 4)
          );
        for (
          var tangents = attributes.tangent.array, tan1 = [], tan2 = [], i = 0;
          i < nVertices;
          i++
        )
          (tan1[i] = new THREE.Vector3()), (tan2[i] = new THREE.Vector3());
        var vA = new THREE.Vector3(),
          vB = new THREE.Vector3(),
          vC = new THREE.Vector3(),
          uvA = new THREE.Vector2(),
          uvB = new THREE.Vector2(),
          uvC = new THREE.Vector2(),
          sdir = new THREE.Vector3(),
          tdir = new THREE.Vector3(),
          groups = geometry.groups;
        0 === groups.length && (groups = [{ start: 0, count: indices.length }]);
        for (var i = 0, il = groups.length; i < il; ++i)
          for (
            var group = groups[i],
              start = group.start,
              count = group.count,
              j = start,
              jl = start + count;
            j < jl;
            j += 3
          )
            handleTriangle(indices[j + 0], indices[j + 1], indices[j + 2]);
        for (
          var tmp = new THREE.Vector3(),
            tmp2 = new THREE.Vector3(),
            n = new THREE.Vector3(),
            n2 = new THREE.Vector3(),
            i = 0,
            il = groups.length,
            w,
            t,
            test;
          i < il;
          ++i
        )
          for (
            var group = groups[i],
              start = group.start,
              count = group.count,
              j = start,
              jl = start + count;
            j < jl;
            j += 3
          )
            handleVertex(indices[j + 0]),
              handleVertex(indices[j + 1]),
              handleVertex(indices[j + 2]);
      },
      mergeBufferGeometries: function (geometries, useGroups) {
        for (
          var isIndexed = null !== geometries[0].index,
            attributesUsed = new Set(Object.keys(geometries[0].attributes)),
            morphAttributesUsed = new Set(
              Object.keys(geometries[0].morphAttributes)
            ),
            attributes = {},
            morphAttributes = {},
            mergedGeometry = new THREE.BufferGeometry(),
            offset = 0,
            i = 0,
            geometry;
          i < geometries.length;
          ++i
        ) {
          if (
            ((geometry = geometries[i]), isIndexed != (null !== geometry.index))
          )
            return null;
          for (var name in geometry.attributes) {
            if (!attributesUsed.has(name)) return null;
            void 0 === attributes[name] && (attributes[name] = []),
              attributes[name].push(geometry.attributes[name]);
          }
          for (var name in geometry.morphAttributes) {
            if (!morphAttributesUsed.has(name)) return null;
            void 0 === morphAttributes[name] && (morphAttributes[name] = []),
              morphAttributes[name].push(geometry.morphAttributes[name]);
          }
          if (
            (mergedGeometry.userData &&
              ((mergedGeometry.userData.mergedUserData =
                mergedGeometry.userData.mergedUserData || []),
              mergedGeometry.userData.mergedUserData.push(geometry.userData)),
            useGroups)
          ) {
            var count;
            if (isIndexed) count = geometry.index.count;
            else if (void 0 !== geometry.attributes.position)
              count = geometry.attributes.position.count;
            else return null;
            mergedGeometry.addGroup(offset, count, i), (offset += count);
          }
        }
        if (isIndexed) {
          for (
            var indexOffset = 0, mergedIndex = [], i = 0, index;
            i < geometries.length;
            ++i
          ) {
            index = geometries[i].index;
            for (var j = 0; j < index.count; ++j)
              mergedIndex.push(index.getX(j) + indexOffset);
            indexOffset += geometries[i].attributes.position.count;
          }
          mergedGeometry.setIndex(mergedIndex);
        }
        for (var name in attributes) {
          var mergedAttribute = this.mergeBufferAttributes(attributes[name]);
          if (!mergedAttribute) return null;
          mergedGeometry.addAttribute(name, mergedAttribute);
        }
        for (var name in morphAttributes) {
          var numMorphTargets = morphAttributes[name][0].length;
          if (0 === numMorphTargets) break;
          (mergedGeometry.morphAttributes =
            mergedGeometry.morphAttributes || {}),
            (mergedGeometry.morphAttributes[name] = []);
          for (var i = 0, morphAttributesToMerge; i < numMorphTargets; ++i) {
            morphAttributesToMerge = [];
            for (var j = 0; j < morphAttributes[name].length; ++j)
              morphAttributesToMerge.push(morphAttributes[name][j][i]);
            var mergedMorphAttribute = this.mergeBufferAttributes(
              morphAttributesToMerge
            );
            if (!mergedMorphAttribute) return null;
            mergedGeometry.morphAttributes[name].push(mergedMorphAttribute);
          }
        }
        return mergedGeometry;
      },
      mergeBufferAttributes: function (attributes) {
        for (
          var arrayLength = 0,
            i = 0,
            TypedArray,
            itemSize,
            normalized,
            attribute;
          i < attributes.length;
          ++i
        ) {
          if (
            ((attribute = attributes[i]),
            attribute.isInterleavedBufferAttribute)
          )
            return null;
          if (
            (void 0 == TypedArray && (TypedArray = attribute.array.constructor),
            TypedArray !== attribute.array.constructor)
          )
            return null;
          if (
            (void 0 == itemSize && (itemSize = attribute.itemSize),
            itemSize !== attribute.itemSize)
          )
            return null;
          if (
            (void 0 == normalized && (normalized = attribute.normalized),
            normalized !== attribute.normalized)
          )
            return null;
          arrayLength += attribute.array.length;
        }
        for (
          var array = new TypedArray(arrayLength), offset = 0, i = 0;
          i < attributes.length;
          ++i
        )
          array.set(attributes[i].array, offset),
            (offset += attributes[i].array.length);
        return new THREE.BufferAttribute(array, itemSize, normalized);
      },
    };
  },
  function () {
    var _Mathmin = Math.min,
      _Mathsqrt = Math.sqrt,
      _MathPI = Math.PI,
      _Mathmax = Math.max;
    (THREE.OrbitControls = function (object, domElement) {
      function getAutoRotationAngle() {
        return ((2 * _MathPI) / 60 / 60) * scope.autoRotateSpeed;
      }
      function getZoomScale() {
        return Math.pow(0.95, scope.zoomSpeed);
      }
      function rotateLeft(angle) {
        sphericalDelta.theta -= angle;
      }
      function rotateUp(angle) {
        sphericalDelta.phi -= angle;
      }
      function dollyIn(dollyScale) {
        scope.object.isPerspectiveCamera
          ? (scale /= dollyScale)
          : scope.object.isOrthographicCamera
          ? ((scope.object.zoom = _Mathmax(
              scope.minZoom,
              _Mathmin(scope.maxZoom, scope.object.zoom * dollyScale)
            )),
            scope.object.updateProjectionMatrix(),
            (zoomChanged = !0))
          : (console.warn(
              "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."
            ),
            (scope.enableZoom = !1));
      }
      function dollyOut(dollyScale) {
        scope.object.isPerspectiveCamera
          ? (scale *= dollyScale)
          : scope.object.isOrthographicCamera
          ? ((scope.object.zoom = _Mathmax(
              scope.minZoom,
              _Mathmin(scope.maxZoom, scope.object.zoom / dollyScale)
            )),
            scope.object.updateProjectionMatrix(),
            (zoomChanged = !0))
          : (console.warn(
              "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."
            ),
            (scope.enableZoom = !1));
      }
      function handleMouseDownRotate(event) {
        rotateStart.set(event.clientX, event.clientY);
      }
      function handleMouseDownDolly(event) {
        dollyStart.set(event.clientX, event.clientY);
      }
      function handleMouseDownPan(event) {
        panStart.set(event.clientX, event.clientY);
      }
      function handleMouseMoveRotate(event) {
        rotateEnd.set(event.clientX, event.clientY),
          rotateDelta.subVectors(rotateEnd, rotateStart);
        var element =
          scope.domElement === document
            ? scope.domElement.body
            : scope.domElement;
        rotateLeft(
          ((2 * _MathPI * rotateDelta.x) / element.clientWidth) *
            scope.rotateSpeed
        ),
          rotateUp(
            ((2 * _MathPI * rotateDelta.y) / element.clientHeight) *
              scope.rotateSpeed
          ),
          rotateStart.copy(rotateEnd),
          scope.update();
      }
      function handleMouseMoveDolly(event) {
        dollyEnd.set(event.clientX, event.clientY),
          dollyDelta.subVectors(dollyEnd, dollyStart),
          0 < dollyDelta.y
            ? dollyIn(getZoomScale())
            : 0 > dollyDelta.y && dollyOut(getZoomScale()),
          dollyStart.copy(dollyEnd),
          scope.update();
      }
      function handleMouseMovePan(event) {
        panEnd.set(event.clientX, event.clientY),
          panDelta.subVectors(panEnd, panStart),
          pan(panDelta.x, panDelta.y),
          panStart.copy(panEnd),
          scope.update();
      }
      function handleMouseUp() {}
      function handleMouseWheel(event) {
        0 > event.deltaY
          ? dollyOut(getZoomScale())
          : 0 < event.deltaY && dollyIn(getZoomScale()),
          scope.update();
      }
      function handleKeyDown(event) {
        switch (event.keyCode) {
          case scope.keys.UP:
            pan(0, scope.keyPanSpeed), scope.update();
            break;
          case scope.keys.BOTTOM:
            pan(0, -scope.keyPanSpeed), scope.update();
            break;
          case scope.keys.LEFT:
            pan(scope.keyPanSpeed, 0), scope.update();
            break;
          case scope.keys.RIGHT:
            pan(-scope.keyPanSpeed, 0), scope.update();
        }
      }
      function handleTouchStartRotate(event) {
        rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
      }
      function handleTouchStartDolly(event) {
        var dx = event.touches[0].pageX - event.touches[1].pageX,
          dy = event.touches[0].pageY - event.touches[1].pageY,
          distance = _Mathsqrt(dx * dx + dy * dy);
        dollyStart.set(0, distance);
      }
      function handleTouchStartPan(event) {
        panStart.set(event.touches[0].pageX, event.touches[0].pageY);
      }
      function handleTouchMoveRotate(event) {
        rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY),
          rotateDelta.subVectors(rotateEnd, rotateStart);
        var element =
          scope.domElement === document
            ? scope.domElement.body
            : scope.domElement;
        rotateLeft(
          ((2 * _MathPI * rotateDelta.x) / element.clientWidth) *
            scope.rotateSpeed
        ),
          rotateUp(
            ((2 * _MathPI * rotateDelta.y) / element.clientHeight) *
              scope.rotateSpeed
          ),
          rotateStart.copy(rotateEnd),
          scope.update();
      }
      function handleTouchMoveDolly(event) {
        var dx = event.touches[0].pageX - event.touches[1].pageX,
          dy = event.touches[0].pageY - event.touches[1].pageY,
          distance = _Mathsqrt(dx * dx + dy * dy);
        dollyEnd.set(0, distance),
          dollyDelta.subVectors(dollyEnd, dollyStart),
          0 < dollyDelta.y
            ? dollyOut(getZoomScale())
            : 0 > dollyDelta.y && dollyIn(getZoomScale()),
          dollyStart.copy(dollyEnd),
          scope.update();
      }
      function handleTouchMovePan(event) {
        panEnd.set(event.touches[0].pageX, event.touches[0].pageY),
          panDelta.subVectors(panEnd, panStart),
          pan(panDelta.x, panDelta.y),
          panStart.copy(panEnd),
          scope.update();
      }
      function handleTouchEnd() {}
      function onMouseDown(event) {
        if (!1 !== scope.enabled) {
          switch ((event.preventDefault(), event.button)) {
            case scope.mouseButtons.ORBIT:
              if (!1 === scope.enableRotate) return;
              handleMouseDownRotate(event), (state = STATE.ROTATE);
              break;
            case scope.mouseButtons.ZOOM:
              if (!1 === scope.enableZoom) return;
              handleMouseDownDolly(event), (state = STATE.DOLLY);
              break;
            case scope.mouseButtons.PAN:
              if (!1 === scope.enablePan) return;
              handleMouseDownPan(event), (state = STATE.PAN);
          }
          state !== STATE.NONE &&
            (document.addEventListener("mousemove", onMouseMove, !1),
            document.addEventListener("mouseup", onMouseUp, !1),
            scope.dispatchEvent(startEvent));
        }
      }
      function onMouseMove(event) {
        if (!1 !== scope.enabled)
          switch ((event.preventDefault(), state)) {
            case STATE.ROTATE:
              if (!1 === scope.enableRotate) return;
              handleMouseMoveRotate(event);
              break;
            case STATE.DOLLY:
              if (!1 === scope.enableZoom) return;
              handleMouseMoveDolly(event);
              break;
            case STATE.PAN:
              if (!1 === scope.enablePan) return;
              handleMouseMovePan(event);
          }
      }
      function onMouseUp(event) {
        !1 === scope.enabled ||
          (handleMouseUp(event),
          document.removeEventListener("mousemove", onMouseMove, !1),
          document.removeEventListener("mouseup", onMouseUp, !1),
          scope.dispatchEvent(endEvent),
          (state = STATE.NONE));
      }
      function onMouseWheel(event) {
        !1 === scope.enabled ||
          !1 === scope.enableZoom ||
          (state !== STATE.NONE && state !== STATE.ROTATE) ||
          (event.preventDefault(),
          event.stopPropagation(),
          scope.dispatchEvent(startEvent),
          handleMouseWheel(event),
          scope.dispatchEvent(endEvent));
      }
      function onKeyDown(event) {
        !1 === scope.enabled ||
          !1 === scope.enableKeys ||
          !1 === scope.enablePan ||
          handleKeyDown(event);
      }
      function onTouchStart(event) {
        if (!1 !== scope.enabled) {
          switch (event.touches.length) {
            case 1:
              if (!1 === scope.enableRotate) return;
              handleTouchStartRotate(event), (state = STATE.TOUCH_ROTATE);
              break;
            case 2:
              if (!1 === scope.enableZoom) return;
              handleTouchStartDolly(event), (state = STATE.TOUCH_DOLLY);
              break;
            case 3:
              if (!1 === scope.enablePan) return;
              handleTouchStartPan(event), (state = STATE.TOUCH_PAN);
              break;
            default:
              state = STATE.NONE;
          }
          state !== STATE.NONE && scope.dispatchEvent(startEvent);
        }
      }
      function onTouchMove(event) {
        if (!1 !== scope.enabled)
          switch (
            (event.preventDefault(),
            event.stopPropagation(),
            event.touches.length)
          ) {
            case 1:
              if (!1 === scope.enableRotate) return;
              if (state !== STATE.TOUCH_ROTATE) return;
              handleTouchMoveRotate(event);
              break;
            case 2:
              if (!1 === scope.enableZoom) return;
              if (state !== STATE.TOUCH_DOLLY) return;
              handleTouchMoveDolly(event);
              break;
            case 3:
              if (!1 === scope.enablePan) return;
              if (state !== STATE.TOUCH_PAN) return;
              handleTouchMovePan(event);
              break;
            default:
              state = STATE.NONE;
          }
      }
      function onTouchEnd(event) {
        !1 === scope.enabled ||
          (handleTouchEnd(event),
          scope.dispatchEvent(endEvent),
          (state = STATE.NONE));
      }
      function onContextMenu(event) {
        !1 === scope.enabled || event.preventDefault();
      }
      (this.object = object),
        (this.domElement = domElement === void 0 ? document : domElement),
        (this.enabled = !0),
        (this.target = new THREE.Vector3()),
        (this.minDistance = 0),
        (this.maxDistance = Infinity),
        (this.minZoom = 0),
        (this.maxZoom = Infinity),
        (this.minPolarAngle = 0),
        (this.maxPolarAngle = _MathPI),
        (this.minAzimuthAngle = -Infinity),
        (this.maxAzimuthAngle = Infinity),
        (this.enableDamping = !1),
        (this.dampingFactor = 0.25),
        (this.enableZoom = !0),
        (this.zoomSpeed = 1),
        (this.enableRotate = !0),
        (this.rotateSpeed = 1),
        (this.enablePan = !0),
        (this.keyPanSpeed = 7),
        (this.autoRotate = !1),
        (this.autoRotateSpeed = 2),
        (this.enableKeys = !0),
        (this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 }),
        (this.mouseButtons = {
          ORBIT: THREE.MOUSE.LEFT,
          ZOOM: THREE.MOUSE.MIDDLE,
          PAN: THREE.MOUSE.RIGHT,
        }),
        (this.target0 = this.target.clone()),
        (this.position0 = this.object.position.clone()),
        (this.zoom0 = this.object.zoom),
        (this.getPolarAngle = function () {
          return spherical.phi;
        }),
        (this.getAzimuthalAngle = function () {
          return spherical.theta;
        }),
        (this.saveState = function () {
          scope.target0.copy(scope.target),
            scope.position0.copy(scope.object.position),
            (scope.zoom0 = scope.object.zoom);
        }),
        (this.reset = function () {
          scope.target.copy(scope.target0),
            scope.object.position.copy(scope.position0),
            (scope.object.zoom = scope.zoom0),
            scope.object.updateProjectionMatrix(),
            scope.dispatchEvent(changeEvent),
            scope.update(),
            (state = STATE.NONE);
        }),
        (this.update = (function () {
          var offset = new THREE.Vector3(),
            quat = new THREE.Quaternion().setFromUnitVectors(
              object.up,
              new THREE.Vector3(0, 1, 0)
            ),
            quatInverse = quat.clone().inverse(),
            lastPosition = new THREE.Vector3(),
            lastQuaternion = new THREE.Quaternion();
          return function update() {
            var position = scope.object.position;
            return (
              offset.copy(position).sub(scope.target),
              offset.applyQuaternion(quat),
              spherical.setFromVector3(offset),
              scope.autoRotate &&
                state === STATE.NONE &&
                rotateLeft(getAutoRotationAngle()),
              (spherical.theta += sphericalDelta.theta),
              (spherical.phi += sphericalDelta.phi),
              (spherical.theta = _Mathmax(
                scope.minAzimuthAngle,
                _Mathmin(scope.maxAzimuthAngle, spherical.theta)
              )),
              (spherical.phi = _Mathmax(
                scope.minPolarAngle,
                _Mathmin(scope.maxPolarAngle, spherical.phi)
              )),
              spherical.makeSafe(),
              (spherical.radius *= scale),
              (spherical.radius = _Mathmax(
                scope.minDistance,
                _Mathmin(scope.maxDistance, spherical.radius)
              )),
              scope.target.add(panOffset),
              offset.setFromSpherical(spherical),
              offset.applyQuaternion(quatInverse),
              position.copy(scope.target).add(offset),
              scope.object.lookAt(scope.target),
              !0 === scope.enableDamping
                ? ((sphericalDelta.theta *= 1 - scope.dampingFactor),
                  (sphericalDelta.phi *= 1 - scope.dampingFactor))
                : sphericalDelta.set(0, 0, 0),
              (scale = 1),
              panOffset.set(0, 0, 0),
              (zoomChanged ||
                lastPosition.distanceToSquared(scope.object.position) > EPS ||
                8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) &&
                (scope.dispatchEvent(changeEvent),
                lastPosition.copy(scope.object.position),
                lastQuaternion.copy(scope.object.quaternion),
                (zoomChanged = !1),
                !0)
            );
          };
        })()),
        (this.dispose = function () {
          scope.domElement.removeEventListener(
            "contextmenu",
            onContextMenu,
            !1
          ),
            scope.domElement.removeEventListener("mousedown", onMouseDown, !1),
            scope.domElement.removeEventListener("wheel", onMouseWheel, !1),
            scope.domElement.removeEventListener(
              "touchstart",
              onTouchStart,
              !1
            ),
            scope.domElement.removeEventListener("touchend", onTouchEnd, !1),
            scope.domElement.removeEventListener("touchmove", onTouchMove, !1),
            document.removeEventListener("mousemove", onMouseMove, !1),
            document.removeEventListener("mouseup", onMouseUp, !1),
            window.removeEventListener("keydown", onKeyDown, !1);
        });
      var scope = this,
        changeEvent = { type: "change" },
        startEvent = { type: "start" },
        endEvent = { type: "end" },
        STATE = {
          NONE: -1,
          ROTATE: 0,
          DOLLY: 1,
          PAN: 2,
          TOUCH_ROTATE: 3,
          TOUCH_DOLLY: 4,
          TOUCH_PAN: 5,
        },
        state = STATE.NONE,
        EPS = 1e-6,
        spherical = new THREE.Spherical(),
        sphericalDelta = new THREE.Spherical(),
        scale = 1,
        panOffset = new THREE.Vector3(),
        zoomChanged = !1,
        rotateStart = new THREE.Vector2(),
        rotateEnd = new THREE.Vector2(),
        rotateDelta = new THREE.Vector2(),
        panStart = new THREE.Vector2(),
        panEnd = new THREE.Vector2(),
        panDelta = new THREE.Vector2(),
        dollyStart = new THREE.Vector2(),
        dollyEnd = new THREE.Vector2(),
        dollyDelta = new THREE.Vector2(),
        panLeft = (function () {
          var v = new THREE.Vector3();
          return function panLeft(distance, objectMatrix) {
            v.setFromMatrixColumn(objectMatrix, 0),
              v.multiplyScalar(-distance),
              panOffset.add(v);
          };
        })(),
        panUp = (function () {
          var v = new THREE.Vector3();
          return function panUp(distance, objectMatrix) {
            v.setFromMatrixColumn(objectMatrix, 1),
              v.multiplyScalar(distance),
              panOffset.add(v);
          };
        })(),
        pan = (function () {
          var offset = new THREE.Vector3();
          return function pan(deltaX, deltaY) {
            var element =
              scope.domElement === document
                ? scope.domElement.body
                : scope.domElement;
            if (scope.object.isPerspectiveCamera) {
              var position = scope.object.position;
              offset.copy(position).sub(scope.target);
              var targetDistance = offset.length();
              (targetDistance *= Math.tan(
                ((scope.object.fov / 2) * _MathPI) / 180
              )),
                panLeft(
                  (2 * deltaX * targetDistance) / element.clientHeight,
                  scope.object.matrix
                ),
                panUp(
                  (2 * deltaY * targetDistance) / element.clientHeight,
                  scope.object.matrix
                );
            } else
              scope.object.isOrthographicCamera
                ? (panLeft(
                    (deltaX * (scope.object.right - scope.object.left)) /
                      scope.object.zoom /
                      element.clientWidth,
                    scope.object.matrix
                  ),
                  panUp(
                    (deltaY * (scope.object.top - scope.object.bottom)) /
                      scope.object.zoom /
                      element.clientHeight,
                    scope.object.matrix
                  ))
                : (console.warn(
                    "WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."
                  ),
                  (scope.enablePan = !1));
          };
        })();
      scope.domElement.addEventListener("contextmenu", onContextMenu, !1),
        scope.domElement.addEventListener("mousedown", onMouseDown, !1),
        scope.domElement.addEventListener("wheel", onMouseWheel, !1),
        scope.domElement.addEventListener("touchstart", onTouchStart, !1),
        scope.domElement.addEventListener("touchend", onTouchEnd, !1),
        scope.domElement.addEventListener("touchmove", onTouchMove, !1),
        window.addEventListener("keydown", onKeyDown, !1),
        this.update();
    }),
      (THREE.OrbitControls.prototype = Object.create(
        THREE.EventDispatcher.prototype
      )),
      (THREE.OrbitControls.prototype.constructor = THREE.OrbitControls),
      Object.defineProperties(THREE.OrbitControls.prototype, {
        center: {
          get: function () {
            return (
              console.warn(
                "THREE.OrbitControls: .center has been renamed to .target"
              ),
              this.target
            );
          },
        },
        noZoom: {
          get: function () {
            return (
              console.warn(
                "THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead."
              ),
              !this.enableZoom
            );
          },
          set: function (value) {
            console.warn(
              "THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead."
            ),
              (this.enableZoom = !value);
          },
        },
        noRotate: {
          get: function () {
            return (
              console.warn(
                "THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead."
              ),
              !this.enableRotate
            );
          },
          set: function (value) {
            console.warn(
              "THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead."
            ),
              (this.enableRotate = !value);
          },
        },
        noPan: {
          get: function () {
            return (
              console.warn(
                "THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead."
              ),
              !this.enablePan
            );
          },
          set: function (value) {
            console.warn(
              "THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead."
            ),
              (this.enablePan = !value);
          },
        },
        noKeys: {
          get: function () {
            return (
              console.warn(
                "THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead."
              ),
              !this.enableKeys
            );
          },
          set: function (value) {
            console.warn(
              "THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead."
            ),
              (this.enableKeys = !value);
          },
        },
        staticMoving: {
          get: function () {
            return (
              console.warn(
                "THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead."
              ),
              !this.enableDamping
            );
          },
          set: function (value) {
            console.warn(
              "THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead."
            ),
              (this.enableDamping = !value);
          },
        },
        dynamicDampingFactor: {
          get: function () {
            return (
              console.warn(
                "THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead."
              ),
              this.dampingFactor
            );
          },
          set: function (value) {
            console.warn(
              "THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead."
            ),
              (this.dampingFactor = value);
          },
        },
      });
  },
  function (module) {
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
`,
    };
  },
  function (module) {
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
  `,
    };
  },
  function (module) {
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
  `,
    };
  },
  function () {
    AFRAME.registerComponent("active-color", {
      dependencies: ["material"],
      schema: { active: { default: !1 }, color: { default: "#ffffff" } },
      init: function () {
        (this.defaultColor = this.el.getAttribute("material").color),
          (this.materialObj = { color: this.data.color, opacity: 1 });
      },
      update: function () {
        var el = this.el;
        this.data.active
          ? (el.setAttribute("material", this.materialObj),
            (el.object3D.visible = !0))
          : (el.setAttribute("material", "color", this.defaultColor),
            el.components.animation__mouseleave &&
              setTimeout(() => {
                el.emit("mouseleave", null, !1);
              }));
      },
    }),
      AFRAME.registerComponent("active-text-color", {
        dependencies: ["text"],
        schema: { active: { default: !1 }, color: { default: "#333" } },
        init: function () {
          this.defaultColor = this.el.getAttribute("text").color;
        },
        update: function () {
          var el = this.el;
          this.data.active
            ? el.setAttribute("text", "color", this.data.color)
            : el.setAttribute("text", "color", this.defaultColor);
        },
      });
  },
  function () {
    const NUM_VALUES_PER_BOX = 90;
    AFRAME.registerComponent("audio-columns", {
      schema: {
        analyser: { type: "selector", default: "#audioAnalyser" },
        height: { default: 1 },
        mirror: { default: 3 },
        scale: { default: 4 },
        separation: { default: 0.3 },
        thickness: { default: 0.1 },
      },
      init: function () {
        var objData = document.getElementById("audiocolumnObj").data,
          loader = new THREE.OBJLoader(),
          columnGeometry = loader.parse(objData).children[0].geometry;
        (this.analyser = this.data.analyser.components.audioanalyser),
          (this.frequencyBinCount = this.analyser.data.fftSize / 2);
        const geometries = [];
        let zPosition = 0;
        for (let i = 0; i < this.frequencyBinCount; i++)
          for (let side = 0; 2 > side; side++) {
            const box = columnGeometry.clone();
            this.initBox(box, 0 === side ? 1 : -1, zPosition),
              geometries.push(box),
              (zPosition -= this.data.separation);
          }
        this.geometry =
          THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
        const mesh = new THREE.Mesh(
          this.geometry,
          this.el.sceneEl.systems.materials.stageNormal
        );
        this.el.setObject3D("mesh", mesh);
      },
      tick: function () {
        for (let i = 0, yScale; i < 2 * this.frequencyBinCount; i += 2) {
          if (
            ((yScale =
              this.data.height / 2 +
              (this.analyser.levels[Math.floor(i / 2)] / 256) *
                this.data.scale),
            isNaN(yScale))
          )
            return;
          this.setBoxHeight(2 * this.frequencyBinCount - i - 1, yScale),
            this.setBoxHeight(2 * this.frequencyBinCount - i - 2, yScale),
            (this.geometry.attributes.position.needsUpdate = !0);
        }
      },
      initBox: function (box, flip, zPosition) {
        const data = this.data;
        for (let v = 0; v < box.attributes.position.array.length; v += 3)
          (box.attributes.position.array[v + 2] += zPosition),
            (box.attributes.position.array[v + 1] *= data.height / 2),
            (box.attributes.position.array[v] += flip * data.mirror);
      },
      setBoxHeight: function (boxNumber, height) {
        const boxIndex = boxNumber * NUM_VALUES_PER_BOX;
        for (
          let i = boxIndex, yValue;
          i < boxIndex + NUM_VALUES_PER_BOX;
          i += 3
        )
          (yValue = this.geometry.attributes.position.array[i + 1]),
            (this.geometry.attributes.position.array[i + 1] =
              0 <= yValue ? height : -1 * height);
      },
    });
  },
  function () {
    const ANIME = AFRAME.ANIME || AFRAME.anime;
    AFRAME.registerComponent("beams", {
      schema: { isPlaying: { default: !1 }, poolSize: { default: 3 } },
      init: function () {
        (this.beams = []),
          (this.currentRed = 0),
          (this.currentBlue = 0),
          (this.clearBeams = this.clearBeams.bind(this)),
          this.el.sceneEl.addEventListener("cleargame", this.clearBeams);
      },
      update: function () {
        for (let i = 0; i < this.beams.length; i++)
          this.beams[i].time && (this.beams[i].visible = this.data.isPlaying);
      },
      play: function () {
        var loader = new THREE.OBJLoader(),
          objData,
          loader,
          redGeometry,
          blueGeometry;
        (objData = document.getElementById("redbeamObj").data),
          (redGeometry = loader.parse(objData).children[0].geometry),
          (objData = document.getElementById("bluebeamObj").data),
          (blueGeometry = loader.parse(objData).children[0].geometry),
          (this.redBeams = this.createBeamPool(
            redGeometry,
            this.el.sceneEl.systems.materials.stageAdditive
          )),
          (this.blueBeams = this.createBeamPool(
            blueGeometry,
            this.el.sceneEl.systems.materials.stageAdditive
          ));
      },
      tick: function (t, dt) {
        if (this.data.isPlaying)
          for (let i = 0, beam; i < this.beams.length; i++)
            ((beam = this.beams[i]), !!beam.visible) &&
              ((beam.time += dt), beam.animation.tick(beam.time));
      },
      createBeamPool: function (geometry, material) {
        const beams = [];
        for (let i = 0, beam; i < this.data.poolSize; i++)
          (beam = new THREE.Mesh(geometry, material)),
            (beam.visible = !1),
            (beam.animation = ANIME({
              autoplay: !1,
              targets: beam.scale,
              x: 1e-5,
              duration: 300,
              easing: "easeInCubic",
              complete: () => {
                beam.visible = !1;
              },
            })),
            this.el.object3D.add(beam),
            beams.push(beam),
            this.beams.push(beam);
        return beams;
      },
      newBeam: function (color, position) {
        var beam;
        "red" === color
          ? ((beam = this.redBeams[this.currentRed]),
            (this.currentRed = (this.currentRed + 1) % this.redBeams.length),
            beam.position.set(
              position.x,
              position.y,
              position.z + this.currentRed / 50
            ))
          : ((beam = this.blueBeams[this.currentBlue]),
            (this.currentBlue = (this.currentBlue + 1) % this.blueBeams.length),
            beam.position.set(
              position.x,
              position.y,
              position.z + this.currentBlue / 50
            )),
          (beam.visible = !0),
          (beam.scale.x = 1),
          (beam.time = 0);
      },
      clearBeams: function () {
        for (let i = 0; i < this.beams.length; i++)
          (this.beams[i].visible = !1),
            (this.beams[i].time = 0),
            (this.beams[i].scale.x = 1);
      },
    });
  },
  function (module, __webpack_exports__, __webpack_require__) {
    "use strict";
    function lessThan(a, b) {
      return a._time - b._time;
    }
    Object.defineProperty(__webpack_exports__, "__esModule", { value: !0 });
    var __WEBPACK_IMPORTED_MODULE_0__constants_beat__ = __webpack_require__(2),
      __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(1),
      __WEBPACK_IMPORTED_MODULE_1__utils___default = __webpack_require__.n(
        __WEBPACK_IMPORTED_MODULE_1__utils__
      );
    let skipDebug = AFRAME.utils.getUrlParameter("skip") || 0;
    (skipDebug = parseInt(skipDebug, 10)),
      AFRAME.registerComponent("beat-generator", {
        dependencies: ["stage-colors"],
        schema: {
          beatAnticipationTime: { default: 1.1 },
          beatSpeed: { default: 8 },
          beatWarmupTime: {
            default: __WEBPACK_IMPORTED_MODULE_0__constants_beat__.b / 1e3,
          },
          beatWarmupSpeed: {
            default: __WEBPACK_IMPORTED_MODULE_0__constants_beat__.a,
          },
          difficulty: { type: "string" },
          isPlaying: { default: !1 },
        },
        orientationsHumanized: [
          "up",
          "down",
          "left",
          "right",
          "upleft",
          "upright",
          "downleft",
          "downright",
        ],
        horizontalPositions: [-0.75, -0.25, 0.25, 0.75],
        horizontalPositionsHumanized: {
          0: "left",
          1: "middleleft",
          2: "middleright",
          3: "right",
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
          bottomRight: { layer: 0, index: 3 },
        },
        verticalPositionsHumanized: { 0: "bottom", 1: "middle", 2: "top" },
        init: function () {
          (this.audioAnalyserEl = document.getElementById("audioanalyser")),
            (this.beatData = null),
            (this.beatDataProcessed = !1),
            (this.beatContainer = document.getElementById("beatContainer")),
            (this.beatsTime = void 0),
            (this.beatsPreloadTime = 0),
            (this.beatsPreloadTimeTotal =
              1e3 *
              (this.data.beatAnticipationTime + this.data.beatWarmupTime)),
            (this.bpm = void 0),
            (this.stageColors = this.el.components["stage-colors"]),
            (this.swordOffset = 1.5),
            (this.twister = document.getElementById("twister")),
            (this.leftStageLasers = document.getElementById("leftStageLasers")),
            (this.rightStageLasers =
              document.getElementById("rightStageLasers")),
            this.el.addEventListener("cleargame", this.clearBeats.bind(this)),
            this.el.addEventListener("challengeloadend", (evt) => {
              (this.allBeatData = evt.detail.beats),
                (this.beatData =
                  evt.detail.beats[
                    this.data.difficulty || evt.detail.difficulty
                  ]),
                (this.info = evt.detail.info),
                this.processBeats();
            });
        },
        update: function (oldData) {
          oldData.difficulty &&
            oldData.difficulty !== this.data.difficulty &&
            this.allBeatData &&
            (this.beatData = this.allBeatData[this.data.difficulty]);
        },
        processBeats: function () {
          (this.beatsTime = 0),
            (this.beatsPreloadTime = 0),
            this.beatData._events.sort(lessThan),
            this.beatData._obstacles.sort(lessThan),
            this.beatData._notes.sort(lessThan),
            (this.bpm = this.info._beatsPerMinute);
          const events = this.beatData._events;
          if (events.length && 0 > events[0]._time)
            for (let i = 0; 0 > events[i]._time; i++)
              this.generateEvent(events[i]);
          (this.beatDataProcessed = !0),
            console.log("[beat-generator] Finished processing beat data.");
        },
        tick: function (time, delta) {
          if (this.data.isPlaying && this.beatData) {
            const song = this.el.components.song,
              prevBeatsTime = this.beatsTime + skipDebug,
              prevEventsTime = this.eventsTime + skipDebug;
            if (void 0 === this.beatsPreloadTime) {
              if (!song.isPlaying) return;
              (this.beatsTime =
                1e3 *
                (song.getCurrentTime() +
                  this.data.beatAnticipationTime +
                  this.data.beatWarmupTime)),
                (this.eventsTime = 1e3 * song.getCurrentTime());
            } else
              (this.beatsTime = this.beatsPreloadTime),
                (this.eventsTime = 1e3 * song.getCurrentTime());
            if (this.isSeeking) return void (this.isSeeking = !1);
            const beatsTime = this.beatsTime + skipDebug,
              msPerBeat = (1e3 * 60) / this.bpm,
              notes = this.beatData._notes;
            for (let i = 0, noteTime; i < notes.length; ++i)
              (noteTime = notes[i]._time * msPerBeat),
                noteTime > prevBeatsTime &&
                  noteTime <= beatsTime &&
                  ((notes[i].time = noteTime), this.generateBeat(notes[i]));
            const obstacles = this.beatData._obstacles;
            for (let i = 0, noteTime; i < obstacles.length; ++i)
              (noteTime = obstacles[i]._time * msPerBeat),
                noteTime > prevBeatsTime &&
                  noteTime <= beatsTime &&
                  this.generateWall(obstacles[i]);
            const eventsTime = this.eventsTime + skipDebug,
              events = this.beatData._events;
            for (let i = 0, noteTime; i < events.length; ++i)
              (noteTime = events[i]._time * msPerBeat),
                noteTime > prevEventsTime &&
                  noteTime <= eventsTime &&
                  this.generateEvent(events[i]);
            void 0 === this.beatsPreloadTime ||
              (this.beatsPreloadTime >= this.beatsPreloadTimeTotal
                ? (this.el.sceneEl.emit("beatloaderpreloadfinish", null, !1),
                  (this.beatsPreloadTime = void 0))
                : (this.beatsPreloadTime += delta));
          }
        },
        seek: function (time) {
          this.clearBeats(!0),
            (this.beatsTime =
              1e3 *
              (time +
                this.data.beatAnticipationTime +
                this.data.beatWarmupTime)),
            (this.isSeeking = !0);
        },
        generateBeat: (function () {
          const beatObj = {};
          return function (noteInfo) {
            const data = this.data;
            let type = 8 === noteInfo._cutDirection ? "dot" : "arrow",
              color;
            0 === noteInfo._type
              ? (color = "red")
              : 1 === noteInfo._type
              ? (color = "blue")
              : ((type = "mine"), (color = void 0));
            const beatEl = this.requestBeat(type, color);
            beatEl &&
              ((beatObj.anticipationPosition =
                -data.beatAnticipationTime * data.beatSpeed - this.swordOffset),
              (beatObj.color = color),
              (beatObj.cutDirection =
                this.orientationsHumanized[noteInfo._cutDirection]),
              (beatObj.horizontalPosition =
                this.horizontalPositionsHumanized[noteInfo._lineIndex]),
              (beatObj.speed = this.data.beatSpeed),
              (beatObj.type = type),
              (beatObj.verticalPosition =
                this.verticalPositionsHumanized[noteInfo._lineLayer]),
              (beatObj.warmupPosition =
                -data.beatWarmupTime * data.beatWarmupSpeed),
              beatEl.setAttribute("beat", beatObj),
              beatEl.play(),
              beatEl.components.beat.onGenerate());
          };
        })(),
        generateWall: (function () {
          const wallObj = {};
          return function (wallInfo) {
            const el = this.el.sceneEl.components.pool__wall.requestEntity();
            if (el) {
              const data = this.data,
                speed = this.data.beatSpeed,
                durationSeconds = 60 * (wallInfo._duration / this.bpm);
              (wallObj.anticipationPosition =
                -data.beatAnticipationTime * data.beatSpeed - this.swordOffset),
                (wallObj.durationSeconds = durationSeconds),
                (wallObj.horizontalPosition =
                  this.horizontalPositionsHumanized[wallInfo._lineIndex]),
                (wallObj.isCeiling = 1 === wallInfo._type),
                (wallObj.speed = speed),
                (wallObj.warmupPosition =
                  -data.beatWarmupTime * data.beatWarmupSpeed),
                (wallObj.width = wallInfo._width * 0.5),
                el.setAttribute("wall", wallObj),
                el.play();
            }
          };
        })(),
        generateEvent: function (event) {
          switch (event._type) {
            case 0:
              this.stageColors.setColor("bg", event._value);
              break;
            case 1:
              this.stageColors.setColor("tunnel", event._value);
              break;
            case 2:
              this.stageColors.setColor("leftlaser", event._value);
              break;
            case 3:
              this.stageColors.setColor("rightlaser", event._value);
              break;
            case 4:
              this.stageColors.setColor("floor", event._value);
              break;
            case 8:
              this.twister.components.twister.pulse(event._value);
              break;
            case 9:
              this.twister.components.twister.pulse(event._value);
              break;
            case 12:
              this.leftStageLasers.components["stage-lasers"].pulse(
                event._value
              );
              break;
            case 13:
              this.rightStageLasers.components["stage-lasers"].pulse(
                event._value
              );
          }
        },
        requestBeat: function (type, color) {
          var beatPoolName = "pool__beat-" + type,
            pool;
          return (
            color && (beatPoolName += "-" + color),
            (pool = this.el.sceneEl.components[beatPoolName]),
            pool
              ? pool.requestEntity()
              : void console.warn("Pool " + beatPoolName + " unavailable")
          );
        },
        clearBeats: function (isSeeking) {
          isSeeking ||
            ((this.beatsPreloadTime = 0),
            (this.beatsTime = 0),
            (this.eventsTime = 0));
          for (let i = 0, child; i < this.beatContainer.children.length; i++)
            (child = this.beatContainer.children[i]),
              child.components.beat && child.components.beat.returnToPool(),
              child.components.wall && child.components.wall.returnToPool();
        },
      });
  },
  function () {
    var sourceCreatedCallback;
    const LAYER_BOTTOM = "bottom",
      LAYER_TOP = "top",
      VOLUME = 0.2;
    (THREE.Audio.prototype.play = function () {
      if (!0 === this.isPlaying)
        return void console.warn("THREE.Audio: Audio is already playing.");
      if (!1 === this.hasPlaybackControl)
        return void console.warn(
          "THREE.Audio: this Audio has no playback control."
        );
      var source = this.context.createBufferSource();
      return (
        (source.buffer = this.buffer),
        (source.detune.value = this.detune),
        (source.loop = this.loop),
        (source.onended = this.onEnded.bind(this)),
        source.playbackRate.setValueAtTime(this.playbackRate, this.startTime),
        (this.startTime = this.context.currentTime),
        sourceCreatedCallback && sourceCreatedCallback(source),
        source.start(this.startTime, this.offset),
        (this.isPlaying = !0),
        (this.source = source),
        this.connect()
      );
    }),
      AFRAME.registerComponent("beat-hit-sound", {
        directionsToSounds: {
          up: "",
          down: "",
          upleft: "left",
          upright: "right",
          downleft: "left",
          downright: "right",
          left: "left",
          right: "right",
        },
        init: function () {
          (this.currentBeatEl = null),
            (this.currentCutDirection = ""),
            (this.processSound = this.processSound.bind(this)),
            (sourceCreatedCallback = this.sourceCreatedCallback.bind(this));
          for (let i = 1; 10 >= i; i++)
            this.el.setAttribute(`sound__beathit${i}`, {
              poolSize: 4,
              src: `#hitSound${i}`,
              volume: VOLUME,
            }),
              this.el.setAttribute(`sound__beathit${i}left`, {
                poolSize: 4,
                src: `#hitSound${i}left`,
                volume: VOLUME,
              }),
              this.el.setAttribute(`sound__beathit${i}right`, {
                poolSize: 4,
                src: `#hitSound${i}right`,
                volume: VOLUME,
              });
        },
        play: function () {
          for (let i = 1; 10 >= i; i++)
            setTimeout(() => {
              this.el.components[`sound__beathit${i}`].loaded ||
                (this.el.setAttribute(`sound__beathit${i}`, "src", ""),
                this.el.setAttribute(
                  `sound__beathit${i}`,
                  "src",
                  `#hitSound${i}`
                ));
            }, 10 * i),
              setTimeout(() => {
                this.el.components[`sound__beathit${i}left`].loaded ||
                  (this.el.setAttribute(`sound__beathit${i}left`, "src", ""),
                  this.el.setAttribute(
                    `sound__beathit${i}left`,
                    "src",
                    `#hitSound${i}left`
                  ));
              }, 20 * i),
              setTimeout(() => {
                this.el.components[`sound__beathit${i}right`].loaded ||
                  (this.el.setAttribute(`sound__beathit${i}right`, "src", ""),
                  this.el.setAttribute(
                    `sound__beathit${i}right`,
                    "src",
                    `#hitSound${i}right`
                  ));
              }, 30 * i);
        },
        playSound: function (beatEl, cutDirection) {
          const rand = 1 + Math.floor(10 * Math.random()),
            dir = this.directionsToSounds[cutDirection || "up"],
            soundPool = this.el.components[`sound__beathit${rand}${dir}`];
          (this.currentBeatEl = beatEl), soundPool.playSound(this.processSound);
        },
        processSound: function (audio) {
          (audio.detune = 0),
            this.currentBeatEl.object3D.getWorldPosition(audio.position);
        },
        sourceCreatedCallback: function (source) {
          const layer = this.getLayer(this.currentBeatEl.object3D.position.y);
          layer === LAYER_BOTTOM
            ? source.detune.setValueAtTime(-400, 0)
            : layer === LAYER_TOP && source.detune.setValueAtTime(200, 0),
            "down" === this.currentCutDirection &&
              source.detune.linearRampToValueAtTime(-400, 1),
            "up" === this.currentCutDirection &&
              source.detune.linearRampToValueAtTime(400, 1);
        },
        getLayer: function (y) {
          return 1 === y ? LAYER_BOTTOM : 1.7 === y ? LAYER_TOP : "middle";
        },
        setVolume: function (volume) {
          volume *= 0.4;
          for (let i = 1; 10 >= i; i++)
            for (let j = 0; 4 > j; j++)
              this.el.components[`sound__beathit${i}`].pool.children[
                j
              ].setVolume(volume),
                this.el.components[`sound__beathit${i}left`].pool.children[
                  j
                ].setVolume(volume),
                this.el.components[`sound__beathit${i}right`].pool.children[
                  j
                ].setVolume(volume);
        },
      });
  },
  function (module, __webpack_exports__, __webpack_require__) {
    "use strict";
    var _MathPI2 = Math.PI;
    Object.defineProperty(__webpack_exports__, "__esModule", { value: !0 });
    var __WEBPACK_IMPORTED_MODULE_0__constants_beat__ = __webpack_require__(2);
    const COLORS = __webpack_require__(0),
      auxObj3D = new THREE.Object3D(),
      BEAT_WARMUP_ROTATION_TIME = 750,
      SWORD_OFFSET = 1.5,
      ONCE = { once: !0 };
    AFRAME.registerComponent("beat", {
      schema: {
        anticipationPosition: { default: 0 },
        color: { default: "red", oneOf: ["red", "blue"] },
        cutDirection: { default: "down" },
        debug: { default: !0 },
        horizontalPosition: {
          default: "middleleft",
          oneOf: ["left", "middleleft", "middleright", "right"],
        },
        size: { default: 0.4 },
        speed: { default: 8 },
        type: { default: "arrow", oneOf: ["arrow", "dot", "mine"] },
        verticalPosition: { default: "middle", oneOf: ["middle", "top"] },
        warmupPosition: { default: 0 },
      },
      materialColor: { blue: COLORS.BEAT_BLUE, red: COLORS.BEAT_RED },
      cutColor: { blue: "#fff", red: "#fff" },
      models: {
        arrow: "beatObjTemplate",
        dot: "beatObjTemplate",
        mine: "mineObjTemplate",
      },
      signModels: {
        arrowred: "arrowRedObjTemplate",
        arrowblue: "arrowBlueObjTemplate",
        dotred: "dotRedObjTemplate",
        dotblue: "dotBlueObjTemplate",
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
        downright: 45,
      },
      horizontalPositions: {
        left: -0.75,
        middleleft: -0.25,
        middleright: 0.25,
        right: 0.75,
      },
      verticalPositions: { middle: 1.2, top: 1.7 },
      init: function () {
        (this.beams = document.getElementById("beams").components.beams),
          (this.beatBoundingBox = new THREE.Box3()),
          (this.currentRotationWarmupTime = 0),
          (this.cutDirection = new THREE.Vector3()),
          (this.destroyed = !1),
          (this.gravityVelocity = 0),
          (this.hitEventDetail = {}),
          (this.hitBoundingBox = new THREE.Box3()),
          (this.poolName = void 0),
          (this.returnToPoolTimeStart = void 0),
          (this.rotationAxis = new THREE.Vector3()),
          (this.scoreEl = null),
          (this.scoreElTime = void 0),
          (this.startPositionZ = void 0),
          (this.particles = document.getElementById("saberParticles")),
          (this.mineParticles = document.getElementById("mineParticles")),
          (this.explodeEventDetail = {
            position: new THREE.Vector3(),
            rotation: new THREE.Euler(),
          }),
          (this.glow = null),
          (this.destroyBeat = this.destroyBeat),
          this.initBlock(),
          "mine" === this.data.type && this.initMineFragments();
      },
      update: function () {
        this.updateBlock(),
          (this.poolName =
            "mine" === this.data.type
              ? `pool__beat-mine`
              : `pool__beat-${this.data.type}-${this.data.color}`);
      },
      pause: function () {
        this.el.object3D.visible = !1;
      },
      play: function () {
        (this.glow =
          this.el.sceneEl.components["pool__beat-glow"].requestEntity()),
          (this.blockEl.object3D.visible = !0),
          this.el.setAttribute("beatObject", "beat"),
          (this.destroyed = !1),
          (this.el.object3D.visible = !0);
      },
      tock: function (time, timeDelta) {
        const el = this.el,
          data = this.data,
          position = el.object3D.position,
          rotation = el.object3D.rotation;
        if (
          this.returnToPoolTimeStart &&
          800 < time - this.returnToPoolTimeStart
        )
          return (
            this.returnToPool(), void (this.returnToPoolTimeStart = void 0)
          );
        if (position.z < data.anticipationPosition) {
          let newPositionZ =
            position.z +
            __WEBPACK_IMPORTED_MODULE_0__constants_beat__.a * (timeDelta / 1e3);
          newPositionZ < data.anticipationPosition
            ? (position.z = newPositionZ)
            : ((position.z = data.anticipationPosition),
              this.beams.newBeam(this.data.color, position));
        } else {
          const oldPosition = position.z;
          (position.z += this.data.speed * (timeDelta / 1e3)),
            (rotation.z = this.startRotationZ),
            oldPosition < -1 * SWORD_OFFSET &&
              position.z >= -1 * SWORD_OFFSET &&
              ((this.returnToPoolTimeStart = time),
              "mine" === this.data.type && this.destroyMine());
        }
        if (
          position.z > data.anticipationPosition - 0.4 &&
          this.currentRotationWarmupTime < BEAT_WARMUP_ROTATION_TIME
        ) {
          const progress = AFRAME.ANIME.easings.easeOutBack(
            this.currentRotationWarmupTime / BEAT_WARMUP_ROTATION_TIME
          );
          (el.object3D.rotation.z =
            this.rotationZStart + progress * this.rotationZChange),
            (this.currentRotationWarmupTime += timeDelta);
        }
      },
      onGenerate: function () {
        const el = this.el,
          data = this.data;
        el.object3D.position.set(
          this.horizontalPositions[data.horizontalPosition],
          this.verticalPositions[data.verticalPosition],
          data.anticipationPosition + data.warmupPosition
        ),
          (el.object3D.rotation.z = THREE.Math.degToRad(
            this.rotations[data.cutDirection]
          )),
          (this.startRotationZ = this.el.object3D.rotation.z),
          (this.currentRotationWarmupTime = 0),
          (this.rotationZChange = _MathPI2 / 5),
          0.5 < Math.random && (this.rotationZChange *= -1),
          (this.el.object3D.rotation.z -= this.rotationZChange),
          (this.rotationZStart = this.el.object3D.rotation.z),
          "mine" == this.data.type && this.resetMineFragments(),
          (this.returnToPoolTimeStart = void 0);
      },
      initBlock: function () {
        var el = this.el,
          blockEl = (this.blockEl = document.createElement("a-entity")),
          signEl = (this.signEl = document.createElement("a-entity"));
        blockEl.setAttribute("mixin", "beatBlock"),
          blockEl.setAttribute("mixin", "beatSign"),
          (signEl.object3D.position.z += 0.02),
          blockEl.appendChild(signEl),
          el.appendChild(blockEl);
      },
      updateBlock: function () {
        const blockEl = this.blockEl,
          signEl = this.signEl;
        if (blockEl)
          if (
            (blockEl.setAttribute("material", {
              metalness: 0.7,
              roughness: 0.1,
              sphericalEnvMap: "#envmapTexture",
              emissive: this.materialColor[this.data.color],
              emissiveIntensity: 0.05,
              color: this.materialColor[this.data.color],
            }),
            this.setObjModelFromTemplate(blockEl, this.models[this.data.type]),
            blockEl.object3D.scale.set(1, 1, 1),
            blockEl.object3D.scale
              .multiplyScalar(3.45)
              .multiplyScalar(this.data.size),
            "mine" === this.data.type)
          ) {
            const model = blockEl.getObject3D("mesh");
            model
              ? (model.material =
                  this.el.sceneEl.systems.materials[
                    "mineMaterial" + this.data.color
                  ])
              : blockEl.addEventListener(
                  "model-loaded",
                  () => {
                    model.material =
                      this.el.sceneEl.systems.materials[
                        "mineMaterial" + this.data.color
                      ];
                  },
                  ONCE
                );
          } else
            signEl.setAttribute("materials", { name: "stageAdditive" }),
              this.setObjModelFromTemplate(
                signEl,
                this.signModels[this.data.type + this.data.color]
              );
      },
      initMineFragments: function () {
        var fragments =
            this.el.sceneEl.systems["mine-fragments-loader"].fragments.children,
          material =
            this.el.sceneEl.systems.materials["mineMaterial" + this.data.color],
          fragment;
        (this.randVec = new THREE.Vector3(
          Math.random() * _MathPI2,
          Math.random() * _MathPI2,
          Math.random() * _MathPI2
        )),
          (this.mineFragments = []),
          (this.mineBroken = document.createElement("a-entity")),
          this.el.appendChild(this.mineBroken);
        for (var i = 0; i < fragments.length; i++)
          (fragment = new THREE.Mesh(fragments[i].geometry, material)),
            (fragment.speed = new THREE.Vector3()),
            fragment.speed.set(
              Math.random() - 0.5,
              Math.random() - 0.5,
              Math.random() - 0.5
            ),
            this.mineFragments.push(fragment),
            this.mineBroken.object3D.add(fragment);
      },
      resetMineFragments: function () {
        if ("mine" === this.data.type)
          for (let i = 0, fragment; i < this.mineFragments.length; i++)
            (fragment = this.mineFragments[i]),
              (fragment.visible = !1),
              fragment.position.set(0, 0, 0),
              fragment.scale.set(1, 1, 1),
              fragment.speed.set(
                5 * Math.random() - 2.5,
                5 * Math.random() - 2.5,
                5 * Math.random() - 2.5
              );
      },
      destroyMine: function () {
        for (let i = 0; i < this.mineFragments.length; i++)
          this.mineFragments[i].visible = !0;
        (this.blockEl.object3D.visible = !1),
          (this.destroyed = !0),
          (this.gravityVelocity = 0.1),
          (this.returnToPoolTimer = 800),
          this.explodeEventDetail.position.copy(this.el.object3D.position),
          this.explodeEventDetail.rotation.copy(this.randVec),
          this.mineParticles.emit("explode", this.explodeEventDetail, !1);
      },
      destroyBeat: function () {
        (this.el.object3D.visible = !1),
          this.el.parentNode.components["beat-hit-sound"].playSound(
            this.el,
            this.data.cutDirection
          ),
          this.explodeEventDetail.position.copy(this.el.object3D.position),
          this.explodeEventDetail.rotation.copy(this.el.object3D.rotation),
          this.particles.emit("explode", this.explodeEventDetail, !1),
          this.glow &&
            (this.glow.play(),
            (this.glow.object3D.visible = !0),
            this.glow.object3D.position.copy(this.el.object3D.position),
            (this.glow.object3D.rotation.z = 2 * Math.random()),
            this.glow.emit("explode", null, !1),
            "mine" !== this.data.type &&
              setTimeout(() => {
                this.el.sceneEl.components["pool__beat-glow"].returnEntity(
                  this.glow
                );
              }, 350));
      },
      returnToPool: function () {
        this.el.sceneEl.components[this.poolName].returnEntity(this.el);
      },
      setObjModelFromTemplate: (function () {
        const geometries = {};
        return function (el, templateId) {
          if (!geometries[templateId]) {
            const templateEl = document.getElementById(templateId);
            if (templateEl.getObject3D("mesh"))
              geometries[templateId] =
                templateEl.getObject3D("mesh").children[0].geometry;
            else
              return void templateEl.addEventListener("model-loaded", () => {
                (geometries[templateId] =
                  templateEl.getObject3D("mesh").children[0].geometry),
                  this.setObjModelFromTemplate(el, templateId);
              });
          }
          el.getObject3D("mesh") || el.setObject3D("mesh", new THREE.Mesh()),
            (el.getObject3D("mesh").geometry = geometries[templateId]);
        };
      })(),
    });
  },
  function () {
    AFRAME.registerComponent("blob-texture", {
      dependencies: ["material"],
      schema: { src: { type: "string" } },
      update: function () {
        var el = this.el,
          data = this.data;
        if (data.src)
          if (!data.src.startsWith("blob"))
            return void el.setAttribute("material", "src", data.src);
          else {
            const image = new Image();
            (image.onload = function () {
              const map = new THREE.Texture();
              (map.image = image),
                el.setAttribute("material", "src", ""),
                (el.getObject3D("mesh").material.map = map),
                (el.getObject3D("mesh").material.needsUpdate = !0),
                (map.needsUpdate = !0);
            }),
              (image.src = data.src);
          }
      },
    });
  },
  function () {
    AFRAME.registerComponent("collider-check", {
      dependencies: ["raycaster"],
      init: function () {
        console.log("coming here??"),
          this.el.addEventListener("raycaster-intersected", function () {
            console.log("Player hit something!"),
              (this.raycaster = evt.detail.el),
              console.log(raycaster);
          });
      },
    });
  },
  function () {
    AFRAME.registerComponent("console-shortcuts", {
      play: function () {
        (window.$ = (val) => document.querySelector(val)),
          (window.$$ = (val) => document.querySelectorAll(val)),
          (window.$$$ = (val) =>
            document.querySelector(`[${val}]`).getAttribute(val)),
          (window.$$$$ = (val) =>
            document.querySelector(`[${val}]`).components[val]),
          (window.scene = this.el),
          (window.state = this.el.systems.state.state);
      },
    });
  },
  function () {
    AFRAME.registerComponent("copy-texture", {
      dependencies: ["geometry", "material"],
      schema: { from: { type: "selector" } },
      init: function () {
        const data = this.data;
        data.from.addEventListener("materialtextureloaded", () => {
          this.copyTexture();
        }),
          this.copyTexture();
      },
      copyTexture: function () {
        const el = this.el,
          target = this.data.from,
          material = el.getObject3D("mesh").material;
        target.getObject3D("mesh") &&
          ((material.map = target.getObject3D("mesh").material.map),
          material.map &&
            ((material.map.needsUpdate = !0), (material.needsUpdate = !0)));
      },
    });
  },
  function () {
    AFRAME.registerComponent("cursor-mesh", {
      schema: { active: { default: !0 }, cursorEl: { type: "selector" } },
      init: function () {
        this.scenePivotEl = document.getElementById("scenePivot");
      },
      update: function () {
        this.el.object3D.visible = this.data.active;
      },
      tick: function () {
        var cursorEl = this.data.cursorEl,
          el = this.el,
          scenePivotEl = this.scenePivotEl,
          cursor,
          intersection,
          intersectedEl;
        if (
          this.data.active &&
          ((cursor = cursorEl.components.cursor), !!cursor)
        ) {
          if (
            ((intersectedEl = cursorEl.components.cursor.intersectedEl),
            intersectedEl)
          )
            el.object3D.visible = !0;
          else return void (el.object3D.visible = !1);
          (intersection =
            cursorEl.components.raycaster.getIntersection(intersectedEl)),
            intersection &&
              (el.object3D.position.copy(intersection.point),
              scenePivotEl &&
                el.object3D.rotation.copy(scenePivotEl.object3D.rotation));
        }
      },
    });
  },
  function () {
    AFRAME.registerComponent("debug-controller", {
      init: function () {
        var primaryHand, secondaryHand;
        AFRAME.utils.getUrlParameter("debug") &&
          (console.log(
            "%c debug-controller enabled ",
            "background: #111; color: red"
          ),
          (this.isCloning = !1),
          (this.isDeleting = !1),
          (this.isTriggerDown = !1),
          window.addEventListener("mousemove", this.onMouseMove.bind(this)),
          (primaryHand = document.getElementById("rightHand")),
          (secondaryHand = document.getElementById("leftHand")),
          window.addEventListener("click", (evt) => {
            evt.isTrusted &&
              (primaryHand.emit("triggerdown"), primaryHand.emit("triggerup"));
          }),
          "oculus" === AFRAME.utils.getUrlParameter("debug")
            ? (primaryHand.emit("controllerconnected", {
                name: "oculus-touch-controls",
              }),
              secondaryHand.emit("controllerconnected", {
                name: "oculus-touch-controls",
              }),
              primaryHand.setAttribute(
                "controller",
                "controllerType",
                "oculus-touch-controls"
              ),
              secondaryHand.setAttribute(
                "controller",
                "controllerType",
                "oculus-touch-controls"
              ))
            : (primaryHand.emit("controllerconnected", {
                name: "vive-controls",
              }),
              secondaryHand.emit("controllerconnected", {
                name: "vive-controls",
              }),
              primaryHand.setAttribute(
                "controller",
                "controllerType",
                "vive-controls"
              ),
              secondaryHand.setAttribute(
                "controller",
                "controllerType",
                "vive-controls"
              )),
          this.el.emit("enter-vr", null, !1),
          document.addEventListener("keydown", (evt) => {
            var primaryPosition,
              primaryRotation,
              secondaryPosition,
              secondaryRotation;
            return evt.shiftKey
              ? 32 === evt.keyCode
                ? void (this.isTriggerDown
                    ? (primaryHand.emit("triggerup"), (this.isTriggerDown = !1))
                    : (primaryHand.emit("triggerdown"),
                      (this.isTriggerDown = !0)))
                : 81 === evt.keyCode
                ? void (this.isSecondaryTriggerDown
                    ? (secondaryHand.emit("triggerup"),
                      (this.isSecondaryTriggerDown = !1))
                    : (secondaryHand.emit("triggerdown"),
                      (this.isSecondaryTriggerDown = !0)))
                : void (78 === evt.keyCode &&
                    (this.secondaryGripDown
                      ? (secondaryHand.emit("gripup"),
                        (this.secondaryGripDown = !1))
                      : (secondaryHand.emit("gripdown"),
                        (this.secondaryGripDown = !0))),
                  77 === evt.keyCode &&
                    (this.primaryGripDown
                      ? (primaryHand.emit("gripup"),
                        (this.primaryGripDown = !1))
                      : (primaryHand.emit("gripdown"),
                        (this.primaryGripDown = !0))),
                  49 === evt.keyCode && secondaryHand.emit("menudown"),
                  evt.ctrlKey
                    ? ((secondaryPosition =
                        secondaryHand.getAttribute("position")),
                      72 === evt.keyCode && (secondaryPosition.x -= 0.01),
                      74 === evt.keyCode && (secondaryPosition.y -= 0.01),
                      75 === evt.keyCode && (secondaryPosition.y += 0.01),
                      76 === evt.keyCode && (secondaryPosition.x += 0.01),
                      (59 === evt.keyCode || 186 === evt.keyCode) &&
                        (secondaryPosition.z -= 0.01),
                      222 === evt.keyCode && (secondaryPosition.z += 0.01),
                      secondaryHand.setAttribute(
                        "position",
                        AFRAME.utils.clone(secondaryPosition)
                      ))
                    : ((primaryPosition = primaryHand.getAttribute("position")),
                      72 === evt.keyCode && (primaryPosition.x -= 0.01),
                      74 === evt.keyCode && (primaryPosition.y -= 0.01),
                      75 === evt.keyCode && (primaryPosition.y += 0.01),
                      76 === evt.keyCode && (primaryPosition.x += 0.01),
                      (59 === evt.keyCode || 186 === evt.keyCode) &&
                        (primaryPosition.z -= 0.01),
                      222 === evt.keyCode && (primaryPosition.z += 0.01),
                      primaryHand.setAttribute(
                        "position",
                        AFRAME.utils.clone(primaryPosition)
                      )),
                  evt.ctrlKey
                    ? ((secondaryRotation =
                        secondaryHand.getAttribute("rotation")),
                      89 === evt.keyCode && (secondaryRotation.x -= 10),
                      79 === evt.keyCode && (secondaryRotation.x += 10),
                      85 === evt.keyCode && (secondaryRotation.y -= 10),
                      73 === evt.keyCode && (secondaryRotation.y += 10),
                      secondaryHand.setAttribute(
                        "rotation",
                        AFRAME.utils.clone(secondaryRotation)
                      ))
                    : ((primaryRotation = primaryHand.getAttribute("rotation")),
                      89 === evt.keyCode && (primaryRotation.x -= 10),
                      79 === evt.keyCode && (primaryRotation.x += 10),
                      85 === evt.keyCode && (primaryRotation.y -= 10),
                      73 === evt.keyCode && (primaryRotation.y += 10),
                      primaryHand.setAttribute(
                        "rotation",
                        AFRAME.utils.clone(primaryRotation)
                      )))
              : void 0;
          }));
      },
      play: function () {
        var primaryHand, secondaryHand;
        this.bounds = document.body.getBoundingClientRect();
        AFRAME.utils.getUrlParameter("debug") &&
          ((primaryHand = document.getElementById("rightHand")),
          (secondaryHand = document.getElementById("leftHand")),
          secondaryHand.object3D.position.set(-0.2, 1.5, -0.5),
          primaryHand.object3D.position.set(0.2, 1.5, -0.5),
          secondaryHand.setAttribute("rotation", { x: 35, y: 0, z: 0 }));
      },
      onMouseMove: (function () {
        const direction = new THREE.Vector3(),
          mouse = new THREE.Vector2(),
          cameraPos = new THREE.Vector3();
        return function (evt) {
          const bounds = this.bounds,
            camera = this.el.sceneEl.camera,
            left = evt.clientX - bounds.left,
            top = evt.clientY - bounds.top;
          (mouse.x = 2 * (left / bounds.width) - 1),
            (mouse.y = 2 * (-top / bounds.height) - 1),
            document
              .getElementById("camera")
              .object3D.getWorldPosition(cameraPos),
            direction
              .set(mouse.x, mouse.y, 0.5)
              .unproject(camera)
              .sub(cameraPos)
              .normalize();
          const handPos =
              document.getElementById("rightHand").object3D.position,
            distance = -cameraPos.z / direction.z;
          camera
            .getWorldPosition(handPos)
            .add(direction.multiplyScalar(distance)),
            (handPos.y += 0.8);
        };
      })(),
    });
  },
  function () {
    AFRAME.registerComponent("debug-cursor", {
      init: function () {},
      log: function (event, intersectedEl, color) {
        intersectedEl.id
          ? console.log(`%c[${event}] ${intersectedEl.id}`, `color: ${color}`)
          : (console.log(`%c[${event}]`, `color: ${color}`),
            console.log(intersectedEl));
      },
    });
  },
  function () {
    AFRAME.registerComponent("debug-song-time", {
      dependencies: ["song"],
      init: function () {
        AFRAME.utils.getUrlParameter("debug-song-time") &&
          setInterval(() => {
            console.log(this.el.components.song.getCurrentTime());
          }, 250);
      },
    });
  },
  function () {
    AFRAME.registerComponent("debug-state", {
      play: function () {
        const flags = AFRAME.utils.getUrlParameter("debugstate").trim();
        flags &&
          setTimeout(() => {
            flags.split(",").forEach((flag) => {
              this.el.sceneEl.emit(`debug${flag.trim()}`, null, !1);
            });
          }, 500);
      },
    });
  },
  function (module, __webpack_exports__, __webpack_require__) {
    "use strict";
    function createGeometry(color) {
      colorHelper.set(color);
      const geometries = [
          { height: 0.1831, radius: 0.0055 },
          { height: 0.1832, radius: 0.0065 },
          { height: 0.1833, radius: 0.0075 },
          { height: 0.1834, radius: 0.0085 },
        ].map((cylinderData, i) => {
          const cylinder = new THREE.CylinderBufferGeometry(
              cylinderData.radius,
              cylinderData.radius,
              cylinderData.height
            ),
            colorArray = [];
          for (i = 0; i < cylinder.attributes.position.array.length; i += 3)
            (colorArray[i] = colorHelper.r),
              (colorArray[i + 1] = colorHelper.g),
              (colorArray[i + 2] = colorHelper.b);
          cylinder.addAttribute(
            "color",
            new THREE.Float32BufferAttribute(colorArray, 3)
          );
          const alphaUvs = __webpack_require__.i(
              __WEBPACK_IMPORTED_MODULE_0_aframe_atlas_uvs_component__.getGridUvs
            )(0, i, 1, 4),
            uvs = cylinder.attributes.uv.array;
          for (i = 0; i < uvs.length; i += 6)
            (uvs[i] = alphaUvs[0].x),
              (uvs[i + 1] = alphaUvs[0].y),
              (uvs[i + 2] = alphaUvs[1].x),
              (uvs[i + 3] = alphaUvs[1].y),
              (uvs[i + 4] = alphaUvs[2].x),
              (uvs[i + 5] = alphaUvs[2].y);
          return (cylinder.attributes.uv.needsUpdate = !0), cylinder;
        }),
        geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
      return geometry;
    }
    Object.defineProperty(__webpack_exports__, "__esModule", { value: !0 });
    var __WEBPACK_IMPORTED_MODULE_0_aframe_atlas_uvs_component__ =
        __webpack_require__(3),
      __WEBPACK_IMPORTED_MODULE_0_aframe_atlas_uvs_component___default =
        __webpack_require__.n(
          __WEBPACK_IMPORTED_MODULE_0_aframe_atlas_uvs_component__
        );
    __webpack_require__(4);
    const colorHelper = new THREE.Color(),
      geometry = createGeometry(),
      material = new THREE.MeshBasicMaterial({
        alphaMap: (function createAlphaMap() {
          const alphaCanvas = document.createElement("canvas");
          (alphaCanvas.height = 1), (alphaCanvas.width = 4);
          const ctx = alphaCanvas.getContext("2d");
          return (
            (ctx.fillStyle = "rgb(10, 10, 10)"),
            ctx.fillRect(0, 0, 1, 1),
            (ctx.fillStyle = "rgb(15, 15, 15)"),
            ctx.fillRect(1, 0, 1, 1),
            (ctx.fillStyle = "rgb(23, 23 ,23)"),
            ctx.fillRect(2, 0, 1, 1),
            (ctx.fillStyle = "rgb(28, 28, 28)"),
            ctx.fillRect(3, 0, 1, 1),
            setTimeout(() => {
              (alphaCanvas.style.position = "fixed"),
                (alphaCanvas.style.zIndex = 999999999999),
                (alphaCanvas.style.left = 0),
                (alphaCanvas.style.top = 0),
                document.body.appendChild(alphaCanvas);
            }, 1e3),
            new THREE.CanvasTexture(alphaCanvas)
          );
        })(),
        transparent: !0,
        vertexColors: THREE.VertexColors,
      });
    AFRAME.registerComponent("fake-glow", {
      schema: { color: { default: "#FFF" } },
      play: function () {
        this.el.setObject3D(
          "mesh",
          new THREE.Mesh(createGeometry(this.data.color), material)
        );
      },
    });
  },
  function (module, exports, __webpack_require__) {
    const COLORS = __webpack_require__(0),
      HIT_COLOR = new THREE.Color(COLORS.NEON_RED),
      BORDER_COLOR = new THREE.Color(COLORS.NEON_BLUE);
    AFRAME.registerShader("floorShader", {
      schema: {
        normalMap: { type: "map", is: "uniform" },
        envMap: { type: "map", is: "uniform" },
        hitRight: {
          type: "vec3",
          is: "uniform",
          default: { x: 0, y: 1, z: 0 },
        },
        hitLeft: { type: "vec3", is: "uniform", default: { x: 0, y: 0, z: 0 } },
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
  `,
    });
  },
  function () {
    let i = 0;
    AFRAME.registerComponent("gpu-preloader", {
      dependencies: ["materials"],
      play: function () {
        this.preloadMineEnvMaps(),
          setTimeout(() => {
            this.preloadAtlas(),
              this.preloadBeamMap(),
              this.preloadBeatEnvMap();
          }, 1e3);
      },
      preloadAtlas: function () {
        const stage = document.querySelector("#stageObj");
        this.preloadTexture(
          stage.getObject3D("mesh").children[0].material.uniforms.src.value
        );
      },
      preloadBeamMap: function () {
        const beams = document.querySelector("[beams]");
        this.preloadTexture(beams.components.beams.texture);
      },
      preloadBeatEnvMap: function () {
        const beat = document.querySelector('#beatContainer [mixin~="beat"]');
        beat.object3D.traverse((node) => {
          node.material &&
            (node.material.envMap && this.preloadTexture(node.material.envMap),
            node.material.map && this.preloadTexture(node.material.map));
        });
      },
      preloadKeyboard: function () {
        const keyboard =
          document.getElementById("keyboard").components["super-keyboard"];
        this.preloadTexture(keyboard.kbImg.getObject3D("mesh").material.map),
          this.preloadTexture(
            keyboard.keyColorPlane.getObject3D("mesh").material.map
          );
      },
      preloadMineEnvMaps: function () {
        const stageColors = this.el.sceneEl.components["stage-colors"];
        this.el.sceneEl.addEventListener("mineredenvmaploaded", () => {
          this.preloadTexture(stageColors.mineEnvMap.red);
        }),
          this.el.sceneEl.addEventListener("mineblueenvmaploaded", () => {
            this.preloadTexture(stageColors.mineEnvMap.blue);
          });
      },
      preloadWallMap: function () {
        const wall = document.querySelector("a-entity[wall]");
        this.preloadTexture(
          wall.getObject3D("mesh").material.uniforms.tex.value
        ),
          this.preloadTexture(
            wall.getObject3D("mesh").material.uniforms.env.value
          );
      },
      preloadTexture: function (texture) {
        return texture && texture.image
          ? texture.image.complete
            ? void this.el.renderer.setTexture2D(texture, i++ % 8)
            : void console.warn(
                "[gpu-preloader] Error preloading, image not loaded",
                texture
              )
          : void console.warn(
              "[gpu-preloader] Error preloading texture",
              texture
            );
      },
    });
  },
  function () {
    AFRAME.registerSystem("iframe", {
      init: function () {
        window.self !== window.top &&
          (document.getElementById("vrButton").style.display = "none");
      },
    });
  },
  function () {
    AFRAME.registerComponent("keyboard-raycastable", {
      dependencies: ["super-keyboard"],
      schema: { condition: { default: "" } },
      play: function () {
        this.el.components["super-keyboard"].kbImg.setAttribute(
          "bind-toggle__raycastable",
          this.data.condition
        );
      },
    });
  },
  function (module, exports, __webpack_require__) {
    const COLORS = __webpack_require__(0),
      flatShaders = __webpack_require__(22),
      stageAdditiveShaders = __webpack_require__(23),
      stageNormalShaders = __webpack_require__(24);
    AFRAME.registerSystem("materials", {
      init: function () {
        "loading" === document.readyState
          ? document.addEventListener(
              "DOMContentLoaded",
              this.createMaterials.bind(this)
            )
          : this.createMaterials();
      },
      createMaterials: function () {
        (this.stageNormal = new THREE.ShaderMaterial({
          uniforms: {
            skyColor: { value: new THREE.Color(COLORS.SKY_BLUE) },
            backglowColor: { value: new THREE.Color(COLORS.BG_BLUE) },
            src: {
              value: new THREE.TextureLoader().load(
                document.getElementById("atlasImg").src
              ),
            },
          },
          vertexShader: stageNormalShaders.vertexShader,
          fragmentShader: stageNormalShaders.fragmentShader,
          fog: !1,
          transparent: !0,
        })),
          (this.stageAdditive = new THREE.ShaderMaterial({
            uniforms: {
              tunnelNeon: { value: new THREE.Color(COLORS.NEON_RED) },
              floorNeon: { value: new THREE.Color(COLORS.NEON_RED) },
              leftLaser: { value: new THREE.Color(COLORS.NEON_BLUE) },
              rightLaser: { value: new THREE.Color(COLORS.NEON_BLUE) },
              textGlow: { value: new THREE.Color(COLORS.TEXT_OFF) },
              src: {
                value: new THREE.TextureLoader().load(
                  document.getElementById("atlasImg").src
                ),
              },
            },
            vertexShader: stageAdditiveShaders.vertexShader,
            fragmentShader: stageAdditiveShaders.fragmentShader,
            blending: THREE.AdditiveBlending,
            fog: !1,
            transparent: !0,
          })),
          (this.logo = new THREE.ShaderMaterial({
            uniforms: {
              src: {
                value: new THREE.TextureLoader().load(
                  document.getElementById("logotexImg").src
                ),
              },
            },
            vertexShader: flatShaders.vertexShader,
            fragmentShader: flatShaders.fragmentShader,
            fog: !1,
            transparent: !0,
          })),
          (this.logoadditive = new THREE.ShaderMaterial({
            uniforms: {
              src: {
                value: new THREE.TextureLoader().load(
                  document.getElementById("logotexImg").src
                ),
              },
            },
            vertexShader: flatShaders.vertexShader,
            fragmentShader: flatShaders.fragmentShader,
            depthTest: !1,
            blending: THREE.AdditiveBlending,
            fog: !1,
            transparent: !0,
          })),
          (this.mineMaterialred = new THREE.MeshStandardMaterial({
            roughness: 0.38,
            metalness: 0.48,
            color: new THREE.Color(COLORS.MINE_RED),
            emissive: new THREE.Color(COLORS.MINE_RED_EMISSION),
            envMap: new THREE.TextureLoader().load(
              "assets/img/mineenviro-red.jpg"
            ),
          })),
          (this.mineMaterialblue = new THREE.MeshStandardMaterial({
            roughness: 0.38,
            metalness: 0.48,
            color: new THREE.Color(COLORS.MINE_BLUE),
            emissive: new THREE.Color(COLORS.MINE_BLUE_EMISSION),
            envMap: new THREE.TextureLoader().load(
              "assets/img/mineenviro-blue.jpg"
            ),
          }));
      },
    }),
      AFRAME.registerComponent("materials", {
        schema: { name: { default: "" }, recursive: { default: !0 } },
        update: function () {
          if ("" !== this.data.name) {
            const material = this.system[this.data.name];
            if (!material)
              return void console.warn(
                `undefined material "${this.system[this.data.name]}"`
              );
            const mesh = this.el.getObject3D("mesh");
            mesh
              ? this.applyMaterial(mesh)
              : this.el.addEventListener(
                  "model-loaded",
                  this.applyMaterial.bind(this)
                );
          }
        },
        applyMaterial: function (obj) {
          const material = this.system[this.data.name];
          obj.detail && (obj = obj.detail.model),
            this.data.recursive
              ? obj.traverse((o) => {
                  "Mesh" === o.type && (o.material = material);
                })
              : (obj.material = material);
        },
      });
  },
  function () {
    const objLoader = new THREE.OBJLoader();
    AFRAME.registerSystem("mine-fragments-loader", {
      init: function () {
        this.fragments = null;
        const objData = document.getElementById("mineBrokenObj");
        objData.addEventListener("loaded", (evt) => {
          this.fragments = objLoader.parse(evt.target.data);
        });
      },
    });
  },
  function (module) {
    function transformPlane(
      particleIndex,
      geometry,
      originalArray,
      position,
      rotation,
      scale
    ) {
      const array = geometry.attributes.position.array,
        index = particleIndex * NUM_PLANE_POSITIONS;
      tri.vertices[0].set(
        originalArray[index + 0],
        originalArray[index + 1],
        originalArray[index + 2]
      ),
        tri.vertices[1].set(
          originalArray[index + 3],
          originalArray[index + 4],
          originalArray[index + 5]
        ),
        tri.vertices[2].set(
          originalArray[index + 6],
          originalArray[index + 7],
          originalArray[index + 8]
        ),
        null !== scale && tri.scale(scale.x, scale.y, scale.z),
        rotation &&
          (tri.rotateX(rotation.x),
          tri.rotateY(rotation.y),
          tri.rotateZ(rotation.z)),
        tri.vertices[0].add(position),
        tri.vertices[1].add(position),
        tri.vertices[2].add(position),
        (array[index + 0] = tri.vertices[0].x),
        (array[index + 1] = tri.vertices[0].y),
        (array[index + 2] = tri.vertices[0].z),
        (array[index + 3] = tri.vertices[1].x),
        (array[index + 4] = tri.vertices[1].y),
        (array[index + 5] = tri.vertices[1].z),
        (array[index + 6] = tri.vertices[2].x),
        (array[index + 7] = tri.vertices[2].y),
        (array[index + 8] = tri.vertices[2].z),
        tri.vertices[0].set(
          originalArray[index + 3],
          originalArray[index + 4],
          originalArray[index + 5]
        ),
        tri.vertices[1].set(
          originalArray[index + 6],
          originalArray[index + 7],
          originalArray[index + 8]
        ),
        tri.vertices[2].set(
          originalArray[index + 9],
          originalArray[index + 10],
          originalArray[index + 11]
        ),
        null !== scale && tri.scale(scale.x, scale.y, scale.z),
        rotation &&
          (tri.rotateX(rotation.x),
          tri.rotateY(rotation.y),
          tri.rotateZ(rotation.z)),
        tri.vertices[0].add(position),
        tri.vertices[1].add(position),
        tri.vertices[2].add(position),
        (array[index + 9] = tri.vertices[2].x),
        (array[index + 10] = tri.vertices[2].y),
        (array[index + 11] = tri.vertices[2].z),
        (geometry.attributes.position.needsUpdate = !0);
    }
    function copyArray(dest, src) {
      dest.length = 0;
      for (let i = 0; i < src.length; i++) dest[i] = src[i];
    }
    var _Mathfloor = Math.floor,
      _MathPI3 = Math.PI;
    const NUM_PLANE_POSITIONS = 12,
      BLENDINGS = {
        normal: THREE.NormalBlending,
        additive: THREE.AdditiveBlending,
        substractive: THREE.SubstractiveBlending,
        multiply: THREE.MultiplyBlending,
      },
      SHADERS = {
        flat: THREE.MeshBasicMaterial,
        lambert: THREE.MeshLambertMaterial,
        phong: THREE.MeshPhongMaterial,
        standard: THREE.MeshStandardMaterial,
      },
      OFFSCREEN_VEC3 = new THREE.Vector3(-99999, -99999, -99999);
    AFRAME.registerComponent("particleplayer", {
      schema: {
        blending: {
          default: "additive",
          oneOf: ["normal", "additive", "multiply", "substractive"],
        },
        color: { default: "#fff", type: "color" },
        count: { default: "100%" },
        delay: { default: 0, type: "int" },
        dur: { default: 1e3, type: "int" },
        img: { type: "selector" },
        interpolate: { default: !1 },
        loop: { default: "false" },
        on: { default: "init" },
        poolSize: { default: 5, type: "int" },
        protation: { type: "vec3" },
        pscale: { default: 1, type: "float" },
        scale: { default: 1, type: "float" },
        initialScale: { type: "vec3" },
        finalScale: { type: "vec3" },
        animateScale: { default: !1 },
        shader: {
          default: "flat",
          oneOf: ["flat", "lambert", "phong", "standard"],
        },
        src: { type: "selector" },
      },
      multiple: !0,
      init: function () {
        (this.frame = 0),
          (this.framedata = null),
          (this.indexPool = null),
          (this.lastFrame = 0),
          (this.material = null),
          (this.msPerFrame = 0),
          (this.numFrames = 0),
          (this.numParticles = 0),
          (this.originalVertexPositions = []),
          (this.particleCount = 0),
          (this.particleSystems = []),
          (this.protation = !1),
          (this.restPositions = []),
          (this.restRotations = []),
          (this.sprite_rotation = !1),
          (this.systems = null),
          (this.useRotation = !1),
          (this.useAge = !1),
          (this.scaleAnim = new THREE.Vector3()),
          (this.partScale = new THREE.Vector3(1, 1, 1));
      },
      update: function (oldData) {
        const data = this.data;
        if (data.src) {
          oldData.on !== data.on &&
            (oldData.on && this.el.removeEventListener(oldData.on, this.start),
            "play" !== data.on &&
              this.el.addEventListener(data.on, this.start.bind(this))),
            this.partScale.set(1, 1, 1),
            this.loadParticlesJSON(data.src, data.scale),
            (this.numFrames = this.framedata.length),
            (this.numParticles =
              0 < this.numFrames ? this.framedata[0].length : 0),
            (this.particleCount =
              "%" === data.count[data.count.length - 1]
                ? _Mathfloor((parseInt(data.count) * this.numParticles) / 100)
                : parseInt(data.count)),
            (this.particleCount = Math.min(
              this.numParticles,
              Math.max(0, this.particleCount)
            )),
            (this.msPerFrame = data.dur / this.numFrames),
            (this.indexPool = Array(this.numParticles));
          const materialParams = {
            color: new THREE.Color(data.color),
            side: THREE.DoubleSide,
            blending: BLENDINGS[data.blending],
            map: data.img ? new THREE.TextureLoader().load(data.img.src) : null,
            depthWrite: !1,
            opacity: data.opacity,
            transparent:
              !!data.img || "normal" !== data.blending || 1 > data.opacity,
          };
          (this.material =
            void 0 === SHADERS[data.shader]
              ? new SHADERS.flat(materialParams)
              : new SHADERS[data.shader](materialParams)),
            this.createParticles(data.poolSize),
            "init" === data.on && this.start();
        }
      },
      loadParticlesJSON: function (json, scale) {
        var alive;
        (this.restPositions.length = 0), (this.restRotations.length = 0);
        const jsonData = JSON.parse(json.data),
          frames = jsonData.frames,
          precision = jsonData.precision;
        (this.useRotation = jsonData.rotation),
          (this.useAge = jsonData.age !== void 0 && jsonData.age),
          (this.sprite_rotation = !1 !== jsonData.sprite_rotation && {
            x: jsonData.sprite_rotation[0] / precision,
            y: jsonData.sprite_rotation[1] / precision,
            z: jsonData.sprite_rotation[2] / precision,
          }),
          (this.framedata = Array(frames.length));
        for (let frameIndex = 0; frameIndex < frames.length; frameIndex++) {
          this.framedata[frameIndex] = Array(frames[frameIndex].length);
          for (
            let particleIndex = 0, rawP;
            particleIndex < frames[frameIndex].length;
            particleIndex++
          ) {
            (rawP = frames[frameIndex][particleIndex]), (alive = 0 !== rawP);
            let p = (this.framedata[frameIndex][particleIndex] = {
              position: alive
                ? {
                    x: (rawP[0] / precision) * scale,
                    y: (rawP[1] / precision) * scale,
                    z: (rawP[2] / precision) * scale,
                  }
                : null,
              alive: alive,
            });
            this.useRotation &&
              (p.rotation = alive
                ? {
                    x: rawP[3] / precision,
                    y: rawP[4] / precision,
                    z: rawP[5] / precision,
                  }
                : null),
              this.useAge && (p.age = alive ? rawP[6] / precision : 0),
              alive &&
                0 === frameIndex &&
                ((this.restPositions[particleIndex] = p.position
                  ? { x: p.position.y, y: p.position.y, z: p.position.z }
                  : null),
                (this.restRotations[particleIndex] = p.rotation
                  ? { x: p.rotation.y, y: p.rotation.y, z: p.rotation.z }
                  : null));
          }
        }
      },
      createParticles: (function () {
        const tempGeometries = [];
        return function (numParticleSystems) {
          const data = this.data;
          var loop = parseInt(this.data.loop);
          (this.particleSystems.length = 0),
            isNaN(loop) &&
              (loop = "true" === this.data.loop ? Number.MAX_VALUE : 0);
          for (let i = 0, particleSystem; i < numParticleSystems; i++) {
            particleSystem = {
              active: !1,
              activeParticleIndices: Array(this.particleCount),
              loopCount: 0,
              loopTotal: loop,
              mesh: null,
              time: 0,
            };
            const ratio = data.img ? data.img.width / data.img.height : 1;
            tempGeometries.length = 0;
            for (let p = 0, geometry; p < this.numParticles; p++)
              (geometry = new THREE.PlaneBufferGeometry(
                0.1 * ratio * data.pscale,
                0.1 * data.pscale
              )),
                !1 === this.sprite_rotation
                  ? (geometry.rotateX((this.data.protation.x * _MathPI3) / 180),
                    geometry.rotateY((this.data.protation.y * _MathPI3) / 180),
                    geometry.rotateZ((this.data.protation.z * _MathPI3) / 180))
                  : (geometry.rotateX(this.sprite_rotation.x),
                    geometry.rotateY(this.sprite_rotation.y),
                    geometry.rotateZ(this.sprite_rotation.z)),
                tempGeometries.push(geometry);
            let mergedBufferGeometry =
              THREE.BufferGeometryUtils.mergeBufferGeometries(tempGeometries);
            (particleSystem.mesh = new THREE.Mesh(
              mergedBufferGeometry,
              this.material
            )),
              (particleSystem.mesh.visible = !1),
              this.el.setObject3D(`particleplayer${i}`, particleSystem.mesh),
              copyArray(
                this.originalVertexPositions,
                mergedBufferGeometry.attributes.position.array
              );
            for (
              let i = 0;
              i < mergedBufferGeometry.attributes.position.array.length;
              i++
            )
              mergedBufferGeometry.attributes.position.array[i] = -99999;
            for (
              let i = 0;
              i < particleSystem.activeParticleIndices.length;
              i++
            )
              particleSystem.activeParticleIndices[i] = i;
            this.particleSystems.push(particleSystem);
          }
        };
      })(),
      start: function (evt) {
        0 < this.data.delay
          ? setTimeout(() => this.startAfterDelay(evt), this.data.delay)
          : this.startAfterDelay(evt);
      },
      startAfterDelay: function (evt) {
        var found = -1,
          oldestTime = 0,
          position = evt ? evt.detail.position : null,
          rotation = evt ? evt.detail.rotation : null,
          particleSystem;
        position instanceof THREE.Vector3 || (position = new THREE.Vector3()),
          rotation instanceof THREE.Euler || (rotation = new THREE.Euler());
        for (var i = 0; i < this.particleSystems.length; i++) {
          if (!1 === this.particleSystems[i].active) {
            found = i;
            break;
          }
          this.particleSystems[i].time > oldestTime &&
            ((found = i), (oldestTime = this.particleSystems[i].time));
        }
        if (-1 !== found)
          return (
            (particleSystem = this.particleSystems[found]),
            (particleSystem.active = !0),
            (particleSystem.loopCount = 1),
            (particleSystem.mesh.visible = !0),
            particleSystem.mesh.position.copy(position),
            particleSystem.mesh.rotation.copy(rotation),
            (particleSystem.time = 0),
            this.resetParticles(particleSystem),
            particleSystem
          );
      },
      doLoop: function (particleSystem) {
        particleSystem.loopCount++,
          (particleSystem.frame = -1),
          (particleSystem.time = 0),
          this.resetParticles(particleSystem);
      },
      resetParticle: function (particleSystem, particleIndex) {
        const geometry = particleSystem.mesh.geometry;
        this.restPositions[particleIndex]
          ? transformPlane(
              particleIndex,
              geometry,
              this.originalVertexPositions,
              this.restPositions[particleIndex],
              this.useRotation && this.restRotations[particleIndex],
              null
            )
          : transformPlane(
              particleIndex,
              geometry,
              this.originalVertexPositions,
              OFFSCREEN_VEC3,
              void 0,
              null
            );
      },
      resetParticles: function (particleSystem) {
        var i, rand;
        if (this.particleCount === this.numParticles) {
          for (i = 0; i < this.numParticles; i++)
            this.resetParticle(particleSystem, i);
          return;
        }
        const geometry = particleSystem.mesh.geometry;
        for (i = 0; i < this.numParticles; i++)
          i < this.particleCount &&
            transformPlane(
              particleSystem.activeParticleIndices[i],
              geometry,
              this.originalVertexPositions,
              OFFSCREEN_VEC3,
              void 0,
              null
            ),
            (this.indexPool[i] = i);
        for (i = 0; i < this.particleCount; i++)
          (rand = i + _Mathfloor(Math.random() * (this.numParticles - i))),
            (particleSystem.activeParticleIndices[i] = this.indexPool[rand]),
            (this.indexPool[rand] = this.indexPool[i]),
            this.resetParticle(
              particleSystem,
              particleSystem.activeParticleIndices[i]
            );
      },
      tick: (function () {
        const helperPositionVec3 = new THREE.Vector3();
        return function (time, delta) {
          var useRotation = this.useRotation,
            frame,
            fdata,
            fdataNext,
            frameTime,
            relTime,
            interpolate;
          const scaleSystem = this.data.animateScale && !this.useAge,
            scaleParticle = this.data.animateScale && this.useAge;
          for (
            let particleSystemIndex = 0, particleSystem;
            particleSystemIndex < this.particleSystems.length;
            particleSystemIndex++
          )
            if (
              ((particleSystem = this.particleSystems[particleSystemIndex]),
              !!particleSystem.active)
            ) {
              (interpolate =
                this.data.interpolate &&
                this.data.dur / this.numFrames > delta),
                (relTime = particleSystem.time / this.data.dur),
                (frame = relTime * this.numFrames),
                (fdata = this.framedata[_Mathfloor(frame)]),
                interpolate &&
                  ((frameTime = frame - _Mathfloor(frame)),
                  (fdataNext =
                    frame < this.numFrames - 1
                      ? this.framedata[_Mathfloor(frame) + 1]
                      : null)),
                scaleSystem &&
                  this.partScale.lerpVectors(
                    this.data.initialScale,
                    this.data.finalScale,
                    relTime
                  );
              for (
                let activeParticleIndex = 0;
                activeParticleIndex <
                particleSystem.activeParticleIndices.length;
                activeParticleIndex++
              ) {
                let particleIndex =
                    particleSystem.activeParticleIndices[activeParticleIndex],
                  rotation = useRotation && fdata[particleIndex].rotation;
                if (
                  (scaleParticle &&
                    this.partScale.lerpVectors(
                      this.data.initialScale,
                      this.data.finalScale,
                      fdata[particleIndex].age
                    ),
                  !fdata[particleIndex].alive)
                ) {
                  transformPlane(
                    particleIndex,
                    particleSystem.mesh.geometry,
                    this.originalVertexPositions,
                    OFFSCREEN_VEC3,
                    void 0,
                    null
                  );
                  continue;
                }
                interpolate && fdataNext && fdataNext[particleIndex].alive
                  ? (helperPositionVec3.lerpVectors(
                      fdata[particleIndex].position,
                      fdataNext[particleIndex].position,
                      frameTime
                    ),
                    transformPlane(
                      particleIndex,
                      particleSystem.mesh.geometry,
                      this.originalVertexPositions,
                      helperPositionVec3,
                      rotation,
                      this.partScale
                    ))
                  : transformPlane(
                      particleIndex,
                      particleSystem.mesh.geometry,
                      this.originalVertexPositions,
                      fdata[particleIndex].position,
                      rotation,
                      this.partScale
                    );
              }
              if (
                ((particleSystem.time += delta),
                particleSystem.time >= this.data.dur)
              ) {
                particleSystem.loopCount < particleSystem.loopTotal
                  ? (this.el.emit("particleplayerloop", null, !1),
                    this.doLoop(particleSystem))
                  : (this.el.emit("particleplayerfinished", null, !1),
                    (particleSystem.active = !1),
                    (particleSystem.mesh.visible = !1));
                continue;
              }
            }
        };
      })(),
      _transformPlane: transformPlane,
    });
    const tri = (function () {
      const tri = new THREE.Geometry();
      return (
        tri.vertices.push(new THREE.Vector3()),
        tri.vertices.push(new THREE.Vector3()),
        tri.vertices.push(new THREE.Vector3()),
        tri.faces.push(new THREE.Face3(0, 1, 2)),
        tri
      );
    })();
    module.exports.transformPlane = transformPlane;
  },
  function () {
    AFRAME.registerComponent("pause", {
      schema: { isPaused: { default: !1 } },
      update: function () {
        this.data.isPaused && this.el.isPlaying
          ? this.el.pause()
          : !this.data.isPaused &&
            !this.el.isPlaying &&
            this.el.sceneEl.isPlaying &&
            this.el.play();
      },
    });
  },
  function () {
    AFRAME.registerComponent("pauser", {
      schema: { enabled: { default: !0 } },
      init: function () {
        (this.pauseGame = this.pauseGame.bind(this)),
          document.addEventListener("visibilitychange", () => {
            "hidden" === document.visibilityState && this.pauseGame();
          });
      },
      pauseGame: function () {
        this.data.enabled && this.el.sceneEl.emit("pausegame", null, !1);
      },
    });
  },
  function (module, exports, __webpack_require__) {
    var SoundPool = __webpack_require__(71);
    AFRAME.registerSystem("play-sound", {
      init: function () {
        (this.lastSoundPlayed = ""),
          (this.lastSoundPlayedTime = 0),
          (this.pools = {});
      },
      createPool: function (sound, volume) {
        this.pools[sound] || (this.pools[sound] = new SoundPool(sound, volume));
      },
      playSound: function (sound, volume) {
        this.pools[sound] || this.createPool(sound, volume),
          this.pools[sound].play(),
          (this.lastSoundPlayed = sound),
          (this.lastSoundTime = this.el.time);
      },
    }),
      AFRAME.registerComponent("play-sound", {
        schema: {
          enabled: { default: !0 },
          event: { type: "string" },
          sound: { type: "string" },
          volume: { type: "number", default: 1 },
        },
        multiple: !0,
        init: function () {
          this.el.addEventListener(this.data.event, () => {
            this.data.enabled &&
              this.system.playSound(this.src, this.data.volume);
          });
        },
        update: function () {
          if (((this.src = this.data.sound), this.data.sound.startsWith("#")))
            try {
              this.src = document
                .querySelector(this.data.sound)
                .getAttribute("src");
            } catch (e) {
              console.log(e, this.data.sound);
            }
        },
      });
  },
  function () {
    AFRAME.registerComponent("raycaster-target", {
      schema: {
        bindToggle: { default: "" },
        depth: { type: "number" },
        height: { type: "number" },
        position: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
        rotation: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
        useBoxTarget: { default: !1 },
        width: { type: "number" },
      },
      init: (function () {
        var boxGeometry = { primitive: "box" },
          planeGeometry = { primitive: "plane" };
        return function () {
          var data = this.data,
            el = this.el,
            geometry,
            raycastTarget;
          (raycastTarget = document.createElement("a-entity")),
            raycastTarget.classList.add("raycasterTarget"),
            data.bindToggle
              ? raycastTarget.setAttribute(
                  "bind-toggle__raycastable",
                  data.bindToggle
                )
              : raycastTarget.setAttribute("data-raycastable", ""),
            data.useBoxTarget
              ? ((geometry = boxGeometry),
                (geometry.depth = data.depth),
                (geometry.height = data.height),
                (geometry.width = data.width))
              : ((geometry = planeGeometry),
                (geometry.height = data.height),
                (geometry.width = data.width)),
            raycastTarget.setAttribute("geometry", geometry),
            (raycastTarget.object3D.visible = !1),
            raycastTarget.object3D.position.copy(data.position),
            (raycastTarget.object3D.rotation.x = THREE.Math.degToRad(
              data.rotation.x
            )),
            (raycastTarget.object3D.rotation.y = THREE.Math.degToRad(
              data.rotation.y
            )),
            (raycastTarget.object3D.rotation.z = THREE.Math.degToRad(
              data.rotation.z
            )),
            el.appendChild(raycastTarget);
        };
      })(),
    });
  },
  function (module, __webpack_exports__, __webpack_require__) {
    "use strict";
    function truncate(str, length) {
      return str
        ? str.length >= length
          ? str.substring(0, length - 2) + ".."
          : str
        : "";
    }
    function debounce(func, wait, immediate) {
      var timeout;
      return function executedFunction() {
        let context = this,
          args = arguments,
          callNow = immediate && !timeout;
        clearTimeout(timeout),
          (timeout = setTimeout(function () {
            (timeout = null), immediate || func.apply(context, args);
          }, wait)),
          callNow && func.apply(context, args);
      };
    }
    function setIdQueryParam(id) {
      let search = window.location.search.toString();
      search
        ? search.match(idRe)
          ? (search = search.replace(idRe, `id=${id}`))
          : (search += `&id=${id}`)
        : (search = `?id=${id}`);
      let url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      (url += search), window.history.pushState({ path: url }, "", url);
    }
    Object.defineProperty(__webpack_exports__, "__esModule", { value: !0 });
    var __WEBPACK_IMPORTED_MODULE_0_preact__ = __webpack_require__(75);
    let scene;
    class Search extends __WEBPACK_IMPORTED_MODULE_0_preact__.a {
      constructor() {
        super(),
          (this.state = {
            open: !1,
            results: [],
            url: "supermedium.com/beatsaver-viewer",
          }),
          document.addEventListener("click", (evt) => {
            this.state.open &&
              (evt.target.closest("#searchResultsContainer") ||
                evt.target.closest("#searchInput") ||
                evt.target.closest("#searchToggle") ||
                this.setState({ open: !1 }));
          }),
          // document
          //   .getElementById("searchToggle")
          //   .addEventListener("click", () => {
          //     this.setState({ open: !this.state.open }),
          //       setTimeout(() => {
          //         document.getElementById("searchInput").focus();
          //       }, 15);
          //   }),
          scene.addEventListener("challengeset", (evt) => {
            const id = evt.detail;
            id &&
              (this.setState({
                url: `supermedium.com/beatsaver-viewer?id=${id}`,
              }),
              setIdQueryParam(id));
          }),
          (this.search = debounce(this.search.bind(this), 100)),
          (this.selectSong = this.selectSong.bind(this));
      }
      componentDidUpdate() {
        this.state.open &&
          document
            .getElementById("controlsDifficultyOptions")
            .classList.remove(".difficultyOptionsActive");
      }
      search(evt) {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "GET",
          `https://beatsaver.com/api/search/text/0?q=${evt.target.value}`
        ),
          xhr.addEventListener("load", () => {
            this.setState({ results: JSON.parse(xhr.responseText).docs }),
              ga("send", "event", "search", "search");
          }),
          xhr.send();
      }
      selectSong(evt) {
        scene.emit(
          "songselect",
          this.state.results[evt.target.closest(".searchResult").dataset.i]
        ),
          this.setState({ open: !1 }),
          ga("send", "pageview"),
          (document.getElementById("searchInput").value = "");
      }
      render() {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_preact__.b)(
          "div",
          { id: "search" },
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_preact__.b)(
            "div",
            {
              id: "searchResultsContainer",
              style: {
                display:
                  this.state.open && this.state.results.length
                    ? "flex"
                    : "none",
              },
            },
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_preact__.b)(
              "h3",
              null,
              "Search Results (beatsaver.com)"
            ),
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_preact__.b)(
              "ul",
              { id: "searchResults" },
              this.state.results.map((result, i) =>
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_preact__.b)(
                  "li",
                  {
                    class: "searchResult",
                    "data-id": result.key,
                    onClick: this.selectSong,
                    key: result.key,
                    "data-i": i,
                  },
                  __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_preact__.b)(
                    "img",
                    { src: `https://beatsaver.com${result.coverURL}` }
                  ),
                  __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_preact__.b)(
                    "p",
                    null,
                    (result.metadata.songSubName &&
                      truncate(result.metadata.songSubName, 20) + " \u2014 ") ||
                      "",
                    truncate(result.metadata.songName, 25)
                  )
                )
              )
            )
          ),
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_preact__.b)(
            "p",
            {
              id: "url",
              style: { display: this.state.open ? "none" : "block" },
            },
            this.state.url
          ),
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_preact__.b)(
            "input",
            {
              id: "searchInput",
              type: "search",
              placeholder: "Search BeatSaver songs...",
              onKeyUp: this.search,
              style: { display: this.state.open ? "flex" : "none" },
            }
          )
        );
      }
    }
    AFRAME.registerSystem("search", {
      init: function () {
        (scene = this.el),
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_preact__.c)(
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_preact__.b)(
              Search,
              null
            ),
            document.getElementById("controls")
          );
      },
    });
    const idRe = /id=[\d\w-]+/;
  },
  function () {
    function truncate(str, length) {
      return str
        ? str.length >= length
          ? str.substring(0, length - 2) + ".."
          : str
        : "";
    }
    function setTimeQueryParam(time) {
      time = parseInt(time);
      let search = window.location.search.toString();
      search
        ? search.match(timeRe)
          ? (search = search.replace(timeRe, `time=${time}`))
          : (search += `&time=${time}`)
        : (search = `?time=${time}`);
      let url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      (url += search), window.history.pushState({ path: url }, "", url);
    }
    function formatSeconds(time) {
      const hrs = ~~(time / 3600),
        mins = ~~((time % 3600) / 60),
        secs = ~~time % 60;
      let ret = "";
      return (
        0 < hrs && (ret += "" + hrs + ":" + (10 > mins ? "0" : "")),
        (ret += "" + mins + ":" + (10 > secs ? "0" : "")),
        (ret += "" + secs),
        ret
      );
    }
    const ONCE = { once: !0 };
    let queryParamTime = AFRAME.utils.getUrlParameter("time").trim();
    (queryParamTime =
      !queryParamTime || isNaN(queryParamTime)
        ? void 0
        : parseFloat(queryParamTime)),
      AFRAME.registerComponent("song-controls", {
        dependencies: ["song"],
        schema: {
          difficulty: { default: "" },
          songName: { default: "" },
          songSubName: { default: "" },
          songImage: { default: "" },
          isPlaying: { default: !1 },
        },
        init: function () {
          (this.song = this.el.components.song),
            (this.tick = AFRAME.utils.throttleTick(this.tick.bind(this), 100)),
            queryParamTime !== void 0 &&
              this.el.sceneEl.addEventListener(
                "songstartaudio",
                () => {
                  setTimeout(() => {
                    this.seek(queryParamTime);
                  }, 100);
                },
                ONCE
              );
          const analyser = document.getElementById("audioAnalyser");
          analyser.addEventListener("audioanalyserbuffersource", (evt) => {
            document.getElementById("songDuration").innerHTML = formatSeconds(
              evt.detail.buffer.duration
            );
          }),
            (this.songProgress = document.getElementById("songProgress"));
        },
        update: function () {
          this.controls &&
            (this.data.isPlaying
              ? document.body.classList.add("isPlaying")
              : document.body.classList.remove("isPlaying"),
            (document.getElementById("songImage").src = this.data.songImage),
            (document.getElementById("songName").innerHTML = truncate(
              this.data.songName,
              15
            )),
            document
              .getElementById("songName")
              .setAttribute("title", this.data.songName),
            (document.getElementById("songSubName").innerHTML = truncate(
              this.data.songSubName,
              18
            )),
            document
              .getElementById("songSubName")
              .setAttribute("title", this.data.songSubName),
            (document.getElementById("controlsDifficulty").innerHTML =
              this.data.difficulty));
        },
        play: function () {
          (this.controls = document.getElementById("controls")),
            (this.difficulty = document.getElementById("controlsDifficulty")),
            (this.difficultyOptions = document.getElementById(
              "controlsDifficultyOptions"
            )),
            (this.playhead = document.getElementById("playhead"));
          const timeline = (this.timeline =
              document.getElementById("timeline")),
            timelineHover = (this.timelineHover =
              document.getElementById("timelineHover")),
            timelineWidth = timeline.offsetWidth;
          this.el.sceneEl.addEventListener("challengeloadend", (evt) => {
            this.controls.classList.add("challengeLoaded");
            for (let i = 0; i < this.difficultyOptions.children.length; i++)
              this.difficultyOptions.children[i].style.display = "none";
            evt.detail.info.difficultyLevels.forEach((difficulty) => {
              const option = this.difficultyOptions.querySelector(
                `[data-difficulty="${difficulty._difficulty}"]`
              );
              option.style.display = "inline-block";
            });
          }),
            timeline.addEventListener("click", (event) => {
              if (this.song.source) {
                const marginLeft =
                    event.clientX - timeline.getBoundingClientRect().left,
                  percent = marginLeft / timeline.getBoundingClientRect().width,
                  time = percent * this.song.source.buffer.duration;
                this.seek(time), setTimeQueryParam(time);
              }
            }),
            timeline.addEventListener("mouseenter", () => {
              this.song.source &&
                timelineHover.classList.add("timelineHoverActive");
            }),
            timeline.addEventListener("mousemove", (evt) => {
              const marginLeft =
                  evt.clientX - timeline.getBoundingClientRect().left,
                percent = marginLeft / timeline.getBoundingClientRect().width;
              (timelineHover.style.left = marginLeft - 17 + "px"),
                (timelineHover.innerHTML = formatSeconds(
                  percent * this.song.source.buffer.duration
                ));
            }),
            timeline.addEventListener("mouseleave", () => {
              timelineHover.classList.remove("timelineHoverActive");
            }),
            document
              .getElementById("controlsPause")
              .addEventListener("click", () => {
                this.el.sceneEl.emit("pausegame", null, !1);
              }),
            this.difficulty.addEventListener("click", () => {
              this.controls.classList.toggle("difficultyOptionsActive");
            }),
            this.el.sceneEl.addEventListener("click", () => {
              this.controls.classList.remove("difficultyOptionsActive");
            }),
            this.difficultyOptions.addEventListener("click", (evt) => {
              (this.songProgress.innerHTML = formatSeconds(0)),
                (this.playhead.style.width = "0%"),
                this.el.sceneEl.emit(
                  "difficultyselect",
                  evt.target.dataset.difficulty,
                  !1
                ),
                this.controls.classList.remove("difficultyOptionsActive");
            }),
            document.addEventListener("click", (evt) => {
              if (
                !(
                  evt.target.closest("#volumeSliderContainer") ||
                  evt.target.closest("#controlsVolume")
                )
              ) {
                const slider = document.getElementById("volumeSliderContainer"),
                  active = slider.classList.contains("volumeActive");
                active && slider.classList.remove("volumeActive");
              }
            }),
            document
              .getElementById("controlsVolume")
              .addEventListener("click", () => {
                document
                  .getElementById("volumeSliderContainer")
                  .classList.toggle("volumeActive");
              }),
            document
              .getElementById("volumeSlider")
              .addEventListener("change", (evt) => {
                this.song.audioAnalyser.gainNode.gain.cancelScheduledValues(0),
                  (this.song.audioAnalyser.gainNode.gain.value =
                    evt.target.value),
                  document
                    .getElementById("beatContainer")
                    .components["beat-hit-sound"].setVolume(evt.target.value);
              });
        },
        tick: function () {
          this.song.isPlaying &&
            this.song.source &&
            (this.updatePlayhead(),
            (this.songProgress.innerHTML = formatSeconds(
              this.song.getCurrentTime()
            )));
        },
        seek: function (time) {
          this.data.isPlaying && this.song.stopAudio(),
            this.song.data.analyserEl.addEventListener(
              "audioanalyserbuffersource",
              (evt) => {
                this.song.source = evt.detail;
                this.song.startAudio(time),
                  this.el.components["beat-generator"].seek(time),
                  this.updatePlayhead();
              },
              ONCE
            ),
            this.song.audioAnalyser.refreshSource();
        },
        updatePlayhead: function () {
          const progress = Math.max(
            0,
            Math.min(
              100,
              100 *
                (this.song.getCurrentTime() / this.song.source.buffer.duration)
            )
          );
          this.playhead.style.width = progress + "%";
        },
      });
    const timeRe = /time=\d+/;
  },
  function () {
    AFRAME.registerComponent("song-progress-ring", {
      dependencies: ["geometry", "material"],
      schema: { enabled: { default: !1 } },
      init: function () {
        (this.tick = AFRAME.utils.throttleTick(this.tick.bind(this), 1e3)),
          (this.progress =
            this.el.getObject3D("mesh").material.uniforms.progress),
          this.el.sceneEl.addEventListener("cleargame", () => {
            this.progress.value = 0;
          });
      },
      update: function () {
        this.progress.value = 0;
      },
      updateRing: function () {
        const source = this.el.sceneEl.components.song.source;
        if (source) {
          const progress =
            this.el.sceneEl.components.song.getCurrentTime() /
            source.buffer.duration;
          this.progress.value = progress;
        }
      },
      tick: function () {
        this.data.enabled && this.updateRing();
      },
    });
  },
  function (module, exports, __webpack_require__) {
    const utils = __webpack_require__(1),
      ONCE = { once: !0 };
    let skipDebug = AFRAME.utils.getUrlParameter("skip");
    (skipDebug = skipDebug ? parseInt(skipDebug) / 1e3 : 0),
      AFRAME.registerComponent("song", {
        schema: {
          audio: { default: "" },
          analyserEl: { type: "selector", default: "#audioAnalyser" },
          difficulty: { default: "" },
          hasReceivedUserGesture: { default: !1 },
          isBeatsPreloaded: { default: !1 },
          isPaused: { default: !1 },
          isPlaying: { default: !1 },
        },
        init: function () {
          (this.analyserSetter = { buffer: !0 }),
            (this.audioAnalyser =
              this.data.analyserEl.components.audioanalyser),
            (this.context = this.audioAnalyser.context),
            (this.isPlaying = !1),
            (this.songLoadingIndicator = document.getElementById(
              "songLoadingIndicator"
            )),
            (this.songStartTime = 0),
            (this.audioAnalyser.gainNode.gain.value =
              document.getElementById("volumeSlider").value || 0.35),
            this.el.addEventListener(
              "gamemenurestart",
              this.onRestart.bind(this)
            );
        },
        update: function (oldData) {
          const data = this.data;
          this.el.sceneEl.isPlaying &&
            (oldData.isPaused &&
              !data.isPaused &&
              (-1 === navigator.userAgent.indexOf("Chrome")
                ? this.audioAnalyser.resumeContext()
                : (this.source.playbackRate.value = 1),
              (this.isPlaying = !0)),
            oldData.difficulty &&
              oldData.difficulty !== data.difficulty &&
              this.onRestart(),
            !oldData.isBeatsPreloaded &&
              this.data.isBeatsPreloaded &&
              this.source &&
              this.startAudio(),
            oldData.audio !== data.audio &&
              data.audio &&
              (this.el.sceneEl.emit("songprocessingstart", null, !1),
              this.getAudio()
                .then(() => {
                  this.el.sceneEl.emit("songprocessingfinish", null, !1);
                })
                .catch(console.error)),
            !oldData.isPaused &&
              data.isPaused &&
              (-1 === navigator.userAgent.indexOf("Chrome")
                ? this.audioAnalyser.suspendContext()
                : (this.source.playbackRate.value = 1e-9),
              (this.isPlaying = !1)));
        },
        pause: function () {
          this.data.isPlaying && this.audioAnalyser.suspendContext();
        },
        play: function () {
          this.data.isPlaying && this.audioAnalyser.resumeContext();
        },
        getAudio: function () {
          const data = this.data;
          return (
            (this.isPlaying = !1),
            new Promise((resolve) => {
              data.analyserEl.addEventListener(
                "audioanalyserbuffersource",
                (evt) => {
                  (this.source = evt.detail), resolve(this.source);
                },
                ONCE
              ),
                (this.analyserSetter.src = this.data.audio),
                data.analyserEl.setAttribute(
                  "audioanalyser",
                  this.analyserSetter
                );
            })
          );
        },
        stopAudio: function () {
          return this.source
            ? void (this.source.stop(),
              this.source.disconnect(),
              (this.source = null),
              (this.isPlaying = !1))
            : void console.warn("[song] Tried to stopAudio, but not playing.");
        },
        onRestart: function () {
          (this.isPlaying = !1), this.source && this.source.disconnect();
          const gain = this.audioAnalyser.gainNode.gain;
          gain.cancelScheduledValues(0),
            this.el.sceneEl.emit("songprocessingstart", null, !1),
            this.data.analyserEl.addEventListener(
              "audioanalyserbuffersource",
              (evt) => {
                (this.source = evt.detail),
                  this.el.sceneEl.emit("songprocessingfinish", null, !1),
                  this.data.isPlaying &&
                    this.data.isBeatsPreloaded &&
                    this.startAudio();
              },
              ONCE
            ),
            this.audioAnalyser.refreshSource();
        },
        startAudio: function (time) {
          const playTime = time || skipDebug || 0;
          (this.songStartTime = this.context.currentTime - playTime),
            this.source.start(0, playTime),
            (this.isPlaying = !0),
            this.el.emit("songstartaudio");
        },
        getCurrentTime: function () {
          return this.context.currentTime - this.songStartTime;
        },
      });
  },
  function () {
    AFRAME.registerComponent("stage-colors", {
      dependencies: ["background"],
      schema: { color: { default: "blue", oneOf: ["blue", "red"] } },
      init: function () {
        (this.colorCodes = [
          "off",
          "blue",
          "blue",
          "bluefade",
          "",
          "red",
          "red",
          "redfade",
        ]),
          this.el.addEventListener("cleargame", this.resetColors.bind(this));
      },
      setColor: function (target, code) {
        this.el.emit(`${target}color${this.colorCodes[code]}`, null, !1);
      },
      resetColors: function () {
        this.el.emit("bgcolorblue", null, !1),
          this.el.emit("tunnelcolorred", null, !1),
          this.el.emit("floorcolorred", null, !1),
          this.el.emit("leftlasercolorblue", null, !1),
          this.el.emit("rightlasercolorblue", null, !1);
      },
    });
  },
  function () {
    AFRAME.registerComponent("stage-lasers", {
      schema: { enabled: { default: !0 } },
      init: function () {
        (this.speed = 0),
          (this.lasers = [
            this.el.children[0].object3D,
            this.el.children[1].object3D,
            this.el.children[2].object3D,
          ]);
      },
      pulse: function (speed) {
        this.speed = speed / 8;
      },
      tick: function (time, delta) {
        if (0 !== this.speed)
          return (
            (delta /= 1e3),
            !this.data.enabled &&
            ((this.speed *= 0.97), 0.01 > Math.abs(this.speed))
              ? void (this.speed = 0)
              : void ((this.lasers[0].rotation.z += this.speed * delta),
                (this.lasers[1].rotation.z -= 1.01 * (this.speed * delta)),
                (this.lasers[2].rotation.z += 1.02 * (this.speed * delta)))
          );
      },
    });
  },
  function () {
    AFRAME.registerShader("stageShader", {
      schema: {
        color: { type: "vec3", is: "uniform", default: { x: 0, y: 0, z: 0 } },
        fogColor: {
          type: "vec3",
          is: "uniform",
          default: { x: 0, y: 0.48, z: 0.72 },
        },
        src: { type: "map", is: "uniform" },
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
  `,
    });
  },
  function () {
    AFRAME.registerComponent("stats-param", {
      init: function () {
        "true" === AFRAME.utils.getUrlParameter("stats") &&
          this.el.setAttribute("stats", "");
      },
    });
  },
  function () {
    AFRAME.registerComponent("sub-object", {
      schema: { from: { type: "selector" }, name: { type: "string" } },
      init: function () {
        var el = this.el,
          data = this.data;
        data.from.addEventListener("model-loaded", (evt) => {
          const model = evt.detail.model,
            subset = model.getObjectByName(data.name);
          el.setObject3D("mesh", subset.clone()),
            el.setAttribute("material", "shader", "flat"),
            el.emit("subobjectloaded", null, !1);
        });
      },
    });
  },
  function () {
    function findFontChar(chars, code) {
      for (var i = 0; i < chars.length; i++)
        if (chars[i].id === code) return chars[i];
      return null;
    }
    var _Mathfloor2 = Math.floor,
      KEYBOARDS = {
        supersaber: {
          wrapCount: 20,
          inputOffsetY: 8e-3,
          inputOffsetX: 0.08,
          img: "keyboard.png",
          hoverImg: "keyboard-hover.png",
          layout: [
            { key: "1", x: 0.014, y: 0.024, w: 0.094, h: 0.183 },
            { key: "2", x: 0.108, y: 0.024, w: 0.094, h: 0.183 },
            { key: "3", x: 0.203, y: 0.024, w: 0.095, h: 0.183 },
            { key: "4", x: 0.299, y: 0.024, w: 0.094, h: 0.183 },
            { key: "5", x: 0.394, y: 0.024, w: 0.093, h: 0.183 },
            { key: "6", x: 0.487, y: 0.024, w: 0.095, h: 0.183 },
            { key: "7", x: 0.583, y: 0.024, w: 0.093, h: 0.183 },
            { key: "8", x: 0.677, y: 0.024, w: 0.095, h: 0.183 },
            { key: "9", x: 0.772, y: 0.024, w: 0.093, h: 0.183 },
            { key: "0", x: 0.866, y: 0.024, w: 0.093, h: 0.183 },
            { key: "q", x: 0.014, y: 0.215, w: 0.094, h: 0.183 },
            { key: "w", x: 0.108, y: 0.215, w: 0.094, h: 0.183 },
            { key: "e", x: 0.203, y: 0.215, w: 0.095, h: 0.183 },
            { key: "r", x: 0.299, y: 0.215, w: 0.094, h: 0.183 },
            { key: "t", x: 0.394, y: 0.215, w: 0.093, h: 0.183 },
            { key: "y", x: 0.487, y: 0.215, w: 0.095, h: 0.183 },
            { key: "i", x: 0.677, y: 0.215, w: 0.095, h: 0.183 },
            { key: "u", x: 0.583, y: 0.215, w: 0.093, h: 0.183 },
            { key: "o", x: 0.772, y: 0.215, w: 0.093, h: 0.183 },
            { key: "p", x: 0.866, y: 0.215, w: 0.093, h: 0.183 },
            { key: "a", x: 0.063, y: 0.405, w: 0.094, h: 0.183 },
            { key: "s", x: 0.158, y: 0.405, w: 0.094, h: 0.183 },
            { key: "d", x: 0.253, y: 0.405, w: 0.095, h: 0.183 },
            { key: "f", x: 0.349, y: 0.405, w: 0.094, h: 0.183 },
            { key: "g", x: 0.443, y: 0.405, w: 0.093, h: 0.183 },
            { key: "h", x: 0.537, y: 0.405, w: 0.095, h: 0.183 },
            { key: "j", x: 0.633, y: 0.405, w: 0.092, h: 0.183 },
            { key: "k", x: 0.726, y: 0.405, w: 0.095, h: 0.183 },
            { key: "l", x: 0.821, y: 0.405, w: 0.093, h: 0.183 },
            { key: "z", x: 0.111, y: 0.598, w: 0.093, h: 0.181 },
            { key: "x", x: 0.205, y: 0.598, w: 0.095, h: 0.181 },
            { key: "c", x: 0.301, y: 0.598, w: 0.095, h: 0.181 },
            { key: "v", x: 0.396, y: 0.598, w: 0.093, h: 0.181 },
            { key: "b", x: 0.49, y: 0.598, w: 0.094, h: 0.181 },
            { key: "n", x: 0.585, y: 0.598, w: 0.094, h: 0.181 },
            { key: "m", x: 0.68, y: 0.598, w: 0.093, h: 0.181 },
            { key: "Delete", x: 0.777, y: 0.598, w: 0.137, h: 0.181 },
            { key: " ", x: 0.297, y: 0.788, w: 0.381, h: 0.201 },
            { key: "Escape", x: 0.013, y: 0.797, w: 0.137, h: 0.181 },
            { key: "Insert", x: 0.014, y: -1e-3, w: 0.01, h: 5e-3 },
          ],
        },
      };
    if ("undefined" == typeof AFRAME)
      throw new Error(
        "Component attempted to register before AFRAME was available."
      );
    var FontFactors = {
      roboto: 17,
      aileronsemibold: 20,
      dejavu: 20.5,
      exo2bold: 20,
      exo2semibold: 20.3,
      kelsonsans: 22.8,
      monoid: 19.5,
      mozillavr: 9.5,
      sourcecodepro: 20.3,
    };
    AFRAME.registerComponent("super-keyboard", {
      schema: {
        align: { default: "left", oneOf: ["left", "center", "right"] },
        blinkingSpeed: { type: "int", default: 400 },
        filters: { type: "array" },
        font: { default: "aileronsemibold" },
        hand: { type: "selector" },
        imagePath: { default: "." },
        injectToRaycasterObjects: { default: !0 },
        inputColor: { type: "color", default: "#6699ff" },
        interval: { type: "int", default: 50 },
        keyBgColor: { type: "color", default: "#000" },
        keyColor: { type: "color", default: "#6699ff" },
        keyHoverColor: { type: "color", default: "#1A407F" },
        keyPressColor: { type: "color", default: "#5290F6" },
        label: { type: "string", default: "" },
        labelColor: { type: "color", default: "#aaa" },
        maxLength: { type: "int", default: 0 },
        model: { default: "basic" },
        show: { default: !0 },
        value: { type: "string", default: "" },
        width: { default: 0.8 },
      },
      init: function () {
        this.el.addEventListener("click", this.click.bind(this)),
          (this.changeEventDetail = {}),
          (this.textInputObject = {}),
          (this.keys = null),
          (this.focused = !1),
          (this.keyHover = null),
          (this.prevCheckTime = null),
          (this.shift = !1),
          (this.rawValue = this.data.value),
          (this.defaultValue = this.data.value),
          (this.userFilterFunc = null),
          (this.intervalId = 0),
          (this.kbImg = document.createElement("a-entity")),
          this.kbImg.classList.add("keyboardRaycastable"),
          this.kbImg.classList.add("superKeyboardImage"),
          this.kbImg.addEventListener(
            "raycaster-intersected",
            this.hover.bind(this)
          ),
          this.kbImg.addEventListener(
            "raycaster-intersected-cleared",
            this.blur.bind(this)
          ),
          this.el.appendChild(this.kbImg),
          (this.label = document.createElement("a-entity")),
          this.label.setAttribute("text", {
            align: "center",
            font: this.data.font,
            baseline: "bottom",
            lineHeight: 40,
            shader: "msdf",
            negate: !0,
            value: this.data.label,
            color: this.data.labelColor,
            width: this.data.width,
            wrapCount: 30,
          }),
          this.el.appendChild(this.label),
          (this.textInput = document.createElement("a-entity")),
          this.textInput.setAttribute("mixin", "superKeyboardTextInput"),
          this.textInput.setAttribute("text", {
            align: this.data.align,
            font: this.data.font,
            lineHeight: 35,
            value: this.data.value,
            color: this.data.inputColor,
            width: this.data.width,
            wrapCount: 20,
          }),
          this.el.appendChild(this.textInput),
          (this.cursor = document.createElement("a-entity")),
          this.cursor.object3D.position.set(0, 0, 1e-3),
          this.cursor.setAttribute("material", {
            shader: "flat",
            color: this.data.inputColor,
          }),
          this.textInput.appendChild(this.cursor),
          (this.cursorUpdated = !1),
          (this.keyBgColor = new THREE.Color()),
          (this.keyHoverColor = new THREE.Color()),
          (this.keyPressColor = new THREE.Color());
        var self = this;
        document.addEventListener("keydown", function (ev) {
          if ("t" === ev.key) {
            for (
              var ss = "",
                s = "abcdefghijklmopqrstuvQWIEUTGASDLIGKBXACQWETL102394676457",
                l = _Mathfloor2(20 * Math.random()),
                i = 0;
              i < l;
              i++
            )
              ss += s[_Mathfloor2(Math.random() * s.length)];
            self.el.setAttribute("super-keyboard", { value: ss });
          }
        }),
          document.addEventListener("show", this.open.bind(this)),
          (this.hand = null),
          (this.handListenersSet = !1),
          (this.raycaster = null);
      },
      update: function (oldData) {
        var kbdata = KEYBOARDS[this.data.model],
          w = this.data.width,
          h = this.data.width / 2;
        if (void 0 === kbdata)
          return void console.error(
            'super-keyboard ERROR: model "' + this.data.model + '" undefined.'
          );
        oldData && this.defaultValue === oldData.defaultValue
          ? this.updateTextInput(this.filter(this.rawValue))
          : ((this.rawValue = this.data.value),
            (this.defaultValue = this.data.value),
            this.updateTextInput(this.filter(this.data.value))),
          (this.data.width !== oldData.width ||
            this.data.height !== oldData.height ||
            this.data.keyColor !== oldData.keyColor) &&
            (this.kbImg.setAttribute("geometry", {
              primitive: "plane",
              width: w,
              height: h,
            }),
            this.kbImg.setAttribute("material", {
              shader: "flat",
              src: this.data.imagePath + "/" + kbdata.img,
              color: this.data.keyColor,
              transparent: !0,
            })),
          (this.data.label !== oldData.label ||
            this.data.labelColor !== oldData.labelColor ||
            this.data.width !== oldData.width) &&
            (this.label.setAttribute("text", {
              value: this.data.label,
              color: this.data.labelColor,
              width: this.data.width,
            }),
            this.label.object3D.position.set(0, 0.35 * w, -0.02)),
          (this.data.width !== oldData.width ||
            this.data.keyBgColor !== oldData.keyBgColor) &&
            this.initKeyColorPlane();
        var inputx = "center" === this.data.align ? 0 : kbdata.inputOffsetX * w;
        "right" === this.data.align && (inputx *= -1),
          (this.data.font !== oldData.font ||
            this.data.inputColor !== oldData.inputColor ||
            this.data.width !== oldData.width ||
            this.data.align !== oldData.align) &&
            this.textInput.setAttribute("text", {
              font: this.data.font,
              color: this.data.inputColor,
              width: w,
              wrapCount: kbdata.wrapCount,
              align: this.data.align,
            });
        for (var i = 0, kdata; i < kbdata.layout.length; i++)
          (kdata = kbdata.layout[i]),
            "Insert" === kdata.key && (this.inputRect = kdata);
        this.textInput.object3D.position.set(
          inputx,
          w / 4 -
            ((this.inputRect.y + this.inputRect.h / 2) * w) / 2 +
            kbdata.inputOffsetY * w,
          2e-3
        ),
          this.data.width !== oldData.width &&
            this.cursor.setAttribute("geometry", {
              primitive: "plane",
              width: 0.03 * w,
              height: 0.01 * w,
            }),
          this.updateCursorPosition(),
          this.setupHand(),
          this.keyBgColor.set(this.data.keyBgColor),
          this.keyHoverColor.set(this.data.keyHoverColor),
          this.keyPressColor.set(this.data.keyPressColor),
          this.data.show ? this.open() : this.close();
      },
      tick: function (time) {
        var intersection;
        if (
          !(
            this.prevCheckTime && time - this.prevCheckTime < this.data.interval
          )
        ) {
          if (!this.prevCheckTime) return void (this.prevCheckTime = time);
          if (
            this.raycaster &&
            this.focused &&
            ((intersection = this.raycaster.getIntersection(this.kbImg)),
            !!intersection)
          )
            for (
              var uv = intersection.uv,
                keys = KEYBOARDS[this.data.model].layout,
                i = 0,
                k;
              i < keys.length;
              i++
            )
              if (
                ((k = keys[i]),
                uv.x > k.x &&
                  uv.x < k.x + k.w &&
                  1 - uv.y > k.y &&
                  1 - uv.y < k.y + k.h)
              ) {
                this.keyHover !== k &&
                  ((this.keyHover = k),
                  this.updateKeyColorPlane(
                    this.keyHover.key,
                    this.keyHoverColor
                  ));
                break;
              }
        }
      },
      play: function () {
        this.cursorUpdated && this.startBlinking();
      },
      pause: function () {
        this.stopBlinking();
      },
      initKeyColorPlane: function () {
        var kbdata = KEYBOARDS[this.data.model],
          keyColorPlane = (this.keyColorPlane =
            document.createElement("a-entity"));
        keyColorPlane.classList.add("superKeyboardKeyColorPlane"),
          (keyColorPlane.object3D.position.z = 1e-3),
          (keyColorPlane.object3D.visible = !1),
          keyColorPlane.setAttribute("geometry", {
            primitive: "plane",
            buffer: !1,
          }),
          keyColorPlane.setAttribute("material", {
            shader: "flat",
            color: this.data.keyBgColor,
            transparent: !0,
          }),
          kbdata.hoverImg &&
            keyColorPlane.setAttribute("material", {
              src: this.data.imagePath + "/" + kbdata.hoverImg,
            }),
          keyColorPlane.addEventListener(
            "componentinitialized",
            function (evt) {
              "material" === evt.detail.name &&
                (kbdata.hoverImg ||
                  (this.getObject3D("mesh").material.blending =
                    THREE.AdditiveBlending));
            }
          ),
          this.el.appendChild(keyColorPlane);
      },
      updateKeyColorPlane: function (key, color) {
        var kbdata = KEYBOARDS[this.data.model],
          keyColorPlane = this.keyColorPlane;
        if (!key) return void (keyColorPlane.object3D.visible = !1);
        for (var i = 0, kdata; i < kbdata.layout.length; i++)
          if (((kdata = kbdata.layout[i]), kdata.key === key)) {
            var w = this.data.width,
              h = this.data.width / 2,
              keyw = kdata.w * w,
              keyh = kdata.h * h;
            (keyColorPlane.object3D.scale.x = keyw),
              (keyColorPlane.object3D.scale.y = keyh),
              (keyColorPlane.object3D.position.x =
                kdata.x * w - w / 2 + keyw / 2),
              (keyColorPlane.object3D.position.y =
                (1 - kdata.y) * h - h / 2 - keyh / 2),
              keyColorPlane.getObject3D("mesh").material.color.copy(color);
            var geometry = keyColorPlane.getObject3D("mesh").geometry,
              uvSet = geometry.faceVertexUvs[0],
              kdataY = 1 - kdata.y;
            uvSet[0][0].set(kdata.x, kdataY),
              uvSet[0][1].set(kdata.x, kdataY - kdata.h),
              uvSet[0][2].set(kdata.x + kdata.w, kdataY),
              uvSet[1][0].set(kdata.x, kdataY - kdata.h),
              uvSet[1][1].set(kdata.x + kdata.w, kdataY - kdata.h),
              uvSet[1][2].set(kdata.x + kdata.w, kdataY),
              (geometry.uvsNeedUpdate = !0);
            break;
          }
        keyColorPlane.object3D.visible = !0;
      },
      setupHand: function () {
        if (
          (this.hand &&
            this.hand.ownRaycaster &&
            this.hand.removeAttribute("raycaster"),
          (this.hand = this.data.hand
            ? this.data.hand
            : document.querySelector(
                [
                  "[cursor]",
                  "[vive-controls]",
                  "[tracked-controls]",
                  "[oculus-touch-controls]",
                  "[windows-motion-controls]",
                  "[hand-controls]",
                  "[daydream-controls] [cursor] > [raycaster]",
                ].join(",")
              )),
          !this.hand)
        )
          console.error(
            'super-keyboard: no controller found. Add <a-entity> with controller or specify with super-keyboard="hand: #selectorToController".'
          );
        else {
          if (!this.hand.hasLoaded)
            return void this.hand.addEventListener(
              "loaded",
              this.setupHand.bind(this)
            );
          var raycaster = this.hand.components.raycaster,
            params = {};
          if (!raycaster)
            (this.hand.ownRaycaster = !0),
              (params.showLine = this.data.show),
              (params.enabled = this.data.show),
              this.data.injectToRaycasterObjects &&
                (params.objects = ".keyboardRaycastable"),
              this.hand.setAttribute("raycaster", params);
          else if (
            ((this.hand.ownRaycaster = !1), this.data.injectToRaycasterObjects)
          ) {
            var objs = raycaster.data.objects.split(",");
            -1 === objs.indexOf(".keyboardRaycastable") &&
              objs.push(".keyboardRaycastable"),
              (params.objects = objs.join(",").replace(/^,/, "")),
              this.hand.setAttribute("raycaster", params);
          }
          this.raycaster = this.hand.components.raycaster;
        }
      },
      filter: function (str) {
        if ("" === str) return "";
        for (var i = 0; i < this.data.filters.length; i++)
          switch (this.data.filters[i]) {
            case "custom": {
              this.userFilterFunc && (str = this.userFilterFunc(str));
              break;
            }
            case "allupper": {
              str = str.toUpperCase();
              break;
            }
            case "alllower": {
              str = str.toLowerCase();
              break;
            }
            case "title": {
              str = str
                .split(" ")
                .map(function (s) {
                  return s[0].toUpperCase() + s.substr(1);
                })
                .join(" ");
              break;
            }
            case "numbers": {
              str = str
                .split("")
                .filter(function (c) {
                  return !isNaN(parseInt(c)) || "." === c;
                })
                .join("");
              break;
            }
            case "first": {
              str = str[0].toUpperCase() + str.substr(1);
              break;
            }
            case "trim": {
              str = str.trim();
              break;
            }
          }
        return 0 < this.data.maxLength
          ? str.substr(0, this.data.maxLength)
          : str;
      },
      click: function () {
        if (this.keyHover) {
          switch (this.keyHover.key) {
            case "Enter": {
              this.accept();
              break;
            }
            case "Insert":
              return;
            case "Delete": {
              this.rawValue = this.rawValue.substr(0, this.rawValue.length - 1);
              var newValue = this.filter(this.rawValue);
              this.el.setAttribute("super-keyboard", "value", newValue),
                this.updateTextInput(newValue),
                (this.changeEventDetail.value = newValue),
                this.el.emit("superkeyboardchange", this.changeEventDetail);
              break;
            }
            case "Shift": {
              (this.shift = !this.shift),
                this.keyHover.el.setAttribute(
                  "material",
                  "color",
                  this.shift ? this.data.keyHoverColor : this.data.keyBgColor
                );
              break;
            }
            case "Escape": {
              this.dismiss();
              break;
            }
            default: {
              if (
                0 < this.data.maxLength &&
                this.rawValue.length > this.data.maxLength
              )
                break;
              this.rawValue += this.shift
                ? this.keyHover.key.toUpperCase()
                : this.keyHover.key;
              var newValue = this.filter(this.rawValue);
              this.el.setAttribute("super-keyboard", "value", newValue),
                this.updateTextInput(newValue),
                (this.changeEventDetail.value = newValue),
                this.el.emit("superkeyboardchange", this.changeEventDetail);
              break;
            }
          }
          this.updateKeyColorPlane(this.keyHover.key, this.keyPressColor);
          var self = this;
          setTimeout(function () {
            self.updateKeyColorPlane(self.keyHover.key, self.keyHoverColor);
          }, 100),
            this.updateCursorPosition();
        }
      },
      open: function () {
        (this.el.object3D.visible = !0),
          this.hand &&
            this.hand.ownRaycaster &&
            this.hand.setAttribute("raycaster", { showLine: !0, enabled: !0 });
      },
      close: function () {
        (this.el.object3D.visible = !1),
          this.hand &&
            this.hand.ownRaycaster &&
            this.hand.setAttribute("raycaster", { showLine: !1, enabled: !1 });
      },
      accept: function () {
        (this.el.object3D.visible = !1),
          this.hand &&
            this.hand.ownRaycaster &&
            this.hand.setAttribute("raycaster", { showLine: !1, enabled: !1 }),
          this.el.emit("superkeyboardinput", { value: this.data.value }),
          (this.data.show = !1);
      },
      dismiss: function () {
        (this.data.value = this.defaultValue),
          this.updateTextInput(),
          (this.el.object3D.visible = !1),
          this.hand &&
            this.hand.ownRaycaster &&
            this.hand.setAttribute("raycaster", { showLine: !1, enabled: !1 }),
          this.el.emit("superkeyboarddismiss"),
          (this.data.show = !1);
      },
      blur: function () {
        (this.focused = !1),
          this.keyHover &&
            "Shift" !== this.keyHover.key &&
            this.updateKeyColorPlane(this.keyHover.key, this.keyBgColor),
          (this.keyHover = null);
      },
      hover: function () {
        this.focused = !0;
      },
      startBlinking: function () {
        this.stopBlinking(),
          (this.intervalId = window.setInterval(
            this.blink.bind(this),
            this.data.blinkingSpeed
          ));
      },
      stopBlinking: function () {
        window.clearInterval(this.intervalId), (this.intervalId = 0);
      },
      blink: function () {
        this.cursor.object3D.visible = !this.cursor.object3D.visible;
      },
      setCustomFilter: function (f) {
        this.userFilterFunc = f;
      },
      addCustomModel: function (name, model) {
        name && (KEYBOARDS[name] = model);
      },
      updateCursorPosition: function () {
        var font = this.textInput.components.text.currentFont;
        if (!font) {
          var self = this;
          return (
            (this.cursor.object3D.visible = !1),
            void window.setTimeout(function () {
              self.updateCursorPosition(), self.startBlinking();
            }, 700)
          );
        }
        var w = this.data.width,
          kbdata = KEYBOARDS[this.data.model],
          posy = ((-this.inputRect.h / 2) * w) / 2.4 + kbdata.inputOffsetY * w,
          ratio =
            this.data.width / this.textInput.components.text.data.wrapCount,
          pos = 0,
          fontFactor = FontFactors[this.textInput.components.text.data.font];
        fontFactor === void 0 && (fontFactor = 20);
        for (var i = 0, char; i < this.data.value.length; i++)
          (char = findFontChar(font.chars, this.data.value.charCodeAt(i))),
            (pos += char.width + char.xadvance * (32 === char.id ? 2 : 1));
        "center" === this.data.align
          ? (pos = (0.0011 * (pos * ratio * fontFactor)) / 2 + 0.02 * w)
          : "left" === this.data.align
          ? ((pos = 0.0011 * (pos * ratio * fontFactor) + 0.02 * w),
            (pos -= w / 2))
          : "right" === this.data.align &&
            ((pos = 0.0011 * (-pos * ratio * fontFactor) - 0.02 * w),
            (pos += w / 2)),
          this.cursor.object3D.position.set(pos, posy, 1e-3),
          (this.cursorUpdated = !0);
      },
      updateTextInput: function (value) {
        (this.textInputObject.value = value || this.data.value),
          this.textInput.setAttribute("text", this.textInputObject);
      },
    });
  },
  function () {
    AFRAME.registerComponent("toggle-pause-play", {
      schema: { isPlaying: { default: !1 } },
      update: function () {
        const action = this.data.isPlaying ? "pause" : "play";
        parent.postMessage(
          JSON.stringify({ verify: "game-action", action }),
          "*"
        );
      },
    });
  },
  function () {
    var _Mathabs = Math.abs;
    const NUM_VALUES_PER_SEGMENT = 75;
    AFRAME.registerComponent("twister", {
      schema: {
        enabled: { default: !1 },
        twist: { default: 0 },
        vertices: { default: 4, type: "int" },
        count: { default: 12, type: "int" },
        positionIncrement: { default: 1.4 },
        radiusIncrement: { default: 0.4 },
        thickness: { default: 0.37 },
      },
      init: function () {
        (this.currentTwist = 0), (this.animate = !1), (this.geometry = null);
      },
      pulse: function (twist) {
        this.data.enabled &&
          ((twist =
            0 == twist
              ? 0.03 + 0.25 * Math.random()
              : Math.min(0.4 * twist, 0.4)),
          (twist *= 0.5 > Math.random() ? -1 : 1),
          this.el.setAttribute("twister", { twist: twist }));
      },
      update: function () {
        var radius = 6,
          segments = [];
        if (1e-3 < _Mathabs(this.data.twist - this.currentTwist))
          return void (this.animate = !0);
        this.clear();
        for (var i = 0; i < this.data.count; i++) {
          let segment = this.createSegment(radius);
          segment.translate(0, this.data.positionIncrement * i, 0),
            segments.push(segment),
            (radius += this.data.radiusIncrement);
        }
        this.geometry =
          THREE.BufferGeometryUtils.mergeBufferGeometries(segments);
        var material = this.el.sceneEl.systems.materials.stageNormal,
          mesh = new THREE.Mesh(this.geometry, material);
        this.el.object3D.add(mesh);
      },
      createSegment: function (radius) {
        const R = this.data.thickness;
        var points = [
            new THREE.Vector2(radius - R, R),
            new THREE.Vector2(radius - R, -R),
            new THREE.Vector2(radius + R, -R),
            new THREE.Vector2(radius + R, R),
            new THREE.Vector2(radius - R, R),
          ],
          geometry;
        geometry = new THREE.LatheBufferGeometry(points, this.data.vertices);
        for (let i = 0; i < geometry.attributes.uv.array.length; i += 2)
          (geometry.attributes.uv.array[i] = 0.77),
            (geometry.attributes.uv.array[i + 1] = 1e-3);
        return geometry;
      },
      clear: function () {
        this.el.object3D.remove(this.el.object3D.children[0]),
          this.geometry && this.geometry.dispose(),
          (this.geometry = new THREE.BufferGeometry());
      },
      tick: function (time, delta) {
        if (this.animate) {
          var posArray = this.geometry.attributes.position.array,
            rotation,
            x,
            y,
            sin,
            cos,
            diff;
          (delta *= 1e-3),
            (diff = (this.data.twist - this.currentTwist) * delta),
            (this.currentTwist += diff),
            (rotation = 3 * diff);
          for (var s = 0; s < this.data.count; s++) {
            for (var i = 0; i < NUM_VALUES_PER_SEGMENT; i += 3)
              (cos = Math.cos(rotation)),
                (sin = Math.sin(rotation)),
                (x = posArray[s * NUM_VALUES_PER_SEGMENT + i]),
                (y = posArray[s * NUM_VALUES_PER_SEGMENT + i + 2]),
                (posArray[s * NUM_VALUES_PER_SEGMENT + i] = x * cos - y * sin),
                (posArray[s * NUM_VALUES_PER_SEGMENT + i + 2] =
                  y * cos + x * sin);
            rotation *= 1.05;
          }
          (this.geometry.attributes.position.needsUpdate = !0),
            1e-3 > _Mathabs(this.data.twist - this.currentTwist) &&
              (this.animate = !1);
        }
      },
    });
  },
  function () {
    AFRAME.registerComponent("user-gesture", {
      play: function () {
        document.addEventListener("click", (evt) => {
          evt.target.closest("#controls") ||
            this.el.sceneEl.emit("usergesturereceive", null, !1);
        });
      },
    });
  },
  function () {
    var colorHelper = new THREE.Color();
    AFRAME.registerComponent("vertex-colors-buffer", {
      schema: { baseColor: { type: "color" }, itemSize: { default: 3 } },
      update: function (oldData) {
        var data = this.data,
          el = this.el,
          self = this,
          colors,
          i,
          geometry,
          mesh;
        if (((mesh = this.el.getObject3D("mesh")), !mesh || !mesh.geometry))
          return void el.addEventListener(
            "object3dset",
            function reUpdate(evt) {
              "mesh" !== evt.detail.type ||
                (el.removeEventListener("object3dset", reUpdate),
                self.update(oldData));
            }
          );
        if (((geometry = mesh.geometry), !geometry.attributes.position))
          return void console.warn("Geometry has no vertices", el);
        for (
          geometry.attributes.color ||
            geometry.addAttribute(
              "color",
              new THREE.BufferAttribute(
                new Float32Array(geometry.attributes.position.array.length),
                3
              )
            ),
            colors = geometry.attributes.color.array,
            colorHelper.set(data.baseColor),
            i = 0;
          i < colors.length;
          i += data.itemSize
        )
          (colors[i] = colorHelper.r),
            (colors[i + 1] = colorHelper.g),
            (colors[i + 2] = colorHelper.b);
        geometry.attributes.color.needsUpdate = !0;
      },
    });
  },
  function () {
    AFRAME.registerComponent("visible-raycastable", {
      schema: { default: !0 },
      update: function () {
        (this.el.object3D.visible = this.data),
          this.data
            ? this.el.setAttribute("raycastable", "")
            : this.el.removeAttribute("raycastable", "");
      },
    });
  },
  function (module, exports, __webpack_require__) {
    const COLORS = __webpack_require__(0),
      WALL_COLOR = new THREE.Color(COLORS.NEON_RED),
      WALL_BG = new THREE.Color(COLORS.SKY_RED);
    AFRAME.registerShader("wallShader", {
      schema: {
        iTime: { type: "time", is: "uniform" },
        hitRight: {
          type: "vec3",
          is: "uniform",
          default: { x: 0, y: 1, z: 0 },
        },
        hitLeft: { type: "vec3", is: "uniform", default: { x: 0, y: 0, z: 0 } },
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
`,
    });
  },
  function (module, __webpack_exports__, __webpack_require__) {
    "use strict";
    Object.defineProperty(__webpack_exports__, "__esModule", { value: !0 });
    var __WEBPACK_IMPORTED_MODULE_0__constants_beat__ = __webpack_require__(2);
    const CEILING_THICKNESS = 1.5;
    AFRAME.registerComponent("wall", {
      schema: {
        anticipationPosition: { default: 0 },
        durationSeconds: { default: 0 },
        height: { default: 1.3 },
        horizontalPosition: {
          default: "middleleft",
          oneOf: ["left", "middleleft", "middleright", "right"],
        },
        isCeiling: { default: !1 },
        speed: { default: 1 },
        warmupPosition: { default: 0 },
        width: { default: 1 },
      },
      horizontalPositions: {
        left: -0.75,
        middleleft: -0.25,
        middleright: 0.25,
        right: 0.75,
      },
      init: function () {
        this.maxZ = 10;
      },
      update: function () {
        const el = this.el,
          data = this.data,
          width = data.width,
          halfDepth = (data.durationSeconds * data.speed) / 2;
        return data.isCeiling
          ? (el.object3D.position.set(
              0,
              1.4 + CEILING_THICKNESS / 2,
              data.anticipationPosition + data.warmupPosition - halfDepth
            ),
            void el.object3D.scale.set(
              4,
              CEILING_THICKNESS,
              data.durationSeconds * data.speed
            ))
          : void (el.object3D.position.set(
              this.horizontalPositions[data.horizontalPosition] +
                width / 2 -
                0.25,
              data.height + 0.15,
              data.anticipationPosition + data.warmupPosition - halfDepth
            ),
            el.object3D.scale.set(
              width,
              2.5,
              data.durationSeconds * data.speed
            ));
      },
      pause: function () {
        (this.el.object3D.visible = !1),
          this.el.removeAttribute("data-collidable-head");
      },
      play: function () {
        (this.el.object3D.visible = !0),
          this.el.setAttribute("data-collidable-head", "");
      },
      tock: function (time, timeDelta) {
        const data = this.data,
          halfDepth = (data.durationSeconds * data.speed) / 2,
          position = this.el.object3D.position;
        if (
          ((this.el.object3D.visible = !0),
          position.z < data.anticipationPosition - halfDepth)
        ) {
          let newPositionZ =
            position.z +
            __WEBPACK_IMPORTED_MODULE_0__constants_beat__.a * (timeDelta / 1e3);
          position.z =
            newPositionZ < data.anticipationPosition - halfDepth
              ? newPositionZ
              : data.anticipationPosition - halfDepth;
        } else position.z += this.data.speed * (timeDelta / 1e3);
        return this.el.object3D.position.z > this.maxZ + halfDepth
          ? void this.returnToPool()
          : void 0;
      },
      returnToPool: function () {
        this.el.sceneEl.components.pool__wall.returnEntity(this.el),
          (this.el.object3D.position.z = 9999),
          this.el.pause(),
          this.el.removeAttribute("data-collidable-head");
      },
    });
  },
  function (module, __webpack_exports__, __webpack_require__) {
    "use strict";
    function jsonParseClean(str) {
      try {
        return (
          (str = str.trim()),
          (str = str.replace(/\u0000/g, "").replace(/\u\d\d\d\d/g, "")),
          (str = str.replace("\b", " ")),
          "{" !== str[0] && (str = str.substring(str.indexOf("{"), str.length)),
          jsonParseLoop(str, 0)
        );
      } catch (e) {
        return console.log(e, str), null;
      }
    }
    function jsonParseLoop(str, i) {
      try {
        return JSON.parse(str);
      } catch (e) {
        let match = e.toString().match(errorRe1);
        if ((match || (match = e.toString().match(errorRe2)), !match)) throw e;
        const errorPos = parseInt(match[1]);
        return (
          (str = str.replace(str[errorPos], "x")),
          (str = str.replace(str[errorPos + 1], "x")),
          (str = str.replace(str[errorPos + 2], "x")),
          jsonParseLoop(str, i + 1)
        );
      }
    }
    function getZipUrl(key, hash) {
      return `https://beatsaver.com/cdn/${key}/${hash}.zip`;
    }
    Object.defineProperty(__webpack_exports__, "__esModule", { value: !0 });
    var __WEBPACK_IMPORTED_MODULE_0_zip_loader__ = __webpack_require__(78);
    const utils = __webpack_require__(1),
      zipUrl = AFRAME.utils.getUrlParameter("zip");
    AFRAME.registerComponent("zip-loader", {
      schema: {
        id: {
          default: zipUrl ? "" : AFRAME.utils.getUrlParameter("id") || "4a6",
        },
        isSafari: { default: !1 },
        difficulty: { default: AFRAME.utils.getUrlParameter("difficulty") },
      },
      init: function () {
        (this.fetchedZip = ""), (this.hash = "");
      },
      init: function () {
        zipUrl && this.fetchZip(zipUrl);
      },
      update: function (oldData) {
        this.data.id &&
          ((oldData.id !== this.data.id ||
            oldData.difficulty !== this.data.difficulty) &&
            (this.fetchData(this.data.id),
            this.el.sceneEl.emit("cleargame", null, !1)),
          this.el.sceneEl.emit("challengeset", this.data.id));
      },
      play: function () {
        this.loadingIndicator = document.getElementById(
          "challengeLoadingIndicator"
        );
      },
      fetchData: async function (id) {
        const res = await fetch(`https://api.beatsaver.com/maps/id/${id}`);

        const data = await res.json();

        this.hash = data;
        // this.el.sceneEl.emit("challengeimage", `${data.versions[0].coverURL}`);
        // this.el.sceneEl.emit(
        //   "challengeimage",
        //   `https://beatsaver.com/${data.coverURL}`
        // ),
        let zipUrl = data.versions[0].downloadURL;
        this.fetchZip(zipUrl || getZipUrl(data.id, this.hash));
        // return fetch(`https://api.beatsaver.com/maps/id/${id}`, {
        //   mode: "no-cors",
        // }).then(async (res) => {
        //   const t = await res.json();
        //   console.log(t);
        //   await res.json().then((data) => {
        //     (this.hash = data.hash),
        //       this.el.sceneEl.emit(
        //         "challengeimage",
        //         `https://beatsaver.com${data.coverURL}`
        //       ),
        //       this.fetchZip(zipUrl || getZipUrl(this.data.id, this.hash));
        //   });
        // });
      },
      fetchZip: function (zipUrl) {
        if (this.data.isSafari) return;
        if (this.isFetching === zipUrl || this.fetchedZip === this.data.id)
          return;
        this.el.emit("challengeloadstart", this.data.id, !1),
          (this.isFetching = zipUrl);
        const loader = new __WEBPACK_IMPORTED_MODULE_0_zip_loader__.a(zipUrl);
        loader.on("error", () => {
          this.el.emit("challengeloaderror", null), (this.isFetching = "");
        }),
          loader.on("progress", (evt) => {
            (this.loadingIndicator.object3D.visible = !0),
              this.loadingIndicator.setAttribute(
                "material",
                "progress",
                evt.loaded / evt.total
              );
          }),
          loader.on("load", () => {
            this.fetchedZip = this.data.id;
            const event = {
              audio: "",
              beats: {},
              difficulties: null,
              id: this.data.id,
              image: "",
              info: "",
            };
            Object.keys(loader.files).forEach((filename) => {
              filename.endsWith("info.dat") &&
                (event.info = jsonParseClean(loader.extractAsText(filename)));
            }),
              (event.info.difficultyLevels =
                event.info._difficultyBeatmapSets[0]._difficultyBeatmaps);
            const difficulties = event.info.difficultyLevels;
            event.difficulty ||
              (event.difficulty =
                this.data.difficulty ||
                difficulties.sort((d) => d._diificultyRank)[0]._difficulty),
              (event.difficulties = difficulties
                .sort((d) => d._difficultyRank)
                .map((difficulty) => difficulty._difficulty)),
              Object.keys(loader.files).forEach((filename) => {
                for (let i = 0, difficulty; i < difficulties.length; i++)
                  (difficulty = difficulties[i]._difficulty),
                    filename.endsWith(`${difficulty}.dat`) &&
                      (event.beats[difficulty] =
                        loader.extractAsJSON(filename));
                this.data.id ||
                  (filename.endsWith("jpg") &&
                    (event.image = loader.extractAsBlobUrl(
                      filename,
                      "image/jpg"
                    )),
                  filename.endsWith("png") &&
                    (event.image = loader.extractAsBlobUrl(
                      filename,
                      "image/png"
                    ))),
                  (filename.endsWith("egg") || filename.endsWith("ogg")) &&
                    (event.audio = loader.extractAsBlobUrl(
                      filename,
                      "audio/ogg"
                    ));
              }),
              event.image ||
                this.data.id ||
                (event.image = "assets/img/logo.png"),
              (this.isFetching = ""),
              this.el.emit("challengeloadend", event, !1);
          }),
          loader.load();
      },
    });
    const errorRe1 = /column (\d+)/m,
      errorRe2 = /position (\d+)/m;
  },
  function (module, exports, __webpack_require__) {
    function requireAll(req) {
      req.keys().forEach(req);
    }
    (console.time = () => {}),
      (console.timeEnd = () => {}),
      __webpack_require__(4),
      __webpack_require__(5),
      __webpack_require__(3),
      __webpack_require__(6),
      __webpack_require__(7),
      __webpack_require__(8),
      __webpack_require__(9),
      __webpack_require__(10),
      __webpack_require__(11),
      __webpack_require__(12),
      __webpack_require__(13),
      __webpack_require__(15),
      __webpack_require__(14),
      __webpack_require__(16),
      requireAll(__webpack_require__(18)),
      requireAll(__webpack_require__(19)),
      __webpack_require__(17);
  },
  function (module) {
    module.exports = function SoundPool(src, volume) {
      var currSound = 0,
        pool = [],
        sound;
      return (
        (sound = new Audio(src)),
        (sound.volume = volume),
        pool.push(sound),
        {
          play: function () {
            (0 === pool[currSound].currentTime && pool[currSound].ended) ||
              ((sound = new Audio(src)),
              (sound.volume = volume),
              pool.push(sound),
              currSound++),
              (0 === pool[currSound].currentTime || pool[currSound].ended) &&
                pool[currSound].play(),
              (currSound = (currSound + 1) % pool.length);
          },
        }
      );
    };
  },
  function (module, exports, __webpack_require__) {
    function truncate(str, length) {
      return str
        ? str.length >= length
          ? str.substring(0, length - 2) + ".."
          : str
        : "";
    }
    __webpack_require__(1);
    const DEBUG_CHALLENGE = {
        author: "Superman",
        difficulty: "Expert",
        id: "31",
        image: "assets/img/molerat.jpg",
        songName: "Friday",
        songSubName: "Rebecca Black",
      },
      emptyChallenge = {
        audio: "",
        author: "",
        difficulty: "",
        id: "",
        image: "assets/img/logo.png",
        songName: "",
        songNameMedium: "",
        songNameShort: "",
        songSubName: "",
        songSubNameShort: "",
      },
      isSafari =
        -1 !== navigator.userAgent.toLowerCase().indexOf("safari") &&
        -1 === navigator.userAgent.toLowerCase().indexOf("chrome");
    AFRAME.registerState({
      initialState: {
        challenge: Object.assign(
          {
            hasLoadError: isSafari,
            isLoading: !1,
            isBeatsPreloaded: !1,
            loadErrorText: isSafari
              ? "iOS and Safari support coming soon! We need to convert songs to MP3 first."
              : "",
          },
          emptyChallenge
        ),
        hasReceivedUserGesture: !1,
        inVR: !1,
        isPaused: !1,
        isPlaying: !1,
        isSafari: isSafari,
        isSongBufferProcessing: !1,
      },
      handlers: {
        beatloaderpreloadfinish: (state) => {
          state.challenge.isBeatsPreloaded = !0;
        },
        challengeimage: (state, payload) => {
          state.challenge.image = payload;
        },
        challengeloadstart: (state) => {
          state.challenge.isLoading = !0;
        },
        challengeloadend: (state, payload) => {
          (state.challenge.audio = payload.audio),
            (state.challenge.author = payload.info._levelAuthorName),
            (state.challenge.difficulty &&
              -1 !==
                payload.difficulties.indexOf(state.challenge.difficulty)) ||
              (state.challenge.difficulty = payload.difficulty),
            (state.challenge.id = payload.id),
            payload.image && (state.challenge.image = payload.image),
            (state.challenge.isLoading = !1),
            (state.challenge.songName = payload.info._songName),
            (state.challenge.songNameShort = truncate(
              payload.info._songName,
              18
            )),
            (state.challenge.songNameMedium = truncate(
              payload.info._songName,
              30
            )),
            (state.challenge.songSubName = payload.info._songSubName),
            (state.challenge.songSubNameShort = truncate(
              payload.info._songSubName,
              21
            ));
        },
        challengeloaderror: (state) => {
          (state.challenge.hasLoadError = !0),
            (state.challenge.isLoading = !1),
            (state.challenge.loadErrorText = `Sorry, song ${AFRAME.utils.getUrlParameter(
              "id"
            )} was not found or ZIP requires CORS headers.`);
        },
        controllerconnected: (state, payload) => {
          state.controllerType = payload.name;
        },
        debugloading: (state) => {
          (DEBUG_CHALLENGE.id = "-1"),
            Object.assign(state.challenge, DEBUG_CHALLENGE),
            (state.challenge.isLoading = !0);
        },
        difficultyselect: (state, payload) => {
          (state.challenge.difficulty = payload),
            (state.challenge.isBeatsPreloaded = !1),
            (state.isPaused = !1);
        },
        gamemenuresume: (state) => {
          state.isPaused = !1;
        },
        gamemenurestart: (state) => {
          (state.challenge.isBeatsPreloaded = !1),
            (state.isPaused = !1),
            (state.isSongBufferProcessing = !0);
        },
        pausegame: (state) => {
          state.isPlaying && (state.isPaused = !0);
        },
        songprocessingfinish: (state) => {
          state.isSongBufferProcessing = !1;
        },
        songprocessingstart: (state) => {
          state.isSongBufferProcessing = !0;
        },
        songselect: (state, payload) => {
          (state.challenge = Object.assign(state.challenge, emptyChallenge)),
            (state.challenge.id = payload.key),
            (state.challenge.author = payload.metadata.levelAuthorName),
            (state.challenge.image = `https://beatsaver.com${payload.coverURL}`),
            (state.challenge.songName = payload.metadata.songName),
            (state.challenge.songNameShort = truncate(
              payload.metadata.songName,
              18
            )),
            (state.challenge.songNameMedium = truncate(
              payload.metadata.songName,
              30
            )),
            (state.challenge.songSubName = payload.metadata.songSubName),
            (state.challenge.songSubNameShort = truncate(
              payload.metadata.songSubName,
              21
            )),
            (state.challenge.isBeatsPreloaded = !1),
            (state.challenge.isLoading = !0),
            (state.hasReceivedUserGesture = !1),
            (state.isPaused = !1),
            (state.isSongBufferProcessing = !1);
        },
        usergesturereceive: (state) => {
          state.hasReceivedUserGesture = !0;
        },
        "enter-vr": (state) => {
          state.inVR = !0;
        },
        "exit-vr": (state) => {
          state.inVR = !1;
        },
      },
      computeState: (state) => {
        state.isPlaying =
          !state.isPaused &&
          !state.isSongBufferProcessing &&
          !state.challenge.isLoading &&
          state.hasReceivedUserGesture;
      },
    });
  },
  function (module, exports, __webpack_require__) {
    (exports = module.exports = __webpack_require__(74)()),
      exports.push([
        module.i,
        'html {\n  background: #111;\n}\n#controls {\n  align-items: center;\n  background: rgba(0,0,0,0.85);\n  border-radius: 10px;\n  bottom: 0;\n  display: none;\n  font-family: system-ui, BlinkMacSystemFont, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;\n  left: 0;\n  margin: 0 auto 10px auto;\n  padding: 10px;\n  position: fixed;\n  right: 0;\n  width: 675px;\n  z-index: 99999999;\n}\n#controls.challengeLoaded {\n  display: flex;\n}\n#controls #controlsVolume {\n  cursor: pointer;\n  padding: 3px 10px 0 3px;\n}\n#controls #controlsVolume img {\n  height: 20px;\n  width: 20px;\n}\n#controls #volumeSliderContainer {\n  background: rgba(0,0,0,0.85);\n  border-radius: 0 5px 5px 0;\n  bottom: 95px;\n  cursor: pointer;\n  display: none;\n  left: 9px;\n  padding-top: 4px;\n  position: absolute;\n  transform: rotate(-90deg);\n  z-index: 999999999;\n}\n#controls #volumeSliderContainer.volumeActive {\n  display: block;\n}\n#controls #volumeSliderContainer input {\n  cursor: pointer;\n  padding: 0;\n  width: 100px;\n}\n#controls #pause {\n  cursor: pointer;\n  display: flex;\n  padding-right: 10px;\n  opacity: 0;\n  transition: opacity 0.5s;\n}\n#controls #pause:hover #pauseSymbol {\n  fill: #d11769;\n}\n#controls #logo {\n  margin-right: 10px;\n}\n#controls #logo img {\n  height: 32px;\n  width: 32px;\n}\n#timeline {\n  height: 12px;\n  width: 160px;\n}\n#timeline:hover #timelineLine {\n  height: 6px;\n  background: #d11769;\n  margin-top: 3px;\n}\n#timelineLine {\n  height: 2px;\n  background: #8c1248;\n  border-radius: 2px;\n  margin-top: 5px;\n  transition: background 0.2s, height 0.2s, margin-top 0.2s;\n}\n#playhead {\n  background: #fafafa;\n  position: relative;\n  border-radius: 2px 0 0 2px;\n  height: 100%;\n  width: 0%;\n}\n#songTime {\n  color: #ccc;\n  font-size: 11px;\n  margin-left: 15px;\n  margin-right: 5px;\n  width: 70px;\n}\n#songInfoContainer {\n  align-items: center;\n  display: flex;\n}\n#songInfoContainer img {\n  height: 32px;\n  width: 32px;\n}\n#songInfoContainer p {\n  font-size: 13px;\n  margin: 0;\n  text-shadow: 0 0 4px #000;\n}\n#songInfoContainer #songInfo {\n  display: flex;\n  flex-direction: column;\n  padding-left: 10px;\n}\n#songInfoContainer #songName {\n  color: #ccc;\n  font-weight: bold;\n  font-size: 14px;\n}\n#songInfoContainer #songSubName {\n  color: #ff3690;\n}\n#songInfoContainer #songInfoSelect {\n  align-items: center;\n  display: flex;\n  position: absolute;\n  right: 0;\n}\n#songInfoContainer #controlsDifficulty {\n  border: 1px solid #ccc;\n  border-radius: 5px;\n  color: #ccc;\n  cursor: pointer;\n  padding: 5px 10px;\n  text-align: center;\n  transition: all 0.1s;\n}\n#songInfoContainer #controlsDifficulty p {\n  font-family: system-ui, BlinkMacSystemFont, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;\n}\n#songInfoContainer #controlsDifficulty:after {\n  content: \'\\25B2\';\n  display: inline-block;\n  font-size: 11px;\n  margin-left: 5px;\n}\n#songInfoContainer #controlsDifficulty:hover {\n  border-color: #fafafa;\n  color: #fafafa;\n}\n#controlsDifficultyOptions {\n  background: #020202;\n  border: 1px solid #ccc;\n  border-radius: 5px;\n  bottom: 50px;\n  color: #fafafa;\n  display: none;\n  flex-direction: column;\n  font-family: system-ui, BlinkMacSystemFont, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;\n  font-size: 13px;\n  list-style: none;\n  margin: 0;\n  opacity: 0;\n  padding: 0;\n  position: absolute;\n  right: 35px;\n  transition: all 0.2s;\n}\n#controlsDifficultyOptions li {\n  cursor: pointer;\n  padding: 10px;\n  min-width: 65px;\n  transition: all 0.1s;\n}\n#controlsDifficultyOptions li:hover {\n  color: #d11769;\n}\n.difficultyOptionsActive #controlsDifficultyOptions {\n  display: flex;\n  opacity: 1;\n}\n#timeline {\n  cursor: pointer;\n  position: relative;\n}\n#timelineHover {\n  bottom: 0;\n  color: #fafafa;\n  font-size: 11px;\n  display: none;\n  padding: 5px;\n  position: absolute;\n}\n#timelineHover.timelineHoverActive {\n  display: block;\n}\n#vrButton {\n  background: url("assets/img/enter-vr-button-background.png") no-repeat;\n  background-size: cover;\n  border: 0;\n  bottom: 25px;\n  cursor: pointer;\n  height: 23.5px;\n  position: absolute;\n  right: 30px;\n  width: 42px;\n  z-index: 9999999;\n}\n#vrButton.a-hidden {\n  visibility: hidden;\n}\n#vrButton:active {\n  border: 0;\n}\n#vrButton:hover {\n  background-position: 0 -25px;\n}\n.github-corner {\n  opacity: 1;\n  transition: 0.1s opacity;\n}\n.isPlaying .github-corner {\n  opacity: 0;\n}\n.isPlaying #controls,\n.isPlaying #controls #pause {\n  opacity: 1;\n}\n.a-loader-title {\n  display: none !important;\n}\n#songInfoContainer #searchToggle {\n  cursor: pointer;\n  height: 30px;\n  padding: 0 5px 0 15px;\n  width: 30px;\n}\n#songInfoContainer #searchToggle svg {\n  left: 5px;\n  position: relative;\n  top: 5px;\n  transform: scale(1.5);\n}\n#songInfoContainer #searchToggle g {\n  stroke: #ccc;\n  transition: stroke 0.1s;\n}\n#songInfoContainer #searchToggle:hover g {\n  stroke: #fafafa;\n}\n#search {\n  bottom: 50px;\n  align-items: center;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  left: 0;\n  margin: 0 auto;\n  position: absolute;\n  right: 0;\n  width: 400px;\n}\n#search input,\n#search #url {\n  background: rgba(0,0,0,0.85);\n  border-radius: 10px;\n  font-family: system-ui, BlinkMacSystemFont, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;\n  font-size: 14px;\n  position: relative;\n}\ninput {\n  border: 1px solid #ccc;\n  bottom: 15px;\n  color: #fafafa;\n  padding: 8px 20px;\n  width: 340px;\n}\n#url {\n  border: 1px solid #222;\n  color: #ccc;\n  padding: 8px 20px;\n  text-align: center;\n}\n#searchResultsContainer {\n  background: rgba(0,0,0,0.95);\n  border: 1px solid #ccc;\n  border-radius: 10px;\n  bottom: 25px;\n  display: flex;\n  flex-direction: column;\n  padding-bottom: 6px;\n  position: relative;\n  width: 340px;\n}\n#searchResultsContainer > h3 {\n  color: #ccc;\n  font-size: 14px;\n  text-align: center;\n  margin: 8px 0 0 0;\n}\n#searchResults {\n  display: flex;\n  flex-direction: column;\n  margin: 0;\n  max-height: 200px;\n  list-style: none;\n  overflow: auto;\n  padding: 5px 0 5px 0;\n}\n#searchResults li {\n  align-items: center;\n  background: none;\n  color: #ccc;\n  cursor: pointer;\n  display: flex;\n  font-size: 12px;\n  margin: 0;\n  margin-bottom: 2px;\n  padding-left: 10px;\n  transition: background 0.1s;\n}\n#searchResults li:hover {\n  background: rgba(30,30,30,0.95);\n}\n#searchResults li img {\n  height: 24px;\n  width: 24px;\n}\n#searchResults li p {\n  margin: 0;\n  padding-left: 10px;\n}\n#breakWarning {\n  background: #111;\n  border-radius: 5px;\n  color: #fafafa;\n  font-family: system-ui, BlinkMacSystemFont, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;\n  font-size: 18px;\n  left: 0;\n  margin: 0 15%;\n  opacity: 0.75;\n  padding: 10px;\n  position: fixed;\n  right: 0;\n  text-align: center;\n  z-index: 999999999;\n  top: 20px;\n}\n',
        "",
      ]);
  },
  function (module) {
    module.exports = function () {
      var list = [];
      return (
        (list.toString = function toString() {
          for (var result = [], i = 0, item; i < this.length; i++)
            (item = this[i]),
              item[2]
                ? result.push("@media " + item[2] + "{" + item[1] + "}")
                : result.push(item[1]);
          return result.join("");
        }),
        (list.i = function (modules, mediaQuery) {
          "string" == typeof modules && (modules = [[null, modules, ""]]);
          for (var alreadyImportedModules = {}, i = 0, id; i < this.length; i++)
            (id = this[i][0]),
              "number" == typeof id && (alreadyImportedModules[id] = !0);
          for (i = 0; i < modules.length; i++) {
            var item = modules[i];
            ("number" == typeof item[0] && alreadyImportedModules[item[0]]) ||
              (mediaQuery && !item[2]
                ? (item[2] = mediaQuery)
                : mediaQuery &&
                  (item[2] = "(" + item[2] + ") and (" + mediaQuery + ")"),
              list.push(item));
          }
        }),
        list
      );
    };
  },
  function (module, __webpack_exports__, __webpack_require__) {
    "use strict";
    function h(nodeName, attributes) {
      var children = EMPTY_CHILDREN,
        lastSimple,
        child,
        simple,
        i;
      for (i = arguments.length; 2 < i--; ) stack.push(arguments[i]);
      for (
        attributes &&
        null != attributes.children &&
        (!stack.length && stack.push(attributes.children),
        delete attributes.children);
        stack.length;

      )
        if ((child = stack.pop()) && void 0 !== child.pop)
          for (i = child.length; i--; ) stack.push(child[i]);
        else
          "boolean" == typeof child && (child = null),
            (simple = "function" != typeof nodeName) &&
              (null == child
                ? (child = "")
                : "number" == typeof child
                ? (child += "")
                : "string" != typeof child && (simple = !1)),
            simple && lastSimple
              ? (children[children.length - 1] += child)
              : children === EMPTY_CHILDREN
              ? (children = [child])
              : children.push(child),
            (lastSimple = simple);
      var p = new VNode();
      return (
        (p.nodeName = nodeName),
        (p.children = children),
        (p.attributes = null == attributes ? void 0 : attributes),
        (p.key = null == attributes ? void 0 : attributes.key),
        void 0 !== options.vnode && options.vnode(p),
        p
      );
    }
    function extend(obj, props) {
      for (var i in props) obj[i] = props[i];
      return obj;
    }
    function applyRef(ref, value) {
      null != ref &&
        ("function" == typeof ref ? ref(value) : (ref.current = value));
    }
    function enqueueRender(component) {
      !component._dirty &&
        (component._dirty = !0) &&
        1 == items.push(component) &&
        (options.debounceRendering || defer)(rerender);
    }
    function rerender() {
      for (var p; (p = items.pop()); ) p._dirty && renderComponent(p);
    }
    function isSameNodeType(node, vnode, hydrating) {
      return "string" == typeof vnode || "number" == typeof vnode
        ? void 0 !== node.splitText
        : "string" == typeof vnode.nodeName
        ? !node._componentConstructor && isNamedNode(node, vnode.nodeName)
        : hydrating || node._componentConstructor === vnode.nodeName;
    }
    function isNamedNode(node, nodeName) {
      return (
        node.normalizedNodeName === nodeName ||
        node.nodeName.toLowerCase() === nodeName.toLowerCase()
      );
    }
    function getNodeProps(vnode) {
      var props = extend({}, vnode.attributes);
      props.children = vnode.children;
      var defaultProps = vnode.nodeName.defaultProps;
      if (defaultProps !== void 0)
        for (var i in defaultProps)
          void 0 === props[i] && (props[i] = defaultProps[i]);
      return props;
    }
    function createNode(nodeName, isSvg) {
      var node = isSvg
        ? document.createElementNS("http://www.w3.org/2000/svg", nodeName)
        : document.createElement(nodeName);
      return (node.normalizedNodeName = nodeName), node;
    }
    function removeNode(node) {
      var parentNode = node.parentNode;
      parentNode && parentNode.removeChild(node);
    }
    function setAccessor(node, name, old, value, isSvg) {
      if (("className" === name && (name = "class"), "key" === name));
      else if ("ref" === name) applyRef(old, null), applyRef(value, node);
      else if ("class" === name && !isSvg) node.className = value || "";
      else if ("style" === name) {
        if (
          ((value && "string" != typeof value && "string" != typeof old) ||
            (node.style.cssText = value || ""),
          value && "object" == typeof value)
        ) {
          if ("string" != typeof old)
            for (var i in old) i in value || (node.style[i] = "");
          for (var i in value)
            node.style[i] =
              "number" == typeof value[i] && !1 === IS_NON_DIMENSIONAL.test(i)
                ? value[i] + "px"
                : value[i];
        }
      } else if ("dangerouslySetInnerHTML" === name)
        value && (node.innerHTML = value.__html || "");
      else if ("o" == name[0] && "n" == name[1]) {
        var useCapture = name !== (name = name.replace(/Capture$/, ""));
        (name = name.toLowerCase().substring(2)),
          value
            ? !old && node.addEventListener(name, eventProxy, useCapture)
            : node.removeEventListener(name, eventProxy, useCapture),
          ((node._listeners || (node._listeners = {}))[name] = value);
      } else if ("list" !== name && "type" !== name && !isSvg && name in node) {
        try {
          node[name] = null == value ? "" : value;
        } catch (e) {}
        (null == value || !1 === value) &&
          "spellcheck" != name &&
          node.removeAttribute(name);
      } else {
        var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ""));
        null == value || !1 === value
          ? ns
            ? node.removeAttributeNS(
                "http://www.w3.org/1999/xlink",
                name.toLowerCase()
              )
            : node.removeAttribute(name)
          : "function" != typeof value &&
            (ns
              ? node.setAttributeNS(
                  "http://www.w3.org/1999/xlink",
                  name.toLowerCase(),
                  value
                )
              : node.setAttribute(name, value));
      }
    }
    function eventProxy(e) {
      return this._listeners[e.type]((options.event && options.event(e)) || e);
    }
    function flushMounts() {
      for (var c; (c = mounts.shift()); )
        options.afterMount && options.afterMount(c),
          c.componentDidMount && c.componentDidMount();
    }
    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
      diffLevel++ ||
        ((isSvgMode = null != parent && void 0 !== parent.ownerSVGElement),
        (hydrating = null != dom && !("__preactattr_" in dom)));
      var ret = idiff(dom, vnode, context, mountAll, componentRoot);
      return (
        parent && ret.parentNode !== parent && parent.appendChild(ret),
        --diffLevel || ((hydrating = !1), !componentRoot && flushMounts()),
        ret
      );
    }
    function idiff(dom, vnode, context, mountAll, componentRoot) {
      var out = dom,
        prevSvgMode = isSvgMode;
      if (
        ((null == vnode || "boolean" == typeof vnode) && (vnode = ""),
        "string" == typeof vnode || "number" == typeof vnode)
      )
        return (
          dom &&
          void 0 !== dom.splitText &&
          dom.parentNode &&
          (!dom._component || componentRoot)
            ? dom.nodeValue != vnode && (dom.nodeValue = vnode)
            : ((out = document.createTextNode(vnode)),
              dom &&
                (dom.parentNode && dom.parentNode.replaceChild(out, dom),
                recollectNodeTree(dom, !0))),
          (out.__preactattr_ = !0),
          out
        );
      var vnodeName = vnode.nodeName;
      if ("function" == typeof vnodeName)
        return buildComponentFromVNode(dom, vnode, context, mountAll);
      if (
        ((isSvgMode =
          "svg" === vnodeName || ("foreignObject" !== vnodeName && isSvgMode)),
        (vnodeName += ""),
        (!dom || !isNamedNode(dom, vnodeName)) &&
          ((out = createNode(vnodeName, isSvgMode)), dom))
      ) {
        for (; dom.firstChild; ) out.appendChild(dom.firstChild);
        dom.parentNode && dom.parentNode.replaceChild(out, dom),
          recollectNodeTree(dom, !0);
      }
      var fc = out.firstChild,
        props = out.__preactattr_,
        vchildren = vnode.children;
      if (null == props) {
        props = out.__preactattr_ = {};
        for (var a = out.attributes, i = a.length; i--; )
          props[a[i].name] = a[i].value;
      }
      return (
        !hydrating &&
        vchildren &&
        1 === vchildren.length &&
        "string" == typeof vchildren[0] &&
        null != fc &&
        void 0 !== fc.splitText &&
        null == fc.nextSibling
          ? fc.nodeValue != vchildren[0] && (fc.nodeValue = vchildren[0])
          : ((vchildren && vchildren.length) || null != fc) &&
            innerDiffNode(
              out,
              vchildren,
              context,
              mountAll,
              hydrating || null != props.dangerouslySetInnerHTML
            ),
        diffAttributes(out, vnode.attributes, props),
        (isSvgMode = prevSvgMode),
        out
      );
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
      if (0 !== len)
        for (var i = 0; i < len; i++) {
          var _child = originalChildren[i],
            props = _child.__preactattr_,
            key =
              vlen && props
                ? _child._component
                  ? _child._component.__key
                  : props.key
                : null;
          null == key
            ? (props ||
                (void 0 === _child.splitText
                  ? isHydrating
                  : !isHydrating || _child.nodeValue.trim())) &&
              (children[childrenLen++] = _child)
            : (keyedLen++, (keyed[key] = _child));
        }
      if (0 !== vlen)
        for (var i = 0; i < vlen; i++) {
          (vchild = vchildren[i]), (child = null);
          var key = vchild.key;
          if (null != key)
            keyedLen &&
              void 0 !== keyed[key] &&
              ((child = keyed[key]), (keyed[key] = void 0), keyedLen--);
          else if (min < childrenLen)
            for (j = min; j < childrenLen; j++)
              if (
                void 0 !== children[j] &&
                isSameNodeType((c = children[j]), vchild, isHydrating)
              ) {
                (child = c),
                  (children[j] = void 0),
                  j === childrenLen - 1 && childrenLen--,
                  j === min && min++;
                break;
              }
          (child = idiff(child, vchild, context, mountAll)),
            (f = originalChildren[i]),
            child &&
              child !== dom &&
              child !== f &&
              (null == f
                ? dom.appendChild(child)
                : child === f.nextSibling
                ? removeNode(f)
                : dom.insertBefore(child, f));
        }
      if (keyedLen)
        for (var i in keyed)
          void 0 !== keyed[i] && recollectNodeTree(keyed[i], !1);
      for (; min <= childrenLen; )
        void 0 !== (child = children[childrenLen--]) &&
          recollectNodeTree(child, !1);
    }
    function recollectNodeTree(node, unmountOnly) {
      var component = node._component;
      component
        ? unmountComponent(component)
        : (null != node.__preactattr_ && applyRef(node.__preactattr_.ref, null),
          (!1 === unmountOnly || null == node.__preactattr_) &&
            removeNode(node),
          removeChildren(node));
    }
    function removeChildren(node) {
      for (node = node.lastChild; node; ) {
        var next = node.previousSibling;
        recollectNodeTree(node, !0), (node = next);
      }
    }
    function diffAttributes(dom, attrs, old) {
      for (var name in old)
        (attrs && null != attrs[name]) ||
          null == old[name] ||
          setAccessor(dom, name, old[name], (old[name] = void 0), isSvgMode);
      for (name in attrs)
        "children" === name ||
          "innerHTML" === name ||
          (name in old &&
            attrs[name] ===
              ("value" === name || "checked" === name
                ? dom[name]
                : old[name])) ||
          setAccessor(
            dom,
            name,
            old[name],
            (old[name] = attrs[name]),
            isSvgMode
          );
    }
    function createComponent(Ctor, props, context) {
      var i = recyclerComponents.length,
        inst;
      for (
        Ctor.prototype && Ctor.prototype.render
          ? ((inst = new Ctor(props, context)),
            Component.call(inst, props, context))
          : ((inst = new Component(props, context)),
            (inst.constructor = Ctor),
            (inst.render = doRender));
        i--;

      )
        if (recyclerComponents[i].constructor === Ctor)
          return (
            (inst.nextBase = recyclerComponents[i].nextBase),
            recyclerComponents.splice(i, 1),
            inst
          );
      return inst;
    }
    function doRender(props, state, context) {
      return this.constructor(props, context);
    }
    function setComponentProps(
      component,
      props,
      renderMode,
      context,
      mountAll
    ) {
      component._disable ||
        ((component._disable = !0),
        (component.__ref = props.ref),
        (component.__key = props.key),
        delete props.ref,
        delete props.key,
        "undefined" == typeof component.constructor.getDerivedStateFromProps &&
          (!component.base || mountAll
            ? component.componentWillMount && component.componentWillMount()
            : component.componentWillReceiveProps &&
              component.componentWillReceiveProps(props, context)),
        context &&
          context !== component.context &&
          (!component.prevContext &&
            (component.prevContext = component.context),
          (component.context = context)),
        !component.prevProps && (component.prevProps = component.props),
        (component.props = props),
        (component._disable = !1),
        0 !== renderMode &&
          (1 !== renderMode &&
          !1 === options.syncComponentUpdates &&
          component.base
            ? enqueueRender(component)
            : renderComponent(component, 1, mountAll)),
        applyRef(component.__ref, component));
    }
    function renderComponent(component, renderMode, mountAll, isChild) {
      if (!component._disable) {
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
          skip = !1,
          snapshot = previousContext,
          rendered,
          inst,
          cbase;
        if (
          (component.constructor.getDerivedStateFromProps &&
            ((state = extend(
              extend({}, state),
              component.constructor.getDerivedStateFromProps(props, state)
            )),
            (component.state = state)),
          isUpdate &&
            ((component.props = previousProps),
            (component.state = previousState),
            (component.context = previousContext),
            2 !== renderMode &&
            component.shouldComponentUpdate &&
            !1 === component.shouldComponentUpdate(props, state, context)
              ? (skip = !0)
              : component.componentWillUpdate &&
                component.componentWillUpdate(props, state, context),
            (component.props = props),
            (component.state = state),
            (component.context = context)),
          (component.prevProps =
            component.prevState =
            component.prevContext =
            component.nextBase =
              null),
          (component._dirty = !1),
          !skip)
        ) {
          (rendered = component.render(props, state, context)),
            component.getChildContext &&
              (context = extend(
                extend({}, context),
                component.getChildContext()
              )),
            isUpdate &&
              component.getSnapshotBeforeUpdate &&
              (snapshot = component.getSnapshotBeforeUpdate(
                previousProps,
                previousState
              ));
          var childComponent = rendered && rendered.nodeName,
            toUnmount,
            base;
          if ("function" == typeof childComponent) {
            var childProps = getNodeProps(rendered);
            (inst = initialChildComponent),
              inst &&
              inst.constructor === childComponent &&
              childProps.key == inst.__key
                ? setComponentProps(inst, childProps, 1, context, !1)
                : ((toUnmount = inst),
                  (component._component = inst =
                    createComponent(childComponent, childProps, context)),
                  (inst.nextBase = inst.nextBase || nextBase),
                  (inst._parentComponent = component),
                  setComponentProps(inst, childProps, 0, context, !1),
                  renderComponent(inst, 1, mountAll, !0)),
              (base = inst.base);
          } else
            (cbase = initialBase),
              (toUnmount = initialChildComponent),
              toUnmount && (cbase = component._component = null),
              (initialBase || 1 === renderMode) &&
                (cbase && (cbase._component = null),
                (base = diff(
                  cbase,
                  rendered,
                  context,
                  mountAll || !isUpdate,
                  initialBase && initialBase.parentNode,
                  !0
                )));
          if (
            initialBase &&
            base !== initialBase &&
            inst !== initialChildComponent
          ) {
            var baseParent = initialBase.parentNode;
            baseParent &&
              base !== baseParent &&
              (baseParent.replaceChild(base, initialBase),
              !toUnmount &&
                ((initialBase._component = null),
                recollectNodeTree(initialBase, !1)));
          }
          if (
            (toUnmount && unmountComponent(toUnmount),
            (component.base = base),
            base && !isChild)
          ) {
            for (
              var componentRef = component, t = component;
              (t = t._parentComponent);

            )
              (componentRef = t).base = base;
            (base._component = componentRef),
              (base._componentConstructor = componentRef.constructor);
          }
        }
        for (
          !isUpdate || mountAll
            ? mounts.push(component)
            : !skip &&
              (component.componentDidUpdate &&
                component.componentDidUpdate(
                  previousProps,
                  previousState,
                  snapshot
                ),
              options.afterUpdate && options.afterUpdate(component));
          component._renderCallbacks.length;

        )
          component._renderCallbacks.pop().call(component);
        diffLevel || isChild || flushMounts();
      }
    }
    function buildComponentFromVNode(dom, vnode, context, mountAll) {
      for (
        var c = dom && dom._component,
          originalComponent = c,
          oldDom = dom,
          isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
          isOwner = isDirectOwner,
          props = getNodeProps(vnode);
        c && !isOwner && (c = c._parentComponent);

      )
        isOwner = c.constructor === vnode.nodeName;
      return (
        c && isOwner && (!mountAll || c._component)
          ? (setComponentProps(c, props, 3, context, mountAll), (dom = c.base))
          : (originalComponent &&
              !isDirectOwner &&
              (unmountComponent(originalComponent), (dom = oldDom = null)),
            (c = createComponent(vnode.nodeName, props, context)),
            dom && !c.nextBase && ((c.nextBase = dom), (oldDom = null)),
            setComponentProps(c, props, 1, context, mountAll),
            (dom = c.base),
            oldDom &&
              dom !== oldDom &&
              ((oldDom._component = null), recollectNodeTree(oldDom, !1))),
        dom
      );
    }
    function unmountComponent(component) {
      options.beforeUnmount && options.beforeUnmount(component);
      var base = component.base;
      (component._disable = !0),
        component.componentWillUnmount && component.componentWillUnmount(),
        (component.base = null);
      var inner = component._component;
      inner
        ? unmountComponent(inner)
        : base &&
          (null != base.__preactattr_ && applyRef(base.__preactattr_.ref, null),
          (component.nextBase = base),
          removeNode(base),
          recyclerComponents.push(component),
          removeChildren(base)),
        applyRef(component.__ref, null);
    }
    function Component(props, context) {
      (this._dirty = !0),
        (this.context = context),
        (this.props = props),
        (this.state = this.state || {}),
        (this._renderCallbacks = []);
    }
    function render(vnode, parent, merge) {
      return diff(merge, vnode, {}, !1, parent, !1);
    }
    __webpack_require__.d(__webpack_exports__, "b", function () {
      return h;
    }),
      __webpack_require__.d(__webpack_exports__, "a", function () {
        return Component;
      }),
      __webpack_require__.d(__webpack_exports__, "c", function () {
        return render;
      });
    var VNode = function VNode() {},
      options = {},
      stack = [],
      EMPTY_CHILDREN = [],
      defer =
        "function" == typeof Promise
          ? Promise.resolve().then.bind(Promise.resolve())
          : setTimeout,
      IS_NON_DIMENSIONAL =
        /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i,
      items = [],
      mounts = [],
      diffLevel = 0,
      isSvgMode = !1,
      hydrating = !1,
      recyclerComponents = [];
    extend(Component.prototype, {
      setState: function setState(state, callback) {
        this.prevState || (this.prevState = this.state),
          (this.state = extend(
            extend({}, this.state),
            "function" == typeof state ? state(this.state, this.props) : state
          )),
          callback && this._renderCallbacks.push(callback),
          enqueueRender(this);
      },
      forceUpdate: function forceUpdate(callback) {
        callback && this._renderCallbacks.push(callback),
          renderComponent(this, 2);
      },
      render: function render() {},
    });
  },
  function (module, exports, __webpack_require__) {
    function addStylesToDom(styles, options) {
      for (var i = 0; i < styles.length; i++) {
        var item = styles[i],
          domStyle = stylesInDom[item.id];
        if (domStyle) {
          domStyle.refs++;
          for (var j = 0; j < domStyle.parts.length; j++)
            domStyle.parts[j](item.parts[j]);
          for (; j < item.parts.length; j++)
            domStyle.parts.push(addStyle(item.parts[j], options));
        } else {
          for (var parts = [], j = 0; j < item.parts.length; j++)
            parts.push(addStyle(item.parts[j], options));
          stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts };
        }
      }
    }
    function listToStyles(list, options) {
      for (var styles = [], newStyles = {}, i = 0; i < list.length; i++) {
        var item = list[i],
          id = options.base ? item[0] + options.base : item[0],
          css = item[1],
          media = item[2],
          sourceMap = item[3],
          part = { css: css, media: media, sourceMap: sourceMap };
        newStyles[id]
          ? newStyles[id].parts.push(part)
          : styles.push((newStyles[id] = { id: id, parts: [part] }));
      }
      return styles;
    }
    function insertStyleElement(options, style) {
      var target = getElement(options.insertInto);
      if (!target)
        throw new Error(
          "Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid."
        );
      var lastStyleElementInsertedAtTop =
        stylesInsertedAtTop[stylesInsertedAtTop.length - 1];
      if ("top" === options.insertAt)
        lastStyleElementInsertedAtTop
          ? lastStyleElementInsertedAtTop.nextSibling
            ? target.insertBefore(
                style,
                lastStyleElementInsertedAtTop.nextSibling
              )
            : target.appendChild(style)
          : target.insertBefore(style, target.firstChild),
          stylesInsertedAtTop.push(style);
      else if ("bottom" === options.insertAt) target.appendChild(style);
      else if ("object" == typeof options.insertAt && options.insertAt.before) {
        var nextSibling = getElement(options.insertAt.before, target);
        target.insertBefore(style, nextSibling);
      } else
        throw new Error(
          "[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n"
        );
    }
    function removeStyleElement(style) {
      if (null === style.parentNode) return !1;
      style.parentNode.removeChild(style);
      var idx = stylesInsertedAtTop.indexOf(style);
      0 <= idx && stylesInsertedAtTop.splice(idx, 1);
    }
    function createStyleElement(options) {
      var style = document.createElement("style");
      if (
        (void 0 === options.attrs.type && (options.attrs.type = "text/css"),
        void 0 === options.attrs.nonce)
      ) {
        var nonce = getNonce();
        nonce && (options.attrs.nonce = nonce);
      }
      return (
        addAttrs(style, options.attrs),
        insertStyleElement(options, style),
        style
      );
    }
    function createLinkElement(options) {
      var link = document.createElement("link");
      return (
        void 0 === options.attrs.type && (options.attrs.type = "text/css"),
        (options.attrs.rel = "stylesheet"),
        addAttrs(link, options.attrs),
        insertStyleElement(options, link),
        link
      );
    }
    function addAttrs(el, attrs) {
      Object.keys(attrs).forEach(function (key) {
        el.setAttribute(key, attrs[key]);
      });
    }
    function getNonce() {
      return __webpack_require__.nc;
    }
    function addStyle(obj, options) {
      var style, update, remove, result;
      if (options.transform && obj.css)
        if (
          ((result =
            "function" == typeof options.transform
              ? options.transform(obj.css)
              : options.transform.default(obj.css)),
          result)
        )
          obj.css = result;
        else return function () {};
      if (options.singleton) {
        var styleIndex = singletonCounter++;
        (style = singleton || (singleton = createStyleElement(options))),
          (update = applyToSingletonTag.bind(null, style, styleIndex, !1)),
          (remove = applyToSingletonTag.bind(null, style, styleIndex, !0));
      } else
        obj.sourceMap &&
        "function" == typeof URL &&
        "function" == typeof URL.createObjectURL &&
        "function" == typeof URL.revokeObjectURL &&
        "function" == typeof Blob &&
        "function" == typeof btoa
          ? ((style = createLinkElement(options)),
            (update = updateLink.bind(null, style, options)),
            (remove = function () {
              removeStyleElement(style),
                style.href && URL.revokeObjectURL(style.href);
            }))
          : ((style = createStyleElement(options)),
            (update = applyToTag.bind(null, style)),
            (remove = function () {
              removeStyleElement(style);
            }));
      return (
        update(obj),
        function updateStyle(newObj) {
          if (newObj) {
            if (
              newObj.css === obj.css &&
              newObj.media === obj.media &&
              newObj.sourceMap === obj.sourceMap
            )
              return;
            update((obj = newObj));
          } else remove();
        }
      );
    }
    function applyToSingletonTag(style, index, remove, obj) {
      var css = remove ? "" : obj.css;
      if (style.styleSheet) style.styleSheet.cssText = replaceText(index, css);
      else {
        var cssNode = document.createTextNode(css),
          childNodes = style.childNodes;
        childNodes[index] && style.removeChild(childNodes[index]),
          childNodes.length
            ? style.insertBefore(cssNode, childNodes[index])
            : style.appendChild(cssNode);
      }
    }
    function applyToTag(style, obj) {
      var css = obj.css,
        media = obj.media;
      if ((media && style.setAttribute("media", media), style.styleSheet))
        style.styleSheet.cssText = css;
      else {
        for (; style.firstChild; ) style.removeChild(style.firstChild);
        style.appendChild(document.createTextNode(css));
      }
    }
    function updateLink(link, options, obj) {
      var css = obj.css,
        sourceMap = obj.sourceMap,
        autoFixUrls = options.convertToAbsoluteUrls === void 0 && sourceMap;
      (options.convertToAbsoluteUrls || autoFixUrls) && (css = fixUrls(css)),
        sourceMap &&
          (css +=
            "\n/*# sourceMappingURL=data:application/json;base64," +
            btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) +
            " */");
      var blob = new Blob([css], { type: "text/css" }),
        oldSrc = link.href;
      (link.href = URL.createObjectURL(blob)),
        oldSrc && URL.revokeObjectURL(oldSrc);
    }
    var stylesInDom = {},
      isOldIE = (function (fn) {
        var memo;
        return function () {
          return (
            "undefined" == typeof memo && (memo = fn.apply(this, arguments)),
            memo
          );
        };
      })(function () {
        return window && document && document.all && !window.atob;
      }),
      getTarget = function (target, parent) {
        return parent
          ? parent.querySelector(target)
          : document.querySelector(target);
      },
      getElement = (function () {
        var memo = {};
        return function (target, parent) {
          if ("function" == typeof target) return target();
          if ("undefined" == typeof memo[target]) {
            var styleTarget = getTarget.call(this, target, parent);
            if (
              window.HTMLIFrameElement &&
              styleTarget instanceof window.HTMLIFrameElement
            )
              try {
                styleTarget = styleTarget.contentDocument.head;
              } catch (e) {
                styleTarget = null;
              }
            memo[target] = styleTarget;
          }
          return memo[target];
        };
      })(),
      singleton = null,
      singletonCounter = 0,
      stylesInsertedAtTop = [],
      fixUrls = __webpack_require__(77);
    module.exports = function (list, options) {
      if ("undefined" != typeof DEBUG && DEBUG && "object" != typeof document)
        throw new Error(
          "The style-loader cannot be used in a non-browser environment"
        );
      (options = options || {}),
        (options.attrs = "object" == typeof options.attrs ? options.attrs : {}),
        options.singleton ||
          "boolean" == typeof options.singleton ||
          (options.singleton = isOldIE()),
        options.insertInto || (options.insertInto = "head"),
        options.insertAt || (options.insertAt = "bottom");
      var styles = listToStyles(list, options);
      return (
        addStylesToDom(styles, options),
        function update(newList) {
          for (var mayRemove = [], i = 0; i < styles.length; i++) {
            var item = styles[i],
              domStyle = stylesInDom[item.id];
            domStyle.refs--, mayRemove.push(domStyle);
          }
          if (newList) {
            var newStyles = listToStyles(newList, options);
            addStylesToDom(newStyles, options);
          }
          for (var i = 0, domStyle; i < mayRemove.length; i++)
            if (((domStyle = mayRemove[i]), 0 === domStyle.refs)) {
              for (var j = 0; j < domStyle.parts.length; j++)
                domStyle.parts[j]();
              delete stylesInDom[domStyle.id];
            }
        }
      );
    };
    var replaceText = (function () {
      var textStore = [];
      return function (index, replacement) {
        return (
          (textStore[index] = replacement), textStore.filter(Boolean).join("\n")
        );
      };
    })();
  },
  function (module) {
    module.exports = function (css) {
      var location = "undefined" != typeof window && window.location;
      if (!location) throw new Error("fixUrls requires window.location");
      if (!css || "string" != typeof css) return css;
      var baseUrl = location.protocol + "//" + location.host,
        currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/"),
        fixedCss = css.replace(
          /url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi,
          function (fullMatch, origUrl) {
            var unquotedOrigUrl = origUrl
              .trim()
              .replace(/^"(.*)"$/, function (o, $1) {
                return $1;
              })
              .replace(/^'(.*)'$/, function (o, $1) {
                return $1;
              });
            if (
              /^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(
                unquotedOrigUrl
              )
            )
              return fullMatch;
            var newUrl;
            return (
              (newUrl =
                0 === unquotedOrigUrl.indexOf("//")
                  ? unquotedOrigUrl
                  : 0 === unquotedOrigUrl.indexOf("/")
                  ? baseUrl + unquotedOrigUrl
                  : currentDir + unquotedOrigUrl.replace(/^\.\//, "")),
              "url(" + JSON.stringify(newUrl) + ")"
            );
          }
        );
      return fixedCss;
    };
  },
  function (module, __webpack_exports__) {
    "use strict";
    /*!
     * ZipLoader
     * (c) 2017 @yomotsu
     * Released under the MIT License.
     *
     * ZipLoader uses the library pako released under the MIT license :
     * https://github.com/nodeca/pako/blob/master/LICENSE
     */ function zswap32(q) {
      return (
        (255 & (q >>> 24)) +
        (65280 & (q >>> 8)) +
        ((65280 & q) << 8) +
        ((255 & q) << 24)
      );
    }
    function InflateState() {
      (this.mode = 0),
        (this.last = !1),
        (this.wrap = 0),
        (this.havedict = !1),
        (this.flags = 0),
        (this.dmax = 0),
        (this.check = 0),
        (this.total = 0),
        (this.head = null),
        (this.wbits = 0),
        (this.wsize = 0),
        (this.whave = 0),
        (this.wnext = 0),
        (this.window = null),
        (this.hold = 0),
        (this.bits = 0),
        (this.length = 0),
        (this.offset = 0),
        (this.extra = 0),
        (this.lencode = null),
        (this.distcode = null),
        (this.lenbits = 0),
        (this.distbits = 0),
        (this.ncode = 0),
        (this.nlen = 0),
        (this.ndist = 0),
        (this.have = 0),
        (this.next = null),
        (this.lens = new common.Buf16(320)),
        (this.work = new common.Buf16(288)),
        (this.lendyn = null),
        (this.distdyn = null),
        (this.sane = 0),
        (this.back = 0),
        (this.was = 0);
    }
    function inflateResetKeep(strm) {
      var state;
      return strm && strm.state
        ? ((state = strm.state),
          (strm.total_in = strm.total_out = state.total = 0),
          (strm.msg = ""),
          state.wrap && (strm.adler = 1 & state.wrap),
          (state.mode = HEAD),
          (state.last = 0),
          (state.havedict = 0),
          (state.dmax = 32768),
          (state.head = null),
          (state.hold = 0),
          (state.bits = 0),
          (state.lencode = state.lendyn = new common.Buf32(ENOUGH_LENS$1)),
          (state.distcode = state.distdyn = new common.Buf32(ENOUGH_DISTS$1)),
          (state.sane = 1),
          (state.back = -1),
          Z_OK)
        : Z_STREAM_ERROR;
    }
    function inflateReset(strm) {
      var state;
      return strm && strm.state
        ? ((state = strm.state),
          (state.wsize = 0),
          (state.whave = 0),
          (state.wnext = 0),
          inflateResetKeep(strm))
        : Z_STREAM_ERROR;
    }
    function inflateReset2(strm, windowBits) {
      var wrap, state;
      return strm && strm.state
        ? ((state = strm.state),
          0 > windowBits
            ? ((wrap = 0), (windowBits = -windowBits))
            : ((wrap = (windowBits >> 4) + 1),
              48 > windowBits && (windowBits &= 15)),
          windowBits && (8 > windowBits || 15 < windowBits))
          ? Z_STREAM_ERROR
          : (null !== state.window &&
              state.wbits !== windowBits &&
              (state.window = null),
            (state.wrap = wrap),
            (state.wbits = windowBits),
            inflateReset(strm))
        : Z_STREAM_ERROR;
    }
    function inflateInit2(strm, windowBits) {
      var ret, state;
      return strm
        ? ((state = new InflateState()),
          (strm.state = state),
          (state.window = null),
          (ret = inflateReset2(strm, windowBits)),
          ret !== Z_OK && (strm.state = null),
          ret)
        : Z_STREAM_ERROR;
    }
    function fixedtables(state) {
      if (virgin) {
        var sym;
        for (
          lenfix = new common.Buf32(512),
            distfix = new common.Buf32(32),
            sym = 0;
          144 > sym;

        )
          state.lens[sym++] = 8;
        for (; 256 > sym; ) state.lens[sym++] = 9;
        for (; 280 > sym; ) state.lens[sym++] = 7;
        for (; 288 > sym; ) state.lens[sym++] = 8;
        for (
          inftrees(LENS$1, state.lens, 0, 288, lenfix, 0, state.work, {
            bits: 9,
          }),
            sym = 0;
          32 > sym;

        )
          state.lens[sym++] = 5;
        inftrees(DISTS$1, state.lens, 0, 32, distfix, 0, state.work, {
          bits: 5,
        }),
          (virgin = !1);
      }
      (state.lencode = lenfix),
        (state.lenbits = 9),
        (state.distcode = distfix),
        (state.distbits = 5);
    }
    function updatewindow(strm, src, end, copy) {
      var state = strm.state,
        dist;
      return (
        null === state.window &&
          ((state.wsize = 1 << state.wbits),
          (state.wnext = 0),
          (state.whave = 0),
          (state.window = new common.Buf8(state.wsize))),
        copy >= state.wsize
          ? (common.arraySet(
              state.window,
              src,
              end - state.wsize,
              state.wsize,
              0
            ),
            (state.wnext = 0),
            (state.whave = state.wsize))
          : ((dist = state.wsize - state.wnext),
            dist > copy && (dist = copy),
            common.arraySet(state.window, src, end - copy, dist, state.wnext),
            (copy -= dist),
            copy
              ? (common.arraySet(state.window, src, end - copy, copy, 0),
                (state.wnext = copy),
                (state.whave = state.wsize))
              : ((state.wnext += dist),
                state.wnext === state.wsize && (state.wnext = 0),
                state.whave < state.wsize && (state.whave += dist))),
        0
      );
    }
    function buf2binstring(buf, len) {
      if (
        65537 > len &&
        ((buf.subarray && STR_APPLY_UIA_OK) || (!buf.subarray && STR_APPLY_OK))
      )
        return _StringfromCharCode.apply(null, common.shrinkBuf(buf, len));
      for (var result = "", i = 0; i < len; i++)
        result += _StringfromCharCode(buf[i]);
      return result;
    }
    function Inflate(options) {
      if (!(this instanceof Inflate)) return new Inflate(options);
      this.options = common.assign(
        { chunkSize: 16384, windowBits: 0, to: "" },
        options || {}
      );
      var opt = this.options;
      opt.raw &&
        0 <= opt.windowBits &&
        16 > opt.windowBits &&
        ((opt.windowBits = -opt.windowBits),
        0 === opt.windowBits && (opt.windowBits = -15)),
        0 <= opt.windowBits &&
          16 > opt.windowBits &&
          !(options && options.windowBits) &&
          (opt.windowBits += 32),
        15 < opt.windowBits &&
          48 > opt.windowBits &&
          0 == (15 & opt.windowBits) &&
          (opt.windowBits |= 15),
        (this.err = 0),
        (this.msg = ""),
        (this.ended = !1),
        (this.chunks = []),
        (this.strm = new zstream()),
        (this.strm.avail_out = 0);
      var status = inflate_1.inflateInit2(this.strm, opt.windowBits);
      if (status !== constants.Z_OK) throw new Error(messages[status]);
      (this.header = new gzheader()),
        inflate_1.inflateGetHeader(this.strm, this.header);
    }
    function inflate$1(input, options) {
      var inflator = new Inflate(options);
      if ((inflator.push(input, !0), inflator.err))
        throw inflator.msg || messages[inflator.err];
      return inflator.result;
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor))
        throw new TypeError("Cannot call a class as a function");
    }
    function _classCallCheck$1(instance, Constructor) {
      if (!(instance instanceof Constructor))
        throw new TypeError("Cannot call a class as a function");
    }
    function _classCallCheck$2(instance, Constructor) {
      if (!(instance instanceof Constructor))
        throw new TypeError("Cannot call a class as a function");
    }
    var _StringfromCharCode = String.fromCharCode,
      common = (function createCommonjsModule(fn, module) {
        return (
          (module = { exports: {} }), fn(module, module.exports), module.exports
        );
      })(function (module, exports) {
        function _has(obj, key) {
          return Object.prototype.hasOwnProperty.call(obj, key);
        }
        var TYPED_OK =
          "undefined" != typeof Uint8Array &&
          "undefined" != typeof Uint16Array &&
          "undefined" != typeof Int32Array;
        (exports.assign = function (obj) {
          for (
            var sources = Array.prototype.slice.call(arguments, 1), source;
            sources.length;

          )
            if (((source = sources.shift()), source)) {
              if ("object" != typeof source)
                throw new TypeError(source + "must be non-object");
              for (var p in source) _has(source, p) && (obj[p] = source[p]);
            }
          return obj;
        }),
          (exports.shrinkBuf = function (buf, size) {
            return buf.length === size
              ? buf
              : buf.subarray
              ? buf.subarray(0, size)
              : ((buf.length = size), buf);
          });
        var fnTyped = {
            arraySet: function (dest, src, src_offs, len, dest_offs) {
              if (src.subarray && dest.subarray)
                return void dest.set(
                  src.subarray(src_offs, src_offs + len),
                  dest_offs
                );
              for (var i = 0; i < len; i++)
                dest[dest_offs + i] = src[src_offs + i];
            },
            flattenChunks: function (chunks) {
              var i, l, len, pos, chunk, result;
              for (len = 0, i = 0, l = chunks.length; i < l; i++)
                len += chunks[i].length;
              for (
                result = new Uint8Array(len),
                  pos = 0,
                  ((i = 0), (l = chunks.length));
                i < l;
                i++
              )
                (chunk = chunks[i]),
                  result.set(chunk, pos),
                  (pos += chunk.length);
              return result;
            },
          },
          fnUntyped = {
            arraySet: function (dest, src, src_offs, len, dest_offs) {
              for (var i = 0; i < len; i++)
                dest[dest_offs + i] = src[src_offs + i];
            },
            flattenChunks: function (chunks) {
              return [].concat.apply([], chunks);
            },
          };
        (exports.setTyped = function (on) {
          on
            ? ((exports.Buf8 = Uint8Array),
              (exports.Buf16 = Uint16Array),
              (exports.Buf32 = Int32Array),
              exports.assign(exports, fnTyped))
            : ((exports.Buf8 = Array),
              (exports.Buf16 = Array),
              (exports.Buf32 = Array),
              exports.assign(exports, fnUntyped));
        }),
          exports.setTyped(TYPED_OK);
      }),
      common_1 = common.assign,
      common_2 = common.shrinkBuf,
      common_3 = common.setTyped,
      common_4 = common.Buf8,
      common_5 = common.Buf16,
      common_6 = common.Buf32,
      adler32_1 = function adler32(adler, buf, len, pos) {
        for (
          var s1 = 0 | (65535 & adler),
            s2 = 0 | (65535 & (adler >>> 16)),
            n = 0;
          0 !== len;

        ) {
          (n = 2e3 < len ? 2e3 : len), (len -= n);
          do (s1 = 0 | (s1 + buf[pos++])), (s2 = 0 | (s2 + s1));
          while (--n);
          (s1 %= 65521), (s2 %= 65521);
        }
        return 0 | (s1 | (s2 << 16));
      },
      crcTable = (function makeTable() {
        for (var table = [], n = 0, c; 256 > n; n++) {
          c = n;
          for (var k = 0; 8 > k; k++)
            c = 1 & c ? 3988292384 ^ (c >>> 1) : c >>> 1;
          table[n] = c;
        }
        return table;
      })(),
      crc32_1 = function crc32(crc, buf, len, pos) {
        crc ^= -1;
        for (var i = pos; i < pos + len; i++)
          crc = (crc >>> 8) ^ crcTable[255 & (crc ^ buf[i])];
        return -1 ^ crc;
      },
      BAD = 30,
      inffast = function inflate_fast(strm, start) {
        var state,
          _in,
          last,
          _out,
          beg,
          end,
          dmax,
          wsize,
          whave,
          wnext,
          s_window,
          hold,
          bits,
          lcode,
          dcode,
          lmask,
          dmask,
          here,
          op,
          len,
          dist,
          from,
          from_source,
          input,
          output;
        (state = strm.state),
          (_in = strm.next_in),
          (input = strm.input),
          (last = _in + (strm.avail_in - 5)),
          (_out = strm.next_out),
          (output = strm.output),
          (beg = _out - (start - strm.avail_out)),
          (end = _out + (strm.avail_out - 257)),
          (dmax = state.dmax),
          (wsize = state.wsize),
          (whave = state.whave),
          (wnext = state.wnext),
          (s_window = state.window),
          (hold = state.hold),
          (bits = state.bits),
          (lcode = state.lencode),
          (dcode = state.distcode),
          (lmask = (1 << state.lenbits) - 1),
          (dmask = (1 << state.distbits) - 1);
        top: do {
          15 > bits &&
            ((hold += input[_in++] << bits),
            (bits += 8),
            (hold += input[_in++] << bits),
            (bits += 8)),
            (here = lcode[hold & lmask]);
          dolen: for (;;) {
            if (
              ((op = here >>> 24),
              (hold >>>= op),
              (bits -= op),
              (op = 255 & (here >>> 16)),
              0 === op)
            )
              output[_out++] = 65535 & here;
            else if (16 & op) {
              (len = 65535 & here),
                (op &= 15),
                op &&
                  (bits < op && ((hold += input[_in++] << bits), (bits += 8)),
                  (len += hold & ((1 << op) - 1)),
                  (hold >>>= op),
                  (bits -= op)),
                15 > bits &&
                  ((hold += input[_in++] << bits),
                  (bits += 8),
                  (hold += input[_in++] << bits),
                  (bits += 8)),
                (here = dcode[hold & dmask]);
              dodist: for (;;) {
                if (
                  ((op = here >>> 24),
                  (hold >>>= op),
                  (bits -= op),
                  (op = 255 & (here >>> 16)),
                  16 & op)
                ) {
                  if (
                    ((dist = 65535 & here),
                    (op &= 15),
                    bits < op &&
                      ((hold += input[_in++] << bits),
                      (bits += 8),
                      bits < op &&
                        ((hold += input[_in++] << bits), (bits += 8))),
                    (dist += hold & ((1 << op) - 1)),
                    dist > dmax)
                  ) {
                    (strm.msg = "invalid distance too far back"),
                      (state.mode = BAD);
                    break top;
                  }
                  if (
                    ((hold >>>= op), (bits -= op), (op = _out - beg), dist > op)
                  ) {
                    if (((op = dist - op), op > whave && state.sane)) {
                      (strm.msg = "invalid distance too far back"),
                        (state.mode = BAD);
                      break top;
                    }
                    if (((from = 0), (from_source = s_window), 0 === wnext)) {
                      if (((from += wsize - op), op < len)) {
                        len -= op;
                        do output[_out++] = s_window[from++];
                        while (--op);
                        (from = _out - dist), (from_source = output);
                      }
                    } else if (wnext < op) {
                      if (
                        ((from += wsize + wnext - op), (op -= wnext), op < len)
                      ) {
                        len -= op;
                        do output[_out++] = s_window[from++];
                        while (--op);
                        if (((from = 0), wnext < len)) {
                          (op = wnext), (len -= op);
                          do output[_out++] = s_window[from++];
                          while (--op);
                          (from = _out - dist), (from_source = output);
                        }
                      }
                    } else if (((from += wnext - op), op < len)) {
                      len -= op;
                      do output[_out++] = s_window[from++];
                      while (--op);
                      (from = _out - dist), (from_source = output);
                    }
                    for (; 2 < len; )
                      (output[_out++] = from_source[from++]),
                        (output[_out++] = from_source[from++]),
                        (output[_out++] = from_source[from++]),
                        (len -= 3);
                    len &&
                      ((output[_out++] = from_source[from++]),
                      1 < len && (output[_out++] = from_source[from++]));
                  } else {
                    from = _out - dist;
                    do
                      (output[_out++] = output[from++]),
                        (output[_out++] = output[from++]),
                        (output[_out++] = output[from++]),
                        (len -= 3);
                    while (2 < len);
                    len &&
                      ((output[_out++] = output[from++]),
                      1 < len && (output[_out++] = output[from++]));
                  }
                } else if (0 == (64 & op)) {
                  here = dcode[(65535 & here) + (hold & ((1 << op) - 1))];
                  continue dodist;
                } else {
                  (strm.msg = "invalid distance code"), (state.mode = BAD);
                  break top;
                }
                break;
              }
            } else if (0 == (64 & op)) {
              here = lcode[(65535 & here) + (hold & ((1 << op) - 1))];
              continue dolen;
            } else if (32 & op) {
              state.mode = 12;
              break top;
            } else {
              (strm.msg = "invalid literal/length code"), (state.mode = BAD);
              break top;
            }
            break;
          }
        } while (_in < last && _out < end);
        return (
          (len = bits >> 3),
          (_in -= len),
          (bits -= len << 3),
          (hold &= (1 << bits) - 1),
          (strm.next_in = _in),
          (strm.next_out = _out),
          (strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last)),
          (strm.avail_out =
            _out < end ? 257 + (end - _out) : 257 - (_out - end)),
          (state.hold = hold),
          void (state.bits = bits)
        );
      },
      MAXBITS = 15,
      ENOUGH_LENS = 852,
      ENOUGH_DISTS = 592,
      CODES = 0,
      LENS = 1,
      DISTS = 2,
      lbase = [
        3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59,
        67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0,
      ],
      lext = [
        16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19,
        19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78,
      ],
      dbase = [
        1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385,
        513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577,
        0, 0,
      ],
      dext = [
        16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23,
        24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64,
      ],
      inftrees = function inflate_table(
        type,
        lens,
        lens_index,
        codes,
        table,
        table_index,
        work,
        opts
      ) {
        var bits = opts.bits,
          len = 0,
          sym = 0,
          min = 0,
          max = 0,
          root = 0,
          curr = 0,
          drop = 0,
          left = 0,
          used = 0,
          huff = 0,
          base = null,
          base_index = 0,
          count = new common.Buf16(MAXBITS + 1),
          offs = new common.Buf16(MAXBITS + 1),
          extra = null,
          extra_index = 0,
          incr,
          fill,
          low,
          mask,
          next,
          end,
          here_bits,
          here_op,
          here_val;
        for (len = 0; len <= MAXBITS; len++) count[len] = 0;
        for (sym = 0; sym < codes; sym++) count[lens[lens_index + sym]]++;
        for (root = bits, max = MAXBITS; 1 <= max && 0 === count[max]; max--);
        if ((root > max && (root = max), 0 == max))
          return (
            (table[table_index++] = 0 | ((1 << 24) | (64 << 16))),
            (table[table_index++] = 0 | ((1 << 24) | (64 << 16))),
            (opts.bits = 1),
            0
          );
        for (min = 1; min < max && 0 === count[min]; min++);
        for (
          root < min && (root = min), left = 1, len = 1;
          len <= MAXBITS;
          len++
        )
          if (((left <<= 1), (left -= count[len]), 0 > left)) return -1;
        if (0 < left && (type === CODES || 1 != max)) return -1;
        for (offs[1] = 0, len = 1; len < MAXBITS; len++)
          offs[len + 1] = offs[len] + count[len];
        for (sym = 0; sym < codes; sym++)
          0 !== lens[lens_index + sym] &&
            (work[offs[lens[lens_index + sym]]++] = sym);
        if (
          (type === CODES
            ? ((base = extra = work), (end = 19))
            : type === LENS
            ? ((base = lbase),
              (base_index -= 257),
              (extra = lext),
              (extra_index -= 257),
              (end = 256))
            : ((base = dbase), (extra = dext), (end = -1)),
          (huff = 0),
          (sym = 0),
          (len = min),
          (next = table_index),
          (curr = root),
          (drop = 0),
          (low = -1),
          (used = 1 << root),
          (mask = used - 1),
          (type === LENS && used > ENOUGH_LENS) ||
            (type === DISTS && used > ENOUGH_DISTS))
        )
          return 1;
        for (;;) {
          (here_bits = len - drop),
            work[sym] < end
              ? ((here_op = 0), (here_val = work[sym]))
              : work[sym] > end
              ? ((here_op = extra[extra_index + work[sym]]),
                (here_val = base[base_index + work[sym]]))
              : ((here_op = 32 + 64), (here_val = 0)),
            (incr = 1 << (len - drop)),
            (fill = 1 << curr),
            (min = fill);
          do
            (fill -= incr),
              (table[next + (huff >> drop) + fill] =
                0 | ((here_bits << 24) | (here_op << 16) | here_val));
          while (0 !== fill);
          for (incr = 1 << (len - 1); huff & incr; ) incr >>= 1;
          if (
            (0 === incr ? (huff = 0) : ((huff &= incr - 1), (huff += incr)),
            sym++,
            0 == --count[len])
          ) {
            if (len == max) break;
            len = lens[lens_index + work[sym]];
          }
          if (len > root && (huff & mask) !== low) {
            for (
              0 == drop && (drop = root),
                next += min,
                curr = len - drop,
                left = 1 << curr;
              curr + drop < max && ((left -= count[curr + drop]), !(0 >= left));

            )
              curr++, (left <<= 1);
            if (
              ((used += 1 << curr),
              (type === LENS && used > ENOUGH_LENS) ||
                (type === DISTS && used > ENOUGH_DISTS))
            )
              return 1;
            (low = huff & mask),
              (table[low] =
                0 | ((root << 24) | (curr << 16) | (next - table_index)));
          }
        }
        return (
          0 != huff &&
            (table[next + huff] = 0 | (((len - drop) << 24) | (64 << 16))),
          (opts.bits = root),
          0
        );
      },
      LENS$1 = 1,
      DISTS$1 = 2,
      Z_FINISH = 4,
      Z_TREES = 6,
      Z_OK = 0,
      Z_STREAM_ERROR = -2,
      Z_DATA_ERROR = -3,
      Z_MEM_ERROR = -4,
      Z_DEFLATED = 8,
      HEAD = 1,
      FLAGS = 2,
      TIME = 3,
      OS = 4,
      EXLEN = 5,
      EXTRA = 6,
      NAME = 7,
      COMMENT = 8,
      HCRC = 9,
      DICTID = 10,
      DICT = 11,
      TYPE$1 = 12,
      TYPEDO = 13,
      STORED = 14,
      COPY_ = 15,
      COPY = 16,
      TABLE = 17,
      LENLENS = 18,
      CODELENS = 19,
      LEN_ = 20,
      LEN = 21,
      LENEXT = 22,
      DIST = 23,
      DISTEXT = 24,
      MATCH = 25,
      LIT = 26,
      CHECK = 27,
      LENGTH = 28,
      DONE = 29,
      BAD$1 = 30,
      MEM = 31,
      ENOUGH_LENS$1 = 852,
      ENOUGH_DISTS$1 = 592,
      virgin = !0,
      inflate_1 = {
        inflateReset: inflateReset,
        inflateReset2: inflateReset2,
        inflateResetKeep: inflateResetKeep,
        inflateInit: function inflateInit(strm) {
          return inflateInit2(strm, 15);
        },
        inflateInit2: inflateInit2,
        inflate: function inflate(strm, flush) {
          var here = 0,
            hbuf = new common.Buf8(4),
            order = [
              16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
            ],
            state,
            input,
            output,
            next,
            put,
            have,
            left,
            hold,
            bits,
            _in,
            _out,
            copy,
            from,
            from_source,
            here_bits,
            here_op,
            here_val,
            last_bits,
            last_op,
            last_val,
            len,
            ret,
            opts,
            n;
          if (
            !strm ||
            !strm.state ||
            !strm.output ||
            (!strm.input && 0 !== strm.avail_in)
          )
            return Z_STREAM_ERROR;
          (state = strm.state),
            state.mode === TYPE$1 && (state.mode = TYPEDO),
            (put = strm.next_out),
            (output = strm.output),
            (left = strm.avail_out),
            (next = strm.next_in),
            (input = strm.input),
            (have = strm.avail_in),
            (hold = state.hold),
            (bits = state.bits),
            (_in = have),
            (_out = left),
            (ret = Z_OK);
          inf_leave: for (;;)
            switch (state.mode) {
              case HEAD:
                if (0 === state.wrap) {
                  state.mode = TYPEDO;
                  break;
                }
                for (; 16 > bits; ) {
                  if (0 === have) break inf_leave;
                  have--, (hold += input[next++] << bits), (bits += 8);
                }
                if (2 & state.wrap && 35615 === hold) {
                  (state.check = 0),
                    (hbuf[0] = 255 & hold),
                    (hbuf[1] = 255 & (hold >>> 8)),
                    (state.check = crc32_1(state.check, hbuf, 2, 0)),
                    (hold = 0),
                    (bits = 0),
                    (state.mode = FLAGS);
                  break;
                }
                if (
                  ((state.flags = 0),
                  state.head && (state.head.done = !1),
                  !(1 & state.wrap) || (((255 & hold) << 8) + (hold >> 8)) % 31)
                ) {
                  (strm.msg = "incorrect header check"), (state.mode = BAD$1);
                  break;
                }
                if ((15 & hold) != Z_DEFLATED) {
                  (strm.msg = "unknown compression method"),
                    (state.mode = BAD$1);
                  break;
                }
                if (
                  ((hold >>>= 4),
                  (bits -= 4),
                  (len = (15 & hold) + 8),
                  0 === state.wbits)
                )
                  state.wbits = len;
                else if (len > state.wbits) {
                  (strm.msg = "invalid window size"), (state.mode = BAD$1);
                  break;
                }
                (state.dmax = 1 << len),
                  (strm.adler = state.check = 1),
                  (state.mode = 512 & hold ? DICTID : TYPE$1),
                  (hold = 0),
                  (bits = 0);
                break;
              case FLAGS:
                for (; 16 > bits; ) {
                  if (0 === have) break inf_leave;
                  have--, (hold += input[next++] << bits), (bits += 8);
                }
                if (((state.flags = hold), (255 & state.flags) != Z_DEFLATED)) {
                  (strm.msg = "unknown compression method"),
                    (state.mode = BAD$1);
                  break;
                }
                if (57344 & state.flags) {
                  (strm.msg = "unknown header flags set"), (state.mode = BAD$1);
                  break;
                }
                state.head && (state.head.text = 1 & (hold >> 8)),
                  512 & state.flags &&
                    ((hbuf[0] = 255 & hold),
                    (hbuf[1] = 255 & (hold >>> 8)),
                    (state.check = crc32_1(state.check, hbuf, 2, 0))),
                  (hold = 0),
                  (bits = 0),
                  (state.mode = TIME);
              case TIME:
                for (; 32 > bits; ) {
                  if (0 === have) break inf_leave;
                  have--, (hold += input[next++] << bits), (bits += 8);
                }
                state.head && (state.head.time = hold),
                  512 & state.flags &&
                    ((hbuf[0] = 255 & hold),
                    (hbuf[1] = 255 & (hold >>> 8)),
                    (hbuf[2] = 255 & (hold >>> 16)),
                    (hbuf[3] = 255 & (hold >>> 24)),
                    (state.check = crc32_1(state.check, hbuf, 4, 0))),
                  (hold = 0),
                  (bits = 0),
                  (state.mode = OS);
              case OS:
                for (; 16 > bits; ) {
                  if (0 === have) break inf_leave;
                  have--, (hold += input[next++] << bits), (bits += 8);
                }
                state.head &&
                  ((state.head.xflags = 255 & hold),
                  (state.head.os = hold >> 8)),
                  512 & state.flags &&
                    ((hbuf[0] = 255 & hold),
                    (hbuf[1] = 255 & (hold >>> 8)),
                    (state.check = crc32_1(state.check, hbuf, 2, 0))),
                  (hold = 0),
                  (bits = 0),
                  (state.mode = EXLEN);
              case EXLEN:
                if (1024 & state.flags) {
                  for (; 16 > bits; ) {
                    if (0 === have) break inf_leave;
                    have--, (hold += input[next++] << bits), (bits += 8);
                  }
                  (state.length = hold),
                    state.head && (state.head.extra_len = hold),
                    512 & state.flags &&
                      ((hbuf[0] = 255 & hold),
                      (hbuf[1] = 255 & (hold >>> 8)),
                      (state.check = crc32_1(state.check, hbuf, 2, 0))),
                    (hold = 0),
                    (bits = 0);
                } else state.head && (state.head.extra = null);
                state.mode = EXTRA;
              case EXTRA:
                if (
                  1024 & state.flags &&
                  ((copy = state.length),
                  copy > have && (copy = have),
                  copy &&
                    (state.head &&
                      ((len = state.head.extra_len - state.length),
                      !state.head.extra &&
                        (state.head.extra = Array(state.head.extra_len)),
                      common.arraySet(
                        state.head.extra,
                        input,
                        next,
                        copy,
                        len
                      )),
                    512 & state.flags &&
                      (state.check = crc32_1(state.check, input, copy, next)),
                    (have -= copy),
                    (next += copy),
                    (state.length -= copy)),
                  state.length)
                )
                  break inf_leave;
                (state.length = 0), (state.mode = NAME);
              case NAME:
                if (2048 & state.flags) {
                  if (0 === have) break inf_leave;
                  copy = 0;
                  do
                    (len = input[next + copy++]),
                      state.head &&
                        len &&
                        65536 > state.length &&
                        (state.head.name += _StringfromCharCode(len));
                  while (len && copy < have);
                  if (
                    (512 & state.flags &&
                      (state.check = crc32_1(state.check, input, copy, next)),
                    (have -= copy),
                    (next += copy),
                    len)
                  )
                    break inf_leave;
                } else state.head && (state.head.name = null);
                (state.length = 0), (state.mode = COMMENT);
              case COMMENT:
                if (4096 & state.flags) {
                  if (0 === have) break inf_leave;
                  copy = 0;
                  do
                    (len = input[next + copy++]),
                      state.head &&
                        len &&
                        65536 > state.length &&
                        (state.head.comment += _StringfromCharCode(len));
                  while (len && copy < have);
                  if (
                    (512 & state.flags &&
                      (state.check = crc32_1(state.check, input, copy, next)),
                    (have -= copy),
                    (next += copy),
                    len)
                  )
                    break inf_leave;
                } else state.head && (state.head.comment = null);
                state.mode = HCRC;
              case HCRC:
                if (512 & state.flags) {
                  for (; 16 > bits; ) {
                    if (0 === have) break inf_leave;
                    have--, (hold += input[next++] << bits), (bits += 8);
                  }
                  if (hold !== (65535 & state.check)) {
                    (strm.msg = "header crc mismatch"), (state.mode = BAD$1);
                    break;
                  }
                  (hold = 0), (bits = 0);
                }
                state.head &&
                  ((state.head.hcrc = 1 & (state.flags >> 9)),
                  (state.head.done = !0)),
                  (strm.adler = state.check = 0),
                  (state.mode = TYPE$1);
                break;
              case DICTID:
                for (; 32 > bits; ) {
                  if (0 === have) break inf_leave;
                  have--, (hold += input[next++] << bits), (bits += 8);
                }
                (strm.adler = state.check = zswap32(hold)),
                  (hold = 0),
                  (bits = 0),
                  (state.mode = DICT);
              case DICT:
                if (0 === state.havedict)
                  return (
                    (strm.next_out = put),
                    (strm.avail_out = left),
                    (strm.next_in = next),
                    (strm.avail_in = have),
                    (state.hold = hold),
                    (state.bits = bits),
                    2
                  );
                (strm.adler = state.check = 1), (state.mode = TYPE$1);
              case TYPE$1:
                if (5 === flush || flush === Z_TREES) break inf_leave;
              case TYPEDO:
                if (state.last) {
                  (hold >>>= 7 & bits),
                    (bits -= 7 & bits),
                    (state.mode = CHECK);
                  break;
                }
                for (; 3 > bits; ) {
                  if (0 === have) break inf_leave;
                  have--, (hold += input[next++] << bits), (bits += 8);
                }
                switch (
                  ((state.last = 1 & hold),
                  (hold >>>= 1),
                  (bits -= 1),
                  3 & hold)
                ) {
                  case 0:
                    state.mode = STORED;
                    break;
                  case 1:
                    if (
                      (fixedtables(state),
                      (state.mode = LEN_),
                      flush === Z_TREES)
                    ) {
                      (hold >>>= 2), (bits -= 2);
                      break inf_leave;
                    }
                    break;
                  case 2:
                    state.mode = TABLE;
                    break;
                  case 3:
                    (strm.msg = "invalid block type"), (state.mode = BAD$1);
                }
                (hold >>>= 2), (bits -= 2);
                break;
              case STORED:
                for (hold >>>= 7 & bits, bits -= 7 & bits; 32 > bits; ) {
                  if (0 === have) break inf_leave;
                  have--, (hold += input[next++] << bits), (bits += 8);
                }
                if ((65535 & hold) != (65535 ^ (hold >>> 16))) {
                  (strm.msg = "invalid stored block lengths"),
                    (state.mode = BAD$1);
                  break;
                }
                if (
                  ((state.length = 65535 & hold),
                  (hold = 0),
                  (bits = 0),
                  (state.mode = COPY_),
                  flush === Z_TREES)
                )
                  break inf_leave;
              case COPY_:
                state.mode = COPY;
              case COPY:
                if (((copy = state.length), copy)) {
                  if (
                    (copy > have && (copy = have),
                    copy > left && (copy = left),
                    0 === copy)
                  )
                    break inf_leave;
                  common.arraySet(output, input, next, copy, put),
                    (have -= copy),
                    (next += copy),
                    (left -= copy),
                    (put += copy),
                    (state.length -= copy);
                  break;
                }
                state.mode = TYPE$1;
                break;
              case TABLE:
                for (; 14 > bits; ) {
                  if (0 === have) break inf_leave;
                  have--, (hold += input[next++] << bits), (bits += 8);
                }
                if (
                  ((state.nlen = (31 & hold) + 257),
                  (hold >>>= 5),
                  (bits -= 5),
                  (state.ndist = (31 & hold) + 1),
                  (hold >>>= 5),
                  (bits -= 5),
                  (state.ncode = (15 & hold) + 4),
                  (hold >>>= 4),
                  (bits -= 4),
                  286 < state.nlen || 30 < state.ndist)
                ) {
                  (strm.msg = "too many length or distance symbols"),
                    (state.mode = BAD$1);
                  break;
                }
                (state.have = 0), (state.mode = LENLENS);
              case LENLENS:
                for (; state.have < state.ncode; ) {
                  for (; 3 > bits; ) {
                    if (0 === have) break inf_leave;
                    have--, (hold += input[next++] << bits), (bits += 8);
                  }
                  (state.lens[order[state.have++]] = 7 & hold),
                    (hold >>>= 3),
                    (bits -= 3);
                }
                for (; 19 > state.have; ) state.lens[order[state.have++]] = 0;
                if (
                  ((state.lencode = state.lendyn),
                  (state.lenbits = 7),
                  (opts = { bits: state.lenbits }),
                  (ret = inftrees(
                    0,
                    state.lens,
                    0,
                    19,
                    state.lencode,
                    0,
                    state.work,
                    opts
                  )),
                  (state.lenbits = opts.bits),
                  ret)
                ) {
                  (strm.msg = "invalid code lengths set"), (state.mode = BAD$1);
                  break;
                }
                (state.have = 0), (state.mode = CODELENS);
              case CODELENS:
                for (; state.have < state.nlen + state.ndist; ) {
                  for (;;) {
                    if (
                      ((here =
                        state.lencode[hold & ((1 << state.lenbits) - 1)]),
                      (here_bits = here >>> 24),
                      (here_op = 255 & (here >>> 16)),
                      (here_val = 65535 & here),
                      here_bits <= bits)
                    )
                      break;
                    if (0 === have) break inf_leave;
                    have--, (hold += input[next++] << bits), (bits += 8);
                  }
                  if (16 > here_val)
                    (hold >>>= here_bits),
                      (bits -= here_bits),
                      (state.lens[state.have++] = here_val);
                  else {
                    if (16 === here_val) {
                      for (n = here_bits + 2; bits < n; ) {
                        if (0 === have) break inf_leave;
                        have--, (hold += input[next++] << bits), (bits += 8);
                      }
                      if (
                        ((hold >>>= here_bits),
                        (bits -= here_bits),
                        0 === state.have)
                      ) {
                        (strm.msg = "invalid bit length repeat"),
                          (state.mode = BAD$1);
                        break;
                      }
                      (len = state.lens[state.have - 1]),
                        (copy = 3 + (3 & hold)),
                        (hold >>>= 2),
                        (bits -= 2);
                    } else if (17 === here_val) {
                      for (n = here_bits + 3; bits < n; ) {
                        if (0 === have) break inf_leave;
                        have--, (hold += input[next++] << bits), (bits += 8);
                      }
                      (hold >>>= here_bits),
                        (bits -= here_bits),
                        (len = 0),
                        (copy = 3 + (7 & hold)),
                        (hold >>>= 3),
                        (bits -= 3);
                    } else {
                      for (n = here_bits + 7; bits < n; ) {
                        if (0 === have) break inf_leave;
                        have--, (hold += input[next++] << bits), (bits += 8);
                      }
                      (hold >>>= here_bits),
                        (bits -= here_bits),
                        (len = 0),
                        (copy = 11 + (127 & hold)),
                        (hold >>>= 7),
                        (bits -= 7);
                    }
                    if (state.have + copy > state.nlen + state.ndist) {
                      (strm.msg = "invalid bit length repeat"),
                        (state.mode = BAD$1);
                      break;
                    }
                    for (; copy--; ) state.lens[state.have++] = len;
                  }
                }
                if (state.mode === BAD$1) break;
                if (0 === state.lens[256]) {
                  (strm.msg = "invalid code -- missing end-of-block"),
                    (state.mode = BAD$1);
                  break;
                }
                if (
                  ((state.lenbits = 9),
                  (opts = { bits: state.lenbits }),
                  (ret = inftrees(
                    LENS$1,
                    state.lens,
                    0,
                    state.nlen,
                    state.lencode,
                    0,
                    state.work,
                    opts
                  )),
                  (state.lenbits = opts.bits),
                  ret)
                ) {
                  (strm.msg = "invalid literal/lengths set"),
                    (state.mode = BAD$1);
                  break;
                }
                if (
                  ((state.distbits = 6),
                  (state.distcode = state.distdyn),
                  (opts = { bits: state.distbits }),
                  (ret = inftrees(
                    DISTS$1,
                    state.lens,
                    state.nlen,
                    state.ndist,
                    state.distcode,
                    0,
                    state.work,
                    opts
                  )),
                  (state.distbits = opts.bits),
                  ret)
                ) {
                  (strm.msg = "invalid distances set"), (state.mode = BAD$1);
                  break;
                }
                if (((state.mode = LEN_), flush === Z_TREES)) break inf_leave;
              case LEN_:
                state.mode = LEN;
              case LEN:
                if (6 <= have && 258 <= left) {
                  (strm.next_out = put),
                    (strm.avail_out = left),
                    (strm.next_in = next),
                    (strm.avail_in = have),
                    (state.hold = hold),
                    (state.bits = bits),
                    inffast(strm, _out),
                    (put = strm.next_out),
                    (output = strm.output),
                    (left = strm.avail_out),
                    (next = strm.next_in),
                    (input = strm.input),
                    (have = strm.avail_in),
                    (hold = state.hold),
                    (bits = state.bits),
                    state.mode === TYPE$1 && (state.back = -1);
                  break;
                }
                for (state.back = 0; ; ) {
                  if (
                    ((here = state.lencode[hold & ((1 << state.lenbits) - 1)]),
                    (here_bits = here >>> 24),
                    (here_op = 255 & (here >>> 16)),
                    (here_val = 65535 & here),
                    here_bits <= bits)
                  )
                    break;
                  if (0 === have) break inf_leave;
                  have--, (hold += input[next++] << bits), (bits += 8);
                }
                if (here_op && 0 == (240 & here_op)) {
                  for (
                    last_bits = here_bits,
                      last_op = here_op,
                      last_val = here_val;
                    ;

                  ) {
                    if (
                      ((here =
                        state.lencode[
                          last_val +
                            ((hold & ((1 << (last_bits + last_op)) - 1)) >>
                              last_bits)
                        ]),
                      (here_bits = here >>> 24),
                      (here_op = 255 & (here >>> 16)),
                      (here_val = 65535 & here),
                      last_bits + here_bits <= bits)
                    )
                      break;
                    if (0 === have) break inf_leave;
                    have--, (hold += input[next++] << bits), (bits += 8);
                  }
                  (hold >>>= last_bits),
                    (bits -= last_bits),
                    (state.back += last_bits);
                }
                if (
                  ((hold >>>= here_bits),
                  (bits -= here_bits),
                  (state.back += here_bits),
                  (state.length = here_val),
                  0 === here_op)
                ) {
                  state.mode = LIT;
                  break;
                }
                if (32 & here_op) {
                  (state.back = -1), (state.mode = TYPE$1);
                  break;
                }
                if (64 & here_op) {
                  (strm.msg = "invalid literal/length code"),
                    (state.mode = BAD$1);
                  break;
                }
                (state.extra = 15 & here_op), (state.mode = LENEXT);
              case LENEXT:
                if (state.extra) {
                  for (n = state.extra; bits < n; ) {
                    if (0 === have) break inf_leave;
                    have--, (hold += input[next++] << bits), (bits += 8);
                  }
                  (state.length += hold & ((1 << state.extra) - 1)),
                    (hold >>>= state.extra),
                    (bits -= state.extra),
                    (state.back += state.extra);
                }
                (state.was = state.length), (state.mode = DIST);
              case DIST:
                for (;;) {
                  if (
                    ((here =
                      state.distcode[hold & ((1 << state.distbits) - 1)]),
                    (here_bits = here >>> 24),
                    (here_op = 255 & (here >>> 16)),
                    (here_val = 65535 & here),
                    here_bits <= bits)
                  )
                    break;
                  if (0 === have) break inf_leave;
                  have--, (hold += input[next++] << bits), (bits += 8);
                }
                if (0 == (240 & here_op)) {
                  for (
                    last_bits = here_bits,
                      last_op = here_op,
                      last_val = here_val;
                    ;

                  ) {
                    if (
                      ((here =
                        state.distcode[
                          last_val +
                            ((hold & ((1 << (last_bits + last_op)) - 1)) >>
                              last_bits)
                        ]),
                      (here_bits = here >>> 24),
                      (here_op = 255 & (here >>> 16)),
                      (here_val = 65535 & here),
                      last_bits + here_bits <= bits)
                    )
                      break;
                    if (0 === have) break inf_leave;
                    have--, (hold += input[next++] << bits), (bits += 8);
                  }
                  (hold >>>= last_bits),
                    (bits -= last_bits),
                    (state.back += last_bits);
                }
                if (
                  ((hold >>>= here_bits),
                  (bits -= here_bits),
                  (state.back += here_bits),
                  64 & here_op)
                ) {
                  (strm.msg = "invalid distance code"), (state.mode = BAD$1);
                  break;
                }
                (state.offset = here_val),
                  (state.extra = 15 & here_op),
                  (state.mode = DISTEXT);
              case DISTEXT:
                if (state.extra) {
                  for (n = state.extra; bits < n; ) {
                    if (0 === have) break inf_leave;
                    have--, (hold += input[next++] << bits), (bits += 8);
                  }
                  (state.offset += hold & ((1 << state.extra) - 1)),
                    (hold >>>= state.extra),
                    (bits -= state.extra),
                    (state.back += state.extra);
                }
                if (state.offset > state.dmax) {
                  (strm.msg = "invalid distance too far back"),
                    (state.mode = BAD$1);
                  break;
                }
                state.mode = MATCH;
              case MATCH:
                if (0 === left) break inf_leave;
                if (((copy = _out - left), state.offset > copy)) {
                  if (
                    ((copy = state.offset - copy),
                    copy > state.whave && state.sane)
                  ) {
                    (strm.msg = "invalid distance too far back"),
                      (state.mode = BAD$1);
                    break;
                  }
                  copy > state.wnext
                    ? ((copy -= state.wnext), (from = state.wsize - copy))
                    : (from = state.wnext - copy),
                    copy > state.length && (copy = state.length),
                    (from_source = state.window);
                } else
                  (from_source = output),
                    (from = put - state.offset),
                    (copy = state.length);
                copy > left && (copy = left),
                  (left -= copy),
                  (state.length -= copy);
                do output[put++] = from_source[from++];
                while (--copy);
                0 === state.length && (state.mode = LEN);
                break;
              case LIT:
                if (0 === left) break inf_leave;
                (output[put++] = state.length), left--, (state.mode = LEN);
                break;
              case CHECK:
                if (state.wrap) {
                  for (; 32 > bits; ) {
                    if (0 === have) break inf_leave;
                    have--, (hold |= input[next++] << bits), (bits += 8);
                  }
                  if (
                    ((_out -= left),
                    (strm.total_out += _out),
                    (state.total += _out),
                    _out &&
                      (strm.adler = state.check =
                        state.flags
                          ? crc32_1(state.check, output, _out, put - _out)
                          : adler32_1(state.check, output, _out, put - _out)),
                    (_out = left),
                    (state.flags ? hold : zswap32(hold)) !== state.check)
                  ) {
                    (strm.msg = "incorrect data check"), (state.mode = BAD$1);
                    break;
                  }
                  (hold = 0), (bits = 0);
                }
                state.mode = LENGTH;
              case LENGTH:
                if (state.wrap && state.flags) {
                  for (; 32 > bits; ) {
                    if (0 === have) break inf_leave;
                    have--, (hold += input[next++] << bits), (bits += 8);
                  }
                  if (hold !== (4294967295 & state.total)) {
                    (strm.msg = "incorrect length check"), (state.mode = BAD$1);
                    break;
                  }
                  (hold = 0), (bits = 0);
                }
                state.mode = DONE;
              case DONE:
                ret = 1;
                break inf_leave;
              case BAD$1:
                ret = Z_DATA_ERROR;
                break inf_leave;
              case MEM:
                return Z_MEM_ERROR;
              case 32:
              default:
                return Z_STREAM_ERROR;
            }
          return ((strm.next_out = put),
          (strm.avail_out = left),
          (strm.next_in = next),
          (strm.avail_in = have),
          (state.hold = hold),
          (state.bits = bits),
          (state.wsize ||
            (_out !== strm.avail_out &&
              state.mode < BAD$1 &&
              (state.mode < CHECK || flush !== Z_FINISH))) &&
            updatewindow(
              strm,
              strm.output,
              strm.next_out,
              _out - strm.avail_out
            ))
            ? ((state.mode = MEM), Z_MEM_ERROR)
            : ((_in -= strm.avail_in),
              (_out -= strm.avail_out),
              (strm.total_in += _in),
              (strm.total_out += _out),
              (state.total += _out),
              state.wrap &&
                _out &&
                (strm.adler = state.check =
                  state.flags
                    ? crc32_1(state.check, output, _out, strm.next_out - _out)
                    : adler32_1(
                        state.check,
                        output,
                        _out,
                        strm.next_out - _out
                      )),
              (strm.data_type =
                state.bits +
                (state.last ? 64 : 0) +
                (state.mode === TYPE$1 ? 128 : 0) +
                (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0)),
              ((0 === _in && 0 === _out) || flush === Z_FINISH) &&
                ret === Z_OK &&
                (ret = -5),
              ret);
        },
        inflateEnd: function inflateEnd(strm) {
          if (!strm || !strm.state) return Z_STREAM_ERROR;
          var state = strm.state;
          return (
            state.window && (state.window = null), (strm.state = null), Z_OK
          );
        },
        inflateGetHeader: function inflateGetHeader(strm, head) {
          var state;
          return strm && strm.state
            ? ((state = strm.state), 0 == (2 & state.wrap))
              ? Z_STREAM_ERROR
              : ((state.head = head), (head.done = !1), Z_OK)
            : Z_STREAM_ERROR;
        },
        inflateSetDictionary: function inflateSetDictionary(strm, dictionary) {
          var dictLength = dictionary.length,
            state,
            dictid,
            ret;
          return strm && strm.state
            ? ((state = strm.state), 0 !== state.wrap && state.mode !== DICT)
              ? Z_STREAM_ERROR
              : state.mode === DICT &&
                ((dictid = 1),
                (dictid = adler32_1(dictid, dictionary, dictLength, 0)),
                dictid !== state.check)
              ? Z_DATA_ERROR
              : ((ret = updatewindow(strm, dictionary, dictLength, dictLength)),
                ret)
              ? ((state.mode = MEM), Z_MEM_ERROR)
              : ((state.havedict = 1), Z_OK)
            : Z_STREAM_ERROR;
        },
        inflateInfo: "pako inflate (from Nodeca project)",
      },
      STR_APPLY_OK = !0,
      STR_APPLY_UIA_OK = !0,
      lenfix,
      distfix;
    try {
      _StringfromCharCode.apply(null, [0]);
    } catch (__) {
      STR_APPLY_OK = !1;
    }
    try {
      _StringfromCharCode.apply(null, new Uint8Array(1));
    } catch (__) {
      STR_APPLY_UIA_OK = !1;
    }
    for (var _utf8len = new common.Buf8(256), q = 0; 256 > q; q++)
      _utf8len[q] =
        252 <= q
          ? 6
          : 248 <= q
          ? 5
          : 240 <= q
          ? 4
          : 224 <= q
          ? 3
          : 192 <= q
          ? 2
          : 1;
    _utf8len[254] = _utf8len[254] = 1;
    var strings = {
        string2buf: function (str) {
          var str_len = str.length,
            buf_len = 0,
            buf,
            c,
            c2,
            m_pos,
            i;
          for (m_pos = 0; m_pos < str_len; m_pos++)
            (c = str.charCodeAt(m_pos)),
              55296 == (64512 & c) &&
                m_pos + 1 < str_len &&
                ((c2 = str.charCodeAt(m_pos + 1)),
                56320 == (64512 & c2) &&
                  ((c = 65536 + ((c - 55296) << 10) + (c2 - 56320)), m_pos++)),
              (buf_len += 128 > c ? 1 : 2048 > c ? 2 : 65536 > c ? 3 : 4);
          for (
            buf = new common.Buf8(buf_len), i = 0, m_pos = 0;
            i < buf_len;
            m_pos++
          )
            (c = str.charCodeAt(m_pos)),
              55296 == (64512 & c) &&
                m_pos + 1 < str_len &&
                ((c2 = str.charCodeAt(m_pos + 1)),
                56320 == (64512 & c2) &&
                  ((c = 65536 + ((c - 55296) << 10) + (c2 - 56320)), m_pos++)),
              128 > c
                ? (buf[i++] = c)
                : 2048 > c
                ? ((buf[i++] = 192 | (c >>> 6)), (buf[i++] = 128 | (63 & c)))
                : 65536 > c
                ? ((buf[i++] = 224 | (c >>> 12)),
                  (buf[i++] = 128 | (63 & (c >>> 6))),
                  (buf[i++] = 128 | (63 & c)))
                : ((buf[i++] = 240 | (c >>> 18)),
                  (buf[i++] = 128 | (63 & (c >>> 12))),
                  (buf[i++] = 128 | (63 & (c >>> 6))),
                  (buf[i++] = 128 | (63 & c)));
          return buf;
        },
        buf2binstring: function (buf) {
          return buf2binstring(buf, buf.length);
        },
        binstring2buf: function (str) {
          for (
            var buf = new common.Buf8(str.length), i = 0, len = buf.length;
            i < len;
            i++
          )
            buf[i] = str.charCodeAt(i);
          return buf;
        },
        buf2string: function (buf, max) {
          var len = max || buf.length,
            utf16buf = Array(2 * len),
            i,
            out,
            c,
            c_len;
          for (out = 0, i = 0; i < len; ) {
            if (((c = buf[i++]), 128 > c)) {
              utf16buf[out++] = c;
              continue;
            }
            if (((c_len = _utf8len[c]), 4 < c_len)) {
              (utf16buf[out++] = 65533), (i += c_len - 1);
              continue;
            }
            for (
              c &= 2 === c_len ? 31 : 3 === c_len ? 15 : 7;
              1 < c_len && i < len;

            )
              (c = (c << 6) | (63 & buf[i++])), c_len--;
            if (1 < c_len) {
              utf16buf[out++] = 65533;
              continue;
            }
            65536 > c
              ? (utf16buf[out++] = c)
              : ((c -= 65536),
                (utf16buf[out++] = 55296 | (1023 & (c >> 10))),
                (utf16buf[out++] = 56320 | (1023 & c)));
          }
          return buf2binstring(utf16buf, out);
        },
        utf8border: function (buf, max) {
          var pos;
          for (
            max = max || buf.length,
              max > buf.length && (max = buf.length),
              pos = max - 1;
            0 <= pos && 128 == (192 & buf[pos]);

          )
            pos--;
          return 0 > pos
            ? max
            : 0 === pos
            ? max
            : pos + _utf8len[buf[pos]] > max
            ? pos
            : max;
        },
      },
      constants = {
        Z_NO_FLUSH: 0,
        Z_PARTIAL_FLUSH: 1,
        Z_SYNC_FLUSH: 2,
        Z_FULL_FLUSH: 3,
        Z_FINISH: 4,
        Z_BLOCK: 5,
        Z_TREES: 6,
        Z_OK: 0,
        Z_STREAM_END: 1,
        Z_NEED_DICT: 2,
        Z_ERRNO: -1,
        Z_STREAM_ERROR: -2,
        Z_DATA_ERROR: -3,
        Z_BUF_ERROR: -5,
        Z_NO_COMPRESSION: 0,
        Z_BEST_SPEED: 1,
        Z_BEST_COMPRESSION: 9,
        Z_DEFAULT_COMPRESSION: -1,
        Z_FILTERED: 1,
        Z_HUFFMAN_ONLY: 2,
        Z_RLE: 3,
        Z_FIXED: 4,
        Z_DEFAULT_STRATEGY: 0,
        Z_BINARY: 0,
        Z_TEXT: 1,
        Z_UNKNOWN: 2,
        Z_DEFLATED: 8,
      },
      messages = {
        2: "need dictionary",
        1: "stream end",
        0: "",
        "-1": "file error",
        "-2": "stream error",
        "-3": "data error",
        "-4": "insufficient memory",
        "-5": "buffer error",
        "-6": "incompatible version",
      },
      zstream = function ZStream() {
        (this.input = null),
          (this.next_in = 0),
          (this.avail_in = 0),
          (this.total_in = 0),
          (this.output = null),
          (this.next_out = 0),
          (this.avail_out = 0),
          (this.total_out = 0),
          (this.msg = ""),
          (this.state = null),
          (this.data_type = 2),
          (this.adler = 0);
      },
      gzheader = function GZheader() {
        (this.text = 0),
          (this.time = 0),
          (this.xflags = 0),
          (this.os = 0),
          (this.extra = null),
          (this.extra_len = 0),
          (this.name = ""),
          (this.comment = ""),
          (this.hcrc = 0),
          (this.done = !1);
      },
      toString = Object.prototype.toString;
    (Inflate.prototype.push = function (data, mode) {
      var strm = this.strm,
        chunkSize = this.options.chunkSize,
        dictionary = this.options.dictionary,
        allowBufError = !1,
        status,
        _mode,
        next_out_utf8,
        tail,
        utf8str,
        dict;
      if (this.ended) return !1;
      (_mode =
        mode === ~~mode
          ? mode
          : !0 === mode
          ? constants.Z_FINISH
          : constants.Z_NO_FLUSH),
        (strm.input =
          "string" == typeof data
            ? strings.binstring2buf(data)
            : "[object ArrayBuffer]" === toString.call(data)
            ? new Uint8Array(data)
            : data),
        (strm.next_in = 0),
        (strm.avail_in = strm.input.length);
      do {
        if (
          (0 === strm.avail_out &&
            ((strm.output = new common.Buf8(chunkSize)),
            (strm.next_out = 0),
            (strm.avail_out = chunkSize)),
          (status = inflate_1.inflate(strm, constants.Z_NO_FLUSH)),
          status === constants.Z_NEED_DICT &&
            dictionary &&
            ((dict =
              "string" == typeof dictionary
                ? strings.string2buf(dictionary)
                : "[object ArrayBuffer]" === toString.call(dictionary)
                ? new Uint8Array(dictionary)
                : dictionary),
            (status = inflate_1.inflateSetDictionary(this.strm, dict))),
          status === constants.Z_BUF_ERROR &&
            !0 == allowBufError &&
            ((status = constants.Z_OK), (allowBufError = !1)),
          status !== constants.Z_STREAM_END && status !== constants.Z_OK)
        )
          return this.onEnd(status), (this.ended = !0), !1;
        strm.next_out &&
          (0 === strm.avail_out ||
            status === constants.Z_STREAM_END ||
            (0 === strm.avail_in &&
              (_mode === constants.Z_FINISH ||
                _mode === constants.Z_SYNC_FLUSH))) &&
          ("string" === this.options.to
            ? ((next_out_utf8 = strings.utf8border(strm.output, strm.next_out)),
              (tail = strm.next_out - next_out_utf8),
              (utf8str = strings.buf2string(strm.output, next_out_utf8)),
              (strm.next_out = tail),
              (strm.avail_out = chunkSize - tail),
              tail &&
                common.arraySet(
                  strm.output,
                  strm.output,
                  next_out_utf8,
                  tail,
                  0
                ),
              this.onData(utf8str))
            : this.onData(common.shrinkBuf(strm.output, strm.next_out))),
          0 === strm.avail_in && 0 === strm.avail_out && (allowBufError = !0);
      } while (
        (0 < strm.avail_in || 0 === strm.avail_out) &&
        status !== constants.Z_STREAM_END
      );
      return (
        status === constants.Z_STREAM_END && (_mode = constants.Z_FINISH),
        _mode === constants.Z_FINISH
          ? ((status = inflate_1.inflateEnd(this.strm)),
            this.onEnd(status),
            (this.ended = !0),
            status === constants.Z_OK)
          : _mode !== constants.Z_SYNC_FLUSH ||
            (this.onEnd(constants.Z_OK), (strm.avail_out = 0), !0)
      );
    }),
      (Inflate.prototype.onData = function (chunk) {
        this.chunks.push(chunk);
      }),
      (Inflate.prototype.onEnd = function (status) {
        status === constants.Z_OK &&
          ("string" === this.options.to
            ? (this.result = this.chunks.join(""))
            : (this.result = common.flattenChunks(this.chunks))),
          (this.chunks = []),
          (this.err = status),
          (this.msg = this.strm.msg);
      });
    var inflate_1$1 = {
        Inflate: Inflate,
        inflate: inflate$1,
        inflateRaw: function inflateRaw(input, options) {
          return (
            (options = options || {}),
            (options.raw = !0),
            inflate$1(input, options)
          );
        },
        ungzip: inflate$1,
      },
      _class = (function () {
        function _class(buffer) {
          _classCallCheck(this, _class),
            (this.dataView = new DataView(buffer)),
            (this.position = 0);
        }
        return (
          (_class.prototype.skip = function skip(length) {
            this.position += length;
          }),
          (_class.prototype.readBytes = function readBytes(length) {
            var type =
                4 === length
                  ? "getUint32"
                  : 2 === length
                  ? "getUint16"
                  : "getUint8",
              start = this.position;
            return (this.position += length), this.dataView[type](start, !0);
          }),
          _class
        );
      })(),
      parseZip = function parseZip(buffer) {
        for (var reader = new _class(buffer), files = {}; ; ) {
          var signature = reader.readBytes(4);
          if (signature === 67324752) {
            var file = parseLocalFile(reader);
            files[file.name] = { buffer: file.buffer };
            continue;
          }
          if (signature === 33639248) {
            parseCentralDirectory(reader);
            continue;
          }
          break;
        }
        return files;
      },
      parseLocalFile = function parseLocalFile(reader) {
        var i = 0,
          data = void 0;
        reader.skip(4);
        var compression = reader.readBytes(2);
        reader.skip(8);
        var compressedSize = reader.readBytes(4);
        reader.skip(4);
        var filenameLength = reader.readBytes(2),
          extraFieldLength = reader.readBytes(2),
          filename = [],
          compressedData = new Uint8Array(compressedSize);
        for (i = 0; i < filenameLength; i++)
          filename.push(_StringfromCharCode(reader.readBytes(1)));
        for (reader.skip(extraFieldLength), i = 0; i < compressedSize; i++)
          compressedData[i] = reader.readBytes(1);
        return (
          0 === compression
            ? (data = compressedData)
            : 8 === compression
            ? (data = new Uint8Array(
                inflate_1$1.inflate(compressedData, { raw: !0 })
              ))
            : (console.log(
                filename.join("") + ": unsupported compression type"
              ),
              (data = compressedData)),
          { name: filename.join(""), buffer: data }
        );
      },
      parseCentralDirectory = function parseCentralDirectory(reader) {
        reader.skip(24);
        var filenameLength = reader.readBytes(2),
          extraFieldLength = reader.readBytes(2),
          fileCommentLength = reader.readBytes(2);
        reader.skip(12),
          reader.skip(filenameLength),
          reader.skip(extraFieldLength),
          reader.skip(fileCommentLength);
      },
      isPromiseSuppoted = "function" == typeof Promise,
      PromiseLike = isPromiseSuppoted
        ? Promise
        : function PromiseLike(executor) {
            _classCallCheck$1(this, PromiseLike);
            var callback = function callback() {};
            return (
              executor(function resolve() {
                callback();
              }),
              {
                then: function then(_callback) {
                  callback = _callback;
                },
              }
            );
          },
      count = 0,
      THREE = void 0,
      ZipLoader = (function () {
        function ZipLoader(url) {
          _classCallCheck$2(this, ZipLoader),
            (this._id = count),
            (this._listeners = {}),
            (this.url = url),
            (this.files = null),
            count++;
        }
        return (
          (ZipLoader.unzip = function unzip(blobOrFile) {
            return new PromiseLike(function (resolve) {
              var instance = new ZipLoader(),
                fileReader = new FileReader();
              (fileReader.onload = function (event) {
                var arrayBuffer = event.target.result;
                (instance.files = parseZip(arrayBuffer)), resolve(instance);
              }),
                blobOrFile instanceof Blob &&
                  fileReader.readAsArrayBuffer(blobOrFile);
            });
          }),
          (ZipLoader.prototype.load = function load() {
            var _this = this;
            return new PromiseLike(function (resolve) {
              var startTime = Date.now(),
                xhr = new XMLHttpRequest();
              xhr.open("GET", _this.url, !0),
                (xhr.responseType = "arraybuffer"),
                (xhr.onprogress = function (e) {
                  _this.dispatch({
                    type: "progress",
                    loaded: e.loaded,
                    total: e.total,
                    elapsedTime: Date.now() - startTime,
                  });
                }),
                (xhr.onload = function () {
                  (_this.files = parseZip(xhr.response)),
                    _this.dispatch({
                      type: "load",
                      elapsedTime: Date.now() - startTime,
                    }),
                    resolve();
                }),
                (xhr.onerror = function (e) {
                  _this.dispatch({ type: "error", error: e });
                }),
                xhr.send();
            });
          }),
          (ZipLoader.prototype.extractAsBlobUrl = function extractAsBlobUrl(
            filename,
            type
          ) {
            if (this.files[filename].url) return this.files[filename].url;
            var blob = new Blob([this.files[filename].buffer], { type: type });
            return (
              (this.files[filename].url = URL.createObjectURL(blob)),
              this.files[filename].url
            );
          }),
          (ZipLoader.prototype.extractAsText = function extractAsText(
            filename
          ) {
            var buffer = this.files[filename].buffer;
            if ("undefined" != typeof TextDecoder)
              return new TextDecoder().decode(buffer);
            for (var str = "", i = 0, l = buffer.length; i < l; i++)
              str += _StringfromCharCode(buffer[i]);
            return decodeURIComponent(escape(str));
          }),
          (ZipLoader.prototype.extractAsJSON = function extractAsJSON(
            filename
          ) {
            return JSON.parse(this.extractAsText(filename));
          }),
          (ZipLoader.prototype.loadThreeJSON = function loadThreeJSON(
            filename
          ) {
            var _this2 = this,
              json = this.extractAsJSON(filename),
              dirName = filename.replace(/\/.+\.json$/, "/"),
              pattern = "__ziploader_" + this._id + "__",
              regex = new RegExp(pattern);
            return (
              -1 !== !THREE.Loader.Handlers.handlers.indexOf(regex) &&
                THREE.Loader.Handlers.add(regex, {
                  load: function load(filename) {
                    return _this2.loadThreeTexture(filename.replace(regex, ""));
                  },
                }),
              THREE.JSONLoader.prototype.parse(json, pattern + dirName)
            );
          }),
          (ZipLoader.prototype.loadThreeTexture = function loadThreeTexture(
            filename
          ) {
            var texture = new THREE.Texture(),
              type = /\.jpg$/.test(filename)
                ? "image/jpeg"
                : /\.png$/.test(filename)
                ? "image/png"
                : /\.gif$/.test(filename)
                ? "image/gif"
                : void 0,
              blob = new Blob([this.files[filename].buffer], { type: type });
            return (
              (texture.image = new Image()),
              texture.image.addEventListener("load", function onload() {
                (texture.needsUpdate = !0),
                  texture.image.removeEventListener("load", onload),
                  URL.revokeObjectURL(texture.image.src);
              }),
              (texture.image.src = URL.createObjectURL(blob)),
              texture
            );
          }),
          (ZipLoader.prototype.on = function on(type, listener) {
            this._listeners[type] || (this._listeners[type] = []),
              -1 === this._listeners[type].indexOf(listener) &&
                this._listeners[type].push(listener);
          }),
          (ZipLoader.prototype.off = function off(type, listener) {
            var listenerArray = this._listeners[type];
            if (!!listenerArray) {
              var index = listenerArray.indexOf(listener);
              -1 !== index && listenerArray.splice(index, 1);
            }
          }),
          (ZipLoader.prototype.dispatch = function dispatch(event) {
            var listenerArray = this._listeners[event.type];
            if (!!listenerArray) {
              event.target = this;
              for (var length = listenerArray.length, i = 0; i < length; i++)
                listenerArray[i].call(this, event);
            }
          }),
          (ZipLoader.prototype.clear = function clear(filename) {
            if (!!filename)
              return (
                URL.revokeObjectURL(this.files[filename].url),
                void delete this.files[filename]
              );
            for (var key in this.files)
              URL.revokeObjectURL(this.files[key].url);
            if ((delete this.files, !!THREE)) {
              var pattern = "__ziploader_" + this._id + "__";
              THREE.Loader.Handlers.handlers.some(function (el, i) {
                if (el instanceof RegExp && el.source === pattern)
                  return THREE.Loader.Handlers.handlers.splice(i, 2), !0;
              });
            }
          }),
          (ZipLoader.install = function install(option) {
            !option.THREE || (THREE = option.THREE);
          }),
          ZipLoader
        );
      })();
    __webpack_exports__.a = ZipLoader;
  },
]);
