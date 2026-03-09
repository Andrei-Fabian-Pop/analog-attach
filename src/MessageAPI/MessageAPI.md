# AnalogAttach Message API Documentation

## Overview

This document defines the message API for communication between the Analog Attach Visual Studio Code Extension frontend and backend. The API targets the
PlugAndPlay version of Analog Attach.

## Table of Contents

- [Overview](#overview)
- [Message Structure](#message-structure)
- [Error Handling](#error-handling)
  - [Configuration Item Errors](#configuration-item-errors)
- [API Commands](#api-commands)
  - [1. Session Management](#1-session-management)
    - [Get Attached Devices State](#get-attached-devices-state)
  - [2. Device Catalog Management](#2-device-catalog-management)
    - [Get Available Devices](#get-available-devices)
  - [3. Device Management](#3-device-management)
    - [Get Potential Parent Nodes](#get-potential-parent-nodes)
    - [Set Parent Node](#set-parent-node)
    - [Delete Device](#delete-device)
  - [4. Configuration Management](#4-configuration-management)
    - [Get Device Configuration](#get-device-configuration)
    - [Update Device Configuration](#update-device-configuration)
  - [5. File System Events](#5-file-system-events)
    - [File Changed Notification](#file-changed-notification)
- [Data Types](#data-types)
  - [Device](#device)
  - [ParentNode](#parentnode)
  - [Attached Device](#attached-device)
  - [Validation Types](#validation-types)
    - [Numeric Range Validation](#numeric-range-validation)
    - [Dropdown Validation](#dropdown-validation)
    - [Array Length Validation](#array-length-validation)
    - [Matrix Validation](#matrix-validation)
  - [FormElement Types](#formelement-types)
    - [Flag](#flag)
    - [FormArray](#formarray)
    - [FormMatrix](#formmatrix)
    - [Generic](#generic)
    - [ChooseOne](#chooseone)
    - [FormObject](#formobject)
    - [CustomProperty](#customproperty)
  - [Error (Configuration Item)](#error-configuration-item)

## Message Structure

All messages follow a standardized JSON structure for consistent communication:

```json
{
    "id": "string",           // Unique message identifier for request-response correlation
    "type": "request|response|notification",
    "timestamp": "ISO8601",   // When the message was created
    "command": "string",      // Command/response type identifier
    "payload": {}             // Command-specific data
}
```

## Error Handling

All response messages include a `status` field indicating the operation result:
- `success`: Operation completed successfully
- `error`: Operation failed
 
Error responses include an `error` object with:
- `code`: Machine-readable error code from the ErrorCodes enum
- `message`: Human-readable error message
- `details`: Optional additional error context

Example error structure:
```json
{
    "error": {
        "code": "INVALID_DEVICE_ID",
        "message": "The provided device ID does not exist.",
        "details": "Make sure you are using the official devices catalog."
    }
}
```

### Configuration Item Errors

In addition to top-level message errors, individual configuration items (form elements) can expose validation errors.

Each form element object MAY include an `error` field:

```json
{
    "key": "clock-names",
    "validationType":
    {
        "list": ["mclk", "adc_clk", "sync_clk"]
    },
    "error": {
        "code": "UNSET_PROPERTY",
        "message": "This is a required property that needs to be set.",
    }
}
```

Rules:
- If `error` is absent the property is considered valid.

## API Commands

### 1. Session Management

#### Get Attached Devices State
Retrieves the current state of all attached devices in the session.

**Frontend Request:**
- **Command:** `session.getAttachedDevicesState`
- **Payload:** `{}` (empty)

**Backend Response:**
- **Status:** `success | error`
- **Payload:**
```json
{
    "data": [
        {
            "device": {
                "id": "string",
                "name": "string",
                "deviceUID": "string",
                "alias": "string",
                "active": "boolean",
                "hasErrors": "boolean",
                "parentNode": {
                    "ID": "string",
                    "name": "string"
                },
                "maxChannels": "number",
                "channels": [
                    {
                        "name": "string",
                        "alias": "string",
                        "hasErrors": "boolean"
                    }
                ]
            }
        }
    ]
}
```

### 2. Device Catalog Management

#### Get Available Devices
Retrieves the list of all available devices from the catalog.

**Frontend Request:**
- **Command:** `catalog.getDevices`
- **Payload:** `{}` (empty)

**Backend Response:**
- **Status:** `success | error`
- **Payload:**
```json
{
    "devices": [
        {
            "deviceId": "string",      // e.g., "adi,ad7124-8"
            "name": "string",          // e.g., "AD7124-8 ADC"
            "description": "string",   // e.g., "24-bit Sigma-Delta ADC with 8 channels"
            "group": "string"          // Optional; e.g., "adc" when categorized
        }
    ]
}
```

### 3. Device Management

#### Get Potential Parent Nodes
Retrieves the list of potential parent nodes where a specific device can be attached.

**Frontend Request:**
- **Command:** `device.getPotentialParentNodes`
- **Payload:**
```json
{
    "deviceId": "string"       // Device identifier (e.g., "adi,ad7124-8")
}
```

**Backend Response:**
- **Status:** `success | error`
- **Payload:**
```json
{
    "potentialParentNodes": [
        {
            "name": "string",    // e.g., "spi0"
            "ID": "string"       // e.g., "spi0-0"
        }
    ]
}
```

#### Set Parent Node
Attaches a device to a specified parent node.

**Frontend Request:**
- **Command:** `device.setParentNode`
- **Payload:**
```json
{
    "deviceId": "string",      // Device identifier (e.g., "adi,ad7124-8")
    "parentNodeId": "string"   // Parent node identifier (e.g., "spi0-0")
}
```

**Backend Response:**
- **Status:** `success | error`
- **Payload:**
```json
{
    "deviceUID": "string"      // Unique identifier for the attached device instance
}
```

#### Delete Device
Removes an attached device from the device tree.

**Frontend Request:**
- **Command:** `device.delete`
- **Payload:**
```json
{
    "deviceUID": "string"      // Unique identifier of the device instance to delete
}
```

**Backend Response:**
- **Status:** `success | error`
- **Payload:**
```json
{
    "deviceUID": "string"      // Confirmation of the deleted device UID
}
```

### 4. Configuration Management

#### Get Device Configuration

Retrieves the configuration template for an attached device, including available options, validation rules, and current configuration state.

**Device Configuration Structure Overview:**

The device configuration uses a unified FormElement discriminated union approach where all configuration elements (including channels) are treated as form elements with specific types.

```
deviceConfiguration
├── Device-Specific Properties
│   ├── alias (optional)
│   ├── active (optional)
│   └── maxChannels (optional)
│
└── config (FormObject)
    └── channelRegexes (array, optional)
    └── FormElement[] (Array of form elements)
        ├── Flag (for boolean properties)
        │   ├── key (property identifier)
        │   ├── required
        │   ├── setValue (current boolean value)
        │   ├── defaultValue (optional)
        │   └── error (optional)
        │
        ├── FormArray (for array properties)
        │   ├── key (property identifier)
        │   ├── required
        │   ├── setValue (current array value)
        │   ├── defaultValue (optional)
        │   ├── validationType (array validation)
        │   └── error (optional)
        │
        ├── FormMatrix (for matrix properties - array of arrays)
        │   ├── key (property identifier)
        │   ├── required
        │   ├── setValue (current matrix value)
        │   ├── defaultValue (optional)
        │   ├── validationType (matrix validation)
        │   └── error (optional)
        │
        ├── Generic (for basic input elements)
        │   ├── key (property identifier)
        │   ├── inputType (text, number, dropdown, etc.)
        │   ├── required
        │   ├── setValue (current value)
        │   ├── defaultValue (optional)
        │   ├── validationType (optional)
        │   └── error (optional)
        │
        ├── ChooseOne (for mutually exclusive property selection)
        │   ├── key (instance identifier, e.g., "ChooseOne@0")
        │   ├── required
        │   ├── setValue (selected property key, optional)
        │   ├── config (array of form elements to choose from)
        │   └── error (optional)
        │
        ├── CustomProperty (for specialized property handling)
        │   ├── key (property identifier)
        │   ├── setValue (current string value)
        │   └── error (optional)
        │
        └── FormObject
            ├── key (object identifier, e.g., "channel@0")
            ├── required
            └── config
                └── FormElement[] (Array of form elements)
```

**Frontend Request:**

- **Command:** `device.getConfiguration`
- **Payload:**

```json
{
    "deviceUID": "string"      // Unique identifier of the device instance
}
```

**Backend Response:**

- **Status:** `success | error`
- **Payload:**

```json
{
    "deviceConfiguration": {
        "devConfiSpecificProperty": "any",    // [OPTIONAL] One or more device configuration specific properties
        "config": {                           // FormObject containing all form elements
            "alias": "string",                // [OPTIONAL] Device alias
            "active": "boolean",              // [OPTIONAL] Device active state
            "maxChannels": "number",          // [OPTIONAL] Maximum channels
            "channelRegexes": string[],       // [OPTIONAL] Array of name property patterns
            "config": [                       // Array of FormElement discriminated union
                {
                    "type": "Flag",           // FormElement type for boolean properties
                    "key": "active",          // Property identifier
                    "required": false,        // Whether the property is required to be configured or not
                    "setValue": true,         // [OPTIONAL] The value that the property was set to
                    "defaultValue": false,    // [OPTIONAL] The default property value
                    "error": {                // [OPTIONAL] present only when property invalid
                        "code": "string",
                        "message": "string",
                        "details": "string"
                    }
                },
                {
                    "type": "Generic",          // FormElement type for basic input elements
                    "key": "compatible",        // Property identifier
                    "inputType": "text",        // The type of data that the generic form element accepts
                    "required": true,           // Whether the property is required to be configured or not
                    "setValue": "adi,ad7124-8", // [OPTIONAL]
                    "defaultValue": "",         // [OPTIONAL]
                    "validationType": {         // [OPTIONAL]
                        "list": ["adi,ad7124-8", "adi,ad7124-4"]
                    }
                },
                {
                    "type": "FormArray",      // FormElement type for array properties - Needs more work!
                    "key": "reg",
                    "required": true,
                    "setValue": [0],
                    "defaultValue": [],
                    "validationType": {
                        "minLength": 1,
                        "maxLength": 1,
                        "minValue": 0
                    }
                },
                {
                    "type": "FormMatrix",     // FormElement type for matrix properties (array of arrays)
                    "key": "interrupts",
                    "required": false,
                    "setValue": [
                        [57, "IRQ_TYPE_EDGE_FALLING"],
                        [58, "IRQ_TYPE_EDGE_FALLING"]
                    ],
                    "validationType": {
                        "minRows": 1,
                        "maxRows": 8,
                        "minColumns": 2,
                        "maxColumns": 2,
                        "columnValidation": [
                            {
                                "columnIndex": 0,
                                "validationType": {
                                    "minValue": 0,
                                    "maxValue": 255
                                }
                            },
                            {
                                "columnIndex": 1,
                                "validationType": {
                                    "list": ["IRQ_TYPE_NONE", "IRQ_TYPE_EDGE_RISING", "IRQ_TYPE_EDGE_FALLING"]
                                }
                            }
                        ]
                    }
                },
                {
                    "type": "FormObject",
                    "key": "channel@0",
                    "required": false,
                    "config": [
                        {
                            "type": "Flag",
                            "key": "deviceAttached",
                            "label": "Channel Attached",
                            "required": false,
                            "setValue": true,
                            "defaultValue": false
                        },
                        {
                            "type": "Flag",
                            "key": "bipolar",
                            "label": "Bipolar Mode",
                            "required": false,
                            "setValue": false,
                            "defaultValue": true
                        },
                        {
                            "type": "Generic",
                            "key": "adi,reference-select",
                            "label": "Reference Select",
                            "inputType": "dropdown",
                            "required": false,
                            "setValue": 0,
                            "defaultValue": 0,
                            "validationType": {
                                "list": [0, 1, 3]
                            }
                        }
                    ]
                },
                {
                    "type": "ChooseOne",         // FormElement type for choosing between multiple properties
                    "key": "voltage-reference",  // Name of the ChooseOne instance
                    "required": false,           // Whether it is required to make a selection
                    "setValue": "refin1-supply", // [OPTIONAL] The key of the currently selected property
                    "description": "Select one voltage reference source for the device",
                    "config": [                  // Array of FormElement options to choose from
                        {
                            "type": "Generic",
                            "key": "refin1-supply",
                            "inputType": "dropdown",
                            "required": false,
                            "setValue": "vref",
                            "defaultValue": "undefined",
                            "validationType": {
                                "list": ["vref", "sd_vcc_reg"]
                            }
                        },
                        {
                            "type": "Generic",
                            "key": "refin2-supply",
                            "inputType": "dropdown",
                            "required": false,
                            "defaultValue": "undefined",
                            "validationType": {
                                "list": ["vref", "sd_vcc_reg"]
                            }
                        },
                        {
                            "type": "Generic",
                            "key": "avdd-supply",
                            "inputType": "dropdown",
                            "required": false,
                            "defaultValue": "undefined",
                            "validationType": {
                                "list": ["vref", "sd_vcc_reg"]
                            }
                        }
                    ]
                }
            ]
        }
    }
}
```

#### Update Device Configuration

Updates the configuration of an attached device with new property values. The frontend is responsible for sending all properties and their values back to the backend.

**Frontend Request:**

- **Command:** `device.updateConfiguration`
- **Payload:**

```json
{
    "deviceUID": "string",                    // Unique identifier of the device instance
    "config": {                               // FormObject containing updated form elements
        "config": [                           // Array of FormElement updates
            {
                "type": "Flag",               // FormElement type
                "key": "active",              // Property identifier
                "setValue": true              // New configured value
            },
            {
                "type": "Generic",
                "key": "compatible",
                "setValue": "adi,ad7124-8"
            },
            {
                "type": "FormArray",
                "key": "reg",
                "setValue": [0]
            },
            {
                "type": "FormMatrix",
                "key": "interrupts",
                "setValue": [
                    [57, "IRQ_TYPE_EDGE_FALLING"],
                    [58, "IRQ_TYPE_EDGE_FALLING"],
                    [59, "IRQ_TYPE_LEVEL_HIGH"]
                ]
            },
            {
                "type": "FormObject",
                "key": "channel@0",
                "config": [
                    {
                        "type": "Flag",
                        "key": "deviceAttached",
                        "setValue": true
                    },
                    {
                        "type": "Flag",
                        "key": "bipolar",
                        "setValue": false
                    },
                    {
                        "type": "Generic",
                        "key": "adi,reference-select",
                        "setValue": 1
                    }
                ]
            },
            {
                "type": "ChooseOne",
                "key": "voltage-reference",
                "setValue": "refin1-supply",
                "config": [
                    {
                        "type": "Generic",
                        "key": "refin1-supply",
                        "setValue": "vref"
                    }
                ]
            }
        ]
    },
    "parentNode": {
        "ID": "string",       // Parent node ID
        "name": "string"      // Parent node name
    }
}
```

**Backend Response:**

- **Status:** `success | error`
- **Payload:**

```json
{
    "deviceConfiguration": {
        // Same structure as Get Device Configuration response
        // Returns updated configuration with new values applied
    }
}
```

### 5. File System Events

#### File Changed Notification

Backend notification sent when the device tree file is modified externally.

**Backend Notification:**

- **Command:** `event.attachedDevicesStateChanged`
- **Payload:**

```json
{
    "changeSource": "external | extension"   // Source of the change
}
```

## Data Types

### Device

Represents a device from the catalog:

```json
{
    "deviceId": "string",      // Unique device identifier
    "name": "string",          // Human-readable device name
    "description": "string",   // Device description
    "group": "string"          // Optional device category/group
}
```

### ParentNode

Represents a parent node in the device tree:

```json
{
    "ID": "string",           // Unique node identifier
    "name": "string"          // Node name
}
```

### Attached Device

Represents an attached device instance:

```json
{
    "device": {
        "id": "string",           // Device identifier
        "name": "string",         // Device name
        "deviceUID": "string",    // Device unique ID generated by backend
        "alias": "string",        // Optional custom alias for the device
        "active": "boolean",      // Whether the device is currently active
        "parentNode": {
            "ID": "string",       // Parent node ID
            "name": "string"      // Parent node name
        },
        "maxChannels": "number",  // Maximum number of channels supported by the device
        "channels": [
            {
                "name": "string",     // Channel name
                "alias": "string",    // Optional custom alias for the channel
            }
        ]
    }
}
```

### Validation Types

These validations are type-specific constraints that can ensure proper user input validation. Each property can include a `validation` object with type-specific validation rules.

#### Numeric Range Validation

Used for properties that accept numeric input within a specific range (e.g., GPIO numbers, register addresses, frequency values).

**Structure:**
```json
{
    "validation": {
        "minValue": "number",          // [OPTIONAL] Minimum allowed value
        "maxValue": "number",          // [OPTIONAL] Maximum allowed value
    }
}
```

**Examples:**
- SPI register address: `{"minValue": 0}`
- Clock cells: `{"minValue": 0, "maxValue": 0}`
- SPI frequency: `{"minValue": 1}`

#### Dropdown Validation

Used for properties where users must select from a predefined set of valid options (e.g., interrupt types, clock sources).

**Structure:**
```json
{
    "validation": {
        "list": ["item1", "item2"]     // Array of valid options (can be strings, numbers, etc.)
    }
}
```

**Examples:**
- Interrupt types: `{"list": ["IRQ_TYPE_NONE", "IRQ_TYPE_EDGE_RISING", "IRQ_TYPE_EDGE_FALLING"]}`
- Reference selection: `{"list": [0, 1, 3]}`

#### Array Length Validation

Used for properties that accept arrays with specific length constraints (e.g., differential channel pairs, coordinate arrays).

**Structure:**
```json
{
    "validation": {
        "minLength": "number",         // Minimum number of array elements
        "maxLength": "number",         // Maximum number of array elements
        "minValue": "number",          // [OPTIONAL] Minimum value for array elements
        "maxValue": "number"           // [OPTIONAL] Maximum value for array elements
    }
}
```

**Examples:**
- Differential channels: `{"minLength": 2, "maxLength": 2, "minValue": 0, "maxValue": 15}`
- Multi-value configurations: `{"minLength": 1, "maxLength": 4}`

#### Matrix Validation

Used for properties that accept matrices (array of arrays) with specific row/column constraints and optional per-column or per-element validation (e.g., interrupts, GPIO matrices).

**Structure:**
```json
{
    "validation": {
        "minRows": "number",           // [OPTIONAL] Minimum number of rows
        "maxRows": "number",           // [OPTIONAL] Maximum number of rows
        "minColumns": "number",        // [OPTIONAL] Minimum columns per row
        "maxColumns": "number",        // [OPTIONAL] Maximum columns per row
        "columnValidation": [          // [OPTIONAL] Specific validation per column
            {
                "columnIndex": "number",
                "validationType": {}   // Any validationType (list, range, etc.)
            }
        ],
        "elementValidation": {         // [OPTIONAL] Validation applied to all elements
            "minValue": "number",
            "maxValue": "number"
        }
    }
}
```

**Examples:**
- Interrupts with mixed types: `{"minRows": 1, "maxRows": 8, "minColumns": 2, "maxColumns": 2, "columnValidation": [{"columnIndex": 0, "validationType": {"minValue": 0, "maxValue": 255}}, {"columnIndex": 1, "validationType": {"list": ["IRQ_TYPE_NONE", "IRQ_TYPE_EDGE_RISING", "IRQ_TYPE_EDGE_FALLING"]}}]}`
- GPIO matrix: `{"minRows": 1, "maxRows": 4, "minColumns": 3, "maxColumns": 3, "elementValidation": {"minValue": 0}}`

### FormElement Types

The FormElement is a discriminated union that represents different types of form elements in the device configuration. Each FormElement has a `type` field that determines its structure and behavior.

#### Flag

Represents a boolean configuration property with checkbox or toggle interface.

```json
{
    "type": "Flag",
    "key": "string",              // Property identifier (e.g., "active", "bipolar")
    "required": "boolean",        // Whether this property is required
    "setValue": "boolean",        // [OPTIONAL] Current configured value
    "defaultValue": "boolean",    // [OPTIONAL] Default value if not configured
    "description": "string",      // [OPTIONAL] Help text for UI
    "deprecated": "boolean",      // [OPTIONAL] Indicates deprecated property
    "error": {                    // [OPTIONAL] Present only when property is invalid
        "code": "string",
        "message": "string",
        "details": "string"
    }
}
```

#### FormArray

Represents an array-based configuration property with list interface.

```json
{
    "type": "FormArray",
    "key": "string",              // Property identifier (e.g., "reg", "interrupts")
    "required": "boolean",        // Whether this property is required
    "setValue": "array",          // [OPTIONAL] Current configured array value
    "defaultValue": "array",      // [OPTIONAL] Default array value if not configured
    "description": "string",      // [OPTIONAL] Help text for UI
    "deprecated": "boolean",      // [OPTIONAL] Indicates deprecated property
    "validationType": {},         // [OPTIONAL] Array validation rules
    "error": {                    // [OPTIONAL] Present only when property is invalid
        "code": "string",
        "message": "string",
        "details": "string"
    }
}
```

#### FormMatrix

Represents a matrix-based configuration property (array of arrays) with table/grid interface. This is used for device tree properties that contain multiple rows of structured data, such as interrupts with their flags, or GPIO configurations.

```json
{
    "type": "FormMatrix",
    "key": "string",              // Property identifier (e.g., "interrupts", "gpios")
    "required": "boolean",        // Whether this property is required
    "setValue": "array[]",        // [OPTIONAL] Current configured matrix value (array of arrays)
    "defaultValue": "array[]",    // [OPTIONAL] Default matrix value if not configured
    "description": "string",      // [OPTIONAL] Help text for UI
    "deprecated": "boolean",      // [OPTIONAL] Indicates deprecated property
    "validationType": {},         // [OPTIONAL] Matrix validation rules
    "error": {                    // [OPTIONAL] Present only when property is invalid
        "code": "string",
        "message": "string",
        "details": "string"
    }
}
```

**Example - Interrupts with types:**
```json
{
    "type": "FormMatrix",
    "key": "interrupts",
    "required": true,
    "setValue": [
        [57, "IRQ_TYPE_EDGE_FALLING"],
        [58, "IRQ_TYPE_EDGE_FALLING"]
    ],
    "validationType": {
        "minRows": 1,
        "maxRows": 8,
        "minColumns": 2,
        "maxColumns": 2,
        "columnValidation": [
            {
                "columnIndex": 0,
                "validationType": {
                    "minValue": 0,
                    "maxValue": 255
                }
            },
            {
                "columnIndex": 1,
                "validationType": {
                    "list": ["IRQ_TYPE_NONE", "IRQ_TYPE_EDGE_RISING", "IRQ_TYPE_EDGE_FALLING", "IRQ_TYPE_LEVEL_HIGH", "IRQ_TYPE_LEVEL_LOW"]
                }
            }
        ]
    }
}
```

#### Generic

Represents a general input element (text, number, dropdown, etc.).

```json
{
    "type": "Generic",
    "key": "string",              // Property identifier (e.g., "compatible", "clock-frequency")
    "inputType": "string",        // Input type: "text", "number", "dropdown", etc.
    "required": "boolean",        // Whether this property is required
    "setValue": "any",            // [OPTIONAL] Current configured value
    "defaultValue": "any",        // [OPTIONAL] Default value if not configured
    "description": "string",      // [OPTIONAL] Help text for UI
    "deprecated": "boolean",      // [OPTIONAL] Indicates deprecated property
    "validationType": {},         // [OPTIONAL] Validation rules (dropdown, range, etc.)
    "error": {                    // [OPTIONAL] Present only when property is invalid
        "code": "string",
        "message": "string",
        "details": "string"
    }
}
```

#### ChooseOne

Represents a mutually exclusive selection where the user can choose only one property from a set of available options. This is useful for cases where multiple properties serve the same purpose but only one should be configured (e.g., voltage reference sources).

```json
{
    "type": "ChooseOne",
    "key": "string",              // Instance identifier (e.g., "voltage-reference")
    "required": "boolean",        // Whether a selection is required
    "setValue": "string",         // [OPTIONAL] Key of the currently selected property
    "description": "string",      // [OPTIONAL] Help text for UI
    "config": [],                 // Array of FormElement objects to choose from
    "error": {                    // [OPTIONAL] Present only when selection is invalid
        "code": "string",
        "message": "string",
        "details": "string"
    }
}
```

**Usage Notes:**
- Only one property from the `config` array can be selected at a time
- When a property is selected, its key should be set as the `setValue` value
- Unselected properties should not have their `setValue` field set

#### FormObject

Represents a nested object structure containing other FormElements (e.g., channels, complex configurations).

```json
{
    "type": "FormObject",
    "key": "string",              // Object identifier (e.g., "channel@0")
    "required": "boolean",        // Whether this object is required
    "description": "string",      // [OPTIONAL] Help text for UI
    "channelName": "string",      // [OPTIONAL] Channel name matched against an available regex
    "config": [],                 // Array of FormElement objects
    "error": {                    // [OPTIONAL] Present only when object is invalid
        "code": "string",
        "message": "string",
        "details": "string"
    }
}
```

#### CustomProperty

Represents a custom property configuration element with specific input type and value constraints.

```json
{
    "type": "CustomProperty",
    "key": "string",              // Property identifier
    "setValue": "string",         // Current configured value as string
    "error": {                    // [OPTIONAL] Present only when property is invalid
        "code": "string",
        "message": "string",
        "details": "string"
    }
}
```

### Error (Configuration Item)

Represents a validation error for a property:

```json
{
  "code": "string",    // Machine-readable code (e.g. UNSET_PROPERTY)
  "message": "string", // Human readable explanation for UI
  "details": "string"  // [OPTIONAL] Additional context
}
```

Notes:

- Absence of this object means the property is valid.
