const fs = require("fs");

const path = require("path");

const PORT = 6079;

const guestsPath = path.join(__dirname, "pets.json");

const express = require('express');

const app = express();

app.use(express.json());

app 
    //get all
    .get("/pets", (req, res, next) => {
        fs.readFile(guestsPath, 'utf8', (err, data) => {
            if(err) {
                next({status: 500, type: 'text/plain', message: "Internal Server Error", error: err})
            }
            else {
                let parsedData = JSON.parse(data)
                res.json(parsedData)
            }
        })
    })

    //get one
    .get("/pets/:id", (req, res, next) => {
        fs.readFile(guestsPath, 'utf8', (err, data) => {
            let index = req.params.id
            if(err) {
                next({status: 500, type: 'text/plain', message: "Internal Server Error", error: err})
            }
            else {
                let parsedData = JSON.parse(data)
                let requestedData = parsedData[index]
                if (!requestedData) {
                    res.status(404).type('text/plain').send('NOT FOUND!')
                }
                else (
                    res.send(requestedData)
                )
            }
        })
    })

    //create one
    .post("/pets", (req, res, next) => {
        let petObj = req.body
        if(!dataValidation(petObj)) {
            next({status: 500, type: 'text/plain', message: "Internal Server Error", error: err})
        }
        else {
            fs.readFile(guestsPath, 'utf8', (err, data) => {
                if(err) {
                    next({status: 500, type: 'text/plain', message: "Internal Server Error", error: err})
                }
                else {
                    let parsedData = JSON.parse(data)
                    parsedData.push(petObj)
                    fs.writeFile(guestsPath, JSON.stringify(parsedData), (err) => {
                        if(err){
                            next({status: 500, type: 'text/plain', message: "Internal Server Error", error: err})
                        } else {
                            res.status(200).send(petObj)
                        }
                    })
                }
            })
            //grab json data
            //add petobj
            //write data in json
        }

    })

    //delete one
    .delete("/pets/:id", (req, res, next) => {
        let index = req.params.id
        fs.readFile(guestsPath, 'utf8', (err, data) => {
            if(err) {
                next({status: 500, type: 'text/plain', message: "Internal Server Error", error: err})
            }
            else {
                let parsedData = JSON.parse(data)
                if (!index || !parsedData[index]) {
                    res.status(404).type('text/plain').send('NOT FOUND!')
                }
                else {
                    let deletedPet = parsedData[index]
                    parsedData.splice(index, 1)
                    fs.writeFile(guestsPath, JSON.stringify(parsedData), (err) => {
                        if(err){
                            next({status: 500, type: 'text/plain', message: "Internal Server Error", error: err})
                        } else {
                            res.status(200).send(deletedPet)
                        }
                    })
                }
            }  
        })     
    })

    //update one
    .patch("/pets/:id", (req, res, next) => {
        let obj = req.body
        //{age: 1}
        let index = req.params.id
        if(!patchValidation(obj)) {
            next({status: 500, type: 'text/plain', message: "Internal Server Error", error: err})
        }
        else {
            fs.readFile(guestsPath, 'utf8', (err, data) => {
                if(err) {
                    next({status: 500, type: 'text/plain', message: "Internal Server Error", error: err})
                }
                else {
                    let parsedData = JSON.parse(data)
                    let object = parsedData[index]
                    changeValue(object, obj)
                    fs.writeFile(guestsPath, JSON.stringify(parsedData), (err) => {
                        if(err){
                            next({status: 500, type: 'text/plain', message: "Internal Server Error", error: err})
                        } else {
                            res.status(200).send(object)
                        }
                    })
                }
            })
        }
        //grab obj at array index
        //assigned new value to obj[key]
        //write file
    })

    app.use((err, req, res, next) => {
        res.status(err.status).type(err.type).send(err.message)
    })
    app.use((req, res, next) => {
        res.status(404).type('text/plain').send('Not Found');
    })

    

app.listen(PORT, () => {
  console.log("Listening in port:", PORT);
});

function dataValidation(data) {
    let returnValue = true;
    if(isNaN(parseInt(data.age)) || data['name'] === undefined || data['name'] === '' || data['kind'] === undefined || data['kind'] === '') {
        returnValue = false
    }
    return returnValue
}

function patchValidation(data) {
    let returnValue = false
    if(isNaN(parseInt(data.age)) || data['name'] === undefined || data['name'] === '' || data['kind'] === undefined || data['kind'] === '') {
        returnValue = true
    }
    return returnValue
}

function changeValue(obj1, obj2) {
    for (let key in obj1) {
        if (key in obj2) {
            obj1[key] = obj2[key]
        }
    }
    return obj1
}
