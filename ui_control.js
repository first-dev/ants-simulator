function playback(element) {
  const action = element.dataset.action;
  let img = element.childNodes[1];
  let playPauseElem = document.querySelector("body > div > div.controls-container > div.controls > div.playback > div.playback-buttons > button:nth-child(2)");
  let playPauseImag = playPauseElem.childNodes[1];
  let actionComplete = simulationControl(action, 0);
  if (!actionComplete) return; //if action wasn't successful exit the function
  //else update UI
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
      if (playPauseElem.dataset.action == "pause") {
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
      if (playPauseElem.dataset.action == "pause") {
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
    // generate a colony, food source and a 1000 ant
    let canvas = document.querySelector("#canvas");
    let conf = new Configuration(null, null, 1000, 100, [100, 100], 20,  [canvas.offsetWidth - 20, canvas.offsetHeight - 20], [10, 10], null);
    let simu = new Simulation(conf, null, null);
    let graph = new Graphics(canvas);
    simu.generateAnts();
    graph.getCanvasReady();
    graph.render(simu);
  return true;
}
