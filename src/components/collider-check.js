AFRAME.registerComponent('collider-check', {
    dependencies: ['raycaster'],
  
    init: function () {
        console.log('coming here??')
      this.el.addEventListener('raycaster-intersected', function () {
        console.log('Player hit something!');
        this.raycaster = evt.detail.el;
        console.log(raycaster)
      });
    }
  });