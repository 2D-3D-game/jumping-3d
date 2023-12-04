import { _decorator, Component, Node, Prefab, CCInteger, instantiate, Label, Vec3, EventTarget, Button } from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;
export const eventTarget = new EventTarget();

enum BlockType {
    BT_NONE,
    BT_STONE,
};

export enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_REAL_PLAYING,
    GS_END,
    GS_NEXT,
};

@ccclass('GameManager')
export class GameManager extends Component {
    @property({type: Prefab})
    public cubePrfb: Prefab | null = null;

    @property({ type: Node })
    public startMenu: Node | null = null;

    @property({ type: PlayerController })
    public playerCtrl: PlayerController | null = null;

    @property({ type: Label })
    public stepsLabel: Label | null = null;

    @property(Label)
    title: Label;

    @property(Label)
    tip1: Label;

    @property(Label)
    tip2: Label;

    @property(Label)
    buttonLabel: Label;

    public roadLength: number = 20;
    private _road: BlockType[] = [];
    public static currentGameState: GameState = GameState.GS_INIT;
    private round: number = 1;

    start() {
        this.setCurState(GameState.GS_INIT);
        eventTarget.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    init(){
        if (this.startMenu) {
            this.startMenu.active = true;
        }

        this.generateRoad();

        if (this.playerCtrl) {
            this.playerCtrl.node.setPosition(Vec3.ZERO);
            this.playerCtrl.reset();
        }
    }

    update(deltaTime: number) {
        
    }

    onStartButtonClicked() {
        this.setCurState(GameState.GS_PLAYING);
    }

    setCurState(value: GameState) {
        switch (value) {
            case GameState.GS_INIT:
                GameManager.currentGameState = GameState.GS_INIT;
                this.init();
                break;
            case GameState.GS_PLAYING:
                GameManager.currentGameState = GameState.GS_PLAYING;
                if (this.startMenu) {
                    this.startMenu.active = false;
                }
                if (this.stepsLabel) {
                    this.stepsLabel.string = '0';
                }
                setTimeout(() => {
                    GameManager.currentGameState = GameState.GS_REAL_PLAYING;
                }, 500)
                break;
            case GameState.GS_END:
                GameManager.currentGameState = GameState.GS_END;
                this.title.string = "Oops!";
                this.tip1.string = "Your Score is : " + this.stepsLabel.string;
                this.tip2.string = "You failed in round " + this.round;
                this.tip2.node.active = true;
                this.buttonLabel.string = "Restart";
                this.startMenu.active = true;
                this.roadLength = 20;
                this.round = 1;
                this.init();
                break;
            case GameState.GS_NEXT:
                GameManager.currentGameState = GameState.GS_NEXT;
                this.title.string = "Congratulations!";
                this.tip1.string = "You succed in round " + this.round;
                this.tip2.node.active = false;
                this.buttonLabel.string = "Next";
                this.startMenu.active = true;
                this.round++;
                this.roadLength += (this.round - 1) * 10;
                this.init();
                break;
        }
    }

    generateRoad() {
        this.node.removeAllChildren();

        this._road = [];
        this._road.push(BlockType.BT_STONE);

        for (let i = 1; i < this.roadLength - 1; i++) {
            if (this._road[i - 1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }

        this._road.push(BlockType.BT_STONE);

        for (let j = 0; j < this._road.length; j++) {
            let block: Node | null = this.spawnBlockByType(this._road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j, 0, 0);
            }
        }
    }

    spawnBlockByType(type: BlockType) {
        if (!this.cubePrfb) {
            return null;
        }

        let block: Node | null = null;
        switch (type) {
            case BlockType.BT_STONE:
                block = instantiate(this.cubePrfb);
                break;
        }

        return block;
    }

    checkResult(moveIndex: number) {
        if (moveIndex < this.roadLength - 1) {
            if (this._road[moveIndex] == BlockType.BT_NONE) {
                this.setCurState(GameState.GS_END);
            }
        } else if(moveIndex === this.roadLength - 1) {
            this.setCurState(GameState.GS_NEXT);
        } else {
            this.setCurState(GameState.GS_END);
        }
    }

    onPlayerJumpEnd(moveIndex: number) {
        if (this.stepsLabel) {
            this.stepsLabel.string = '' + (moveIndex >= this.roadLength ? this.roadLength : moveIndex);
        }
        this.checkResult(moveIndex);
    }
}


