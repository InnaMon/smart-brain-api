const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const Clarifai = require('clarifai');

const postgres = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : process.env.DATABASE_PW,
      database : 'smartbrain'
    }
  });
  
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => { res.send('it is working!') })

app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(404).json('incorrect form submission')
    }
    postgres.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
        const isValid = bcrypt.compareSync(password, data[0].hash); 
        if (isValid) {
            return postgres.select('*').from('users')
            .where('email', '=', email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else {
            res.status(400).json('wrong credentials');
        }
    })
    .catch(err => res.status(400).json('wrong credentials'))
});

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        return res.status(404).json('incorrect form submission')
    }
    const hash = bcrypt.hashSync(password);
    postgres.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
        .returning('*')
        .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
        })
        .then(response => {
            res.json(response[0]);
          })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    postgres.select('*').from('users')
    .where({
        id: id
    })
    .then(user => {
        if (user.length) {
            res.json(user[0]);
        } else {
            res.status(40).json('Not found')
        }
    })
    .catch(err => res.status(40).json('error getting user'))
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    postgres('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    })
    .catch(err => res.status(40).json('unable to get entries'))
})

const clarifai = new Clarifai.App({
    apiKey: '6d0d0a0d4b514f6bbea44494506a506b'
});

app.post('/imageurl', (req, res) => {
    clarifai.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(data => {
        res.json(data)
    })
    .catch(err => res.status(404).json('unable to work with API'))
})

app.listen(process.env.PORT || 3001, () => {
    console.log(`app is running on port ${process.env.PORT}`);
});