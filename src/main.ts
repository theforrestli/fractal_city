import * as _ from "underscore";
import {Vector} from "./util";
import {Cell, FloorGame} from "./game";
import {FloorGameController} from "./controller";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
function resize() {
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
}

class Application {
  controller: FloorGameController;

  registerListener() {
    window.addEventListener("mousemove", this.handleMousemove.bind(this));
    document.addEventListener("mousedown", () => this.controller.mouseDown(),true);
    document.addEventListener("mouseup", () => this.controller.mouseUp(), true);
    document.addEventListener("keydown", e => this.handleKey(e), true);
  }

  handleMousemove(event: MouseEvent) {
    this.controller.mouseMove(new Vector(event.clientX, event.clientY));
  }
  handleKey(event: KeyboardEvent) {
    this.controller.handleKey(event);
  }

}

resize();
let game = new FloorGame(10,10);
let controller = new FloorGameController(game, canvas);
let application = new Application();
application.controller = controller;
application.registerListener();

game.setCell(new Vector(1,1),new Cell("room", 0, "", 0));

function redraw() {
  controller.draw(ctx);
  requestAnimationFrame(redraw);
}
redraw();

function update() {
  game.update();
}
const timer = setInterval(update, 500);

const _export = {
  canvas,
  ctx,
  util: {
  },
  FloorGame,
  FloorGameController,
  Application,
  game,
  controller,
  application,
  resize,
  update,
  timer,
}

export default _export;
Object.assign(window, _export);
window["main"] = _export;

