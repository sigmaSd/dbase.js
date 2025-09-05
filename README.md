# @sigma/dbase

Fast dBase (.dbf) file parser with memo support for Node.js, Deno, and browsers.

Built with WebAssembly for maximum performance while maintaining compatibility
across JavaScript runtimes.

## Features

- **Universal**: Works in Node.js, Deno, and browsers
- **Fast**: WebAssembly-powered parsing
- **Complete**: Supports all dBase field types including memo fields (.fpt/.dbt)
- **Smart**: Automatically detects and loads memo files
- **Type-safe**: Full TypeScript support with proper Date objects
- **Encoding**: Supports CP850, CP1252, UTF-8, and ASCII encodings
- **Zero-copy**: Direct buffer parsing without file I/O for browser use

## Installation

### Deno (with WASM imports - recommended)

```typescript
import { read, readData } from "jsr:@sigma/dbase";
```

### Browsers and runtimes without WASM import support

For browsers and runtimes that don't support WebAssembly imports yet, use the
inline version:

```typescript
import { read, readData } from "jsr:@sigma/dbase/inline";
```

### Node.js

```bash
npx jsr add @sigma/dbase
```

```typescript
import { read, readData } from "@sigma/dbase/inline";
```

## Quick Start

### File-based API

```typescript
import { read } from "jsr:@sigma/dbase";

// Simple usage - automatically handles memo files
const records = read("./data.dbf");

// With encoding for international text
const records = read("./data.dbf", "cp1252");

console.log(`Found ${records.length} records`);
records.forEach((record) => {
  console.log(record.NAME, record.DATE);
});
```

### Buffer-based API

```typescript
import { readData } from "jsr:@sigma/dbase";

// Read files into buffers first (example with File API)
const dbfBuffer = new Uint8Array(await dbfFile.arrayBuffer());
const memoBuffer = memoFile
  ? new Uint8Array(await memoFile.arrayBuffer())
  : undefined;

// Parse the data
const records = readData(dbfBuffer, memoBuffer);

console.log(`Found ${records.length} records`);
```

### Browser Example

```html
<input type="file" id="dbfFile" accept=".dbf">
<input type="file" id="memoFile" accept=".fpt,.dbt">

<script type="module">
  import { readData } from "https://esm.sh/jsr/@sigma/dbase/inline";

  document.getElementById("dbfFile").addEventListener(
    "change",
    async (e) => {
      const dbfFile = e.target.files[0];
      const memoFile = document.getElementById("memoFile").files[0];

      const dbfBuffer = new Uint8Array(await dbfFile.arrayBuffer());
      const memoBuffer = memoFile
        ? new Uint8Array(await memoFile.arrayBuffer())
        : undefined;

      const records = readData(dbfBuffer, memoBuffer);
      console.log("Parsed records:", records);
    },
  );
</script>
```

## API Reference

### `read(dbfPath: string, encoding?: Encoding): DbfRecord[]`

Reads a dBase file from disk, automatically detecting and loading memo files.

**Parameters:**

- `dbfPath`: Path to the .dbf file
- `encoding`: Text encoding ("utf8" | "cp850" | "cp1252" | "ascii"). Defaults to
  "cp850"

**Returns:** Array of record objects

**Note:** Only available in Node.js and Deno (requires file system access).

### `readData(dbData: Uint8Array, memoData?: Uint8Array, encoding?: Encoding): DbfRecord[]`

Reads dBase data from memory buffers without file I/O. Works in all environments
including browsers.

**Parameters:**

- `dbData`: The DBF file content as Uint8Array
- `memoData`: Optional memo file content as Uint8Array
- `encoding`: Text encoding ("utf8" | "cp850" | "cp1252" | "ascii"). Defaults to
  "cp850"

**Returns:** Array of record objects

### Types

```typescript
type Encoding = "utf8" | "cp850" | "cp1252" | "ascii";

type DbfRecord = Record<string, string | number | boolean | Date | null>;
```

## Supported Field Types

| dBase Type | JavaScript Type | Description                    |
| ---------- | --------------- | ------------------------------ |
| Character  | string          | Text fields                    |
| Numeric    | number          | Numbers with decimals          |
| Date       | Date            | Date values                    |
| Logical    | boolean         | True/false values              |
| Memo       | string          | Long text from .fpt/.dbt files |
| Float      | number          | Floating point numbers         |
| Integer    | number          | Whole numbers                  |
| Currency   | number          | Currency values                |
| DateTime   | Date            | Date and time values           |

## Encoding Support

- **CP850**: DOS Latin-1 (default, most common)
- **CP1252**: Windows Latin-1
- **UTF-8**: Unicode
- **ASCII**: Basic ASCII

## Performance

This library uses WebAssembly for parsing, providing excellent performance.

## Error Handling

The library provides clear error messages for common issues:

```typescript
try {
  const records = read("data.dbf");
} catch (error) {
  if (error.message.includes("memo file")) {
    console.log("This DBF file needs a memo file (.fpt or .dbt)");
  }
}
```

## Browser vs Runtime Support

### Deno (Recommended)

Use the default export - Deno has native WebAssembly import support.

### Browsers and Other Runtimes

Use the `/inline` export which includes the WebAssembly code inline. This is
larger but works everywhere.

## License

MIT License - see LICENSE file for details.

## Contributing

This library is built with Rust and compiled to WebAssembly. To contribute:

1. Install Rust
2. Make changes to `src/lib.rs`
3. Run `deno task wasmbuild && deno task wasmbuild:inline` to rebuild
4. Test your changes

## Changelog

### 0.1.0

- Initial release
- Support for all dBase field types
- Automatic memo file detection
- Multi-encoding support
- Browser and Node.js compatibility
