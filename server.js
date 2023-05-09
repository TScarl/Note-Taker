const express = require('express');
const path = require('path');
const fs = require("fs");
const uuid = require('./helpers/uuid');
const notes = require("./db/db.json");

const PORT = process.env.PORT || 3001;
const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, 'public/notes.html'))
);
app.get('/api/notes', (req, res) => {
    res.json(notes)
});
app.post("/api/notes", (req, res) => {
    console.info(`${req.method} request received to add a note`);
    //assigns the values "title" and "text" to the request body
    const { title, text } = req.body;
    //error handling to ensure the new note has a title, text and unique id
    if (req.body) {
        const newNote = {
            title,
            text,
            note_id: uuid(),
        };
        // pushes new notes into already existing notes
        notes.push(newNote);
        //old and new notes are formatted together
        const allNotes = JSON.stringify(notes, null, '\t');
        //writes all of the notes back into the db.json file
        fs.writeFile(`../db/db.json`, allNotes, (err) => {
            if (err) {
                console.error(err)
                res.status(500).json('Error in creating note');
            } else {
                console.log(`${newNote.title} has been written to JSON file`);
                const response = {
                    status: 'success',
                    body: newNote,
                };
                console.log(response);
                res.status(201).json(response);
            }
        });
    } else {
        res.status(500).json('Error in creating note');
    }
});
//uses unique id to delete a specific note
app.delete('/api/notes/:id', (req, res) => {
    try {
        console.info(`${req.method} request recieved to delete note`);
        const noteId = req.params.id;
        //fitlers through the notes searching for the unique id to be removed
        const filteredNotes = notes.filter(note => note.note_id !== noteId);
        //recreates allNotes without the deleted note
        const allNotes = JSON.stringify(filteredNotes, null, '\t');
        //rewrites db.json without the deleted note
        fs.writeFile(`../db/db.json`, allNotes, (err) => {
            if (err) {
                console.error(err)
                res.status(500).json("error in deleting note");
            } else {
                console.log(`note ${noteId} has been deleted from db.json`);
                const response = {
                    status: "success",
                    body: filteredNotes,
                };
                console.log(response);
                res.status(200).json(response);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json('Error in creating note');
    }
});
app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`));
    