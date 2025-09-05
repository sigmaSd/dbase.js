// @generated file from wasmbuild -- do not edit
// deno-lint-ignore-file
// deno-fmt-ignore-file

/**
 * Check if a DBF file contains memo fields that require a memo file
 */
export function dbf_needs_memo(file_content: Uint8Array): boolean;
/**
 * Read a DBF file with optional memo content and encoding, returning both data and field types
 */
export function read_dbf_with_types(
  file_content: Uint8Array,
  memo_content?: Uint8Array | null,
  encoding_name?: string | null,
): string;
/**
 * Legacy function for backward compatibility
 */
export function read_dbf(
  file_content: Uint8Array,
  memo_content?: Uint8Array | null,
  encoding_name?: string | null,
): string;
