const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const postgres = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'monjoseph7',
      database : 'smart-brain'
    }
  });

  postgres.select('*').from('users').then(data => {
      console.log(data);
  });

const app = express();

app.use(bodyParser.json());
app.use(cors());

const database = {
    users: [
        {
            id: '123',
            name: 'John',
            password: 'cookies',
            email: 'john@gmail.com',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            password: 'bananas',
            email: 'sally@gmail.com',
            entries: 0,
            joined: new Date()
        }
    ],
    login: [
        {
            id: '987',
            hash: '',
            email: 'john@gmail.com'
        }
    ]
}

app.get('/', (req, res) => {
    res.send(database.users);
});

app.post('/signin', (req, res) => {
    // bcrypt.compare("apples", "$2a$10$liInrtnkgnhjyAP7iC8GcOzUmyW370sbPJfuSKyUVpVgh3O0TYIsS", function(err, res) {
    //     console.log('first guess', res)
    // });
    // bcrypt.compare("veggies", "$2a$10$liInrtnkgnhjyAP7iC8GcOzUmyW370sbPJfuSKyUVpVgh3O0TYIsS", function(err, res) {
    //     console.log('second guess', res)
    // });
    if (req.body.email === database.users[0].email &&
    req.body.password === database.users[0].password) {
        res.json(database.users[0]);
    } else {
        res.status(400).json('error logging in');
    }
});

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    postgres('users')
    .returning('*')
    .insert({
        email: email,
        name: name,
        joined: new Date()
    })
    .then(response => {
        res.json(response[0]);
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

app.listen(3001, () => {
    console.log('app is running on port 3001');
});