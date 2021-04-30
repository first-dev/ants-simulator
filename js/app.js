class Graphics {
  constructor(canvas, sittings) {
    this.canvas = canvas;
    this.sittings = sittings;
    this.ctx = canvas.getContext("2d");
    this.antImg = new Image();
    this.antImg.src = "img/ant.svg";
  }
  getCanvasReady() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }
  // TODO : run on the gpu
  render(simulation) {
    let ctx = this.ctx;
    // Clear previous frame
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pheromones
    // create imageData object
    let iData = ctx.createImageData(this.canvas.width, this.canvas.height);
    // set our buffer as source
    let buffer = simulation.pheromonesBuffer;
    iData.data.set(buffer);
    // update canvas with new data
    ctx.putImageData(iData, 0, 0);

    // Ants
    let ant;
    let antXPos;
    let antYPos;
    let antWidth = simulation.config.antSize[0];
    let antHeight = simulation.config.antSize[1];
    let useImage = this.sittings.useImage;
    function draw(x, y, w, h, isImage, image) {
      if (isImage) {
        ctx.drawImage(image, x, y, w, h);
      } else {
        ctx.fillRect(x, y, w, h);
      }
    }
    for (let i = 0; i < simulation.config.antsNumber; i++) {
      ant = simulation.ants[i];
      // antXPos and antYPos are the positions of the ant at the top left corner
      antXPos = ant.x - antWidth/2;
      antYPos = ant.y - antHeight/2;

      if (ant.type === TYPE_HOME_ANT){
        ctx.fillStyle = "#5d1c12";
      } else {
        ctx.fillStyle = "#576b06";
      }
      if (!this.sittings.accuratePosition) {
        // when the position values are integer the browser doesn't have to calculate the anti-aliasing
        antXPos = Math.floor(antXPos);
        antYPos = Math.floor(antYPos);
      }
      if (this.sittings.enabledRotation) {
        // save the unrotated context of the canvas so we can restore it later
        // the alternative is to untranslate & unrotate after drawing
        ctx.save();
        // move to the position of the ant
        ctx.translate(ant.x, ant.y);
        // rotate the canvas to the specified degrees
        ctx.rotate(ant.angle * Math.PI / 180);
        draw(-antWidth/2, -antHeight/2, antWidth, antHeight, useImage, this.antImg);
        // we’re done with the rotating so restore the unrotated context
        ctx.restore();
      } else {
        draw(antXPos, antYPos, antWidth, antHeight, useImage, this.antImg);
      }
    }

    // Colony
    ctx.beginPath();
    ctx.strokeStyle = "White";
    ctx.arc(simulation.config.colonyPosition[0], simulation.config.colonyPosition[1], simulation.config.colonyRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "Blue";
    ctx.fill();
    ctx.stroke();

    // Food
    ctx.beginPath();
    ctx.strokeStyle = "White";
    ctx.arc(simulation.config.foodPosition[0], simulation.config.foodPosition[1], simulation.config.foodRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "Green";
    ctx.fill();
    ctx.stroke();

  }

}
class Settings {
  constructor(accuratePosition, enabledRotation, useImage) {
    this.accuratePosition = accuratePosition;
    this.enabledRotation = enabledRotation;
    this.useImage = useImage;
  }
}
