import { readFileSync } from "node:fs";
import { dbf_needs_memo, read_dbf_with_types } from "../lib/dbase_js.js";
import process from "node:process";

export type Encoding = "utf8" | "cp850" | "cp1252" | "ascii";

/** A record from a dBase file - object with string keys and various value types */
export type DbfRecord = Record<string, string | number | boolean | Date | null>;

/**
 * Reads dBase data from Uint8Array buffers without using file I/O.
 *
 * This function is designed to work in any environment, including browsers,
 * by operating directly on data buffers instead of file paths.
 *
 * @param dbData The DBF file content as Uint8Array
 * @param memoData Optional memo file content as Uint8Array
 * @param encoding Text encoding to use. Defaults to "cp850" (DOS Latin-1)
 * @returns Array of record objects
 *
 * @example
 * ```typescript
 * // Read files into buffers first
 * const dbfBuffer = new Uint8Array(await file.arrayBuffer());
 * const memoBuffer = memoFile ? new Uint8Array(await memoFile.arrayBuffer()) : undefined;
 *
 * // Parse the data
 * const records = readData(dbfBuffer, memoBuffer);
 *
 * console.log(`Found ${records.length} records`);
 * records.forEach(record => {
 *   console.log(record.NAME, record.DATE);
 * });
 * ```
 */
export function readData(
  dbData: Uint8Array,
  memoData?: Uint8Array,
  encoding: Encoding = "cp850",
): DbfRecord[] {
  // Check if this DBF file needs a memo file
  const needsMemo = dbf_needs_memo(dbData);

  if (needsMemo && !memoData) {
    throw new Error(
      `This DBF file contains memo fields but no memo data was provided.\n` +
        `Please provide the memo file content as the second parameter.`,
    );
  }

  // Read the DBF file with field type metadata
  const jsonString = read_dbf_with_types(dbData, memoData || null, encoding);
  const result = JSON.parse(jsonString);

  // Convert date fields to proper Date objects using field type metadata
  return result.records.map((record: DbfRecord) =>
    convertDatesWithTypes(record, result.field_types)
  );
}

/**
 * Reads a dBase (.dbf) file from a path, automatically detecting and loading memo files.
 *
 * This function handles file I/O automatically:
 * - Loads the DBF file
 * - Auto-detects if memo files (.fpt/.dbt) are needed
 * - Finds and loads the corresponding memo file
 * - Parses all field types correctly
 * - Returns clean JavaScript objects
 *
 * @param dbfPath Path to the .dbf file
 * @param encoding Text encoding to use. Defaults to "cp850" (DOS Latin-1)
 * @returns Array of record objects
 *
 * @example
 * ```typescript
 * // Simplest usage - works with any DBF file
 * const records = read("/path/to/data.dbf");
 *
 * // With encoding for international text
 * const records = read("/path/to/data.dbf", "cp1252");
 *
 * // Process the data
 * console.log(`Found ${records.length} records`);
 * records.forEach(record => {
 *   console.log(record.NAME, record.DATE);
 * });
 * ```
 */
export function read(
  dbfPath: string,
  encoding: Encoding = "cp850",
): DbfRecord[] {
  // Load the DBF file
  const dbfData = readFileSync(dbfPath);

  // Check if this DBF file needs a memo file
  const needsMemo = dbf_needs_memo(dbfData);

  let memoData: Uint8Array | null = null;
  if (needsMemo) {
    // Try to find and load memo file automatically
    memoData = findMemoFile(dbfPath);
    if (!memoData) {
      const triedPaths = getMemoPathsToTry(dbfPath);
      throw new Error(
        `This DBF file contains memo fields but no memo file could be found.\n` +
          `Looked for: ${triedPaths.join(", ")}\n\n` +
          `Make sure the memo file (.fpt or .dbt) exists in the same directory as the DBF file.`,
      );
    }
  }

  // Use the buffer-based function
  return readData(dbfData, memoData || undefined, encoding);
}

/**
 * Try to find and load the memo file for a given DBF path
 */
function findMemoFile(dbfPath: string): Uint8Array | null {
  const memoPaths = getMemoPathsToTry(dbfPath);

  for (const memoPath of memoPaths) {
    try {
      return readFileSync(memoPath);
    } catch {
      // Continue trying other extensions
    }
  }

  return null;
}

/**
 * Get all possible memo file paths to try for a given DBF path
 */
function getMemoPathsToTry(dbfPath: string): string[] {
  const basePath = dbfPath.replace(/\.[^.]*$/, ""); // Remove extension
  return [
    basePath + ".fpt",
    basePath + ".FPT",
    basePath + ".dbt",
    basePath + ".DBT",
  ];
}

/**
 * Convert date fields to proper Date objects using field type metadata
 */
function convertDatesWithTypes(
  record: DbfRecord,
  fieldTypes: Record<string, string>,
): DbfRecord {
  const converted: DbfRecord = {};

  for (const [key, value] of Object.entries(record)) {
    const fieldType = fieldTypes[key];

    if (fieldType === "Date" && typeof value === "string" && value !== null) {
      // Parse ISO date strings like "2024-09-13"
      const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (dateMatch) {
        const year = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]) - 1; // JavaScript months are 0-based
        const day = parseInt(dateMatch[3]);
        converted[key] = new Date(year, month, day);
      } else {
        converted[key] = value;
      }
    } else if (
      fieldType === "DateTime" && typeof value === "string" && value !== null
    ) {
      // Parse ISO datetime strings like "2024-09-13T14:30:00"
      const dateTimeMatch = value.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/,
      );
      if (dateTimeMatch) {
        const year = parseInt(dateTimeMatch[1]);
        const month = parseInt(dateTimeMatch[2]) - 1; // JavaScript months are 0-based
        const day = parseInt(dateTimeMatch[3]);
        const hour = parseInt(dateTimeMatch[4]);
        const minute = parseInt(dateTimeMatch[5]);
        const second = parseInt(dateTimeMatch[6]);
        converted[key] = new Date(year, month, day, hour, minute, second);
      } else {
        converted[key] = value;
      }
    } else {
      converted[key] = value;
    }
  }

  return converted;
}

// Example usage and test when run as main module
if (import.meta.main) {
  const testPath = process.argv[2];
  if (testPath) {
    console.log(read(testPath));
  }
}
