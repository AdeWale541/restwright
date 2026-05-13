// import arg from 'arg'
//import defaultConfig from './default.json' with { type: 'json' };
// import { mapArgsToOutput } from './helper/functions.js';
const {input,select,confirm}= require('@inquirer/prompts')
const { execSync } = require('child_process');
const {promisify,styleText} = require('util');
const path = require('path');
const fs = require('fs');
const chalk= require('chalk')
const defaultConfig= require('./default.json');
const {mapCliArgsToOutput,getUserConfig}= require('./helper/functions.js')

const exec = promisify(require('child_process').exec);

module.exports= createProject = async(args)=>{
    const inputs = await getConfig(args)
    console.log(inputs);

    const currentPath = process.cwd();
    const folderName = inputs.packageName;
    const appPath = path.join(currentPath, folderName);

    await createDirectory(appPath)
    process.chdir(appPath)
    await createDirectory(appPath)
    await installNPMDependencies()
}

const getConfig=async(rawArgs)=>{
    let impConfig={}
    let packageName= rawArgs[2]

    if(!packageName || packageName.startsWith("-") ){
        packageName = await input({ message: 'Enter the name of your playwright project' });
    }

    impConfig.packageName= packageName

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

    inputArgs.default= false //Ensures questions aren't read out for default anymore


    const inputArgKeys= Object.keys(inputArgs)
    let questionConfig= defaultConfig

    for (const key of inputArgKeys) {
        delete questionConfig[key]
    }

    const answerArgs = await getUserConfig(questionConfig)

    impConfig= {...impConfig,...inputArgs,...answerArgs}    
    return impConfig
}

const runCmd= async(command)=>{
  try {
    const { stdout, stderr } = await exec(command);
    console.log(stdout);
    console.log(stderr);
  } catch {
    (error) => {
      console.log(styleText(["bold","red"],"Process Failed:"),error);
    };
  }
}

const createDirectory = async (appPath) => {
    try {
        fs.mkdirSync(appPath);
    } catch (err) {
        if (err.code === 'EEXIST') {
            console.log(styleText(["bold","red"],"Process Failed:"),'Directory already exists. Please choose another name for the project.');
        } else {
            console.log(styleText(["bold","red"],"Process Failed:"),err);
        }
        process.exit(1);
    }
}

const installNPMDependencies = async (appPath) => {
    await runCmd("npm init -y")
}