var express = require('express');
var router = express.Router();
var db = require('../lib/db')
var fs = require('fs')
const path = require('path');
var cto = require('../lib/cto')

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


router.get('/boss', (req, res) => {
  db.getboss((result) => {
    res.status(200).send({ status: 'OK', code: 200, data: result })
  })
})

router.get('/subject', (req, res) => {
  db.getsubject((result) => {
    res.status(200).send({ status: 'OK', code: 200, data: result })
  })
}
)

router.get('/projectinfomation/student', (req, res) => {
  build = {
      id_project: req.query.id_project,
  }
  db.projectmeberinfomation(build, (result) => {
      result == 422 ? cto.e422(res) : cto.o200(res, result)
  }
  )
})

router.get('/projectinfomation/staff', async (req, res) => {
  const build = {
      id_project: req.query.id_project,
  };

  try {
      const [staffResult, staffosResult] = await Promise.all([db.asyncgetstaff(build), db.asyncgetstaffos(build)]);
      console.log(staffResult, staffosResult);
      // Handle the results or send a response to the client
      cto.o200(res, [{ staff: staffResult, os_staff: staffosResult }]);
  } catch (error) {
      console.error(error);
      // Handle the error and send an appropriate response
      cto.e422(res);
  }
});

router.get('/projectinfomation', (req, res) => {
  // to int
  build = {
      id_project: req.query.id_project,
  }
  db.projectinfomation(build, (result) => {
      result == 422 ? cto.e422(res) : cto.o200(res, result)
  }
  )
})

router.get('/newshome', (req, res) => {
  db.getnewsa((result) => {
    res.status(200).send({ status: 'OK', code: 200, data: result })
  })
})

router.get('/fefile', (req, res) => {
  console.log(req.query.id_project)
  console.log("reefe")
  build = {
    id_project: req.query.id_project,
  }
  db.getfefile(build, (result) => {
    result == 422 ? cto.e422(res) : cto.o200(res, result)
}
)
})

router.get('/schedule', (req, res) => {
  db.getschedule((result) => {
    res.status(200).send({ status: 'OK', code: 200, data: result })
  })
})


router.get('/reqproject', (req, res) => {
  build = {
  }
  console.log("wwe11q")
  db.getreqproject(build, (result) => {
      result == 422 ? cto.e422(res) : cto.o200(res, result)
  })
})

router.get('/aasemester', (req, res) => {
  db.aagetsemeter((result) => {
      result == 422 ? cto.e422(res) : cto.o200(res, result)
  })
}
)
module.exports = router;


function debug(x) {
  console.log("\n:::::::::::::::::::::::: {{ DEBUG }} :::::::::::::::::::::::: ")
  console.log(x)
  console.log("::::::::::::::::::::::::: {{ END }} ::::::::::::::::::::::::: \n")
}