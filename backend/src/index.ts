import app from "./app";

const port = parseInt(process.env.PORT || '8080', 10);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})