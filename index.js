import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import fs from "fs";

const app = express();
const port = 3000;
const URL_API = "https://openlibrary.org/search.json";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

function isISBN(input) {
    return /\d/.test(input) && input.length == 13;
}

function errorRender(res) {
    res.render("index.ejs", {
        title : "ERROR",
        image : "",
        author: "NOT FOUND",
        year : ""
    });
}

async function getISBN(name) {
    try {
        name = name.replace(/ /g, '+');

        let url = URL_API + "?q="+name+"&lang=es&page=1&sort=new";
        console.log(url);
        const response = await axios.get(url);
        const result = response.data;

        return result.docs[0].isbn[0];
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

async function getBookInfoISBN(isbn_input) {
    try {
        let url = URL_API + "?q="+isbn_input;
        const response = await axios.get(url);
        const result = response.data;

        if(result.numFound >= 1){
            var bookInfo = result.docs[0];
            var url_img = "https://covers.openlibrary.org/b/isbn/"+isbn_input+"-L.jpg";

            return [
                bookInfo.title, 
                url_img,
                bookInfo.author_name[0],
                bookInfo.first_publish_year
            ];
        }
    }catch (error) {
        console.error(error.message);
        return null;
    }
}

app.get("/", async (req, res) => {
    let isbn = "9788437634999";
    var bookInfo = await getBookInfoISBN(isbn);
    if(bookInfo) {
        res.render("index.ejs", {
            title : bookInfo[0],
            image : bookInfo[1],
            author : bookInfo[2],
            year : bookInfo[3]
        });
    }
});

app.post("/search", async (req, res) => {
    var search = req.body.search;
    if(!isISBN(search)) {
        search = await getISBN(search);
    }

    
    let bookInfo = await getBookInfoISBN(search);
    res.render("index.ejs", {
        title : bookInfo[0],
        image : bookInfo[1],
        author : bookInfo[2],
        year : bookInfo[3]
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});