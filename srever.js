'use strict';

require('dotenv').config();

const superagent = require('superagent');
const express = require('express');
const cors = require('cors');
const pg = require('pg');

const PORT =process.env.PORT;
const app = express();

app.use(cors());
app.listen(PORT,()=>
console.log(`app listen to PORT ${PORT}`));
