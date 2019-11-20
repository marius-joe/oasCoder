import fs from 'fs'
import path from 'path'

// https://github.com/wycats/handlebars.js
// https://handlebarsjs.com/builtin_helpers.html
// https://javascriptissexy.com/handlebars-js-tutorial-learn-everything-about-handlebars-js-javascript-templating
import * as HandleBars from 'handlebars'


function main() {
    const pathTemplate = path.resolve(__dirname, './typescript_test.hbs')
    const pathSampleData = path.resolve(__dirname, './universalCode_sample.json')
    const pathOutput = path.resolve(__dirname, './generatedCode_test.txt')

    let template = fs.readFileSync(pathTemplate, 'utf-8')
    let sampleData = JSON.parse(fs.readFileSync(pathSampleData, 'utf-8'))

    let renderTemplate = HandleBars.compile(template)
    let generatedCode = renderTemplate(sampleData)

    console.log(generatedCode)
    fs.writeFileSync(pathOutput, generatedCode)
    console.log(`Generated code written to ${pathOutput}`)
}



main()