class Graphics {
  antImg;
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.antImg = new Image();
    this.antImg.src = "img/ant.svg";
  }
  getCanvasReady() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }
  render(simulation) {

    let ctx = this.ctx;
    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ants
    let ant = null;
    let antXPos = null;
    let antYPos = null;
    ctx.fillStyle = "#5d1c12";
    for (let i = 0; i < simulation.config.antsNumber; i++) {
      ant = simulation.ants[i];
      // corrected ant position since canvas calculate position from top left corner not center
      antXPos = ant.position[0] - simulation.config.antSize[0] / 2;
      antYPos = ant.position[1] - simulation.config.antSize[1] / 2;
      // save the unrotated context of the canvas so we can restore it later
      // the alternative is to untranslate & unrotate after drawing
      ctx.save();
      // move to the position of the ant
      ctx.translate(ant.position[0], ant.position[1]);
      // rotate the canvas to the specified degrees
      ctx.rotate(ant.angle * Math.PI / 180);
      // since the context is rotated, the image will be rotated also
      // and image position will be 0, 0 because context is translated to image position
      // ctx.drawImage(this.antImg, - simulation.config.antSize[0] / 2, - simulation.config.antSize[1] / 2,
      //     simulation.config.antSize[0], simulation.config.antSize[1]);
      // replaced image by a rectangle due to performance issues
      ctx.fillRect(- simulation.config.antSize[0] / 2, - simulation.config.antSize[1] / 2,
          simulation.config.antSize[0]/2, simulation.config.antSize[1]);
      // we’re done with the rotating so restore the unrotated context
      ctx.restore();
    }

    // Colony
    ctx.beginPath();
    ctx.strokeStyle = "White";
    ctx.arc(simulation.config.colonyPosition[0], simulation.config.colonyPosition[1], simulation.config.colonyRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "Red";
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
// TODO: fix changing window size issue
