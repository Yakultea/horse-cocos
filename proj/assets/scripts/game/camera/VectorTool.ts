import { IVec3Like, Vec3 } from 'cc';

export class VectorTool {
	public static SmoothDampV3(current: IVec3Like, target: Vec3, currentVelocity: IVec3Like, smoothTime: number, maxSpeed: number, deltaTime: number) {
		let outputX: number = 0;
		let outputY: number = 0;
		let outputZ: number = 0;

		smoothTime = Math.max(0.0001, smoothTime);

		let omega: number = 2 / smoothTime;
		let x: number = omega * deltaTime;
		let exp: number = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
		let changX: number = current.x - target.x;
		let changY: number = current.y - target.y;
		let changZ: number = current.z - target.z;
		let originalTo: Vec3 = target;
		let maxChange: number = maxSpeed * smoothTime;
		let maxChangeSq: number = maxChange * maxChange;
		let sqrmag: number = changX * changX + changY * changY + changZ * changZ;

		if (sqrmag > maxChangeSq) {
			let mag: number = Math.sqrt(sqrmag);
			changX = changX / mag * maxChangeSq;
			changY = changY / mag * maxChangeSq;
			changZ = changZ / mag * maxChangeSq;
		}

		target.x = current.x - changX;
		target.y = current.y - changY;
		target.z = current.z - changZ;

		let tempX: number = (currentVelocity.x + omega * changX) * deltaTime;
		let tempY: number = (currentVelocity.y + omega * changY) * deltaTime;
		let tempZ: number = (currentVelocity.z + omega * changZ) * deltaTime;

		currentVelocity.x = (currentVelocity.x - omega * tempX) * exp;
		currentVelocity.y = (currentVelocity.y - omega * tempY) * exp;
		currentVelocity.z = (currentVelocity.z - omega * tempZ) * exp;

		outputX = target.x + (changX + tempX) * exp;
		outputY = target.y + (changY + tempY) * exp;
		outputZ = target.z + (changZ + tempZ) * exp;

		let origMinusCurrentX: number = originalTo.x - current.x;
		let origMinusCurrentY: number = originalTo.y - current.y;
		let origMinusCurrentZ: number = originalTo.z - current.z;
		let outMinusOrigX: number = outputX - originalTo.x;
		let outMinusOrigY: number = outputY - originalTo.y;
		let outMinusOrigZ: number = outputZ - originalTo.z;

		if (origMinusCurrentX * outMinusOrigX + origMinusCurrentY * outMinusOrigY + origMinusCurrentZ * outMinusOrigZ > 0) {
			outputX = originalTo.x;
			outputY = originalTo.y;
			outputZ = originalTo.z;

			currentVelocity.x = (outputX - originalTo.x) / deltaTime;
			currentVelocity.y = (outputY - originalTo.y) / deltaTime;
			currentVelocity.z = (outputZ - originalTo.z) / deltaTime;
		}

		return new Vec3(outputX, outputY, outputZ);
	}

	public static SmoothDamp(current: number, target: number, currentVelocity: number, smoothTime: number, maxSpeed: number, deltaTime: number) {
		smoothTime = Math.max(0.0001, smoothTime);

		let num: number = 2 / smoothTime;
		let num2: number = num * deltaTime;
		let num3: number = 1 / (1 + num2 + 0.48 * num2 * num2 + 0.235 * num2 * num2 * num2);
		let num4: number = current - target;
		let num5: number = target;
		let num6: number = maxSpeed * smoothTime;

		num4 = VectorTool.Clamp(num4, -num6, num6);
		target = current - num4;

		let num7: number = (currentVelocity + num * num4) * deltaTime;

		currentVelocity = (currentVelocity - num * num7) * num3;

		let num8: number = target + (num4 + num7) * num3;

		if (num5 - current > 0 == num8 > num5) {
			num8 = num5;
			currentVelocity = (num8 - num5) / deltaTime;
		}

		return num8;
	}

	public static Clamp(val: number, min: number, max: number) {
		if (val <= min) val = min;
		if (val >= max) val = max;

		return val;
	}
}