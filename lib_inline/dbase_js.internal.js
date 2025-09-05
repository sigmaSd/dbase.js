// @generated file from wasmbuild -- do not edit
// @ts-nocheck: generated
// deno-lint-ignore-file
// deno-fmt-ignore-file

let wasm;
export function __wbg_set_wasm(val) {
  wasm = val;
}

const lTextDecoder = typeof TextDecoder === "undefined"
  ? (0, module.require)("util").TextDecoder
  : TextDecoder;

let cachedTextDecoder = new lTextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

cachedTextDecoder.decode();

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
  if (
    cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0
  ) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(
    getUint8ArrayMemory0().subarray(ptr, ptr + len),
  );
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === "undefined"
  ? (0, module.require)("util").TextEncoder
  : TextEncoder;

let cachedTextEncoder = new lTextEncoder("utf-8");

const encodeString = typeof cachedTextEncoder.encodeInto === "function"
  ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
  }
  : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length,
    };
  };

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;

  const mem = getUint8ArrayMemory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7F) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);

    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
  if (
    cachedDataViewMemory0 === null ||
    cachedDataViewMemory0.buffer.detached === true ||
    (cachedDataViewMemory0.buffer.detached === undefined &&
      cachedDataViewMemory0.buffer !== wasm.memory.buffer)
  ) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8ArrayMemory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_export_3.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}
/**
 * Check if a DBF file contains memo fields that require a memo file
 * @param {Uint8Array} file_content
 * @returns {boolean}
 */
export function dbf_needs_memo(file_content) {
  const ptr0 = passArray8ToWasm0(file_content, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.dbf_needs_memo(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return ret[0] !== 0;
}

function isLikeNone(x) {
  return x === undefined || x === null;
}
/**
 * Read a DBF file with optional memo content and encoding, returning both data and field types
 * @param {Uint8Array} file_content
 * @param {Uint8Array | null} [memo_content]
 * @param {string | null} [encoding_name]
 * @returns {string}
 */
export function read_dbf_with_types(file_content, memo_content, encoding_name) {
  let deferred5_0;
  let deferred5_1;
  try {
    const ptr0 = passArray8ToWasm0(file_content, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(memo_content)
      ? 0
      : passArray8ToWasm0(memo_content, wasm.__wbindgen_malloc);
    var len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(encoding_name)
      ? 0
      : passStringToWasm0(
        encoding_name,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
    var len2 = WASM_VECTOR_LEN;
    const ret = wasm.read_dbf_with_types(ptr0, len0, ptr1, len1, ptr2, len2);
    var ptr4 = ret[0];
    var len4 = ret[1];
    if (ret[3]) {
      ptr4 = 0;
      len4 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred5_0 = ptr4;
    deferred5_1 = len4;
    return getStringFromWasm0(ptr4, len4);
  } finally {
    wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
  }
}

/**
 * Legacy function for backward compatibility
 * @param {Uint8Array} file_content
 * @param {Uint8Array | null} [memo_content]
 * @param {string | null} [encoding_name]
 * @returns {string}
 */
export function read_dbf(file_content, memo_content, encoding_name) {
  let deferred5_0;
  let deferred5_1;
  try {
    const ptr0 = passArray8ToWasm0(file_content, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(memo_content)
      ? 0
      : passArray8ToWasm0(memo_content, wasm.__wbindgen_malloc);
    var len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(encoding_name)
      ? 0
      : passStringToWasm0(
        encoding_name,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
    var len2 = WASM_VECTOR_LEN;
    const ret = wasm.read_dbf(ptr0, len0, ptr1, len1, ptr2, len2);
    var ptr4 = ret[0];
    var len4 = ret[1];
    if (ret[3]) {
      ptr4 = 0;
      len4 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred5_0 = ptr4;
    deferred5_1 = len4;
    return getStringFromWasm0(ptr4, len4);
  } finally {
    wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
  }
}

export function __wbg_error_7534b8e9a36f1ab4(arg0, arg1) {
  let deferred0_0;
  let deferred0_1;
  try {
    deferred0_0 = arg0;
    deferred0_1 = arg1;
    console.error(getStringFromWasm0(arg0, arg1));
  } finally {
    wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
  }
}

export function __wbg_new_8a6f238a6ece86ea() {
  const ret = new Error();
  return ret;
}

export function __wbg_stack_0ed75d68575b0f3c(arg0, arg1) {
  const ret = arg1.stack;
  const ptr1 = passStringToWasm0(
    ret,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  const len1 = WASM_VECTOR_LEN;
  getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
  getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}

export function __wbindgen_error_new(arg0, arg1) {
  const ret = new Error(getStringFromWasm0(arg0, arg1));
  return ret;
}

export function __wbindgen_init_externref_table() {
  const table = wasm.__wbindgen_export_3;
  const offset = table.grow(4);
  table.set(0, undefined);
  table.set(offset + 0, undefined);
  table.set(offset + 1, null);
  table.set(offset + 2, true);
  table.set(offset + 3, false);
}
