var express = require('express');
var router = express.Router();
var db = require('../lib/db')
var fs = require('fs')
const path = require('path');
const ejs = require('ejs');
var html_to_pdf = require('html-pdf-node');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});



router.get('/download/pdf', (req, res) => {
  console.log(req.query.file)
  // รับค่าชื่อไฟล์จากพารามิเตอร์ file ใน URL
  const fileName = req.query.file;

  // ตรวจสอบว่ามีการระบุชื่อไฟล์ในพารามิเตอร์หรือไม่
  if (!fileName) {
    return res.status(400).send('Bad Request: Missing "file" parameter');
  }

  // ที่อยู่ของไฟล์ PDF ที่คุณได้รับมาจากหลังบ้าน
  const filePath = `${fileName}`;
  // สร้างเส้นทางสำหรับไฟล์
  const file = path.resolve(filePath);
  // ตรวจสอบว่าไฟล์มีอยู่จริงหรือไม่
  if (fs.existsSync(file)) {
    debug("1")
    // ให้เซิร์ฟเวอร์ส่งไฟล์กลับไปยังผู้ใช้
    res.download(file, (err) => {
      if (err) {
        // หากเกิดข้อผิดพลาดในการดาวน์โหลด
        console.error('Error downloading file:', err);
        res.status(500).send('Internal Server Error');
      }
    });
  } else {

    debug("2")
    // หากไฟล์ไม่พบ
    res.status(404).send('File not found');
  }
});


router.get('/name_title', (req, res) => {
  db.getname_title((result) => {
    res.status(200).send({ status: 'OK', code: 200, data: result })
  })
})

router.get('/major', (req, res) => {
  db.getmajor((result) => {
    res.status(200).send({ status: 'OK', code: 200, data: result })
  })
})

router.get('/course', (req, res) => {
  db.getcourse((result) => {
    res.status(200).send({ status: 'OK', code: 200, data: result })
  })
})

router.get('/role', (req, res) => {
  db.getrole((result) => {
    res.status(200).send({ status: 'OK', code: 200, data: result })
  })
})


router.get('/pdf', async (req, res) => {
  let options = { format: 'A4' };
  let file = { content: "<h1>Welcome to html-pdf-node</h1>" };

  html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
    // Set the Content-Disposition header to include the file name
    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', 'attachment; filename=example.pdf');

    // Send the PDF buffer back to the user
    res.status(200).send(pdfBuffer);
  });
});


module.exports = router;


function debug(x) {
  console.log("\n:::::::::::::::::::::::: {{ DEBUG }} :::::::::::::::::::::::: ")
  console.log(x)
  console.log("::::::::::::::::::::::::: {{ END }} ::::::::::::::::::::::::: \n")
}