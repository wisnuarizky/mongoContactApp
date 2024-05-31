const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const { validationResult, body, check } = require('express-validator');
const methodOverride = require('method-override');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

// koneksi DB
require('./utils/db');
const Contact = require('./model/contact');
//

const app = express();
const port = 3000;

// setup methodOverride
app.use(methodOverride('_method'));
//

// setup ejs
app.set('view engine', 'ejs');
app.use(expressLayouts); //middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
//

// konfigurasi flash
app.use(cookieParser('secret'));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
//

// halaman home
app.get('/', (req, res) => {
  const mahasiswa = [
    {
      nama: 'Wisnu Arizky',
      email: 'wisnuar@gmail.com',
    },
    {
      nama: 'Yoga Fadila',
      email: 'yogfad@gmail.com',
    },
    {
      nama: 'Ivan Julian',
      email: 'ivanjul@gmail.com',
    },
  ];

  res.render('index', {
    nama: 'Wisnu Arizky Kurniawan',
    title: 'Halaman Home',
    mahasiswa,
    layout: 'layouts/main-layout',
  });
});
//

// halaman about
app.get('/about', (req, res) => {
  res.render('about', {
    title: 'Halaman About',
    layout: 'layouts/main-layout',
  });
});
//

// halaman contact
app.get('/contact', async (req, res) => {
  // Contact.find().then((contact) => {
  //   res.send(contact);
  // });

  const contacts = await Contact.find();

  res.render('contact', {
    title: 'Halaman Contact',
    layout: 'layouts/main-layout',
    contacts,
    msg: req.flash('msg'),
  });
});
//

// halaman tambah contact
app.get('/contact/add', (req, res) => {
  res.render('add-contact', {
    title: 'Form Tambah Data Contact',
    layout: 'layouts/main-layout',
  });
});
//

// proses tambah contact
app.post(
  '/contact',
  [
    body('nama').custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });

      if (duplikat) {
        throw new Error('Nama contact sudah digunakan!');
      }
      return true;
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('nohp', 'No HP tidak valid').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('add-contact', {
        title: 'Form Tambah Data Contact',
        layout: 'layouts/main-layout',
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body);
      // kirim flash message
      req.flash('msg', 'Data contact berhasil ditambahkan');
      //
      res.redirect('/contact');
    }
  }
);
//

// proses delete contact
// app.get('/contact/delete/:nama', async (req, res) => {
//   const contact = await Contact.findOne({ nama: req.params.nama });

//   // jika contact tidak ada
//   if (!contact) {
//     res.status(404);
//     res.send('<h1>404</h1>');
//   } else {
//     Contact.deleteOne({ nama: req.params.nama }).then((result) => {
//       // kirim flash message
//       req.flash('msg', 'Data contact berhasil dihapus');
//       //
//       res.redirect('/contact');
//     });
//   }
// });

app.delete('/contact', (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    // kirim flash message
    req.flash('msg', 'Data contact berhasil dihapus');
    //
    res.redirect('/contact');
  });
});
//

// halaman edit contact
app.get('/contact/edit/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render('edit-contact', {
    title: 'Form Ubah Data Contact',
    layout: 'layouts/main-layout',
    contact,
  });
});
//

// proses ubah data
app.put(
  '/contact',
  [
    body('nama').custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });

      if (value !== req.body.oldNama && duplikat) {
        throw new Error('Nama contact sudah digunakan!');
      }
      return true;
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('nohp', 'No HP tidak valid').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('edit-contact', {
        title: 'Form Ubah Data Contact',
        layout: 'layouts/main-layout',
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            nohp: req.body.nohp,
            email: req.body.email,
          },
        }
      ).then((result) => {
        // kirim flash message
        req.flash('msg', 'Data contact berhasil diubah');
        //
        res.redirect('/contact');
      });
    }
  }
);
//

// halaman detail contact
app.get('/contact/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render('detail', {
    title: 'Halaman Detail Contact',
    layout: 'layouts/main-layout',
    contact,
  });
});
//

app.listen(port, () => {
  console.log(`MOngo Contact APP | Listening at ${port}`);
});
