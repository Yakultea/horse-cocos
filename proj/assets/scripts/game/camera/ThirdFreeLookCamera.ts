
import { Button, Component, Enum, EventMouse, IVec3Like, Input, Node, Quat, Vec3, _decorator, input } from 'cc';
import { Quaternion } from './Quaternion';
const { ccclass, property } = _decorator;

export enum ThirdPersonCameraType {
	/** 相机紧跟随着目标，相机不会旋转 */
	Follow = 0,
	/** 相机会旋转紧跟着目标正后方，旋转不可控制 */
	FollowTrackRotation = 1,
	/** 相机紧跟随着目标，相机可以自由旋转 */
	FollowIndependentRotation = 2,
	RotationAround = 3,
}

/**
 * 第三人称相机跟随
 * 这里总结了三个相机跟随
 * 1. 相机紧跟随着目标，相机不会旋转
 * 2. 相机紧跟随着目标，相机会旋转紧跟着目标正后方，旋转不可控制
 * 3. 相机紧跟随着目标，相机可以自由旋转，角色向前移动的时候，前方向永远是相机的正方向
 */

@ccclass('ThirdFreeLookCamera')
export class ThirdFreeLookCamera extends Component {
	/** 目标 */
	@property(Node)
	target: Node = null;

	/** 注视的目标，这里我想让相机对准目标的上方一点，所有多加了注视（相机正对着）的目标 */
	@property(Node)
	lookAt: Node = null;

	@property({ type: Enum(ThirdPersonCameraType) })
	cameraType: ThirdPersonCameraType = ThirdPersonCameraType.Follow;

	/** 距离目标距离 */
	@property
	positionOffset: Vec3 = new Vec3(-10, 6, 10);

	/** 移动差值移动系数 */
	@property
	moveSmooth: number = 0.02;

	/** 差值旋转系数 */
	@property
	rotateSmooth: number = 0.03;

	@property(Node)
	btns: Node[] = [];

	public mouseX: number = 0;
	public mouseY: number = 0;

	private _forward: Vec3 = new Vec3();
	private _right: Vec3 = new Vec3();
	private _up: Vec3 = new Vec3();
	private _angle: IVec3Like = null;
	private _isDown: boolean = false;
	private _velocity = new Vec3();
	private _forwardView: Vec3 = new Vec3();

	start() {
		input.on(Input.EventType.MOUSE_DOWN, this._mouseDown, this);
		input.on(Input.EventType.MOUSE_MOVE, this._mouseMove, this);
		input.on(Input.EventType.MOUSE_UP, this._mouseUp, this);
		this.cameraType == ThirdPersonCameraType.Follow && this.node.lookAt(this.target.worldPosition);
	}

	public clickEvent(btnTarget: Node, handler: string, customEventData?: string): void {
		const event = new Component.EventHandler();
		event.target = this.node;
		event.component = "ThirdFreeLookCamera";
		event.handler = handler;
		if (customEventData) event.customEventData = customEventData;

		btnTarget.getComponent(Button).clickEvents.push(event);
	}

	private _mouseDown(e: EventMouse) {
		this._isDown = true;
	}

	private _mouseMove(e: EventMouse) {
		// if (this.cameraType == ThirdPersonCameraType.FollowIndependentRotation) {
		// 	this._setIndependentRotation(e);
		// }
		// this._setIndependentRotation(e);
	}

	private _mouseUp(e: EventMouse) {
		this._isDown = false;
	}

	update(dt: number) {
		if (this.target) {
			switch (this.cameraType) {
				case ThirdPersonCameraType.Follow:
					this._setFollow();
					// this.setMove();
					break;
				case ThirdPersonCameraType.FollowTrackRotation:
					this._setFollowTrackRotation();
					break;
				case ThirdPersonCameraType.FollowIndependentRotation:
					this._setMove();
					break;
				case ThirdPersonCameraType.RotationAround:
					this._setRotationAround();
					break;
			}
		}
	}

	private _setRotationAround(): void {
		Quaternion.RotationAroundNode(this.node, this.lookAt.position, Vec3.UP, 0.1);
		this.node.lookAt(this.lookAt.position);
	}

	private _setFollow() {
		let temp: Vec3 = new Vec3();
		Vec3.add(temp, this.lookAt.worldPosition, this.positionOffset);
		this.node.position = this.node.position.lerp(temp, this.moveSmooth);
	}

	private _setFollowTrackRotation() {
		//这里计算出相机距离目标的位置的所在坐标先，距离多高Y，距离多远Z
		//下面四句代码等同于：targetPosition+Up*updistance-forwardView*backDistance
		let up = Vec3.multiplyScalar(new Vec3(), Vec3.UP, this.positionOffset.y);
		let forward = Vec3.multiplyScalar(new Vec3(), this.target.forward, this.positionOffset.z);
		let pos = Vec3.add(new Vec3(), this.target.position, up);

		//本来这里应该是减的，可是下面的lookat默认前方是-z，所有这里倒转过来变为加
		// Vec3.add(pos, pos, forward);
		Vec3.subtract(pos, pos, forward); //正對目標
		//球形差值移动，我发现cocos只有Lerp差值移动，而我看unity是有球形差值移动的，所有我这里照搬过来了一个球形差值
		// this.node.position = VectorTool.SmoothDampV3(this.node.position, pos, this._velocity, this.moveSmooth, 100000, 0.02);
		//cocos的差值移动
		this.node.position = this.node.position.lerp(pos, this.moveSmooth);
		//计算前方向
		// this._forwardView = Vec3.subtract(this._forwardView, this.node.position, this.target.getWorldPosition());
		this.node.lookAt(this.target.worldPosition);
		// this.node.rotation = Quaternion.LookRotation(this._forwardView);
	}

	/*************************FollowIndependentRotation***************** */

	/**
	 * 实时设置相机距离目标的位置position
	 */
	public _setMove() {
		this._forward = new Vec3();
		this._right = new Vec3();
		this._up = new Vec3();
		Vec3.transformQuat(this._forward, Vec3.FORWARD, this.node.rotation);
		//Vec3.transformQuat(this._right, Vec3.RIGHT, this.node.rotation);
		//Vec3.transformQuat(this._up, Vec3.UP, this.node.rotation);

		this._forward.multiplyScalar(this.positionOffset.z);
		//this._right.multiplyScalar(this.positionOffset.x);
		//this._up.multiplyScalar(this.positionOffset.y);
		let desiredPos = new Vec3();
		desiredPos = desiredPos.add(this.lookAt.worldPosition).subtract(this._forward).add(this._right).add(this._up);
		this.node.position = this.node.position.lerp(desiredPos, this.moveSmooth);
	}

	/**
	 * 计算根据鼠标X，Y偏移量来围绕X轴和Y轴的旋转四元数
	 * @param e 
	 */
	private _setIndependentRotation(e: EventMouse) {
		let radX: number = -e.movementX;
		let radY: number = -e.movementY;
		let _quat: Quat = new Quat();

		//计算绕X轴旋转的四元数并应用到node，这里用的是鼠标上下Y偏移量
		let _right = Vec3.transformQuat(this._right, Vec3.RIGHT, this.node.rotation);
		_quat = Quaternion.RotationAroundNode(this.node, this.target.position, _right, radY);
		this._angle = Quaternion.GetEulerFromQuat(_quat);

		//限制相机抬头低头的范围
		this._angle.x = this._angle.x > 0 ? this._clamp(this._angle.x, 120, 180) : this._clamp(this._angle.x, -180, -170);
		Quat.fromEuler(_quat, this._angle.x, this._angle.y, this._angle.z);
		this.node.setWorldRotation(_quat);

		//计算绕Y轴旋转的四元数并应用到node，这里用的是鼠标上下X偏移量
		_quat = Quaternion.RotationAroundNode(this.node, this.target.position, Vec3.UP, radX);
		this.node.setWorldRotation(_quat);

		this._angle = Quaternion.GetEulerFromQuat(_quat);
		this.mouseX = this._angle.y;
		this.mouseY = this._angle.x;
	}

	/*************************FollowIndependentRotation end***************** */

	private _clamp(val: number, min: number, max: number) {
		if (val <= min) val = min;
		else if (val >= max) val = max;
		return val;
	}

	public getType(): ThirdPersonCameraType {
		return this.cameraType;
	}
}