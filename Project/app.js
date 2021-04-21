const morgan=require('morgan');
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const cors = require('cors');
var sql = require("mysql");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

var sqlc = sql.createConnection({
  host: "database-2.csy3khptdtjp.us-east-1.rds.amazonaws.com",
  user: "root",
  port: "3306",
  password: "severus90160",
  database: "bank",
  multipleStatements: true
});

sqlc.connect(function(err) {
  if (!err) {
      console.log("Connected to SQL");
  } else {
      console.log(err);
  }
});

app.get('/view',function(req,res){
    sqlc.query(`select * from customer`, function(err,rows){
    if(err)
    {
      console.log(err);
    }
    else{
      res.render("customers-list", { customers:rows });
    }
  })
})
app.get('/viewt',function(req,res){
  sqlc.query(`select * from transaction`, function(err,rows){
  if(err)
  {
    console.log(err);
  }
  else{
    res.render("trans-list", { trans:rows });
  }
})
})

app.get('/trans',function(req,res){
  var accn=req.query.accn;
  res.render("transaction",{accn:accn})
})

app.get('/',function(req,res){
  res.render("home")
})

app.post('/transaction',function(req,res){
  var {accn,amt,faccn}=req.body
  console.log(accn)
  console.log(amt)
  console.log(faccn)
  var from=faccn
  var to=accn
  var amount=amt
  sqlc.query(`select balance from customer where acc='${faccn}'`,function(err2,rows){
    if(err2||amt>=rows[0].balance){
      res.status(401).json({message:'Error!'})
    }
    else{
      sqlc.query(`update customer set balance=balance-'${amt}' where acc='${faccn}'`,function(err,results){
        if(err){
          console.log(err)
          res.status(401).json({message:'Error!'})
        }
        else{
          sqlc.query(`update customer set balance=balance+'${amt}' where acc='${accn}'`,function(err1,results1){
            if(err1){
              console.log(err1)
              res.status(401).json({message:'Error!'})
            }
            else{
              sqlc.query(`insert into transaction set ? `, {from,to,amount}, function(err3,results3){
                if(err3)
                {
                  console.log(err3);
                  res.status(401).json({message:'Error!'})
                }
                else{
                  console.log("success");
                  res.status(200).json({message:'Success!'})
                }
              })
            }
          })
        }
      })
    }
  })
})

app.listen(process.env.PORT||3000, function() {
  console.log("Server Running at 3000");
})
