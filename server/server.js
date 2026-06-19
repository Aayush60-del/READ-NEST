const dotenv = require("dotenv");
dotenv.config(); 
const port = process.env.PORT || 5000;
const app = require("./src/app");
const connectDb = require("./src/config/db");

async function startServer()
{
    try
    {
        await connectDb();
        app.listen(port , ()=>
        {
            console.log(`Server is running on port ${port}`);
        })
    }catch(err)
    {
        console.log("Failed to start the server " , err.message);
    }
}


startServer();
