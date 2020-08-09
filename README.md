# REST API Generator
The file [gen.js](/gen.js), when run with node, reads a JSON file with documentation and generates Markdown and HTML from it.

### Usage
`$ node gen.js <json-file-basename>`

An example JSON documentation:
```json
{
  "macros": {
    "abc": "def",
    "ghi": "jkl"
  },
  "types": {
    "i32": "Signed 32-bit integer",
    "u32": "Unsigned 32-bit integer"
  },
  "endpoints": [
    {
      "method": "GET",
      "path": "/path/to/endpoint",
      "desc": "Description! You can use macros you ${abc}ined, just like that! And you can escape the \\${macro references}, this way: \\\\\\\\${...}",
      "req-params": {
        "param1": {
          "type": "i32",
          "desc": "One param",
          "default": "10"
        },
        "param2": {
          "type": "u32",
          "desc": "Param two. Oh, and by the way, you can use macros pretty much wherever you want."
        },
        "even-here-${ghi}": {
          "type": "i32",
          "desc": "You can either omit default or make it 'null'"
        }
      },
      "req-body": {
        "type": "[u32]",
        "desc": "^ number list. Also, 'req-body' and 'resp-body' can be null or omitted"
      },
      "resp-body": {
        "type": "str",
        "desc": "no types are actually validated (at least for now)"
      }
    }
  ]
}
```
Will convert to the following: (Markdown)

## API data types
| Type name | Explanation |
| --------- | ----------- |
| `i32` | Signed 32-bit integer |
| `u32` | Unsigned 32-bit integer |

## API endpoints

### `GET` `/path/to/endpoint`
Description! You can use macros you defined, just like that! And you can escape the ${macro references}, this way: \\${...}

| Param name | Param type | Default value | Description |
| ---------- | ---------- | ------------- | ----------- |
| param1 | `i32` | `10` | One param |
| param2 | `u32` | none | Param two. Oh, and by the way, you can use macros pretty much wherever you want. |
| even-here-jkl | `i32` | none | You can either omit default or make it 'null' |

#### Request body: `[u32]`
^ number list. Also, 'req-body' and 'resp-body' can be null or omitted

#### Response body: `str`
no types are actually validated (at least for now)
