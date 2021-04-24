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
    if (this.type == TYPE_HOME_ANT) {
      this.type = TYPE_FOOD_ANT;
    } else if (this.type == TYPE_FOOD_ANT) {
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
  generateAnts() {
    for (var i = 0; i < this.config.antsNumber; i++) {
      let xPos = this.config.colonyPosition[0];
      let yPos = this.config.colonyPosition[1];
      yPos += i * this.config.antSize[1];
      let angle = randomAngle();
      this.ants.push(new Ant(TYPE_HOME_ANT, randomPosiiton(this.config, angle), this.config.antFullStamina, angle));
    }

    function randomAngle() {
      return Math.random() * 360;
    }

    function randomPosiiton(config, randAngle) { // generate a random position inside the colony (circle)
      // we take sqrt of the random number to make sure the positions are spread more evenly across the circle
      let r = Math.sqrt(Math.random()) * config.colonyRadius;
      // we orient the ant based on its positions to make sure it's facing the outside
      let theta = randAngle - 90;
      // to cancel the orienting simply make theta = randomAngle()
      let x = config.colonyPosition[0] + Math.cos(theta * Math.PI / 180) * r;
      let y = config.colonyPosition[1] + Math.sin(theta * Math.PI / 180) * r;
      return [x, y];
    }
  }
  step() {

    return false;
  }
  toJson() {

    return "";
  }
}
// Simulation configuration
class Configuration {
  constructor(timeScale, timeStep, antsNumber, colonyRadius, colonyPosition, foodRadius, foodPosition, antSize, antSpeed) {
    if (timeScale === undefined && timeStep === undefined && antsNumber === undefined && colonyPosition === undefined &&
      foodPosition === undefined && antSpeed === undefined) {
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
