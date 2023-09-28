import { IVec3Like, Node, Quat, Vec3 } from "cc";

/**
 * 此類別屬於一個引擎內部的Quat四元數類的一個擴充簡化版
 * 同時也加了其他的四元數旋轉的功能
 */
export class Quaternion {

	private static Deg2Rad: number = (Math.PI) / 180;

	/**
	 * 繞Y軸旋轉
	 * @param _node 需要旋轉的節點
	 * @param _angle 旋轉的角度（是角度不是弧度）
	 */
	public static RotateY(_node: Node, _angle: number): Quat {
		let _quat = new Quat();
		_node.rotation = Quat.rotateY(_quat, _node.rotation, _angle * this.Deg2Rad);
		return _quat;
	}

	/**
	* 繞X軸旋轉
	* @param _node 需要旋轉的節點
	* @param _angle 旋轉的角度（是角度不是弧度）
	*/
	public static RotateX(_node: Node, _angle: number): Quat {
		let _quat = new Quat();
		_node.rotation = Quat.rotateX(_quat, _node.rotation, _angle * this.Deg2Rad);
		return _quat;
	}

	/**
	* 繞Z軸旋轉
	* @param _node 需要旋轉的節點
	* @param _angle 旋轉的角度（是角度不是弧度）
	*/
	public static RotateZ(_node: Node, _angle: number): Quat {
		let _quat = new Quat();
		_node.rotation = Quat.rotateZ(_quat, _node.rotation, _angle * this.Deg2Rad);
		return _quat;
	}

	/**
	 * 繞世界空間下指定軸旋轉四元數
	 * @param _targetQuat 指定要旋轉四元數
	 * @param axis 旋轉軸
	 * @param _angle 旋轉角度
	 */
	public static RotateAround(_targetQuat: Quat, axis: Vec3, _angle: number): Quat {
		let _quat = new Quat();
		Quat.rotateAround(_quat, _targetQuat, axis, _angle * this.Deg2Rad);
		return _quat;
	}

	/**
	 * 繞本地空間指定軸旋轉四元數
	 * @param _targetQuat 指定要旋轉四元數
	 * @param axis 旋轉軸
	 * @param _angle 旋轉角度
	 */
	public static RotateAroundLocal(_targetQuat: Quat, axis: Vec3, _angle: number): Quat {
		let _quat = new Quat();
		Quat.rotateAroundLocal(_quat, _targetQuat, axis, _angle * this.Deg2Rad);
		return _quat;
	}

	/**
	 * 將變換圍繞著穿過世界座標中的 point 的 axis 旋轉 angle 度。
	 * 這會修改變換的位置和旋轉。
	 * @param self 要变换旋转的目标
	 * @param pos 指定圍繞的point
	 * @param axis 旋轉軸
	 * @param angle 旋轉角度
	 */
	public static RotationAroundNode(self: Node, pos: Vec3, axis: Vec3, angle: number): Quat {
		let _quat = new Quat();
		let v1 = new Vec3();
		let v2 = new Vec3();
		let pos2: Vec3 = self.position;
		let rad = angle * this.Deg2Rad;
		Quat.fromAxisAngle(_quat, axis, rad);
		Vec3.subtract(v1, pos2, pos);
		Vec3.transformQuat(v2, v1, _quat);
		self.position = Vec3.add(v2, pos, v2);
		Quat.rotateAround(_quat, self.rotation, axis, rad);
		return _quat;
	}

	/**
	 * 從四元數得到歐拉角
	 * @param _quat 四元數
	 */
	public static GetEulerFromQuat(_quat: Quat): IVec3Like {
		let angle: IVec3Like = Quat.toEuler(new Vec3(), _quat, true);
		return angle;
	}

	/**
	 * 從歐拉角得到四元數
	 * @param _angle 歐拉角
	 */
	public static GetQuatFromAngle(_angle: IVec3Like): Quat {
		let _quat: Quat = Quat.fromEuler(new Quat(), _angle.x, _angle.y, _angle.z);
		return _quat;
	}

	/**
	 * 四元數差值，在 a 和 b 之間插入 t，然後對結果進行標準化處理。參數 t 被限制在 [0, 1] 範圍內。
	 * 該方法比 Slerp 快，但如果旋轉相距很遠，其視覺效果也更糟。
	 * @param _a 
	 * @param _b 
	 * @param _t 
	 */
	public static Lerp(_a: Quat, _b: Quat, _t: number): Quat {
		let _quat = new Quat();
		Quat.lerp(_quat, _a, _b, _t);
		return _quat;
	}

	/**
	 * 四元數球形差值
	 * 在 a 和 b 之間以球形方式插入 t。參數 t 被限制在 [0, 1] 範圍內。
	 * @param _a 
	 * @param _b 
	 * @param _t 
	 */
	public static Slerp(_a: Quat, _b: Quat, _t: number): Quat {
		let _quat = new Quat();
		Quat.slerp(_quat, _a, _b, _t);
		return _quat;
	}

	public static LookRotation(_forward: Vec3, _upwards: Vec3 = Vec3.UP): Quat {
		let _quat = new Quat();
		Vec3.normalize(_forward, _forward);
		Quat.fromViewUp(_quat, _forward, _upwards);
		return _quat;
	}
}