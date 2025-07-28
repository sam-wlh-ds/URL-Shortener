import App from "../App.js"
import Main from "../pages/Main.jsx";
import AnalyticsPage from "../pages/Statistics.jsx";
import NoPage from "../pages/NoPage.jsx";

const { createBrowserRouter } = require("react-router-dom");

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <Main />
            },
            {
               path: "shorten",
                element: <Main />
            },
            {
               path: "analytics",
                element: <AnalyticsPage />
            },
            {
                path: "*",
                element: <NoPage/>
            }
        ]
    },
])


export default router;