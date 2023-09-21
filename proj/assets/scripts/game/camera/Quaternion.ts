import { IVec3Like, Node, Quat, Vec3 } from "cc";

/**
 * 该类属于一个引擎内部的Quat四元数类的一个扩展简化版
 * 因为本人觉得有些out参数过于多余，在这里就隐藏掉了
 * 同时也加了些其他的四元数旋转的功能
 */
export class Quaternion {

	private static Deg2Rad: number = (Math.PI) / 180;

	/**
	 * 绕Y轴旋转置顶节点
	 * @param _node 需要旋转的节点
	 * @param _angle 旋转的角度（是角度不是弧度）
	 */
	public static RotateY(_node: Node, _angle: number): Quat {
		let _quat = new Quat();
		_node.rotation = Quat.rotateY(_quat, _node.rotation, _angle * this.Deg2Rad);
		return _quat;
	}

	/**
	* 绕X轴旋转置顶节点
	* @param _node 需要旋转的节点
	* @param _angle 旋转的角度（是角度不是弧度）
	*/
	public static RotateX(_node: Node, _angle: number): Quat {
		let _quat = new Quat();
		_node.rotation = Quat.rotateX(_quat, _node.rotation, _angle * this.Deg2Rad);
		return _quat;
	}

	/**
	* 绕Z轴旋转置顶节点
	* @param _node 需要旋转的节点
	* @param _angle 旋转的角度（是角度不是弧度）
	*/
	public static RotateZ(_node: Node, _angle: number): Quat {
		let _quat = new Quat();
		_node.rotation = Quat.rotateZ(_quat, _node.rotation, _angle * this.Deg2Rad);
		return _quat;
	}

	/**
	 * 绕世界空间下指定轴旋转四元数
	 * @param _targetQuat 指定要旋转四元数
	 * @param axis 旋转轴
	 * @param _angle 旋转角度
	 */
	public static RotateAround(_targetQuat: Quat, axis: Vec3, _angle: number): Quat {
		let _quat = new Quat();
		Quat.rotateAround(_quat, _targetQuat, axis, _angle * this.Deg2Rad);
		return _quat;
	}

	/**
	 *  绕本地空间下指定轴旋转四元数
	 * @param _targetQuat 指定要旋转四元数
	 * @param axis 旋转轴
	 * @param _angle 旋转角度
	 */
	public static RotateAroundLocal(_targetQuat: Quat, axis: Vec3, _angle: number): Quat {
		let _quat = new Quat();
		Quat.rotateAroundLocal(_quat, _targetQuat, axis, _angle * this.Deg2Rad);
		return _quat;
	}

	/**
	 * 将变换围绕穿过世界坐标中的 point 的 axis 旋转 angle 度。
	 * 这会修改变换的位置和旋转。
	 * @param self 要变换旋转的目标
	 * @param pos 指定围绕的point
	 * @param axis 旋转轴
	 * @param angle 旋转角度
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
	 * 从四元数得到欧拉角
	 * @param _quat 四元数
	 */
	public static GetEulerFromQuat(_quat: Quat): IVec3Like {
		let angle: IVec3Like = Quat.toEuler(new Vec3(), _quat, true);
		return angle;
	}

	/**
	 * 从欧拉角得到四元数
	 * @param _angle 欧拉角
	 */
	public static GetQuatFromAngle(_angle: IVec3Like): Quat {
		let _quat: Quat = Quat.fromEuler(new Quat(), _angle.x, _angle.y, _angle.z);
		return _quat;
	}

	/**
	 * 四元数差值，在 a 和 b 之间插入 t，然后对结果进行标准化处理。参数 t 被限制在 [0, 1] 范围内。
	 * 该方法比 Slerp 快，但如果旋转相距很远，其视觉效果也更糟糕。
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
	 * 四元数球形差值
	 * 在 a 和 b 之间以球形方式插入 t。参数 t 被限制在 [0, 1] 范围内。
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