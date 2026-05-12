// import arg from 'arg'
//import defaultConfig from './default.json' with { type: 'json' };
// import { mapArgsToOutput } from './helper/functions.js';
const {input,select,confirm}= require('@inquirer/prompts')

const defaultConfig= require('./default.json');
const {mapCliArgsToOutput,getUserConfig}= require('./helper/functions.js')

const createProject = async(args)=>{
    const inputs = await getConfig(args)
}

const getConfig=async(rawArgs)=>{
    let impConfig={}
    let packageName= rawArgs[2]

    if(!packageName || packageName.startsWith("-") ){
        packageName = await input({ message: 'Enter the name of your playwright project' });
    }

    const cliArgs = rawArgs.splice(2)    
    
    const inputArgs = mapCliArgsToOutput(cliArgs)

    if (inputArgs.default){
        const keys = Object.keys(defaultConfig)
        let defInputs={}

        keys.forEach(key =>{
            defInputs[key]= defaultConfig[key].default
            impConfig[key]= inputArgs[key] ? inputArgs[key] : defInputs[key]
        })
        return impConfig
    }

    delete defaultConfig.default
    let userDefault = await confirm({message:"Do you want to use the default configuration?"})

    if (userDefault){
        const keys = Object.keys(defaultConfig)
        let defInputs={}

        keys.forEach(key =>{
            defInputs[key]= defaultConfig[key].default
            impConfig[key]= inputArgs[key] ? inputArgs[key] : defInputs[key]
        })
        return impConfig
    }

    const inputArgKeys= Object.keys(inputArgs)
    let questionConfig= defaultConfig

    for (const key of inputArgKeys) {
        delete questionConfig[key]
    }
    // let questions=[]
    // const questionKeys= Object.keys(modConfig)
    // for (const key of questionKeys) {
    //     questions.push(modConfig[key]["question"])
    // }

    const answerArgs = await getUserConfig(questionConfig)

    impConfig= {...inputArgs,...answerArgs}    
    return impConfig
}


module.exports = {createProject}