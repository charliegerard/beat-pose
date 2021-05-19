# BeatPose

Play a Beat Saber clone with hand movements using Tensorflow.js & the MoveNet model, in the browser! 🎉

_Based on the awesome work by [Supermedium](http://supermedium.com/) on the [beat saver viewer](https://github.com/supermedium/beatsaver-viewer)._

Live demo: [https://beat-pose.netlify.com/](https://beat-pose.netlify.com/)

[Blog post](https://dev.to/devdevcharlie/playing-beat-saber-in-the-browser-with-body-movements-using-posenet-tensorflow-js-36km)

## Demo

![Play BeatSaber with hand movements](demo.gif)

## How to use

- Visit the [live demo](https://beat-pose.netlify.com/)
- Allow access to the webcam
- Place yourself about 1-2m away from your computer in a place that has enough light.
- Move your hands to see if the recognition works
- Start playing and hit beats!

## Rules

None! It's not a real game, more of an experiment 🙂.

The only "restriction" is that **the left hand can only destroy the red beats and the right hand, the blue beats**.

## Tech stack

- [A-Frame](https://aframe.io/)
- [Tensorflow.js](https://www.tensorflow.org/js)
- [PoseNet model](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/src/movenet)
- [Three.js](https://threejs.org/)

## Development

:warning: **The game was originally built with Node.js v8.9.1 which is pretty old. The install fails on more recent versions.**

To run locally, clone this repository and run:

```
npm install
npm run start
```

As an alternative, you can run the `index.html` file located at the root with a python server like `python -m HTTPServer 5000` for example.

Then open `localhost` (on port `9999` if you ran it with npm) in your browser and the default song should be `Bohemian Rhapsody - Queen`, but you can search for other songs in the bottom search bar.

## Support

These kinds of side projects take me a lot of time so, if you like them, your support would be really appreciated if you want to/can 🙂.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/D1D2122V8)
