const TYPE_HOME_ANT = 1;
const TYPE_FOOD_ANT = 0;
const DEFAULT_POSITION = [0, 0];
const DEFAULT_ANGLE = 0;
const FULL_STAMINA = 1.00;
const DEFAULT_TIME_SCALE = 1;
const DEFAULT_ANTS_NUMBER = 1000;
const DEFAULT_COLONY_RADIUS = 100;
const DEFAULT_FOOD_RADIUS = 20;
const ANT_SIZE = [4, 6];
const ANT_SPEED = 1;
let DEFAULT_CPS = 50;
let DEFAULT_STEP_SIZE = 1;

class Ant {
  constructor(type, x, y, stamina, angle) {
    this.type = type || TYPE_HOME_ANT;
    this.x = x || DEFAULT_POSITION[0];
    this.y = y || DEFAULT_POSITION[1];
    this.stamina = stamina || FULL_STAMINA;
    this.angle = angle || DEFAULT_ANGLE;
  }
}

class Simulation {
  constructor(config) {
    this.config = config;
    this.state = 0;
    this.cycles = 0;
    this.ants = [];
    this.pheromonesBuffer = new Uint8ClampedArray(config.canvas.offsetWidth * config.canvas.offsetHeight * 4);
  }
  generateAnts(toGenerate) {
    for (let i = 0; i < toGenerate; i++) {
      this.ants.push(this.generateRandomAnt());
    }
    this.config.antsNumber = this.ants.length;
  }
  generateRandomAnt() {
    let angle = randomAngle();
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
    let randPos = randomPosition(this.config, angle);
    return new Ant(TYPE_HOME_ANT, randPos[0], randPos[1], 1, angle);
  }
  step(step) {
    let ant;
    let xPos;
    let yPos;
    let correctedAngle;
    let cyclesPerUpdate = Math.floor(10/this.config.stepSize);

    if (this.cycles % cyclesPerUpdate === 0) {
      // decay old pheromone
      let offScreenIData = new ImageData(this.pheromonesBuffer, this.config.canvas.width, this.config.canvas.height);
      imagedataFilters.opacity(offScreenIData, {amount: 0.95});// alpha will be 10% after 75 update
      this.pheromonesBuffer = offScreenIData.data;
    }

    // Process ants
    for (let i = 0; i < this.config.antsNumber; i++) {
      ant = this.ants[i];
      xPos = ant.x;
      yPos = ant.y;

      // adding pheromone
      if (this.cycles % cyclesPerUpdate === 0) {
        // adding new pheromone
        // position in buffer based on x and y
        let pos = (Math.floor(yPos) * this.config.canvas.offsetWidth + Math.floor(xPos)) * 4;
        this.pheromonesBuffer[pos  ] = 0;      // R value [0, 255]
        if (ant.type === TYPE_FOOD_ANT){
          this.pheromonesBuffer[pos+1] = 100;  // G value
        }
        if (ant.type === TYPE_HOME_ANT){
          this.pheromonesBuffer[pos+2] = 100;  // B value
        }
        this.pheromonesBuffer[pos+3] = 255;    // alpha channel
      }

      // each step the ant will make a little rotate randomly
      if (this.cycles % cyclesPerUpdate === 0) {
        ant.angle += (Math.random() * 2 - 1) * 10;
      }
      // we substrate 90 degrees because the canvas 0 angle is correspond to 90 degrees in euclidean space
      correctedAngle = ant.angle - 90;
      // then we calculate the projection of the step on X an Y axes
      xPos += step * Math.cos(correctedAngle * Math.PI / 180);
      yPos += step * Math.sin(correctedAngle * Math.PI / 180);

      // check if the new X position is inside the terrain
      while (!isXInsideTerrain(this.config ,xPos)){
        // if not reflect the angle and calculate the X position again
        ant.angle = -ant.angle;
        correctedAngle = ant.angle - 90;
        xPos = ant.x;
        xPos += step * Math.cos(correctedAngle * Math.PI / 180);
      }

      // same for the Y position
      while (!isYInsideTerrain(this.config ,yPos)) {
        ant.angle = 180-ant.angle;
        correctedAngle = ant.angle - 90;
        yPos = ant.y;
        yPos += step * Math.sin(correctedAngle * Math.PI / 180);
        // ant.toggleType();
      }

      // apply the new position
      ant.x = xPos;
      ant.y = yPos;
      // make sure the angle is between 0 and 360 (360 modulo)
      ant.angle = (ant.angle%360 + 360) % 360;
      if(isInsideFood(this.config, xPos, yPos)) {
        ant.type = TYPE_FOOD_ANT;
      }
      if(isInsideColony(this.config, xPos, yPos)) {
        ant.type = TYPE_HOME_ANT;
      }
    }


    function isXInsideTerrain(config, x) {
      return (x > 0 && x < config.canvas.offsetWidth);
    }
    function isYInsideTerrain(config, y) {
      return (y > 0 && y < config.canvas.offsetHeight);
    }
    function isInsideFood(config, x, y) {
      let distance = Math.pow(config.foodPosition[0]-x, 2)+Math.pow(config.foodPosition[1]-y, 2);
      return distance < Math.pow(config.foodRadius, 2);
    }
    function isInsideColony(config, x, y) {
      let distance = Math.pow(config.colonyPosition[0]-x, 2)+Math.pow(config.colonyPosition[1]-y, 2);
      return distance < Math.pow(config.colonyRadius, 2);
    }
    this.cycles++;

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
}

class Configurations {
  // TODO: add multi foods and colony support
  constructor(timeScale, antsNumber, colonyRadius, colonyPosition, foodRadius,
              foodPosition, antSize, antSpeed, cps, stepSize) {
    this.canvas = document.querySelector("#canvas");
    this.timeScale = timeScale || DEFAULT_TIME_SCALE;
    this.antsNumber = antsNumber || DEFAULT_ANTS_NUMBER;
    this.colonyRadius = colonyRadius || DEFAULT_COLONY_RADIUS;
    this.colonyPosition = colonyPosition || [colonyRadius, colonyRadius]; //top left of screen
    this.foodRadius = foodRadius || DEFAULT_FOOD_RADIUS;
    this.foodPosition = foodPosition || [this.canvas.offsetWidth - foodRadius, this.canvas.offsetHeight - foodRadius]; //bottom right of screen
    this.antSize = antSize || ANT_SIZE;
    this.antSpeed = antSpeed || ANT_SPEED;
    this.cps = cps || DEFAULT_CPS;
    this.stepSize = stepSize || DEFAULT_STEP_SIZE;
  }
}
