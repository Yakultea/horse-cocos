
import { Component, Enum, EventMouse, IVec3Like, Input, Node, Quat, Vec3, _decorator, input } from 'cc';
import { Quaternion } from './Quaternion';
import { VectorTool } from './VectorTool';
const { ccclass, property } = _decorator;

export enum ThirdPersonCameraType {
	/** 相機緊跟著目標，不會旋轉 */ //(150, 100, 70)
	Follow = 0,
	/** 相機會旋轉緊跟著目標正後方，旋轉不可控 */
	FollowTrackRotation = 1,
	/** 相機緊跟著目標，可以自由旋轉 */ //要調整z
	FollowIndependentRotation = 2,
	/** 相機繞著目標旋轉 */
	RotationAround = 3, // 要設定camera的pos
}

/**
  * 第三人稱相機跟隨
  * 這裡總結了三台相機跟隨
  * 1. 相機緊跟著目標，相機不會旋轉
  * 2. 相機緊跟著目標，相機會旋轉緊跟著目標正後方，旋轉不可控
  * 3. 相機緊跟著目標，相機可以自由旋轉，角色向前移動的時候，前方方向永遠是相機的正方向
 */

@ccclass('ThirdFreeLookCamera')
export class ThirdFreeLookCamera extends Component {
	/** 目標 */
	@property(Node)
	target: Node = null;

	/** 注視的目標 */
	@property(Node)
	lookAt: Node = null;

	/** 相機跟隨的模式 */
	@property({ type: Enum(ThirdPersonCameraType) })
	cameraType: ThirdPersonCameraType = ThirdPersonCameraType.Follow;

	/** 距離目標的距離 */
	@property
	positionOffset: Vec3 = new Vec3(-10, 6, 10);

	/** 移動差值移動係數 */
	@property
	moveSmooth: number = 0.02;

	/** 差值旋轉係數 */
	@property
	rotateSmooth: number = 0.03;

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

	lateUpdate(dt: number) {
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

	public setCameraFocus() {
		let temp: Vec3 = new Vec3();
		Vec3.add(temp, this.lookAt.worldPosition, this.positionOffset);
		this.node.position = this.node.position.lerp(temp, 0.1);
	}

	private _setRotationAround(): void {
		Quaternion.RotationAroundNode(this.node, this.lookAt.position, Vec3.UP, 0.1);
		this.node.lookAt(this.lookAt.position);
	}

	private _setFollow() {
		let temp: Vec3 = new Vec3();
		Vec3.add(temp, this.lookAt.worldPosition, this.positionOffset);
		this.node.position = this.node.position.lerp(temp, this.moveSmooth);

		// this.node.lookAt(this.target.worldPosition);
	}

	private _setFollowTrackRotation() {
		// 這裡計算出相機距離目標的位置的所在座標，距離多高Y，距離多遠Z
		// 下面四句程式碼等同於：targetPosition+Up*updistance-forwardView*backDistance
		let up = Vec3.multiplyScalar(new Vec3(), Vec3.UP, this.positionOffset.y);
		let forward = Vec3.multiplyScalar(new Vec3(), this.target.forward, this.positionOffset.z);
		let pos = Vec3.add(new Vec3(), this.target.position, up);

		// 本來這裡應該是減的，可是下面的lookat默認前方是-z，所有這裡倒轉過來變為加
		// Vec3.add(pos, pos, forward);
		Vec3.subtract(pos, pos, forward); //正對目標
		// 球形差值移動，cocos只有Lerp差值移動，而unity是有球形差值移動的，照搬過來一個球形差值
		this.node.position = VectorTool.SmoothDampV3(this.node.position, pos, this._velocity, this.moveSmooth, 100000, 0.02);
		// cocos的差值移動
		// this.node.position = this.node.position.lerp(pos, this.moveSmooth);
		// 計算前方向
		// this._forwardView = Vec3.subtract(this._forwardView, this.node.position, this.target.getWorldPosition());
		this.node.lookAt(this.target.worldPosition);
		// this.node.rotation = Quaternion.LookRotation(this._forwardView);
	}

	/**
	 * 即時設定相機距離目標的位置position
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
	 * 計算根據滑鼠X，Y偏移量來圍繞X軸和Y軸的旋轉四元數
	 * @param e 
	 */
	private _setIndependentRotation(e: EventMouse) {
		let radX: number = -e.movementX;
		let radY: number = -e.movementY;
		let _quat: Quat = new Quat();

		// 計算繞X軸旋轉的四元數並應用到node，這裡用的是滑鼠上下Y偏移量
		let _right = Vec3.transformQuat(this._right, Vec3.RIGHT, this.node.rotation);
		_quat = Quaternion.RotationAroundNode(this.node, this.target.position, _right, radY);
		this._angle = Quaternion.GetEulerFromQuat(_quat);

		// 限制相機抬頭低頭的範圍
		this._angle.x = this._angle.x > 0 ? this._clamp(this._angle.x, 120, 180) : this._clamp(this._angle.x, -180, -170);
		Quat.fromEuler(_quat, this._angle.x, this._angle.y, this._angle.z);
		this.node.setWorldRotation(_quat);

		// 計算繞Y軸旋轉的四元數並應用到node，這裡用的是滑鼠上下X偏移量
		_quat = Quaternion.RotationAroundNode(this.node, this.target.position, Vec3.UP, radX);
		this.node.setWorldRotation(_quat);

		this._angle = Quaternion.GetEulerFromQuat(_quat);
		this.mouseX = this._angle.y;
		this.mouseY = this._angle.x;
	}

	private _clamp(val: number, min: number, max: number) {
		if (val <= min) val = min;
		else if (val >= max) val = max;
		return val;
	}

	public getType(): ThirdPersonCameraType {
		return this.cameraType;
	}
}