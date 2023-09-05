//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////



    /**
     * The Endian class contains values that denote the byte order used to represent multibyte numbers.
     * The byte order is either bigEndian (most significant byte first) or littleEndian (least significant byte first).
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * Endian 類中包含一些值，它們表示用於表示多位元組數字的位元組順序。
     * 位元組順序為 bigEndian（最高有效位元組位於最前）或 littleEndian（最低有效位元組位於最前）。
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    export class Endian {
        /**
         * Indicates the least significant byte of the multibyte number appears first in the sequence of bytes.
         * The hexadecimal number 0x12345678 has 4 bytes (2 hexadecimal digits per byte). The most significant byte is 0x12. The least significant byte is 0x78. (For the equivalent decimal number, 305419896, the most significant digit is 3, and the least significant digit is 6).
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 表示多位元組數字的最低有效位元組位於位元組序列的最前面。
         * 十六進位制數字 0x12345678 包含 4 個位元組（每個位元組包含 2 個十六進位制數字）。最高有效位元組為 0x12。最低有效位元組為 0x78。（對於等效的十進位制數字 305419896，最高有效數字是 3，最低有效數字是 6）。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public static LITTLE_ENDIAN: string = "littleEndian";

        /**
         * Indicates the most significant byte of the multibyte number appears first in the sequence of bytes.
         * The hexadecimal number 0x12345678 has 4 bytes (2 hexadecimal digits per byte).  The most significant byte is 0x12. The least significant byte is 0x78. (For the equivalent decimal number, 305419896, the most significant digit is 3, and the least significant digit is 6).
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 表示多位元組數字的最高有效位元組位於位元組序列的最前面。
         * 十六進位制數字 0x12345678 包含 4 個位元組（每個位元組包含 2 個十六進位制數字）。最高有效位元組為 0x12。最低有效位元組為 0x78。（對於等效的十進位制數字 305419896，最高有效數字是 3，最低有效數字是 6）。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public static BIG_ENDIAN: string = "bigEndian";

    }

    export const enum EndianConst {
        LITTLE_ENDIAN = 0,
        BIG_ENDIAN = 1
    }

    const enum ByteArraySize {

        SIZE_OF_BOOLEAN = 1,

        SIZE_OF_INT8 = 1,

        SIZE_OF_INT16 = 2,

        SIZE_OF_INT32 = 4,

        SIZE_OF_UINT8 = 1,

        SIZE_OF_UINT16 = 2,

        SIZE_OF_UINT32 = 4,

        SIZE_OF_FLOAT32 = 4,

        SIZE_OF_FLOAT64 = 8
    }
    /**
     * The ByteArray class provides methods and attributes for optimized reading and writing as well as dealing with binary data.
     * Note: The ByteArray class is applied to the advanced developers who need to access data at the byte layer.
     * @version Egret 2.4
     * @platform Web,Native
     * @includeExample egret/utils/ByteArray.ts
     * @language en_US
     */
    /**
     * ByteArray 類提供用於最佳化讀取、寫入以及處理二進位制資料的方法和屬性。
     * 注意：ByteArray 類適用於需要在位元組層訪問資料的高階開發人員。
     * @version Egret 2.4
     * @platform Web,Native
     * @includeExample egret/utils/ByteArray.ts
     * @language zh_CN
     */
    export class ByteArray {

        /**
         * @private
         */
        protected bufferExtSize = 0;//Buffer expansion size

        protected data: DataView;

        protected _bytes: Uint8Array;
        /**
         * @private
         */
        protected _position: number;

        /**
         * 
         * 已經使用的位元組偏移量
         * @protected
         * @type {number}
         * @memberOf ByteArray
         */
        protected write_position: number;

        /**
         * Changes or reads the byte order; egret.EndianConst.BIG_ENDIAN or egret.EndianConst.LITTLE_EndianConst.
         * @default egret.EndianConst.BIG_ENDIAN
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 更改或讀取資料的位元組順序；egret.EndianConst.BIG_ENDIAN 或 egret.EndianConst.LITTLE_ENDIAN。
         * @default egret.EndianConst.BIG_ENDIAN
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public get endian() {
            return this.$endian == EndianConst.LITTLE_ENDIAN ? Endian.LITTLE_ENDIAN : Endian.BIG_ENDIAN;
        }

        public set endian(value: string) {
            this.$endian = value == Endian.LITTLE_ENDIAN ? EndianConst.LITTLE_ENDIAN : EndianConst.BIG_ENDIAN;
        }

        protected $endian: EndianConst = null!;

        /**
         * @version Egret 2.4
         * @platform Web,Native
         */
        constructor(buffer?: ArrayBuffer | Uint8Array, bufferExtSize = 0) {
            if (bufferExtSize < 0) {
                bufferExtSize = 0;
            }
            this.bufferExtSize = bufferExtSize;
            let bytes: Uint8Array, wpos = 0;
            if (buffer) {//有資料，則可寫位元組數從位元組尾開始
                let uint8: Uint8Array;
                if (buffer instanceof Uint8Array) {
                    uint8 = buffer;
                    wpos = buffer.length;
                } else {
                    wpos = buffer.byteLength;
                    uint8 = new Uint8Array(buffer);
                }
                if (bufferExtSize == 0) {
                    bytes = new Uint8Array(wpos);
                }
                else {
                    let multi = (wpos / bufferExtSize | 0) + 1;
                    bytes = new Uint8Array(multi * bufferExtSize);
                }
                bytes.set(uint8);
            } else {
                bytes = new Uint8Array(bufferExtSize);
            }
            this.write_position = wpos;
            this._position = 0;
            this._bytes = bytes;
            this.data = new DataView(bytes.buffer);
            this.endian = Endian.BIG_ENDIAN;
        }


        /**
         * @deprecated
         * @version Egret 2.4
         * @platform Web,Native
         */
        public setArrayBuffer(buffer: ArrayBuffer): void {

        }

        /**
         * 可讀的剩餘位元組數
         * 
         * @returns 
         * 
         * @memberOf ByteArray
         */
        public get readAvailable() {
            return this.write_position - this._position;
        }

        public get buffer(): ArrayBuffer {
            return this.data.buffer.slice(0, this.write_position);
        }

        public get rawBuffer(): ArrayBuffer {
            return this.data.buffer;
        }

        /**
         * @private
         */
        public set buffer(value: ArrayBuffer) {
            let wpos = value.byteLength;
            let uint8 = new Uint8Array(value);
            let bufferExtSize = this.bufferExtSize;
            let bytes: Uint8Array;
            if (bufferExtSize == 0) {
                bytes = new Uint8Array(wpos);
            }
            else {
                let multi = (wpos / bufferExtSize | 0) + 1;
                bytes = new Uint8Array(multi * bufferExtSize);
            }
            bytes.set(uint8);
            this.write_position = wpos;
            this._bytes = bytes;
            this.data = new DataView(bytes.buffer);
        }

        public get bytes(): Uint8Array {
            return this._bytes;
        }

        /**
         * @private
         * @version Egret 2.4
         * @platform Web,Native
         */
        public get dataView(): DataView {
            return this.data;
        }

        /**
         * @private
         */
        public set dataView(value: DataView) {
            this.buffer = value.buffer;
        }

        /**
         * @private
         */
        public get bufferOffset(): number {
            return this.data.byteOffset;
        }

        /**
         * The current position of the file pointer (in bytes) to move or return to the ByteArray object. The next time you start reading reading method call in this position, or will start writing in this position next time call a write method.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 將檔案指標的當前位置（以位元組為單位）移動或返回到 ByteArray 物件中。下一次呼叫讀取方法時將在此位置開始讀取，或者下一次呼叫寫入方法時將在此位置開始寫入。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public get position(): number {
            return this._position;
        }

        public set position(value: number) {
            this._position = value;
            if (value > this.write_position) {
                this.write_position = value;
            }
        }

        /**
         * The length of the ByteArray object (in bytes).
                  * If the length is set to be larger than the current length, the right-side zero padding byte array.
                  * If the length is set smaller than the current length, the byte array is truncated.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * ByteArray 物件的長度（以位元組為單位）。
         * 如果將長度設定為大於當前長度的值，則用零填充位元組陣列的右側。
         * 如果將長度設定為小於當前長度的值，將會截斷該位元組陣列。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public get length(): number {
            return this.write_position;
        }

        public set length(value: number) {
            this.write_position = value;
            if (this.data.byteLength > value) {
                this._position = value;
            }
            this._validateBuffer(value);
        }

        protected _validateBuffer(value: number) {
            if (this.data.byteLength < value) {
                let be = this.bufferExtSize;
                let tmp: Uint8Array;
                if (be == 0) {
                    tmp = new Uint8Array(value);
                }
                else {
                    let nLen = ((value / be >> 0) + 1) * be;
                    tmp = new Uint8Array(nLen);
                }
                tmp.set(this._bytes);
                this._bytes = tmp;
                this.data = new DataView(tmp.buffer);
            }
        }

        /**
         * The number of bytes that can be read from the current position of the byte array to the end of the array data.
         * When you access a ByteArray object, the bytesAvailable property in conjunction with the read methods each use to make sure you are reading valid data.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 可從位元組陣列的當前位置到陣列末尾讀取的資料的位元組數。
         * 每次訪問 ByteArray 物件時，將 bytesAvailable 屬性與讀取方法結合使用，以確保讀取有效的資料。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public get bytesAvailable(): number {
            return this.data.byteLength - this._position;
        }

        /**
         * Clears the contents of the byte array and resets the length and position properties to 0.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 清除位元組陣列的內容，並將 length 和 position 屬性重置為 0。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public clear(): void {
            let buffer = new ArrayBuffer(this.bufferExtSize);
            this.data = new DataView(buffer);
            this._bytes = new Uint8Array(buffer);
            this._position = 0;
            this.write_position = 0;
        }

        /**
         * Read a Boolean value from the byte stream. Read a simple byte. If the byte is non-zero, it returns true; otherwise, it returns false.
         * @return If the byte is non-zero, it returns true; otherwise, it returns false.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 從位元組流中讀取布林值。讀取單個位元組，如果位元組非零，則返回 true，否則返回 false
         * @return 如果位元組不為零，則返回 true，否則返回 false
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public readBoolean(): boolean {
            if (this.validate(ByteArraySize.SIZE_OF_BOOLEAN)) return !!this._bytes[this.position++];
            return false;
        }

        /**
         * Read signed bytes from the byte stream.
         * @return An integer ranging from -128 to 127
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 從位元組流中讀取帶符號的位元組
         * @return 介於 -128 和 127 之間的整數
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public readByte(): number {
            if (this.validate(ByteArraySize.SIZE_OF_INT8)) return this.data.getInt8(this.position++);
            return 0;
        }

        /**
         * Read data byte number specified by the length parameter from the byte stream. Starting from the position specified by offset, read bytes into the ByteArray object specified by the bytes parameter, and write bytes into the target ByteArray
         * @param bytes ByteArray object that data is read into
         * @param offset Offset (position) in bytes. Read data should be written from this position
         * @param length Byte number to be read Default value 0 indicates reading all available data
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 從位元組流中讀取 length 引數指定的資料位元組數。從 offset 指定的位置開始，將位元組讀入 bytes 引數指定的 ByteArray 物件中，並將位元組寫入目標 ByteArray 中
         * @param bytes 要將資料讀入的 ByteArray 物件
         * @param offset bytes 中的偏移（位置），應從該位置寫入讀取的資料
         * @param length 要讀取的位元組數。預設值 0 導致讀取所有可用的資料
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public readBytes(bytes: ByteArray, offset: number = 0, length: number = 0): void {
            if (!bytes) {//由於bytes不返回，所以new新的無意義
                return;
            }
            let pos = this._position;
            let available = this.write_position - pos;
            if (available < 0) {
                return;
            }
            if (length == 0) {
                length = available;
            }
            else if (length > available) {
                return;
            }
            const position = bytes._position;
            bytes._position = 0;
            bytes.validateBuffer(offset + length);
            bytes._position = position;
            bytes._bytes.set(this._bytes.subarray(pos, pos + length), offset);
            this.position += length;
        }

        /**
         * Read an IEEE 754 double-precision (64 bit) floating point number from the byte stream
         * @return Double-precision (64 bit) floating point number
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 從位元組流中讀取一個 IEEE 754 雙精度（64 位）浮點數
         * @return 雙精度（64 位）浮點數
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public readDouble(): number {
            if (this.validate(ByteArraySize.SIZE_OF_FLOAT64)) {
                let value = this.data.getFloat64(this._position, this.$endian == EndianConst.LITTLE_ENDIAN);
                this.position += ByteArraySize.SIZE_OF_FLOAT64;
                return value;
            }
            return 0;
        }

        /**
         * Read an IEEE 754 single-precision (32 bit) floating point number from the byte stream
         * @return Single-precision (32 bit) floating point number
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 從位元組流中讀取一個 IEEE 754 單精度（32 位）浮點數
         * @return 單精度（32 位）浮點數
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public readFloat(): number {
            if (this.validate(ByteArraySize.SIZE_OF_FLOAT32)) {
                let value = this.data.getFloat32(this._position, this.$endian == EndianConst.LITTLE_ENDIAN);
                this.position += ByteArraySize.SIZE_OF_FLOAT32;
                return value;
            }
            return 0
        }

        /**
         * Read a 32-bit signed integer from the byte stream.
         * @return A 32-bit signed integer ranging from -2147483648 to 2147483647
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 從位元組流中讀取一個帶符號的 32 位整數
         * @return 介於 -2147483648 和 2147483647 之間的 32 位帶符號整數
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public readInt(): number {
            if (this.validate(ByteArraySize.SIZE_OF_INT32)) {
                let value = this.data.getInt32(this._position, this.$endian == EndianConst.LITTLE_ENDIAN);
                this.position += ByteArraySize.SIZE_OF_INT32;
                return value;
            }
            return 0;
        }

        /**
         * Read a 16-bit signed integer from the byte stream.
         * @return A 16-bit signed integer ranging from -32768 to 32767
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 從位元組流中讀取一個帶符號的 16 位整數
         * @return 介於 -32768 和 32767 之間的 16 位帶符號整數
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public readShort(): number {
            if (this.validate(ByteArraySize.SIZE_OF_INT16)) {
                let value = this.data.getInt16(this._position, this.$endian == EndianConst.LITTLE_ENDIAN);
                this.position += ByteArraySize.SIZE_OF_INT16;
                return value;
            }
            return 0;
        }

        /**
         * Read unsigned bytes from the byte stream.
         * @return A unsigned integer ranging from 0 to 255
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 從位元組流中讀取無符號的位元組
         * @return 介於 0 和 255 之間的無符號整數
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public readUnsignedByte(): number {
            if (this.validate(ByteArraySize.SIZE_OF_UINT8)) return this._bytes[this.position++];
            return 0;
        }

        /**
         * Read a 32-bit unsigned integer from the byte stream.
         * @return A 32-bit unsigned integer ranging from 0 to 4294967295
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 從位元組流中讀取一個無符號的 32 位整數
         * @return 介於 0 和 4294967295 之間的 32 位無符號整數
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public readUnsignedInt(): number {
            if (this.validate(ByteArraySize.SIZE_OF_UINT32)) {
                let value = this.data.getUint32(this._position, this.$endian == EndianConst.LITTLE_ENDIAN);
                this.position += ByteArraySize.SIZE_OF_UINT32;
                return value;
            }
            return 0;
        }

        /**
         * Read a 16-bit unsigned integer from the byte stream.
         * @return A 16-bit unsigned integer ranging from 0 to 65535
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 從位元組流中讀取一個無符號的 16 位整數
         * @return 介於 0 和 65535 之間的 16 位無符號整數
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public readUnsignedShort(): number {
            if (this.validate(ByteArraySize.SIZE_OF_UINT16)) {
                let value = this.data.getUint16(this._position, this.$endian == EndianConst.LITTLE_ENDIAN);
                this.position += ByteArraySize.SIZE_OF_UINT16;
                return value;
            }
            return 0;
        }

        /**
         * Read a UTF-8 character string from the byte stream Assume that the prefix of the character string is a short unsigned integer (use byte to express length)
         * @return UTF-8 character string
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 從位元組流中讀取一個 UTF-8 字串。假定字串的字首是無符號的短整型（以位元組表示長度）
         * @return UTF-8 編碼的字串
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public readUTF(): string {
            let length = this.readUnsignedShort();
            if (length > 0) {
                return this.readUTFBytes(length);
            } else {
                return "";
            }
        }

        /**
         * Read a UTF-8 byte sequence specified by the length parameter from the byte stream, and then return a character string
         * @param Specify a short unsigned integer of the UTF-8 byte length
         * @return A character string consists of UTF-8 bytes of the specified length
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 從位元組流中讀取一個由 length 引數指定的 UTF-8 位元組序列，並返回一個字串
         * @param length 指明 UTF-8 位元組長度的無符號短整型數
         * @return 由指定長度的 UTF-8 位元組組成的字串
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public readUTFBytes(length: number): string {
            if (!this.validate(length)) {
                return "";
            }
            let data = this.data;
            let bytes = new Uint8Array(data.buffer, data.byteOffset + this._position, length);
            this.position += length;
            return this.decodeUTF8(bytes);
        }

        /**
         * Write a Boolean value. A single byte is written according to the value parameter. If the value is true, write 1; if the value is false, write 0.
         * @param value A Boolean value determining which byte is written. If the value is true, write 1; if the value is false, write 0.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 寫入布林值。根據 value 引數寫入單個位元組。如果為 true，則寫入 1，如果為 false，則寫入 0
         * @param value 確定寫入哪個位元組的布林值。如果該引數為 true，則該方法寫入 1；如果該引數為 false，則該方法寫入 0
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public writeBoolean(value: boolean): void {
            this.validateBuffer(ByteArraySize.SIZE_OF_BOOLEAN);
            this._bytes[this.position++] = +value;
        }

        /**
         * Write a byte into the byte stream
         * The low 8 bits of the parameter are used. The high 24 bits are ignored.
         * @param value A 32-bit integer. The low 8 bits will be written into the byte stream
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在位元組流中寫入一個位元組
         * 使用引數的低 8 位。忽略高 24 位
         * @param value 一個 32 位整數。低 8 位將被寫入位元組流
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public writeByte(value: number): void {
            this.validateBuffer(ByteArraySize.SIZE_OF_INT8);
            this._bytes[this.position++] = value & 0xff;
        }

        /**
         * Write the byte sequence that includes length bytes in the specified byte array, bytes, (starting at the byte specified by offset, using a zero-based index), into the byte stream
         * If the length parameter is omitted, the default length value 0 is used and the entire buffer starting at offset is written. If the offset parameter is also omitted, the entire buffer is written
         * If the offset or length parameter is out of range, they are clamped to the beginning and end of the bytes array.
         * @param bytes ByteArray Object
         * @param offset A zero-based index specifying the position into the array to begin writing
         * @param length An unsigned integer specifying how far into the buffer to write
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 將指定位元組陣列 bytes（起始偏移量為 offset，從零開始的索引）中包含 length 個位元組的位元組序列寫入位元組流
         * 如果省略 length 引數，則使用預設長度 0；該方法將從 offset 開始寫入整個緩衝區。如果還省略了 offset 引數，則寫入整個緩衝區
         * 如果 offset 或 length 超出範圍，它們將被鎖定到 bytes 陣列的開頭和結尾
         * @param bytes ByteArray 物件
         * @param offset 從 0 開始的索引，表示在陣列中開始寫入的位置
         * @param length 一個無符號整數，表示在緩衝區中的寫入範圍
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public writeBytes(bytes: ByteArray, offset: number = 0, length: number = 0): void {
            let writeLength: number;
            if (offset < 0) {
                return;
            }
            if (length < 0) {
                return;
            } else if (length == 0) {
                writeLength = bytes.length - offset;
            } else {
                writeLength = Math.min(bytes.length - offset, length);
            }
            if (writeLength > 0) {
                this.validateBuffer(writeLength);
                this._bytes.set(bytes._bytes.subarray(offset, offset + writeLength), this._position);
                this.position = this._position + writeLength;
            }
        }

        /**
         * Write an IEEE 754 double-precision (64 bit) floating point number into the byte stream
         * @param value Double-precision (64 bit) floating point number
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在位元組流中寫入一個 IEEE 754 雙精度（64 位）浮點數
         * @param value 雙精度（64 位）浮點數
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public writeDouble(value: number): void {
            this.validateBuffer(ByteArraySize.SIZE_OF_FLOAT64);
            this.data.setFloat64(this._position, value, this.$endian == EndianConst.LITTLE_ENDIAN);
            this.position += ByteArraySize.SIZE_OF_FLOAT64;
        }

        /**
         * Write an IEEE 754 single-precision (32 bit) floating point number into the byte stream
         * @param value Single-precision (32 bit) floating point number
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在位元組流中寫入一個 IEEE 754 單精度（32 位）浮點數
         * @param value 單精度（32 位）浮點數
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public writeFloat(value: number): void {
            this.validateBuffer(ByteArraySize.SIZE_OF_FLOAT32);
            this.data.setFloat32(this._position, value, this.$endian == EndianConst.LITTLE_ENDIAN);
            this.position += ByteArraySize.SIZE_OF_FLOAT32;
        }

        /**
         * Write a 32-bit signed integer into the byte stream
         * @param value An integer to be written into the byte stream
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在位元組流中寫入一個帶符號的 32 位整數
         * @param value 要寫入位元組流的整數
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public writeInt(value: number): void {
            this.validateBuffer(ByteArraySize.SIZE_OF_INT32);
            this.data.setInt32(this._position, value, this.$endian == EndianConst.LITTLE_ENDIAN);
            this.position += ByteArraySize.SIZE_OF_INT32;
        }

        /**
         * Write a 16-bit integer into the byte stream. The low 16 bits of the parameter are used. The high 16 bits are ignored.
         * @param value A 32-bit integer. Its low 16 bits will be written into the byte stream
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在位元組流中寫入一個 16 位整數。使用引數的低 16 位。忽略高 16 位
         * @param value 32 位整數，該整數的低 16 位將被寫入位元組流
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public writeShort(value: number): void {
            this.validateBuffer(ByteArraySize.SIZE_OF_INT16);
            this.data.setInt16(this._position, value, this.$endian == EndianConst.LITTLE_ENDIAN);
            this.position += ByteArraySize.SIZE_OF_INT16;
        }

        /**
         * Write a 32-bit unsigned integer into the byte stream
         * @param value An unsigned integer to be written into the byte stream
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在位元組流中寫入一個無符號的 32 位整數
         * @param value 要寫入位元組流的無符號整數
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public writeUnsignedInt(value: number): void {
            this.validateBuffer(ByteArraySize.SIZE_OF_UINT32);
            this.data.setUint32(this._position, value, this.$endian == EndianConst.LITTLE_ENDIAN);
            this.position += ByteArraySize.SIZE_OF_UINT32;
        }

        /**
         * Write a 16-bit unsigned integer into the byte stream
         * @param value An unsigned integer to be written into the byte stream
         * @version Egret 2.5
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在位元組流中寫入一個無符號的 16 位整數
         * @param value 要寫入位元組流的無符號整數
         * @version Egret 2.5
         * @platform Web,Native
         * @language zh_CN
         */
        public writeUnsignedShort(value: number): void {
            this.validateBuffer(ByteArraySize.SIZE_OF_UINT16);
            this.data.setUint16(this._position, value, this.$endian == EndianConst.LITTLE_ENDIAN);
            this.position += ByteArraySize.SIZE_OF_UINT16;
        }

        /**
         * Write a UTF-8 string into the byte stream. The length of the UTF-8 string in bytes is written first, as a 16-bit integer, followed by the bytes representing the characters of the string
         * @param value Character string value to be written
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 將 UTF-8 字串寫入位元組流。先寫入以位元組表示的 UTF-8 字串長度（作為 16 位整數），然後寫入表示字串字元的位元組
         * @param value 要寫入的字串值
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public writeUTF(value: string): void {
            let utf8bytes: ArrayLike<number> = this.encodeUTF8(value);
            let length: number = utf8bytes.length;
            this.validateBuffer(ByteArraySize.SIZE_OF_UINT16 + length);
            this.data.setUint16(this._position, length, this.$endian == EndianConst.LITTLE_ENDIAN);
            this.position += ByteArraySize.SIZE_OF_UINT16;
            this._writeUint8Array(utf8bytes, false);
        }

        /**
         * Write a UTF-8 string into the byte stream. Similar to the writeUTF() method, but the writeUTFBytes() method does not prefix the string with a 16-bit length word
         * @param value Character string value to be written
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 將 UTF-8 字串寫入位元組流。類似於 writeUTF() 方法，但 writeUTFBytes() 不使用 16 位長度的詞為字串新增字首
         * @param value 要寫入的字串值
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        public writeUTFBytes(value: string,byteSize?:number): void {
            // this.encodeUTF8(value);
            this._writeUint8Array(this.encodeUTF8(value,byteSize));
        }

       

        /**
         *
         * @returns
         * @version Egret 2.4
         * @platform Web,Native
         */
        public toString(): string {
            return "[ByteArray] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
        }

        /**
         * @private
         * 將 Uint8Array 寫入位元組流
         * @param bytes 要寫入的Uint8Array
         * @param validateBuffer
         */
        public _writeUint8Array(bytes: Uint8Array | ArrayLike<number>, validateBuffer: boolean = true): void {
            let pos = this._position;
            let npos = pos + bytes.length;
            if (validateBuffer) {
                this.validateBuffer(npos);
            }
            this.bytes.set(bytes, pos);
            this.position = npos;
        }

        /**
         * @param len
         * @returns
         * @version Egret 2.4
         * @platform Web,Native
         * @private
         */
        public validate(len: number): boolean {
            let bl = this._bytes.length;
            if (bl > 0 && this._position + len <= bl) {
                return true;
            } else {
                return false;
            }
        }

        /**********************/
        /*  PRIVATE METHODS   */
        /**********************/
        /**
         * @private
         * @param len
         * @param needReplace
         */
        protected validateBuffer(len: number): void {
            this.write_position = len > this.write_position ? len : this.write_position;
            len += this._position;
            this._validateBuffer(len);
        }

        /**
         * @private
         * UTF-8 Encoding/Decoding
         */
        private encodeUTF8(str: string,byteSize?:number|undefined): Uint8Array {
            let pos: number = 0;
            let codePoints = this.stringToCodePoints(str);
            let outputBytes = [];

            while (codePoints.length > pos) {
                let code_point: number = codePoints[pos++];

                if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                    this.encoderError(code_point);
                }
                else if (this.inRange(code_point, 0x0000, 0x007f)) {
                    if( byteSize == undefined ){
                        outputBytes.push(code_point);
                    }else{
                        //定長位元組數處理
                        if ( outputBytes.length +1 < byteSize ){
                            outputBytes.push(code_point);
                        }else{
                            break;
                        }
                    }
                } else {
                    let count = 0 , offset = 0;
                    if (this.inRange(code_point, 0x0080, 0x07FF)) {
                        count = 1;
                        offset = 0xC0;
                    } else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                        count = 2;
                        offset = 0xE0;
                    } else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
                        count = 3;
                        offset = 0xF0;
                    }

                    if ( byteSize == undefined ){
                        outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);

                        while (count > 0) {
                            let temp = this.div(code_point, Math.pow(64, count - 1));
                            outputBytes.push(0x80 + (temp % 64));
                            count -= 1;
                        }
                    }else{
                        let pushCount = 0;
                        outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);
                        pushCount++;
                        while (count > 0) {
                            let temp = this.div(code_point, Math.pow(64, count - 1));
                            outputBytes.push(0x80 + (temp % 64));
                            count -= 1;
                            pushCount++;
                        }
                        if ( outputBytes.length > byteSize ){
                            outputBytes.splice(outputBytes.length-pushCount,pushCount);
                            break;
                        }
                    }
                    
                }
            }
            if ( byteSize != undefined ){
                if( outputBytes.length < byteSize ){
                    //不足位元組，補足位元組數
                    let count = byteSize - outputBytes.length;
                    while(count>0){
                        outputBytes.push(0x00);
                        count--;
                    }
                }
            }
            return new Uint8Array(outputBytes);
        }

        /**
         * @private
         *
         * @param data
         * @returns
         */
        private decodeUTF8(data: Uint8Array): string {
            let fatal: boolean = false;
            let pos: number = 0;
            let result: string = "";
            let code_point: number | null = null;
            let utf8_code_point = 0;
            let utf8_bytes_needed = 0;
            let utf8_bytes_seen = 0;
            let utf8_lower_boundary = 0;

            while (data.length > pos) {

                let _byte = data[pos++];

                if (_byte == this.EOF_byte) {
                    if (utf8_bytes_needed != 0) {
                        code_point = this.decoderError(fatal);
                    } else {
                        code_point = this.EOF_code_point;
                    }
                } else {

                    if (utf8_bytes_needed == 0) {
                        if (this.inRange(_byte, 0x00, 0x7F)) {
                            code_point = _byte;
                        } else {
                            if (this.inRange(_byte, 0xC2, 0xDF)) {
                                utf8_bytes_needed = 1;
                                utf8_lower_boundary = 0x80;
                                utf8_code_point = _byte - 0xC0;
                            } else if (this.inRange(_byte, 0xE0, 0xEF)) {
                                utf8_bytes_needed = 2;
                                utf8_lower_boundary = 0x800;
                                utf8_code_point = _byte - 0xE0;
                            } else if (this.inRange(_byte, 0xF0, 0xF4)) {
                                utf8_bytes_needed = 3;
                                utf8_lower_boundary = 0x10000;
                                utf8_code_point = _byte - 0xF0;
                            } else {
                                this.decoderError(fatal);
                            }
                            utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                            code_point = null;
                        }
                    } else if (!this.inRange(_byte, 0x80, 0xBF)) {
                        utf8_code_point = 0;
                        utf8_bytes_needed = 0;
                        utf8_bytes_seen = 0;
                        utf8_lower_boundary = 0;
                        pos--;
                        code_point = this.decoderError(fatal, _byte);
                    } else {

                        utf8_bytes_seen += 1;
                        utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);

                        if (utf8_bytes_seen !== utf8_bytes_needed) {
                            code_point = null;
                        } else {

                            let cp = utf8_code_point;
                            let lower_boundary = utf8_lower_boundary;
                            utf8_code_point = 0;
                            utf8_bytes_needed = 0;
                            utf8_bytes_seen = 0;
                            utf8_lower_boundary = 0;
                            if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
                                code_point = cp;
                            } else {
                                code_point = this.decoderError(fatal, _byte);
                            }
                        }

                    }
                }
                //Decode string
                if (code_point !== null && code_point !== this.EOF_code_point) {
                    if (code_point <= 0xFFFF) {
                        if (code_point > 0) result += String.fromCharCode(code_point);
                    } else {
                        code_point -= 0x10000;
                        result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                        result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                    }
                }
            }
            return result;
        }

        /**
         * @private
         *
         * @param code_point
         */
        private encoderError(code_point:any) {
        }

        /**
         * @private
         *
         * @param fatal
         * @param opt_code_point
         * @returns
         */
        private decoderError(fatal : any, opt_code_point?:any): number {
            if (fatal) {
            }
            return opt_code_point || 0xFFFD;
        }

        /**
         * @private
         */
        private EOF_byte: number = -1;
        /**
         * @private
         */
        private EOF_code_point: number = -1;

        /**
         * @private
         *
         * @param a
         * @param min
         * @param max
         */
        private inRange(a:any, min:any, max:any) {
            return min <= a && a <= max;
        }

        /**
         * @private
         *
         * @param n
         * @param d
         */
        private div(n:any, d:any) {
            return Math.floor(n / d);
        }

        /**
         * @private
         *
         * @param string
         */
        private stringToCodePoints(string:string) {
            /** @type {Array.<number>} */
            let cps = [];
            // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
            let i = 0, n = string.length;
            while (i < string.length) {
                let c = string.charCodeAt(i);
                if (!this.inRange(c, 0xD800, 0xDFFF)) {
                    cps.push(c);
                } else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                    cps.push(0xFFFD);
                } else { // (inRange(c, 0xD800, 0xDBFF))
                    if (i == n - 1) {
                        cps.push(0xFFFD);
                    } else {
                        let d = string.charCodeAt(i + 1);
                        if (this.inRange(d, 0xDC00, 0xDFFF)) {
                            let a = c & 0x3FF;
                            let b = d & 0x3FF;
                            i += 1;
                            cps.push(0x10000 + (a << 10) + b);
                        } else {
                            cps.push(0xFFFD);
                        }
                    }
                }
                i += 1;
            }
            return cps;
        }
    }

