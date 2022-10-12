import { _decorator, Component, Enum, Input, EventTouch, v2, UITransform } from 'cc';
import { PieceName } from 'mergemodel';

const { ccclass, property, requireComponent } = _decorator;

export const GamePieceNames = Enum(PieceName)

export enum GamePieceEventType {
    GRABBED = "grabbed",
    DROPPED = "dropped"
}

@ccclass('GamePiece')
@requireComponent(UITransform)
export class GamePiece extends Component {
    
    @property({
        type: GamePieceNames
    })
    pieceName = GamePieceNames.Box;
    @property({
        min: 1,
        step: 1
    })
    level: number = 1

    private uiDelta = v2();

    onLoad() {
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDestroy() {
        this.node.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    private onTouchStart(event: EventTouch) {
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.emit(GamePieceEventType.GRABBED, this);
    }

    private onTouchMove(event: EventTouch) {
        event.getUIDelta(this.uiDelta)
        this.node.position = this.node.position.add3f(this.uiDelta.x, this.uiDelta.y, 0);
    }

    private onTouchEnd(event: EventTouch) {
        this.node.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.emit(GamePieceEventType.DROPPED, this);
    }
}
