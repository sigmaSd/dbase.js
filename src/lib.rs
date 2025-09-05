use dbase::{FieldValue, ReaderBuilder, FieldType};
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::io::Cursor;
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct DbfResult {
    records: Vec<serde_json::Value>,
    field_types: HashMap<String, String>,
}

/// Check if a DBF file contains memo fields that require a memo file
#[wasm_bindgen]
pub fn dbf_needs_memo(file_content: &[u8]) -> Result<bool, JsError> {
    console_error_panic_hook::set_once();

    let cursor = Cursor::new(file_content);
    let reader = ReaderBuilder::new(cursor)
        .with_encoding(yore::code_pages::CP850)
        .build()
        .map_err(|e| JsError::new(&format!("Failed to create dbase reader: {}", e)))?;

    // Check if any field is a memo field
    let has_memo_fields = reader
        .fields()
        .iter()
        .any(|f| f.field_type() == dbase::FieldType::Memo);

    Ok(has_memo_fields)
}

/// Read a DBF file with optional memo content and encoding, returning both data and field types
#[wasm_bindgen]
pub fn read_dbf_with_types(
    file_content: &[u8],
    memo_content: Option<Vec<u8>>,
    encoding_name: Option<String>,
) -> Result<String, JsError> {
    console_error_panic_hook::set_once();

    // Handle different encodings and memo scenarios
    let result = match encoding_name.as_deref() {
        Some("utf8") => {
            if let Some(memo_data) = memo_content {
                read_with_memo_and_encoding_typed(file_content, &memo_data, dbase::encoding::UnicodeLossy)
            } else {
                read_with_encoding_typed(file_content, dbase::encoding::UnicodeLossy)
            }
        }
        Some("cp1252") => {
            if let Some(memo_data) = memo_content {
                read_with_memo_and_encoding_typed(file_content, &memo_data, yore::code_pages::CP1252)
            } else {
                read_with_encoding_typed(file_content, yore::code_pages::CP1252)
            }
        }
        Some("ascii") => {
            if let Some(memo_data) = memo_content {
                read_with_memo_and_encoding_typed(file_content, &memo_data, dbase::encoding::UnicodeLossy)
            } else {
                read_with_encoding_typed(file_content, dbase::encoding::UnicodeLossy)
            }
        }
        Some("cp850") | None => {
            if let Some(memo_data) = memo_content {
                read_with_memo_and_encoding_typed(file_content, &memo_data, yore::code_pages::CP850)
            } else {
                read_with_encoding_typed(file_content, yore::code_pages::CP850)
            }
        }
        Some(enc) => {
            return Err(JsError::new(&format!("Unsupported encoding: {}", enc)));
        }
    };

    result
}

/// Legacy function for backward compatibility
#[wasm_bindgen]
pub fn read_dbf(
    file_content: &[u8],
    memo_content: Option<Vec<u8>>,
    encoding_name: Option<String>,
) -> Result<String, JsError> {
    let result_json = read_dbf_with_types(file_content, memo_content, encoding_name)?;
    let dbf_result: DbfResult = serde_json::from_str(&result_json)
        .map_err(|e| JsError::new(&format!("Failed to parse result: {}", e)))?;

    serde_json::to_string(&dbf_result.records)
        .map_err(|e| JsError::new(&format!("Failed to serialize records: {}", e)))
}

fn read_with_encoding_typed<E: dbase::Encoding + 'static>(
    file_content: &[u8],
    encoding: E,
) -> Result<String, JsError> {
    let cursor = Cursor::new(file_content);
    let mut reader = ReaderBuilder::new(cursor)
        .with_encoding(encoding)
        .build()
        .map_err(|e| JsError::new(&format!("Failed to create dbase reader: {}", e)))?;

    read_records_with_types(&mut reader)
}

fn read_with_memo_and_encoding_typed<E: dbase::Encoding + 'static>(
    file_content: &[u8],
    memo_content: &[u8],
    encoding: E,
) -> Result<String, JsError> {
    let cursor = Cursor::new(file_content);
    let memo_cursor = Cursor::new(memo_content);

    let mut reader = ReaderBuilder::new(cursor)
        .with_encoding(encoding)
        .with_memo(memo_cursor)
        .build()
        .map_err(|e| JsError::new(&format!("Failed to create dbase reader with memo: {}", e)))?;

    read_records_with_types(&mut reader)
}

fn read_records_with_types<T: std::io::Read + std::io::Seek>(
    reader: &mut dbase::Reader<T>,
) -> Result<String, JsError> {
    // Extract field type information
    let mut field_types = HashMap::new();
    for field_info in reader.fields() {
        let type_name = match field_info.field_type() {
            FieldType::Character => "Character",
            FieldType::Numeric => "Numeric",
            FieldType::Date => "Date",
            FieldType::Logical => "Logical",
            FieldType::Memo => "Memo",
            FieldType::Float => "Float",
            FieldType::Integer => "Integer",
            FieldType::Currency => "Currency",
            FieldType::DateTime => "DateTime",
            _ => "Unknown",
        };
        field_types.insert(field_info.name().to_string(), type_name.to_string());
    }
    let records = reader
        .read()
        .map_err(|e| JsError::new(&format!("Failed to read records: {}", e)))?;

    let mut result = Vec::new();
    for record in records {
        let mut record_map = std::collections::HashMap::new();
        for (name, value) in record {
            let json_value = match value {
                FieldValue::Character(s) => {
                    serde_json::Value::String(s.unwrap_or_default())
                }
                FieldValue::Numeric(n) => {
                    if let Some(num) = n {
                        serde_json::Value::Number(
                            serde_json::Number::from_f64(num).unwrap_or(serde_json::Number::from(0)),
                        )
                    } else {
                        serde_json::Value::Null
                    }
                }
                FieldValue::Date(d) => {
                    if let Some(date) = d {
                        // Return ISO date string instead of debug format
                        serde_json::Value::String(format!("{:04}-{:02}-{:02}",
                            date.year(), date.month(), date.day()))
                    } else {
                        serde_json::Value::Null
                    }
                }
                FieldValue::Logical(b) => serde_json::Value::Bool(b.unwrap_or(false)),
                FieldValue::Memo(s) => serde_json::Value::String(s),
                FieldValue::Float(f) => {
                    if let Some(float_val) = f {
                        serde_json::Value::Number(
                            serde_json::Number::from_f64(float_val as f64).unwrap_or(serde_json::Number::from(0)),
                        )
                    } else {
                        serde_json::Value::Null
                    }
                }
                FieldValue::Integer(i) => {
                    serde_json::Value::Number(serde_json::Number::from(i))
                }
                FieldValue::Currency(c) => {
                    serde_json::Value::Number(
                        serde_json::Number::from_f64(c).unwrap_or(serde_json::Number::from(0)),
                    )
                }
                FieldValue::DateTime(dt) => {
                    // Return ISO datetime string
                    serde_json::Value::String(format!("{:04}-{:02}-{:02}T{:02}:{:02}:{:02}",
                        dt.date().year(), dt.date().month(), dt.date().day(),
                        dt.time().hours(), dt.time().minutes(), dt.time().seconds()))
                }
                _ => serde_json::Value::Null,
            };
            record_map.insert(name, json_value);
        }
        result.push(serde_json::to_value(record_map).unwrap());
    }

    let dbf_result = DbfResult {
        records: result,
        field_types,
    };

    serde_json::to_string(&dbf_result)
        .map_err(|e| JsError::new(&format!("Failed to serialize to JSON: {}", e)))
}
