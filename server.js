require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const axios = require("axios");

//APP config
const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

//DB config
mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => console.log("DB connected")
);

const reminderSchema = new mongoose.Schema({
  reminderMsg: String,
  remindAt: String,
  isReminded: Boolean,
});

const Reminder = new mongoose.model("reminder", reminderSchema);

//Text Message API (every 1 sec check if reminder is time to send text message)
setInterval(() => {
  Reminder.find({}, (err, reminderList) => {
    if (err) {
      console.log(err);
    }
    if (reminderList) {
      reminderList.forEach((reminder) => {
        if (!reminder.isReminded) {
          const now = new Date();
          if (new Date(reminder.remindAt) - now < 0) {
            Reminder.findByIdAndUpdate(
              reminder._id,
              { isReminded: true },
              (err, remindObj) => {
                if (err) {
                  console.log(err);
                }
                let axiosConfig = {
                  headers: {
                    "Content-Type": "application/json",
                    "api-key": "Ad4ad639409238e113e1e420950e9ad48",
                  },
                };

                var data = {
                  body: "Some of your tasks are due. It's not good to procrastinate.",
                  sender: "KALERA",
                  to: "+91999566XXXX",
                  type: "TXN",
                  template_id: "1107165959856139086",
                };

                const response = axios
                  .post(
                    "https://api.in.kaleyra.io/v1/HXIN1740145135IN/messages",
                    data,
                    axiosConfig
                  )
                  .then((res) => {
                    console.log(res.statusText);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            );
          }
        }
      });
    }
  });
}, 1000);

//APIs
app.get("/getAllReminder", (req, res) => {
  Reminder.find({}, (err, reminderList) => {
    if (err) {
      console.log(err);
    }
    if (reminderList) {
      res.send(reminderList);
    }
  });
});

app.post("/addReminder", (req, res) => {
  const { reminderMsg, remindAt } = req.body;
  console.log(req.body);
  const reminder = new Reminder({
    reminderMsg,
    remindAt,
    isReminded: false,
  });
  reminder.save((err) => {
    if (err) {
      console.log(err);
    }
    Reminder.find({}, (err, reminderList) => {
      if (err) {
        console.log(err);
      }
      if (reminderList) {
        res.send(reminderList);
      }
    });
  });
});

app.post("/editReminder", (req, res) => {
  Reminder.findByIdAndUpdate(
    { _id: req.body.id },
    {
      reminderMsg: req.body.reminderMsg,
      remindAt: req.body.remindAt,
    },
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        Reminder.find({}, (err, reminderList) => {
          if (err) {
            console.log(err);
          }
          if (reminderList) {
            res.send(reminderList);
          }
        });
      }
    }
  );
});

app.post("/deleteReminder", (req, res) => {
  Reminder.deleteOne({ _id: req.body.id }, () => {
    Reminder.find({}, (err, reminderList) => {
      if (err) {
        console.log(err);
      }
      if (reminderList) {
        res.send(reminderList);
      }
    });
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.listen(process.env.PORT || 9000, () => console.log("Be started"));
