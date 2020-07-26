import * as _ from "underscore";


const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
function resize() {
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
}

function mod(a: number, n: number) {
  return (a+n)%n;
}


interface Cell {
  t: string;
  direction: number;
  color: string;
  time: number;
}
interface Game {
  update(): void;
}
class Matrix {
  a: number = 0;
  b: number = 0;
  c: number = 0;
  d: number = 0;
  e: number = 0;
  f: number = 0;

  mulV(v: Vector): Vector {
    return new Vector(this.a*v.x+this.b*v.y+this.c, this.d*v.x+this.e*v.y+this.f);
  }
  inverse(): Matrix {
    const rtn = new Matrix();
    const det = this.a*this.e-this.b*this.d;
    rtn.a = this.e/det;
    rtn.b = -this.b/det;
    rtn.c = -(this.c*this.e-this.b*this.f)/det;
    rtn.d = -this.d/det;
    rtn.e = this.a/det;
    rtn.f = (this.c*this.d-this.a*this.f)/det;
    return rtn;
  }

  applyCtx(ctx: CanvasRenderingContext2D): void {
    ctx.transform(this.a, this.d, this.b, this.e, this.c, this.f);
  }
}

class Vector {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  add(v: Vector): Vector {
    return new Vector(this.x + v.x, this.y+v.y);
  }

  mult(k: number): Vector {
    return new Vector(this.x*k, this.y*k);
  }

  toInt(threshold: number = 0.5): Vector {
    return new Vector((this.x + threshold)|0, (this.y + threshold)|0);
  }

  applyDirection(direction: number, k: number): Vector {
    return this.add(DIRECTION_MAP[direction].mult(k));
  }

  size(): number {
    return Math.hypot(this.x, this.y);
  }
}

const DIRECTION_MAP = [
  new Vector(1,0),
  new Vector(0,1),
  new Vector(-1,0),
  new Vector(0,-1),
]

const GENERATION_SPEED = 0.05;
const MOVE_SPEED = 0.1;
const BALL_SIZE = 0.1;
class FloorGame {
  time: number;
  width: number;
  height: number;
  grid: Cell[][];
  balls: {color: string, position: Vector}[];
  constructor(w: number, h: number) {
    this.time = 0;
    this.width = w;
    this.height = h;
    this.grid = [...Array(h)].map(e => [...Array(w)].map(e2 => ({t: "", direction: 0, color: "", time: 0})));
    this.balls = [];
  }

  setCell(v: Vector, cell: Cell): void {
    if(this.checkPosition(v)) {
      this.grid[v.y][v.x] = cell;
    }
  }

  getCell(x,y): Cell {
    return this.grid[y][x];
  }

  update(): void {
    this.time += 1;
    for(let x = 0;x<this.width;x++){
      for(let y = 0;y<this.height;y++){
        const cell = this.grid[y][x];
        if(cell.t == "room") {
          cell.time += GENERATION_SPEED;
          if(cell.time >= 1) {
            cell.time -= 1;
            this.balls.push({color: cell.color, position: new Vector(x,y)});
          }
        }
      }
    }
    for(let t = 0;t<this.balls.length;t++) {
      const ball = this.balls[t];

      const vInt = ball.position.toInt(0.5);
      const cell = this.grid[vInt.y][vInt.x];
      const newBall = Object.assign({}, ball);
      if(cell.t == "room" || cell.t == "belt") {
        const newPosition = ball.position.applyDirection(cell.direction, MOVE_SPEED);
        const newPositionInt = newPosition.toInt(0.5);
        if(this.checkPosition(newPositionInt)) {
          newBall.position=newPosition;
          const newCell = this.grid[newPositionInt.y][newPositionInt.x];
        }
      }
    }
  }
  
  getTouchingCellsForBall(v: Vector, size: number): Vector[] {
    const r = size / 2;
    const result = new Set<Vector>();
    [
      new Vector(r, r),
      new Vector(r, -r),
      new Vector(-r, -r),
      new Vector(-r, r)
    ].forEach(delta => {
      const corner = v.add(delta).toInt(0.5);
      result.add(corner);
    });
    return Array.from(result);
  }

  checkPosition(v: Vector): boolean {
    return (v.x>=0)&&(v.x<this.width)&&(v.y>=0)&&(v.y<this.height)&&((v.x|0)==v.x)&&((v.y|0)==v.y);
  }
}

class FloorGameController {
  game: FloorGame;
  v: Vector = new Vector(0,0);
  down: boolean = false;
  t: string = "room";
  transform: Matrix;
  direction = 0;

  constructor(game: FloorGame) {
    this.game = game;
    this.transform = new Matrix();
    this.transform.a = 50;
    this.transform.e = 50;
    this.transform.a = 50;
    this.transform.c = 25;
    this.transform.f = 25;
  }
  mouseMove(v: Vector) {
    this.v = v;
  }
  mouseDown() {
    this.down = true;
    const gameVInt = this.getGameVInt();
    game.setCell(gameVInt,{t: this.t, direction: this.direction, time: 0, color: ""});
  }
  mouseUp() {
    this.down = false;
  }

  handleKey(event: KeyboardEvent) {
    switch(event.key) {
      case "q":
        this.direction = mod(this.direction - 1, 4);
        break;
      case "e":
        this.direction = mod(this.direction + 1, 4);
        break;
      case "1":
        this.t = "room";
        break;
      case "2":
        this.t = "belt";
      case "3":
        this.t = "";
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawGame(ctx);
    this.drawCursor(ctx);
  }

  drawGame(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    this.transform.applyCtx(ctx);
    const game = this.game;
    for(let x = 0;x<game.width;x++){
      for(let y = 0;y<game.height;y++){
        const c = game.grid[y][x];
        ctx.save();
        ctx.translate(x,y);
        switch(c.t) {
          case "":
            break;
          case "room":
            let ratio = c.time;
            if(ratio > 1) {
              ratio = 1;
            }

            //draw room
            ctx.save();
            ctx.rotate(c.direction*Math.PI/2);
            ctx.drawImage(roomImage, 0,0,100,100,-0.5,-0.5,1,1);
            ctx.restore();

            //draw dot
            // ctx.fillStyle = "#000000";
            // ctx.beginPath()

            // ctx.fillStyle = c.color;
            // ctx.beginPath();
            // ctx.arc(0,0,0.1,0,Math.PI*2)
            // ctx.fill();

            //draw timer
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.moveTo(0,0);
            ctx.lineTo(0.3,0);
            ctx.arc(0,0,0.3,0,Math.PI*2*ratio)
            ctx.lineTo(0,0);
            ctx.fill();

            break;
        }
        ctx.restore();
      }
    }
    for(let t = 0;t<game.balls.length;t++){
      const ball = game.balls[t];
      ctx.save();
      ctx.translate(ball.position.x, ball.position.y);
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(0,0,0.1,0,Math.PI*2)
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  drawMenu(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    ctx.restore();
  }

  drawCursor(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    this.transform.applyCtx(ctx);
    const gameVInt = this.getGameVInt();
    if(game.checkPosition(gameVInt)) {
      ctx.save()
      ctx.translate(gameVInt.x, gameVInt.y);
      ctx.globalAlpha = 0.5;
      ctx.rotate(this.direction*Math.PI/2);
      ctx.drawImage(roomImage, 0,0,100,100,-0.5,-0.5,1,1);
      ctx.restore();
    }
    ctx.restore();
  }
  getGameVInt(): Vector {
    return this.transform.inverse().mulV(this.v).toInt(0.5);
  }
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

const roomImage = new Image();
roomImage.src = "/images/room.png";

resize();
let game = new FloorGame(10,10);
let controller = new FloorGameController(game);
let application = new Application();
application.controller = controller;
application.registerListener();

game.setCell(new Vector(1,1),{t: "room", direction: 0, time: 0, color: ""});

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

