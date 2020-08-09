import { assert, assertNotEquals } from "https://deno.land/std/testing/asserts.ts";
import { readJsonSync } from "https://deno.land/std/fs/read_json.ts"
import { existsSync   } from "https://deno.land/std/fs/exists.ts"
const proc = (str, macros) => {
	if(str.indexOf('$') == -1) {
		return str
	}
	
	const NONE = 0
	const AFTER_DOLLAR = 1
	const ESCAPE = 2
	const IN_MACRO_NAME = 3
	
	let state = NONE
	let buf = ''
	let macro_name = ''
	
	for(const char of str) {
		switch(state) {
			case NONE:
				if(char == '$') {
					state = AFTER_DOLLAR
				} else if(char == '\\') {
					state = ESCAPE
				} else {
					buf += char
				}
				break
			case AFTER_DOLLAR:
				if(char == '{') {
					state = IN_MACRO_NAME
				} else {
					buf += '$' + char
					state = NONE
				}
				break
			case ESCAPE:
				buf += char
				state = NONE
				break
			case IN_MACRO_NAME:
				if(char == '}') {
					if(macros[macro_name] == undefined) {
						console.warn(`Macro '${macro_name}' not found, empty string inserted`)
					} else {
						buf += macros[macro_name]
					}
					macro_name = ''
					state = NONE
				} else {
					macro_name += char
				}
				break
		}
	}
	
	return buf
}

const toMarkdown = (docObj) => {
	let out = ''
	
	const macros = docObj.macros
	
	const types = Object.entries(docObj.types)
	if(types.length > 0) {
		out += '## API data types\n'
			+ '| Type name | Explanation |\n'
			+ '| --------- | ----------- |\n'
		
		for(const [name, desc] of types) {
			out += `| \`${proc(name, macros)}\` | ${proc(desc, macros)} |\n`
		}
		out += '\n'
	}
	
	const endpoints = docObj.endpoints
	out += '## API endpoints\n\n'
	
	for(const endpoint of endpoints) {
		let doc = `### \`${proc(endpoint.method, macros)}\` \`${proc(endpoint.path, macros)}\`\n`
			+ proc(endpoint.desc, macros) + '\n\n'
		
		const params = Object.entries(endpoint['req-params'])
		if(params.length > 0) {
			doc += '| Param name | Param type | Default value | Description |\n'
				+ '| ---------- | ---------- | ------------- | ----------- |\n'
			
			for(const [pname, param] of params) {
				const def = param['default'] ? '`' +  param['default'] + '`' : 'none'
				doc += `| ${proc(pname, macros)} | \`${proc(param.type, macros)}\` | ${proc(def, macros)} | ${proc(param.desc, macros)} |\n`
			}
			
			doc += '\n'
		}
		
		const req_body = endpoint['req-body']
		if(req_body) {
			doc += '#### Request body: `' + proc(req_body.type, macros) + '`\n'
				+ proc(req_body.desc, macros) + '\n\n'
		}
		
		const resp_body = endpoint['resp-body']
		if(resp_body) {
			doc += '#### Response body: `' + proc(resp_body.type, macros) + '`\n'
				+ proc(resp_body.desc, macros) + '\n\n'
		}
		
		out += doc
	}
	
	return out
}

const toHTML = (docObj) => {
	let out = ''
	
	const macros = docObj.macros
	
	const types = Object.entries(docObj.types)
	
	out += '<div id="data-types">'
	
	if(types.length > 0) {
		out += '<h2>API data types</h2>'
			+ '<table><thead><tr>'
			+ '<td>Type name</td><td>Explanation</td>'
			+ '</tr></thead><tbody>'
		
		for(const [name, desc] of types) {
			out += `<tr><td><code>${proc(name, macros)}</code></td>`
				+ `<td>${proc(desc, macros)}</td></tr>`
		}
		
		out += '</tbody></table>'
	}
	out += '</div>'
	
	const endpoints = docObj.endpoints
	
	out += '<div id="endpoints">'
	out += '<h2>API endpoints</h2>'
	
	for(const endpoint of endpoints) {
		out += `<div id="${proc(endpoint.path, macros)}">`
		out += `<h3><code>${proc(endpoint.method, macros)}</code><code>${proc(endpoint.path, macros)}</code></h3>`
		out += `<p>${proc(endpoint.desc)}</p>`
		
		const params = Object.entries(endpoint['req-params'])
		if(params.length > 0) {
			out += '<table><thead><tr>'
				+ '<td>Param name</td><td>Param type</td><td>Default value</td><td>Description</td>'
				+ '</tr></thead><tbody>'
			
			for(const [pname, param] of params) {
				const def = param['default'] ? `<code>${param['default']}</code>` : 'none'
				
				out += `<tr><td>${proc(pname, macros)}</td>`
					+ `<td><code>${proc(param.type, macros)}</code></td>`
					+ `<td>${proc(def, macros)}</td>`
					+ `<td>${proc(param.desc, macros)}</td></tr>`
			}
			
			out += '</tbody></table>'
		}
		
		const req_body = endpoint['req-body']
		if(req_body) {
			out += `<h4>Request body: <code>${req_body.type}</code></h4>`
				+ `<p>${req_body.desc}</p>`
		}
		
		const resp_body = endpoint['resp-body']
		if(resp_body) {
			out += `<h4>Response body: <code>${resp_body.type}</code></h4>`
				+ `<p>${resp_body.desc}</p>`
		}
		
		out += '</div>'
	}
	
	out += '</div>'
	
	return out
}

/*
console.log(
toMarkdown({
	macros: {
		"abc": "ABC"
	},
	types: {
		"i32": "Signed 32-bit integer"
	},
	endpoints: [{
		"method": "GET",
		"path": "/a/b/c",
		"desc": "lorem ${abc}${abc}\\${abc} ipsum",
		"req-params": {
			"name": {
				"type": "type",
				"desc": "desc",
				"default": "default ${abc}"
			}
		},
		"req-body": {
			"type": "i32",
			"desc": "description"
		},
		"resp-body": {
			"type": "{'a': i32, 'b': string}",
			"desc": "ab ${abab}"
		}
	}]
})
)*/

let tempPath = Deno.args[0]
assertNotEquals(tempPath, undefined, "Error - undefined. Did you forget a command-line argument") 
const path = tempPath.endsWith(".json") ? tempPath.slice(0, -5) : tempPath
const pathJson = path+".json"

assert(existsSync(pathJson), "Error - could not find a location named \""+pathJson+'\"')
assert(Deno.statSync(pathJson).isFile, "Error - \""+pathJson+"\" isn't a file.")

const json = readJsonSync(pathJson)
	
const md = new TextEncoder().encode(toMarkdown(json))
Deno.writeFileSync(path + '.md', md)
		
const html = new TextEncoder().encode(toHTML(json))
Deno.writeFileSync(path + '.html', html)

console.log("Succesfully markdownified " + path)
