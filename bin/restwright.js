#!/usr/bin/env node
//import {config} from '../src/cli.js'
const cli = require('../src/cli.js');


//config()
cli.createProject(process.argv)