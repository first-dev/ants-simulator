let simulation;
let settings;
let graphics;
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
function checkbox(element) {
  const action = element.dataset.action;
  const value = element.checked;
  simulationControl(action, value)
}
function simulationControl(action, value) {
  if(typeof(value) === "string") value = parseInt(value);
  let fpsCount      = document.querySelector("#fpsCount");
  let cpsCount      = document.querySelector("#cpsCount");
  let antsCount     = document.querySelector("#antsCount");
  let cyclesCounter = document.querySelector("#cyclesCount");
  // update cps and fps counters every 0.5 second
  let updateDuration = 500;

  let lastFpsUpdate = new Date().getTime();
  let fpsCountStartingTime = new Date().getTime();
  let fpsCountEndingTime;
  function animate() {
    // update fps counter
    fpsCountEndingTime = new Date().getTime();
    if (new Date().getTime() - lastFpsUpdate > updateDuration) {
      let fpsCountValue = Math.floor(1000/(fpsCountEndingTime-fpsCountStartingTime));
      fpsCount.innerText = ""+fpsCountValue;
      lastFpsUpdate = new Date().getTime();
    }
    fpsCountStartingTime = new Date().getTime();

    graphics.render(simulation);

    if(continueAnimating) requestAnimationFrame(animate);
  }

  let lastCpsUpdate = new Date().getTime();
  let cpsCountStartingTime = new Date().getTime();
  let cpsCountEndingTime;
  function step() {
    // update cps counter
    cpsCountEndingTime = new Date().getTime();
    if (new Date().getTime() - lastCpsUpdate > updateDuration) {
      let fpsCountValue = Math.floor(1000/(cpsCountEndingTime-cpsCountStartingTime));
      if(fpsCountValue!==Infinity)  cpsCount.innerText = ""+fpsCountValue;
      lastCpsUpdate = new Date().getTime();
    }
    cpsCountStartingTime = new Date().getTime();
    // update ants counter
    antsCount.innerText = ""+simulation.config.antsNumber;
    // update cycles counter
    cyclesCounter.innerText = ""+simulation.cycles;

    simulation.step();
  }
  switch (action) {
    case "stop":
      return false;

       break;
    case "reset":
      return false;

       break;
    case "play":
      if (!initialized) initialize();

      if (simulation.state === 1) return false;

      intervalId = setInterval(function () {
        step();
      }, 1000/simulation.config.cps);
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
      if (!initialized) return false;
        value = value * 5;
        simulation.config.cps = value;
        clearInterval(intervalId);
        intervalId = setInterval(function () {
          step();
        }, 1000/simulation.config.cps);
      break;
    case "ants_number":
      if (!initialized) return false;
        value = value * 10;
        if (value>simulation.config.antsNumber) {// add ants
          let toGenerate =  value - simulation.config.antsNumber;
          simulation.generateAnts(toGenerate);
        } else {// delete ants
          let antsNumber = simulation.config.antsNumber;
          let toDelete = antsNumber - value;
          simulation.deleteAnts(toDelete);
        }
      break;
    case "pheromones_fade":
      if (!initialized) return false;
      value = value*-1/1000+1; //[0.9 ~ 1]
      simulation.config.pheromonesFade = value;
      break;
    case "strength_degradation":
      if (!initialized) return false;
      value = value*-1/1000+1; //[0.9 ~ 1]
      simulation.config.strengthDegradation = value;
      break;
    case "cycles_per_update":
      if (!initialized) return false;
      simulation.config.cyclesPerUpdate = value;//[1 ~ 10]
      break;
    case "step_size":
      if (!initialized) return false;
      simulation.config.stepSize = value;//[1 ~ 10]
      break;
    case "brightness":
      if (!initialized) return false;
      graphics.sittings.brightness = value/20;//[ ~ ]
      break;
    case "accurate_position":
      if (!initialized) return false;
      graphics.sittings.accuratePosition = value;//[ ~ ]
      break;
    case "enabled_rotation":
      if (!initialized) return false;
      graphics.sittings.enabledRotation = value;//[ ~ ]
      break;
    case "use_image":
      if (!initialized) return false;
      graphics.sittings.useImage = value;//[ ~ ]
      break;
  }

  function initialize() {
    let canvas = document.querySelector("#canvas");
    let cps =                   parseInt(document.querySelector("#simulation_speed"       ).value) * 5;
    let antsNumber =            parseInt(document.querySelector("#ants_number"            ).value) * 10;
    let pheromonesFade =        parseInt(document.querySelector("#pheromones_fade"        ).value)*-1/1000+1; //[0.9~  1]
    let strengthDegradation =   parseInt(document.querySelector("#strength_degradation"   ).value)*-1/1000+1; //[0.9~  1]
    let cyclesPerUpdate =       parseInt(document.querySelector("#cycles_per_update"      ).value);           //[1  ~ 10]
    let stepSize =              parseInt(document.querySelector("#step_size"              ).value);           //[1  ~ 10]
    let brightness =            parseInt(document.querySelector("#brightness"             ).value)/20;           //[1  ~ 10]
    let accuratePosition =               document.querySelector("#accurate_position"      ).checked;           //[1  ~ 10]
    let enabledRotation =                document.querySelector("#enabled_rotation"       ).checked;           //[1  ~ 10]
    let useImage =                       document.querySelector("#use_image"              ).checked;           //[1  ~ 10]
    settings = new Settings([2, 6], accuratePosition, enabledRotation, useImage, brightness);
    graphics = new Graphics(canvas, settings);
    graphics.getCanvasReady();
    let configurations = new Configurations(canvas, antsNumber, 50, [100, 150], 50,
        [canvas.width-100, canvas.height-100], cps, stepSize, pheromonesFade, strengthDegradation, cyclesPerUpdate);
    simulation = new Simulation(configurations);
    simulation.generateAnts(simulation.config.antsNumber);
    graphics.render(simulation);
    initialized = true;
  }

  return true;
}
