const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const {
  loadContact,
  findContact,
  addContact,
  cekDuplicate,
  deleteContact,
  updateContacts,
} = require("./utils/contacts");
const { body, validationResult, check } = require("express-validator");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const app = express();
const port = 3000;

//gunakan ejs
app.set("view engine", "ejs");

//build-in middleware
app.use(express.static("public"));

//third party middleware
app.use(expressLayouts);

//
app.use(express.urlencoded({ extended: true }));

//konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.get("/", (req, res) => {
  // mengrim nilai array ke index html
  const mahasiswa = [
    {
      nama: "Yonathanch",
      email: "yonathan@gmail.com",
    },
    {
      nama: "erik",
      email: "erik@gmail.com",
    },
    {
      nama: "yossi",
      email: "yossi@gmail.com",
    },
  ];

  // cara mengirim nilai object ke html
  res.render("index", {
    nama: "YonathanChristianto",
    title: "ViewEngine",
    mahasiswa,
    layout: "layouts/main-layout",
  });
});
app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "About Page",
  });
});

app.get("/contact", (req, res) => {
  const contacts = loadContact();

  res.render("contact", {
    layout: "layouts/main-layout",
    title: "Contact Page",
    contacts,
    msg: req.flash("msg"),
  });
});

//halaman form tambah data contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "form to add contact data",
    layout: "layouts/main-layout",
  });
});

//proses data contact
app.post(
  "/contact",
  [
    body("name").custom((value) => {
      const duplicate = cekDuplicate(value);
      if (duplicate) {
        throw new Error("contact name is already in use!");
      }
      return true;
    }),
    check("email", "Email not valid").isEmail(),
    check("nohp", "Number Phone not valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(404).json({ errors: errors.array() });
      res.render("add-contact", {
        title: "form to add contact data",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      addContact(req.body);

      //kirimkan message flash
      req.flash("msg", "Contact data added successfully");
      res.redirect("/contact");
    }
  }
);

//proses delete contact
app.get("/contact/delete/:name", (req, res) => {
  const contact = findContact(req.params.name);

  //jika ada contact
  if (!contact) {
    res.status(404);
    res.send("<h1>404</h1>");
  } else {
    deleteContact(req.params.name);
    req.flash("msg", "Contact data delete successfully");
    res.redirect("/contact");
  }
});

//halaman form edit data contact
app.get("/contact/edit/:name", (req, res) => {
  const contact = findContact(req.params.name);

  res.render("edit-contact", {
    title: "form to edit contact data",
    layout: "layouts/main-layout",
    contact,
  });
});

//proses ubah data
app.post(
  "/contact/update",
  [
    body("name").custom((value, { req }) => {
      const duplicate = cekDuplicate(value);
      if (value !== req.body.oldName && duplicate) {
        throw new Error("contact name is already in use!");
      }
      return true;
    }),
    check("email", "Email not valid").isEmail(),
    check("nohp", "Number Phone not valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(404).json({ errors: errors.array() });
      res.render("edit-contact", {
        title: "form to edit contact data",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      updateContacts(req.body);
      //kirimkan message flash
      req.flash("msg", "Contact data update successfully");
      res.redirect("/contact");
    }
  }
);

//halaman detail kontak
app.get("/contact/:name", (req, res) => {
  const contact = findContact(req.params.name);

  res.render("detail", {
    layout: "layouts/main-layout",
    title: "Contact Detail",
    contact,
  });
});

app.use("/", (req, res) => {
  res.status(404);
  res.send("<h1> 404 </h1>");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
