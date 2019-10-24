# BeatPose

Play a Beat Saber clone with hand movements using Tensorflow.js & Posenet, in the browser! 🎉

*Based on the awesome work by [Supermedium](http://supermedium.com/) on the [beat saver viewer](https://github.com/supermedium/beatsaver-viewer).*

Live demo: [https://beat-pose.netlify.com/](https://beat-pose.netlify.com/)

Blog post: 


## Demo

![Play BeatSaber with hand movements](demo.gif)

## How to use

* Visit the [live demo](https://beat-pose.netlify.com/)
* Allow access to the webcam
* Place yourself about 1-2m away from your computer in a place that has enough light.
* Move your hands to see if the recognition works
* Start playing and hit beats!

## Rules

None! It's not a real game, more of an experiment 🙂.

The only "restriction" is that **the left hand can only destroy the red beats and the right hand, the blue beats**.

## Tech stack

* [A-Frame](https://aframe.io/)
* [Tensorflow.js](https://www.tensorflow.org/js)
* [PoseNet model](https://github.com/tensorflow/tfjs-models/tree/master/posenet)
* [Three.js](https://threejs.org/)

## Development

To run locally, clone this repository and run:

```
npm install
npm run start
```

Then open `localhost:9999` in your browser and the default song should be `Bohemian Rhapsody - Queen`, but you can search for other songs in the bottom search bar.


## Support

These kinds of side projects take me a lot of time so, if you like them, your support would be really appreciated if you want to/can 🙂.

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/D1D2122V8)
