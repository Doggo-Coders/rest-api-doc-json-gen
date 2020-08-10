## API data types
| Type name | Explanation |
| --------- | ----------- |
| `i32` | Signed 32-bit integer |
| `u32` | Unsigned 32-bit integer |

## API endpoints

### `GET` `/path/to/endpoint`
Description! You can use macros you defined, just like that! And you can escape the ${macro references}, this way: ${...}

| Param name | Param type | Default value | Description |
| ---------- | ---------- | ------------- | ----------- |
| param1 | `i32` | `10` | One param |
| param2 | `u32` | none | Param two. Oh, and by the way, you can use macros pretty much wherever you want. |
| even-here-jkl | `i32` | none | You can either omit default or make it 'null' |

#### Request body: `[u32]`
^ number list. Also, 'req-body' and 'resp-body' can be null or omitted

#### Response body: `str`
no types are actually validated (at least for now)

