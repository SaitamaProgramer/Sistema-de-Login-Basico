//invocamos a express
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

//2 - seteamos urlencoded para capturar los datos del formulario
app.use(express.urlencoded({ extended:false}));
app.use(express.json());

//3- invocamos dotenv para variables de entorno
const dotenv = require('dotenv');
      dotenv.config({path:'env/.env'})


//4 - seteamos el directorio public
app.use('/resources', express.static('public'));
app.use('resources', express.static(__dirname + '/public'));

//5- motor de plantillas
app.set('view engine', 'ejs');

//6 - Invocamos a bcryptjs
const bcryptjs = require('bcryptjs');

//7 -Variables de Session

const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));


//8 - Invocamos al module de conexion de la BD
const connection = require('./database/db')   

//9 - establecer las rutas


    app.get('/login', (req, res) => {
        res.render('login');
    })

    app.get('/register', (req, res) => {
        res.render('register');
    })


// 10 - Registro
app.post('/register', async (req, res) => {
    const user = req.body.user
    const name = req.body.name
    const rol = req.body.rol
    const pass = req.body.pass
    let passwordHaash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO users SET ?' , {user:user, name:name, rol:rol, pass:passwordHaash}, async (error, results) => {
        if(error) {
            console.log(error);
        } else {
            res.render('register', {
                alert:true,
                alertTitle: "Registration",
                alertMessage: "¡Succcesful Registration",
                alertIcon: "success",
                showConfirmButton: false,
                timer:1500,
                ruta:''
            })
        }
    })
})

//11 - Authentication

app.post('/auth', async (req, res) => { 
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);

    if(user && pass) {
        connection.query('SELECT * FROM users WHERE user = ?' , [user], async (error, results) => {
            if(results.length === 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                res.render('login', {
                alert:true,
                alertTitle: "Error",
                alertMessage: "Usuario y/o password incorrectos",
                alertIcon: "error",
                showConfirmButton: true,
                timer:false,
                ruta:'login'
                });
            } else {
                req.session.loggedin = true;
                req.session.name = results[0].name;
                res.render('login', {
                    alert:true,
                    alertTitle: "Conexión exitosa",
                    alertMessage: "Login Correcto",
                    alertIcon: "success",
                    showConfirmButton: false,
                    timer:1500,
                    ruta:''
                    });
                } 
            })
        } else {
            res.render('login', {
                alert:true,
                alertTitle: "Aviso",
                alertMessage: "Debe ingresar usuario y contraseña", 
                alertIcon: "warning",
                showConfirmButton: true,
                timer:false,
                ruta:'login'
                });
        }

    })


    /*12 --- Auth pages */
    
    app.get('/', (req, res) => {
        if(req.session.loggedin) {
            res.render('index', {
                login:true,
                name: req.session.name
            })
        } else {
            res.render('index', {
                login:false,
                name: "Debe iniciar sesión"
            })
        }
    })

/*13 - logout*/  

app.get('/logout', (req, res) => {
    req.session.destroy(()=> {
        res.redirect('/login')
    })
})

app.listen(port, (req,res) => {
    console.log('listening on port ' + port);
})
