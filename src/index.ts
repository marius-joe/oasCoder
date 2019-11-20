// ******************************************
//  Dev:  marius-joe
// ******************************************
//  OpenAPI Code Generator
//  v0.5.3
// ******************************************

// Under Construction


import fs from 'fs'
import { path, dirname, resolve } from 'path'
import { EOL } from 'os'

// https://github.com/wycats/handlebars.js
// https://handlebarsjs.com/builtin_helpers.html
// https://javascriptissexy.com/handlebars-js-tutorial-learn-everything-about-handlebars-js-javascript-templating
import * as HandleBars from 'handlebars'
// Note: 'ts-morph' (compiler APIs interface) for more complex TS codeGen tasks


// toDo
// request functions
// TS pretty tool ?


// OpenAPI to code mapping:
// string -> string
// number -> number
// integer -> number
// enum -> "optionA" | "optionB"
// oneOf -> classA | classB
// allOf -> classB extends classA
// required -> not optional


export interface IUniversalCode {
    intros: { general: string[], specific?: string[] },
    imports?: string[],
    declarations?: {
        consts?: IUniversalConst[],
        vars?: IUniversalVar[]
    },
    interfaces?: Object[],
    functions?: Object[]
}

export interface IUniversalConst {
    name: string,
    type?: string
    value: string
}

export interface IUniversalVar {
    name: string,
    type?: string
    value?: string
}

enum CodeLanguages {
    'TS' = 'typescript'
}

enum ErrorType {
    InvalidInputFile = "invalid input file - no JSON object found",
    UnsupportedCodeLanguage = "unsupported destination code language",
    CodeRenderingError = "code rendering for the specified language not successful",
    OutputError = "writing to output file not successful",
    InvalidDefinitionType = "invalid definition type",
}

enum DefinitionType {
    Object = 'object'
}

const PRIMITIVE_SWAGGER_TYPES: { [key: string]: string } = {
    string: 'string',
    integer: 'number',
    number: 'number'
}

export interface IDefinition {
    type?: 'array' | 'boolean' | 'integer' | 'number' | 'object' | 'string'
    description?: string
    properties?: { [key: string]: IDefinition }
    required?: string[]
    enum?: string[]
    $ref?: string
    allOf?: IDefinition[]
    format?: string
    items?: IDefinition
    oneOf?: IDefinition[]
    additionalProperties?: boolean | IDefinition
}

export interface ISwaggerSpec {
    swagger: string,
    info: { [key: string]: string },
    host: string,
    schemes: string[],
    basePath: string,
    produces?: string[],
    consumes?: string[],
    securityDefinitions?: { [key: string]: { [key: string]: string } },
    definitions: { [key: string]: IDefinition }
}

const enums: { [key: string]: string } = {}


function main() {
    let pathInput = '../swagger.json'
    let pathOutput = '../code_from_openAPI.ts'

    generateCodeFromSwagger(pathInput, pathOutput, 'TypeScript')
}


function generateCodeFromSwagger(pathInput: string, pathOutput: string, outputLang: string) {
    let swagger: any

    // parse API specification JSON
    try {
        swagger = JSON.parse(fs.readFileSync(pathInput, 'utf-8'))
    } catch (e) {
        throw new Error(ErrorType.InvalidInputFile)
    }

    if (swagger) {
        let generatedCode: string
        let codeGenerator: openAPIcodeGenerator = new openAPIcodeGenerator(swagger)

        generatedCode = codeGenerator.renderCode(outputLang)

        if (generatedCode) {
            // write generated code to output file
            try {
                const timeStart: [number, number] = process.hrtime()

                fs.writeFileSync(pathOutput, generatedCode)

                const timeEnd: [number, number] = process.hrtime(timeStart)
                const time: number = timeEnd[0] + Math.round(timeEnd[1] / 1e6)
                let pathInputAbs = resolve(process.cwd(), pathInput)
                let pathOutputAbs = resolve(process.cwd(), pathOutput)

                console.log(`${pathInputAbs} -> ${pathOutputAbs} [${time}ms]`)
            } catch (e) {
                throw new Error(ErrorType.OutputError)
            }
        }
    }
}

// toDo: load from template file
const HandleBarsTemplateTypescript = ""

"./templates/typescript.hbs"


/**
 * Code Generator for OpenAPI specifications.
 * v0.5.3
 * Supported: Swagger / OpenAPI v2.0
 * Separate complex logik from look -> generate a universal code description from the OAS
 * The universal code representation can later be rendered via HandleBars templates into a specific programming language
 */
class openAPIcodeGenerator {
    swagger: ISwaggerSpec
    swaggerDefs: ISwaggerSpec['definitions']
    interfacesRaw: any[]
    codeLangTemplates: { [key: string]: HandleBars.TemplateDelegate }
    universalCode: IUniversalCode


    constructor(swagger: ISwaggerSpec) {
        this.swagger = swagger
        this.swaggerDefs = swagger.definitions
        this.interfacesRaw = []

        // toDo: read from template file now
        // compile code language templates to speed up final output rendering
        let codeTemplateTS = HandleBars.compile(HandleBarsTemplateTypescript)
        this.codeLangTemplates = { 'typescript': codeTemplateTS }

        // generate universal code representation from OAS
        this.universalCode = this.generateUniversalCode()
        this.universalCode.intros.general.push("cool codeGen TypeScript file")
        this.universalCode.imports = [""]
    }


    // [Feature]: some code pretty tool could be used here on the output code
    public renderCode(codeLang: string): string {
        let generatedCode: string
        // check which code language to generate
        codeLang = codeLang.toLowerCase()
        if (codeLang in this.codeLangTemplates) {
            let renderTemplate = this.codeLangTemplates[codeLang]
            generatedCode = renderTemplate(this.universalCode)
            if (generatedCode) {
                return generatedCode
            } else {
                throw new Error(ErrorType.CodeRenderingError)
            }
        } else {
            throw new Error(ErrorType.UnsupportedCodeLanguage)
        }
    }

    /**
     * Generate a universal programming language independent code representation from an openAPI specification
     */
    private generateUniversalCode(): IUniversalCode {
        let universalCodeDescription: IUniversalCode = {
            intros: {
                general: [
                    "====================================================================",
                    "This file was generated from an OpenAPI Spec - do not edit in place",
                    "===================================================================="
                ]
            }
        }
        let info = this.swagger.info
        universalCodeDescription.intros.specific = [
            `${info.title} v${info.version}`
        ]

        universalCodeDescription.declarations = {}
        universalCodeDescription.declarations.consts = [
            { name: 'defaultBasePath', type: 'string', value: this.swagger.host + this.swagger.basePath }
        ]

        // example of universal code description
        /*         let universalCodeDescription: object = {
                    'interfaces': [
                        {
                            'name': 'first Interface',
                            'description': 'cool Interface',
                            'parent': 'parent',
                            'properties': [
                                { 'prop1': 'prop1type' }
                            ]
                        },
                        { 'name': '2nd Interface' }
                     ],
                     'functions': []

                } */

        let universalInterfaces = []

        // toDo: read info directly from this.swagger

        // host: string,
        // schemes: string[],
        // basePath: string,
        // produces?: string[],
        // consumes?: string[],
        // securityDefinitions?: { [key: string]: { [key: string]: string } },
        // definitions: { [key: string]: IDefinition }


        // parse top-level entries
        Object.entries(this.swaggerDefs).forEach((definition): void => {
            // Ignore array definitions in top-level
            if (definition[1].type === 'object') {
                this.interfacesRaw.push(definition)
            }
        })

        this.interfacesRaw.sort((a, b) => a[0].localeCompare(b[0]))
        while (this.interfacesRaw.length > 0) {
            universalInterfaces.push(this.generateUniversalInterface())
        }
        universalCodeDescription.interfaces = universalInterfaces
        return universalCodeDescription
    }


    // toDo: further changes to allow handelbars template engine
    private generateUniversalInterface(): object {
        let generatedCode: string[] = []
        const nextObject = this.interfacesRaw.pop()
        if (nextObject && nextObject.type === DefinitionType.Object) {
            const [ID, { allOf, properties, required, additionalProperties, type }] = nextObject

            let allProperties = properties || {}
            const includes: string[] = []

            // include allOf
            if (Array.isArray(allOf)) {
                allOf.forEach((item): void => {
                    // Add "implements" if this references other items
                    if (item.$ref) {
                        const [refName] = this.getRef(item.$ref)
                        includes.push(refName)
                    } else if (item.properties) {
                        allProperties = { ...allProperties, ...item.properties }
                    }
                })
            }
            // If nothing’s here, skip that one
            if (!(
                !Object.keys(allProperties).length &&
                additionalProperties !== true &&
                type &&
                PRIMITIVE_SWAGGER_TYPES[type]
            )) {
                // open the interface
                let isExtending: string
                isExtending = includes.length ? ` extends ${includes.join(", ")}` : ""

                generatedCode.push(`export interface ${getCamelCase(ID)}${isExtending} {`)


                // fill the interface
                Object.entries(allProperties).forEach(([key, value]): void => {
                    let optional = !Array.isArray(required) || required.indexOf(key) === -1
                    let formattedKey = getCamelCase(key)
                    let name = `${qt_single(formattedKey)}${optional ? "?" : ""}`
                    let newID = `${ID}${getCapitalBegin(formattedKey)}`
                    let interfaceType = this.getType(value, newID)

                    if (typeof value.description === 'string') {
                        // print existing descriptions as comments
                        generatedCode.push(`${value.description.trim()}`)
                    }

                    // Handle enums in the definition
                    if (Array.isArray(value.enum)) {
                        generatedCode.push(`${name}: ${value.enum.map(option => JSON.stringify(option)).join(" | ")};`)
                    } else {
                        generatedCode.push(`${name}: ${interfaceType};`)
                    }
                })

                if (additionalProperties) {
                    if ((additionalProperties as boolean) === true) {
                        generatedCode.push("[name: string]: any")
                    }

                    if ((additionalProperties as IDefinition).type) {
                        const interfaceType = this.getType(additionalProperties as IDefinition, '')
                        generatedCode.push(`[name: string]: ${interfaceType}`)
                    }
                }

                // Close interface
                generatedCode.push('}')
            }
            return generatedCode
        } else {
            throw new Error(ErrorType.InvalidDefinitionType)
        }
    }


    private getRef(findRef: string): [string, IDefinition] {
        const ID = findRef.replace('#/definitions/', '')
        const ref = this.swaggerDefs[ID]
        return [ID, ref]
    }


    // Returns a simple type, 'object' or 'any'
    private getType(definition: IDefinition, nestedName: string): string {
        const { $ref, items, type, ...value } = definition

        // if this becomes an interface, it needs a camelCase name
        const nextInterface = getCamelCase(nestedName)

        const TYPE_DEFAULT = 'any'

        if ($ref) {
            const [refName, refProperties] = this.getRef($ref)
            // if its an flat array interface, return that instead
            if (refProperties.items && refProperties.items.$ref) {
                return this.getType(refProperties, refName)
            } else if (refProperties.type && PRIMITIVE_SWAGGER_TYPES[refProperties.type]) {
                return PRIMITIVE_SWAGGER_TYPES[refProperties.type]
            } else {
                return refName || TYPE_DEFAULT
            }

        } else if (items && items.$ref) {
            const [refName] = this.getRef(items.$ref)
            return `${this.getType(items, refName)}[]`

        } else if (items && items.type) {
            // if its an array, keep nesting
            if (items.type === 'array') {
                return `${this.getType(items, nestedName)}[]`
            } else if (PRIMITIVE_SWAGGER_TYPES[items.type]) {
                // else if primitive, return type
                return `${PRIMITIVE_SWAGGER_TYPES[items.type]}[]`
            } else {
                // if this is an array of nested types, return the interface for later
                this.interfacesRaw.push([nextInterface, items])
                return `${nextInterface}[]`
            }
        } else if (Array.isArray(value.oneOf)) {
            // Handle 'oneOf' schema
            return value.oneOf.map((def): string => this.getType(def, '')).join(' | ')
        } else if (value.properties) {
            // If this is a nested object, let’s add it to the stack for later
            this.interfacesRaw.push([nextInterface, { $ref, items, type, ...value }])
            return nextInterface
        } else if (type) {
            return PRIMITIVE_SWAGGER_TYPES[type] || type || TYPE_DEFAULT
        } else {
            return TYPE_DEFAULT
        }
    }
}


function getCapitalBegin(str: string): string {
    return `${str[0].toUpperCase()}${str.slice(1)}`
}


function qt_single(name: string): string {
    return name.includes('-') ? `'${name}'` : name
}


function getCamelCase(name: string): string {
    return name.replace(/(-|_|\.|\s)+\w/g, (letter): string =>
        letter.toUpperCase().replace(/[^0-9a-z]/gi, '')
    )
}


/**
 * strips unwanted indentation from a template string
 */
function fixIndent(literals: TemplateStringsArray, ...placeholders: string[]) {
    let result = ''
    // interleave the literals with the placeholders
    for (let i = 0; i < placeholders.length; i++) {
        result += literals[i] + placeholders[i]
    }
    // add the last literal
    result += literals[placeholders.length]

    // remove shortest leading indentation from each line
    const match = result.match(/^[^\S\n]*(?=\S)/gm)
    const indent = match && Math.min(...match.map(el => el.length))
    if (indent) {
        const regexp = new RegExp(`^.{${indent}}`, 'gm')
        return result.replace(regexp, '')
    }
    return result
}



main()
