//invocar express
const express = require('express');
const app  = express();


//setear url enconded para capturar datos
app.use(express.urlencoded({extended:false}));
app.use (express.json());

//invocar dote
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

//establecer directorio
app.use(express.static('public'));


//establecer plantilla ejs
app.set('view engine','ejs');

//invocar bcrypts
const bcryptjs = require('bcryptjs');

//var de sesion
const session = require('express-session');
app.use (session({
   secret: 'secret',
   resave: true,
   saveUninitialized:true
}));

//invocar conexion bd
const connection = require('./database/db');

//Establecemos las rutas de nuestras plantillas 


app.get('/login',(req, res)=>{
   res.render('login')
})
app.get('/register',(req, res)=>{
   res.render('register')
})


//Registro en bd
app.post('/register', async (req, res)=>{
   const user = req.body.user;
   const email = req.body.email;
   const pass = req.body.pass;
   let passwordHaash = await bcryptjs.hash(pass,8);
   connection.query('INSERT INTO users SET ?',{user:user, email:email, pass:passwordHaash}, async(error,results)=>{
      if(error){
         console.log(error);
      }else{
         res.render('register',{
            alert: true,
            alertTitle: "Registration",
            alertMessage: "!Successful Registration",
            alertIcon: 'succes',
            showConfirmButton:false,
            timer:2500,
            ruta:''
         })

      }
   })
})

//lAuthentication
app.post('/auth', async (req, res)=>{
 const user = req.body.user;
 const pass = req.body.pass;
 let passwordHaash = await bcryptjs.hash(pass,8);
   if(user && pass){
      connection.query('SELECT * FROM users WHERE user = ?',[user], async (error, results) =>{
         if(results.length == 0 || !(await bcryptjs.compare(pass,results[0].pass))){
            res.render('login',{
               alert: true,
               alertTitle: "Error",
               alertMessage: "User y password wrong",
               alertIcon: 'error',
               showConfirmButton:true,
               timer:2500,
               ruta:'login'
            }); 
         }else{
            req.session.loggedin = true;
            req.session.name = results [0].name
            res.render('login',{
               alert: true,
               alertTitle: "Conexion exitosa",
               alertMessage: "User y password correctos",
               alertIcon: 'Succes',
               showConfirmButton:false,
               timer:2500,
               ruta:''
            }); 
         }
      })
   }else{
      res.send('please add an user or password');
   }
})

//auth en pagina
app.get('/',(req,res)=>{
   if(req.session.loggedin){
      res.render('index',{
         login: true,
         name: req.session.name
      });
   }else{
      res.render('index',{
         login:false,
         name: 'Debe iniciar sesión',
      })
   }
   res.end()
})
//logout 
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') 
	})
});

app.listen(3000, (req, res)=>{
   console.log('Server runnin in http://localhost:3000');
})