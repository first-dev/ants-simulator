let canvas;
let conf;
let simu;
let graph;
let simulationSpeed;
let antsNumber;
let timeScale;
let startingTime;
let endingTime;
let fpsCount;
let antsCount;
let fps;
let requestAnimationId;
let intervalId;
let initialized = false;
let continueAnimating;

function playback(element) {
  const action = element.dataset.action;
  let img = element.childNodes[1];
  let playPauseElem = document.querySelector("body > div > div.controls-container > div.controls > div.playback > div.playback-buttons > button:nth-child(2)");
  let playPauseImag = playPauseElem.childNodes[1];
  let actionComplete = simulationControl(action, 0);
  if (!actionComplete) return; // if action wasn't successful exit the function
  // else update UI
  switch (action) {
    case "stop":
      //change button to reset
      element.dataset.action = "reset";
      img.alt = "Reset";
      img.src = "img/reset.svg";
      //since reset image looks smaller it needs adjustments
      element.style.padding = "14px";
      img.style.width = "20px";
      img.style.height = "20px";

      //change button to play if it is pause (stop the simulation)
      if (playPauseElem.dataset.action === "pause") {
        playPauseElem.dataset.action = "play";
        playPauseImag.alt = "Play";
        playPauseImag.src = "img/play.svg";
      }
      break;
    case "reset":
      //change button to stop
      element.dataset.action = "stop";
      img.alt = "Stop";
      img.src = "img/stop.svg";
      //undo reset image adjustments
      element.style = "";
      img.style = "";

      //change button to play if it is pause (stop the simulation)
      if (playPauseElem.dataset.action === "pause") {
        playPauseElem.dataset.action = "play";
        playPauseImag.alt = "Play";
        playPauseImag.src = "img/play.svg";
      }
      break;
    case "play":
      //change button to pause
      element.dataset.action = "pause";
      img.alt = "Pause";
      img.src = "img/pause.svg";

      break;
    case "pause":
      // change button to play
      element.dataset.action = "play";
      img.alt = "Play";
      img.src = "img/play.svg";
      break;
    case "rewind":
      break;
    case "forward":

      break;
    default:

  }
}

function slider(element) {
  const action = element.dataset.action;
  const value = element.value;
  simulationControl(action, value)
}
function simulationControl(action, value) {
  // TODO : add return
  value = parseInt(value);
  fpsCount = document.getElementById("fpsCount");
  antsCount = document.getElementById("antsCount");
  fps = 50;


  // we use cycles to update the fps counter every 30
  let cycles = 0;
  startingTime = new Date().getTime();
  function animate() {
    endingTime = new Date().getTime();
    if (cycles % 30 === 0) {
      let fpsCountValue = Math.floor(1000/(endingTime-startingTime));
      fpsCount.innerText = ""+fpsCountValue;
    }
    cycles++;
    startingTime = new Date().getTime();
    antsCount.innerText = ""+simu.config.antsNumber;
    graph.render(simu);
    if(continueAnimating)
      requestAnimationFrame(animate);
  }
  switch (action) {
    case "stop":

      break;
    case "reset":

      break;
    case "play":
      if (!initialized) {
        initialize();
      }

      // make steps at a speed based on the simulation configuration
      intervalId = setInterval(function () {
        simu.step(simu.config.antSpeed/fps * simu.config.timeScale);
      }, 1000/fps);
      requestAnimationId = requestAnimationFrame(animate);
      continueAnimating = true;

      break;
    case "pause":
      clearInterval(intervalId);
      cancelAnimationFrame(requestAnimationId);
      continueAnimating = false;
      break;
    case "rewind":

      break;
    case "forward":

      break;
    case "simulation_speed":
      value = value / 20;
      simu.config.timeScale = value;
      break;
    case "ants_number":
      value = value * 20;
      if (value>simu.config.antsNumber) {// add ants
        let toGenerate =  value - simu.config.antsNumber;
        simu.generateAnts(toGenerate);
      } else {// delete ants
        let antsNumber = simu.config.antsNumber;
        let toDelete = antsNumber - value;
        simu.deleteRandomAnts(toDelete);
      }
      break;
  }

  function initialize() {
    canvas = document.querySelector("#canvas");
    simulationSpeed = document.querySelector("#simulation_speed").value;
    antsNumber = document.querySelector("#ants_number").value;
    timeScale = parseInt(simulationSpeed)/20;
    antsNumber = parseInt(antsNumber) * 20;
    conf = new Configuration(timeScale, 1, antsNumber, 100, [100, 100],
        20,  [canvas.offsetWidth - 20, canvas.offsetHeight - 20], [4, 8], 200);
    simu = new Simulation(conf, null, null);
    graph = new Graphics(canvas);
    simu.generateAnts(simu.config.antsNumber);
    graph.getCanvasReady();
    graph.render(simu);
    initialized = true;
  }
  return true;
}
