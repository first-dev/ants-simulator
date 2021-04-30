let canvas;
let configurations;
let simulation;
let settings;
let graphics;
let simulationSpeed;
let antsNumber;
let timeScale;
let fpsCountStartingTime;
let fpsCountEndingTime;
let fpsCount;
let antsCount;
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
  value = parseInt(value);
  fpsCount = document.querySelector("#fpsCount");
  antsCount = document.querySelector("#antsCount");

  // update the fps counter every 0.5 second
  let lastFpsUpdate = new Date().getTime();
  fpsCountStartingTime = new Date().getTime();
  function animate() {
    fpsCountEndingTime = new Date().getTime();
    if (new Date().getTime() - lastFpsUpdate > 500) {
      let fpsCountValue = Math.floor(1000/(fpsCountEndingTime-fpsCountStartingTime));
      fpsCount.innerText = ""+fpsCountValue;
      lastFpsUpdate = new Date().getTime();
    }
    fpsCountStartingTime = new Date().getTime();
    antsCount.innerText = ""+simulation.config.antsNumber;

    graphics.render(simulation);

    if(continueAnimating)
      requestAnimationFrame(animate);
  }
  switch (action) {
    case "stop":

      break;
    case "reset":

      break;
    case "play":
      if (!initialized) initialize();

      if (simulation.state === 1) return false;

      intervalId = setInterval(function () {
        simulation.step(simulation.config.stepSize);
      }, 1000/(simulation.config.cps*simulation.config.timeScale));
      requestAnimationId = requestAnimationFrame(animate);
      continueAnimating = true;
      simulation.state = 1;

      break;
    case "pause":
      if (simulation.state === 0) return false;

      clearInterval(intervalId);
      cancelAnimationFrame(requestAnimationId);
      continueAnimating = false;
      simulation.state = 0;
      break;
    case "rewind":

      break;
    case "forward":

      break;
    case "simulation_speed":
      if (initialized) {
        value = value / 20;
        simulation.config.timeScale = value;
        clearInterval(intervalId);
        intervalId = setInterval(function () {
          simulation.step(simulation.config.stepSize);
        }, 1000/(simulation.config.cps*simulation.config.timeScale));
      }
      break;
    case "ants_number":
      if (initialized) {
        value = value * 5;
        if (value>simulation.config.antsNumber) {// add ants
          let toGenerate =  value - simulation.config.antsNumber;
          simulation.generateAnts(toGenerate);
        } else {// delete ants
          let antsNumber = simulation.config.antsNumber;
          let toDelete = antsNumber - value;
          simulation.deleteRandomAnts(toDelete);
        }
      }
      break;
  }

  function initialize() {
    canvas = document.querySelector("#canvas");
    simulationSpeed = document.querySelector("#simulation_speed").value;
    antsNumber = document.querySelector("#ants_number").value;
    timeScale = parseInt(simulationSpeed)/20;
    antsNumber = parseInt(antsNumber) * 5;
    // antsNumber = 1;
    settings = new Settings(true, true, false); // TODO : add UI control
    graphics = new Graphics(canvas, settings);
    graphics.getCanvasReady();
    configurations = new Configurations(timeScale, antsNumber, 50, [100, 150], 50,
        [canvas.width-100, canvas.height-100], [2, 4], 200, 50, 5);
    simulation = new Simulation(configurations);
    simulation.generateAnts(simulation.config.antsNumber);
    graphics.render(simulation);
    initialized = true;
  }
  return true;
}
