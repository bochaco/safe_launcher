/* eslint-disable no-underscore-dangle */
import ref from 'ref';

import FfiApi from '../ffi_api';
import appManager from '../util/app_manager';

const Void = ref.types.void;
const int32 = ref.types.int32;
const u64 = ref.types.uint64;
const u8 = ref.types.uint8;
const CString = ref.types.CString;
/* eslint-disable camelcase */
const size_t = ref.types.size_t;
/* eslint-enable camelcase */
const u8Pointer = ref.refType(u8);
const u64Pointer = ref.refType(u64);
const int32Ptr = ref.refType(int32);
/* eslint-disable camelcase */
const size_tPointer = ref.refType(size_t);
/* eslint-enable camelcase */
const AppHandle = ref.refType(Void);

const PointerToU8Pointer = ref.refType(u8Pointer);

class Misc extends FfiApi {
  getFunctionsToRegister() {
    /* eslint-disable camelcase */
    return {
      init_logging: [int32, []],
      misc_encrypt_key_free: [int32, [u64]],
      misc_sign_key_free: [int32, [u64]],
      misc_serialise_data_id: [int32, [u64, PointerToU8Pointer, size_tPointer, size_tPointer]],
      misc_deserialise_data_id: [int32, [u8Pointer, size_t, u64Pointer]],
      misc_serialise_appendable_data: [int32,
        [u64, PointerToU8Pointer, size_tPointer, size_tPointer]],
      misc_serialise_struct_data: [int32, [u64, PointerToU8Pointer, size_tPointer, size_tPointer]],
      misc_deserialise_appendable_data: [int32, [u8Pointer, size_t, u64Pointer]],
      misc_deserialise_struct_data: [int32, [u8Pointer, size_t, u64Pointer]],
      misc_serialise_sign_key: [int32, [u64, PointerToU8Pointer, size_tPointer, size_tPointer]],
      misc_deserialise_sign_key: [int32, [u8Pointer, size_t, u64Pointer]],
      misc_maid_sign_key: [int32, [AppHandle, u64Pointer]],
      misc_u8_ptr_free: [Void, [u8Pointer, size_t, size_t]],
      output_log_path: ['pointer', [CString, u64, int32Ptr, int32Ptr, int32Ptr]]
    };
    /* eslint-enable camelcase */
  }

  getLogFilePath() {
    const self = this;
    const executor = (resolve, reject) => {
      const sizePtr = ref.alloc(int32);
      const capacityPtr = ref.alloc(int32);
      const resultPtr = ref.alloc(int32);
      const outputFile = 'Client_ui.log';

      const onResult = (err, res) => {
        if (err) {
          return reject(err);
        }
        const result = resultPtr.deref();
        if (res.isNull() || result !== 0) {
          return reject(result);
        }
        const size = sizePtr.deref();
        const capacity = capacityPtr.deref();
        const response = ref.reinterpret(res, size).toString();
        self.dropVector(res, size, capacity);
        resolve(response);
      };
      self.safeCore.output_log_path.async(outputFile, outputFile.length,
        sizePtr, capacityPtr, resultPtr, onResult);
    };
    return new Promise(executor);
  }

  dropEncryptKeyHandle(handleId) {
    const self = this;
    const executor = (resolve, reject) => {
      const onResult = (err, res) => {
        if (err || res !== 0) {
          return reject(err || res);
        }
        resolve();
      };
      self.safeCore.misc_encrypt_key_free.async(handleId, onResult);
    };
    return new Promise(executor);
  }

  dropSignKeyHandle(handleId) {
    const self = this;
    const executor = (resolve, reject) => {
      const onResult = (err, res) => {
        if (err || res !== 0) {
          return reject(err || res);
        }
        resolve();
      };
      self.safeCore.misc_sign_key_free.async(handleId, onResult);
    };
    return new Promise(executor);
  }

  dropVector(dataPointer, size, capacity) {
    const self = this;
    const executor = resolve => {
      const onResult = (err) => {
        if (err) {
          console.error(err);
        }
        resolve();
      };
      try {
        self.safeCore.misc_u8_ptr_free.async(dataPointer, size, capacity, onResult);
      } catch (e) {
        console.error(e);
      }
    };
    return new Promise(executor);
  }

  _serialise(handleId, type) {
    return new Promise((resolve, reject) => {
      const dataPointerRef = ref.alloc(PointerToU8Pointer);
      const sizeRef = ref.alloc(size_t);
      const capacityRef = ref.alloc(size_t);
      const onResult = (err, res) => {
        if (err || res !== 0) {
          return reject(err || res);
        }
        const size = sizeRef.deref();
        const capacity = capacityRef.deref();
        const dataPointer = dataPointerRef.deref();
        const data = Buffer.concat([ref.reinterpret(dataPointer, size)]);
        this.dropVector(dataPointer, size, capacity);
        resolve(data);
      };
      switch (type) {
        case 0:
          this.safeCore.misc_serialise_data_id.async(handleId, dataPointerRef,
            sizeRef, capacityRef, onResult);
          break;
        case 1:
          this.safeCore.misc_serialise_appendable_data.async(handleId, dataPointerRef,
            sizeRef, capacityRef, onResult);
          break;
        case 2:
          this.safeCore.misc_serialise_struct_data.async(handleId, dataPointerRef,
            sizeRef, capacityRef, onResult);
          break;
        case 3:
          this.safeCore.misc_serialise_sign_key.async(handleId, dataPointerRef,
            sizeRef, capacityRef, onResult);
          break;
        default:
      }
    });
  }

  _deserialise(data, type) {
    return new Promise((resolve, reject) => {
      const handleRef = ref.alloc(u64);
      const onResult = (err, res) => {
        if (err || res !== 0) {
          return reject(err || res);
        }
        resolve(handleRef.deref());
      };
      switch (type) {
        case 0:
          this.safeCore.misc_deserialise_data_id.async(data, data.length, handleRef, onResult);
          break;
        case 1:
          this.safeCore.misc_deserialise_appendable_data.async(data, data.length,
            handleRef, onResult);
          break;
        case 2:
          this.safeCore.misc_deserialise_struct_data.async(data, data.length, handleRef, onResult);
          break;
        case 3:
          this.safeCore.misc_deserialise_sign_key.async(data, data.length, handleRef, onResult);
          break;
        default:
      }
    });
  }

  serialiseDataId(handleId) {
    return this._serialise(handleId, 0);
  }

  serialiseAppendableData(handleId) {
    return this._serialise(handleId, 1);
  }

  serialiseStructuredData(handleId) {
    return this._serialise(handleId, 2);
  }

  serialiseSignKey(handleId) {
    return this._serialise(handleId, 3);
  }

  deserialiseDataId(data) {
    return this._deserialise(data, 0);
  }

  deserialiseAppendableData(data) {
    return this._deserialise(data, 1);
  }

  deserialiseStructuredData(data) {
    return this._deserialise(data, 2);
  }

  deserialiseSignKey(data) {
    return this._deserialise(data, 3);
  }

  getSignKey(app) {
    const self = this;
    const executor = (resolve, reject) => {
      const handleRef = ref.alloc(u64);
      const onResult = (err, res) => {
        if (err || res !== 0) {
          return reject(err || res);
        }
        resolve(handleRef.deref());
      };

      try {
        self.safeCore.misc_maid_sign_key.async(appManager.getHandle(app), handleRef, onResult);
      } catch (e) {
        reject(e);
      }
    };
    return new Promise(executor);
  }
}
/* eslint-enable no-underscore-dangle */
const misc = new Misc();
export default misc;
