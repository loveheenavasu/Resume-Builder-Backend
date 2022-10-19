var bcrypt = require("bcryptjs");
const dbConfig = require("../config/db.config");
const db = require("../models");
const Role = db.role;
const User = db.user;

// Roles Seed function
const roles = async () => {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            const seedRoles = [
                {
                    name: "admin"
                },
                {
                    name: "user"
                }
            ];

            const seedDB = async () => {
                await Role.deleteMany({});
                await Role.insertMany(seedRoles);

            }

            seedDB().then(() => {
                console.log("Roles seed successfully.");
            });
        }
    });
}

// Create Default Uesrs
const users = async () => {
    User.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            Role.findOne({ name: "admin" }, (err, role) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                if(role){
                    const seedAdminUser = [
                        {
                            fullName: "Admin",
                            email: "admin@yopmail.com",
                            password: bcrypt.hashSync("password", 8),
                            role: role._id
                        }
                    ];

                    const seedDB = async () => {
                        await User.deleteMany({});
                        await User.insertMany(seedAdminUser);

                    }

                    seedDB().then(() => {
                        console.log("Users seed successfully.");
                    });
                }
            });
        }
    });
}


const run = () => {
    db.mongoose
        .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then( async () => {
            console.log("Successfully connect to MongoDB.");
            await roles();
            await users();
        })
        .catch(err => {
            console.error("Connection error", err);
            process.exit();
        });
}

module.exports = run;