const TYPE_HOME_ANT = 1;
const TYPE_FOOD_ANT = 0;
const DEFAULT_POSITION = [0, 0];
const DEFAULT_ANGLE = 0;
const DEFAULT_STAMINA = 1.00;
const DEFAULT_ANTS_NUMBER = 1000;
const DEFAULT_COLONY_RADIUS = 100;
const DEFAULT_FOOD_RADIUS = 20;
const DEFAULT_CPS = 50;
const DEFAULT_STEP_SIZE = 1;
const DEFAULT_PHEROMONES_FADE = 0.98;
const DEFAULT_STRENGTH_DEGRADATION = 0.99;
const DEFAULT_CYCLES_PER_UPDATE = 2;

class Ant {
  constructor(type, x, y, stamina, angle, pheromoneStrength) {
    this.type = type || TYPE_HOME_ANT;
    this.x = x || DEFAULT_POSITION[0];
    this.y = y || DEFAULT_POSITION[1];
    this.stamina = stamina || DEFAULT_STAMINA;
    this.angle = angle || DEFAULT_ANGLE;
    this.pheromoneStrength = pheromoneStrength || 1;
  }
}

class Simulation {
  constructor(config) {
    this.config = config;
    this.state = 0;
    this.cycles = 0;
    this.ants = [];
    this.pheromonesBuffer = new Uint8ClampedArray(config.canvas.width * config.canvas.height * 4);
    // make the background black
    {
      // create off-screen canvas element
      let offScreenCanvas = document.createElement('canvas');
      let offScreenCtx = offScreenCanvas.getContext('2d');
      offScreenCanvas.width = this.config.canvas.width;
      offScreenCanvas.height = this.config.canvas.height;
      // create imageData object
      let offScreenImageData = offScreenCtx.createImageData(offScreenCanvas.width, offScreenCanvas.height);
      // set our pheromonesBuffer as source
      offScreenImageData.data.set(this.pheromonesBuffer);
      // update canvas with new data
      offScreenCtx.putImageData(offScreenImageData, 0, 0);
      // fill with black
      offScreenCtx.fillStyle = "#000000";
      offScreenCtx.fillRect(0, 0, offScreenCanvas.width, offScreenCanvas.height);
      this.pheromonesBuffer = offScreenCtx.getImageData(0, 0, offScreenCanvas.width, offScreenCanvas.height).data;
    }
  }
  generateAnts(toGenerate) {
    for (let i = 0; i < toGenerate; i++) {
      this.ants.push(generateRandomAnt(this.config));
    }
    this.config.antsNumber = this.ants.length;
    function generateRandomAnt(config) {
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
      let randPos = randomPosition(config, angle);
      return new Ant(TYPE_HOME_ANT, randPos[0], randPos[1], 1, angle, 1);
    }
  }
  deleteAnts(toDelete) {
    let ants = this.ants;
    let randomIndex;
    for (let i = 0; i < toDelete; i++) {
      randomIndex = Math.floor(Math.random() * this.config.antsNumber);
      ants.splice(randomIndex, 1);
      this.config.antsNumber--;
    }
  }
  step() {
    let ant;
    let xPos;
    let yPos;
    let correctedAngle;
    let cyclesPerUpdate = this.config.cyclesPerUpdate;
    let samplingMap;
    let concentrationsMap;

    // add pheromones inside the colony and the food source
    if (this.cycles % (cyclesPerUpdate*10) === 0){
      // create off-screen canvas element
      let offScreenCanvas = document.createElement('canvas');
      let offScreenCtx = offScreenCanvas.getContext('2d');
      offScreenCanvas.width = this.config.canvas.width;
      offScreenCanvas.height = this.config.canvas.height;
      // create imageData object
      let offScreenImageData = offScreenCtx.createImageData(offScreenCanvas.width, offScreenCanvas.height);
      // set our pheromonesBuffer as source
      offScreenImageData.data.set(this.pheromonesBuffer);
      // update canvas with new data
      offScreenCtx.putImageData(offScreenImageData, 0, 0);
      // Colony
      offScreenCtx.beginPath();
      offScreenCtx.strokeStyle = "White";
      offScreenCtx.arc(this.config.colonyPosition[0], this.config.colonyPosition[1], this.config.colonyRadius, 0, 2 * Math.PI);
      offScreenCtx.fillStyle = "#0000ff";
      offScreenCtx.fill();
      // Food
      offScreenCtx.beginPath();
      offScreenCtx.strokeStyle = "White";
      offScreenCtx.arc(this.config.foodPosition[0], this.config.foodPosition[1], this.config.foodRadius, 0, 2 * Math.PI);
      offScreenCtx.fillStyle = "#00ff00";
      offScreenCtx.fill();
      this.pheromonesBuffer = offScreenCtx.getImageData(0, 0, offScreenCanvas.width, offScreenCanvas.height).data;
    }

    // decay old pheromone
    if (this.cycles % cyclesPerUpdate === 0) {
      let offScreenIData = new ImageData(this.pheromonesBuffer, this.config.canvas.width, this.config.canvas.height);
      imagedataFilters.brightness(offScreenIData, {amount: this.config.pheromonesFade});// (x)^t
      this.pheromonesBuffer = offScreenIData.data;
    }

    // calculate ant's next state
    for (let i = 0; i < this.config.antsNumber; i++) {
      ant = this.ants[i];
      xPos = ant.x;
      yPos = ant.y;

      // ants produce weaker pheromones each step
      if (this.cycles % cyclesPerUpdate === 0) {
        ant.pheromoneStrength *= this.config.strengthDegradation;
      }

      // adding pheromone
      if (this.cycles % cyclesPerUpdate === 0) {
        // adding new pheromone
        // position in buffer based on x and y
        let strength = ant.pheromoneStrength;
        strength *= 255;
        let pos = (Math.floor(yPos) * this.config.canvas.width + Math.floor(xPos)) * 4;
        // this.pheromonesBuffer[pos  ] = 0;      // R value [0, 255]
        if (ant.type === TYPE_FOOD_ANT){
          if (strength>this.pheromonesBuffer[pos+1])
            this.pheromonesBuffer[pos+1] += strength;  // G value
        }
        if (ant.type === TYPE_HOME_ANT){
          if (strength>this.pheromonesBuffer[pos+2])
            this.pheromonesBuffer[pos+2] += strength;  // B value
        }
        this.pheromonesBuffer[pos+3] = 255;    // alpha channel
      }

      // each step the ant will make a small rotation randomly
      if (this.cycles % cyclesPerUpdate === 0) {
        ant.angle += (Math.random()*2-1) * 10;
      }

      // ants rotate based on the concentration of pheromones in front of it
      if (this.cycles % cyclesPerUpdate === 0) {
        let concentrations = concentrationInFront(ant, this.pheromonesBuffer, this.config);
        let rotationAngle = 60;
        let LC;
        let MC;
        let RC;
        if (ant.type === TYPE_FOOD_ANT){
          LC = concentrations.leftConcentration.homeConcentration;
          MC = concentrations.middleConcentration.homeConcentration;
          RC = concentrations.rightConcentration.homeConcentration;
        }
        if (ant.type === TYPE_HOME_ANT){
          LC = concentrations.leftConcentration.foodConcentration;
          MC = concentrations.middleConcentration.foodConcentration;
          RC = concentrations.rightConcentration.foodConcentration;
        }
        if ((LC > MC)||(RC > MC)) {
          if(LC > RC) {
            ant.angle -= rotationAngle;
          } else if(RC > LC) {
            ant.angle += rotationAngle;
          }
        }
      }

      // we substrate 90 degrees because the canvas 0 angle is correspond to 90 degrees in euclidean space
      correctedAngle = angleModulo(ant.angle - 90);
      // then we calculate the projection of the step on X an Y axes
      xPos += this.config.stepSize * Math.cos(correctedAngle * Math.PI / 180);
      yPos += this.config.stepSize * Math.sin(correctedAngle * Math.PI / 180);

      // check if the new X position is inside the terrain
      while (!isXInsideTerrain(this.config ,xPos)){
        // if not reflect the angle and calculate the X position again
        ant.angle = -ant.angle;
        correctedAngle = ant.angle - 90;
        xPos = ant.x;
        xPos += this.config.stepSize * Math.cos(correctedAngle * Math.PI / 180);
        // when an ant hits the wall it produce weaker pheromones
        ant.pheromoneStrength /= 8;
      }
      // same for the Y position
      while (!isYInsideTerrain(this.config ,yPos)) {
        ant.angle = 180-ant.angle;
        correctedAngle = ant.angle - 90;
        yPos = ant.y;
        yPos += this.config.stepSize * Math.sin(correctedAngle * Math.PI / 180);
        // when an ant hits the wall it produce weaker pheromones
        ant.pheromoneStrength /= 8;
      }

      if(isInsideFood(this.config, xPos, yPos)) {
        ant.pheromoneStrength = 1;
        if (ant.type === TYPE_HOME_ANT) {
          ant.type = TYPE_FOOD_ANT;
          ant.angle += 180;
        }
      }
      if(isInsideColony(this.config, xPos, yPos)) {
        ant.pheromoneStrength = 1;
        if (ant.type === TYPE_FOOD_ANT) {
          ant.type = TYPE_HOME_ANT;
          ant.angle += 180;
        }
      }

      // apply the new position
      ant.x = xPos;
      ant.y = yPos;
      // make sure the angle is between 0 and 360 (360 modulo)
      ant.angle = angleModulo(ant.angle);
    }

    // functions
    function isXInsideTerrain(config, x) {
      return (x > 0 && x < config.canvas.width);
    }
    function isYInsideTerrain(config, y) {
      return (y > 0 && y < config.canvas.height);
    }
    function isInsideFood(config, x, y) {
      let distance = Math.pow(config.foodPosition[0]-x, 2)+Math.pow(config.foodPosition[1]-y, 2);
      return distance < Math.pow(config.foodRadius, 2);
    }
    function isInsideColony(config, x, y) {
      let distance = Math.pow(config.colonyPosition[0]-x, 2)+Math.pow(config.colonyPosition[1]-y, 2);
      return distance < Math.pow(config.colonyRadius, 2);
    }
    function toRadian(angle) {
      return angle * Math.PI / 180;
    }
    function angleModulo(angle) {
      return (angle%360 + 360) % 360;
    }
    function get1dPosition(x, y, width, range) {
      return (y * width + x) * range;
    }
    function get2dPosition(pos, width, range) {
      let y = Math.floor(pos/(range*width));
      let x = pos/range -y*width;
      return [x, y];
    }
    /**
     * Calculate the sampling positions in front of the ant
     * @param {Ant} ant
     * @returns {Object} - the 3 sampling positions in front of the ant (leftPos, middlePos, and rightPos)
     */
    function getAntSamplingPositions(ant){
      let x = ant.x;
      let y = ant.y;

      // correct the angle
      let antAngle = ant.angle-90; // why?

      // far the sampling areas are from the given position
      let forwardDistance = 20;

      // angle between sampling areas
      let fovAngle = 120;

      // angles of left and right areas
      let leftAngle = antAngle - fovAngle/2;
      let rightAngle = antAngle + fovAngle/2;

      // make sure the angles are between 0 and 360
      antAngle = angleModulo(antAngle);
      leftAngle = angleModulo(leftAngle);
      rightAngle = angleModulo(rightAngle);

      // positions of sampling areas
      let leftPos = {
        x:x + forwardDistance*Math.cos(toRadian(leftAngle)),
        y:y + forwardDistance*Math.sin(toRadian(leftAngle))
      };
      let middlePos = {
        x:x + forwardDistance*Math.cos(toRadian(antAngle)),
        y:y + forwardDistance*Math.sin(toRadian(antAngle))
      };
      let rightPos = {
        x:x + forwardDistance*Math.cos(toRadian(rightAngle)),
        y:y + forwardDistance*Math.sin(toRadian(rightAngle))
      };
      return {
        leftPos: leftPos,
        middlePos: middlePos,
        rightPos: rightPos
      }
    }
    /**
     * Calculate all sampling coordinates for the given ants
     * @param ants {Array<Ant>} Array of ants
     * @returns {Array<{x: number, y: number}>} Array of sampling coordinates
     */
    function getSamplingMap(ants) {
      // returns positions of all sampling areas in a map
      let map = [];
      for (let i = 0; i < ants.length; i++) {
        let samplingPosition = getAntSamplingPositions(ants[i]);
        map.push(samplingPosition.leftPos);
        map.push(samplingPosition.middlePos);
        map.push(samplingPosition.rightPos);
      }
      return map;
    }
    /**
     * Calculate pheromones concentrations of the given sampling map on the **GPU**
     * @param samplingMap {Array<{x: number, y: number}>} Array of sampling coordinates
     * @param buffer {Uint8ClampedArray} Pheromones image
     * @param width {number} width of sampling areas
     * @returns {Array<{homeConcentration, foodConcentration}>} concentrations map
     */
    function getConcentrationMap(samplingMap, buffer, width) {
      let samplingXPos = [];
      let samplingYPos = [];
      for (let i = 0; i < samplingMap.length; i++) {
        samplingXPos.push(samplingMap[i].x);
        samplingYPos.push(samplingMap[i].y);
      }
      const gpu = new GPU();
      const kernel = gpu.createKernel(function(samplingXPos, samplingYPos, buffer, width) {
        let x = samplingXPos[this.thread.x];
        let y = samplingYPos[this.thread.x];

        let amp = 18;
        let homeConcentration = 0;
        let foodConcentration = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        let pos = 0;
        let maxPossibleValue = (255*255*amp*amp*8);
        amp = amp/2;
        for (let currentY = y-amp; currentY <= y+amp ; currentY++) {
          for (let currentX = x-amp; currentX <= x+amp ; currentX++) {
            pos = (currentY * width + currentX) * 4;
            g = buffer[pos+1];          // some G value
            b = buffer[pos+2];          // some B value
            a = buffer[pos+3];          // set alpha channel
            homeConcentration += b*a;
            foodConcentration += g*a;
          }
        }
        // scale to a value between 0 and 1
        homeConcentration = homeConcentration/maxPossibleValue;
        foodConcentration = foodConcentration/maxPossibleValue;

        return [homeConcentration, foodConcentration];
      })
          .setOutput([samplingMap.length]);
      return kernel(samplingXPos, samplingYPos, buffer, width);
    }
    /**
     * Calculate the concentrations of home and food pheromones in 3 areas in front of the ant
     * @param ant {Ant}
     * @param buffer {Uint8ClampedArray} Pheromones image
     * @param config {Configurations} Simulation configurations
     * @returns {Object} - Concentrations {leftConcentration, middleConcentration, rightConcentration}
     */
    function concentrationInFront(ant, buffer, config) {
      // calculate the concentration of pheromones in 3 areas in front of the ant

      // width of sampling area
      let amp =18;

      // positions of sampling areas
      let samplingPositions = getAntSamplingPositions(ant);
      let leftPos = samplingPositions.leftPos;
      let middlePos = samplingPositions.middlePos;
      let rightPos = samplingPositions.rightPos;

      // concentration of each area
      let leftConcentration = pheromoneConcentration(leftPos.x, leftPos.y, amp, buffer, config);
      let middleConcentration = pheromoneConcentration(middlePos.x, middlePos.y, amp, buffer, config);
      let rightConcentration = pheromoneConcentration(rightPos.x, rightPos.y, amp, buffer, config);

      return {
        leftConcentration: leftConcentration,
        middleConcentration: middleConcentration,
        rightConcentration: rightConcentration
      };
    }
    /**
     * Calculate home and food pheromone concentrations in the given area (square)
     * @param x {number} X coordinate of the area
     * @param y {number} Y coordinate of the area
     * @param amp {number} Width of the area
     * @param buffer {Uint8ClampedArray} Pheromones image
     * @param config {Configurations}
     * @returns {{foodConcentration: number, homeConcentration: number}}
     */
    function pheromoneConcentration(x, y, amp, buffer, config) {
      // TODO : run on gpu
      x = Math.floor(x);
      y = Math.floor(y);
      amp = Math.floor(amp);
      let homeConcentration = 0;
      let foodConcentration = 0;
      let r,g,b,a;
      let pos;
      let maxPossibleValue = (255*255*amp*amp*8);
      amp = amp/2;

      for (let currentY = y-amp; currentY <= y+amp ; currentY++) {
        for (let currentX = x-amp; currentX <= x+amp ; currentX++) {
          pos = get1dPosition(currentX, currentY, config.canvas.width, 4);
          //r = buffer[pos  ] || 0;          // some R value [0, 255]
          g = buffer[pos+1] || 0;          // some G value
          b = buffer[pos+2] || 0;          // some B value
          a = buffer[pos+3] || 0;          // set alpha channel
          homeConcentration += b*a;
          foodConcentration += g*a;
        }
      }


      // scale to a value between 0 and 1
      homeConcentration = homeConcentration/maxPossibleValue;
      foodConcentration = foodConcentration/maxPossibleValue;

      //
      homeConcentration = Math.pow(homeConcentration, 1/4);
      foodConcentration = Math.pow(foodConcentration, 1/4);

      return {
        homeConcentration : homeConcentration,
        foodConcentration : foodConcentration
      }
    }


    // finish
    this.cycles++;
    return true;
  }
}

class Configurations {
  constructor(canvas, antsNumber, colonyRadius, colonyPosition, foodRadius,
              foodPosition, cps, stepSize, pheromonesFade, strengthDegradation, cyclesPerUpdate) {
    this.canvas = canvas;
    this.antsNumber = antsNumber || DEFAULT_ANTS_NUMBER;
    this.colonyRadius = colonyRadius || DEFAULT_COLONY_RADIUS;
    this.colonyPosition = colonyPosition || [colonyRadius, colonyRadius]; //top left of screen
    this.foodRadius = foodRadius || DEFAULT_FOOD_RADIUS;
    this.foodPosition = foodPosition || [this.canvas.width - foodRadius, this.canvas.height - foodRadius]; //bottom right of screen
    this.cps = cps || DEFAULT_CPS;
    this.stepSize = stepSize || DEFAULT_STEP_SIZE;
    this.pheromonesFade = pheromonesFade || DEFAULT_PHEROMONES_FADE;
    this.strengthDegradation = strengthDegradation || DEFAULT_STRENGTH_DEGRADATION;
    this.cyclesPerUpdate = cyclesPerUpdate || DEFAULT_CYCLES_PER_UPDATE;
  }
}
