var exports = module.exports = {};

const Sequelize = require('sequelize');
var sequelize = new Sequelize('dbddhscihsrbf7','nortukcszhidqi','456ea911960523300a6cabcdf056eec82bece4c998a134a6f244a667992d4192',{
    host: 'ec2-54-225-110-156.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: '5432',
    dialectOptions: {
        ssl: true
    }
});

const Employee = sequelize.define('Employee',{
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement:true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING
});

const Department = sequelize.define('Department',{
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement:true
    },
    departmentName: Sequelize.STRING
});

Department.hasMany(Employee,{foreignKey:'department'});

exports.initialize = function(){
    return new Promise(function(resolve,reject){
        sequelize.sync().then(function(){
            resolve();
        }).catch(function(){
            reject("unable to execute sync() function successfully...");
        });
    });
}

exports.getAllEmployees = function(){
    return new Promise(function(resolve,reject){
        Employee.findAll().then(function(data){
            resolve(data);
        }).catch(function(){
            reject("employee data unable to be retrieved...");
        });
    });
}

exports.getEmployeesByStatus = function(status){
    return new Promise(function(resolve,reject){
        Employee.findAll({
            where:{
                status: status
            }
        }).then(function(data){
            resolve(data);
        }).catch(function(){
            reject("employees by status data unable to be retrieved...");
        });
    });
}

exports.getEmployeesByDepartment = function(department){
    return new Promise(function(resolve,reject){
        Employee.findAll({
            department: department
        }).then(function(data){
            resolve(data);
        }).catch(function(){
            reject("employees by deparment data unable to be retrieved...");
        });
    });
}

exports.getEmployeesByManager = function(manager){
    return new Promise(function(resolve,reject){
        Employee.findAll({
            manager: manager
        }).then(function(data){
            resolve(data);
        }).catch(function(){
            reject("employees by manager data unable to be retrieved...");
        });
    });
}

exports.getEmployeesByNum = function(num){
    return new Promise(function(resolve,reject){
        Employee.findAll({
            employeeNum: num
        }).then(function(data){
            resolve(data[0]);
        }).catch(function(){
            reject("employees by num data unable to be retrieved...");
        });
    });
}

exports.getDepartments = function(){
    return new Promise(function(resolve,reject){
        Department.findAll().then(function(data){
            resolve(data);
        }).catch(function(){
            reject("department data unable to be retrieved...");
        });
    });
}

exports.addEmployee = function(employeeData){
    return new Promise(function(resolve,reject){
        employeeData.isManager = (employeeData.isManager) ? true : false;
            for(const property in employeeData){
                if(property == ""){
                    property = null;
                }
            }
        Employee.create({
            employeeNum: employeeData.employeeNum,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate
        }).then(function(){
            resolve();
        }).catch(function(){
            reject("new employee data unable to be written...");
        });
    });
}

exports.updateEmployee = function(employeeData){
    return new Promise(function(resolve,reject){
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for(const property in employeeData){
            if(property == ""){
                property = null;
            }
        }
        Employee.update({
            employeeNum: employeeData.employeeNum,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate
        },{
            where:{employeeNum: employeeData.employeeNum}
        }).then(function(){
            resolve();
        }).catch(function(){
            reject("employee data unable to be updated...");
        });
    });
}

exports.addDepartment = function(departmentData){
    return new Promise(function (resolve,reject){
        for(const property in departmentData){
            if(property == ""){
                property = null;
            }
        }
        Department.create({
            departmentId: departmentData.departmentId,
            departmentName: departmentData.departmentName
        }).then(function(){
            resolve();
        }).catch(function(){
            reject("department data unable to be updated...");
        });
    });
}

exports.updateDepartment = function(departmentData){
    return new Promise(function(resolve,reject){
        console.log(departmentData);
        for(const property in departmentData){
            if(departmentData[property] == ""){
                departmentData[property] = null;
            }
        }
        Department.update({
            departmentName: departmentData.departmentName
        },
        {
            where:{departmentId: departmentData.departmentId}
        }).then(function(){
            resolve();
        }).catch(function(){
            reject("new department data unable to be written...");
        });
    });
}

exports.getDepartmentById = function(id){
    return new Promise(function(resolve,reject){
        Department.findAll({
            where:{departmentId: id}
        }).then(function(data){
            resolve(data);
        }).catch(function(){
            reject("department data unable to be retrieved...");
        });
    });
}

exports.deleteDepartmentById = function(id){
    return new Promise(function(resolve,reject){
        Department.destroy({
            where:{departmentId: id}
        }).then(function(){
            resolve("department was deleted successfully");
        }).catch(function(){
            reject("department was unable to be deleted...");
        });
    });
}

exports.deleteEmployeeByNum = function(empNum){
    return new Promise(function(resolve,reject){
        Employee.destroy({
            where:{employeeNum: empNum}
        }).then(function(){
            resolve("employee was deleted successfully");
        }).catch(function(){
            reject("employee was unable to be deleted successfully...");
        });
    });
}
/*
exports.getManagers = function(){
    return new Promise(function(resolve,reject){
        
    });
}
*/