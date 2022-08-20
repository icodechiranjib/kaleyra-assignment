import "./App.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { Typography, Button, ButtonGroup } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

function App() {
  const [reminderMsg, setReminderMsg] = useState("");
  const [remindAt, setRemindAt] = useState(new Date());
  const [reminderList, setReminderList] = useState([]);

  const handleChange = (newValue) => {
    setRemindAt(newValue);
  };

  useEffect(() => {
    axios
      .get("http://localhost:9000/getAllReminder")
      .then((res) => setReminderList(res.data));
  }, []);

  const addReminder = () => {
    axios
      .post("http://localhost:9000/addReminder", { reminderMsg, remindAt })
      .then((res) => setReminderList(res.data));
    setReminderMsg("");
    setRemindAt();
  };

  const editReminder = (id) => {
    axios
      .post("http://localhost:9000/editReminder", { id, reminderMsg, remindAt })
      .then((res) => setReminderList(res.data));
    setReminderMsg("");
    setRemindAt();
  };

  const deleteReminder = (id) => {
    axios
      .post("http://localhost:9000/deleteReminder", { id })
      .then((res) => setReminderList(res.data));
  };

  return (
    <div className="App">
      <div className="homepage">
        <div className="homepage_header">
          <Typography
            sx={{
              margin: "1rem",
            }}
            variant="h1"
          >
            Reminder Application
          </Typography>

          <Typography
            sx={{
              marginBottom: "1rem",
            }}
            variant="h5"
          >
            Create a reminder and get notified when it's time to do it 🔔
          </Typography>

          <TextField
            sx={{
              marginBottom: "2rem",
            }}
            multiline
            fullWidth
            label="Note down tasks"
            value={reminderMsg}
            onChange={(e) => setReminderMsg(e.target.value)}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Date and Time"
              value={remindAt}
              onChange={handleChange}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>

          <Button
            sx={{
              marginTop: "2rem",
            }}
            variant="contained"
            color="error"
            onClick={addReminder}
          >
            <Typography>Add Reminder</Typography>
          </Button>
        </div>

        <div className="homepage_header">
          <Typography variant="h4">All Tasks</Typography>
        </div>

        <div className="homepage_body">
          {reminderList.map((reminder) => (
            <div className="reminder_card" key={reminder._id}>
              <Typography
                sx={{
                  color: "#ffffff",
                  marginBottom: "1rem",
                  textAlign: "center",
                  backgroundColor: "#1877f2",
                  borderRadius: "8px",
                }}
                size="large"
                variant="h5"
              >
                {reminder.reminderMsg}
              </Typography>
              <Typography color="error" variant="h6">
                Reminder On:
              </Typography>
              <Typography variant="body">
                {String(
                  new Date(
                    reminder.remindAt?.toLocaleString(undefined, {
                      timezone: "Asia/Kolkata",
                    }) || ""
                  )
                )}
              </Typography>

              <ButtonGroup
                sx={{
                  marginTop: "1rem",
                }}
                variant="contained"
                aria-label="outlined primary button group"
                fullWidth
              >
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => deleteReminder(reminder._id)}
                >
                  Delete
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<EditIcon />}
                  onClick={() => editReminder(reminder._id)}
                >
                  Edit
                </Button>
              </ButtonGroup>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
