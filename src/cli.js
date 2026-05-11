// import arg from 'arg'
//import defaultConfig from './default.json' with { type: 'json' };
// import { mapArgsToOutput } from './helper/functions.js';

const defaultConfig= require('./default.json');
const {mapArgsToOutput}= require('./helper/functions.js')

const createProject = async(args)=>{
    const inputs = await getConfig(args)
}

const getConfig=(rawArgs)=>{

    const packageName= rawArgs[2]
    const cliArgs = rawArgs.splice(3)    
    
    const inputArgs = mapArgsToOutput(cliArgs)

    console.log("inputArgs",inputArgs);

    const keys = Object.keys(defaultConfig)
    const defInputs={}
    const impConfig={}

    keys.forEach(key =>{
        defInputs[key]= defaultConfig[key].default
        impConfig[key]= inputArgs[key] ? inputArgs[key] : defInputs[key]

    })
    
    console.log("defInputs",defInputs);
    console.log("impConfig",impConfig);
    
    return impConfig
}


module.exports = {createProject}