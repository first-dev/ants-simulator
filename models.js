const TYPE_HOME_ANT = true;
const TYPE_FOOD_ANT = false;
const DEFAULT_POSITION = [0, 0];
const DEFAULT_ANGLE = 20;
const FULL_STAMINA = 1.00;
const STATE_ON = 1;
const STATE_OFF = 0;
// TODO: change how empty constructors works (if (a===undefined) a=defaultA;if (b===undefined) b=defaultB;)

class Ant {
  constructor(type, position, stamina, angle) {
    // if object created empty (let ant1 = new Ant();) initialize default values
    if (type === undefined && position === undefined && stamina === undefined) {
      type = TYPE_HOME_ANT;
      position = DEFAULT_POSITION;
      angle = DEFAULT_ANGLE;
      stamina = FULL_STAMINA;
    }
    this.type = type;
    this.position = position;
    this.angle = angle;
    this.stamina = stamina;
  }
  toggleType() {
    if (this.type === TYPE_HOME_ANT) {
      this.type = TYPE_FOOD_ANT;
    } else if (this.type === TYPE_FOOD_ANT) {
      this.type = TYPE_HOME_ANT;
    }
  }
}

class Simulation {
  constructor(config, state, time) {
    this.config = config;
    this.state = state;
    this.time = time;
    this.ants = [];
  }
  generateAnts(toGenerate) {
    for (let i = 0; i < toGenerate; i++) {
      this.ants.push(this.generateRandomAnt());
    }
    this.config.antsNumber = this.ants.length;
  }
  generateRandomAnt() {
    let angle = randomAngle();
    let newAnt = new Ant(TYPE_HOME_ANT, randomPosition(this.config, angle), this.config.antFullStamina, angle);
    function randomAngle() {
      return Math.random() * 360;
    }
    function randomPosition(config, randAngle) { // generate a random position inside the colony (circle)
      // we take sqrt of the random number to make sure the positions are spread more evenly across the circle
      let r = Math.sqrt(Math.random()) * config.colonyRadius;
      // we orient the ant based on its positions to make sure it's facing the outside
      let theta = randAngle - 90;
      // to cancel the orienting simply make theta = randomAngle()
      let x = config.colonyPosition[0] + Math.cos(theta * Math.PI / 180) * r;
      let y = config.colonyPosition[1] + Math.sin(theta * Math.PI / 180) * r;
      return [x, y];
    }
    return newAnt;
  }
  step(step) {
    let ant = null;
    // let step = 2;
    let xPos = null;
    let yPos = null;
    let angle = null;
    for (let i = 0; i < this.config.antsNumber; i++) {
      ant = this.ants[i];
      xPos = ant.position[0];
      yPos = ant.position[1];
      // we substrate 90 degrees because the canvas 0 angle is correspond to the Euclidean 90 degrees
      // (canvas angles start from the top)
      angle = ant.angle - 90;
      // then we calculate the projection of the step on X an Y axes
      xPos += step * Math.cos((angle) * Math.PI / 180);
      yPos += step * Math.sin((angle) * Math.PI / 180);

      // check if the new X position is inside the terrain
      if (!isXInsideTerrain(xPos)){
        // if reflect the angle and calculate the X position again
        // the part +360) % 360 is to make sure the angle is between 0 and 360 (360 modulo)
        ant.angle = ((-ant.angle)+360) % 360;
        angle = ant.angle - 90;
        xPos = ant.position[0];
        xPos += step * Math.cos((angle) * Math.PI / 180);
      }
      // same for the Y position
      if (!isYInsideTerrain(yPos)) {
        ant.angle = ((180-ant.angle)+360) % 360;
        angle = ant.angle - 90;
        yPos = ant.position[1];
        yPos += step * Math.sin((angle) * Math.PI / 180);
      }

      // apply the new position
      ant.position = [xPos, yPos];
    }

    function isXInsideTerrain(x) {
      let canvas = document.querySelector("#canvas");
      if (x>0 && x<canvas.offsetWidth){
        return true;
      } else {
        return false;
      }
      return null;
    }
    function isYInsideTerrain(y) {
      let canvas = document.querySelector("#canvas");
      if (y>0 && y<canvas.offsetHeight){
        return true;
      } else {
        return false;
      }
      return null;
    }
    return true;
  }
  deleteRandomAnts(toDelete) {
    let ants = this.ants;
    let randomIndex;
    for (let i = 0; i < toDelete; i++) {
      randomIndex = Math.floor(Math.random() * this.config.antsNumber);
      ants.splice(randomIndex, 1);
      this.config.antsNumber--;
    }
  }

  toJson() {

    return "";
  }
}
// Simulation configuration
class Configuration {
  // TODO: remove timeStep parameter
  // TODO: add multi foods and colony support
  constructor(timeScale, timeStep, antsNumber, colonyRadius, colonyPosition, foodRadius, foodPosition, antSize, antSpeed) {
    if (timeScale === undefined && timeStep === undefined && antsNumber === undefined && colonyPosition === undefined &&
      foodPosition === undefined && antSpeed === undefined) {
      // TODO: add canvas to Configuration parameters
      let canvas = document.querySelector("#canvas");
      // TODO: declare official default values
      timeScale = null;
      timeStep = null;
      colonyRadius = 100;
      foodRadius = 20;
      antsNumber = 1000;
      colonyPosition = [colonyRadius, colonyRadius]; //top left of screen
      foodPosition = [canvas.offsetWidth - foodRadius, canvas.offsetHeight - foodRadius]; //bottom right of screen
      antSize = [10, 10];
      antSpeed = 1;
    }
    this.timeScale = timeScale;
    this.timeStep = timeStep;
    this.antsNumber = antsNumber;
    this.colonyRadius = colonyRadius;
    this.colonyPosition = colonyPosition;
    this.foodRadius = foodRadius;
    this.foodPosition = foodPosition;
    this.antSize = antSize;
    this.antSpeed = antSpeed;
  }
}
