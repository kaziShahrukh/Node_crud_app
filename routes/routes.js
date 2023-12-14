const express = require("express");
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');
const { result } = require("lodash");

//image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single("image");

//Insert an user into database route
router.post("/add", upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });

    user.save()
        .then(() => {
            req.session.message = {
                type: "success",
                message: "User added successfully!",
            };
            res.redirect("/");
        })
        .catch((err) => {
            console.error(err);  // Log the error for debugging
            res.json({ message: "An error occurred while saving the user.", type: "danger" });
        });

    // user.save((err) => {
    //     if (err) {
    //         console.error(err);
    //         res.json({ message: err.message, type: "danger" });
    //     } else {
    //         req.session.message = {
    //             type: "success",
    //             message: "User added successfully!",
    //         };
    //         res.redirect("/");
    //     }
    // });
});



// Get all users route

router.get("/", (req, res) => {
    User.find().exec()
        .then(users => {
            res.render("index", {
                title: "Home Page",
                users: users,
            });
        })
        .catch(err => {
            res.json({ message: err.message });
        });
});


// router.get("/", (req, res) => {
//     User.find().exec((err, users) => {
//         if (err) {
//             res.json({ message: err.message });
//         } else {
//             res.render("index", {
//                 title: "Home Page",
//                 users: users,
//             });
//         }
//     });
// });

router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add Users" });
});

//Edit an user route
router.get("/edit/:id", (req, res) => {
    let id = req.params.id;
    User.findById(id).exec()
        .then(user => {
            if (!user) {
                res.redirect("/");
            } else {
                res.render("edit_users", {
                    title: "Edit User",
                    user: user,
                });
            }
        })
        .catch(err => {
            console.error(err);
            res.redirect("/");
        });
});


// router.get("/edit/:id", (req, res) => {
//     let id = req.params.id;
//     User.findById(id, (err, user) => {
//         if (err) {
//             res.redirect("/");
//         } else {
//             if (user == null) {
//                 res.redirect("/");
//             } else {
//                 res.render("edit_users", {
//                     title: "Edit User",
//                     user: user,
//                 });
//             }
//         }
//     });
// });

//Update user route

router.post("/update/:id", upload, async (req, res) => {
    let id = req.params.id;
    let new_image = "";

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync("./uploads/" + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        const result = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        }).exec();

        req.session.message = {
            type: 'success',
            message: 'User updated successfully!',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// router.post("/update/:id", upload, (req, res) => {
//     let id = req.params.id;
//     let new_image = "";

//     if (req.file) {
//         new_image = req.file.filename;
//         try {
//             fs.unlinkSync("./uploads/" + req.body.old_image);
//         } catch (err) {
//             console.log(err);
//         }
//     } else {
//         new_image = req.body.old_image;
//     }

//     User.findByIdAndUpdate(id, {
//         name: req.body.name,
//         email: req.body.email,
//         phone: req.body.phone,
//         image: new_image,
//     }, (err, result) => {
//         if (err) {
//             res.json({ message: err.message, type: 'danger' });
//         } else {
//             req.session.message = {
//                 type: 'success',
//                 message: 'User updated successfully!',
//             };
//             res.redirect('/');
//         }
//     })
// });

//Delete user route

router.get("/delete/:id", async (req, res) => {
    let id = req.params.id;

    try {
        const result = await User.findOneAndDelete({ _id: id }).exec();

        if (result && result.image !== "") {
            try {
                fs.unlinkSync("./uploads/" + result.image);
            } catch (err) {
                console.log(err);
            }
        }

        req.session.message = {
            type: "info",
            message: "User deleted successfully!",
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message });
    }
});




// router.get("/delete/id/:id", (req, res) => {
//     let id = req.params.id;
//     User.findAndDelete(id, (err, result) => {
//         if (result.image != "") {
//             try {
//                 fs.unlinkSync("./uploads/" + result.image);
//             } catch (err) {
//                 console.log(err);
//             }
//         }
//         if (err) {
//             res.json({ message: err.message });
//         } else {
//             req.session.message = {
//                 type: "info",
//                 message: "User deleted successfully!",
//             };
//             res.redirect("/");
//         }
//     })
// });

module.exports = router;