import * as _ from "underscore";
import {mod, Box, Vector, Matrix} from "./util";


export class Cell {
  constructor(
    public t: string,
    public direction: number,
    public color: string,
    public time: number,
  ) {}
}

export class Ball {
  constructor(
    public position: Vector,
    public color: string
  ) {}

  getBox() {
    return new Box(this.position.x - BALL_SIZE/2, this.position.x + BALL_SIZE/2, this.position.y - BALL_SIZE/2, this.position.y + BALL_SIZE/2);
  }

  getCorners() {
    const r = BALL_SIZE / 2;
    return [
      new Vector(r, r),
      new Vector(r, -r),
      new Vector(-r, -r),
      new Vector(-r, r)
    ].map(delta => this.position.add(delta));
  }

  static isColliding(b1: Ball, b2: Ball) {
    return Math.abs(b1.position.x - b2.position.x) < BALL_SIZE && Math.abs(b1.position.y - b2.position.y) < BALL_SIZE;
  }
}

export const WALL_WIDTH = 0.1;
export const CELL_BOXES = [
  new Box(-0.5,0.5,-0.5, -0.5+WALL_WIDTH),
  new Box(-0.5,0.5,0.5-WALL_WIDTH, 0.5),
  new Box(-0.5,-0.5+WALL_WIDTH,-0.5, 0.5)
];

export const GENERATION_SPEED = 0.05;
export const MOVE_SPEED = 0.1;
export const BALL_SIZE = 0.3;

export class FloorGame {
  time: number;
  width: number;
  height: number;
  grid: Cell[][];
  balls: Ball[];
  constructor(w: number, h: number) {
    this.time = 0;
    this.width = w;
    this.height = h;
    this.grid = [...Array(h)].map(e => [...Array(w)].map(e2 => new Cell("", 0, "", 0)));
    this.balls = [];
  }

  setCell(v: Vector, cell: Cell): void {
    if(this.isValidCellPosition(v)) {
      this.grid[v.y][v.x] = cell;
    }
  }

  getCell(x,y): Cell {
    return this.grid[y][x];
  }

  update(): void {
    // update time
    this.time += 1;
    // update cell
    for(let x = 0;x<this.width;x++){
      for(let y = 0;y<this.height;y++){
        const cell = this.grid[y][x];
        if(cell.t == "room") {
          cell.time += GENERATION_SPEED;
          if(cell.time >= 1) {
            cell.time -= 1;
            const ball = new Ball(new Vector(x,y), cell.color);
            let valid = _.every(this.balls, ball2 =>
              !(ball != ball2 && Ball.isColliding(ball, ball2))
            );
            if(valid) {
              this.balls.push(ball);
            }
          }
        }
      }
    }
    // update ball
    this.balls =
    _.filter(this.balls, ball => {
      const applyDirections = [false, false, false, false];
      ball.getCorners().map((v: Vector) => {
        const vInt = v.toInt();
        if(!this.isValidCellPosition(vInt)) {
          return;
        }
        const cell = this.grid[vInt.y][vInt.x];
        if(cell.t == "room" || cell.t == "belt") {
          applyDirections[cell.direction] = true;
        }
      });
      if(applyDirections[0] && !applyDirections[2]) {
        this.tryMoveBall(ball, 0);
      }
      if(applyDirections[2] && !applyDirections[0]) {
        this.tryMoveBall(ball, 2);
      }
      if(applyDirections[1] && !applyDirections[3]) {
        this.tryMoveBall(ball, 1);
      }
      if(applyDirections[3] && !applyDirections[1]) {
        this.tryMoveBall(ball, 3);
      }
      const vInt = ball.position.toInt();
      if(this.grid[vInt.y][vInt.x].t == "sink") {
        return false;
      }
      return true;
    });

  }
  
  tryMoveBall(ball: Ball, direction: number) {
    const newBall = new Ball(ball.position.applyDirection(direction, MOVE_SPEED), ball.color);
    const corners = newBall.getCorners();


    for(let t = 0;t<4;t++) {
      const vInt = corners[t].toInt();
      if(!this.isValidCellPosition(vInt)) {
        return;
      }
      const cell = this.grid[vInt.y][vInt.x];
      if(cell.t == "room") {
        const box = newBall.getBox();
        const boxes = CELL_BOXES.map(box => box.rotate(cell.direction).move(vInt));
        if(_.some(boxes, box2 => Box.isColliding(box2, box))) {
          return;
        }
      }
    }
    if(_.some(this.balls, ball2 =>
      ball != ball2 && Ball.isColliding(newBall, ball2))) {
      return;
    }

    ball.position = newBall.position;
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
      const corner = v.add(delta).toInt();
      result.add(corner);
    });
    return Array.from(result);
  }

  isValidCellPosition(v: Vector): boolean {
    return (v.x>=0)&&(v.x<this.width)&&(v.y>=0)&&(v.y<this.height)&&((v.x|0)==v.x)&&((v.y|0)==v.y);
  }
}
