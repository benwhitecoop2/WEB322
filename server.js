/*********************************************************************************
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Ben White, Student ID: 128269172, Date: Dec 04 2018 
* Online (Heroku) Link: https://warm-lowlands-54776.herokuapp.com/
*
******************************************************************************/
var HTTP_PORT = process.env.PORT || 8080;

//mongo url: mongodb://web322a6user:mettatati0n@ds145188.mlab.com:45188/web322_a6

var express = require('express');
var app = express();
var path = require('path');
var multer = require('multer');
var fs = require('fs');
var bodyParser = require("body-parser");
var data_service = require('./data-service.js');
var data_service_auth = require('./data-service-auth.js');
var client_sessions = require('client-sessions');

app.use('/public',express.static(__dirname + '/public'));

app.use(client_sessions({
    cookieName: "session",
    secret: "web322_a6",
    duration: 2 * 60 * 1000,
    activeDuration: 60 * 1000
}));

app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

const exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({
    extname: '.hbs', defaultLayout: 'main', helpers:
    {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },

        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));

app.set('view engine', '.hbs');

app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

function onhttpstart() {
    console.log("Server listening on port " + HTTP_PORT);
};

function ensureLogin(req,res,next){
    if(!(req.session.user)){  
        res.redirect("/login");  
    }else{
        next(); 
    }
};

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.static('views'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.render(path.join(__dirname + '/views/home.hbs'));
});

app.get("/about", function (req, res) {
    res.render(path.join(__dirname + '/views/about.hbs'));
});

app.get('/login',function(req,res){
    res.render(__dirname + '/views/login.hbs');
});

app.post('/login',function(req,res){
    req.body.userAgent = req.get('User-Agent');
    data_service_auth.checkUser(req.body).then(function(get_user){
        // console.log("get_user: "+ req.body);
        req.session.user = {
            userName: get_user.userName,
            email: get_user.email,
            loginHistory: get_user.loginHistory
        };
        console.log(req.session.user);
        res.redirect('/employees');
    }).catch(function(err){
        res.render('login',{errorMessage: err, userName: req.body.userName});
    });
});

app.get('/register',function(req,res){
    res.render(__dirname + '/views/register.hbs');
});

app.post('/register',function(req,res){
    data_service_auth.registerUser(req.body).then(function(){
        res.render('register',{successMessage:"User Created"});
    }).catch(function(err){
        res.render('register',{errorMessage: err, userName: JSON.stringify(req.body.userName)})
    });
});

app.get('/logout',function(req,res){
    req.session.reset();
    res.redirect('/');
});

app.get('/userHistory', ensureLogin, function(req,res){
    res.render('userHistory',{user:req.session.user});
});

app.get("/employees", ensureLogin, function (req, res) {
    console.log("employee path active...");
    if (req.query.status) {
        console.log("employees by status path active...");
        data_service.getEmployeesByStatus(req.query.status).then((data) => {
            console.log("outputting json...");
            if (data.length > 0) {
                res.render("employees", { employees: data });
            } else {
                res.render("employees", { message: "no results..." });
            }
        }).catch(() => {
            console.log("catch() entered...");
            res.render({ message: "no results" });
        });
    } else if (req.query.department) {
        console.log("employees by department path active...");
        data_service.getEmployeesByDepartment(req.query.department).then((data) => {
            console.log("outputting json...");
            if (data.length > 0) {
                res.render("employees", { employees: data });
            } else {
                res.render("employees", { message: "no results..." });
            }
        }).catch(() => {
            console.log("catch() entered...");
            res.send("JSON error, cannot read file");
        });
    } else if (req.query.manager) {
        console.log("employees by manager path active...");
        data_service.getEmployeesByManager(req.query.manager).then((data) => {
            console.log("outputting json...");
            if (data.length > 0) {
                res.render("employees", { employees: data });
            } else {
                res.render("employees", { message: "no results..." });
            }
        }).catch(() => {
            console.log("catch() entered...");
            res.send("JSON error, cannot read file");
        });
    } else {//get all
        data_service.getAllEmployees().then((data) => {
            console.log("outputting json...");
            if (data.length > 0) {
                res.render("employees", { employees: data });
            } else {
                res.render("employees", { message: "no results..." });
            }
        }).catch(() => {
            console.log("catch() entered...");
            res.send("JSON error, cannot read file");
        });
    }
});

app.get("/managers",ensureLogin, function (req, res) {
    console.log("managers path active...");
    getManagers().then((data) => {
        console.log("outputting json...");
        res.json([data]);
    }).catch(() => {
        console.log("catch() entered..");
        res.send("JSON error, cannot read file");
    });
});

app.get("/departments",ensureLogin, function (req, res) {
    console.log("department path active...");
    data_service.getDepartments().then((data) => {
        console.log("outputting json...");
        if (data.length > 0) {
            res.render("departments", { departments: data });
        } else {
            res.render("departments", { departments: "no results..." });
        }
    }).catch(() => {
        console.log("catch() entered...");
        res.render({ message: "no results" });
    });
});

app.get("/department/:departmentId",ensureLogin, function (req, res) {
    console.log("departments value path active");
    var id = req.params.departmentId;
    data_service.getDepartmentById(id).then((data) => {
        console.log("outputting json...");
        if (data) {
            res.render("department", { departments: data });
        } else {
            res.status(404).send("Department Not Found");
        }
    }).catch(() => {
        console.log("catch() entered...");
        res.status(404).send("Department Not Found");
    });
});

app.get("/departments/delete/:departmentId",ensureLogin, function (req, res) {
    console.log("departments delete path active");
    var id = req.params.departmentId;
    data_service.deleteDepartmentById(id).then((data) => {
        res.redirect("/departments");
    }).catch(() => {
        console.log("catch() entered...");
        res.status(500).send("Unable To Remove/Department Not Found");
    });
});

app.get("/departments/add",ensureLogin, function (req, res) {
    console.log("departments/add path active...");
    data_service.getDepartments().then(function (data) {
        res.render("addDepartment", { departments: data });
    }).catch(function () {
        res.render("addDepartment", { departments: [] });
    });
});

app.get("/employees/add",ensureLogin, function (req, res) {
    console.log("employees>add path active...");
    data_service.getDepartments().then(function (data) {
        res.render("addEmployee", { departments: data });
    }).catch(function () {
        res.render("addEmployee", { departments: [] })
    });
});

app.get("/images/add",ensureLogin, function (req, res) {
    console.log("images>add path active...");
    res.render(path.join(__dirname + '/views/addImage.hbs'));
});

app.get("/images",ensureLogin, function (req, res) {
    console.log("images path active...");
    fs.readdir("./public/images/uploaded", function (err, images) {
        res.render("images.hbs", { images: images });
    });
});

app.get("/employee/:empNum",ensureLogin, (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    var num = req.params.empNum;
    data_service.getEmployeesByNum(num).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error
    }).then(data_service.getDepartments)
        .then((data) => {
            viewData.departments = data; // store department data in the "viewData" object as "departments"
            // loop through viewData.departments and once we have found the departmentId that matches
            // the employee's "department" value, add a "selected" property to the matching
            // viewData.departments object
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.employee.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = []; // set departments to empty if there was an error
        }).then(() => {
            if (viewData == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", { viewData: viewData }); // render the "employee" view
            }
        });
});

app.get("/employees/delete/:empNum",ensureLogin, function (req, res) {
    var id = req.params.empNum;
    data_service.deleteEmployeeByNum(id).then((data) => {
        res.redirect("/employees");
    }).catch(() => {
        console.log("catch() entered...");
        res.status(500).send("Unable To Remove/Employee Not Found");
    });
});

app.post("/images/add",ensureLogin, upload.single("imageFile"), function (req, res) {
    console.log("POST images>add path active...");
    res.redirect("/images");
});

app.post("/department/update",ensureLogin, function (req, res) {
    console.log("POST department/update path active...");
    data_service.updateDepartment(req.body).then(() => {
        console.log("department updated successfully...");
        res.redirect("/departments");
    }).catch(() => {
        console.log("department updated unsuccessfully...");
    });
});

app.post("/employees/add",ensureLogin, function (req, res) {
    console.log("POST employees>Add path active...");
    data_service.addEmployee(req.body).then(() => {
        console.log("adding employee succesful...");
        res.redirect("/employees");
    }).catch(() => {
        console.log("adding employee unsuccesful...");
    });
});

app.post("/departments/add",ensureLogin, function (req, res) {
    console.log("POST departments>add path active...");
    data_service.addDepartment(req.body).then(() => {
        console.log("adding department successful...");
        res.redirect("/departments");
    }).catch(() => {
        console.log("adding department unsuccessful...");
    })
});

app.post("/employee/update",ensureLogin, function (req, res) {
    console.log(req.body);
    data_service.updateEmployee(req.body).then(() => {
        res.redirect("/employees");
    });
});

data_service.initialize().then(data_service_auth.initialize())
    .then(function () {
        app.listen(HTTP_PORT, function () {
            console.log("app listening on: " + HTTP_PORT)
        });
    }).catch(function (err) {
        console.log("unable to start server: " + err);
    });

app.use(function (req, res) {
    res.status(404).send("Page Not Found");
})
