import * as _ from "underscore";
import {mod, Box, Vector, Matrix} from "./util";
import {Ball, Cell, FloorGame, CELL_BOXES} from "./game";

const roomImage = new Image();
roomImage.src = "/images/room.png";
const beltImage = new Image();
beltImage.src = "/images/belt.png";

export class FloorGameController {
  canvas: HTMLCanvasElement;
  game: FloorGame;
  v: Vector = new Vector(0,0);
  down: boolean = false;
  t: string = "room";
  transform: Matrix;
  direction = 0;

  constructor(game: FloorGame, canvas: HTMLCanvasElement) {
    this.canvas = canvas;
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
    this.game.setCell(gameVInt,new Cell(this.t, this.direction, "", 0));
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
        break;
      case "3":
        this.t = "";
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGame(ctx);
    this.drawDebug(ctx);
    this.drawCursor(ctx);
  }

  drawDebug(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    this.transform.applyCtx(ctx);
    for(let x = 0;x<this.game.width;x++){
      for(let y = 0;y<this.game.height;y++){
        const cell = this.game.grid[y][x];
        if(cell.t !== "room") {
          continue;
        }
        const vInt = new Vector(x,y);
        const boxes = CELL_BOXES.map(box => box.rotate(cell.direction).move(vInt));
        _.each(boxes, box => {
          ctx.fillStyle = "#FF3333";
          ctx.fillRect(box.x1, box.y1, box.x2-box.x1, box.y2-box.y1);
        });
      }
    }
    ctx.restore();
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
          case "belt":
            ctx.save();
            ctx.rotate(c.direction*Math.PI/2);
            ctx.drawImage(beltImage, 0,0,100,100,-0.5,-0.5,1,1);
            ctx.restore();
            break;

        }
        ctx.restore();
      }
    }
    _.each(game.balls, ball => {
      ctx.save();
      ctx.fillStyle = ball.color;
      const box = ball.getBox();
      ctx.fillRect(box.x1, box.y1, box.x2-box.x1, box.y2-box.y1);
      ctx.restore();
    });
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
    if(this.game.isValidCellPosition(gameVInt)) {
      ctx.save()
      ctx.translate(gameVInt.x, gameVInt.y);
      ctx.globalAlpha = 0.5;
      ctx.rotate(this.direction*Math.PI/2);
      if(this.t == "room") {
        ctx.drawImage(roomImage, 0,0,100,100,-0.5,-0.5,1,1);
      } else if (this.t == "belt") {
        ctx.drawImage(beltImage, 0,0,100,100,-0.5,-0.5,1,1);
      }

      ctx.restore();
    }
    ctx.restore();
  }
  getGameVInt(): Vector {
    return this.transform.inverse().mulV(this.v).toInt(0.5);
  }
}
